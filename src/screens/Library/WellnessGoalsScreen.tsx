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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Routes } from "../../constants/routes";
import { mockPrograms } from "../../data/mock/programs";
import { Program } from "../../data/mock/models";

/* =========================================================
   TYPES
========================================================= */

type WellnessCategory =
  | "Health Support"
  | "Lifestyle & Habits"
  | "Fitness & Flexibility"
  | "Beginners & Mindfulness"
  | "Office Yoga";

/* =========================================================
   SCREEN
========================================================= */

export default function WellnessGoalsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const wellnessCategory: WellnessCategory =
    route.params?.wellnessCategory ?? "Health Support";

  const [searchText, setSearchText] = useState("");
  const [activeGoal, setActiveGoal] = useState<string>("All");

  // Filter programs by wellness category
  const categoryPrograms = useMemo(() => {
    return mockPrograms.filter((p) => p.category === wellnessCategory);
  }, [wellnessCategory]);

  // Extract unique goals from filtered programs
  const availableGoals = useMemo(() => {
    const goals = new Set<string>();
    categoryPrograms.forEach((p) => {
      if (p.tags && p.tags.length > 0) {
        p.tags.forEach((tag) => goals.add(tag));
      }
    });
    return ["All", ...Array.from(goals)];
  }, [categoryPrograms]);

  // Apply search and goal filters
  const filteredPrograms = useMemo(() => {
    let results = categoryPrograms;

    // Filter by goal
    if (activeGoal !== "All") {
      results = results.filter((p) => p.tags?.includes(activeGoal));
    }

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.subtitle.toLowerCase().includes(search) ||
          p.sanskritTitle?.toLowerCase().includes(search)
      );
    }

    return results;
  }, [categoryPrograms, activeGoal, searchText]);

  const handleClearFilters = () => {
    setSearchText("");
    setActiveGoal("All");
  };

  const handleProgramPress = (program: Program) => {
    navigation.navigate(Routes.PROGRAM_DETAIL, { programId: program.id });
  };

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

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{wellnessCategory}</Text>
          <Text style={styles.subtitle}>Explore sessions & programs</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sessions…"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Goal Filter Chips */}
      <View style={styles.goalsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={availableGoals}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.goalsContent}
          renderItem={({ item: goal }) => {
            const selected = activeGoal === goal;
            return (
              <TouchableOpacity
                onPress={() => setActiveGoal(goal)}
                style={[styles.goalChip, selected && styles.goalChipActive]}
              >
                <Text
                  style={[styles.goalText, selected && styles.goalTextActive]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Programs Grid */}
      <FlatList
        data={filteredPrograms}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProgramCard program={item} onPress={() => handleProgramPress(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No programs found</Text>
            <Text style={styles.emptySub}>
              {searchText || activeGoal !== "All"
                ? "Try adjusting your filters"
                : "No programs available for this category yet"}
            </Text>
            {(searchText || activeGoal !== "All") && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearBtnText}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* =========================================================
   PROGRAM CARD COMPONENT
========================================================= */

function ProgramCard({
  program,
  onPress,
}: {
  program: Program;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Thumbnail */}
      <View style={styles.cardThumb}>
        <Image
          source={{ uri: program.bannerImage }}
          style={styles.cardImage}
        />

        {/* Badges Overlay */}
        <View style={styles.badgesOverlay}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{program.level}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {program.title}
        </Text>
        {program.sanskritTitle && (
          <Text style={styles.cardSanskrit} numberOfLines={1}>
            {program.sanskritTitle}
          </Text>
        )}
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {program.subtitle}
        </Text>

        {/* Meta Row */}
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{program.totalDays} days</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>~{program.avgDailyMinutes}m</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* =========================================================
   STYLES
========================================================= */

const SCREEN_W = Dimensions.get("window").width;
const PADDING = 18;
const GAP = 12;
const CARD_W = (SCREEN_W - PADDING * 2 - GAP) / 2;

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
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  searchWrap: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
    padding: 0,
  },

  goalsWrap: {
    paddingBottom: 12,
  },
  goalsContent: {
    paddingHorizontal: 18,
    gap: 10,
  },
  goalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  goalChipActive: {
    backgroundColor: "#EAF6F0",
    borderColor: "#BFDCCF",
  },
  goalText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
  },
  goalTextActive: {
    color: "#1F6F57",
  },

  grid: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },

  card: {
    width: CARD_W,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardThumb: {
    width: "100%",
    height: 120,
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  badgesOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    gap: 6,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  levelText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#374151",
  },

  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 2,
  },
  cardSanskrit: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    fontStyle: "italic",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "700",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 6,
  },

  emptyWrap: {
    marginTop: 60,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6EFE9",
    backgroundColor: "#F7FAF8",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },
  clearBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#2E6B4F",
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
