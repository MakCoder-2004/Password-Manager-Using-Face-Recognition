import { Eye, EyeOff, Star, Copy, ExternalLink, Shield, Facebook, Instagram, Twitter, Github, Globe, Mail, Monitor, CreditCard, ShoppingBag, Fingerprint, Youtube, Chrome, Gamepad, Music, Video, Cloud } from 'lucide-react';
import { useState } from 'react';

const renderIcon = (iconName: string | undefined, size = 48) => {
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
    default: 
      if (iconName && iconName.length <= 2) {
        return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{iconName}</span>;
      }
      return <Fingerprint size={size} />;
  }
};

interface PasswordDetailProps {
  entry: {
    id: string;
    title: string;
    username: string;
    password: string;
    url: string;
    notes?: string;
    icon_letter: string;
    icon_color?: string;
    favorite: number;
  } | null;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onToggleFavorite: (id: string) => void;
}

export default function PasswordDetail({ entry, onDelete, onEdit, onToggleFavorite }: PasswordDetailProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!entry) {
    return (
      <div className="detail-panel">
        <div className="detail-empty">
          <Shield className="detail-empty-icon" />
          <p>Select an item to view details</p>
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
          <div className="detail-large-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: entry.icon_color || '#7c3aed', color: '#fff' }}>
            {renderIcon(entry.icon_letter, 32)}
          </div>
          <div>
            <div className="detail-title">{entry.title}</div>
            <div className="detail-url-text">{entry.url}</div>
          </div>
          <button 
            className="detail-action-btn" 
            style={{ marginLeft: 'auto', padding: '8px' }}
            onClick={() => onToggleFavorite(entry.id)}
          >
            <Star size={20} fill={entry.favorite === 1 ? "#f59e0b" : "none"} color={entry.favorite === 1 ? "#f59e0b" : "#aaa"} />
          </button>
        </div>

        <div className="detail-field">
          <div className="detail-field-label">Username</div>
          <div className="detail-field-value">
            <span>{entry.username || '—'}</span>
            <div className="detail-field-actions">
              <button className="detail-action-btn" onClick={() => copyToClipboard(entry.username)}>
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="detail-field">
          <div className="detail-field-label">Email</div>
          <div className="detail-field-value">
            <span>{(entry as any).email || '—'}</span>
            <div className="detail-field-actions">
              <button className="detail-action-btn" onClick={() => copyToClipboard((entry as any).email)}>
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
        <button className="edit-btn" onClick={onEdit}>Edit</button>
        <button className="delete-btn" onClick={() => onDelete(entry.id)}>Delete</button>
      </div>
    </div>
  );
}
