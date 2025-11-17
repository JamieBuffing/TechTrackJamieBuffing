<!-- src/routes/+layout.svelte -->
<script>
  import '../style/global.css';
  import favicon from '$lib/assets/favicon.svg';
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<header>
	<h1>My Steam story</h1>
</header>

<main>
  <slot />
</main>

<footer>
  &copy; Jamie Buffing
</footer>
