import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// ✅ Adjust this import to your actual context path
import { useSignupOnboarding } from "../../data/onboarding/SignupOnboardingContext";

type GenderOption = "male" | "female" | "na";

function clampInt(value: string, min: number, max: number) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}

function parseNumber(value: string) {
  // allow decimals; strip non-numeric except dot
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function calcBmiKgCm(weightKg: number, heightCm: number) {
  const hM = heightCm / 100;
  if (hM <= 0) return null;
  const bmi = weightKg / (hM * hM);
  // keep a sensible precision internally
  return Math.round(bmi * 10) / 10;
}

export default function AboutYouScreen() {
  const navigation = useNavigation<any>();
  const onboarding = useSignupOnboarding();

  // Pre-fill if available (optional)
  const initial = (onboarding as any)?.state?.personalInfo ?? (onboarding as any)?.personalInfo ?? {};

  const [age, setAge] = useState<string>(initial?.age ? String(initial.age) : "");
  const [gender, setGender] = useState<GenderOption>(
    initial?.gender === "male" || initial?.gender === "female" || initial?.gender === "na"
      ? initial.gender
      : "na"
  );
  const [heightCm, setHeightCm] = useState<string>(initial?.heightCm ? String(initial.heightCm) : "");
  const [weightKg, setWeightKg] = useState<string>(initial?.weightKg ? String(initial.weightKg) : "");

  const computed = useMemo(() => {
    const ageN = clampInt(age, 13, 100); // keep wide but safe
    const h = parseNumber(heightCm);
    const w = parseNumber(weightKg);

    const heightOk = h !== null && h >= 90 && h <= 230; // cm
    const weightOk = w !== null && w >= 25 && w <= 250; // kg
    const ageOk = ageN !== null && ageN >= 13 && ageN <= 100;

    const bmi = heightOk && weightOk ? calcBmiKgCm(w!, h!) : null;

    return {
      ageN,
      heightN: heightOk ? h : null,
      weightN: weightOk ? w : null,
      bmi,
      ageOk,
      heightOk,
      weightOk,
      canContinue: ageOk && heightOk && weightOk,
    };
  }, [age, heightCm, weightKg]);

  const onContinue = () => {
    if (!computed.canContinue) {
      // Soft validation — avoid harsh red, but still guide
      Alert.alert(
        "Just a quick check",
        "Please enter a valid age, height (cm), and weight (kg) so we can personalize your practice safely."
      );
      return;
    }

    const payload = {
      age: computed.ageN,
      gender, // "male" | "female" | "na"
      heightCm: computed.heightN,
      weightKg: computed.weightN,
      bmi: computed.bmi, // ✅ stored but not shown
    };

    // ✅ Save to your context (support multiple naming styles)
    // Prefer a dedicated setter if you have one:
    const anyOnboarding = onboarding as any;

    if (typeof anyOnboarding?.setPersonalInfo === "function") {
      anyOnboarding.setPersonalInfo(payload);
    } else if (typeof anyOnboarding?.setAboutYou === "function") {
      anyOnboarding.setAboutYou(payload);
    } else if (typeof anyOnboarding?.dispatch === "function") {
      anyOnboarding.dispatch({ type: "SET_PERSONAL_INFO", payload });
    } else {
      // Last resort: attach to state-like object (not ideal, but prevents blocking you)
      anyOnboarding.personalInfo = payload;
    }

    // ✅ Navigate to your next step screen (adjust route name)
    navigation.navigate("PersonalizePractice");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tell us a little about you</Text>
            <Text style={styles.subtitle}>
              This helps us suggest safer and more suitable practices for your body.
            </Text>
          </View>

          {/* Privacy Note */}
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              Your information is private and only used to personalize your practice.
            </Text>
          </View>

          {/* Age */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
              placeholder="e.g., 32"
              placeholderTextColor="#9AA3A7"
              keyboardType="number-pad"
              style={styles.input}
              maxLength={3}
              returnKeyType="done"
            />
            <Text style={styles.hint}>Recommended range: 13 – 100</Text>
          </View>

          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Gender (optional)</Text>
            <View style={styles.pillsRow}>
              <Pill label="Male" selected={gender === "male"} onPress={() => setGender("male")} />
              <Pill label="Female" selected={gender === "female"} onPress={() => setGender("female")} />
              <Pill
                label="Prefer not to say"
                selected={gender === "na"}
                onPress={() => setGender("na")}
                wide
              />
            </View>
          </View>

          {/* Height + Weight */}
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.half]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                value={heightCm}
                onChangeText={(t) => setHeightCm(t.replace(/[^0-9.]/g, ""))}
                placeholder="e.g., 170"
                placeholderTextColor="#9AA3A7"
                keyboardType="decimal-pad"
                style={styles.input}
                maxLength={6}
              />
              <Text style={styles.hint}>Typical: 90 – 230 cm</Text>
            </View>

            <View style={[styles.fieldGroup, styles.half]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                value={weightKg}
                onChangeText={(t) => setWeightKg(t.replace(/[^0-9.]/g, ""))}
                placeholder="e.g., 68"
                placeholderTextColor="#9AA3A7"
                keyboardType="decimal-pad"
                style={styles.input}
                maxLength={6}
              />
              <Text style={styles.hint}>Typical: 25 – 250 kg</Text>
            </View>
          </View>

          {/* Gentle guidance text (no BMI shown) */}
          <View style={styles.softInfo}>
            <Text style={styles.softInfoText}>
              We’ll use this to adjust posture intensity and pace for comfort and safety.
            </Text>
          </View>

          {/* Spacer */}
          <View style={{ height: 18 }} />

          {/* Continue */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onContinue}
            style={[styles.cta, !computed.canContinue && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>Continue</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Pill({
  label,
  selected,
  onPress,
  wide,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  wide?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.pill,
        wide && styles.pillWide,
        selected ? styles.pillSelected : styles.pillUnselected,
      ]}
    >
      <Text style={[styles.pillText, selected ? styles.pillTextSelected : styles.pillTextUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF", // soft neutral
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E2A2E",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5E6A6E",
  },
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ECE6DA",
    marginBottom: 18,
  },
  noteText: {
    color: "#4E5A5E",
    fontSize: 13,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3A3F",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7E0D3",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E2A2E",
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: "#7A868A",
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10 as any,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillWide: {
    paddingHorizontal: 16,
  },
  pillSelected: {
    backgroundColor: "#E6F2EA", // soft green
    borderColor: "#B9D8C2",
  },
  pillUnselected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E0D3",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pillTextSelected: {
    color: "#1F4D34",
  },
  pillTextUnselected: {
    color: "#4E5A5E",
  },
  row: {
    flexDirection: "row",
    gap: 12 as any,
  },
  half: {
    flex: 1,
  },
  softInfo: {
    backgroundColor: "#FFF7E6", // very soft saffron tint
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0E0B8",
  },
  softInfoText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#5B4A2E",
  },
  cta: {
    backgroundColor: "#E08A2E", // saffron/orange CTA
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
