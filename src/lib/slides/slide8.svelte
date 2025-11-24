<script>
  import { browser } from '$app/environment';
  import LibraryValueChart from '$lib/components/slide8.1.svelte';

  export let steamId = '';  // Hier komt het gekozen steamid in

  let loading = false;    // of het grafiek aan het laden is, standaard false
  let error = '';   // Als er een error melding is wordt die hier opgeslagen
  let totalValue = 0;
  let currency = 'EUR';
  let gamesPricedCount = 0;
  let totalOwnedCount = 0;
  let genres = [];
  let mostExpensive = [];

  // 🔹 Cache per steamId:
  // { totalValue, currency, gamesPricedCount, totalOwnedCount, genres, mostExpensive, error }
  const cache = new Map();

  async function loadLibraryValue() {
    if (!steamId) {
      error = 'Geen SteamID geselecteerd.';
      return;   // En stop met het uitvoeren van de rest van de functie
    }

    // ✅ Cache check
    const cached = cache.get(steamId);
    if (cached) {
      totalValue = cached.totalValue;
      currency = cached.currency;
      gamesPricedCount = cached.gamesPricedCount;
      totalOwnedCount = cached.totalOwnedCount;
      genres = cached.genres;
      mostExpensive = cached.mostExpensive;
      error = cached.error;
      loading = false;
      return;
    }

    loading = true;   // Nu gaan de games eenmaak laden dus mag de loading statement op true waardoor later in de html ook tekst wordt weergegeven.
    error = '';   // De error voor de zekerheid maar even legen.
    genres = [];
    mostExpensive = [];
    totalValue = 0;
    gamesPricedCount = 0;
    totalOwnedCount = 0;

    try {   // Probeer de games en hun waarde op te halen uit de api route voor api/library-value/+server.js met het gekregen steamId
      const res = await fetch(`/api/library-value?steamid=${steamId}`);
      const json = await res.json();

      if (!res.ok || json.error) {
        error = json.error || 'Kon library waarde niet laden.';
      } else {    // Anders (dus geen error)
        if (json.message && (!json.genres || !json.genres.length)) {
          error = json.message;
        }
        totalValue = json.totalValue || 0;
        currency = json.currency || 'EUR';
        gamesPricedCount = json.gamesPricedCount || 0;
        totalOwnedCount = json.totalOwnedCount || 0;
        genres = json.genres || [];
        mostExpensive = json.mostExpensive || [];
      }
    } catch (e) {
      console.error(e);
      error = 'Netwerkfout bij het laden van library waarde.';
    } finally {
      // ✅ Cache updaten
      cache.set(steamId, {
        totalValue,
        currency,
        gamesPricedCount,
        totalOwnedCount,
        genres,
        mostExpensive,
        error
      });
      loading = false;
    }
  }

  // Als de steamId veranderd of de browser herlaad of op een andere manier veranderd.
  $: if (browser && steamId) {
    loadLibraryValue();
  }

  function formatCurrency(amount) {
    return `${amount.toFixed(2)} ${currency}`;
  }
</script>

<div class="slide8">
  <h2>Waardeverdeling van je library</h2>

  {#if !steamId}
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>
  {:else if loading}
    <p>Library waarde laden…</p>
  {:else if error && (!genres || genres.length === 0)}
    <p class="error">{error}</p>
  {:else}
    <div class="summary">
      <div class="summary-block big">
        <div class="label">Geschatte waarde</div>
        <div class="value">{formatCurrency(totalValue)}</div>
        <div class="note">
          Gebaseerd op ongeveer {gamesPricedCount} games met prijsinformatie
          van je totaal {totalOwnedCount} games.
        </div>
      </div>
    </div>
    
    {#if genres && genres.length}
      <div class="section">
        <h3>Verdeling per genre / categorie</h3>
        <p class="hint">
          Hier zie je hoeveel van de totale waarde gekoppeld is aan elke genre/categorie
          op de store-pagina. Dit zijn de genres van de games waar een actuele
          prijs voor gevonden is.
        </p>
        <LibraryValueChart data={genres} {currency} />
      </div>
    {/if}

    {#if mostExpensive && mostExpensive.length}
      <div class="section">
        <h3>Duurste games in je library</h3>
        <p class="hint">
          Dit zijn de games met de hoogste huidige store-prijs in de subset die is opgehaald.
        </p>
        <table class="games-table">
          <thead>
            <tr>
              <th>Game</th>
              <th>Prijs</th>
              <th>Jouw speeltijd</th>
            </tr>
          </thead>
          <tbody>
            {#each mostExpensive as g}
              <tr>
                <td>{g.name}</td>
                <td>{formatCurrency(g.price)}</td>
                <td>{g.hours}u</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</div>

<style>
  .slide8 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .summary {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .summary-block {
    background: #171a21;
    border-radius: 0.75rem;
    border: 1px solid #2a475e;
    padding: 0.75rem 1rem;
  }

  .summary-block.big {
    flex: 1 1 260px;
  }

  .label {
    font-size: 0.85rem;
    color: #c7d5e0;
  }

  .value {
    font-size: 1.4rem;
    font-weight: 600;
    margin-top: 0.2rem;
    color: #66c0f4;
  }

  .note {
    margin-top: 0.2rem;
    font-size: 0.8rem;
    color: #c7d5e0;
  }

  .section {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hint {
    font-size: 0.85rem;
    color: #1b2838;
  }

  .games-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .games-table th,
  .games-table td {
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid #2a475e;
  }

  .games-table th {
    text-align: left;
    font-weight: 500;
    color: #1b2838;
  }

  .games-table td {
    color: #1b2838;
  }

  .error {
    color: #f88;
  }
</style>
