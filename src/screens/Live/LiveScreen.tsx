import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * LiveScreen.tsx
 * - Single-file implementation (UI + mock logic)
 * - Design updated:
 *   1) Live Now hero aligned with "Today's Practice" (adds description + calmer structure)
 *   2) Upcoming schedule cards include 1-line description preview
 */

type LevelTag = "All Levels" | "Gentle" | "Beginner" | "Intermediate";
type SessionStatus = "LIVE" | "UPCOMING";

type LiveSession = {
  id: string;
  title: string;
  instructor: string;
  durationMin: number;
  joinedCount?: number;
  level: LevelTag;
  coverUrl: string;
  status: SessionStatus;

  // New: brief description to improve clarity & motivation (1–2 lines)
  description?: string;

  // For upcoming
  startTimeLabel?: string; // e.g., "7:00 AM"
  startsInLabel?: string; // e.g., "Starts in 1h 30m"
  isRegistered?: boolean;
};

type WeekRow = {
  day: string;
  slots: string; // "7:00 AM • 12:30 PM • 7:00 PM"
  classesCount: number;
};

export default function LiveScreen() {
  /**
   * Replace this with your real subscription state later (RevenueCat/Firebase/NestJS).
   */
  const [isPaid, setIsPaid] = useState(false);

  // -------------------------
  // Mock Data (replace later)
  // -------------------------
  const liveNow: LiveSession | null = {
    id: "live_1",
    title: "Power Flow Challenge",
    instructor: "Storm Phoenix",
    durationMin: 45,
    joinedCount: 341,
    level: "All Levels",
    coverUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=70",
    status: "LIVE",
    description:
      "Build strength, balance, and focus through an energizing full-body flow designed to reset your mind and body.",
  };

  const todaysSchedule: LiveSession[] = [
    {
      id: "up_1",
      title: "Morning Flow with Luna Rivers",
      instructor: "Luna Rivers",
      durationMin: 30,
      joinedCount: 127,
      level: "All Levels",
      coverUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=70",
      status: "UPCOMING",
      startTimeLabel: "7:00 AM",
      startsInLabel: "Starts in 1h 30m",
      isRegistered: false,
      description: "Wake up gently with mobility + breath to feel light and ready ☀️",
    },
    {
      id: "up_2",
      title: "Lunch Break Reset",
      instructor: "River Sage",
      durationMin: 20,
      joinedCount: 89,
      level: "Gentle",
      coverUrl:
        "https://images.unsplash.com/photo-1529693662653-9d480530a697?auto=format&fit=crop&w=900&q=70",
      status: "UPCOMING",
      startTimeLabel: "12:30 PM",
      startsInLabel: "Starts in 6h 30m",
      isRegistered: true,
      description: "Release neck & shoulder tension and refocus in minutes 🌿",
    },
    {
      id: "up_3",
      title: "Evening Wind Down",
      instructor: "Ocean Calm",
      durationMin: 25,
      joinedCount: 203,
      level: "All Levels",
      coverUrl:
        "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=900&q=70",
      status: "UPCOMING",
      startTimeLabel: "7:00 PM",
      startsInLabel: "Starts in 12h 30m",
      isRegistered: false,
      description: "Slow, grounding flow to help you relax and sleep better 🌙",
    },
  ];

  const weeklyPlan: WeekRow[] = [
    { day: "Monday", slots: "7:00 AM • 12:30 PM • 7:00 PM", classesCount: 3 },
    { day: "Tuesday", slots: "7:00 AM • 12:30 PM • 7:00 PM", classesCount: 3 },
    { day: "Wednesday", slots: "7:00 AM • 12:30 PM • 7:00 PM", classesCount: 3 },
    { day: "Thursday", slots: "7:00 AM • 12:30 PM • 7:00 PM", classesCount: 3 },
    { day: "Friday", slots: "7:00 AM • 12:30 PM • 7:00 PM", classesCount: 3 },
    { day: "Saturday", slots: "8:00 AM • 6:30 PM", classesCount: 2 },
    { day: "Sunday", slots: "9:00 AM • 6:00 PM", classesCount: 2 },
  ];

  const showLiveNow = useMemo(() => !!liveNow, [liveNow]);

  const onJoinLive = () => {
    if (!isPaid) {
      Alert.alert(
        "Unlock Live Classes",
        "Live classes are available on the paid plan. Upgrade to join real-time sessions.",
        [
          { text: "Not now", style: "cancel" },
          {
            text: "View Plans",
            onPress: () => Alert.alert("TODO", "Navigate to Paywall/Plans screen."),
          },
        ]
      );
      return;
    }

    Alert.alert("Joining Live Class", "TODO: Open live player (Cloudflare Stream Live).");
  };

  const onToggleRegister = (sessionId: string) => {
    Alert.alert(
      "Reminder / Registration",
      "TODO: Register the user and schedule notification (Firebase/Expo push)."
    );
  };

  // Dev-only toggle (remove later)
  const onDevTogglePaid = () => setIsPaid((p) => !p);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Live</Text>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            onPress={onDevTogglePaid}
            style={[styles.pill, isPaid ? styles.pillPaid : styles.pillFree]}
            accessibilityRole="button"
            accessibilityLabel="Toggle paid (dev)"
          >
            <Ionicons
              name={isPaid ? "checkmark-circle" : "lock-closed"}
              size={14}
              color={isPaid ? "#1B5E20" : "#6B7280"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.pillText, isPaid ? styles.pillTextPaid : styles.pillTextFree]}>
              {isPaid ? "Paid" : "Free"}
            </Text>
          </TouchableOpacity>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.h1}>Live Classes</Text>
          <Text style={styles.sub}>
            Practice together, grow together <Text style={styles.leaf}>🌿</Text>
          </Text>
        </View>

        {/* LIVE NOW - aligned with Today's Practice */}
        {showLiveNow ? (
          <View style={styles.liveShell}>
            <View style={styles.liveBadgesRow}>
              <View style={styles.liveNowBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveNowText}>LIVE NOW</Text>
              </View>

              <View style={styles.remainingPill}>
                <Text style={styles.remainingText}>23 min remaining</Text>
              </View>
            </View>

            <View style={styles.liveHeroCard}>
              <View style={styles.liveHeroTopChips}>
                <View style={styles.heroChipDark}>
                  <Text style={styles.heroChipTextDark}>{liveNow!.level}</Text>
                </View>
                <View style={styles.heroChipSoft}>
                  <Text style={styles.heroChipTextSoft}>{liveNow!.durationMin} min</Text>
                </View>
              </View>

              <View style={styles.heroImageWrap}>
                <Image source={{ uri: liveNow!.coverUrl }} style={styles.heroImage} />
                <View style={styles.heroOverlay} />

                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroTitle} numberOfLines={2}>
                    {liveNow!.title}
                  </Text>
                  <Text style={styles.heroInstructor} numberOfLines={1}>
                    with {liveNow!.instructor}
                  </Text>

                  <View style={styles.heroMetaRow}>
                    <View style={styles.heroMetaItem}>
                      <Ionicons name="people-outline" size={16} color="#F8FAFC" />
                      <Text style={styles.heroMetaText}>{liveNow!.joinedCount ?? 0} joined</Text>
                    </View>
                    <View style={styles.heroMetaItem}>
                      <Ionicons name="time-outline" size={16} color="#F8FAFC" />
                      <Text style={styles.heroMetaText}>{liveNow!.durationMin} min</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* NEW: Description block (like Today's Practice) */}
              <Text style={styles.heroDescription} numberOfLines={3}>
                {liveNow!.description}
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, !isPaid && styles.primaryBtnLocked]}
                onPress={onJoinLive}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Join live class"
              >
                <Ionicons
                  name={isPaid ? "play" : "lock-closed"}
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.primaryBtnText}>
                  {isPaid ? "Join Live Class" : "Unlock to Join Live"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyLiveCard}>
            <Ionicons name="radio-outline" size={22} color="#6B7280" />
            <Text style={styles.emptyLiveTitle}>No live class right now</Text>
            <Text style={styles.emptyLiveSub}>
              Check today’s schedule below and register for the next session.
            </Text>
          </View>
        )}

        {/* UNLOCK CARD (only if not paid) */}
        {!isPaid && (
          <View style={styles.unlockCard}>
            <View style={styles.unlockIconWrap}>
              <Ionicons name="ribbon-outline" size={28} color="#E5A56A" />
            </View>

            <Text style={styles.unlockTitle}>Practice Live With Expert Teachers</Text>
            <Text style={styles.unlockSub}>
              Join real-time sessions, ask questions, and stay consistent with a supportive community.
            </Text>

            <View style={styles.unlockBullets}>
              <View style={styles.bulletRow}>
                <Ionicons name="star-outline" size={16} color="#E5A56A" />
                <Text style={styles.bulletText}>Daily live classes</Text>
              </View>
              <View style={styles.bulletRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#E5A56A" />
                <Text style={styles.bulletText}>Q&A with instructors</Text>
              </View>
              <View style={styles.bulletRow}>
                <Ionicons name="calendar-outline" size={16} color="#E5A56A" />
                <Text style={styles.bulletText}>Easy reminders & registration</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => Alert.alert("TODO", "Navigate to Paywall/Plans screen.")}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryBtnText}>View Plans</Text>
              <Ionicons name="arrow-forward" size={16} color="#1F2937" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* TODAY'S SCHEDULE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Schedule</Text>

          {todaysSchedule.map((s) => (
            <View key={s.id} style={styles.scheduleCard}>
              <Image source={{ uri: s.coverUrl }} style={styles.thumb} />

              <TouchableOpacity
                style={styles.reminderBtn}
                onPress={() => onToggleRegister(s.id)}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Register or set reminder"
              >
                <Ionicons
                  name={s.isRegistered ? "notifications" : "notifications-outline"}
                  size={18}
                  color={s.isRegistered ? "#E5A56A" : "#6B7280"}
                />
              </TouchableOpacity>

              <View style={styles.scheduleMid}>
                <View style={styles.titleRow}>
                  <Text style={styles.sessionTitle} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <View style={styles.levelPill}>
                    <Text style={styles.levelText}>{s.level}</Text>
                  </View>
                </View>

                <Text style={styles.sessionInstructor} numberOfLines={1}>
                  with {s.instructor}
                </Text>

                {/* NEW: 1-line description preview */}
                {!!s.description && (
                  <Text style={styles.sessionDesc} numberOfLines={1}>
                    {s.description}
                  </Text>
                )}

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={15} color="#6B7280" />
                    <Text style={styles.metaText}>{s.startTimeLabel}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={15} color="#6B7280" />
                    <Text style={styles.metaText}>{s.joinedCount ?? 0}</Text>
                  </View>
                </View>

                <Text style={styles.startsIn}>{s.startsInLabel}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.smallBtnSoft]}
                    onPress={() => Alert.alert("TODO", "Open session details page.")}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="information-circle-outline" size={16} color="#1F2937" />
                    <Text style={styles.smallBtnText}>Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.smallBtn,
                      s.isRegistered ? styles.smallBtnGhost : styles.smallBtnPrimary,
                    ]}
                    onPress={() => onToggleRegister(s.id)}
                    activeOpacity={0.9}
                  >
                    <Ionicons
                      name={s.isRegistered ? "checkmark" : "add"}
                      size={16}
                      color={s.isRegistered ? "#1F2937" : "#FFFFFF"}
                    />
                    <Text
                      style={[
                        styles.smallBtnText,
                        s.isRegistered ? styles.smallBtnTextDark : styles.smallBtnTextLight,
                      ]}
                    >
                      {s.isRegistered ? "Registered" : "Register"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* WEEKLY PLAN */}
        <View style={styles.section}>
          <View style={styles.weekHeader}>
            <View style={styles.weekHeaderLeft}>
              <Ionicons name="calendar-outline" size={18} color="#1F2937" />
              <Text style={styles.sectionTitle}>This Week&apos;s Live Schedule</Text>
            </View>

            <TouchableOpacity
              onPress={() => Alert.alert("TODO", "Navigate to full weekly calendar view.")}
              style={styles.weekMore}
              activeOpacity={0.9}
            >
              <Text style={styles.weekMoreText}>View all</Text>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekCard}>
            {weeklyPlan.map((w, idx) => (
              <View
                key={w.day}
                style={[
                  styles.weekRow,
                  idx !== weeklyPlan.length - 1 && styles.weekRowDivider,
                ]}
              >
                <Text style={styles.weekDay}>{w.day}</Text>
                <View style={styles.weekRight}>
                  <Text style={styles.weekSlots}>{w.slots}</Text>
                  <Text style={styles.weekCount}>{w.classesCount} classes</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   Styles (Calm + neutral + orange CTA)
========================= */

const BG = "#F6F5F2";
const CARD = "#FFFFFF";
const INK = "#1F2937";
const MUTED = "#6B7280";
const LINE = "#E7E5E4";
const CTA = "#E5A56A";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  topBar: {
    paddingHorizontal: 18,
    paddingTop: Platform.select({ ios: 8, android: 10 }),
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarTitle: { fontSize: 20, fontWeight: "700", color: INK },
  topBarRight: { flexDirection: "row", alignItems: "center", gap: 12 },

  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#6FA38E",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontWeight: "700" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 18 },

  headerBlock: { alignItems: "center", paddingVertical: 12 },
  h1: { fontSize: 30, fontWeight: "800", color: INK, letterSpacing: 0.2 },
  sub: { marginTop: 6, fontSize: 16, color: MUTED },
  leaf: { fontSize: 16 },

  // LIVE NOW (aligned with Today's Practice)
  liveShell: {
    marginTop: 10,
    backgroundColor: "#E9EEF0",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DAD6CF",
  },
  liveBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  liveNowBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDE2E2",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    marginRight: 10,
  },
  liveNowText: { fontWeight: "800", color: "#B91C1C", letterSpacing: 0.3 },

  remainingPill: {
    backgroundColor: "#EFEDEA",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  remainingText: { color: INK, fontWeight: "700" },

  liveHeroCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E6E2DA",
  },

  liveHeroTopChips: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  heroChipDark: {
    backgroundColor: "#495057",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroChipTextDark: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },

  heroChipSoft: {
    backgroundColor: CTA,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroChipTextSoft: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },

  heroImageWrap: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#D6D3D1",
    position: "relative",
  },
  heroImage: { width: "100%", height: 220 },

  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroTextWrap: { position: "absolute", left: 14, right: 14, bottom: 14 },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "900", letterSpacing: 0.2 },
  heroInstructor: {
    marginTop: 6,
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "700",
  },
  heroMetaRow: { marginTop: 10, flexDirection: "row", gap: 16 },
  heroMetaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroMetaText: { color: "#F8FAFC", fontWeight: "800" },

  heroDescription: {
    marginTop: 12,
    marginBottom: 12,
    color: MUTED,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    paddingHorizontal: 4,
  },

  primaryBtn: {
    backgroundColor: CTA,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryBtnLocked: { opacity: 0.92 },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 16, letterSpacing: 0.2 },

  emptyLiveCard: {
    marginTop: 10,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: LINE,
    alignItems: "center",
    gap: 6,
  },
  emptyLiveTitle: { marginTop: 6, fontSize: 16, fontWeight: "800", color: INK },
  emptyLiveSub: { textAlign: "center", color: MUTED, lineHeight: 20 },

  unlockCard: {
    marginTop: 14,
    backgroundColor: "#EEF2EF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE5DF",
    alignItems: "center",
  },
  unlockIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E2DA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  unlockTitle: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2, textAlign: "center" },
  unlockSub: {
    marginTop: 8,
    textAlign: "center",
    color: MUTED,
    lineHeight: 20,
    maxWidth: 320,
    fontWeight: "600",
  },

  unlockBullets: {
    width: "100%",
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8E4DC",
  },
  bulletRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  bulletText: { color: INK, fontWeight: "700" },

  secondaryBtn: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: INK, fontWeight: "900", fontSize: 15 },

  section: { marginTop: 18 },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: INK, marginBottom: 12 },

  scheduleCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: LINE,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    position: "relative",
  },
  thumb: { width: 74, height: 74, borderRadius: 16, backgroundColor: "#E5E7EB" },
  reminderBtn: {
    position: "absolute",
    left: 56,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: LINE,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleMid: { flex: 1, paddingRight: 4 },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sessionTitle: { flex: 1, fontSize: 16, fontWeight: "900", color: INK },
  levelPill: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  levelText: { color: INK, fontWeight: "800", fontSize: 12 },

  sessionInstructor: { marginTop: 3, color: MUTED, fontWeight: "700" },

  sessionDesc: {
    marginTop: 6,
    color: "#7C8593",
    fontWeight: "600",
  },

  metaRow: { marginTop: 8, flexDirection: "row", gap: 16, alignItems: "center" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: MUTED, fontWeight: "700" },

  startsIn: { marginTop: 8, color: CTA, fontWeight: "900" },

  actionsRow: { marginTop: 10, flexDirection: "row", gap: 10 },
  smallBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
  },
  smallBtnSoft: { backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  smallBtnPrimary: { backgroundColor: CTA },
  smallBtnGhost: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB" },
  smallBtnText: { fontWeight: "900" },
  smallBtnTextLight: { color: "#FFFFFF" },
  smallBtnTextDark: { color: INK },

  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  weekHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  weekMore: { flexDirection: "row", alignItems: "center", gap: 4 },
  weekMoreText: { color: MUTED, fontWeight: "800" },

  weekCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LINE,
    overflow: "hidden",
  },
  weekRow: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", gap: 12 },
  weekRowDivider: { borderBottomWidth: 1, borderBottomColor: LINE },
  weekDay: { fontWeight: "900", color: INK, width: 92 },
  weekRight: { flex: 1, alignItems: "flex-end" },
  weekSlots: { color: MUTED, fontWeight: "800" },
  weekCount: { marginTop: 4, color: CTA, fontWeight: "900" },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillFree: { backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" },
  pillPaid: { backgroundColor: "#EAF6EE", borderColor: "#B7E2C4" },
  pillText: { fontWeight: "900", fontSize: 12 },
  pillTextFree: { color: MUTED },
  pillTextPaid: { color: "#1B5E20" },
});
