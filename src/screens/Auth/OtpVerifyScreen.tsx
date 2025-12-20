import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

type Mode = "login" | "signup";

export default function OtpVerifyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const mode: Mode = route?.params?.mode ?? "signup";

  // ✅ Accept both keys (to avoid breaking if you used identity earlier)
  const identifier: string =
    route?.params?.identifier ?? route?.params?.identity ?? "";

  const [otp, setOtp] = useState("");
  const [touched, setTouched] = useState(false);

  // Resend timer (UI only)
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const isValid = useMemo(() => otp.trim().length === 6, [otp]);

  const masked = useMemo(() => maskIdentifier(identifier), [identifier]);

  const title = "Verify OTP";
  const subtitle =
    mode === "signup"
      ? `We sent a 6-digit code to ${masked}`
      : `Enter the 6-digit code sent to ${masked}`;

  const onVerify = () => {
    setTouched(true);
    if (!isValid) return;

    // ✅ Signup users must complete onboarding questions
    if (mode === "signup") {
      navigation.replace("WellnessFocus");
      return;
    }

    // ✅ Login users -> go directly to MainTabs (Dashboard container)
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  const onResend = () => {
    if (seconds > 0) return;
    alert("OTP resent ✅ (dummy)");
    setSeconds(30);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.card}>
            <Text style={styles.label}>6-digit code</Text>

            <View style={styles.otpRow}>
              <Ionicons name="key-outline" size={18} color="#6B7280" />
              <TextInput
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
                onBlur={() => setTouched(true)}
                placeholder="••••••"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                style={styles.otpInput}
                maxLength={6}
              />
            </View>

            {touched && !isValid ? (
              <Text style={styles.error}>Please enter all 6 digits.</Text>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!isValid}
              style={[styles.primaryBtn, !isValid && styles.btnDisabled]}
              onPress={onVerify}
            >
              <Text style={styles.primaryText}>Verify</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.links}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onResend}
                disabled={seconds > 0}
              >
                <Text
                  style={[
                    styles.linkText,
                    seconds > 0 && styles.linkDisabled,
                  ]}
                >
                  {seconds > 0 ? `Resend OTP in ${seconds}s` : "Resend OTP"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.changeText}>Change email/phone</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.helper}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#6B7280"
            />
            <Text style={styles.helperText}>
              For security, OTP is valid for a short time.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Helpers */
function maskIdentifier(val: string) {
  const v = (val || "").trim();
  if (!v) return "";

  // email
  if (v.includes("@")) {
    const [name, domain] = v.split("@");
    if (!domain) return v;
    const first = name.slice(0, 2);
    return `${first}${"*".repeat(Math.max(0, name.length - 2))}@${domain}`;
  }

  // phone
  const digits = v.replace(/\D/g, "");
  if (digits.length <= 4) return v;
  const last4 = digits.slice(-4);
  return `•••• •••• ${last4}`;
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

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 10,
    marginBottom: 18,
  },

  card: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF2F4",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  label: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 10,
  },

  otpRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10 as any,
  },

  otpInput: {
    flex: 1,
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 10,
    paddingVertical: 2,
  },

  error: {
    marginTop: 10,
    color: "#B42318",
    fontSize: 12.5,
    fontWeight: "700",
  },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10 as any,
  },
  btnDisabled: { opacity: 0.45 },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  links: {
    marginTop: 14,
    alignItems: "center",
    gap: 10 as any,
  },

  linkText: {
    color: "#2E6B4F",
    fontSize: 14,
    fontWeight: "900",
  },
  linkDisabled: { color: "#9CA3AF" },

  changeText: {
    color: "#6B7280",
    fontSize: 13.5,
    fontWeight: "800",
  },

  helper: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8 as any,
  },
  helperText: {
    color: "#6B7280",
    fontSize: 12.5,
    fontWeight: "700",
  },
});
