<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<p>Test</p>

<script>
  import * as d3 from 'd3';

  let data = [100,99.827,99.62,99.486,100.328,100.691,99.658,98.404,100.148,101.348,100.024,99.833,100.549,100.373,101.822,100.909,100.183,101.306,102.949,103.221,102.019,101.543,100.747,99.821,98.874,98.797,98.589,100.41,101.232,101.661,100.632,100.413,102.262,100.661,101.422,101.641,101.871,100.618,101.01,99.923,97.99,98.612,98.219,98.157,98.631,99.824,99.402,99.29,100.607,100.261,100.674,99.834,98.489,97.729,97.111,97.49,98.266,97.956,98.021,98.266]


  export let width = 640;
  export let height = 400;
  export let marginTop = 20;
  export let marginRight = 20;
  export let marginBottom = 20;
  export let marginLeft = 20;

  // d3-schalen en lijnfunctie
  $: x = d3.scaleLinear([0, data.length - 1], [marginLeft, width - marginRight]);
  $: y = d3.scaleLinear(d3.extent(data), [height - marginBottom, marginTop]);
  $: line = d3.line((d, i) => x(i), y);
</script>

<svg width={width} height={height}>
  <path fill="none" stroke="currentColor" stroke-width="1.5" d={line(data)} />
  <g fill="white" stroke="currentColor" stroke-width="1.5">
    {#each data as d, i}
      <circle cx={x(i)} cy={y(d)} r="2.5" />
    {/each}
  </g>
</svg>