import { TouchableOpacity, Text, StyleSheet, View, Image } from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { IMAGE_BASE } from "../constants/app";

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

interface Props {
  industry: {
    id: number;
    name: string;
    jobs_count?: number;
  };
  active?: boolean;
  onPress?: () => void;
  companyImages?: string[];
}

export default function IndustryCard({ industry, active, onPress, companyImages = [] }: Props) {
  const iconName = ICON_MAP[industry.name] ?? "briefcase-outline";
  const visibleImages = companyImages.slice(0, 3);
  const count = industry.jobs_count ?? 0;

  return (
    <TouchableOpacity
      style={[styles.card, active && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {count > 0 ? (
        <View style={[styles.pill, active && styles.pillActive]}>
          <Feather
            name="briefcase"
            size={10}
            color={active ? colors.white : colors.gray}
          />
          <Text style={[styles.pillText, active && styles.pillTextActive]}>
            {count}
          </Text>
        </View>
      ) : null}

      <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
        <MaterialCommunityIcons
          name={iconName}
          size={15}
          color={active ? colors.white : colors.primary}
        />
      </View>

      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={2}>
        {industry.name}
      </Text>

      <View style={{ flex: 1 }} />

      <View style={styles.bottomRow}>
        {visibleImages.length > 0 ? (
          <View style={styles.avatarRow}>
            {visibleImages.map((img, i) => (
              <View
                key={i}
                style={[
                  styles.avatar,
                  { marginLeft: i > 0 ? -8 : 0, zIndex: visibleImages.length - i },
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
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <Feather
          name="chevron-right"
          size={14}
          color={active ? "rgba(255,255,255,0.7)" : colors.borderDark}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    minHeight: 148,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    shadowOpacity: 0.1,
  },

  pill: {
    position: "absolute",
    top: 20,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.grayLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pillActive: { backgroundColor: "rgba(255,255,255,0.2)" },
  pillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: colors.gray,
  },
  pillTextActive: { color: colors.white },

  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  labelActive: { color: colors.white },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  avatarRow: {
    flexDirection: "row",
    flex: 1,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: "hidden",
    padding: 2,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});
