export const colors = {
  primary: '#1E3A8A',
  primaryHover: '#1D4ED8',
  accent: '#F59E0B',
  accentHover: '#D97706',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  bgPage: '#F8FAFC',
  bgCard: '#FFFFFF',
  success: '#059669',
  successBg: '#D1FAE5',
  successText: '#065F46',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  warningText: '#92400E',
  error: '#DC2626',
  errorBg: '#FEE2E2',
  errorText: '#991B1B',
};

export const shadow = {
  sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 10px 24px rgba(0,0,0,0.10)',
};

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  full: '9999px',
};

export const card = {
  backgroundColor: colors.bgCard,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.lg,
  boxShadow: shadow.sm,
  padding: '1.5rem',
};

export const badge = (variant = 'default') => {
  const variants = {
    default: { bg: '#EFF6FF', color: colors.primary },
    success: { bg: colors.successBg, color: colors.successText },
    warning: { bg: colors.warningBg, color: colors.warningText },
    error: { bg: colors.errorBg, color: colors.errorText },
    muted: { bg: '#F1F5F9', color: colors.textSecondary },
  };
  const v = variants[variant] || variants.default;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.75rem',
    borderRadius: radius.full,
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: v.bg,
    color: v.color,
  };
};

export const btn = {
  primary: {
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.sm,
    padding: '0.625rem 1.25rem',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  accent: {
    backgroundColor: colors.accent,
    color: 'white',
    border: 'none',
    borderRadius: radius.sm,
    padding: '0.625rem 1.25rem',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    padding: '0.625rem 1.25rem',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
  },
  danger: {
    backgroundColor: colors.error,
    color: 'white',
    border: 'none',
    borderRadius: radius.sm,
    padding: '0.625rem 1.25rem',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
};

export const input = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  fontSize: '14px',
  border: `1.5px solid ${colors.border}`,
  borderRadius: radius.sm,
  backgroundColor: colors.bgCard,
  color: colors.text,
  outline: 'none',
  transition: 'border-color 0.15s',
};
