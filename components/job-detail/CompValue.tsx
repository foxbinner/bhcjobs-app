import { Text } from "react-native";
import { jobDetailStyles as styles } from "./jobDetailStyles";

interface Props {
  text: string;
}

export function CompValue({ text }: Props) {
  const bdtIndex = text.indexOf(" (BDT");
  if (bdtIndex === -1) {
    return (
      <Text
        style={[
          styles.compBlockValue,
          text === "Not specified" && styles.compBlockValueMuted,
          text === "Provided" && styles.compBlockValueGreen,
        ]}
      >
        {text}
      </Text>
    );
  }
  const sarPart = text.slice(0, bdtIndex);
  const bdtPart = text.slice(bdtIndex);
  return (
    <Text style={styles.compBlockValue}>
      <Text style={styles.compBlockValueGreen}>{sarPart}</Text>
      <Text style={styles.compBlockValueBdt}>{bdtPart}</Text>
    </Text>
  );
}
