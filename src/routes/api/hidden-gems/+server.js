// src/routes/api/hidden-gems/+server.js
import { json } from '@sveltejs/kit';
import { resolveSteamId, getOwnedGames, getReviewSummary } from '$lib/server/steamApi.js';

export async function GET({ url, fetch }) {
  try {
    const steamid = resolveSteamId(url);
    if (!steamid) {
      return json({ error: 'Missing steamid and no DEFAULT_STEAM_ID set' }, { status: 400 });
    }

    const games = await getOwnedGames(fetch, steamid, { includeAppInfo: true });

    if (!games.length) {
      return json({ steamid, gems: [], message: 'Geen games gevonden in je library.' });
    }

    const lowPlayed = games
      .filter((g) => {
        const minutes = g.playtime_forever || 0;
        return minutes > 0 && minutes < 120;
      })
      .slice(0, 20);

    if (!lowPlayed.length) {
      return json({
        steamid,
        gems: [],
        message: 'We vonden geen games met lage speeltijd die in aanmerking komen als hidden gem.'
      });
    }

    const results = [];

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

        let lowPlayNorm = 0;
        if (hours <= 0.5) {
          lowPlayNorm = 1;
        } else if (hours < 5) {
          lowPlayNorm = (5 - hours) / 4.5;
        } else {
          lowPlayNorm = 0;
        }

        const baseScore =
          0.5 * ratingNorm + 0.15 * popularityNorm + 0.35 * lowPlayNorm;

        let gemScore = Math.round(baseScore * 100);
        if (gemScore < 0) gemScore = 0;
        if (gemScore > 100) gemScore = 100;

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

    let gems = results.filter((g) => g.gemScore > 0);
    gems = gems.sort((a, b) => b.gemScore - a.gemScore).slice(0, 12);

    if (!gems.length) {
      return json({
        steamid,
        gems: [],
        message:
          'Steam gaf geen voldoende rating/review-data om hidden gems te bepalen.'
      });
    }

    return json({ steamid, gems });
  } catch (e) {
    console.error(e);
    return json({ error: 'Failed to load hidden gems' }, { status: 500 });
  }
}
