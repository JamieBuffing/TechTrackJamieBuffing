// src/routes/api/owned-games-simple/+server.js
import { json } from '@sveltejs/kit';
import { resolveSteamId, getOwnedGames } from '$lib/server/steamApi.js';

// Haal de games op dit de gebruiker bezit
export async function GET({ url, fetch }) {
  try {
    // Haal de steamid op en controleer die
    const steamid = resolveSteamId(url);
    if (!steamid) {
      return json({ error: 'Missing steamid and no DEFAULT_STEAM_ID set' }, { status: 400 });
    }

    // Haal alles op en sla het op onder games
    const games = await getOwnedGames(fetch, steamid, { includeAppInfo: true });

    // Als er geen games in zitten
    if (!games.length) {
      return json({
        steamid,
        totalGames: 0,
        withPlaytime: 0,
        games: []
      });
    }

    // Alleen nog maar games met speeluren
    // 10 om precies te zijn door de filter
    // en sorteer ze op speeluren
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

    // Geef deze dat terug
    return json({
      steamid,
      totalGames: games.length,
      withPlaytime: gamesWithHours.length,
      games: gamesWithHours
    });
    // En vang de mogelijke errors op
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load owned games' }, { status: 500 });
  }
}
