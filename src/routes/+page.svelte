<!-- src/routes/+page.svelte -->
<script>
  // Hier de functie om te kijken welke steamid in de cache staat want daar zijn alle gegevens dan nog van opgeslagen
  import { setActiveSteamId } from '$lib/slideCache.js';

  // Hier alle slides die worden ingeladen op de pagina
  import Slide1 from '$lib/slides/slide1.svelte';
  import Slide2 from '$lib/slides/slide2.svelte';
  import Slide3 from '$lib/slides/slide3.svelte';
  import Slide4 from '$lib/slides/slide4.svelte';
  import Slide5 from '$lib/slides/slide5.svelte';
  import Slide6 from '$lib/slides/slide6.svelte';
  import Slide7 from '$lib/slides/slide7.svelte';
  import Slide8 from '$lib/slides/slide8.svelte';
  import Slide9 from '$lib/slides/slide9.svelte';

  // Hier de plek waar data wordt opgeslagen zodat het leesbaar is op alle slides (export)
  // En het laatste steamid dat op de pagina is geweest
  export let data;
  let lastSteamId = null;

  // actieve slide index
  let activeSlide = 0;

  // steamId komt uit +page.js / +layout.server.js
  let steamId = data.initialSteamId || '';

  // Als er een steamid is (bestaat) en hij is niet gelijk aan het laatste steam id dan moet hij als nieuwe active steamid gezet worden
  // Globaal door de functie die is geimporteerd en lokaal
  $: if (steamId && steamId !== lastSteamId) {
    setActiveSteamId(steamId);
    lastSteamId = steamId;
  }

  // Dit zijn de slides met hun labels
  const slides = [
    { component: Slide1, label: 'Start' },
    { component: Slide2, label: 'Top games' },
    { component: Slide3, label: 'Genres' },
    { component: Slide4, label: 'Achievements overzicht' },
    { component: Slide5, label: 'Vrienden' },
    { component: Slide6, label: 'Achievements radar' },
    { component: Slide7, label: 'Hidden gems' },
    { component: Slide8, label: 'Library waarde' },
    { component: Slide9, label: 'Speeluniversum' }
  ];

  // Om te kijken hoeveel slides er in totaal zijn
  const totalSlides = slides.length;

  // Bepaalt automatisch welke slide-component actief is op basis van de current index
  $: CurrentSlide = slides[activeSlide].component;

  // Een functie om de juiste (active slide) weer te geven
  function goTo(index) {
    if (index >= 0 && index < totalSlides) {
      activeSlide = index;
    }
  }

  // Volgende slide
  function next() {
    goTo(activeSlide + 1);
  }

  // Vorige slide
  function prev() {
    goTo(activeSlide - 1);
  }

  // Bij de start slide 1 weergeven
  function handleStart() {
    goTo(1);
  }
</script>

<!-- De navigatie bars bovenaan het scherm -->
<!-- Geef voor elk weer als -->
<!-- Standaard slide 1 op actief -->
<nav class="storyBar">
  {#each Array(totalSlides) as _, i}
    <button
      type="button"
      class="storySegment"
      class:active={activeSlide === i}
      aria-label={`Ga naar slide ${i + 1}`}
      on:click={() => goTo(i)}
    ></button>
  {/each}
</nav>

<!-- De main, hier komt alle inhoud in -->
<main class="storyContainer">
  <!-- Met als eerst een header met wat tekst -->
  <header class="storyHeader">
    <h1>Jouw Steam Story</h1>
    <p class="storySubtitle">
      Slide {activeSlide + 1} van {totalSlides} — {slides[activeSlide].label}
    </p>
  </header>

  <!-- Hier komt de section waarin alle slides geladen worden, maar dan wel alleen de actieve  -->
  <section class="storySlide">
    <svelte:component
      this={CurrentSlide}
      bind:steamId
      isActive={true}
      on:start={handleStart}
    />
  </section>

  <!-- En de footer van de main -->
  <!-- De twee knoppen om naar volgende en vorige te gaan -->
  <!-- Vorige en volgende zijn respectief op de eerste en laatste pagina disabled -->
  <footer class="storyFooter">
    <button class="btn navigation" type="button" on:click={prev} disabled={activeSlide === 0}>
      ◀ Vorige
    </button>

    <span>
      Slide {activeSlide + 1} / {totalSlides}
    </span>

    <button
      class="btn navigation" 
      type="button"
      on:click={next}
      disabled={activeSlide === totalSlides - 1}
    >
      Volgende ▶
    </button>
  </footer>
</main>

<style>
  .storyBar {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }

  .storySegment {
    flex: 1;
    height: 10px;
    border-radius: 999px;
    border: none;
    background: #2a475e;
    cursor: pointer;
  }

  .storySegment.active {
    background: #66c0f4;
  }

  .storyContainer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: max-content;
    overflow-y: auto;
  }

  .storyHeader h1 {
    margin: 0;
    font-size: 1.4rem;
    color: #171a21;
  }

  .storySubtitle {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: #171a21;
  }

  .storySlide {
    margin-top: 0.5rem;
  }

  .storyFooter {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    color: #171a21;
  }

  .storyFooter button[disabled] {
    opacity: 0.5;
    cursor: default;
  }
</style>
