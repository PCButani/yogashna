import React, { useMemo, useState, ComponentProps } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* ---------- TYPES ---------- */

type LibraryItem = {
  id: string;
  title: string;
  duration: string;
  intensity: string;
  type: string;
  notes: string;
};

/* ---------- MOCK DATA (UI ONLY) ---------- */

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=80";

const LIBRARY: LibraryItem[] = [
  {
    id: "1",
    title: "Morning Back Relief",
    duration: "12 min",
    intensity: "Gentle",
    type: "Hatha",
    notes: "Back pain, posture",
  },
  {
    id: "2",
    title: "Office Neck Reset",
    duration: "8 min",
    intensity: "Gentle",
    type: "Chair Yoga",
    notes: "Neck, shoulders",
  },
  {
    id: "3",
    title: "Deep Stretch Flow",
    duration: "20 min",
    intensity: "Moderate",
    type: "Vinyasa",
    notes: "Flexibility",
  },
  {
    id: "4",
    title: "Anulom Vilom",
    duration: "6 min",
    intensity: "Gentle",
    type: "Pranayama",
    notes: "Breathing, calm",
  },
  {
    id: "5",
    title: "Sleep Meditation",
    duration: "10 min",
    intensity: "Gentle",
    type: "Meditation",
    notes: "Sleep, relax",
  },
];

/* ---------- COLLECTIONS ---------- */

const COLLECTIONS: {
  key: string;
  title: string;
  icon: string;
  filter: (it: LibraryItem) => boolean;
}[] = [
  {
    key: "featured",
    title: "Featured for You",
    icon: "sparkles-outline",
    filter: () => true,
  },
  {
    key: "back",
    title: "Back Pain Relief",
    icon: "body-outline",
    filter: (it) => /back|posture/i.test(it.notes),
  },
  {
    key: "breathing",
    title: "Breathing",
    icon: "wind-outline",
    filter: (it) => it.type === "Pranayama",
  },
  {
    key: "meditation",
    title: "Meditation",
    icon: "heart-outline",
    filter: (it) => it.type === "Meditation",
  },
  {
    key: "office",
    title: "Office Reset",
    icon: "briefcase-outline",
    filter: (it) => it.type === "Chair Yoga",
  },
];

/* ---------- TOP FILTERS ---------- */

const TOP_FILTERS: {
  key: string;
  label: string;
  icon: string;
}[] = [
  { key: "all", label: "All", icon: "apps-outline" },
  { key: "yoga", label: "Yoga", icon: "body-outline" },
  { key: "breath", label: "Breathing", icon: "wind-outline" },
  { key: "med", label: "Meditation", icon: "heart-outline" },
  { key: "office", label: "Office", icon: "briefcase-outline" },
];

/* ---------- SCREEN ---------- */

export default function LibraryScreen() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = useMemo(() => {
    return LIBRARY.filter((it) => {
      if (query && !it.title.toLowerCase().includes(query.toLowerCase()))
        return false;

      if (activeFilter === "breath") return it.type === "Pranayama";
      if (activeFilter === "med") return it.type === "Meditation";
      if (activeFilter === "office") return it.type === "Chair Yoga";

      return true;
    });
  }, [query, activeFilter]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>
          Explore yoga, breathing & mindfulness
        </Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#6B7280" />
          <TextInput
            placeholder="Search practices"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {TOP_FILTERS.map((f) => {
              const selected = activeFilter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setActiveFilter(f.key)}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipActive,
                  ]}
                >
                  <Ionicons
                    name={f.icon as any}
                    size={16}
                    color={selected ? "#1F6F57" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Sections */}
        {COLLECTIONS.map((section) => {
          const items = filtered.filter(section.filter);
          if (!items.length) return null;

          return (
            <View key={section.key} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name={section.icon as any} size={18} color="#2E6B4F" />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {items.map((item) => (
                  <VideoCard key={item.id} item={item} />
                ))}
              </ScrollView>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- CARD ---------- */

function VideoCard({ item }: { item: LibraryItem }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <View style={styles.thumb}>
        <Image source={{ uri: FALLBACK_IMAGE }} style={styles.image} />
        <View style={styles.playBtn}>
          <Ionicons name="play" size={16} color="#1F6F57" />
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.cardSub}>
        {item.duration} • {item.intensity}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { padding: 18 },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 12,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAF8",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E6EFE9",
    gap: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  filtersRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  filterChip: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E6EFE9",
    backgroundColor: "#F7FAF8",
  },
  filterChipActive: {
    backgroundColor: "#EAF6F0",
    borderColor: "#BFDCCF",
  },
  filterText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  filterTextActive: { color: "#1F6F57" },

  section: { marginTop: 20 },
  sectionHeader: { marginBottom: 10 },
  sectionTitleRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  card: { width: 160, marginRight: 14 },
  thumb: {
    height: 100,
    borderRadius: 16,
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
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
    color: "#111827",
  },
  cardSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
