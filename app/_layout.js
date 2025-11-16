import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthContextProvider, useAuth } from "../context/authContext";
import "../global.css";

const MainLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // All public pages (no login required)
  const publicRoutes = ["signIn", "signUp", "reset"];

  useEffect(() => {
    if (isAuthenticated === undefined) return; // Wait for Firebase

    const current = segments[0];

    // 🔓 Allow Sign In / Sign Up without redirect
    if (publicRoutes.includes(current)) return;

    // 🔐 NOT logged in → force to Sign In
    if (!isAuthenticated) {
      router.replace("/signIn");
      return;
    }

    // Wait until Firestore user loads
    if (!user) return;

    const isAdmin = user.role === "admin";
    const isVolunteer = user.role === "volunteer";

    const isInAdmin = current === "(admin)";
    const isInVolunteer = current === "(volunteer)";
    const isInApp = current === "(app)" || current === "adopt";

    // 1️⃣ ADMIN REDIRECT
    if (isAdmin) {
      if (!isInAdmin) router.replace("/(admin)/(tabs)/manageReports");
      return;
    }

    // 2️⃣ VOLUNTEER REDIRECT
    if (isVolunteer) {
      if (!isInVolunteer) router.replace("/(volunteer)/dashboard");
      return;
    }

    // 3️⃣ NORMAL USER REDIRECT
    if (!isInApp) {
      router.replace("/(app)/home");
      return;
    }
  }, [isAuthenticated, user, segments]);

  // ⏳ While auth is loading
  if (isAuthenticated === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "roboto-regular": require("../assets/fonts/RobotoCondensed-Regular.ttf"),
    "roboto-bold": require("../assets/fonts/RobotoCondensed-Bold.ttf"),
    "roboto-italic": require("../assets/fonts/RobotoCondensed-Italic.ttf"),
    "roboto-light": require("../assets/fonts/RobotoCondensed-Light.ttf"),
    "roboto-medium": require("../assets/fonts/RobotoCondensed-Medium.ttf"),
    "roboto-semi-bold": require("../assets/fonts/RobotoCondensed-SemiBold.ttf"),
  });

  if (!fontsLoaded)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );

  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  );
}
