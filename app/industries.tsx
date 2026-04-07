import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { getIndustries, getJobs } from "../services/api";
import { colors } from "../constants/colors";
import { IMAGE_BASE } from "../constants/app";
import { PageBanner, StickyPageHeader } from "../components/PageBanner";

const ICON_MAP: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Construction: "crane",
  "Fast Food Restaurant": "food",
  "Facilities Management": "office-building-outline",
  "Factory & Manufacturing": "factory",
  Catering: "silverware-fork-knife",
  Agriculture: "sprout-outline",
  Hotel: "bed-outline",
  "Contracting & Maintenance": "wrench-outline",
  "Cafés & Coffee Shops": "coffee-outline",
  "Cafes & Coffee Shops": "coffee-outline",
  Others: "briefcase-outline",
};

interface Industry {
  id: number;
  name: string;
  jobs_count?: number;
}

interface IndustryJobData {
  vacancies: number;
  companyImages: string[];
}

export default function IndustriesPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryJobData, setIndustryJobData] = useState<Map<number, IndustryJobData>>(new Map());
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
      const [industryRes, jobsRes] = await Promise.all([getIndustries(), getJobs()]);
      setIndustries(industryRes.data.data ?? []);

      const jobs: Array<{ industry_id?: number; vacancy?: number; company?: { image?: string } | null }> =
        jobsRes.data.data ?? [];
      const dataMap = new Map<number, IndustryJobData>();
      jobs.forEach((job) => {
        if (!job.industry_id) return;
        const existing = dataMap.get(job.industry_id) ?? { vacancies: 0, companyImages: [] };
        const vacancies = existing.vacancies + (job.vacancy ?? 0);
        const companyImages = job.company?.image && !existing.companyImages.includes(job.company.image)
          ? [...existing.companyImages, job.company.image]
          : existing.companyImages;
        dataMap.set(job.industry_id, { vacancies, companyImages });
      });
      setIndustryJobData(dataMap);
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

  const activeIndustries = industries.filter((i) => (i.jobs_count ?? 0) > 0);

  if (loading) {
    return (
      <View style={[styles.loadingScreen, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const countBadge = (
    <View style={styles.countBadge}>
      <Feather name="grid" size={12} color={colors.white} />
      <Text style={styles.countText}>{activeIndustries.length} Industries</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Compact sticky header */}
      <StickyPageHeader
        opacity={compactOpacity}
        onBack={() => router.back()}
        title="Industries"
      />

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}
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
              <Feather name="grid" size={26} color={colors.white} />
            </View>
            <View>
              <Text style={styles.pageTitle}>Industries</Text>
              <Text style={styles.pageSub}>Browse by sector</Text>
            </View>
          </View>
        </PageBanner>

        {/* List header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>All Sectors</Text>
          <View style={styles.listBadge}>
            <Text style={styles.listBadgeText}>{activeIndustries.length}</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {activeIndustries.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="search" size={48} color={colors.borderDark} />
            <Text style={styles.emptyTitle}>No industries found</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {activeIndustries.map((industry) => {
              const iconName = ICON_MAP[industry.name] ?? "briefcase-outline";
              const jobData = industryJobData.get(industry.id);
              const visibleImages = (jobData?.companyImages ?? []).slice(0, 3);
              return (
                <TouchableOpacity
                  key={industry.id}
                  style={styles.card}
                  onPress={() => router.push(`/industry/${industry.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={styles.left}>
                    <View style={styles.iconWrapCard}>
                      <MaterialCommunityIcons
                        name={iconName}
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.meta}>
                      <Text style={styles.name}>{industry.name}</Text>
                      <Text style={styles.count}>
                        {industry.jobs_count ?? 0} Jobs · {jobData?.vacancies ?? 0} Vacancies
                      </Text>
                    </View>
                  </View>
                  <View style={styles.right}>
                    {visibleImages.length > 0 ? (
                      <View style={styles.avatarRow}>
                        {visibleImages.map((img, i) => (
                          <View
                            key={i}
                            style={[
                              styles.avatar,
                              { marginLeft: i > 0 ? -7 : 0, zIndex: visibleImages.length - i },
                            ]}
                          >
                            <Image
                              source={{ uri: IMAGE_BASE + img }}
                              style={styles.avatarImg}
                              resizeMode="contain"
                            />
                          </View>
                        ))}
                      </View>
                    ) : null}
                    <Feather name="chevron-right" size={18} color={colors.borderDark} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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

  /* List header */
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

  /* Error */
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

  /* Empty */
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

  /* Cards */
  content: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconWrapCard: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  meta: { flex: 1 },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: colors.textPrimary,
  },
  count: {
    marginTop: 2,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: "hidden",
    padding: 2,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 9,
  },
});
