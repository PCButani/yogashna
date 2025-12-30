/**
 * Abhyāsa Plan Card Component
 * Displays user's personalized yoga practice plan
 * Shows: Focus, Goals, Level, Session Length, Preferred Time
 */

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type {
  PracticePreferences,
  WellnessFocus,
  PracticeLevel,
  SessionLength,
  BestTime,
} from "../services/PracticePreferences";

interface AbhyasaPlanCardProps {
  preferences: PracticePreferences;
}

export default function AbhyasaPlanCard({ preferences }: AbhyasaPlanCardProps) {
  const { focus, goals, level, length, time } = preferences;

  // Helper to get icon for focus category
  const getFocusIcon = (category: WellnessFocus) => {
    switch (category) {
      case "Health Support":
        return "heart-pulse" as const;
      case "Lifestyle & Habits":
        return "calendar" as const;
      case "Fitness & Flexibility":
        return "dumbbell" as const;
      case "Beginners & Mindfulness":
        return "leaf" as const;
      case "Office Yoga":
        return "laptop" as const;
      default:
        return "compass" as const;
    }
  };

  // Helper to get time icon
  const getTimeIcon = (timePreference: BestTime) => {
    switch (timePreference) {
      case "Morning":
        return "sunny";
      case "Evening":
        return "moon";
      default:
        return "time";
    }
  };

  // Helper to format session length
  const formatLength = (len: SessionLength): string => {
    switch (len) {
      case "Quick":
        return "10 min";
      case "Balanced":
        return "20 min";
      case "Deep":
        return "30 min";
      default:
        return "20 min";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="compass-outline" size={20} color="#16A34A" />
          <Text style={styles.headerTitle}>My Yoga Abhyāsa</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Focus Category */}
        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: "#F0FDF4" }]}>
            <MaterialCommunityIcons
              name={getFocusIcon(focus)}
              size={18}
              color="#16A34A"
            />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.label}>Focus</Text>
            <Text style={styles.value}>{focus ?? "General Wellness"}</Text>
          </View>
        </View>

        {/* Goals */}
        {goals && goals.length > 0 && (
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="flag" size={16} color="#F59E0B" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Goals</Text>
              <View style={styles.goalsWrap}>
                {goals.slice(0, 2).map((goal, idx) => (
                  <View key={idx} style={styles.goalPill}>
                    <Text style={styles.goalText}>{goal}</Text>
                  </View>
                ))}
                {goals.length > 2 && (
                  <Text style={styles.moreGoals}>+{goals.length - 2} more</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Level & Length */}
        <View style={styles.rowDouble}>
          <View style={styles.rowHalf}>
            <View style={[styles.iconCircle, { backgroundColor: "#DBEAFE" }]}>
              <MaterialCommunityIcons name="chart-line" size={16} color="#3B82F6" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Level</Text>
              <Text style={styles.value}>{level ?? "Beginner"}</Text>
            </View>
          </View>

          <View style={styles.rowHalf}>
            <View style={[styles.iconCircle, { backgroundColor: "#FCE7F3" }]}>
              <Ionicons name="time-outline" size={16} color="#EC4899" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Session</Text>
              <Text style={styles.value}>{formatLength(length)}</Text>
            </View>
          </View>
        </View>

        {/* Preferred Time */}
        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name={getTimeIcon(time)} size={16} color="#F59E0B" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.label}>Preferred Time</Text>
            <Text style={styles.value}>{time ?? "Anytime"}</Text>
          </View>
        </View>
      </View>

      {/* Footer Note */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your daily practice is personalized based on these preferences
        </Text>
      </View>
    </View>
  );
}

const shadow = Platform.select({
  android: { elevation: 2 },
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  default: {},
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    ...shadow,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginLeft: 8,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },

  content: {
    gap: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  rowDouble: {
    flexDirection: "row",
    gap: 12,
  },

  rowHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  rowContent: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 3,
  },

  value: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  goalsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },

  goalPill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  goalText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
  },

  moreGoals: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    alignSelf: "center",
    marginLeft: 4,
  },

  footer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },

  footerText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    lineHeight: 16,
    textAlign: "center",
  },
});
