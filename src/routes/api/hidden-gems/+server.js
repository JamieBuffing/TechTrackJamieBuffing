// src/routes/api/hidden-gems/+server.js
import { json } from '@sveltejs/kit';
import { STEAM_KEY } from '$env/static/private';

const ownedGamesCache = new Map();
const ratingCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getOwnedGames(fetch, steamid) {
  const cached = ownedGamesCache.get(steamid);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.games;
  }

  const url =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
    `?key=${STEAM_KEY}` +
    `&steamid=${steamid}` +
    `&include_appinfo=1` +
    `&include_played_free_games=1`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    console.error('GetOwnedGames error (hidden-gems)', res.status, text);
    throw new Error('Failed to fetch owned games');
  }

  const data = await res.json();
  const games = data.response?.games ?? [];
  ownedGamesCache.set(steamid, { games, timestamp: Date.now() });
  return games;
}

async function getSteamRating(fetch, appid) {
  const cached = ratingCache.get(appid);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.rating;
  }

  const url =
    `https://store.steampowered.com/appreviews/${appid}` +
    `?json=1&language=all&purchase_type=all`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error('appreviews error', appid, res.status);
    return null;
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error('appreviews JSON parse error', appid, e);
    return null;
  }

  const q = data.query_summary;
  if (!q) return null;

  const totalReviews = q.total_reviews ?? 0;
  const reviewScore = q.review_score ?? null;
  const reviewScoreDesc = q.review_score_desc ?? '';
  const totalPositive = q.total_positive ?? 0;
  const positiveRatio =
    totalReviews > 0 ? Math.round((totalPositive / totalReviews) * 100) : null;

  const rating = {
    reviewScore,
    reviewScoreDesc,
    totalReviews,
    positiveRatio
  };

  ratingCache.set(appid, { rating, timestamp: Date.now() });
  return rating;
}

export async function GET({ url, fetch }) {
  try {
    const steamid = url.searchParams.get('steamid');
    if (!steamid) {
      return json({ error: 'Missing steamid' }, { status: 400 });
    }

    const games = await getOwnedGames(fetch, steamid);

    if (!games.length) {
      return json({ steamid, gems: [], message: 'Geen games gevonden in je library.' });
    }

    // Kandidaten: weinig gespeeld (0 < uren < 2)
    const lowPlayed = games
      .filter((g) => {
        const minutes = g.playtime_forever || 0;
        return minutes > 0 && minutes < 120;
      })
      .slice(0, 20); // limiteren ivm API-limieten

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
        const rating = await getSteamRating(fetch, game.appid);
        if (!rating) return;

        const minutes = game.playtime_forever || 0;
        const hours = minutes / 60;

        const { reviewScore, reviewScoreDesc, totalReviews, positiveRatio } =
          rating;

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
          0.5 * ratingNorm + 0.3 * popularityNorm + 0.2 * lowPlayNorm;

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
