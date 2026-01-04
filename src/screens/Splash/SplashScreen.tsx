import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { Routes } from "../../constants/routes";
import { auth } from "../../config/firebase";
import { getProfile } from "../../services/api";
import { UserMe } from "../../types/api";

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Splash"
>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndRoute();
  }, []);

  /**
   * Check authentication state and route accordingly
   */
  const checkAuthAndRoute = async () => {
    try {
      // Wait a moment for Firebase to initialize
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const currentUser = auth.currentUser;

      // Case 1: User is NOT logged in → Go to Onboarding intro
      if (!currentUser) {
        console.log("📍 No user logged in → Onboarding");
        navigation.replace(Routes.ONBOARDING);
        return;
      }

      // Case 2: User IS logged in → Fetch profile from backend
      console.log("📍 User logged in → Fetching profile...");

      try {
        const profile = await getProfile();

        // Route based on onboarding completion
        routeBasedOnProfile(profile);
      } catch (apiError: any) {
        console.error("❌ Failed to fetch profile:", apiError);

        // If backend is unreachable or returns 401
        if (
          apiError.message?.includes("Unauthorized") ||
          apiError.message?.includes("Failed to fetch")
        ) {
          // Sign out and go to auth
          console.log("🔓 Signing out due to API error");
          await auth.signOut();
          navigation.replace(Routes.AUTH_ENTRY, { mode: "login" });
          return;
        }

        // For other errors, show error message
        setError("Failed to connect to server. Please try again.");
      }
    } catch (error) {
      console.error("❌ checkAuthAndRoute error:", error);
      setError("Something went wrong. Please restart the app.");
    }
  };

  /**
   * Route user based on their profile and onboarding status
   */
  const routeBasedOnProfile = (profile: UserMe) => {
    console.log("📊 Profile:", {
      name: profile.name,
      onboardingComplete: profile.onboarding.isComplete,
      wellnessFocus: profile.wellnessFocusId,
      primaryGoal: profile.primaryGoalId,
    });

    // If onboarding is complete → Go to MainTabs
    if (profile.onboarding.isComplete) {
      console.log("✅ Onboarding complete → MainTabs");
      navigation.replace(Routes.MAIN_TABS);
      return;
    }

    // If onboarding is NOT complete → Resume at first missing step
    console.log("⏸️ Onboarding incomplete → Resuming...");
    const nextScreen = getNextOnboardingScreen(profile);
    console.log("📍 Next screen:", nextScreen);

    navigation.replace(nextScreen);
  };

  /**
   * Determine the next onboarding screen based on what's missing
   */
  const getNextOnboardingScreen = (
    profile: UserMe
  ): keyof RootStackParamList => {
    // Step 1: WellnessFocus
    if (!profile.wellnessFocusId) {
      return Routes.WELLNESS_FOCUS;
    }

    // Step 2: Goals
    if (!profile.primaryGoalId) {
      return Routes.GOALS;
    }

    // Step 3: AboutYou
    if (!profile.name || !profile.age || !profile.gender) {
      return Routes.ABOUT_YOU;
    }

    // Step 4: PersonalizePractice
    if (
      !profile.preferences?.sessionLength ||
      !profile.preferences?.preferredTime ||
      !profile.preferences?.experienceLevel
    ) {
      return Routes.PERSONALIZE_PRACTICE;
    }

    // Step 5: PlanSummary (final step)
    // If all fields are filled but onboarding.isComplete = false,
    // go to PlanSummary
    return Routes.PLAN_SUMMARY;
  };

  // Show error if any
  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.errorWrap}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              Make sure backend is running on http://localhost:3000
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
  errorWrap: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});
