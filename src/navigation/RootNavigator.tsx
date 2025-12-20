import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SignupOnboardingProvider } from "../data/onboarding/SignupOnboardingContext";
import SplashScreen from "../screens/Splash/SplashScreen";
import OnboardingScreen from "../screens/Onboarding/OnboardingScreen";
import AuthEntryScreen from "../screens/Auth/AuthEntryScreen";
import OtpVerifyScreen from "../screens/Auth/OtpVerifyScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import WellnessFocusScreen from "../screens/SignupOnboarding/WellnessFocusScreen";
import GoalsScreen from "../screens/SignupOnboarding/GoalsScreen";
import PersonalizePracticeScreen from "../screens/SignupOnboarding/PersonalizePracticeScreen";
import PlanSummaryScreen from "../screens/SignupOnboarding/PlanSummaryScreen";
import AboutYouScreen from "../screens/SignupOnboarding/AboutYouScreen";
import TodayScreen from "../screens/Dashboard/TodayScreen";
import MainTabsNavigator from "./MainTabsNavigator";







const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <SignupOnboardingProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="AuthEntry" component={AuthEntryScreen} />
          <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
          <Stack.Screen name="WellnessFocus" component={WellnessFocusScreen} />
          <Stack.Screen name="Goals" component={GoalsScreen} />
          <Stack.Screen name="AboutYou" component={AboutYouScreen} />
          <Stack.Screen name="PersonalizePractice" component={PersonalizePracticeScreen} />
          <Stack.Screen name="PlanSummary" component={PlanSummaryScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Today" component={TodayScreen} />
          <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SignupOnboardingProvider>
  );
}
