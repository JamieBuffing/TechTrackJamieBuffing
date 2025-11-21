<script>
  import { onMount } from 'svelte';

  let d3Promise;

  const loadD3 = () => {
    if (!d3Promise) {
      d3Promise = import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
    }

    return d3Promise;
  };

  // data: [{ steamid, personaname, avatar, totalGames, totalHours, recentHours, isSelf }]
  export let data = [];
  export let width = 700;
  export let height = 420;
  export let margin = { top: 30, right: 20, bottom: 40, left: 50 };
  

  let svgEl;
  let cleanup = () => {};

  async function draw() {
    if (!svgEl || !data || data.length === 0) return;

    const d3 = await loadD3();

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const maxGames = d3.max(data, (d) => d.totalGames) || 0;
    const maxHours = d3.max(data, (d) => d.totalHours) || 0;
    const maxRecent = d3.max(data, (d) => d.recentHours) || 0;

    const x = d3
      .scaleLinear()
      .domain([0, maxGames * 1.05])
      .nice()
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, maxHours * 1.05])
      .nice()
      .range([innerHeight, 0]);

    const color = d3
      .scaleOrdinal()
      .range([
        '#171a21',
        '#1b2838',
        '#2a475e'
      ]);
    
    const r = d3
      .scaleSqrt()
      .domain([0, maxRecent || 1])
      .range([4, 22]);

    const root = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = root
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // assen
    const xAxis = d3.axisBottom(x).ticks(6);
    const yAxis = d3.axisLeft(y).ticks(6);
    
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 32)
      .attr('font-size', 20)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Aantal games');

    g.append('g')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('font-size', 20)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Totale uren');

    
    // Data gesorteerd op speeltijd recent
    const sortedData = [...data].sort(
      (a, b) => r(b.recentHours) - r(a.recentHours)
    );

    // punten
    const points = g
      .append('g')
      .selectAll('circle')
      .data(sortedData)
      .join('circle')
      .attr('cx', (d) => x(d.totalGames))
      .attr('cy', (d) => y(d.totalHours))
      .attr('r', (d) => r(d.recentHours))
      .attr('fill', (d, i) => d.isSelf ? '#66c0f4' : color(i))
      .attr('opacity', 0.9)
      .attr('stroke', (d) => (d.isSelf ? '#ffffff' : '#383838'))
      .attr('stroke-width', (d) => (d.isSelf ? 2 : 0));

    // tooltips via <title>
    points
      .append('title')
      .text(
        (d) =>
          `${d.personaname}\nGames: ${d.totalGames}\nTotale uren: ${d.totalHours}\nRecent: ${d.recentHours} u`
    );

    // simpele legenda
    const legend = root.append('g').attr(
      'transform',
      `translate(${margin.left}, 10)`
    );

    const legendItems = [
      { label: 'Jij', type: 'self' },
      { label: 'Vriend', type: 'friend' }
    ];

    legendItems.forEach((item, i) => {
      const gItem = legend
        .append('g')
        .attr('transform', `translate(${i * 120}, 0)`);

      gItem
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 6)
        .attr('fill', item.type === 'self' ? '#66c0f4' : color(i))
        .attr('stroke', item.type === 'self' ? '#ffffff' : '#383838')
        .attr('stroke-width', item.type === 'self' ? 2 : 0);

      gItem
        .append('text')
        .attr('x', 10)
        .attr('y', 4)
        .attr('font-size', 20)
        .text(item.label);
    });

    cleanup = () => {
      svg.selectAll('*').remove();
    };
  }

  onMount(() => {
    draw();
    return () => cleanup();
  });

  $: if (svgEl && data) {
    draw();
  }
</script>

<!-- <svg bind:this={svgEl} role="img" aria-label="Vergelijking met vrienden"></svg> -->
<svg bind:this={svgEl} role="img" aria-label="Vergelijking met vrienden" style="width: 100%; height: auto; display: block;"></svg>