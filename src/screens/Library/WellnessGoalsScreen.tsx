import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

/* =========================================================
   TYPES
========================================================= */

type WellnessCategory =
  | "Health Support"
  | "Lifestyle & Habits"
  | "Fitness & Flexibility"
  | "Beginners & Mindfulness"
  | "Office Yoga";

type LibraryItem = {
  id: string;
  title: string;
  durationMin: number;
  intensity: "Gentle" | "Moderate" | "Strong";
  wellnessCategory: WellnessCategory;
  goal: string;
  benefit: string;
  thumbnailUrl?: string;
  isPaid?: boolean;
};

/* =========================================================
   MOCK VIDEO DATA (replace later from tracker)
========================================================= */

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=80";

const VIDEOS: LibraryItem[] = [
  {
    id: "1",
    title: "Lower Back Relief Flow",
    durationMin: 12,
    intensity: "Gentle",
    wellnessCategory: "Health Support",
    goal: "Reduce Back Pain & Improve Posture",
    benefit: "Relieves lower back pain and improves posture.",
  },
  {
    id: "2",
    title: "Diabetes Care Yoga",
    durationMin: 15,
    intensity: "Moderate",
    wellnessCategory: "Health Support",
    goal: "Manage Diabetes with Lifestyle Yoga",
    benefit: "Supports blood sugar management.",
    isPaid: true,
  },
  {
    id: "3",
    title: "Sleep Support Breathing",
    durationMin: 10,
    intensity: "Gentle",
    wellnessCategory: "Health Support",
    goal: "Improve Sleep & Reduce Insomnia",
    benefit: "Calms nervous system for better sleep.",
  },
];

/* =========================================================
   GOALS BY WELLNESS
========================================================= */

const GOALS_BY_WELLNESS: Record<WellnessCategory, string[]> = {
  "Health Support": [
    "Reduce Back Pain & Improve Posture",
    "Manage Diabetes with Lifestyle Yoga",
    "Support Weight Loss / Obesity",
    "Improve Sleep & Reduce Insomnia",
  ],
  "Lifestyle & Habits": [
    "Build Daily Consistency",
    "Improve Energy & Focus",
    "Reduce Stress Quickly",
  ],
  "Fitness & Flexibility": [
    "Improve Flexibility",
    "Strength & Stability",
  ],
  "Beginners & Mindfulness": [
    "Beginner Yoga Foundations",
    "Gentle Full-Body Reset",
  ],
  "Office Yoga": [
    "Neck & Shoulder Relief",
    "Lower Back Desk Reset",
  ],
};

/* =========================================================
   HELPERS
========================================================= */

function intensityDots(level: LibraryItem["intensity"]) {
  if (level === "Gentle") return 1;
  if (level === "Moderate") return 2;
  return 3;
}

/* =========================================================
   SCREEN
========================================================= */

export default function WellnessGoalsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const wellnessCategory: WellnessCategory =
    route.params?.wellnessCategory ?? "Health Support";

  const goals = GOALS_BY_WELLNESS[wellnessCategory] || [];

  const [activeGoal, setActiveGoal] = useState<string>(goals[0]);

  const filteredVideos = useMemo(() => {
    return VIDEOS.filter(
      (v) =>
        v.wellnessCategory === wellnessCategory &&
        (!activeGoal || v.goal === activeGoal)
    );
  }, [wellnessCategory, activeGoal]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>{wellnessCategory}</Text>
          <Text style={styles.subtitle}>
            Choose a goal & explore practices
          </Text>
        </View>
      </View>

      {/* Goals */}
      <View style={styles.goalsWrap}>
        {goals.map((g) => {
          const selected = activeGoal === g;
          return (
            <TouchableOpacity
              key={g}
              onPress={() => setActiveGoal(g)}
              style={[styles.goalChip, selected && styles.goalChipActive]}
            >
              <Text
                style={[
                  styles.goalText,
                  selected && styles.goalTextActive,
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Video Grid */}
      <FlatList
        data={filteredVideos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => <VideoTile item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No videos yet</Text>
            <Text style={styles.emptySub}>
              Videos for this goal will be added soon.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* =========================================================
   VIDEO TILE (same look as Library)
========================================================= */

function VideoTile({ item }: { item: LibraryItem }) {
  return (
    <TouchableOpacity style={styles.tile} activeOpacity={0.9}>
      <View style={styles.thumb}>
        <Image
          source={{ uri: item.thumbnailUrl || FALLBACK_IMAGE }}
          style={styles.image}
        />

        <View style={styles.playBtn}>
          <Ionicons name="play" size={16} color="#1F6F57" />
        </View>

        {item.isPaid && (
          <View style={styles.proTag}>
            <Text style={styles.proText}>PRO</Text>
          </View>
        )}
      </View>

      <Text style={styles.tileTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.tileBenefit} numberOfLines={2}>
        {item.benefit}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.tileMeta}>{item.durationMin} min</Text>
        <View style={styles.dotsRow}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                intensityDots(item.intensity) >= i && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* =========================================================
   STYLES
========================================================= */

const SCREEN_W = Dimensions.get("window").width;
const GAP = 12;
const PADDING = 18;
const TILE_W = (SCREEN_W - PADDING * 2 - GAP) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
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
  title: { fontSize: 18, fontWeight: "900", color: "#111827" },
  subtitle: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  goalsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  goalChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    backgroundColor: "#FFFFFF",
  },
  goalChipActive: {
    backgroundColor: "#EAF6F0",
    borderColor: "#BFDCCF",
  },
  goalText: { fontSize: 12, fontWeight: "800", color: "#6B7280" },
  goalTextActive: { color: "#1F6F57" },

  grid: { paddingHorizontal: 18, paddingBottom: 40 },
  tile: { width: TILE_W, marginBottom: 14 },

  thumb: {
    height: 112,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#EEE",
  },
  image: { width: "100%", height: "100%" },
  playBtn: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  proTag: {
    position: "absolute",
    left: 10,
    top: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.82)",
  },
  proText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },

  tileTitle: { fontSize: 14, fontWeight: "900", marginTop: 8 },
  tileBenefit: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tileMeta: { fontSize: 12, color: "#6B7280" },

  dotsRow: { flexDirection: "row", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E5E7EB" },
  dotActive: { backgroundColor: "#1F6F57" },

  emptyWrap: {
    marginTop: 40,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6EFE9",
    backgroundColor: "#F7FAF8",
  },
  emptyTitle: { fontSize: 16, fontWeight: "900" },
  emptySub: { fontSize: 13, color: "#6B7280", marginTop: 6 },
});
