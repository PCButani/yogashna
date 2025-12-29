import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ProgramDay } from "../data/mock/models";

type Props = {
  day: ProgramDay;
  onPress?: (day: ProgramDay) => void;
};

type IconName = keyof typeof Ionicons.glyphMap;

const DaySessionCard = ({ day, onPress }: Props) => {
  const { dayNumber, state, session } = day;

  const isLocked = state === "locked";
  const isCurrent = state === "current";
  const isCompleted = state === "completed";

  const pill = useMemo(() => {
    if (isCompleted) return { text: "Completed", style: styles.pillDone as any };
    if (isCurrent) return { text: "Up Next", style: styles.pillCurrent as any };
    return { text: "Locked", style: styles.pillLocked as any };
  }, [isCompleted, isCurrent]);

  const leftIcon: IconName = isCompleted
    ? "checkmark-circle"
    : isCurrent
    ? "arrow-forward-circle"
    : "lock-closed";

  const cardStyle = useMemo(() => {
    if (isCurrent) return [styles.card, styles.cardCurrent];
    if (isLocked) return [styles.card, styles.cardLocked];
    return styles.card;
  }, [isCurrent, isLocked]);

  const handlePress = () => {
    if (isLocked) return;
    onPress?.(day);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      disabled={isLocked}
      style={cardStyle}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Ionicons
            name={leftIcon}
            size={26}
            color={isLocked ? "#9CA3AF" : isCurrent ? "#2E6B4F" : "#2E6B4F"}
          />
        </View>

        <View style={styles.mid}>
          <Text style={styles.dayText}>Day {dayNumber}</Text>
          <Text style={styles.titleText} numberOfLines={1}>
            {session?.title ?? "Session"}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name={"time-outline"} size={14} color={"#6B7280"} />
              <Text style={styles.metaText}>{session.durationMin} min</Text>
            </View>

            <View style={styles.dot} />

            <Text style={styles.metaText}>{session.style}</Text>
          </View>

          {!!session.focusTags?.length && (
            <View style={styles.tagsRow}>
              {session.focusTags.slice(0, 3).map((t) => (
                <View key={`${dayNumber}-${t}`} style={styles.tagChip}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          )}

          {isLocked && (
            <Text style={styles.lockedHelper}>
              Complete previous sessions to unlock
            </Text>
          )}
        </View>

        <View style={styles.right}>
          <View style={[styles.pillBase, pill.style]}>
            <Text style={styles.pillText}>{pill.text}</Text>
          </View>

          <Ionicons
            name={"chevron-forward"}
            size={18}
            color={isLocked ? "#D1D5DB" : "#9CA3AF"}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(DaySessionCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardCurrent: {
    borderColor: "#2E6B4F",
    backgroundColor: "#F3FAF6",
  },
  cardLocked: {
    opacity: 0.75,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  left: {
    width: 34,
    paddingTop: 2,
  },

  mid: {
    flex: 1,
    paddingRight: 10,
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },

  dayText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
    fontWeight: "600",
  },

  titleText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    fontSize: 12.5,
    color: "#6B7280",
    fontWeight: "600",
    marginLeft: 6,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 10,
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tagChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#FBF7F2",
    borderWidth: 1,
    borderColor: "#F1E7DA",
  },

  tagText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },

  lockedHelper: {
    fontSize: 11.5,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 8,
    fontStyle: "italic",
  },

  pillBase: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },

  pillDone: {
    backgroundColor: "#E7F6EC",
    borderWidth: 1,
    borderColor: "#BFE7CC",
  },

  pillCurrent: {
    backgroundColor: "#FFF3E6",
    borderWidth: 1,
    borderColor: "#F3D3B5",
  },

  pillLocked: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
