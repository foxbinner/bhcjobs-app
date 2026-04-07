import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getJobs, getIndustries, getCompanies } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import JobCard from "../components/JobCard";
import CompanyCard from "../components/CompanyCard";
import IndustryCard from "../components/IndustryCard";
import { colors } from "../constants/colors";

const PAGE_SIZE = 4;

interface Industry {
  id: number;
  name: string;
  jobs_count?: number;
}

interface Company {
  id: number;
  name: string;
  image?: string;
  jobs_count?: number;
}

interface Job {
  id: number;
  job_title?: string;
  company_id?: number;
  industry_id?: number;
  company_name?: string;
  industry_name?: string;
  country?: { name?: string };
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
  category?: { id: number; name: string } | null;
  company?: { image?: string } | null;
}

export default function Landing() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoggedIn } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const topBarActiveRef = useRef(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [topBarInteractive, setTopBarInteractive] = useState(false);

  const topBarOpacity = scrollY.interpolate({
    inputRange: [100, 180],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const fetchAll = async () => {
    try {
      setError("");
      const [j, i, c] = await Promise.all([
        getJobs(),
        getIndustries(),
        getCompanies(),
      ]);
      setJobs(j.data.data ?? []);
      setIndustries(i.data.data ?? []);
      setCompanies(c.data.data ?? []);
    } catch {
      setError("Failed to load. Pull down to refresh.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const displayedJobs = jobs.slice(0, PAGE_SIZE);
  const activeIndustries = industries.filter((i) => (i.jobs_count ?? 0) > 0);
  const totalSeats = jobs.reduce((sum, job) => sum + (job.vacancy ?? 0), 0);

  const industryCompanyImgs = jobs.reduce<Map<number, string[]>>((map, job) => {
    if (job.industry_id && job.company?.image) {
      const imgs = map.get(job.industry_id) ?? [];
      if (!imgs.includes(job.company.image)) {
        map.set(job.industry_id, [...imgs, job.company.image]);
      }
    }
    return map;
  }, new Map());

  return (
    <View style={styles.container}>
      {/* Sticky top bar */}
      <Animated.View
        pointerEvents={topBarInteractive ? "auto" : "none"}
        style={[
          styles.topBar,
          { opacity: topBarOpacity, paddingTop: insets.top + 8 },
        ]}
      >
        <LinearGradient
          colors={[colors.heroBg, "#0F2347"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Image
          source={require("../assets/website-icon-nightmode.png")}
          style={styles.topBarLogo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.topBarBtn}
          onPress={() => router.push("/register")}
          activeOpacity={0.85}
        >
          <Text style={styles.topBarBtnText}>Join</Text>
          <Feather name="arrow-right" size={13} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const y = event.nativeEvent.contentOffset.y;
              const next = y >= 110;
              if (next !== topBarActiveRef.current) {
                topBarActiveRef.current = next;
                setTopBarInteractive(next);
              }
            },
          },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ──────────────────────────────────────────────── */}
        <LinearGradient
          colors={[colors.heroBg, colors.heroMid, "#1A3A6B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />
          <View style={styles.decCircle3} />

          {/* Top row */}
          <View style={styles.heroTopRow}>
            <Image
              source={require("../assets/website-icon-nightmode.png")}
              style={styles.heroLogo}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.heroSearchBtn}
              onPress={() => router.push(isLoggedIn ? "/profile" : "/login")}
              activeOpacity={0.8}
            >
              {isLoggedIn && user ? (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              ) : (
                <Feather name="globe" size={15} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.heroHeadline}>
            #1 Platform{"\n"}for Saudi Jobs.
          </Text>
          <Text style={styles.heroSub}>
            Connect Bangladeshi workforces with verified employers for
            high-demand jobs.
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatPill value={jobs.length} label="Jobs" />
            <StatPill value={companies.length} label="Companies" />
            <StatPill value={totalSeats} label="Vacancies" accent />
          </View>

          {/* CTA buttons */}
          <View style={styles.heroActions}>
            {isLoggedIn ? (
              <TouchableOpacity
                style={[styles.heroBtnPrimary, { flex: 1 }]}
                onPress={() => router.push("/profile")}
                activeOpacity={0.85}
              >
                <Feather name="user" size={16} color={colors.primary} />
                <Text style={styles.heroBtnPrimaryText}>Visit Profile</Text>
                <Feather name="arrow-right" size={15} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.heroBtnPrimary}
                  onPress={() => router.push("/login")}
                  activeOpacity={0.85}
                >
                  <Feather name="log-in" size={16} color={colors.primary} />
                  <Text style={styles.heroBtnPrimaryText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.heroBtnOutline}
                  onPress={() => router.push("/register")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.heroBtnOutlineText}>Create Account</Text>
                  <Feather name="arrow-right" size={16} color={colors.white} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </LinearGradient>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Industries ─────────────────────────────────────────── */}
        <SectionHeader
          title="Popular Industries"
          subtitle={`${activeIndustries.length} sectors`}
          actionLabel="See all"
          onActionPress={() => router.push("/industries")}
        />
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScrollContent}
        >
          {activeIndustries.map((item) => (
            <IndustryCard
              key={item.id}
              industry={item}
              active={false}
              onPress={() => router.push(`/industry/${item.id}`)}
              companyImages={industryCompanyImgs.get(item.id) ?? []}
            />
          ))}
        </ScrollView>

        {/* ── Jobs ───────────────────────────────────────────────── */}
        <View style={styles.jobsHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recommended Jobs</Text>
            <Text style={styles.sectionSubtitle}>{jobs.length} Vacancies</Text>
          </View>
          {jobs.length > PAGE_SIZE ? (
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push("/jobs")}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Feather name="chevron-right" size={13} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {jobs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="search" size={36} color={colors.borderDark} />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
          </View>
        ) : (
          <>
            {displayedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {jobs.length > PAGE_SIZE ? (
              <TouchableOpacity
                style={styles.seeAllBottomBtn}
                onPress={() => router.push("/jobs")}
                activeOpacity={0.8}
              >
                <Text style={styles.seeAllBottomText}>See all</Text>
                <Feather name="arrow-right" size={15} color={colors.primary} />
              </TouchableOpacity>
            ) : null}
          </>
        )}

        {/* ── Companies ──────────────────────────────────────────── */}
        <SectionHeader
          title="Top Companies"
          subtitle={`${companies.length} hiring`}
          actionLabel="See all"
          onActionPress={() => router.push("/companies")}
        />
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScrollContent}
        >
          {companies.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              active={false}
              onPress={() => router.push(`/company/${c.id}`)}
            />
          ))}
        </ScrollView>

        <View style={{ height: 16 }} />

        <View style={{ height: 48 }} />
      </Animated.ScrollView>
    </View>
  );
}

function StatPill({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.statPill, accent && styles.statPillAccent]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>
        {value}+
      </Text>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      {actionLabel && onActionPress ? (
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={onActionPress}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>{actionLabel}</Text>
          <Feather name="chevron-right" size={13} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },

  // Sticky top bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    overflow: "hidden",
  },
  topBarLogo: {
    width: 110,
    height: 28,
  },
  topBarBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  topBarBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: colors.white,
  },

  // Hero
  hero: {
    paddingBottom: 30,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  decCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: -80,
    right: -100,
  },
  decCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(37,99,235,0.2)",
    bottom: -50,
    left: -50,
  },
  decCircle3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.03)",
    top: 120,
    right: 40,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heroLogo: {
    width: 126,
    height: 32,
  },
  heroHeadline: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 34,
    color: "rgba(255,255,255,0.98)",
    lineHeight: 42,
    letterSpacing: 0.2,
    marginTop: 16,
    marginBottom: 12,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 23,
    color: "rgba(255,255,255,0.74)",
    marginBottom: 22,
  },
  heroSearchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: colors.white,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  statPill: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statPillAccent: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderColor: "rgba(239,68,68,0.2)",
  },
  statValue: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 20,
    color: colors.white,
  },
  statValueAccent: { color: "#FCA5A5" },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
  statLabelAccent: { color: "rgba(252,165,165,0.7)" },

  heroActions: { flexDirection: "row", gap: 10 },
  heroBtnPrimary: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  heroBtnPrimaryText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: colors.primary,
  },
  heroBtnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  heroBtnOutlineText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: colors.white,
  },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.gray,
  },
  hScrollContent: {
    paddingLeft: 4,
    paddingRight: 16,
    paddingBottom: 4,
  },

  // Jobs section
  jobsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 28,
    marginBottom: 14,
  },

  // Empty
  emptyBox: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.gray,
  },

  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.primary,
  },
  seeAllBottomBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryLight,
  },
  seeAllBottomText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
});
