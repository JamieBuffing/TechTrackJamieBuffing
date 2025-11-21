// src/lib/server/steamApi.js
import { STEAM_API_KEY, DEFAULT_STEAM_ID } from '$env/static/private';

const STEAM_WEB_BASE = 'https://api.steampowered.com';
const STEAM_STORE_BASE = 'https://store.steampowered.com';

if (!STEAM_API_KEY) {
  console.warn(
    'STEAM_API_KEY is niet ingesteld'
  );
}

export function resolveSteamId(url) {
  const fromQuery = url.searchParams.get('steamid');
  return fromQuery || DEFAULT_STEAM_ID || null;
}

async function fetchJson(fetch, url, context = 'Steam API') {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[${context}] HTTP ${res.status}`, text);
    throw new Error(`${context} mislukt`);
  }
  return res.json();
}

export async function getOwnedGames(fetch, steamid, opts = {}) {
  const {
    includeAppInfo = true,
    includePlayedFreeGames = true,
  } = opts;

  if (!steamid) {
    throw new Error('Geen steamId meegekregen');
  }

  const url =
    `${STEAM_WEB_BASE}/IPlayerService/GetOwnedGames/v1/` +
    `?key=${STEAM_API_KEY}` +
    `&steamid=${steamid}` +
    `&include_appinfo=${includeAppInfo ? 1 : 0}` +
    `&include_played_free_games=${includePlayedFreeGames ? 1 : 0}`;

  const data = await fetchJson(fetch, url, 'GetOwnedGames');
  return data.response?.games ?? [];
}

export async function getPlayerSummaries(fetch, steamids) {
  if (!steamids.length) return [];

  const url =
    `${STEAM_WEB_BASE}/ISteamUser/GetPlayerSummaries/v2/` +
    `?key=${STEAM_API_KEY}&steamids=${steamids.join(',')}`;

  const data = await fetchJson(fetch, url, 'GetPlayerSummaries');
  return data.response?.players ?? [];
}

export async function getFriendList(fetch, steamid) {
  const url =
    `${STEAM_WEB_BASE}/ISteamUser/GetFriendList/v1/` +
    `?key=${STEAM_API_KEY}&steamid=${steamid}&relationship=friend`;

  const data = await fetchJson(fetch, url, 'GetFriendList');
  return data.friendslist?.friends ?? [];
}

export async function getStoreDetails(fetch, appid, { includePrice = true, includeGenres = true } = {}) {
  const filters = [];
  if (includePrice) filters.push('price_overview');
  if (includeGenres) filters.push('genres');

  const url =
    `${STEAM_STORE_BASE}/api/appdetails?appids=${appid}` +
    `&cc=nl&filters=${filters.join(',')}`;

  const res = await fetch(url);

  // 403 / 429 → Steam blokkeert / rate-limiet → game overslaan ipv alles slopen
  if (res.status === 403 || res.status === 429) {
    console.warn('[Store appdetails] blocked for appid', appid, res.status);
    return null;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[Store appdetails] HTTP', res.status, text);
    return null;
  }

  let json;
  try {
    json = await res.json();
  } catch (e) {
    console.error('[Store appdetails] JSON parse error', appid, e);
    return null;
  }

  const entry = json[appid];
  if (!entry?.success || !entry.data) return null;

  return entry.data;
}

export async function getReviewSummary(fetch, appid) {
  const url =
    `${STEAM_STORE_BASE}/appreviews/${appid}` +
    `?json=1&language=all&purchase_type=all`;

  const data = await fetchJson(fetch, url, 'App reviews');
  return data.query_summary ?? null;
}

export async function getSchemaForGame(fetch, appid) {
  const url =
    `${STEAM_WEB_BASE}/ISteamUserStats/GetSchemaForGame/v2/` +
    `?key=${STEAM_API_KEY}&appid=${appid}`;

  const data = await fetchJson(fetch, url, 'GetSchemaForGame');
  return data.game?.availableGameStats?.achievements ?? [];
}

export async function getPlayerAchievements(fetch, steamid, appid) {
  const url =
    `${STEAM_WEB_BASE}/ISteamUserStats/GetPlayerAchievements/v1/` +
    `?key=${STEAM_API_KEY}&steamid=${steamid}&appid=${appid}`;

  const data = await fetchJson(fetch, url, 'GetPlayerAchievements');
  return data.playerstats?.achievements ?? [];
}
