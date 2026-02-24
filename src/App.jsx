import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = "https://pynmkrcbkcfxifnztnrn.supabase.co";
const SB_ANON = "sb_publishable_8VEm7zR0vqKjOZRwH6jimw_qIWt-RPp";
const supabase = createClient(SB_URL, SB_ANON);

function useIsMobile(breakpoint = 600) {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth <= breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setMob(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return mob;
}

const FACTS = {
  "The Lion King": "Most of Disney's top animators chose Pocahontas over this project, expecting it to be the bigger hit — Lion King ended up grossing more than three times as much",
  "Toy Story": "The first feature-length CGI film ever made — Pixar's computers ran 24 hours a day for over a year just to render it",
  "Finding Nemo": "The entire crew took scuba diving lessons, and the story team spent weeks at the Great Barrier Reef before drawing a single frame",
  "Beauty and the Beast": "The first animated film ever nominated for Best Picture at the Academy Awards",
  "The Little Mermaid": "Howard Ashman and Alan Menken structured the songs as a complete Broadway musical — their approach kicked off the entire Disney Renaissance",
  "Up": "The opening montage has zero dialogue, just music and visuals, and has since become a staple of film school curricula worldwide",
  "Aladdin": "Robin Williams improvised so extensively that production recorded over 16 hours of material — far more than they could write around",
  "Inside Out": "Pixar consulted with neuroscientists and psychiatrists throughout development. Several mental health professionals cried at early screenings.",
  "Coco": "Became the highest-grossing film of all time in Mexico upon release",
  "Frozen": "Let It Go was written in one session — the Lopezes say it flowed out in a single sitting and barely changed before the final cut",
  "The Incredibles": "Brad Bird pitched it as 'a James Bond film where the spy is a middle-aged dad' — Pixar greenlit it on that description alone",
  "WALL·E": "One of the most dialogue-sparse major studio films ever made — long stretches pass with no spoken words at all",
  "Mulan": "The first Disney protagonist to win her final battle through a clever trick rather than magic, brute strength, or being rescued",
  "Tangled": "Rapunzel's hair required Pixar to build an entirely new simulation system — 100,000+ individual strands, each animated separately",
  "Monsters, Inc.": "Boo's real name is briefly visible on her bedroom door in the final scene — it's Mary",
  "Moana": "Auli'i Cravalho was discovered at a charity event just days before the casting deadline closed. She had never auditioned for anything before.",
  "Ratatouille": "Brad Bird took over mid-production from a story that wasn't working. The finished film shares almost nothing with the original concept.",
  "Toy Story 3": "The villain Lotso was conceived before the original Toy Story, but cut — the technology to animate plush fur didn't exist yet",
  "Lilo & Stitch": "Originally pitched as a story about a little girl and her dog, set in Kansas. The alien was added specifically to avoid making another fairy tale.",
  "The Emperor's New Groove": "Was originally a serious Inca-set musical called Kingdom of the Sun. Almost the entire production was scrapped and rebuilt from scratch.",
  "Cinderella": "Walt Disney used the film's profits to pay off wartime studio debt and fund early development of what would become Disneyland",
  "Sleeping Beauty": "Every frame was painted in widescreen format specifically for the new Cinemascope theater technology — the production took six years",
  "Encanto": "Lin-Manuel Miranda wrote all eight original songs while simultaneously running Hamilton on Broadway",
  "Soul": "Jon Batiste performed the jazz sequences live so the animators could build Joe Gardner's playing style around his actual movements",
  "Zootopia": "The city required a different animation rig for every species — the fur simulation alone involves over 800,000 individual strands on the main characters",
  "Raya and the Last Dragon": "Before designing a single character, the production team traveled to Thailand, Laos, Cambodia, Vietnam, Indonesia, and the Philippines",
  "Turning Red": "The first Pixar feature set in Canada, and the first Pixar feature film directed solely by a woman of color",
  "Elemental": "Ember's fire effects required Pixar to build a new simulation system — water, fire, and air characters each needed their own physics engine",
};

const MAIN = [
  { seed:1, name:"The Lion King", year:1994, studio:"Disney", imdb:"https://www.imdb.com/title/tt0110357/" },
  { seed:2, name:"Toy Story", year:1995, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0114709/" },
  { seed:3, name:"Finding Nemo", year:2003, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0266543/" },
  { seed:4, name:"Beauty and the Beast", year:1991, studio:"Disney", imdb:"https://www.imdb.com/title/tt0101414/" },
  { seed:5, name:"The Little Mermaid", year:1989, studio:"Disney", imdb:"https://www.imdb.com/title/tt0097757/" },
  { seed:6, name:"Up", year:2009, studio:"Pixar", imdb:"https://www.imdb.com/title/tt1049413/" },
  { seed:7, name:"Aladdin", year:1992, studio:"Disney", imdb:"https://www.imdb.com/title/tt0103639/" },
  { seed:8, name:"Inside Out", year:2015, studio:"Pixar", imdb:"https://www.imdb.com/title/tt2096673/" },
  { seed:9, name:"Coco", year:2017, studio:"Pixar", imdb:"https://www.imdb.com/title/tt2380307/" },
  { seed:10, name:"Frozen", year:2013, studio:"Disney", imdb:"https://www.imdb.com/title/tt2294629/" },
  { seed:11, name:"The Incredibles", year:2004, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0317705/" },
  { seed:12, name:"WALL·E", year:2008, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0910970/" },
  { seed:13, name:"Mulan", year:1998, studio:"Disney", imdb:"https://www.imdb.com/title/tt0120762/" },
  { seed:14, name:"Tangled", year:2010, studio:"Disney", imdb:"https://www.imdb.com/title/tt0398286/" },
  { seed:15, name:"Monsters, Inc.", year:2001, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0198781/" },
  { seed:16, name:"Moana", year:2016, studio:"Disney", imdb:"https://www.imdb.com/title/tt3521164/" },
  { seed:17, name:"Ratatouille", year:2007, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0382932/" },
  { seed:18, name:"Toy Story 3", year:2010, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0435761/" },
  { seed:19, name:"Lilo & Stitch", year:2002, studio:"Disney", imdb:"https://www.imdb.com/title/tt0275847/" },
  { seed:20, name:"The Emperor's New Groove", year:2000, studio:"Disney", imdb:"https://www.imdb.com/title/tt0120917/" },
  { seed:21, name:"Cinderella", year:1950, studio:"Disney", imdb:"https://www.imdb.com/title/tt0042332/" },
  { seed:22, name:"Hercules", year:1997, studio:"Disney", imdb:"https://www.imdb.com/title/tt0119282/" },
  { seed:23, name:"Sleeping Beauty", year:1959, studio:"Disney", imdb:"https://www.imdb.com/title/tt0053285/" },
  { seed:24, name:"Encanto", year:2021, studio:"Disney", imdb:"https://www.imdb.com/title/tt2953050/" },
  { seed:25, name:"Soul", year:2020, studio:"Pixar", imdb:"https://www.imdb.com/title/tt2948372/" },
  { seed:26, name:"Zootopia", year:2016, studio:"Disney", imdb:"https://www.imdb.com/title/tt2948356/" },
  { seed:27, name:"Bambi", year:1942, studio:"Disney", imdb:"https://www.imdb.com/title/tt0034492/" },
  { seed:28, name:"Wreck-It Ralph", year:2012, studio:"Disney", imdb:"https://www.imdb.com/title/tt1772341/" },
  { seed:29, name:"Tarzan", year:1999, studio:"Disney", imdb:"https://www.imdb.com/title/tt0120855/" },
  { seed:30, name:"The Jungle Book", year:1967, studio:"Disney", imdb:"https://www.imdb.com/title/tt0061852/" },
  { seed:31, name:"Brave", year:2012, studio:"Pixar", imdb:"https://www.imdb.com/title/tt1217209/" },
  { seed:32, name:"Toy Story 2", year:1999, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0120363/" },
  { seed:33, name:"Toy Story 4", year:2019, studio:"Pixar", imdb:"https://www.imdb.com/title/tt1979376/" },
  { seed:34, name:"Lady and the Tramp", year:1955, studio:"Disney", imdb:"https://www.imdb.com/title/tt0048280/" },
  { seed:35, name:"101 Dalmatians", year:1961, studio:"Disney", imdb:"https://www.imdb.com/title/tt0055254/" },
  { seed:36, name:"Peter Pan", year:1953, studio:"Disney", imdb:"https://www.imdb.com/title/tt0046183/" },
  { seed:37, name:"The Hunchback of Notre Dame", year:1996, studio:"Disney", imdb:"https://www.imdb.com/title/tt0116583/" },
  { seed:38, name:"Snow White", year:1937, studio:"Disney", imdb:"https://www.imdb.com/title/tt0029583/" },
  { seed:39, name:"Big Hero 6", year:2014, studio:"Disney", imdb:"https://www.imdb.com/title/tt2245084/" },
  { seed:40, name:"Raya and the Last Dragon", year:2021, studio:"Disney", imdb:"https://www.imdb.com/title/tt5109280/" },
  { seed:41, name:"Cars", year:2006, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0317219/" },
  { seed:42, name:"Pinocchio", year:1940, studio:"Disney", imdb:"https://www.imdb.com/title/tt0032910/" },
  { seed:43, name:"Fantasia", year:1940, studio:"Disney", imdb:"https://www.imdb.com/title/tt0032455/" },
  { seed:44, name:"Luca", year:2021, studio:"Pixar", imdb:"https://www.imdb.com/title/tt12801262/" },
  { seed:45, name:"Pocahontas", year:1995, studio:"Disney", imdb:"https://www.imdb.com/title/tt0114148/" },
  { seed:46, name:"Alice in Wonderland", year:1951, studio:"Disney", imdb:"https://www.imdb.com/title/tt0043274/" },
  { seed:47, name:"Inside Out 2", year:2024, studio:"Pixar", imdb:"https://www.imdb.com/title/tt22022452/" },
  { seed:48, name:"The Princess and the Frog", year:2009, studio:"Disney", imdb:"https://www.imdb.com/title/tt0780521/" },
  { seed:49, name:"A Bug's Life", year:1998, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0120623/" },
  { seed:50, name:"Dumbo", year:1941, studio:"Disney", imdb:"https://www.imdb.com/title/tt0033563/" },
  { seed:51, name:"Robin Hood", year:1973, studio:"Disney", imdb:"https://www.imdb.com/title/tt0070608/" },
  { seed:52, name:"Monsters University", year:2013, studio:"Pixar", imdb:"https://www.imdb.com/title/tt1453405/" },
  { seed:53, name:"Treasure Planet", year:2002, studio:"Disney", imdb:"https://www.imdb.com/title/tt0133240/" },
  { seed:54, name:"Atlantis: The Lost Empire", year:2001, studio:"Disney", imdb:"https://www.imdb.com/title/tt0230025/" },
  { seed:55, name:"The Great Mouse Detective", year:1986, studio:"Disney", imdb:"https://www.imdb.com/title/tt0091149/" },
  { seed:56, name:"The Rescuers Down Under", year:1990, studio:"Disney", imdb:"https://www.imdb.com/title/tt0100477/" },
  { seed:57, name:"The Sword in the Stone", year:1963, studio:"Disney", imdb:"https://www.imdb.com/title/tt0057546/" },
  { seed:58, name:"The Aristocats", year:1970, studio:"Disney", imdb:"https://www.imdb.com/title/tt0065421/" },
];

const PLAYIN = [
  { seed:59, name:"Bolt", year:2008, studio:"Disney", imdb:"https://www.imdb.com/title/tt0397892/" },
  { seed:60, name:"Meet the Robinsons", year:2007, studio:"Disney", imdb:"https://www.imdb.com/title/tt0396555/" },
  { seed:61, name:"Brother Bear", year:2003, studio:"Disney", imdb:"https://www.imdb.com/title/tt0328880/" },
  { seed:62, name:"The Rescuers", year:1977, studio:"Disney", imdb:"https://www.imdb.com/title/tt0076618/" },
  { seed:63, name:"Oliver & Company", year:1988, studio:"Disney", imdb:"https://www.imdb.com/title/tt0095776/" },
  { seed:64, name:"Elemental", year:2023, studio:"Pixar", imdb:"https://www.imdb.com/title/tt15789038/" },
  { seed:65, name:"Turning Red", year:2022, studio:"Pixar", imdb:"https://www.imdb.com/title/tt8097030/" },
  { seed:66, name:"Onward", year:2020, studio:"Pixar", imdb:"https://www.imdb.com/title/tt7146812/" },
  { seed:67, name:"Chicken Little", year:2005, studio:"Disney", imdb:"https://www.imdb.com/title/tt0371606/" },
  { seed:68, name:"Incredibles 2", year:2018, studio:"Pixar", imdb:"https://www.imdb.com/title/tt3606756/" },
  { seed:69, name:"Ralph Breaks the Internet", year:2018, studio:"Disney", imdb:"https://www.imdb.com/title/tt5848272/" },
  { seed:70, name:"The Good Dinosaur", year:2015, studio:"Pixar", imdb:"https://www.imdb.com/title/tt1979388/" },
];

const PIP = [[4,2],[1,9],[0,7],[3,6],[5,8],[10,11]];

const R1 = [
  [0,58],[31,32],[15,48],[16,41],[8,53],[23,40],[7,54],[25,38],
  [3,59],[29,36],[13,51],[18,47],[5,43],[26,33],[11,52],[20,46],
  [6,60],[27,39],[12,50],[19,49],[9,55],[22,45],[4,61],[21,44],
  [1,62],[30,35],[14,37],[17,42],[2,63],[24,34],[10,56],[28,57],
];

const RND = ["Round of 64","Round of 32","Sweet 16","Elite 8","Final Four","Championship"];
const DOTS = Array.from({length:80}, () => ({
  w: Math.random()*2.5+.5, h: Math.random()*2.5+.5,
  op: Math.random()*.5+.15, l: Math.random()*100, t: Math.random()*100,
  dur: Math.random()*4+2, del: Math.random()*4,
}));
const REG = ["Legends & Legacies","Heart & Heartbreak","Magic & Mischief","Worlds Apart"];
const CLR = {
  Disney: { bg:"#0d1b3e", ac:"#4fc3f7", gl:"rgba(79,195,247,.25)", tx:"#7ec8f0" },
  Pixar: { bg:"#3e1a0d", ac:"#ff8a65", gl:"rgba(255,138,101,.25)", tx:"#ffab91" },
};

const ALL_MOVIES = [...MAIN, ...PLAYIN];
// Movies ordered by when they first appear in the bracket (play-in → R1 region order)
const BRACKET_ORDER = [
  ...PIP.flatMap(([a,b]) => [PLAYIN[a], PLAYIN[b]]),
  ...R1.flatMap(([a,b]) => { const out=[]; if(a<58) out.push(MAIN[a]); if(b<58) out.push(MAIN[b]); return out; }),
];

const loadLS = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const saveLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ } };

const serMatch = (ms) => ms.map(m => ({ p: [m[0], m[1]], w: m.winner || null }));
const desMatch = (ms) => ms.map(({ p, w }) => { const m = [p[0], p[1]]; if (w) m.winner = w; return m; });

// Canvas PNG export constants — 1920×1080
const CW = 1920, CH = 1080;
const CSW = 160, CSH = 26, CGAP = 4, CMH = 56; // slot/match dims
const CPW = 22, CPH = 24;                        // poster dims
const CSTEP = 185;                               // column step (CSW + 25px gap)
const CBT = 60, CBH = 900;                      // bracket top Y, bracket height
const clx = r => 10 + r * CSTEP;                // left column x at round r
const crx = r => CW - 10 - CSW - r * CSTEP;    // right column x at round r
const cps = r => Math.round(16 / Math.pow(2, r)); // matches per side at round r
const cmty = (r, i) => {                         // match top Y: round r, position i within side
  const sp = CBH / cps(r);
  return Math.round(CBT + sp * (i + 0.5) - CMH / 2);
};

// ---- TMDB / OMDB helpers ----

const extractImdbId = url => url?.match(/tt\d+/)?.[0] ?? null;

async function fetchMovieMeta(tmdbKey, omdbKey) {
  const cache = (() => { try { return JSON.parse(localStorage.getItem("tmdb-meta-v1")||"{}"); } catch { return {}; } })();
  const missing = ALL_MOVIES.filter(m => !cache[m.seed]?.poster && extractImdbId(m.imdb));
  const BATCH = 20;
  for (let i = 0; i < missing.length; i += BATCH) {
    await Promise.all(missing.slice(i, i + BATCH).map(async m => {
      const id = extractImdbId(m.imdb);
      cache[m.seed] = cache[m.seed] || {};
      try {
        if (tmdbKey) {
          const r = await fetch(`https://api.themoviedb.org/3/find/${id}?api_key=${tmdbKey}&external_source=imdb_id`);
          const d = await r.json();
          const path = d.movie_results?.[0]?.poster_path;
          if (path) cache[m.seed].poster = `https://image.tmdb.org/t/p/w92${path}`;
        }
        if (omdbKey) {
          const r = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${omdbKey}`);
          const d = await r.json();
          if (d.Runtime && d.Runtime !== "N/A") cache[m.seed].runtime = d.Runtime;
          if (d.imdbRating && d.imdbRating !== "N/A") cache[m.seed].rating = d.imdbRating;
          if (!cache[m.seed].poster && d.Poster && d.Poster !== "N/A") cache[m.seed].poster = d.Poster;
        }
      } catch { /* silent per-movie failure */ }
    }));
  }
  localStorage.setItem("tmdb-meta-v1", JSON.stringify(cache));
  return cache;
}

async function loadImages(metaMap) {
  const imgs = {};
  await Promise.all(Object.entries(metaMap).map(([seed, meta]) => {
    if (!meta?.poster) return Promise.resolve();
    return new Promise(res => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { imgs[seed] = img; res(); };
      img.onerror = res;
      img.src = meta.poster;
    });
  }));
  return imgs;
}

// ---- Canvas drawing functions (PNG export) ----

function cBg(ctx) {
  const grad = ctx.createLinearGradient(0, 0, CW, CH);
  grad.addColorStop(0, "#06060f");
  grad.addColorStop(0.4, "#0e0e24");
  grad.addColorStop(0.7, "#180a20");
  grad.addColorStop(1, "#06060f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CW, CH);
}

function cHeader(ctx) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd54f";
  ctx.font = "bold 18px Inter, sans-serif";
  ctx.fillText("Disney × Pixar Bracket", CW / 2, 24);
  ctx.fillStyle = "#6a6a8e";
  ctx.font = "10px Inter, sans-serif";
  ctx.fillText("70 movies · 69 matchups · 1 champion", CW / 2, 40);
}

function cRoundLabels(ctx) {
  const labels = ["R64", "R32", "Sweet 16", "Elite 8", "Final Four"];
  ctx.fillStyle = "#5a5a7e";
  ctx.font = "9px Inter, sans-serif";
  ctx.textAlign = "center";
  labels.forEach((lbl, r) => {
    ctx.fillText(lbl, clx(r) + CSW / 2, 54);
    ctx.fillText(lbl, crx(r) + CSW / 2, 54);
  });
}

function cRegionLabels(ctx) {
  const colors = ["#4fc3f7", "#ce93d8", "#ff8a65", "#ffd54f"];
  REG.forEach((name, ri) => {
    // Regions 0+1 on left side (top half, bottom half), regions 2+3 on right side
    const side = ri < 2 ? "left" : "right";
    const regionInSide = ri % 2; // 0 = top 8 matches, 1 = bottom 8 matches
    const startI = regionInSide * 8;
    const topY = cmty(0, startI);
    const botY = cmty(0, startI + 7) + CMH;
    const y = (topY + botY) / 2;
    const x = side === "left" ? 6 : CW - 8;
    ctx.fillStyle = colors[ri];
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(name, 0, 4);
    ctx.restore();
  });
}

function cConnectors(ctx, side) {
  // Round-to-round bracket connectors (r=0..3)
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let r = 0; r < 4; r++) {
    const perSide = cps(r);
    // Each adjacent pair of matches feeds into one match in the next round
    for (let j = 0; j < perSide / 2; j++) {
      const cy0 = cmty(r, j * 2) + CMH / 2;     // center Y of top match
      const cy1 = cmty(r, j * 2 + 1) + CMH / 2; // center Y of bottom match
      const yMid = (cy0 + cy1) / 2;              // = center Y of next-round match

      let xFrom, xTo;
      if (side === "left") {
        xFrom = clx(r) + CSW; // exit: right edge of current col
        xTo   = clx(r + 1);   // enter: left edge of next col
      } else {
        xFrom = crx(r);           // exit: left edge of current col
        xTo   = crx(r + 1) + CSW; // enter: right edge of next col
      }
      const xMid = (xFrom + xTo) / 2;

      // Top match → midX → yMid → next round
      ctx.beginPath();
      ctx.moveTo(xFrom, cy0);
      ctx.lineTo(xMid, cy0);
      ctx.lineTo(xMid, yMid);
      ctx.lineTo(xTo, yMid);
      ctx.stroke();
      // Bottom match → midX (joins vertical at yMid)
      ctx.beginPath();
      ctx.moveTo(xFrom, cy1);
      ctx.lineTo(xMid, cy1);
      ctx.stroke();
    }
  }
  // No FF→champion connector lines needed: with CSW=160 and CSTEP=185,
  // clx(4)+CSW = 910 and crx(4) = 1010, so the champion box (910-1010)
  // directly abuts the Final Four slots with zero gap.
}

function cSlot(ctx, x, y, movie, won, lost, isUpset, imgs) {
  const c = movie ? CLR[movie.studio] : { bg: "#0d0d20", ac: "#3a3a5e", tx: "#5a5a7e" };
  // Background
  ctx.fillStyle = won
    ? (isUpset ? "#3e1a0d" : "#1a1a0d")
    : lost ? "rgba(0,0,0,0.3)"
    : c.bg + "cc";
  ctx.beginPath();
  ctx.roundRect(x, y, CSW, CSH, 4);
  ctx.fill();
  // Border
  ctx.strokeStyle = won ? (isUpset ? "#ff8a65" : "#ffd54f") : lost ? "rgba(255,255,255,0.04)" : `${c.ac}40`;
  ctx.lineWidth = won ? 1.5 : 1;
  ctx.stroke();
  if (!movie) {
    ctx.fillStyle = "#3a3a5e";
    ctx.font = "8px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("TBD", x + 6, y + CSH / 2 + 3);
    return;
  }
  // Poster thumbnail
  const img = imgs?.[movie.seed];
  let textX = x + 5;
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + 3, y + (CSH - CPH) / 2, CPW, CPH, 2);
    ctx.clip();
    ctx.drawImage(img, x + 3, y + (CSH - CPH) / 2, CPW, CPH);
    ctx.restore();
    textX = x + CPW + 5;
  }
  // Seed
  ctx.fillStyle = won ? (isUpset ? "#ff8a65" : "#ffd54f") : lost ? "#3a3a5e" : c.ac + "aa";
  ctx.font = "bold 7px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`#${movie.seed}`, textX, y + 9);
  // Name
  ctx.fillStyle = won ? "#f0f0ff" : lost ? "#3a3a5e" : "#c0c0e0";
  ctx.font = `${won ? "bold " : ""}9px Inter, sans-serif`;
  const maxW = CSW - (textX - x) - 4;
  let name = movie.name;
  while (name.length > 3 && ctx.measureText(name).width > maxW) name = name.slice(0, -1);
  if (name !== movie.name) name = name.trim() + "…";
  ctx.fillText(name, textX, y + 18);
  // Year
  ctx.fillStyle = lost ? "#2a2a40" : "#5a5a7e";
  ctx.font = "7px Inter, sans-serif";
  ctx.fillText(movie.year, textX, y + 24);
}

function cMatch(ctx, x, y, m, isUpset0, isUpset1, imgs) {
  // !!m?.winner guard prevents undefined===undefined false-positive when both are null
  const w0 = !!m?.winner && m.winner.seed === m?.[0]?.seed;
  const w1 = !!m?.winner && m.winner.seed === m?.[1]?.seed;
  cSlot(ctx, x, y, m?.[0], w0, !w0 && !!m?.winner, isUpset0, imgs);
  cSlot(ctx, x, y + CSH + CGAP, m?.[1], w1, !w1 && !!m?.winner, isUpset1, imgs);
}

function cSide(ctx, side, rds, upsets, imgs) {
  for (let r = 0; r < 5; r++) {
    const round = rds[r] || null;
    const perSide = cps(r);
    // Right side uses the second half of each round's match array
    const offset = side === "right" ? perSide : 0;
    const x = side === "left" ? clx(r) : crx(r);
    for (let i = 0; i < perSide; i++) {
      const m = round?.[offset + i] || null;
      const y = cmty(r, i);
      const isUpset0 = m?.winner?.seed === m?.[0]?.seed && m?.[0]?.seed > m?.[1]?.seed;
      const isUpset1 = m?.winner?.seed === m?.[1]?.seed && m?.[1]?.seed > m?.[0]?.seed;
      cMatch(ctx, x, y, m, isUpset0, isUpset1, imgs);
    }
  }
}

function cChamp(ctx, ch, imgs) {
  const ffY = cmty(4, 0) + CMH / 2; // Final Four match center Y (same for both sides)
  const bW = 100, bH = 80;  // exactly fills the 100px center gap
  const bX = clx(4) + CSW;  // left edge = right edge of left Final Four col
  const bY = ffY - bH / 2;
  // Glow backing
  ctx.fillStyle = "rgba(255,213,79,0.06)";
  ctx.strokeStyle = "rgba(255,213,79,0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bX, bY, bW, bH, 0); // square corners to blend with adjacent slots
  ctx.fill();
  ctx.stroke();
  // Crown
  ctx.textAlign = "center";
  ctx.font = "15px Inter, sans-serif";
  ctx.fillText("👑", bX + bW / 2, bY + 20);
  if (ch) {
    const img = imgs?.[ch.seed];
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bX + bW / 2 - 13, bY + 24, 26, 36, 3);
      ctx.clip();
      ctx.drawImage(img, bX + bW / 2 - 13, bY + 24, 26, 36);
      ctx.restore();
    }
    ctx.fillStyle = "#ffd54f";
    ctx.font = "bold 8px Inter, sans-serif";
    const champName = ch.name.length > 14 ? ch.name.slice(0, 12) + "…" : ch.name;
    ctx.fillText(champName, bX + bW / 2, bY + 72);
  } else {
    ctx.fillStyle = "#5a5a7e";
    ctx.font = "8px Inter, sans-serif";
    ctx.fillText("Champion", bX + bW / 2, bY + 50);
  }
}

function cPlayin(ctx, piM, imgs) {
  if (!piM?.length) return;
  const pY = 978;
  ctx.fillStyle = "#5a5a7e";
  ctx.font = "bold 9px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Play-In Round", CW / 2, pY - 6);
  // 6 matches in a row, centered
  const mGap = 8;
  const totalW = piM.length * CSW + (piM.length - 1) * mGap;
  const startX = (CW - totalW) / 2;
  piM.forEach((m, i) => {
    const x = startX + i * (CSW + mGap);
    const isUpset0 = m?.winner?.seed === m?.[0]?.seed && m?.[0]?.seed > m?.[1]?.seed;
    const isUpset1 = m?.winner?.seed === m?.[1]?.seed && m?.[1]?.seed > m?.[0]?.seed;
    cMatch(ctx, x, pY, m, isUpset0, isUpset1, imgs);
  });
}

function buildDisplayRds(rds, piM) {
  const d = [...rds];
  // R64: synthesize from R1+MAIN if play-in not complete yet
  if (!d[0]) {
    const arr = [...MAIN, ...(piM || []).map(m => m.winner || null)];
    d[0] = R1.map(([a, b]) => [arr[a] || null, arr[b] || null]);
  }
  // For each subsequent round that doesn't exist yet, synthesize from previous winners.
  // This makes picks flow into future columns even before a round fully completes.
  for (let r = 1; r < 5; r++) {
    if (d[r]) continue;
    const prev = d[r - 1];
    if (!prev) break;
    const next = [];
    for (let i = 0; i < prev.length; i += 2) {
      const w0 = prev[i]?.winner || null;
      const w1 = prev[i + 1]?.winner || null;
      next.push([w0, w1]);
    }
    d[r] = next;
  }
  return d;
}

function drawBracket(canvas, { rds, piM, ch, upsets, imgs }) {
  const ctx = canvas.getContext("2d");
  const displayRds = buildDisplayRds(rds, piM);

  cBg(ctx);
  cHeader(ctx);
  cRoundLabels(ctx);
  cRegionLabels(ctx);
  cConnectors(ctx, "left");
  cConnectors(ctx, "right");
  cSide(ctx, "left", displayRds, upsets, imgs);
  cSide(ctx, "right", displayRds, upsets, imgs);
  cChamp(ctx, ch, imgs);
  cPlayin(ctx, piM, imgs);
}

export default function App() {
  const mob = useIsMobile();

  // Load saved bracket state — URL hash takes priority over localStorage (for sharing)
  const [init] = useState(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const d = JSON.parse(atob(hash));
        if (d?._v === 1) return { ...d, piM: desMatch(d.piM), rds: d.rds.map(r => desMatch(r)) };
      }
    } catch { /* ignore malformed hash */ }
    const s = loadLS("dbk-state", null);
    if (!s) return null;
    return { ...s, piM: desMatch(s.piM), rds: s.rds.map(r => desMatch(r)) };
  });

  const [ph, setPh] = useState(() => init?.ph || "pi");
  const [piM, setPiM] = useState(() => init?.piM || PIP.map(([a,b]) => [PLAYIN[a], PLAYIN[b]]));
  const [piI, setPiI] = useState(() => init?.piI ?? 0);
  const [rds, setRds] = useState(() => init?.rds || []);
  const [cr, setCr] = useState(() => init?.cr ?? 0);
  const [cm, setCm] = useState(() => init?.cm ?? 0);
  const [ch, setCh] = useState(() => init?.ch || null);
  const [hv, setHv] = useState(null);
  const [an, setAn] = useState(null);
  const [bk, setBk] = useState(false);
  const [fb, setFb] = useState(false);
  const [hi, setHi] = useState(() => init?.hi || []);
  const [upsets, setUpsets] = useState(() => init?.upsets ?? []);
  const [upFlash, setUpFlash] = useState(false);
  const [fact, setFact] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBracket, setCopiedBracket] = useState(false);

  // Movie meta (posters, runtime, rating)
  const [movieMeta, setMovieMeta] = useState(() => loadLS("tmdb-meta-v1", {}));
  const [tmdbStatus, setTmdbStatus] = useState(null); // null|'fetching'|'done'|'error'
  const [showTmdbModal, setShowTmdbModal] = useState(false);
  const [pngStatus, setPngStatus] = useState(null); // null|'fetching'|'drawing'|'done'

  // Supabase sync
  const [sbUser, setSbUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle'|'syncing'|'synced'|'error'
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Persist bracket state to localStorage and URL hash
  useEffect(() => {
    const serialized = { ph, piM: serMatch(piM), piI, rds: rds.map(r => serMatch(r)), cr, cm, ch, hi, upsets };
    saveLS("dbk-state", serialized);
    if (hi.length > 0 || ch) {
      try { window.history.replaceState(null, "", "#" + btoa(JSON.stringify({ _v: 1, ...serialized }))); } catch { /* btoa failure */ }
    }
  }, [ph, piM, piI, rds, cr, cm, ch, hi, upsets]);

  // Notes state (persisted to localStorage)
  const [notes, setNotes] = useState(() => {
    const raw = loadLS("dbk-notes", {});
    const migrated = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "string") migrated[k] = v;
      else if (v && typeof v === "object") {
        const parts = [v[0], v[1]].filter(Boolean);
        migrated[k] = parts.join("\n") || "";
      }
    }
    return migrated;
  });
  const [showNotes, setShowNotes] = useState(false);

  const updateNote = (seed, text) => {
    const nn = { ...notes, [seed]: text };
    setNotes(nn); saveLS("dbk-notes", nn);
  };

  const pullFromSupabase = async () => {
    const { data, error } = await supabase
      .from("disney_bracket").select("notes,state").maybeSingle();
    if (error || !data) return;
    if (data.notes) { setNotes(data.notes); saveLS("dbk-notes", data.notes); }
    if (data.state) {
      const s = data.state;
      try {
        setPh(s.ph); setPiM(desMatch(s.piM)); setPiI(s.piI ?? 0);
        setRds(s.rds.map(r => desMatch(r))); setCr(s.cr ?? 0); setCm(s.cm ?? 0);
        setCh(s.ch || null); setHi(s.hi || []); setUpsets(s.upsets || []);
        saveLS("dbk-state", s);
      } catch { /* ignore malformed server data */ }
    }
  };

  const handleFetchMeta = async (overrideTmdb, overrideOmdb) => {
    const tmdbKey = overrideTmdb !== undefined ? overrideTmdb : localStorage.getItem("tmdb-key");
    const omdbKey = overrideOmdb !== undefined ? overrideOmdb : (localStorage.getItem("omdb-key") || "548162f0");
    if (!tmdbKey && !omdbKey) { setShowTmdbModal(true); return; }
    setTmdbStatus("fetching");
    try {
      const map = await fetchMovieMeta(tmdbKey, omdbKey);
      setMovieMeta(map);
      setTmdbStatus("done");
    } catch {
      setTmdbStatus("error");
    }
    setTimeout(() => setTmdbStatus(null), 3000);
  };

  // Auth init — runs once on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSbUser(session?.user ?? null);
      if (session?.user) pullFromSupabase();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSbUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []); // intentional: pullFromSupabase is stable, runs once

  // Auto-push on state change (debounced 2s)
  const syncTimerRef = useRef(null);
  useEffect(() => {
    if (!sbUser) return;
    clearTimeout(syncTimerRef.current);
    const serialized = { ph, piM: serMatch(piM), piI, rds: rds.map(r => serMatch(r)), cr, cm, ch, hi, upsets };
    syncTimerRef.current = setTimeout(async () => {
      setSyncStatus("syncing");
      const { error } = await supabase.from("disney_bracket").upsert({
        user_id: sbUser.id, notes, state: serialized, updated_at: new Date().toISOString(),
      });
      setSyncStatus(error ? "error" : "synced");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }, 2000);
  }, [ph, piM, piI, rds, cr, cm, ch, hi, upsets, notes, sbUser]);

  // Auto-fetch movie meta on mount if keys exist — reads cache from localStorage directly
  useEffect(() => {
    const tmdbKey = localStorage.getItem("tmdb-key");
    const omdbKey = localStorage.getItem("omdb-key");
    if (!omdbKey) localStorage.setItem("omdb-key", "548162f0");
    const cachedPosters = (() => {
      try { return Object.values(JSON.parse(localStorage.getItem("tmdb-meta-v1")||"{}")).filter(m => m?.poster).length; }
      catch { return 0; }
    })();
    const effectiveOmdb = omdbKey || "548162f0";
    if ((tmdbKey || effectiveOmdb) && cachedPosters < ALL_MOVIES.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleFetchMeta(tmdbKey, effectiveOmdb);
    }
  }, []); // intentional: mount-only, reads localStorage not state

  const handleDownloadPng = async () => {
    const tmdbKey = localStorage.getItem("tmdb-key");
    const omdbKey = localStorage.getItem("omdb-key") || "548162f0";
    if (!tmdbKey && !omdbKey) { setShowTmdbModal(true); return; }
    setPngStatus("fetching");
    let imgs = {};
    try {
      const map = await fetchMovieMeta(tmdbKey, omdbKey);
      setMovieMeta(map);
      imgs = await loadImages(map);
    } catch { /* text-only fallback */ }
    setPngStatus("drawing");
    await new Promise(r => setTimeout(r, 20));
    const canvas = document.createElement("canvas");
    canvas.width = 1920; canvas.height = 1080;
    drawBracket(canvas, { rds, piM, ch, upsets, imgs });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "disney-pixar-bracket.png";
    a.click();
    setPngStatus("done");
    setTimeout(() => setPngStatus(null), 2000);
  };

  const ip = ph==="pi";
  const mu = ip ? piM[piI] : rds[cr]?.[cm];
  const prog = ch ? 100 : (hi.length/69)*100;
  const rl = ip ? "Play-In Round" : (RND[cr]||"");
  const mn = ip ? piI+1 : cm+1;
  const mt = ip ? 6 : (rds[cr]?.length||0);
  const ri = !ip&&cr<=2 ? Math.floor(cm/(cr===0?8:cr===1?4:2)) : -1;
  const rn = ri>=0&&ri<4 ? REG[ri] : "";
  const up = ip ? piM : rds[cr];
  const ui = ip ? piI : cm;

  const pick = (w, pi) => {
    const opponent = mu[0].seed === w.seed ? mu[1] : mu[0];
    const isUpset = w.seed > opponent.seed;
    setAn(w.seed);
    if (isUpset) {
      setUpsets(u => [...u, { winner: w, loser: opponent, round: ip ? "Play-In" : (RND[cr]||""), seedDiff: w.seed - opponent.seed }]);
      setUpFlash(true);
      setTimeout(() => setUpFlash(false), 1500);
    }
    setHi(h => [...h, { p: pi?"pi":"m", i: pi?piI:cm, r: cr, wasUpset: isUpset }]);
    setTimeout(() => {
      setAn(null);
      if (FACTS[w.name]) {
        setFact(FACTS[w.name]);
        setTimeout(() => setFact(null), 4000);
      }
      if (pi) {
        const nm = piM.map((m,i) => { if(i!==piI) return m; const c=[...m]; c.winner=w; return c; });
        setPiM(nm);
        if (piI+1 >= 6) {
          const arr = [...MAIN, ...nm.map(m=>m.winner)];
          setRds([R1.map(([a,b])=>[arr[a],arr[b]])]); setCr(0); setCm(0); setPh("m");
        } else setPiI(piI+1);
      } else {
        const nr = rds.map((r,ri) => r.map((m,mi) => {
          if(ri!==cr||mi!==cm) return m; const c=[...m]; c.winner=w; return c;
        }));
        if (cm+1 >= nr[cr].length) {
          const ws = nr[cr].map(m=>m.winner);
          if (ws.length===1) setCh(w);
          else { const nx=[]; for(let i=0;i<ws.length;i+=2) nx.push([ws[i],ws[i+1]]); nr.push(nx); setCr(cr+1); setCm(0); }
        } else setCm(cm+1);
        setRds(nr);
      }
    }, 320);
  };

  const undo = () => {
    if(!hi.length) return;
    const l = hi[hi.length-1];
    setHi(hi.slice(0,-1));
    setFact(null);
    if (l.wasUpset) setUpsets(u => u.slice(0,-1));
    if(ch) setCh(null);
    if(l.p==="pi") {
      setPiM(piM.map((m,i) => { if(i!==l.i) return m; const c=[...m]; delete c.winner; return c; }));
      setPiI(l.i); setPh("pi"); setRds([]);
    } else {
      const nr = rds.slice(0,l.r+1).map((r,ri) => r.map((m,mi) => {
        if(ri!==l.r||mi!==l.i) return m; const c=[...m]; delete c.winner; return c;
      }));
      setCr(l.r); setCm(l.i); setRds(nr);
    }
  };

  const reset = () => {
    setPh("pi"); setPiM(PIP.map(([a,b])=>[PLAYIN[a],PLAYIN[b]])); setPiI(0);
    setRds([]); setCr(0); setCm(0); setCh(null); setHi([]); setBk(false); setFb(false);
    setUpsets([]); setUpFlash(false); setFact(null); setCopiedLink(false); setCopiedBracket(false);
    saveLS("dbk-state", null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  const exportBracket = () => {
    const lines = ["🎬 Disney × Pixar Bracket Results", ""];
    if (piM.some(m => m.winner)) {
      lines.push("PLAY-IN ROUND");
      piM.forEach(m => {
        if (m.winner) {
          const loser = m[0].seed === m.winner.seed ? m[1] : m[0];
          lines.push(`  ${m.winner.name} def. ${loser.name}`);
        }
      });
      lines.push("");
    }
    rds.forEach((rd, ri) => {
      if (!rd.some(m => m.winner)) return;
      lines.push(ri === 0 ? "ROUND OF 64" : RND[ri].toUpperCase());
      rd.forEach((m, mi) => {
        if (m.winner) {
          const loser = m[0].seed === m.winner.seed ? m[1] : m[0];
          const note = ri === 0 ? ` · ${REG[Math.floor(mi/8)]}` : "";
          lines.push(`  ${m.winner.name} def. ${loser.name}${note}`);
        }
      });
      lines.push("");
    });
    if (ch) {
      lines.push(`CHAMPION: ${ch.name} 👑`);
      lines.push(`  #${ch.seed} seed · ${ch.studio} · ${ch.year}`);
    }
    return lines.join("\n");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    }).catch(() => {});
  };

  const copyBracket = () => {
    navigator.clipboard.writeText(exportBracket()).then(() => {
      setCopiedBracket(true);
      setTimeout(() => setCopiedBracket(false), 1500);
    }).catch(() => {});
  };

  const metaCount = Object.values(movieMeta).filter(m => m?.poster || m?.rating).length;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#06060f,#0e0e24 30%,#180a20 60%,#06060f)", fontFamily:"'Inter',sans-serif", color:"#e0e0f0" }}>
      {showTmdbModal && <TmdbModal onSave={(t,o)=>{ setShowTmdbModal(false); handleFetchMeta(t,o); }} onClose={()=>setShowTmdbModal(false)}/>}
      {showAuthModal && <AuthModal onClose={()=>setShowAuthModal(false)}/>}
      <Dots mob={mob}/>
      <style>{`
        @keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
        @keyframes su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cb{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
        @keyframes wg{0%,100%{text-shadow:0 0 20px rgba(255,215,0,.4)}50%{text-shadow:0 0 50px rgba(255,215,0,.8),0 0 80px rgba(255,215,0,.3)}}
        @keyframes ch{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(.98);opacity:.6}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes pp{0%,100%{border-color:rgba(255,215,0,.15)}50%{border-color:rgba(255,215,0,.4)}}
        @keyframes uf{0%{opacity:0;transform:translateY(-8px) scale(.9)}20%{opacity:1;transform:translateY(0) scale(1)}80%{opacity:1}100%{opacity:0}}
        @media(max-width:600px){
          .mob-btn:active{opacity:.7!important;transform:scale(.97)!important}
          .mob-card:active{transform:scale(.98)!important;opacity:.9!important}
        }
      `}</style>
      <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:mob?"16px 16px 32px":"20px 32px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:mob?20:28 }}>
          <div style={{ fontSize:mob?11:11, letterSpacing:mob?5:7, textTransform:"uppercase", color:"#6a6a8e", marginBottom:mob?4:6 }}>The Ultimate</div>
          <h1 style={{ fontSize:"clamp(28px,5vw,42px)", fontWeight:800, margin:"0 0 4px", background:"linear-gradient(135deg,#4fc3f7,#ce93d8 35%,#ff8a65 65%,#ffd54f)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Disney × Pixar Bracket</h1>
          <div style={{ fontSize:mob?13:13, color:"#7a7a9e" }}>{mob?"70 movies · 69 matchups · 1 champion":"70 movies · 6 play-in games · 69 matchups · 1 champion"}</div>
        </div>
        <div style={{ background:"rgba(255,255,255,.05)", borderRadius:20, height:mob?6:5, marginBottom:mob?6:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${prog}%`, background:"linear-gradient(90deg,#4fc3f7,#ce93d8,#ff8a65,#ffd54f)", borderRadius:20, transition:"width .5s" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:mob?12:11, color:"#6a6a8e", marginBottom:mob?10:14 }}>
          <span>{hi.length}/69 decided</span><span>{rl}{rn?` · ${rn}`:""}</span>
        </div>

        {/* Sync + posters strip */}
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:8, marginBottom:mob?8:10, fontSize:mob?12:11, flexWrap:"wrap" }}>
          {sbUser ? (
            <>
              <span style={{ color:"#6a6a8e" }}>
                {syncStatus==="syncing"?"⏳ Syncing...":syncStatus==="synced"?"✓ Synced":syncStatus==="error"?"⚠ Sync error":"☁ Synced"}
                {" "}{sbUser.email}
              </span>
              <button onClick={()=>supabase.auth.signOut()} style={{ background:"none", border:"none", color:"#5a5a7e", fontSize:mob?12:11, cursor:"pointer" }}>Sign out</button>
            </>
          ) : (
            <button onClick={()=>setShowAuthModal(true)} style={{ background:"none", border:"none", color:"#6a6a8e", fontSize:mob?12:11, cursor:"pointer", letterSpacing:.5 }}>☁ Sync across devices</button>
          )}
          <span style={{ color:"#4a4a65" }}>·</span>
          <button onClick={()=>{ if(tmdbStatus==="fetching") return; if(!localStorage.getItem("tmdb-key")) setShowTmdbModal(true); else handleFetchMeta(); }} style={{ background:"none", border:"none", color:metaCount>0?"#6a6a8e":"#4fc3f7", fontSize:mob?12:11, cursor:"pointer" }}>
            {tmdbStatus==="fetching"?"⏳ Fetching..." : metaCount>0 ? `🎬 ${metaCount} movies loaded` : "🎬 Add posters & ratings"}
          </button>
        </div>

        {/* Full Bracket + Notes toggles */}
        <div style={{ textAlign:"center", marginBottom:mob?14:16, display:"flex", gap:mob?10:8, justifyContent:"center", flexWrap:"wrap" }}>
          <button className={mob?"mob-btn":""} onClick={()=>setFb(!fb)} style={{
            background: fb?"rgba(255,215,0,.12)":"rgba(255,255,255,.04)",
            border: fb?"1px solid rgba(255,215,0,.3)":"1px solid rgba(255,255,255,.08)",
            color: fb?"#ffd54f":"#8a8aae", padding:mob?"10px 18px":"6px 18px", borderRadius:10,
            fontSize:mob?13:12, fontWeight:600, cursor:"pointer", letterSpacing:.5,
            transition:"all .15s", minHeight:mob?48:undefined,
          }}>{fb ? "Hide Bracket" : "📋 Full Bracket"}</button>
          <button className={mob?"mob-btn":""} onClick={()=>setShowNotes(!showNotes)} style={{
            background: showNotes?"rgba(206,147,216,.12)":"rgba(255,255,255,.04)",
            border: showNotes?"1px solid rgba(206,147,216,.3)":"1px solid rgba(255,255,255,.08)",
            color: showNotes?"#ce93d8":"#8a8aae", padding:mob?"10px 18px":"6px 18px", borderRadius:10,
            fontSize:mob?13:12, fontWeight:600, cursor:"pointer", letterSpacing:.5,
            transition:"all .15s", minHeight:mob?48:undefined,
          }}>{showNotes ? "Hide Notes" : "📝 Notes"}</button>
        </div>

        {/* Notes Panel */}
        {showNotes && <NotesPanel mob={mob} notes={notes} updateNote={updateNote}/>}

        {/* Full bracket overlay */}
        {fb && <FullBracket mob={mob} piM={piM} rds={rds} m64={[...MAIN,...piM.map(m=>m.winner).filter(Boolean)]} cr={cr} cm={cm} ip={ip} upsets={upsets}/>}

        {ip && <div style={{ textAlign:"center", marginBottom:mob?16:20, animation:"fi .4s" }}>
          <div style={{ display:"inline-block", padding:mob?"8px 16px":"6px 18px", borderRadius:20, background:"rgba(255,215,0,.08)", border:"1px solid rgba(255,215,0,.2)", animation:"pp 3s ease-in-out infinite", fontSize:mob?13:12, fontWeight:700, color:"#ffd54f", letterSpacing:mob?1:2, textTransform:"uppercase" }}>{mob?"🎬 Play-In Round":"🎬 Play-In — Bottom 12 fight for 6 spots"}</div>
        </div>}

        {ch ? <div style={{ textAlign:"center", animation:"su .5s ease-out", padding:mob?"24px 12px":"40px 20px" }}>
          <div style={{ fontSize:mob?42:56, animation:"cb 2s ease-in-out infinite", marginBottom:mob?8:12 }}>👑</div>
          <div style={{ fontSize:mob?12:11, letterSpacing:mob?4:6, textTransform:"uppercase", color:"#ffd54f", marginBottom:mob?8:10 }}>Your Champion</div>
          <div style={{ fontSize:"clamp(28px,7vw,50px)", fontWeight:800, color:"#ffd54f", animation:"wg 2s ease-in-out infinite", marginBottom:6 }}>{ch.name}</div>
          <div style={{ fontSize:mob?15:15, color:"#9a9abe" }}>{ch.studio} · {ch.year} · #{ch.seed} seed</div>
          {upsets.length > 0 && <div style={{ marginTop:16, fontSize:mob?13:13, color:"#6a6a8e" }}>
            <div>{upsets.length} upset{upsets.length !== 1 ? "s" : ""} picked</div>
            {(() => {
              const big = upsets.reduce((a,b) => b.seedDiff > a.seedDiff ? b : a);
              return <div style={{ fontSize:mob?11:11, color:"#505070", marginTop:4 }}>Biggest: #{big.winner.seed} {big.winner.name} over #{big.loser.seed} {big.loser.name}</div>;
            })()}
          </div>}
          <div style={{ marginTop:mob?24:40, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn mob={mob} p onClick={reset}>Run It Back</Btn>
            <Btn mob={mob} onClick={()=>setBk(!bk)}>{bk?"Hide":"View"} Bracket</Btn>
            <Btn mob={mob} s mu onClick={copyLink}>{copiedLink ? "✓ Linked!" : "🔗 Share"}</Btn>
            <Btn mob={mob} s mu onClick={copyBracket}>{copiedBracket ? "✓ Copied!" : "📋 Export"}</Btn>
            <Btn mob={mob} s mu onClick={handleDownloadPng}>
              {pngStatus==="fetching"?"⏳ Fetching...":pngStatus==="drawing"?"⏳ Drawing...":pngStatus==="done"?"✓ Saved!":"⬇ PNG"}
            </Btn>
          </div>
          {bk && <BV mob={mob} pi={piM} rds={rds}/>}
        </div>

        : mu ? <div key={`${ph}-${ip?piI:`${cr}-${cm}`}`} style={{ animation:"su .3s ease-out" }}>
          <div style={{ textAlign:"center", marginBottom:mob?12:16, fontSize:mob?14:13, color:"#8080a0" }}>Match {mn} of {mt}</div>
          {mob ? (
            <div style={{ display:"flex", flexDirection:"column", gap:0, alignItems:"center" }}>
              <Card mob m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={()=>pick(mu[0],ip)} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"10px 0", width:"100%" }}>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.12))" }}/>
                <span style={{ fontSize:14, fontWeight:800, color:"#5a5a7e", letterSpacing:3 }}>VS</span>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(255,255,255,.12),transparent)" }}/>
              </div>
              <Card mob m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={()=>pick(mu[1],ip)} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0 }}>
              <Card key={mu[0].seed} m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={()=>pick(mu[0],ip)} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
              <div style={{ padding:"0 22px", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ width:1, height:32, background:"linear-gradient(180deg,transparent,rgba(255,255,255,.1))" }}/>
                <span style={{ fontSize:13, fontWeight:800, color:"#3a3a58", letterSpacing:4 }}>VS</span>
                <div style={{ width:1, height:32, background:"linear-gradient(180deg,rgba(255,255,255,.1),transparent)" }}/>
              </div>
              <Card key={mu[1].seed} m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={()=>pick(mu[1],ip)} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
            </div>
          )}
          {upFlash && <div style={{ textAlign:"center", marginTop:12, animation:"uf 1.5s ease-out forwards" }}>
            <span style={{ display:"inline-block", padding:"4px 14px", borderRadius:20, background:"rgba(255,80,80,.12)", border:"1px solid rgba(255,80,80,.25)", fontSize:mob?12:11, fontWeight:700, color:"#ff7070", letterSpacing:2, textTransform:"uppercase" }}>🚨 Upset!</span>
          </div>}
          {fact && <div style={{ margin:mob?"14px 0 0":"14px auto 0", maxWidth:mob?undefined:560, padding:"12px 18px", background:"rgba(255,255,255,.04)", borderRadius:12, border:"1px solid rgba(255,255,255,.07)", fontSize:mob?13:13, color:"#9898b8", fontStyle:"italic", lineHeight:1.6, animation:"su .3s ease-out" }}>
            💡 {fact}
          </div>}
          <div style={{ display:"flex", justifyContent:"center", gap:mob?10:10, marginTop:mob?18:22 }}>
            {hi.length>0 && <Btn mob={mob} s onClick={undo}>← Undo</Btn>}
            <Btn mob={mob} s mu onClick={reset}>Reset</Btn>
            {!ip && <Btn mob={mob} s mu onClick={()=>setBk(!bk)}>{bk?"Hide":"Bracket"}</Btn>}
            {hi.length>0 && <Btn mob={mob} s mu onClick={copyLink}>{copiedLink ? "✓!" : "🔗 Share"}</Btn>}
            {hi.length>0 && <Btn mob={mob} s mu onClick={handleDownloadPng}>
              {pngStatus&&pngStatus!=="done"?"⏳":pngStatus==="done"?"✓!":"⬇ PNG"}
            </Btn>}
          </div>
          {bk&&!ip && <BV mob={mob} pi={piM} rds={rds} cr={cr} cm={cm}/>}
          {!bk && up && ui+1<up.length && <div style={{ marginTop:mob?24:30 }}>
            <div style={{ fontSize:mob?11:10, color:"#5a5a7e", marginBottom:mob?8:8, letterSpacing:2.5, textTransform:"uppercase", fontWeight:700 }}>Up Next</div>
            {up.slice(ui+1,ui+(mob?3:5)).map((m,i) => <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:mob?"8px 12px":"6px 12px", background:"rgba(255,255,255,.025)", borderRadius:8, fontSize:mob?13:12, marginBottom:mob?4:4 }}>
              <span style={{ fontWeight:600, color:"#9898b8", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m[0].name}</span>
              <span style={{ fontSize:mob?10:9, color:"#4a4a65", letterSpacing:2, margin:"0 8px", flexShrink:0 }}>VS</span>
              <span style={{ fontWeight:600, color:"#9898b8", flex:1, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m[1].name}</span>
            </div>)}
          </div>}
        </div> : null}
      </div>
    </div>
  );
}

function Card({ m, h, a, d, onH, onC, notes, updateNote, mob, movieMeta }) {
  const c = CLR[m.studio];
  const [showCardNotes, setShowCardNotes] = useState(false);
  const note = notes?.[m.seed] || "";
  const meta = movieMeta?.[m.seed];
  const hasPoster = !!meta?.poster;
  const panelW = mob ? 66 : 78;
  const rTop = showCardNotes ? (mob ? "14px 14px 0 0" : "16px 16px 0 0") : (mob ? 14 : 16);

  const cardBg = h ? `linear-gradient(135deg,${c.bg} 0%,${c.ac}22 100%)` : `linear-gradient(135deg,${c.bg}f8 0%,${c.bg}dd 100%)`;
  const cardBorder = h ? `1.5px solid ${c.ac}55` : "1.5px solid rgba(255,255,255,.06)";

  return <div style={{
    flex:mob?"1 1 100%":"1 1 320px", maxWidth:mob?undefined:560, width:mob?"100%":undefined,
    // When notes open, outer wrapper becomes the visual container
    background: showCardNotes ? cardBg : "transparent",
    border: showCardNotes ? cardBorder : "none",
    borderRadius: mob?14:16,
    overflow: showCardNotes ? "hidden" : "visible",
    transition:"border-color .18s",
  }}>
    <button className={mob?"mob-card":""} onClick={()=>!d&&onC()}
      onMouseEnter={mob?undefined:()=>onH(m.seed)} onMouseLeave={mob?undefined:()=>onH(null)}
      onTouchStart={mob?()=>onH(m.seed):undefined} onTouchEnd={mob?()=>onH(null):undefined}
      style={{
        width:"100%", padding:0, position:"relative", overflow:"hidden",
        background: showCardNotes ? "transparent" : cardBg,
        border: showCardNotes ? "none" : cardBorder,
        borderRadius: rTop,
        cursor: d?"default":"pointer",
        transition:"all .18s cubic-bezier(.25,.8,.25,1)",
        transform: h&&!a&&!mob?"translateY(-4px)":"none",
        boxShadow: h?`0 ${mob?14:22}px ${mob?36:54}px ${c.gl},inset 0 1px 0 ${c.ac}18`:`0 4px ${mob?14:18}px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.04)`,
        animation: a?"ch .35s ease forwards":"none",
        display:"flex", flexDirection:"row", alignItems:"stretch",
        minHeight: mob?90:108, textAlign:"left",
        WebkitTapHighlightColor:"transparent",
      }}>

      {/* Left panel: full-height poster OR decorative seed number */}
      <div style={{
        width:panelW, flexShrink:0, position:"relative", overflow:"hidden",
        borderRadius: showCardNotes?(mob?"14px 0 0 0":"16px 0 0 0"):(mob?"14px 0 0 14px":"16px 0 0 16px"),
      }}>
        {hasPoster ? <>
          <img src={meta.poster} alt="" style={{
            width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top",
            display:"block", opacity:a?.45:1,
            transition:"opacity .3s, transform .2s",
            transform: h&&!mob?"scale(1.05)":"scale(1)",
          }}/>
          {/* Right-edge blend into card */}
          <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"60%", background:`linear-gradient(90deg,transparent,${c.bg}f0)`, pointerEvents:"none" }}/>
        </> : (
          /* No poster: large faded seed number */
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:`${c.ac}08`, borderRight:`1px solid ${c.ac}10` }}>
            <span style={{ fontSize:mob?30:36, fontWeight:900, color:c.ac, opacity:h?.22:.1, lineHeight:1, userSelect:"none", transition:"opacity .18s", fontVariantNumeric:"tabular-nums" }}>{m.seed}</span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div style={{ flex:1, padding:mob?"11px 12px 11px 10px":"13px 16px 13px 12px", display:"flex", flexDirection:"column", justifyContent:"center", gap:mob?4:5, minWidth:0 }}>

        {/* Top row: seed (when poster) + studio + year + notes dot */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {hasPoster && <span style={{ fontSize:9, fontWeight:800, color:c.ac, opacity:.5, letterSpacing:.5 }}>#{m.seed}</span>}
          <span style={{ padding:"1px 7px", borderRadius:20, background:`${c.ac}18`, color:c.tx, fontSize:9, fontWeight:700, letterSpacing:.4 }}>{m.studio}</span>
          <span style={{ fontSize:10, color:"#52526a" }}>{m.year}</span>
          {note && !showCardNotes && <span style={{ width:5, height:5, borderRadius:"50%", background:"#ce93d8", flexShrink:0, marginLeft:2 }}/>}
        </div>

        {/* Title — 2-line clamp, never truncates with ellipsis on a single line */}
        <div style={{
          fontSize: mob?"clamp(15px,4.2vw,19px)":"clamp(15px,1.85vw,20px)",
          fontWeight:800, color:a?`${c.ac}70`:"#edeeff",
          lineHeight:1.22, letterSpacing:-.25,
          overflow:"hidden", display:"-webkit-box",
          WebkitLineClamp:2, WebkitBoxOrient:"vertical",
          transition:"color .18s",
        }}>{m.name}</div>

        {/* Stats row */}
        <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
          {meta?.runtime && <span style={{ fontSize:10, color:"#50506a", fontVariantNumeric:"tabular-nums" }}>{meta.runtime}</span>}
          {meta?.rating && <span style={{ fontSize:10, color:"#e5b800", fontWeight:700 }}>★ {meta.rating}</span>}
          {m.imdb && <a href={m.imdb} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ padding:"1px 5px", borderRadius:3, background:"#e5b80010", color:"#c49a00", fontSize:9, fontWeight:700, textDecoration:"none", border:"1px solid #e5b80018", letterSpacing:.3 }}>IMDb ↗</a>}
        </div>

        {mob && <div style={{ fontSize:9, color:c.ac, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", opacity:.4 }}>Tap to pick</div>}
      </div>

      {/* Hover: left accent bar */}
      <div style={{ position:"absolute", left:0, top:"15%", bottom:"15%", width:3, background:`linear-gradient(180deg,transparent,${c.ac}cc,transparent)`, borderRadius:2, opacity:h&&!mob?1:0, transition:"opacity .18s" }}/>

      {/* Desktop pick hint */}
      {h&&!mob&&!a && <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:c.ac, fontWeight:700, letterSpacing:1, opacity:.7 }}>Pick →</div>}
    </button>

    <div style={{ textAlign:"center", marginTop:showCardNotes?0:(mob?3:3) }}>
      <button onClick={e=>{e.stopPropagation();setShowCardNotes(!showCardNotes);}} style={{
        background:"transparent", border:"none", color:"#7a7a9e", fontSize:mob?11:10, cursor:"pointer",
        padding:mob?"5px 14px":"2px 8px", letterSpacing:.5, minHeight:mob?32:undefined,
      }}>{showCardNotes ? "hide notes ▲" : "notes ▼"}</button>
    </div>
    {showCardNotes && <CardNotes seed={m.seed} note={note} updateNote={updateNote} ac={c.ac} bg={c.bg} mob={mob} transparent/>}
  </div>;
}

function TmdbModal({ onSave, onClose }) {
  const [tmdb, setTmdb] = useState(localStorage.getItem("tmdb-key") || "");
  const [omdb, setOmdb] = useState(localStorage.getItem("omdb-key") || "548162f0");
  const save = () => {
    if (tmdb.trim()) localStorage.setItem("tmdb-key", tmdb.trim());
    if (omdb.trim()) localStorage.setItem("omdb-key", omdb.trim());
    onSave(tmdb.trim(), omdb.trim());
  };
  return <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ background:"#12122a", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"28px 24px", maxWidth:440, width:"90%", animation:"su .2s" }}>
      <h3 style={{ color:"#f0f0ff", margin:"0 0 6px", fontSize:18 }}>Movie Posters, Ratings & Runtimes</h3>
      <p style={{ color:"#8a8aa8", fontSize:12, margin:"0 0 18px", lineHeight:1.6 }}>Keys stored locally, never sent anywhere else. Both are free.</p>

      <label style={{ display:"block", color:"#9898b8", fontSize:11, marginBottom:4, letterSpacing:.5 }}>
        TMDB API key (v3) — <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" style={{ color:"#4fc3f7" }}>get one here</a>
      </label>
      <input value={tmdb} onChange={e=>setTmdb(e.target.value)}
        placeholder="32-char hex..."
        style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.3)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"9px 12px", color:"#e0e0f0", fontFamily:"monospace", fontSize:12, outline:"none", marginBottom:14 }}/>

      <label style={{ display:"block", color:"#9898b8", fontSize:11, marginBottom:4, letterSpacing:.5 }}>
        OMDB API key — <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer" style={{ color:"#4fc3f7" }}>get one here</a>
        <span style={{ color:"#5a5a7e" }}> (for IMDb ratings + runtimes)</span>
      </label>
      <input value={omdb} onChange={e=>setOmdb(e.target.value)}
        placeholder="8-char hex..."
        style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.3)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"9px 12px", color:"#e0e0f0", fontFamily:"monospace", fontSize:12, outline:"none", marginBottom:18 }}/>

      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <Btn mob={false} s mu onClick={onClose}>Cancel</Btn>
        <Btn mob={false} s onClick={save}>Save & Fetch</Btn>
      </div>
    </div>
  </div>;
}

function AuthModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const sendLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (!error) setSent(true);
  };
  return <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ background:"#12122a", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"28px 24px", maxWidth:380, width:"90%", animation:"su .2s" }}>
      <h3 style={{ color:"#f0f0ff", margin:"0 0 8px", fontSize:18 }}>Sync Across Devices</h3>
      {sent ? (
        <p style={{ color:"#8a8aa8", fontSize:14, lineHeight:1.6 }}>Check your email for a magic link. Close this when you're signed in.</p>
      ) : (
        <>
          <p style={{ color:"#8a8aa8", fontSize:13, margin:"0 0 16px", lineHeight:1.6 }}>Enter your email — we'll send a link. Your bracket and notes sync automatically once you're signed in.</p>
          <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendLink()} type="email" placeholder="you@example.com"
            style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.3)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"10px 12px", color:"#e0e0f0", fontSize:14, outline:"none", marginBottom:16 }}/>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <Btn mob={false} s mu onClick={onClose}>Cancel</Btn>
            <Btn mob={false} s onClick={sendLink}>Send Magic Link</Btn>
          </div>
        </>
      )}
      {sent && <div style={{ marginTop:12, textAlign:"right" }}><Btn mob={false} s mu onClick={onClose}>Close</Btn></div>}
    </div>
  </div>;
}

function CardNotes({ seed, note, updateNote, ac, bg, mob, transparent }) {
  return <div style={{
    background: transparent ? "transparent" : `linear-gradient(155deg,${bg}ee,${bg}cc)`,
    border: transparent ? "none" : `1px solid ${ac}22`,
    borderTop:"none",
    borderRadius: transparent ? 0 : "0 0 14px 14px",
    padding:mob?"10px 14px 14px":"10px 14px 12px",
  }}>
    <textarea
      value={note}
      onChange={e => updateNote(seed, e.target.value)}
      onClick={e => e.stopPropagation()}
      placeholder="Your thoughts..."
      rows={2}
      style={{
        width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.25)", border:"1px solid rgba(255,255,255,.08)",
        borderRadius:8, padding:mob?"8px 10px":"6px 8px", color:"#d0d0e8", fontSize:mob?15:11, fontFamily:"inherit",
        resize:"vertical", outline:"none", lineHeight:1.5,
      }}
      onFocus={e => e.target.style.borderColor=`${ac}44`}
      onBlur={e => e.target.style.borderColor="rgba(255,255,255,.08)"}
    />
  </div>;
}

function NotesPanel({ notes, updateNote, mob }) {
  const [filter, setFilter] = useState("");
  const filtered = BRACKET_ORDER.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()));
  return <div style={{
    marginBottom:mob?20:24, padding:mob?16:20, background:"rgba(255,255,255,.03)", borderRadius:mob?14:16,
    border:"1px solid rgba(206,147,216,.15)", animation:"fi .3s",
  }}>
    <div style={{ marginBottom:mob?12:14 }}>
      <h3 style={{ fontSize:mob?16:15, fontWeight:700, color:"#ce93d8", margin:0, letterSpacing:.5 }}>Movie Notes</h3>
    </div>

    <input
      value={filter}
      onChange={e => setFilter(e.target.value)}
      placeholder="Search movies..."
      style={{
        width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.06)",
        borderRadius:10, padding:mob?"12px 14px":"8px 12px", color:"#d0d0e8", fontSize:mob?16:12, fontFamily:"inherit",
        outline:"none", marginBottom:mob?12:12,
      }}
      onFocus={e => e.target.style.borderColor="rgba(206,147,216,.3)"}
      onBlur={e => e.target.style.borderColor="rgba(255,255,255,.06)"}
    />

    <div style={{ maxHeight:mob?320:400, overflowY:"auto", paddingRight:4, WebkitOverflowScrolling:"touch" }}>
      {filtered.map(m => {
        const note = notes[m.seed] || "";
        const c = CLR[m.studio];
        return <NoteRow key={m.seed} m={m} note={note} c={c} updateNote={updateNote} mob={mob}/>;
      })}
    </div>
  </div>;
}

function NoteRow({ m, note, c, updateNote, mob }) {
  const [open, setOpen] = useState(false);
  return <div style={{
    marginBottom:mob?6:6, background:"rgba(255,255,255,.02)", borderRadius:mob?10:10,
    border:`1px solid ${note?`${c.ac}18`:"rgba(255,255,255,.04)"}`,
  }}>
    <button onClick={()=>setOpen(!open)} style={{
      width:"100%", background:"transparent", border:"none", cursor:"pointer",
      display:"flex", alignItems:"center", gap:mob?8:8, padding:mob?"12px 12px":"8px 12px", textAlign:"left",
      minHeight:mob?48:undefined, WebkitTapHighlightColor:"transparent",
    }}>
      <span style={{ fontSize:mob?10:8, fontWeight:700, color:c.ac, opacity:.6, width:mob?24:24, flexShrink:0 }}>#{m.seed}</span>
      <span style={{ fontSize:mob?14:12, fontWeight:600, color:"#d0d0e8", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.name}</span>
      {!mob && <span style={{ fontSize:9, color:c.tx, opacity:.5 }}>{m.studio} · {m.year}</span>}
      {note && <span style={{ width:6, height:6, borderRadius:"50%", background:"#ce93d8", flexShrink:0 }}/>}
      <span style={{ fontSize:mob?11:9, color:"#6a6a8e", flexShrink:0 }}>{open?"▲":"▼"}</span>
    </button>
    {open && <div style={{ padding:mob?"0 12px 12px":"0 12px 10px" }}>
      <textarea
        value={note}
        onChange={e => updateNote(m.seed, e.target.value)}
        placeholder={`Thoughts on ${m.name}...`}
        rows={2}
        style={{
          width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.06)",
          borderRadius:8, padding:mob?"8px 10px":"6px 8px", color:"#d0d0e8", fontSize:mob?15:11, fontFamily:"inherit",
          resize:"vertical", outline:"none", lineHeight:1.5,
        }}
        onFocus={e => e.target.style.borderColor=`${c.ac}44`}
        onBlur={e => e.target.style.borderColor="rgba(255,255,255,.06)"}
      />
    </div>}
  </div>;
}

function Dots({ mob }) {
  const dots = mob ? DOTS.slice(0, 40) : DOTS;
  return <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
    {dots.map((d,i) => <div key={i} style={{
      position:"absolute", width:d.w, height:d.h,
      background:`rgba(255,255,255,${d.op})`, borderRadius:"50%",
      left:`${d.l}%`, top:`${d.t}%`,
      animation:`tw ${d.dur}s ease-in-out infinite`, animationDelay:`${d.del}s`,
    }}/>)}
  </div>;
}

function Btn({ children, onClick, p, s, mu, mob }) {
  return <button className={mob?"mob-btn":""} onClick={onClick} style={{
    background: p?"linear-gradient(135deg,#4fc3f7,#2196f3)":mu?"rgba(255,255,255,.03)":"rgba(255,255,255,.06)",
    border: p?"none":`1px solid rgba(255,255,255,${mu?.06:.1})`,
    color: p?"#fff":mu?"#6a6a8e":"#b0b0cc",
    padding: s?(mob?"10px 18px":"6px 16px"):(mob?"14px 26px":"10px 24px"), borderRadius:10,
    fontSize: s?(mob?13:12):(mob?15:14), fontWeight:p?700:600, cursor:"pointer",
    minHeight:mob?48:undefined, transition:"all .15s", WebkitTapHighlightColor:"transparent",
  }}>{children}</button>;
}

function BV({ pi, rds, cr, cm, mob }) {
  return <div style={{ marginTop:mob?20:28, padding:mob?14:16, background:"rgba(255,255,255,.03)", borderRadius:mob?12:14, border:"1px solid rgba(255,255,255,.06)", textAlign:"left", animation:"fi .3s" }}>
    <h3 style={{ fontSize:mob?15:14, fontWeight:700, color:"#b8b8d0", margin:mob?"0 0 12px":"0 0 14px", letterSpacing:1 }}>Bracket Results</h3>
    <RB t="Play-In Round" ms={pi} g mob={mob}/>
    {rds.map((r,i) => <RB key={i} t={RND[i]} ms={r} cr={cr} cm={cm} ri={i} mob={mob}/>)}
  </div>;
}

function RB({ t, ms, g, cr, cm, ri, mob }) {
  return <div style={{ marginBottom:mob?14:16 }}>
    <div style={{ fontSize:mob?11:10, letterSpacing:mob?2:2.5, textTransform:"uppercase", color:g?"#ffd54f":"#6a6a8e", marginBottom:mob?6:6, fontWeight:700, opacity:g?.7:1 }}>{t}</div>
    {ms.map((m,mi) => {
      const w=m.winner, cur=ri===cr&&mi===cm;
      return <div key={mi} style={{ display:"flex", alignItems:"center", gap:mob?6:6, fontSize:mob?13:12, padding:mob?"5px 8px":"3px 8px", borderRadius:6, background:cur?"rgba(255,215,0,.08)":"transparent" }}>
        <MN m={m[0]} w={w} r mob={mob}/><span style={{ color:"#3a3a55", fontSize:mob?10:9, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob}/>
      </div>;
    })}
  </div>;
}

function MN({ m, w, r, mob, upset }) {
  const won=w?.seed===m.seed, lost=w&&!won;
  const winColor = upset ? "#ff8a65" : "#ffd54f";
  return <span style={{ color:won?winColor:lost?"#4a4a65":"#8a8aa8", fontWeight:won?700:400, flex:1, textAlign:r?"right":"left", textDecoration:lost?"line-through":"none", opacity:lost?.5:1, overflow:mob?"hidden":undefined, textOverflow:mob?"ellipsis":undefined, whiteSpace:mob?"nowrap":undefined }}>{m.name}</span>;
}

function FullBracket({ piM, rds, m64, cr, cm, ip, mob, upsets }) {
  const hasM64 = m64.length >= 64;
  const r1Display = R1.map(([a,b],i) => {
    if (hasM64) return { a: m64[a], b: m64[b], region: Math.floor(i/8) };
    const ma = a < 58 ? MAIN[a] : null;
    const mb = b < 58 ? MAIN[b] : null;
    return { a: ma, b: mb, region: Math.floor(i/8), aSlot: a, bSlot: b };
  });

  const r1Played = rds[0] || [];

  const regionStyle = { marginBottom:mob?16:20 };
  const headStyle = { fontSize:mob?12:11, letterSpacing:mob?1.5:2, textTransform:"uppercase", fontWeight:700, marginBottom:mob?8:8, paddingBottom:mob?6:6, borderBottom:"1px solid rgba(255,255,255,.06)" };
  const regColors = ["#4fc3f7","#ce93d8","#ff8a65","#ffd54f"];
  const rowFs = mob ? 13 : 12;
  const rowPad = mob ? "5px 8px" : "4px 8px";
  const rowGap = mob ? 6 : 6;
  const vsFs = mob ? 10 : 9;
  const ellipsis = mob ? { overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } : {};

  const piLabel = (slot) => {
    const piIdx = slot - 58;
    const pair = PIP[piIdx];
    if (!pair) return "TBD";
    const a = PLAYIN[pair[0]], b = PLAYIN[pair[1]];
    const match = piM[piIdx];
    if (match?.winner) return match.winner.name;
    return `${a.name} / ${b.name}`;
  };

  return <div style={{ marginBottom:mob?20:28, padding:mob?14:20, background:"rgba(255,255,255,.03)", borderRadius:mob?14:16, border:"1px solid rgba(255,255,255,.06)", animation:"fi .3s" }}>
    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", flexWrap:"wrap", gap:8, margin:"0 0 6px" }}>
      <h3 style={{ fontSize:mob?16:16, fontWeight:700, color:"#d0d0e8", margin:0, letterSpacing:.5 }}>Full Bracket</h3>
      {upsets?.length > 0 && <span style={{ fontSize:mob?11:10, color:"#ff8a65", opacity:.8, letterSpacing:1 }}>⚡ {upsets.length} upset{upsets.length!==1?"s":""}</span>}
    </div>
    <div style={{ fontSize:mob?13:12, color:"#7a7a9e", marginBottom:mob?16:20 }}>{mob?"4 regions · Final Four · Championship":"70 movies · 4 regions · Winners from each region meet in the Final Four"}</div>

    <div style={regionStyle}>
      <div style={{ ...headStyle, color:"#ffd54f", opacity:.8 }}>🎬 Play-In Round</div>
      {piM.map((m,i) => {
        const w = m.winner;
        const isUpset = w && w.seed > (w.seed===m[0].seed ? m[1] : m[0]).seed;
        return <div key={i} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background: ip&&i===0&&!w ? "rgba(255,215,0,.06)" : "transparent" }}>
          <MN m={m[0]} w={w} r mob={mob} upset={isUpset&&w?.seed===m[0].seed}/><span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob} upset={isUpset&&w?.seed===m[1].seed}/>
          {w && <span style={{ fontSize:vsFs, color:isUpset?"#ff8a65":"#ffd54f", opacity:.6, marginLeft:mob?2:4 }}>{isUpset?"⚡":"✓"}</span>}
        </div>;
      })}
    </div>

    {REG.map((regName, regIdx) => {
      const matches = r1Display.slice(regIdx*8, regIdx*8+8);
      const played = r1Played.slice(regIdx*8, regIdx*8+8);
      return <div key={regIdx} style={regionStyle}>
        <div style={{ ...headStyle, color:regColors[regIdx] }}>{regName}</div>
        {matches.map((mu, mi) => {
          const p = played[mi];
          const w = p?.winner;
          const aName = mu.a ? mu.a.name : piLabel(mu.aSlot);
          const bName = mu.b ? mu.b.name : piLabel(mu.bSlot);
          const aSeed = mu.a?.seed;
          const bSeed = mu.b?.seed;
          const isCurrentMatch = !ip && cr===0 && cm===regIdx*8+mi;
          const isUpset = w && w.seed > (w.seed===aSeed ? bSeed : aSeed);
          const winColor = isUpset ? "#ff8a65" : "#ffd54f";
          return <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCurrentMatch?"rgba(255,215,0,.06)":"transparent" }}>
            <span style={{
              flex:1, textAlign:"right", ...ellipsis,
              color: w?.seed===aSeed?winColor : w&&w.seed!==aSeed?"#4a4a65" : p?"#8a8aa8":"#7a7a9e",
              fontWeight: w?.seed===aSeed?700:400,
              textDecoration: w&&w.seed!==aSeed?"line-through":"none",
              opacity: w&&w.seed!==aSeed?.4:1,
              fontStyle: !mu.a?"italic":"normal",
            }}>{!mob&&aSeed?`#${aSeed} `:""}{aName}</span>
            <span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span>
            <span style={{
              flex:1, ...ellipsis,
              color: w?.seed===bSeed?winColor : w&&w.seed!==bSeed?"#4a4a65" : p?"#8a8aa8":"#7a7a9e",
              fontWeight: w?.seed===bSeed?700:400,
              textDecoration: w&&w.seed!==bSeed?"line-through":"none",
              opacity: w&&w.seed!==bSeed?.4:1,
              fontStyle: !mu.b?"italic":"normal",
            }}>{bName}{!mob&&bSeed?` #${bSeed}`:""}</span>
            {w && <span style={{ fontSize:vsFs, color:isUpset?"#ff8a65":"#ffd54f", opacity:.6, marginLeft:2 }}>{isUpset?"⚡":"✓"}</span>}
          </div>;
        })}
      </div>;
    })}

    {rds.slice(1).map((rd, rdIdx) => {
      const roundNum = rdIdx + 1;
      return <div key={roundNum} style={regionStyle}>
        <div style={{ ...headStyle, color:"#b8b8d0" }}>{RND[roundNum]}</div>
        {rd.map((m, mi) => {
          const w = m.winner;
          const isUpset = w && w.seed > (w.seed===m[0].seed ? m[1] : m[0]).seed;
          const isCur = !ip && cr===roundNum && cm===mi;
          return <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCur?"rgba(255,215,0,.06)":"transparent" }}>
            <MN m={m[0]} w={w} r mob={mob} upset={isUpset&&w?.seed===m[0].seed}/><span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob} upset={isUpset&&w?.seed===m[1].seed}/>
            {w && <span style={{ fontSize:vsFs, color:isUpset?"#ff8a65":"#ffd54f", opacity:.6, marginLeft:2 }}>{isUpset?"⚡":"✓"}</span>}
          </div>;
        })}
      </div>;
    })}
  </div>;
}
