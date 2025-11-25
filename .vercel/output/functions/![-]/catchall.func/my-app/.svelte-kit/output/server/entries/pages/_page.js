async function load({ url, parent }) {
  const parentData = await parent();
  const defaultSteamId = parentData?.defaultSteamId || "";
  const steamidFromUrl = url.searchParams.get("steamid");
  return {
    initialSteamId: steamidFromUrl || defaultSteamId || ""
  };
}
export {
  load
};
