import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  useSignupOnboarding,
  PracticeLevel,
} from "../../data/onboarding/SignupOnboardingContext";

type SelectVariant = "grid" | "pill";

type CardProps = {
  title: string;
  subtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  variant?: SelectVariant;
};

function SelectCard({
  title,
  subtitle,
  iconName,
  selected,
  onPress,
  variant = "grid",
}: CardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.cardBase,
        variant === "grid" ? styles.cardGrid : styles.cardPill,
        selected ? styles.cardSelected : styles.cardUnselected,
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

  const canContinue = !!data.level && !!data.length && !!data.time;

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
              Tell us what feels right for you — we’ll tailor the plan.
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
              onPress={() => setLevel("Beginner" as PracticeLevel)}
              variant="grid"
            />
            <SelectCard
              title="Intermediate"
              subtitle="1–3 years"
              iconName="trending-up-outline"
              selected={data.level === "Intermediate"}
              onPress={() => setLevel("Intermediate" as PracticeLevel)}
              variant="grid"
            />
            <SelectCard
              title="Expert"
              subtitle="3+ years"
              iconName="ribbon-outline"
              selected={data.level === "Expert"}
              onPress={() => setLevel("Expert" as PracticeLevel)}
              variant="grid"
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
              onPress={() => setLength("Quick")}
              variant="pill"
            />
            <SelectCard
              title="Balanced"
              subtitle="12–20 min"
              iconName="time-outline"
              selected={data.length === "Balanced"}
              onPress={() => setLength("Balanced")}
              variant="pill"
            />
            <SelectCard
              title="Deep"
              subtitle="25–30 min"
              iconName="infinite-outline"
              selected={data.length === "Deep"}
              onPress={() => setLength("Deep")}
              variant="pill"
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
              onPress={() => setTime("Morning")}
              variant="pill"
            />
            <SelectCard
              title="Evening"
              subtitle="6–8 PM"
              iconName="moon-outline"
              selected={data.time === "Evening"}
              onPress={() => setTime("Evening")}
              variant="pill"
            />
            <SelectCard
              title="Anytime"
              subtitle="Flexible"
              iconName="calendar-outline"
              selected={data.time === "Anytime"}
              onPress={() => setTime("Anytime")}
              variant="pill"
            />
          </View>

          <View style={{ height: 18 }} />
        </ScrollView>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!canContinue}
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={() => navigation.navigate("PlanSummary")}
        >
          <Text style={styles.ctaText}>Continue</Text>
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
    backgroundColor: "#E2B46B", // same saffron as dashboard + focus + goals
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
