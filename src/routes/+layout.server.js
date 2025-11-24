// src/routes/+layout.server.js
import { DEFAULT_STEAM_ID } from '$env/static/private';

export async function load() {
  return {
    defaultSteamId: DEFAULT_STEAM_ID || ''
  };
}