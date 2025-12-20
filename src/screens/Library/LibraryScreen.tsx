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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// ---------- Mock Data (replace with API later) ----------
type LibraryItem = {
  id: string;
  title: string;
  instructor: string;
  description: string;
  durationLabel: string; // "20 min" or "7 days"
  rating: number; // 4.8
  levelTag?: string; // "Gentle", "All Levels"
  focusTag?: string; // "Better Sleep", "Flexibility"
  thumbnail: string;
  isFavorite?: boolean;
};

const NEW_THIS_WEEK: LibraryItem[] = [
  {
    id: "nw1",
    title: "Moon Salutation for Rest",
    instructor: "Luna Nocturne",
    description: "Prepare your body and mind for deep, relaxing sleep...",
    durationLabel: "20 min",
    rating: 4.8,
    levelTag: "Gentle",
    focusTag: "Better Sleep",
    thumbnail:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    isFavorite: false,
  },
  {
    id: "nw2",
    title: "7-Day Flexibility Challenge",
    instructor: "Multiple Teachers",
    description: "Transform your flexibility in one week with daily sessions...",
    durationLabel: "7 days",
    rating: 4.8,
    levelTag: "All Levels",
    focusTag: "Flexibility",
    thumbnail:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    isFavorite: true,
  },
];

const MORE_FOR_YOU: LibraryItem[] = [
  {
    id: "m1",
    title: "Hip Opening Flow",
    instructor: "Willow Grace",
    description: "Unwind tight hips and lower back tension with a gentle flow...",
    durationLabel: "18 min",
    rating: 4.7,
    levelTag: "Gentle",
    focusTag: "Mobility",
    thumbnail:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1200&q=80",
    isFavorite: false,
  },
  {
    id: "m2",
    title: "Breath Reset",
    instructor: "Ari Sol",
    description: "A calming breath practice for stress relief and better focus...",
    durationLabel: "6 min",
    rating: 4.9,
    levelTag: "Beginner",
    focusTag: "Calm",
    thumbnail:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    isFavorite: false,
  },
];

// ---------- Shadow helper (same as dashboard) ----------
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

// ---------- Screen ----------
export default function LibraryScreen() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Yoga" | "Breathing" | "Meditation" | "Challenges"
  >("All");

  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    const seed: Record<string, boolean> = {};
    [...NEW_THIS_WEEK, ...MORE_FOR_YOU].forEach((x) => {
      seed[x.id] = !!x.isFavorite;
    });
    return seed;
  });

  const filteredNew = useMemo(() => {
    const q = query.trim().toLowerCase();

    // This filter is intentionally simple for now.
    // Later: match activeFilter to item categories from API.
    return NEW_THIS_WEEK.filter((x) => {
      const hay = `${x.title} ${x.instructor} ${x.description} ${x.levelTag ?? ""} ${
        x.focusTag ?? ""
      }`.toLowerCase();
      const qOk = q.length === 0 || hay.includes(q);
      const filterOk = activeFilter === "All" ? true : true;
      return qOk && filterOk;
    });
  }, [query, activeFilter]);

  const filteredMore = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MORE_FOR_YOU.filter((x) => {
      const hay = `${x.title} ${x.instructor} ${x.description} ${x.levelTag ?? ""} ${
        x.focusTag ?? ""
      }`.toLowerCase();
      const qOk = q.length === 0 || hay.includes(q);
      const filterOk = activeFilter === "All" ? true : true;
      return qOk && filterOk;
    });
  }, [query, activeFilter]);

  const toggleFav = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.statusBarSpacer} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Library</Text>
            <Text style={styles.subtitle}>
              Find your next practice — without scrolling forever
            </Text>
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
            placeholder="Search yoga, breathing, sleep..."
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

        {/* FILTER PILLS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterPill
            label="All"
            active={activeFilter === "All"}
            onPress={() => setActiveFilter("All")}
          />
          <FilterPill
            label="Yoga"
            active={activeFilter === "Yoga"}
            onPress={() => setActiveFilter("Yoga")}
          />
          <FilterPill
            label="Breathing"
            active={activeFilter === "Breathing"}
            onPress={() => setActiveFilter("Breathing")}
          />
          <FilterPill
            label="Meditation"
            active={activeFilter === "Meditation"}
            onPress={() => setActiveFilter("Meditation")}
          />
          <FilterPill
            label="Challenges"
            active={activeFilter === "Challenges"}
            onPress={() => setActiveFilter("Challenges")}
          />
        </ScrollView>

        {/* NEW THIS WEEK */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New This Week</Text>
        </View>

        <FlatList
          data={filteredNew}
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
                // TODO: navigate to details/player
              }}
            />
          )}
        />

        {/* MORE FOR YOU (Optional section, compact + less images) */}
        <View style={[styles.sectionHeader, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
        </View>

        {filteredMore.map((item) => (
          <CompactVideoRow
            key={item.id}
            item={item}
            isFavorite={!!favorites[item.id]}
            onToggleFavorite={() => toggleFav(item.id)}
            onPress={() => {
              // TODO: navigate to details/player
            }}
          />
        ))}

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Components ----------
function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.pill, active ? styles.pillActive : styles.pillIdle]}
    >
      <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextIdle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

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
      {/* Thumbnail */}
      <View style={styles.thumbWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumb} />

        {/* Heart */}
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

        {/* Play */}
        <View style={styles.playOverlay}>
          <Ionicons name="play" size={20} color="#FFF" />
        </View>

        {/* Bottom stats row */}
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

      {/* Text content */}
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

function CompactVideoRow({
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
    <TouchableOpacity style={styles.rowCard} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.rowThumbWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.rowThumb} />
        <View style={styles.rowPlayOverlay}>
          <Ionicons name="play" size={16} color="#FFF" />
        </View>
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          with {item.instructor}
        </Text>

        <View style={styles.rowMeta}>
          <View style={styles.rowMetaItem}>
            <Ionicons name="time-outline" size={14} color="#718096" />
            <Text style={styles.rowMetaText}>{item.durationLabel}</Text>
          </View>
          <View style={[styles.rowMetaItem, { marginLeft: 12 }]}>
            <Ionicons name="star" size={14} color="#F6AD55" />
            <Text style={styles.rowMetaText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={onToggleFavorite}
        activeOpacity={0.85}
        style={styles.rowFavBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={18}
          color={isFavorite ? "#E53E3E" : "#A0AEC0"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ---------- Styles (Aligned with TodayDashboard) ----------
const CARD_GAP = 14;
const CARD_W = (width - 40 - CARD_GAP) / 2; // paddingHorizontal=20 each side

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

  filterRow: {
    paddingVertical: 14,
    paddingRight: 20,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
  },
  pillIdle: { backgroundColor: "#FFF", borderColor: "#E2E8F0" },
  pillActive: { backgroundColor: "#E9A46A", borderColor: "#E9A46A" },
  pillText: { fontSize: 13, fontWeight: "800" },
  pillTextIdle: { color: "#2D3748" },
  pillTextActive: { color: "#FFF" },

  sectionHeader: {
    marginTop: 4,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: "#2D3748" },

  gridRow: {
    justifyContent: "space-between",
    marginBottom: 14,
  },

  // Big grid card
  card: {
    width: CARD_W,
    backgroundColor: "#FFF",
    borderRadius: 24,
    overflow: "hidden",
    ...shadow(2),
  },

  thumbWrap: {
    height: 165,
    backgroundColor: "#EDF2F7",
  },
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
  statText: {
    marginLeft: 6,
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
  },

  cardContent: {
    padding: 14,
    paddingTop: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#2D3748" },
  cardInstructor: { marginTop: 6, fontSize: 13, color: "#718096", fontWeight: "700" },
  cardDesc: { marginTop: 10, fontSize: 13, color: "#718096", lineHeight: 18, fontWeight: "600" },

  tagRow: { flexDirection: "row", marginTop: 12, flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "900" },

  chipGreen: { backgroundColor: "#EEF7F0", borderColor: "#CFE8D5" },
  chipGreenText: { color: "#79A16B" },

  chipBlue: { backgroundColor: "#EAF4FB", borderColor: "#CFE3F2" },
  chipBlueText: { color: "#5B8FAF" },

  // Compact rows (less image-heavy)
  rowCard: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...shadow(2),
  },
  rowThumbWrap: {
    width: 74,
    height: 54,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#EDF2F7",
  },
  rowThumb: { width: "100%", height: "100%" },
  rowPlayOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "900", color: "#2D3748" },
  rowSub: { marginTop: 4, fontSize: 13, color: "#718096", fontWeight: "700" },
  rowMeta: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  rowMetaItem: { flexDirection: "row", alignItems: "center" },
  rowMetaText: { marginLeft: 6, fontSize: 12, color: "#718096", fontWeight: "700" },

  rowFavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: "#F8F9FA",
  },
});
