import React, { useEffect, useState } from "react";
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
import type { RootStackParamList } from "../../types/navigation";

import {
  getPracticePreferences,
  type PracticePreferences,
} from "../../services/PracticePreferences";
import { generateTodaysAbhyasa } from "../../services/AbhyasaGenerator";
import { Routes } from "../../constants/routes";

const { width } = Dimensions.get("window");

// Images
const HERO_IMG =
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80";

const CONTINUE_THUMB =
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80";

// Cross-platform shadow
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

  // State for user preferences and today's practice
  const [preferences, setPreferences] = useState<PracticePreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user preferences on mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadPreferences();
    }, [])
  );

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await getPracticePreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Play Today's Abhyāsa
  const handlePlayTodaysAbhyasa = () => {
    if (!preferences) return;

    // Generate today's practice playlist
    const playlist = generateTodaysAbhyasa(preferences);

    // Navigate to player with playlist
    navigation.navigate(Routes.COMMON_PLAYER, {
      playlist,
      startIndex: 0,
      context: { programId: "todays-abhyasa" },
    });
  };

  // Handler: View full 21-day program
  const handleViewProgram = () => {
    navigation.navigate(Routes.MY_ABHYASA_PROGRAM);
  };

  // Handler: Navigate to Video Library with filter
  const handleQuickStart = (filter: "Yoga" | "Breathing" | "Meditation") => {
    navigation.navigate(Routes.VIDEO_LIBRARY, { filter });
  };

  // Get greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get greeting icon
  const getGreetingIcon = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌅";
    if (hour < 18) return "☀️";
    return "🌙";
  };

  // Calculate total session time from preferences
  const getTotalMinutes = (): number => {
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.statusBarSpacer} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* 1. HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()} {getGreetingIcon()}
            </Text>
            <Text style={styles.subGreeting}>
              Your Abhyāsa is ready
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationCircle}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        {/* 2. TODAY'S PRACTICE HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="sunny-outline" size={18} color="#2E6B4F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTag}>Today's Abhyāsa</Text>
              <Text style={styles.cardRecText}>
                Personalized for {preferences?.focus || "your goals"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleViewProgram} activeOpacity={0.7}>
              <Text style={styles.viewPlanLink}>View Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Image with Overlay Tags */}
          <View style={styles.heroImageContainer}>
            <Image source={{ uri: HERO_IMG }} style={styles.heroImg} />

            {/* Overlay tags - Focus, Goal, Duration */}
            <View style={styles.imageOverlayTags}>
              <View style={styles.glassTag}>
                <Text style={styles.tagText}>{preferences?.focus || "Wellness"}</Text>
              </View>
              {preferences?.goals && preferences.goals.length > 0 && (
                <View style={styles.glassTag}>
                  <Text style={styles.tagText}>{preferences.goals[0]}</Text>
                </View>
              )}
              <View style={styles.accentTag}>
                <Text style={styles.tagText}>{getTotalMinutes()} min</Text>
              </View>
            </View>
          </View>

          {/* Motivational Text - Below Image */}
          <View style={styles.heroTextSection}>
            <Text style={styles.heroTitle}>
              Personalized Flow
            </Text>
            <Text style={styles.heroTagline}>
              Transform your practice, one breath at a time.{"\n"}Your journey to wellness begins today.
            </Text>
            <Text style={styles.heroSubtext}>
              3-part sequence: Warm-up, Practice, Cool-down
            </Text>
          </View>

          {/* PLAY BUTTON - Wired to playlist mode */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.primaryBtn}
            onPress={handlePlayTodaysAbhyasa}
          >
            <Ionicons
              name="play-circle"
              size={20}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.primaryBtnText}>Start Practice</Text>
          </TouchableOpacity>
        </View>

        {/* 4. CONTINUE WATCHING */}
        <View style={styles.continueCard}>
          <View style={styles.continueHeader}>
            <View style={styles.row}>
              <MaterialCommunityIcons
                name="bookmark-outline"
                size={20}
                color="#F2994A"
              />
              <Text style={styles.continueTitle}>Continue Watching</Text>
            </View>
          </View>

          <View style={styles.continueBody}>
            <View style={styles.continueThumbWrap}>
              <Image source={{ uri: CONTINUE_THUMB }} style={styles.continueThumb} />
              <View style={styles.continuePlayOverlay}>
                <Ionicons name="play" size={20} color="#FFF" />
              </View>
            </View>

            <View style={styles.continueInfo}>
              <Text style={styles.continueVideoTitle} numberOfLines={1}>
                Hip Opening Flow
              </Text>
              <Text style={styles.continueInstructor} numberOfLines={1}>
                with Willow Grace
              </Text>

              <View style={styles.continueProgressTrack}>
                <View style={[styles.continueProgressFill, { width: "62%" }]} />
              </View>

              <Text style={styles.continueTimeLeft}>11 min left</Text>
            </View>
          </View>
        </View>

        {/* 5. QUICK START GRID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.quickGrid}>
            <QuickGridCard
              icon="leaf"
              color="#60A57A"
              title="Yoga"
              sub="15 min Flow"
              onPress={() => handleQuickStart("Yoga")}
            />
            <QuickGridCard
              icon="weather-windy"
              color="#5699AA"
              isMCI
              title="Breathing"
              sub="5 min Calm"
              onPress={() => handleQuickStart("Breathing")}
            />
            <QuickGridCard
              icon="heart"
              color="#D6946A"
              title="Meditation"
              sub="10 min Zen"
              onPress={() => handleQuickStart("Meditation")}
            />
            <QuickGridCard
              icon="star-four-points"
              color="#4F9B8B"
              isMCI
              title="Challenges"
              sub="7-day Flex"
              onPress={() => navigation.navigate(Routes.VIDEO_LIBRARY, { filter: "All" })}
            />
          </View>
        </View>

        {/* 6. WEEKLY PROGRESS */}
        <View style={styles.progressDetailCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="calendar-outline" size={20} color="#5699AA" />
            <Text style={styles.progressHeaderText}>This Week's Progress</Text>
          </View>

          <View style={styles.rowSpace}>
            <Text style={styles.progressRowLabel}>Sessions completed</Text>
            <Text style={styles.progressRowValue}>2 of 5</Text>
          </View>

          <View style={styles.barContainer}>
            <View style={[styles.barFill, { width: "40%" }]} />
          </View>
        </View>

        {/* 7. RECENT ACHIEVEMENTS */}
        <View style={styles.section}>
          <View style={styles.achievementHeader}>
            <MaterialCommunityIcons
              name="star-four-points"
              size={20}
              color="#F2994A"
            />
            <Text style={styles.achievementTitle}>Recent Achievements</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeRow}
          >
            <AchievementBadge
              icon="trophy"
              title="Week Warrior"
              color="#E9A46A"
              textColor="#3D2B1D"
            />
            <AchievementBadge
              icon="star-four-points"
              title="First Light"
              color="#8DB07A"
              textColor="#FFF"
              subtitle="Earned!"
            />
            <AchievementBadge
              icon="weather-sunset"
              title="Early Riser"
              color="#F8F9FA"
              textColor="#4A5568"
              isBordered
            />
          </ScrollView>
        </View>

        {/* 8. QUICK BREATHWORK BANNER */}
        <TouchableOpacity
          activeOpacity={0.95}
          style={styles.breathworkContainer}
          accessibilityRole="button"
          accessibilityLabel="Start Quick Breathwork"
        >
          <LinearGradient
            colors={["#648D82", "#8DB07A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.breathworkCard}
          >
            <View style={styles.breathworkInfo}>
              <View style={styles.row}>
                <MaterialCommunityIcons
                  name="weather-windy"
                  size={22}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.breathworkTitle}>Quick Breathwork</Text>
              </View>
              <Text style={styles.breathworkSub}>
                3-minute breathing exercise
              </Text>
            </View>

            <View style={styles.startBtnInner}>
              <MaterialCommunityIcons
                name="play"
                size={16}
                color="#FFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.startBtnText}>Start</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* --- Sub-Components --- */

function AchievementBadge({
  icon,
  title,
  subtitle,
  color,
  textColor,
  isBordered,
}: any) {
  return (
    <View
      style={[
        styles.badgeCard,
        {
          backgroundColor: color,
          borderWidth: isBordered ? 1 : 0,
          borderColor: "#E2E8F0",
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={28}
        color={isBordered ? "#F2994A" : textColor}
      />
      <Text style={[styles.badgeTitle, { color: textColor }]}>{title}</Text>
      {subtitle ? <Text style={styles.badgeStatus}>{subtitle}</Text> : null}
    </View>
  );
}

function QuickGridCard({ icon, color, title, sub, isMCI = false, onPress }: any) {
  return (
    <TouchableOpacity style={styles.qgCard} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.qgIconCircle, { backgroundColor: color }]}>
        {isMCI ? (
          <MaterialCommunityIcons name={icon} size={20} color="#FFF" />
        ) : (
          <FontAwesome5 name={icon} size={16} color="#FFF" solid />
        )}
      </View>
      <Text style={styles.qgTitle}>{title}</Text>
      <Text style={styles.qgSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FBFBFB" },

  statusBarSpacer: {
    height: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },

  container: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 18 },

  row: { flexDirection: "row", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  greeting: { fontSize: 26, fontWeight: "800", color: "#2D3748" },
  subGreeting: { fontSize: 14, color: "#718096", marginTop: 2 },

  notificationCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...shadow(2),
  },

  /* HERO */
  heroCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 15,
    marginBottom: 18,
    ...shadow(3),
  },

  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F7F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  cardTag: { fontSize: 16, fontWeight: "800", color: "#1A1A1A" },
  cardRecText: { fontSize: 12, color: "#718096", marginTop: 2 },

  viewPlanLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },

  heroImageContainer: { height: 180, borderRadius: 18, overflow: "hidden", marginBottom: 14 },
  heroImg: { width: "100%", height: "100%" },

  imageOverlayTags: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
  },

  glassTag: {
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },

  accentTag: {
    backgroundColor: "#E9A46A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  tagText: { color: "#FFF", fontSize: 12, fontWeight: "800" },

  // Motivational text section - NOW BELOW IMAGE
  heroTextSection: {
    paddingHorizontal: 4,
    marginBottom: 14,
  },

  heroTitle: {
    color: "#1A1A1A",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },

  heroTagline: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    fontStyle: "italic",
    marginBottom: 8,
  },

  heroSubtext: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },

  heroDescription: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    color: "#718096",
    paddingHorizontal: 4,
  },

  primaryBtn: {
    backgroundColor: "#E9A46A",
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "900" },

  /* CONTINUE WATCHING */
  continueCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
    ...shadow(2),
  },
  continueHeader: { marginBottom: 12 },
  continueTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "900",
    color: "#2D3748",
  },
  continueBody: { flexDirection: "row", alignItems: "center" },
  continueThumbWrap: {
    width: 86,
    height: 62,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 14,
  },
  continueThumb: { width: "100%", height: "100%" },
  continuePlayOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  continueInfo: { flex: 1 },
  continueVideoTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2D3748",
  },
  continueInstructor: {
    fontSize: 13,
    color: "#718096",
    marginTop: 2,
    fontWeight: "700",
  },
  continueProgressTrack: {
    height: 6,
    backgroundColor: "#EDF2F7",
    borderRadius: 99,
    overflow: "hidden",
    marginTop: 10,
  },
  continueProgressFill: {
    height: "100%",
    backgroundColor: "#E9A46A",
  },
  continueTimeLeft: {
    marginTop: 6,
    fontSize: 12,
    color: "#718096",
    fontWeight: "700",
  },

  /* SECTIONS */
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2D3748",
    marginBottom: 15,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  qgCard: {
    backgroundColor: "#FFF",
    width: (width - 55) / 2,
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 12,
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

  qgTitle: { fontSize: 15, fontWeight: "800", color: "#1A1A1A" },
  qgSub: {
    fontSize: 11,
    color: "#A0AEC0",
    marginTop: 2,
    textAlign: "center",
    fontWeight: "600",
  },

  /* PROGRESS */
  progressDetailCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
    ...shadow(2),
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressHeaderText: {
    fontSize: 17,
    fontWeight: "900",
    marginLeft: 8,
    color: "#1A1A1A",
  },

  rowSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressRowLabel: { fontSize: 14, color: "#718096", fontWeight: "600" },
  progressRowValue: { fontSize: 14, fontWeight: "900", color: "#1A1A1A" },

  barContainer: {
    height: 8,
    backgroundColor: "#EDF2F7",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: "#5699AA" },

  /* ACHIEVEMENTS */
  achievementHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 8,
    color: "#2D3748",
  },
  badgeRow: { paddingRight: 20 },
  badgeCard: {
    width: 110,
    height: 130,
    borderRadius: 20,
    padding: 15,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitle: { fontSize: 13, fontWeight: "800", marginTop: 8, textAlign: "center" },
  badgeStatus: { fontSize: 10, fontWeight: "800", color: "#FFF", marginTop: 2 },

  /* BREATHWORK */
  breathworkContainer: { marginBottom: 20 },
  breathworkCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadow(3),
  },
  breathworkInfo: { flex: 1 },
  breathworkTitle: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  breathworkSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4, fontWeight: "600" },

  startBtnInner: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  startBtnText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
});
