import React, { createContext, useContext, useMemo, useState } from "react";

export type WellnessFocus =
  | "Health Support"
  | "Lifestyle & Habits"
  | "Fitness & Flexibility"
  | "Beginners & Mindfulness"
  | "Office Yoga"
  | null;

export type PracticeLevel = "Beginner" | "Intermediate" | "Expert" | null;

export type SessionLength = "Quick" | "Balanced" | "Deep" | null;

export type BestTime = "Morning" | "Evening" | "Anytime" | null;

export type SignupOnboardingData = {
  focus: WellnessFocus;
  goals: string[];
  level: PracticeLevel;
  length: SessionLength;
  time: BestTime;
};

type Ctx = {
  data: SignupOnboardingData;
  setFocus: (v: WellnessFocus) => void;
  toggleGoal: (goal: string) => void;
  setLevel: (v: PracticeLevel) => void;
  setLength: (v: SessionLength) => void;
  setTime: (v: BestTime) => void;
  reset: () => void;
};

const defaultData: SignupOnboardingData = {
  focus: null,
  goals: [],
  level: null,
  length: null,
  time: null,
};

const SignupOnboardingContext = createContext<Ctx | null>(null);

export function SignupOnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SignupOnboardingData>(defaultData);

  const value = useMemo<Ctx>(() => {
    return {
      data,
      setFocus: (v) =>
        setData((prev) => ({
          ...prev,
          focus: v,
          goals: [], // reset goals when focus changes
        })),
      toggleGoal: (goal) =>
        setData((prev) => {
          const exists = prev.goals.includes(goal);
          const goals = exists ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal];
          return { ...prev, goals };
        }),
      setLevel: (v) => setData((prev) => ({ ...prev, level: v })),
      setLength: (v) => setData((prev) => ({ ...prev, length: v })),
      setTime: (v) => setData((prev) => ({ ...prev, time: v })),
      reset: () => setData(defaultData),
    };
  }, [data]);

  return (
    <SignupOnboardingContext.Provider value={value}>
      {children}
    </SignupOnboardingContext.Provider>
  );
}

export function useSignupOnboarding() {
  const ctx = useContext(SignupOnboardingContext);
  if (!ctx) throw new Error("useSignupOnboarding must be used inside SignupOnboardingProvider");
  return ctx;
}
