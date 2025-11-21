// src/routes/api/profile/+server.js
import { json } from '@sveltejs/kit';
import { resolveSteamId, getPlayerSummaries } from '$lib/server/steamApi.js';

export async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);

    if (!steamid) {
      return json({ error: 'Missing steamid and no DEFAULT_STEAM_ID set' }, { status: 400 });
    }

    const players = await getPlayerSummaries(fetch, [steamid]);
    const player = players[0] ?? null;

    return json({ steamid, player });
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to fetch profile from Steam' }, { status: 500 });
  }
}