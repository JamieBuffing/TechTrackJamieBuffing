<!-- src/routes/+layout.svelte -->
<script>
  import '../style/global.css';
  import favicon from '$lib/assets/steam.png';
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Steam Story</title>
</svelte:head>
<!-- Header -->
<header>
	<h1>Steam story</h1>
</header>
<!-- Main -->
<main>
  <slot />
</main>
<!-- Footer -->
<footer>
  &copy; Jamie Buffing
</footer>
