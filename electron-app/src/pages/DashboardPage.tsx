import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PasswordList from '../components/PasswordList';
import PasswordDetail from '../components/PasswordDetail';
import AddPasswordModal from '../components/AddPasswordModal';
import './DashboardPage.css';

// Mock data — will be replaced with SQLite logic in Phase 5
const MOCK_VAULTS = [
  { id: 'private', name: 'Private', color: '#7c3aed' },
  { id: 'bank', name: 'Bank', color: '#3b82f6' },
  { id: 'work', name: 'Work', color: '#ef4444', shared: true },
  { id: 'social', name: 'Social', color: '#f59e0b' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [vaults, setVaults] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [activeVault, setActiveVault] = useState('all-items');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<any>(null);

  const [passwordToDelete, setPasswordToDelete] = useState<string | null>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [vaultToEdit, setVaultToEdit] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [newVaultName, setNewVaultName] = useState('');
  
  // Profile settings state
  const [profileEmail, setProfileEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [profileStatus, setProfileStatus] = useState('');

  // Universal confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isAlert?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isAlert: false,
    onConfirm: () => {}
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
    } else {
      setSelectedEntry(null);
    }
  }, [selectedId]);

  const loadData = async () => {
    if (window.electronAPI) {
      const dbVaults = await window.electronAPI.getVaults();
      setVaults(dbVaults);
      
      const dbEntries = await window.electronAPI.getPasswords();
      setEntries(dbEntries);

      if (window.electronAPI.getUser) {
        const user = await window.electronAPI.getUser();
        if (user) {
          setProfileEmail(user.email);
        }
      }

      if (window.electronAPI.getLogs) {
        const logs = await window.electronAPI.getLogs();
        setAuditLogs(logs);
      }
    }
  };

  const loadDetail = async (id: string) => {
    if (window.electronAPI) {
      const detail = await window.electronAPI.getPasswordDetail(id);
      setSelectedEntry(detail);
    }
  };

  const handleSavePassword = async (data: any, isEdit: boolean) => {
    if (window.electronAPI) {
      const result = isEdit 
        ? await window.electronAPI.updatePassword(data.id, data)
        : await window.electronAPI.addPassword(data);
        
      if (result.success) {
        if (isEdit && selectedId === data.id) {
          await loadDetail(data.id);
        }
        await loadData();
      }
    }
  };

  const handleEditPassword = () => {
    setEntryToEdit(selectedEntry);
    setIsModalOpen(true);
  };

  const handleToggleFavorite = async (id: string) => {
    if (window.electronAPI) {
      const result = await window.electronAPI.toggleFavorite(id);
      if (result.success) {
        if (selectedId === id) {
          await loadDetail(id);
        }
        await loadData();
      }
    }
  };

  const confirmDeletePassword = async () => {
    if (passwordToDelete && window.electronAPI) {
      const result = await window.electronAPI.deletePassword(passwordToDelete);
      if (result.success) {
        setSelectedId(null);
        await loadData();
      }
    }
  };

  const requestDeletePassword = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Item',
      message: 'Are you sure you want to delete this password? This action cannot be undone.',
      onConfirm: () => {
        setPasswordToDelete(id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  useEffect(() => {
    if (passwordToDelete) {
      confirmDeletePassword();
      setPasswordToDelete(null);
    }
  }, [passwordToDelete]);

  const filteredEntries = entries.filter(e => {
    if (activeVault === 'favorites') {
      if (!e.favorite) return false;
    } else if (activeVault !== 'all-items' && activeVault !== 'profile' && activeVault !== 'watchtower') {
      if (e.vault_id !== activeVault) return false;
    }
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.url?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderContentArea = () => {
    if (activeVault === 'profile') {
      return (
        <div style={{ flex: 1, padding: '40px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          <h2>User Settings</h2>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Personal Information</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', marginBottom: '5px' }}>EMAIL ADDRESS</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="email" 
                    value={profileEmail} 
                    onChange={e => setProfileEmail(e.target.value)}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '6px' }}
                  />
                  <button 
                    onClick={async () => {
                      if (window.electronAPI) {
                        const res = await window.electronAPI.updateEmail('', profileEmail); // Using simple update
                        setProfileStatus(res.success ? 'Email updated!' : 'Error updating email');
                      }
                    }}
                    style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer' }}
                  >Save</button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Security</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', marginBottom: '5px' }}>NEW MASTER PASSWORD</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="password" 
                    placeholder="Enter new password..."
                    value={newPass} 
                    onChange={e => setNewPass(e.target.value)}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '6px' }}
                  />
                  <button 
                    onClick={async () => {
                      if (newPass && window.electronAPI) {
                        const res = await window.electronAPI.updateMasterPassword(profileEmail, newPass);
                        setProfileStatus(res.success ? 'Password changed!' : 'Error changing password');
                        setNewPass('');
                      }
                    }}
                    style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer' }}
                  >Update</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', marginBottom: '5px' }}>FACE RECOGNITION</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={async () => {
                      setProfileStatus('Initializing camera...');
                      if (window.electronAPI) {
                        const res = await window.electronAPI.recaptureFace('User');
                        setProfileStatus(res.success ? 'Face data updated!' : 'Error updating face');
                      }
                    }}
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
                  >Recapture Face ID</button>
                  <button 
                    onClick={async () => {
                      setProfileStatus('Running privacy scan...');
                      if (window.electronAPI) {
                        const res = await window.electronAPI.authenticateFace();
                        if (res.status === 'authenticated') {
                          setProfileStatus('Identity Verified ✅');
                        } else if (res.status === 'unknown_face' || res.status === 'spoof_detected') {
                          setConfirmModal({
                            isOpen: true,
                            title: '⚠️ SECURITY WARNING',
                            message: res.status === 'spoof_detected' 
                              ? 'SPOOFING DETECTED! The system detected a non-living face or photo attempting to access your profile.' 
                              : 'UNAUTHORIZED FACE! The current person in front of the camera does NOT match the registered owner.',
                            isAlert: true,
                            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
                          });
                          setProfileStatus('Verification Failed ❌');
                        } else {
                          setProfileStatus(`Status: ${res.message || res.status}`);
                        }
                      }
                    }}
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
                  >Security Audit</button>
                </div>
              </div>
            </div>
          </div>

          {profileStatus && (
            <div style={{ 
              marginTop: '10px',
              padding: '12px 20px', 
              background: profileStatus.includes('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)', 
              color: profileStatus.includes('Error') ? '#ef4444' : '#a855f7',
              borderRadius: '8px',
              border: `1px solid ${profileStatus.includes('Error') ? 'rgba(239,68,68,0.2)' : 'rgba(124,58,237,0.2)'}`,
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-block',
              animation: 'fadeIn 0.3s ease'
            }}>
              {profileStatus}
            </div>
          )}
        </div>
      );
    }

    // Vault Management Screen (Treating activeVault as ID for sub-view or use a flag)
    if (activeVault !== 'all-items' && activeVault !== 'favorites' && activeVault !== 'watchtower' && activeVault !== 'profile') {
      const v = vaults.find(vault => vault.id === activeVault);
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#fff' }}>
               <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: v?.color }} />
               {v?.name} Vault
             </h2>
             <div style={{ display: 'flex', gap: '10px' }}>
               <button 
                 onClick={() => {
                   setVaultToEdit(v);
                   setNewVaultName(v?.name || '');
                   setIsVaultModalOpen(true);
                 }}
                 style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Rename</button>
               <button 
                 onClick={async () => {
                   setConfirmModal({
                     isOpen: true,
                     title: 'Delete Vault',
                     message: `Are you sure you want to delete the "${v?.name}" vault? All items inside will be permanently lost.`,
                     onConfirm: async () => {
                       if (window.electronAPI) {
                         await window.electronAPI.deleteVault(v?.id || '');
                         setActiveVault('all-items');
                         await loadData();
                       }
                       setConfirmModal(prev => ({ ...prev, isOpen: false }));
                     }
                   });
                 }}
                 style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Delete Vault</button>
             </div>
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            <PasswordList
              entries={filteredEntries}
              selectedId={selectedId}
              onSelect={setSelectedId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewItem={() => setIsModalOpen(true)}
            />
            <PasswordDetail 
              entry={selectedEntry} 
              onDelete={requestDeletePassword}
              onEdit={handleEditPassword}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>
      );
    }
    
    if (activeVault === 'watchtower') {
      const spoofAttempts = auditLogs.filter(l => l.event_type === 'spoof_attempt').length;
      
      return (
        <div style={{ flex: 1, padding: '40px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Watchtower Security Audit</h2>
            <button 
              onClick={loadData}
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
            >Refresh Logs</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#a855f7' }}>Access Statistics</h3>
              <p style={{ color: '#aaa', margin: 0 }}>Total secure entries recorded: {auditLogs.filter(l => l.event_type === 'login').length}</p>
            </div>
            <div style={{ 
              background: spoofAttempts > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
              border: spoofAttempts > 0 ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16, 185, 129, 0.2)', 
              padding: '20px', 
              borderRadius: '12px', 
              color: spoofAttempts > 0 ? '#ef4444' : '#10b981' 
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{spoofAttempts} Security Alerts</h3>
              <p style={{ margin: 0 }}>{spoofAttempts > 0 ? 'Critical: Biometric spoofing attempts detected!' : 'Your biometric security is holding strong.'}</p>
            </div>
          </div>

          <div style={{ background: 'rgba(20, 20, 35, 0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '15px 20px', fontSize: '0.8rem', color: '#aaa' }}>EVENT TYPE</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.8rem', color: '#aaa' }}>DETAILS</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.8rem', color: '#aaa' }}>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, i) => (
                  <tr key={log.id} style={{ borderBottom: i === auditLogs.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: log.event_type === 'login' ? 'rgba(124,58,237,0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: log.event_type === 'login' ? '#a855f7' : '#ef4444',
                        textTransform: 'uppercase'
                      }}>
                        {log.event_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '15px 20px', color: '#ddd', fontSize: '0.9rem' }}>{log.details}</td>
                    <td style={{ padding: '15px 20px', color: '#888', fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No security events recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <>
        <PasswordList
          entries={filteredEntries}
          selectedId={selectedId}
          onSelect={setSelectedId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewItem={() => setIsModalOpen(true)}
        />
        <PasswordDetail 
          entry={selectedEntry} 
          onDelete={requestDeletePassword}
          onEdit={handleEditPassword}
          onToggleFavorite={handleToggleFavorite}
        />
      </>
    );
  };

  return (
    <div className="dashboard-page">
      <Sidebar
        activeVault={activeVault}
        onSelectVault={setActiveVault}
        vaults={vaults.length > 0 ? vaults : MOCK_VAULTS}
        onAddVault={() => setIsVaultModalOpen(true)}
        onLogout={() => {
          setConfirmModal({
            isOpen: true,
            title: 'Logout',
            message: 'Are you sure you want to log out of Face Vault? All session data will be cleared.',
            onConfirm: async () => {
              if (window.electronAPI) {
                await window.electronAPI.logout();
                navigate('/login');
              } else {
                // Browser fallback
                navigate('/login');
              }
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
          });
        }}
        onCloseApp={() => {
          setConfirmModal({
            isOpen: true,
            title: 'Close Application',
            message: 'Are you sure you want to close Face Vault? Secure environment will be shut down.',
            onConfirm: () => {
              if (window.electronAPI) {
                window.electronAPI.closeWindow();
              } else {
                // Browser fallback
                alert("Closing application (Dev Mode)");
              }
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
          });
        }}
      />
      
      {renderContentArea()}

      <AddPasswordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEntryToEdit(null);
        }}
        onSave={handleSavePassword}
        vaults={vaults.length > 0 ? vaults : MOCK_VAULTS}
        activeVaultId={activeVault}
        entryToEdit={entryToEdit}
      />



      {isVaultModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999, display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container glass" style={{ width: '400px', background: '#1c1c28', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{vaultToEdit ? 'Rename Vault' : 'Create New Vault'}</h2>
            </div>
            <div className="modal-form" style={{ padding: '20px' }}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#ccc', marginBottom: '8px', textTransform: 'uppercase' }}>Vault Name</label>
                <input 
                  autoFocus
                  placeholder="e.g. Work, Family..." 
                  value={newVaultName} 
                  onChange={e => setNewVaultName(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                />
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }} 
                  onClick={() => {
                    setIsVaultModalOpen(false);
                    setVaultToEdit(null);
                  }}>Cancel</button>
                <button 
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#7c3aed', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }} 
                  onClick={async () => {
                    if (newVaultName.trim() && window.electronAPI) {
                      if (vaultToEdit) {
                        await window.electronAPI.updateVault(vaultToEdit.id, newVaultName.trim());
                      } else {
                        const colors = ['#7c3aed', '#3b82f6', '#ef4444', '#f59e0b', '#10b981'];
                        const color = colors[Math.floor(Math.random() * colors.length)];
                        await window.electronAPI.addVault(newVaultName.trim(), color);
                      }
                      setNewVaultName('');
                      setVaultToEdit(null);
                      setIsVaultModalOpen(false);
                      await loadData();
                    }
                  }}>{vaultToEdit ? 'Update Vault' : 'Create Vault'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {confirmModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000, display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container glass" style={{ width: '400px', background: 'rgba(28, 28, 40, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{confirmModal.title}</h2>
            </div>
            <div style={{ padding: '24px 20px', color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {confirmModal.message}
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {!confirmModal.isAlert && (
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  style={{ padding: '10px 18px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                >Cancel</button>
              )}
              <button 
                onClick={confirmModal.onConfirm}
                style={{ padding: '10px 18px', borderRadius: '6px', border: 'none', background: confirmModal.title.toLowerCase().includes('delete') || confirmModal.isAlert ? '#ef4444' : '#7c3aed', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
              >{confirmModal.isAlert ? 'I Understand' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
