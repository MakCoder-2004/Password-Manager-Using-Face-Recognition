export interface AuthResult {
  status: 'authenticated' | 'spoof_detected' | 'unknown_face' | 'no_face' | 'error';
  user?: string;
  confidence?: number;
  message?: string;
}

export async function authenticateFace(): Promise<AuthResult> {
  if (!window.electronAPI) {
    // Dev mode fallback — prevent auto-login in browser
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'no_face',
          message: 'Running in browser (Electron API missing)',
        });
      }, 2000);
    });
  }
  return window.electronAPI.authenticateFace();
}

export async function registerFace(name: string) {
  if (!window.electronAPI) {
    return { success: true, message: `Mock registered: ${name}` };
  }
  return window.electronAPI.registerFace(name);
}
