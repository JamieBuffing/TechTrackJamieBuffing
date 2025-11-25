import { json } from "@sveltejs/kit";
import { r as resolveSteamId, b as getFriendList, c as getPlayerSummaries, d as getOwnedGames } from "../../../../chunks/steamApi.js";
async function getOwnedStats(fetch, steamid) {
  const games = await getOwnedGames(fetch, steamid, {
    includeAppInfo: false,
    includePlayedFreeGames: true
  });
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
async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);
    if (!steamid) ;
    const friends = await getFriendList(fetch, steamid);
    const friendIds = friends.map((f) => f.steamid).slice(0, 20);
    const allIds = [steamid, ...friendIds];
    const statsList = await Promise.all(
      allIds.map(async (id) => {
        const stats = await getOwnedStats(fetch, id);
        return { steamid: id, ...stats };
      })
    );
    const profiles = await getPlayerSummaries(fetch, allIds);
    const profileMap = new Map(profiles.map((p) => [p.steamid, p]));
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
    return json({ error: "Failed to load friend stats" }, { status: 500 });
  }
}
export {
  GET
};
