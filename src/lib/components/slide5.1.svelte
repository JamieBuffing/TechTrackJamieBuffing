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

  // data
  export let data = [];
  export let width = 420;
  export let height = 500;

  let svgEl;
  let cleanup = () => {};

  // Tekent / hertekent de scatterplot
  async function draw() {
    // Vorige render opruimen (svg en tooltip)
    cleanup();

    if (!svgEl || !data || data.length === 0) return;

    const d3 = await loadD3();

    const margin = { top: 40, right: 50, bottom: 60, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgEl)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // SVG leegmaken voor een schone render
    svg.selectAll('*').remove();

    // Hoofd-groep met marges
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxTotalHours = d3.max(data, (d) => d.totalHours) || 1;
    const maxGames = d3.max(data, (d) => d.totalGames) || 1;
    const maxRecentHours = d3.max(data, (d) => d.recentHours) || 1;

    // x-schaal = totale speeltijd
    const xScale = d3
      .scaleLinear()
      .domain([0, maxTotalHours * 1.05])
      .range([0, innerWidth])
      .nice();

    // y-schaal = aantal spellen
    const yScale = d3
      .scaleLinear()
      .domain([0, maxGames * 1.05])
      .range([innerHeight, 0])
      .nice();

    // Straal schaalt met recente speeltijd
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxRecentHours || 1])
      .range([12, 25]); // min / max grootte van de bollen

    // Avatar-afbeeldingen als patterns definiëren
    const defs = svg.append('defs');

    data.forEach((p) => {
      if (!p.avatar) return;

      const r = radiusScale(p.recentHours || 0);

      const pattern = defs
        .append('pattern')
        .attr('id', `avatar${p.steamid}`)
        .attr('patternUnits', 'objectBoundingBox')
        .attr('width', 1)
        .attr('height', 1);

      pattern
        .append('image')
        .attr('href', p.avatar)
        .style('opacity', '0.8')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', r * 2)
        .attr('height', r * 2)
        .attr('preserveAspectRatio', 'xMidYMid slice');
    });

    // Assen
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    g.append('g').call(yAxis);

    // Aslabels
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

    // Tooltip-element buiten de SVG
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

    // Sorteer zodat grote cirkels onderop liggen en kleine erboven
    const sortedData = [...data].sort((a, b) => {
      const ra = radiusScale(a.recentHours || 0);
      const rb = radiusScale(b.recentHours || 0);
      return rb - ra; // grote eerst, kleine laatst → kleine liggen bovenop
    });

    // cirkels tekenen
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
        d.avatar ? `url(#avatar${d.steamid})` : d.isSelf ? '#ff9900' : '#4c6a8a'
      )
      .attr('stroke', (d) => (d.isSelf ? '#ffffff' : '#1b2838'))
      .attr('stroke-width', (d) => (d.isSelf ? 2 : 1))
      // Drag-interactie voor het verslepen van de cirkels
      .call(
        d3
          .drag()
          .on('start', function (event, d) {
            const circle = d3.select(this);

            // Eventuele oude reset-timer annuleren
            if (d._resetTimeout) {
              clearTimeout(d._resetTimeout);
              d._resetTimeout = null;
            }

            circle.raise(); // cirkel tijdens drag bovenop plaatsen
          })
          .on('drag', function (event, d) {
            // Cirkel volgt de muispositie tijdens drag
            d3.select(this)
              .attr('cx', event.x)
              .attr('cy', event.y);

            // Tooltip mee laten bewegen tijdens drag
            tooltip
              .style('opacity', 1)
              .style('left', event.sourceEvent.pageX + 12 + 'px')
              .style('top', event.sourceEvent.pageY - 28 + 'px');
          })
          .on('end', function (event, d) {
            const circle = d3.select(this);

            const targetX = xScale(d.totalHours);
            const targetY = yScale(d.totalGames);

            // Na een korte pauze cirkel terug laten bewegen naar originele positie
            d._resetTimeout = setTimeout(() => {
              circle
                .transition()
                .duration(600)
                .attr('cx', targetX)
                .attr('cy', targetY)
                .on('end', () => {
                  // Na terug-animatie de tekenvolgorde weer herstellen
                  g.selectAll('circle.player')
                    .sort((a, b) => {
                      const ra = radiusScale(a.recentHours || 0);
                      const rb = radiusScale(b.recentHours || 0);
                      // grote eerst, kleine laatst → kleine liggen bovenop
                      return rb - ra;
                    });
                });
            }, 3000);
          })
      )
      // Hover-gedrag voor de tooltip
      .on('mouseenter', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.personaname}</strong><br/>
            Games: ${d.totalGames}<br/>
            Totaal: ${d.totalHours} uur<br/>
            Laatste 2 weken: ${d.recentHours} uur
          `);

        // Tooltip meteen op de juiste plek zetten
        tooltip
          .style('left', event.pageX + 12 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mousemove', function (event) {
        // Tooltip laten volgen zolang de muis boven de cirkel is
        tooltip
          .style('left', event.pageX + 12 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseleave', function () {
        tooltip.style('opacity', 0);
      });

    // Cleanup-functie voor volgende draws / unmount
    cleanup = () => {
      svg.selectAll('*').remove();
      tooltip.remove();
    };
  }

  // Bij mounten de chart tekenen en bij unmount opruimen
  onMount(() => {
    draw();
    return () => cleanup();
  });

  // Opnieuw tekenen wanneer svgEl of data verandert
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
