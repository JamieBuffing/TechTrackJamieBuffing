// src/routes/api/top-games/+server.js
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
    throw new Error('Failed to fetch owned games');
  }

  const data = await res.json();
  const games = data.response?.games ?? [];

  return games;
}

export async function GET({ url, fetch }) {
  try {
    const steamid = url.searchParams.get('steamid');

    if (!steamid) {
      return json({ error: 'Missing steamid' }, { status: 400 });
    }

    const games = await getOwnedGames(fetch, steamid);

    if (!games.length) {
      return json({ steamid, topGames: [] });
    }

    const sorted = [...games].sort(
      (a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0)
    );

    const topGames = sorted.slice(0, 5).map((g) => {
      const minutes = g.playtime_forever || 0;
      const hours = minutes / 60;

      return {
        appid: g.appid,
        name: g.name,
        minutes,
        hours: Number(hours.toFixed(1)),
        value: Number(hours.toFixed(1)) // voor donut-chart
      };
    });

    return json({ steamid, topGames });
  } catch (err) {
    console.error(err);
    return json({ error: 'Failed to load top games' }, { status: 500 });
  }
}
