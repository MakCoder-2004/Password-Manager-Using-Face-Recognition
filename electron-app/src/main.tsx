import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Fallback for browser testing (Phase 5)
if (typeof window !== 'undefined' && !window.electronAPI) {
  const getMockStore = () => {
    try {
      return JSON.parse(localStorage.getItem('mock_db') || '{"passwords":[]}');
    } catch {
      return { passwords: [] };
    }
  };

  const saveMockStore = (store: any) => {
    localStorage.setItem('mock_db', JSON.stringify(store));
  };

  (window as any).electronAPI = {
    getVaults: async () => [
      { id: 'private', name: 'Private', color: '#7c3aed' },
      { id: 'bank', name: 'Bank', color: '#3b82f6' },
      { id: 'work', name: 'Work', color: '#ef4444' }
    ],
    getPasswords: async () => getMockStore().passwords || [],
    getPasswordDetail: async (id: string) => getMockStore().passwords.find((p: any) => p.id === id),
    addPassword: async (data: any) => {
      const store = getMockStore();
      store.passwords.push({ ...data, date: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase() });
      saveMockStore(store);
      return { success: true };
    },
    deletePassword: async (id: string) => {
      const store = getMockStore();
      store.passwords = store.passwords.filter((p: any) => p.id !== id);
      saveMockStore(store);
      return { success: true };
    },
    generatePassword: async () => 'MockPass123!@#',
    authenticateFace: async () => ({ status: 'authenticated', user: 'Tester' }),
    login: async () => ({ success: true, user: { name: 'Tester' } }),
    register: async () => ({ success: true, user: { name: 'Tester' } }),
    registerFace: async () => ({ success: true, message: 'Face registered (Mock)' }),
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
