import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { getJobs } from "../services/api";
import { colors } from "../constants/colors";
import JobCard from "../components/JobCard";
import { PageBanner, StickyPageHeader } from "../components/PageBanner";

export default function SavedJobsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;
  const compactOpacity = scrollY.interpolate({
    inputRange: [100, 140],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    if (!user?.shortlisted_jobs?.length) {
      setSavedJobs([]);
      setLoading(false);
      return;
    }

    const sorted = [...user.shortlisted_jobs].sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime(),
    );
    const orderedIds = sorted.map((s) => s.job_id);

    getJobs()
      .then((res) => {
        const all: any[] = res.data.data ?? [];
        const map = new Map(all.map((j) => [j.id, j]));
        setSavedJobs(orderedIds.map((id) => map.get(id)).filter(Boolean));
      })
      .catch(() => setSavedJobs([]))
      .finally(() => setLoading(false));
  }, [user?.shortlisted_jobs]);

  return (
    <View style={styles.root}>
      <StickyPageHeader
        opacity={compactOpacity}
        onBack={() => router.back()}
        title="Saved Jobs"
      />

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <PageBanner
          onBack={() => router.back()}
          topRight={
            <View style={styles.countBadge}>
              <Feather name="heart" size={12} color={colors.white} />
              <Text style={styles.countText}>{savedJobs.length} Jobs</Text>
            </View>
          }
        >
          <View style={styles.heroRow}>
            <View style={styles.iconWrap}>
              <Feather name="heart" size={26} color={colors.white} />
            </View>
            <View>
              <Text style={styles.pageTitle}>Saved Jobs</Text>
              <Text style={styles.pageSub}>
                {savedJobs.length > 0
                  ? `${savedJobs.length} jobs bookmarked`
                  : "Your shortlisted jobs"}
              </Text>
            </View>
          </View>
        </PageBanner>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : savedJobs.length === 0 ? (
          <View style={styles.center}>
            <Feather name="heart" size={48} color={colors.borderDark} />
            <Text style={styles.emptyTitle}>No saved jobs</Text>
            <Text style={styles.emptySub}>Jobs you heart will appear here</Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push("/jobs")}
              activeOpacity={0.85}
            >
              <Text style={styles.browseBtnText}>Browse Jobs</Text>
              <Feather name="arrow-right" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {savedJobs.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  listWrap: {
    marginTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  emptySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryLight,
  },
  browseBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.primary,
  },
});
