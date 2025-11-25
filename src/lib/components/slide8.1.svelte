<!-- srs/lib/components/slide8.1 -->
<script>
  // Data: lijst met genres en bijbehorende waarden
  export let data = [];
  // Valuta voor de weergave (bijv. 'EUR', 'USD')
  export let currency = 'EUR';

  // Formatteert een getal als bedrag met 2 decimalen + valuta
  function formatCurrency(amount) {
    return `${amount.toFixed(2)} ${currency}`;
  }
</script>

<!-- Genre-overzicht met aantallen, totale waarde en percentage -->
<div class="genres">
  {#each data as g}
    <div class="row">
      <!-- Linkerkant: tekstuele info -->
      <div class="left">
        <div class="genre">{g.genre}</div>
        <div class="gegevens">
          {g.count} game{g.count === 1 ? '' : 's'} •
          {formatCurrency(g.value)} • {g.percentage}%
        </div>
      </div>

      <!-- Rechterkant: horizontale balk met breedte op basis van percentage -->
      <div class="barWrap">
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

  .gegevens {
    font-size: 0.8rem;
    color: #1b2838;
  }

  .barWrap {
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
