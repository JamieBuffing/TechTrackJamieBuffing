<!-- src/lib/slides/Slide1.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';   // svelte component 
  import { goto } from '$app/navigation';          // svelte functie om later naar een ander bestand of route te wijzen
  import { presetSteamIds } from '$lib/presetSteamIds.js'; // Dit zijn de presets id's voor als je niet wilt inloggen

  export let steamId = '';  // Hier komt het gekozen steamid in

  const dispatch = createEventDispatcher();

  let loadingProfile = false;  // bezig met checken van profiel?
  let profileError = '';       // melding als profiel niet public is of niet geladen kan worden

  function selectPreset(id) {
    steamId = id;          // de eerder aangemaakt let wordt ingevuld met id dat komt uit het aanroepen van de functie
    profileError = '';     // oude foutmelding opruimen bij nieuw account
  }

  function loginWithSteam() {
    goto('/auth/steam');   // de route om in te loggen
  }

  function logout() {
    steamId = '';          // dit leegt de variable weer
    profileError = '';     // foutmeldingen opruimen
    goto('/');             // URL opschonen / Home pagina herladen
  }

  // Controleer of het profiel public is, en ga dan pas door
  async function startStory() {
    if (!steamId || loadingProfile) return;

    loadingProfile = true;
    profileError = '';

    try {
      const res = await fetch(`/api/profile?steamid=${steamId}`);

      if (!res.ok) {
        profileError = 'Kon je Steam-profiel niet laden. Probeer het later opnieuw.';
        return;
      }

      const data = await res.json();
      const player = data?.player;
      const visibility = player?.communityvisibilitystate;
      console.log(visibility)

      // Steam visibility:
      // 1 = Private, 2 = Friends Only, 3 = Public
      if (visibility !== 3) {
        if (visibility === 1 || visibility === 2) {
          profileError =
            'Je Steam-profiel is niet openbaar. Zet je profiel in Steam op "Public" om verder te gaan.';
        } else {
          profileError =
            'Je Steam-profiel is niet (volledig) zichtbaar. Controleer je privacy-instellingen.';
        }
        return; // NIET door naar de volgende slide
      }

      // Alles ok → parent zet dan activeSlide = 1
      dispatch('start');
    } catch (err) {
      console.error(err);
      profileError = 'Er ging iets mis bij het controleren van je profiel.';
    } finally {
      loadingProfile = false;
    }
  }
</script>


<!-- ---------- De pagina content (Voor slide 1) ---------- -->
<div class="slide1">
  <h1>Welkom bij jouw Steam Story</h1>
  <p>
    Login met je Steam account of kies één van de preset accounts om
    door te gaan.
  </p>

  {#if steamId}
    <!-- Steam id aanwezig =  Welkom met logout -->
    <div class="panel login-panel">
      <h2>Welkom!</h2>
      <p class="hint">
        Je bent ingelogd met SteamID: <strong>{steamId}</strong>
      </p>
      <button class="btn steam" type="button" on:click={logout}>
        Log uit
      </button>
    </div>
  {:else}
    <!-- Geen steam id = login met steamknop -->
    <div class="panel login-panel">
      <h2>Login met Steam</h2>
      <button class="btn steam" type="button" on:click={loginWithSteam}>
        Login met Steam
      </button>
      <p class="hint">
        Na inloggen word je teruggestuurd en wordt jouw SteamID gebruikt.
      </p>
    </div>
  {/if}

  <div class="panel presets-panel">
    <h2>Of kies een preset account</h2>

    <div class="preset-list">
      {#each presetSteamIds as p}
        <!-- For each van svelte -->
        <button
          type="button"
          class="preset {steamId === p.id ? 'active' : ''}"
          on:click={() => selectPreset(p.id)}
        >
          {p.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="start-panel">
    <button
      type="button"
      class="btn start"
      on:click={startStory}
      disabled={!steamId || loadingProfile}
    >
      {#if loadingProfile}
        Profiel controleren…
      {:else}
        Start je story
      {/if}
    </button>

    {#if !steamId}
      <p class="hint">Kies eerst een account of login met Steam.</p>
    {:else if profileError}
      <p class="hint error">{profileError}</p>
    {/if}
  </div>
</div>

<style>
  .slide1 {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  h1 {
    margin: 0;
  }

  .panel {
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
    background: #171a21;
    color: #c7d5e0;
  }

  .login-panel {
    border: 1px solid #2a475e;
  }

  .presets-panel {
    border: 1px solid #2a475e;
  }

  .preset-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .preset {
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    border: 1px solid #2a475e;
    background: transparent;
    color: #c7d5e0;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .preset.active {
    background: #66c0f4;
    border-color: #66c0f4;
    color: #171a21;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .btn.steam {
    background: #171a21;
    color: #c7d5e0;
    border: 1px solid #66c0f4;
  }

  .btn.start {
    background: #66c0f4;
    color: #171a21;
    min-width: 200px;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .start-panel {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: flex-start;
  }

  .hint {
    font-size: 0.85rem;
    color: #c7d5e0;
  }

  .hint.error {
    color: #f88;
  }
</style>
