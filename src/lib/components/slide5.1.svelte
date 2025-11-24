<!-- srs/lib/components/slide5.1 -->
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

  let svgEl;
  let cleanup = () => {};

  async function draw() {
    // vorige render opruimen
    cleanup();

    if (!svgEl || !data || data.length === 0) return;

    const d3 = await loadD3();

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgEl)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // alles leegmaken in de svg voor een schone render
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxTotalHours = d3.max(data, (d) => d.totalHours) || 1;
    const maxGames = d3.max(data, (d) => d.totalGames) || 1;
    const maxRecentHours = d3.max(data, (d) => d.recentHours) || 1;

    // x = totale speeltijd
    const xScale = d3
      .scaleLinear()
      .domain([0, maxTotalHours * 1.05])
      .range([0, innerWidth])
      .nice();

    // y = aantal spellen
    const yScale = d3
      .scaleLinear()
      .domain([0, maxGames * 1.05])
      .range([innerHeight, 0])
      .nice();

    // 🔹 radius schaalt met recente speeltijd
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxRecentHours || 1])
      .range([12, 38]); // min / max grootte van de bollen

    // 🔹 defs met avatar-patterns (met grootte gebaseerd op radius)
    const defs = svg.append('defs');

    data.forEach((p) => {
      if (!p.avatar) return;

      const r = radiusScale(p.recentHours || 0);

      const pattern = defs
        .append('pattern')
        .attr('id', `avatar-${p.steamid}`)
        .attr('patternUnits', 'objectBoundingBox')
        .attr('width', 1)
        .attr('height', 1);

      pattern
        .append('image')
        .attr('href', p.avatar)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', r * 2)
        .attr('height', r * 2)
        .attr('preserveAspectRatio', 'xMidYMid slice');
    });

    // assen
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    g.append('g').call(yAxis);

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1b2838')
      .attr('font-size', 12)
      .text('Totale gespeelde uren');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1b2838')
      .attr('font-size', 12)
      .text('Aantal spellen');

    // tooltip
    const tooltip = d3
      .select(svgEl.parentNode)
      .append('div')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'rgba(0,0,0,0.85)')
      .style('color', '#fff')
      .style('padding', '6px 10px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('opacity', 0);

    // 🔹 Sorteer zodat grote cirkels onder komen, kleine bovenop
    const sortedData = [...data].sort((a, b) => {
      const ra = radiusScale(a.recentHours || 0);
      const rb = radiusScale(b.recentHours || 0);
      return rb - ra; // grote eerst, kleine laatst → kleine liggen bovenop
    });

    // scatter circles
    const circles = g
      .selectAll('circle.player')
      .data(sortedData, (d) => d.steamid);

    circles
      .enter()
      .append('circle')
      .attr('class', 'player')
      .attr('cx', (d) => xScale(d.totalHours))
      .attr('cy', (d) => yScale(d.totalGames))
      .attr('r', (d) => radiusScale(d.recentHours || 0))
      .attr('fill', (d) =>
        d.avatar ? `url(#avatar-${d.steamid})` : d.isSelf ? '#ff9900' : '#4c6a8a'
      )
      .attr('stroke', (d) => (d.isSelf ? '#ffffff' : '#1b2838'))
      .attr('stroke-width', (d) => (d.isSelf ? 2 : 1))
      .on('mouseenter', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.personaname}</strong><br/>
            Games: ${d.totalGames}<br/>
            Totaal: ${d.totalHours} uur<br/>
            Laatste 2 weken: ${d.recentHours} uur
          `);
      })
      .on('mousemove', function (event) {
        tooltip
          .style('left', event.pageX + 12 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseleave', function () {
        tooltip.style('opacity', 0);
      });

    // cleanup functie voor volgende draws / unmount
    cleanup = () => {
      svg.selectAll('*').remove();
      tooltip.remove();
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

<svg
  bind:this={svgEl}
  role="img"
  aria-label="Vergelijking met vrienden"
  style="width: 100%; height: auto; display: block;"
></svg>
