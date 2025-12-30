import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { saveMoodCheckin, MoodType } from "../../services/moodTracking";

interface EndSessionCheckinModalProps {
  visible: boolean;
  onClose: () => void;
  onNextSession?: () => void;
  onBackToToday: () => void;
  hasNextSession?: boolean;
  context?: { programId?: string; dayNumber?: number };
}

type MoodOption = {
  mood: MoodType;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  label: string;
  description: string;
};

const MOOD_OPTIONS: MoodOption[] = [
  {
    mood: "Relaxed",
    icon: "leaf",
    color: "#10B981",
    bgColor: "rgba(16,185,129,0.15)",
    label: "Relaxed",
    description: "Calm and centered",
  },
  {
    mood: "Energized",
    icon: "flash",
    color: "#F59E0B",
    bgColor: "rgba(245,158,11,0.15)",
    label: "Energized",
    description: "Full of energy",
  },
  {
    mood: "Neutral",
    icon: "remove-circle",
    color: "#6B7280",
    bgColor: "rgba(107,116,128,0.15)",
    label: "Neutral",
    description: "Balanced and steady",
  },
  {
    mood: "Tired",
    icon: "moon",
    color: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.15)",
    label: "Tired",
    description: "Ready to rest",
  },
];

export default function EndSessionCheckinModal({
  visible,
  onClose,
  onNextSession,
  onBackToToday,
  hasNextSession = false,
  context,
}: EndSessionCheckinModalProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [saving, setSaving] = useState(false);

  const handleMoodSelect = async (mood: MoodType) => {
    setSelectedMood(mood);
    setSaving(true);

    try {
      await saveMoodCheckin(mood, context);
    } catch (error) {
      console.error("Failed to save mood:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleNextSession = () => {
    if (onNextSession) {
      onNextSession();
    }
    resetAndClose();
  };

  const handleBackToToday = () => {
    onBackToToday();
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedMood(null);
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      <Pressable style={styles.backdrop} onPress={resetAndClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Completion Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={64} color="#5B8C6A" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Practice Complete! 🙏</Text>
          <Text style={styles.subtitle}>How are you feeling right now?</Text>

          {/* Mood Options */}
          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map((option) => {
              const isSelected = selectedMood === option.mood;
              return (
                <TouchableOpacity
                  key={option.mood}
                  style={[
                    styles.moodCard,
                    { backgroundColor: option.bgColor },
                    isSelected && styles.moodCardSelected,
                    isSelected && { borderColor: option.color },
                  ]}
                  onPress={() => handleMoodSelect(option.mood)}
                  activeOpacity={0.7}
                  disabled={saving}
                >
                  <Ionicons
                    name={option.icon}
                    size={32}
                    color={option.color}
                  />
                  <Text style={[styles.moodLabel, { color: option.color }]}>
                    {option.label}
                  </Text>
                  <Text style={styles.moodDescription}>{option.description}</Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Buttons */}
          {selectedMood && !saving && (
            <View style={styles.actions}>
              {hasNextSession && onNextSession ? (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleNextSession}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>Continue to Next Session</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[
                  hasNextSession ? styles.secondaryBtn : styles.primaryBtn,
                ]}
                onPress={handleBackToToday}
                activeOpacity={0.8}
              >
                <Text
                  style={
                    hasNextSession
                      ? styles.secondaryBtnText
                      : styles.primaryBtnText
                  }
                >
                  {hasNextSession ? "Back to Today" : "Back to Dashboard"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Skip Link */}
          {!selectedMood && (
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={resetAndClose}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const { width } = Dimensions.get("window");
const isSmallScreen = width < 375;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },

  // Icon
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(91,140,106,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Title
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },

  // Mood Grid
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: isSmallScreen ? 10 : 12,
    marginBottom: 24,
    width: "100%",
  },
  moodCard: {
    width: isSmallScreen ? "47%" : "48%",
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  moodCardSelected: {
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 4,
  },
  moodDescription: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    textAlign: "center",
  },
  selectedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#5B8C6A",
    alignItems: "center",
    justifyContent: "center",
  },

  // Actions
  actions: {
    width: "100%",
    gap: 10,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "#5B8C6A",
    shadowColor: "#5B8C6A",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.1)",
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#475569",
  },

  // Skip
  skipBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
  },
});
