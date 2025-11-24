<!-- srs/lib/components/slide7.1 -->
<script>
  export let data = [];

  function coverUrl(appid) {
    return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_184x69.jpg`;
  }

  function formatSteamRating(r) {
    if (!r || !r.totalReviews) return 'Geen Steamrating beschikbaar';
    const desc = r.reviewScoreDesc || 'Onbekend';
    const ratio =
      r.positiveRatio != null ? `${r.positiveRatio}% positief` : '';
    const reviews = `${r.totalReviews.toLocaleString()} reviews`;
    return `${desc} • ${ratio} • ${reviews}`;
  }

  function formatHours(h) {
    return `${h.toFixed(1)} u`;
  }
</script>

<div class="gems">
  {#each data as g}
    <article class="gem-card">
      <div class="top-row">
        <img
          class="cover"
          src={coverUrl(g.appid)}
          alt={`Cover van ${g.name}`}
          loading="lazy"
          on:error={(e) => (e.target.style.visibility = 'hidden')}
        />
        <div class="main">
          <h3>{g.name}</h3>
          <div class="meta">
            <span>Jij: {formatHours(g.hours)} gespeeld</span>
            <span class="divider">•</span>
            <span>{formatSteamRating(g.steamRating)}</span>
          </div>

          <div class="gem-score">
            <div class="badge">
              Hidden gem score: <strong>{g.gemScore}/100</strong>
            </div>
          </div>
        </div>
      </div>
    </article>
  {/each}
</div>

<style>
  .gems {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 100%;
  }

  .gem-card {
    background: #171a21;
    border-radius: 0.9rem;
    border: 1px solid #2a475e;
    padding: 0.6rem 0.7rem;
  }

  .top-row {
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
  }

  .cover {
    width: 184px;
    height: 69px;
    object-fit: cover;
    border-radius: 0.4rem;
    flex-shrink: 0;
  }

  .main {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    color: #66c0f4;    
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: #c7d5e0;
  }

  .divider {
    opacity: 0.6;
  }

  .gem-score {
    margin-top: 0.2rem;
    font-size: 0.85rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    border: 1px solid #66c0f4;
    color: #66c0f4;
    font-size: 0.8rem;
  }

  @media (max-width: 640px) {
    .top-row {
      flex-direction: column;
    }

    .cover {
      width: 100%;
      height: auto;
    }
  }
</style>
