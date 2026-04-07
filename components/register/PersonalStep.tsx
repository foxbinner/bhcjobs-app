import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { registerStyles as styles } from "./registerStyles";
import { InputField } from "./InputField";
import type { StepBag } from "./types";

interface Props extends StepBag {
  onNext: () => void;
}

export function PersonalStep({
  form,
  errors,
  focused,
  setField,
  setFocused,
  onNext,
}: Props) {
  return (
    <View style={styles.slidePage}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Feather name="user" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Personal Details</Text>
            <Text style={styles.cardSubtitle}>Tell us about yourself</Text>
          </View>
        </View>

        <InputField
          label="Full Name"
          required
          icon="user"
          placeholder="John Doe"
          value={form.name}
          onChangeText={setField("name")}
          error={errors.name}
          focused={focused === "name"}
          onFocus={() => setFocused("name")}
          onBlur={() => setFocused(null)}
        />

        <InputField
          label="Date of Birth"
          required
          icon="calendar"
          placeholder="YYYY-MM-DD"
          value={form.dob}
          onChangeText={setField("dob")}
          error={errors.dob}
          focused={focused === "dob"}
          onFocus={() => setFocused("dob")}
          onBlur={() => setFocused(null)}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Gender <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.genderRow}>
            {(["male", "female"] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderBtn,
                  form.gender === g && styles.genderBtnActive,
                ]}
                onPress={() => setField("gender")(g)}
                activeOpacity={0.8}
              >
                <Feather
                  name="user"
                  size={14}
                  color={form.gender === g ? colors.white : colors.gray}
                />
                <Text
                  style={[
                    styles.genderText,
                    form.gender === g && styles.genderTextActive,
                  ]}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Continue</Text>
          <Feather name="arrow-right" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
