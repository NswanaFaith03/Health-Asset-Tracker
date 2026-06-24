---
name: Expo tab bar icon size on web
description: tabBarIcon callback size prop is unreliable on web — always use a fixed pixel value
---

## Rule
In Expo Router `<Tabs>` tab bar icon callbacks, always use a **fixed size integer** (e.g. `size={22}`) instead of the `size` prop from the callback.

```tsx
// BAD — size is undefined on web, icon renders blank
tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />

// GOOD — explicit size always renders
tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />
```

**Why:** On Expo web (React Native Web renderer), the `size` value passed to `tabBarIcon` can be `undefined`, causing the icon to render at 0px height — visually blank. Native (iOS/Android) is unaffected because those renderers always supply a numeric `size`.

**How to apply:** Any time you add a tab screen to a `<Tabs>` layout, omit `size` from the destructure and hardcode `size={22}` (or your preferred icon size).
