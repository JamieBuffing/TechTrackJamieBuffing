// heel beknopt voorbeeld; breid je bestaande code uit
import { json } from '@sveltejs/kit';
import { STEAM_API_KEY, DEFAULT_STEAM_ID } from '$env/static/private';

async function getOwnedGames(fetch, steamid) {
  const url =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
    `?key=${STEAM_API_KEY}` +
    `&steamid=${steamid}` +
    `&include_appinfo=1` +
    `&include_played_free_games=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch owned games');
  const jsonData = await res.json();
  return jsonData.response.games || [];
}

export async function GET({ fetch, url }) {
  try {
    const steamid = url.searchParams.get('steamid') || DEFAULT_STEAM_ID;

    const games = await getOwnedGames(fetch, steamid);

    const topGames = [...games]
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 10)
      .map((g) => ({
        appid: g.appid,
        name: g.name,
        minutes: g.playtime_forever,
        hours: Number((g.playtime_forever / 60).toFixed(1))
      }));

    return json({ steamid, topGames });
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load Steam data' }, { status: 500 });
  }
}
