// src/routes/+layout.server.js
import { DEFAULT_STEAM_ID } from '$env/static/private';

// Pakt de DEFAULT_STEAM_ID uit de env om als standaard te gebruiken
export async function load() {
  return {
    defaultSteamId: DEFAULT_STEAM_ID || ''
  };
}