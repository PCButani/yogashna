import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getProgramTemplateById } from "../../data/sources/ProgramTemplates";
import { getProgramScheduleById, type ScheduleDay, type ScheduleSession } from "../../data/sources/ProgramTemplateSchedules";
import { Routes } from "../../constants/routes";
import { useFavoritesStore } from "../../store/useFavoritesStore";
import { useProgressStore } from "../../store/useProgressStore";
import ContraindicationsModal from "../../components/safety/ContraindicationsModal";
import { hasSafetyAcknowledgment, saveSafetyAcknowledgment } from "../../utils/safetyAck";

export default function ProgramDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const programId = route.params?.programId;

  // ✅ Global stores
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const isSessionCompleted = useProgressStore((state) => state.isSessionCompleted);

  // Modal state
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Load ProgramTemplate (master content) and Schedule (day/session data)
  const programTemplate = getProgramTemplateById(programId);
  const schedule = getProgramScheduleById(programId);

  // ✅ FIXED: Calculate actual completed days from progress store
  const completedDaysCount = useMemo(() => {
    if (!schedule) return 0;

    let count = 0;
    schedule.days.forEach((day) => {
      // Check if ALL sessions in this day are completed
      const allSessionsCompleted = day.sessions.every((session) =>
        isSessionCompleted({
          programId,
          dayId: day.dayNumber.toString(),
          videoId: session.id,
        })
      );

      if (allSessionsCompleted) {
        count++;
      }
    });

    return count;
  }, [schedule, programId, isSessionCompleted]);

  const currentDay = useMemo(() => {
    if (!schedule) return null;
    return schedule.days.find((d) => d.state === "current");
  }, [schedule]);

  // Check if program requires safety acknowledgment
  const requiresSafetyCheck = useMemo(() => {
    if (!programTemplate) return false;
    return programTemplate.safetyNotes && programTemplate.safetyNotes.length > 0;
  }, [programTemplate]);

  // ✅ FIXED: Safety check wrapper - shows modal if needed, otherwise proceeds
  const performSafetyCheck = async (action: () => void) => {
    if (!requiresSafetyCheck) {
      // No safety notes, proceed immediately
      action();
      return;
    }

    // Check if user has already acknowledged
    const hasAck = await hasSafetyAcknowledgment(programId);
    if (hasAck) {
      // Already acknowledged within 30 days, proceed
      action();
      return;
    }

    // Show modal and store pending action
    setPendingAction(() => action);
    setShowSafetyModal(true);
  };

  // Handle modal continue
  const handleSafetyContinue = async () => {
    try {
      // Save acknowledgment
      await saveSafetyAcknowledgment(programId);

      // Close modal
      setShowSafetyModal(false);

      // Execute pending action
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } catch (error) {
      console.error('Failed to save safety acknowledgment:', error);
      // Still proceed even if save fails
      setShowSafetyModal(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    }
  };

  // Handle modal cancel
  const handleSafetyCancel = () => {
    setShowSafetyModal(false);
    setPendingAction(null);
  };

  // ✅ FIXED: Direct navigation functions without safety check
  const navigateToPlayDay = (day: ScheduleDay) => {
    navigation.navigate(Routes.COMMON_PLAYER, {
      playlist: day.sessions,
      startIndex: 0,
      context: { programId, dayNumber: day.dayNumber },
    });
  };

  const navigateToPlaySession = (day: ScheduleDay, sessionIndex: number) => {
    navigation.navigate(Routes.COMMON_PLAYER, {
      playlist: day.sessions,
      startIndex: sessionIndex,
      context: { programId, dayNumber: day.dayNumber },
    });
  };

  // ✅ FIXED: Wrapped handlers that include safety check
  const handlePlayDay = (day: ScheduleDay) => {
    performSafetyCheck(() => navigateToPlayDay(day));
  };

  const handlePlaySession = (day: ScheduleDay, sessionIndex: number) => {
    performSafetyCheck(() => navigateToPlaySession(day, sessionIndex));
  };

  const handleStartContinue = () => {
    if (!currentDay) return;
    performSafetyCheck(() => navigateToPlayDay(currentDay));
  };

  if (!programTemplate || !schedule) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Program Not Found</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Program not found</Text>
          <Text style={styles.emptySub}>
            This program doesn't exist or has been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFav = isFavorite(programId);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Program Overview</Text>

          {/* Favorite button */}
          <TouchableOpacity
            onPress={() => toggleFavorite(programId)}
            style={styles.favoriteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color={isFav ? "#E53E3E" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        {/* Banner Image from ProgramTemplate */}
        <View style={styles.bannerWrap}>
          <Image
            source={{ uri: programTemplate.heroImage }}
            style={styles.bannerImage}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Helper Text */}
          <View style={styles.helperBox}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.helperText}>
              This is a guided program from the library. Your daily Yoga Abhyāsa is managed separately.
            </Text>
          </View>

          {/* Title from ProgramTemplate */}
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{programTemplate.title}</Text>
            {programTemplate.sanskritTitle && (
              <Text style={styles.sanskritTitle}>{programTemplate.sanskritTitle}</Text>
            )}
            <Text style={styles.subtitle}>{programTemplate.subtitle}</Text>
          </View>

          {/* Meta Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="bar-chart-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{programTemplate.levelLabel}</Text>
            </View>

            <View style={styles.dot} />

            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{schedule.totalDays} days</Text>
            </View>

            <View style={styles.dot} />

            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>
                ~{schedule.avgDailyMinutes} min/day
              </Text>
            </View>
          </View>

          {/* Benefits from ProgramTemplate */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <View style={styles.benefitsWrap}>
              {programTemplate.benefits.map((benefit, idx) => (
                <View key={idx} style={styles.benefitChip}>
                  <Ionicons name="checkmark-circle" size={16} color="#2E6B4F" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Equipment from ProgramTemplate */}
          {programTemplate.whatYouNeed && programTemplate.whatYouNeed.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What you'll need</Text>
              <View style={styles.equipmentWrap}>
                {programTemplate.whatYouNeed.map((item, idx) => (
                  <View key={idx} style={styles.equipmentItem}>
                    <View style={styles.equipmentDot} />
                    <Text style={styles.equipmentText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Safety Notes from ProgramTemplate */}
          {programTemplate.safetyNotes && programTemplate.safetyNotes.length > 0 && (
            <View style={styles.contraindicationsBox}>
              <View style={styles.contraindicationsHeader}>
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.contraindicationsTitle}>
                  Safety Notes
                </Text>
              </View>
              {programTemplate.safetyNotes.map((item, idx) => (
                <View key={idx} style={styles.contraindicationItem}>
                  <View style={styles.contraindicationDot} />
                  <Text style={styles.contraindicationText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleStartContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaText}>
              {completedDaysCount === 0
                ? "Try this Program"
                : "Continue Program"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Day List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Program Sessions</Text>
            <Text style={styles.sectionSubtitle}>
              {completedDaysCount} of {schedule.totalDays} sessions explored
            </Text>
          </View>

          <View style={styles.daysList}>
            {schedule.days.map((day) => (
              <DayCard
                key={day.dayNumber}
                day={day}
                programId={programId}
                isSessionCompleted={isSessionCompleted}
                onPlayDay={() => handlePlayDay(day)}
                onPlaySession={(sessionIndex) => handlePlaySession(day, sessionIndex)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Safety Modal */}
      {programTemplate.safetyNotes && programTemplate.safetyNotes.length > 0 && (
        <ContraindicationsModal
          visible={showSafetyModal}
          programTitle={programTemplate.title}
          safetyNotes={programTemplate.safetyNotes}
          onCancel={handleSafetyCancel}
          onContinue={handleSafetyContinue}
        />
      )}
    </SafeAreaView>
  );
}

/* =========================================================
   DAY CARD COMPONENT
========================================================= */

function DayCard({
  day,
  programId,
  isSessionCompleted,
  onPlayDay,
  onPlaySession,
}: {
  day: ScheduleDay;
  programId: string;
  isSessionCompleted: (sessionId: { programId?: string; dayId?: string; videoId: string }) => boolean;
  onPlayDay: () => void;
  onPlaySession: (sessionIndex: number) => void;
}) {
  const { dayNumber, state, sessions } = day;

  // ✅ FIXED: Calculate real completion status from progress store
  const completedSessionsCount = useMemo(() => {
    return sessions.filter((session) =>
      isSessionCompleted({
        programId,
        dayId: dayNumber.toString(),
        videoId: session.id,
      })
    ).length;
  }, [sessions, programId, dayNumber, isSessionCompleted]);

  const isFullyCompleted = completedSessionsCount === sessions.length;
  const isPartiallyCompleted = completedSessionsCount > 0 && !isFullyCompleted;

  const isLocked = state === "locked";
  const isCurrent = state === "current";

  const canPlay = isCurrent || isFullyCompleted || isPartiallyCompleted;

  const totalDuration = sessions.reduce((sum, s) => sum + s.durationMin, 0);

  return (
    <View style={[styles.dayCard, isCurrent && styles.dayCardCurrent, isLocked && styles.dayCardLocked]}>
      {/* Day Header */}
      <View style={styles.dayHeader}>
        <View style={styles.dayHeaderLeft}>
          <Ionicons
            name={
              isFullyCompleted
                ? "checkmark-circle"
                : isPartiallyCompleted
                ? "checkmark-circle-outline"
                : isCurrent
                ? "arrow-forward-circle"
                : "lock-closed"
            }
            size={24}
            color={isLocked ? "#9CA3AF" : isCurrent || isPartiallyCompleted ? "#2E6B4F" : "#2E6B4F"}
          />
          <View style={styles.dayHeaderText}>
            <Text style={styles.dayNumber}>Day {dayNumber}</Text>
            <Text style={styles.dayDuration}>{totalDuration} min total • {sessions.length} sessions</Text>
          </View>
        </View>

        {/* Status Pill */}
        <View
          style={[
            styles.statusPill,
            isFullyCompleted && styles.statusPillCompleted,
            isPartiallyCompleted && styles.statusPillPartial,
            isCurrent && !isPartiallyCompleted && styles.statusPillCurrent,
            isLocked && styles.statusPillLocked,
          ]}
        >
          <Text style={styles.statusPillText}>
            {isFullyCompleted
              ? "Completed"
              : isPartiallyCompleted
              ? `${completedSessionsCount} / ${sessions.length} completed`
              : isCurrent
              ? "Up Next"
              : "Locked"}
          </Text>
        </View>
      </View>

      {/* Session List */}
      <View style={styles.sessionsWrap}>
        {sessions.map((session, idx) => {
          const sessionCompleted = isSessionCompleted({
            programId,
            dayId: dayNumber.toString(),
            videoId: session.id,
          });

          return (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionTile,
                sessionCompleted && styles.sessionTileCompleted,
              ]}
              onPress={() => onPlaySession(idx)}
              disabled={isLocked}
              activeOpacity={0.7}
            >
              <View style={styles.sessionIcon}>
                <Ionicons
                  name={sessionCompleted ? "checkmark-circle" : "play-circle-outline"}
                  size={20}
                  color={isLocked ? "#D1D5DB" : sessionCompleted ? "#2E6B4F" : "#2E6B4F"}
                />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionTitle, isLocked && styles.sessionTitleLocked]} numberOfLines={1}>
                  {session.title}
                </Text>
                <View style={styles.sessionMeta}>
                  <Text style={styles.sessionMetaText}>{session.durationMin} min</Text>
                  <View style={styles.sessionDot} />
                  <Text style={styles.sessionMetaText}>{session.style}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isLocked ? "#D1D5DB" : "#9CA3AF"} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Play Day Button */}
      {canPlay && (
        <TouchableOpacity
          style={styles.playDayButton}
          onPress={onPlayDay}
          activeOpacity={0.9}
        >
          <Ionicons name="play" size={16} color="#FFFFFF" />
          <Text style={styles.playDayText}>Play Full Day</Text>
        </TouchableOpacity>
      )}

      {/* Locked Helper */}
      {isLocked && (
        <Text style={styles.lockedHelper}>
          Complete previous sessions to unlock
        </Text>
      )}
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F7FAF8",
    borderWidth: 1,
    borderColor: "#E6EFE9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
  },

  favoriteBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F7FAF8",
    borderWidth: 1,
    borderColor: "#E6EFE9",
    alignItems: "center",
    justifyContent: "center",
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
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },

  helperBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  helperText: {
    flex: 1,
    fontSize: 12.5,
    color: "#6B7280",
    lineHeight: 17,
    fontWeight: "600",
  },

  titleWrap: {
    marginBottom: 16,
  },
  title: {
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
  subtitle: {
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },

  benefitsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  benefitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F0F9F5",
    borderWidth: 1,
    borderColor: "#C6E7D3",
  },
  benefitText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2E6B4F",
  },

  equipmentWrap: {
    marginTop: 10,
  },
  equipmentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  equipmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2E6B4F",
    marginRight: 10,
  },
  equipmentText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },

  contraindicationsBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  contraindicationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  contraindicationsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
  },
  contraindicationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  contraindicationDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#DC2626",
    marginRight: 10,
    marginTop: 6,
  },
  contraindicationText: {
    fontSize: 13,
    color: "#991B1B",
    lineHeight: 18,
    flex: 1,
  },

  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E6B4F",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 32,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  daysList: {
    marginTop: 12,
    gap: 16,
  },

  // Day Card Styles
  dayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  dayCardCurrent: {
    borderColor: "#2E6B4F",
    backgroundColor: "#F3FAF6",
  },
  dayCardLocked: {
    opacity: 0.65,
  },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  dayHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  dayHeaderText: {
    flex: 1,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  dayDuration: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },

  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillCompleted: {
    backgroundColor: "#E7F6EC",
    borderColor: "#BFE7CC",
  },
  statusPillPartial: {
    backgroundColor: "#F0F9F5",
    borderColor: "#C6E7D3",
  },
  statusPillCurrent: {
    backgroundColor: "#FFF3E6",
    borderColor: "#F3D3B5",
  },
  statusPillLocked: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },

  sessionsWrap: {
    gap: 8,
    marginBottom: 12,
  },
  sessionTile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sessionTileCompleted: {
    backgroundColor: "#F0F9F5",
    borderColor: "#C6E7D3",
  },
  sessionIcon: {
    marginRight: 10,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sessionTitleLocked: {
    color: "#9CA3AF",
  },
  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionMetaText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  sessionDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },

  playDayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E6B4F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  playDayText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  lockedHelper: {
    fontSize: 11.5,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
  },

  emptyWrap: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6EFE9",
    backgroundColor: "#F7FAF8",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
