import { TouchableOpacity, View, Text, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { IMAGE_BASE } from "../constants/app";

interface Props {
  company: {
    id: number;
    name: string;
    image?: string;
    jobs_count?: number;
  };
  active?: boolean;
  onPress?: () => void;
}

export default function CompanyCard({ company, active, onPress }: Props) {
  const logoUri = company.image ? IMAGE_BASE + company.image : null;

  return (
    <TouchableOpacity
      style={[styles.card, active && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {logoUri ? (
        <Image
          source={{ uri: logoUri }}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <View
          style={[styles.logoFallback, active && styles.logoFallbackActive]}
        >
          <Text style={[styles.logoText, active && styles.logoTextActive]}>
            {company.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text
        style={[styles.name, active && styles.nameActive]}
        numberOfLines={1}
      >
        {company.name}
      </Text>
      {company.jobs_count !== undefined ? (
        <View style={[styles.pill, active && styles.pillActive]}>
          <Feather
            name="briefcase"
            size={10}
            color={active ? colors.primary : colors.gray}
          />
          <Text style={[styles.pillText, active && styles.pillTextActive]}>
            {company.jobs_count}
          </Text>
          <Feather
            name="chevron-right"
            size={11}
            color={active ? colors.primary : colors.borderDark}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginLeft: 12,
    marginBottom: 4,
    width: 118,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 7,
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    shadowOpacity: 0.06,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.grayLight,
  },
  logoFallback: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackActive: { backgroundColor: "rgba(37,99,235,0.15)" },
  logoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: colors.primary,
  },
  logoTextActive: { color: colors.primaryDark },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 17,
  },
  nameActive: { color: colors.primaryDark },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.grayLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pillActive: { backgroundColor: colors.primaryBorder },
  pillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: colors.gray,
  },
  pillTextActive: { color: colors.primaryDark },
});
