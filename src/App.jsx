import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { MAIN, PLAYIN, PIP, R1, RND, REG, FACTS, STATIC_META, ALL_MOVIES, BRACKET_ORDER } from './lib/data.js';
import { loadLS, saveLS, serMatch, desMatch, extractImdbId } from './lib/utils.js';
import { applyPick, applyUndo, resetState, buildDisplayRds, exportBracketText } from './lib/bracket.js';
import { drawBracket } from './lib/canvas.js';

const SB_URL = "https://pynmkrcbkcfxifnztnrn.supabase.co";
const SB_ANON = "sb_publishable_8VEm7zR0vqKjOZRwH6jimw_qIWt-RPp";
const supabase = createClient(SB_URL, SB_ANON, { auth: { flowType: "implicit", storageKey: "disney-bracket-auth" } });

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

const DOT_COLORS = ['255,255,255','255,255,255','255,255,255','249,168,212','206,147,216'];
const DOTS = Array.from({length:110}, () => ({
  w: Math.random()*3+.5, h: Math.random()*3+.5,
  op: Math.random()*.6+.1, l: Math.random()*100, t: Math.random()*100,
  dur: Math.random()*3+1.2, del: Math.random()*5,
  col: DOT_COLORS[Math.floor(Math.random()*DOT_COLORS.length)],
  er: Math.random() > 0.65,
}));
const CLR = {
  Disney: { bg:"#0d0d1e", ac:"#9d8fe0", gl:"rgba(157,143,224,.25)", tx:"#b8b0e8" },
  Pixar:  { bg:"#0d0d1e", ac:"#9d8fe0", gl:"rgba(157,143,224,.25)", tx:"#b8b0e8" },
};
const BADGE_CLR = {
  Disney: { bg:"#4fc3f722", tx:"#4fc3f7" },
  Pixar:  { bg:"#ff8a6522", tx:"#ff8a65" },
};

// ---- TMDB / OMDB helpers ----

async function fetchMovieMeta(tmdbKey, omdbKey) {
  const cache = (() => { try { return JSON.parse(localStorage.getItem("tmdb-meta-v1")||"{}"); } catch { return {}; } })();
  const missing = ALL_MOVIES.filter(m => (!cache[m.seed]?.poster || !cache[m.seed]?.plot) && extractImdbId(m.imdb));
  const BATCH = 20;
  for (let i = 0; i < missing.length; i += BATCH) {
    await Promise.all(missing.slice(i, i + BATCH).map(async m => {
      const id = extractImdbId(m.imdb);
      cache[m.seed] = cache[m.seed] || {};
      try {
        if (tmdbKey) {
          const r = await fetch(`https://api.themoviedb.org/3/find/${id}?api_key=${tmdbKey}&external_source=imdb_id`);
          const d = await r.json();
          const mov = d.movie_results?.[0];
          if (mov?.poster_path) cache[m.seed].poster = `https://image.tmdb.org/t/p/w92${mov.poster_path}`;
          if (mov?.overview) cache[m.seed].plot = cache[m.seed].plot || mov.overview;
        }
        if (omdbKey) {
          const r = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${omdbKey}`);
          const d = await r.json();
          if (d.Runtime && d.Runtime !== "N/A") cache[m.seed].runtime = d.Runtime;
          if (d.imdbRating && d.imdbRating !== "N/A") cache[m.seed].rating = d.imdbRating;
          if (!cache[m.seed].poster && d.Poster && d.Poster !== "N/A") cache[m.seed].poster = d.Poster;
          if (d.Plot && d.Plot !== "N/A") cache[m.seed].plot = d.Plot; // OMDB wins — shorter and cleaner
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
    try {
      return { ...s, piM: desMatch(s.piM), rds: s.rds.map(r => desMatch(r)) };
    } catch {
      return null;
    }
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBracket, setCopiedBracket] = useState(false);

  // Movie meta (posters, runtime, rating) — static baseline merged with API cache (cache wins per-field)
  const [movieMeta, setMovieMeta] = useState(() => {
    const fromLS = loadLS("tmdb-meta-v1", {});
    const merged = {};
    ALL_MOVIES.forEach(m => { merged[m.seed] = { ...STATIC_META[m.seed], ...fromLS[m.seed] }; });
    return merged;
  });
  const [tmdbStatus, setTmdbStatus] = useState(null); // null|'fetching'|'done'|'error'
  const [showTmdbModal, setShowTmdbModal] = useState(false);
  const [pngStatus, setPngStatus] = useState(null); // null|'fetching'|'drawing'|'done'

  // Supabase sync
  const [sbUser, setSbUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle'|'syncing'|'synced'|'error'
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Persist bracket state to localStorage and URL hash.
  // Guard: don't overwrite the hash while Supabase auth tokens are still there.
  // The navigator lock means _initialize() reads the hash as a platform task,
  // which can fire AFTER React effects (MessageChannel). Overwriting wipes the
  // access_token before the client reads it, so auth silently never fires.
  useEffect(() => {
    const serialized = { ph, piM: serMatch(piM), piI, rds: rds.map(r => serMatch(r)), cr, cm, ch, hi, upsets };
    saveLS("dbk-state", serialized);
    const hashHasAuth = window.location.hash.includes("access_token") || window.location.hash.includes("token_hash");
    if (!hashHasAuth && (hi.length > 0 || ch)) {
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

  // Easter egg: press ? to open the repo
  useEffect(() => {
    const h = e => { if (e.key === "?" && !e.target.closest("input,textarea")) window.open("https://github.com/snackdriven/disney-bracket", "_blank", "noopener,noreferrer"); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Token-hash exchange — handles magic link clicks (token_hash approach).
  // The custom email template links to ?token_hash=...&type=email so the
  // token survives email-client click trackers (which strip URL hashes).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    if (tokenHash && type === "email") {
      // Clean up URL before exchanging so a reload doesn't re-attempt
      const clean = window.location.pathname;
      window.history.replaceState(null, "", clean);
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
      // onAuthStateChange will fire SIGNED_IN once the exchange completes
    }
  }, []);

  // Auth init — runs once on mount.
  // onAuthStateChange fires INITIAL_SESSION after Supabase finishes its async
  // URL-hash / localStorage init, so it's reliable where getSession() races.
  useEffect(() => {
    let pulled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSbUser(session?.user ?? null);
      // Pull on first sign-in (magic link) or when a pre-existing session is
      // detected after page load (INITIAL_SESSION with a user).
      if (session?.user && !pulled && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        pulled = true;
        pullFromSupabase();
      }
      if (event === "SIGNED_OUT") pulled = false;
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
    return () => clearTimeout(syncTimerRef.current);
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
    a.download = "disney-and-pixar-bracket.png";
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

  const pick = (w) => {
    const opponent = mu[0].seed === w.seed ? mu[1] : mu[0];
    const isUpset = w.seed > opponent.seed;
    setAn(w.seed);
    if (isUpset) { setUpFlash(true); setTimeout(() => setUpFlash(false), 1500); }
    const snap = { ph, piM, piI, rds, cr, cm, ch, hi, upsets };
    setTimeout(() => {
      setAn(null);
      const ns = applyPick(snap, w);
      setPh(ns.ph); setPiM(ns.piM); setPiI(ns.piI);
      setRds(ns.rds); setCr(ns.cr); setCm(ns.cm);
      setCh(ns.ch); setHi(ns.hi); setUpsets(ns.upsets);
    }, 320);
  };

  const undo = () => {
    const ns = applyUndo({ ph, piM, piI, rds, cr, cm, ch, hi, upsets });
    setPh(ns.ph); setPiM(ns.piM); setPiI(ns.piI);
    setRds(ns.rds); setCr(ns.cr); setCm(ns.cm);
    setCh(ns.ch); setHi(ns.hi); setUpsets(ns.upsets);
  };

  const reset = () => {
    const ns = resetState();
    setPh(ns.ph); setPiM(ns.piM); setPiI(ns.piI);
    setRds(ns.rds); setCr(ns.cr); setCm(ns.cm);
    setCh(ns.ch); setHi(ns.hi); setUpsets(ns.upsets);
    setBk(false); setFb(false); setUpFlash(false);
    setCopiedLink(false); setCopiedBracket(false);
    saveLS("dbk-state", null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  const exportBracket = () => exportBracketText({ piM, rds, ch });

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    }).catch(() => {
      const el = document.createElement("textarea");
      el.value = window.location.href;
      el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(el);
      el.select();
      try { document.execCommand("copy"); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 1500); } catch { /* give up */ }
      document.body.removeChild(el);
    });
  };

  const copyBracket = () => {
    navigator.clipboard.writeText(exportBracket()).then(() => {
      setCopiedBracket(true);
      setTimeout(() => setCopiedBracket(false), 1500);
    }).catch(() => {
      const el = document.createElement("textarea");
      el.value = exportBracket();
      el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(el);
      el.select();
      try { document.execCommand("copy"); setCopiedBracket(true); setTimeout(() => setCopiedBracket(false), 1500); } catch { /* give up */ }
      document.body.removeChild(el);
    });
  };

  const metaCount = Object.values(movieMeta).filter(m => m?.poster || m?.rating).length;

  return (
    <div style={{ minHeight:"100vh", position:"relative", zIndex:9999, fontFamily:"'Inter',sans-serif", color:"#e0e0f0" }}>
      {showTmdbModal && <TmdbModal onSave={(t,o)=>{ setShowTmdbModal(false); handleFetchMeta(t,o); }} onClose={()=>setShowTmdbModal(false)}/>}
      {showAuthModal && <AuthModal onClose={()=>setShowAuthModal(false)}/>}
      <Dots mob={mob}/>
      <style>{`
        @keyframes tw{0%,100%{opacity:.05}50%{opacity:1}}
        @keyframes tw2{0%,100%{opacity:.05}20%{opacity:.9}35%{opacity:.15}55%{opacity:.8}70%{opacity:.05}85%{opacity:.6}}
        @keyframes mote-rise{0%{transform:translateY(0);opacity:0}8%{opacity:1}92%{opacity:1}100%{transform:translateY(-110vh);opacity:0}}
        @keyframes su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cb{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
        @keyframes wg{0%,100%{text-shadow:0 0 20px rgba(79,195,247,.4)}50%{text-shadow:0 0 50px rgba(79,195,247,.8),0 0 80px rgba(79,195,247,.3)}}
        @keyframes ch{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(.98);opacity:.6}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes pp{0%,100%{border-color:rgba(79,195,247,.15)}50%{border-color:rgba(79,195,247,.4)}}
        @keyframes uf{0%{opacity:0;transform:translateY(-8px) scale(.9)}20%{opacity:1;transform:translateY(0) scale(1)}80%{opacity:1}100%{opacity:0}}
        @media(max-width:600px){
          .mob-btn:active{opacity:.7!important;transform:scale(.97)!important}
          .mob-card:active{transform:scale(.98)!important;opacity:.9!important}
        }
      `}</style>
      <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:mob?"16px 16px 32px":"20px 32px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:mob?20:28 }}>
          <div style={{ fontSize:mob?11:11, letterSpacing:mob?5:7, textTransform:"uppercase", color:"#6a6a8e", marginBottom:mob?4:6 }}>Settle it once and for all</div>
          <h1 style={{ fontSize:"clamp(28px,5vw,42px)", fontWeight:800, margin:"0 0 4px", fontFamily:"'Outfit',sans-serif", background:"linear-gradient(135deg,#9d8fe0,#ce93d8 45%,#4fc3f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Disney & Pixar: The Bracket</h1>
          <div style={{ fontSize:mob?13:13, color:"#7a7a9e" }}>{mob?"70 movies · 69 matchups · 1 champion":"70 movies · 6 play-in games · 69 matchups · 1 champion"}</div>
        </div>
        <div role="progressbar" aria-valuenow={Math.round(prog)} aria-valuemin={0} aria-valuemax={100} aria-label="Bracket completion" style={{ background:"rgba(255,255,255,.05)", borderRadius:20, height:mob?6:5, marginBottom:mob?6:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${prog}%`, background:"linear-gradient(90deg,#9d8fe0,#ce93d8,#4fc3f7)", borderRadius:20, transition:"width .5s" }}/>
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
          <a href="https://snackdriven.github.io/bad-movie-bracket/" target="_blank" rel="noopener noreferrer" title="something worse this way comes" style={{ color:"#3a3a52", fontSize:mob?12:11, textDecoration:"none", opacity:.5 }}>💀</a>
          <span style={{ color:"#4a4a65" }}>·</span>
          <button onClick={()=>{ if(tmdbStatus==="fetching") return; if(!localStorage.getItem("tmdb-key")) setShowTmdbModal(true); else handleFetchMeta(); }} style={{ background:"none", border:"none", color:metaCount>0?"#6a6a8e":"#4fc3f7", fontSize:mob?12:11, cursor:"pointer" }}>
            {tmdbStatus==="fetching"?"⏳ Fetching..." : metaCount>0 ? `🎬 ${metaCount} movies loaded` : "🎬 Add posters & ratings"}
          </button>
        </div>

        {/* Full Bracket + Notes toggles */}
        <div style={{ textAlign:"center", marginBottom:mob?14:16, display:"flex", gap:mob?10:8, justifyContent:"center", flexWrap:"wrap" }}>
          <button aria-expanded={fb} className={mob?"mob-btn":""} onClick={()=>setFb(!fb)} style={{
            background: fb?"rgba(79,195,247,.12)":"rgba(255,255,255,.04)",
            border: fb?"1px solid rgba(79,195,247,.3)":"1px solid rgba(255,255,255,.08)",
            color: fb?"#4fc3f7":"#8a8aae", padding:mob?"10px 18px":"6px 18px", borderRadius:10,
            fontSize:mob?13:12, fontWeight:600, cursor:"pointer", letterSpacing:.5,
            transition:"all .15s", minHeight:mob?48:undefined,
          }}>{fb ? "Hide Bracket" : "📋 Full Bracket"}</button>
          <button aria-expanded={showNotes} className={mob?"mob-btn":""} onClick={()=>setShowNotes(!showNotes)} style={{
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
          <div style={{ display:"inline-block", padding:mob?"8px 16px":"6px 18px", borderRadius:20, background:"rgba(79,195,247,.08)", border:"1px solid rgba(79,195,247,.2)", animation:"pp 3s ease-in-out infinite", fontSize:mob?13:12, fontWeight:700, color:"#4fc3f7", letterSpacing:mob?1:2, textTransform:"uppercase" }}>{mob?"🎬 Play-In Round":"🎬 Play-In — Bottom 12 fight for 6 spots"}</div>
        </div>}

        {ch ? <div style={{ textAlign:"center", animation:"su .5s ease-out", padding:mob?"24px 12px":"40px 20px" }}>
          <div style={{ fontSize:mob?42:56, animation:"cb 2s ease-in-out infinite", marginBottom:mob?8:12 }}>👑</div>
          <div style={{ fontSize:mob?12:11, letterSpacing:mob?4:6, textTransform:"uppercase", color:"#4fc3f7", marginBottom:mob?8:10 }}>Your Champion</div>
          <div style={{ fontSize:"clamp(28px,7vw,50px)", fontWeight:800, color:"#4fc3f7", animation:"wg 2s ease-in-out infinite", marginBottom:6 }}>{ch.name}</div>
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
          <div data-testid="match-counter" style={{ textAlign:"center", marginBottom:mob?12:16, fontSize:mob?14:13, color:"#8080a0" }}>Match {mn} of {mt}</div>
          {mob ? (
            <div style={{ display:"flex", flexDirection:"column", gap:0, alignItems:"center" }}>
              <Card mob m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={()=>pick(mu[0])} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"10px 0", width:"100%" }}>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.12))" }}/>
                <span data-testid="vs-divider" style={{ fontSize:14, fontWeight:800, color:"#5a5a7e", letterSpacing:3 }}>VS</span>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(255,255,255,.12),transparent)" }}/>
              </div>
              <Card mob m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={()=>pick(mu[1])} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0 }}>
              <Card key={mu[0].seed} m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={()=>pick(mu[0])} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
              <div style={{ padding:"0 22px", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ width:1, height:32, background:"linear-gradient(180deg,transparent,rgba(255,255,255,.1))" }}/>
                <span data-testid="vs-divider" style={{ fontSize:13, fontWeight:800, color:"#3a3a58", letterSpacing:4 }}>VS</span>
                <div style={{ width:1, height:32, background:"linear-gradient(180deg,rgba(255,255,255,.1),transparent)" }}/>
              </div>
              <Card key={mu[1].seed} m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={()=>pick(mu[1])} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
            </div>
          )}
          {upFlash && <div style={{ textAlign:"center", marginTop:12, animation:"uf 1.5s ease-out forwards" }}>
            <span style={{ display:"inline-block", padding:"4px 14px", borderRadius:20, background:"rgba(255,80,80,.12)", border:"1px solid rgba(255,80,80,.25)", fontSize:mob?12:11, fontWeight:700, color:"#ff7070", letterSpacing:2, textTransform:"uppercase" }}>🚨 Upset!</span>
          </div>}
          <div style={{ display:"flex", justifyContent:"center", gap:mob?10:10, marginTop:mob?18:22 }}>
            {hi.length>0 && <Btn mob={mob} s onClick={undo}>← Undo</Btn>}
            <Btn mob={mob} s mu onClick={reset}>Reset</Btn>
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

  const cardBg = `linear-gradient(135deg,${c.bg}f8 0%,${c.bg}dd 100%)`;
  const cardBorder = h ? `1.5px solid ${c.ac}55` : "1.5px solid rgba(255,255,255,.06)";
  const sparkling = !showCardNotes && !d && h;
  const cardBgOpaque = `linear-gradient(135deg,#0e0e21 0%,#0c0c1c 100%)`;

  return <div style={{
    flex:mob?"1 1 100%":"1 1 320px", maxWidth:mob?undefined:560, width:mob?"100%":undefined,
    background: showCardNotes ? cardBg : "transparent",
    border: showCardNotes ? cardBorder : "none",
    borderRadius: mob?14:16,
    overflow: showCardNotes ? "hidden" : "visible",
    transition:"border-color .18s",
  }}>
    {/* Spark wrapper: 2px animated conic ring. Handles hover lift + shadow so overflow:hidden doesn't clip them. */}
    <div style={sparkling ? {
      padding:"2px", borderRadius:mob?14:16, overflow:"hidden",
      background:`conic-gradient(from var(--spark-angle), #0a0a18 0%, #0a0a18 60%, rgba(157,143,224,.04) 68%, rgba(206,147,216,.13) 80%, rgba(249,168,212,.25) 89%, rgba(255,255,255,.35) 94%, #0a0a18 96%)`,
      animation:"spark-rotate 8s linear infinite",
      transform: h&&!a&&!mob?"translateY(-4px)":"none",
      boxShadow: h?`0 ${mob?14:22}px ${mob?36:54}px rgba(0,0,0,.5)`:`0 4px ${mob?14:18}px rgba(0,0,0,.35)`,
      transition:"transform .18s cubic-bezier(.25,.8,.25,1), box-shadow .18s",
    } : { display:"contents" }}>
    <button data-testid="movie-card" className={mob?"mob-card":""} onClick={()=>!d&&onC()}
      onMouseEnter={mob?undefined:()=>onH(m.seed)} onMouseLeave={mob?undefined:()=>onH(null)}
      onTouchStart={mob?()=>onH(m.seed):undefined} onTouchEnd={mob?()=>onH(null):undefined}
      style={{
        width:"100%", padding:0, position:"relative", overflow:"hidden",
        background: showCardNotes ? "transparent" : (sparkling ? cardBgOpaque : cardBg),
        border: showCardNotes ? "none" : (sparkling ? "none" : cardBorder),
        borderRadius: sparkling ? (mob?12:14) : rTop,
        cursor: d?"default":"pointer",
        transition:"background .18s, box-shadow .18s",
        transform: sparkling ? "none" : (h&&!a&&!mob?"translateY(-4px)":"none"),
        boxShadow: sparkling
          ? (h?`inset 0 1px 0 ${c.ac}18`:`inset 0 1px 0 rgba(255,255,255,.04)`)
          : (h?`0 ${mob?14:22}px ${mob?36:54}px rgba(0,0,0,.5),inset 0 1px 0 ${c.ac}18`:`0 4px ${mob?14:18}px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.04)`),
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
            display:"block", opacity:a ? 0.45 : 1,
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
          <span style={{ padding:"1px 7px", borderRadius:20, background:BADGE_CLR[m.studio].bg, color:BADGE_CLR[m.studio].tx, fontSize:9, fontWeight:700, letterSpacing:.4 }}>{m.studio}</span>
          <span style={{ fontSize:10, color:"#52526a" }}>{m.year}</span>
          {note && !showCardNotes && <span data-testid="notes-dot" style={{ width:5, height:5, borderRadius:"50%", background:"#ce93d8", flexShrink:0, marginLeft:2 }}/>}
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

        {/* Plot — desktop hover only (hidden when notes open) */}
        {!mob && !showCardNotes && meta?.plot && (
          <div style={{
            fontSize:11, color:"#7a7a9e", lineHeight:1.5,
            overflow:"hidden", display:"-webkit-box",
            WebkitLineClamp:3, WebkitBoxOrient:"vertical",
            maxHeight: h ? "54px" : "0px",
            opacity: h ? 1 : 0,
            transition:"opacity .2s, max-height .22s",
            marginTop: h ? 3 : 0,
          }}>{meta.plot}</div>
        )}

        {/* Trivia — only when notes are open */}
        {showCardNotes && FACTS[m.name] && (
          <div style={{
            fontSize:11, color:"#7a7a9e", lineHeight:1.55,
            marginTop:2,
          }}>{FACTS[m.name]}</div>
        )}

        {mob && <div style={{ fontSize:9, color:c.ac, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", opacity:.4 }}>Tap to pick</div>}
      </div>

      {/* Hover: left accent bar */}
      <div style={{ position:"absolute", left:0, top:"15%", bottom:"15%", width:3, background:`linear-gradient(180deg,transparent,${c.ac}cc,transparent)`, borderRadius:2, opacity:h&&!mob?1:0, transition:"opacity .18s" }}/>

      {/* Desktop pick hint — hidden when plot is showing to avoid overlap */}
      {h&&!mob&&!a&&!meta?.plot && <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:c.ac, fontWeight:700, letterSpacing:1, opacity:.7 }}>Pick →</div>}
    </button>
    </div>{/* end spark wrapper */}

    <div style={{ textAlign:"center", marginTop:showCardNotes?0:(mob?3:3) }}>
      <button aria-expanded={showCardNotes} aria-label={showCardNotes ? `Hide notes for ${m.name}` : `Add notes for ${m.name}`} onClick={e=>{e.stopPropagation();setShowCardNotes(!showCardNotes);}} style={{
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
  const dialogRef = useRef(null);
  useEffect(() => {
    dialogRef.current?.focus();
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const save = () => {
    if (tmdb.trim()) localStorage.setItem("tmdb-key", tmdb.trim());
    if (omdb.trim()) localStorage.setItem("omdb-key", omdb.trim());
    onSave(tmdb.trim(), omdb.trim());
  };
  return <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="tmdb-modal-title" tabIndex={-1} onClick={e=>e.stopPropagation()} style={{ background:"#12122a", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"28px 24px", maxWidth:440, width:"90%", animation:"su .2s", outline:"none" }}>
      <h3 id="tmdb-modal-title" style={{ color:"#f0f0ff", margin:"0 0 6px", fontSize:18 }}>Movie Posters, Ratings & Runtimes</h3>
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
  const [err, setErr] = useState(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    dialogRef.current?.focus();
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const sendLink = async () => {
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (error) {
      setErr(error.status === 429 ? "Too many requests — wait a minute and try again." : error.message);
    } else {
      setSent(true);
    }
  };
  return <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" tabIndex={-1} onClick={e=>e.stopPropagation()} style={{ background:"#12122a", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"28px 24px", maxWidth:380, width:"90%", animation:"su .2s", outline:"none" }}>
      <h3 id="auth-modal-title" style={{ color:"#f0f0ff", margin:"0 0 8px", fontSize:18 }}>Sync Across Devices</h3>
      {sent ? (
        <p style={{ color:"#8a8aa8", fontSize:14, lineHeight:1.6 }}>Check your email for a magic link. Close this when you're signed in.</p>
      ) : (
        <>
          <p style={{ color:"#8a8aa8", fontSize:13, margin:"0 0 16px", lineHeight:1.6 }}>Enter your email — we'll send a link. Your bracket and notes sync automatically once you're signed in.</p>
          {err && <p style={{ color:"#ff8a65", fontSize:13, margin:"0 0 12px", lineHeight:1.5 }}>{err}</p>}
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
  return <div aria-hidden="true" style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
    {dots.map((d,i) => <div key={i} style={{
      position:"absolute", width:d.w, height:d.h,
      background:`rgba(${d.col},${d.op})`, borderRadius:"50%",
      left:`${d.l}%`, top:`${d.t}%`,
      animation:`${d.er?"tw2":"tw"} ${d.dur}s ${d.er?"linear":"ease-in-out"} infinite`, animationDelay:`${d.del}s`,
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
    <div style={{ fontSize:mob?11:10, letterSpacing:mob?2:2.5, textTransform:"uppercase", color:g?"#4fc3f7":"#6a6a8e", marginBottom:mob?6:6, fontWeight:700, opacity:g?.7:1 }}>{t}</div>
    {ms.map((m,mi) => {
      const w=m.winner, cur=ri===cr&&mi===cm;
      return <div key={mi} style={{ display:"flex", alignItems:"center", gap:mob?6:6, fontSize:mob?13:12, padding:mob?"5px 8px":"3px 8px", borderRadius:6, background:cur?"rgba(79,195,247,.08)":"transparent" }}>
        <MN m={m[0]} w={w} r mob={mob}/><span style={{ color:"#3a3a55", fontSize:mob?10:9, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob}/>
      </div>;
    })}
  </div>;
}

function MN({ m, w, r, mob, upset }) {
  const won=w?.seed===m.seed, lost=w&&!won;
  const winColor = upset ? "#ff8a65" : "#4fc3f7";
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
  const regColors = ["#4fc3f7","#ce93d8","#ff8a65","#4fc3f7"];
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
      <div style={{ ...headStyle, color:"#4fc3f7", opacity:.8 }}>🎬 Play-In Round</div>
      {piM.map((m,i) => {
        const w = m.winner;
        const isUpset = w && w.seed > (w.seed===m[0].seed ? m[1] : m[0]).seed;
        return <div key={i} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background: ip&&i===0&&!w ? "rgba(79,195,247,.06)" : "transparent" }}>
          <MN m={m[0]} w={w} r mob={mob} upset={isUpset&&w?.seed===m[0].seed}/><span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob} upset={isUpset&&w?.seed===m[1].seed}/>
          {w && <span style={{ fontSize:vsFs, color:isUpset?"#ff8a65":"#4fc3f7", opacity:.6, marginLeft:mob?2:4 }}>{isUpset?"⚡":"✓"}</span>}
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
          const winColor = isUpset ? "#ff8a65" : "#4fc3f7";
          return <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCurrentMatch?"rgba(79,195,247,.06)":"transparent" }}>
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
            {w && <span style={{ fontSize:vsFs, color:isUpset?"#ff8a65":"#4fc3f7", opacity:.6, marginLeft:2 }}>{isUpset?"⚡":"✓"}</span>}
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
          return <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCur?"rgba(79,195,247,.06)":"transparent" }}>
            <MN m={m[0]} w={w} r mob={mob} upset={isUpset&&w?.seed===m[0].seed}/><span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob} upset={isUpset&&w?.seed===m[1].seed}/>
            {w && <span style={{ fontSize:vsFs, color:isUpset?"#ff8a65":"#4fc3f7", opacity:.6, marginLeft:2 }}>{isUpset?"⚡":"✓"}</span>}
          </div>;
        })}
      </div>;
    })}
  </div>;
}
