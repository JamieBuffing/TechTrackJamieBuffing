// src/routes/api/achievements/+server.js
import { json } from '@sveltejs/kit';
import {
  resolveSteamId,
  getSchemaForGame,
  getPlayerAchievements
} from '$lib/server/steamApi.js';

export async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);
    const appid = url.searchParams.get('appid');

    if (!steamid || !appid) {
      return json(
        { error: 'Missing steamid or appid (and no DEFAULT_STEAM_ID set)' },
        { status: 400 }
      );
    }

    const [schema, player] = await Promise.all([
      getSchemaForGame(fetch, appid),
      getPlayerAchievements(fetch, steamid, appid)
    ]);

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

    const playerMap = new Map(player.map((a) => [a.apiname, a]));

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

    const total = combined.length;
    const unlocked = combined.filter((a) => a.achieved).length;
    const percentage = total
      ? Number(((unlocked / total) * 100).toFixed(1))
      : 0;

    return json({
      steamid,
      appid,
      total,
      unlocked,
      percentage,
      achievements: combined
    });
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load achievements' }, { status: 500 });
  }
}
