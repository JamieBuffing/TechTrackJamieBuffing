// src/routes/api/library-value/+server.js
import { json } from '@sveltejs/kit';
import { resolveSteamId, getOwnedGames, getStoreDetails } from '$lib/server/steamApi.js';

// Haal de waarde op van de gebruiker zijn steam bibliotheek
export async function GET({ url, fetch }) {
  try {
    // Haal de steamid op en controleer deze
    const steamid = resolveSteamId(url);
    if (!steamid) {
      return json({ error: 'Geen steamid gevonden' }, { status: 400 });
    }

    // Hier worden de games opgehaald en opgeslagen met app info maar zonder gratis games
    const games = await getOwnedGames(fetch, steamid, { includeAppInfo: true, includePlayedFreeGames: false });

    // Controleer of er echt games zijn binnengekomen anders....
    if (!games.length) {
      return json({
        steamid,
        totalValue: 0,
        currency: 'EUR',
        gamesPricedCount: 0,
        totalOwnedCount: 0,
        genres: [],
        mostExpensive: [],
        message: 'Geen games gevonden in je library.'
      });
    }
    
    // De totale aantal games
    const totalOwnedCount = games.length;

    // opslag plek voor de games
    const gameEntries = [];

    // Haalt voor elke game aanvullende store-details op (prijs, genres, etc.),
    // filtert games zonder prijsinformatie, bepaalt de primaire genre en
    // berekent gespeelde uren. De verzamelde data wordt als genormaliseerde game-entry opgeslagen in gameEntries.
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
        const currency = price.currency || 'EUR';

        let primaryGenre = 'Overige';
        if (details.genres && details.genres.length > 0) {
          primaryGenre = details.genres[0].description || 'Overige';
        }

        const minutes = g.playtime_forever || 0;
        const hours = minutes / 60;

        gameEntries.push({
          appid: g.appid,
          name: g.name,
          price: value,
          currency,
          genre: primaryGenre,
          hours: Number(hours.toFixed(1))
        });
      })
    );

    // Als er niks in gameEntries staat dan....
    if (!gameEntries.length) {
      return json({
        steamid,
        totalValue: 0,
        currency: 'EUR',
        gamesPricedCount: 0,
        totalOwnedCount,
        genres: [],
        mostExpensive: [],
        message: 'Geen prijsinformatie gevonden voor je games.'
      });
    }

    // Bekijkt wat de currency is voor de eerste game uit gameEntries
    const currency = gameEntries[0].currency;
    // Telt alle waardes op en slaat het totaal op
    const totalValue = gameEntries.reduce((sum, g) => sum + g.price, 0);

    // Voor elke g uit gameEntries (elke game) en zet ze in een genre en telt hoeveel games er in dat genre zitten
    const genreMap = new Map();
    for (const g of gameEntries) {
      const prev = genreMap.get(g.genre) || { value: 0, count: 0 };
      genreMap.set(g.genre, {
        value: prev.value + g.price,
        count: prev.count + 1
      });
    }

    // Converteer genreMap naar een array van genre-statistieken
    // (totaalwaarde, aantal games, en percentage van de totale waarde).
    let genres = [...genreMap.entries()].map(([genre, info]) => ({
      genre,
      value: Number(info.value.toFixed(2)),
      count: info.count,
      percentage: totalValue
        ? Number(((info.value / totalValue) * 100).toFixed(1))
        : 0
    }));

    // Sorteer de genres op hoogste waarde en sla alleen de top 10 op
    genres = genres.sort((a, b) => b.value - a.value).slice(0, 10);

    // Sla de 15 duurste games op met hun id, naam, prijs en speeltijd
    let mostExpensive = [...gameEntries]
      .sort((a, b) => b.price - a.price)
      .slice(0, 15)
      .map((g) => ({
        appid: g.appid,
        name: g.name,
        price: Number(g.price.toFixed(2)),
        hours: g.hours
      }));

    // Geef alle data terug aan de pagina
    return json({
      steamid,
      currency,
      totalValue: Number(totalValue.toFixed(2)),
      gamesPricedCount: gameEntries.length,
      totalOwnedCount,
      genres,
      mostExpensive
    });
    // En vang mogelijke errors op
  } catch (e) {
    console.error(e);
    return json({ error: 'Library waarde kon niet laden' }, { status: 500 });
  }
}
