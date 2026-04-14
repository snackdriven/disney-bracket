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
               localStorage.setItem("dbk-last-upload-state", remoteStr);
               onPullRef.current(data.state ?? null, data.notes ?? null);
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

  // Auto-push on state change (debounced 2s).
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!fbUser) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    
    syncTimerRef.current = setTimeout(async () => {
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
      
      setTimeout(() => setSyncStatus("idle"), 3000);
    }, 2000);
    
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [serialized, notes, fbUser]);

  return { fbUser, syncStatus, showAuthModal, setShowAuthModal };
}
