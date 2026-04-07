import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const jobDetailStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.bg,
  },
  notFound: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: colors.gray,
  },
  backPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backPillText: { fontFamily: "Inter_600SemiBold", color: colors.white },

  // Gradient header
  header: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  decCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -60,
    right: -60,
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
  headerCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  headerLogo: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerLogoFallback: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerLogoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: colors.white,
  },
  headerMeta: { flex: 1 },
  headerCompanyName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.white,
  },
  headerIndustry: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    marginTop: 4,
  },
  hotBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.hot,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hotText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: colors.white,
    letterSpacing: 0.5,
  },
  headerJobTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "rgba(255,255,255,0.94)",
    lineHeight: 28,
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  headerPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.92)",
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  locationText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  body: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flex: 1,
    minWidth: "29%",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: "center",
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Compensation
  compBlock: {
    gap: 4,
  },
  compBlockLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  compBlockValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  compBlockValueMuted: {
    color: colors.gray,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  compBlockValueGreen: {
    color: colors.success,
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  compBlockValueBdt: {
    color: colors.textSecondary,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  compDivider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Benefits
  benefitsList: { gap: 10 },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },

  bodyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 26,
  },

  // Pills
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  langPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  langPillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.primary,
  },

  // Apply bar
  applyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  applyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  applyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.white,
  },

  // Sticky compact header
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: "hidden",
  },
  stickyGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  stickyBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  stickyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.white,
    flex: 1,
  },
});
