import React, { useMemo, useState } from "react";
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
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootStackParamList, MainTabParamList, WellnessCategory } from "../../types/navigation";
import { Routes } from "../../constants/routes";

const { width } = Dimensions.get("window");

/* =========================
   TYPES
========================= */

type LibrarySectionKey =
  | "Health Support"
  | "Lifestyle & Habits"
  | "Fitness & Flexibility"
  | "Mindfulness"
  | "Office Yoga";

type LibraryItem = {
  id: string;
  section: LibrarySectionKey;
  title: string;
  instructor: string;
  description: string;
  durationLabel: string;
  rating: number;
  levelTag?: string;
  focusTag?: string;
  thumbnail: string;
  isFavorite?: boolean;
};

/* =========================
   MOCK DATA
========================= */

const ALL_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "hs1",
    section: "Health Support",
    title: "Back Pain Relief Flow",
    instructor: "Ari Sol",
    description: "Gentle spine mobility to ease lower back tension and stiffness.",
    durationLabel: "14 min",
    rating: 4.8,
    levelTag: "Gentle",
    focusTag: "Back Care",
    thumbnail:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "hs2",
    section: "Health Support",
    title: "Diabetes Support Stretch",
    instructor: "Willow Grace",
    description: "Support metabolism and circulation with a slow, steady sequence.",
    durationLabel: "18 min",
    rating: 4.7,
    levelTag: "All Levels",
    focusTag: "Metabolic",
    thumbnail:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "hs3",
    section: "Health Support",
    title: "Neck & Shoulder Release",
    instructor: "Luna Nocturne",
    description: "Unwind desk tightness and tension headaches with easy movements.",
    durationLabel: "10 min",
    rating: 4.9,
    levelTag: "Beginner",
    focusTag: "Relief",
    thumbnail:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: "lh1",
    section: "Lifestyle & Habits",
    title: "Morning Energy Reset",
    instructor: "Ari Sol",
    description: "Wake up your body with a short routine you can repeat daily.",
    durationLabel: "12 min",
    rating: 4.8,
    levelTag: "All Levels",
    focusTag: "Morning",
    thumbnail:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "lh2",
    section: "Lifestyle & Habits",
    title: "Better Sleep Wind-Down",
    instructor: "Luna Nocturne",
    description: "A calming evening flow + breath to prepare for deep sleep.",
    durationLabel: "16 min",
    rating: 4.9,
    levelTag: "Gentle",
    focusTag: "Sleep",
    thumbnail:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: "ff1",
    section: "Fitness & Flexibility",
    title: "Hip Opening Flow",
    instructor: "Willow Grace",
    description: "Open hips, improve mobility, and reduce lower-back tightness.",
    durationLabel: "18 min",
    rating: 4.7,
    levelTag: "Gentle",
    focusTag: "Mobility",
    thumbnail:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ff2",
    section: "Fitness & Flexibility",
    title: "7-Day Flexibility Challenge",
    instructor: "Multiple Teachers",
    description: "One week. Daily sessions. Noticeable flexibility improvement.",
    durationLabel: "7 days",
    rating: 4.8,
    levelTag: "All Levels",
    focusTag: "Challenge",
    thumbnail:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: "mf1",
    section: "Mindfulness",
    title: "Breath Reset",
    instructor: "Ari Sol",
    description: "A calming breath practice for stress relief and better focus.",
    durationLabel: "6 min",
    rating: 4.9,
    levelTag: "Beginner",
    focusTag: "Calm",
    thumbnail:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "mf2",
    section: "Mindfulness",
    title: "5-Min Meditation Break",
    instructor: "Luna Nocturne",
    description: "A short guided reset for clarity, patience, and calm attention.",
    durationLabel: "5 min",
    rating: 4.8,
    levelTag: "Beginner",
    focusTag: "Mind",
    thumbnail:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: "of1",
    section: "Office Yoga",
    title: "Desk Posture Fix",
    instructor: "Willow Grace",
    description: "Quick posture routine for neck, shoulders, and upper back.",
    durationLabel: "7 min",
    rating: 4.7,
    levelTag: "Beginner",
    focusTag: "Desk",
    thumbnail:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "of2",
    section: "Office Yoga",
    title: "2-Min Chair Stretch",
    instructor: "Ari Sol",
    description: "Micro-break stretch you can do between meetings—no mat needed.",
    durationLabel: "2 min",
    rating: 4.8,
    levelTag: "Beginner",
    focusTag: "Quick",
    thumbnail:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  },
];

const SECTION_ORDER: LibrarySectionKey[] = [
  "Health Support",
  "Lifestyle & Habits",
  "Fitness & Flexibility",
  "Mindfulness",
  "Office Yoga",
];

// IMPORTANT: map Library section → WellnessGoalsScreen category
const MAP_TO_WELLNESS_CATEGORY: Record<LibrarySectionKey, WellnessCategory> = {
  "Health Support": "Health Support",
  "Lifestyle & Habits": "Lifestyle & Habits",
  "Fitness & Flexibility": "Fitness & Flexibility",
  Mindfulness: "Beginners & Mindfulness",
  "Office Yoga": "Office Yoga",
};

// ---------- Shadow helper ----------
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

/* =========================
   SCREEN
========================= */

type LibraryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Library">,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function LibraryScreen() {
  const navigation = useNavigation<LibraryScreenNavigationProp>();

  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    const seed: Record<string, boolean> = {};
    ALL_LIBRARY_ITEMS.forEach((x) => (seed[x.id] = !!x.isFavorite));
    return seed;
  });

  const toggleFav = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredByQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_LIBRARY_ITEMS;

    return ALL_LIBRARY_ITEMS.filter((x) => {
      const hay = `${x.title} ${x.instructor} ${x.description} ${x.levelTag ?? ""} ${
        x.focusTag ?? ""
      } ${x.section}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const itemsBySection = useMemo(() => {
    const map: Record<LibrarySectionKey, LibraryItem[]> = {
      "Health Support": [],
      "Lifestyle & Habits": [],
      "Fitness & Flexibility": [],
      Mindfulness: [],
      "Office Yoga": [],
    };
    filteredByQuery.forEach((it) => map[it.section].push(it));
    return map;
  }, [filteredByQuery]);

  const onPressMore = (section: LibrarySectionKey) => {
    const wellnessCategory = MAP_TO_WELLNESS_CATEGORY[section];
    navigation.navigate(Routes.WELLNESS_GOALS, { wellnessCategory });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.statusBarSpacer} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Library</Text>
            <Text style={styles.subtitle}>Pick a section. Find the right session fast.</Text>
          </View>

          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.85}>
            <Ionicons name="options-outline" size={20} color="#111" />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#718096" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search sleep, back pain, office, breathing..."
            placeholderTextColor="#A0AEC0"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {!!query && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              style={styles.clearBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#A0AEC0" />
            </TouchableOpacity>
          )}
        </View>

        {/* SECTIONS (VERTICAL ONLY) */}
        {SECTION_ORDER.map((sectionKey) => {
          const data = itemsBySection[sectionKey] ?? [];
          const preview = data.slice(0, 2); // ✅ Only 2 cards per section

          // When searching, hide empty sections
          if (query.trim().length > 0 && preview.length === 0) return null;

          return (
            <View key={sectionKey} style={{ marginTop: 18 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{sectionKey}</Text>

                <TouchableOpacity
                  onPress={() => onPressMore(sectionKey)}
                  activeOpacity={0.85}
                  style={styles.moreBtn}
                >
                  <Text style={styles.moreText}>More</Text>
                  <Ionicons name="chevron-forward" size={16} color="#E9A46A" />
                </TouchableOpacity>
              </View>

              {preview.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search" size={18} color="#A0AEC0" />
                  <Text style={styles.emptyText}>No matches in this section.</Text>
                </View>
              ) : (
                <FlatList
                  data={preview}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.gridRow}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <VideoInfoCard
                      item={item}
                      isFavorite={!!favorites[item.id]}
                      onToggleFavorite={() => toggleFav(item.id)}
                      onPress={() => {
                        // TODO: navigate to player/details
                      }}
                    />
                  )}
                />
              )}
            </View>
          );
        })}

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   COMPONENTS
========================= */

function VideoInfoCard({
  item,
  isFavorite,
  onToggleFavorite,
  onPress,
}: {
  item: LibraryItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <View style={styles.thumbWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumb} />

        <TouchableOpacity
          onPress={onToggleFavorite}
          activeOpacity={0.85}
          style={styles.heartBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? "#E53E3E" : "#FFFFFF"}
          />
        </TouchableOpacity>

        <View style={styles.playOverlay}>
          <Ionicons name="play" size={20} color="#FFF" />
        </View>

        <View style={styles.cardBottomOverlay}>
          <View style={styles.statPill}>
            <Ionicons name="time-outline" size={14} color="#FFF" />
            <Text style={styles.statText}>{item.durationLabel}</Text>
          </View>

          <View style={[styles.statPill, { marginLeft: 8 }]}>
            <Ionicons name="star" size={14} color="#F6AD55" />
            <Text style={styles.statText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.cardInstructor} numberOfLines={1}>
          with {item.instructor}
        </Text>

        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.tagRow}>
          {!!item.levelTag && (
            <View style={[styles.chip, styles.chipGreen]}>
              <Text style={[styles.chipText, styles.chipGreenText]}>{item.levelTag}</Text>
            </View>
          )}
          {!!item.focusTag && (
            <View style={[styles.chip, styles.chipBlue]}>
              <Text style={[styles.chipText, styles.chipBlueText]}>{item.focusTag}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* =========================
   STYLES
========================= */

const CARD_GAP = 14;
const CARD_W = (width - 40 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FBFBFB" },
  statusBarSpacer: {
    height: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },
  container: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: { fontSize: 26, fontWeight: "900", color: "#2D3748" },
  subtitle: { fontSize: 14, color: "#718096", marginTop: 4, fontWeight: "600" },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...shadow(2),
  },

  searchWrap: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    ...shadow(2),
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#2D3748",
    fontWeight: "600",
    paddingVertical: 0,
  },
  clearBtn: { paddingLeft: 6 },

  sectionHeader: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: "#2D3748" },

  moreBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadow(1),
  },
  moreText: { fontSize: 13, fontWeight: "900", color: "#E9A46A", marginRight: 2 },

  emptyState: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyText: { marginLeft: 10, color: "#718096", fontWeight: "700" },

  gridRow: { justifyContent: "space-between", marginBottom: 14 },

  card: {
    width: CARD_W,
    backgroundColor: "#FFF",
    borderRadius: 24,
    overflow: "hidden",
    ...shadow(2),
  },
  thumbWrap: { height: 165, backgroundColor: "#EDF2F7" },
  thumb: { width: "100%", height: "100%" },

  heartBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  playOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  cardBottomOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  statPill: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  statText: { marginLeft: 6, color: "#FFF", fontSize: 12, fontWeight: "900" },

  cardContent: { padding: 14, paddingTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#2D3748" },
  cardInstructor: { marginTop: 6, fontSize: 13, color: "#718096", fontWeight: "700" },
  cardDesc: { marginTop: 10, fontSize: 13, color: "#718096", lineHeight: 18, fontWeight: "600" },

  tagRow: { flexDirection: "row", marginTop: 12, flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: "900" },

  chipGreen: { backgroundColor: "#EEF7F0", borderColor: "#CFE8D5" },
  chipGreenText: { color: "#79A16B" },

  chipBlue: { backgroundColor: "#EAF4FB", borderColor: "#CFE3F2" },
  chipBlueText: { color: "#5B8FAF" },
});
