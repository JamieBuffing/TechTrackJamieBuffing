<!-- srs/lib/components/slide6.1 -->
<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  // Bewaar D3-module in een gedeelde Promise zodat hij maar één keer geladen wordt
  let d3Promise;

  const loadD3 = () => {
    if (!d3Promise) {
      d3Promise = import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
    }
    return d3Promise;
  };

  // Data voor achievements van de geselecteerde game 
  export let achData = null;
  export let selectedGameName = '';
  export let games = [];
  export let selectedAppId = '';

  // Referentie naar de SVG in de template
  let svgEl;

  // Bij mounten in de browser D3 laden en de chart tekenen als er data is
  onMount(async () => {
    if (browser) {
      await loadD3();
      if (achData) {
        await renderChart();
      }
    }
  });

  // Herteken chart wanneer data of SVG-ref verandert en we in de browser zitten
  $: if (browser && svgEl && achData) {
    renderChart();
  }

  // Tekent / hertekent de achievements-tijdlijn
  async function renderChart() {
    if (!browser || !svgEl || !achData) return;

    const d3 = await loadD3();

    // Filter alleen achievements die gehaald zijn én een unlock-tijd hebben
    // en converteer naar Date-object, gesorteerd op datum
    const unlocked = achData.achievements
      .filter((a) => a.achieved && a.unlocktime)
      .map((a) => ({
        ...a,
        date: new Date(a.unlocktime * 1000)
      }))
      .sort((a, b) => a.date - b.date);

    // Afmetingen bepalen op basis van de container-breedte
    const container = svgEl.parentElement;
    const margin = { top: 40, right: 40, bottom: 40, left: 30 };
    const fullWidth = container?.clientWidth || 900;
    const width = fullWidth - margin.left - margin.right;

    // Hoogte begrenzen: bij veel achievements komen rijen dichter op elkaar
    const minHeight = 220;      // minimum hoogte bij weinig achievements
    const maxHeight = 480;      // maximum hoogte van de chart
    const rowHeight = 24;       // gewenste hoogte per achievement
    const idealHeight = unlocked.length * rowHeight;

    // Hoogte clampen tussen min en max -> y.bandwidth wordt kleiner bij veel rijen
    const height = Math.min(maxHeight, Math.max(minHeight, idealHeight));

    // SVG-basis instellen
    const svg = d3
      .select(svgEl)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    // Oude inhoud weggooien voor een schone redraw
    svg.selectAll('*').remove();

    // Als er geen achievements met datum zijn, toon een tekstmelding en stop
    if (!unlocked.length) {
      const gEmpty = svg
        .append('g')
        .attr(
          'transform',
          `translate(${margin.left},${margin.top + height / 2})`
        );

      gEmpty
        .append('text')
        .attr('class', 'emptyText')
        .text('Geen achievements met een unlock-datum gevonden.')
        .attr('x', 0)
        .attr('y', 0);

      return;
    }

    // Hoofd-groep met marges
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X-schaal: tijd (unlock-datum)
    const x = d3
      .scaleTime()
      .domain(d3.extent(unlocked, (d) => d.date))
      .range([0, width])
      .nice();

    // Y-schaal: één rij per achievement (op naam)
    const y = d3
      .scaleBand()
      .domain(unlocked.map((d) => d.displayName))
      .range([0, height])
      .padding(0.2);

    // Kleur op basis van datum (vroeg -> laat)
    const color = d3
      .scaleSequential(d3.interpolateCool)
      .domain(d3.extent(unlocked, (d) => d.date));

    const xAxis = d3.axisBottom(x).ticks(5);

    // X-as onderaan de chart
    g.append('g')
      .attr('class', 'xAxis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('color', '#c7d5e0');

    // Y-as alleen voor posities (labels worden niet getoond)
    const yAxis = d3.axisLeft(y).tickSize(0);

    g.append('g')
      .attr('class', 'yAxis')
      .call(yAxis)
      .selectAll('text')
      .remove(); // labels verbergen, we gebruiken iconen als y-label

    // Titel boven de chart
    g.append('text')
      .attr('class', 'chartTitle')
      .attr('x', 0)
      .attr('y', -12)
      .attr('fill', '#c7d5e0')
      .text(`Gehaalde achievements voor ${selectedGameName}`);

    // fallback voor gameIcon
    let gameIconUrl = null;
    const game = games.find((g) => String(g.appid) === String(selectedAppId));
    if (game?.img_icon_url) {
      gameIconUrl = `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`;
    }

    // de iconen als y as van de achievements
    const iconSize = Math.min(24, y.bandwidth());

    const iconGroup = g
      .selectAll('.achievementsIcon')
      .data(unlocked, (d) => d.apiName);

    const iconEnter = iconGroup
      .enter()
      .append('image')
      .attr('class', 'achievementsIcon')
      .attr('href', (d) => d.icon || gameIconUrl || '')
      .attr('x', -iconSize - 8)
      .attr('y', (d) => y(d.displayName) + (y.bandwidth() - iconSize) / 2)
      .attr('width', iconSize)
      .attr('height', iconSize);

    // Tooltip met naam van de achievement
    iconEnter.append('title').text((d) => d.displayName);

    // de punten op de tijdlijn
    const nodes = g
      .selectAll('.achievementsNode')
      .data(unlocked, (d) => d.apiName);

    const nodesEnter = nodes
      .enter()
      .append('circle')
      .attr('class', 'achievementsNode')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.displayName) + y.bandwidth() / 2)
      .attr('r', 0) // start vanaf 0 voor een kleine animatie
      .attr('fill', (d) => color(d.date))
      .attr('opacity', 0.9);

    // Animatie: cirkels groeien in
    nodesEnter
      .transition()
      .duration(600)
      .attr('r', Math.min(10, y.bandwidth() / 2));

    // Tooltip met datum + beschrijving
    nodesEnter.append('title').text((d) => {
      const dateStr = d.date.toLocaleDateString();
      return `${d.displayName}
Gehaald op: ${dateStr}
${d.description || ''}`;
    });
  }
</script>

<!-- SVG waarin de D3-chart getekend wordt -->
<svg bind:this={svgEl}></svg>

<style>
  svg {
    width: 100%;
    max-width: 100%;
    display: block;
  }
</style>
