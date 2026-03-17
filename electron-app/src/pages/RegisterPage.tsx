import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Eye, EyeOff, ShieldCheck, User as UserIcon, Mail, Lock } from 'lucide-react';
import StarField from '../components/StarField';
import './LoginPage.css'; // Reuse existing styles

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showFaceExistsModal, setShowFaceExistsModal] = useState(false);
  const [existingUser, setExistingUser] = useState('');

  const handleCaptureFace = async () => {
    if (!name) {
      setStatus('error');
      setMessage('Please enter your name first.');
      return;
    }

    setStatus('loading');
    setMessage('Opening camera... Please center your face.');

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.registerFace(name);
        if (result.success) {
          setFaceRegistered(true);
          setStatus('success');
          setMessage('Face registered successfully!');
        } else if (result.status === 'already_exists') {
          setExistingUser(result.user || '');
          setShowFaceExistsModal(true);
          setStatus('idle');
        } else {
          setStatus('error');
          setMessage(result.message || 'Face registration failed.');
        }
      } else {
        // Mock for browser
        setTimeout(() => {
          setFaceRegistered(true);
          setStatus('success');
          setMessage('Face registered successfully! (Mock)');
        }, 1500);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Face registration service unavailable.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceRegistered) {
      setStatus('error');
      setMessage('Please register your face before creating an account.');
      return;
    }

    setStatus('loading');
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.register({ name, email, password });
        if (result.success) {
          setStatus('success');
          setMessage('Account created! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          setStatus('error');
          setMessage(result.message || 'Registration failed.');
        }
      } else {
        // Mock for browser
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Registration service unavailable.');
    }
  };

  const handleStartFresh = async () => {
    setStatus('loading');
    setMessage('Resetting account...');
    try {
      const result = await window.electronAPI.deleteAndResetFace(existingUser);
      if (result.success) {
        setShowFaceExistsModal(false);
        setStatus('idle');
        setMessage('Account reset. You can now register as a new user.');
        // Don't auto-start capture, let user click again with their new name
      } else {
        setStatus('error');
        setMessage('Failed to reset account.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Error resetting account.');
    }
  };

  return (
    <div className="login-page">
      <StarField />
      
      <div className="login-card">
        <h1>Create Account</h1>
        <p className="subtitle">Secure your digital life with FaceVault</p>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="input-group">
            <div className="input-wrapper">
              <UserIcon className="input-icon" size={18} />
              <input
                type="text"
                className="input-field"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

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
                placeholder="Master Password"
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

          <button 
            type="button" 
            className={`face-reg-btn ${faceRegistered ? 'completed' : ''}`}
            onClick={handleCaptureFace}
            disabled={status === 'loading' || faceRegistered}
          >
            {faceRegistered ? (
              <><ShieldCheck size={20} /> Face Registered</>
            ) : (
              <><Camera size={20} /> Register Face ID</>
            )}
          </button>

          <button 
            type="submit" 
            className="sign-in-btn" 
            disabled={status === 'loading' || !faceRegistered}
            style={{ marginTop: '1rem' }}
          >
            {status === 'loading' ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {status !== 'idle' && (
          <div className={`auth-status ${status}`} style={{ marginTop: '1rem' }}>
            {status === 'loading' && <span className="spinner" />}
            {message}
          </div>
        )}

        <p className="login-footer">
          Already have an account? <Link to="/">Sign In</Link>
        </p>
      </div>

      {showFaceExistsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Face Already Registered</h2>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              We detected that this face is already associated with an account named <strong>"{existingUser}"</strong>. 
              Would you like to log in to that account, or delete it and start fresh?
            </p>
            
            <div className="modal-actions" style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button 
                className="sign-in-btn" 
                onClick={() => navigate('/')}
              >
                Go to Login Page
              </button>
              
              <button 
                className="reset-btn" 
                onClick={handleStartFresh}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Delete Old Account & Start Fresh
              </button>
              
              <button 
                className="cancel-btn" 
                onClick={() => setShowFaceExistsModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '8px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .auth-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
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
        }
        .face-reg-btn {
          margin-top: 1rem;
          padding: 12px;
          background: rgba(124, 58, 237, 0.1);
          border: 1px dashed var(--accent-purple);
          border-radius: var(--radius-sm);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .face-reg-btn:hover:not(:disabled) {
          background: rgba(124, 58, 237, 0.2);
        }
        .face-reg-btn.completed {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
          color: #10b981;
          cursor: default;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: modalSlideUp 0.3s ease-out;
        }

        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .reset-btn:hover {
          background: rgba(239, 68, 68, 0.2) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
