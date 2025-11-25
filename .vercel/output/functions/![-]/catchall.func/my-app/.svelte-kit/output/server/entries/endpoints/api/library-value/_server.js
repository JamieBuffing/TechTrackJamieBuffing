import { json } from "@sveltejs/kit";
import { r as resolveSteamId, d as getOwnedGames, e as getStoreDetails } from "../../../../chunks/steamApi.js";
async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);
    if (!steamid) ;
    const games = await getOwnedGames(fetch, steamid, { includeAppInfo: true });
    if (!games.length) {
      return json({
        steamid,
        totalValue: 0,
        currency: "EUR",
        gamesPricedCount: 0,
        totalOwnedCount: 0,
        genres: [],
        mostExpensive: [],
        message: "Geen games gevonden in je library."
      });
    }
    const totalOwnedCount = games.length;
    const gameEntries = [];
    await Promise.all(
      games.map(async (g) => {
        const details = await getStoreDetails(fetch, g.appid, {
          includePrice: true,
          includeGenres: true
        });
        if (!details) return;
        const price = details.price_overview;
        if (!price || price.final == null) return;
        const value = price.final / 100;
        const currency2 = price.currency || "EUR";
        let primaryGenre = "Overige";
        if (details.genres && details.genres.length > 0) {
          primaryGenre = details.genres[0].description || "Overige";
        }
        const minutes = g.playtime_forever || 0;
        const hours = minutes / 60;
        gameEntries.push({
          appid: g.appid,
          name: g.name,
          price: value,
          currency: currency2,
          genre: primaryGenre,
          hours: Number(hours.toFixed(1))
        });
      })
    );
    if (!gameEntries.length) {
      return json({
        steamid,
        totalValue: 0,
        currency: "EUR",
        gamesPricedCount: 0,
        totalOwnedCount,
        genres: [],
        mostExpensive: [],
        message: "Geen prijsinformatie gevonden voor je games."
      });
    }
    const currency = gameEntries[0].currency;
    const totalValue = gameEntries.reduce((sum, g) => sum + g.price, 0);
    const genreMap = /* @__PURE__ */ new Map();
    for (const g of gameEntries) {
      const prev = genreMap.get(g.genre) || { value: 0, count: 0 };
      genreMap.set(g.genre, {
        value: prev.value + g.price,
        count: prev.count + 1
      });
    }
    let genres = [...genreMap.entries()].map(([genre, info]) => ({
      genre,
      value: Number(info.value.toFixed(2)),
      count: info.count,
      percentage: totalValue ? Number((info.value / totalValue * 100).toFixed(1)) : 0
    }));
    genres = genres.sort((a, b) => b.value - a.value).slice(0, 10);
    let mostExpensive = [...gameEntries].sort((a, b) => b.price - a.price).slice(0, 15).map((g) => ({
      appid: g.appid,
      name: g.name,
      price: Number(g.price.toFixed(2)),
      hours: g.hours
    }));
    return json({
      steamid,
      currency,
      totalValue: Number(totalValue.toFixed(2)),
      gamesPricedCount: gameEntries.length,
      totalOwnedCount,
      genres,
      mostExpensive
    });
  } catch (e) {
    console.error(e);
    return json({ error: "Failed to load library value" }, { status: 500 });
  }
}
export {
  GET
};
