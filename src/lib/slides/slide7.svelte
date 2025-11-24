<!-- srs/lib/slides/slide7 -->
<script>
  import { browser } from '$app/environment';
  import HiddenGemsList from '$lib/components/slide7.1.svelte';

  export let steamId = '';  // Hier komt het gekozen steamid in

  let loading = false;    // of het grafiek aan het laden is, standaard false
  let error = '';   // Als er een error melding is wordt die hier opgeslagen
  let gems = [];

  // 🔹 Cache per steamId: { gems, error }
  const cache = new Map();

  async function loadHiddenGems() {
    if (!steamId) {
      error = 'Geen SteamID geselecteerd.';
      gems = [];
      return;   // En stop met het uitvoeren van de rest van de functie
    }

    // ✅ Cache check
    const cached = cache.get(steamId);
    if (cached) {
      gems = cached.gems;
      error = cached.error;
      loading = false;
      return;
    }

    loading = true;   // Nu gaan de games eenmaak laden dus mag de loading statement op true waardoor later in de html ook tekst wordt weergegeven.
    error = '';   // De error voor de zekerheid maar even legen.
    gems = [];

    try {   // Probeer de games op te halen uit de api route voor api/hidden-gems/+server.js met het gekregen steamId
      const res = await fetch(`/api/hidden-gems?steamid=${steamId}`);
      const json = await res.json();

      if (!res.ok || json.error) {    // Als er een error is moet die geplaats worden in de let error
        error = json.error || 'Kon hidden gems niet laden.';    // En als er geen bruikbare error is dan komt de tekst
      } else {    // Anders (dus geen error)
        gems = json.gems || [];   // Vul de array met de games die uit de api fetch zijn gekomen
        if (!gems.length && json.message) {      // Als de array geen geldige lengte heeft en er een JSON bericht is dan 
          error = json.message;   // sla het bericht op als error
        }
      }
    } catch (e) {
      console.error(e);
      error = 'Netwerkfout bij het laden van hidden gems.';
    } finally {
      // ✅ Cache updaten
      cache.set(steamId, { gems, error });
      loading = false;
    }
  }

  // Als de steamId veranderd of de browser herlaad of op een andere manier veranderd.
  $: if (browser && steamId) {
    loadHiddenGems();
  }
</script>

<div class="slide7">
  <h2>Vergeten glory in je library</h2>

  {#if !steamId}
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>

  {:else if loading}
    <p>Hidden gems zoeken…</p>

  {:else if error && (!gems || gems.length === 0)}
    <p class="error">{error}</p>

  {:else if gems.length === 0}
    <p class="muted">
      We konden geen hidden gems vinden. Misschien speel je alles al heel uitgebreid,
      of zijn er weinig games met voldoende reviews.
    </p>

  {:else}
    <p class="intro">
      Dit zijn games die jij relatief weinig hebt gespeeld, maar op Steam een sterke
      beoordeling en/of veel positieve reviews hebben. Hun <strong>hidden gem score</strong>
      combineert reviewscore, populariteit en het feit dat jij ze nog weinig hebt aangeraakt.
    </p>

    <HiddenGemsList data={gems} />
  {/if}
</div>

<style>
  .slide7 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: max-content;
  }

  .intro {
    font-size: 0.9rem;
    color: #1b2838;
  }

  .muted {
    font-size: 0.85rem;
    color: #1b2838;
  }

  .error {
    color: #f88;
  }
</style>
