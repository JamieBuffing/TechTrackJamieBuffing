// src/lib/server/steamApi.js
import { STEAM_API_KEY, DEFAULT_STEAM_ID } from '$env/static/private';

// De basis van de steam api's
const steamWebBase = 'https://api.steampowered.com';
const steamStoreBase = 'https://store.steampowered.com';

// Als er geen api key is (alleen nodig voor de webBase api)
if (!STEAM_API_KEY) {
  console.warn(
    'STEAM_API_KEY is niet ingesteld'
  );
}

// De functie om de steamid op te halen 
// En anders pakken we de DEFAULT_STEAM_ID
export function resolveSteamId(url) {
  const fromQuery = url.searchParams.get('steamid');
  return fromQuery || DEFAULT_STEAM_ID || null;
}

// Haalt een URL op, controleert de res en geeft de JSON-body terug
async function fetchJson(fetch, url, context = 'Steam API') {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[${context}] HTTP ${res.status}`, text);
    throw new Error(`${context} mislukt`);
  }
  return res.json();
}

// De functie om de games op te halen van een gebruiker
export async function getOwnedGames(fetch, steamid, opts = {}) {
  const {
    // Met de mogelijke opties
    includeAppInfo = true,
    includePlayedFreeGames = true,
  } = opts;
  // Als er geen steamid is
  if (!steamid) {
    throw new Error('Geen steamId meegekregen');
  }

  // De url die wordt opgebouwd uit de onderstaande delen
  const url =
    `${steamWebBase}/IPlayerService/GetOwnedGames/v1/` +
    `?key=${STEAM_API_KEY}` +
    `&steamid=${steamid}` +
    `&include_appinfo=${includeAppInfo ? 1 : 0}` +
    `&include_played_free_games=${includePlayedFreeGames ? 1 : 0}`;

  // De data de wordt teruggeven aan de pagina
  const data = await fetchJson(fetch, url, 'GetOwnedGames');
  return data.response?.games ?? [];
}

// De functie om gegevens van de spelers op te halen
export async function getPlayerSummaries(fetch, steamids) {
  if (!steamids.length) return [];

  const url =
    `${steamWebBase}/ISteamUser/GetPlayerSummaries/v2/` +
    `?key=${STEAM_API_KEY}&steamids=${steamids.join(',')}`;

  // De data de wordt teruggeven aan de pagina
  const data = await fetchJson(fetch, url, 'GetPlayerSummaries');
  return data.response?.players ?? [];
}

// De functie om een vriendenlijst op te halen
export async function getFriendList(fetch, steamid) {
  const url =
    `${steamWebBase}/ISteamUser/GetFriendList/v1/` +
    `?key=${STEAM_API_KEY}&steamid=${steamid}&relationship=friend`;

  // De data de wordt teruggeven aan de pagina
  const data = await fetchJson(fetch, url, 'GetFriendList');
  return data.friendslist?.friends ?? [];
}

// De functie om winkeldata op te halen van games met standaard ook de prijs en de genres
export async function getStoreDetails(fetch, appid, { includePrice = true, includeGenres = true } = {}) {
  const filters = [];
  if (includePrice) filters.push('price_overview');
  if (includeGenres) filters.push('genres');

  // De endpoint van de api
  const url =
    `${steamStoreBase}/api/appdetails?appids=${appid}` +
    `&cc=nl&filters=${filters.join(',')}`;

  // Sla het resultaat op 
  const res = await fetch(url);

  // 403 / 429 | Steam blokkeert / rate-limiet | game overslaan ipv alles slopen
  if (res.status === 403 || res.status === 429) {
    console.warn('[Store appdetails] blocked for appid', appid, res.status);
    return null;
  }

  // ALs eht resultaat niet okay is
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[Store appdetails] HTTP', res.status, text);
    return null;
  }

  // Schrijf het om naar json
  let json;
  try {
    json = await res.json();
  } catch (e) {
    console.error('[Store appdetails] JSON parse error', appid, e);
    return null;
  }

  // De data de wordt teruggeven aan de pagina
  const entry = json[appid];
  if (!entry?.success || !entry.data) return null;
  return entry.data;
}

// De functie om reviews op te halen van games
export async function getReviewSummary(fetch, appid) {
  const url =
    `${steamStoreBase}/appreviews/${appid}` +
    `?json=1&language=all&purchase_type=all`;

  // De data de wordt teruggeven aan de pagina
  const data = await fetchJson(fetch, url, 'App reviews');
  return data.query_summary ?? null;
}

// De functie om achievements op te hlaen voor een game
export async function getSchemaForGame(fetch, appid) {
  const url =
    `${steamWebBase}/ISteamUserStats/GetSchemaForGame/v2/` +
    `?key=${STEAM_API_KEY}&appid=${appid}`;

  // De data de wordt teruggeven aan de pagina
  const data = await fetchJson(fetch, url, 'GetSchemaForGame');
  return data.game?.availableGameStats?.achievements ?? [];
}

// De functie om gehaalde achievements op te halen van een game voor een gebruiker
export async function getPlayerAchievements(fetch, steamid, appid) {
  const url =
    `${steamWebBase}/ISteamUserStats/GetPlayerAchievements/v1/` +
    `?key=${STEAM_API_KEY}&steamid=${steamid}&appid=${appid}`;

  // De data de wordt teruggeven aan de pagina
  const data = await fetchJson(fetch, url, 'GetPlayerAchievements');
  return data.playerstats?.achievements ?? [];
}
