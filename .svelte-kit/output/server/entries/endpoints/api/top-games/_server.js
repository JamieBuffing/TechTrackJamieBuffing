import { json } from "@sveltejs/kit";
import { r as resolveSteamId, d as getOwnedGames } from "../../../../chunks/steamApi.js";
const TOP_N = 5;
async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);
    if (!steamid) ;
    const games = await getOwnedGames(fetch, steamid, { includeAppInfo: true });
    if (!games.length) {
      return json({ steamid, topGames: [] });
    }
    const sorted = [...games].sort(
      (a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0)
    );
    const topGames = sorted.slice(0, TOP_N).map((g) => {
      const minutes = g.playtime_forever || 0;
      const hours = minutes / 60;
      return {
        appid: g.appid,
        name: g.name,
        minutes,
        hours: Number(hours.toFixed(1)),
        value: Number(hours.toFixed(1))
        // handig voor donut/pie charts
      };
    });
    return json({ steamid, topGames });
  } catch (err) {
    console.error(err);
    return json({ error: "Failed to load top games" }, { status: 500 });
  }
}
export {
  GET
};
