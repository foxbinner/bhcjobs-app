import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { getJobs, getCompanies } from "../../services/api";
import JobCard from "../../components/JobCard";
import { colors } from "../../constants/colors";
import { IMAGE_BASE } from "../../constants/app";
import { bottomInsetPadding } from "../../lib/insets";

interface Company {
  id: number;
  name: string;
  image?: string;
  jobs_count?: number;
  industry_name?: string;
}

interface Job {
  id: number;
  job_title?: string;
  company_name?: string;
  industry_name?: string;
  industry_id?: number;
  company_id?: number;
  country?: { name?: string };
  currency?: string;
  min_salary?: number;
  max_salary?: number;
  salary_type?: string;
  food_option?: string | null;
  food_amount?: number | null;
  view_count?: number;
  expiry?: string;
  is_hot?: number;
  category?: { id: number; name: string } | null;
  company?: { image?: string } | null;
}

export default function CompanyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;

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

  const fetchData = async () => {
    try {
      setError("");
      const [jobsRes, companiesRes] = await Promise.all([
        getJobs(),
        getCompanies(),
      ]);
      const allJobs: Job[] = jobsRes.data.data ?? [];
      const allCompanies: Company[] = companiesRes.data.data ?? [];

      const found = allCompanies.find((c) => String(c.id) === String(id));
      setCompany(found ?? null);
      setJobs(allJobs.filter((j) => String(j.company_id) === String(id)));
    } catch {
      setError("Failed to load. Pull down to refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const logoUri = company?.image ? IMAGE_BASE + company.image : null;
  const initials = (company?.name ?? "?").charAt(0).toUpperCase();

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Compact sticky header — fades in on scroll */}
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
            {company?.name ?? "Company"}
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInsetPadding(insets, 16) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero header (scrolls with content) */}
        <LinearGradient
          colors={[colors.heroBg, "#0F2347", "#1A3A6B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.decCircle} />
          <View style={styles.decCircle2} />

          <Animated.View style={{ opacity: heroOpacity }}>
            {/* Top row: back btn (left) + job count (right) */}
            <View style={styles.topRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
              >
                <Feather name="arrow-left" size={20} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.countBadge}>
                <Feather name="briefcase" size={12} color={colors.white} />
                <Text style={styles.countText}>
                  {jobs.length} {jobs.length === 1 ? "job" : "jobs"} available
                </Text>
              </View>
            </View>

            {/* Hero row: logo (left) + name + industry (right) */}
            <View style={styles.heroRow}>
              <View style={styles.logoWrap}>
                {logoUri ? (
                  <Image
                    source={{ uri: logoUri }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.logoFallback}>
                    <Text style={styles.logoInitials}>{initials}</Text>
                  </View>
                )}
              </View>

              <View style={styles.heroMeta}>
                <Text style={styles.companyName} numberOfLines={2}>
                  {company?.name ?? "Company"}
                </Text>
                {company?.industry_name ? (
                  <View style={styles.industryRow}>
                    <Feather
                      name="grid"
                      size={11}
                      color="rgba(255,255,255,0.55)"
                    />
                    <Text style={styles.industryText}>
                      {company.industry_name}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Jobs list */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Open Positions</Text>
          <View style={styles.listBadge}>
            <Text style={styles.listBadgeText}>{jobs.length}</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="inbox" size={48} color={colors.borderDark} />
            <Text style={styles.emptyTitle}>No open positions</Text>
            <Text style={styles.emptySubtitle}>
              This company has no active listings
            </Text>
          </View>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}

        <View style={{ height: 32 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },

  /* Compact sticky header */
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
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
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: colors.white,
    flex: 1,
  },

  /* Scrollable hero header */
  header: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  decCircle: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -70,
    right: -70,
  },
  decCircle2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(37,99,235,0.2)",
    bottom: -40,
    left: -30,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.white,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  logoWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    flexShrink: 0,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoFallback: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoInitials: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 26,
    color: colors.white,
  },
  heroMeta: { flex: 1 },
  companyName: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 22,
    color: colors.white,
    lineHeight: 30,
    marginBottom: 4,
  },
  industryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  industryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0, paddingBottom: 20 },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  listTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: colors.textPrimary,
  },
  listBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  listBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: colors.primary,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
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
  emptyBox: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.gray,
  },
});
