// src/data/mock/progress.ts

import { Achievement, ProgressStats } from "./models";

export const mockProgressStats: ProgressStats = {
  currentStreakDays: 6,
  weeklyMinutes: [
    { label: "Mon", minutes: 22 },
    { label: "Tue", minutes: 18 },
    { label: "Wed", minutes: 0 },
    { label: "Thu", minutes: 25 },
    { label: "Fri", minutes: 15 },
    { label: "Sat", minutes: 28 },
    { label: "Sun", minutes: 12 },
  ],
  totalMinutes: 640,
  sessionsCompleted: 34,
  programsCompleted: 2,
  weeklyInsight: "You’re most consistent on Thu & Sat. Try a 10-min session on Wed to protect your streak.",
};

export const mockAchievements: Achievement[] = [
  {
    id: "a1",
    title: "Sacred Start",
    description: "Complete your first session",
    type: "sessions",
    earned: true,
  },
  {
    id: "a2",
    title: "6-Day Streak",
    description: "Practice 6 days in a row",
    type: "streak",
    earned: true,
  },
  {
    id: "a3",
    title: "300 Minutes",
    description: "Accumulate 300 total minutes",
    type: "minutes",
    earned: true,
  },
  {
    id: "a4",
    title: "3 Programs",
    description: "Finish 3 programs",
    type: "programs",
    earned: false,
  },
];
