// src/routes/+page.js
export async function load({ url, parent }) {
  // data uit +layout.server.js
  const parentData = await parent();
  const defaultSteamId = parentData?.defaultSteamId || '';

  // Kijken of er een steamid in de url staat bij de parameter steamid
  const steamidFromUrl = url.searchParams.get('steamid');

  return {
    // return of het id dat in de url staat doordat er is ingelogd met steam of de defaul steam id (van mij)
    initialSteamId: steamidFromUrl || defaultSteamId || ''
  };
}
