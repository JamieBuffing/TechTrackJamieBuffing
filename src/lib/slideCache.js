// src/lib/slideCache.js
// Cache per actieve steamId
// Zodra de steamId verandert wordt alles verwijderd
let activeSteamId = null;
const store = new Map();  // opslag

/**
 * Stel de actieve steamId in, als er geen steamid is of hij niet gelijk is aan de laatst opgeslagen
 * Bij een nieuwe steamId wordt de hele cache leeggemaakt.
 */
export function setActiveSteamId(steamId) {
  if (!steamId || steamId === activeSteamId) return;

  activeSteamId = steamId;
  store.clear();
}

/**
 * Haal gecachte waarde op voor een slide
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
