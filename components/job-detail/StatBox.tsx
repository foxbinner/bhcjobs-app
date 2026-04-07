import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { jobDetailStyles as styles } from "./jobDetailStyles";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface Props {
  icon: FeatherIconName;
  label: string;
  value: string;
}

export function StatBox({ icon, label, value }: Props) {
  return (
    <View style={styles.statBox}>
      <Feather name={icon} size={16} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
