const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Face authentication
  authenticateFace: () => ipcRenderer.invoke('face:authenticate'),
  registerFace: (name: string) => ipcRenderer.invoke('face:register', name),

  // Email/Password Auth
  login: (credentials: any) => ipcRenderer.invoke('auth:login', credentials),
  register: (data: any) => ipcRenderer.invoke('auth:register', data),
  logout: () => ipcRenderer.invoke('auth:logout'),
  checkAuth: () => ipcRenderer.invoke('auth:check'),
  getUser: () => ipcRenderer.invoke('auth:getUser'),
  getLogs: () => ipcRenderer.invoke('auth:getLogs'),
  updateEmail: (oldEmail: string, newEmail: string) => ipcRenderer.invoke('auth:updateEmail', oldEmail, newEmail),
  updateMasterPassword: (email: string, pass: string) => ipcRenderer.invoke('auth:updatePassword', email, pass),
  waitForModelReady: () => ipcRenderer.invoke('face:waitForReady'),
  recaptureFace: (name: string) => ipcRenderer.invoke('face:recapture', name),
  deleteAndResetFace: (name: string) => ipcRenderer.invoke('auth:deleteAndResetFace', name),

  // Passwords & Vaults
  getVaults: () => ipcRenderer.invoke('vaults:getAll'),
  addVault: (name: string, color: string) => ipcRenderer.invoke('vaults:add', name, color),
  updateVault: (id: string, name: string) => ipcRenderer.invoke('vaults:update', id, name),
  deleteVault: (id: string) => ipcRenderer.invoke('vaults:delete', id),
  getPasswords: () => ipcRenderer.invoke('passwords:getAll'),
  getPasswordDetail: (id: string) => ipcRenderer.invoke('passwords:getDetail', id),
  addPassword: (data: any) => ipcRenderer.invoke('passwords:add', data),
  updatePassword: (id: string, data: any) => ipcRenderer.invoke('passwords:update', id, data),
  toggleFavorite: (id: string) => ipcRenderer.invoke('passwords:toggleFavorite', id),
  deletePassword: (id: string) => ipcRenderer.invoke('passwords:delete', id),
  generatePassword: () => ipcRenderer.invoke('utils:generatePassword'),
});
