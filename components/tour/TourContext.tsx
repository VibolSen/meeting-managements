"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { UserRole } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { TourStep, getStepsForRole } from "./tourSteps";

interface TourContextType {
  isTourActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  totalSteps: number;
  tourRole: UserRole;
  isGuidelinesOpen: boolean;
  guidelinesTab: string;
  hasCompletedTour: boolean;
  startTour: (roleOverride?: UserRole) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: (dontShowAgain?: boolean) => void;
  openGuidelines: (tab?: string) => void;
  closeGuidelines: () => void;
  resetTourSeenStatus: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const effectiveRole: UserRole = user?.role || "ADMIN";

  const [tourRole, setTourRole] = useState<UserRole>(effectiveRole);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState<boolean>(false);
  const [guidelinesTab, setGuidelinesTab] = useState<string>("handbooks");
  const [hasCompletedTour, setHasCompletedTour] = useState<boolean>(true); // default true until hydrated

  // Keep tourRole in sync with signed-in user
  useEffect(() => {
    if (user?.role) {
      setTourRole(user.role);
    }
  }, [user?.role]);

  // Read tour completion status from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`mms_tour_completed_${tourRole}`);
      setHasCompletedTour(stored === "true");
    } catch {
      setHasCompletedTour(false);
    }
  }, [tourRole]);

  const steps = getStepsForRole(tourRole);
  const currentStep = steps[currentStepIndex] || null;
  const totalSteps = steps.length;

  const startTour = useCallback((roleOverride?: UserRole) => {
    const targetRole = roleOverride || user?.role || "ADMIN";
    setTourRole(targetRole);
    setCurrentStepIndex(0);
    setIsGuidelinesOpen(false);
    setIsTourActive(true);
  }, [user?.role]);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < totalSteps - 1) {
        return prev + 1;
      } else {
        // Finished tour
        try {
          localStorage.setItem(`mms_tour_completed_${tourRole}`, "true");
          setHasCompletedTour(true);
        } catch {}
        setIsTourActive(false);
        return prev;
      }
    });
  }, [totalSteps, tourRole]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
    }
  }, [totalSteps]);

  const skipTour = useCallback((dontShowAgain: boolean = true) => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(`mms_tour_completed_${tourRole}`, "true");
        setHasCompletedTour(true);
      } catch {}
    }
    setIsTourActive(false);
    setCurrentStepIndex(0);
  }, [tourRole]);

  const openGuidelines = useCallback((tab: string = "handbooks") => {
    setGuidelinesTab(tab);
    setIsGuidelinesOpen(true);
  }, []);

  const closeGuidelines = useCallback(() => {
    setIsGuidelinesOpen(false);
  }, []);

  const resetTourSeenStatus = useCallback(() => {
    try {
      localStorage.removeItem(`mms_tour_completed_${tourRole}`);
      setHasCompletedTour(false);
    } catch {}
  }, [tourRole]);

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        currentStepIndex,
        currentStep,
        totalSteps,
        tourRole,
        isGuidelinesOpen,
        guidelinesTab,
        hasCompletedTour,
        startTour,
        nextStep,
        prevStep,
        goToStep,
        skipTour,
        openGuidelines,
        closeGuidelines,
        resetTourSeenStatus,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour(): TourContextType {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
