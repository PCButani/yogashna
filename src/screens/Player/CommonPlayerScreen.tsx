import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Requires: npx expo install expo-screen-orientation
import * as ScreenOrientation from "expo-screen-orientation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";
import { recordPracticeSession } from "../../services/ProgressTracking";
import EndSessionCheckinModal from "../../components/player/EndSessionCheckinModal";
import { Routes } from "../../constants/routes";

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

// Layout constants (MVP-safe)
const CONTROLS_ROW_HEIGHT = 72; // playlist row approx height
const CONTROLS_GAP = 12;

export default function CommonPlayerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const params = (route?.params ?? {}) as RouteParams;

  // Build playlist from params
  const playlist = useMemo(() => {
    if (params.playlist && params.playlist.length > 0) return params.playlist;
    if (params.session) return [params.session];
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

  // Window info
  const { width, height } = useWindowDimensions();
  const isLandscapeDevice = width > height;

  // Fullscreen state (controls orientation lock)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [surfaceKey, setSurfaceKey] = useState(0);

  // UI state
  const [showControls, setShowControls] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showUpNext, setShowUpNext] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);

  // Playback state for MVP timer overlay
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  // Derived nav flags (declare BEFORE callbacks that depend on them)
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < playlist.length - 1;
  const isLastVideo = currentIndex === playlist.length - 1;

  // Resume storage key
  const resumeStorageKey = useMemo(() => {
    const base = params.resumeKey?.trim()
      ? params.resumeKey.trim()
      : currentSession?.id || videoUri;
    return `${RESUME_PREFIX}${base}`;
  }, [params.resumeKey, currentSession, videoUri]);

  const lastSavedTimeRef = useRef<number>(0);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedSessionsRef = useRef(new Set<number>());
  const isMountedRef = useRef(true);
  const hasShownCheckinRef = useRef(false);

  // Create player
  const player = useVideoPlayer(videoUri || null, (p) => {
    if (isLocked) {
      p.pause();
      return;
    }
    p.loop = false;
    p.timeUpdateEventInterval = 1;
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
      if (typeof (player as any).replaceAsync === "function") {
        await (player as any).replaceAsync(videoUri);
      } else {
        (player as any).replace?.(videoUri);
      }

      if (!isMountedRef.current) return;

      await loadAndSeekResume();
      if (!isMountedRef.current) return;

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

  useEffect(() => {
    void loadVideo();
    // Reset check-in guard when changing videos
    hasShownCheckinRef.current = false;
  }, [currentIndex, videoUri, loadVideo]);

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
    }, [
      isLocked,
      hasValidSource,
      loadAndSeekResume,
      persistResumeTime,
      player,
      startSaveTimer,
      stopSaveTimer,
    ])
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

  const handleToggleFullscreen = useCallback(async () => {
    const next = !isFullscreen;
    setIsFullscreen(next);

    try {
      // Keep scrubber available: do NOT disable native controls based on fullscreen.
      if (next) {
        StatusBar.setHidden(true, "fade");
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        StatusBar.setHidden(false, "fade");
        await ScreenOrientation.unlockAsync();
      }

      if (Platform.OS === "android") {
        // Android-only fix: reload surface after orientation lock to avoid black screen.
        const currentPos = Number(player?.currentTime ?? 0);
        try {
          player?.pause();
        } catch {
          // ignore
        }

        if (typeof (player as any).replaceAsync === "function") {
          await (player as any).replaceAsync(videoUri);
        } else {
          (player as any).replace?.(videoUri);
        }

        try {
          player.currentTime = currentPos;
        } catch {
          // ignore
        }

        setSurfaceKey((k) => k + 1);

        try {
          if (!isLocked) {
            player?.play();
          }
        } catch {
          // ignore
        }
      } else {
        try {
          if (!isLocked) {
            player?.play();
          }
        } catch {
          // ignore
        }
      }
    } catch (e) {
      // Fallback: at least hide/show status bar
      StatusBar.setHidden(next, "fade");
    }
  }, [isFullscreen, player, isLocked, videoUri]);

  useEffect(() => {
    return () => {
      if (isFullscreen) {
        StatusBar.setHidden(false, "fade");
        try {
          void ScreenOrientation.unlockAsync();
        } catch {
          // ignore
        }
      }
    };
  }, [isFullscreen]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowUpNext(false);
    }
  }, [currentIndex, playlist.length]);

  const handleRetry = useCallback(() => {
    setLoadError(false);
    void loadVideo();
  }, [loadVideo]);

  const handleCloseCheckin = useCallback(() => {
    setShowCheckinModal(false);
  }, []);

  const handleBackToToday = useCallback(() => {
    setShowCheckinModal(false);
    navigation.navigate(Routes.MAIN_TABS);
  }, [navigation]);

  const handleNextSessionFromCheckin = useCallback(() => {
    setShowCheckinModal(false);
    if (canGoNext) {
      handleNext();
    } else {
      navigation.navigate(Routes.MAIN_TABS);
    }
  }, [canGoNext, handleNext, navigation]);

  const recordSessionCompletion = useCallback(() => {
    if (completedSessionsRef.current.has(currentIndex)) return;
    completedSessionsRef.current.add(currentIndex);

    const sessionDuration =
      currentSession?.durationMin || Math.round((player?.duration ?? 0) / 60);

    void recordPracticeSession(sessionDuration, 1).catch((err) => {
      console.error("Failed to record session:", err);
    });
  }, [currentIndex, currentSession, player]);

  const handlePlaybackEnded = useCallback(() => {
    if (!isMountedRef.current) return;

    recordSessionCompletion();

    if (isPlaylist && !isLastVideo) {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      autoAdvanceTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setCurrentIndex((prev) => prev + 1);
          setShowUpNext(false);
        }
      }, 500);
      return;
    }

    setShowUpNext(false);
    if (!hasShownCheckinRef.current) {
      hasShownCheckinRef.current = true;
      setTimeout(() => {
        if (isMountedRef.current) {
          setShowCheckinModal(true);
        }
      }, 800);
    }
  }, [isLastVideo, isPlaylist, recordSessionCompletion]);

  // Subscribe to player events: time updates + play-to-end
  useEffect(() => {
    if (!player) return;

    const playToEndSub = player.addListener("playToEnd", handlePlaybackEnded);

    const timeUpdateSub = player.addListener("timeUpdate", ({ currentTime }) => {
      try {
        const dur = Number(player.duration ?? 0);
        const cur = Number(currentTime ?? 0);

        if (dur > 0) {
          setDurationSec(dur);
          setPositionSec(cur);

          const remaining = dur - cur;
          if (isPlaylist && !isLastVideo) {
            setShowUpNext(remaining > 0 && remaining <= 5);
          } else if (showUpNext) {
            setShowUpNext(false);
          }
        }
      } catch {
        // ignore
      }
    });

    return () => {
      playToEndSub.remove();
      timeUpdateSub.remove();
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [handlePlaybackEnded, isLastVideo, isPlaylist, player, showUpNext]);

  // Session meta
  const sessionInfo = useMemo(() => {
    if (!currentSession) return null;
    return {
      duration: currentSession.durationMin || currentSession.duration || null,
      style: currentSession.style || null,
    };
  }, [currentSession]);

  // ====== MVP VIDEO LAYOUT RULES ======
  // 1) In portrait device: always show video inside a 16:9 landscape frame (letterbox)
  // 2) In fullscreen OR landscape device: fill the screen
  const shouldFillScreen = isFullscreen || isLandscapeDevice;

  // Reserve space above playlist controls so scrubber isn't blocked
  const reservedBottomSpace =
    isPlaylist && showControls ? insets.bottom + CONTROLS_ROW_HEIGHT + CONTROLS_GAP : 0;

  // In fullscreen/landscape, do NOT apply bottom padding
  const containerPadding = shouldFillScreen ? 0 : reservedBottomSpace;

  // Simple MM:SS formatter
  const fmt = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return "00:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const mm = String(m).padStart(2, "0");
    const ss = String(sec).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Android-only fix: explicit dimensions in fullscreen to prevent black screen
  const androidFullscreenFix =
    Platform.OS === "android" && shouldFillScreen
      ? { width, height }
      : null;

  const showFullscreenButton = hasValidSource && !loadError;

  return (
    <View style={styles.safe}>
      <Pressable style={styles.playerWrap} onPress={onToggleHeader}>
        {/* Video */}
        {hasValidSource && !loadError ? (
          <View
            style={[
              styles.videoContainer,
              { paddingBottom: containerPadding },
              !shouldFillScreen && styles.videoContainerLetterbox,
            ]}
          >
            {/* 16:9 wrapper in portrait device (unless fullscreen) */}
            <View
              style={[
                styles.videoFrame,
                !shouldFillScreen && styles.videoFrame16x9,
                androidFullscreenFix,
              ]}
            >
              <VideoView
                // Remount on fullscreen/orientation change, include dimensions for Android fix
                key={`${currentIndex}-${surfaceKey}-${isFullscreen ? "fs" : "nf"}-${
                  isLandscapeDevice ? "land" : "port"
                }-${width}x${height}`}
                style={[styles.video, androidFullscreenFix]}
                player={player}
                nativeControls={!isLocked} // keep scrubber available even in fullscreen
                requiresLinearPlayback={false}
                fullscreenOptions={{ enable: false }}
                allowsPictureInPicture={!isLocked}
                contentFit={shouldFillScreen ? "cover" : "contain"}
              />
            </View>

            {/* Loading overlay */}
            {!isReady && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading video...</Text>
              </View>
            )}

            {/* Minimal timer overlay (MVP) - does not block touches */}
            {!loadError && hasValidSource && (
              <View
                style={[
                  styles.timerOverlay,
                  { top: insets.top + 70 }
                ]}
                pointerEvents="none"
              >
                <Text style={styles.timerText}>
                  {fmt(positionSec)} / {fmt(durationSec)}
                </Text>
                <View style={styles.timerBarTrack}>
                  <View
                    style={[
                      styles.timerBarFill,
                      {
                        width:
                          durationSec > 0
                            ? `${Math.min(100, Math.max(0, (positionSec / durationSec) * 100))}%`
                            : "0%",
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Locked overlay */}
            {isLocked && (
              <View style={styles.lockOverlay} pointerEvents="auto">
                <Ionicons name="lock-closed" size={30} color="#FFFFFF" />
                <Text style={styles.lockTitle}>Locked</Text>
                <Text style={styles.lockSub}>This content is for paid members.</Text>
                <TouchableOpacity style={styles.lockBtn} onPress={() => {}} activeOpacity={0.85}>
                  <Text style={styles.lockBtnText}>Unlock to Watch</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Up Next overlay */}
            {showUpNext && canGoNext && !isLocked && (
              <View style={styles.upNextOverlay} pointerEvents="box-none">
                <View style={styles.upNextCard}>
                  <Text style={styles.upNextLabel}>Up Next</Text>
                  <Text style={styles.upNextTitle} numberOfLines={2}>
                    {playlist[currentIndex + 1]?.title || "Next Session"}
                  </Text>
                  <View style={styles.upNextProgress}>
                    <View style={styles.upNextProgressBar} />
                  </View>
                </View>
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
            <Text style={styles.emptyText}>This session is coming soon. Check back later!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={onBack}>
              <Text style={styles.emptyBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header overlay */}
        {!loadError && (
          <View
            style={[
              styles.header,
              {
                paddingTop: insets.top + 8,
              },
            ]}
            pointerEvents="box-none"
          >
            <View style={styles.headerRow} pointerEvents="box-none">
              <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={10}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.headerCenter} pointerEvents="none">
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {title}
                </Text>
                {sessionInfo && (
                  <View style={styles.headerMeta}>
                    {sessionInfo.duration && (
                      <Text style={styles.headerMetaText}>{sessionInfo.duration} min</Text>
                    )}
                    {sessionInfo.style && sessionInfo.duration && (
                      <Text style={styles.headerMetaText}> • </Text>
                    )}
                    {sessionInfo.style && (
                      <Text style={styles.headerMetaText}>{sessionInfo.style}</Text>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.headerRight}>
                {showFullscreenButton && (
                  <TouchableOpacity
                    onPress={handleToggleFullscreen}
                    style={styles.fullscreenBtn}
                    hitSlop={10}
                  >
                    <Ionicons
                      name={isFullscreen ? "contract-outline" : "expand-outline"}
                      size={20}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Playlist Controls */}
        {isPlaylist && showControls && hasValidSource && !loadError && (
          <View
            style={[
              styles.playlistControls,
              { paddingBottom: insets.bottom + 12 },
            ]}
            pointerEvents="box-none"
          >
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
                <Text style={[styles.navText, !canGoNext && styles.navTextDisabled]}>Next</Text>
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

      {/* End Session Check-in Modal */}
      <EndSessionCheckinModal
        visible={showCheckinModal}
        onClose={handleCloseCheckin}
        onBackToToday={handleBackToToday}
        onNextSession={canGoNext ? handleNextSessionFromCheckin : undefined}
        hasNextSession={canGoNext}
        context={params.context}
      />
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

  // ===== Video Layout =====
  videoContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    position: "relative",
  },
  // Letterbox container in portrait device (centers the 16:9 frame)
  videoContainerLetterbox: {
    justifyContent: "center",
    alignItems: "center",
  },
  // Frame wrapper
  videoFrame: {
    flex: 1,
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  // 16:9 landscape frame when NOT fullscreen and device is portrait
  videoFrame16x9: {
    flex: undefined,
    width: "100%",
    aspectRatio: 16 / 9,
  },
  video: {
    flex: 1,
    backgroundColor: "#000000",
  },

  // Timer overlay (non-blocking)
  timerOverlay: {
    position: "absolute",
    left: 14,
    right: 14,
    gap: 8,
    alignItems: "center",
  },
  timerText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  timerBarTrack: {
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
    maxWidth: 200,
  },
  timerBarFill: {
    height: "100%",
    backgroundColor: "#5B8C6A",
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
    alignItems: "flex-end",
    justifyContent: "center",
  },
  fullscreenBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
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

  // Up Next Overlay
  upNextOverlay: {
    position: "absolute",
    right: 20,
    maxWidth: 280,
    bottom: 140,
  },
  upNextCard: {
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "rgba(46,107,79,0.8)",
  },
  upNextLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  upNextTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
    marginBottom: 10,
  },
  upNextProgress: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    overflow: "hidden",
  },
  upNextProgressBar: {
    height: "100%",
    width: "100%",
    backgroundColor: "#2E6B4F",
  },
});
