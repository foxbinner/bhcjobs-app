import { ReactNode } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { colors } from "../constants/colors";

interface PageBannerProps {
  onBack: () => void;
  topRight?: ReactNode;
  children: ReactNode;
  paddingBottom?: number;
}

export function PageBanner({
  onBack,
  topRight,
  children,
  paddingBottom,
}: PageBannerProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[colors.heroBg, "#0F2347", "#1A3A6B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.banner,
        {
          paddingTop: insets.top + 12,
          paddingBottom: paddingBottom ?? 28,
        },
      ]}
    >
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Top row: back + optional right slot */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          activeOpacity={0.75}
        >
          <Feather name="arrow-left" size={20} color={colors.white} />
        </TouchableOpacity>
        {topRight ?? null}
      </View>

      {children}
    </LinearGradient>
  );
}

interface StickyPageHeaderProps {
  opacity: Animated.AnimatedInterpolation<number>;
  onBack: () => void;
  title: string;
}

export function StickyPageHeader({
  opacity,
  onBack,
  title,
}: StickyPageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View style={[styles.stickyWrap, { opacity }]}>
      <LinearGradient
        colors={[colors.heroBg, "#0F2347"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.stickyGradient,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          activeOpacity={0.75}
        >
          <Feather name="arrow-left" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.stickyTitle}>{title}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -70,
    right: -70,
  },
  circle2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(37,99,235,0.2)",
    bottom: -40,
    left: -30,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  stickyWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  stickyGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  stickyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: colors.white,
  },
});
