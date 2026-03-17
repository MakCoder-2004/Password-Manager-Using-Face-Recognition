interface ElectronAPI {
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  authenticateFace: () => Promise<{
    status: 'authenticated' | 'spoof_detected' | 'unknown_face' | 'no_face' | 'error';
    user?: string;
    message?: string;
  }>;
  registerFace: (name: string) => Promise<{ 
    success: boolean; 
    message: string; 
    status?: string; 
    user?: string; 
  }>;
  deleteAndResetFace: (name: string) => Promise<{ success: boolean; message?: string }>;
  login: (credentials: any) => Promise<{ success: boolean; user?: any; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; user?: any; message?: string }>;
  logout: () => Promise<{ success: boolean }>;
  checkAuth: () => Promise<boolean>;
  getUser: () => Promise<any>;
  getLogs: () => Promise<any[]>;
  updateEmail: (oldEmail: string, newEmail: string) => Promise<{ success: boolean; message?: string }>;
  updateMasterPassword: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  waitForModelReady: () => Promise<boolean>;
  recaptureFace: (name: string) => Promise<{ success: boolean; message?: string }>;
  // Passwords & Vaults
  getVaults: () => Promise<any[]>;
  addVault: (name: string, color: string) => Promise<{ success: boolean; message?: string }>;
  updateVault: (id: string, name: string) => Promise<{ success: boolean; message?: string }>;
  deleteVault: (id: string) => Promise<{ success: boolean; message?: string }>;
  getPasswords: () => Promise<any[]>;
  getPasswordDetail: (id: string) => Promise<any>;
  addPassword: (data: any) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (id: string, data: any) => Promise<{ success: boolean; message?: string }>;
  toggleFavorite: (id: string) => Promise<{ success: boolean; message?: string }>;
  deletePassword: (id: string) => Promise<{ success: boolean; message?: string }>;
  generatePassword: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
