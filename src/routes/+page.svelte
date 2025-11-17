<script>
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

  let activeSlide = 0;
  const totalSlides = 9;

  let steamId = data.initialSteamId || '';
</script>

<nav class="story-bar">
  {#each Array(totalSlides) as _, i}
    <button
      type="button"
      class="story-segment"
      class:active={activeSlide === i}
      aria-label={`Ga naar slide ${i + 1}`}
      on:click={() => (activeSlide = i)}
    ></button>
  {/each}
</nav>

<section class:hidden={activeSlide !== 0}>
  <Slide1 bind:steamId on:start={() => (activeSlide = 1)} />
</section>

<section class:hidden={activeSlide !== 1}>
  <Slide2 {steamId} />
</section>

<section class:hidden={activeSlide !== 2}>
  <Slide3 {steamId} isActive={activeSlide === 2} />
</section>

<section class:hidden={activeSlide !== 3}>
  <Slide4 {steamId} />
</section>

<section class:hidden={activeSlide !== 4}>
  <Slide5 {steamId} />
</section>

<section class:hidden={activeSlide !== 5}>
  <Slide6 {steamId} />
</section>

<section class:hidden={activeSlide !== 6}>
  <Slide7 {steamId} />
</section>

<section class:hidden={activeSlide !== 7}>
  <Slide8 {steamId} />
</section>

<section class:hidden={activeSlide !== 8}>
  <Slide9 {steamId} />
</section>