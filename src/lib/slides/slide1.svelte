<!-- src/lib/slides/Slide1.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';   // svelte component 
  import { goto } from '$app/navigation';   // svelte functie om later naar een ander bestand of route te wijzen
  import { presetSteamIds } from '$lib/presetSteamIds.js';    // Dit zijn de presets id's voor als je niet wilt inloggen

  export let steamId = '';  // Hier komt het gekozen steamid in

  const dispatch = createEventDispatcher(); //

  function selectPreset(id) {
    steamId = id;   // de eerder aangemaakt let wordt ingevuld met id dat komt uit het aanroepen van de functie
  }

  function loginWithSteam() {
    goto('/auth/steam');    // de route om in te loggen
  }

  function logout() {
    steamId = '';   // dit leegt de variable weer
    goto('/');    // URL opschonen / Home pagina herladen
  }


  function startStory() {
    if (!steamId) return;
    dispatch('start'); // parent zet dan activeSlide = 1
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
  <!-- If erlse van svelte -->
  <!-- Steam id aanwezig =  Welkom met loguit -->
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
      <!-- For eacht van svlete -->
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
      disabled={!steamId}
    >
      Start je story
    </button>
    <!-- Als er geen steamId is -->
    {#if !steamId}
      <p class="hint">Kies eerst een account of login met Steam.</p>
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
    color: #f5f5f5;
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
    color: #f5f5f5;
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
    color: #f5f5f5;
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
    color: #888;
  }
</style>
