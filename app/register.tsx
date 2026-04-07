import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { register, verifyPhone } from "../services/api";
import { colors } from "../constants/colors";

const { width: SCREEN_W } = Dimensions.get("window");

interface FormState {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
  passport_number: string;
  dob: string;
  gender: string;
}

const initialForm: FormState = {
  name: "",
  phone: "",
  email: "",
  password: "",
  confirm_password: "",
  passport_number: "",
  dob: "",
  gender: "male",
};

const STEPS = [
  { label: "Personal", icon: "user" as const },
  { label: "Contact", icon: "phone" as const },
  { label: "Security", icon: "lock" as const },
];

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); // 0,1,2 = form steps; 3 = OTP
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const setField = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const animateToStep = (nextStep: number) => {
    Animated.spring(slideAnim, {
      toValue: nextStep,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setStep(nextStep);
    });
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  useEffect(() => {
    if (step === 3 && otp.length === 6 && !loading) {
      handleVerify();
    }
  }, [otp, step]);

  // --- Validation per step ---
  const validateStep0 = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.dob.trim()) e.dob = "Date of birth is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{11}$/.test(form.phone.trim()))
      e.phone = "Must be exactly 11 digits";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.passport_number.trim()) e.passport_number = "Passport number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirm_password)
      e.confirm_password = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && validateStep0()) animateToStep(1);
    else if (step === 1 && validateStep1()) animateToStep(2);
  };

  const handleBack = () => {
    if (step === 0) router.back();
    else if (step === 3) animateToStep(2);
    else animateToStep(step - 1);
  };

  const parseApiErrors = (errorObj: Record<string, string[]>): string =>
    Object.values(errorObj).flat().join("\n");

  const handleRegister = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const res = await register(form);
      if (res.data.status) {
        const apiOtp = res.data.data?.otp;
        setReceivedOtp(apiOtp ? String(apiOtp) : null);
        setStep(3);
      } else {
        const msg = res.data.error
          ? parseApiErrors(res.data.error)
          : (res.data.message ?? "Registration failed");
        Alert.alert("Error", msg);
      }
    } catch (e: unknown) {
      const errData = (e as any)?.response?.data;
      const msg = errData?.error
        ? parseApiErrors(errData.error)
        : (errData?.message ?? "Something went wrong");
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp.trim()) {
      Alert.alert("Enter OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyPhone(form.phone, otp);
      if (res.data.status) {
        Alert.alert("Account created!", "Please login to continue.", [
          { text: "Login", onPress: () => router.replace("/login") },
        ]);
      } else {
        Alert.alert("Error", res.data.message || "Invalid OTP");
      }
    } catch (e: unknown) {
      Alert.alert(
        "Error",
        (e as any)?.response?.data?.message ?? "OTP verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  // --- OTP Screen ---
  if (step === 3) {
    return (
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <LinearGradient
          colors={[colors.heroBg, "#0F2347", "#1A3A6B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.decCircle} />
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Phone</Text>
          <Text style={styles.headerSub}>OTP sent to {form.phone}</Text>
        </LinearGradient>

        <View style={styles.otpContainer}>
          <View style={styles.otpCard}>
            <View style={styles.otpIconWrap}>
              <LinearGradient
                colors={[colors.primary, "#3B82F6"]}
                style={styles.otpIconGradient}
              >
                <Feather name="shield" size={28} color={colors.white} />
              </LinearGradient>
            </View>
            <Text style={styles.otpHeading}>Enter verification code</Text>
            {receivedOtp ? (
              <View style={styles.otpRevealBox}>
                <Text style={styles.otpRevealLabel}>Your OTP code</Text>
                <Text style={styles.otpRevealCode}>{receivedOtp}</Text>
              </View>
            ) : (
              <Text style={styles.otpDesc}>
                We sent a 6-digit code to {form.phone}. Enter it below to
                verify.
              </Text>
            )}

            <View
              style={[
                styles.inputWrap,
                focused === "otp" && styles.inputWrapFocused,
                { marginTop: 24 },
              ]}
            >
              <Feather
                name="key"
                size={16}
                color={focused === "otp" ? colors.primary : colors.gray}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    letterSpacing: 8,
                    fontSize: 20,
                    fontFamily: "Inter_700Bold",
                    textAlign: "center",
                  },
                ]}
                placeholder="000000"
                placeholderTextColor={colors.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
                onFocus={() => setFocused("otp")}
                onBlur={() => setFocused(null)}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                loading && styles.btnDisabled,
                { marginTop: 24, alignSelf: "stretch" },
              ]}
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Feather name="shield" size={16} color={colors.white} />
                  <Text style={styles.primaryBtnText}>Verify</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkRow} onPress={handleBack}>
              <Text style={styles.linkText}>Wrong number? Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // --- Multi-step form ---
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -SCREEN_W, -SCREEN_W * 2],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.heroBg, "#0F2347", "#1A3A6B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.decCircle} />
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSub}>{STEPS[step].label} information</Text>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepItemRow}>
              <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                {i < step ? (
                  <Feather name="check" size={12} color={colors.white} />
                ) : (
                  <Feather
                    name={s.icon}
                    size={12}
                    color={i <= step ? colors.white : "rgba(255,255,255,0.4)"}
                  />
                )}
              </View>
              <Text
                style={[styles.stepLabel, i <= step && styles.stepLabelActive]}
              >
                {s.label}
              </Text>
              {i < STEPS.length - 1 ? (
                <View
                  style={[styles.stepLine, i < step && styles.stepLineActive]}
                />
              ) : null}
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Sliding pages */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.slideContainer}>
          <Animated.View
            style={[styles.slideTrack, { transform: [{ translateX }] }]}
          >
            {/* Step 0: Personal */}
            <View style={styles.slidePage}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconWrap}>
                    <Feather name="user" size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Personal Details</Text>
                    <Text style={styles.cardSubtitle}>
                      Tell us about yourself
                    </Text>
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
                  onPress={handleNext}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Continue</Text>
                  <Feather name="arrow-right" size={18} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Step 1: Contact & Docs */}
            <View style={styles.slidePage}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconWrap}>
                    <Feather name="phone" size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Contact & Documents</Text>
                    <Text style={styles.cardSubtitle}>
                      How can we reach you?
                    </Text>
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
                    onPress={handleBack}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="arrow-left"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.outlineBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { flex: 1 }]}
                    onPress={handleNext}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryBtnText}>Continue</Text>
                    <Feather
                      name="arrow-right"
                      size={18}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Step 2: Security */}
            <View style={styles.slidePage}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconWrap}>
                    <Feather name="lock" size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Account Security</Text>
                    <Text style={styles.cardSubtitle}>
                      Set up your password
                    </Text>
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
                      color={
                        focused === "password" ? colors.primary : colors.gray
                      }
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
                      color={
                        focused === "confirm" ? colors.primary : colors.gray
                      }
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
                      onPress={() => setShowConfirm((v) => !v)}
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

                {/* Password strength hints */}
                <View style={styles.hintBox}>
                  <HintItem
                    met={form.password.length >= 6}
                    text="At least 6 characters"
                  />
                  <HintItem
                    met={
                      form.password === form.confirm_password &&
                      form.password.length > 0
                    }
                    text="Passwords match"
                  />
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={handleBack}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="arrow-left"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.outlineBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      { flex: 1 },
                      loading && styles.btnDisabled,
                    ]}
                    onPress={handleRegister}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>
                          Create Account
                        </Text>
                        <Feather name="check" size={18} color={colors.white} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.terms}>
          By continuing, you agree to our{" "}
          <Text
            style={styles.termsLink}
            onPress={() => Linking.openURL("https://bhcjobs.com/terms-conditions")}
          >
            Terms of Service
          </Text>
        </Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- Sub-components ---

function InputField({
  label,
  required,
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  focused,
  onFocus,
  onBlur,
  keyboardType,
  maxLength,
  autoCapitalize,
}: {
  label: string;
  required?: boolean;
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  keyboardType?: any;
  maxLength?: number;
  autoCapitalize?: any;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputWrapFocused,
          error ? styles.inputWrapError : null,
        ]}
      >
        <Feather
          name={icon as any}
          size={16}
          color={focused ? colors.primary : colors.gray}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
        />
      </View>
      {error ? <ErrorMsg msg={error} /> : null}
    </View>
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

function HintItem({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.hintRow}>
      <Feather
        name={met ? "check-circle" : "circle"}
        size={14}
        color={met ? colors.success : colors.textMuted}
      />
      <Text style={[styles.hintText, met && styles.hintTextMet]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    paddingBottom: 24,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  decCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -60,
    right: -40,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 28,
    color: colors.white,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },

  // Step indicator
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  stepItemRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    marginLeft: 6,
  },
  stepLabelActive: {
    color: colors.white,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 8,
    borderRadius: 1,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20, paddingBottom: 20 },

  // Slide system
  slideContainer: {
    overflow: "hidden",
    width: SCREEN_W,
  },
  slideTrack: {
    flexDirection: "row",
    width: SCREEN_W * 3,
  },
  slidePage: {
    width: SCREEN_W,
    paddingHorizontal: 20,
  },

  // Card
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
    gap: 18,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.gray,
    marginTop: 1,
  },

  // Fields
  fieldGroup: { gap: 8 },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.textPrimary,
  },
  required: { color: colors.error },
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
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputWrapError: { borderColor: colors.error },
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

  // Gender
  genderRow: { flexDirection: "row", gap: 10 },
  genderBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.grayLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  genderBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  genderText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.gray,
  },
  genderTextActive: { color: colors.white },

  // Hint box
  hintBox: {
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  hintRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  hintText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textMuted,
  },
  hintTextMet: { color: colors.success },

  // Buttons
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.white,
  },
  btnDisabled: { opacity: 0.7 },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderRadius: 12,
    height: 54,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.primaryLight,
  },
  outlineBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.primary,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.gray,
  },
  footerLink: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: colors.primary,
  },
  terms: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
  termsLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: colors.primary,
    textDecorationLine: "underline",
  },

  // OTP
  otpContainer: { flex: 1, padding: 20, justifyContent: "center" },
  otpCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  otpIconWrap: {
    marginBottom: 16,
  },
  otpIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  otpHeading: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: "center",
  },
  otpDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
  },
  otpRevealBox: {
    marginTop: 12,
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
    gap: 4,
  },
  otpRevealLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  otpRevealCode: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 32,
    color: colors.primary,
    letterSpacing: 8,
  },
  linkRow: { marginTop: 20 },
  linkText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: colors.primary,
    textAlign: "center",
  },
});
