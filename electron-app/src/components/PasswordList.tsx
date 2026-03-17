import { 
  Star, Facebook, Instagram, Twitter, Github, Globe, Mail, Monitor, 
  CreditCard, ShoppingBag, Fingerprint, Youtube, Chrome, Gamepad, 
  Music, Video, Cloud, Linkedin, Twitch, MessageSquare, Figma, 
  Bitcoin, Apple, Car, Smartphone, Laptop, Server, Database, 
  Lock, Unlock, Key, ShieldCheck, Briefcase, GraduationCap, 
  Heart, ShoppingCart, Send, Camera, Plane, Coffee, Zap, Moon, Sun, 
  Ghost, Trash2, Settings, Bell, Search, Code, Layout, Terminal
} from 'lucide-react';

const renderIcon = (iconName: string, size = 20) => {
  switch (iconName) {
    case 'Facebook': return <Facebook size={size} />;
    case 'Instagram': return <Instagram size={size} />;
    case 'Twitter': return <Twitter size={size} />;
    case 'Github': return <Github size={size} />;
    case 'Globe': return <Globe size={size} />;
    case 'Mail': return <Mail size={size} />;
    case 'Monitor': return <Monitor size={size} />;
    case 'CreditCard': return <CreditCard size={size} />;
    case 'ShoppingBag': return <ShoppingBag size={size} />;
    case 'Youtube': return <Youtube size={size} />;
    case 'Chrome': return <Chrome size={size} />;
    case 'Gamepad': return <Gamepad size={size} />;
    case 'Music': return <Music size={size} />;
    case 'Video': return <Video size={size} />;
    case 'Cloud': return <Cloud size={size} />;
    case 'Linkedin': return <Linkedin size={size} />;
    case 'Twitch': return <Twitch size={size} />;
    case 'MessageSquare': return <MessageSquare size={size} />;
    case 'Figma': return <Figma size={size} />;
    case 'Bitcoin': return <Bitcoin size={size} />;
    case 'Apple': return <Apple size={size} />;
    case 'Car': return <Car size={size} />;
    case 'Smartphone': return <Smartphone size={size} />;
    case 'Laptop': return <Laptop size={size} />;
    case 'Server': return <Server size={size} />;
    case 'Database': return <Database size={size} />;
    case 'Lock': return <Lock size={size} />;
    case 'Unlock': return <Unlock size={size} />;
    case 'Key': return <Key size={size} />;
    case 'ShieldCheck': return <ShieldCheck size={size} />;
    case 'Briefcase': return <Briefcase size={size} />;
    case 'GraduationCap': return <GraduationCap size={size} />;
    case 'Heart': return <Heart size={size} />;
    case 'ShoppingCart': return <ShoppingCart size={size} />;
    case 'Send': return <Send size={size} />;
    case 'Camera': return <Camera size={size} />;
    case 'Plane': return <Plane size={size} />;
    case 'Coffee': return <Coffee size={size} />;
    case 'Zap': return <Zap size={size} />;
    case 'Moon': return <Moon size={size} />;
    case 'Sun': return <Sun size={size} />;
    case 'Ghost': return <Ghost size={size} />;
    case 'Trash2': return <Trash2 size={size} />;
    case 'Settings': return <Settings size={size} />;
    case 'Bell': return <Bell size={size} />;
    case 'Search': return <Search size={size} />;
    case 'Code': return <Code size={size} />;
    case 'Layout': return <Layout size={size} />;
    case 'Terminal': return <Terminal size={size} />;
    default: 
      // If it's a short string (like an emoji or single letter), render it directly!
      if (iconName && iconName.length <= 4) { // Extended for double emojis
        return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{iconName}</span>;
      }
      return <Fingerprint size={size} />;
  }
};

interface PasswordEntry {
  id: string;
  title: string;
  subtitle: string;
  icon_letter: string;
  icon_color?: string;
  favorite?: number;
  date: string;
}

interface PasswordListProps {
  entries: PasswordEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewItem: () => void;
}

export default function PasswordList({
  entries, selectedId, onSelect, searchQuery, onSearchChange, onNewItem
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
      <div className="content-topbar">
        <input
          className="search-bar"
          placeholder="Search in Face Vault..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="topbar-actions">
          <button className="new-item-btn" onClick={onNewItem}>+ New Item</button>
        </div>
      </div>



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
                  style={{ background: entry.icon_color || 'var(--bg-card)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {renderIcon(entry.icon_letter, 18)}
                </div>
                <div className="entry-info">
                  <div className="entry-title">{entry.title}</div>
                  <div className="entry-subtitle">{entry.subtitle}</div>
                </div>
                {entry.favorite === 1 && <Star size={14} fill="#f59e0b" color="#f59e0b" style={{ opacity: 0.8 }} />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
