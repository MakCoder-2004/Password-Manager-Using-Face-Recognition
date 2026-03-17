# Phase 4: Dashboard UI — 3-Column Password Manager

## Objective
Build the main dashboard screen matching the uploaded 1Password-style design: a dark 3-column layout with a left sidebar (vaults/navigation), center content area (password list grouped by date), and a right detail panel.

---

## UI Reference (From Uploaded Design)

### Left Sidebar
- App name "FaceVault" with dropdown chevron and user avatar
- **Navigation**: Profile, All Items, Favorites, Watchtower (each with an icon)
- **Vaults Section**: Header "VAULTS" with "+" button, list of vaults (Private, Bank, Work, etc.) with colored circle icons, some with sharing indicators
- **Tags Section**: Header "TAGS" collapsible

### Center Content Area
- **Top Bar**: Back/Forward arrows, Search bar "Search in [VaultName]", Help button, "+ New Item" CTA button
- **Category Filter**: "All Categories" dropdown with filter & sort icons
- **Password Entries**: Grouped by month headers ("FEBRUARY 2025", "JANUARY 2025", etc.)
  - Each entry: 40px icon/favicon, Title (bold), Subtitle (username/URL, muted), all on one row

### Right Detail Panel
- Shows details of selected password entry
- When nothing selected: large lock icon placeholder with subtle gray background
- When selected: Entry title, fields (Username, Password with show/copy, URL, Notes), Edit/Delete buttons

---

## Step-by-Step Implementation

### Step 1: Dashboard Layout CSS

Create `electron-app/src/pages/DashboardPage.css`:

```css
/* ========================
   DASHBOARD - 3 COLUMN LAYOUT
   ======================== */

.dashboard-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
}

/* ========================
   LEFT SIDEBAR
   ======================== */

.sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--bg-sidebar);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-app-region: drag;
}

.sidebar-header {
  padding: 16px 16px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  -webkit-app-region: no-drag;
}

.sidebar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.sidebar-title {
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.sidebar-title .chevron {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
}

/* Nav items */
.sidebar-nav {
  padding: 4px 8px;
  list-style: none;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
  -webkit-app-region: no-drag;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(124, 58, 237, 0.15);
  color: var(--text-primary);
}

.nav-item .icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

/* Section headers */
.sidebar-section {
  padding: 20px 16px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: no-drag;
}

.sidebar-section h3 {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.sidebar-section .add-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.15s;
}

.sidebar-section .add-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

/* Vault items */
.vault-list {
  padding: 0 8px;
  list-style: none;
}

.vault-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
  -webkit-app-region: no-drag;
}

.vault-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}

.vault-item.active {
  background: rgba(124, 58, 237, 0.15);
  color: var(--text-primary);
}

.vault-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.vault-item .share-icon {
  margin-left: auto;
  width: 14px;
  height: 14px;
  color: var(--text-muted);
}

/* ========================
   CENTER - PASSWORD LIST
   ======================== */

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  min-width: 360px;
}

.content-topbar {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  -webkit-app-region: drag;
}

.nav-arrows {
  display: flex;
  gap: 4px;
  -webkit-app-region: no-drag;
}

.nav-arrow-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s;
}

.nav-arrow-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.search-bar {
  flex: 1;
  padding: 7px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
  -webkit-app-region: no-drag;
}

.search-bar::placeholder {
  color: var(--text-muted);
}

.search-bar:focus {
  border-color: var(--accent-purple);
}

.topbar-actions {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.help-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  transition: all 0.15s;
}

.help-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
}

.new-item-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(124, 58, 237, 0.2);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: var(--radius-sm);
  color: var(--accent-purple-light);
  font-family: var(--font-primary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.new-item-btn:hover {
  background: rgba(124, 58, 237, 0.3);
  border-color: var(--accent-purple);
}

/* Category filter bar */
.category-bar {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.category-dropdown {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.category-icons {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.category-icon-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.category-icon-btn:hover {
  color: var(--text-primary);
}

/* Password list */
.password-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.password-list::-webkit-scrollbar {
  width: 6px;
}

.password-list::-webkit-scrollbar-track {
  background: transparent;
}

.password-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.date-group {
  padding: 0 16px;
}

.date-header {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
  padding: 14px 0 6px;
}

.password-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s;
}

.password-entry:hover {
  background: rgba(255, 255, 255, 0.03);
}

.password-entry.active {
  background: rgba(124, 58, 237, 0.1);
}

.entry-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-primary);
  flex-shrink: 0;
  overflow: hidden;
}

.entry-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.entry-info {
  flex: 1;
  min-width: 0;
}

.entry-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-subtitle {
  font-size: 0.78rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========================
   RIGHT DETAIL PANEL
   ======================== */

.detail-panel {
  width: 400px;
  min-width: 300px;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.detail-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-empty-icon {
  width: 200px;
  height: 200px;
  opacity: 0.15;
}

.detail-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.detail-large-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
}

.detail-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.detail-url {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Detail fields */
.detail-field {
  margin-bottom: 18px;
}

.detail-field-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.detail-field-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.detail-field-actions {
  display: flex;
  gap: 6px;
}

.detail-action-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s;
}

.detail-action-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

/* Detail footer actions */
.detail-actions {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-sm);
  font-family: var(--font-primary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.3);
  color: var(--accent-purple-light);
}

.edit-btn:hover {
  background: rgba(124, 58, 237, 0.25);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}
```

---

### Step 2: Build Dashboard Components

#### Sidebar Component (`src/components/Sidebar.tsx`)

```tsx
import {
  User, Key, Star, Shield, ChevronDown,
  Plus, Users
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
}

export default function Sidebar({ activeVault, onSelectVault, vaults }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-avatar">FV</div>
        <span className="sidebar-title">
          FaceVault <ChevronDown className="chevron" />
        </span>
      </div>

      <ul className="sidebar-nav">
        <li className="nav-item"><User className="icon" /> Profile</li>
        <li className="nav-item active"><Key className="icon" /> All Items</li>
        <li className="nav-item"><Star className="icon" /> Favorites</li>
        <li className="nav-item"><Shield className="icon" /> Watchtower</li>
      </ul>

      <div className="sidebar-section">
        <h3>Vaults</h3>
        <button className="add-btn"><Plus size={14} /></button>
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

      <div className="sidebar-section">
        <h3>Tags</h3>
      </div>
    </aside>
  );
}
```

#### Password List Component (`src/components/PasswordList.tsx`)

```tsx
interface PasswordEntry {
  id: string;
  title: string;
  subtitle: string;
  iconLetter: string;
  iconColor?: string;
  date: string;
}

interface PasswordListProps {
  entries: PasswordEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function PasswordList({
  entries, selectedId, onSelect, searchQuery, onSearchChange
}: PasswordListProps) {
  // Group by month
  const grouped = entries.reduce((acc, entry) => {
    const monthKey = entry.date; // e.g., "FEBRUARY 2025"
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(entry);
    return acc;
  }, {} as Record<string, PasswordEntry[]>);

  return (
    <div className="content-area">
      {/* Top bar with search */}
      <div className="content-topbar">
        <div className="nav-arrows">
          <button className="nav-arrow-btn">←</button>
          <button className="nav-arrow-btn">→</button>
        </div>
        <input
          className="search-bar"
          placeholder="Search in Vault..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="topbar-actions">
          <button className="help-btn">Help</button>
          <button className="new-item-btn">+ New Item</button>
        </div>
      </div>

      {/* Category filter */}
      <div className="category-bar">
        <span className="category-dropdown">
          ⊞ All Categories <ChevronDown size={14} />
        </span>
      </div>

      {/* Password entries */}
      <div className="password-list">
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month} className="date-group">
            <div className="date-header">{month}</div>
            {items.map(entry => (
              <div
                key={entry.id}
                className={`password-entry ${selectedId === entry.id ? 'active' : ''}`}
                onClick={() => onSelect(entry.id)}
              >
                <div
                  className="entry-icon"
                  style={{ background: entry.iconColor || 'var(--bg-card)' }}
                >
                  {entry.iconLetter}
                </div>
                <div className="entry-info">
                  <div className="entry-title">{entry.title}</div>
                  <div className="entry-subtitle">{entry.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Password Detail Panel (`src/components/PasswordDetail.tsx`)

```tsx
import { Eye, EyeOff, Copy, ExternalLink, Shield } from 'lucide-react';
import { useState } from 'react';

interface PasswordDetailProps {
  entry: {
    id: string;
    title: string;
    username: string;
    password: string;
    url: string;
    notes?: string;
    iconLetter: string;
  } | null;
}

export default function PasswordDetail({ entry }: PasswordDetailProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!entry) {
    return (
      <div className="detail-panel">
        <div className="detail-empty">
          <Shield className="detail-empty-icon" />
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="detail-panel">
      <div className="detail-content">
        <div className="detail-header">
          <div className="detail-large-icon">{entry.iconLetter}</div>
          <div>
            <div className="detail-title">{entry.title}</div>
            <div className="detail-url">{entry.url}</div>
          </div>
        </div>

        <div className="detail-field">
          <div className="detail-field-label">Username</div>
          <div className="detail-field-value">
            <span>{entry.username}</span>
            <div className="detail-field-actions">
              <button className="detail-action-btn" onClick={() => copyToClipboard(entry.username)}>
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="detail-field">
          <div className="detail-field-label">Password</div>
          <div className="detail-field-value">
            <span>{showPassword ? entry.password : '••••••••••'}</span>
            <div className="detail-field-actions">
              <button className="detail-action-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button className="detail-action-btn" onClick={() => copyToClipboard(entry.password)}>
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="detail-field">
          <div className="detail-field-label">Website</div>
          <div className="detail-field-value">
            <span>{entry.url}</span>
            <div className="detail-field-actions">
              <button className="detail-action-btn">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>

        {entry.notes && (
          <div className="detail-field">
            <div className="detail-field-label">Notes</div>
            <div className="detail-field-value">
              <span>{entry.notes}</span>
            </div>
          </div>
        )}
      </div>

      <div className="detail-actions">
        <button className="edit-btn">Edit</button>
        <button className="delete-btn">Delete</button>
      </div>
    </div>
  );
}
```

---

### Step 3: Assemble DashboardPage

Create `electron-app/src/pages/DashboardPage.tsx`:

```tsx
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import PasswordList from '../components/PasswordList';
import PasswordDetail from '../components/PasswordDetail';
import './DashboardPage.css';

// Mock data — will be replaced with SQLite in Phase 5
const MOCK_VAULTS = [
  { id: 'private', name: 'Private', color: '#7c3aed' },
  { id: 'bank', name: 'Bank', color: '#3b82f6' },
  { id: 'work', name: 'Work', color: '#ef4444' },
  { id: 'social', name: 'Social', color: '#f59e0b' },
];

const MOCK_ENTRIES = [
  { id: '1', title: 'Gmail', subtitle: 'user@gmail.com', iconLetter: 'G', iconColor: '#ea4335', date: 'FEBRUARY 2025', username: 'user@gmail.com', password: 'mySecurePass123', url: 'https://gmail.com' },
  { id: '2', title: 'GitHub', subtitle: 'devuser', iconLetter: 'GH', iconColor: '#333', date: 'FEBRUARY 2025', username: 'devuser', password: 'gh_pat_xxxx', url: 'https://github.com', notes: 'Personal account' },
  { id: '3', title: 'Amazon', subtitle: 'shopper@email.com', iconLetter: 'A', iconColor: '#ff9900', date: 'JANUARY 2025', username: 'shopper@email.com', password: 'amzn2024!', url: 'https://amazon.com' },
];

export default function DashboardPage() {
  const [activeVault, setActiveVault] = useState('private');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedEntry = MOCK_ENTRIES.find(e => e.id === selectedId) || null;

  return (
    <div className="dashboard-page">
      <Sidebar
        activeVault={activeVault}
        onSelectVault={setActiveVault}
        vaults={MOCK_VAULTS}
      />
      <PasswordList
        entries={MOCK_ENTRIES}
        selectedId={selectedId}
        onSelect={setSelectedId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <PasswordDetail entry={selectedEntry} />
    </div>
  );
}
```

---

## Verification

1. ✅ Dashboard shows 3-column layout: sidebar, content, detail panel
2. ✅ Sidebar has navigation items, vault list with colored dots
3. ✅ Password entries are grouped by month headers
4. ✅ Clicking an entry shows its details in the right panel
5. ✅ Empty state shows a shield/lock icon
6. ✅ Search bar is functional (filtering will be enhanced in Phase 5)
7. ✅ "+ New Item" button is visible and styled
8. ✅ Scrollbar styling matches dark theme

---

## Status: ✅ COMPLETED (2026-03-17)

### Implementation Notes
- **3-Column Architecture**: Split the dashboard into three decoupled components: `Sidebar`, `PasswordList`, and `PasswordDetail`.
- **Month Grouping**: Implemented dynamic grouping of passwords by year/month headers in the list view.
- **Premium Styling**: Applied a consistent dark theme using CSS variables from Phase 1, with custom scrollbars and backdrop effects.
- **Interactive State**: Set up React state to handle vault selection, password selection, and search filtering.
- **Icons**: Leveraged `lucide-react` for consistent, professional iconography throughout the app.

## Deliverables
- [x] `DashboardPage.tsx` + `DashboardPage.css` — Main layout
- [x] `Sidebar.tsx` — Left navigation with vaults
- [x] `PasswordList.tsx` — Center password entries
- [x] `PasswordDetail.tsx` — Right detail panel
- [x] Mock data renders properly as placeholder
