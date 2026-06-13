import { useState, useCallback, useEffect, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
}

const icons: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

const colors: Record<ToastType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-sky-500',
};

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), duration);
  }, [duration]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return { toast, showToast, setToast };
}

export function Toast({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-medium transition-all duration-300 max-w-md ${colors[toast.type]}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg" aria-hidden="true">{icons[toast.type]}</span>
        <span>{toast.message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white/80 hover:text-white focus:outline-none"
          aria-label="关闭通知"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
