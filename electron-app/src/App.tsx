import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import './index.css';
import { useState, useEffect } from 'react';
import { ScanFace, Shield, Cpu } from 'lucide-react';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      if (window.electronAPI) {
        const auth = await window.electronAPI.checkAuth();
        setIsAuth(auth);
      } else {
        // Fallback for dev mode
        setIsAuth(false);
      }
    };
    check();
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

function ModelLoader({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const steps = [
    "ASSEMBLING SECURITY LATTICE",
    "DECRYPTING NEURAL PATHS",
    "VIRTUALIZING BIOMETRIC CORE",
    "RESONATING VAULT PERIMETER",
    "GRANTING SYSTEM ACCESS"
  ];
  const loadingStep = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);

  useEffect(() => {
    const duration = 5000;
    const startTime = Date.now();
    let frameId: number;
    
    const update = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const rawProgress = (elapsed / duration) * 100;
      
      setProgress(Math.min(rawProgress, 99));
      
      if (rawProgress < 99) {
        frameId = requestAnimationFrame(update);
      }
    };

    frameId = requestAnimationFrame(update);

    const finishLoading = () => {
      cancelAnimationFrame(frameId);
      setProgress(99);
      // Give it a moment to show 99% before fading out
      setTimeout(() => {
        setIsClosing(true);
        // Match this with the CSS transition duration
        setTimeout(() => setIsReady(true), 800);
      }, 400); 
    };

    if (window.electronAPI) {
      window.electronAPI.waitForModelReady().then(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        setTimeout(finishLoading, remaining);
      });
    } else {
      setTimeout(finishLoading, duration);
    }

    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!isReady) {
    return (
      <div className={`vortex-container ${isClosing ? 'closing' : ''}`}>
        {/* Particle Whirlpool */}
        <div className="vortex-particles">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="particle" style={{
              '--delay': `${Math.random() * 5}s`,
              '--size': `${Math.random() * 2 + 1}px`,
              '--left': `${Math.random() * 100}%`,
              '--top': `${Math.random() * 100}%`,
              '--duration': `${Math.random() * 4 + 2}s`
            } as any}></div>
          ))}
        </div>

        <div className="security-prism">
          <div className="prism-core">
            <ScanFace size={100} className="core-icon" />
            <div className="energy-pulse"></div>
          </div>
          <div className="orbital-ring">
            <Shield size={35} className="orbital-icon" />
          </div>
          <div className="orbital-ring second">
            <Cpu size={28} className="orbital-icon" />
          </div>
        </div>

        <div className="vortex-content">
          <div className="loading-bar-section">
            <p className="app-description pulse-reveal">
              Initializing Face Vault secure biometric architecture. 
              Deploying advanced neural scanning protocols and multi-layered vault encryption for elite identity protection.
            </p>
            <div className="status-header">
              <span className="status-text">{steps[loadingStep]}</span>
              <span className="percentage-text">
                <span className="counter-val">{Math.round(progress)}</span>
                <span className="unit">%</span>
              </span>
            </div>
            <div className="precision-gauge">
              <div className="gauge-ticks">
                {[...Array(20)].map((_, i) => <div key={i} className="tick"></div>)}
              </div>
              <div className="gauge-fill" style={{ width: `${progress}%` }}>
                <div className="gauge-head"></div>
              </div>
              <div className="gauge-glow" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="scan-line"></div>

        <style>{`
          .vortex-container {
            height: 100vh;
            width: 100vw;
            background: #050508;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
            font-family: 'Inter', system-ui, sans-serif;
            transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
            z-index: 9999;
          }

          .vortex-container.closing {
            opacity: 0;
            transform: scale(1.05);
            pointer-events: none;
          }

          /* Vortex Background */
          .vortex-particles {
            position: absolute;
            inset: 0;
            perspective: 1000px;
            opacity: 0.4;
          }

          .particle {
            position: absolute;
            left: var(--left);
            top: var(--top);
            width: var(--size);
            height: var(--size);
            background: #a78bfa;
            border-radius: 50%;
            animation: shoot var(--duration) linear infinite;
            animation-delay: var(--delay);
            opacity: 0;
          }

          @keyframes shoot {
            0% { transform: translateZ(0) scale(0); opacity: 0; }
            20% { opacity: 0.8; }
            100% { transform: translateZ(800px) scale(2); opacity: 0; }
          }

          /* Security Prism (Centerpiece) */
          .security-prism {
            position: relative;
            width: 380px;
            height: 380px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 80px;
            opacity: 0.9;
          }

          .prism-core {
            width: 160px;
            height: 160px;
            background: radial-gradient(circle, #7c3aed33, transparent);
            border: 1px solid rgba(124, 58, 237, 0.4);
            border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: morph 10s ease-in-out infinite;
            position: relative;
            z-index: 10;
            backdrop-filter: blur(10px);
          }

          @keyframes morph {
            0%, 100% { border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%; }
            50% { border-radius: 60% 40% 40% 60% / 60% 60% 40% 40%; }
          }

          .core-icon {
            color: #fff;
            filter: drop-shadow(0 0 15px #7c3aed);
            animation: flicker 4s infinite;
          }

          .energy-pulse {
            position: absolute;
            inset: -10px;
            border: 2px solid #7c3aed;
            border-radius: inherit;
            animation: pulse-out 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            opacity: 0;
          }

          @keyframes pulse-out {
            0% { transform: scale(0.9); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: scale(1.5); opacity: 0; }
          }

          .orbital-ring {
            position: absolute;
            width: 320px;
            height: 320px;
            border: 1px solid rgba(124, 58, 237, 0.15);
            border-radius: 50%;
            animation: rotate 10s linear infinite;
          }

          .orbital-ring.second {
            width: 440px;
            height: 440px;
            animation: rotateReverse 15s linear infinite;
          }

          .orbital-icon {
            position: absolute;
            top: 50%;
            left: -10px;
            color: #7c3aed;
            filter: drop-shadow(0 0 5px #7c3aed);
          }

          .data-bg {
            position: absolute;
            color: #7c3aed;
            opacity: 0.05;
            animation: spin 60s linear infinite;
          }

          /* Content Animations */
          .vortex-content {
            text-align: center;
            z-index: 20;
          }



          /* Precision Gauge */
          .loading-bar-section {
            width: 600px;
            margin: 0 auto;
          }

          .status-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .status-text {
            font-size: 0.7rem;
            letter-spacing: 0.15em;
            color: rgba(167, 139, 250, 0.7);
            text-transform: uppercase;
            font-weight: 600;
            font-family: 'JetBrains Mono', monospace;
          }

          .percentage-text {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            color: #fff;
            font-weight: 200;
          }

          .unit {
            font-size: 0.6rem;
            margin-left: 2px;
            opacity: 0.5;
          }

          .precision-gauge {
            height: 6px;
            width: 100%;
            background: rgba(255, 255, 255, 0.03);
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 2px;
            box-sizing: content-box;
          }

          .gauge-ticks {
            position: absolute;
            inset: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 4px;
            align-items: center;
            pointer-events: none;
          }

          .tick {
            width: 1px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
          }

          .gauge-fill {
            height: 100%;
            background: linear-gradient(90deg, #7c3aed, #fff);
            position: relative;
            z-index: 2;
          }

          .gauge-head {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 2px;
            height: 100%;
            background: #fff;
            box-shadow: 0 0 10px #fff;
          }

          .gauge-glow {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: #7c3aed;
            filter: blur(12px);
            opacity: 0.4;
            z-index: 1;
          }

          .app-description {
            font-size: 0.65rem;
            line-height: 1.8;
            letter-spacing: 0.15em;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 30px;
            text-align: center;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
            font-weight: 300;
            text-transform: uppercase;
          }

          .pulse-reveal {
            animation: atmospheric-pulse 4s ease-in-out infinite;
          }

          @keyframes atmospheric-pulse {
            0%, 100% { opacity: 0.6; transform: translateY(0); }
            50% { opacity: 0.9; transform: translateY(-2px); }
          }

          .scan-line {
            position: absolute;
            left: 0;
            right: 0;
            height: 150px;
            background: linear-gradient(transparent, rgba(124, 58, 237, 0.05), transparent);
            animation: scan 4s linear infinite;
            pointer-events: none;
            z-index: 30;
          }

          @keyframes scan {
            from { transform: translateY(-100vh); }
            to { transform: translateY(100vh); }
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes rotateReverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes flicker {
            0%, 100% { opacity: 1; filter: drop-shadow(0 0 15px #7c3aed); }
            50% { opacity: 0.8; filter: drop-shadow(0 0 5px #7c3aed); }
            52% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}




function App() {
  return (
    <ModelLoader>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ModelLoader>
  );
}

export default App;
