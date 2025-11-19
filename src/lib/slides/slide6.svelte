<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let steamId = '';

  let loadingGames = false;
  let error = '';
  let games = [];
  let selectedAppId = '';
  let selectedGameName = '';

  let loadingAchievements = false;
  let achError = '';
  let achData = null;

  let svgEl;

  // 🔹 Cache
  const gamesCache = new Map(); // steamId -> { games, error }
  const achCache = new Map();   // `${steamId}:${appid}` -> { achData, achError }

  async function loadTopGames() {
    if (!browser || !steamId) return;

    // ✅ Cache check
    const cached = gamesCache.get(steamId);
    if (cached) {
      games = cached.games;
      error = cached.error;
      if (games.length && !selectedAppId) {
        selectedAppId = String(games[0].appid);
        selectedGameName = games[0].name;
      }
      loadingGames = false;
      return;
    }

    loadingGames = true;   // Nu gaan de games eenmaak laden dus mag de loading statement op true waardoor later in de html ook tekst wordt weergegeven.
    error = '';   // De error voor de zekerheid maar even legen.
    games = [];

    try {   // Probeer de games op te halen uit de api route voor api/top-games/+server.js met het gekregen steamId
      const res = await fetch(`/api/top-games?steamid=${steamId}`);
      const json = await res.json();

      if (!res.ok || json.error) {
        error = json.error || 'Kon games niet laden.';
      } else {
        games = json.games || json.topGames || [];
        if (games.length && !selectedAppId) {
          selectedAppId = String(games[0].appid);
          selectedGameName = games[0].name;
        }
      }
    } catch (e) {
      console.error(e);
      error = 'Netwerkfout bij het laden van games.';
    } finally {
      // ✅ Cache updaten
      gamesCache.set(steamId, { games, error });
      loadingGames = false;
    }
  }

  async function loadAchievements() {
    if (!browser || !steamId || !selectedAppId) return;

    const key = `${steamId}:${selectedAppId}`;

    // ✅ Achievement cache check
    const cached = achCache.get(key);
    if (cached) {
      achData = cached.achData;
      achError = cached.achError;
      loadingAchievements = false;
      return;
    }

    loadingAchievements = true;
    achError = '';
    achData = null;

    try {   // Probeer de achievements op te halen uit de api route voor api/achievements/+server.js met het gekregen steamId
      const res = await fetch(
        `/api/achievements?steamid=${steamId}&appid=${selectedAppId}`
      );
      const json = await res.json();

      if (!res.ok || json.error) {    // Als er een error is moet die geplaats worden in de let error
        achError = json.error || 'Kon achievements niet laden.';    // En als er geen bruikbare error is dan komt de tekst
        return;   // En stop met het uitvoeren van de rest van de functie
      }

      if (json.total === 0) {    // Als er geen achievements zijn
        achError = json.message || 'Deze game heeft geen achievements.';
        return;   // En stop met het uitvoeren van de rest van de functie
      }
      // als alles goed gaat zoals gepland dan
      achData = json;   // Vul de achievementsData met de data die uit de api fetch zijn gekomen
      const game = games.find((g) => String(g.appid) === String(selectedAppId));
      if (game) {   // Als game bestaat dan
        selectedGameName = game.name; // Dan moet de geselecteerde naam de naam van de game zijn
      }
    } catch (e) {
      console.error(e);
      achError = 'Netwerkfout bij het laden van achievements.';
    } finally {
      // ✅ Cache updaten
      achCache.set(key, { achData, achError });
      loadingAchievements = false;
    }
  }

  // Als de steamId veranderd of de browser herlaad of op een andere manier veranderd.
  $: if (browser && steamId) {
    loadTopGames();
  }

  onMount(() => {
    if (steamId) {
      loadTopGames();
    }
  });

  // Herteken de chart wanneer de data verandert
  $: if (browser && svgEl && achData) {
    renderChart();
  }

  function renderChart() {
    if (!browser || !svgEl || !achData) return;

    const unlocked = achData.achievements
      .filter((a) => a.achieved && a.unlocktime)
      .map((a) => ({
        ...a,
        date: new Date(a.unlocktime * 1000)
      }))
      .sort((a, b) => a.date - b.date);

    const container = svgEl.parentElement;
    const margin = { top: 40, right: 40, bottom: 40, left: 150 };
    const fullWidth = (container?.clientWidth || 900);
    const width = fullWidth - margin.left - margin.right;
    const height = Math.max(220, unlocked.length * 24);

    const svg = d3
      .select(svgEl)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    // alles leegmaken voor we opnieuw tekenen
    svg.selectAll('*').remove();

    if (!unlocked.length) {
      const gEmpty = svg
        .append('g')
        .attr(
          'transform',
          `translate(${margin.left},${margin.top + height / 2})`
        );

      gEmpty
        .append('text')
        .attr('class', 'empty-text')
        .text('Geen achievements met een unlock-datum gevonden.')
        .attr('x', 0)
        .attr('y', 0);

      return;
    }

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('color', '#c7d5e0');

    const x = d3
      .scaleTime()
      .domain(d3.extent(unlocked, (d) => d.date))
      .range([0, width])
      .nice();

    const y = d3
      .scaleBand()
      .domain(unlocked.map((d) => d.displayName))
      .range([0, height])
      .padding(0.3);

    const color = d3
      .scaleSequential(d3.interpolateCool)
      .domain(d3.extent(unlocked, (d) => d.date));

    const xAxis = d3.axisBottom(x).ticks(5);
    const yAxis = d3.axisLeft(y).tickSize(0);

    // assen
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('class', 'y-label');

    // titel boven de chart
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', 0)
      .attr('y', -12)
      .attr('fill', '#c7d5e0')
      .text(selectedGameName);

    // de cirkels
    const nodes = g
      .selectAll('.ach-node')
      .data(unlocked, (d) => d.apiName);

    const nodesEnter = nodes
      .enter()
      .append('circle')
      .attr('class', 'ach-node')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.displayName) + y.bandwidth() / 2)
      .attr('r', 0)
      .style('fill', (d) => color(d.date))
      .style('opacity', 0.9);

    nodesEnter
      .transition()
      .duration(600)
      .attr('r', Math.min(10, y.bandwidth() / 2));

    // simpele tooltip via <title>
    nodesEnter.append('title').text((d) => {
      const dateStr = d.date.toLocaleDateString();
      return `${d.displayName}
Unlocked: ${dateStr}
${d.description || ''}`;
    });
  }
</script>

<div class="slide6">
  <h2>Achievement tijdlijn – hoe speel jij ze vrij?</h2>

  {#if !steamId}
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>
  {:else}
    <div class="controls">
      <label>
        Kies je favoriete game:
        <select
          bind:value={selectedAppId}
          on:change={onGameChange}
          disabled={loadingGames || games.length === 0}
        >
          {#if loadingGames}
            <option disabled>Games laden…</option>
          {:else if error}
            <option disabled>{error}</option>
          {:else if games.length === 0}
            <option disabled>Geen games gevonden</option>
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
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Totaal</div>
          <div class="summary-value">{achData.total}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Unlocked</div>
          <div class="summary-value">{achData.unlocked}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Percentage</div>
          <div class="summary-value">{achData.percentage}%</div>
        </div>
      </div>

      <div class="viz-wrapper">
        <p class="hint">
          Elke cirkel is een achievement met een bekende unlock-datum. Horizontaal zie je de tijd,
          verticaal de naam van de achievement. Hover voor details.
        </p>
        <svg bind:this={svgEl} class="achievements-chart"></svg>
      </div>
    {/if}
  {/if}
</div>

<style>
  .slide6 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h2 {
    margin: 0 0 0.5rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
  }

  select {
    background: #1b2838;
    color: #c7d5e0;
    border-radius: 0.4rem;
    border: 1px solid #2a475e;
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
  }

  .summary {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .summary-item {
    background: #171a21;
    border-radius: 0.6rem;
    padding: 0.75rem 1rem;
    border: 1px solid #2a475e;
    min-width: 110px;
  }

  .summary-label {
    font-size: 0.8rem;
    color: #aaa;
  }

  .summary-value {
    font-size: 1.2rem;
    font-weight: 600;
    color: #c7d5e0;
  }

  .viz-wrapper {
    background: #10151c;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem 1rem;
    border: 1px solid #2a475e;
  }

  .hint {
    font-size: 0.85rem;
    color: #c7d5e0;
    margin-bottom: 0.5rem;
  }

  .achievements-chart {
    width: 100%;
    display: block;
    color: #c7d5e0;
  }

  .error {
    color: #ff7777;
  }
</style>
