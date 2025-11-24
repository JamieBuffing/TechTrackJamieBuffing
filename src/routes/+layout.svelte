<!-- src/routes/+layout.svelte -->
<script>
  import '../style/global.css';
  import favicon from '$lib/assets/steam.png';
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Steam Story</title>
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
