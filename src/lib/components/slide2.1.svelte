<script>
  import { onMount } from 'svelte';    // Importeer de functies die svelte gebruikt

  let d3Promise;

  const loadD3 = () => {
    if (!d3Promise) {
      d3Promise = import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
    }

    return d3Promise;
  };

  export let data = [];   // Sla hier de data op en exporteer deze zodat het zichtbaar is voor andere bestanden

  export let width = 480;   // Exporteer de breedte
  export let height = 480;    // Exporteer de hoogte
  export let innerRadius = Math.min(width, height) / 3;   // Exporteer de radius van de binnenkant
  export let outerRadius = Math.min(width, height) / 2;   // Exporteer de radius van de buitenkant
  export let padAngle = Math.PI / 180;    // Exporteer de heok die hij aanhoud

  let svgEl;
  let cleanup = () => {};

  async function draw() {
    if (!svgEl) return;

    const d3 = await loadD3();

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    if (!data || data.length === 0) {
      // als er geen data is, laten we het svg gewoon leeg
      return;
    }

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.name))
      .range(d3.schemeCategory10);

    const pie = d3
      .pie()
      .padAngle(padAngle)
      .sort(null)
      .value((d) => d.value);

    const arcs = pie(data);

    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    svg
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('width', width)
      .attr('height', height);

    svg
      .append('g')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', (d) => color(d.data.name))
      .attr('d', arc)
      .append('title')
      .text((d) => `${d.data.name}: ${d.data.value}`);

    svg
      .append('g')
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(arcs)
      .join('text')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`)
      .attr('dy', '0.35em')
      .text((d) => `${d.data.name} ${d.data.value}`);

    cleanup = () => {
      svg.selectAll('*').remove();
    };
  }

  onMount(() => {
    draw();
    return () => cleanup();
  });

  // redraw bij wijzigingen in props
  $: if (svgEl) {
    draw();
  }
</script>

<svg bind:this={svgEl} role="img" aria-label="Donut chart"></svg>
