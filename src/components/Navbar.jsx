import React from 'react';
import { GraduationCap, LayoutDashboard, Cpu, SlidersHorizontal, Terminal, Download, Database } from 'lucide-react';
import { colors } from '../styles/tokens';
import { isFirebaseConfigured, firebaseConfig } from '../services/firebase';

const navItems = [
  { id: 'student',      label: 'IskoFund Portal',      icon: GraduationCap },
  { id: 'admin',        label: 'LGU Aid Officer',       icon: LayoutDashboard },
  { id: 'architecture', label: 'How It Works',          icon: Cpu },
  { id: 'sandbox',      label: 'Policy Simulator',      icon: SlidersHorizontal },
  { id: 'api',          label: 'API Explorer',          icon: Terminal },
];

export default function Navbar({ activeTab, setActiveTab, onExportReport }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff',
      borderBottom: `1px solid ${colors.slate200}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Philippine flag accent bar */}
      <div style={{ height: 3, background: 'linear-gradient(to right, #0038A8 33.3%, #CE1126 33.3% 66.6%, #FCD116 66.6%)' }} />

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px',
        height: 58,
        display: 'flex', alignItems: 'center', gap: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: colors.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={18} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: colors.slate900, letterSpacing: '-0.02em' }}>
                IskoFund
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                background: '#FEF9C3', color: '#92400E', border: '1px solid #FDE68A',
              }}>
                🇵🇭 LGU Scholarship System
              </span>
            </div>
            <p style={{ fontSize: 11, color: colors.slate400, margin: 0 }}>
              Pamantasan ng Bayan — Need-Based Financial Aid &amp; Predictive Analytics
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <NavButton key={item.id} active={isActive} onClick={() => setActiveTab(item.id)}>
                <Icon size={14} />
                {item.label}
              </NavButton>
            );
          })}
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span
            title={isFirebaseConfigured ? `Connected to Firebase Cloud Firestore (${firebaseConfig.projectId})` : 'Using Local/Offline Database Fallback. Configure .env with Firebase credentials to sync to cloud.'}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
              color: isFirebaseConfigured ? '#15803d' : '#854d0e',
              background: isFirebaseConfigured ? '#dcfce7' : '#fef9c3',
              border: isFirebaseConfigured ? '1px solid #bbf7d0' : '1px solid #fde68a',
              padding: '4px 10px', borderRadius: 99,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isFirebaseConfigured ? '#22c55e' : '#eab308', display: 'inline-block' }} />
            {isFirebaseConfigured ? '🔥 Firebase Online' : '💾 Local DB'}
          </span>
          <a
            href="/iskofund-bulakan.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: colors.accent, color: '#fff',
              fontSize: 12, fontWeight: 700, textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            🏛️ IskoFund: Bulakan Portal
          </a>
          <ActionButton onClick={onExportReport}>
            <Download size={13} />
            I-export
          </ActionButton>
        </div>
      </div>
    </header>
  );
}

function NavButton({ active, onClick, children }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 13px', borderRadius: 8, border: 'none',
        fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.15s',
        background: active ? colors.accentLight : hover ? colors.slate100 : 'transparent',
        color: active ? colors.accent : hover ? colors.slate700 : colors.slate500,
      }}
    >
      {children}
    </button>
  );
}

function ActionButton({ onClick, children }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 8,
        border: `1.5px solid ${colors.slate200}`,
        background: hover ? colors.slate100 : '#fff',
        color: colors.slate600, fontSize: 12, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
