import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getJobs } from "../services/api";
import JobCard from "../components/JobCard";
import { colors } from "../constants/colors";
import { bottomInsetPadding } from "../lib/insets";
import { PageBanner, StickyPageHeader } from "../components/PageBanner";

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
  view_count?: number;
  expiry?: string;
  is_hot?: number;
  category?: { id: number; name: string } | null;
  company?: { image?: string } | null;
}

export default function AllJobs() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;

  const compactOpacity = scrollY.interpolate({
    inputRange: [100, 140],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const fetchData = async () => {
    try {
      setError("");
      const res = await getJobs();
      setJobs(res.data.data ?? []);
    } catch {
      setError("Failed to load. Pull down to refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={[styles.loadingScreen, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const countBadge = (
    <View style={styles.countBadge}>
      <Feather name="briefcase" size={12} color={colors.white} />
      <Text style={styles.countText}>{jobs.length} Jobs</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Compact sticky header */}
      <StickyPageHeader
        opacity={compactOpacity}
        onBack={() => router.back()}
        title="Recommended Jobs"
      />

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInsetPadding(insets, 16) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero banner (scrolls with content) */}
        <PageBanner onBack={() => router.back()} topRight={countBadge}>
          <View style={styles.heroRow}>
            <View style={styles.iconWrap}>
              <Feather name="briefcase" size={26} color={colors.white} />
            </View>
            <View>
              <Text style={styles.pageTitle}>Recommended Jobs</Text>
              <Text style={styles.pageSub}>All available positions</Text>
            </View>
          </View>
        </PageBanner>

        {/* Job list */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recommended</Text>
          <View style={styles.listBadge}>
            <Text style={styles.listBadgeText}>{jobs.length}</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {jobs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="search" size={48} color={colors.borderDark} />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
          </View>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
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

  scroll: { flex: 1 },

  /* Hero content */
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    flexShrink: 0,
  },
  pageTitle: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 26,
    color: colors.white,
    letterSpacing: -0.5,
  },
  pageSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
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
