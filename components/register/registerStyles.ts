import { Dimensions, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

const { width: SCREEN_W } = Dimensions.get("window");

export const REGISTER_SCREEN_WIDTH = SCREEN_W;

export const registerStyles = StyleSheet.create({
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
