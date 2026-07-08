# Implementation Checklist - Portal Asatidz PWA

This checklist details the steps to build the `asatidz` PWA client.

---

## Proposed Roadmap & Checklist

### Phase 1: Project Scaffolding & Setup
- [x] Initialize the React project inside the `asatidz` folder:
  ```powershell
  npx -y create-vite@latest ./ --template react-ts
  ```
- [x] Install essential dependencies:
  - Routing: `react-router-dom`
  - HTTP client: `axios`
  - Caching & Sync: `@tanstack/react-query`
  - Icons: `@tabler/icons-react`
- [x] Install PWA Plugin:
  ```powershell
  npm install vite-plugin-pwa --save-dev
  ```

### Phase 2: Design System & Styling
- [x] Set up Tailwind CSS:
  - Install tailwindcss, postcss, autoprefixer.
  - Configure Tailwind with `@tailwindcss/vite` in `vite.config.ts`.
- [x] Install DaisyUI (UI components) and configure themes (matching the green `#064e3b` brand color).
- [x] Establish global layout wrapper (mobile-optimized dashboard skeleton).

### Phase 3: PWA & Manifest Configuration
- [x] Configure `vite-plugin-pwa` in `vite.config.ts`:
  - Define name, short_name, icons, theme_color, and background_color in the Web App Manifest.
  - Configure registerType ('autoUpdate') and workbox caching strategies.
- [x] Add the service worker registration code to `main.tsx`.

### Phase 4: Routing & Basic Authentication Flow
- [x] Define routes:
  - `/login` (public)
  - `/` (dashboard - protected)
  - `/presensi` (attendance page - protected)
  - `/izin` (leave submission page - protected)
  - `/profile` (protected)
- [x] Set up global axios instance with Authorization header interception.
- [x] Build the Login page UI and implement token-based session persistence.

### Phase 5: Feature Implementation (REST API integration)
- [ ] **Dashboard**: Display active status, daily check-in button, and profile summary.
- [ ] **Presensi**: Capture geolocation coords and submit Check-In/Check-Out payload. Display a list of the last 30 days' attendance records.
- [ ] **Izin / Sakit**: Form to upload photos/certificates and request leave.
- [ ] **Offline fallback**: Configure TanStack query client to support caching responses so details remain visible when offline.
