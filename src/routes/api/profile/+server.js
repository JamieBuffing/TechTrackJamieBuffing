// src/routes/api/profile/+server.js
import { json } from '@sveltejs/kit';
import { resolveSteamId, getPlayerSummaries } from '$lib/server/steamApi.js';

// Haal het profiel van de grbuiker op
export async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);

    // Als er geen steamid is
    if (!steamid) {
      return json({ error: 'Missing steamid and no DEFAULT_STEAM_ID set' }, { status: 400 });
    }

    // Sla de gegevens op onder players
    const players = await getPlayerSummaries(fetch, [steamid]);
    const player = players[0] ?? null;

    // Geef de data terug
    return json({ steamid, player });
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to fetch profile from Steam' }, { status: 500 });
  }
}