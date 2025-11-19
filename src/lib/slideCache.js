// src/lib/slideCache.js

// Cache per 'actieve' steamId.
// Zodra de steamId verandert, gooien we de cache leeg.
let activeSteamId = null;
const store = new Map(); // key = `${slide}:${key}` → waarde = { data, error }

/**
 * Stel de actieve steamId in.
 * Bij een nieuwe steamId wordt de hele cache leeggemaakt.
 */
export function setActiveSteamId(steamId) {
  if (!steamId || steamId === activeSteamId) return;

  activeSteamId = steamId;
  store.clear();
}

/**
 * Haal gecachte waarde op voor een slide + key.
 */
export function getCached(slide, key = 'default') {
  if (!activeSteamId) return null;
  return store.get(`${slide}:${key}`) ?? null;
}

/**
 * Sla gecachte waarde op.
 */
export function setCached(slide, key = 'default', value) {
  if (!activeSteamId) return;
  store.set(`${slide}:${key}`, value);
}
