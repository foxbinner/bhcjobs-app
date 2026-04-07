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
import { Feather } from "@expo/vector-icons";
import { getCompanies, getJobs } from "../services/api";
import { colors } from "../constants/colors";
import { IMAGE_BASE } from "../constants/app";
import { bottomInsetPadding } from "../lib/insets";
import { PageBanner, StickyPageHeader } from "../components/PageBanner";

interface Company {
  id: number;
  name: string;
  image?: string;
  jobs_count?: number;
}

export default function CompaniesPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyVacancies, setCompanyVacancies] = useState<Map<number, number>>(new Map());
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
      const [companyRes, jobsRes] = await Promise.all([getCompanies(), getJobs()]);
      setCompanies(companyRes.data.data ?? []);

      const jobs: Array<{ company_id?: number; vacancy?: number }> = jobsRes.data.data ?? [];
      const vacMap = new Map<number, number>();
      jobs.forEach((job) => {
        if (!job.company_id) return;
        vacMap.set(job.company_id, (vacMap.get(job.company_id) ?? 0) + (job.vacancy ?? 0));
      });
      setCompanyVacancies(vacMap);
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
      <Text style={styles.countText}>{companies.length} Companies</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Compact sticky header */}
      <StickyPageHeader
        opacity={compactOpacity}
        onBack={() => router.back()}
        title="Top Companies"
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
              <Text style={styles.pageTitle}>Top Companies</Text>
              <Text style={styles.pageSub}>Find your next employer</Text>
            </View>
          </View>
        </PageBanner>

        {/* List header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Hiring Now</Text>
          <View style={styles.listBadge}>
            <Text style={styles.listBadgeText}>{companies.length}</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {companies.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="search" size={48} color={colors.borderDark} />
            <Text style={styles.emptyTitle}>No companies found</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {companies.map((company) => {
              const logoUri = company.image ? IMAGE_BASE + company.image : null;
              const vacancies = companyVacancies.get(company.id) ?? 0;
              return (
                <TouchableOpacity
                  key={company.id}
                  style={styles.card}
                  onPress={() => router.push(`/company/${company.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={styles.left}>
                    {logoUri ? (
                      <Image
                        source={{ uri: logoUri }}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.logoFallback}>
                        <Text style={styles.logoText}>
                          {company.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.meta}>
                      <Text style={styles.name}>{company.name}</Text>
                      <Text style={styles.count}>
                        {company.jobs_count ?? 0} Jobs · {vacancies} Vacancies
                      </Text>
                    </View>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={colors.borderDark}
                  />
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
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.grayLight,
  },
  logoFallback: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: colors.primary,
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
});
