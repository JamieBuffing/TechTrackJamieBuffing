<!-- srs/lib/slides/slide2 -->
<script>
  import { browser } from '$app/environment'; 
  import TopGamesDonutChart from '$lib/components/slide2.1.svelte'; 
  import TopGamesBarChart from '$lib/components/slide2.2.svelte';

  export let steamId = '';  

  let loading = false;  
  let error = ''; 
  let topGames = [];   

  // Cahce
  const cache = new Map();

  async function loadTopGames() { 
    if (!steamId) { 
      error =
        'Geen SteamID geselecteerd. Ga eerst naar slide 1 om een account te kiezen, deze tekst wordt dan op de pagina geladen en dat komt uit de let error';
      topGames = [];  
      return; 
    }

    // Eerst in de cache kijken
    const cached = cache.get(steamId);
    if (cached) {
      topGames = cached.topGames;
      error = cached.error;
      loading = false;
      return;
    }

    loading = true;  
    error = '';
    topGames = []

    // Anders echt laden
    try {
      // Uit de volgende api route
      const res = await fetch(`/api/topGames?steamid=${steamId}`);
      const json = await res.json();

      if (!res.ok) { 
        error = json.error || 'Kon top games niet laden.'; 
      } else {   
        topGames = json.topGames || [];  
      }
      // vang mogelijke errors op
    } catch (e) {  
      console.error(e);
      error =
        'Fout bij het laden van top games.'; 
    } finally { 
      cache.set(steamId, { topGames, error });
      loading = false;
    }
  }
  // Als de browser of het id veranderd
  $: if (browser && steamId) {
    loadTopGames();  
  }
</script>

<!-- de pagina -->
<div class="slide2">
  <h2>Top 5 meest gespeelde games</h2>
  {#if !steamId}
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>
  {:else if loading}
    <p>Top games laden…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if topGames.length === 0}
    <p>Geen games gevonden voor dit account.</p>
    <!-- als alles goed gaat dan de dingen op de pagina weergeven -->
  {:else}
    <div class="charts">
      <div class="chartBlock">
        <h3>Speeltijd per game</h3>
        <TopGamesBarChart data={topGames} />
      </div>
      <div class="chartBlock">
        <h3>Verdeling speeltijd</h3>
        <!-- Het Grafiek -->
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

  h2 {
    text-align: center;
  }
  
  .charts {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: flex-start;
  }

  .chartBlock {
    text-align: center;
    flex: 1 1 320px;
  }

  .error {
    color: #f88;
  }
</style>
