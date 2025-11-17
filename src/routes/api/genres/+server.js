// src/routes/api/genres/+server.js
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
    console.error('GetOwnedGames error (genres)', res.status, text);
    throw new Error('Failed to fetch owned games');
  }

  const data = await res.json();
  const games = data.response?.games ?? [];
  return games;
}

async function getPrimaryGenre(fetch, appid) {
  const url =
    `https://store.steampowered.com/api/appdetails?appids=${appid}` +
    `&cc=nl&filters=genres`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error('appdetails error (genres)', appid, res.status);
    return null;
  }

  let json;
  try {
    json = await res.json();
  } catch (e) {
    console.error('appdetails JSON parse error (genres)', appid, e);
    return null;
  }

  const entry = json[appid];
  if (!entry?.success || !entry.data) return null;

  const data = entry.data;
  const genres = data.genres || [];
  if (!genres.length) return null;

  const primary = genres[0].description || 'Overige';
  return primary;
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
        genres: [],
        message: 'Geen games gevonden in je library.'
      });
    }

    // We gebruiken alle games met speeltijd > 0
    const played = games.filter((g) => (g.playtime_forever || 0) > 0);

    if (!played.length) {
      return json({
        steamid,
        genres: [],
        message: 'We vonden geen games met speeltijd in je library.'
      });
    }

    const genreMap = new Map();
    const totalMinutes = played.reduce(
      (sum, g) => sum + (g.playtime_forever || 0),
      0
    );

    await Promise.all(
      played.map(async (g) => {
        const primaryGenre = await getPrimaryGenre(fetch, g.appid);
        const genre = primaryGenre || 'Overige';

        const minutes = g.playtime_forever || 0;
        const hours = minutes / 60;

        const prev = genreMap.get(genre) || { hours: 0, games: [] };
        genreMap.set(genre, {
          hours: prev.hours + hours,
          games: [
            ...prev.games,
            {
              name: g.name,
              hours
            }
          ]
        });
      })
    );

    if (!genreMap.size) {
      return json({
        steamid,
        genres: [],
        message:
          'Geen bruikbare genre-informatie gevonden op de store-pagina’s.'
      });
    }

    const totalHours = totalMinutes / 60;

    let categoryList = [...genreMap.entries()].map(([genre, info]) => {
      const genreHours = info.hours;
      const percentage = totalHours
        ? Number(((genreHours / totalHours) * 100).toFixed(1))
        : 0;

      const games = info.games
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 15)
        .map((g) => ({
          name: g.name,
          hours: Number(g.hours.toFixed(1))
        }));

      return {
        genre,
        hours: Number(genreHours.toFixed(1)),
        percentage,
        games
      };
    });

    categoryList = categoryList
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 12);

    return json({ steamid, genres: categoryList });
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load genres' }, { status: 500 });
  }
}
