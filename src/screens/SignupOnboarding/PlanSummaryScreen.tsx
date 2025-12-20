import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useSignupOnboarding } from "../../data/onboarding/SignupOnboardingContext";

export default function PlanSummaryScreen({ navigation }: any) {
  const { data } = useSignupOnboarding();

  const title = data.time ? `${data.time} Energy Flow` : "Your Daily Flow";
  const metaLeft = data.length || "—";
  const metaRight = data.level || "—";
  const focus = data.focus || "—";
  const goals = data.goals || [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.topTitle}>Your Personalized Plan is Ready!</Text>
        <Text style={styles.topSub}>
          Here's what your daily routine will look like
        </Text>

        {/* Summary Card */}
        <View style={styles.card}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=60",
            }}
            style={styles.hero}
          />

          <View style={styles.cardBody}>
            <Text style={styles.flowTitle}>{title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>⏱ {metaLeft}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaText}>{metaRight}</Text>
            </View>

            <View style={styles.chipRow}>
              <View style={styles.focusChip}>
                <Text style={styles.focusChipText}>{focus}</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Your Goals:</Text>

            <View style={styles.goalChipsWrap}>
              {goals.length === 0 ? (
                <Text style={styles.emptyText}>No goals selected</Text>
              ) : (
                goals.map((g: string) => (
                  <View key={g} style={styles.goalChip}>
                    <Text style={styles.goalChipText}>{g}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        <Text style={styles.centerNote}>
          Designed to match your goals and preferences 🌿
        </Text>

        <Text style={styles.routineTitle}>Your Daily Routine</Text>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryBtn}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            })  
          }
        >
          <Text style={styles.primaryBtnText}>Go to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("WellnessFocus")}
        >
          <Text style={styles.secondaryLink}>Edit Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },

  topTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
    marginTop: 10,
  },
  topSub: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#6B7280",
    marginTop: 10,
    marginBottom: 18,
  },

  card: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  hero: {
    width: "100%",
    height: 220,
    backgroundColor: "#E5E7EB",
  },

  cardBody: {
    padding: 18,
  },

  flowTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  dot: {
    color: "#9CA3AF",
    fontWeight: "900",
  },

  chipRow: { flexDirection: "row", marginBottom: 16 },
  focusChip: {
    backgroundColor: "#E6F4EE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  focusChipText: {
    color: "#1F6F57",
    fontWeight: "800",
    fontSize: 13,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 10,
  },

  goalChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  goalChip: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  goalChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
  },
  emptyText: { color: "#9CA3AF", fontWeight: "600" },

  centerNote: {
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 18,
  },

  routineTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 18,
  },

  primaryBtn: {
    backgroundColor: "#D9A44B",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  secondaryLink: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "800",
    color: "#6B7280",
  },
});
