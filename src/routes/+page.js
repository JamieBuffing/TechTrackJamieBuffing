// src/routes/+page.js
export async function load({ url }) {
  const steamidFromUrl = url.searchParams.get('steamid') || '';

  return {
    initialSteamId: steamidFromUrl
  };
}