import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  loadNotificationSettings,
  saveNotificationSettings,
  scheduleDailyNotification,
  requestNotificationPermissions,
  cancelAllNotifications,
  NotificationSettings,
} from "../../services/notificationService";

type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    time: "09:00",
    days: DAYS,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loaded = await loadNotificationSettings();
      setSettings(loaded);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    if (value) {
      // Request permission before enabling
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive daily reminders.",
          [{ text: "OK" }]
        );
        return;
      }
    }

    const newSettings = { ...settings, enabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios"); // Keep picker open on iOS

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}`;

      const newSettings = { ...settings, time: timeString };
      setSettings(newSettings);
      saveSettings(newSettings);
    }
  };

  const toggleDay = (day: DayKey) => {
    let newDays: string[];

    if (settings.days.includes(day)) {
      // Remove day (but keep at least one day selected)
      if (settings.days.length === 1) {
        Alert.alert(
          "Cannot Deselect",
          "At least one day must be selected for reminders.",
          [{ text: "OK" }]
        );
        return;
      }
      newDays = settings.days.filter((d) => d !== day);
    } else {
      // Add day
      newDays = [...settings.days, day];
    }

    const newSettings = { ...settings, days: newDays };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const selectAllDays = () => {
    const newSettings = { ...settings, days: [...DAYS] };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      setSaving(true);
      await saveNotificationSettings(newSettings);

      if (newSettings.enabled) {
        await scheduleDailyNotification(newSettings);
      } else {
        await cancelAllNotifications();
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      Alert.alert("Error", "Failed to save notification settings. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const parseTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(":").map((s) => parseInt(s, 10));
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isDailyReminder = settings.days.length === 7;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Main Settings Card */}
        <View style={styles.card}>
          <View style={styles.iconHeader}>
            <View style={styles.iconWrap}>
              <Ionicons name="notifications" size={28} color="#5B8C6A" />
            </View>
            <Text style={styles.iconHeaderTitle}>Daily Practice Reminder</Text>
            <Text style={styles.iconHeaderSubtitle}>
              Gentle nudges to maintain your yoga habit
            </Text>
          </View>

          {/* Enable Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Enable Reminder</Text>
              <Text style={styles.settingSubtitle}>
                {settings.enabled
                  ? "You'll receive daily reminders"
                  : "Turn on to receive reminders"}
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggle}
              trackColor={{ false: "#E2E8F0", true: "#A7C4A0" }}
              thumbColor={settings.enabled ? "#5B8C6A" : "#F1F5F9"}
              ios_backgroundColor="#E2E8F0"
              disabled={saving}
            />
          </View>

          {settings.enabled && (
            <>
              <View style={styles.divider} />

              {/* Time Picker */}
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingTitle}>Reminder Time</Text>
                  <Text style={styles.settingSubtitle}>Choose your preferred time</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  style={styles.timeButton}
                  activeOpacity={0.7}
                  disabled={saving}
                >
                  <Ionicons name="time-outline" size={18} color="#5B8C6A" />
                  <Text style={styles.timeButtonText}>{formatTime(settings.time)}</Text>
                </TouchableOpacity>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={parseTime(settings.time)}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                />
              )}

              <View style={styles.divider} />

              {/* Days Selection */}
              <View style={styles.daysSection}>
                <View style={styles.daysSectionHeader}>
                  <Text style={styles.settingTitle}>Reminder Days</Text>
                  {!isDailyReminder && (
                    <TouchableOpacity
                      onPress={selectAllDays}
                      activeOpacity={0.7}
                      disabled={saving}
                    >
                      <Text style={styles.selectAllText}>Select All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.settingSubtitle}>
                  {isDailyReminder
                    ? "Reminders set for every day"
                    : `Reminders on ${settings.days.length} day${settings.days.length > 1 ? "s" : ""}`}
                </Text>

                <View style={styles.daysGrid}>
                  {DAYS.map((day) => {
                    const isSelected = settings.days.includes(day);
                    return (
                      <TouchableOpacity
                        key={day}
                        onPress={() => toggleDay(day)}
                        style={[styles.dayPill, isSelected && styles.dayPillActive]}
                        activeOpacity={0.7}
                        disabled={saving}
                      >
                        <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="information-circle" size={20} color="#5B8C6A" />
          </View>
          <Text style={styles.infoText}>
            Daily reminders help build consistency in your practice. You can adjust or
            disable them anytime.
          </Text>
        </View>

        {saving && (
          <View style={styles.savingIndicator}>
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FBF7F2",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 16,
  },

  // Icon Header
  iconHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8F2E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  iconHeaderSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "center",
  },

  // Settings Row
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  settingLeft: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  // Time Button
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#E8F2E8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(91,140,106,0.2)",
  },
  timeButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#5B8C6A",
    marginLeft: 6,
  },

  // Days Section
  daysSection: {
    paddingTop: 4,
  },
  daysSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5B8C6A",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 10,
  },
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    minWidth: 52,
    alignItems: "center",
  },
  dayPillActive: {
    backgroundColor: "#5B8C6A",
    borderColor: "#5B8C6A",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
  },
  dayTextActive: {
    color: "#FFFFFF",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "rgba(15,23,42,0.06)",
    marginVertical: 18,
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(91,140,106,0.08)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(91,140,106,0.12)",
  },
  infoIconWrap: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
    lineHeight: 19,
  },

  // Saving Indicator
  savingIndicator: {
    marginTop: 12,
    alignItems: "center",
  },
  savingText: {
    fontSize: 13,
    color: "#5B8C6A",
    fontWeight: "700",
  },
});
