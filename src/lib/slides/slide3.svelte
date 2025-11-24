<!-- src/lib/slides/slide3.svelte -->
<script>
  import { browser } from '$app/environment';   // geeft true terug als de app in de browser runt
  import GenreIconsChart from '$lib/components/slide3.1.svelte';    // 

  export let steamId = '';  // Hier komt het gekozen steamid in

  let loading = false;    // of het grafiek aan het laden is, standaard false
  let error = '';   // Als er een error melding is wordt die hier opgeslagen
  let genres = [];    // De plek waar de genres worden opgeslagen die uit de functie loadGenres() komen

  // 🔹 Cache per steamId: { genres, error }
  const cache = new Map();

  async function loadGenres() {   // De functie waarin de genres worden opgehaald
    if (!steamId) {   // Tenzij er geen steamid is want dan moet de gebruiker die eerst nog even kiezen in de eerste slide
      error =
        'Geen SteamID geselecteerd. Ga eerst naar slide 1 om een account te kiezen, deze tekst wordt dan op de pagina geladen en dat komt uit de let error';
      genres = [];    // En om zeker te zijn dat alles netjes blijft zorg ik ook even dat de genres array leeg blijft
      return;   // En stop met het uitvoeren van de rest van de functie
    }

    // ✅ Cache check
    const cached = cache.get(steamId);
    if (cached) {
      genres = cached.genres;
      error = cached.error;
      loading = false;
      return;
    }

    loading = true;   // Nu gaan de genres eenmaak laden dus mag de loading statement op true waardoor later in de html ook tekst wordt weergegeven.
    error = '';   // De error voor de zekerheid maar even legen.
    genres = [];    // En om zeker te zijn dat alles netjes blijft zorg ik ook even dat de genres array leeg blijft

    try {   // Probeer de genres op te halen uit de api route voor api/grenres/+server.js met het gekregen steamId
      const res = await fetch(`/api/genres?steamid=${steamId}`);
      const json = await res.json();

      if (!res.ok || json.error) {    // Als er een error is moet die geplaats worden in de let error
        error = json.error || 'Kon genres niet laden.';    // En als er geen bruikbare error is dan komt de tekst
      } else {    // Anders (dus geen error)
        genres = json.genres || [];   // Vul de array met de genres die uit de api fetch zijn gekomen
        if (!genres.length && json.message) {   // Als de array een ongeldige lengte heeft en er een JSON bericht is dan
          error = json.message;   // Sla dan het bericht op als error
        }
      }
    } catch (e) {   // Als de try niet lukt geef dan de error mee
      console.error(e);   // Console log die error code
      error = 'Fout bij het laden van genres.';    // Vul de let error in met het volgende bericht
    } finally {   // Als laatste zet de loading state weer op false
      // ✅ Cache schrijven
      cache.set(steamId, { genres, error });
      loading = false;    // true --> false
    }
  }

  // Als de steamId veranderd of de browser herlaad of op een andere manier veranderd.
  $: if (browser && steamId) {
    loadGenres();   // Voer deze functie opnieuw uit
  }
</script>


<div class="slide3">
  <h2>Genre / categorie verdeling</h2>
<!-- Een manier van svlete om een if else statement te maken in je html -->
 <!-- Als er geen steamId is -->
  {#if !steamId}    
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>
  <!-- Anders als de loading statement true is -->
  {:else if loading}
    <p>Genres laden…</p>
  <!-- Anders als er een error is -->
  {:else if error && (!genres || genres.length === 0)}
    <p class="error">{error}</p>
  <!-- Anders als de genres array leeg is -->
  {:else if genres.length === 0}
    <p>Geen genres/categorieën gevonden.</p>
  <!-- Anders als dus alles goed gaat -->
  {:else}
    <p class="intro">
      Dit is een overzicht van je belangrijkste genres op basis van
      de <strong>eerste genre per game op steam</strong>. Alle speeltijd van een game
      wordt hieraan gekoppeld.
      Hover over een rij om te zien welke games daar allemaal in zitten.
    </p>
    <!-- Toon de IconChart -->
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
