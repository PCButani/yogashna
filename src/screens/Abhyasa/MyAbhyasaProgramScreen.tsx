/**
 * My Abhyāsa Program Screen
 * Shows user's personalized AbhyasaCycle (21-day practice)
 * Reuses ProgramTemplate content (hero image, title, benefits)
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
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../types/navigation";

import {
  getAbhyasaCycle,
} from "../../services/AbhyasaCycleService";
import { getProgramTemplateById } from "../../data/sources/ProgramTemplates";
import { getPracticePreferences } from "../../services/PracticePreferences";
import { getProgressData } from "../../services/ProgressTracking";
import type { AbhyasaCycle, AbhyasaDayPlan, ProgramTemplate } from "../../data/models/ProgramTemplate";
import { Routes } from "../../constants/routes";
import DayCard, { type DayCardSession, type DayCardStatus } from "../../components/DayCard";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyAbhyasaProgramScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<AbhyasaCycle | null>(null);
  const [programTemplate, setProgramTemplate] = useState<ProgramTemplate | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCycle();
  }, []);

  const loadCycle = async () => {
    try {
      setLoading(true);
      const [preferences, progressData] = await Promise.all([
        getPracticePreferences(),
        getProgressData(),
      ]);

      const abhyasaCycle = await getAbhyasaCycle(preferences);
      const template = getProgramTemplateById(abhyasaCycle.programTemplateId);

      setCycle(abhyasaCycle);
      setProgramTemplate(template);

      // Mark completed days (mock for now)
      const completed = new Set<number>();
      setCompletedDays(completed);
    } catch (error) {
      console.error("Failed to load cycle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayDay = (day: AbhyasaDayPlan) => {
    navigation.navigate(Routes.COMMON_PLAYER, {
      playlist: day.sessions,
      startIndex: 0,
      context: { programId: "my-abhyasa", dayNumber: day.dayNumber },
    });
  };

  const handlePlaySession = (day: AbhyasaDayPlan, sessionIndex: number) => {
    navigation.navigate(Routes.COMMON_PLAYER, {
      playlist: day.sessions,
      startIndex: sessionIndex,
      context: { programId: "my-abhyasa", dayNumber: day.dayNumber },
    });
  };

  if (loading || !cycle) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your program...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.statusBarSpacer} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Abhyāsa Program</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image from ProgramTemplate */}
        {programTemplate?.heroImage && (
          <View style={styles.bannerWrap}>
            <Image
              source={{ uri: programTemplate.heroImage }}
              style={styles.bannerImage}
            />
          </View>
        )}

        <View style={styles.content}>
          {/* Personalization Note */}
          <View style={styles.personalizedNote}>
            <MaterialCommunityIcons name="compass-outline" size={16} color="#16A34A" />
            <Text style={styles.personalizedNoteText}>
              This is your personalized version of the program. Sessions may adjust based on your time and comfort level.
            </Text>
          </View>

          {/* Program Header from ProgramTemplate */}
          <View style={styles.titleWrap}>
            <Text style={styles.programTitle}>
              {programTemplate?.title || "21-Day Personalized Journey"}
            </Text>
            {programTemplate?.sanskritTitle && (
              <Text style={styles.sanskritTitle}>{programTemplate.sanskritTitle}</Text>
            )}
            <Text style={styles.programSubtitle}>
              {programTemplate?.subtitle || "Your personalized practice journey"}
            </Text>
          </View>

          {/* Meta Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="bar-chart-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{programTemplate?.levelLabel || "Beginner"}</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>21 Days</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>
                {cycle.minutesPreference} min/day
              </Text>
            </View>
          </View>

          {/* Benefits from ProgramTemplate */}
          {programTemplate?.benefits && programTemplate.benefits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              <View style={styles.benefitsWrap}>
                {programTemplate.benefits.map((benefit, idx) => (
                  <View key={idx} style={styles.benefitChip}>
                    <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Progress Stats */}
          <View style={styles.progressBox}>
            <View style={styles.progressItem}>
              <Ionicons name="trophy-outline" size={18} color="#E9A46A" />
              <Text style={styles.progressLabel}>Completed</Text>
              <Text style={styles.progressValue}>
                {completedDays.size}/{cycle.days.length}
              </Text>
            </View>
          </View>

          {/* Week Sections */}
          {[1, 2, 3].map((week) => {
            const weekStart = (week - 1) * 7 + 1;
            const weekEnd = week * 7;
            const weekDays = cycle.days.filter(
              (d) => d.dayNumber >= weekStart && d.dayNumber <= weekEnd
            );

            return (
              <View key={week} style={styles.weekSection}>
                <Text style={styles.weekTitle}>
                  Week {week}: {getWeekTheme(week)}
                </Text>

                {weekDays.map((day) => {
                  const isCompleted = completedDays.has(day.dayNumber);
                  const isCurrent = day.dayNumber === 1; // Mock current day

                  // Transform sessions to DayCard format
                  const daySessions: DayCardSession[] = day.sessions.map((session) => ({
                    id: session.id,
                    title: session.title,
                    durationMin: session.durationMin,
                    style: session.style,
                    sequenceType: session.sequenceType,
                    completed: isCompleted,
                  }));

                  // Determine status
                  const status: DayCardStatus = isCompleted
                    ? "completed"
                    : isCurrent
                    ? "upNext"
                    : "locked";

                  return (
                    <DayCard
                      key={day.dayNumber}
                      dayNumber={day.dayNumber}
                      dayTitle={day.theme}
                      sessions={daySessions}
                      status={status}
                      onPlayDay={() => handlePlayDay(day)}
                      onPlaySession={(sessionIndex) => handlePlaySession(day, sessionIndex)}
                      showPlayButton={true}
                    />
                  );
                })}
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getWeekTheme(week: number): string {
  switch (week) {
    case 1:
      return "Foundation";
    case 2:
      return "Building Strength";
    case 3:
      return "Deepening Practice";
    default:
      return "Practice";
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF",
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
    backgroundColor: "#FFF",
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  scrollView: {
    flex: 1,
  },

  bannerWrap: {
    width: "100%",
    height: 220,
    backgroundColor: "#EEE",
  },

  bannerImage: {
    width: "100%",
    height: "100%",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  personalizedNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 16,
  },

  personalizedNoteText: {
    flex: 1,
    fontSize: 12.5,
    color: "#166534",
    lineHeight: 17,
    fontWeight: "600",
  },

  titleWrap: {
    marginBottom: 16,
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

  programTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },

  sanskritTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    fontStyle: "italic",
    marginBottom: 8,
  },

  programSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 24,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 10,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },

  benefitsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  benefitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  benefitText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },

  progressBox: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },

  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  progressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    flex: 1,
  },

  progressValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#92400E",
  },

  weekSection: {
    marginBottom: 24,
  },

  weekTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
});
