import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { BDT_RATE, IMAGE_BASE } from "../constants/app";
import { shortlistJob, removeShortlist } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface Job {
  id: number;
  job_id?: number;
  job_title?: string;
  title?: string;
  name?: string;
  company_name?: string;
  company_image?: string;
  industry_name?: string;
  country_name?: string;
  country?: { name?: string };
  currency?: string;
  min_salary?: number;
  max_salary?: number;
  salary_type?: string;
  food_option?: string | null;
  food_amount?: number | null;
  vacancy?: number;
  view_count?: number;
  expiry?: string;
  is_hot?: number;
  category?: { id: number; name: string } | null;
  company?: { image?: string; name?: string } | null;
  industry?: { name?: string } | null;
  job?: {
    id?: number;
    job_title?: string;
    title?: string;
    name?: string;
    company_name?: string;
    industry_name?: string;
    country?: { name?: string };
    company?: { image?: string; name?: string } | null;
    industry?: { name?: string } | null;
    min_salary?: number;
    max_salary?: number;
    currency?: string;
    expiry?: string;
  } | null;
}

function getJobId(job: Job): number {
  return Number(job.job_id ?? job.job?.id ?? job.id ?? 0);
}

function getJobTitle(job: Job): string {
  const source = job.job ?? job;
  return (
    source.job_title ??
    source.title ??
    source.name ??
    (job as any).position_name ??
    (source as any).position_name ??
    (job as any).designation ??
    (source as any).designation ??
    "Untitled Position"
  );
}

function getCompanyName(job: Job): string {
  const source = job.job ?? job;
  return source.company_name ?? source.company?.name ?? "—";
}

function getIndustryName(job: Job): string {
  const source = job.job ?? job;
  return source.industry_name ?? source.industry?.name ?? "—";
}

function getCountryName(job: Job): string | undefined {
  const source = job.job ?? job;
  return source.country?.name ?? (source as any).country_name;
}

function formatSalary(job: Job): string | null {
  const source = job.job ?? job;
  if (!source.min_salary && !source.max_salary) return null;
  const cur = source.currency ?? "SAR";
  if (source.min_salary && source.max_salary)
    return `${cur} ${source.min_salary.toLocaleString()} – ${source.max_salary.toLocaleString()}`;
  return `${cur} ${(source.min_salary ?? source.max_salary ?? 0).toLocaleString()}`;
}

function formatBdt(amount: number): string {
  return `BDT ${(amount * BDT_RATE).toLocaleString()}`;
}

function formatDeadline(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil(
    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day left";
  if (diffDays <= 7) return `${diffDays}d left`;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export default function JobCard({
  job,
  onFavoriteToggled,
}: {
  job: Job;
  onFavoriteToggled?: (jobId: number, isSaved: boolean) => void;
}) {
  const router = useRouter();
  const { user, isLoggedIn, refreshUser } = useAuth();
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [optimisticSaved, setOptimisticSaved] = useState<boolean | null>(null);
  const resolvedJobId = getJobId(job);
  const salary = formatSalary(job);
  const rawLogo =
    job.company?.image ?? job.company_image ?? job.job?.company?.image ?? null;
  const logoUri = rawLogo
    ? rawLogo.startsWith("http")
      ? rawLogo
      : IMAGE_BASE + rawLogo
    : null;
  const resolvedExpiry = (job.job?.expiry ?? job.expiry) as string | undefined;
  const resolvedCurrency = (job.job?.currency ?? job.currency) as
    | string
    | undefined;
  const resolvedFoodOption = (job.job as any)?.food_option ?? job.food_option;
  const resolvedFoodAmount = (job.job as any)?.food_amount ?? job.food_amount;
  const resolvedVacancy = (job.job as any)?.vacancy ?? job.vacancy;

  const deadline = formatDeadline(resolvedExpiry);
  const isUrgent = resolvedExpiry
    ? Math.ceil((new Date(resolvedExpiry).getTime() - Date.now()) / 86400000) <=
      3
    : false;

  const foodLabel =
    resolvedFoodOption === "allowance" && resolvedFoodAmount
      ? `${resolvedCurrency ?? "SAR"} ${resolvedFoodAmount}/M (${formatBdt(resolvedFoodAmount)})`
      : resolvedFoodOption === "provided"
        ? "Food Provided"
        : null;
  const vacancyLabel =
    resolvedVacancy !== undefined && resolvedVacancy !== null
      ? `${resolvedVacancy} ${resolvedVacancy === 1 ? "Vacancy" : "Vacancies"}`
      : null;
  const salaryLabel = salary
    ? `${salary}/M (${formatBdt((job.job?.min_salary ?? job.job?.max_salary ?? job.min_salary ?? job.max_salary ?? 0) as number)})`
    : null;

  const isSavedFromUser =
    user?.shortlisted_jobs?.some((savedJob: any) => {
      const savedId = Number(
        savedJob.job_id ?? savedJob.id ?? savedJob.job?.id,
      );
      return savedId === resolvedJobId;
    }) ?? false;
  const isSaved = optimisticSaved ?? isSavedFromUser;

  const onFavoritePress = async () => {
    if (!isLoggedIn) {
      Alert.alert("Sign in required", "Please sign in to save jobs.");
      return;
    }
    if (!resolvedJobId) {
      Alert.alert("Failed", "Job ID is missing.");
      return;
    }
    if (savingFavorite) return;

    const nextSaved = !isSaved;

    try {
      setSavingFavorite(true);
      setOptimisticSaved(nextSaved);
      onFavoriteToggled?.(resolvedJobId, nextSaved);
      if (isSaved) {
        await removeShortlist(resolvedJobId);
      } else {
        await shortlistJob(resolvedJobId);
      }
      await refreshUser();
    } catch {
      setOptimisticSaved(isSavedFromUser);
      onFavoriteToggled?.(resolvedJobId, isSavedFromUser);
      Alert.alert("Failed", "Could not update saved jobs. Please try again.");
    } finally {
      setOptimisticSaved(null);
      setSavingFavorite(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/job/${resolvedJobId}`)}
      activeOpacity={0.95}
    >
      {/* HOT ribbon */}
      {job.is_hot ? (
        <View style={styles.hotRibbon}>
          <Feather name="zap" size={9} color={colors.white} />
          <Text style={styles.hotRibbonText}>HOT</Text>
        </View>
      ) : null}

      {/* Header: logo + company info */}
      <View style={styles.header}>
        {logoUri ? (
          <Image
            source={{ uri: logoUri }}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.logoFallback}>
            <Text style={styles.logoInitials}>
              {(getCompanyName(job) ?? "?").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.headerMeta}>
          <Text style={styles.companyName} numberOfLines={1}>
            {getCompanyName(job)}
          </Text>
          <Text style={styles.industryName} numberOfLines={1}>
            {getIndustryName(job)}
          </Text>
        </View>
      </View>

      {/* Job title */}
      <Text style={styles.title} numberOfLines={2}>
        {getJobTitle(job)}
      </Text>

      {/* Tags row: two lines */}
      <View style={[styles.tagsRow, styles.tagsRowTop]}>
        {getCountryName(job) ? (
          <View style={styles.tagLocation}>
            <Feather name="map-pin" size={11} color={colors.primary} />
            <Text style={styles.tagLocationText}>{getCountryName(job)}</Text>
          </View>
        ) : null}
        {vacancyLabel ? (
          <View style={styles.tagLocation}>
            <Feather name="users" size={11} color={colors.primary} />
            <Text style={styles.tagLocationText}>{vacancyLabel}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.tagsRow, styles.tagsRowBottom]}>
        {salaryLabel ? (
          <View style={styles.tagSalary}>
            <Text style={styles.tagSalaryText}>{salaryLabel}</Text>
          </View>
        ) : null}
        {foodLabel ? (
          <View style={styles.tagFood}>
            <MaterialCommunityIcons
              name="food-fork-drink"
              size={11}
              color={colors.success}
            />
            <Text style={styles.tagFoodText}>{foodLabel}</Text>
          </View>
        ) : null}
      </View>

      {/* Footer: deadline + views */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {deadline ? (
            <View
              style={[
                styles.deadlineChip,
                isUrgent && styles.deadlineChipUrgent,
              ]}
            >
              <Feather
                name="clock"
                size={11}
                color={isUrgent ? colors.error : colors.gray}
              />
              <Text
                style={[
                  styles.deadlineText,
                  isUrgent && styles.deadlineTextUrgent,
                ]}
              >
                {deadline}
              </Text>
            </View>
          ) : null}
          {job.view_count ? (
            <View style={styles.viewsChip}>
              <Feather name="eye" size={11} color={colors.gray} />
              <Text style={styles.viewsText}>
                {job.view_count.toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footerRight}>
          <TouchableOpacity
            style={[styles.favoriteBtn, isSaved && styles.favoriteBtnActive]}
            activeOpacity={0.75}
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress();
            }}
            disabled={savingFavorite}
          >
            {savingFavorite ? (
              <ActivityIndicator
                size="small"
                color={isSaved ? colors.error : colors.gray}
              />
            ) : (
              <MaterialCommunityIcons
                name={isSaved ? "heart" : "heart-outline"}
                size={16}
                color={isSaved ? colors.error : colors.gray}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => router.push(`/job/${resolvedJobId}`)}
            activeOpacity={0.85}
          >
            <Text style={styles.applyText}>View</Text>
            <Feather name="arrow-right" size={13} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },

  hotRibbon: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.hot,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  hotRibbonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: colors.white,
    letterSpacing: 0.5,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingRight: 48,
    paddingLeft: 4,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.grayLight,
  },
  logoFallback: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInitials: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: colors.primary,
  },
  headerMeta: { flex: 1 },
  companyName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.textPrimary,
  },
  industryName: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.gray,
    marginTop: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 23,
    marginBottom: 10,
    paddingLeft: 4,
  },

  tagLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  tagLocationText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: colors.primary,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagsRowTop: {
    marginBottom: 6,
  },
  tagsRowBottom: {
    marginBottom: 14,
  },
  tagSalary: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagSalaryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#15803D",
  },
  tagFood: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagFoodText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: colors.success,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  deadlineChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.grayLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deadlineChipUrgent: {
    backgroundColor: "#FEF2F2",
  },
  deadlineText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: colors.gray,
  },
  deadlineTextUrgent: { color: colors.error },
  viewsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewsText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.gray,
  },

  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  favoriteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  favoriteBtnActive: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.white,
  },
});
