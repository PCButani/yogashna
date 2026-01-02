import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useContinueWatchingStore } from "../../store/useContinueWatchingStore";

// ✅ RESTORED: Imports for Check-in
import EndSessionCheckinModal from "../../components/player/EndSessionCheckinModal";
import { Routes } from "../../constants/routes";

const RESUME_PREFIX = "PLAYER_RESUME::";

export default function CommonPlayerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // --- 1. Data Preparation ---
  const params = route?.params || {};
  
  const playlist = useMemo(() => {
    if (params.playlist?.length) return params.playlist;
    if (params.session) return [params.session];
    return [];
  }, [params.playlist, params.session]);

  const [currentIndex, setCurrentIndex] = useState(Number(params.startIndex ?? 0));
  const currentItem = playlist[currentIndex];

  const videoUri = useMemo(() => {
    return (
      currentItem?.videoUrl ||
      currentItem?.videoUri ||
      currentItem?.uri ||
      currentItem?.url ||
      ""
    );
  }, [currentItem]);

  const videoId = currentItem?.id || currentItem?.videoId || videoUri;
  const title = currentItem?.title || currentItem?.name || "Video";
  
  const hasNext = currentIndex < playlist.length - 1;
  const hasPrev = currentIndex > 0;

  // ✅ RESTORED: State for Check-in Modal
  const [showCheckinModal, setShowCheckinModal] = useState(false);

  // --- 2. Player Setup ---
  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = false;
  });

  const updateContinuePosition = useContinueWatchingStore((s) => s.updatePosition);
  
  // --- 3. Resume Logic ---
  useEffect(() => {
    if (!player || !videoId) return;
    let isCancelled = false;

    const loadResume = async () => {
      try {
        const saved = await AsyncStorage.getItem(RESUME_PREFIX + videoId);
        requestAnimationFrame(() => {
            if (isCancelled) return;
            if (saved) {
                const time = Number(saved);
                if (Number.isFinite(time)) player.currentTime = time;
            }
            player.play();
        });
      } catch (e) { 
        if (!isCancelled) player.play(); 
      }
    };
    
    loadResume();

    const interval = setInterval(() => {
      if (isCancelled) return;
      const time = player.currentTime;
      if (time > 5) {
        AsyncStorage.setItem(RESUME_PREFIX + videoId, String(time));
        updateContinuePosition(videoId, time);
      }
    }, 5000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [videoId, player, updateContinuePosition]);

  // --- 4. Auto-Advance & Check-in Logic ---
  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener("playToEnd", () => {
        // Clear resume for this video
        AsyncStorage.removeItem(RESUME_PREFIX + videoId);
        
        if (hasNext) {
            // If more videos, go to next
            setCurrentIndex((prev) => prev + 1);
        } else {
            // ✅ RESTORED: If last video, show Check-in Modal instead of closing
            setShowCheckinModal(true);
        }
    });

    return () => {
      subscription.remove();
    };
  }, [player, hasNext, videoId]);

  // --- 5. Handlers ---
  const handleNext = () => {
    if (hasNext) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (hasPrev) setCurrentIndex(currentIndex - 1);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // ✅ RESTORED: Check-in Handlers
  const handleCloseCheckin = () => {
    setShowCheckinModal(false);
  };

  const handleBackToToday = () => {
    setShowCheckinModal(false);
    // Navigate to Main Tabs or Home
    if (Routes?.MAIN_TABS) {
        navigation.navigate(Routes.MAIN_TABS);
    } else {
        navigation.goBack();
    }
  };

  const renderControls = () => {
    if (playlist.length <= 1) return null;

    return (
      <View style={[
        styles.controlsContainer, 
        isLandscape ? styles.controlsLandscape : styles.controlsPortrait
      ]}>
        <TouchableOpacity 
          onPress={handlePrev} 
          disabled={!hasPrev} 
          style={[styles.controlBtn, !hasPrev && styles.disabled]}
        >
          <Ionicons name="play-skip-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {playlist.length}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleNext} 
          disabled={!hasNext} 
          style={[styles.controlBtn, !hasNext && styles.disabled]}
        >
          <Ionicons name="play-skip-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: isLandscape ? 0 : insets.top }]}>
      
      <View style={styles.videoArea}>
        <VideoView
          key={`${videoId}-${currentIndex}`}
          style={styles.video}
          player={player}
          fullscreenOptions={{ enable: true }}
          allowsPictureInPicture
          nativeControls={true}
          contentFit="contain"
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={{ width: 40 }} /> 
        </View>

        {isLandscape && renderControls()}
      </View>

      {!isLandscape && (
        <View style={{ paddingBottom: insets.bottom + 10 }}>
           {renderControls()}
        </View>
      )}

      {/* ✅ RESTORED: Modal Component */}
      <EndSessionCheckinModal
        visible={showCheckinModal}
        onClose={handleCloseCheckin}
        onBackToToday={handleBackToToday}
        onNextSession={undefined} // Undefined because it's the last video
        hasNextSession={false}
        context={params.context}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  videoArea: {
    flex: 1,
    position: 'relative',
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0, 
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)", 
  },
  title: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  iconBtn: {
    padding: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  controlsPortrait: {
    backgroundColor: "black",
  },
  controlsLandscape: {
    position: 'absolute',
    bottom: 80, 
    left: '20%',
    right: '20%',
    backgroundColor: "rgba(20,20,20,0.8)",
    borderRadius: 30,
    justifyContent: 'center',
    gap: 40,
  },
  controlBtn: {
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 50,
  },
  disabled: {
    opacity: 0.3,
  },
  counterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  counterText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});