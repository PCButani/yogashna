import React from "react";
import { SafeAreaView, Text, StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.sub}>Coming next</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  wrap: { padding: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#111" },
  sub: { marginTop: 6, color: "#777" },
});
