// src/routes/api/owned-games-simple/+server.js
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
    console.error('GetOwnedGames error (owned-games-simple)', res.status, text);
    throw new Error('Failed to fetch owned games');
  }

  const data = await res.json();
  return data.response?.games ?? [];
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
        totalGames: 0,
        withPlaytime: 0,
        games: []
      });
    }

    const gamesWithHours = games
      .map((g) => {
        const minutes = g.playtime_forever || 0;
        const hours = minutes / 60;
        return {
          appid: g.appid,
          name: g.name,
          hours: Number(hours.toFixed(1))
        };
      })
      .filter((g) => g.hours > 10)
      .sort((a, b) => b.hours - a.hours);

    return json({
      steamid,
      totalGames: games.length,
      withPlaytime: gamesWithHours.length,
      games: gamesWithHours
    });
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load owned games' }, { status: 500 });
  }
}
