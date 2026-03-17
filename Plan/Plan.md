# 🔐 FaceVault — Password Manager with Facial Recognition

## 1. Project Overview

**FaceVault** is a premium desktop password manager application that uses facial recognition with anti-spoofing as its primary authentication method. The application is built with **Electron + React + TypeScript** for the desktop frontend and a **Python backend** for face authentication.

### Core Concept
Instead of a traditional master password, users authenticate using their face via a live webcam feed. The existing `FaceRecognition.py` script handles face detection, anti-spoofing (liveness detection), and identity verification using InsightFace + MiniFASNet models. Only authenticated, non-spoofed faces can access the password vault.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Desktop Shell** | Electron | Native desktop window, system tray, IPC |
| **Frontend Framework** | React 19 + TypeScript | UI components, state management |
| **Build Tool** | Vite 8 | Fast dev server & bundling |
| **Styling** | Vanilla CSS (Glassmorphism) | Dark theme, glass effects, animations |
| **Routing** | React Router v7 | Page navigation (Login ↔ Dashboard) |
| **Face Recognition** | Python (InsightFace + PyTorch) | Face detection, embedding, matching |
| **Anti-Spoofing** | MiniFASNetV2 (PyTorch) | Liveness detection to prevent photo attacks |
| **Password Storage** | SQLite + AES-256 encryption | Encrypted local database |
| **IPC Bridge** | `child_process` (Node.js ↔ Python) | Electron calls Python scripts |
| **Icons** | React Icons (Lucide) | UI iconography |

---

## 3. UI Design Specification

### 3.1 Login Screen (Based on User Design)
The login screen features a **dark space-themed background** with a glowing purple planet/nebula and the following elements:

- **Background**: Deep dark (#0a0a0f) with a large purple/violet planet glow on the right side and a smaller nebula glow on the left
- **Login Card**: Centered glassmorphic panel with:
  - Semi-transparent dark background (`rgba(20, 20, 30, 0.7)`)
  - `backdrop-filter: blur(20px)` glass effect
  - Subtle purple/violet border glow
  - **Title**: "Sign In" in bold white italic serif font
  - **Subtitle**: "Keep it all together and you'll be fine" in muted gray
  - **Email/Phone Input**: Dark input field with subtle border
  - **Password Input**: Dark input field with "Show" toggle button
  - **"Forgot Password"** link in muted text
  - **"Sign In" Button**: Purple gradient button (`#7c3aed` → `#a855f7`)
  - **Divider**: "or" text with horizontal lines
  - **Face Login Button**: "Sign in with Face ID" button (replaces Apple sign-in)
  - **Footer**: "New to FaceVault? Join Now" with purple accent link

### 3.2 Home/Dashboard Screen (Based on User Design — 1Password Style)
The dashboard is a dark, professional password manager with a 3-column layout:

- **Left Sidebar** (dark panel `#1a1a2e`):
  - App name "FaceVault" with user avatar dropdown
  - Navigation: Profile, All Items, Favorites, Watchtower
  - **Vaults Section**: Collapsible list (Private, Bank, Work, etc.) with colored icons and a "+" button to add vaults
  - **Tags Section**: Collapsible tag list for organizing entries

- **Center Content** (main area):
  - **Top Bar**: Back/forward navigation, search bar ("Search in Vault"), Help button, "+ New Item" button
  - **Category Filter**: "All Categories" dropdown with filter/sort icons
  - **Password List**: Grouped by month (e.g., "FEBRUARY 2025")
    - Each entry shows: Favicon/icon, Title, masked URL/username
    - Entries are clickable to view details

- **Right Detail Panel** (contextual):
  - Shows selected password entry details
  - Large icon placeholder when nothing is selected
  - Fields: Title, Username, Password (with copy/show), URL, Notes
  - Edit/Delete actions

### 3.3 Design System

| Token | Value |
|-------|-------|
| `--bg-primary` | `#0a0a0f` |
| `--bg-secondary` | `#12121a` |
| `--bg-sidebar` | `#1a1a2e` |
| `--bg-card` | `rgba(20, 20, 35, 0.7)` |
| `--accent-purple` | `#7c3aed` |
| `--accent-purple-light` | `#a855f7` |
| `--accent-pink` | `#ec4899` |
| `--text-primary` | `#ffffff` |
| `--text-secondary` | `#94a3b8` |
| `--text-muted` | `#64748b` |
| `--border-subtle` | `rgba(139, 92, 246, 0.15)` |
| `--glass-blur` | `blur(20px)` |
| `--glass-bg` | `rgba(15, 15, 25, 0.6)` |
| `--radius-sm` | `6px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--font-primary` | `'Inter', sans-serif` |
| `--font-display` | `'Playfair Display', serif` |

---

## 4. Architecture

### 4.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Main Process                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ BrowserWindow│  │ IPC Handler  │  │ Python Bridge │  │
│  │  (Renderer)  │  │  (ipcMain)   │  │(child_process)│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                 │                  │           │
│         │    ipcRenderer  │   stdin/stdout   │           │
│         ├────────────────►├─────────────────►│           │
│         │                 │                  │           │
└─────────┼─────────────────┼──────────────────┼───────────┘
          │                 │                  │
          ▼                 │                  ▼
┌─────────────────┐         │    ┌──────────────────────┐
│   React App     │         │    │  Python Backend      │
│  ┌───────────┐  │         │    │  ┌────────────────┐  │
│  │ Login Page│  │         │    │  │FaceRecognition │  │
│  │ Dashboard │  │         │    │  │  .py (API mode)│  │
│  │ Vault View│  │         │    │  ├────────────────┤  │
│  └───────────┘  │         │    │  │ InsightFace    │  │
│  ┌───────────┐  │         │    │  │ MiniFASNetV2   │  │
│  │ SQLite DB │◄─┼─────────┘    │  │ Anti-Spoofing  │  │
│  │(encrypted)│  │              │  └────────────────┘  │
│  └───────────┘  │              └──────────────────────┘
└─────────────────┘
```

### 4.2 Authentication Flow

```
User Opens App
      │
      ▼
┌─────────────┐
│ Login Screen │
│ (Face + Form)│
└──────┬──────┘
       │
       ▼
┌──────────────┐     ┌─────────────────┐
│ Click "Face  │────►│ Electron IPC    │
│  Login"      │     │ → Python script │
└──────────────┘     └────────┬────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Capture Webcam    │
                    │ Frame             │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Anti-Spoof Check  │──── SPOOF ──► "Spoof Detected" ──► DENY
                    └─────────┬─────────┘
                              │ REAL
                    ┌─────────▼─────────┐
                    │ Face Embedding    │
                    │ Match vs Database │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Score > 0.45?     │──── NO ──► "Not Recognized" ──► DENY
                    └─────────┬─────────┘
                              │ YES
                    ┌─────────▼─────────┐
                    │ AUTHENTICATED     │──► Navigate to Dashboard
                    └───────────────────┘
```

---

## 5. Project File Structure

```
Password Manager Using Face Recognition/
├── Plan/
│   └── Plan.md                          ← This file
├── Phases/
│   ├── phase1-project-setup.md          ← Electron + React + Vite scaffold
│   ├── phase2-login-ui.md               ← Login screen with glass effects
│   ├── phase3-face-auth-integration.md  ← Python ↔ Electron IPC bridge
│   ├── phase4-dashboard-ui.md           ← Password manager dashboard
│   ├── phase5-password-management.md    ← CRUD + encryption + SQLite
│   └── phase6-polish-packaging.md       ← Final polish + build
├── Face Recognition/
│   ├── FaceRecognition.py               ← Main face auth script
│   ├── face_auth_api.py                 ← [NEW] API wrapper for Electron IPC
│   ├── face_db/                         ← Stored face embeddings (.npy)
│   └── models/
│       ├── MiniFASNetV2.pth             ← Anti-spoof model
│       └── buffalo_l/                   ← InsightFace models
├── electron-app/
│   ├── electron/
│   │   ├── main.ts                      ← [NEW] Electron main process
│   │   └── preload.ts                   ← [NEW] Secure preload script
│   ├── src/
│   │   ├── main.tsx                     ← React entry point
│   │   ├── App.tsx                      ← App root with router
│   │   ├── index.css                    ← Global styles + design tokens
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx            ← [NEW] Face login screen
│   │   │   ├── LoginPage.css            ← [NEW] Login styles
│   │   │   ├── DashboardPage.tsx        ← [NEW] Password vault dashboard
│   │   │   └── DashboardPage.css        ← [NEW] Dashboard styles
│   │   ├── components/
│   │   │   ├── Sidebar.tsx              ← [NEW] Left navigation panel
│   │   │   ├── PasswordList.tsx         ← [NEW] Center password entries
│   │   │   ├── PasswordDetail.tsx       ← [NEW] Right detail panel
│   │   │   ├── VaultItem.tsx            ← [NEW] Single vault entry row
│   │   │   ├── SearchBar.tsx            ← [NEW] Top search component
│   │   │   ├── GlassCard.tsx            ← [NEW] Reusable glass container
│   │   │   ├── FaceCamera.tsx           ← [NEW] Webcam feed for login
│   │   │   └── AddPasswordModal.tsx     ← [NEW] Modal for adding entries
│   │   ├── services/
│   │   │   ├── faceAuth.ts             ← [NEW] IPC calls to Python
│   │   │   ├── passwordDB.ts           ← [NEW] SQLite password CRUD
│   │   │   └── encryption.ts           ← [NEW] AES-256 encrypt/decrypt
│   │   └── types/
│   │       └── index.ts                ← [NEW] TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── package-lock.json
```

---

## 6. Implementation Phases Overview

| Phase | Name | Description | Key Deliverables |
|-------|------|-------------|------------------|
| **1** | Project Setup | Configure Electron + Vite + React for desktop | Working Electron window loading React |
| **2** | Login UI | Build login screen with glassmorphism | Pixel-perfect login matching the design |
| **3** | Face Auth Integration | Bridge Python ↔ Electron via IPC | Working face login flow |
| **4** | Dashboard UI | Build 3-column password manager UI | Complete dashboard matching the design |
| **5** | Password Management | CRUD operations + encrypted SQLite | Working password vault |
| **6** | Polish & Packaging | Animations, error handling, build | Production-ready `.exe` |

> See individual phase files in the `Phases/` folder for detailed step-by-step implementation guides.

---

## 7. Key Technical Decisions

### 7.1 Python ↔ Electron Communication
- Use `child_process.spawn()` to run a Python script (`face_auth_api.py`) that wraps `FaceRecognition.py`
- Communication via **JSON over stdin/stdout** (simple, no server needed)
- The Python script captures one webcam frame, runs anti-spoof + face matching, and returns a JSON result

### 7.2 Password Encryption
- Master encryption key derived from the authenticated user's face embedding hash
- AES-256-GCM encryption for all stored passwords
- SQLite database stored locally with encrypted fields

### 7.3 Face Auth Flow
1. User clicks "Sign in with Face ID" on the login screen
2. Electron sends IPC message to main process
3. Main process spawns `face_auth_api.py`
4. Python captures webcam frame → anti-spoof check → face matching
5. Returns JSON: `{ "status": "authenticated", "user": "username" }` or `{ "status": "spoof_detected" }` or `{ "status": "unknown_face" }`
6. React navigates to dashboard on success, shows error on failure

### 7.4 Security Measures
- **Anti-Spoofing**: MiniFASNetV2 prevents photo/screen attacks
- **Encrypted Storage**: AES-256 for all passwords
- **No Network Calls**: Fully offline, no cloud dependency
- **Electron Security**: Context isolation, disabled node integration in renderer

---

## 8. Dependencies to Install

### Electron App (npm)
```bash
# Production
npm install electron electron-builder better-sqlite3 react-router-dom lucide-react

# Dev
npm install -D electron-builder vite-plugin-electron @types/better-sqlite3
```

### Python (pip)
```bash
pip install opencv-python numpy torch torchvision insightface onnxruntime
```

---

## 9. Verification Plan

### Phase 1 Verification
- Run `npm run dev` → Electron window opens with React app
- No console errors in DevTools

### Phase 2 Verification
- Login screen matches the uploaded design (dark theme, glass card, purple gradient button)
- All input fields and buttons are interactive
- Responsive within the Electron window

### Phase 3 Verification
- Click "Face Login" → webcam activates → Python processes frame
- Authenticated face → navigates to dashboard
- Spoofed face → error message displayed
- Unknown face → error message displayed

### Phase 4 Verification
- Dashboard renders with sidebar, password list, and detail panel
- Navigation between vaults works
- Search bar filters entries

### Phase 5 Verification
- Can add, view, edit, delete passwords
- Passwords are encrypted in the SQLite database
- Copy-to-clipboard works for passwords

### Phase 6 Verification
- App builds to `.exe` without errors
- Animations and transitions are smooth
- All error states handled gracefully
