<!-- src/lib/slides/slide3 -->
<script>
  import { browser } from '$app/environment';
  import GenreIconsChart from '$lib/components/slide3.1.svelte';

  export let steamId = '';

  let loading = false; 
  let error = ''; 
  let genres = [];

  // 🔹 Cache per steamId: { genres, error }
  const cache = new Map();

  async function loadGenres() {
    if (!steamId) { 
      error =
        'Geen SteamID geselecteerd. Ga eerst naar slide 1 om een account te kiezen, deze tekst wordt dan op de pagina geladen en dat komt uit de let error';
      genres = []; 
      return;
    }

    // ✅ Cache check
    const cached = cache.get(steamId);
    if (cached) {
      genres = cached.genres;
      error = cached.error;
      loading = false;
      return;
    }

    loading = true; 
    error = ''; 
    genres = []; 

    try {  
      const res = await fetch(`/api/genres?steamid=${steamId}`);
      const json = await res.json();

      if (!res.ok || json.error) { 
        error = json.error || 'Kon genres niet laden.'; 
      } else { 
        genres = json.genres || []; 
        if (!genres.length && json.message) {
          error = json.message;  
        }
      }
    } catch (e) {   
      console.error(e);
      error = 'Fout bij het laden van genres.'; 
    } finally { 
      // ✅ Cache schrijven
      cache.set(steamId, { genres, error });
      loading = false; 
    }
  }

  
  $: if (browser && steamId) {
    loadGenres();
  }
</script>


<div class="slide3">
  <h2>Genre / categorie verdeling</h2>
  {#if !steamId}    
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>
  {:else if loading}
    <p>Genres laden…</p>
  {:else if error && (!genres || genres.length === 0)}
    <p class="error">{error}</p>
  {:else if genres.length === 0}
    <p>Geen genres/categorieën gevonden.</p>
  {:else}
    <p class="intro">
      Dit is een overzicht van je belangrijkste genres op basis van
      de <strong>eerste genre per game op steam</strong>. Alle speeltijd van een game
      wordt hieraan gekoppeld.
      Hover over een rij om te zien welke games daar allemaal in zitten.
    </p>
    <GenreIconsChart data={genres} />
  {/if}
</div>

<style>
  .slide3 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .intro {
    font-size: 0.9rem;
    color: #171a21;
  }

  .error {
    color: #f88;
  }
</style>
