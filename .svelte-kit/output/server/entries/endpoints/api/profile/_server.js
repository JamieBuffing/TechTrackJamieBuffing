import { json } from "@sveltejs/kit";
import { r as resolveSteamId, c as getPlayerSummaries } from "../../../../chunks/steamApi.js";
async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);
    if (!steamid) ;
    const players = await getPlayerSummaries(fetch, [steamid]);
    const player = players[0] ?? null;
    return json({ steamid, player });
  } catch (e) {
    console.error(e);
    return json({ error: "Failed to fetch profile from Steam" }, { status: 500 });
  }
}
export {
  GET
};
