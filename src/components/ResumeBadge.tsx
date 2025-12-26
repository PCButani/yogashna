import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  sessionId: string;
  variant?: "pill" | "chip";
};

const resumeKey = (sessionId: string) => `player_resume_${sessionId}`;

function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const mmStr = String(mm).padStart(2, "0");
  const ssStr = String(ss).padStart(2, "0");
  return `${mmStr}:${ssStr}`;
}

export default function ResumeBadge({ sessionId, variant = "pill" }: Props) {
  const [positionSec, setPositionSec] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(resumeKey(sessionId));
        if (!raw) return;

        const data = JSON.parse(raw);
        const pos = Number(data?.positionSec ?? 0);

        // Show badge only if meaningful progress
        if (pos > 10 && isMounted) setPositionSec(pos);
      } catch {
        // ignore silently
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const label = useMemo(() => {
    if (positionSec == null) return null;
    return `Resume · ${formatTime(positionSec)}`;
  }, [positionSec]);

  if (!label) return null;

  return (
    <View style={[styles.wrap, variant === "chip" ? styles.chip : styles.pill]}>
      <Ionicons name="play" size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  pill: {},
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },
});
