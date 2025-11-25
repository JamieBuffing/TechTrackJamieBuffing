<!-- src/lib/slides/slide1 -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';      
  import { presetSteamIds } from '$lib/presetSteamIds.js'; 

  export let steamId = '';  

  const dispatch = createEventDispatcher();

  let loadingProfile = false;
  let profileError = '';   

  function selectPreset(id) {
    steamId = id;         
    profileError = '';  
  }

  // Om in te loggen met steam
  function loginWithSteam() {
    goto('/auth/steam');  
  }

  // Om uit te loggen van steam (stiekem geowon een refresh)
  function logout() {
    steamId = '';         
    profileError = '';   
    goto('/');
  }

  // Start story knop om naar de volgende slide te gaan
  async function startStory() {
    if (!steamId || loadingProfile) return;

    loadingProfile = true;
    profileError = '';

    // Check het steamid profile
    try {
      const res = await fetch(`/api/profile?steamid=${steamId}`);

      if (!res.ok) {
        profileError = 'Kon je Steam-profiel niet laden. Probeer het later opnieuw.';
        return;
      }

      const data = await res.json();
      const player = data?.player;
      const visibility = player?.communityvisibilitystate;

      if (visibility !== 3) {
        if (visibility === 1 || visibility === 2) {
          profileError =
            'Je Steam-profiel is niet openbaar. Zet je profiel in Steam op "Public" om verder te gaan.';
        } else {
          profileError =
            'Je Steam-profiel is niet (volledig) zichtbaar. Controleer je privacy-instellingen.';
        }
        return; 
      }

      dispatch('start');
    } catch (err) {
      console.error(err);
      profileError = 'Er ging iets mis bij het laden van je profiel.';
    } finally {
      loadingProfile = false;
    }
  }
</script>

<!-- De pagina -->
<div class="slide1">
  <h1>Welkom bij jouw Steam Story</h1>
  <p>
    Login met je Steam account of kies één van de preset accounts om
    door te gaan.<br>
    Standaard ben ik zelf ingelogd voor dit project maar dit kan ik uitzetten door mijn default weg te halen.
  </p>

  {#if steamId}
    <div class="panel loginPanel">
      <h2>Welkom!</h2>
      <p class="hint">
        Je bent ingelogd met SteamID: <strong>{steamId}</strong>
      </p>
      <button class="btn steam" type="button" on:click={logout}>
        Log uit
      </button>
    </div>
  {:else}
    <div class="panel loginPanel">
      <h2>Login met Steam</h2>
      <button class="btn steam" type="button" on:click={loginWithSteam}>
        Login met Steam
      </button>
      <p class="hint">
        Na inloggen word je teruggestuurd en wordt jouw SteamID gebruikt.
      </p>
    </div>
  {/if}

  <div class="panel presetsPanel">
    <h2>Of kies een preset account</h2>

    <div class="presetList">
      {#each presetSteamIds as p}
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

  <div class="startPanel">
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
    background: radial-gradient(circle at top, #1b2838 0%, #0b1015 60%, #050608 100%);
    color: #c7d5e0;
  }

  .loginPanel {
    border: 1px solid #2a475e;
  }

  .presetsPanel {
    border: 1px solid #2a475e;
  }

  .presetList {
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

  .startPanel {
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
