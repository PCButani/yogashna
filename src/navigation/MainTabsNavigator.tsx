import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import TodayScreen from "../screens/Dashboard/TodayScreen";
import LibraryScreen from "../screens/Library/LibraryScreen";
import LiveScreen from "../screens/Live/LiveScreen";
import ProgressScreen from "../screens/Progress/ProgressScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { MainTabParamList } from "../types/navigation";
import { Routes } from "../constants/routes";

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

          if (route.name === Routes.TODAY) iconName = "home-outline";
          if (route.name === Routes.LIBRARY) iconName = "grid-outline";
          if (route.name === Routes.LIVE) iconName = "play-circle-outline";
          if (route.name === Routes.PROGRESS) iconName = "bar-chart-outline";
          if (route.name === Routes.PROFILE) iconName = "person-outline";

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
      <Tab.Screen name={Routes.TODAY} component={TodayScreen} />
      <Tab.Screen name={Routes.LIBRARY} component={LibraryScreen} />
      <Tab.Screen name={Routes.LIVE} component={LiveScreen} />
      <Tab.Screen name={Routes.PROGRESS} component={ProgressScreen} />
      <Tab.Screen name={Routes.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
}
