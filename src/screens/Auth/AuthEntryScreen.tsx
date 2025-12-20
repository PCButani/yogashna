import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function AuthEntryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // mode comes from: navigation.navigate("AuthEntry", { mode: "signup" })
  const mode: "signup" | "login" = route.params?.mode ?? "signup";

  const [value, setValue] = useState("");
  const trimmed = value.trim();

  const isEmail = useMemo(() => trimmed.includes("@"), [trimmed]);

  const canContinue = trimmed.length >= 3;

  const title = mode === "signup" ? "Create your account" : "Welcome back";
  const sub =
    mode === "signup"
      ? "Enter your mobile number or email to receive an OTP"
      : "Enter your mobile number or email to log in with OTP";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>

        <View style={styles.logoCircle}>
          <Ionicons name="leaf-outline" size={22} color="#2E6B4F" />
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{sub}</Text>

        <View style={styles.inputWrap}>
          <Ionicons
            name={isEmail ? "mail-outline" : "call-outline"}
            size={18}
            color="#6B7280"
            style={{ marginRight: 10 }}
          />

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Mobile number or email"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType={isEmail ? "email-address" : "phone-pad"}
            style={styles.input}
          />
        </View>

        <Text style={styles.hint}>
          We’ll send a 6-digit OTP to verify your account.
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!canContinue}
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={() =>
            navigation.navigate("OtpVerify", {
              mode,
              identifier: trimmed,
            })
          }
        >
          <Text style={styles.ctaText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        {/* Small switch line (optional but helpful) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.replace("AuthEntry", {
              mode: mode === "signup" ? "login" : "signup",
            })
          }
          style={{ alignSelf: "center", marginTop: 16 }}
        >
          <Text style={styles.switchText}>
            {mode === "signup"
              ? "Already have an account? Log In"
              : "New here? Create an account"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const ACCENT = "#F2A365";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EAF3EE",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 8,
  },

  inputWrap: {
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
  },

  hint: {
    marginTop: 10,
    fontSize: 12.5,
    color: "#9CA3AF",
    textAlign: "center",
  },

  cta: {
    marginTop: 22,
    backgroundColor: ACCENT,
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10 as any,
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },

  switchText: {
    color: "#2E6B4F",
    fontWeight: "800",
    fontSize: 14,
  },
});
