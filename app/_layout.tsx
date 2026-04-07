import { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../constants/colors";
import { AuthProvider } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");
const LOGO = require("../assets/website-icon-nightmode.png");

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const [showSplash, setShowSplash] = useState(true);

  // On Android edge-to-edge, the nav bar is transparent — content behind it
  // shows through. Set dark icons so they read on the white NavBarWhitePaint
  // overlay rendered after the Stack below.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    NavigationBar.setButtonStyleAsync("dark").catch(() => {});
  }, []);

  // Animation values
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(18)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(10)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!fontsLoaded) return;

    Animated.sequence([
      // Logo rises + scales in with spring
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 45,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
      // Shimmer glow pulse
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 0.35,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      // Tagline slides up and fades in
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),
      // Hold
      Animated.delay(750),
      // Elegant scale-up + fade out exit
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1.06,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) setShowSplash(false);
    });
  }, [fontsLoaded]);

  if (!fontsLoaded || showSplash) {
    return (
      <View style={splash.root}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[colors.heroBg, "#0F2347", "#162D54"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Decorative circles */}
        <View style={splash.circle1} />
        <View style={splash.circle2} />
        <View style={splash.circle3} />

        <Animated.View style={[splash.center, { opacity: splashOpacity }]}>
          {/* Logo image */}
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
              marginBottom: 20,
              alignItems: "center",
            }}
          >
            <Image source={LOGO} style={splash.logo} resizeMode="contain" />
            {/* Shimmer glow underneath logo */}
            <Animated.View
              style={[splash.shimmer, { opacity: shimmerOpacity }]}
            />
          </Animated.View>

          {/* Tagline */}
          <Animated.Text
            style={[
              splash.tagline,
              {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineTranslateY }],
              },
            ]}
          >
            #1 Platform for Saudi Jobs
          </Animated.Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <View style={appRoot.root}>
        <Stack
          screenOptions={{ headerShown: false, animation: "slide_from_right" }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="saved-jobs" />
          <Stack.Screen
            name="jobs"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="industries"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="companies"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen name="job/[id]" />
          <Stack.Screen name="industry/[id]" />
          <Stack.Screen name="company/[id]" />
        </Stack>
        {/* Rendered after Stack so it appears above all screen content.
            On Android 15+ edgeToEdgeEnabled forces the nav bar transparent —
            the app content behind it shows through. This overlay paints that
            strip white. elevation ensures it layers above screen views. */}
        <NavBarWhitePaint />
      </View>
    </AuthProvider>
  );
}

// Paints the Android system navigation bar region white.
// Must render after (above) the Stack so it layers above screen content.
function NavBarWhitePaint() {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== "android" || insets.bottom === 0) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: insets.bottom,
        backgroundColor: colors.white,
        elevation: 100,
        zIndex: 9999,
      }}
    />
  );
}

const appRoot = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

const splash = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.heroBg,
  },
  circle1: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(37,99,235,0.07)",
    top: -100,
    right: -120,
  },
  circle2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(37,99,235,0.1)",
    bottom: -70,
    left: -70,
  },
  circle3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.025)",
    top: "38%" as any,
    left: width * 0.65,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.62,
    height: 68,
  },
  shimmer: {
    position: "absolute",
    bottom: -12,
    width: width * 0.5,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1.5,
  },
});
