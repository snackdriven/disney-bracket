import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { auth, db } from '../lib/firebase.js';
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, onValue, set } from "firebase/database";
import type { Notes } from '../types.js';

interface SyncProps {
  serialized: object;
  notes: Notes;
  onPull: (state: unknown, notes: unknown) => void;
}

export function useFirebaseSync({ serialized, notes, onPull }: SyncProps) {
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep onPull ref current
  const onPullRef = useRef(onPull);
  useLayoutEffect(() => { onPullRef.current = onPull; });

  // Auth init
  useEffect(() => {
    let unsubscribeDB: () => void = () => {};
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
      
      if (user) {
        // Unsubscribe from previous user's db listener if any
        unsubscribeDB();
        
        const userRef = ref(db, `users/${user.uid}`);
        
        // Listen to the cloud and sync down, 
        // using localStorage comparison to prevent echo loops.
        unsubscribeDB = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const remoteStr = JSON.stringify(data.state);
            const localStr = localStorage.getItem("dbk-last-upload-state") || "";

            // Only pull if the server state is different from what we last pushed/pulled
            if (remoteStr !== localStr) {
               // Prevent overwriting a local bracket with an empty/older cloud bracket on first login
               const localStateObj = JSON.parse(localStorage.getItem("dbk-state") || "{}");
               const localHistoryLen = Array.isArray(localStateObj.history) ? localStateObj.history.length : 0;
               const remoteHistoryLen = data.state && Array.isArray(data.state.history) ? data.state.history.length : 0;

               if (localStr === "" && localHistoryLen > remoteHistoryLen) {
                 // Skip pull. The local state will be pushed by the debounce/forcePush.
               } else {
                 localStorage.setItem("dbk-last-upload-state", remoteStr);
                 onPullRef.current(data.state ?? null, data.notes ?? null);
               }
            }
          }
        });
      } else {
        unsubscribeDB();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDB();
    };
  }, []); 

  const forcePush = async () => {
    if (!fbUser) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    setSyncStatus("syncing");
    try {
      const remoteStr = JSON.stringify(serialized);
      localStorage.setItem("dbk-last-upload-state", remoteStr);
      const userRef = ref(db, `users/${fbUser.uid}`);
      await set(userRef, {
        notes,
        state: serialized,
        updated_at: new Date().toISOString()
      });
      setSyncStatus("synced");
    } catch (err) {
      console.error("Firebase sync error:", err);
      setSyncStatus("error");
    }
  };

  // Auto-push on state change (debounced 2s).
  useEffect(() => {
    if (!fbUser) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    
    syncTimerRef.current = setTimeout(() => {
      forcePush().then(() => {
        setTimeout(() => setSyncStatus("idle"), 3000);
      });
    }, 2000);
    
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [serialized, notes, fbUser]);

  return { fbUser, syncStatus, showAuthModal, setShowAuthModal, forcePush };
}
