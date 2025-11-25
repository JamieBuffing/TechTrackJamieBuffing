<!-- srs/lib/components/slide9.1 -->
<script>
  import { onMount } from 'svelte';

  let d3Promise;

  // Laad D3 slechts één keer
  const loadD3 = () => {
    if (!d3Promise) {
      d3Promise = import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
    }
    return d3Promise;
  };

  // data
  export let data = [];
  export let width = 700;
  export let height = 450;

  let svgEl;
  let cleanup = () => {};

  async function draw() {
    if (!svgEl || !data || !data.length) return;

    const d3 = await loadD3();

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const nodes = data.map((d) => ({ ...d }));

    // Max uren bepalen
    const maxHours = d3.max(nodes, (d) => d.hours) || 1;

    // Bubbelstraal
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxHours])
      .range([6, 80]);

    nodes.forEach((n) => {
      n.r = radiusScale(n.hours);
    });

    // Kleurenschaal
    const color = d3.scaleLinear()
      .domain([0, maxHours])
      .range(["#2a475e", "#66c0f4"])
      .interpolate(d3.interpolateHcl);

    const textColor = (d) => {
      const c = d3.hcl(color(d.hours));
      return c.l < 55 ? "#c7d5e0" : "#1b2838";
    };

    svg
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('width', width)
      .attr('height', height);

    // Node groep
    const nodeG = svg
      .append('g')
      .selectAll('g.node')
      .data(nodes, (d) => d.appid)
      .join('g')
      .attr('class', 'node');

    // Bubbel
    nodeG
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => color(d.hours))
      .attr('fill-opacity', 0.9)
      .attr('stroke', '#171a21')
      .attr('stroke-width', 1.5)
      .append('title')
      .text((d) => `${d.name}\n${d.hours} uur gespeeld`);

    // Label
    nodeG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('pointer-events', 'none')
      .style('font-size', '15px')
      .style('fill', (d) => textColor(d))
      .text((d) => {
        const base = d.name || '';
        if (base.length <= 10) return base;
        return base.slice(0, 9) + '…';
      });

    // Force-simulatie
    const simulation = d3
      .forceSimulation(nodes)
      .force('center', d3.forceCenter(0, 0))
      .force('x', d3.forceX(0).strength(0.05))   // ✔️ terugtrekkracht naar midden (x)
      .force('y', d3.forceY(0).strength(0.05))   // ✔️ terugtrekkracht naar midden (y)
      .force('charge', d3.forceManyBody().strength(5))
      .force('collision', d3.forceCollide().radius((d) => d.r + 10))
      .on('tick', () => {
        nodeG.attr('transform', (d) => `translate(${d.x},${d.y})`);
      });

    // Drag gedrag
    nodeG.call(
      d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          d.fx = null;
          d.fy = null;

          // ✔️ "herstart" zodat nodes weer naar het midden gaan
          if (!event.active)
            simulation.alphaTarget(0).alpha(0.3).restart();
        })
    );

    cleanup = () => {
      simulation.stop();
      svg.selectAll('*').remove();
    };
  }

  onMount(() => {
    draw();
    return () => cleanup();
  });

  $: data && data.length && draw();
</script>

<svg bind:this={svgEl} class="steamBubbleGalaxy" role="img" aria-label="Steam speelgedrag bubbelvisualisatie"></svg>

<style>
  .steamBubbleGalaxy {
    max-width: 100%;
    display: block;
    background: radial-gradient(circle at top, #1b2838 0%, #0b1015 60%, #050608 100%);
    border-radius: 1rem;
    border: 1px solid #2a475e;
  }
</style>
