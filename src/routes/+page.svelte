<!-- src/routes/+page.svelte -->
<script>
  import { setActiveSteamId } from '$lib/slideCache.js';

  import Slide1 from '$lib/slides/slide1.svelte';
  import Slide2 from '$lib/slides/slide2.svelte';
  import Slide3 from '$lib/slides/slide3.svelte';
  import Slide4 from '$lib/slides/slide4.svelte';
  import Slide5 from '$lib/slides/slide5.svelte';
  import Slide6 from '$lib/slides/slide6.svelte';
  import Slide7 from '$lib/slides/slide7.svelte';
  import Slide8 from '$lib/slides/slide8.svelte';
  import Slide9 from '$lib/slides/slide9.svelte';

  export let data;
  let lastSteamId = null;

  // actieve slide index
  let activeSlide = 0;

  // steamId komt uit +page.js / +layout.server.js
  let steamId = data.initialSteamId || '';

  $: if (steamId && steamId !== lastSteamId) {
    setActiveSteamId(steamId);
    lastSteamId = steamId;
  }

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

  const totalSlides = slides.length;

  $: CurrentSlide = slides[activeSlide].component;

  function goTo(index) {
    if (index >= 0 && index < totalSlides) {
      activeSlide = index;
    }
  }

  function next() {
    goTo(activeSlide + 1);
  }

  function prev() {
    goTo(activeSlide - 1);
  }

  // Slide 1 dispatcht 'start' → ga naar slide 2
  function handleStart() {
    goTo(1);
  }
</script>

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

<main class="storyContainer">
  <header class="storyHeader">
    <h1>Jouw Steam Story</h1>
    <p class="storySubtitle">
      Slide {activeSlide + 1} van {totalSlides} — {slides[activeSlide].label}
    </p>
  </header>

  <!-- 🔑 HIER het belangrijkste verschil:
       alleen de *actieve* slide wordt gemount -->
  <section class="storySlide">
    <svelte:component
      this={CurrentSlide}
      bind:steamId
      isActive={true}
      on:start={handleStart}
    />
  </section>

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
