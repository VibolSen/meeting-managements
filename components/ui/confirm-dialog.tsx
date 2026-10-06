"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ConfirmVariant = "danger" | "warning" | "primary";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: React.ReactNode;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      iconBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60",
      confirmButton: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500/30",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
      confirmButton: "bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500/30",
    },
    primary: {
      icon: <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60",
      confirmButton: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs focus:ring-indigo-500/30",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/75 backdrop-blur-xs"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-black/60 overflow-hidden z-10 my-8 p-5 sm:p-6"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            {!isLoading && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-start gap-3.5">
              {/* Icon Container */}
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${currentVariant.iconBg}`}
              >
                {currentVariant.icon}
              </div>

              {/* Title & Message */}
              <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {message}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="h-9 px-3.5 text-xs font-semibold"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onConfirm}
                isLoading={isLoading}
                className={`h-9 px-4 text-xs font-semibold cursor-pointer ${currentVariant.confirmButton}`}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
