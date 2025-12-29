import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";

type RouteParams = {
  // Legacy single session mode
  session?: any;

  // NEW: Playlist mode
  playlist?: any[];
  startIndex?: number;
  context?: { programId?: string; dayNumber?: number };

  // Optional overrides
  uri?: string;
  title?: string;
  isLocked?: boolean;
  resumeKey?: string;
};

const RESUME_PREFIX = "COMMON_PLAYER_RESUME::";

export default function CommonPlayerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const params = (route?.params ?? {}) as RouteParams;

  // Build playlist from params
  const playlist = useMemo(() => {
    if (params.playlist && params.playlist.length > 0) {
      return params.playlist;
    }
    if (params.session) {
      return [params.session];
    }
    return [];
  }, [params.playlist, params.session]);

  const [currentIndex, setCurrentIndex] = useState(params.startIndex ?? 0);
  const currentSession = playlist[currentIndex];

  // Extract video URL from current session
  const videoUri = useMemo(() => {
    if (params.uri) return params.uri;
    if (!currentSession) return "";

    return (
      currentSession.videoUrl ??
      currentSession.videoUri ??
      currentSession.uri ??
      currentSession.url ??
      currentSession.video?.uri ??
      ""
    );
  }, [currentSession, params.uri]);

  const title = useMemo(() => {
    if (params.title) return params.title;
    if (!currentSession) return "Video";

    return (
      currentSession.title ??
      currentSession.videoTitle ??
      currentSession.name ??
      "Video"
    );
  }, [currentSession, params.title]);

  const isLocked = !!params.isLocked;
  const hasValidSource = !!videoUri;
  const isPlaylist = playlist.length > 1;

  // Resume storage key
  const resumeStorageKey = useMemo(() => {
    const base = params.resumeKey?.trim()
      ? params.resumeKey.trim()
      : currentSession?.id || videoUri;
    return `${RESUME_PREFIX}${base}`;
  }, [params.resumeKey, currentSession, videoUri]);

  const [showHeader, setShowHeader] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const lastSavedTimeRef = useRef<number>(0);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const player = useVideoPlayer(videoUri || null, (p) => {
    if (isLocked) {
      p.pause();
      return;
    }
    p.loop = false;
  });

  const stopSaveTimer = useCallback(() => {
    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const persistResumeTime = useCallback(
    async (timeSeconds: number) => {
      try {
        if (!Number.isFinite(timeSeconds) || timeSeconds < 1) return;
        await AsyncStorage.setItem(resumeStorageKey, String(timeSeconds));
      } catch {
        // ignore
      }
    },
    [resumeStorageKey]
  );

  const startSaveTimer = useCallback(() => {
    stopSaveTimer();
    saveTimerRef.current = setInterval(() => {
      try {
        const t = Number(player?.currentTime ?? 0);
        if (t > 0 && Math.abs(t - lastSavedTimeRef.current) >= 1) {
          lastSavedTimeRef.current = t;
          void persistResumeTime(t);
        }
      } catch {
        // ignore
      }
    }, 2000);
  }, [persistResumeTime, player, stopSaveTimer]);

  const loadAndSeekResume = useCallback(async () => {
    if (!hasValidSource || isLocked) return;

    try {
      const raw = await AsyncStorage.getItem(resumeStorageKey);
      const t = raw ? Number(raw) : 0;

      if (Number.isFinite(t) && t > 1) {
        player.currentTime = t;
        lastSavedTimeRef.current = t;
      }
    } catch {
      // ignore
    }
  }, [hasValidSource, isLocked, player, resumeStorageKey]);

  // Load video when currentIndex changes
  const loadVideo = useCallback(async () => {
    if (!hasValidSource || !player || !isMountedRef.current) return;

    setIsReady(false);
    setLoadError(false);

    try {
      // Use replaceAsync instead of replace to avoid iOS warning
      if (typeof player.replaceAsync === 'function') {
        await player.replaceAsync(videoUri);
      } else {
        // Fallback for older versions
        player.replace(videoUri);
      }

      if (!isMountedRef.current) return;

      // Load resume position for new video
      await loadAndSeekResume();

      if (!isMountedRef.current) return;

      // Start playing if not locked
      if (!isLocked) {
        try {
          player.play();
        } catch {
          // ignore
        }
      }

      setIsReady(true);
    } catch (error) {
      console.error("Failed to load video:", error);
      if (isMountedRef.current) {
        setLoadError(true);
        setIsReady(true);
      }
    }
  }, [hasValidSource, player, videoUri, loadAndSeekResume, isLocked]);

  // When currentIndex changes, load new video
  useEffect(() => {
    void loadVideo();
  }, [currentIndex, videoUri]);

  // Screen focus/blur handling
  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;

      const run = async () => {
        if (!isMountedRef.current) return;

        if (!isLocked && hasValidSource) {
          try {
            await loadAndSeekResume();
            if (isMountedRef.current) {
              player.play();
              startSaveTimer();
            }
          } catch {
            // ignore
          }
        }
      };

      void run();

      return () => {
        isMountedRef.current = false;
        stopSaveTimer();
        try {
          const t = Number(player?.currentTime ?? 0);
          void persistResumeTime(t);
          player.pause();
        } catch {
          // ignore
        }
      };
    }, [isLocked, hasValidSource, loadAndSeekResume, persistResumeTime, player, startSaveTimer, stopSaveTimer])
  );

  // Lock handling
  useEffect(() => {
    if (isLocked) {
      stopSaveTimer();
      try {
        player.pause();
      } catch {
        // ignore
      }
    }
  }, [isLocked, player, stopSaveTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const onToggleHeader = useCallback(() => {
    setShowHeader((s) => !s);
    setShowControls((s) => !s);
  }, []);

  const onBack = useCallback(async () => {
    stopSaveTimer();
    try {
      const t = Number(player?.currentTime ?? 0);
      await persistResumeTime(t);
      player.pause();
    } catch {
      // ignore
    }
    navigation.goBack();
  }, [navigation, persistResumeTime, player, stopSaveTimer]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, playlist.length]);

  const handleRetry = useCallback(() => {
    setLoadError(false);
    void loadVideo();
  }, [loadVideo]);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < playlist.length - 1;

  // Session info for playlist mode
  const sessionInfo = useMemo(() => {
    if (!currentSession) return null;
    return {
      duration: currentSession.durationMin || currentSession.duration || null,
      style: currentSession.style || null,
    };
  }, [currentSession]);

  return (
    <View style={styles.safe}>
      <Pressable style={styles.playerWrap} onPress={onToggleHeader}>
        {/* Video */}
        {hasValidSource && !loadError ? (
          <View style={styles.videoContainer}>
            <VideoView
              key={`${currentIndex}-${isLandscape ? "landscape" : "portrait"}`}
              style={styles.video}
              player={player}
              nativeControls={!isLocked}
              requiresLinearPlayback={false}
              fullscreenOptions={{ enable: false }}
              allowsPictureInPicture={!isLocked}
              contentFit={isLandscape ? "cover" : "contain"}
            />

            {/* Loading overlay */}
            {!isReady && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading video...</Text>
              </View>
            )}

            {/* Locked overlay */}
            {isLocked && (
              <View style={styles.lockOverlay} pointerEvents="auto">
                <Ionicons name="lock-closed" size={30} color="#FFFFFF" />
                <Text style={styles.lockTitle}>Locked</Text>
                <Text style={styles.lockSub}>
                  This content is for paid members.
                </Text>
                <TouchableOpacity
                  style={styles.lockBtn}
                  onPress={() => {}}
                  activeOpacity={0.85}
                >
                  <Text style={styles.lockBtnText}>Unlock to Watch</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : loadError ? (
          <View style={styles.empty}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.emptyTitle}>Video failed to load</Text>
            <Text style={styles.emptyText}>
              There was a problem loading this video. Please try again.
            </Text>
            <View style={styles.emptyButtons}>
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emptyBackBtn} onPress={onBack}>
                <Text style={styles.emptyBackBtnText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="alert-circle" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Video source not available yet</Text>
            <Text style={styles.emptyText}>
              This session is coming soon. Check back later!
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={onBack}>
              <Text style={styles.emptyBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header overlay */}
        {showHeader && !loadError && (
          <View style={styles.header} pointerEvents="box-none">
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={10}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {title}
                </Text>
                {sessionInfo && (
                  <View style={styles.headerMeta}>
                    {sessionInfo.duration && (
                      <Text style={styles.headerMetaText}>
                        {sessionInfo.duration} min
                      </Text>
                    )}
                    {sessionInfo.style && sessionInfo.duration && (
                      <Text style={styles.headerMetaText}> • </Text>
                    )}
                    {sessionInfo.style && (
                      <Text style={styles.headerMetaText}>
                        {sessionInfo.style}
                      </Text>
                    )}
                  </View>
                )}
              </View>
              <View style={styles.headerRight} />
            </View>
          </View>
        )}

        {/* Playlist Controls */}
        {isPlaylist && showControls && hasValidSource && !loadError && (
          <View style={styles.playlistControls} pointerEvents="box-none">
            <View style={styles.playlistRow}>
              <TouchableOpacity
                style={[styles.navBtn, !canGoPrevious && styles.navBtnDisabled]}
                onPress={handlePrevious}
                disabled={!canGoPrevious}
              >
                <Ionicons
                  name="play-skip-back"
                  size={24}
                  color={canGoPrevious ? "#FFFFFF" : "#666666"}
                />
                <Text style={[styles.navText, !canGoPrevious && styles.navTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <View style={styles.playlistInfo}>
                <Text style={styles.playlistText}>
                  {currentIndex + 1} of {playlist.length}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.navBtn, !canGoNext && styles.navBtnDisabled]}
                onPress={handleNext}
                disabled={!canGoNext}
              >
                <Text style={[styles.navText, !canGoNext && styles.navTextDisabled]}>
                  Next
                </Text>
                <Ionicons
                  name="play-skip-forward"
                  size={24}
                  color={canGoNext ? "#FFFFFF" : "#666666"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
  },
  playerWrap: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  video: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === "android" ? 40 : 55,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 6,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  headerMetaText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    gap: 12,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  lockTitle: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  lockSub: {
    marginTop: 6,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 20,
  },
  lockBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  lockBtnText: {
    color: "#111111",
    fontWeight: "800",
  },
  empty: {
    flex: 1,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: "#F3F4F6",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2E6B4F",
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyBackBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  emptyBackBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2E6B4F",
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  // Playlist Controls
  playlistControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === "android" ? 20 : 40,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  navText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  navTextDisabled: {
    color: "#666666",
  },
  playlistInfo: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(46,107,79,0.9)",
  },
  playlistText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
