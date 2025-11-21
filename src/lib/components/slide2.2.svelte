<script>
  import { onMount } from 'svelte';

  let d3Promise;

  const loadD3 = () => {
    if (!d3Promise) {
      d3Promise = import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
    }

    return d3Promise;
  };

  export let data = [];
  export let width = 700;
  export let height = 400;
  export let margin = { top: 20, right: 20, bottom: 40, left: 180 };

  let svgEl;
  let cleanup = () => {};

  async function draw() {
    if (!svgEl || !data || data.length === 0) return;

    const d3 = await loadD3();

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([0, innerWidth]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerHeight])
      .padding(0.1);

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // bars
    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', 0)
      .attr('y', (d) => y(d.name))
      .attr('width', (d) => x(d.value))
      .attr('height', y.bandwidth())
      .attr('fill', '#66c0f4');

    // value labels
    g.selectAll('text.label')
      .data(data)
      .join('text')
      .attr('class', 'label')
      .attr('x', (d) => x(d.value) + 4)
      .attr('y', (d) => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', 10)
      .text((d) => `${d.value.toFixed(1)} u`);

    // y-as (games)
    g.append('g').call(d3.axisLeft(y));

    // x-as (uren)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 32)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Uren gespeeld');

    cleanup = () => {
      svg.selectAll('*').remove();
    };
  }

  onMount(draw);
  onDestroy(() => cleanup());

  $: if (data && data.length) {
    draw();
  }
</script>

<svg bind:this={svgEl} role="img" aria-label="Top 10 meest gespeelde games"></svg>
