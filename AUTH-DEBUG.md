# Supabase Auth Debugging Log
**App:** https://snackdriven.github.io/disney-bracket/
**Supabase project:** pynmkrcbkcfxifnztnrn.supabase.co
**Date:** 2026-02-25

---

## What we're trying to do

Add magic link auth to disney-bracket so users can sign in with their email and sync their bracket state across devices. When a user clicks the magic link, the site should detect the session and show their email + a sync status indicator.

The Supabase project is shared with tender-circuit (which has working auth), so the project itself is valid.

---

## Current code state

**`src/App.jsx`**

```js
// Supabase client — explicit implicit flow, no PKCE
const supabase = createClient(SB_URL, SB_ANON, { auth: { flowType: "implicit" } });
```

Two auth useEffects on mount:

1. **Token-hash handler** (lines 611–625): reads `?token_hash=&type=email` query params, calls `verifyOtp`, cleans up URL. This is for the PKCE-style email template where the token is in the query string instead of the hash.

2. **Auth state listener** (lines 630–643): `onAuthStateChange` subscription. On `SIGNED_IN` or `INITIAL_SESSION` with a user present, sets `sbUser` and calls `pullFromSupabase()`.

The implicit flow path: Supabase redirects back with `#access_token=...&refresh_token=...` in the URL hash. The Supabase JS client reads this synchronously during `createClient` initialization, then fires `onAuthStateChange(SIGNED_IN, session)` once the async `/auth/v1/user` call resolves.

**One concern we investigated:** A state-persistence `useEffect` overwrites `window.location.hash` with bracket state JSON when the user has picks saved. We confirmed this shouldn't matter — GoTrueClient captures the hash parameters synchronously before any React effects run.

---

## What we tried

### Attempt 1: flowType: "pkce"
Changed the client to `flowType: "pkce"`. Deployed. Still not working.
**Reverted** — tender-circuit uses the same Supabase project with implicit flow and works. Server is sending `#access_token=...` hashes, not `?code=...` params. PKCE was wrong.

### Attempt 2: Custom email template + verifyOtp handler
Discovered that PKCE magic links need a custom template with `{{ .TokenHash }}` in the URL, plus a `verifyOtp` call on the client side.

- Created `supabase/templates/magic_link.html` with `?token_hash={{ .TokenHash }}&type=email` link
- Added `verifyOtp` useEffect to handle that query param
- User also changed the email template in the Supabase dashboard directly

**Result:** `supabase config push` failed (401 on billing endpoint), so config.toml changes never reached remote. The dashboard change may or may not have stuck — unclear what template is currently active.

### Attempt 3: Supabase dashboard allowlist check
Confirmed `https://snackdriven.github.io/disney-bracket/` is in the redirect URL allowlist (we know this because the magic link email correctly redirects to the disney-bracket URL, not an error page).

**Site URL in dashboard:** `https://snackdriven.github.io` (no trailing path — this is intentional, it's the root of the GitHub Pages user/org site)

### Attempt 4: Playwright testing
Tested via headless Chrome (1920x1080):

- OTP request: confirmed 200 response, correct `redirect_to=https://snackdriven.github.io/disney-bracket/`, `code_challenge: null` (implicit flow ✓)
- Hit rate limit (429 `over_email_send_rate_limit`) — fixed by upping limit in Supabase dashboard
- Tested actual magic link URL from email inbox:

```
https://pynmkrcbkcfxifnztnrn.supabase.co/auth/v1/verify?token=1b90f68d...&type=magiclink&redirect_to=https://snackdriven.github.io/disney-bracket/
```

**Result:** `#error=access_denied&error_code=otp_expired` — token was expired (already used, or >1 hour old)

---

## Current status

The infrastructure is correct:
- `redirect_to` URL is right ✓
- Allowlist includes disney-bracket URL ✓
- `flowType: "implicit"`, no `code_challenge` in OTP request ✓
- `onAuthStateChange` listener set up correctly ✓

The one untested path: a **fresh, unused magic link clicked within 1 hour**. Every test so far either hit an expired token or a rate limit. The auth code hasn't been validated end-to-end with a valid session yet.

---

## Open questions

1. **What email template is currently active in the Supabase dashboard?** The user changed it during debugging. If it's the custom `?token_hash=...` version, the `verifyOtp` handler in the code handles it. If it's the default `{{ .ConfirmationURL }}`, the implicit flow hash handler handles it. Both paths exist in the code now.

2. **Does `verifyOtp` fire correctly when both handlers exist?** If the dashboard template is currently custom (token_hash), the `verifyOtp` call runs and fires `onAuthStateChange(SIGNED_IN)`. If it's back to default, the implicit hash flow runs instead. Need to confirm which template is active.

---

## Next step

Request a fresh magic link from the live site and click it immediately (don't share the URL — use it directly). If it still doesn't work with a fresh token, check:

1. Browser console for any errors during the redirect
2. Network tab: does it fire a `GET /auth/v1/user` request? If yes, what does it return?
3. What's in `window.location` after landing?

---

## Supabase project details

- **URL:** `https://pynmkrcbkcfxifnztnrn.supabase.co`
- **Anon key:** `sb_publishable_8VEm7zR0vqKjOZRwH6jimw_qIWt-RPp`
- **Table:** `disney_bracket` (columns: `user_id`, `state`, `notes`, `updated_at`)
- **Shared with:** tender-circuit (same project, working auth)
