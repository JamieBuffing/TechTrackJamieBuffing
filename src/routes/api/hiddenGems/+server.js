// src/routes/api/hiddenGems/+server.js
import { json } from '@sveltejs/kit';
import { resolveSteamId, getOwnedGames, getReviewSummary } from '$lib/server/steamApi.js';

// Haal de hidden gems op
export async function GET({ url, fetch }) {
  try {
    // Maar eerst de steamid en controleer deze
    const steamid = resolveSteamId(url);
    if (!steamid) {
      return json({ error: 'Geen steamid gevonden' }, { status: 400 });
    }

    // Sla alle games op die de gebruiker heeft
    const games = await getOwnedGames(fetch, steamid, { includeAppInfo: true });

    // Als er geen games zijn opgeslagen dan.....
    if (!games.length) {
      return json({ steamid, gems: [], message: 'Geen games gevonden in je library.' });
    }

    // Bekjke welke games minder dan 3 uur (180 minuten) gespeeld zijn
    const lowPlayed = games
      .filter((g) => {
        const minutes = g.playtime_forever || 0;
        return minutes > 0 && minutes < 180;
      })
      .slice(0, 20);

    // Als er geen games zijn met minder dan 180 minuten dan....
    if (!lowPlayed.length) {
      return json({
        steamid,
        gems: [],
        message: 'We vonden geen games met lage speeltijd die in aanmerking komen als hidden gem.'
      });
    }

    // Opslag plek
    const results = [];

    // Verwerk alle low-played games tegelijkertijd: haal reviewgegevens op,
    // bereken normalisaties (rating, populariteit, weinig-speeltijd),
    // bepaal een gemScore (0–100) en sla het resultaat op.
    await Promise.all(
      lowPlayed.map(async (game) => {
        const summary = await getReviewSummary(fetch, game.appid);
        if (!summary) return;

        const totalReviews = summary.total_reviews ?? 0;
        const reviewScore = summary.review_score ?? null;
        const reviewScoreDesc = summary.review_score_desc ?? '';
        const totalPositive = summary.total_positive ?? 0;
        const positiveRatio =
          totalReviews > 0 ? Math.round((totalPositive / totalReviews) * 100) : null;

        const minutes = game.playtime_forever || 0;
        const hours = minutes / 60;

        if (!totalReviews || totalReviews === 0) return;

        const ratingNorm =
          reviewScore != null ? Math.min(Math.max(reviewScore / 9, 0), 1) : 0;
        const popularityNorm = Math.min(totalReviews / 5000, 1);

        // Schrijf de lage speeltijd om naar een waarde tot maximaal 1 
        // onder een half uur is 1
        // tussen een half uur en drie uut is 
        // (3 - de uren) en dat gedeeld door 2.5
        // Meer dan 3 uur als is altijd 0
        let lowPlayNorm = 0;
        if (hours <= 0.5) {
          lowPlayNorm = 1;
        } else if (hours < 3) {
          lowPlayNorm = (3 - hours) / 2.5;
        } else {
          lowPlayNorm = 0;
        }

        // De rating weegt 50%, de populariteit voor 15% en de lage speeltijd voor 35%
        const baseScore =
          0.5 * ratingNorm + 0.15 * popularityNorm + 0.35 * lowPlayNorm;

        // De gemscore moet een score van 000 tot 100 worden dus keer 100
        // Met als extra veiligheid dat alles tussen de 0 en 100 moet zitten
        let gemScore = Math.round(baseScore * 100);
        if (gemScore < 0) gemScore = 0;
        if (gemScore > 100) gemScore = 100;

        // Sla de resultaten op
        results.push({
          appid: game.appid,
          name: game.name || String(game.appid),
          hours: Number(hours.toFixed(1)),
          steamRating: {
            reviewScore,
            reviewScoreDesc,
            totalReviews,
            positiveRatio
          },
          gemScore
        });
      })
    );

    // pak alleen de games die een score boven 0 hebben sorteer ze dan op score en pak de hoogste 20
    let gems = results.filter((g) => g.gemScore > 0);
    gems = gems.sort((a, b) => b.gemScore - a.gemScore).slice(0, 20);

    // Als er geen games zijn dan.....
    if (!gems.length) {
      return json({
        steamid,
        gems: [],
        message:
          'Steam gaf geen voldoende rating/review-data om hidden gems te bepalen.'
      });
    }

    // Stuur de data terug
    return json({ steamid, gems });
    // En vang mogelijk errors op
  } catch (e) {
    console.error(e);
    return json({ error: 'Hidden gems konden niet laden' }, { status: 500 });
  }
}
