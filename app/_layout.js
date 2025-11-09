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

  // ✅ Hooks always run at top level (never inside conditions)
  useEffect(() => {
    if (isAuthenticated === undefined || !segments.length) return;

    if (!isAuthenticated) {
      router.replace("/(app)/signIn");
      return;
    }

    if (!user) return;

    const isAdmin = user.role === "admin";
    const isVolunteer = user.role === "volunteer";
    const isInAdmin = segments[0] === "(admin)";
    const isInVolunteer = segments[0] === "(volunteer)";
    const isInApp =
      segments[0] === "(app)" ||
      segments[0] === "adopt";

    if (isAdmin && !isInAdmin) router.replace("/(admin)/(tabs)/manageReports");
    else if (isVolunteer && !isInVolunteer) router.replace("/(volunteer)/dashboard");
    else if (!isAdmin && !isVolunteer && !isInApp && segments[0] !== "adopt")
      router.replace("/(app)/home");
    
    if (isInAdmin && !isAdmin) router.replace("/(app)/home");
    else if (isInVolunteer && !isVolunteer) router.replace("/(app)/home");
    else if (isInApp && (isAdmin || isVolunteer)) {
      if (isAdmin) router.replace("/(admin)/(tabs)/manageReports");
      if (isVolunteer) router.replace("/(volunteer)/(tabs)/dashboard");
    }
  }, [isAuthenticated, user, segments]);

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
