// src/routes/api/library-value/+server.js
import { json } from '@sveltejs/kit';
import { STEAM_KEY } from '$env/static/private';


async function getOwnedGames(fetch, steamid) {

  const url =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
    `?key=${STEAM_KEY}` +
    `&steamid=${steamid}` +
    `&include_appinfo=1` +
    `&include_played_free_games=1`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    console.error('GetOwnedGames error', res.status, text);
    throw new Error('Failed to fetch owned games');
  }

  const data = await res.json();
  const games = data.response?.games ?? [];
  return games;
}

// Per game de prijs + hoofdgenre ophalen
async function getGamePriceAndGenre(fetch, appid) {
  const key = String(appid);

  const url =
    `https://store.steampowered.com/api/appdetails?appids=${appid}` +
    `&cc=nl&filters=price_overview,genres`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error('appdetails error', appid, res.status);
    return null;
  }

  let json;
  try {
    json = await res.json();
  } catch (e) {
    console.error('appdetails JSON parse error', appid, e);
    return null;
  }

  const entry = json[appid];
  if (!entry?.success || !entry.data) return null;

  const data = entry.data;
  const price = data.price_overview;

  if (!price || price.final == null) {
    // waarschijnlijk free-to-play of geen prijsinfo
    return null;
  }

  const currency = price.currency || 'EUR';
  const value = price.final / 100;

  let primaryGenre = 'Overige';
  if (data.genres && data.genres.length > 0) {
    primaryGenre = data.genres[0].description || 'Overige';
  }

  const result = {
    value,
    currency,
    genre: primaryGenre
  };

  return result;
}

export async function GET({ url, fetch }) {
  try {
    const steamid = url.searchParams.get('steamid');
    if (!steamid) {
      return json({ error: 'Missing steamid' }, { status: 400 });
    }

    const games = await getOwnedGames(fetch, steamid);

    if (!games.length) {
      return json({
        steamid,
        totalValue: 0,
        currency: 'EUR',
        gamesPricedCount: 0,
        totalOwnedCount: 0,
        genres: [],
        mostExpensive: [],
        message: 'Geen games gevonden in je library.'
      });
    }

    const totalOwnedCount = games.length;
    const gameEntries = [];

    // ✅ 100% van de games, één appdetails-call per game
    await Promise.all(
      games.map(async (g) => {
        const info = await getGamePriceAndGenre(fetch, g.appid);
        if (!info) return;

        const minutes = g.playtime_forever || 0;
        const hours = minutes / 60;

        gameEntries.push({
          appid: g.appid,
          name: g.name,
          price: info.value,
          currency: info.currency,
          genre: info.genre,
          hours: Number(hours.toFixed(1))
        });
      })
    );

    if (!gameEntries.length) {
      return json({
        steamid,
        totalValue: 0,
        currency: 'EUR',
        gamesPricedCount: 0,
        totalOwnedCount,
        genres: [],
        mostExpensive: [],
        message: 'Geen prijsinformatie gevonden voor je games.'
      });
    }

    const currency = gameEntries[0].currency;
    const totalValue = gameEntries.reduce((sum, g) => sum + g.price, 0);

    const genreMap = new Map();
    for (const g of gameEntries) {
      const prev = genreMap.get(g.genre) || { value: 0, count: 0 };
      genreMap.set(g.genre, {
        value: prev.value + g.price,
        count: prev.count + 1
      });
    }

    let genres = [...genreMap.entries()].map(([genre, info]) => ({
      genre,
      value: Number(info.value.toFixed(2)),
      count: info.count,
      percentage: totalValue
        ? Number(((info.value / totalValue) * 100).toFixed(1))
        : 0
    }));

    genres = genres.sort((a, b) => b.value - a.value).slice(0, 10);

    let mostExpensive = [...gameEntries]
      .sort((a, b) => b.price - a.price)
      .slice(0, 15)
      .map((g) => ({
        appid: g.appid,
        name: g.name,
        price: Number(g.price.toFixed(2)),
        hours: g.hours
      }));

    return json({
      steamid,
      currency,
      totalValue: Number(totalValue.toFixed(2)),
      gamesPricedCount: gameEntries.length,
      totalOwnedCount,
      genres,
      mostExpensive
    });
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load library value' }, { status: 500 });
  }
}
