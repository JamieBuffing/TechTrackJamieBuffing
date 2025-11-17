// src/routes/api/profile/+server.js
import { json } from '@sveltejs/kit';
import { STEAM_KEY } from '$env/static/private';

export async function GET({ url, fetch }) {
  const steamid = url.searchParams.get('steamid');

  if (!steamid) {
    return json({ error: 'Missing steamid' }, { status: 400 });
  }

  const apiUrl =
    'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/' +
    `?key=${STEAM_API_KEY}&steamids=${steamid}`;

  const res = await fetch(apiUrl);

  if (!res.ok) {
    return json({ error: 'Failed to fetch profile from Steam' }, { status: 500 });
  }

  const data = await res.json();
  const player = data?.response?.players?.[0] || null;

  return json({ player });
}
