<script>
  import { browser } from '$app/environment';
  import SteamBubbleGalaxy from '$lib/components/slide9.1.svelte';

  export let steamId = '';  // Hier komt het gekozen steamid in

  let loading = false;    // of het grafiek aan het laden is, standaard false
  let error = '';   // Als er een error melding is wordt die hier opgeslagen
  let games = [];

  // 🔹 Cache per steamId: { games, error }
  const cache = new Map();

  async function loadGames() {
    if (!steamId) {
      error = 'Geen SteamID geselecteerd.';
      games = [];
      return;   // En stop met het uitvoeren van de rest van de functie
    }

    // ✅ Cache check
    const cached = cache.get(steamId);
    if (cached) {
      games = cached.games;
      error = cached.error;
      loading = false;
      return;
    }

    loading = true;   // Nu gaan de games eenmaak laden dus mag de loading statement op true waardoor later in de html ook tekst wordt weergegeven.
    error = '';   // De error voor de zekerheid maar even legen.
    games = [];

    try {   // Probeer de games op te halen uit de api route voor /api/owned-games-simple/+server.js met het gekregen steamId
      const res = await fetch(`/api/owned-games-simple?steamid=${steamId}`);
      const json = await res.json();

      if (!res.ok || json.error) {    // Als er een error is moet die geplaats worden in de let error
        error = json.error || 'Kon games niet laden.';    // En als er geen bruikbare error is dan komt de tekst
      } else {    // Anders (dus geen error)
        games = json.games || [];   // Vul de array met de games die uit de api fetch zijn gekomen
      }
    } catch (e) {
      console.error(e);
      error = 'Netwerkfout bij het laden van je games.';
    } finally {
      // ✅ Cache updaten
      cache.set(steamId, { games, error });
      loading = false;
    }
  }

  // Als de steamId veranderd of de browser herlaad of op een andere manier veranderd.
  $: if (browser && steamId) {
    loadGames();
  }
</script>


<div class="slide9">
  <h2>Jouw Steam speeluniversum</h2>

  {#if !steamId}
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>

  {:else if loading}
    <p>Je speeluniversum wordt opgebouwd…</p>

  {:else if error}
    <p class="error">{error}</p>

  {:else if games.length === 0}
    <p>We vonden geen games met speeltijd. Start een game en kom later terug 😉</p>

  {:else}
    <p class="hint">
      Elke cirkel is een game die je gespeeld hebt. Hoe groter de bubbel, hoe meer uur je erin hebt gestoken.
      Beweeg met je muis over een bubbel om te zien welke game het is.
      Je kunt de bubbles ook een beetje verslepen.
    </p>

    <SteamBubbleGalaxy data={games} width={700} height={450} />

    <p class="footer">
      Dit is de laatste slide van je Steam Story – een overzicht van alle werelden waar je tijd in hebt geïnvesteerd.
    </p>
  {/if}
</div>

<style>
  .slide9 {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  h2 {
    margin: 0;
  }

  .hint {
    font-size: 0.85rem;
    color: #1b2838;
    max-width: 620px;
  }

  .footer {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #1b2838;
  }

  .error {
    color: #f88;
  }
</style>
