import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type AppIconProps = {
  name: string;
  size?: number;
  color?: string;
  type?: "ion" | "mci";
};

export default function AppIcon({
  name,
  size = 22,
  color = "#2E6B4F",
  type = "mci",
}: AppIconProps) {
  if (type === "ion") {
    return <Ionicons name={name as any} size={size} color={color} />;
  }
  return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
}
