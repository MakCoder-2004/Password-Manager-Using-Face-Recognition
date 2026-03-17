import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { encrypt, decrypt } from './encryption';

const DB_PATH = path.join(app.getPath('userData'), 'facevault.db');

// Ensure directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vaults (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#7c3aed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS passwords (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    vault_id TEXT NOT NULL,
    title TEXT NOT NULL,
    username_enc TEXT,
    email_enc TEXT,
    password_enc TEXT,
    url TEXT,
    notes_enc TEXT,
    icon_letter TEXT,
    icon_color TEXT,
    favorite INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- Nullable for global events like spoofing before login
    event_type TEXT NOT NULL, -- 'login', 'spoof_attempt', 'unauthorized_face'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Migrations for existing tables if columns are missing
const migrateTable = (table: string, column: string) => {
  try {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} TEXT`).run();
    console.log(`Successfully added ${column} to ${table}`);
  } catch (e: any) {
    if (e.message.includes('duplicate column name')) {
      // Column already exists, safe to ignore
    } else {
      console.warn(`Migration failed for ${table}.${column}:`, e.message);
    }
  }
};

migrateTable('vaults', 'user_id');
migrateTable('passwords', 'user_id');
migrateTable('audit_logs', 'user_id');

// Ensure default user has their Private vault
const ensureDefaultVault = (userId: string) => {
  const vaultExists = db.prepare('SELECT id FROM vaults WHERE user_id = ? AND name = ?').get(userId, 'Private');
  if (!vaultExists) {
    const vaultId = crypto.randomUUID();
    db.prepare('INSERT INTO vaults (id, user_id, name, color) VALUES (?, ?, ?, ?)')
      .run(vaultId, userId, 'Private', '#7c3aed');
    return vaultId;
  }
  return (vaultExists as any).id;
};

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface PasswordEntry {
  id: string;
  vault_id: string;
  title: string;
  username: string;
  email: string;
  password?: string;
  url: string;
  notes?: string;
  icon_letter: string;
  icon_color: string;
  favorite: number;
  date: string;
}

export const dbService = {
  // Users
  registerUser: (user: User, passwordHash: string) => {
    return db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)')
      .run(user.id, user.name, user.email, passwordHash);
  },

  getUsers: () => {
    return db.prepare('SELECT * FROM users').all();
  },

  getUserByEmail: (email: string) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  },

  getUserByName: (name: string) => {
    return db.prepare('SELECT * FROM users WHERE name = ?').get(name) as any;
  },

  updateEmail: (oldEmail: string, newEmail: string) => {
    return db.prepare('UPDATE users SET email = ? WHERE email = ?').run(newEmail, oldEmail);
  },

  updateMasterPassword: (email: string, newHash: string) => {
    // Note: Re-encrypting all passwords would be needed in a real app if encryption was derived from password
    return db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(newHash, email);
  },

  deleteUser: (userId: string) => {
    // Cascading deletes should handle vaults, passwords, and audit_logs if foreign keys are set correctly
    return db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  },

  deleteUserByName: (name: string) => {
    const user = dbService.getUserByName(name);
    if (user) {
      return dbService.deleteUser(user.id);
    }
  },

  // Vaults
  getVaults: (userId: string) => {
    return db.prepare('SELECT * FROM vaults WHERE user_id = ? ORDER BY name ASC').all(userId);
  },

  addVault: (userId: string, name: string, color: string) => {
    const id = crypto.randomUUID();
    return db.prepare('INSERT INTO vaults (id, user_id, name, color) VALUES (?, ?, ?, ?)')
      .run(id, userId, name, color);
  },

  updateVault: (id: string, name: string) => {
    return db.prepare('UPDATE vaults SET name = ?, updated_at = ? WHERE id = ?')
      .run(name, new Date().toISOString(), id);
  },

  deleteVault: (id: string) => {
    return db.prepare('DELETE FROM vaults WHERE id = ?').run(id);
  },

  // Passwords
  getPasswords: (userId: string, masterKey: string, vaultId?: string) => {
    const query = vaultId 
      ? 'SELECT * FROM passwords WHERE user_id = ? AND vault_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM passwords WHERE user_id = ? ORDER BY created_at DESC';
    
    const rows = vaultId ? db.prepare(query).all(userId, vaultId) : db.prepare(query).all(userId);
    
    return rows.map((row: any) => ({
      ...row,
      username: decrypt(row.username_enc, masterKey),
      email: row.email_enc ? decrypt(row.email_enc, masterKey) : '',
      // We don't decrypt password and notes in the list for better performance, 
      // but we could if the UI needs it for search. For now, we only decrypt title for list.
      date: new Date(row.created_at).toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()
    }));
  },

  getPasswordDetail: (id: string, masterKey: string) => {
    const row: any = db.prepare('SELECT * FROM passwords WHERE id = ?').get(id);
    if (!row) return null;

    return {
      ...row,
      username: decrypt(row.username_enc, masterKey),
      email: row.email_enc ? decrypt(row.email_enc, masterKey) : '',
      password: decrypt(row.password_enc, masterKey),
      notes: row.notes_enc ? decrypt(row.notes_enc, masterKey) : '',
    };
  },

  addPassword: (userId: string, data: Omit<PasswordEntry, 'date'>, masterKey: string) => {
    const { 
      id, vault_id, title, username, email, password, url, notes, 
      icon_letter, icon_color, favorite 
    } = data;

    return db.prepare(`
      INSERT INTO passwords (
        id, user_id, vault_id, title, username_enc, email_enc, password_enc, url, notes_enc, 
        icon_letter, icon_color, favorite
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id || crypto.randomUUID(),
      userId,
      vault_id,
      title,
      encrypt(username || '', masterKey),
      encrypt(email || '', masterKey),
      encrypt(password || '', masterKey),
      url,
      notes ? encrypt(notes, masterKey) : null,
      icon_letter,
      icon_color,
      favorite || 0
    );
  },

  updatePassword: (id: string, data: Partial<PasswordEntry>, masterKey: string) => {
    const row: any = db.prepare('SELECT * FROM passwords WHERE id = ?').get(id);
    if (!row) return;

    const updated = {
      vault_id: data.vault_id !== undefined ? data.vault_id : row.vault_id,
      title: data.title !== undefined ? data.title : row.title,
      username_enc: data.username !== undefined ? encrypt(data.username, masterKey) : row.username_enc,
      email_enc: data.email !== undefined ? encrypt(data.email, masterKey) : row.email_enc,
      password_enc: data.password !== undefined ? encrypt(data.password, masterKey) : row.password_enc,
      url: data.url !== undefined ? data.url : row.url,
      notes_enc: data.notes !== undefined ? encrypt(data.notes, masterKey) : row.notes_enc,
      icon_letter: data.icon_letter !== undefined ? data.icon_letter : row.icon_letter,
      icon_color: data.icon_color !== undefined ? data.icon_color : row.icon_color,
      favorite: data.favorite !== undefined ? data.favorite : row.favorite,
      updated_at: new Date().toISOString()
    };

    return db.prepare(`
      UPDATE passwords SET 
        vault_id = ?, title = ?, username_enc = ?, email_enc = ?, password_enc = ?, url = ?, 
        notes_enc = ?, icon_letter = ?, icon_color = ?, favorite = ?, updated_at = ? 
      WHERE id = ?
    `).run(
      updated.vault_id, updated.title, updated.username_enc, updated.email_enc, updated.password_enc, 
      updated.url, updated.notes_enc, updated.icon_letter, updated.icon_color, 
      updated.favorite, updated.updated_at, id
    );
  },

  deletePassword: (id: string) => {
    return db.prepare('DELETE FROM passwords WHERE id = ?').run(id);
  },

  toggleFavorite: (id: string) => {
    return db.prepare('UPDATE passwords SET favorite = 1 - favorite WHERE id = ?').run(id);
  },

  searchPasswords: (userId: string, query: string) => {
    return db.prepare('SELECT * FROM passwords WHERE user_id = ? AND (title LIKE ? OR url LIKE ?)')
      .all(userId, `%${query}%`, `%${query}%`);
  },

  // Audit Logs
  logEvent: (eventType: string, details?: string, userId?: string) => {
    const id = crypto.randomUUID();
    return db.prepare('INSERT INTO audit_logs (id, event_type, details, user_id) VALUES (?, ?, ?, ?)')
      .run(id, eventType, details || null, userId || null);
  },

  getAuditLogs: (userId?: string) => {
    if (userId) {
      return db.prepare('SELECT * FROM audit_logs WHERE user_id = ? OR user_id IS NULL ORDER BY timestamp DESC').all(userId);
    }
    return db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all();
  },

  ensureDefaultVault
};
