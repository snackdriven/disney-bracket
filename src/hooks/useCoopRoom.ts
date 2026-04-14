import { useState, useEffect } from "react";
import { db } from "../lib/firebase.js";
import { ref, onValue, set } from "firebase/database";
import type { Match } from "../types.js";

interface CoopState {
  myPick: number | null;
  theirPick: number | null;
  theirName: string;
}

export function useCoopRoom(
  roomCode: string | null,
  myName: string,
  activeMatch: Match | undefined,
  applyServerState: (state: unknown) => void,
  serializedState: unknown
) {
  const [coopState, setCoopState] = useState<CoopState>({
    myPick: null,
    theirPick: null,
    theirName: "Friend",
  });
  
  const [connected, setConnected] = useState(false);
  const [syncedInit, setSyncedInit] = useState(false);

  const p1 = activeMatch?.players[0]?.seed;
  const p2 = activeMatch?.players[1]?.seed;
  
  useEffect(() => {
    setCoopState(prev => ({
      ...prev,
      myPick: null,
      theirPick: null
    }));
  }, [p1, p2]);

  useEffect(() => {
    if (!roomCode) {
      setConnected(false);
      return;
    }

    const roomRef = ref(db, `rooms/${roomCode}`);
    
    // When we disconnect, we could optionally clear our pick, but 
    // for a simple bracket app it's better to just leave it.

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      setConnected(true);
      
      if (!data) {
        // Room doesn't exist yet, we are the host! Let's seed it.
        set(roomRef, {
          host: myName,
          state: serializedState,
          picks: {}
        });
        setSyncedInit(true);
        return;
      }

      // Continuous sync for advanced state
      if (data.state) {
        const remoteStr = JSON.stringify(data.state);
        const localStr = localStorage.getItem("dbk-last-seen-state") || "";
        
        if (!syncedInit) {
          // First time join
          const ts = new Date().getTime();
          localStorage.setItem(`dbk-backup-${ts}`, JSON.stringify(serializedState));
          localStorage.setItem("dbk-last-seen-state", remoteStr);
          applyServerState(data.state);
          setSyncedInit(true);
        } else if (remoteStr !== localStr) {
          // State changed significantly on the host! (e.g. they advanced the bracket)
          localStorage.setItem("dbk-last-seen-state", remoteStr);
          applyServerState(data.state);
        }
      }

      // Parse picks to figure out what the *other* person picked
      // We look for picks made by a name that isn't ours.
      if (data.picks) {
        let foundTheirPick: number | null = null;
        let foundTheirName = "Friend";
        
        Object.entries(data.picks).forEach(([name, pickData]: [string, unknown]) => {
          const pd = pickData as { seed: number };
          if (name !== myName) {
            foundTheirPick = pd.seed;
            foundTheirName = name;
          }
        });

        // Also if we have a match pick locally but DB reset it, clear ours.
        // Actually to keep it simple, we just read theirs.
        setCoopState(prev => ({
          ...prev,
          theirPick: foundTheirPick,
          theirName: foundTheirName
        }));
      } else {
        // Picks were cleared
        setCoopState(prev => ({
          ...prev,
          theirPick: null
        }));
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, myName, syncedInit, applyServerState]); // intentionally excluded serializedState from deps so it doesn't infinite loop on host seed

  const lockPick = (seed: number) => {
    setCoopState(prev => ({ ...prev, myPick: seed }));
    if (roomCode) {
      const myPickRef = ref(db, `rooms/${roomCode}/picks/${myName}`);
      set(myPickRef, { seed, timestamp: Date.now() });
    }
  };

  const forceResolve = (_winnerResultSeed: number) => {
    // Both clients will call this locally when they agree,
    // so we should clear the picks in the DB to reset the state for the next match.
    if (roomCode) {
      const picksRef = ref(db, `rooms/${roomCode}/picks`);
      set(picksRef, null); // wipe picks
      
      const stateRef = ref(db, `rooms/${roomCode}/state`);
      setTimeout(() => {
        const remoteStr = JSON.stringify(serializedState);
        localStorage.setItem("dbk-last-seen-state", remoteStr);
        set(stateRef, serializedState);
      }, 500); 
    }
     setCoopState(prev => ({ ...prev, myPick: null, theirPick: null }));
  };

  return { connected, coopState, lockPick, forceResolve };
}
