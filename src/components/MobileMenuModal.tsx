import { useState, useEffect } from "react";

interface MobileMenuModalProps {
  onClose: () => void;
  showFullBracket: boolean;
  setShowFullBracket: (b: boolean) => void;
  showNotes: boolean;
  setShowNotes: (b: boolean) => void;
  customName: string;
  setCustomName: (val: string) => void;
  defaultName: string;
  roomCode: string | null;
  connected: boolean;
  onReset: () => void;
  fbUser: any;
  syncStatus: string | null;
  onSignInClick: () => void;
}

export function MobileMenuModal({
  onClose, showFullBracket, setShowFullBracket, showNotes, setShowNotes,
  customName, setCustomName, defaultName, roomCode, connected, onReset,
  fbUser, syncStatus, onSignInClick
}: MobileMenuModalProps) {
  const [activePage, setActivePage] = useState<'menu' | 'changelog'>('menu');
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dbk-recent-rooms') || "[]");
      if (Array.isArray(stored)) setRecentRooms(stored);
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (roomCode) {
      setRecentRooms(prev => {
        const next = [roomCode, ...prev.filter(r => r !== roomCode)].slice(0, 4);
        localStorage.setItem('dbk-recent-rooms', JSON.stringify(next));
        return next;
      });
    }
  }, [roomCode]);

  if (activePage === 'changelog') {
    return (
      <div className="fixed inset-0 z-[1000] bg-[#06060f]/95 backdrop-blur-md flex flex-col p-[20px] pb-[env(safe-area-inset-bottom)] animate-[fi_.2s]">
        <div className="flex justify-between items-center mb-[24px] mt-[10px]">
          <h2 className="text-[22px] font-bold tracking-wide">What's New</h2>
          <button onClick={() => setActivePage('menu')} className="px-[14px] h-[36px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[13px] font-bold text-[#8a8aae]">Back</button>
        </div>

        <div className="flex flex-col gap-[32px] overflow-y-auto pb-[60px] scrollbar-none pr-[8px]">
          
          <div className="flex flex-col gap-[12px]">
             <div className="flex justify-between items-end border-b border-white/10 pb-[8px]">
               <h3 className="text-[18px] font-bold text-[#4fc3f7]">v1.0.1</h3>
               <span className="text-[12px] text-[#4fc3f7] font-bold uppercase tracking-wider">Current</span>
             </div>
             <ul className="text-[#a0a0c0] text-[14px] leading-[1.6] list-disc pl-[20px] flex flex-col gap-[6px]">
               <li>Added one-tap <b>Recent Rooms</b> memory to the Co-op menu to easily jump back into active sessions.</li>
               <li>Rolled out a sleek geometric <b>"Magazine Float"</b> layout for movie cards to perfectly preserve native poster aspect ratios without cutting off character art.</li>
             </ul>
          </div>

          <div className="flex flex-col gap-[12px]">
             <div className="flex justify-between items-end border-b border-white/10 pb-[8px]">
               <h3 className="text-[18px] font-bold text-white">v1.0.0</h3>
               <span className="text-[12px] text-[#8a8aae]">The Mobile Update</span>
             </div>
             <ul className="text-[#a0a0c0] text-[14px] leading-[1.6] list-disc pl-[20px] flex flex-col gap-[6px]">
               <li>Implemented <b>horizontal swipe-to-reveal gestures</b> for movie stats, trivia, and admin actions using CSS snap targets.</li>
               <li>Deep redesign of the primary Header with a vertically-centered premium layout and neon progress tracking.</li>
               <li>Centralized all sync/login utilities into this mobile modal to declutter the matchups.</li>
             </ul>
          </div>

          <div className="flex flex-col gap-[12px]">
             <div className="flex justify-between items-end border-b border-white/10 pb-[8px]">
               <h3 className="text-[18px] font-bold text-white">v0.9.0</h3>
               <span className="text-[12px] text-[#8a8aae]">The Co-op Sync Update</span>
             </div>
             <ul className="text-[#a0a0c0] text-[14px] leading-[1.6] list-disc pl-[20px] flex flex-col gap-[6px]">
               <li>Migrated backend architecture natively to Firebase context.</li>
               <li>Introduced real-time <b>2-Player Sync</b> logic that allows friends/couples to jump into a room and run brackets simultaneously.</li>
               <li>Added "Blind Voting" logic that refuses to advance the bracket until both connected players have made their picks.</li>
               <li>Created instant <b>Fix Metadata</b> capabilities utilizing on-the-fly TMDB scraping.</li>
             </ul>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-[#06060f]/95 backdrop-blur-md flex flex-col p-[20px] pb-[env(safe-area-inset-bottom)] animate-[fi_.2s]">
      <div className="flex justify-between items-center mb-[24px] mt-[10px]">
        <h2 className="text-[22px] font-bold tracking-wide">Menu</h2>
        <button onClick={onClose} className="w-[40px] h-[40px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[18px]">✕</button>
      </div>

      <div className="flex flex-col gap-[16px] overflow-y-auto pb-[40px] scrollbar-none">
        
        {/* Changelog Banner */}
        <button
          onClick={() => setActivePage('changelog')}
          className="w-full p-[14px] rounded-[14px] bg-gradient-to-r from-[#ce93d8]/10 to-[#4fc3f7]/10 border border-[#ce93d8]/20 flex items-center justify-between hover:brightness-125 transition-all shadow-[0_0_15px_rgba(206,147,216,0.15)]"
        >
          <span className="font-bold text-[14px] text-white">✨ What's New? <span className="text-[#ce93d8] ml-2 text-[12px]">v1.0.1</span></span>
          <span className="text-[#ce93d8] font-bold pr-1">›</span>
        </button>

        {/* View Toggles */}
        <div className="grid grid-cols-2 gap-[12px]">
          <button
            onClick={() => { setShowFullBracket(!showFullBracket); setShowNotes(false); onClose(); }}
            className={`p-[16px] rounded-[14px] text-center font-bold text-[14px] transition-colors ${showFullBracket ? 'bg-[#4fc3f7]/20 border border-[#4fc3f7]/40 text-[#4fc3f7]' : 'bg-white/5 border border-white/10 text-[#8a8aae]'}`}
          >
            📋 Bracket
          </button>
          <button
            onClick={() => { setShowNotes(!showNotes); setShowFullBracket(false); onClose(); }}
            className={`p-[16px] rounded-[14px] text-center font-bold text-[14px] transition-colors ${showNotes ? 'bg-[#ce93d8]/20 border border-[#ce93d8]/40 text-[#ce93d8]' : 'bg-white/5 border border-white/10 text-[#8a8aae]'}`}
          >
            📝 Notes
          </button>
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-[8px]" />

        {/* Sync & Login */}
        <div className="flex flex-col gap-[12px] p-[16px] rounded-[14px] bg-[#4fc3f7]/5 border border-[#4fc3f7]/10">
          <h3 className="text-[12px] font-bold text-[#4fc3f7] uppercase tracking-[2px]">Cloud Save</h3>
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-[#8a8aae]">
              {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Sync failed' :
               syncStatus === 'synced' ? 'All changes saved' : fbUser ? 'No changes' : 'Not signed in'}
            </span>
            <button
               onClick={() => { onClose(); onSignInClick(); }}
               className="px-[12px] py-[6px] rounded-[8px] bg-white/5 border border-white/10 text-white font-bold text-[13px]"
            >
              {fbUser ? 'Account' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Co-op Settings */}
        <div className="flex flex-col gap-[12px]">
          <h3 className="text-[12px] font-bold text-[#5a5a7e] uppercase tracking-[2px]">Co-op Multiplayer</h3>
          <input
            type="text"
            placeholder={defaultName}
            value={customName}
            onChange={(e) => {
              const val = e.target.value.trimStart();
              setCustomName(val);
              localStorage.setItem('dbk-custom-name', val);
            }}
            maxLength={12}
            className="w-full p-[14px] rounded-[14px] bg-white/5 border border-white/10 text-white text-[15px] font-semibold text-center outline-none focus:border-[#ce93d8] focus:bg-[#ce93d8]/10 transition-colors placeholder:text-white/20"
          />
          
          {!roomCode ? (
            <div className="flex flex-col gap-[12px]">
              <div className="grid grid-cols-2 gap-[12px]">
                <button
                  onClick={() => {
                     const prefixes = ["BAMB", "SIMB", "HERC", "ARI", "WDW", "TINK", "BUZZ", "NEMO", "MULA", "CRUZ", "OAK", "DPOO", "GENI", "PLUT"];
                     const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
                     const num = Math.floor(Math.random() * 89) + 10;
                     const code = `${pre}-${num}`;
                     window.location.search = `?room=${code}`;
                  }}
                  className="p-[14px] rounded-[14px] bg-white/5 border border-white/10 text-[#8a8aae] font-bold text-[14px]"
                >
                  🎮 Create Room
                </button>
                <button
                  onClick={() => {
                     const code = window.prompt("Enter room code:");
                     if (code && code.trim()) {
                       window.location.search = `?room=${code.trim().toUpperCase()}`;
                     }
                  }}
                  className="p-[14px] rounded-[14px] bg-white/5 border border-white/10 text-[#8a8aae] font-bold text-[14px]"
                >
                  🤝 Join Room
                </button>
              </div>
              
              {recentRooms.length > 0 && (
                <div className="flex flex-col gap-[8px] mt-[4px]">
                   <div className="text-[10px] text-[#5a5a7e] uppercase tracking-[1.5px] font-bold">Recent Rooms</div>
                   <div className="flex flex-wrap gap-[8px]">
                     {recentRooms.map(r => (
                       <button
                         key={r}
                         onClick={() => window.location.search = `?room=${r}`}
                         className="px-[14px] py-[8px] rounded-[10px] bg-white/5 border border-white/10 text-[#a0a0c0] text-[13px] font-bold hover:bg-white/10 transition-colors"
                       >
                         {r}
                       </button>
                     ))}
                   </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-[12px]">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href).then(() => alert("Copied room link to clipboard!"));
                }}
                className="p-[14px] rounded-[14px] bg-[#4fc3f7]/20 border border-[#4fc3f7] text-white font-bold text-[14px]"
              >
                {connected ? `🟢 Room: ${roomCode} 📋` : `🟡 Room: ${roomCode} 📋`}
              </button>
              <button
                 onClick={() => { window.location.search = ''; }}
                 className="p-[14px] rounded-[14px] bg-white/5 border border-white/10 text-[#8a8aae] font-bold text-[14px]"
              >
                ✖ Leave Room
              </button>
            </div>
          )}
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-[8px]" />

        <div className="flex justify-center mt-[12px]">
          <button 
            onClick={() => { onClose(); onReset(); }}
            className="p-[10px] w-full text-[14px] font-semibold text-[#ff5050] bg-[#ff5050]/10 border border-[#ff5050]/20 rounded-[14px]"
          >
            Reset Entire Bracket
          </button>
        </div>

      </div>
    </div>
  );
}
