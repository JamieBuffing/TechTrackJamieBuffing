// src/routes/+page.js
export async function load({ url, parent }) {
  // data uit +layout.server.js
  const parentData = await parent();
  const defaultSteamId = parentData?.defaultSteamId || '';

  const steamidFromUrl = url.searchParams.get('steamid');

  return {
    initialSteamId: steamidFromUrl || defaultSteamId || ''
  };
}
