/**
 * Practice Settings Screen
 * Allows users to update their Yoga Abhyāsa preferences
 * Reuses onboarding UI components for consistency
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  getPracticePreferences,
  savePracticePreferences,
  type PracticePreferences,
  type WellnessFocus,
  type PracticeLevel,
  type SessionLength,
  type BestTime,
} from "../../services/PracticePreferences";

const FOCUS_OPTIONS: WellnessFocus[] = [
  "Health Support",
  "Lifestyle & Habits",
  "Fitness & Flexibility",
  "Beginners & Mindfulness",
  "Office Yoga",
];

const GOAL_OPTIONS: Record<Exclude<WellnessFocus, null>, string[]> = {
  "Health Support": ["Back Pain Relief", "Joint Health", "Chronic Condition Support"],
  "Lifestyle & Habits": ["Better Sleep", "Stress Management", "Energy Boost"],
  "Fitness & Flexibility": ["Strength Building", "Flexibility", "Core Stability"],
  "Beginners & Mindfulness": ["Learn Basics", "Mindfulness Practice", "Gentle Start"],
  "Office Yoga": ["Desk Relief", "Posture Correction", "Break Time Practice"],
};

const LEVEL_OPTIONS: PracticeLevel[] = ["Beginner", "Intermediate", "Expert"];

const LENGTH_OPTIONS: { value: SessionLength; label: string; minutes: string }[] = [
  { value: "Quick", label: "Quick", minutes: "10 min" },
  { value: "Balanced", label: "Balanced", minutes: "20 min" },
  { value: "Deep", label: "Deep", minutes: "30 min" },
];

const TIME_OPTIONS: BestTime[] = ["Morning", "Evening", "Anytime"];

export default function PracticeSettingsScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<PracticePreferences | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getPracticePreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await savePracticePreferences(preferences);
      Alert.alert(
        "Settings Saved",
        "Your practice preferences have been updated successfully.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Failed to save preferences:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateFocus = (focus: WellnessFocus) => {
    setPreferences((prev) =>
      prev ? { ...prev, focus, goals: [] } : prev
    );
  };

  const toggleGoal = (goal: string) => {
    setPreferences((prev) => {
      if (!prev) return prev;
      const exists = prev.goals.includes(goal);
      const goals = exists
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal];
      return { ...prev, goals };
    });
  };

  const updateLevel = (level: PracticeLevel) => {
    setPreferences((prev) => (prev ? { ...prev, level } : prev));
  };

  const updateLength = (length: SessionLength) => {
    setPreferences((prev) => (prev ? { ...prev, length } : prev));
  };

  const updateTime = (time: BestTime) => {
    setPreferences((prev) => (prev ? { ...prev, time } : prev));
  };

  if (loading || !preferences) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const availableGoals = preferences.focus ? GOAL_OPTIONS[preferences.focus] : [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.statusBarSpacer} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Focus Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Category</Text>
          <Text style={styles.sectionSubtitle}>What would you like to focus on?</Text>

          <View style={styles.optionsGrid}>
            {FOCUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionCard,
                  preferences.focus === option && styles.optionCardSelected,
                ]}
                onPress={() => updateFocus(option)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    preferences.focus === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goals */}
        {availableGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            <Text style={styles.sectionSubtitle}>Select one or more goals</Text>

            <View style={styles.goalsList}>
              {availableGoals.map((goal) => {
                const isSelected = preferences.goals.includes(goal);
                return (
                  <TouchableOpacity
                    key={goal}
                    style={[styles.goalPill, isSelected && styles.goalPillSelected]}
                    onPress={() => toggleGoal(goal)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.goalPillText,
                        isSelected && styles.goalPillTextSelected,
                      ]}
                    >
                      {goal}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Experience Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience Level</Text>
          <Text style={styles.sectionSubtitle}>How experienced are you?</Text>

          <View style={styles.optionsRow}>
            {LEVEL_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.levelOption,
                  preferences.level === option && styles.levelOptionSelected,
                ]}
                onPress={() => updateLevel(option)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.levelText,
                    preferences.level === option && styles.levelTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Session Length */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Length</Text>
          <Text style={styles.sectionSubtitle}>How long do you want to practice?</Text>

          <View style={styles.lengthGrid}>
            {LENGTH_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.lengthCard,
                  preferences.length === option.value && styles.lengthCardSelected,
                ]}
                onPress={() => updateLength(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.lengthLabel,
                    preferences.length === option.value && styles.lengthLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.lengthMinutes,
                    preferences.length === option.value && styles.lengthMinutesSelected,
                  ]}
                >
                  {option.minutes}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferred Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Time</Text>
          <Text style={styles.sectionSubtitle}>When do you prefer to practice?</Text>

          <View style={styles.optionsRow}>
            {TIME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.timeOption,
                  preferences.time === option && styles.timeOptionSelected,
                ]}
                onPress={() => updateTime(option)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    option === "Morning"
                      ? "sunny"
                      : option === "Evening"
                      ? "moon"
                      : "time"
                  }
                  size={20}
                  color={preferences.time === option ? "#16A34A" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.timeText,
                    preferences.time === option && styles.timeTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FBFBFB",
  },

  statusBarSpacer: {
    height: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  scrollView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 16,
  },

  optionsGrid: {
    gap: 12,
  },

  optionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  optionCardSelected: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },

  optionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },

  optionTextSelected: {
    color: "#16A34A",
  },

  goalsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  goalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  goalPillSelected: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },

  goalPillText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },

  goalPillTextSelected: {
    color: "#16A34A",
  },

  optionsRow: {
    flexDirection: "row",
    gap: 12,
  },

  levelOption: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  levelOptionSelected: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },

  levelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
  },

  levelTextSelected: {
    color: "#16A34A",
  },

  lengthGrid: {
    flexDirection: "row",
    gap: 12,
  },

  lengthCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  lengthCardSelected: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },

  lengthLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 4,
  },

  lengthLabelSelected: {
    color: "#16A34A",
  },

  lengthMinutes: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  lengthMinutesSelected: {
    color: "#16A34A",
  },

  timeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  timeOptionSelected: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },

  timeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
  },

  timeTextSelected: {
    color: "#16A34A",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },

  saveBtn: {
    backgroundColor: "#E9A46A",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  saveBtnDisabled: {
    opacity: 0.6,
  },

  saveBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFF",
  },
});
