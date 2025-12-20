import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import TodayScreen from "../screens/Dashboard/TodayScreen";
import LibraryScreen from "../screens/Library/LibraryScreen";
import LiveScreen from "../screens/Live/LiveScreen";
import ProgressScreen from "../screens/Progress/ProgressScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

type MainTabParamList = {
  Today: undefined;
  Library: undefined;
  Live: undefined;
  Progress: undefined;
  Profile: undefined;
};

type TabIconName = "home-outline" | "grid-outline" | "play-circle-outline" | "bar-chart-outline" | "person-outline";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused }) => {
          let iconName: TabIconName = "home-outline";

          if (route.name === "Today") iconName = "home-outline";
          if (route.name === "Library") iconName = "grid-outline";
          if (route.name === "Live") iconName = "play-circle-outline";
          if (route.name === "Progress") iconName = "bar-chart-outline";
          if (route.name === "Profile") iconName = "person-outline";

          return (
            <Ionicons
              name={iconName}
              size={24}
              color={focused ? "#2E6B4F" : "#9AA3A7"}
            />
          );
        },
        tabBarActiveTintColor: "#2E6B4F",
        tabBarInactiveTintColor: "#9AA3A7",
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
