import { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { forgotPassword, login } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../constants/colors";
import { bottomInsetPadding } from "../lib/insets";

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ phone: "", password: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  const validate = () => {
    const e = { phone: "", password: "" };
    let valid = true;
    if (!phone.trim()) {
      e.phone = "Phone number is required";
      valid = false;
    }
    if (!password) {
      e.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      e.password = "Minimum 6 characters";
      valid = false;
    }
    setErrors(e);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login(phone.trim(), password);
      if (res.data.status) {
        const token = res.data?.token ?? res.data?.data?.token;
        if (token) {
          await signIn(token);
          router.dismissAll();
          router.navigate("/profile");
        }
      } else {
        Alert.alert("Login failed", res.data.message || "Invalid credentials");
      }
    } catch (e: unknown) {
      const msg = (e as any)?.response?.data?.message ?? "Something went wrong";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!phone.trim()) {
      Alert.alert("Phone required", "Enter your phone number first.");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(phone.trim());
      Alert.alert(
        "Reset requested",
        "If your account exists, a reset code will be sent.",
      );
    } catch (e: unknown) {
      const msg =
        (e as any)?.response?.data?.message ?? "Unable to process request";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Gradient header */}
      <LinearGradient
        colors={[colors.heroBg, "#0F2347", "#1A3A6B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.white} />
        </TouchableOpacity>

        {/* Brand mark */}
        <View style={styles.brandRow}>
          <Image
            source={require("../assets/website-icon-nightmode.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.headerTitle}>Welcome back</Text>
        <Text style={styles.headerSub}>
          Sign in to continue your job search
        </Text>
      </LinearGradient>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInsetPadding(insets, 20) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View
                style={[
                  styles.inputWrap,
                  focused === "phone" && styles.inputFocused,
                  errors.phone ? styles.inputError : null,
                ]}
              >
                <Feather
                  name="phone"
                  size={16}
                  color={focused === "phone" ? colors.primary : colors.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="01XXXXXXXXX"
                  placeholderTextColor={colors.textMuted}
                  value={phone}
                  onChangeText={(v) => {
                    setPhone(v);
                    setErrors((p) => ({ ...p, phone: "" }));
                  }}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  onFocus={() => setFocused("phone")}
                  onBlur={() => setFocused(null)}
                />
              </View>
              {errors.phone ? <ErrorMsg msg={errors.phone} /> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputWrap,
                  focused === "password" && styles.inputFocused,
                  errors.password ? styles.inputError : null,
                ]}
              >
                <Feather
                  name="lock"
                  size={16}
                  color={focused === "password" ? colors.primary : colors.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Your password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
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

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              <View style={styles.loginGradient}>
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Sign In</Text>
                    <Feather
                      name="arrow-right"
                      size={18}
                      color={colors.white}
                    />
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Don't have an account?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register */}
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => router.push("/register")}
              activeOpacity={0.8}
            >
              <Feather name="user-plus" size={16} color={colors.primary} />
              <Text style={styles.registerText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <View style={styles.errorRow}>
      <Feather name="alert-circle" size={12} color={colors.error} />
      <Text style={styles.errorText}>{msg}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  decCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -70,
    right: -50,
  },
  decCircle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(37,99,235,0.2)",
    bottom: -30,
    left: -20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  brandRow: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  brandLogo: {
    width: 132,
    height: 34,
  },
  headerTitle: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 30,
    color: colors.white,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
    marginBottom: 20,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    gap: 20,
  },

  fieldGroup: { gap: 8 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.textPrimary,
  },
  forgotText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: colors.primary,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.grayLight,
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputError: { borderColor: colors.error },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeBtn: { padding: 4 },

  errorRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.error,
  },

  loginBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginGradient: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 14,
  },
  loginBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.white,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },

  registerBtn: {
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderRadius: 12,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
  },
  registerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.primary,
  },

});

