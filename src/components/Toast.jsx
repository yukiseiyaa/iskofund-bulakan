import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';

const ToastCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, leaving: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, duration);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  const toast = {
    success: (msg, dur) => add(msg, 'success', dur),
    error:   (msg, dur) => add(msg, 'error', dur),
    warning: (msg, dur) => add(msg, 'warning', dur),
    info:    (msg, dur) => add(msg, 'info', dur),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function Toast({ toast, onClose }) {
  const configs = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', icon: <CheckCircle2 size={16} color="#16a34a" />, title: 'Success' },
    error:   { bg: '#fef2f2', border: '#fecaca', icon: <XCircle size={16} color="#dc2626" />,     title: 'Error' },
    warning: { bg: '#fffbeb', border: '#fde68a', icon: <AlertTriangle size={16} color="#d97706" />, title: 'Warning' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', icon: <Info size={16} color="#2563eb" />,         title: 'Info' },
  };
  const cfg = configs[toast.type] || configs.info;

  return (
    <div style={{
      pointerEvents: 'all',
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 12,
      padding: '12px 16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      minWidth: 280, maxWidth: 360,
      animation: toast.leaving ? 'slideOut 0.3s ease forwards' : 'slideIn 0.3s ease forwards',
    }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
      <div style={{ flex: 1, fontSize: 13, color: '#0f172a', lineHeight: 1.5 }}>
        {toast.message}
      </div>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#94a3b8', flexShrink: 0 }}
      >
        <X size={13} />
      </button>
    </div>
  );
}
