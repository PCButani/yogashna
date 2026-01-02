import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, MainTabParamList } from "../../types/navigation";
import { Routes } from "../../constants/routes";
import { useFavoritesStore } from "../../store/useFavoritesStore";

/**
 * ProfileScreen (Final Locked - TS/Expo Safe)
 * - No BMI
 * - No Weekly/Monthly analytics in Profile
 * - Profile = Identity + Achievements + Stats + Practice Focus + Reflection + (Journey/Settings)
 */

type Lang = "English" | "हिंदी" | "ગુજરાતી";
type Tab = "Journey" | "Settings";

type IconName = any; // Expo Ionicons name typing varies by version; keep safe to remove TS redlines.
type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Profile">,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // ✅ FIXED: Use global favorites store
  const favoritesCount = useFavoritesStore((state) => state.getFavoritesCount());

  // ---- Guest user data (no hardcoding) ----
  const user = useMemo(
    () => ({
      name: "Guest",
      email: "Sign in to sync your progress",
      initials: "G",
    }),
    []
  );

  const [lang, setLang] = useState<Lang>("English");
  const [tab, setTab] = useState<Tab>("Journey");

  // ---- Empty stats (no hardcoding) ----
  const stats = useMemo(
    () => ({
      streakDays: "—",
      sessions: "—",
      totalTimeHours: "—",
    }),
    []
  );

  const practiceFocus = useMemo(
    () => ({
      goals: ["Stress Relief", "Better Sleep"],
      preferredTime: "Morning",
      sessionLength: "12–20 min",
    }),
    []
  );

  const reflection = useMemo(
    () => ({
      label: "Inner Reflection",
      summary: "You felt more relaxed after most sessions this week.",
    }),
    []
  );

  const journeyCards = useMemo(
    () => [
      {
        iconName: "calendar-outline" as IconName,
        iconColor: "#2563EB",
        value: stats.sessions,
        label: "Sessions",
      },
      {
        iconName: "time-outline" as IconName,
        iconColor: "#16A34A",
        value: stats.totalTimeHours === "—" ? "—" : `${stats.totalTimeHours}h`,
        label: "Total Time",
      },
      {
        iconName: "flame-outline" as IconName,
        iconColor: "#F97316",
        value: stats.streakDays,
        label: "Current Streak",
      },
      {
        iconName: "heart-outline" as IconName,
        iconColor: "#EF4444",
        value: String(favoritesCount),
        label: "Favorites",
      },
    ],
    [stats.sessions, stats.totalTimeHours, stats.streakDays, favoritesCount]
  );

  const personalInfo = useMemo(
    () => ({
      age: "25 years",
      experience: "Advanced",
      sessionLength: "12–20 min",
      goals: "Stress Relief, Better Sleep",
    }),
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profile</Text>

          <View
            style={styles.headerAvatarSmall}
            accessibilityLabel="Profile avatar"
          >
            <Text style={styles.headerAvatarText}>G</Text>
          </View>
        </View>

        {/* Profile Identity */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user.initials}</Text>
            </View>
          </View>

          <Text style={styles.helloTitle}>Hello, {user.name}</Text>
          <Text style={styles.emailText}>
            {user.email} <Text style={styles.sparkle}>✨</Text>
          </Text>

          {/* Language Selector */}
          <View style={styles.langRow}>
            <View style={styles.langItem}>
              <LangPill
                active={lang === "English"}
                label="English"
                iconName="globe-outline"
                onPress={() => setLang("English")}
              />
            </View>
            <View style={styles.langItem}>
              <LangPill
                active={lang === "हिंदी"}
                label="हिंदी"
                onPress={() => setLang("हिंदी")}
              />
            </View>
            <View style={styles.langItem}>
              <LangPill
                active={lang === "ગુજરાતી"}
                label="ગુજરાતી"
                onPress={() => setLang("ગુજરાતી")}
              />
            </View>
          </View>
        </View>

        {/* Achievements - EMPTY STATE */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name={"sparkles-outline"} size={18} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Your Sacred Achievements</Text>
            </View>
          </View>

          <View style={styles.emptyStateContainer}>
            <Ionicons name="trophy-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No achievements yet</Text>
            <Text style={styles.emptyStateText}>
              Complete your first session to unlock badges.
            </Text>
          </View>
        </View>

        {/* Top Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statWrap}>
            <StatCard
              iconName="flame-outline"
              iconBg="#E8F2E8"
              iconColor="#2E7D32"
              value={stats.streakDays}
              label="Day Streak"
            />
          </View>
          <View style={styles.statWrap}>
            <StatCard
              iconName="calendar-outline"
              iconBg="#EAF1FB"
              iconColor="#2563EB"
              value={stats.sessions}
              label="Sessions"
            />
          </View>
          <View style={styles.statWrap}>
            <StatCard
              iconName="time-outline"
              iconBg="#FCEFE6"
              iconColor="#F97316"
              value={stats.totalTimeHours === "—" ? "—" : `${stats.totalTimeHours}h`}
              label="Total Time"
            />
          </View>
        </View>

        <Text style={styles.statsNote}>
          Your stats will appear after your first session.
        </Text>

        {/* My Yoga Abhyāsa */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name={"compass-outline"} size={18} color="#16A34A" />
              <Text style={styles.sectionTitle}>My Yoga Abhyāsa</Text>
            </View>

            <Text style={styles.comingSoonText}>Coming soon</Text>
          </View>

          <View style={styles.focusPillsWrap}>
            {practiceFocus.goals.map((g, idx) => (
              <View
                key={`${g}-${idx}`}
                style={[styles.focusPill, idx > 0 && styles.ml10]}
              >
                <Text style={styles.focusPillText}>{g}</Text>
              </View>
            ))}
          </View>

          <View style={styles.focusGrid}>
            <View style={[styles.focusItem, styles.mr12]}>
              <Text style={styles.focusLabel}>Preferred Time</Text>
              <Text style={styles.focusValue}>{practiceFocus.preferredTime}</Text>
            </View>
            <View style={styles.focusItem}>
              <Text style={styles.focusLabel}>Session Length</Text>
              <Text style={styles.focusValue}>{practiceFocus.sessionLength}</Text>
            </View>
          </View>
        </View>

        {/* Inner Reflection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name={"leaf-outline"} size={18} color="#10B981" />
            <Text style={styles.sectionTitle}>{reflection.label}</Text>
          </View>
          <Text style={styles.reflectionText}>{reflection.summary}</Text>
        </View>

        {/* Tabs: ONLY Journey + Settings */}
        <View style={styles.tabRow}>
          <View style={styles.tabWrap}>
            <TabPill
              active={tab === "Journey"}
              label="Journey"
              onPress={() => setTab("Journey")}
            />
          </View>
          <View style={styles.tabWrap}>
            <TabPill
              active={tab === "Settings"}
              label="Settings"
              onPress={() => setTab("Settings")}
            />
          </View>
        </View>

        {/* Tab Content */}
        {tab === "Journey" ? (
          <>
            <View style={styles.grid2}>
              {journeyCards.map((c, idx) => (
                <View
                  key={`${c.label}-${idx}`}
                  style={[
                    styles.metricCard,
                    idx % 2 === 0 ? styles.mr12 : null,
                    idx < journeyCards.length - 2 ? styles.mb12 : null,
                  ]}
                >
                  <Ionicons name={c.iconName} size={20} color={c.iconColor} />
                  <Text style={styles.metricValue}>{c.value}</Text>
                  <Text style={styles.metricLabel}>{c.label}</Text>
                </View>
              ))}
            </View>

            {/* Personal Information (NO BMI) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name={"person-outline"} size={18} color="#0F172A" />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={[styles.infoItem, styles.mr12]}>
                  <InfoItem label="Age" value={personalInfo.age} />
                </View>
                <View style={styles.infoItem}>
                  <InfoItem label="Experience" value={personalInfo.experience} />
                </View>

                <View style={[styles.infoItem, styles.mr12]}>
                  <InfoItem
                    label="Session Length"
                    value={personalInfo.sessionLength}
                  />
                </View>
                <View style={styles.infoItem}>
                  <InfoItem label="Goals" value={personalInfo.goals} />
                </View>
              </View>

              <Text style={styles.miniNote}>
                Your yoga journey is not measured by body metrics — it’s measured
                by consistency and calm. 🌿
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name={"settings-outline"} size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>Settings</Text>
            </View>

            <SettingsRow
              iconName="notifications-outline"
              title="Notifications"
              subtitle="Reminders & gentle nudges"
              onPress={() => navigation.navigate(Routes.NOTIFICATION_SETTINGS)}
            />
            <Divider />
            <SettingsRow
              iconName="card-outline"
              title="Subscription"
              subtitle="Plan, billing & access"
            />
            <Divider />
            <SettingsRow
              iconName="lock-closed-outline"
              title="Privacy"
              subtitle="Your data, your control"
            />
            <Divider />
            <SettingsRow
              iconName="help-circle-outline"
              title="Help & Support"
              subtitle="FAQ, contact us"
            />
            <Divider />
            <SettingsRow
              iconName="log-out-outline"
              title="Logout"
              subtitle="Sign out of your account"
              danger
            />
          </View>
        )}

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ----------------------- Components ----------------------- */

function LangPill({
  active,
  label,
  iconName,
  onPress,
}: {
  active: boolean;
  label: string;
  iconName?: IconName;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.langPill, active && styles.langPillActive]}
    >
      {iconName ? (
        <Ionicons
          name={iconName}
          size={16}
          color={active ? "#0F172A" : "#334155"}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text style={[styles.langText, active && styles.langTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StatCard({
  iconName,
  iconBg,
  iconColor,
  value,
  label,
}: {
  iconName: IconName;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TabPill({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.tabPill, active && styles.tabPillActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SettingsRow({
  iconName,
  title,
  subtitle,
  danger,
  onPress,
}: {
  iconName: IconName;
  title: string;
  subtitle: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      activeOpacity={0.8}
      onPress={onPress || (() => {})}
      disabled={!onPress}
    >
      <View style={styles.settingsLeft}>
        <View
          style={[
            styles.settingsIconWrap,
            danger ? { backgroundColor: "#FEE2E2" } : null,
          ]}
        >
          <Ionicons
            name={iconName}
            size={18}
            color={danger ? "#DC2626" : "#0F172A"}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.settingsTitle, danger ? { color: "#DC2626" } : null]}>
            {title}
          </Text>
          <Text style={styles.settingsSubtitle}>{subtitle}</Text>
        </View>
      </View>

      {onPress && <Ionicons name={"chevron-forward"} size={18} color="#94A3B8" />}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* ----------------------------- Styles ----------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FBF7F2" },
  container: { padding: 16, paddingBottom: 28 },

  mr10: { marginRight: 10 },
  ml10: { marginLeft: 10 },
  mr12: { marginRight: 12 },
  mb12: { marginBottom: 12 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#0F172A" },
  headerAvatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5B8C6A",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: { color: "#FFFFFF", fontWeight: "700" },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 12,
  },
  avatarWrap: { alignItems: "center", marginTop: 4, marginBottom: 10 },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
  },
  avatarText: { fontSize: 26, fontWeight: "800", color: "#CBD5E1" },

  helloTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
  },
  emailText: {
    textAlign: "center",
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 12,
  },
  sparkle: { color: "#F59E0B" },

  langRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 2,
  },
  langItem: { marginRight: 10, marginBottom: 10 },

  langPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
  },
  langPillActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(15,23,42,0.14)",
  },
  langText: { fontSize: 14, color: "#334155", fontWeight: "600" },
  langTextActive: { color: "#0F172A" },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { marginLeft: 8, fontSize: 16, fontWeight: "800", color: "#0F172A" },

  comingSoonText: { fontSize: 13, fontWeight: "700", color: "#94A3B8" },

  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#64748B",
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "600",
  },

  achievementRow: { flexDirection: "row", marginTop: 14 },
  achievementTileWrap: { flex: 1 },
  achievementTile: {
    height: 88,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  toneGreen: { backgroundColor: "rgba(34,197,94,0.25)" },
  toneAmber: { backgroundColor: "rgba(245,158,11,0.25)" },
  toneBlue: { backgroundColor: "rgba(59,130,246,0.22)" },
  achievementEmoji: { fontSize: 18, marginBottom: 8 },
  achievementText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  achievementMeta: {
    marginTop: 12,
    textAlign: "center",
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  centerEmoji: { textAlign: "center", marginTop: 6 },

  statsRow: { flexDirection: "row", marginBottom: 8 },
  statWrap: { flex: 1, marginRight: 10 },

  statsNote: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 20, fontWeight: "900", color: "#0F172A" },
  statLabel: { marginTop: 4, fontSize: 12.5, color: "#64748B", fontWeight: "700" },

  focusPillsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  focusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(16,185,129,0.10)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.18)",
    marginBottom: 10,
  },
  focusPillText: { color: "#0F172A", fontWeight: "700", fontSize: 13 },

  focusGrid: { flexDirection: "row", marginTop: 14 },
  focusItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
  },
  focusLabel: { fontSize: 12, color: "#64748B", fontWeight: "700" },
  focusValue: { marginTop: 6, fontSize: 14, color: "#0F172A", fontWeight: "800" },

  reflectionText: {
    marginTop: 10,
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
    lineHeight: 20,
  },

  tabRow: { flexDirection: "row", marginBottom: 12 },
  tabWrap: { flex: 1, marginRight: 10 },
  tabPill: {
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    alignItems: "center",
  },
  tabPillActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(15,23,42,0.14)",
  },
  tabText: { fontSize: 14, fontWeight: "800", color: "#475569" },
  tabTextActive: { color: "#0F172A" },

  grid2: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  metricCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
  },
  metricValue: { marginTop: 10, fontSize: 22, fontWeight: "900", color: "#0F172A" },
  metricLabel: { marginTop: 4, fontSize: 13, color: "#64748B", fontWeight: "700" },

  infoGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 14 },
  infoItem: { width: "48%", marginBottom: 12 },
  infoLabel: { fontSize: 12, color: "#64748B", fontWeight: "800" },
  infoValue: { marginTop: 6, fontSize: 14, color: "#0F172A", fontWeight: "800" },

  miniNote: {
    marginTop: 14,
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "600",
    lineHeight: 18,
  },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingsLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingsIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingsTitle: { fontSize: 14.5, fontWeight: "900", color: "#0F172A" },
  settingsSubtitle: { marginTop: 3, fontSize: 12.5, color: "#64748B", fontWeight: "600" },

  divider: { height: 1, backgroundColor: "rgba(15,23,42,0.06)" },
});
