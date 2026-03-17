# Phase 2: Login UI — Glassmorphism Dark Theme

## Objective
Build the login screen matching the uploaded design: a dark space-themed background with a centered glassmorphic sign-in card, purple gradient accents, and a "Sign in with Face ID" button that will trigger facial recognition.

---

## UI Reference (From Uploaded Design)

The login screen has:
- **Dark background** (#0a0a0f) with large purple/violet planet glow on the right
- **Smaller nebula glow** on the left side
- **Centered glass card** with semi-transparent dark background and blur
- **"Sign In"** heading in italic serif font (Playfair Display)
- **Subtitle** "Keep it all together and you'll be fine"
- **Email/Phone** input field
- **Password** input field with "Show" toggle
- **"Forgot Password"** link
- **"Sign In"** button with purple gradient
- **"or"** divider
- **"Sign in with Face ID"** button (camera icon)
- **"New to FaceVault? Join Now"** footer text

---

## Step-by-Step Implementation

### Step 1: Create Login Background Component

Create `electron-app/src/pages/LoginPage.css`:

```css
/* ========================
   LOGIN PAGE - SPACE THEME
   ======================== */

.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

/* Planet glow - right side */
.login-page::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -15%;
  width: 700px;
  height: 700px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(139, 92, 246, 0.3) 0%,
    rgba(124, 58, 237, 0.15) 30%,
    rgba(88, 28, 135, 0.08) 50%,
    transparent 70%
  );
  filter: blur(40px);
  pointer-events: none;
}

/* Nebula glow - left side */
.login-page::after {
  content: '';
  position: absolute;
  bottom: 30%;
  left: -5%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.2) 0%,
    rgba(168, 85, 247, 0.1) 40%,
    transparent 70%
  );
  filter: blur(30px);
  pointer-events: none;
}

/* ========================
   GLASS LOGIN CARD
   ======================== */

.login-card {
  width: 420px;
  padding: 40px;
  background: rgba(15, 15, 25, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(139, 92, 246, 0.12);
  box-shadow:
    0 0 60px rgba(139, 92, 246, 0.05),
    0 25px 50px rgba(0, 0, 0, 0.4);
  z-index: 1;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Title */
.login-card h1 {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  font-style: italic;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.login-card .subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 28px;
}

/* ========================
   INPUT FIELDS
   ======================== */

.input-group {
  margin-bottom: 14px;
}

.input-field {
  width: 100%;
  padding: 13px 16px;
  background: rgba(10, 10, 20, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.input-field::placeholder {
  color: var(--text-muted);
}

.input-field:focus {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
}

/* Password field wrapper */
.password-wrapper {
  position: relative;
}

.password-wrapper .input-field {
  padding-right: 60px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  font-family: var(--font-primary);
  transition: color 0.2s;
}

.password-toggle:hover {
  color: var(--text-secondary);
}

/* Forgot password */
.forgot-link {
  display: block;
  text-align: left;
  color: var(--text-muted);
  font-size: 0.8rem;
  text-decoration: none;
  margin-bottom: 20px;
  cursor: pointer;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: var(--accent-purple-light);
}

/* ========================
   BUTTONS
   ======================== */

.sign-in-btn {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-purple-light));
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-family: var(--font-primary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.sign-in-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.35);
}

.sign-in-btn:active {
  transform: translateY(0);
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  gap: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(139, 92, 246, 0.15);
}

.divider span {
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* Face ID button */
.face-login-btn {
  width: 100%;
  padding: 13px;
  background: rgba(10, 10, 20, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.face-login-btn:hover {
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(139, 92, 246, 0.35);
}

.face-login-btn .face-icon {
  width: 18px;
  height: 18px;
}

/* Footer */
.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.login-footer a {
  color: var(--accent-purple-light);
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.login-footer a:hover {
  color: var(--accent-purple);
}

/* ========================
   AUTH STATUS MESSAGES
   ======================== */

.auth-status {
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.auth-status.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.auth-status.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.auth-status.loading {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: var(--accent-purple-light);
}

/* Loading spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-top-color: var(--accent-purple-light);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### Step 2: Build LoginPage Component

Create `electron-app/src/pages/LoginPage.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

interface AuthResult {
  status: string;
  user?: string;
  message?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [authMessage, setAuthMessage] = useState('');

  const handleFaceLogin = async () => {
    setAuthStatus('loading');
    setAuthMessage('Scanning face... Please look at the camera');

    try {
      // This will call the Python face recognition via Electron IPC (Phase 3)
      const result: AuthResult = await window.electronAPI.authenticateFace();

      if (result.status === 'authenticated') {
        setAuthStatus('success');
        setAuthMessage(`Welcome, ${result.user}!`);
        setTimeout(() => navigate('/dashboard'), 1000);
      } else if (result.status === 'spoof_detected') {
        setAuthStatus('error');
        setAuthMessage('⚠ Spoof detected! Use a real face.');
      } else if (result.status === 'unknown_face') {
        setAuthStatus('error');
        setAuthMessage('Face not recognized. Access denied.');
      } else {
        setAuthStatus('error');
        setAuthMessage(result.message || 'Authentication failed.');
      }
    } catch (err) {
      setAuthStatus('error');
      setAuthMessage('Face authentication service unavailable.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sign In</h1>
        <p className="subtitle">Keep it all together and you'll be fine</p>

        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder="Email or Phone"
            id="login-email"
          />
        </div>

        <div className="input-group">
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Password"
              id="login-password"
            />
            <button
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <a className="forgot-link">Forgot Password</a>

        <button className="sign-in-btn" id="sign-in-btn">
          Sign In
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          className="face-login-btn"
          onClick={handleFaceLogin}
          disabled={authStatus === 'loading'}
          id="face-login-btn"
        >
          <ScanFace className="face-icon" />
          Sign in with Face ID
        </button>

        {authStatus !== 'idle' && (
          <div className={`auth-status ${authStatus}`}>
            {authStatus === 'loading' && <span className="spinner" />}
            {authMessage}
          </div>
        )}

        <p className="login-footer">
          New to FaceVault? <a>Join Now</a>
        </p>
      </div>
    </div>
  );
}
```

---

### Step 3: Add Star Particles Effect (Optional Enhancement)

For added visual flair, add subtle star particles in the background. Create `electron-app/src/components/StarField.tsx`:

```tsx
import { useEffect, useRef } from 'react';

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    let frame: number;
    let time = 0;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      stars.forEach((star) => {
        const opacity = star.opacity + Math.sin(time * star.twinkleSpeed) * 0.2;
        ctx.fillStyle = `rgba(180, 160, 255, ${Math.max(0.1, opacity)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      frame = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
```

Add `<StarField />` inside `LoginPage` before the login card for the background effect.

---

## Verification

1. ✅ Login page has dark background with purple planet/nebula glows
2. ✅ Glass card is centered with backdrop blur effect
3. ✅ "Sign In" title is in italic serif font
4. ✅ Input fields have dark backgrounds with subtle purple borders
5. ✅ Password field has a show/hide toggle
6. ✅ "Sign In" button has purple gradient with hover glow effect
7. ✅ "Sign in with Face ID" button is visible with camera icon
8. ✅ Card has a subtle entrance animation
9. ✅ Star particles twinkle in the background (optional)

---

## Deliverables
- [ ] `LoginPage.tsx` — Complete login component
- [ ] `LoginPage.css` — All login styles matching the design
- [ ] `StarField.tsx` — Background star particle effect
- [ ] Visual match with the uploaded login design
