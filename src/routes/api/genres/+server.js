// src/routes/api/genres/+server.js
import { json } from '@sveltejs/kit';
import { resolveSteamId, getOwnedGames, getStoreDetails } from '$lib/server/steamApi.js';

export async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);
    if (!steamid) {
      return json({ error: 'Missing steamid and no DEFAULT_STEAM_ID set' }, { status: 400 });
    }

    const games = await getOwnedGames(fetch, steamid, { includeAppInfo: true });

    if (!games.length) {
      return json({
        steamid,
        genres: [],
        message: 'Geen games gevonden in je library.'
      });
    }

    const played = games.filter((g) => (g.playtime_forever || 0) > 0);

    if (!played.length) {
      return json({
        steamid,
        genres: [],
        message: 'We vonden geen games met speeltijd in je library.'
      });
    }

    const genreMap = new Map();
    const totalMinutes = played.reduce(
      (sum, g) => sum + (g.playtime_forever || 0),
      0
    );

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

    if (!genreMap.size) {
      return json({
        steamid,
        genres: [],
        message:
          'Geen bruikbare genre-informatie gevonden op de store-pagina’s.'
      });
    }

    const totalHours = totalMinutes / 60;

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

    categoryList = categoryList
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 12);
    console.log({ steamid, genres: categoryList })
    return json({ steamid, genres: categoryList });
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load genres' }, { status: 500 });
  }
}
