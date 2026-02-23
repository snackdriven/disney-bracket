import { useState, useEffect } from "react";

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
const REG = ["Legends & Legacies","Heart & Heartbreak","Magic & Mischief","Worlds Apart"];
const CLR = {
  Disney: { bg:"#0d1b3e", ac:"#4fc3f7", gl:"rgba(79,195,247,.25)", tx:"#7ec8f0" },
  Pixar: { bg:"#3e1a0d", ac:"#ff8a65", gl:"rgba(255,138,101,.25)", tx:"#ffab91" },
};

const ALL_MOVIES = [...MAIN, ...PLAYIN];

const loadLS = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const saveLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const serMatch = (ms) => ms.map(m => ({ p: [m[0], m[1]], w: m.winner || null }));
const desMatch = (ms) => ms.map(({ p, w }) => { const m = [p[0], p[1]]; if (w) m.winner = w; return m; });

export default function App() {
  const mob = useIsMobile();

  // Load saved bracket state once
  const [init] = useState(() => {
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

  // Persist bracket state
  useEffect(() => {
    saveLS("dbk-state", { ph, piM: serMatch(piM), piI, rds: rds.map(r => serMatch(r)), cr, cm, ch, hi });
  }, [ph, piM, piI, rds, cr, cm, ch, hi]);

  // Notes state (persisted to localStorage)
  const [notes, setNotes] = useState(() => {
    const raw = loadLS("dbk-notes", {});
    // Migrate old two-person format { seed: { 0: text, 1: text } } to single string
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

  const pick = (w, pi) => {
    setAn(w.seed);
    setHi(h => [...h, { p: pi?"pi":"m", i: pi?piI:cm, r: cr }]);
    setTimeout(() => {
      setAn(null);
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

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#06060f,#0e0e24 30%,#180a20 60%,#06060f)", fontFamily:"'Inter',sans-serif", color:"#e0e0f0" }}>
      <Dots mob={mob}/>
      <style>{`
        @keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
        @keyframes su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cb{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
        @keyframes wg{0%,100%{text-shadow:0 0 20px rgba(255,215,0,.4)}50%{text-shadow:0 0 50px rgba(255,215,0,.8),0 0 80px rgba(255,215,0,.3)}}
        @keyframes ch{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(.98);opacity:.6}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes pp{0%,100%{border-color:rgba(255,215,0,.15)}50%{border-color:rgba(255,215,0,.4)}}
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
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:mob?12:11, color:"#6a6a8e", marginBottom:mob?18:24 }}>
          <span>{hi.length}/69 decided</span><span>{rl}{rn?` · ${rn}`:""}</span>
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
        {fb && <FullBracket mob={mob} piM={piM} rds={rds} m64={[...MAIN,...piM.map(m=>m.winner).filter(Boolean)]} cr={cr} cm={cm} ip={ip}/>}

        {ip && <div style={{ textAlign:"center", marginBottom:mob?16:20, animation:"fi .4s" }}>
          <div style={{ display:"inline-block", padding:mob?"8px 16px":"6px 18px", borderRadius:20, background:"rgba(255,215,0,.08)", border:"1px solid rgba(255,215,0,.2)", animation:"pp 3s ease-in-out infinite", fontSize:mob?13:12, fontWeight:700, color:"#ffd54f", letterSpacing:mob?1:2, textTransform:"uppercase" }}>{mob?"🎬 Play-In Round":"🎬 Play-In — Bottom 12 fight for 6 spots"}</div>
        </div>}

        {ch ? <div style={{ textAlign:"center", animation:"su .5s ease-out", padding:mob?"24px 12px":"40px 20px" }}>
          <div style={{ fontSize:mob?42:56, animation:"cb 2s ease-in-out infinite", marginBottom:mob?8:12 }}>👑</div>
          <div style={{ fontSize:mob?12:11, letterSpacing:mob?4:6, textTransform:"uppercase", color:"#ffd54f", marginBottom:mob?8:10 }}>Your Champion</div>
          <div style={{ fontSize:"clamp(28px,7vw,50px)", fontWeight:800, color:"#ffd54f", animation:"wg 2s ease-in-out infinite", marginBottom:6 }}>{ch.name}</div>
          <div style={{ fontSize:mob?15:15, color:"#9a9abe" }}>{ch.studio} · {ch.year} · #{ch.seed} seed</div>
          <div style={{ marginTop:mob?24:40, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn mob={mob} p onClick={reset}>Run It Back</Btn>
            <Btn mob={mob} onClick={()=>setBk(!bk)}>{bk?"Hide":"View"} Bracket</Btn>
          </div>
          {bk && <BV mob={mob} pi={piM} rds={rds}/>}
        </div>

        : mu ? <div key={`${ph}-${ip?piI:`${cr}-${cm}`}`} style={{ animation:"su .3s ease-out" }}>
          <div style={{ textAlign:"center", marginBottom:mob?12:16, fontSize:mob?14:13, color:"#8080a0" }}>Match {mn} of {mt}</div>
          {mob ? (
            <div style={{ display:"flex", flexDirection:"column", gap:0, alignItems:"center" }}>
              <Card mob m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={()=>pick(mu[0],ip)} notes={notes} updateNote={updateNote}/>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"10px 0", width:"100%" }}>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.12))" }}/>
                <span style={{ fontSize:14, fontWeight:800, color:"#5a5a7e", letterSpacing:3 }}>VS</span>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(255,255,255,.12),transparent)" }}/>
              </div>
              <Card mob m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={()=>pick(mu[1],ip)} notes={notes} updateNote={updateNote}/>
            </div>
          ) : (
            <>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
                {[mu[0],mu[1]].map(mv => <Card key={mv.seed} m={mv} h={hv===mv.seed} a={an===mv.seed} d={!!an} onH={setHv} onC={()=>pick(mv,ip)} notes={notes} updateNote={updateNote}/>)}
              </div>
              <div style={{ textAlign:"center", marginTop:14 }}><span style={{ fontSize:18, fontWeight:800, color:"#2a2a44", letterSpacing:4 }}>VS</span></div>
            </>
          )}
          <div style={{ display:"flex", justifyContent:"center", gap:mob?10:10, marginTop:mob?18:22 }}>
            {hi.length>0 && <Btn mob={mob} s onClick={undo}>← Undo</Btn>}
            <Btn mob={mob} s mu onClick={reset}>Reset</Btn>
            {!ip && <Btn mob={mob} s mu onClick={()=>setBk(!bk)}>{bk?"Hide":"Bracket"}</Btn>}
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

function Card({ m, h, a, d, onH, onC, notes, updateNote, mob }) {
  const c = CLR[m.studio];
  const [showCardNotes, setShowCardNotes] = useState(false);
  const note = notes?.[m.seed] || "";
  return <div style={{ flex:mob?"1 1 100%":"1 1 320px", maxWidth:mob?undefined:560, width:mob?"100%":undefined }}>
    <button className={mob?"mob-card":""} onClick={()=>!d&&onC()} onMouseEnter={mob?undefined:()=>onH(m.seed)} onMouseLeave={mob?undefined:()=>onH(null)} onTouchStart={mob?()=>onH(m.seed):undefined} onTouchEnd={mob?()=>onH(null):undefined} style={{
      width:"100%",
      background: h?`linear-gradient(155deg,${c.bg},${c.ac}18)`:`linear-gradient(155deg,${c.bg},${c.bg}dd)`,
      border: h?`2px solid ${c.ac}`:"2px solid rgba(255,255,255,.08)",
      borderRadius: showCardNotes?(mob?"16px 16px 0 0":"18px 18px 0 0"):(mob?16:18),
      padding:mob?"26px 20px 22px":"32px 24px 28px", cursor:d?"default":"pointer",
      transition:"all .15s", transform:h&&!a&&!mob?"translateY(-3px)":"none",
      boxShadow:h?`0 ${mob?8:10}px ${mob?24:36}px ${c.gl}`:`0 4px ${mob?12:16}px rgba(0,0,0,.3)`,
      animation:a?"ch .35s ease forwards":"none",
      display:"flex", flexDirection:"column", alignItems:"center", gap:mob?8:10, textAlign:"center", position:"relative",
      WebkitTapHighlightColor:"transparent",
    }}>
      <div style={{ position:"absolute", top:mob?10:10, left:mob?12:12, fontSize:mob?11:10, fontWeight:700, color:c.ac, opacity:.7, letterSpacing:1 }}>#{m.seed}</div>
      <div style={{ fontSize:mob?"clamp(20px,5.5vw,26px)":"clamp(20px,3.5vw,27px)", fontWeight:800, color:"#f0f0ff", lineHeight:1.25, marginTop:mob?4:4 }}>{m.name}</div>
      <div style={{ display:"flex", gap:8, alignItems:"center", fontSize:mob?13:12, color:"#9898b8" }}>
        <span style={{ padding:mob?"3px 10px":"2px 8px", borderRadius:16, background:`${c.ac}18`, color:c.tx, fontSize:mob?11:10, fontWeight:700 }}>{m.studio}</span>
        <span>{m.year}</span>
        {m.imdb && <a href={m.imdb} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ padding:mob?"3px 8px":"2px 6px", borderRadius:16, background:"#f5c51822", color:"#f5c518", fontSize:mob?11:10, fontWeight:700, textDecoration:"none", letterSpacing:.5 }}>IMDb</a>}
      </div>
      {note && !showCardNotes && <div style={{ fontSize:mob?11:9, color:"#9a9abe", opacity:.8, letterSpacing:1 }}>has notes</div>}
      {h && !mob && <div style={{ position:"absolute", bottom:10, fontSize:10, color:c.ac, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", opacity:.7 }}>Pick →</div>}
      {mob && <div style={{ fontSize:12, color:c.ac, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", opacity:.6 }}>Tap to pick</div>}
    </button>
    <div style={{ textAlign:"center", marginTop: showCardNotes?0:mob?4:4 }}>
      <button onClick={(e)=>{e.stopPropagation();setShowCardNotes(!showCardNotes);}} style={{
        background:"transparent", border:"none", color:"#7a7a9e", fontSize:mob?12:10, cursor:"pointer",
        padding:mob?"6px 14px":"2px 8px", letterSpacing:.5, minHeight:mob?36:undefined,
      }}>{showCardNotes ? "hide notes ▲" : "notes ▼"}</button>
    </div>
    {showCardNotes && <CardNotes seed={m.seed} note={note} updateNote={updateNote} ac={c.ac} bg={c.bg} mob={mob}/>}
  </div>;
}

function CardNotes({ seed, note, updateNote, ac, bg, mob }) {
  return <div style={{
    background:`linear-gradient(155deg,${bg}ee,${bg}cc)`, border:`1px solid ${ac}22`, borderTop:"none",
    borderRadius:"0 0 14px 14px", padding:mob?"10px 14px 14px":"10px 14px 12px",
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
  const filtered = ALL_MOVIES.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()));
  return <div style={{
    marginBottom:mob?20:24, padding:mob?16:20, background:"rgba(255,255,255,.03)", borderRadius:mob?14:16,
    border:"1px solid rgba(206,147,216,.15)", animation:"fi .3s",
  }}>
    <div style={{ marginBottom:mob?12:14 }}>
      <h3 style={{ fontSize:mob?16:15, fontWeight:700, color:"#ce93d8", margin:0, letterSpacing:.5 }}>Movie Notes</h3>
    </div>

    {/* Search */}
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

    {/* Movie list with notes */}
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
  const count = mob ? 40 : 80;
  return <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
    {Array.from({length:count}).map((_,i) => <div key={i} style={{
      position:"absolute", width:Math.random()*2.5+.5, height:Math.random()*2.5+.5,
      background:`rgba(255,255,255,${Math.random()*.5+.15})`, borderRadius:"50%",
      left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
      animation:`tw ${Math.random()*4+2}s ease-in-out infinite`, animationDelay:`${Math.random()*4}s`,
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

function MN({ m, w, r, mob }) {
  const won=w?.seed===m.seed, lost=w&&!won;
  return <span style={{ color:won?"#ffd54f":lost?"#4a4a65":"#8a8aa8", fontWeight:won?700:400, flex:1, textAlign:r?"right":"left", textDecoration:lost?"line-through":"none", opacity:lost?.5:1, overflow:mob?"hidden":undefined, textOverflow:mob?"ellipsis":undefined, whiteSpace:mob?"nowrap":undefined }}>{m.name}</span>;
}

function FullBracket({ piM, rds, m64, cr, cm, ip, mob }) {
  // Build the full R1 matchup list with names, using m64 if available
  const hasM64 = m64.length >= 64;
  const r1Display = R1.map(([a,b],i) => {
    if (hasM64) return { a: m64[a], b: m64[b], region: Math.floor(i/8) };
    // Before play-ins done, show main seeds and "TBD" for play-in slots
    const ma = a < 58 ? MAIN[a] : null;
    const mb = b < 58 ? MAIN[b] : null;
    return { a: ma, b: mb, region: Math.floor(i/8), aSlot: a, bSlot: b };
  });

  // Get played round data
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
    <h3 style={{ fontSize:mob?16:16, fontWeight:700, color:"#d0d0e8", margin:"0 0 6px", letterSpacing:.5 }}>Full Bracket</h3>
    <div style={{ fontSize:mob?13:12, color:"#7a7a9e", marginBottom:mob?16:20 }}>{mob?"4 regions · Final Four · Championship":"70 movies · 4 regions · Winners from each region meet in the Final Four"}</div>

    {/* Play-In */}
    <div style={regionStyle}>
      <div style={{ ...headStyle, color:"#ffd54f", opacity:.8 }}>🎬 Play-In Round</div>
      {piM.map((m,i) => {
        const w = m.winner;
        return <div key={i} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background: ip&&i===0&&!w ? "rgba(255,215,0,.06)" : "transparent" }}>
          <MN m={m[0]} w={w} r mob={mob}/><span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob}/>
          {w && <span style={{ fontSize:vsFs, color:"#ffd54f", opacity:.6, marginLeft:mob?2:4 }}>✓</span>}
        </div>;
      })}
    </div>

    {/* R1 by region */}
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
          return <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCurrentMatch?"rgba(255,215,0,.06)":"transparent" }}>
            <span style={{
              flex:1, textAlign:"right", ...ellipsis,
              color: w?.seed===aSeed?"#ffd54f" : w&&w.seed!==aSeed?"#4a4a65" : p?"#8a8aa8":"#7a7a9e",
              fontWeight: w?.seed===aSeed?700:400,
              textDecoration: w&&w.seed!==aSeed?"line-through":"none",
              opacity: w&&w.seed!==aSeed?.4:1,
              fontStyle: !mu.a?"italic":"normal",
            }}>{!mob&&aSeed?`#${aSeed} `:""}{aName}</span>
            <span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span>
            <span style={{
              flex:1, ...ellipsis,
              color: w?.seed===bSeed?"#ffd54f" : w&&w.seed!==bSeed?"#4a4a65" : p?"#8a8aa8":"#7a7a9e",
              fontWeight: w?.seed===bSeed?700:400,
              textDecoration: w&&w.seed!==bSeed?"line-through":"none",
              opacity: w&&w.seed!==bSeed?.4:1,
              fontStyle: !mu.b?"italic":"normal",
            }}>{bName}{!mob&&bSeed?` #${bSeed}`:""}</span>
            {w && <span style={{ fontSize:vsFs, color:"#ffd54f", opacity:.6, marginLeft:2 }}>✓</span>}
          </div>;
        })}
      </div>;
    })}

    {/* Later rounds */}
    {rds.slice(1).map((rd, rdIdx) => {
      const roundNum = rdIdx + 1;
      return <div key={roundNum} style={regionStyle}>
        <div style={{ ...headStyle, color:"#b8b8d0" }}>{RND[roundNum]}</div>
        {rd.map((m, mi) => {
          const w = m.winner;
          const isCur = !ip && cr===roundNum && cm===mi;
          return <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCur?"rgba(255,215,0,.06)":"transparent" }}>
            <MN m={m[0]} w={w} r mob={mob}/><span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob}/>
            {w && <span style={{ fontSize:vsFs, color:"#ffd54f", opacity:.6, marginLeft:2 }}>✓</span>}
          </div>;
        })}
      </div>;
    })}
  </div>;
}
