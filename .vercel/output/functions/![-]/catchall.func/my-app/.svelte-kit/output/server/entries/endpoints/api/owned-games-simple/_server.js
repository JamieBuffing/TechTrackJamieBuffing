import { json } from "@sveltejs/kit";
import { r as resolveSteamId, d as getOwnedGames } from "../../../../chunks/steamApi.js";
async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);
    if (!steamid) ;
    const games = await getOwnedGames(fetch, steamid, { includeAppInfo: true });
    if (!games.length) {
      return json({
        steamid,
        totalGames: 0,
        withPlaytime: 0,
        games: []
      });
    }
    const gamesWithHours = games.map((g) => {
      const minutes = g.playtime_forever || 0;
      const hours = minutes / 60;
      return {
        appid: g.appid,
        name: g.name,
        hours: Number(hours.toFixed(1))
      };
    }).filter((g) => g.hours > 10).sort((a, b) => b.hours - a.hours);
    return json({
      steamid,
      totalGames: games.length,
      withPlaytime: gamesWithHours.length,
      games: gamesWithHours
    });
  } catch (e) {
    console.error(e);
    return json({ error: "Failed to load owned games" }, { status: 500 });
  }
}
export {
  GET
};
