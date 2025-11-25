<!-- srs/lib/components/slide2.1 -->
<script>
  import { onMount } from 'svelte'; // Lifecycle-hook om te tekenen zodra het component gemount is

  let d3Promise;
  const loadD3 = () => {
    if (!d3Promise) {
      d3Promise = import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
    }
    return d3Promise;
  };

  export let data = [];

  // Basisinstellingen voor grootte en vorm van de donut
  export let width = 500;
  export let height = 500;
  export let innerRadius = Math.min(width, height) / 3.5; // binnenste radius (gat in de donut)
  export let outerRadius = Math.min(width, height) / 2.2; // buitenste radius
  export let padAngle = 0.02; // ruimte tussen de segmenten

  let svgEl;
  let cleanup = () => {};

  // Tekent / hertekent de donut-chart
  async function draw() {
    // Vorige render opruimen (svg + tooltip)
    cleanup();

    const d3 = await loadD3();

    if (!svgEl || !data || data.length === 0) {
      return;
    }

    const total = d3.sum(data, d => d.value);

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    // Tooltip-element aan <body> hangen, zodat hij boven alles kan zweven
    const tooltipEl = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'fixed')
      .style('pointer-events', 'none')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('opacity', 0)
      .style('z-index', 10);

    // Kleurenschaal per segment
    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.name))
      .range(["#1b2838", "#2a475e", "#3b6e8f", "#66c0f4", "#1b9fff"]);

    // Pie-layout voor de donut
    const pie = d3
      .pie()
      .padAngle(padAngle)
      .sort(null)
      .value((d) => d.value);

    const arcs = pie(data);

    // Arc-generator voor binnen- en buitenradius
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    // SVG centreren met een viewBox rond (0,0)
    svg
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Tooltip helpers (gedeeld door slices en labels)
    function showTooltip(event, d) {
      const pct = total
        ? ((d.data.value / total) * 100)
            .toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        : '0,0';

      tooltipEl
        .style('opacity', 1)
        .html(`
          <strong>${d.data.name}</strong><br/>
          ${d.data.value} uur<br/>
          ~${pct}% van deze donut
        `);

      moveTooltip(event);
    }

    function moveTooltip(event) {
      const offset = 12;
      const x = event.clientX + offset;
      const y = event.clientY + offset;

      tooltipEl
        .style('left', `${x}px`)
        .style('top', `${y}px`);
    }

    function hideTooltip() {
      tooltipEl.style('opacity', 0);
    }

    // Donut-segmenten tekenen
    const paths = svg
      .append('g')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', (d) => color(d.data.name))
      .attr('d', arc)
      .on('mouseenter', function (event, d) {
        showTooltip(event, d);
        d3.select(this)
          .transition()
          .duration(150)
          .attr('transform', 'scale(0.95)');
      })
      .on('mousemove', function (event) {
        moveTooltip(event);
      })
      .on('mouseleave', function () {
        hideTooltip();
        d3.select(this)
          .transition()
          .duration(150)
          .attr('transform', 'scale(1)');
      });

    // Labels in de donut; tekst wordt ingekort als het niet past
    const padding = 6;
    const maxTextWidth = outerRadius - innerRadius - padding;

    const labels = svg.append('g')
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .selectAll('text')
      .data(arcs)
      .join('text')
      .each(function (d) {
        const [x, y] = arc.centroid(d);
        const angle = ((d.startAngle + d.endAngle) / 2) * 180 / Math.PI;

        let label = d.data.name;

        const textSel = d3.select(this)
          .attr('transform', `translate(${x},${y}) rotate(${angle})`)
          .attr('dy', '0.35em')
          .text(label);

        // Tekst inkorten tot hij in de beschikbare boogbreedte past
        if (this.getComputedTextLength() > maxTextWidth) {
          let shortened = label;
          while (shortened.length > 0 && this.getComputedTextLength() > maxTextWidth) {
            shortened = shortened.slice(0, -1);
            textSel.text(shortened + '…');
          }
        }
      });

    // Cleanup-functie om SVG en tooltip op te ruimen bij volgende draw/unmount
    cleanup = () => {
      svg.selectAll('*').remove();
      tooltipEl.remove();
    };
  }

  // Tekenen bij mount + opruimen bij unmount
  onMount(() => {
    draw();
    return () => cleanup();
  });

  // Opnieuw tekenen wanneer props wijzigen
  $: if (svgEl) {
    draw();
  }
</script>

<svg
  bind:this={svgEl}
  role="img"
  aria-label="Donut chart"
  style="width: 100%; height: auto; display: block;"
></svg>
