# Phase 1: Project Setup — Electron + Vite + React

## Objective
Set up a working Electron desktop application that loads a React frontend built with Vite. This phase establishes the foundation for all subsequent UI and backend integration work.

---

## Prerequisites
- Node.js 18+ installed
- npm 9+ installed
- Python 3.9+ installed (for later phases)

---

## Step-by-Step Implementation

### Step 1: Clean Up Existing Scaffold
The existing `electron-app/` has a basic Vite + React setup but no Electron integration.

```bash
cd electron-app
```

Remove the default boilerplate content from `App.tsx`, `App.css`, and `index.css`.

---

### Step 2: Install Electron & Related Dependencies

```bash
# Electron core
npm install electron --save-dev

# Vite plugin for Electron
npm install vite-plugin-electron vite-plugin-electron-renderer --save-dev

# Electron builder for packaging (Phase 6)
npm install electron-builder --save-dev

# React Router for navigation
npm install react-router-dom

# Icon library
npm install lucide-react

# SQLite for password storage (Phase 5)
npm install better-sqlite3
npm install @types/better-sqlite3 --save-dev
```

---

### Step 3: Create Electron Main Process

Create `electron-app/electron/main.ts`:

```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,                    // Frameless for custom title bar
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,        // Security: isolate renderer
      nodeIntegration: false,        // Security: no Node in renderer
    },
  });

  // In development, load from Vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window control IPC handlers (for frameless window)
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.handle('window:close', () => mainWindow?.close());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

---

### Step 4: Create Preload Script

Create `electron-app/electron/preload.ts`:

```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Face authentication (Phase 3)
  authenticateFace: () => ipcRenderer.invoke('face:authenticate'),
  registerFace: (name: string) => ipcRenderer.invoke('face:register', name),

  // Password operations (Phase 5)
  getPasswords: (vaultId: string) => ipcRenderer.invoke('passwords:getAll', vaultId),
  addPassword: (entry: any) => ipcRenderer.invoke('passwords:add', entry),
  updatePassword: (id: string, entry: any) => ipcRenderer.invoke('passwords:update', id, entry),
  deletePassword: (id: string) => ipcRenderer.invoke('passwords:delete', id),
});
```

---

### Step 5: Configure Vite for Electron

Update `electron-app/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(args) {
          args.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
          },
        },
      },
    ]),
    renderer(),
  ],
  build: {
    outDir: 'dist',
  },
});
```

---

### Step 6: Update package.json

Add the Electron main entry and scripts:

```json
{
  "name": "facevault",
  "version": "1.0.0",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "electron:dev": "vite",
    "electron:build": "vite build && electron-builder"
  }
}
```

---

### Step 7: Add TypeScript Types for Electron API

Create `electron-app/src/types/electron.d.ts`:

```typescript
interface ElectronAPI {
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  authenticateFace: () => Promise<{
    status: 'authenticated' | 'spoof_detected' | 'unknown_face' | 'no_face' | 'error';
    user?: string;
    message?: string;
  }>;
  registerFace: (name: string) => Promise<{ success: boolean; message: string }>;
  getPasswords: (vaultId: string) => Promise<any[]>;
  addPassword: (entry: any) => Promise<{ success: boolean }>;
  updatePassword: (id: string, entry: any) => Promise<{ success: boolean }>;
  deletePassword: (id: string) => Promise<{ success: boolean }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
```

---

### Step 8: Set Up Basic App Shell

Update `electron-app/src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

Create placeholder pages:

**`src/pages/LoginPage.tsx`**:
```tsx
export default function LoginPage() {
  return <div className="login-page"><h1>Login — Phase 2</h1></div>;
}
```

**`src/pages/DashboardPage.tsx`**:
```tsx
export default function DashboardPage() {
  return <div className="dashboard-page"><h1>Dashboard — Phase 4</h1></div>;
}
```

---

### Step 9: Set Up Global CSS Design Tokens

Update `electron-app/src/index.css` with the design system variables:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');

:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-sidebar: #1a1a2e;
  --bg-card: rgba(20, 20, 35, 0.7);
  --accent-purple: #7c3aed;
  --accent-purple-light: #a855f7;
  --accent-pink: #ec4899;
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border-subtle: rgba(139, 92, 246, 0.15);
  --glass-blur: blur(20px);
  --glass-bg: rgba(15, 15, 25, 0.6);
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --font-primary: 'Inter', sans-serif;
  --font-display: 'Playfair Display', serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-primary);
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
  -webkit-app-region: no-drag;
}
```

---

## Verification

1. Run `npm run dev` from the `electron-app/` directory
2. ✅ An Electron window should open showing the React app
3. ✅ The window should have the dark background (`#0a0a0f`)
4. ✅ Navigation to `/login` should show the Login placeholder
5. ✅ No errors in the DevTools console
6. ✅ Window controls (minimize/maximize/close) work via IPC

---

## Deliverables
- [x] Electron main process (`electron/main.ts`)
- [x] Preload script with IPC bridge (`electron/preload.ts`)
- [x] Vite configured for Electron (`vite.config.ts`)
- [x] React Router set up with Login and Dashboard routes
- [x] Global CSS design tokens defined
- [x] TypeScript types for Electron API
