<!-- src/lib/components/slide3.1 -->
<script>
  // data: [{ genre, hours, percentage, games: [{ name, hours }] }]
  export let data = [];

  function getIcon(genre) {
    const g = (genre || '').toLowerCase();

    if (g.includes('rpg')) return '🧙‍♂️';
    if (g.includes('action')) return '⚔️';
    if (g.includes('adventure')) return '🗺️';
    if (g.includes('strategy')) return '♟️';
    if (g.includes('simulation')) return '🛠️';
    if (g.includes('sports')) return '🏅';
    if (g.includes('racing')) return '🏎️';
    if (g.includes('horror')) return '👻';
    if (g.includes('casual')) return '☕';
    if (g.includes('indie')) return '🌟';
    if (g.includes('multiplayer')) return '👥';
    if (g.includes('shooter')) return '🔫';
    if (g.includes('survival')) return '🔥';
    if (g.includes('puzzle')) return '🧩';

    return '🎲';
  }

  function formatHours(h) {
    return `${h.toFixed(1)} u`;
  }
</script>

<div class="genres">
  {#each data as g}
    <div class="genre-row">
      <div class="left">
        <div class="icon">{getIcon(g.genre)}</div>
        <div class="text">
          <div class="genre-name">{g.genre}</div>
          <div class="meta">
            {formatHours(g.hours)} • {g.percentage}%
          </div>
        </div>
      </div>

      <div class="bar-wrap">
        <div class="bar" style={`width: ${g.percentage}%;`}></div>
      </div>

      <!-- Tooltip met games binnen deze categorie -->
      {#if g.games && g.games.length}
        <div class="tooltip">
          <div class="tooltip-title">Games in {g.genre}</div>
          <ul>
            {#each g.games as game}
              <li>
                <span class="game-name">{game.name}</span>
                <span class="game-hours">{formatHours(game.hours)}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .genres {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    position: relative;
  }

  .genre-row {
    /* position: relative; */
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 4fr);
    gap: 0.75rem;
    align-items: center;
    padding: 0.4rem 0.5rem;
    border-radius: 0.6rem;
    background: #171a21;
    border: 1px solid transparent;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.1s ease;
  }

  .genre-row:hover {
    border-color: #66c0f4;
    background: #171a21;
    transform: translateY(-1px);
  }

  .left {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    min-width: 0;
  }

  .icon {
    font-size: 1.4rem;
    flex-shrink: 0;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .genre-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: #c7d5e0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .meta {
    font-size: 0.8rem;
    color: #c7d5e0;
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

  .tooltip {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    margin-top: 0.25rem;
    background: #0b1015;
    border-radius: 0.6rem;
    border: 1px solid #2a475e;
    padding: 0.6rem 0.75rem;
    font-size: 0.8rem;
    color: #c7d5e0;
    opacity: 0;
    pointer-events: none;
    transform: translateY(4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
    z-index: 20;
  }

  .tooltip-title {
    font-weight: 500;
    margin-bottom: 0.2rem;
  }

  .tooltip ul {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
  }

  .tooltip li {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.05rem 0;
  }

  .game-name {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .game-hours {
    flex-shrink: 0;
    white-space: nowrap;
    color: #66c0f4;
  }

  .genre-row:hover .tooltip {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    .genre-row {
      grid-template-columns: 1fr;
    }
  }
</style>
