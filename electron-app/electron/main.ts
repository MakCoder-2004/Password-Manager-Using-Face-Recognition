import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import { dbService } from './database';
import { generatePassword } from './encryption';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Python face auth script and interpreter
const PYTHON_PATH = 'D:\\Programming\\venvs\\cv-env\\Scripts\\python.exe';
const FACE_AUTH_SCRIPT = path.resolve(__dirname, '../../Face Recognition/face_auth_api.py');

let mainWindow: BrowserWindow | null = null;
let sessionKey: string | null = null; 
let currentUser: { id: string, name: string, email: string } | null = null;
let pythonProcess: ReturnType<typeof spawn> | null = null;
let activeFaceRequest: { resolve: Function; reject: Function } | null = null;
let pythonBuffer = '';

let isPythonReady = false;
let pythonReadyResolvers: Array<() => void> = [];

function startPythonServer() {
  pythonProcess = spawn(PYTHON_PATH, [FACE_AUTH_SCRIPT, '--server']);
  
  pythonProcess.stdout?.on('data', (data) => {
    pythonBuffer += data.toString();
    const lines = pythonBuffer.split('\n');
    pythonBuffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const result = JSON.parse(line.trim());
          
          if (result.status === 'ready') {
            isPythonReady = true;
            pythonReadyResolvers.forEach(resolve => resolve());
            pythonReadyResolvers = [];
            continue; // Not attached to a specific active request
          }

          if (activeFaceRequest) {
            // Custom mapping for authentication logic
            if (result.status === 'authenticated' && result.user) {
              const user = dbService.getUserByName(result.user); 
              if (user) {
                sessionKey = user.password_hash;
                currentUser = { id: user.id, name: user.name, email: user.email };
                dbService.ensureDefaultVault(user.id);
              } else {
                result.status = 'error';
                result.message = 'Face recognized, but no associated user account exists. Please register.';
                sessionKey = null;
                currentUser = null;
              }
            }
            
            // Log security events
            if (result.status === 'authenticated') {
              const user = dbService.getUserByName(result.user);
              if (user) {
                dbService.logEvent('login', `Face Login: ${result.user}`, user.id);
              }
            } else if (result.status === 'spoof_detected') {
              dbService.logEvent('spoof_attempt', 'Biometric spoofing attempt blocked');
            } else if (result.status === 'unknown_face') {
              dbService.logEvent('unauthorized_face', 'Unknown person detected');
            }
            
            // Ensure `success` boolean exists for frontend checks
            if (result.status === 'success') {
               result.success = true;
            }

            activeFaceRequest.resolve(result);
            activeFaceRequest = null;
          }
        } catch (err) {
          if (activeFaceRequest) {
            activeFaceRequest.resolve({ status: 'error', message: 'Failed to parse response' });
            activeFaceRequest = null;
          }
        }
      }
    }
  });

  pythonProcess.stderr?.on('data', (data) => {
    console.error('Python Server Error:', data.toString());
  });
}


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, load from Vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window control IPC handlers (for frameless window)
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
  app.quit();
});

// IPC: Face Authentication
ipcMain.handle('face:authenticate', async () => {
  if (!pythonProcess) return { status: 'error', message: 'Face service unavailable' };
  if (activeFaceRequest) return { status: 'error', message: 'Camera is busy' };
  
  return new Promise((resolve, reject) => {
    activeFaceRequest = { resolve, reject };
    pythonProcess!.stdin?.write(JSON.stringify({ action: 'authenticate' }) + '\n');
    
    // Timeout
    setTimeout(() => {
      if (activeFaceRequest) {
        activeFaceRequest.resolve({ status: 'error', message: 'Authentication timed out' });
        activeFaceRequest = null;
      }
    }, 30000);
  });
});

// IPC: Face Registration
ipcMain.handle('face:register', async (_event, name: string) => {
  if (!pythonProcess) return { success: false, message: 'Face service unavailable' };
  if (activeFaceRequest) return { success: false, message: 'Camera is busy' };
  
  return new Promise((resolve, reject) => {
    activeFaceRequest = { resolve, reject };
    pythonProcess!.stdin?.write(JSON.stringify({ action: 'register', name }) + '\n');
    
    // Timeout
    setTimeout(() => {
      if (activeFaceRequest) {
        activeFaceRequest.resolve({ success: false, message: 'Registration timed out' });
        activeFaceRequest = null;
      }
    }, 30000);
  });
});

// IPC: Database & Passwords
ipcMain.handle('passwords:getAll', async () => {
  if (!sessionKey || !currentUser) return [];
  return dbService.getPasswords(currentUser.id, sessionKey);
});

ipcMain.handle('passwords:getDetail', async (_event, id: string) => {
  if (!sessionKey || !currentUser) return null;
  return dbService.getPasswordDetail(id, sessionKey);
});

ipcMain.handle('passwords:add', async (_event, data: any) => {
  if (!sessionKey || !currentUser) return { success: false, message: 'Not authenticated' };
  try {
    dbService.addPassword(currentUser.id, data, sessionKey);
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('passwords:update', async (_event, id: string, data: any) => {
  if (!sessionKey) return { success: false, message: 'Not authenticated' };
  try {
    dbService.updatePassword(id, data, sessionKey);
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('passwords:toggleFavorite', async (_event, id: string) => {
  if (!sessionKey) return { success: false, message: 'Not authenticated' };
  try {
    dbService.toggleFavorite(id);
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('passwords:delete', async (_event, id: string) => {
  try {
    dbService.deletePassword(id);
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('vaults:getAll', async () => {
  if (!currentUser) return [];
  return dbService.getVaults(currentUser.id);
});

ipcMain.handle('vaults:add', async (_event, name: string, color: string) => {
  if (!sessionKey || !currentUser) return { success: false, message: 'Not authenticated' };
  try {
    dbService.addVault(currentUser.id, name, color);
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('vaults:update', async (_event, id: string, name: string) => {
  if (!sessionKey) return { success: false, message: 'Not authenticated' };
  try {
    dbService.updateVault(id, name);
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('vaults:delete', async (_event, id: string) => {
  if (!sessionKey) return { success: false, message: 'Not authenticated' };
  try {
    dbService.deleteVault(id);
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('utils:generatePassword', async () => {
  return generatePassword(20);
});

// IPC: Authentication (Email/Password)
ipcMain.handle('auth:register', async (_event, { name, email, password }) => {
  try {
    const userId = crypto.randomUUID();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    dbService.registerUser({ id: userId, name, email }, passwordHash);
    dbService.ensureDefaultVault(userId);
    
    // Set session key (in a real app, this should be derived from master password)
    sessionKey = passwordHash; 
    currentUser = { id: userId, name, email };
    
    return { success: true, user: currentUser };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('auth:login', async (_event, { email, password }) => {
  try {
    const user = dbService.getUserByEmail(email);
    if (!user) return { success: false, message: 'User not found' };
    
    const inputHash = crypto.createHash('sha256').update(password).digest('hex');
    if (inputHash === user.password_hash) {
      sessionKey = user.password_hash;
      currentUser = { id: user.id, name: user.name, email: user.email };
      dbService.ensureDefaultVault(user.id);
      dbService.logEvent('login', `Password Login: ${user.email}`, user.id);
      return { success: true, user: currentUser };
    } else {
      dbService.logEvent('unauthorized_face', `Failed login attempt: ${email}`);
      return { success: false, message: 'Invalid password' };
    }
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('auth:logout', () => {
  sessionKey = null;
  currentUser = null;
  return { success: true };
});

ipcMain.handle('auth:check', () => {
  return sessionKey !== null;
});

ipcMain.handle('auth:getUser', async () => {
  return currentUser;
});

ipcMain.handle('auth:getLogs', async () => {
  if (!sessionKey || !currentUser) return [];
  return dbService.getAuditLogs(currentUser.id);
});

ipcMain.handle('auth:updateEmail', async (_event, oldEmail: string, newEmail: string) => {
  if (!sessionKey) return { success: false, message: 'Not authenticated' };
  try {
    dbService.updateEmail(oldEmail, newEmail);
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('auth:updatePassword', async (_event, email: string, newPassword: string) => {
  if (!sessionKey) return { success: false, message: 'Not authenticated' };
  try {
    const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    dbService.updateMasterPassword(email, newHash);
    sessionKey = newHash; // Update active session key
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('auth:deleteAndResetFace', async (_event, name: string) => {
  try {
    // 1. Delete from SQLite
    dbService.deleteUserByName(name);
    
    // 2. Delete .npy file
    const npyPath = path.join(__dirname, '../../Face Recognition/face_db', `${name}.npy`);
    if (fs.existsSync(npyPath)) {
      fs.unlinkSync(npyPath);
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle('face:recapture', async (_event, name: string) => {
  if (!sessionKey) return { success: false, message: 'Not authenticated' };
  if (!pythonProcess) return { success: false, message: 'Face service unavailable' };
  if (activeFaceRequest) return { success: false, message: 'Camera is busy' };
  
  return new Promise((resolve, reject) => {
    activeFaceRequest = { resolve, reject };
    pythonProcess!.stdin?.write(JSON.stringify({ action: 'register', name }) + '\n');
    
    setTimeout(() => {
      if (activeFaceRequest) {
        activeFaceRequest.resolve({ success: false, message: 'Timed out' });
        activeFaceRequest = null;
      }
    }, 30000);
  });
});

// IPC: Model Status
ipcMain.handle('face:waitForReady', async () => {
  if (isPythonReady) return true;
  return new Promise<boolean>((resolve) => {
    pythonReadyResolvers.push(() => resolve(true));
  });
});


app.whenReady().then(() => {
  startPythonServer();
  createWindow();
});

app.on('will-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
