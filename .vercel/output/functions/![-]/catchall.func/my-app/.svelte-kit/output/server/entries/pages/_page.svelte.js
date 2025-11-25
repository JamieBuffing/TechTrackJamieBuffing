import { y as ensure_array_like, z as attr_class, F as stringify, x as attr, G as bind_props, J as attr_style } from "../../chunks/index2.js";
import { j as fallback } from "../../chunks/utils2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { a as ssr_context, e as escape_html } from "../../chunks/context.js";
import "d3";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
let activeSteamId = null;
const store = /* @__PURE__ */ new Map();
function setActiveSteamId(steamId) {
  if (!steamId || steamId === activeSteamId) return;
  activeSteamId = steamId;
  store.clear();
}
const presetSteamIds = [
  { label: "JamieB2005", id: "76561198413110180" },
  { label: "dwinkels0326", id: "76561199024514310" },
  { label: "JasperW", id: "76561199011746777" },
  { label: "Jessev10", id: "76561198322036477" },
  { label: "Jeremy", id: "76561198134778664" },
  { label: "Jerry van Rijsbergen", id: "76561198316063960" },
  { label: "Hennie", id: "76561198079219992" },
  { label: "Than", id: "76561198099044122" },
  { label: "David", id: "76561198863013731" },
  { label: "James", id: "76561198873928636" }
];
function Slide1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let steamId = fallback(
      $$props["steamId"],
      ""
      // Hier komt het gekozen steamid in
    );
    let loadingProfile = false;
    $$renderer2.push(`<div class="slide1 svelte-4fbrl2"><h1 class="svelte-4fbrl2">Welkom bij jouw Steam Story</h1> <p>Login met je Steam account of kies één van de preset accounts om
    door te gaan.</p> `);
    if (steamId) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="panel login-panel svelte-4fbrl2"><h2>Welkom!</h2> <p class="hint svelte-4fbrl2">Je bent ingelogd met SteamID: <strong>${escape_html(steamId)}</strong></p> <button class="btn steam svelte-4fbrl2" type="button">Log uit</button></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="panel login-panel svelte-4fbrl2"><h2>Login met Steam</h2> <button class="btn steam svelte-4fbrl2" type="button">Login met Steam</button> <p class="hint svelte-4fbrl2">Na inloggen word je teruggestuurd en wordt jouw SteamID gebruikt.</p></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="panel presets-panel svelte-4fbrl2"><h2>Of kies een preset account</h2> <div class="preset-list svelte-4fbrl2"><!--[-->`);
    const each_array = ensure_array_like(presetSteamIds);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let p = each_array[$$index];
      $$renderer2.push(`<button type="button"${attr_class(`preset ${stringify(steamId === p.id ? "active" : "")}`, "svelte-4fbrl2")}>${escape_html(p.label)}</button>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="start-panel svelte-4fbrl2"><button type="button" class="btn start svelte-4fbrl2"${attr("disabled", !steamId || loadingProfile, true)}>`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`Start je story`);
    }
    $$renderer2.push(`<!--]--></button> `);
    if (!steamId) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="hint svelte-4fbrl2">Kies eerst een account of login met Steam.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, { steamId });
  });
}
function Slide2_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => [], true);
    let width = fallback(
      $$props["width"],
      480
      // Exporteer de breedte
    );
    let height = fallback(
      $$props["height"],
      480
      // Exporteer de hoogte
    );
    let innerRadius = fallback($$props["innerRadius"], () => Math.min(width, height) / 3, true);
    let outerRadius = fallback($$props["outerRadius"], () => Math.min(width, height) / 2, true);
    let padAngle = fallback($$props["padAngle"], () => Math.PI / 180, true);
    let cleanup = () => {
    };
    onDestroy(() => cleanup());
    $$renderer2.push(`<svg role="img" aria-label="Donut chart"></svg>`);
    bind_props($$props, { data, width, height, innerRadius, outerRadius, padAngle });
  });
}
function Slide2_2($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => [], true);
    let width = fallback($$props["width"], 700);
    let height = fallback($$props["height"], 400);
    let margin = fallback($$props["margin"], () => ({ top: 20, right: 20, bottom: 40, left: 180 }), true);
    let cleanup = () => {
    };
    onDestroy(() => cleanup());
    if (data && data.length) ;
    $$renderer2.push(`<svg role="img" aria-label="Top 10 meest gespeelde games"></svg>`);
    bind_props($$props, { data, width, height, margin });
  });
}
function Slide2($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let steamId = fallback(
      $$props["steamId"],
      ""
      // Hier komt het gekozen steamid in
    );
    let topGames = [];
    $$renderer2.push(`<div class="slide2 svelte-1kex0ox"><h2>Top 5 meest gespeelde games</h2>  `);
    if (!steamId) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
          if (topGames.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p>Geen games gevonden voor dit account.</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<div class="charts svelte-1kex0ox"><div class="chart-block svelte-1kex0ox"><h3>Speeltijd per game (uren)</h3> `);
            Slide2_2($$renderer2, { data: topGames });
            $$renderer2.push(`<!----></div> <div class="chart-block svelte-1kex0ox"><h3>Verdeling speeltijd (donut)</h3> `);
            Slide2_1($$renderer2, { data: topGames, width: 360, height: 360 });
            $$renderer2.push(`<!----></div></div>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { steamId });
  });
}
function Slide3_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => [], true);
    function getIcon(genre) {
      const g = (genre || "").toLowerCase();
      if (g.includes("rpg")) return "🧙‍♂️";
      if (g.includes("action")) return "⚔️";
      if (g.includes("adventure")) return "🗺️";
      if (g.includes("strategy")) return "♟️";
      if (g.includes("simulation")) return "🛠️";
      if (g.includes("sports")) return "🏅";
      if (g.includes("racing")) return "🏎️";
      if (g.includes("horror")) return "👻";
      if (g.includes("casual")) return "☕";
      if (g.includes("indie")) return "🌟";
      if (g.includes("multiplayer")) return "👥";
      if (g.includes("shooter")) return "🔫";
      if (g.includes("survival")) return "🔥";
      if (g.includes("puzzle")) return "🧩";
      return "🎲";
    }
    function formatHours(h) {
      return `${h.toFixed(1)} u`;
    }
    $$renderer2.push(`<div class="genres svelte-368tgl"><!--[-->`);
    const each_array = ensure_array_like(data);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let g = each_array[$$index_1];
      $$renderer2.push(`<div class="genre-row svelte-368tgl"><div class="left svelte-368tgl"><div class="icon svelte-368tgl">${escape_html(getIcon(g.genre))}</div> <div class="text svelte-368tgl"><div class="genre-name svelte-368tgl">${escape_html(g.genre)}</div> <div class="meta svelte-368tgl">${escape_html(formatHours(g.hours))} • ${escape_html(g.percentage)}%</div></div></div> <div class="bar-wrap svelte-368tgl"><div class="bar svelte-368tgl"${attr_style(`width: ${g.percentage}%;`)}></div></div> `);
      if (g.games && g.games.length) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="tooltip svelte-368tgl"><div class="tooltip-title svelte-368tgl">Games in ${escape_html(g.genre)}</div> <ul class="svelte-368tgl"><!--[-->`);
        const each_array_1 = ensure_array_like(g.games);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let game = each_array_1[$$index];
          $$renderer2.push(`<li class="svelte-368tgl"><span class="game-name svelte-368tgl">${escape_html(game.name)}</span> <span class="game-hours svelte-368tgl">${escape_html(formatHours(game.hours))}</span></li>`);
        }
        $$renderer2.push(`<!--]--></ul></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { data });
  });
}
function Slide3($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let steamId = fallback(
      $$props["steamId"],
      ""
      // Hier komt het gekozen steamid in
    );
    let genres = [];
    $$renderer2.push(`<div class="slide3 svelte-1f10n74"><h2>Genre / categorie verdeling</h2>  `);
    if (!steamId) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
          if (genres.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p>Geen genres/categorieën gevonden.</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<p class="intro svelte-1f10n74">Dit is een overzicht van je belangrijkste genres/categorieën op basis van
      de <strong>voornaamste categorie per game</strong>. Alle speeltijd van een game
      wordt toegewezen aan die hoofdcategorie.
      Hover over een rij om te zien welke games daar allemaal in zitten.</p> `);
            Slide3_1($$renderer2, { data: genres });
            $$renderer2.push(`<!---->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { steamId });
  });
}
function Slide4($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let steamId = fallback($$props["steamId"], "");
    let games = [];
    let selectedAppId = "";
    $$renderer2.push(`<div class="slide4 svelte-6fwm5n"><h2>Achievement progress</h2> `);
    if (!steamId) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="controls svelte-6fwm5n"><label>Kies een game: `);
      $$renderer2.select(
        { value: selectedAppId, class: "" },
        ($$renderer3) => {
          {
            $$renderer3.push("<!--[!-->");
            {
              $$renderer3.push("<!--[!-->");
              if (games.length === 0) {
                $$renderer3.push("<!--[-->");
                $$renderer3.option({ disabled: true }, ($$renderer4) => {
                  $$renderer4.push(`Geen games gevonden`);
                });
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<!--[-->`);
                const each_array = ensure_array_like(games);
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let g = each_array[$$index];
                  $$renderer3.option({ value: String(g.appid) }, ($$renderer4) => {
                    $$renderer4.push(`${escape_html(g.name)}`);
                  });
                }
                $$renderer3.push(`<!--]-->`);
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]-->`);
        },
        "svelte-6fwm5n"
      );
      $$renderer2.push(`</label></div> `);
      {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
          {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<p class="muted svelte-6fwm5n">Kies een game om je achievement-progress te zien.</p>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { steamId });
  });
}
function Slide5_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => [], true);
    let width = fallback($$props["width"], 700);
    let height = fallback($$props["height"], 420);
    let margin = fallback($$props["margin"], () => ({ top: 30, right: 20, bottom: 40, left: 50 }), true);
    let cleanup = () => {
    };
    onDestroy(() => cleanup());
    $$renderer2.push(`<svg role="img" aria-label="Vergelijking met vrienden" style="width: 100%; height: auto; display: block;"></svg>`);
    bind_props($$props, { data, width, height, margin });
  });
}
function Slide5($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let you, friends;
    let steamId = fallback($$props["steamId"], "");
    let players = [];
    you = players && players.find((p) => p.isSelf) ? players.find((p) => p.isSelf) : null;
    friends = players.filter((p) => !p.isSelf);
    $$renderer2.push(`<div class="slide5 svelte-2l0jdm"><h2>Vergelijk jezelf met je vrienden</h2> `);
    if (!steamId) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
          if (players.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p>Geen gegevens gevonden. Heb je misschien geen zichtbare vrienden of
      staan hun profielen op privé?</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<p class="intro svelte-2l0jdm">Elke cirkel is een speler. De horizontale as is het aantal games, de verticale as
      het totaal aantal uren. De grootte van de cirkel laat zien hoeveel iemand
      recent heeft gespeeld.</p> `);
            Slide5_1($$renderer2, { data: players });
            $$renderer2.push(`<!----> <div class="summary svelte-2l0jdm">`);
            if (you) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div class="card svelte-2l0jdm"><h3>Jij</h3> <div class="player-row svelte-2l0jdm">`);
              if (you.avatar) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<img${attr("src", you.avatar)} alt="" class="avatar svelte-2l0jdm"/>`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]--> <div><div class="name svelte-2l0jdm">${escape_html(you.personaname)}</div> <div class="meta svelte-2l0jdm">${escape_html(you.totalGames)} games • ${escape_html(you.totalHours)}u totaal • ${escape_html(you.recentHours)}u recent</div></div></div></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> <div class="card svelte-2l0jdm"><h3>Vrienden (max 20)</h3> `);
            if (friends.length === 0) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<p class="muted svelte-2l0jdm">Geen vrienden met zichtbare gegevens gevonden.</p>`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<ul class="friend-list svelte-2l0jdm"><!--[-->`);
              const each_array = ensure_array_like(friends);
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let f = each_array[$$index];
                $$renderer2.push(`<li class="svelte-2l0jdm">`);
                if (f.avatar) {
                  $$renderer2.push("<!--[-->");
                  $$renderer2.push(`<img${attr("src", f.avatar)} alt="" class="avatar svelte-2l0jdm"/>`);
                } else {
                  $$renderer2.push("<!--[!-->");
                }
                $$renderer2.push(`<!--]--> <div><div class="name svelte-2l0jdm">${escape_html(f.personaname)}</div> <div class="meta svelte-2l0jdm">${escape_html(f.totalGames)} games • ${escape_html(f.totalHours)}u totaal • ${escape_html(f.recentHours)}u recent</div></div></li>`);
              }
              $$renderer2.push(`<!--]--></ul>`);
            }
            $$renderer2.push(`<!--]--></div></div>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { steamId });
  });
}
function Slide6($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let steamId = fallback($$props["steamId"], "");
    let games = [];
    let selectedAppId = "";
    $$renderer2.push(`<div class="slide6 svelte-olcyj9"><h2>Achievement tijdlijn – hoe speel jij ze vrij?</h2> `);
    if (
      // iets breder voor icons
      // X-as onderaan
      // Y-as wordt alleen gebruikt voor de posities, niet voor tekst
      // geen tekstlabels tonen
      // ---- GAME ICON (fallback) ----
      // Probeer game opzoeken + Steam icon URL bouwen op basis van img_icon_url (standaard bij GetOwnedGames)
      // ---- ACHIEVEMENT ICONS ALS Y-LABEL ----
      // achievement-icoon, anders game-icoon als fallback
      // links van de y=0 lijn
      // Tooltip op het icoontje met de NAAM van de achievement
      // ---- ACHIEVEMENT NODES (blijven zoals je had) ----
      // Tooltip van de bolletjes: onveranderd
      !steamId
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="controls svelte-olcyj9"><label class="svelte-olcyj9">Kies je favoriete game: `);
      $$renderer2.select(
        {
          value: selectedAppId,
          disabled: games.length === 0,
          class: ""
        },
        ($$renderer3) => {
          {
            $$renderer3.push("<!--[!-->");
            {
              $$renderer3.push("<!--[!-->");
              if (games.length === 0) {
                $$renderer3.push("<!--[-->");
                $$renderer3.option({ disabled: true }, ($$renderer4) => {
                  $$renderer4.push(`Geen games gevonden`);
                });
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<!--[-->`);
                const each_array = ensure_array_like(games);
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let g = each_array[$$index];
                  $$renderer3.option({ value: String(g.appid) }, ($$renderer4) => {
                    $$renderer4.push(`${escape_html(g.name)}`);
                  });
                }
                $$renderer3.push(`<!--]-->`);
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]-->`);
        },
        "svelte-olcyj9"
      );
      $$renderer2.push(`</label></div> `);
      {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
          {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<p class="hint svelte-olcyj9">Kies een game om je achievement-tijdlijn te zien.</p>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { steamId });
  });
}
function Slide7_1($$renderer, $$props) {
  let data = fallback($$props["data"], () => [], true);
  function coverUrl(appid) {
    return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_184x69.jpg`;
  }
  function formatSteamRating(r) {
    if (!r || !r.totalReviews) return "Geen Steamrating beschikbaar";
    const desc = r.reviewScoreDesc || "Onbekend";
    const ratio = r.positiveRatio != null ? `${r.positiveRatio}% positief` : "";
    const reviews = `${r.totalReviews.toLocaleString()} reviews`;
    return `${desc} • ${ratio} • ${reviews}`;
  }
  function formatHours(h) {
    return `${h.toFixed(1)} u`;
  }
  $$renderer.push(`<div class="gems svelte-a9htlt"><!--[-->`);
  const each_array = ensure_array_like(data);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let g = each_array[$$index];
    $$renderer.push(`<article class="gem-card svelte-a9htlt"><div class="top-row svelte-a9htlt"><img class="cover svelte-a9htlt"${attr("src", coverUrl(g.appid))}${attr("alt", `Cover van ${g.name}`)} loading="lazy"/> <div class="main svelte-a9htlt"><h3 class="svelte-a9htlt">${escape_html(g.name)}</h3> <div class="meta svelte-a9htlt"><span>Jij: ${escape_html(formatHours(g.hours))} gespeeld</span> <span class="divider svelte-a9htlt">•</span> <span>${escape_html(formatSteamRating(g.steamRating))}</span></div> <div class="gem-score svelte-a9htlt"><div class="badge svelte-a9htlt">Hidden gem score: <strong>${escape_html(g.gemScore)}/100</strong></div> <p class="hint svelte-a9htlt">Score gebaseerd op Steam-rating, aantal reviews en hoe weinig je het zelf hebt gespeeld.</p></div></div></div></article>`);
  }
  $$renderer.push(`<!--]--></div>`);
  bind_props($$props, { data });
}
function Slide7($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let steamId = fallback(
      $$props["steamId"],
      ""
      // Hier komt het gekozen steamid in
    );
    let gems = [];
    $$renderer2.push(`<div class="slide7 svelte-ex6odw"><h2>Hidden gems in je library</h2> `);
    if (!steamId) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
          if (gems.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p class="muted svelte-ex6odw">We konden geen hidden gems vinden. Misschien speel je alles al heel uitgebreid,
      of zijn er weinig games met voldoende reviews.</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<p class="intro svelte-ex6odw">Dit zijn games die jij relatief weinig hebt gespeeld, maar op Steam een sterke
      beoordeling en/of veel positieve reviews hebben. Hun <strong>hidden gem score</strong> combineert reviewscore, populariteit en het feit dat jij ze nog weinig hebt aangeraakt.</p> `);
            Slide7_1($$renderer2, { data: gems });
            $$renderer2.push(`<!---->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { steamId });
  });
}
function Slide8_1($$renderer, $$props) {
  let data = fallback($$props["data"], () => [], true);
  let currency = fallback($$props["currency"], "EUR");
  function formatCurrency(amount) {
    return `${amount.toFixed(2)} ${currency}`;
  }
  $$renderer.push(`<div class="genres svelte-1rhmpae"><!--[-->`);
  const each_array = ensure_array_like(data);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let g = each_array[$$index];
    $$renderer.push(`<div class="row svelte-1rhmpae"><div class="left svelte-1rhmpae"><div class="genre svelte-1rhmpae">${escape_html(g.genre)}</div> <div class="meta svelte-1rhmpae">${escape_html(g.count)} game${escape_html(g.count === 1 ? "" : "s")} •
            ${escape_html(formatCurrency(g.value))} • ${escape_html(g.percentage)}%</div></div> <div class="bar-wrap svelte-1rhmpae"><div class="bar svelte-1rhmpae"${attr_style(`width: ${g.percentage}%;`)}></div></div></div>`);
  }
  $$renderer.push(`<!--]--></div>`);
  bind_props($$props, { data, currency });
}
function Slide8($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let steamId = fallback(
      $$props["steamId"],
      ""
      // Hier komt het gekozen steamid in
    );
    let totalValue = 0;
    let currency = "EUR";
    let gamesPricedCount = 0;
    let totalOwnedCount = 0;
    let genres = [];
    let mostExpensive = [];
    function formatCurrency(amount) {
      return `${amount.toFixed(2)} ${currency}`;
    }
    $$renderer2.push(`<div class="slide8 svelte-1cktp67"><h2>Waardeverdeling van je library</h2> `);
    if (!steamId) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="summary svelte-1cktp67"><div class="summary-block big svelte-1cktp67"><div class="label svelte-1cktp67">Geschatte waarde (subset)</div> <div class="value svelte-1cktp67">${escape_html(formatCurrency(totalValue))}</div> <div class="note svelte-1cktp67">Gebaseerd op ongeveer ${escape_html(gamesPricedCount)} games met prijsinformatie
          van je totaal ${escape_html(totalOwnedCount)} games.</div></div></div> `);
          if (genres && genres.length) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="section svelte-1cktp67"><h3>Verdeling per genre / categorie</h3> <p class="hint svelte-1cktp67">Hier zie je hoeveel van de totale waarde gekoppeld is aan elke genre/categorie
          op de store-pagina. Dit zijn de genres van de games waar een actuele
          prijs voor gevonden is.</p> `);
            Slide8_1($$renderer2, { data: genres, currency });
            $$renderer2.push(`<!----></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (mostExpensive && mostExpensive.length) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="section svelte-1cktp67"><h3>Duurste games in je library</h3> <p class="hint svelte-1cktp67">Dit zijn de games met de hoogste huidige store-prijs in de subset die is opgehaald.</p> <table class="games-table svelte-1cktp67"><thead><tr><th class="svelte-1cktp67">Game</th><th class="svelte-1cktp67">Prijs</th><th class="svelte-1cktp67">Jouw speeltijd</th></tr></thead><tbody><!--[-->`);
            const each_array = ensure_array_like(mostExpensive);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let g = each_array[$$index];
              $$renderer2.push(`<tr><td class="svelte-1cktp67">${escape_html(g.name)}</td><td class="svelte-1cktp67">${escape_html(formatCurrency(g.price))}</td><td class="svelte-1cktp67">${escape_html(g.hours)}u</td></tr>`);
            }
            $$renderer2.push(`<!--]--></tbody></table></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { steamId });
  });
}
function Slide9_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => [], true);
    let width = fallback($$props["width"], 700);
    let height = fallback($$props["height"], 450);
    let cleanup = () => {
    };
    function draw() {
      {
        return;
      }
    }
    onDestroy(() => cleanup());
    data && data.length && draw();
    $$renderer2.push(`<svg class="steam-bubble-galaxy svelte-1xepg73" role="img" aria-label="Steam speelgedrag bubbelvisualisatie"></svg>`);
    bind_props($$props, { data, width, height });
  });
}
function Slide9($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let steamId = fallback(
      $$props["steamId"],
      ""
      // Hier komt het gekozen steamid in
    );
    let games = [];
    $$renderer2.push(`<div class="slide9 svelte-t1wuwe"><h2 class="svelte-t1wuwe">Jouw Steam speeluniversum</h2> `);
    if (!steamId) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Geen SteamID geselecteerd. Ga terug naar slide 1 om een account te kiezen.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
          if (games.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p>We vonden geen games met speeltijd. Start een game en kom later terug 😉</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<p class="hint svelte-t1wuwe">Elke cirkel is een game die je gespeeld hebt. Hoe groter de bubbel, hoe meer uur je erin hebt gestoken.
      Beweeg met je muis over een bubbel om te zien welke game het is.
      Je kunt de bubbles ook een beetje verslepen.</p> `);
            Slide9_1($$renderer2, { data: games, width: 700, height: 450 });
            $$renderer2.push(`<!----> <p class="footer svelte-t1wuwe">Dit is de laatste slide van je Steam Story – een overzicht van alle werelden waar je tijd in hebt geïnvesteerd.</p>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { steamId });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let CurrentSlide;
    let data = $$props["data"];
    let lastSteamId = null;
    let activeSlide = 0;
    let steamId = data.initialSteamId || "";
    const slides = [
      { component: Slide1, label: "Start" },
      { component: Slide2, label: "Top games" },
      { component: Slide3, label: "Genres" },
      { component: Slide4, label: "Achievements overzicht" },
      { component: Slide5, label: "Vrienden" },
      { component: Slide6, label: "Achievements radar" },
      { component: Slide7, label: "Hidden gems" },
      { component: Slide8, label: "Library waarde" },
      { component: Slide9, label: "Speeluniversum" }
    ];
    const totalSlides = slides.length;
    if (steamId && steamId !== lastSteamId) {
      setActiveSteamId(steamId);
      lastSteamId = steamId;
    }
    CurrentSlide = slides[activeSlide].component;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<nav class="story-bar svelte-1uha8ag"><!--[-->`);
      const each_array = ensure_array_like(Array(totalSlides));
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        each_array[i];
        $$renderer3.push(`<button type="button"${attr_class("story-segment svelte-1uha8ag", void 0, { "active": activeSlide === i })}${attr("aria-label", `Ga naar slide ${i + 1}`)}></button>`);
      }
      $$renderer3.push(`<!--]--></nav> <main class="story-container svelte-1uha8ag"><header class="story-header svelte-1uha8ag"><h1 class="svelte-1uha8ag">Jouw Steam Story</h1> <p class="story-subtitle svelte-1uha8ag">Slide ${escape_html(activeSlide + 1)} van ${escape_html(totalSlides)} — ${escape_html(slides[activeSlide].label)}</p></header> <section class="story-slide svelte-1uha8ag"><!---->`);
      CurrentSlide?.($$renderer3, {
        isActive: true,
        get steamId() {
          return steamId;
        },
        set steamId($$value) {
          steamId = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></section> <footer class="story-footer svelte-1uha8ag"><button type="button"${attr("disabled", activeSlide === 0, true)} class="svelte-1uha8ag">◀ Vorige</button> <span>Slide ${escape_html(activeSlide + 1)} / ${escape_html(totalSlides)}</span> <button type="button"${attr("disabled", activeSlide === totalSlides - 1, true)} class="svelte-1uha8ag">Volgende ▶</button></footer></main>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
