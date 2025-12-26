import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SignupOnboardingProvider } from "../data/onboarding/SignupOnboardingContext";
import SplashScreen from "../screens/Splash/SplashScreen";
import OnboardingScreen from "../screens/Onboarding/OnboardingScreen";
import AuthEntryScreen from "../screens/Auth/AuthEntryScreen";
import OtpVerifyScreen from "../screens/Auth/OtpVerifyScreen";
import WellnessFocusScreen from "../screens/SignupOnboarding/WellnessFocusScreen";
import GoalsScreen from "../screens/SignupOnboarding/GoalsScreen";
import PersonalizePracticeScreen from "../screens/SignupOnboarding/PersonalizePracticeScreen";
import PlanSummaryScreen from "../screens/SignupOnboarding/PlanSummaryScreen";
import AboutYouScreen from "../screens/SignupOnboarding/AboutYouScreen";
import TodayScreen from "../screens/Dashboard/TodayScreen";
import MainTabsNavigator from "./MainTabsNavigator";
import WellnessGoalsScreen from "../screens/Library/WellnessGoalsScreen";
import CommonPlayerScreen from "../screens/Player/CommonPlayerScreen";
import { RootStackParamList } from "../types/navigation";
import { Routes } from "../constants/routes";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <SignupOnboardingProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={Routes.SPLASH} component={SplashScreen} />
          <Stack.Screen name={Routes.ONBOARDING} component={OnboardingScreen} />
          <Stack.Screen name={Routes.AUTH_ENTRY} component={AuthEntryScreen} />
          <Stack.Screen name={Routes.OTP_VERIFY} component={OtpVerifyScreen} />
          <Stack.Screen name={Routes.WELLNESS_FOCUS} component={WellnessFocusScreen} />
          <Stack.Screen name={Routes.GOALS} component={GoalsScreen} />
          <Stack.Screen name={Routes.ABOUT_YOU} component={AboutYouScreen} />
          <Stack.Screen name={Routes.PERSONALIZE_PRACTICE} component={PersonalizePracticeScreen} />
          <Stack.Screen name={Routes.PLAN_SUMMARY} component={PlanSummaryScreen} />
          <Stack.Screen name={Routes.TODAY} component={TodayScreen} />
          <Stack.Screen name={Routes.WELLNESS_GOALS} component={WellnessGoalsScreen} />
          <Stack.Screen name={Routes.COMMON_PLAYER} component={CommonPlayerScreen} />
          <Stack.Screen name={Routes.MAIN_TABS} component={MainTabsNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SignupOnboardingProvider>
  );
}
