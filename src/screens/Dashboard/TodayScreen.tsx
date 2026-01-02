import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Routes } from "../../constants/routes";
import type { RootStackParamList } from "../../types/navigation";

import {
  getPracticePreferences,
  type PracticePreferences,
} from "../../services/PracticePreferences";
import { generateTodaysAbhyasa } from "../../services/AbhyasaGenerator";
import { useProgressStore } from "../../store/useProgressStore";
import { useContinueWatchingStore } from "../../store/useContinueWatchingStore";

const { width } = Dimensions.get("window");

/* -------------------- TEMP / VISUAL PLACEHOLDERS -------------------- */
/* These are safe for Phase-1 UI and can be swapped later */
const HERO_IMG =
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80";

/* -------------------- SHADOW HELPER -------------------- */
const shadow = (elevation = 3) =>
  Platform.select({
    android: { elevation },
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
    },
    default: {},
  });

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TodayScreen() {
  const navigation = useNavigation<NavigationProp>();

  /* -------------------- STATE -------------------- */
  const [preferences, setPreferences] = useState<PracticePreferences | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------------------- STORES -------------------- */
  const today = new Date().toISOString().split("T")[0];
  const todayMinutes = useProgressStore((s) => s.getDailyMinutes(today));
  const continueItem = useContinueWatchingStore((s) => s.item);
  const continueProgressPercent = useContinueWatchingStore((s) =>
    s.getProgressPercent()
  );

  /* -------------------- LOAD PREFERENCES -------------------- */
  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [])
  );

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await getPracticePreferences();
      setPreferences(prefs);
    } catch (e) {
      console.warn("Preferences not found yet");
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- ACTIONS -------------------- */
  const handlePlayTodaysAbhyasa = () => {
    if (!preferences) return;

    const playlist = generateTodaysAbhyasa(preferences);

    navigation.navigate(Routes.COMMON_PLAYER, {
      playlist,
      startIndex: 0,
      context: { programId: "today" },
    });
  };

  const handleContinueWatching = () => {
    if (!continueItem) return;

    navigation.navigate(Routes.COMMON_PLAYER, {
      playlist: [
        {
          id: continueItem.videoId,
          title: continueItem.title,
          durationMin: Math.max(
            1,
            Math.round((continueItem.durationSeconds ?? 0) / 60)
          ),
          videoUrl: continueItem.videoUrl,
        },
      ],
      startIndex: 0,
    });
  };

  const handleQuickStart = (filter: "Yoga" | "Breathing" | "Meditation") => {
    navigation.navigate(Routes.VIDEO_LIBRARY, { filter });
  };

  /* -------------------- HELPERS -------------------- */
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const getTotalMinutes = () => {
    if (!preferences) return 20;
    switch (preferences.length) {
      case "Quick":
        return 10;
      case "Balanced":
        return 20;
      case "Deep":
        return 30;
      default:
        return 20;
    }
  };

  /* -------------------- RENDER -------------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.statusBarSpacer} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subGreeting}>Your Abhyāsa is ready</Text>
          </View>

          <TouchableOpacity
            style={styles.notificationCircle}
            onPress={() => navigation.navigate(Routes.NOTIFICATION_SETTINGS)}
          >
            <Ionicons name="notifications-outline" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        {/* TODAY CARD */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => navigation.navigate(Routes.MY_ABHYASA_PROGRAM)}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="sunny-outline" size={18} color="#2E6B4F" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTag}>Today's Abhyāsa</Text>
              <Text style={styles.cardRecText}>
                {preferences ? `Focused on ${preferences.focus}` : "Personalized for you"}
              </Text>
            </View>

            {todayMinutes > 0 && (
              <View style={styles.completionBadge}>
                <Text style={styles.completionBadgeText}>Practiced today</Text>
              </View>
            )}
          </View>

          <View style={styles.heroImageContainer}>
            <Image source={{ uri: HERO_IMG }} style={styles.heroImg} />

            <View style={styles.imageOverlayTags}>
              <View style={styles.glassTag}>
                <Text style={styles.tagText}>
                  {preferences?.focus ?? "Wellness"}
                </Text>
              </View>

              <View style={styles.accentTag}>
                <Text style={styles.tagText}>{getTotalMinutes()} min</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroTextSection}>
            <Text style={styles.heroTitle}>Personalized Flow</Text>
            <Text style={styles.heroTagline}>
              Transform your practice, one breath at a time.
            </Text>
            <Text style={styles.heroSubtext}>
              Warm-up • Practice • Cool-down
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handlePlayTodaysAbhyasa}
          >
            <Ionicons name="play-circle" size={20} color="#FFF" />
            <Text style={styles.primaryBtnText}>Start Practice</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* CONTINUE WATCHING */}
        <View style={styles.continueCard}>
          <View style={styles.continueHeader}>
            <MaterialCommunityIcons
              name="bookmark-outline"
              size={20}
              color="#F2994A"
            />
            <Text style={styles.continueTitle}>Continue Watching</Text>
          </View>

          {continueItem ? (
            <TouchableOpacity
              style={styles.continueContent}
              onPress={handleContinueWatching}
            >
              <Image
                source={{ uri: continueItem.thumbnailUrl || HERO_IMG }}
                style={styles.continueThumb}
              />
              <View style={styles.continueInfo}>
                <Text style={styles.continueVideoTitle} numberOfLines={2}>
                  {continueItem.title}
                </Text>

                <View style={styles.continueProgressTrack}>
                  <View
                    style={[
                      styles.continueProgressFill,
                      { width: `${continueProgressPercent}%` },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="play-circle-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>
                Start a session to continue later.
              </Text>
            </View>
          )}
        </View>

        {/* QUICK START */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>

          <View style={styles.quickGrid}>
            <QuickCard
              title="Yoga"
              icon="leaf"
              color="#60A57A"
              onPress={() => handleQuickStart("Yoga")}
            />
            <QuickCard
              title="Breathing"
              icon="weather-windy"
              color="#5699AA"
              onPress={() => handleQuickStart("Breathing")}
            />
            <QuickCard
              title="Meditation"
              icon="heart"
              color="#D6946A"
              onPress={() => handleQuickStart("Meditation")}
            />
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------- SUB COMPONENT -------------------- */
function QuickCard({ title, icon, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.qgCard} onPress={onPress}>
      <View style={[styles.qgIconCircle, { backgroundColor: color }]}>
        <FontAwesome5 name={icon} size={16} color="#FFF" />
      </View>
      <Text style={styles.qgTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FBFBFB" },
  statusBarSpacer: {
    height: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },
  container: { padding: 20 },
  greeting: { fontSize: 26, fontWeight: "800", color: "#2D3748" },
  subGreeting: { fontSize: 14, color: "#718096" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  notificationCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...shadow(2),
  },

  heroCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 15,
    marginBottom: 18,
    ...shadow(3),
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F7F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  cardHeader: { flexDirection: "row", alignItems: "center" },
  cardTag: { fontSize: 16, fontWeight: "800" },
  cardRecText: { fontSize: 12, color: "#718096" },

  heroImageContainer: {
    height: 180,
    borderRadius: 18,
    overflow: "hidden",
    marginVertical: 14,
  },
  heroImg: { width: "100%", height: "100%" },

  imageOverlayTags: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
  },

  glassTag: {
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 6,
    borderRadius: 999,
    marginRight: 8,
  },

  accentTag: {
    backgroundColor: "#E9A46A",
    padding: 6,
    borderRadius: 999,
  },

  tagText: { color: "#FFF", fontWeight: "800", fontSize: 12 },

  heroTextSection: {
    paddingHorizontal: 4,
    marginBottom: 14,
  },

  heroTitle: { fontSize: 20, fontWeight: "900" },
  heroTagline: { fontSize: 13, color: "#4B5563", marginVertical: 6 },
  heroSubtext: { fontSize: 12, color: "#6B7280" },

  primaryBtn: {
    backgroundColor: "#E9A46A",
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "900" },

  continueCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
    ...shadow(2),
  },

  continueHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  continueTitle: { fontSize: 18, fontWeight: "900" },

  continueContent: {
    flexDirection: "row",
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 12,
  },

  continueThumb: { width: 90, height: 70, borderRadius: 12, marginRight: 12 },

  continueInfo: { flex: 1 },

  continueVideoTitle: { fontWeight: "900", fontSize: 15 },

  continueProgressTrack: {
    height: 6,
    backgroundColor: "#EDF2F7",
    borderRadius: 99,
    marginTop: 10,
  },

  continueProgressFill: {
    height: "100%",
    backgroundColor: "#E9A46A",
  },

  emptyStateContainer: { alignItems: "center", paddingVertical: 24 },
  emptyStateText: { marginTop: 10, color: "#94A3B8" },

  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 18, fontWeight: "900", marginBottom: 12 },

  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  qgCard: {
    width: (width - 60) / 3,
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    ...shadow(2),
  },

  qgIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  qgTitle: { fontSize: 13, fontWeight: "800" },

  completionBadge: {
    backgroundColor: "#F0F9F5",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  completionBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E6B4F",
  },
});
