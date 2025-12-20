import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  useSignupOnboarding,
  WellnessFocus,
} from "../../data/onboarding/SignupOnboardingContext";

const OPTIONS: {
  key: WellnessFocus;
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
}[] = [
  {
    key: "Health Support",
    title: "Health Support",
    sub: "Improve back pain, stress",
    icon: "heart-outline",
    bg: "#EAF6F0",
  },
  {
    key: "Lifestyle & Habits",
    title: "Lifestyle & Habits",
    sub: "Build wellness routines",
    icon: "leaf-outline",
    bg: "#EEF8F3",
  },
  {
    key: "Fitness & Flexibility",
    title: "Fitness & Flexibility",
    sub: "Strengthen and transform",
    icon: "fitness-outline",
    bg: "#FBF6EE",
  },
  {
    key: "Beginners & Mindfulness",
    title: "Beginners & Mindfulness",
    sub: "Gentle yoga introduction",
    icon: "body-outline",
    bg: "#F1F7F3",
  },
  {
    key: "Office Yoga",
    title: "Office Yoga",
    sub: "Release tension, stay energized",
    icon: "briefcase-outline",
    bg: "#EEF6F7",
  },
];

export default function WellnessFocusScreen() {
  const navigation = useNavigation<any>();
  const { data, setFocus } = useSignupOnboarding();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Choose your wellness focus</Text>
        <Text style={styles.subtitle}>
          Select one category to personalize your journey
        </Text>

        <View style={styles.list}>
          {OPTIONS.map((item) => {
            const selected = data.focus === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.9}
                onPress={() => setFocus(item.key)}
                style={[
                  styles.card,
                  { backgroundColor: item.bg },
                  selected && styles.cardSelected,
                ]}
              >
                <View style={styles.row}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.iconCircle,
                      selected && styles.iconCircleSelected,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={selected ? "#1F6F57" : "#4B5563"}
                    />
                  </View>

                  {/* Text */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSub}>{item.sub}</Text>
                  </View>

                  {/* Check */}
                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={26}
                      color="#2E6B4F"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!data.focus}
          style={[styles.cta, !data.focus && styles.ctaDisabled]}
          onPress={() => navigation.navigate("Goals")}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    marginTop: 10,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7478",
    marginTop: 6,
    marginBottom: 18,
  },
  list: {
    flex: 1,
    gap: 14,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5EFE9",
  },
  cardSelected: {
    borderColor: "#BFDCCF",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: "#EAF6F0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  cardSub: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
  },
  cta: {
    backgroundColor: "#E2B46B", // same saffron as dashboard
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 14,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
