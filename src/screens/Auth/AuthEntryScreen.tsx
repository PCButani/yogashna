import React, { useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../config/firebase";
import { signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import app from "../../config/firebase";

// Store confirmation result globally for OTP verification
let globalConfirmationResult: ConfirmationResult | null = null;

export function getConfirmationResult() {
  return globalConfirmationResult;
}

export default function AuthEntryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const mode: "signup" | "login" = route.params?.mode ?? "signup";

  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const trimmed = value.trim();

  // RecaptchaVerifier ref for React Native
  const recaptchaVerifier = useRef<any>(null);

  const isEmail = useMemo(() => trimmed.includes("@"), [trimmed]);
  const canContinue = trimmed.length >= 3;

  const title = mode === "signup" ? "Create your account" : "Welcome back";
  const sub =
    mode === "signup"
      ? "Enter your mobile number to receive an OTP"
      : "Enter your mobile number to log in with OTP";

  const handleContinue = async () => {
    if (!canContinue) return;

    // Only support phone numbers for Firebase Auth
    if (isEmail) {
      Alert.alert(
        "Phone Number Required",
        "Firebase Phone Auth requires a phone number. Email login is not supported yet."
      );
      return;
    }

    setLoading(true);

    try {
      // Format phone number (ensure it starts with +)
      let phoneNumber = trimmed;
      if (!phoneNumber.startsWith("+")) {
        // Default to India if no country code
        phoneNumber = "+91" + phoneNumber.replace(/^0+/, "");
      }

      console.log("📱 Sending OTP to:", phoneNumber);

      if (!recaptchaVerifier.current) {
        throw new Error("RecaptchaVerifier not initialized");
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier.current
      );

      console.log("✅ OTP sent successfully");

      // Store globally for OTP verification screen
      globalConfirmationResult = confirmationResult;

      navigation.navigate("OtpVerify", {
        mode,
        identifier: phoneNumber,
      });
    } catch (error: any) {
      console.error("❌ Phone auth error:", error);

      let errorMessage = "Failed to send OTP. Please try again.";

      if (error.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format. Please check and try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (error.code === "auth/quota-exceeded") {
        errorMessage = "SMS quota exceeded. Please try again later.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Firebase reCAPTCHA Modal for React Native */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={true}
      />

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
            placeholder="Mobile number (e.g., +919876543210)"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="phone-pad"
            style={styles.input}
            editable={!loading}
          />
        </View>

        <Text style={styles.hint}>
          We'll send a 6-digit OTP to verify your account.
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!canContinue || loading}
          style={[styles.cta, (!canContinue || loading) && styles.ctaDisabled]}
          onPress={handleContinue}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.ctaText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        {/* Small switch line */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.replace("AuthEntry", {
              mode: mode === "signup" ? "login" : "signup",
            })
          }
          style={{ alignSelf: "center", marginTop: 16 }}
          disabled={loading}
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
