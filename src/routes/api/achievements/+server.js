// src/routes/api/achievements/+server.js
import { json } from '@sveltejs/kit';
import {
  resolveSteamId,
  getSchemaForGame,
  getPlayerAchievements
} from '$lib/server/steamApi.js';

// Haal de achievements van een speler voor een bepaalde game op
export async function GET({ url, fetch }) {
  try {
    // Krijg steamid en appid uit de URL
    const steamid = resolveSteamId(url);
    const appid = url.searchParams.get('appid');

    // Check of steamid en appid geldig zijn
    if (!steamid || !appid) {
      return json(
        { error: 'Missing steamid or appid (and no DEFAULT_STEAM_ID set)' },
        { status: 400 }
      );
    }

    // Haal zowel het schema van de achievements als de speler-achievements tegelijk op
    const [schema, player] = await Promise.all([
      getSchemaForGame(fetch, appid),
      getPlayerAchievements(fetch, steamid, appid)
    ]);

    // Als er geen schema is, geef dan een leeg resultaat terug
    if (!schema.length) {
      return json({
        steamid,
        appid,
        total: 0,
        unlocked: 0,
        percentage: 0,
        achievements: [],
        message: 'Deze game heeft geen (bekende) achievements.'
      });
    }

    // Maak een map van de achievements van de speler
    const playerMap = new Map(player.map((a) => [a.apiname, a]));

    // Combineer schema-gegevens met speler-gegevens
    const combined = schema.map((s) => {
      const p = playerMap.get(s.name);
      const achieved = p ? p.achieved === 1 : false;
      const unlocktime = p?.unlocktime || null;

      return {
        apiName: s.name,
        displayName: s.displayName || s.name,
        description: s.description || '',
        achieved,
        hidden: s.hidden === 1,
        icon: s.icon || null,
        icongray: s.icongray || null,
        unlocktime
      };
    });

    // Bereken totalen en percentage
    const total = combined.length;
    const unlocked = combined.filter((a) => a.achieved).length;
    const percentage = total
      ? Number(((unlocked / total) * 100).toFixed(1))
      : 0;

    // Geef alles netjes terug
    return json({
      steamid,
      appid,
      total,
      unlocked,
      percentage,
      achievements: combined
    });

  // Vang mogelijke fouten op
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load achievements' }, { status: 500 });
  }
}
