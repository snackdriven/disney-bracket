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
  return (
    <div className="fixed inset-0 z-[1000] bg-[#06060f]/95 backdrop-blur-md flex flex-col p-[20px] pb-[env(safe-area-inset-bottom)] animate-[fi_.2s]">
      <div className="flex justify-between items-center mb-[24px] mt-[10px]">
        <h2 className="text-[22px] font-bold tracking-wide">Menu</h2>
        <button onClick={onClose} className="w-[40px] h-[40px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[18px]">✕</button>
      </div>

      <div className="flex flex-col gap-[16px] overflow-y-auto pb-[40px]">
        
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
