// Senior Product Design System Tokens — Swiss-style Minimalist Utility (Linear / Stripe / Notion inspired)
export const colors = {
  // Functional Single Accent
  accent: '#DC2626',
  accentLight: '#FEF2F2',
  accentDark: '#B91C1C',
  accentBorder: '#FECACA',

  // Status Accents (Restrained)
  success: '#15803D',
  successLight: '#F0FDF4',
  successBorder: '#BBF7D0',
  warning: '#B45309',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorBorder: '#FECACA',

  // Purple Accent (used in tier distributions & charts)
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  purpleBorder: '#E9D5FF',

  // Neutral Monochrome Spectrum
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  white: '#FFFFFF',
};

// Structural 1px borders, no blurry drop shadows
export const shadow = {
  sm: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
  md: '0 1px 3px 0 rgba(15, 23, 42, 0.06)',
  lg: '0 4px 6px -1px rgba(15, 23, 42, 0.07)',
  none: 'none'
};

// Strict 4px to 8px geometry
export const radius = {
  xs: 3,
  sm: 4,
  md: 6,
  lg: 8,
  full: 9999,
};

// Utility Style Builders
export const card = (extra = {}) => ({
  background: colors.white,
  border: `1px solid ${colors.slate200}`,
  borderRadius: radius.lg,
  boxShadow: shadow.sm,
  ...extra,
});

export const inputStyle = (extra = {}) => ({
  width: '100%',
  padding: '8px 12px',
  border: `1px solid ${colors.slate200}`,
  borderRadius: radius.md,
  fontSize: '13px',
  fontFamily: 'inherit',
  color: colors.slate900,
  background: colors.white,
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  ...extra,
});

export const btnPrimary = (extra = {}) => ({
  background: colors.accent,
  color: colors.white,
  border: `1px solid ${colors.accentDark}`,
  borderRadius: radius.md,
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  transition: 'background-color 0.15s ease',
  boxShadow: shadow.sm,
  ...extra,
});

export const btnSecondary = (extra = {}) => ({
  background: colors.white,
  color: colors.slate700,
  border: `1px solid ${colors.slate200}`,
  borderRadius: radius.md,
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  ...extra,
});

export const badge = (type = 'default', extra = {}) => {
  const map = {
    default: { bg: colors.slate100, color: colors.slate700, border: colors.slate200 },
    accent: { bg: colors.accentLight, color: colors.accentDark, border: colors.accentBorder },
    success: { bg: colors.successLight, color: colors.success, border: colors.successBorder },
    warning: { bg: colors.warningLight, color: colors.warning, border: colors.warningBorder },
    error: { bg: colors.errorLight, color: colors.error, border: colors.errorBorder },
  };
  const c = map[type] || map.default;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: radius.sm,
    fontSize: '11px',
    fontWeight: 600,
    background: c.bg,
    color: c.color,
    border: `1px solid ${c.border}`,
    lineHeight: '16px',
    ...extra,
  };
};

export const labelStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: colors.slate700,
  display: 'block',
  marginBottom: '5px',
};

export const hintStyle = {
  fontSize: '11px',
  color: colors.slate400,
  marginTop: '3px',
};

export const sectionTitle = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: colors.slate800,
};
