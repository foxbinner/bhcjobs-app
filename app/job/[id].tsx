import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
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
import { bottomInsetPadding } from "../../lib/insets";
import { jobDetailStyles as styles } from "../../components/job-detail/jobDetailStyles";
import { StatBox } from "../../components/job-detail/StatBox";
import { CompValue } from "../../components/job-detail/CompValue";

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
        // leave job as null
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
          { paddingBottom: bottomInsetPadding(insets, 90, 12) },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* Gradient header -- scrolls away */}
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
          { paddingBottom: bottomInsetPadding(insets, 8, 12) },
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
