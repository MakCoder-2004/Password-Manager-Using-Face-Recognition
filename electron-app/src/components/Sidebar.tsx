import {
  User, Key, Star, Shield,
  Plus, Users, LogOut, Power
} from 'lucide-react';

interface Vault {
  id: string;
  name: string;
  color: string;
  shared?: boolean;
}

interface SidebarProps {
  activeVault: string;
  onSelectVault: (id: string) => void;
  vaults: Vault[];
  onAddVault?: () => void;
  onLogout?: () => void;
  onCloseApp?: () => void;
}

export default function Sidebar({ activeVault, onSelectVault, vaults, onAddVault, onLogout, onCloseApp }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-avatar" style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}>
          <img 
            src="/logo.png" 
            alt="VisageVault Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        <span className="sidebar-title">
          Face Vault
        </span>
      </div>

      <div className="sidebar-content" style={{ flex: 1, overflowY: 'auto' }}>
        <ul className="sidebar-nav">
          <li className={`nav-item ${activeVault === 'profile' ? 'active' : ''}`} onClick={() => onSelectVault('profile')}>
            <User className="icon" /> Profile
          </li>
          <li className={`nav-item ${activeVault === 'all-items' ? 'active' : ''}`} onClick={() => onSelectVault('all-items')}>
            <Key className="icon" /> All Items
          </li>
          <li className={`nav-item ${activeVault === 'favorites' ? 'active' : ''}`} onClick={() => onSelectVault('favorites')}>
            <Star className="icon" /> Favorites
          </li>
          <li className={`nav-item ${activeVault === 'watchtower' ? 'active' : ''}`} onClick={() => onSelectVault('watchtower')}>
            <Shield className="icon" /> Watchtower
          </li>
        </ul>

        <div className="sidebar-section">
          <h3>Vaults</h3>
          <button className="add-btn" onClick={onAddVault}><Plus size={14} /></button>
        </div>

        <ul className="vault-list">
          {vaults.map(v => (
            <li
              key={v.id}
              className={`vault-item ${activeVault === v.id ? 'active' : ''}`}
              onClick={() => onSelectVault(v.id)}
            >
              <span className="vault-dot" style={{ background: v.color }} />
              {v.name}
              {v.shared && <Users className="share-icon" />}
            </li>
          ))}
        </ul>
      </div>



      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut className="icon" size={18} />
          <span>Logout</span>
        </button>
        <button className="close-app-btn" onClick={onCloseApp}>
          <Power className="icon" size={18} />
          <span>Close Face Vault</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden !important; /* Prevent double scrollbars */
        }
        .sidebar-content {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .sidebar-content::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-content::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .sidebar-footer {
          margin-top: auto;
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          -webkit-app-region: no-drag;
          background: var(--bg-sidebar); /* Ensure opacity */
          z-index: 10;
        }
        .logout-btn, .close-app-btn {
          -webkit-app-region: no-drag;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
          padding: 10px 16px;
          border-radius: var(--radius-sm);
          width: 100%;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }
        .logout-btn:active {
          transform: translateY(0);
          background: rgba(239, 68, 68, 0.2);
        }
        .logout-btn .icon {
          color: #ef4444;
        }
        .close-app-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #9ca3af;
          background: transparent;
          border: 1px solid transparent;
          padding: 10px 16px;
          margin-top: 8px;
          border-radius: var(--radius-sm);
          width: 100%;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-app-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }
        .close-app-btn:active {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </aside>
  );
}
