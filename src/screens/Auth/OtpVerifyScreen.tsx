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
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getConfirmationResult } from "./AuthEntryScreen";

type Mode = "login" | "signup";

export default function OtpVerifyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const mode: Mode = route?.params?.mode ?? "signup";
  const identifier: string =
    route?.params?.identifier ?? route?.params?.identity ?? "";

  const [otp, setOtp] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);

  // Resend timer (UI only - actual resend would need new signInWithPhoneNumber call)
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

  const onVerify = async () => {
    setTouched(true);
    if (!isValid) return;

    setLoading(true);

    try {
      const confirmationResult = getConfirmationResult();

      if (!confirmationResult) {
        throw new Error("No confirmation result found. Please request OTP again.");
      }

      console.log("🔑 Verifying OTP:", otp);

      // Confirm the OTP
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;

      console.log("✅ OTP verified successfully");
      console.log("👤 User:", user.uid);

      // Get ID token
      const token = await user.getIdToken();
      console.log("🎫 ID Token:", token);

      // Store token to display
      setIdToken(token);
    } catch (error: any) {
      console.error("❌ OTP verification error:", error);

      let errorMessage = "Invalid OTP. Please try again.";

      if (error.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid OTP code. Please check and try again.";
      } else if (error.code === "auth/code-expired") {
        errorMessage = "OTP has expired. Please request a new one.";
      }

      Alert.alert("Verification Failed", errorMessage);
      setLoading(false);
    }
  };

  const onResend = () => {
    if (seconds > 0) return;
    Alert.alert(
      "Resend OTP",
      "Please go back and request a new OTP from the previous screen."
    );
  };

  // If token is obtained, show token display screen
  if (idToken) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.tokenContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>

          <Text style={styles.successTitle}>Login Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your Firebase ID Token has been generated
          </Text>

          <View style={styles.tokenCard}>
            <Text style={styles.tokenLabel}>Firebase ID Token</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tokenScrollContainer}
            >
              <Text style={styles.tokenText} selectable>
                {idToken}
              </Text>
            </ScrollView>
            <Text style={styles.tokenHint}>
              This token can be used to authenticate API requests
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.logoutBtn}
            onPress={async () => {
              try {
                const { auth } = require("../../config/firebase");
                await auth.signOut();
                console.log("✅ Logged out successfully");

                // Navigate to auth entry
                navigation.reset({
                  index: 0,
                  routes: [{ name: "AuthEntry", params: { mode: "login" } }],
                });
              } catch (error) {
                console.error("Logout error:", error);
                Alert.alert("Error", "Failed to logout");
              }
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.secondaryBtn}
            onPress={() => {
              if (mode === "signup") {
                navigation.replace("WellnessFocus");
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MainTabs" }],
                });
              }
            }}
          >
            <Text style={styles.secondaryText}>
              {mode === "signup" ? "Continue to Onboarding" : "Go to Dashboard"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#2E6B4F" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            disabled={loading}
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
                editable={!loading}
              />
            </View>

            {touched && !isValid ? (
              <Text style={styles.error}>Please enter all 6 digits.</Text>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!isValid || loading}
              style={[
                styles.primaryBtn,
                (!isValid || loading) && styles.btnDisabled,
              ]}
              onPress={onVerify}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryText}>Verify</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.links}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onResend}
                disabled={seconds > 0 || loading}
              >
                <Text
                  style={[
                    styles.linkText,
                    (seconds > 0 || loading) && styles.linkDisabled,
                  ]}
                >
                  {seconds > 0 ? `Resend OTP in ${seconds}s` : "Resend OTP"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.changeText}>Change phone number</Text>
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
const GREEN = "#2E6B4F";

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
    color: GREEN,
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

  // Token display styles
  tokenContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
  },

  successIcon: {
    marginTop: 20,
    marginBottom: 16,
  },

  successTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },

  successSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },

  tokenCard: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 20,
  },

  tokenLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 10,
  },

  tokenScrollContainer: {
    maxHeight: 120,
  },

  tokenText: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#111827",
    lineHeight: 18,
  },

  tokenHint: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 10,
    fontStyle: "italic",
  },

  logoutBtn: {
    width: "100%",
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10 as any,
    marginBottom: 12,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  secondaryBtn: {
    width: "100%",
    backgroundColor: "#EAF3EE",
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10 as any,
  },

  secondaryText: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "900",
  },
});
