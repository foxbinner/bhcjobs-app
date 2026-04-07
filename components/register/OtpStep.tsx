import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { registerStyles as styles } from "./registerStyles";

interface Props {
  phone: string;
  otp: string;
  setOtp: (v: string) => void;
  focused: string | null;
  setFocused: (key: string | null) => void;
  receivedOtp: string | null;
  loading: boolean;
  insetTop: number;
  onBack: () => void;
  onVerify: () => void;
}

export function OtpStep({
  phone,
  otp,
  setOtp,
  focused,
  setFocused,
  receivedOtp,
  loading,
  insetTop,
  onBack,
  onVerify,
}: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[colors.heroBg, "#0F2347", "#1A3A6B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insetTop + 16 }]}
      >
        <View style={styles.decCircle} />
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Phone</Text>
        <Text style={styles.headerSub}>OTP sent to {phone}</Text>
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
              We sent a 6-digit code to {phone}. Enter it below to verify.
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
            onPress={onVerify}
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

          <TouchableOpacity style={styles.linkRow} onPress={onBack}>
            <Text style={styles.linkText}>Wrong number? Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
