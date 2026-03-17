# Phase 6: Polish & Packaging

## Objective
Final polish including animations, error handling, edge cases, and building the app into a distributable `.exe` using `electron-builder`.

---

## Steps

### 1. Micro-Animations & Transitions
- Page transitions between Login → Dashboard (fade/slide)
- Password entry hover effects (subtle background shift)
- Modal open/close animations (scale + fade)
- Button press feedback (scale down on active)
- Sidebar vault selection highlight transition
- Toast notifications for copy-to-clipboard, save confirmations

### 2. Error Handling
- Camera not available → graceful error message on login
- Python not installed → prompt user to install
- Database corruption → automatic backup + recovery
- Network-free mode confirmation (all data is local)
- Face not detected timeout (30s) with retry button

### 3. Custom Title Bar
- Frameless Electron window with custom drag region
- Minimize / Maximize / Close buttons matching the dark theme
- App icon + "FaceVault" text in title bar
- Draggable title bar region via `-webkit-app-region: drag`

### 4. System Tray Integration
- Minimize to system tray option
- Tray icon with context menu (Open, Lock, Quit)
- Auto-lock after inactivity timeout (configurable)

### 5. Build Configuration

**`electron-builder.yml`**:
```yaml
appId: com.facevault.app
productName: FaceVault
directories:
  output: release
win:
  target: nsis
  icon: public/icon.ico
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
files:
  - dist/**/*
  - dist-electron/**/*
extraResources:
  - from: "../Face Recognition"
    to: "face-recognition"
    filter:
      - "**/*"
      - "!__pycache__/**"
```

### 6. Build & Test
```bash
npm run electron:build
```
- Test the generated `.exe` installer
- Verify face auth works from the packaged app
- Verify passwords persist across app restarts

---

## Verification
1. ✅ All animations are smooth (60fps)
2. ✅ Error states show user-friendly messages
3. ✅ Custom title bar works (drag, minimize, maximize, close)
4. ✅ App builds to `.exe` without errors
5. ✅ Face auth works in packaged build
6. ✅ Passwords persist after app restart
7. ✅ System tray icon appears

## Deliverables
- [ ] Polished animations & transitions
- [ ] Custom title bar component
- [ ] Error handling for all edge cases
- [ ] `electron-builder.yml` configuration
- [ ] Working `.exe` installer in `release/` folder
