/**
 * DayCard Component
 * Standardized day-wise program card UI used across the app
 * Based on the clean, guided design from Program Progress screen
 *
 * Features:
 * - Day header with icon, title, duration, and session count
 * - Status pill (Up Next, Completed, Locked)
 * - Session list with individual session tiles
 * - "Play Full Day" CTA button
 * - Individual sessions are tappable
 * - State-based styling (current/completed/locked)
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type DayCardStatus = "upNext" | "completed" | "locked" | "partial";

export type DayCardSession = {
  id: string;
  title: string;
  durationMin: number;
  style?: string;
  sequenceType?: "warmup" | "main" | "cooldown";
  completed?: boolean;
};

export type DayCardProps = {
  dayNumber: number;
  dayTitle?: string; // Optional custom title (e.g., "Foundation")
  sessions: DayCardSession[];
  status: DayCardStatus;
  completedSessionsCount?: number; // For partial status
  onPlayDay: () => void;
  onPlaySession: (sessionIndex: number) => void;
  showPlayButton?: boolean; // Default true, can be hidden for locked days
};

export default function DayCard({
  dayNumber,
  dayTitle,
  sessions,
  status,
  completedSessionsCount = 0,
  onPlayDay,
  onPlaySession,
  showPlayButton = true,
}: DayCardProps) {

  const totalDuration = useMemo(() => {
    return sessions.reduce((sum, s) => sum + s.durationMin, 0);
  }, [sessions]);

  const isLocked = status === "locked";
  const isCurrent = status === "upNext";
  const isCompleted = status === "completed";
  const isPartial = status === "partial";

  const canPlay = !isLocked;

  // Determine status pill text and style
  const statusPillText = isCompleted
    ? "Completed"
    : isPartial
    ? `${completedSessionsCount} / ${sessions.length} completed`
    : isCurrent
    ? "Up Next"
    : "Locked";

  return (
    <View
      style={[
        styles.dayCard,
        isCurrent && styles.dayCardCurrent,
        isLocked && styles.dayCardLocked,
      ]}
    >
      {/* Day Header */}
      <View style={styles.dayHeader}>
        <View style={styles.dayHeaderLeft}>
          <Ionicons
            name={
              isCompleted
                ? "checkmark-circle"
                : isPartial
                ? "checkmark-circle-outline"
                : isCurrent
                ? "arrow-forward-circle"
                : "lock-closed"
            }
            size={24}
            color={isLocked ? "#9CA3AF" : "#2E6B4F"}
          />
          <View style={styles.dayHeaderText}>
            <Text style={styles.dayNumber}>
              Day {dayNumber}
              {dayTitle ? ` - ${dayTitle}` : ""}
            </Text>
            <Text style={styles.dayDuration}>
              {totalDuration} min total • {sessions.length} session
              {sessions.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Status Pill */}
        <View
          style={[
            styles.statusPill,
            isCompleted && styles.statusPillCompleted,
            isPartial && styles.statusPillPartial,
            isCurrent && !isPartial && styles.statusPillCurrent,
            isLocked && styles.statusPillLocked,
          ]}
        >
          <Text style={styles.statusPillText}>{statusPillText}</Text>
        </View>
      </View>

      {/* Session List */}
      <View style={styles.sessionsWrap}>
        {sessions.map((session, idx) => {
          const sessionCompleted = session.completed || isCompleted;

          return (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionTile,
                sessionCompleted && styles.sessionTileCompleted,
              ]}
              onPress={() => onPlaySession(idx)}
              disabled={isLocked}
              activeOpacity={0.7}
            >
              <View style={styles.sessionIcon}>
                <Ionicons
                  name={
                    sessionCompleted ? "checkmark-circle" : "play-circle-outline"
                  }
                  size={20}
                  color={
                    isLocked ? "#D1D5DB" : sessionCompleted ? "#2E6B4F" : "#2E6B4F"
                  }
                />
              </View>
              <View style={styles.sessionInfo}>
                <Text
                  style={[
                    styles.sessionTitle,
                    isLocked && styles.sessionTitleLocked,
                  ]}
                  numberOfLines={1}
                >
                  {session.title}
                </Text>
                <View style={styles.sessionMeta}>
                  <Text style={styles.sessionMetaText}>
                    {session.durationMin} min
                  </Text>
                  {session.style && (
                    <>
                      <View style={styles.sessionDot} />
                      <Text style={styles.sessionMetaText}>{session.style}</Text>
                    </>
                  )}
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isLocked ? "#D1D5DB" : "#9CA3AF"}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Play Day Button */}
      {canPlay && showPlayButton && (
        <TouchableOpacity
          style={styles.playDayButton}
          onPress={onPlayDay}
          activeOpacity={0.9}
        >
          <Ionicons name="play" size={16} color="#FFFFFF" />
          <Text style={styles.playDayText}>Play Full Day</Text>
        </TouchableOpacity>
      )}

      {/* Locked Helper */}
      {isLocked && (
        <Text style={styles.lockedHelper}>
          Complete previous sessions to unlock
        </Text>
      )}
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  dayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  dayCardCurrent: {
    borderColor: "#2E6B4F",
    backgroundColor: "#F3FAF6",
  },
  dayCardLocked: {
    opacity: 0.65,
  },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  dayHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  dayHeaderText: {
    flex: 1,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  dayDuration: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },

  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillCompleted: {
    backgroundColor: "#E7F6EC",
    borderColor: "#BFE7CC",
  },
  statusPillPartial: {
    backgroundColor: "#F0F9F5",
    borderColor: "#C6E7D3",
  },
  statusPillCurrent: {
    backgroundColor: "#FFF3E6",
    borderColor: "#F3D3B5",
  },
  statusPillLocked: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },

  sessionsWrap: {
    gap: 8,
    marginBottom: 12,
  },
  sessionTile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sessionTileCompleted: {
    backgroundColor: "#F0F9F5",
    borderColor: "#C6E7D3",
  },
  sessionIcon: {
    marginRight: 10,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sessionTitleLocked: {
    color: "#9CA3AF",
  },
  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionMetaText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  sessionDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },

  playDayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E6B4F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  playDayText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  lockedHelper: {
    fontSize: 11.5,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
  },
});
