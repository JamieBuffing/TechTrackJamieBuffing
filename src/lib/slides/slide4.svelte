<!-- srs/lib/slides/slide4 -->
<script>
  import { browser } from '$app/environment';
  import RadialProgress from '$lib/components/slide4.1.svelte';

  export let steamId = '';

  let loadingGames = false;
  let error = '';
  let games = [];

  let selectedAppId = '';
  let selectedGameName = '';

  let loadingAchievements = false;
  let achError = '';
  let achData = null;

  // Cache
  const gamesCache = new Map();
  const achCache = new Map();

  // games laden
  async function loadGames() {
    if (!steamId) {
      error = 'Geen SteamID geselecteerd.';
      games = [];
      selectedAppId = '';
      selectedGameName = '';
      return;
    }

    // check de cache
    const cached = gamesCache.get(steamId);
    if (cached) {
      games = cached.games;
      error = cached.error;

      if (games.length > 0) {
        // kies de eerste game standaard voor de dropdown en voor het grafiek
        selectedAppId = String(games[0].appid);
        selectedGameName = games[0].name;
      } else {
        selectedAppId = '';
        selectedGameName = '';
      }
      return;
    }

    // Als er niks in de cache zit
    loadingGames = true;
    error = '';
    games = [];
    selectedAppId = '';
    selectedGameName = '';

    try {
      const res = await fetch(`/api/top-games?steamid=${steamId}`);
      const json = await res.json();

      if (!res.ok) {
        error = json.error || 'Kon games niet laden.';
      } else {
        games = json.games || json.topGames || [];

        if (games.length > 0) {
          // kies de eerste game standaard voor de dropdown en voor het grafiek
          selectedAppId = String(games[0].appid);
          selectedGameName = games[0].name;
        }
      }
      // Vang mogelijk errors op
    } catch (e) {
      console.error(e);
      error = 'Fout bij het laden van games.';
      // Als laats na het laden
    } finally {
      gamesCache.set(steamId, { games, error });
      loadingGames = false;
    }
  }

  // Achievements laden
  async function loadAchievements() {
    if (!steamId || !selectedAppId) return;

    // Check eerst de cache
    const key = `${steamId}:${selectedAppId}`;
    const cached = achCache.get(key);
    if (cached) {
      achData = cached.achData;
      achError = cached.achError;
      return;
    }

    loadingAchievements = true;
    achError = '';
    achData = null;

    // Anders echt laden
    try {
      const res = await fetch(
        `/api/achievements?steamid=${steamId}&appid=${selectedAppId}`
      );
      const json = await res.json();

      if (!res.ok) {
        achError = json.error || 'Kon achievements niet laden.';
      } else if (json.total === 0) {
        achError = json.message || 'Deze game heeft geen achievements.';
      } else {
        achData = json;
      }
    } catch (e) {
      console.error(e);
      achError = 'Fout bij het laden van achievements.';
    } finally {
      const key2 = `${steamId}:${selectedAppId}`;
      achCache.set(key2, { achData, achError });
      loadingAchievements = false;
    }
  }

  // Als er iets veranderd dan.... (browser of id)
  $: if (browser && steamId) {
    loadGames();
  }
    // Als alles er is om de achievements te kunnen gaan laden
  $: if (browser && steamId && selectedAppId) {
    loadAchievements();
  }

  // Wijziging in de dropdown
  function onSelectChange(event) {
    const appid = event.target.value;
    selectedAppId = appid;

    const g = games.find((game) => String(game.appid) === appid);
    selectedGameName = g ? g.name : '';
  }

  // Afgeleide lijsten voor unlocked/locked
  // Hier split ik alles op of het gehaald is of niet
  $: unlocked = achData
    ? achData.achievements.filter((a) => a.achieved)
    : [];

  $: locked = achData
    ? achData.achievements.filter((a) => !a.achieved)
    : [];
</script>

<!-- De pagina -->
<div class="slide4">
  <h2>Achievement progress</h2>
  <h3>Voor jouw top 5 games</h3>

  {#if !steamId}
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>
  {:else}
    <div class="controls">
      <label>
        Kies een game:
        <!-- De dropdown -->
        <select bind:value={selectedAppId} on:change={onSelectChange}>
          {#if loadingGames}
            <option disabled>Games laden…</option>
          {:else if error}
            <option disabled>{error}</option>
            <!-- Als er geen games zijn -->
          {:else if games.length === 0}
            <option disabled>Geen games gevonden</option>
          {:else}
            <!-- Voor elke game als g uit de games array -->
            {#each games as g}
              <option value={String(g.appid)}>{g.name}</option>
            {/each}
          {/if}
        </select>
      </label>
    </div>

    <!-- Als de achievements aan het laden zijn -->
    {#if loadingAchievements}
      <p>Achievements laden…</p>
    {:else if achError}
      <p class="error">{achError}</p>
      <!-- Als er achievement data is -->
    {:else if achData}
      <div class="content">
        <div class="left">
          <!-- Het grafiek -->
          <RadialProgress
            value={achData.percentage}
            label="Gehaald"
            sublabel={`${achData.unlocked} / ${achData.total} achievements`}
          />
        </div>
        <div class="right">
          <!-- Titel van de geselecteerde game -->
          <h3>{selectedGameName}</h3>
          <!-- Sectie: achievements die al gehaald zijn -->
          <div class="achievementsSection">
            <h4>Gehaald ({unlocked.length})</h4>
            <!-- Als er nog geen achievements unlocked zijn -->
            {#if unlocked.length === 0}
              <p class="verborgen">Nog geen achievements unlocked.</p>
            {:else}
              <!-- Lijst met gehaalde achievements -->
              <ul class="achievementsList">
                {#each unlocked as a}
                  <li>
                    <!-- Icon van de gehaalde achievement (indien beschikbaar) -->
                    {#if a.icon}
                      <img src={a.icon} alt="" class="achievementsIcon" />
                    {/if}
                    <!-- Tekstuele info over de achievement -->
                    <div class="achievementsTekst">
                      <div class="achievementsName">{a.displayName}</div>
                      <!-- Beschrijving van de achievement (indien beschikbaar) -->
                      {#if a.description}
                        <div class="achievementsDesc">{a.description}</div>
                      {/if}
                    </div>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
          <!-- Sectie: achievements die nog niet gehaald zijn -->
          <div class="achievementsSection">
            <h4>Nog niet gehaald ({locked.length})</h4>
            <!-- Als alle achievements al gehaald zijn -->
            {#if locked.length === 0}
              <p class="verborgen">Alles gehaald! 🔥</p>
            {:else}
              <!-- Lijst met nog niet gehaalde achievements -->
              <ul class="achievementsList">
                {#each locked as a}
                  <li class="locked">
                    <!-- Grijs icon van de nog niet gehaalde achievement (indien beschikbaar) -->
                    {#if a.icongray}
                      <img src={a.icongray} alt="" class="achievementsIcon" />
                    {/if}
                    <!-- Tekstuele info over de achievement -->
                    <div class="achievementsTekst">
                      <div class="achievementsName">{a.displayName}</div>
                      <!-- Beschrijving van de achievement (indien beschikbaar) -->
                      {#if a.description}
                        <div class="achievementsDesc">{a.description}</div>
                      {/if}
                    </div>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <!-- Uitlegtekst als er nog geen game gekozen is -->
      <p class="verborgen">Kies een game om je achievement-progress te zien.</p>
    {/if}
  {/if}
</div>


<style>
  .slide4 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .controls {
    margin-bottom: 0.5rem;
  }

  select {
    margin-left: 0.5rem;
    background: #1b2838;
    color: #c7d5e0;
    border-radius: 0.4rem;
    border: 1px solid #2a475e;
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
  }

  .content {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .left {
    flex: 0 0 auto;
  }

  .right {
    flex: 1 1 300px;
    min-width: 0;
  }

  h3 {
    margin-top: 0;
  }

  .achievementsSection {
    margin-top: 1rem;
  }

  .achievementsSection h4 {
    margin-bottom: 0.4rem;
  }

  .achievementsList {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    max-height: 260px;
    overflow-y: auto;
  }

  .achievementsList li {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.25rem 0.35rem;
    border-radius: 0.4rem;
    background: #171a21e6;
  }

  .achievementsList li.locked {
    opacity: 0.7;
  }

  .achievementsIcon {
    width: 32px;
    height: 32px;
    border-radius: 0.2rem;
  }

  .achievementsTekst {
    display: flex;
    flex-direction: column;
  }

  .achievementsName {
    font-size: 0.9rem;
    font-weight: 600;
    color: #c7d5e0;
  }

  .achievementsDesc {
    font-size: 0.8rem;
    color: #c7d5e0;
  }

  .verborgen {
    font-size: 0.85rem;
    color: #c7d5e0;
  }

  .error {
    color: #f88;
  }
</style>
