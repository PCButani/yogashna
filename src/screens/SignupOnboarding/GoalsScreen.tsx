import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSignupOnboarding } from "../../data/onboarding/SignupOnboardingContext";
import { updateProfile } from "../../services/api";
import { auth } from "../../config/firebase";
import { getWellnessGoalCode } from "../../constants/wellnessTags";

const GOALS_BY_FOCUS: Record<string, string[]> = {
  "Health Support": [
    "Back Pain Relief",
    "Stress Relief",
    "Diabetes Support",
    "PCOS Balance",
    "Thyroid Support",
    "Better Sleep",
  ],
  "Lifestyle & Habits": [
    "Daily Routine",
    "Better Sleep",
    "Mindful Living",
    "Discipline & Consistency",
    "Energy Boost",
  ],
  "Fitness & Flexibility": [
    "Weight Loss",
    "Strength Building",
    "Flexibility",
    "Posture सुधार",
    "Core Stability",
  ],
  "Beginners & Mindfulness": [
    "Beginner Friendly",
    "Breathing Practice",
    "Calm Mind",
    "Anxiety Relief",
    "Focus & Clarity",
  ],
  "Office Yoga": [
    "Neck & Shoulder Relief",
    "Back Release",
    "Desk Stretching",
    "Stress Relief",
    "Energy at Work",
  ],
};

export default function GoalsScreen() {
  const navigation = useNavigation<any>();
  const { data, toggleGoal } = useSignupOnboarding();
  const [loading, setLoading] = useState(false);

  const goals = useMemo(() => {
    if (!data.focus) return [];
    return GOALS_BY_FOCUS[data.focus] || [];
  }, [data.focus]);

  const selectedCount = data.goals.length;
  const canContinue = selectedCount >= 2 && selectedCount <= 5;

  const remaining = Math.max(0, 2 - selectedCount);

  const helperText = canContinue
    ? "Nice choices — you're on track."
    : remaining > 0
    ? `Select ${remaining} more goal${remaining === 1 ? "" : "s"} to continue.`
    : "You can select up to 5 goals.";

  const ctaText = canContinue
    ? "Continue"
    : remaining > 0
    ? `Select ${remaining} more`
    : "Max 5 selected";

  const handleGoalPress = (goal: string) => {
    if (loading) return;

    const isSelected = data.goals.includes(goal);
    const wouldExceedMax = !isSelected && selectedCount >= 5;

    if (wouldExceedMax) {
      return;
    }

    toggleGoal(goal);
  };

  const onContinue = async () => {
    if (!canContinue || loading) return;

    setLoading(true);

    try {
      // Send the FIRST selected goal as the primary goal
      // TODO (Phase 3+): Persist multi-goal selections once DB supports it.
      const primaryGoalDisplayName = data.goals[0];

      // Convert display name to tag code (requires wellness focus context)
      const primaryGoalCode = getWellnessGoalCode(primaryGoalDisplayName, data.focus);
      if (!primaryGoalCode) {
        throw new Error("Invalid primary goal selection");
      }

      await updateProfile({
        primaryGoalId: primaryGoalCode, // Send tag code (e.g., "reduce_back_pain")
      });

      console.log("✅ Primary goal saved:", primaryGoalCode);

      // Navigate to next screen
      navigation.navigate("AboutYou");
    } catch (error: any) {
      console.error("❌ Failed to save goal:", error);

      // Handle 401 Unauthorized
      if (error.message?.includes("Unauthorized")) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            {
              text: "OK",
              onPress: async () => {
                await auth.signOut();
                navigation.replace("AuthEntry", { mode: "login" });
              },
            },
          ]
        );
        return;
      }

      // Handle other errors
      Alert.alert(
        "Connection Error",
        "Unable to save your selection. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose your goals</Text>
          <Text style={styles.subtitle}>
            Select 2 to 5 goals so we can personalize your practice
          </Text>

          <View style={styles.helperRow}>
            <Ionicons
              name={canContinue ? "checkmark-circle" : "information-circle-outline"}
              size={16}
              color={canContinue ? "#2E6B4F" : "#8A9498"}
            />
            <Text style={[styles.helper, canContinue && styles.helperGood]}>
              {helperText}
            </Text>
          </View>
        </View>

        {/* List */}
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {goals.map((g) => {
            const selected = data.goals.includes(g);

            return (
              <TouchableOpacity
                key={g}
                activeOpacity={0.9}
                onPress={() => handleGoalPress(g)}
                disabled={loading}
                style={[
                  styles.goalCard,
                  selected && styles.goalCardSelected,
                  loading && styles.goalCardDisabled,
                ]}
              >
                <Text
                  style={[styles.goalText, selected && styles.goalTextSelected]}
                  numberOfLines={1}
                >
                  {g}
                </Text>

                {/* Right check */}
                <View style={[styles.checkWrap, selected && styles.checkWrapSelected]}>
                  {selected ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="add" size={16} color="#7D878B" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 18 }} />
        </ScrollView>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!canContinue || loading}
          style={[styles.cta, (!canContinue || loading) && styles.ctaDisabled]}
          onPress={onContinue}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.ctaText}>{ctaText}</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 10 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  header: {
    paddingTop: 8,
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7478",
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8 as any,
    marginTop: 10,
  },
  helper: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8A9498",
  },
  helperGood: {
    color: "#2E6B4F",
  },

  list: {
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },

  goalCard: {
    backgroundColor: "#F7FAF8",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E6EFE9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalCardSelected: {
    backgroundColor: "#EAF6F0",
    borderColor: "#BFDCCF",
  },
  goalCardDisabled: {
    opacity: 0.6,
  },
  goalText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    paddingRight: 10,
  },
  goalTextSelected: {
    color: "#1F6F57",
  },

  checkWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EEF2F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E3E8EA",
  },
  checkWrapSelected: {
    backgroundColor: "#2E6B4F",
    borderColor: "#2E6B4F",
  },

  cta: {
    backgroundColor: "#E2B46B",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  ctaDisabled: {
    opacity: 0.45,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
