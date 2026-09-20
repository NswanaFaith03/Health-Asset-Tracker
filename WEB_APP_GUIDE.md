# UNZA DigiHealth Web App - Setup & Structure Guide

## Overview

The **DigiHealth Web App** is a React Native + Expo Router-based application designed for UNZA Campus Clinic. It supports multiple user roles (students, doctors, pharmacists, nurses, lab technicians, mental health counselors, HIV professionals, and admins) with role-based routing and secure authentication.

The web version is built with:
- **Expo Router** for file-based routing (similar to Next.js)
- **React Native Web** for cross-platform compatibility
- **React Native Reanimated** for smooth animations
- **TanStack React Query** for server state management
- **Zod** for schema validation
- **Tailwind CSS** for web styling

---

## Project Structure

```
artifacts/digihealth/
├── app/                          # Main application routes (Expo Router)
│   ├── index.tsx                 # Root/landing page (redirects based on auth)
│   ├── +not-found.tsx            # 404 fallback page
│   ├── _layout.tsx               # Root layout (providers, fonts, setup)
│   │
│   ├── (Joshua-auth)/            # Authentication routes
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   │
│   ├── (Faith-student)/          # Student dashboard routes
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── profile.tsx
│   │   ├── consultations.tsx
│   │   ├── consultation-detail.tsx
│   │   ├── prescriptions.tsx
│   │   ├── lab.tsx
│   │   ├── lab-result.tsx
│   │   ├── queue.tsx
│   │   ├── mental-buddy.tsx
│   │   ├── mental-buddy-chat.tsx
│   │   ├── hiv-aids.tsx
│   │   └── notifications.tsx
│   │
│   ├── (AAron-doctor)/           # Doctor dashboard routes
│   │   ├── _layout.tsx
│   │   ├── queue.tsx
│   │   ├── consultations.tsx
│   │   ├── consultation-detail.tsx
│   │   ├── prescriptions.tsx
│   │   └── lab-requests.tsx
│   │
│   ├── (Khadijah-Joshua-pharmacist)/  # Pharmacist routes
│   │   ├── _layout.tsx
│   │   ├── prescriptions.tsx
│   │   └── history.tsx
│   │
│   ├── (Khadijah-lab)/           # Lab Technician routes
│   │   ├── _layout.tsx
│   │   ├── requests.tsx
│   │   └── results.tsx
│   │
│   ├── (AAron-nurse)/            # Nurse routes
│   │   ├── _layout.tsx
│   │   ├── queue-management.tsx
│   │   └── lab-requests.tsx
│   │
│   ├── (Faith-moses-mental-health)/  # Mental Health routes
│   │   ├── _layout.tsx
│   │   ├── sessions.tsx
│   │   └── session-detail.tsx
│   │
│   ├── (moses-hiv-support)/      # HIV Support routes
│   │   ├── _layout.tsx
│   │   ├── sessions.tsx
│   │   ├── session-detail.tsx
│   │   └── resources.tsx
│   │
│   └── (Joshua-admin)/           # Admin dashboard routes
│       ├── _layout.tsx
│       ├── analytics.tsx
│       ├── users.tsx
│       ├── audit.tsx
│       └── emergency.tsx
│
├── components/                   # Reusable React components
│   ├── ErrorBoundary.tsx         # Error fallback UI
│   ├── ErrorFallback.tsx         # Detailed error display
│   ├── WebAppLayout.tsx          # Web-specific layout wrapper
│   ├── TabLayout.tsx             # Tab navigation wrapper
│   ├── ScreenHeader.tsx          # Screen header bar
│   ├── FeatureActionGrid.tsx     # Feature grid display
│   ├── AnimatedButton.tsx        # Animated button component
│   ├── MobileUIComponents.tsx    # Mobile UI elements
│   ├── KeyboardAwareScrollViewCompat.tsx  # Keyboard handling
│   └── Toast.tsx                 # Toast notifications
│
├── contexts/                     # React Context (global state)
│   ├── AuthContext.tsx           # Authentication state & hooks
│   └── ThemeContext.tsx          # Theme (light/dark) state
│
├── utils/                        # Utility functions
│   └── api-base-url.ts           # API base URL configuration
│
├── package.json                  # Dependencies & scripts
├── app.json                      # Expo app configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
└── eas.json                      # Expo Application Services config (if present)
```

---

## Key Files Explained

### 1. **app/_layout.tsx** (Root Layout)
- Sets up the global app shell with providers
- Initializes fonts (Inter from Google Fonts)
- Configures React Query for server state management
- Sets the API base URL via `setBaseUrl(getApiBaseUrl())`
- Renders the notification toast component
- Manages splash screen timing

**Key imports:**
```tsx
import { setBaseUrl } from "@workspace/api-client-react";
import { getApiBaseUrl } from "@/utils/api-base-url";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
```

### 2. **app/index.tsx** (Root Landing Page)
- Checks if user is authenticated via `useAuth()`
- Shows loading spinner while auth state initializes
- Redirects unauthenticated users to the login page
- Routes authenticated users based on their role:
  - `student` → `/(Faith-student)/home`
  - `doctor` → `/(AAron-doctor)/queue`
  - `pharmacist` → `/(Khadijah-Joshua-pharmacist)/prescriptions`
  - `lab_technician` → `/(Khadijah-lab)/requests`
  - `nurse` → `/(AAron-nurse)/lab-requests`
  - `mental_health_counselor` → `/(Faith-moses-mental-health)/sessions`
  - `hiv_professional` → `/(moses-hiv-support)/sessions`
  - `admin` → `/(Joshua-admin)/analytics`

### 3. **utils/api-base-url.ts** (API Configuration)
Returns the correct API base URL depending on platform and environment:

```typescript
export function getApiBaseUrl(): string {
  // 1. Check for explicit EXPO_PUBLIC_API_URL env var (stripped of /api suffix)
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (configuredBaseUrl) return configuredBaseUrl.replace(/\/api$/, "");

  // 2. Web: Use Vercel production host
  if (Platform.OS === "web") {
    return "https://health-asset-tracker.vercel.app";
  }

  // 3. Android/iOS: Use debugger host if available
  const host = getExpoDebuggerHost();
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:5000`;
  }

  // 4. Android: Use special local IP
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }

  // 5. Fallback: localhost
  return "http://localhost:5000";
}
```

**Why the base URL is the origin only:**
The generated API client uses relative paths like `/api/auth/login`. By setting the base to the origin (e.g., `https://health-asset-tracker.vercel.app`), the final request becomes `https://health-asset-tracker.vercel.app/api/auth/login` (single `/api` prefix). Previously, if the base included `/api`, it would result in a duplicated path.

### 4. **contexts/AuthContext.tsx** (Authentication)
Manages user authentication and session state:
- Stores current user info
- Provides login/logout functions
- Handles token management
- Provides `useAuth()` hook for components

**Usage in components:**
```tsx
const { currentUser, isLoading, login, logout } = useAuth();
```

### 5. **contexts/ThemeContext.tsx** (Theme)
Manages light/dark theme state:
- Provides theme provider wrapper
- Exposes `useTheme()` hook
- Syncs theme preferences

---

## Setup & Installation

### Prerequisites
- **Node.js** v18+ and **pnpm** (or npm/yarn)
- **Expo CLI** (installed as devDependency, accessed via `pnpm exec expo`)

### Installation Steps

1. **Install dependencies:**
   ```bash
   cd '/home/dalitso/Desktop/projects /Health-Asset-Tracker'
   pnpm install
   ```

2. **Build the workspace packages:**
   ```bash
   pnpm exec turbo run build
   ```

3. **Start the dev server:**
   ```bash
   cd artifacts/digihealth
   pnpm exec expo start --web
   ```

---

## Running the Web App

### Local Development (Default)

**Start Metro bundler and Expo server:**
```bash
cd artifacts/digihealth
pnpm exec expo start --web --port 19006
```

The app will be available at:
- **http://localhost:19006** (web) or **http://localhost:19007** (if 19006 is in use)

**Interactive commands while running:**
- Press `w` → Open web app in browser
- Press `r` → Reload the app
- Press `a` → Open Android emulator
- Press `i` → Open iOS simulator
- Press `j` → Open debugger
- Press `m` → Toggle menu
- Press `?` → Show all commands
- Press `Ctrl+C` → Exit

### Development with Environment Override

To override the API base URL:
```bash
EXPO_PUBLIC_API_URL=http://localhost:5000 pnpm exec expo start --web
```

### Production Build

Build optimized web bundle:
```bash
cd artifacts/digihealth
pnpm run build
```

The bundle will be output to `dist/` (or `web/` depending on Expo config).

---

## Package Configuration

### package.json Scripts

| Script | Purpose |
|--------|---------|
| `pnpm run dev` | Start dev server (Replit config) |
| `pnpm run dev:local` | Start dev server (local) |
| `pnpm run build` | Build production bundle |
| `pnpm run serve` | Serve production build locally |
| `pnpm run typecheck` | Run TypeScript type checking |
| `pnpm run android` | Build and run on Android device |
| `pnpm run ios` | Build and run on iOS device |

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0.35 | Framework for React Native web/mobile |
| `expo-router` | ~6.0.17 | File-based routing (like Next.js) |
| `react-native-web` | ^0.21.0 | Run React Native on web |
| `@tanstack/react-query` | catalog | Server state management |
| `react-native-reanimated` | ~4.1.1 | Smooth animations |
| `tailwindcss` | catalog | Utility-first CSS framework |
| `zod` | catalog | Schema validation |

---

## Authentication Flow

1. **App Launch:**
   - `_layout.tsx` initializes and sets base URL
   - `index.tsx` checks if user is authenticated

2. **Not Authenticated:**
   - User redirected to `/(Joshua-auth)/login`
   - Login form calls API: `POST /api/auth/login`
   - Backend returns auth token

3. **Authenticated:**
   - Token stored in `AuthContext`
   - User redirected to role-specific dashboard
   - Subsequent API calls include token in headers

4. **Logout:**
   - Call `logout()` from `useAuth()`
   - Token cleared from context
   - User redirected to login page

---

## API Integration

### Generated API Client

The app uses a **generated API client** from [`@workspace/api-client-react`](../lib/api-client-react/):

```tsx
import { useLogin, useLogout, useGetProfile, /* ... */ } from "@workspace/api-client-react";

// Inside a component:
const { mutate: login } = useLogin();
const { data: profile } = useGetProfile();
```

### Base URL Resolution

The API client is initialized with the correct base URL in `_layout.tsx`:

```tsx
const apiBaseUrl = getApiBaseUrl();
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}
```

### Example API Call

**Web (production):**
- Base: `https://health-asset-tracker.vercel.app`
- Endpoint: `/api/auth/login`
- Final URL: `https://health-asset-tracker.vercel.app/api/auth/login`

**Mobile (local dev):**
- Base: `http://10.0.2.2:5000` (Android) or `http://localhost:5000` (iOS)
- Endpoint: `/api/auth/login`
- Final URL: `http://10.0.2.2:5000/api/auth/login`

---

## Routing Structure

### Expo Router Group Folders

Routes are organized using **group folders** (parentheses syntax) for role-based separation:

- `(Joshua-auth)` — Login, register, password reset
- `(Faith-student)` — Student dashboard & features
- `(AAron-doctor)` — Doctor queue & consultations
- `(Khadijah-Joshua-pharmacist)` — Pharmacist prescriptions
- `(Khadijah-lab)` — Lab technician requests & results
- `(AAron-nurse)` — Nurse queue management
- `(Faith-moses-mental-health)` — Mental health sessions
- `(moses-hiv-support)` — HIV support sessions
- `(Joshua-admin)` — Admin analytics & user management

### Dynamic Routes

Dynamic routes use square brackets:
- `consultation-detail.tsx` → navigated via link with ID
- `session-detail.tsx` → navigated with session ID

---

## Styling

### Tailwind CSS

The web app uses **Tailwind CSS** for styling:

```tsx
<View style={{ className: "bg-emerald-900 text-white p-6" }} />
```

### React Native Styles

Mobile components use React Native's `StyleSheet`:

```tsx
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
});
```

### Theme Support

Theme context provides theme values:

```tsx
const { theme } = useTheme();
<View style={{ backgroundColor: theme.bg }} />
```

---

## Web-Specific Considerations

### Platform Detection

Use `Platform.OS` to branch code for web vs. mobile:

```tsx
import { Platform } from "react-native";

if (Platform.OS === "web") {
  // Web-only code
}
```

### Web Layout Wrapper

The app wraps content in a `WebContainer` for web to provide a mobile-sized viewport:

```tsx
<View style={{ maxWidth: 480, alignSelf: "center" }} />
```

This ensures the mobile design is centered and properly constrained on larger screens.

### Browser Console

Log messages appear in the browser console during development:

```tsx
console.log("Debug message"); // See in browser DevTools
```

---

## Development Workflow

### 1. Start the Dev Server
```bash
cd artifacts/digihealth
pnpm exec expo start --web
```

### 2. Open in Browser
- Press `w` or manually visit `http://localhost:19006`

### 3. Edit Files
- Changes auto-reload in the browser (Fast Refresh)
- TypeScript errors show in Metro terminal

### 4. Debug
- Open browser DevTools (F12)
- See `console.log()` output
- Use React DevTools extension (if installed)

### 5. Commit Changes
```bash
cd /home/dalitso/Desktop/projects /Health-Asset-Tracker
git add .
git commit -m "Feature: ..."
```

---

## Troubleshooting

### Issue: "Cannot POST /api/api/auth/login" (HTTP 404)

**Cause:** Base URL was set to `https://health-asset-tracker.vercel.app/api`, and the generated endpoint adds `/api/auth/login`, resulting in a duplicate `/api/api/...` path.

**Solution:** Ensure `getApiBaseUrl()` returns the origin only (without `/api`):
```ts
return "https://health-asset-tracker.vercel.app";  // ✓ Correct
// NOT: "https://health-asset-tracker.vercel.app/api"  // ✗ Wrong
```

### Issue: "Port 19006 is already in use"

**Solution:** Use a different port:
```bash
pnpm exec expo start --web --port 19007
```

Or kill the existing process:
```bash
lsof -i :19006
kill -9 <PID>
```

### Issue: Metro bundler is slow

**Solution:** Clear cache and restart:
```bash
pnpm exec expo start --web --clear
```

### Issue: Changes not reflecting after file edit

**Solution:** Press `r` in the Metro terminal to hard reload, or restart the server.

### Issue: TypeScript errors in IDE

**Solution:** Ensure TypeScript version matches and run:
```bash
pnpm run typecheck
```

---

## Backend API Reference

### Base URL
- **Production (Web):** `https://health-asset-tracker.vercel.app/api`
- **Local Dev:** `http://localhost:5000/api`

### Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/auth/login` | User login |
| `POST` | `/auth/register` | User registration |
| `POST` | `/auth/logout` | User logout |
| `GET` | `/auth/me` | Get current user |
| `POST` | `/auth/refresh` | Refresh auth token |
| `GET` | `/healthz` | Health check |

### Health Check
Verify the backend is running:
```bash
curl -i https://health-asset-tracker.vercel.app/api/healthz
# Should return: HTTP 200
```

---

## Environment Variables

### EXPO_PUBLIC_API_URL
Override the API base URL:
```bash
EXPO_PUBLIC_API_URL=http://localhost:5000 pnpm exec expo start --web
```

### EXPO_PUBLIC_DOMAIN (Replit)
Set by Replit for development:
```bash
EXPO_PACKAGER_PROXY_URL=https://$REPLIT_EXPO_DEV_DOMAIN \
EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN \
pnpm exec expo start
```

---

## Performance Optimization

### Code Splitting
Expo Router automatically code-splits by route, loading only necessary code.

### React Compiler
The app uses **React Compiler** (babel plugin) for optimized renders.

### Image Optimization
Use `expo-image` for optimized image loading:
```tsx
import { Image } from "expo-image";

<Image source={require("./avatar.png")} style={{ width: 48, height: 48 }} />
```

---

## Testing (Future)

To add testing:
```bash
pnpm add -D vitest @testing-library/react-native @testing-library/jest-native
```

Example test:
```tsx
import { render, screen } from "@testing-library/react-native";
import { LoginScreen } from "@/app/(Joshua-auth)/login";

test("renders login form", () => {
  render(<LoginScreen />);
  expect(screen.getByText(/Email Address/i)).toBeInTheDocument();
});
```

---

## Deployment

### Deploy to Vercel (Backend Already Deployed)

The backend is already deployed at:
```
https://health-asset-tracker.vercel.app/api
```

To deploy the web app to Vercel:

1. **Build the static web bundle:**
   ```bash
   cd artifacts/digihealth
   pnpm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

   Or connect your GitHub repo to Vercel for auto-deployments.

3. **Update EXPO_PUBLIC_API_URL** (if needed) in Vercel environment variables.

---

## Additional Resources

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Native Docs](https://reactnative.dev/)
- [React Native Web Docs](https://necolas.github.io/react-native-web/)
- [TanStack React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

## Support

For issues or questions:
1. Check this guide's **Troubleshooting** section
2. Review Metro terminal output for errors
3. Check browser DevTools (F12) for client-side errors
4. Verify backend is running: `curl -i https://health-asset-tracker.vercel.app/api/healthz`

---

**Last Updated:** September 7, 2026  
**Created for:** UNZA DigiHealth Web App  
**Developers:** Joshua (Auth Lead), Faith (Student UI), Aaron (Doctor UI), Khadijah (Lab/Pharmacy), Moses (HIV/Mental Health Support)
