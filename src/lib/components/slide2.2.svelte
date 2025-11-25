<!-- srs/lib/components/slide2.2 -->
<script>
  import { onDestroy, onMount } from 'svelte';

  let d3Promise;

  const loadD3 = () => {
    if (!d3Promise) {
      d3Promise = import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
    }
    return d3Promise;
  };

  export let data = [];

  export let width = 800;
  export let height = 600;

  let margin = { top: 20, right: 20, bottom: 40, left: 40 };

  let svgEl;
  let cleanup = () => {};
  let tooltipEl;

  // Tekent / hertekent de top-games staafdiagram
  async function draw() {
    cleanup();

    const d3 = await loadD3();
    if (!svgEl || !data || data.length === 0) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    // Tooltip wordt aan <body> gehangen zodat hij overal bovenop kan liggen
    const rootSelection = d3.select('body');

    tooltipEl = rootSelection
      .append('div')
      .attr('class', 'tooltip topGamesTooltip')
      .style('position', 'fixed')
      .style('pointer-events', 'none')
      .style('background', 'rgba(0, 0, 0, 0.85)')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('opacity', 0)
      .style('z-index', 10);

    // Minimale hoogte/breedte zodat labels en assen altijd passen
    const minWidth = 300;
    const minHeight = 210;

    const w = Math.max(width, minWidth);
    const h = Math.max(height, minHeight);

    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;

    // X-schaal: uren gespeeld
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 1])
      .nice()
      .range([0, innerWidth]);

    // Y-schaal: band per game-naam
    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerHeight])
      .padding(0.1);

    // Totale uren voor percentage-berekening in tooltip
    const totalHours = d3.sum(data, (d) => d.value) || 0;

    // Kleurschaal per game (discrete kleuren)
    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.name))
      .range(["#1b2838", "#2a475e", "#3b6e8f", "#66c0f4", "#1b9fff"]);

    // SVG basis (viewBox blijft op de opgegeven width/height)
    const root = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('width', '100%')
      .attr('height', '100%');

    // Hoofd-groep met marges
    const g = root
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Y-as: gebruiken we alleen als gridline-generator (labels leeg)
    const yAxis = d3.axisLeft(y).tickSize(-innerWidth).tickFormat('');
    const yAxisG = g.append('g').call(yAxis);

    // Gridlines stylen
    yAxisG
      .selectAll('.tick line')
      .attr('stroke', '#2a475e')
      .attr('stroke-opacity', 0.25);

    // Bovenste horizontale lijn verbergen voor een nettere bovenrand
    yAxisG
      .selectAll('.tick')
      .filter((d, i) => i === 0)
      .select('line')
      .attr('stroke-opacity', 0);

    // Staafjes voor de top-games
    const bars = g
      .append('g')
      .selectAll('.bar')
      .data(data, (d) => d.name)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => y(d.name))
      .attr('width', (d) => x(d.value))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => color(d.name))
      .on('mouseenter', function (event, d) {
        // minuten uit data of afgeleid uit uren
        const totalMinutes =
          d.minutes != null ? d.minutes : Math.round(d.value * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const pct = totalHours
          ? ((d.value / totalHours) * 100).toFixed(1)
          : '0.0';

        tooltipEl
          .style('opacity', 1)
          .html(`
            <strong>${d.name}</strong><br/>
            ${hours} uur ${minutes} min<br/>
            ~${pct}% van speeltijd in deze top 5
          `);
      })
      .on('mousemove', (event) => {
        // Tooltip bij de muispositie plaatsen
        const offset = 12;
        const x = event.clientX + offset;
        const y = event.clientY + offset;

        tooltipEl.style('left', `${x}px`).style('top', `${y}px`);
      })
      .on('mouseleave', () => {
        tooltipEl.style('opacity', 0);
      });

    // 🧾 Labels binnen de balk met afkapping als ze te lang zijn
    g
      .append('g')
      .selectAll('text')
      .data(data, (d) => d.name)
      .join('text')
      .attr('x', 6)
      .attr('y', d => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', 30) // zelfde 30px als in jouw versie
      .attr('fill', '#FFFFFF')
      .style('pointer-events', 'none')
      .each(function (d) {
        const textSel = d3.select(this).text(d.name);
        const maxLabelWidth = Math.max(0, x(d.value) - 12);

        // Als de tekst breder is dan de balk, langzaam inkorten en '…' toevoegen
        if (this.getComputedTextLength() > maxLabelWidth) {
          let shortened = d.name;
          while (shortened.length > 0 && this.getComputedTextLength() > maxLabelWidth) {
            shortened = shortened.slice(0, -1);
            textSel.text(shortened + '…');
          }
        }
      });

    // X-as (uren gespeeld)
    const xAxis = d3.axisBottom(x).ticks(5);
    const xAxisG = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    // Maak de tick labels groter
    xAxisG.selectAll('text')
      .attr('font-size', 18);

    // Label onder de x-as
    xAxisG
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .text('Uren gespeeld');

    // Cleanup-functie om SVG en tooltip op te ruimen
    cleanup = () => {
      svg.selectAll('*').remove();
      if (tooltipEl) {
        tooltipEl.remove();
        tooltipEl = null;
      }
    };
  }

  // Tekenen bij mount
  onMount(draw);
  // Opruimen bij destroy
  onDestroy(() => cleanup());

  // Hertekenen wanneer data verandert
  $: if (data && data.length) {
    draw();
  }
</script>

<svg
  bind:this={svgEl}
  role="img"
  aria-label="Top meest gespeelde games"
  style="width: 100%; height: auto; display: block;"
></svg>
