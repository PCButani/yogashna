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
  // Keep these flexible so it compiles even if your params have extra fields.
  uri?: string; // video URL
  title?: string; // header title
  isLocked?: boolean; // paid content lock
  resumeKey?: string; // optional unique key (recommended)
};

const RESUME_PREFIX = "COMMON_PLAYER_RESUME::";

export default function CommonPlayerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const params = (route?.params ?? {}) as RouteParams;

  // Support multiple param names (keeps navigation unchanged)
const videoUri =
  (params as any)?.uri ??
  (params as any)?.videoUri ??
  (params as any)?.videoUrl ??
  (params as any)?.url ??
  (params as any)?.source ??
  (params as any)?.video?.uri ??
  (params as any)?.session?.videoUrl ??
  "";

const title =
  (params as any)?.title ??
  (params as any)?.videoTitle ??
  (params as any)?.name ??
  (params as any)?.session?.title ??
  "Video";

const isLocked =
  !!((params as any)?.isLocked ?? (params as any)?.locked ?? (params as any)?.isPaidContentLocked);


  // If caller doesn't pass a resumeKey, we fall back to the uri.
  const resumeStorageKey = useMemo(() => {
    const base = params.resumeKey?.trim() ? params.resumeKey.trim() : videoUri;
    return `${RESUME_PREFIX}${base}`;
  }, [params.resumeKey, videoUri]);

  const [showHeader, setShowHeader] = useState(true);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [isReady, setIsReady] = useState(false);
  const lastSavedTimeRef = useRef<number>(0);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const player = useVideoPlayer(videoUri || null, (p) => {
    // IMPORTANT: we do NOT auto-play if locked
    if (isLocked) {
      p.pause();
      return;
    }
    // Keep behavior close to expo-av defaults (no looping unless you had it)
    p.loop = false;
  });

  // If videoUri is empty, don't crash. Show a simple message.
  const hasValidSource = !!videoUri;

  const stopSaveTimer = useCallback(() => {
    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const persistResumeTime = useCallback(
    async (timeSeconds: number) => {
      try {
        // Save only if meaningful (> 1s)
        if (!Number.isFinite(timeSeconds) || timeSeconds < 1) return;
        await AsyncStorage.setItem(resumeStorageKey, String(timeSeconds));
      } catch {
        // ignore storage errors (do not crash playback)
      }
    },
    [resumeStorageKey]
  );

  const startSaveTimer = useCallback(() => {
    stopSaveTimer();
    // Save every 2 seconds while playing (simple + robust)
    saveTimerRef.current = setInterval(() => {
      try {
        const t = Number(player?.currentTime ?? 0);
        // Avoid writing too often if time hasn't moved
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
    if (!hasValidSource) return;
    if (isLocked) return;

    try {
      const raw = await AsyncStorage.getItem(resumeStorageKey);
      const t = raw ? Number(raw) : 0;

      // Seek only if we have a valid saved time
      if (Number.isFinite(t) && t > 1) {
        player.currentTime = t; // expo-video uses seconds for currentTime
        lastSavedTimeRef.current = t;
      }
    } catch {
      // ignore
    }
  }, [hasValidSource, isLocked, player, resumeStorageKey]);

  // When screen focuses: load resume & start saving while playing
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const run = async () => {
        if (cancelled) return;

        setIsReady(false);

        // Mark ready once player is attached; give a short tick.
        // (Keeps UI behavior stable without depending on internal events.)
        setTimeout(() => {
          if (!cancelled) setIsReady(true);
        }, 50);

        await loadAndSeekResume();

        // Keep same general behavior: auto-play when screen opens (if not locked)
        if (!isLocked) {
          try {
            player.play();
            startSaveTimer();
          } catch {
            // ignore
          }
        }
      };

      void run();

      return () => {
        cancelled = true;
        // Save once on leaving the screen + pause
        stopSaveTimer();
        try {
          const t = Number(player?.currentTime ?? 0);
          void persistResumeTime(t);
          player.pause();
        } catch {
          // ignore
        }
      };
    }, [isLocked, loadAndSeekResume, persistResumeTime, player, startSaveTimer, stopSaveTimer])
  );

  // If locked, force pause and stop saving
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

  const onToggleHeader = useCallback(() => {
    setShowHeader((s) => !s);
  }, []);

  const onBack = useCallback(async () => {
    // Save before leaving
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

  return (
    <View style={styles.safe}>
      {/* Tap-to-toggle overlay header */}
      <Pressable style={styles.playerWrap} onPress={onToggleHeader}>
        {/* Video */}
        {hasValidSource ? (
          <View style={styles.videoContainer}>
            <VideoView
              key={isLandscape ? "landscape" : "portrait"} // forces correct resize on rotation
              style={styles.video}
              player={player}
              nativeControls={!isLocked} // keep controls for recorded content; disable if locked
              requiresLinearPlayback={false}
              fullscreenOptions={{ enable: false }}
              allowsPictureInPicture={!isLocked}
              contentFit={isLandscape ? "cover" : "contain"} // fills more in landscape
              // Android note: surfaceType="textureView" can help in some overlay scenarios
              // but we keep minimal changes. Uncomment only if you see Android rendering issues.
              // surfaceType="textureView"
            />


            {/* Loading overlay */}
            {!isReady && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
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

                {/* Keep button behavior generic (no navigation changes) */}
                <TouchableOpacity
                  style={styles.lockBtn}
                  onPress={() => {
                    // You can connect this to your paywall later.
                    // For now, we keep the same UI/UX behavior (locked overlay).
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.lockBtnText}>Unlock to Watch</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="alert-circle" size={26} color="#111" />
            <Text style={styles.emptyText}>Video source missing.</Text>
          </View>
        )}

        {/* Header overlay (tap toggles) */}
        {showHeader && (
          <View style={styles.header} pointerEvents="box-none">
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={10}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title || "Video"}
              </Text>
              <View style={styles.headerRight} />
            </View>
          </View>
        )}
      </Pressable>

      {/* (Keep any existing bottom UI identical in your old file.
          If you had extra metadata/actions below the video, add them back exactly as before.) */}
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
    backgroundColor: "rgba(0,0,0,0.55)",
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
  headerTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
  },
});
