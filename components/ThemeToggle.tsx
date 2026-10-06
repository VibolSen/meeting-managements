"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    setIsDark(isCurrentlyDark);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ dark: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.dark === "boolean") {
        setIsDark(customEvent.detail.dark);
      }
    };

    window.addEventListener("theme-change", handleThemeChange);
    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("mms-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("mms-theme", "light");
    }
    window.dispatchEvent(
      new CustomEvent("theme-change", { detail: { dark: nextDark } })
    );
  };

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all cursor-pointer border flex items-center justify-center ${
        isDark
          ? "bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800 shadow-xs"
          : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
