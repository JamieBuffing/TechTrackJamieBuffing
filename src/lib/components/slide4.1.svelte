<script>
  export let value = 0; // 0 - 100
  export let size = 160;
  export let strokeWidth = 14;
  export let label = '';
  export let sublabel = '';

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  $: clamped = Math.max(0, Math.min(100, value));
  $: offset = circumference - (clamped / 100) * circumference;
</script>

<svg
  class="radial"
  width={size}
  height={size}
  viewBox={`0 0 ${size} ${size}`}
>
  <circle
    class="track"
    cx={size / 2}
    cy={size / 2}
    r={radius}
    stroke-width={strokeWidth}
  />
  <circle
    class="progress"
    cx={size / 2}
    cy={size / 2}
    r={radius}
    stroke-width={strokeWidth}
    stroke-dasharray={circumference}
    stroke-dashoffset={offset}
  />
  <g class="center" transform={`translate(${size / 2}, ${size / 2})`}>
    <text class="value" dy="-0.1em">
      {clamped.toFixed(1)}%
    </text>
    {#if label}
      <text class="label" dy="1.2em">
        {label}
      </text>
    {/if}
    {#if sublabel}
      <text class="sublabel" dy="2.6em">
        {sublabel}
      </text>
    {/if}
  </g>
</svg>

<style>
  .radial {
    display: block;
  }

  .track {
    fill: none;
    stroke: #1b2838;
  }

  .progress {
    fill: none;
    stroke: #66c0f4;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    transition: stroke-dashoffset 0.4s ease;
  }

  .center {
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .value {
    fill: #ffffff;
    font-size: 1.4rem;
    font-weight: 600;
  }

  .label {
    fill: #cccccc;
    font-size: 0.8rem;
  }

  .sublabel {
    fill: #888888;
    font-size: 0.7rem;
  }
</style>