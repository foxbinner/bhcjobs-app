import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert } from "react-native";
import { register, verifyPhone } from "../services/api";
import { colors } from "../constants/colors";
import { bottomInsetPadding } from "../lib/insets";
import { registerStyles as styles, REGISTER_SCREEN_WIDTH } from "../components/register/registerStyles";
import { PersonalStep } from "../components/register/PersonalStep";
import { ContactStep } from "../components/register/ContactStep";
import { SecurityStep } from "../components/register/SecurityStep";
import { OtpStep } from "../components/register/OtpStep";
import type { FormState } from "../components/register/types";

const STEPS = [
  { label: "Personal", icon: "user" as const },
  { label: "Contact", icon: "phone" as const },
  { label: "Security", icon: "lock" as const },
];

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

  // --- Shared props for step components ---
  const stepBag = { form, errors, focused, setField, setFocused };

  // --- OTP Screen ---
  if (step === 3) {
    return (
      <OtpStep
        phone={form.phone}
        otp={otp}
        setOtp={setOtp}
        focused={focused}
        setFocused={setFocused}
        receivedOtp={receivedOtp}
        loading={loading}
        insetTop={insets.top}
        onBack={handleBack}
        onVerify={handleVerify}
      />
    );
  }

  // --- Multi-step form ---
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -REGISTER_SCREEN_WIDTH, -REGISTER_SCREEN_WIDTH * 2],
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInsetPadding(insets, 20) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.slideContainer}>
          <Animated.View
            style={[styles.slideTrack, { transform: [{ translateX }] }]}
          >
            <PersonalStep {...stepBag} onNext={handleNext} />
            <ContactStep {...stepBag} onBack={handleBack} onNext={handleNext} />
            <SecurityStep
              {...stepBag}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirm={showConfirm}
              setShowConfirm={setShowConfirm}
              loading={loading}
              onBack={handleBack}
              onSubmit={handleRegister}
            />
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
