"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTour } from "./TourContext";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  HelpCircle,
  Compass
} from "lucide-react";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export function InteractiveTour() {
  const {
    isTourActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
  } = useTour();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);
  const [isCentered, setIsCentered] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Update target rect with padding
  const updateTargetPosition = useCallback(() => {
    if (!currentStep) return;

    const element = document.querySelector(currentStep.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 6;
      setTargetRect({
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        bottom: rect.bottom + padding,
        right: rect.right + padding,
      });
      setIsCentered(false);

      // Smooth scroll if element is outside comfortable viewport
      if (rect.top < 80 || rect.bottom > window.innerHeight - 80) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      // Element not found on current viewport -> center the card
      setTargetRect(null);
      setIsCentered(true);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isTourActive) return;

    // Small delay to allow layout animations to settle
    const timeout = setTimeout(updateTargetPosition, 80);

    const handleResize = () => updateTargetPosition();
    const handleScroll = () => updateTargetPosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isTourActive, currentStepIndex, updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTour(dontShowAgain);
      } else if (e.key === "ArrowRight") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTourActive, dontShowAgain, nextStep, prevStep, skipTour]);

  if (!isTourActive || !currentStep) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  // Calculate Tooltip Card Placement Coordinates
  const getCardStyle = (): React.CSSProperties => {
    if (isCentered || !targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        position: "fixed",
      };
    }

    const cardWidth = 360;
    const cardHeight = 220;
    const margin = 14;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = targetRect.bottom + margin;
    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;

    // If bottom overflows, flip above target
    if (top + cardHeight > viewportHeight - 16) {
      top = Math.max(16, targetRect.top - cardHeight - margin);
    }

    // Horizontal bounds
    if (left < 16) left = 16;
    if (left + cardWidth > viewportWidth - 16) {
      left = viewportWidth - cardWidth - 16;
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      position: "fixed",
    };
  };

  return (
    <div className="fixed inset-0 z-[9990] overflow-hidden select-none pointer-events-auto">
      {/* SVG Mask Scrim Spotlight */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White covers all screen */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black hole cuts out target element */}
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="14"
                ry="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Semi-transparent dark background with blur */}
        <rect
          width="100%" height="100%"
          fill="rgba(15, 23, 42, 0.78)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Target Element Pulsing Ring */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-2xl ring-2 ring-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all duration-300 ease-out z-[9991]"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
        >
          {/* Subtle animated border ping */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-indigo-400 animate-ping opacity-40 pointer-events-none" />
        </div>
      )}

      {/* Floating Responsive Tooltip Card */}
      <div
        ref={cardRef}
        style={getCardStyle()}
        className="w-[calc(100vw-32px)] max-w-[370px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 z-[9995] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header: Badge, Step counter, Close */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>{currentStep.roleBadge}</span>
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>

          <button
            type="button"
            onClick={() => skipTour(dontShowAgain)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Skip Tour"
            aria-label="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Title */}
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            {currentStep.title}
          </h3>
        </div>

        {/* Step Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {currentStep.description}
        </p>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? "w-6 bg-indigo-600 dark:bg-indigo-400"
                  : idx < currentStepIndex
                  ? "w-2 bg-indigo-200 dark:bg-indigo-900"
                  : "w-1.5 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Controls & Don't Show Again */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span>Don&apos;t show again</span>
          </label>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all cursor-pointer"
            >
              <span>{isLastStep ? "Complete" : "Next"}</span>
              {isLastStep ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
