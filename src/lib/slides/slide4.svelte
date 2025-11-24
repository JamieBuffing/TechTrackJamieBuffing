<script>
  import { browser } from '$app/environment';
  import RadialProgress from '$lib/components/slide4.1.svelte';

  export let steamId = '';

  let loadingGames = false;
  let error = '';
  let games = [];

  let selectedAppId = '';      // altijd een STRING
  let selectedGameName = '';

  let loadingAchievements = false;
  let achError = '';
  let achData = null;

  // Cache per steamId voor games en per (steamId, appid) voor achievements
  const gamesCache = new Map();
  const achCache = new Map();

  // --- GAMES LADEN (met cache) ---
  async function loadGames() {
    if (!steamId) {
      error = 'Geen SteamID geselecteerd.';
      games = [];
      selectedAppId = '';
      selectedGameName = '';
      return;
    }

    // 1. Eerst cache proberen
    const cached = gamesCache.get(steamId);
    if (cached) {
      games = cached.games;
      error = cached.error;

      if (games.length > 0) {
        // ALTIJD eerste game kiezen als standaard
        selectedAppId = String(games[0].appid);
        selectedGameName = games[0].name;
      } else {
        selectedAppId = '';
        selectedGameName = '';
      }
      return;
    }

    // 2. Anders echt fetchen
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
          // ALTIJD eerste game kiezen als standaard
          selectedAppId = String(games[0].appid);
          selectedGameName = games[0].name;
        }
      }
    } catch (e) {
      console.error(e);
      error = 'Fout bij het laden van games.';
    } finally {
      gamesCache.set(steamId, { games, error });
      loadingGames = false;
    }
  }

  // --- ACHIEVEMENTS LADEN (met cache) ---
  async function loadAchievements() {
    if (!steamId || !selectedAppId) return;

    // 1. Cache check
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

  // --- REACTIEVE LOGICA ---
  // Als steamId verandert => games laden
  $: if (browser && steamId) {
    loadGames();
  }

  // Als steamId én selectedAppId er zijn => achievements laden
  $: if (browser && steamId && selectedAppId) {
    loadAchievements();
  }

  // Gewijzigde selectie uit de dropdown
  function onSelectChange(event) {
    const appid = event.target.value;
    selectedAppId = appid;

    const g = games.find((game) => String(game.appid) === appid);
    selectedGameName = g ? g.name : '';
  }

  // Afgeleide lijsten voor unlocked/locked
  $: unlocked = achData
    ? achData.achievements.filter((a) => a.achieved)
    : [];

  $: locked = achData
    ? achData.achievements.filter((a) => !a.achieved)
    : [];
</script>

<div class="slide4">
  <h2>Achievement progress</h2>
  <h3>Voor jouw top 5 games</h3>

  {#if !steamId}
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>
  {:else}
    <div class="controls">
      <label>
        Kies een game:
        <select bind:value={selectedAppId} on:change={onSelectChange}>
          {#if loadingGames}
            <option disabled>Games laden…</option>
          {:else if error}
            <option disabled>{error}</option>
          {:else if games.length === 0}
            <option disabled>Geen games gevonden</option>
          {:else}
            {#each games as g}
              <option value={String(g.appid)}>{g.name}</option>
            {/each}
          {/if}
        </select>
      </label>
    </div>

    {#if loadingAchievements}
      <p>Achievements laden…</p>
    {:else if achError}
      <p class="error">{achError}</p>
    {:else if achData}
      <div class="content">
        <div class="left">
          <RadialProgress
            value={achData.percentage}
            label="Gehaald"
            sublabel={`${achData.unlocked} / ${achData.total} achievements`}
          />
        </div>

        <div class="right">
          <h3>{selectedGameName}</h3>

          <div class="ach-section">
            <h4>Gehaald ({unlocked.length})</h4>
            {#if unlocked.length === 0}
              <p class="muted">Nog geen achievements unlocked.</p>
            {:else}
              <ul class="ach-list">
                {#each unlocked as a}
                  <li>
                    {#if a.icon}
                      <img src={a.icon} alt="" class="ach-icon" />
                    {/if}
                    <div class="ach-text">
                      <div class="ach-name">{a.displayName}</div>
                      {#if a.description}
                        <div class="ach-desc">{a.description}</div>
                      {/if}
                    </div>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>

          <div class="ach-section">
            <h4>Nog niet gehaald ({locked.length})</h4>
            {#if locked.length === 0}
              <p class="muted">Alles gehaald! 🔥</p>
            {:else}
              <ul class="ach-list">
                {#each locked as a}
                  <li class="locked">
                    {#if a.icongray}
                      <img src={a.icongray} alt="" class="ach-icon" />
                    {/if}
                    <div class="ach-text">
                      <div class="ach-name">{a.displayName}</div>
                      {#if a.description}
                        <div class="ach-desc">{a.description}</div>
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
      <p class="muted">Kies een game om je achievement-progress te zien.</p>
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

  .ach-section {
    margin-top: 1rem;
  }

  .ach-section h4 {
    margin-bottom: 0.4rem;
  }

  .ach-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    max-height: 260px;
    overflow-y: auto;
  }

  .ach-list li {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.25rem 0.35rem;
    border-radius: 0.4rem;
    background: #171a21e6;
  }

  .ach-list li.locked {
    opacity: 0.7;
  }

  .ach-icon {
    width: 32px;
    height: 32px;
    border-radius: 0.2rem;
  }

  .ach-text {
    display: flex;
    flex-direction: column;
  }

  .ach-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #c7d5e0;
  }

  .ach-desc {
    font-size: 0.8rem;
    color: #c7d5e0;
  }

  .muted {
    font-size: 0.85rem;
    color: #c7d5e0;
  }

  .error {
    color: #f88;
  }
</style>
