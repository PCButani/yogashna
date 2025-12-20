import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SplashScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 1400);

    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Brand */}
        <View style={styles.brandWrap}>
          <Text style={styles.brand}>Yogashna</Text>
          <Text style={styles.tagline}>
            Your daily space for calm, strength & balance
          </Text>
        </View>

        {/* Loader */}
        <ActivityIndicator size="small" color="#2E6B4F" />
      </View>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brandWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  brand: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: 0.4,
  },
  tagline: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7478",
    textAlign: "center",
    maxWidth: 260,
  },
});
