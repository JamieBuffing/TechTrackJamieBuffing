// src/routes/api/friends-stats/+server.js
import { json } from '@sveltejs/kit';
import {
  resolveSteamId,
  getFriendList,
  getOwnedGames,
  getPlayerSummaries
} from '$lib/server/steamApi.js';

// De functie om de games van een gebruiker of vriend op te halen
async function getOwnedStats(fetch, steamid) {
  const games = await getOwnedGames(fetch, steamid, {
    includeAppInfo: false,
    includePlayedFreeGames: true
  });

  // Sla de totale games en speeltijd op
  const totalGames = games.length;
  const totalMinutes = games.reduce(
    (sum, g) => sum + (g.playtime_forever || 0),
    0
  );
  // En de recente speeltijd van de afgelopen 2 weken (enige wat kan met de api)
  const recentMinutes = games.reduce(
    (sum, g) => sum + (g.playtime_2weeks || 0),
    0
  );

  // Geef die informatie terug in uren
  return {
    totalGames,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    recentHours: Number((recentMinutes / 60).toFixed(1))
  };
}

// De functie om de vriendenlijst op te vragen
export async function GET({ url, fetch }) {
  try {
    // Als er een steam id is dan check even anders....
    const steamid = resolveSteamId(url);
    if (!steamid) {
      return json({ error: 'Geen steamid gevonden' }, { status: 400 });
    }

    // Sla alles op onder friends
    // Hun ids onder friendIds (van de eerste 20)
    // En sla alle ids op in een array
    const friends = await getFriendList(fetch, steamid);
    const friendIds = friends.map((f) => f.steamid).slice(0, 20);
    const allIds = [steamid, ...friendIds];

    // Voor alle ids uit de array voer de functie uit om de games op te halen
    const statsList = await Promise.all(
      allIds.map(async (id) => {
        const stats = await getOwnedStats(fetch, id);
        return { steamid: id, ...stats };
      })
    );

    // Sla voor alle ids de gegevens op
    const profiles = await getPlayerSummaries(fetch, allIds);
    const profileMap = new Map(profiles.map((p) => [p.steamid, p]));

    // Sla het resultaat op per vriend als volgt
    const result = statsList.map((s) => {
      const p = profileMap.get(s.steamid);
      return {
        steamid: s.steamid,
        personaname: p?.personaname || s.steamid,
        avatar: p?.avatarfull || null,
        totalGames: s.totalGames,
        totalHours: s.totalHours,
        recentHours: s.recentHours,
        isSelf: s.steamid === steamid
      };
    });

    // Geef die data terug
    return json({
      steamid,
      friendsCount: friendIds.length,
      players: result
    });
    // En vang mogelijke errors op
  } catch (e) {
    console.error(e);
    return json({ error: 'Gegevens van vrienden konden niet laden' }, { status: 500 });
  }
}
