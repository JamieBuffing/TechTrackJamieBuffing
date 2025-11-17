<script>
  import { browser } from '$app/environment';   // geeft true terug als de app in de browser runt
  import RadialProgress from '$lib/components/slide4.1.svelte';   // RadialProgress     Hoeveel procent je al gehaald hebt van de achievements

  export let steamId = '';  // Hier komt het gekozen steamid in

  let loadingGames = false;    // Of de games aan het laden zijn, standaard false
  let error = '';   // Als er een error melding voor games is wordt die hier opgeslagen
  let games = [];   // Hier worden de games opgeslagen

  let selectedAppId = '';   // Hier komt het AppId van de geselecteerde app
  let selectedGameName = '';    // En hier de naam van die app

  let loadingAchievements = false;    // of de achievements aan het laden zijn, standaard false
  let achError = '';   // Als er een error melding voor de achievements is wordt die hier opgeslagen
  let achData = null;   // Standaard staat hij op NULL maar hier komt de data van de achievements

  async function loadGames() {    // De functie om de games te laden
    if (!steamId) {   // Als er geen steamid is geselecteerd
      error = 'Geen SteamID geselecteerd.';   // Dan deze error
      games = [];   // Leeg voor de zekerheid de array nog even
      return;   // En stop met het uitvoeren van de rest van de functie
    }

    loadingGames = true;    // De loading statement gaat op true waardoor er wat tekst op de pagina veranderd
    error = '';   // De error wordt even geleegd voor de zekerheid
    games = [];   // De array ook

    try {   // Probeer de games op te halen uit de api route voor api/top-games/+server.js met het gekregen steamId
      const res = await fetch(`/api/top-games?steamid=${steamId}`);   // De api request met steamId die is geselecteerd
      const json = await res.json();    // Wacht op de data en sla die op in const json

      if (!res.ok) {    // Als er een error is moet die geplaats worden in de let error
        error = json.error || 'Kon games niet laden.';    // Als er een error is dan tonen ander de tekst er achter
      } else {    // Anders als het goed is gegaan
        games = json.games || json.topGames || [];    // Vul de games array
        if (games.length && !selectedAppId) {   // Als de lengte geldig is en er nog niks is geselecteerd dan   
          selectedAppId = String(games[0].appid);   // vul alles is wat over de selectie gaat met de bovenste uit de array
          selectedGameName = games[0].name;   // Hier dus de naam en net de id
        }
      }
    } catch (e) {   // Als er een error is
      console.error(e);   // Console log de error code
      error = 'Fout bij het laden van games.';   // En toon deze tekst als error
    } finally {   // Als laatste
      loadingGames = false;   // Zet de loadingstatement van games weer op false
    }
  }

  async function loadAchievements() {
    if (!steamId || !selectedAppId) return;   // Als er geen steamid is of geen gesecteerd is dan stoppen met de functie

    loadingAchievements = true;   // Nu gaan de Achievements eenmaak laden dus mag de loading statement op true waardoor later in de html ook tekst wordt weergegeven.
    error = '';   // De error voor de zekerheid maar even legen.
    achData = null;    // En om zeker te zijn dat alles netjes blijft zet ik de achievements data ook weer even op NULL

    try {   // Probeer de Achievements op te halen uit de api route voor api/achievements/+server.js met het gekregen steamId en AppId
      const res = await fetch(
        `/api/achievements?steamid=${steamId}&appid=${selectedAppId}`   // vraag de data op uit de api met de steamid en appid
      );
      const json = await res.json();    // sla de data op in const json

      if (!res.ok) {    // Als er een error is moet die geplaats worden in de let acherror
        achError = json.error || 'Kon achievements niet laden.';    // En als er geen bruikbare error is dan komt de tekst
      } else if (json.total === 0) {    // Anders (dus geen error) maar de gebruiker geen achievements voor die game heeft
        achError =
          json.message || 'Deze game heeft geen achievements.';   // Dan komt deze tekst
      } else {    // Anders (dus geen error)
        achData = json;   // Vul de array met de achievements die uit de api fetch zijn gekomen
      }
    } catch (e) {   // Als er een error is
      console.error(e);   // Console log de error code
      achError = 'Fout bij het laden van achievements.';   // en neem de voldende error waarde
    } finally {   // Als laatste
      loadingAchievements = false;    // Zet de achievements loadingstate weer op false
    }
  }

  // Als de steamId veranderd of de browser herlaad of op een andere manier veranderd.
  $: if (browser && steamId) {
    loadGames();    // Voer deze functie opnieuw uit
  }

  // Als de steamId veranderd of de browser herlaad of op een andere manier veranderd.
  $: if (browser && steamId) {
    loadAchievements();    // Voer deze functie opnieuw uit
  }

  function onSelectChange(event) {    // Als de dropdown wordt veranderd
    const appid = event.target.value; // Sla de nieuwe id die nu is geselecteerd
    selectedAppId = appid;    // en vul hem in in de eerder aangemaakte let
    const g = games.find((game) => String(game.appid) === appid);   // EN probeer dat ook voor de naam
    selectedGameName = g ? g.name : '';
  }


  // Split alle data of je ze wel gehaald hebt of niet
  $: unlocked = achData
    ? achData.achievements.filter((a) => a.achieved)    // Wel gehaald
    : [];
  $: locked = achData
    ? achData.achievements.filter((a) => !a.achieved)   // Niet gehaald "!"
    : [];
</script>

<div class="slide4">
  <h2>Achievement progress</h2>

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
            <option disabled>Geen games gevonden.</option>
          {:else}
            {#each games as g}
              <option value={g.appid}>{g.name}</option>
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
            label="Unlocked"
            sublabel={`${achData.unlocked} / ${achData.total} achievements`}
          />
        </div>

        <div class="right">
          <h3>{selectedGameName}</h3>

          <div class="ach-section">
            <h4>Unlocked ({unlocked.length})</h4>
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
            <h4>Locked ({locked.length})</h4>
            {#if locked.length === 0}
              <p class="muted">Alles unlocked! 🔥</p>
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
    color: #fff;
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
    flex: 1 1 260px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .ach-section h4 {
    margin: 0 0 0.25rem;
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
    background: rgba(23, 26, 33, 0.9);
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
    font-weight: 500;
  }

  .ach-desc {
    font-size: 0.8rem;
    color: #bbb;
  }

  .muted {
    font-size: 0.85rem;
    color: #aaa;
  }

  .error {
    color: #ff7777;
  }
</style>
