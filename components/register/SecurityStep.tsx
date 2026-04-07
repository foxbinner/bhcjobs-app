import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { registerStyles as styles } from "./registerStyles";
import { ErrorMsg, HintItem } from "./InputField";
import type { StepBag } from "./types";

interface Props extends StepBag {
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirm: boolean;
  setShowConfirm: (v: boolean) => void;
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function SecurityStep({
  form,
  errors,
  focused,
  setField,
  setFocused,
  showPassword,
  setShowPassword,
  showConfirm,
  setShowConfirm,
  loading,
  onBack,
  onSubmit,
}: Props) {
  const passwordsMatch =
    form.password === form.confirm_password && form.password.length > 0;

  return (
    <View style={styles.slidePage}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Feather name="lock" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Account Security</Text>
            <Text style={styles.cardSubtitle}>Set up your password</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Password <Text style={styles.required}>*</Text>
          </Text>
          <View
            style={[
              styles.inputWrap,
              focused === "password" && styles.inputWrapFocused,
              errors.password ? styles.inputWrapError : null,
            ]}
          >
            <Feather
              name="lock"
              size={16}
              color={focused === "password" ? colors.primary : colors.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Min 6 characters"
              placeholderTextColor={colors.textMuted}
              value={form.password}
              onChangeText={setField("password")}
              secureTextEntry={!showPassword}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={16}
                color={colors.gray}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? <ErrorMsg msg={errors.password} /> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Confirm Password <Text style={styles.required}>*</Text>
          </Text>
          <View
            style={[
              styles.inputWrap,
              focused === "confirm" && styles.inputWrapFocused,
              errors.confirm_password ? styles.inputWrapError : null,
            ]}
          >
            <Feather
              name="lock"
              size={16}
              color={focused === "confirm" ? colors.primary : colors.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Repeat password"
              placeholderTextColor={colors.textMuted}
              value={form.confirm_password}
              onChangeText={setField("confirm_password")}
              secureTextEntry={!showConfirm}
              onFocus={() => setFocused("confirm")}
              onBlur={() => setFocused(null)}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
              style={styles.eyeBtn}
            >
              <Feather
                name={showConfirm ? "eye-off" : "eye"}
                size={16}
                color={colors.gray}
              />
            </TouchableOpacity>
          </View>
          {errors.confirm_password ? (
            <ErrorMsg msg={errors.confirm_password} />
          ) : null}
        </View>

        <View style={styles.hintBox}>
          <HintItem
            met={form.password.length >= 6}
            text="At least 6 characters"
          />
          <HintItem met={passwordsMatch} text="Passwords match" />
        </View>

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
            style={[
              styles.primaryBtn,
              { flex: 1 },
              loading && styles.btnDisabled,
            ]}
            onPress={onSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Create Account</Text>
                <Feather name="check" size={18} color={colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
