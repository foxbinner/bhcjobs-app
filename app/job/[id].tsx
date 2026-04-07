import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { getJob, getJobs } from "../../services/api";
import { colors } from "../../constants/colors";
import { BDT_RATE, IMAGE_BASE } from "../../constants/app";

interface Job {
  id: number;
  job_title?: string;
  company_name?: string;
  industry_name?: string;
  company_id?: number;
  industry_id?: number;
  country?: { name?: string };
  city?: { name?: string } | null;
  currency?: string;
  min_salary?: number;
  max_salary?: number;
  salary_type?: string;
  food_option?: string | null;
  food_amount?: number | null;
  employment_type?: string;
  vacancy?: number;
  experience?: string;
  is_hot?: number;
  view_count?: number;
  working_days?: number;
  working_hours?: number;
  expiry?: string;
  job_desc?: string;
  job_requirement?: string;
  category?: { id: number; name: string } | null;
  company?: { image?: string; name?: string } | null;
  benefits?: { id: number; name: string }[];
  languages?: { id: number; name: string }[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatSalaryLine(job: Job): string {
  const cur = job.currency ?? "SAR";
  if (job.min_salary && job.max_salary) {
    const bdt1 = (job.min_salary * BDT_RATE).toLocaleString();
    const bdt2 = (job.max_salary * BDT_RATE).toLocaleString();
    return `${cur} ${job.min_salary.toLocaleString()}–${job.max_salary.toLocaleString()}/Month (BDT ${bdt1}–${bdt2})`;
  }
  if (job.min_salary) {
    const bdt = (job.min_salary * BDT_RATE).toLocaleString();
    return `${cur} ${job.min_salary.toLocaleString()}/Month (BDT ${bdt})`;
  }
  return "Not specified";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const compactOpacity = scrollY.interpolate({
    inputRange: [100, 140],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    let mounted = true;

    const fetchJob = async () => {
      try {
        const direct = await getJob(String(id));
        const directData = direct.data?.data;
        if (mounted && directData) {
          setJob(
            Array.isArray(directData) ? (directData[0] ?? null) : directData,
          );
          return;
        }
      } catch {
        // Fallback below
      }

      try {
        const res = await getJobs();
        const found = (res.data.data as Job[]).find(
          (j) => String(j.id) === String(id),
        );
        if (mounted) setJob(found ?? null);
      } catch {
        // leave job as null — "not found" state handles it
      }
    };

    fetchJob().finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Feather name="alert-circle" size={40} color={colors.borderDark} />
        <Text style={styles.notFound}>Job not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backPill}>
          <Text style={styles.backPillText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const companyImg = job.company?.image
    ? { uri: IMAGE_BASE + job.company.image }
    : null;
  const salaryLine = formatSalaryLine(job);
  const location =
    [job.country?.name, job.city?.name].filter(Boolean).join(", ") || "—";
  const foodAllowanceText =
    job.food_option === "allowance" && job.food_amount
      ? `${job.currency ?? "SAR"} ${job.food_amount.toLocaleString()}/Month (BDT ${(job.food_amount * BDT_RATE).toLocaleString()})`
      : job.food_option === "provided"
        ? "Provided"
        : "Not specified";

  return (
    <View style={styles.root}>
      {/* Compact sticky header */}
      <Animated.View style={[styles.stickyHeader, { opacity: compactOpacity }]}>
        <LinearGradient
          colors={[colors.heroBg, "#0F2347"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.stickyGradient, { paddingTop: insets.top + 8 }]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.stickyBackBtn}
          >
            <Feather name="arrow-left" size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.stickyTitle} numberOfLines={1}>
            {job.job_title ?? "Job Detail"}
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 90 + Math.max(insets.bottom, 12) },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* Gradient header — scrolls away */}
        <LinearGradient
          colors={[colors.heroBg, "#0F2347"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.decCircle} />
          <Animated.View style={{ opacity: heroOpacity }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={20} color={colors.white} />
            </TouchableOpacity>

            {/* Company row */}
            <View style={styles.headerCompanyRow}>
              {companyImg ? (
                <Image
                  source={companyImg}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.headerLogoFallback}>
                  <Text style={styles.headerLogoText}>
                    {(job.company_name ?? "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.headerMeta}>
                <Text style={styles.headerCompanyName} numberOfLines={1}>
                  {job.company_name}
                </Text>
                <Text style={styles.headerIndustry} numberOfLines={1}>
                  {job.industry_name}
                </Text>
              </View>
              {job.is_hot ? (
                <View style={styles.hotBadge}>
                  <Feather name="zap" size={11} color={colors.white} />
                  <Text style={styles.hotText}>HOT</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.headerJobTitle}>{job.job_title}</Text>

            <View style={styles.headerPills}>
              {job.category?.name ? (
                <View style={styles.categoryPill}>
                  <MaterialCommunityIcons
                    name="tag-outline"
                    size={12}
                    color={colors.white}
                  />
                  <Text style={styles.categoryText}>{job.category.name}</Text>
                </View>
              ) : null}
              <View style={styles.locationPill}>
                <Feather
                  name="map-pin"
                  size={12}
                  color="rgba(255,255,255,0.7)"
                />
                <Text style={styles.locationText}>{location}</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Body */}
        <View style={styles.body}>
          {/* Quick stats grid */}
          <View style={styles.statsGrid}>
            <StatBox
              icon="users"
              label="Vacancies"
              value={job.vacancy ? String(job.vacancy) : "—"}
            />
            <StatBox
              icon="briefcase"
              label="Type"
              value={
                job.employment_type
                  ?.replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—"
              }
            />
            <StatBox
              icon="calendar"
              label="Deadline"
              value={formatDate(job.expiry)}
            />
            <StatBox
              icon="eye"
              label="Views"
              value={job.view_count?.toLocaleString() ?? "—"}
            />
            {job.working_hours ? (
              <StatBox
                icon="clock"
                label="Hrs/Day"
                value={`${job.working_hours}h`}
              />
            ) : null}
            {job.working_days ? (
              <StatBox
                icon="sun"
                label="Days/Wk"
                value={`${job.working_days}d`}
              />
            ) : null}
          </View>

          {/* Compensation */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.cardIconWrap}>
                <MaterialCommunityIcons
                  name="cash"
                  size={16}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.cardTitle}>Compensation</Text>
            </View>

            <View style={styles.compBlock}>
              <Text style={styles.compBlockLabel}>Monthly Salary</Text>
              <CompValue text={salaryLine} />
            </View>

            <View style={styles.compDivider} />

            <View style={styles.compBlock}>
              <Text style={styles.compBlockLabel}>Food Allowance</Text>
              <CompValue text={foodAllowanceText} />
            </View>
          </View>

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 ? (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.cardIconWrap}>
                  <Feather name="gift" size={16} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Benefits</Text>
              </View>
              <View style={styles.benefitsList}>
                {job.benefits.map((b) => (
                  <View key={b.id} style={styles.benefitItem}>
                    <View style={styles.checkCircle}>
                      <Feather name="check" size={10} color={colors.white} />
                    </View>
                    <Text style={styles.benefitText}>{b.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* About the role */}
          {job.job_desc ? (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.cardIconWrap}>
                  <Feather name="file-text" size={16} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>About the Role</Text>
              </View>
              <Text style={styles.bodyText}>{stripHtml(job.job_desc)}</Text>
            </View>
          ) : null}

          {/* Requirements */}
          {job.job_requirement ? (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.cardIconWrap}>
                  <Feather
                    name="check-square"
                    size={16}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.cardTitle}>Requirements</Text>
              </View>
              <Text style={styles.bodyText}>
                {stripHtml(job.job_requirement)}
              </Text>
            </View>
          ) : null}

          {/* Languages */}
          {job.languages && job.languages.length > 0 ? (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.cardIconWrap}>
                  <Feather name="globe" size={16} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Languages Required</Text>
              </View>
              <View style={styles.pillsRow}>
                {job.languages.map((l) => (
                  <View key={l.id} style={styles.langPill}>
                    <Text style={styles.langPillText}>{l.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Pinned apply bar */}
      <View
        style={[
          styles.applyBar,
          { paddingBottom: Math.max(insets.bottom, 12) + 8 },
        ]}
      >
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => Linking.openURL(`https://bhcjobs.com/job/${id}`)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.primary, "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.applyGradient}
          >
            <Text style={styles.applyText}>Apply Now</Text>
            <Feather name="arrow-right" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CompValue({ text }: { text: string }) {
  const bdtIndex = text.indexOf(" (BDT");
  if (bdtIndex === -1) {
    return (
      <Text
        style={[
          styles.compBlockValue,
          text === "Not specified" && styles.compBlockValueMuted,
          text === "Provided" && styles.compBlockValueGreen,
        ]}
      >
        {text}
      </Text>
    );
  }
  const sarPart = text.slice(0, bdtIndex);
  const bdtPart = text.slice(bdtIndex);
  return (
    <Text style={styles.compBlockValue}>
      <Text style={styles.compBlockValueGreen}>{sarPart}</Text>
      <Text style={styles.compBlockValueBdt}>{bdtPart}</Text>
    </Text>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statBox}>
      <Feather name={icon as any} size={16} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
