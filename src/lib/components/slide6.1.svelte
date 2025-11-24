<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let d3Promise;

  const loadD3 = () => {
    if (!d3Promise) {
      d3Promise = import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
    }
    return d3Promise;
  };

  export let achData = null;
  export let selectedGameName = '';
  export let games = [];
  export let selectedAppId = '';

  let svgEl;

  onMount(async () => {
    if (browser) {
      await loadD3();
      if (achData) {
        await renderChart();
      }
    }
  });

  // Herteken chart wanneer data verandert
  $: if (browser && svgEl && achData) {
    renderChart();
  }

  async function renderChart() {
    if (!browser || !svgEl || !achData) return;

    const d3 = await loadD3();

    const unlocked = achData.achievements
      .filter((a) => a.achieved && a.unlocktime)
      .map((a) => ({
        ...a,
        date: new Date(a.unlocktime * 1000)
      }))
      .sort((a, b) => a.date - b.date);

    const container = svgEl.parentElement;
    const margin = { top: 40, right: 40, bottom: 40, left: 30 };
    const fullWidth = container?.clientWidth || 900;
    const width = fullWidth - margin.left - margin.right;

    // 🔹 hoogte begrenzen: bij veel achievements komen rijen dichter op elkaar
    const minHeight = 220;      // basis-hoogte bij weinig achievements
    const maxHeight = 480;      // maximale hoogte van de chart
    const rowHeight = 24;       // "ideale" hoogte per achievement
    const idealHeight = unlocked.length * rowHeight;

    // clamp tussen min en max -> y.bandwidth wordt kleiner als er veel rijen zijn
    const height = Math.min(maxHeight, Math.max(minHeight, idealHeight));

    const svg = d3
      .select(svgEl)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    svg.selectAll('*').remove();

    if (!unlocked.length) {
      const gEmpty = svg
        .append('g')
        .attr(
          'transform',
          `translate(${margin.left},${margin.top + height / 2})`
        );

      gEmpty
        .append('text')
        .attr('class', 'empty-text')
        .text('Geen achievements met een unlock-datum gevonden.')
        .attr('x', 0)
        .attr('y', 0);

      return;
    }

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(unlocked, (d) => d.date))
      .range([0, width])
      .nice();

    const y = d3
      .scaleBand()
      .domain(unlocked.map((d) => d.displayName))
      .range([0, height])
      .padding(0.2);

    const color = d3
      .scaleSequential(d3.interpolateCool)
      .domain(d3.extent(unlocked, (d) => d.date));

    const xAxis = d3.axisBottom(x).ticks(5);

    // X-as onderaan
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('color', '#c7d5e0');

    // Y-as wordt alleen gebruikt voor de posities, niet voor tekst
    const yAxis = d3.axisLeft(y).tickSize(0);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .remove(); // geen tekstlabels tonen

    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', 0)
      .attr('y', -12)
      .attr('fill', '#c7d5e0')
      .text(`Gehaalde achievements voor ${selectedGameName}`);

    // ---- GAME ICON (fallback) ----
    let gameIconUrl = null;
    const game = games.find((g) => String(g.appid) === String(selectedAppId));
    if (game?.img_icon_url) {
      gameIconUrl = `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`;
    }

    // ---- ACHIEVEMENT ICONS ALS Y-LABEL ----
    const iconSize = Math.min(24, y.bandwidth());

    const iconGroup = g
      .selectAll('.ach-icon')
      .data(unlocked, (d) => d.apiName);

    const iconEnter = iconGroup
      .enter()
      .append('image')
      .attr('class', 'ach-icon')
      .attr('href', (d) => d.icon || gameIconUrl || '')
      .attr('x', -iconSize - 8)
      .attr('y', (d) => y(d.displayName) + (y.bandwidth() - iconSize) / 2)
      .attr('width', iconSize)
      .attr('height', iconSize);

    iconEnter.append('title').text((d) => d.displayName);

    // ---- ACHIEVEMENT NODES ----
    const nodes = g
      .selectAll('.ach-node')
      .data(unlocked, (d) => d.apiName);

    const nodesEnter = nodes
      .enter()
      .append('circle')
      .attr('class', 'ach-node')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.displayName) + y.bandwidth() / 2)
      .attr('r', 0)
      .attr('fill', (d) => color(d.date))
      .attr('opacity', 0.9);

    nodesEnter
      .transition()
      .duration(600)
      .attr('r', Math.min(10, y.bandwidth() / 2));

    nodesEnter.append('title').text((d) => {
      const dateStr = d.date.toLocaleDateString();
      return `${d.displayName}
Gehaald op: ${dateStr}
${d.description || ''}`;
    });
  }
</script>

<svg bind:this={svgEl}></svg>

<style>
  svg {
    width: 100%;
    max-width: 100%;
    display: block;
  }
</style>
