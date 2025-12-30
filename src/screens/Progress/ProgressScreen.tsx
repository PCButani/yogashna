// ProgressScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getProgressData,
  getWeeklyActivity,
  getWeekDayLabel,
  getWeeklySessionsTarget,
  type ProgressData,
  type DailyActivity,
} from "../../services/ProgressTracking";

type RangeTab = "Week" | "Month";

type MilestoneStatus = "Locked" | "In Progress" | "Unlocked";

type WeeklyDay = {
  key: string; // Mon, Tue...
  sessions: number; // count of sessions
  minutes: number; // total minutes
  done: boolean;
};

type Milestone = {
  id: string;
  icon:
    | { lib: "Ionicons"; name: any }
    | { lib: "MaterialCommunityIcons"; name: any };
  title: string;
  subtitle: string;
  status: MilestoneStatus;
  progress: number; // 0..1
  meta?: string; // optional (e.g., "2/5 mornings")
};

const { width } = Dimensions.get("window");

export default function ProgressScreen() {

  const [tab, setTab] = useState<RangeTab>("Week");
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyActivity[]>([]);

  // Load progress data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadProgressData();
    }, [])
  );

  const loadProgressData = async () => {
    try {
      const [progress, weekly] = await Promise.all([
        getProgressData(),
        getWeeklyActivity(),
      ]);
      setProgressData(progress);
      setWeeklyData(weekly);
    } catch (error) {
      console.error("Failed to load progress data:", error);
    }
  };

  // Calculate streak data from real progress
  const streak = useMemo(() => {
    if (!progressData) {
      return {
        current: 0,
        best: 0,
        message: "Start your first practice to begin your streak!",
        tip: "Consistency is key to building a strong practice.",
      };
    }

    const { currentStreak, longestStreak } = progressData;

    let message = "";
    if (currentStreak === 0) {
      message = "Start your practice today to begin a new streak!";
    } else if (currentStreak === 1) {
      message = "Great start! Come back tomorrow to keep it going.";
    } else if (currentStreak < 7) {
      message = `${currentStreak} days strong! You're building a habit.`;
    } else if (currentStreak < 30) {
      message = `${currentStreak} days of dedication! Amazing consistency.`;
    } else {
      message = `${currentStreak} days! You're a yoga warrior!`;
    }

    return {
      current: currentStreak,
      best: longestStreak,
      message,
      tip: currentStreak > 0
        ? "Keep the streak alive with a 10–20 min session today."
        : "Even 5 minutes counts. Start small and build up.",
    };
  }, [progressData]);

  // Calculate week goal from real data
  const weekGoal = useMemo(() => {
    const targetSessions = getWeeklySessionsTarget();
    const completedSessions = weeklyData.reduce(
      (sum, day) => sum + day.sessionsCompleted,
      0
    );
    const remaining = Math.max(0, targetSessions - completedSessions);

    return {
      targetSessions,
      completedSessions,
      helperText:
        remaining === 0
          ? "Week goal achieved! Amazing work!"
          : `${remaining} more session${remaining !== 1 ? "s" : ""} to reach your weekly goal`,
    };
  }, [weeklyData]);

  // Transform weekly data for UI
  const weeklyActivity = useMemo<WeeklyDay[]>(() => {
    return weeklyData.map((day) => ({
      key: getWeekDayLabel(day.date),
      sessions: day.sessionsCompleted,
      minutes: day.minutesPracticed,
      done: day.sessionsCompleted > 0,
    }));
  }, [weeklyData]);

  const monthGoal = useMemo(
    () => ({
      targetSessions: 20,
      completedSessions: 12,
      helperText: "You're building steady momentum 🌿",
    }),
    []
  );

  const monthlyBreakdown = useMemo(
    () => [
      { week: "Week 1", done: 5, target: 5 },
      { week: "Week 2", done: 4, target: 5 },
      { week: "Week 3", done: 3, target: 5 },
      { week: "Week 4", done: 0, target: 5 },
    ],
    []
  );

  const milestonesWeek = useMemo<Milestone[]>(
    () => [
      {
        id: "m1",
        icon: { lib: "Ionicons", name: "sunny-outline" },
        title: "First Light",
        subtitle: "Complete your first morning practice",
        status: "Unlocked",
        progress: 1,
        meta: "Done",
      },
      {
        id: "m2",
        icon: { lib: "Ionicons", name: "flame-outline" },
        title: "Week Warrior",
        subtitle: "Practice 5 times in a week",
        status: "In Progress",
        progress: 0.6,
        meta: "3/5 sessions",
      },
      {
        id: "m3",
        icon: { lib: "MaterialCommunityIcons", name: "leaf" },
        title: "Peace Keeper",
        subtitle: "Finish 3 calming sessions",
        status: "In Progress",
        progress: 0.67,
        meta: "2/3 sessions",
      },
      {
        id: "m4",
        icon: { lib: "Ionicons", name: "moon-outline" },
        title: "Moon Cycle",
        subtitle: "Practice on 4 different days",
        status: "In Progress",
        progress: 0.75,
        meta: "3/4 days",
      },
      {
        id: "m5",
        icon: { lib: "MaterialCommunityIcons", name: "wave" },
        title: "Flow Master",
        subtitle: "Accumulate 60 minutes this week",
        status: "Locked",
        progress: 0.45,
        meta: "27/60 min",
      },
    ],
    []
  );

  const milestonesMonth = useMemo<Milestone[]>(
    () => [
      {
        id: "mm1",
        icon: { lib: "Ionicons", name: "sparkles-outline" },
        title: "Steady Path",
        subtitle: "Complete 12 sessions this month",
        status: "Unlocked",
        progress: 1,
        meta: "Done",
      },
      {
        id: "mm2",
        icon: { lib: "Ionicons", name: "heart-outline" },
        title: "Gentle Strength",
        subtitle: "Practice on 10 different days",
        status: "In Progress",
        progress: 0.7,
        meta: "7/10 days",
      },
      {
        id: "mm3",
        icon: { lib: "MaterialCommunityIcons", name: "weather-sunset" },
        title: "Dawn Blessing",
        subtitle: "Complete 5 morning sessions",
        status: "In Progress",
        progress: 0.4,
        meta: "2/5 mornings",
      },
      {
        id: "mm4",
        icon: { lib: "Ionicons", name: "timer-outline" },
        title: "Breath & Balance",
        subtitle: "Total 300 minutes of practice",
        status: "In Progress",
        progress: 0.52,
        meta: "156/300 min",
      },
    ],
    []
  );

  const statsWeek = useMemo(() => {
    const totalSessions = weeklyActivity.reduce((acc, d) => acc + d.sessions, 0);
    const totalMinutes = weeklyActivity.reduce((acc, d) => acc + d.minutes, 0);
    const activeDays = weeklyActivity.filter((d) => d.done).length;
    return { totalSessions, totalMinutes, activeDays };
  }, [weeklyActivity]);

  const progressRatio = (completed: number, target: number) => {
    if (!target || target <= 0) return 0;
    const r = completed / target;
    return Math.max(0, Math.min(1, r));
  };

  const renderTopHeader = () => (
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>Progress</Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>B</Text>
      </View>
    </View>
  );

  const renderIntro = () => (
    <View style={styles.introWrap}>
      <Text style={styles.introTitle}>Your Yoga Abhyāsa</Text>
      <Text style={styles.introSubtitle}>
        Consistency and discipline, practiced with gentleness
      </Text>
    </View>
  );

  const renderSegmentTabs = () => (
    <View style={styles.segmentWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setTab("Week")}
        style={[
          styles.segmentBtn,
          tab === "Week" ? styles.segmentBtnActive : null,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            tab === "Week" ? styles.segmentTextActive : null,
          ]}
        >
          Week
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setTab("Month")}
        style={[
          styles.segmentBtn,
          tab === "Month" ? styles.segmentBtnActive : null,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            tab === "Month" ? styles.segmentTextActive : null,
          ]}
        >
          Month
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStreakCard = () => (
    <View style={styles.streakCard}>
      <View style={styles.streakBadge}>
        <Ionicons name="flame-outline" size={22} color={COLORS.white} />
      </View>

      <View style={styles.streakBody}>
        <Text style={styles.streakTitle}>Current Streak</Text>
        <Text style={styles.streakMsg}>
          {streak.message}{" "}
          <Text style={styles.streakEmoji}>🔥</Text>
        </Text>

        <View style={styles.streakStatsRow}>
          <View style={styles.streakStat}>
            <Text style={[styles.streakNumber, { color: COLORS.accent }]}>
              {streak.current}
            </Text>
            <Text style={styles.streakLabel}>Current</Text>
          </View>

          <View style={styles.streakDivider} />

          <View style={styles.streakStat}>
            <Text style={[styles.streakNumber, { color: COLORS.primary }]}>
              {streak.best}
            </Text>
            <Text style={styles.streakLabel}>Best Ever</Text>
          </View>
        </View>

        <View style={styles.streakTipRow}>
          <Ionicons name="sparkles-outline" size={16} color={COLORS.muted} />
          <Text style={styles.streakTipText}>{streak.tip}</Text>
        </View>
      </View>

      <View style={styles.streakPill}>
        <Text style={styles.streakPillText}>{streak.current}</Text>
      </View>
    </View>
  );

  const renderGoalCard = (title: string, completed: number, target: number, helper: string) => {
    const ratio = progressRatio(completed, target);
    const pct = Math.round(ratio * 100);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconSoft}>
              <Ionicons name="radio-button-on" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          

          <View style={styles.cardHeaderRight}>
            <Text style={styles.cardMetaStrong}>
              {completed} of {target}
            </Text>
          </View>
        </View>

        <Text style={styles.cardMeta}>Sessions completed</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>

        <Text style={styles.cardHelper}>
          {helper} <Text style={styles.cardHelperEmoji}>💪</Text>
        </Text>
      </View>
    );
  };

  const renderWeeklyActivity = () => (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.iconSoft, { backgroundColor: COLORS.accentSoft }]}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.accent} />
          </View>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
        </View>

        <View style={styles.smallPill}>
          <Text style={styles.smallPillText}>
            {statsWeek.activeDays} active days
          </Text>
        </View>
      </View>

      <View style={styles.weekRow}>
        {weeklyActivity.map((d) => {
          const isDone = d.done;
          const minutesLabel = d.minutes > 0 ? `${d.minutes}m` : "0m";
          const sessionsLabel = d.sessions > 0 ? `${d.sessions}` : "–";

          return (
            <View key={d.key} style={styles.dayCol}>
              <Text style={styles.dayLabel}>{d.key}</Text>

              <View
                style={[
                  styles.dayDot,
                  isDone ? styles.dayDotActive : styles.dayDotIdle,
                ]}
              >
                <Text
                  style={[
                    styles.dayDotText,
                    isDone ? styles.dayDotTextActive : styles.dayDotTextIdle,
                  ]}
                >
                  {sessionsLabel}
                </Text>
              </View>

              <Text style={styles.dayMinutes}>{minutesLabel}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.weekSummaryRow}>
        <View style={styles.summaryChip}>
          <Ionicons name="play-outline" size={16} color={COLORS.muted} />
          <Text style={styles.summaryChipText}>
            {statsWeek.totalSessions} sessions
          </Text>
        </View>
        <View style={styles.summaryChip}>
          <Ionicons name="time-outline" size={16} color={COLORS.muted} />
          <Text style={styles.summaryChipText}>
            {statsWeek.totalMinutes} min total
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMonthlyBreakdown = () => (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Steady Repetition</Text>
        <Text style={styles.sectionMeta}>Weeks</Text>
      </View>

      {monthlyBreakdown.map((w, idx) => {
        const ratio = progressRatio(w.done, w.target);
        const pct = Math.round(ratio * 100);

        return (
          <View
            key={w.week}
            style={[
              styles.breakRow,
              idx === 0 ? { marginTop: 10 } : null,
            ]}
          >
            <View style={styles.breakLeft}>
              <View
                style={[
                  styles.breakBullet,
                  pct >= 100 ? styles.breakBulletDone : styles.breakBulletIdle,
                ]}
              />
              <Text style={styles.breakTitle}>{w.week}</Text>
            </View>

            <View style={styles.breakRight}>
              <Text style={styles.breakStrong}>
                {w.done}/{w.target}
              </Text>
              <Text style={styles.breakMuted}>sessions</Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderMilestones = (items: Milestone[]) => (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.iconSoft, { backgroundColor: COLORS.accentSoft }]}>
            <Ionicons name="ribbon-outline" size={18} color={COLORS.accent} />
          </View>
          <Text style={styles.sectionTitle}>Milestones</Text>
        </View>

        <Text style={styles.sectionMeta}>Honoring your practice</Text>
      </View>

      {items.map((m, idx) => {
        const pct = Math.round(Math.max(0, Math.min(1, m.progress)) * 100);

        const statusPillStyle =
          m.status === "Unlocked"
            ? styles.statusPillOk
            : m.status === "In Progress"
            ? styles.statusPillMid
            : styles.statusPillLock;

        const statusText =
          m.status === "Unlocked"
            ? "Unlocked"
            : m.status === "In Progress"
            ? "In progress"
            : "Locked";

        const IconEl =
          m.icon.lib === "Ionicons" ? (
            <Ionicons name={m.icon.name} size={18} color={COLORS.ink} />
          ) : (
            <MaterialCommunityIcons
              name={m.icon.name}
              size={18}
              color={COLORS.ink}
            />
          );

        return (
          <View key={m.id} style={[styles.mileRow, idx === 0 ? { marginTop: 12 } : null]}>
            <View style={styles.mileTop}>
              <View style={styles.mileLeft}>
                <View style={styles.mileIcon}>{IconEl}</View>
                <View style={{ flex: 1 }}>
                  <View style={styles.mileTitleRow}>
                    <Text style={styles.mileTitle}>{m.title}</Text>
                    <View style={[styles.statusPill, statusPillStyle]}>
                      <Text style={styles.statusPillText}>{statusText}</Text>
                    </View>
                  </View>

                  <Text style={styles.mileSubtitle}>{m.subtitle}</Text>

                  {!!m.meta && (
                    <View style={styles.mileMetaRow}>
                      <Ionicons
                        name={
                          m.status === "Unlocked"
                            ? "checkmark-circle-outline"
                            : m.status === "Locked"
                            ? "lock-closed-outline"
                            : "trending-up-outline"
                        }
                        size={14}
                        color={COLORS.muted}
                      />
                      <Text style={styles.mileMetaText}>{m.meta}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.mileBarTrack}>
              <View style={[styles.mileBarFill, { width: `${pct}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderWeek = () => (
    <>
      {renderGoalCard(
        "This Week's Goal",
        weekGoal.completedSessions,
        weekGoal.targetSessions,
        weekGoal.helperText
      )}
      {renderWeeklyActivity()}
      {renderMilestones(milestonesWeek)}
    </>
  );

  const renderMonth = () => (
    <>
      {renderGoalCard(
        "This Month's Goal",
        monthGoal.completedSessions,
        monthGoal.targetSessions,
        monthGoal.helperText
      )}
      {renderMonthlyBreakdown()}
      {renderMilestones(milestonesMonth)}
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {renderTopHeader()}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderIntro()}
          {renderStreakCard()}

          {renderSegmentTabs()}

          {tab === "Week" ? renderWeek() : renderMonth()}

          <View style={{ height: 26 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* =========================
   Theme Tokens (Local)
========================= */
const COLORS = {
  bg: "#F7F6F2", // soft neutral
  card: "#FFFFFF",
  ink: "#1F2A37",
  muted: "#6B7280",
  line: "#E7E3DA",
  primary: "#4F8A8B", // calming blue/green
  primarySoft: "rgba(79, 138, 139, 0.12)",
  accent: "#F2A45A", // saffron/orange
  accentSoft: "rgba(242, 164, 90, 0.16)",
  white: "#FFFFFF",
  shadow: "rgba(17, 24, 39, 0.10)",
};

const RADIUS = 18;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },

  pageHeader: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.ink,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(79, 138, 139, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: COLORS.white, fontWeight: "800" },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 90, // space for bottom tab bar
  },

  introWrap: { alignItems: "center", paddingTop: 8, paddingBottom: 14 },
  introTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: -0.2,
  },
  introSubtitle: {
    marginTop: 6,
    fontSize: 15.5,
    color: COLORS.muted,
    textAlign: "center",
  },

  // Streak Card
  streakCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
    marginTop: 10,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
    overflow: "hidden",
  },
  streakBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(79, 138, 139, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
  },
  streakBody: { alignItems: "center" },
  streakTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.ink,
    marginBottom: 6,
  },
  streakMsg: {
    fontSize: 14.5,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
  },
  streakEmoji: { fontSize: 14.5 },
  streakStatsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginBottom: 12,
  },
  streakStat: { alignItems: "center", minWidth: 120 },
  streakNumber: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  streakLabel: { marginTop: 4, fontSize: 13, color: COLORS.muted },
  streakDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.line,
    opacity: 0.9,
  },
  streakTipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 2,
  },
  streakTipText: {
    fontSize: 13.5,
    color: COLORS.muted,
    textAlign: "center",
  },
  streakPill: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  streakPillText: { color: COLORS.white, fontWeight: "900" },

  // Segment tabs
  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 999,
    padding: 5,
    marginVertical: 10,
    alignSelf: "center",
    width: Math.min(360, width - 36),
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: COLORS.card,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  segmentText: { fontSize: 15, fontWeight: "700", color: COLORS.muted },
  segmentTextActive: { color: COLORS.ink },

  // Cards
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
    marginTop: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardHeaderRight: { alignItems: "flex-end" },
  cardTitle: { fontSize: 18, fontWeight: "800", color: COLORS.ink },
  cardMeta: { marginTop: 10, fontSize: 14, color: COLORS.muted },
  cardMetaStrong: { fontSize: 14, fontWeight: "800", color: COLORS.ink },
  cardHelper: { marginTop: 10, fontSize: 14, color: COLORS.muted },
  cardHelperEmoji: { fontSize: 14 },

  iconSoft: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(79, 138, 139, 0.16)",
    overflow: "hidden",
    marginTop: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },

  // Section headers inside cards
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.ink },
  sectionMeta: { fontSize: 13, color: COLORS.muted, fontWeight: "700" },

  smallPill: {
    backgroundColor: "rgba(79, 138, 139, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(79, 138, 139, 0.20)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  smallPillText: { fontSize: 12.5, color: COLORS.ink, fontWeight: "800" },

  // Weekly activity
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  dayCol: { alignItems: "center", width: 44 },
  dayLabel: { fontSize: 12.5, color: COLORS.muted, fontWeight: "700" },
  dayDot: {
    marginTop: 10,
    width: 40,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dayDotActive: {
    backgroundColor: "rgba(79, 138, 139, 0.92)",
    borderColor: "rgba(79, 138, 139, 0.18)",
  },
  dayDotIdle: {
    backgroundColor: "rgba(31, 42, 55, 0.05)",
    borderColor: "rgba(31, 42, 55, 0.08)",
  },
  dayDotText: { fontSize: 16, fontWeight: "900" },
  dayDotTextActive: { color: COLORS.white },
  dayDotTextIdle: { color: COLORS.muted },
  dayMinutes: { marginTop: 8, fontSize: 12.5, color: COLORS.muted },

  weekSummaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(31, 42, 55, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(31, 42, 55, 0.06)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  summaryChipText: { fontSize: 13, color: COLORS.ink, fontWeight: "800" },

  // Monthly breakdown
  breakRow: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(31, 42, 55, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(31, 42, 55, 0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  breakLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  breakBullet: { width: 12, height: 12, borderRadius: 6 },
  breakBulletDone: { backgroundColor: "rgba(79, 138, 139, 0.90)" },
  breakBulletIdle: { backgroundColor: "rgba(31, 42, 55, 0.10)" },
  breakTitle: { fontSize: 15.5, fontWeight: "800", color: COLORS.ink },
  breakRight: { alignItems: "flex-end" },
  breakStrong: { fontSize: 16, fontWeight: "900", color: COLORS.ink },
  breakMuted: { marginTop: 2, fontSize: 12.5, color: COLORS.muted },

  // Milestones
  mileRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(231, 227, 218, 0.9)",
  },
  mileTop: { flexDirection: "row", alignItems: "flex-start" },
  mileLeft: { flexDirection: "row", gap: 10, flex: 1 },
  mileIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "rgba(31, 42, 55, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(31, 42, 55, 0.07)",
    alignItems: "center",
    justifyContent: "center",
  },
  mileTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  mileTitle: { fontSize: 16, fontWeight: "900", color: COLORS.ink },
  mileSubtitle: {
    marginTop: 4,
    fontSize: 13.5,
    color: COLORS.muted,
    lineHeight: 18,
  },
  mileMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  mileMetaText: { fontSize: 12.5, color: COLORS.muted, fontWeight: "700" },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillOk: {
    backgroundColor: "rgba(79, 138, 139, 0.12)",
    borderColor: "rgba(79, 138, 139, 0.25)",
  },
  statusPillMid: {
    backgroundColor: "rgba(242, 164, 90, 0.14)",
    borderColor: "rgba(242, 164, 90, 0.35)",
  },
  statusPillLock: {
    backgroundColor: "rgba(31, 42, 55, 0.06)",
    borderColor: "rgba(31, 42, 55, 0.10)",
  },
  statusPillText: { fontSize: 12, fontWeight: "900", color: COLORS.ink },

  mileBarTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(79, 138, 139, 0.14)",
    overflow: "hidden",
    marginTop: 10,
  },
  mileBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
});
