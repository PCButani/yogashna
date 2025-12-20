import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();

  return (
    <ImageBackground
      source={require("../../../assets/Yoga.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Dark overlay */}
        <View style={styles.overlay} />

        {/* Top Content */}
        <View style={styles.content}>
          {/* Small brand icon */}
          <View style={styles.brandIcon}>
            <Ionicons name="leaf-outline" size={22} color="#fff" />
          </View>

          <Text style={styles.title}>Namaste</Text>

          <Text style={styles.subTitle}>
            A calm, guided yoga experience crafted just for you 🙏
          </Text>

          <Text style={styles.hint}>Begin Your Practice</Text>

          {/* Buttons */}
          <View style={styles.btnWrap}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.primaryBtn}
              onPress={() => navigation.navigate("AuthEntry", { mode: "signup" })}
            >
              <View style={styles.btnRow}>
                <Ionicons name="sparkles-outline" size={20} color="#fff" />
                <Text style={styles.primaryText}>Start Your Journey</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("AuthEntry", { mode: "login" })}
            >
              <View style={styles.btnRow}>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.secondaryText}>I already have an account</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.socialProof}>
              Join thousands finding their flow
            </Text>
          </View>
        </View>

        {/* Bottom White Sheet */}
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Your Wellness Companion</Text>

          <View style={styles.row}>
            <View style={styles.item}>
              <Ionicons name="body-outline" size={18} color="#4F9D7F" />
              <Text style={styles.itemText}>Mind–Body Harmony</Text>
            </View>

            <View style={styles.item}>
              <Ionicons name="time-outline" size={18} color="#4F9D7F" />
              <Text style={styles.itemText}>5 to 60 minutes</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.item}>
              <Ionicons name="trending-up-outline" size={18} color="#4F9D7F" />
              <Text style={styles.itemText}>Track Progress</Text>
            </View>

            <View style={styles.item}>
              <Ionicons name="school-outline" size={18} color="#4F9D7F" />
              <Text style={styles.itemText}>Certified Guides</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const PRIMARY = "#E2A365";

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 18,
  },

  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fff",
    marginTop: 18,
    letterSpacing: 0.4,
  },

  subTitle: {
    marginTop: 12,
    fontSize: 16,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
    fontWeight: "600",
  },

  hint: {
    marginTop: 18,
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
  },

  btnWrap: {
    width: "100%",
    marginTop: 22,
    paddingHorizontal: 16,
  },

  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },

  primaryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  secondaryBtn: {
    marginTop: 14,
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.65)",
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  secondaryText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 16,
    fontWeight: "800",
  },

  socialProof: {
    textAlign: "center",
    marginTop: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "700",
    fontSize: 13,
  },

  sheet: {
  backgroundColor: "#fff",
  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,
  paddingHorizontal: 18,
  paddingTop: 18,
  paddingBottom: 40,

  // ✅ makes the white area taller
  minHeight: 230,
},


  sheetTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  item: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },

  itemText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
  },
});
