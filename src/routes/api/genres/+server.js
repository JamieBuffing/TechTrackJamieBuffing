// src/routes/api/genres/+server.js
import { json } from '@sveltejs/kit';
import { resolveSteamId, getOwnedGames, getStoreDetails } from '$lib/server/steamApi.js';

// Zoek de genres op
export async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);
    if (!steamid) {
      return json({ error: 'Missing steamid and no DEFAULT_STEAM_ID set' }, { status: 400 });
    }

    // Sla alles games op die de gebruiker heeft
    const games = await getOwnedGames(fetch, steamid, { includeAppInfo: true });

    // Als er geen games zijn dan....
    if (!games.length) {
      return json({
        steamid,
        genres: [],
        message: 'Geen games gevonden in je library.'
      });
    }

    // Filter ze op speeltijd meer dan een minuut
    const played = games.filter((g) => (g.playtime_forever || 0) > 0);

    // Als dat er 0 zijn dan....
    if (!played.length) {
      return json({
        steamid,
        genres: [],
        message: 'We vonden geen games met speeltijd in je library.'
      });
    }

    const genreMap = new Map();

    // Bekijk de totale speeltijd van alles games
    const totalMinutes = played.reduce(
      (sum, g) => sum + (g.playtime_forever || 0),
      0
    );

    // Groepeer gespeelde games per genre en tel de totale gespeelde uren,
    // plus een lijst van games met hun individuele speeltijd.
    await Promise.all(
      played.map(async (g) => {
        const details = await getStoreDetails(fetch, g.appid, {
          includePrice: false,
          includeGenres: true
        });

        const primaryGenre =
          details?.genres?.[0]?.description || 'Overige';

        const minutes = g.playtime_forever || 0;
        const hours = minutes / 60;

        const prev = genreMap.get(primaryGenre) || { hours: 0, games: [] };
        genreMap.set(primaryGenre, {
          hours: prev.hours + hours,
          games: [
            ...prev.games,
            {
              name: g.name,
              hours
            }
          ]
        });
      })
    );

    // Als er geen info is opgeslagen dan....
    if (!genreMap.size) {
      return json({
        steamid,
        genres: [],
        message:
          'Geen bruikbare genre-informatie gevonden op de store-pagina’s.'
      });
    }

    // De totale speeltijd in uren
    const totalHours = totalMinutes / 60;

    // Bouw een lijst van genres met totale uren, percentage van totale speeltijd,
    // en de top 15 meest gespeelde games per genre (gesorteerd op uren).
    let categoryList = [...genreMap.entries()].map(([genre, info]) => {
      const genreHours = info.hours;
      const percentage = totalHours
        ? Number(((genreHours / totalHours) * 100).toFixed(1))
        : 0;

      const gamesList = info.games
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 15)
        .map((g) => ({
          name: g.name,
          hours: Number(g.hours.toFixed(1))
        }));

      return {
        genre,
        hours: Number(genreHours.toFixed(1)),
        percentage,
        games: gamesList
      };
    });

    // Sorteer de genres op speeltijd en pak de grootste 12
    categoryList = categoryList
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 12);
    
    // Geef deze data terug
    return json({ steamid, genres: categoryList });
    // En vang mogelijke errors op
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load genres' }, { status: 500 });
  }
}
