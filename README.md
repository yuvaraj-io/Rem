# Rem - Full-Stack Next.js Hierarchical Todo & Directory Manager

**Rem** is a modern, responsive, full-stack **Next.js** application for organizing hierarchical nested directories and tasks with real-time DOMPurify validation, Material UI (MUI) themes, multi-device Google & Device Key authentication, and MongoDB storage.

---

## ✨ Key Features

- ⚡ **Full-Stack Next.js (App Router)**: Unified frontend and API routes (`/api/nodes`, `/api/auth`) in a single performant project.
- 📁 **Hierarchical Directory Tree**: Create directories within directories to arbitrary depth (`Root > Work > Projects > ...`).
- 📝 **Per-Directory Tasks**: Add, complete, filter, and organize tasks within any folder level.
- 🛡️ **Reactive DOMPurify Validation**: Real-time input sanitization on every keystroke and focus event, keeping initial loads pristine.
- 🎨 **Material UI (MUI) & Custom ThemeContext**: Modern theme system with dynamic Light/Dark mode switching and custom component styling.
- 🔑 **Dual Authentication (Google OAuth + Shareable Device Key)**:
  - Sign in with Google on your primary device.
  - Generate a secret **Device Login Key** and use it to instantly log in on secondary devices (mobile, tablet, or secondary browsers) without needing Google login.
- 🍃 **MongoDB Persistence + Offline Resilience**: Persistent storage in MongoDB via Mongoose with graceful LocalStorage fallback.

---

## 🚀 Getting Started

### 1. Configure Environment Variables
Copy or edit `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
MONGODB_URI=mongodb://127.0.0.1:27017/rem_todos
JWT_SECRET=rem_secret_jwt_key_2026
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```