import { createClient } from "@supabase/supabase-js";

const SB_URL = import.meta.env.VITE_SUPABASE_URL as string || "https://pynmkrcbkcfxifnztnrn.supabase.co";
const SB_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string || "sb_publishable_8VEm7zR0vqKjOZRwH6jimw_qIWt-RPp";

export const supabase = createClient(SB_URL, SB_ANON, {
  auth: { flowType: "implicit", storageKey: "disney-bracket-auth" },
});
