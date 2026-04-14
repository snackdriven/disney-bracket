# Release Process

This document outlines the standard operating procedure for pushing new updates and version milestones for the Disney Bracket application. 

By standardizing this, we ensure a clean, chronological history of features that users can easily digest from the in-app Changelog.

## 1. Versioning
We use basic [SemVer](https://semver.org/).
- **v1.X.0** (Minor): Significant new features (e.g. adding Co-op Sync).
- **v1.0.X** (Patch): UI fixes, small isolated features (e.g. Recent Rooms).

## 2. Pre-Release Checklist
Before you tag a release, you MUST:
1. Ensure all code compiles cleanly (`npx tsc --noEmit`).
2. Hardcode the new patch notes into the `MobileMenuModal.tsx` Changelog component so users see it immediately.
3. Ensure no local dev-only values are hardcoded in prod URLs.

## 3. The Release Flow
Once your feature is merged or committed locally, use `git` and `gh` to trigger the actual version:

```sh
# 1. Update the frontend Changelog UI in the code! Then commit it.
git commit -am "chore: prep v1.1.0 release"

# 2. Tag the snapshot
git tag v1.1.0

# 3. Push it directly to Github
git push --tags

# 4. Use the GitHub CLI to generate a formal release for players
gh release create v1.1.0 --title "v1.1.0: The Amazing Update" --notes "Short 1 sentence summary goes here."
```

By enforcing this flow, all future contributors (or LLM agents) can quickly wrap up a milestone with a single unified command chain and keep the UI in sync!
