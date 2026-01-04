import React, { useState } from "react";
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
import {
  useSignupOnboarding,
  PracticeLevel,
} from "../../data/onboarding/SignupOnboardingContext";
import { updateProfile } from "../../services/api";
import { auth } from "../../config/firebase";

type SelectVariant = "grid" | "pill";

type CardProps = {
  title: string;
  subtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  variant?: SelectVariant;
  disabled?: boolean;
};

function SelectCard({
  title,
  subtitle,
  iconName,
  selected,
  onPress,
  variant = "grid",
  disabled = false,
}: CardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.cardBase,
        variant === "grid" ? styles.cardGrid : styles.cardPill,
        selected ? styles.cardSelected : styles.cardUnselected,
        disabled && styles.cardDisabled,
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
          <Ionicons
            name={iconName}
            size={20}
            color={selected ? "#1F6F57" : "#4B5563"}
          />
        </View>

        {selected ? (
          <Ionicons name="checkmark-circle" size={22} color="#2E6B4F" />
        ) : (
          <View style={{ width: 22, height: 22 }} />
        )}
      </View>

      <Text style={[styles.cardTitle, selected && styles.cardTitleSelected]}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={[styles.cardSub, selected && styles.cardSubSelected]}>
          {subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function PersonalizePracticeScreen() {
  const navigation = useNavigation<any>();
  const { data, setLevel, setLength, setTime } = useSignupOnboarding();
  const [loading, setLoading] = useState(false);

  const canContinue = !!data.level && !!data.length && !!data.time;

  const handleContinue = async () => {
    if (!canContinue || loading) return;

    setLoading(true);

    try {
      // Map UI values to backend format (lowercase)
      const sessionLength = data.length?.toLowerCase(); // "Quick" → "quick"
      const preferredTime = data.time?.toLowerCase(); // "Morning" → "morning"
      const experienceLevel = data.level?.toLowerCase(); // "Beginner" → "beginner"

      // Call backend API
      await updateProfile({
        preferences: {
          sessionLength,
          preferredTime,
          experienceLevel,
        },
      });

      console.log("✅ Practice preferences saved");

      // Navigate to next screen (PlanSummary)
      navigation.navigate("PlanSummary");
    } catch (error: any) {
      console.error("❌ Failed to save practice preferences:", error);

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
        "Unable to save your preferences. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Personalize your practice</Text>
            <Text style={styles.subtitle}>
              Tell us what feels right for you — we'll tailor the plan.
            </Text>
          </View>

          {/* Experience */}
          <Text style={styles.sectionTitle}>Your experience level</Text>
          <View style={styles.grid3}>
            <SelectCard
              title="Beginner"
              subtitle="0–1 year"
              iconName="sparkles-outline"
              selected={data.level === "Beginner"}
              onPress={() => !loading && setLevel("Beginner" as PracticeLevel)}
              variant="grid"
              disabled={loading}
            />
            <SelectCard
              title="Intermediate"
              subtitle="1–3 years"
              iconName="trending-up-outline"
              selected={data.level === "Intermediate"}
              onPress={() => !loading && setLevel("Intermediate" as PracticeLevel)}
              variant="grid"
              disabled={loading}
            />
            <SelectCard
              title="Expert"
              subtitle="3+ years"
              iconName="ribbon-outline"
              selected={data.level === "Expert"}
              onPress={() => !loading && setLevel("Expert" as PracticeLevel)}
              variant="grid"
              disabled={loading}
            />
          </View>

          {/* Session Length */}
          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
            Preferred session length
          </Text>
          <View style={styles.grid3}>
            <SelectCard
              title="Quick"
              subtitle="5–7 min"
              iconName="flash-outline"
              selected={data.length === "Quick"}
              onPress={() => !loading && setLength("Quick")}
              variant="pill"
              disabled={loading}
            />
            <SelectCard
              title="Balanced"
              subtitle="12–20 min"
              iconName="time-outline"
              selected={data.length === "Balanced"}
              onPress={() => !loading && setLength("Balanced")}
              variant="pill"
              disabled={loading}
            />
            <SelectCard
              title="Deep"
              subtitle="25–30 min"
              iconName="infinite-outline"
              selected={data.length === "Deep"}
              onPress={() => !loading && setLength("Deep")}
              variant="pill"
              disabled={loading}
            />
          </View>

          {/* Best Time */}
          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
            Best time to practice
          </Text>
          <View style={styles.grid3}>
            <SelectCard
              title="Morning"
              subtitle="6–8 AM"
              iconName="sunny-outline"
              selected={data.time === "Morning"}
              onPress={() => !loading && setTime("Morning")}
              variant="pill"
              disabled={loading}
            />
            <SelectCard
              title="Evening"
              subtitle="6–8 PM"
              iconName="moon-outline"
              selected={data.time === "Evening"}
              onPress={() => !loading && setTime("Evening")}
              variant="pill"
              disabled={loading}
            />
            <SelectCard
              title="Anytime"
              subtitle="Flexible"
              iconName="calendar-outline"
              selected={data.time === "Anytime"}
              onPress={() => !loading && setTime("Anytime")}
              variant="pill"
              disabled={loading}
            />
          </View>

          <View style={{ height: 18 }} />
        </ScrollView>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!canContinue || loading}
          style={[styles.cta, (!canContinue || loading) && styles.ctaDisabled]}
          onPress={handleContinue}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.ctaText}>Continue</Text>
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
  scroll: {
    paddingBottom: 10,
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

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
    marginTop: 6,
  },

  grid3: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  cardBase: {
    borderRadius: 18,
    padding: 14,
    minHeight: 102,
    borderWidth: 1,
  },
  cardGrid: {
    width: "32%",
  },
  cardPill: {
    width: "32%",
  },

  cardUnselected: {
    backgroundColor: "#F7FAF8",
    borderColor: "#E6EFE9",
  },
  cardSelected: {
    backgroundColor: "#EAF6F0",
    borderColor: "#BFDCCF",
  },
  cardDisabled: {
    opacity: 0.6,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapSelected: {
    backgroundColor: "rgba(46, 107, 79, 0.10)",
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  cardTitleSelected: {
    color: "#1F6F57",
  },

  cardSub: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7478",
    textAlign: "center",
    marginTop: 6,
  },
  cardSubSelected: {
    color: "#2E6B4F",
  },

  cta: {
    backgroundColor: "#E2B46B",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
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
