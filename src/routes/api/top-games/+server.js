// src/routes/api/top-games/+server.js
import { json } from '@sveltejs/kit';
import { STEAM_KEY } from '$env/static/private';

// simpele in-memory cache (per Node-proces)
const ownedGamesCache = new Map(); // key: steamid, value: { games, timestamp }
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minuten

async function getOwnedGames(fetch, steamid) {
  const cached = ownedGamesCache.get(steamid);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.games;
  }

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

  ownedGamesCache.set(steamid, { games, timestamp: Date.now() });
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
