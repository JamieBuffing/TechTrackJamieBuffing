// src/routes/api/achievements/+server.js
import { json } from '@sveltejs/kit';
import { STEAM_KEY } from '$env/static/private';

async function getSchemaForGame(fetch, appid) {
  const url =
    `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/` +
    `?key=${STEAM_KEY}&appid=${appid}`;

  const res = await fetch(url);

  if (!res.ok) {
    console.error('GetSchemaForGame error', appid, res.status);
    throw new Error('Failed to fetch schema');
  }

  const data = await res.json();
  const game = data.game;
  const achievements =
    game?.availableGameStats?.achievements || [];

  return achievements;
}

async function getPlayerAchievements(fetch, steamid, appid) {
  const url =
    `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/` +
    `?key=${STEAM_KEY}&steamid=${steamid}&appid=${appid}`;

  const res = await fetch(url);

  if (!res.ok) {
    console.error('GetPlayerAchievements error', steamid, appid, res.status);
    // sommige games hebben geen stats → gewoon lege lijst teruggeven
    return [];
  }

  const data = await res.json();
  const achievements = data.playerstats?.achievements || [];
  return achievements;
}

export async function GET({ url, fetch }) {
  try {
    const steamid = url.searchParams.get('steamid');
    const appid = url.searchParams.get('appid');

    if (!steamid || !appid) {
      return json(
        { error: 'Missing steamid or appid' },
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

    const playerMap = new Map(
      player.map((a) => [a.apiname, a])
    );

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
