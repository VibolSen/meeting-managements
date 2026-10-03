"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast("success", title, message),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast("error", title, message),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast("warning", title, message),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast("info", title, message),
    [showToast]
  );

  const contextValue = useMemo(
    () => ({ showToast, success, error, warning, info }),
    [showToast, success, error, warning, info]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl shadow-slate-900/10 border backdrop-blur-xl ${
                toast.type === "success"
                  ? "bg-white/95 border-emerald-200 text-emerald-700"
                  : toast.type === "error"
                  ? "bg-white/95 border-rose-200 text-rose-700"
                  : toast.type === "warning"
                  ? "bg-white/95 border-amber-200 text-amber-700"
                  : "bg-white/95 border-indigo-200 text-indigo-700"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-600" />}
                {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-indigo-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 leading-tight">{toast.title}</h4>
                {toast.message && (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
