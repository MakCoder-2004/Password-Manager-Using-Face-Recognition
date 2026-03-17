import { useState, useEffect } from 'react';
import { X, Shield, RefreshCw, Eye, EyeOff, Facebook, Instagram, Twitter, Github, Globe, Mail, Monitor, CreditCard, ShoppingBag, Youtube, Chrome, Gamepad, Music, Video, Cloud, Linkedin, Twitch, MessageSquare, Figma, Bitcoin, Apple, Car, Smartphone, Laptop, Server, Database, Lock, Unlock, Key, ShieldCheck, Briefcase, GraduationCap, Heart, ShoppingCart, Send, Camera, Plane, Coffee, Zap, Moon, Sun, Ghost, Trash2, Settings, Bell, Search, Code, Layout, Terminal } from 'lucide-react';

interface AddPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, isEdit: boolean) => Promise<void>;
  vaults: { id: string, name: string }[];
  activeVaultId: string;
  entryToEdit?: any;
}

export default function AddPasswordModal({ 
  isOpen, onClose, onSave, vaults, activeVaultId, entryToEdit 
}: AddPasswordModalProps) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [vaultId, setVaultId] = useState(activeVaultId);
  const [selectedIcon, setSelectedIcon] = useState('Globe');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [activeIconCategory, setActiveIconCategory] = useState('All');

  const ICON_CATEGORIES = ['All', 'Social', 'Tech', 'Finance', 'Security', 'Lifestyle', 'Emojis'];

  const AVAILABLE_ICONS = [
    // Social
    { name: 'Globe', icon: <Globe size={20} />, category: 'Social' },
    { name: 'Mail', icon: <Mail size={20} />, category: 'Social' },
    { name: 'Facebook', icon: <Facebook size={20} />, category: 'Social' },
    { name: 'Instagram', icon: <Instagram size={20} />, category: 'Social' },
    { name: 'Twitter', icon: <Twitter size={20} />, category: 'Social' },
    { name: 'Linkedin', icon: <Linkedin size={20} />, category: 'Social' },
    { name: 'Github', icon: <Github size={20} />, category: 'Social' },
    { name: 'Youtube', icon: <Youtube size={20} />, category: 'Social' },
    { name: 'Twitch', icon: <Twitch size={20} />, category: 'Social' },
    { name: 'MessageSquare', icon: <MessageSquare size={20} />, category: 'Social' },
    { name: 'Figma', icon: <Figma size={20} />, category: 'Social' },
    
    // Tech
    { name: 'Chrome', icon: <Chrome size={20} />, category: 'Tech' },
    { name: 'Monitor', icon: <Monitor size={20} />, category: 'Tech' },
    { name: 'Smartphone', icon: <Smartphone size={20} />, category: 'Tech' },
    { name: 'Laptop', icon: <Laptop size={20} />, category: 'Tech' },
    { name: 'Cloud', icon: <Cloud size={20} />, category: 'Tech' },
    { name: 'Server', icon: <Server size={20} />, category: 'Tech' },
    { name: 'Database', icon: <Database size={20} />, category: 'Tech' },
    { name: 'Terminal', icon: <Terminal size={20} />, category: 'Tech' },
    { name: 'Code', icon: <Code size={20} />, category: 'Tech' },
    { name: 'Layout', icon: <Layout size={20} />, category: 'Tech' },
    { name: 'Zap', icon: <Zap size={20} />, category: 'Tech' },
    { name: 'Apple', icon: <Apple size={20} />, category: 'Tech' },

    // Finance
    { name: 'ShoppingBag', icon: <ShoppingBag size={20} />, category: 'Finance' },
    { name: 'ShoppingCart', icon: <ShoppingCart size={20} />, category: 'Finance' },
    { name: 'CreditCard', icon: <CreditCard size={20} />, category: 'Finance' },
    { name: 'Bitcoin', icon: <Bitcoin size={20} />, category: 'Finance' },
    { name: 'Briefcase', icon: <Briefcase size={20} />, category: 'Finance' },
    
    // Security
    { name: 'Lock', icon: <Lock size={20} />, category: 'Security' },
    { name: 'Unlock', icon: <Unlock size={20} />, category: 'Security' },
    { name: 'Key', icon: <Key size={20} />, category: 'Security' },
    { name: 'ShieldCheck', icon: <ShieldCheck size={20} />, category: 'Security' },

    // Lifestyle
    { name: 'Gamepad', icon: <Gamepad size={20} />, category: 'Lifestyle' },
    { name: 'Music', icon: <Music size={20} />, category: 'Lifestyle' },
    { name: 'Video', icon: <Video size={20} />, category: 'Lifestyle' },
    { name: 'Camera', icon: <Camera size={20} />, category: 'Lifestyle' },
    { name: 'GraduationCap', icon: <GraduationCap size={20} />, category: 'Lifestyle' },
    { name: 'Heart', icon: <Heart size={20} />, category: 'Lifestyle' },
    { name: 'Bell', icon: <Bell size={20} />, category: 'Lifestyle' },
    { name: 'Settings', icon: <Settings size={20} />, category: 'Lifestyle' },
    { name: 'Search', icon: <Search size={20} />, category: 'Lifestyle' },
    { name: 'Send', icon: <Send size={20} />, category: 'Lifestyle' },
    { name: 'Plane', icon: <Plane size={20} />, category: 'Lifestyle' },
    { name: 'Car', icon: <Car size={20} />, category: 'Lifestyle' },
    { name: 'Coffee', icon: <Coffee size={20} />, category: 'Lifestyle' },
    { name: 'Moon', icon: <Moon size={20} />, category: 'Lifestyle' },
    { name: 'Sun', icon: <Sun size={20} />, category: 'Lifestyle' },
    { name: 'Ghost', icon: <Ghost size={20} />, category: 'Lifestyle' },
    { name: 'Trash2', icon: <Trash2 size={20} />, category: 'Lifestyle' },

    // Emojis
    { name: '🔑', icon: <span style={{fontSize: '18px'}}>🔑</span>, category: 'Emojis' },
    { name: '🔒', icon: <span style={{fontSize: '18px'}}>🔒</span>, category: 'Emojis' },
    { name: '🛡️', icon: <span style={{fontSize: '18px'}}>🛡️</span>, category: 'Emojis' },
    { name: '💰', icon: <span style={{fontSize: '18px'}}>💰</span>, category: 'Emojis' },
    { name: '🏦', icon: <span style={{fontSize: '18px'}}>🏦</span>, category: 'Emojis' },
    { name: '🏢', icon: <span style={{fontSize: '18px'}}>🏢</span>, category: 'Emojis' },
    { name: '🏠', icon: <span style={{fontSize: '18px'}}>🏠</span>, category: 'Emojis' },
    { name: '💼', icon: <span style={{fontSize: '18px'}}>💼</span>, category: 'Emojis' },
    { name: '🎮', icon: <span style={{fontSize: '18px'}}>🎮</span>, category: 'Emojis' },
    { name: '🎵', icon: <span style={{fontSize: '18px'}}>🎵</span>, category: 'Emojis' },
    { name: '📸', icon: <span style={{fontSize: '18px'}}>📸</span>, category: 'Emojis' },
    { name: '📱', icon: <span style={{fontSize: '18px'}}>📱</span>, category: 'Emojis' },
    { name: '💻', icon: <span style={{fontSize: '18px'}}>💻</span>, category: 'Emojis' },
    { name: '☁️', icon: <span style={{fontSize: '18px'}}>☁️</span>, category: 'Emojis' },
    { name: '🌍', icon: <span style={{fontSize: '18px'}}>🌍</span>, category: 'Emojis' },
    { name: '✈️', icon: <span style={{fontSize: '18px'}}>✈️</span>, category: 'Emojis' },
    { name: '🚗', icon: <span style={{fontSize: '18px'}}>🚗</span>, category: 'Emojis' },
    { name: '🍔', icon: <span style={{fontSize: '18px'}}>🍔</span>, category: 'Emojis' },
    { name: '🍕', icon: <span style={{fontSize: '18px'}}>🍕</span>, category: 'Emojis' },
    { name: '☕', icon: <span style={{fontSize: '18px'}}>☕</span>, category: 'Emojis' },
    { name: '🎁', icon: <span style={{fontSize: '18px'}}>🎁</span>, category: 'Emojis' },
    { name: '🏀', icon: <span style={{fontSize: '18px'}}>🏀</span>, category: 'Emojis' },
    { name: '🚀', icon: <span style={{fontSize: '18px'}}>🚀</span>, category: 'Emojis' },
    { name: '👽', icon: <span style={{fontSize: '18px'}}>👽</span>, category: 'Emojis' },
    { name: '🤖', icon: <span style={{fontSize: '18px'}}>🤖</span>, category: 'Emojis' },
    { name: '❤️', icon: <span style={{fontSize: '18px'}}>❤️</span>, category: 'Emojis' },
    { name: '✨', icon: <span style={{fontSize: '18px'}}>✨</span>, category: 'Emojis' },
  ];

  const filteredIcons = AVAILABLE_ICONS.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(iconSearch.toLowerCase());
    const matchesCategory = activeIconCategory === 'All' || icon.category === activeIconCategory;
    return matchesSearch && matchesCategory;
  });


  useEffect(() => {
    if (isOpen) {
      if (entryToEdit) {
        setTitle(entryToEdit.title || '');
        setUsername(entryToEdit.username || '');
        setEmail(entryToEdit.email || '');
        setPassword(entryToEdit.password || '');
        setUrl(entryToEdit.url || '');
        setNotes(entryToEdit.notes || '');
        setVaultId(entryToEdit.vault_id || activeVaultId);
        
        // Check if icon_letter matches an icon name, else default to Globe
        const iconName = entryToEdit.icon_letter && entryToEdit.icon_letter.length > 1 ? entryToEdit.icon_letter : 'Globe';
        setSelectedIcon(iconName);
      } else {
        setTitle('');
        setUsername('');
        setEmail('');
        setPassword('');
        setUrl('');
        setNotes('');
        setVaultId(activeVaultId === 'all-items' ? (vaults[0]?.id || 'private') : activeVaultId);
        setSelectedIcon('Globe');
      }
      setShowPassword(false);
    }
  }, [isOpen, entryToEdit, activeVaultId, vaults]);

  if (!isOpen) return null;

  const handleGeneratePassword = async () => {
    if (window.electronAPI?.generatePassword) {
      const newPass = await window.electronAPI.generatePassword();
      setPassword(newPass);
    } else {
      // Fallback
      setPassword(Math.random().toString(36).slice(-12) + '!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        id: entryToEdit?.id || crypto.randomUUID(),
        vault_id: vaultId,
        title,
        username,
        email,
        password,
        url,
        notes,
        icon_letter: selectedIcon,
        icon_color: entryToEdit?.icon_color || '#7c3aed',
        favorite: entryToEdit?.favorite || 0
      }, !!entryToEdit);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container glass">
        <div className="modal-header">
          <div className="modal-title-group">
            <Shield className="modal-icon" />
            <h2>{entryToEdit ? 'Edit Item' : 'Add New Item'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-content">
            <div className="form-left-col">
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Google, GitHub"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label>Vault</label>
                  <select value={vaultId} onChange={(e) => setVaultId(e.target.value)}>
                    {vaults.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-actions">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="field-actions">
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                      type="button" 
                      title="Generate Password"
                      onClick={handleGeneratePassword}
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Website URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Notes</label>
                <textarea 
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>
            </div>

            <div className="form-right-col">
              <div className="form-group" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ margin: 0 }}>Icon Selection</label>
                  <div style={{ position: 'relative', width: '150px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input 
                      type="text" 
                      placeholder="Filter..." 
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      style={{ 
                        padding: '6px 8px 6px 30px', 
                        fontSize: '0.8rem', 
                        height: '30px',
                        background: 'rgba(0,0,0,0.2)' 
                      }}
                    />
                  </div>
                </div>
                
                <div className="icon-category-tabs">
                  {ICON_CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      type="button"
                      className={`category-tab ${activeIconCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveIconCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="icon-picker" style={{ flex: 1, maxHeight: 'none' }}>
                  {filteredIcons.map(i => (
                    <button
                      key={i.name}
                      type="button"
                      className={`icon-btn ${selectedIcon === i.name ? 'selected' : ''}`}
                      onClick={() => setSelectedIcon(i.name)}
                      title={i.name}
                    >
                      {i.icon}
                    </button>
                  ))}
                  {filteredIcons.length === 0 && (
                    <div style={{ padding: '30px', textAlign: 'center', width: '100%', color: '#666', fontSize: '0.85rem' }}>
                      No matching icons.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal-container {
          width: 800px;
          max-width: 95%;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-icon {
          color: var(--accent-purple);
          width: 24px;
          height: 24px;
        }

        .modal-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .modal-form {
          padding: 24px;
        }

        .form-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 6px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .modal-form input,
        .modal-form select,
        .modal-form textarea {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .modal-form input:focus,
        .modal-form select:focus,
        .modal-form textarea:focus {
          border-color: var(--accent-purple);
        }

        .modal-form select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }

        .modal-form select option {
          background: #1c1c28; /* Match modal background */
          color: white;
          padding: 10px;
        }

        .input-with-actions {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-actions {
          position: absolute;
          right: 8px;
          display: flex;
          gap: 4px;
        }

        .field-actions button {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .field-actions button:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .modal-footer {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary {
          padding: 10px 24px;
          background: var(--accent-purple);
          border: none;
          border-radius: var(--radius-sm);
          color: white;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .icon-picker {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
          max-height: 180px;
          overflow-y: auto;
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: var(--radius-sm);
        }

        .icon-category-tabs {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-top: 4px;
        }

        .category-tab {
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #aaa;
          font-size: 0.7rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .category-tab:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .category-tab.active {
          background: var(--accent-purple);
          border-color: var(--accent-purple);
          color: white;
        }

        .icon-picker::-webkit-scrollbar {
          width: 4px;
        }
        .icon-picker::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .icon-btn.selected {
          background: var(--accent-purple);
          border-color: var(--accent-purple);
          color: white;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
