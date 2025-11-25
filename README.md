# Steam Story 🎮
**Allereerst een waarschuwing, de api is niet heel sterk. Niet te snel door de slides heen!!**
---

**Steam Story** is een interactieve datavisualisatie van je Steam-profiel, gebouwd met **SvelteKit** en **D3.js**.  
De app vertelt jouw persoonlijke “Steam Story” aan de hand van grafieken, statistieken en visualisaties over je games, genres, achievements, vrienden en meer.

👉 Live versie: **https://www.jamiebuffing.nl/**

> Dit project is gemaakt als schoolopdracht voor de Hogeschool van Amsterdam (HvA). 

---

## Installatie & ontwikkeling

### 1. Download de repo van de inlevering.
### 2. Pak het uit en open het met vsc.
### 3. Voer de volgende commands uit
1. Om alle packeges te installeren
```bash
npm update
```
2. Om het te starten
```bash
npm run dev
```

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

## 🔍 Validiteit van de data

Bij het werken met de Steam Web API merkte ik dat de validiteit van de data niet altijd gegarandeerd is. De API levert wel actuele en officiële informatie, maar er zitten een aantal beperkingen en onzekerheden aan vast die invloed hebben op de betrouwbaarheid van mijn visualisaties.

### 1. Publieke versus privéprofielen
De grootste beperking is dat de API **geen data teruggeeft wanneer een gebruiker (gedeeltelijk) privé staat**.  
In dat geval ontbreken:
- speeltijdgegevens  
- achievements  
- genres  
- vriendenstatistieken  

Dit betekent dat de volledigheid van mijn dataset afhankelijk is van de privacy-instellingen van de gebruiker. Bij sommige testaccounts merkte ik dat delen van de data incompleet waren, wat directe impact heeft op de analyse.

### 2. Inconsistenties tussen API-endpoints
De Steam API bestaat uit meerdere losse diensten (ISteamUser, ISteamUserStats, ISteamApps enz.). Deze leveren soms data die:
- verschillende datavelden gebruiken voor dezelfde informatie  
- ontbrekende of lege velden bevatten  
- niet synchroon zijn met elkaar (bijv. achievements die bestaan maar geen beschrijving hebben)

Voor mijn “Top Games”, “Genre”, en “Achievements” moest ik soms data van verschillende endpoints combineren, waarbij kleine verschillen in structuur problemen konden geven. Daarom heb ik zelf een processing-laag toegevoegd om inconsistenties op te vangen.

### 3. Verouderde of incomplete gegevens
Sommige games geven hun achievements niet (meer) door via de API, of hebben geen correcte schema-informatie in **GetSchemaForGame**.  
Ook komt het voor dat:
- afbeeldingen niet bestaan (404)  
- statische metadata (zoals genre) niet door Steam wordt beheerd  
- third-party tags soms ontbreken

Dit kan ervoor zorgen dat visualisaties minder compleet lijken dan in werkelijkheid.

### 4. Geen officiële guarantees
Steam geeft **geen garanties over stabiliteit, uptime, rate limits of datakwaliteit**.  
Hoewel de API in de praktijk goed werkt, blijft er een risico:
- dat endpoints tijdelijk niet functioneren  
- dat data langzaam wordt geüpdatet  
- dat bepaalde gegevens achterlopen op de actuele staat van een game

### 5. Impact op mijn narratief
Deze onzekerheden betekenen dat mijn dashboard afhankelijk is van:
- het gekozen Steam-account  
- de volledigheid van de game-metadata  
- de beschikbaarheid van achievement-data voor specifieke games

Daarom toon ik duidelijke foutmeldingen, gebruik ik loading states en leg ik in de wiki uit dat de gebruiker **een volledig openbaar Steam-profiel** moet hebben voor de beste resultaten.

---

**Kortom:** de Steam API is een krachtige bron, maar niet 100% betrouwbaar.  
Door zelf data-validatie en fallback-controls toe te voegen heb ik ervoor gezorgd dat mijn dashboard toch stabiel, bruikbaar en begrijpelijk blijft.
