import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSignupOnboarding } from "../../data/onboarding/SignupOnboardingContext";

const HERO_IMG =
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80";

const CW_1 =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80";
const CW_2 =
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80";

export default function TodayScreen() {
  const onboarding = useSignupOnboarding() as any;

  const focus =
    onboarding?.state?.wellnessFocus ??
    onboarding?.wellnessFocus ??
    "Wellness";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning 🌿</Text>
          <Text style={styles.subGreeting}>
            Let’s take care of your body and mind today
          </Text>
        </View>

        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <Image source={{ uri: HERO_IMG }} style={styles.heroImg} />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            {/* Chips */}
            <View style={styles.heroChipsRow}>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>{focus}</Text>
              </View>
              <View style={styles.heroChipLight}>
                <Text style={styles.heroChipLightText}>Beginner</Text>
              </View>
            </View>

            {/* Text */}
            <View>
              <Text style={styles.heroTitle}>Today’s Practice</Text>
              <Text style={styles.heroMeta}>
                12 min Back Stretch + 5 min Breathing
              </Text>
              <Text style={styles.heroMetaSub}>
                Total: 17 min • Gentle pace
              </Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.heroCta}
              onPress={() => console.log("Play today’s video")}
            >
              <Text style={styles.heroCtaText}>Start Practice</Text>
            </TouchableOpacity>

            {/* Secondary */}
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.changePlan}>Change Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CONTINUE WATCHING */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Watching</Text>
            <Ionicons name="chevron-forward" size={18} color="#9AA3A7" />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cwList}
          >
            <ContinueCard
              image={CW_1}
              title="Morning Stretch"
              sub="6 min left"
              progress={0.25}
            />
            <ContinueCard
              image={CW_2}
              title="Evening Wind Down"
              sub="13 min left"
              progress={0.45}
            />
          </ScrollView>
        </View>

        {/* QUICK ACCESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>

          <View style={styles.quickGrid}>
            <QuickCard icon="yoga" title="Yoga" sub="Quick flows" />
            <QuickCard icon="weather-windy" title="Breathing" sub="Calm & focus" />
            <QuickCard icon="meditation" title="Meditation" sub="Relax mind" />
            <QuickCard icon="briefcase-outline" title="Office Reset" sub="Neck & back" />
          </View>
        </View>

        {/* PROGRESS SNAPSHOT */}
        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <Ionicons name="flame" size={26} color="#2E6B4F" />
            <Text style={styles.progressValue}>4</Text>
            <Text style={styles.progressLabel}>Day Streak</Text>
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>68</Text>
            <Text style={styles.progressLabel}>Minutes this week</Text>
          </View>
        </View>

        <Text style={styles.progressNote}>
          You’ve shown up consistently 🌱
        </Text>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Components ---------- */

function ContinueCard({
  image,
  title,
  sub,
  progress,
}: {
  image: string;
  title: string;
  sub: string;
  progress: number;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.cwCard}>
      <View style={styles.cwMedia}>
        <Image source={{ uri: image }} style={styles.cwImg} />
        <View style={styles.cwPlay}>
          <Ionicons name="play" size={18} color="#2E6B4F" />
        </View>
        <View style={styles.cwProgressTrack}>
          <View style={[styles.cwProgressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
      <Text style={styles.cwTitle}>{title}</Text>
      <Text style={styles.cwSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

function QuickCard({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.quickCard}>
      <View style={styles.quickIconWrap}>
        <MaterialCommunityIcons name={icon as any} size={22} color="#2E6B4F" />
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { paddingHorizontal: 18, paddingTop: 10 },

  header: { marginBottom: 14 },
  greeting: { fontSize: 26, fontWeight: "800", color: "#111" },
  subGreeting: { marginTop: 6, fontSize: 14, color: "#6B7478" },

  heroCard: {
    height: 230,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 22,
  },
  heroImg: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: "space-between",
  },
  heroChipsRow: { flexDirection: "row", gap: 8 },
  heroChip: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroChipText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  heroChipLight: {
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroChipLightText: { color: "#333", fontSize: 12, fontWeight: "700" },

  heroTitle: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  heroMeta: { color: "#FFF", fontSize: 15, marginTop: 6 },
  heroMetaSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginTop: 4,
  },
  heroCta: {
    backgroundColor: "#E2B46B",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  heroCtaText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  changePlan: {
    marginTop: 6,
    textAlign: "center",
    color: "#F3E1C2",
    fontWeight: "700",
    fontSize: 13,
  },

  section: { marginBottom: 22 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111" },

  cwList: { paddingRight: 10 },
  cwCard: { width: 170, marginRight: 14 },
  cwMedia: {
    height: 110,
    borderRadius: 18,
    overflow: "hidden",
  },
  cwImg: { width: "100%", height: "100%" },
  cwPlay: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -19 }, { translateY: -19 }],
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  cwProgressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  cwProgressFill: {
    height: "100%",
    backgroundColor: "#2E6B4F",
  },
  cwTitle: { marginTop: 10, fontWeight: "800" },
  cwSub: { fontSize: 12, color: "#8A9498" },

  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 as any },
  quickCard: {
    width: "48%",
    backgroundColor: "#EAF6F0",
    borderRadius: 18,
    padding: 14,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6F2EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickTitle: { fontSize: 16, fontWeight: "800" },
  quickSub: { fontSize: 13, color: "#6F7B80" },

  progressCard: {
    backgroundColor: "#EAF6F0",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressItem: { alignItems: "center" },
  progressValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2E6B4F",
    marginTop: 6,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5C666A",
  },
  progressNote: {
    marginTop: 10,
    textAlign: "center",
    color: "#6F7B80",
    fontSize: 13,
  },
});
