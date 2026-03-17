import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ScanFace, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import StarField from '../components/StarField';
import { authenticateFace } from '../services/faceAuth';
import './LoginPage.css';

type AuthStatus = 'idle' | 'loading' | 'success' | 'error';
type LoginMode = 'face' | 'password';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('face');
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [authMessage, setAuthMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Removed auto-login on mount. User must explicitly click scan.

  const handleFaceLogin = async () => {
    setAuthStatus('loading');
    setAuthMessage('Scanning face... Please look at the camera');

    try {
      const result = await authenticateFace();

      if (result.status === 'authenticated') {
        setAuthStatus('success');
        setAuthMessage(`Welcome back!`);
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setAuthStatus('error');
        setAuthMessage(result.message || 'Face not recognized.');
      }
    } catch (err) {
      setAuthStatus('error');
      setAuthMessage('Face authentication service unavailable.');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStatus('loading');
    setAuthMessage('Verifying credentials...');

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.login({ email, password });
        if (result.success) {
          setAuthStatus('success');
          setAuthMessage('Login successful!');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          setAuthStatus('error');
          setAuthMessage(result.message || 'Invalid credentials.');
        }
      } else {
        // Mock for browser
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err) {
      setAuthStatus('error');
      setAuthMessage('Login service unavailable.');
    }
  };

  return (
    <div className="login-page">
      <StarField />
      
      <div className="login-card">
        <h1>{mode === 'face' ? 'Face Identity' : 'Secure Login'}</h1>
        <p className="subtitle">
          {mode === 'face' 
            ? 'Scanning for your biometric key...' 
            : 'Access your vault with credentials'}
        </p>

        {mode === 'face' ? (
          <div className="face-auth-container">
            <div className={`face-scanner ${authStatus}`}>
              <ScanFace size={64} className="face-icon" />
              <div className="scan-line" />
            </div>
            
            <div className={`auth-status-box ${authStatus}`}>
              {authStatus === 'loading' && <span className="spinner" />}
              {authMessage || 'Ready to scan face'}
            </div>

            <button 
              className="retry-btn" 
              onClick={handleFaceLogin}
              disabled={authStatus === 'loading'}
              style={{ marginTop: '10px' }}
            >
              {authStatus === 'error' ? 'Retry Face Scan' : 'Start Face Scan'}
            </button>

            <button 
              className="fb-login-btn" 
              onClick={() => setMode('password')}
            >
              Login with Password instead
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordLogin} className="password-form">
            <div className="input-group">
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="sign-in-btn" disabled={authStatus === 'loading'}>
              {authStatus === 'loading' ? 'Verifying...' : 'Sign In'}
            </button>

            <button 
              type="button" 
              className="back-btn" 
              onClick={() => {
                setMode('face');
                setAuthStatus('idle');
              }}
            >
              Back to Face ID
            </button>

            {authStatus === 'error' && (
              <div className="auth-status error" style={{ marginTop: '1rem' }}>
                {authMessage}
              </div>
            )}
          </form>
        )}

        <p className="login-footer">
          New to FaceVault? <Link to="/register">Create Account</Link>
        </p>
      </div>

      <style>{`
        .face-auth-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin: 1rem 0;
        }
        .face-scanner {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          color: var(--accent-purple);
        }
        .face-scanner.loading {
          border-color: var(--accent-purple);
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
        }
        .face-scanner.success {
          border-color: #10b981;
          color: #10b981;
        }
        .face-scanner.error {
          border-color: #ef4444;
          color: #ef4444;
        }
        .scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: var(--accent-purple);
          top: 0;
          left: 0;
          box-shadow: 0 0 10px var(--accent-purple);
          animation: scan 2s linear infinite;
          opacity: 0;
        }
        .face-scanner.loading .scan-line {
          opacity: 1;
        }
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .auth-status-box {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .fb-login-btn {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .fb-login-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        .retry-btn {
          background: var(--accent-purple);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .password-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          color: rgba(255, 255, 255, 0.4);
        }
        .input-wrapper .input-field {
          padding-left: 40px;
          width: 100%;
        }
        .back-btn {
          margin-top: 0.5rem;
          background: none;
          border: none;
          color: var(--accent-purple);
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
