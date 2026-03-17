# Phase 5: Password Management — CRUD + Encryption + SQLite

## Objective
Implement full password management: create, read, update, delete entries with AES-256-GCM encryption in a local SQLite database.

---

## Key Components

### 1. Encryption Service (`src/services/encryption.ts`)
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **Functions**: `encrypt(plaintext, passphrase)` → base64 string, `decrypt(encrypted, passphrase)` → plaintext
- **Format**: `salt:iv:tag:ciphertext` (hex-encoded)

### 2. SQLite Database (`electron/database.ts`)
- Uses `better-sqlite3` for synchronous, fast SQLite access
- **Tables**: `vaults`, `passwords`, `tags`, `password_tags`
- DB stored at `%APPDATA%/facevault/facevault.db`
- WAL mode enabled for performance
- Sensitive fields (`username`, `password`, `notes`) encrypted before storage

### 3. Database Schema

```sql
CREATE TABLE vaults (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#7c3aed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE passwords (
  id TEXT PRIMARY KEY,
  vault_id TEXT NOT NULL,
  title TEXT NOT NULL,
  username_encrypted TEXT,
  password_encrypted TEXT,
  url TEXT,
  notes_encrypted TEXT,
  icon_letter TEXT,
  icon_color TEXT,
  favorite INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
);
```

### 4. IPC Handlers (in `electron/main.ts`)
- `db:init` — Initialize DB with user's encryption key
- `vaults:getAll`, `vaults:add`, `vaults:delete`
- `passwords:getAll`, `passwords:add`, `passwords:update`, `passwords:delete`, `passwords:search`

### 5. Add Password Modal (`src/components/AddPasswordModal.tsx`)
- Glass-styled modal with fields: Title, Username, Password, URL, Notes
- Password generator (20 chars, mixed case + symbols)
- Show/hide password toggle
- Save triggers IPC → encrypt → SQLite insert

### 6. Update DashboardPage
- Replace mock data with real SQLite data via IPC
- Search bar calls `passwords:search`
- "+" button opens AddPasswordModal
- Edit/Delete buttons in detail panel call update/delete IPC

---

## Verification
1. ✅ Create new password → appears in list
2. ✅ Click entry → shows decrypted details
3. ✅ Edit entry → changes persist
4. ✅ Delete entry → removed from list
5. ✅ Copy username/password to clipboard
6. ✅ Password generator works
7. ✅ Raw `.db` file shows encrypted values (not plaintext)
8. ✅ Search filters by title/URL

## Status: ✅ COMPLETED (2026-03-17)

### Implementation Notes
- **AES-256-GCM**: Implemented a robust encryption service using Node's `crypto` module, with PBKDF2 key derivation (100k iterations).
- **SQLite Integration**: Used `better-sqlite3` for high-performance synchronous data storage.
- **IPC Bridge**: Securely exposed database CRUD operations via Electron IPC, ensuring sensitive data is only decrypted in memory when needed.
- **Glassmorphic Modal**: Built a custom `AddPasswordModal` with integrated password generation and secure fields.
- **Automatic Fallback**: Included a browser-safe mock layer for easier development and testing outside the Electron wrapper.

## Deliverables
- [x] `encryption.ts` — AES-256-GCM service
- [x] `database.ts` — SQLite CRUD with encryption
- [x] IPC handlers for password/vault operations
- [x] `AddPasswordModal.tsx` — Modal component
- [x] Dashboard connected to real data
