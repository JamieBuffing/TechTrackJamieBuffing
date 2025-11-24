<!-- srs/lib/components/slide9.1 -->
<script>
  import { onMount } from 'svelte';

  let d3Promise;

  const loadD3 = () => {
    if (!d3Promise) {
      d3Promise = import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
    }

    return d3Promise;
  };

  export let data = []; // [{ appid, name, hours }]
  export let width = 700;
  export let height = 450;

  let svgEl;
  let cleanup = () => {};

  async function draw() {
    if (!svgEl || !data || !data.length) {
      return;
    }

    const d3 = await loadD3()

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    // Kopieer data naar nodes
    const nodes = data.map((d) => ({ ...d }));

    const maxHours = d3.max(nodes, (d) => d.hours) || 1;

    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxHours])
      .range([6, 80]); // min/max bubbelgrootte

    nodes.forEach((n) => {
      n.r = radiusScale(n.hours);
    });

    const color = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, maxHours]);

    svg
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('width', width)
      .attr('height', height);

    const nodeG = svg
      .append('g')
      .selectAll('g.node')
      .data(nodes, (d) => d.appid)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.2).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    nodeG
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => color(d.hours))
      .attr('fill-opacity', 0.9)
      .attr('stroke', '#171a21')
      .attr('stroke-width', 1.5)
      .append('title')
      .text((d) => `${d.name}\n${d.hours} uur gespeeld`);

    // optioneel: korte game-naam in de bubble
    nodeG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('pointer-events', 'none')
      .style('font-size', '10px')
      .style('fill', '#c7d5e0')
      .text((d) => {
        // heel korte label (eerste woord / max 10 chars)
        const base = d.name || '';
        if (base.length <= 10) return base;
        return base.slice(0, 9) + '…';
      });

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'center',
        d3.forceCenter(0, 0)
      )
      .force(
        'charge',
        d3.forceManyBody().strength(5)
      )
      .force(
        'collision',
        d3.forceCollide().radius((d) => d.r + 3)
      )
      .on('tick', () => {
        nodeG.attr('transform', (d) => `translate(${d.x},${d.y})`);
      });

    cleanup = () => {
      simulation.stop();
      svg.selectAll('*').remove();
    };
  }

  onMount(() => {
    draw();
    return () => cleanup();
  });

  // redrawing bij dataverandering
  $: data && data.length && draw();
</script>

<svg bind:this={svgEl} class="steam-bubble-galaxy" role="img" aria-label="Steam speelgedrag bubbelvisualisatie"></svg>

<style>
  .steam-bubble-galaxy {
    max-width: 100%;
    display: block;
    background: radial-gradient(circle at top, #1b2838 0%, #0b1015 60%, #050608 100%);
    border-radius: 1rem;
    border: 1px solid #2a475e;
  }
</style>
