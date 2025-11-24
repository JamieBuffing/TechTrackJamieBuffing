// src/routes/api/top-games/+server.js
import { json } from '@sveltejs/kit';
import { resolveSteamId, getOwnedGames } from '$lib/server/steamApi.js';

// Hier sla ik op dat ik maar 5 games wil de top_5
const topN = 5;

// De functie die de data gaat ophalen
export async function GET({ url, fetch }) {
  try {
    // Kijk even wat de steamid is
    const steamid = resolveSteamId(url);
    // Als er geen steamid is
    if (!steamid) {
      return json({ error: 'Missing steamid and no DEFAULT_STEAM_ID set' }, { status: 400 });
    }

    // De games ophalen met de functie uit lib/server/steamApi.js met de extra voorwaarde includeAppInfo: true
    const games = await getOwnedGames(fetch, steamid, { includeAppInfo: true });

    // Als games leeg is
    if (!games.length) {
      return json({ steamid, topGames: [] });
    }

    // Sorteer alles uit games op speeltijd
    const sorted = [...games].sort(
      (a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0)
    );

    // Slice nog even dat alleen de top 5 dus overblijft
    const topGames = sorted.slice(0, topN).map((g) => {
      const minutes = g.playtime_forever || 0;
      const hours = minutes / 60;
      // De uren instellen want standaard is alles in minuten

      // En sla dat als volgt op
      return {
        appid: g.appid,
        name: g.name,
        minutes,
        hours: Number(hours.toFixed(1)),
        value: Number(hours.toFixed(1)) // handig voor donut/pie charts
      };
    });

    // En geef dit terug aan de pagina
    return json({ steamid, topGames });
  } catch (err) { // opvangen van fouten
    console.error(err);
    return json({ error: 'Failed to load top games' }, { status: 500 });
  }
}
