/**
 * Video Library Screen
 * Browse all available videos with filters: All, Yoga, Breathing, Meditation
 * Play individual videos (not counted as Abhyāsa completion)
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../types/navigation";
import { Routes } from "../../constants/routes";
import type { Session } from "../../data/mock/models";
import { getVideos } from "../../services/api";

const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type VideoLibraryRouteProp = RouteProp<RootStackParamList, "VideoLibrary">;

type FilterType = "All" | "Yoga" | "Breathing" | "Meditation";

const THUMBNAIL =
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80";

const shadow = Platform.select({
  android: { elevation: 2 },
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  default: {},
});

export default function VideoLibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VideoLibraryRouteProp>();

  const initialFilter = route.params?.filter || "All";
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(initialFilter);
  const [videos, setVideos] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await getVideos({ limit: 50, status: "ACTIVE" });

      // Map backend VideoListItemDto to Session type
      const mappedVideos: Session[] = (response.data || []).map((v: any) => ({
        id: v.id,
        title: v.name || v.title || v.descriptionShort || "Yoga Session",
        durationMin: Math.max(1, Math.round((v.durationSec || 300) / 60)),
        style: v.primaryCategory || "Yoga",
        focusTags: v.tags?.map((t: any) => t.label || t.name).filter(Boolean) || [],
        videoUrl: v.playbackUrl ?? "",
        thumbnailUrl: v.thumbnailUrl,
      }));

      setVideos(mappedVideos);
      setError(null);
      if (mappedVideos.length > 0) {
        console.log("✅ VideoLibrary first item URLs:", {
          playbackUrl: mappedVideos[0].videoUrl,
          thumbnailUrl: (mappedVideos[0] as any).thumbnailUrl,
        });
      }
    } catch (err) {
      console.error("❌ VideoLibrary load failed:", err);
      setError("Failed to load videos. Check backend + login.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos from backend on mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    if (selectedFilter === "All") return videos;

    return videos.filter((video) => {
      const style = (video.style || "").toUpperCase();
      if (selectedFilter === "Yoga") {
        return ["VINYASA", "HATHA", "RESTORATIVE", "YOGA", "YIN", "MOBILITY"].includes(style);
      } else if (selectedFilter === "Breathing") {
        return style === "PRANAYAMA" || style === "BREATHING";
      } else if (selectedFilter === "Meditation") {
        return style === "MEDITATION";
      }
      return false;
    });
  }, [selectedFilter, videos]);

  const handlePlayVideo = (video: Session) => {
    console.log("🎥 [VideoLibrary] Playing video:", {
      id: video.id,
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnailUrl: (video as any).thumbnailUrl,
      durationMin: video.durationMin,
      style: video.style,
    });
    navigation.navigate(Routes.COMMON_PLAYER, {
      session: video,
      context: { programId: "video-library" },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.statusBarSpacer} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Video Library</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#16A34A" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(["All", "Yoga", "Breathing", "Meditation"] as FilterType[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter && styles.filterTabTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Video List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {error && !loading ? (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
            <Text style={styles.errorTitle}>Failed to load videos</Text>
            <Text style={styles.errorSubtitle}>
              Check backend + login, then try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchVideos}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredVideos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No videos found</Text>
            <Text style={styles.emptyText}>
              Try a different filter to see more content
            </Text>
          </View>
        ) : (
          <View style={styles.videoGrid}>
            {filteredVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCard}
                onPress={() => handlePlayVideo(video)}
                activeOpacity={0.8}
              >
                <View style={styles.videoThumbnailContainer}>
                  <Image source={{ uri: (video as any).thumbnailUrl || THUMBNAIL }} style={styles.videoThumbnail} />
                  <View style={styles.playOverlay}>
                    <View style={styles.playCircle}>
                      <Ionicons name="play" size={20} color="#FFF" />
                    </View>
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{video.durationMin} min</Text>
                  </View>
                </View>

                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  {video.sanskritTitle && (
                    <Text style={styles.videoSanskrit} numberOfLines={1}>
                      {video.sanskritTitle}
                    </Text>
                  )}
                  <View style={styles.videoMeta}>
                    {video.style && (
                      <View style={styles.styleBadge}>
                        <Text style={styles.styleBadgeText}>{video.style}</Text>
                      </View>
                    )}
                    {video.focusTags && video.focusTags.length > 0 && (
                      <Text style={styles.focusTag} numberOfLines={1}>
                        {video.focusTags[0]}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FBFBFB",
  },

  statusBarSpacer: {
    height: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: "#FFF",
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#F0FDF4",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },

  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#16A34A",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#FFF7ED",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },

  errorText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#E9A46A",
  },

  filterContainer: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },

  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },

  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },

  filterTabActive: {
    backgroundColor: "#16A34A",
  },

  filterTabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },

  filterTabTextActive: {
    color: "#FFF",
  },

  scrollView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#374151",
    marginTop: 16,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  errorState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#16A34A",
    borderRadius: 999,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  videoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  videoCard: {
    width: (width - 52) / 2,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    ...shadow,
  },

  videoThumbnailContainer: {
    width: "100%",
    height: 120,
    position: "relative",
  },

  videoThumbnail: {
    width: "100%",
    height: "100%",
  },

  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(233,164,106,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },

  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  durationText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF",
  },

  videoInfo: {
    padding: 12,
  },

  videoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 18,
    marginBottom: 4,
  },

  videoSanskrit: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    fontWeight: "600",
    marginBottom: 6,
  },

  videoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },

  styleBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  styleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },

  focusTag: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
});
