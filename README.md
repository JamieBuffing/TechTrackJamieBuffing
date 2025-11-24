# Steam Story 🎮

**Steam Story** is een interactieve datavisualisatie van je Steam-profiel, gebouwd met **SvelteKit** en **D3.js**.  
De app vertelt jouw persoonlijke “Steam Story” aan de hand van grafieken, statistieken en visualisaties over je games, genres, achievements, vrienden en meer.

👉 Live versie: **https://www.jamiebuffing.nl/**

> Dit project is gemaakt als schoolopdracht voor de Hogeschool van Amsterdam (HvA). 

---

## Inhoud

- [Live demo](#live-demo)
- [Over dit project](#over-dit-project)
- [Functionaliteiten & slides](#functionaliteiten--slides)
- [Gebruikte technologieën](#gebruikte-technologieën)
- [Architectuur in het kort](#architectuur-in-het-kort)
- [Installatie & ontwikkeling](#installatie--ontwikkeling)
- [Omgaan met API keys](#omgaan-met-api-keys)
- [Gebruik van AI](#gebruik-van-ai)
- [Licentie](#licentie)

---

## Live demo

De applicatie draait live op Vercel:

- 🌐 **Productie:** https://www.jamiebuffing.nl/ 

Op de eerste slide kun je:
- Inloggen met je eigen **Steam-account** (via Steam OpenID), of  
- Één van de **preset accounts** kiezen om de visualisaties te bekijken.

---

## Over dit project

**Steam Story** haalt jouw Steam-data op via officiële Steam API’s en zet die om in interactieve visualisaties. Het doel is om op een speelse manier inzicht te geven in:

- Welke games je het meest speelt  
- Hoe jouw speeltijd verdeeld is over genres  
- Welke achievements je vrijspeelt  
- Hoe je vrienden en hun statistieken zich tot de jouwe verhouden  
- De waarde en omvang van je gamebibliotheek  
- Een soort “speeluniversum” om jouw profiel mooi af te sluiten

De wiki in deze repo beschrijft het hele proces van idee tot uitvoering, inclusief API-keuzes, ontwerpkeuzes, coding standards, onderzoek en AI-gebruik.

👉 Meer achtergrond: zie de [GitHub Wiki](https://github.com/JamieBuffing/TechTrackJamieBuffing/wiki).

---

## Functionaliteiten & slides

De app bestaat uit 9 slides die samen jouw verhaal vertellen. Deze slides worden dynamisch geladen in `src/routes/+page.svelte`.

### Slide 1 – Start

- Welkomstscherm voor “Jouw Steam Story”
- Login met Steam (OpenID) of kies een preset account
- Standaard staat er één eigen account geselecteerd voor het project

### Slide 2 – Top games

- Haalt je meest gespeelde games op
- Toont:
  - Staafdiagram met speeltijd per game
  - Donutdiagram met de verdeling van je totale speeltijd over je topgames

### Slide 3 – Genres

- Analyseert je bibliotheek op basis van genres
- Laat zien welke soorten games je het meest speelt (bijv. Action, RPG, Indie)

### Slide 4 – Achievements overzicht

- Overzicht van achievements over meerdere games
- Geeft inzicht in hoe “completionist” je bent

### Slide 5 – Vrienden

- Combineert vriendenstatistieken met jouw eigen gegevens
- Laat zien hoe je sociaal netwerk op Steam eruitziet

### Slide 6 – Achievements radar

- Radar chart / spider chart om verschillende achievement-dimensies met elkaar te vergelijken
- Maakt sterke en zwakke punten in je speelstijl zichtbaar

### Slide 7 – Hidden gems

- Zoekt minder gespeelde maar goed beoordeelde games in je bibliotheek
- Helpt je vergeten pareltjes terug te vinden

### Slide 8 – Library waarde

- Schat de waarde van je bibliotheek op basis van gegevens uit de Steam Store API
- Laat de grootte en (ongeveer) de waarde van je collectie zien

### Slide 9 – Speeluniversum

- Een afsluitende visualisatie (“universum”) die jouw Steam Story rond maakt
- Meer conceptueel/visueel, minder tabel-achtig

De precieze data per slide is beschreven in de wiki-pagina **“Het werken met de data”**.

---

## Gebruikte technologieën

**Frontend & framework**

- [SvelteKit](https://kit.svelte.dev/) (Svelte 5 + Vite) 
- [D3.js](https://d3js.org/) voor datavisualisaties
- Vite als bundler/dev server

**Backend / server-side**

- SvelteKit endpoints in `src/routes/api/*`
- Eigen API-routes voor o.a.:
  - `/api/profile`
  - `/api/top-games`
  - `/api/genres`
  - `/api/achievements`
  - `/api/friends-stats`
  - `/api/hidden-gems`
  - `/api/library-value`

**Externe API’s**

Er worden drie officiële Steam-endpoints gebruikt:

- `https://api.steampowered.com` – Steam Web API (vereist **STEAM_API_KEY**)  
- `https://store.steampowered.com/api/` – openbare Store API (met limieten)  
- `https://shared.akamai.steamstatic.com` – statische assets, o.a. game-afbeeldingen  

**Deploy**

- De app wordt gehost op **Vercel** (SvelteKit-adapter). 

---

## Architectuur in het kort

- `src/routes/+page.svelte`  
  Laadt alle slides en zorgt voor de navigatie (volgende/vorige slide, labels, actieve slide).  

- `src/lib/slides/`  
  Bevat per slide een Svelte-component die de data ophaalt en visualiseert.  

- `src/routes/api/*`  
  SvelteKit server endpoints die:
  - SteamID bepalen (query param of default)
  - Data ophalen via de Steam Web/Store API
  - Data schoonmaken en in een handig formaat naar de frontend sturen  

- `src/lib/server/steamApi.js`  
  Wrapper rond de Steam API’s met o.a.:
  - `STEAM_API_KEY` en `DEFAULT_STEAM_ID` uit environment variables  
  - Helpers voor profielgegevens, games, store details, etc.

- `src/lib/components/`  
  D3-componenten per slide (bijvoorbeeld de bar chart en donut chart voor je topgames).

---

## Installatie & ontwikkeling

### 1. Repository clonen

```bash
git clone https://github.com/JamieBuffing/TechTrackJamieBuffing.git
cd TechTrackJamieBuffing
