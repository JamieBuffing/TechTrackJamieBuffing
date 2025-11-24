<!-- srs/lib/components/slide8.1 -->
<script>
  export let data = [];
  export let currency = 'EUR';

  function formatCurrency(amount) {
    return `${amount.toFixed(2)} ${currency}`;
  }
</script>

<div class="genres">
    {#each data as g}
    <div class="row">
        <div class="left">
        <div class="genre">{g.genre}</div>
        <div class="meta">
            {g.count} game{g.count === 1 ? '' : 's'} •
            {formatCurrency(g.value)} • {g.percentage}%
        </div>
        </div>
        <div class="bar-wrap">
        <div class="bar" style={`width: ${g.percentage}%;`}></div>
        </div>
    </div>
    {/each}
</div>

<style>
  .genres {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .row {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 4fr);
    gap: 0.75rem;
    align-items: center;
  }

  .left {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .genre {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1b2838;
  }

  .meta {
    font-size: 0.8rem;
    color: #1b2838;
  }

  .bar-wrap {
    background: #1b2838;
    border-radius: 999px;
    overflow: hidden;
    height: 10px;
  }

  .bar {
    height: 100%;
    background: linear-gradient(90deg, #66c0f4, #1b9fff);
    transition: width 0.4s ease;
  }
</style>
