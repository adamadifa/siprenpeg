# Product Requirement Document (PRD) - Portal Asatidz (Karyawan) PWA

## 1. Project Overview
Project **Asatidz Portal** is a standalone Progressive Web App (PWA) client designed specifically for employees/teachers (karyawan/asatidz) of the Siprenpas ecosystem. The app will communicate with the existing `siprenpas` backend via a secure REST API. It aims to replace the direct web login of karyawan inside the monolithic app, providing a fast, native-app-like mobile-first experience.

---

## 2. Objectives & Value Proposition
- **Decoupled Architecture**: Turn the `siprenpas` backend into a RESTful API provider for employee operations, allowing the frontend to run independently.
- **PWA Capabilities**: Enable offline access, home screen installation (A2HS), fast loading, and future support for push notifications.
- **Modern Mobile-First UI**: Deliver a highly interactive, responsive, and premium interface that matches native mobile app experiences.

---

## 3. Target Audience
- **Asatidz & Karyawan (Employees)**: Staff and teachers who need to perform daily check-ins, request leave, and monitor their attendance history.

---

## 4. Key Features & Functional Requirements

### 4.1. Authentication (REST API)
- Secure login using `username` / `email` and `password`.
- Token-based session management (via Laravel Sanctum or JWT).
- Session auto-refresh and secure storage (LocalStorage/Secure Cookies).
- Biometric Login (optional / future phase).

### 4.2. Dashboard & Profile
- Quick view of today's attendance status (Checked In / Checked Out / Absent).
- Daily work schedule and active shift times.
- Employee profile information (NPP, name, position/jabatan, unit, photo).

### 4.3. Presensi (Attendance Tracking)
- Real-time Check-In and Check-Out.
- Geolocation tracking (comparing current location with office coordinates).
- Camera capture for selfie-based attendance (if required by system policies).
- Monthly attendance rekap (hadir, izin, sakit, alpa, cuti) and history of the last 30 days.

### 4.4. Pengajuan Izin & Sakit (Leave/Permission Request)
- Form to submit leave requests (Izin Absen, Izin Sakit) with date ranges and descriptions.
- File upload for sickness certificates/supporting documents.
- Real-time status tracker (Pending, Approved, Rejected).

---

## 5. Technical Stack Recommendation
For optimal performance, modern UI, and PWA capabilities:

1. **Frontend Framework**: **React.js (TypeScript)** powered by **Vite**
   - *Why*: Incredible build speed, small bundle footprint, and native TypeScript support.
2. **PWA Integration**: **`vite-plugin-pwa`**
   - *Why*: Automates Service Worker registration, manifest generation, offline caching strategies (Workbox), and update prompts.
3. **Styling**: **Tailwind CSS + DaisyUI** (or Shadcn UI)
   - *Why*: Quick creation of highly responsive, premium-grade dark/light mode interfaces with minimal CSS overhead.
4. **Data Fetching & State**: **TanStack Query (React Query) + Axios**
   - *Why*: Out-of-the-box support for offline caching, background re-fetching, optimistic updates, and loading state management.
5. **Router**: **React Router DOM** (or TanStack Router)
   - *Why*: Industry standard for React SPA routing.
6. **Icons**: **Tabler Icons (`@tabler/icons-react`)**
   - *Why*: Uniform aesthetics consistent with the desktop dashboard icon system.

---

## 6. Non-Functional Requirements
- **Performance**: Lighthouse performance score > 90.
- **Offline Mode**: Cache main shell assets (HTML, CSS, JS, common icons) to allow loading the app without internet access. Cache last-fetched attendance history for offline viewing.
- **Security**: HTTPS only, token encryption in storage, proper CORS headers on the Laravel API.
