import { useState } from "react";

const MAIN = [
  { seed:1, name:"The Lion King", year:1994, studio:"Disney" },
  { seed:2, name:"Toy Story", year:1995, studio:"Pixar" },
  { seed:3, name:"Finding Nemo", year:2003, studio:"Pixar" },
  { seed:4, name:"Beauty and the Beast", year:1991, studio:"Disney" },
  { seed:5, name:"The Little Mermaid", year:1989, studio:"Disney" },
  { seed:6, name:"Up", year:2009, studio:"Pixar" },
  { seed:7, name:"Aladdin", year:1992, studio:"Disney" },
  { seed:8, name:"Inside Out", year:2015, studio:"Pixar" },
  { seed:9, name:"Coco", year:2017, studio:"Pixar" },
  { seed:10, name:"Frozen", year:2013, studio:"Disney" },
  { seed:11, name:"The Incredibles", year:2004, studio:"Pixar" },
  { seed:12, name:"WALL·E", year:2008, studio:"Pixar" },
  { seed:13, name:"Mulan", year:1998, studio:"Disney" },
  { seed:14, name:"Tangled", year:2010, studio:"Disney" },
  { seed:15, name:"Monsters, Inc.", year:2001, studio:"Pixar" },
  { seed:16, name:"Moana", year:2016, studio:"Disney" },
  { seed:17, name:"Ratatouille", year:2007, studio:"Pixar" },
  { seed:18, name:"Toy Story 3", year:2010, studio:"Pixar" },
  { seed:19, name:"Lilo & Stitch", year:2002, studio:"Disney" },
  { seed:20, name:"The Emperor's New Groove", year:2000, studio:"Disney" },
  { seed:21, name:"Cinderella", year:1950, studio:"Disney" },
  { seed:22, name:"Hercules", year:1997, studio:"Disney" },
  { seed:23, name:"Sleeping Beauty", year:1959, studio:"Disney" },
  { seed:24, name:"Encanto", year:2021, studio:"Disney" },
  { seed:25, name:"Soul", year:2020, studio:"Pixar" },
  { seed:26, name:"Zootopia", year:2016, studio:"Disney" },
  { seed:27, name:"Bambi", year:1942, studio:"Disney" },
  { seed:28, name:"Wreck-It Ralph", year:2012, studio:"Disney" },
  { seed:29, name:"Tarzan", year:1999, studio:"Disney" },
  { seed:30, name:"The Jungle Book", year:1967, studio:"Disney" },
  { seed:31, name:"Brave", year:2012, studio:"Pixar" },
  { seed:32, name:"Toy Story 2", year:1999, studio:"Pixar" },
  { seed:33, name:"Toy Story 4", year:2019, studio:"Pixar" },
  { seed:34, name:"Lady and the Tramp", year:1955, studio:"Disney" },
  { seed:35, name:"101 Dalmatians", year:1961, studio:"Disney" },
  { seed:36, name:"Peter Pan", year:1953, studio:"Disney" },
  { seed:37, name:"The Hunchback of Notre Dame", year:1996, studio:"Disney" },
  { seed:38, name:"Snow White", year:1937, studio:"Disney" },
  { seed:39, name:"Big Hero 6", year:2014, studio:"Disney" },
  { seed:40, name:"Raya and the Last Dragon", year:2021, studio:"Disney" },
  { seed:41, name:"Cars", year:2006, studio:"Pixar" },
  { seed:42, name:"Pinocchio", year:1940, studio:"Disney" },
  { seed:43, name:"Fantasia", year:1940, studio:"Disney" },
  { seed:44, name:"Luca", year:2021, studio:"Pixar" },
  { seed:45, name:"Pocahontas", year:1995, studio:"Disney" },
  { seed:46, name:"Alice in Wonderland", year:1951, studio:"Disney" },
  { seed:47, name:"Inside Out 2", year:2024, studio:"Pixar" },
  { seed:48, name:"The Princess and the Frog", year:2009, studio:"Disney" },
  { seed:49, name:"A Bug's Life", year:1998, studio:"Pixar" },
  { seed:50, name:"Dumbo", year:1941, studio:"Disney" },
  { seed:51, name:"Robin Hood", year:1973, studio:"Disney" },
  { seed:52, name:"Monsters University", year:2013, studio:"Pixar" },
  { seed:53, name:"Treasure Planet", year:2002, studio:"Disney" },
  { seed:54, name:"Atlantis: The Lost Empire", year:2001, studio:"Disney" },
  { seed:55, name:"The Great Mouse Detective", year:1986, studio:"Disney" },
  { seed:56, name:"The Rescuers Down Under", year:1990, studio:"Disney" },
  { seed:57, name:"The Sword in the Stone", year:1963, studio:"Disney" },
  { seed:58, name:"The Aristocats", year:1970, studio:"Disney" },
];

const PLAYIN = [
  { seed:59, name:"Bolt", year:2008, studio:"Disney" },
  { seed:60, name:"Meet the Robinsons", year:2007, studio:"Disney" },
  { seed:61, name:"Brother Bear", year:2003, studio:"Disney" },
  { seed:62, name:"The Rescuers", year:1977, studio:"Disney" },
  { seed:63, name:"Oliver & Company", year:1988, studio:"Disney" },
  { seed:64, name:"Elemental", year:2023, studio:"Pixar" },
  { seed:65, name:"Turning Red", year:2022, studio:"Pixar" },
  { seed:66, name:"Onward", year:2020, studio:"Pixar" },
  { seed:67, name:"Chicken Little", year:2005, studio:"Disney" },
  { seed:68, name:"Incredibles 2", year:2018, studio:"Pixar" },
  { seed:69, name:"Ralph Breaks the Internet", year:2018, studio:"Disney" },
  { seed:70, name:"The Good Dinosaur", year:2015, studio:"Pixar" },
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

export default function App() {
  const [ph, setPh] = useState("pi");
  const [piM, setPiM] = useState(() => PIP.map(([a,b]) => [PLAYIN[a], PLAYIN[b]]));
  const [piI, setPiI] = useState(0);
  const [rds, setRds] = useState([]);
  const [cr, setCr] = useState(0);
  const [cm, setCm] = useState(0);
  const [ch, setCh] = useState(null);
  const [hv, setHv] = useState(null);
  const [an, setAn] = useState(null);
  const [bk, setBk] = useState(false);
  const [fb, setFb] = useState(false);
  const [hi, setHi] = useState([]);

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
      <Dots/>
      <style>{`
        @keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
        @keyframes su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cb{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
        @keyframes wg{0%,100%{text-shadow:0 0 20px rgba(255,215,0,.4)}50%{text-shadow:0 0 50px rgba(255,215,0,.8),0 0 80px rgba(255,215,0,.3)}}
        @keyframes ch{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(.98);opacity:.6}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes pp{0%,100%{border-color:rgba(255,215,0,.15)}50%{border-color:rgba(255,215,0,.4)}}
      `}</style>
      <div style={{ position:"relative", zIndex:1, maxWidth:780, margin:"0 auto", padding:"20px 16px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:11, letterSpacing:7, textTransform:"uppercase", color:"#5a5a7e", marginBottom:6 }}>The Ultimate</div>
          <h1 style={{ fontSize:"clamp(26px,5vw,42px)", fontWeight:800, margin:"0 0 4px", background:"linear-gradient(135deg,#4fc3f7,#ce93d8 35%,#ff8a65 65%,#ffd54f)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Disney × Pixar Bracket</h1>
          <div style={{ fontSize:13, color:"#6a6a8e" }}>70 movies · 6 play-in games · 69 matchups · 1 champion</div>
        </div>
        <div style={{ background:"rgba(255,255,255,.05)", borderRadius:20, height:5, marginBottom:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${prog}%`, background:"linear-gradient(90deg,#4fc3f7,#ce93d8,#ff8a65,#ffd54f)", borderRadius:20, transition:"width .5s" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#555578", marginBottom:24 }}>
          <span>{hi.length}/69 decided</span><span>{rl}{rn?` · ${rn}`:""}</span>
        </div>

        {/* Full Bracket toggle - always visible */}
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <button onClick={()=>setFb(!fb)} style={{
            background: fb?"rgba(255,215,0,.12)":"rgba(255,255,255,.04)",
            border: fb?"1px solid rgba(255,215,0,.3)":"1px solid rgba(255,255,255,.08)",
            color: fb?"#ffd54f":"#7a7a9e", padding:"6px 18px", borderRadius:10,
            fontSize:12, fontWeight:600, cursor:"pointer", letterSpacing:.5,
            transition:"all .2s",
          }}>{fb ? "Hide Full Bracket" : "📋 View Full Bracket"}</button>
        </div>

        {/* Full bracket overlay */}
        {fb && <FullBracket piM={piM} rds={rds} m64={[...MAIN,...piM.map(m=>m.winner).filter(Boolean)]} cr={cr} cm={cm} ip={ip}/>}

        {ip && <div style={{ textAlign:"center", marginBottom:20, animation:"fi .4s" }}>
          <div style={{ display:"inline-block", padding:"6px 18px", borderRadius:20, background:"rgba(255,215,0,.08)", border:"1px solid rgba(255,215,0,.2)", animation:"pp 3s ease-in-out infinite", fontSize:12, fontWeight:700, color:"#ffd54f", letterSpacing:2, textTransform:"uppercase" }}>🎬 Play-In — Bottom 12 fight for 6 spots</div>
        </div>}

        {ch ? <div style={{ textAlign:"center", animation:"su .5s ease-out", padding:"40px 20px" }}>
          <div style={{ fontSize:56, animation:"cb 2s ease-in-out infinite", marginBottom:12 }}>👑</div>
          <div style={{ fontSize:11, letterSpacing:6, textTransform:"uppercase", color:"#ffd54f", marginBottom:10 }}>Your Champion</div>
          <div style={{ fontSize:"clamp(30px,6vw,50px)", fontWeight:800, color:"#ffd54f", animation:"wg 2s ease-in-out infinite", marginBottom:6 }}>{ch.name}</div>
          <div style={{ fontSize:15, color:"#9090ae" }}>{ch.studio} · {ch.year} · #{ch.seed} seed</div>
          <div style={{ marginTop:40, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn p onClick={reset}>Run It Back</Btn>
            <Btn onClick={()=>setBk(!bk)}>{bk?"Hide":"View"} Full Bracket</Btn>
          </div>
          {bk && <BV pi={piM} rds={rds}/>}
        </div>

        : mu ? <div key={`${ph}-${ip?piI:`${cr}-${cm}`}`} style={{ animation:"su .3s ease-out" }}>
          <div style={{ textAlign:"center", marginBottom:16, fontSize:13, color:"#707090" }}>Match {mn} of {mt}</div>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
            {[mu[0],mu[1]].map(mv => <Card key={mv.seed} m={mv} h={hv===mv.seed} a={an===mv.seed} d={!!an} onH={setHv} onC={()=>pick(mv,ip)}/>)}
          </div>
          <div style={{ textAlign:"center", marginTop:14 }}><span style={{ fontSize:18, fontWeight:800, color:"#2a2a44", letterSpacing:4 }}>VS</span></div>
          <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:22 }}>
            {hi.length>0 && <Btn s onClick={undo}>← Undo</Btn>}
            <Btn s mu onClick={reset}>Reset</Btn>
            {!ip && <Btn s mu onClick={()=>setBk(!bk)}>{bk?"Hide":"Bracket"}</Btn>}
          </div>
          {bk&&!ip && <BV pi={piM} rds={rds} cr={cr} cm={cm}/>}
          {!bk && up && ui+1<up.length && <div style={{ marginTop:30 }}>
            <div style={{ fontSize:10, color:"#4a4a6e", marginBottom:8, letterSpacing:2.5, textTransform:"uppercase", fontWeight:700 }}>Up Next</div>
            {up.slice(ui+1,ui+5).map((m,i) => <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 12px", background:"rgba(255,255,255,.025)", borderRadius:8, fontSize:12, marginBottom:4 }}>
              <span style={{ fontWeight:600, color:"#8888a8", flex:1 }}>{m[0].name}</span>
              <span style={{ fontSize:9, color:"#3a3a55", letterSpacing:2, margin:"0 8px" }}>VS</span>
              <span style={{ fontWeight:600, color:"#8888a8", flex:1, textAlign:"right" }}>{m[1].name}</span>
            </div>)}
          </div>}
        </div> : null}
      </div>
    </div>
  );
}

function Card({ m, h, a, d, onH, onC }) {
  const c = CLR[m.studio];
  return <button onClick={()=>!d&&onC()} onMouseEnter={()=>onH(m.seed)} onMouseLeave={()=>onH(null)} style={{
    flex:"1 1 260px", maxWidth:340,
    background: h?`linear-gradient(155deg,${c.bg},${c.ac}18)`:`linear-gradient(155deg,${c.bg},${c.bg}dd)`,
    border: h?`2px solid ${c.ac}`:"2px solid rgba(255,255,255,.06)",
    borderRadius:18, padding:"32px 24px 28px", cursor:d?"default":"pointer",
    transition:"all .2s", transform:h&&!a?"translateY(-3px)":"none",
    boxShadow:h?`0 10px 36px ${c.gl}`:"0 4px 16px rgba(0,0,0,.3)",
    animation:a?"ch .35s ease forwards":"none",
    display:"flex", flexDirection:"column", alignItems:"center", gap:10, textAlign:"center", position:"relative",
  }}>
    <div style={{ position:"absolute", top:10, left:12, fontSize:10, fontWeight:700, color:c.ac, opacity:.6, letterSpacing:1 }}>#{m.seed}</div>
    <div style={{ fontSize:"clamp(20px,3.5vw,27px)", fontWeight:800, color:"#f0f0ff", lineHeight:1.2, marginTop:4 }}>{m.name}</div>
    <div style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, color:"#8888aa" }}>
      <span style={{ padding:"2px 8px", borderRadius:16, background:`${c.ac}18`, color:c.tx, fontSize:10, fontWeight:700 }}>{m.studio}</span>
      <span>{m.year}</span>
    </div>
    {h && <div style={{ position:"absolute", bottom:10, fontSize:10, color:c.ac, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", opacity:.7 }}>Pick →</div>}
  </button>;
}

function Dots() {
  return <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
    {Array.from({length:80}).map((_,i) => <div key={i} style={{
      position:"absolute", width:Math.random()*2.5+.5, height:Math.random()*2.5+.5,
      background:`rgba(255,255,255,${Math.random()*.5+.15})`, borderRadius:"50%",
      left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
      animation:`tw ${Math.random()*4+2}s ease-in-out infinite`, animationDelay:`${Math.random()*4}s`,
    }}/>)}
  </div>;
}

function Btn({ children, onClick, p, s, mu }) {
  return <button onClick={onClick} style={{
    background: p?"linear-gradient(135deg,#4fc3f7,#2196f3)":mu?"rgba(255,255,255,.03)":"rgba(255,255,255,.06)",
    border: p?"none":`1px solid rgba(255,255,255,${mu?.06:.1})`,
    color: p?"#fff":mu?"#5a5a7e":"#a0a0be",
    padding: s?"6px 16px":"10px 24px", borderRadius:10,
    fontSize: s?12:14, fontWeight:p?700:600, cursor:"pointer",
  }}>{children}</button>;
}

function BV({ pi, rds, cr, cm }) {
  return <div style={{ marginTop:28, padding:16, background:"rgba(255,255,255,.03)", borderRadius:14, border:"1px solid rgba(255,255,255,.06)", textAlign:"left", animation:"fi .3s" }}>
    <h3 style={{ fontSize:14, fontWeight:700, color:"#b0b0cc", margin:"0 0 14px", letterSpacing:1 }}>Bracket Results</h3>
    <RB t="Play-In Round" ms={pi} g/>
    {rds.map((r,i) => <RB key={i} t={RND[i]} ms={r} cr={cr} cm={cm} ri={i}/>)}
  </div>;
}

function RB({ t, ms, g, cr, cm, ri }) {
  return <div style={{ marginBottom:16 }}>
    <div style={{ fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:g?"#ffd54f":"#555578", marginBottom:6, fontWeight:700, opacity:g?.7:1 }}>{t}</div>
    {ms.map((m,mi) => {
      const w=m.winner, cur=ri===cr&&mi===cm;
      return <div key={mi} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, padding:"3px 8px", borderRadius:6, background:cur?"rgba(255,215,0,.08)":"transparent" }}>
        <MN m={m[0]} w={w} r/><span style={{ color:"#2a2a44", fontSize:9, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w}/>
      </div>;
    })}
  </div>;
}

function MN({ m, w, r }) {
  const won=w?.seed===m.seed, lost=w&&!won;
  return <span style={{ color:won?"#ffd54f":lost?"#3a3a55":"#7a7a98", fontWeight:won?700:400, flex:1, textAlign:r?"right":"left", textDecoration:lost?"line-through":"none", opacity:lost?.4:1 }}>{m.name}</span>;
}

function FullBracket({ piM, rds, m64, cr, cm, ip }) {
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

  const regionStyle = { marginBottom:20 };
  const headStyle = { fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:8, paddingBottom:6, borderBottom:"1px solid rgba(255,255,255,.06)" };
  const regColors = ["#4fc3f7","#ce93d8","#ff8a65","#ffd54f"];

  const piLabel = (slot) => {
    const piIdx = slot - 58;
    const pair = PIP[piIdx];
    if (!pair) return "TBD";
    const a = PLAYIN[pair[0]], b = PLAYIN[pair[1]];
    const match = piM[piIdx];
    if (match?.winner) return match.winner.name;
    return `${a.name} / ${b.name}`;
  };

  return <div style={{ marginBottom:28, padding:20, background:"rgba(255,255,255,.03)", borderRadius:16, border:"1px solid rgba(255,255,255,.06)", animation:"fi .3s" }}>
    <h3 style={{ fontSize:16, fontWeight:700, color:"#c8c8e0", margin:"0 0 6px", letterSpacing:.5 }}>Full Bracket</h3>
    <div style={{ fontSize:12, color:"#6a6a8e", marginBottom:20 }}>70 movies · 4 regions · Winners from each region meet in the Final Four</div>

    {/* Play-In */}
    <div style={regionStyle}>
      <div style={{ ...headStyle, color:"#ffd54f", opacity:.8 }}>🎬 Play-In Round</div>
      {piM.map((m,i) => {
        const w = m.winner;
        return <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, padding:"4px 8px", borderRadius:6, background: ip&&i===0&&!w ? "rgba(255,215,0,.06)" : "transparent" }}>
          <MN m={m[0]} w={w} r/><span style={{ color:"#2a2a44", fontSize:9, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w}/>
          {w && <span style={{ fontSize:9, color:"#ffd54f", opacity:.5, marginLeft:4 }}>✓</span>}
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
          return <div key={mi} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, padding:"4px 8px", borderRadius:6, background:isCurrentMatch?"rgba(255,215,0,.06)":"transparent" }}>
            <span style={{
              flex:1, textAlign:"right",
              color: w?.seed===aSeed?"#ffd54f" : w&&w.seed!==aSeed?"#3a3a55" : p?"#7a7a98":"#6a6a8e",
              fontWeight: w?.seed===aSeed?700:400,
              textDecoration: w&&w.seed!==aSeed?"line-through":"none",
              opacity: w&&w.seed!==aSeed?.4:1,
              fontStyle: !mu.a?"italic":"normal",
            }}>{aSeed?`#${aSeed} `:""}{aName}</span>
            <span style={{ color:"#2a2a44", fontSize:9, letterSpacing:1, flexShrink:0 }}>vs</span>
            <span style={{
              flex:1,
              color: w?.seed===bSeed?"#ffd54f" : w&&w.seed!==bSeed?"#3a3a55" : p?"#7a7a98":"#6a6a8e",
              fontWeight: w?.seed===bSeed?700:400,
              textDecoration: w&&w.seed!==bSeed?"line-through":"none",
              opacity: w&&w.seed!==bSeed?.4:1,
              fontStyle: !mu.b?"italic":"normal",
            }}>{bName}{bSeed?` #${bSeed}`:""}</span>
            {w && <span style={{ fontSize:9, color:"#ffd54f", opacity:.5, marginLeft:2 }}>✓</span>}
          </div>;
        })}
      </div>;
    })}

    {/* Later rounds */}
    {rds.slice(1).map((rd, rdIdx) => {
      const roundNum = rdIdx + 1;
      return <div key={roundNum} style={regionStyle}>
        <div style={{ ...headStyle, color:"#b0b0cc" }}>{RND[roundNum]}</div>
        {rd.map((m, mi) => {
          const w = m.winner;
          const isCur = !ip && cr===roundNum && cm===mi;
          return <div key={mi} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, padding:"4px 8px", borderRadius:6, background:isCur?"rgba(255,215,0,.06)":"transparent" }}>
            <MN m={m[0]} w={w} r/><span style={{ color:"#2a2a44", fontSize:9, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w}/>
            {w && <span style={{ fontSize:9, color:"#ffd54f", opacity:.5, marginLeft:2 }}>✓</span>}
          </div>;
        })}
      </div>;
    })}
  </div>;
}
