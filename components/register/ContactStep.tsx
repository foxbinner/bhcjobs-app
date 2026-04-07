import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { registerStyles as styles } from "./registerStyles";
import { InputField } from "./InputField";
import type { StepBag } from "./types";

interface Props extends StepBag {
  onBack: () => void;
  onNext: () => void;
}

export function ContactStep({
  form,
  errors,
  focused,
  setField,
  setFocused,
  onBack,
  onNext,
}: Props) {
  return (
    <View style={styles.slidePage}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Feather name="phone" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Contact & Documents</Text>
            <Text style={styles.cardSubtitle}>How can we reach you?</Text>
          </View>
        </View>

        <InputField
          label="Phone Number"
          required
          icon="phone"
          placeholder="01712345678 (11 digits)"
          value={form.phone}
          onChangeText={setField("phone")}
          error={errors.phone}
          keyboardType="phone-pad"
          maxLength={11}
          focused={focused === "phone"}
          onFocus={() => setFocused("phone")}
          onBlur={() => setFocused(null)}
        />

        <InputField
          label="Email Address"
          required
          icon="mail"
          placeholder="you@example.com"
          value={form.email}
          onChangeText={setField("email")}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          focused={focused === "email"}
          onFocus={() => setFocused("email")}
          onBlur={() => setFocused(null)}
        />

        <InputField
          label="Passport Number"
          required
          icon="credit-card"
          placeholder="A12345678"
          value={form.passport_number}
          onChangeText={setField("passport_number")}
          error={errors.passport_number}
          autoCapitalize="characters"
          focused={focused === "passport"}
          onFocus={() => setFocused("passport")}
          onBlur={() => setFocused(null)}
        />

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={16} color={colors.primary} />
            <Text style={styles.outlineBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, { flex: 1 }]}
            onPress={onNext}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
            <Feather name="arrow-right" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
