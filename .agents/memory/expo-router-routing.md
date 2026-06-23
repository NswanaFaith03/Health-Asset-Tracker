---
name: Expo Router routing pitfalls
description: Common routing mistakes in Expo Router v6 that cause "screen does not exist" / crash after login
---

## Rules

1. **Never navigate to a group-only path.** `router.replace("/(student)")` crashes — the group folder has no index screen. Always include the screen name: `router.replace("/(student)/home")`.

2. **Delete the scaffold `(tabs)` directory.** The Expo template leaves `app/(tabs)/index.tsx` which maps to URL `/` — the same as `app/index.tsx`. This causes a silent route conflict that crashes after login. Delete both `(tabs)/_layout.tsx` and `(tabs)/index.tsx`.

3. **Don't use `<Link asChild>` with `<TouchableOpacity>` for group routes on web.** It fails to resolve parenthetical group paths. Use `router.push("/(auth)/register")` directly instead.

**Why:** Expo Router v6 on web uses URL-based routing; route groups with `()` are transparent in the URL but must be resolved via the router's internal graph. Multiple files mapping to the same URL (e.g., `/`) cause silent conflicts.

**How to apply:** Whenever adding post-auth redirects or auth screen navigation, always use full paths like `/(role)/firstscreen` and verify no other files in the project map to the same URL.
