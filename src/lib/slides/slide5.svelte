<!-- src/lib/slides/slide5 -->
<script>
  import { browser } from '$app/environment';   // geeft true terug als de app in de browser runt
  import FriendsScatterPlot from '$lib/components/slide5.1.svelte';   // FriendsScatterPlot

  export let steamId = '';  // Hier komt het gekozen steamid in

  let loading = false;    // of het grafiek aan het laden is, standaard false
  let error = '';   // Als er een error melding is wordt die hier opgeslagen
  let players = [];    // En om zeker te zijn dat alles netjes blijft zorg ik ook even dat de players array leeg blijft
  let friendsCount = 0;   // Hier wordt opgeslagen hoeveel vrienden de gebruiker heeft

  // 🔹 Cache per steamId: { players, friendsCount, error }
  const cache = new Map();

  async function loadFriendStats() {    // De functie om de vrienden op te halen
    if (!steamId) {   // Als er geen steamId is
      error = 'Geen SteamID geselecteerd. Ga eerst naar slide 1.';
      players = [];
      friendsCount = 0;
      return;   // En stop met het uitvoeren van de rest van de functie
    }

    // ✅ Cache check
    const cached = cache.get(steamId);
    if (cached) {
      players = cached.players;
      friendsCount = cached.friendsCount;
      error = cached.error;
      loading = false;
      return;
    }

    loading = true;   // Nu gaan de vrienden eenmaal laden dus mag de loading statement op true waardoor later in de html ook tekst wordt weergegeven.
    error = '';   // De error voor de zekerheid maar even legen.
    players = [];

    try {   // Probeer de vrienden op te halen uit de api route voor api/friends-stats/+server.js met het gekregen steamId
      const res = await fetch(`/api/friends-stats?steamid=${steamId}`);
      const json = await res.json();

      if (!res.ok || json.error) {    // Als er een error is moet die geplaats worden in de let error
        error = json.error || 'Kon vriendstatistieken niet laden.';    // En als er geen bruikbare error is dan komt de tekst
        players = [];
        friendsCount = 0;
      } else {    // Anders (dus geen error)
        players = json.players || [];   // Vul de array met de vrienden die uit de api fetch zijn gekomen
        friendsCount = json.friendsCount ?? players.length ?? 0;
      }
    } catch (e) {
      console.error(e);
      error = 'Fout bij het laden van vriendstatistieken.';
      players = [];
      friendsCount = 0;
    } finally {
      // ✅ Cache updaten
      cache.set(steamId, { players, friendsCount, error });
      loading = false;
    }
  }

  // Als de steamId veranderd of de browser herlaad of op een andere manier veranderd.
  $: if (browser && steamId) {
    loadFriendStats();
  }

  $: you =
    players && players.find((p) => p.isSelf) ? players.find((p) => p.isSelf) : null;
  $: friends = players.filter((p) => !p.isSelf);
</script>

<div class="slide5">
  <h2>Vergelijk jezelf met je vrienden</h2>

  {#if !steamId}
    <p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>
  {:else if loading}
    <p>Vriendstatistieken laden…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if players.length === 0}
    <p>
      Geen gegevens gevonden. Heb je misschien geen zichtbare vrienden of
      staan hun profielen op privé?
    </p>
  {:else}
    <p class="intro">
      Elke cirkel is een speler. <br>
      De horizontale as is do totale gespeelde tijd. <br>
      De verticale as is het totaal aantal spellen. <br>
      De grootte van de cirkel laat zien hoeveel iemand recent heeft gespeeld (laatste 2 weken).<br>
      Je kan de bolletjes verplaatsen na 3 seconden keren ze weer terug.
    </p>

    <FriendsScatterPlot data={players} />

    <div class="summary">
      {#if you}
        <div class="card">
          <h3>Jij</h3>
          <div class="playerRow">
            {#if you.avatar}
              <img src={you.avatar} alt="" class="avatar" />
            {/if}
            <div>
              <div class="name">{you.personaname}</div>
              <div class="gegevens">
                {you.totalGames} games • {you.totalHours}u totaal • {you.recentHours}u recent
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .slide5 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .intro {
    font-size: 0.9rem;
    color: #1b2838;
  }

  .summary {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .card {
    background: #171a21;
    border-radius: 0.75rem;
    border: 1px solid #2a475e;
    padding: 0.75rem 1rem;
    flex: 1 1 260px;
    color: #c7d5e0;
  }

  .playerRow {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 0.4rem;
  }

  .name {
    font-size: 0.95rem;
    font-weight: 500;
  }

  .gegevens {
    font-size: 0.8rem;
    color: #c7d5e0;
  }

  .error {
    color: #f88;
  }
</style>
