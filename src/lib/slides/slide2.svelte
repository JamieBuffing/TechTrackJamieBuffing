<script>
  import { browser } from '$app/environment';   // geeft true terug als de app in de browser runt
  import TopGamesDonutChart from '$lib/components/slide2.1.svelte';   // Donut chart
  import TopGamesBarChart from '$lib/components/slide2.2.svelte';   // Bar chart

  export let steamId = '';  // Hier komt het gekozen steamid in

  let loading = false;    // of het grafiek aan het laden is, standaard false
  let error = '';   // Als er een error melding is wordt die hier opgeslagen
  let topGames = [];    // De plek waar de topGames worden opgeslagen die uit de functie loadTopGames() komen

  // 🔹 Cache per steamId: { topGames, error }
  const cache = new Map();

  async function loadTopGames() {   // In deze functie worden alle games opgehaald
    if (!steamId) {   // Tenzij er geen steamid is want dan moet de gebruiker die eerst nog even kiezen in de eerste slide
      error =
        'Geen SteamID geselecteerd. Ga eerst naar slide 1 om een account te kiezen, deze tekst wordt dan op de pagina geladen en dat komt uit de let error';
      topGames = [];    // En om zeker te zijn dat alles netjes blijft zorg ik ook even dat de topGames array leeg blijft
      return;   // En stop met het uitvoeren van de rest van de functie
    }

    // ✅ Probeer eerst cache
    const cached = cache.get(steamId);
    if (cached) {
      topGames = cached.topGames;
      error = cached.error;
      loading = false;
      return;
    }

    loading = true;   // Nu gaan de games eenmaak laden dus mag de loading statement op true waardoor later in de html ook tekst wordt weergegeven.
    error = '';   // De error voor de zekerheid maar even legen.
    topGames = [];    // De array ook zeker weten dat die leeg is

    try {   // Probeer de games op te halen uit de api route voor api/top-games/+server.js met het gekregen steamId
      const res = await fetch(`/api/top-games?steamid=${steamId}`);
      const json = await res.json();

      if (!res.ok) {    // Als er een error is moet die geplaats worden in de let error
        error = json.error || 'Kon top games niet laden.';    // En als er geen bruikbare error is dan komt de tekst
      } else {    // Anders (dus geen error)
        topGames = json.topGames || [];   // Vul de array met de games die uit de api fetch zijn gekomen
      }
    } catch (e) {   // Als de try niet is gelukt
      console.error(e);   // Toon de error in de console
      error =
        'Fout bij het laden van top games.';   // En de let error wordt gevuld met de tekst "Fout bij het laden van top games."
    } finally {   // En als laatst dus als alles is gelukt dan moet de loading statement weer op false
      // ✅ Resultaat in cache stoppen (ook als er een error is, dan cachen we die ook)
      cache.set(steamId, { topGames, error });
      loading = false;
    }
  }

  // Als de steamId veranderd of de browser herlaad of op een andere manier veranderd.
  $: if (browser && steamId) {
    loadTopGames();   // Dan loadTopGames() opnieuw laden
  }
</script>


<div class="slide2">
  <h2>Top 5 meest gespeelde games</h2>
  <!-- Een manier van svlete om een if else statement te maken in je html -->
  <!-- Als er geen steamId is -->
  {#if !steamId}
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>
  <!-- Als de loading statement true is -->
  {:else if loading}
    <p>Top games laden…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if topGames.length === 0}
    <p>Geen games gevonden voor dit account.</p>
  {:else}
    <div class="charts">
      <div class="chart-block">
        <h3>Speeltijd per game (uren)</h3>
        <!-- Hier komt de BarChart -->
        <TopGamesBarChart data={topGames} />
      </div>
      <div class="chart-block">
        <h3>Verdeling speeltijd (donut)</h3>
        <!-- Hier komt de DonutChart -->
        <TopGamesDonutChart data={topGames} width={360} height={360} />
      </div>
    </div>
  {/if}
</div>

<style>
  .slide2 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .charts {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: flex-start;
  }

  .chart-block {
    flex: 1 1 320px;
  }

  .error {
    color: #f88;
  }
</style>
