import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { getJobs } from "../services/api";
import { colors } from "../constants/colors";
import JobCard from "../components/JobCard";
import { PageBanner } from "../components/PageBanner";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function capitalize(str?: string | null): string {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Feather name={icon as any} size={14} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading, signOut } = useAuth();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    if (!user?.shortlisted_jobs?.length) {
      setSavedJobs([]);
      return;
    }
    const sorted = [...user.shortlisted_jobs].sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
    );
    const orderedIds = sorted.map((s) => s.job_id);
    setJobsLoading(true);
    getJobs()
      .then((res) => {
        const all: any[] = res.data.data ?? [];
        const map = new Map(all.map((j) => [j.id, j]));
        setSavedJobs(orderedIds.map((id) => map.get(id)).filter(Boolean));
      })
      .catch(() => setSavedJobs([]))
      .finally(() => setJobsLoading(false));
  }, [user?.shortlisted_jobs]);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Feather name="user-x" size={48} color={colors.borderDark} />
        <Text style={styles.emptyTitle}>Not signed in</Text>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.signInBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const info = user.j_s_personal_info;
  const initials = user.name.charAt(0).toUpperCase();

  const handleFavoriteToggled = (jobId: number, isSaved: boolean) => {
    if (isSaved) return;
    setSavedJobs((prev) =>
      prev.filter(
        (job: any) => Number(job.job_id ?? job?.job?.id ?? job.id) !== jobId,
      ),
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        {/* Hero header */}
        <PageBanner
          onBack={() => router.back()}
          paddingBottom={32}
          topRight={
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Feather name="log-out" size={15} color="rgba(255,255,255,0.7)" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          }
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>{user.unique_id}</Text>
            </View>
          </View>
        </PageBanner>

        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <View style={styles.card}>
            <InfoRow icon="phone" label="Phone" value={user.phone} />
            <View style={styles.divider} />
            <InfoRow icon="mail" label="Email" value={user.email || "—"} />
            <View style={styles.divider} />
            <InfoRow
              icon="user"
              label="Gender"
              value={capitalize(info?.gender)}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="calendar"
              label="Date of Birth"
              value={formatDate(info?.dob)}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="book-open"
              label="Passport Number"
              value={info?.passport_number || "—"}
            />
          </View>
        </View>

        {/* Saved / Shortlisted Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Jobs</Text>
            {savedJobs.length > 0 && (
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => router.push("/saved-jobs")}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>See all</Text>
                <Feather name="chevron-right" size={13} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {jobsLoading ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginVertical: 24 }}
            />
          ) : savedJobs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="heart" size={36} color={colors.borderDark} />
              <Text style={styles.emptyBoxTitle}>No saved jobs yet</Text>
              <Text style={styles.emptyBoxSub}>
                Jobs you save will appear here
              </Text>
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
            <>
              {savedJobs.slice(0, 2).map((job: any) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onFavoriteToggled={handleFavoriteToggled}
                />
              ))}
              {savedJobs.length > 2 && (
                <TouchableOpacity
                  style={styles.seeAllBottomBtn}
                  onPress={() => router.push("/saved-jobs")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.seeAllBottomText}>
                    See all {savedJobs.length} saved jobs
                  </Text>
                  <Feather name="arrow-right" size={15} color={colors.primary} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
    gap: 16,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  logoutText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },

  avatarSection: {
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.25)",
  },
  avatarText: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 30,
    color: colors.white,
  },
  userName: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: colors.white,
    letterSpacing: -0.3,
  },
  idBadge: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  idBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
  },

  section: {
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  savedJobsSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: colors.textPrimary,
  },
  countBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  countBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: colors.primary,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  infoText: { flex: 1 },
  infoLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 1,
  },
  infoValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.textPrimary,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 36,
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyBoxTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyBoxSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.gray,
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
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

  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: colors.textSecondary,
  },
  signInBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  signInBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.white,
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
