// src/routes/api/friends-stats/+server.js
import { json } from '@sveltejs/kit';
import { STEAM_KEY } from '$env/static/private';

async function getFriendList(fetch, steamid) {
  const url =
    `https://api.steampowered.com/ISteamUser/GetFriendList/v1/` +
    `?key=${STEAM_KEY}&steamid=${steamid}&relationship=friend`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    console.error('GetFriendList error', res.status, text);
    throw new Error('Failed to fetch friend list');
  }

  const data = await res.json();
  return data.friendslist?.friends ?? [];
}

async function getOwnedStats(fetch, steamid) {
  const url =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
    `?key=${STEAM_KEY}` +
    `&steamid=${steamid}` +
    `&include_appinfo=0` +
    `&include_played_free_games=1`;

  const res = await fetch(url);

  if (!res.ok) {
    console.error('GetOwnedGames error', steamid, res.status);
    return {
      totalGames: 0,
      totalHours: 0,
      recentHours: 0
    };
  }

  const data = await res.json();
  const games = data.response?.games ?? [];

  const totalGames = games.length;
  const totalMinutes = games.reduce(
    (sum, g) => sum + (g.playtime_forever || 0),
    0
  );
  const recentMinutes = games.reduce(
    (sum, g) => sum + (g.playtime_2weeks || 0),
    0
  );

  return {
    totalGames,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    recentHours: Number((recentMinutes / 60).toFixed(1))
  };
}

async function getPlayerSummaries(fetch, steamids) {
  const url =
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/` +
    `?key=${STEAM_KEY}&steamids=${steamids.join(',')}`;

  const res = await fetch(url);

  if (!res.ok) {
    console.error('GetPlayerSummaries error', res.status);
    return [];
  }

  const data = await res.json();
  return data.response?.players ?? [];
}

export async function GET({ url, fetch }) {
  try {
    const steamid = url.searchParams.get('steamid');
    if (!steamid) {
      return json({ error: 'Missing steamid' }, { status: 400 });
    }

    // 1. haal vrienden op
    const friends = await getFriendList(fetch, steamid);

    // beperk aantal vrienden om API-calls te beperken (bijv. max 20)
    const friendIds = friends.map((f) => f.steamid).slice(0, 20);

    // neem jouzelf + vrienden
    const allIds = [steamid, ...friendIds];

    // 2. haal stats voor iedereen parallel op
    const statsList = await Promise.all(
      allIds.map(async (id) => {
        const stats = await getOwnedStats(fetch, id);
        return { steamid: id, ...stats };
      })
    );

    // 3. haal namen + avatars op
    const profiles = await getPlayerSummaries(fetch, allIds);
    const profileMap = new Map(profiles.map((p) => [p.steamid, p]));

    // 4. combineer
    const result = statsList.map((s) => {
      const p = profileMap.get(s.steamid);
      return {
        steamid: s.steamid,
        personaname: p?.personaname || s.steamid,
        avatar: p?.avatarfull || null,
        totalGames: s.totalGames,
        totalHours: s.totalHours,
        recentHours: s.recentHours,
        isSelf: s.steamid === steamid
      };
    });

    return json({
      steamid,
      friendsCount: friendIds.length,
      players: result
    });
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load friend stats' }, { status: 500 });
  }
}
