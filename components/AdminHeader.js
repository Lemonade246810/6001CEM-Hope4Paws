import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/authContext";

export default function AdminHeader({ title }) {
  const router = useRouter();
  const segments = useSegments();
  const { user, logout } = useAuth();

  // Detect if current route is a subpage (so back button appears)
  const isSubPage =
    segments[segments.length - 1] === "manageNotifications" ||
    segments[segments.length - 1] === "manageSettings";

  const handleLogout = async () => {
    await logout();
    router.replace("/(app)/signIn");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {/* 🔙 Left section (Back + Titles) */}
        <View style={styles.leftSection}>
          {isSubPage && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#1E293B" />
            </TouchableOpacity>
          )}

          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              Welcome, {user?.username || "Admin"}{" "}
              <Text style={styles.roleBadge}>({user?.role || "admin"})</Text> 👋
            </Text>
          </View>
        </View>

        {/* ⚙️ Right section (icons + logout) */}
        <View style={styles.icons}>
          <TouchableOpacity
            onPress={() => router.push("/(admin)/manageNotifications")}
            style={styles.iconButton}
          >
            <MaterialIcons name="notifications" size={26} color="#f59e0b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(admin)/manageSettings")}
            style={styles.iconButton}
          >
            <FontAwesome5 name="cog" size={22} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <MaterialIcons name="logout" size={26} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#FFF7ED",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFF7ED",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    elevation: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitle: {
    color: "#92400E",
    marginTop: 2,
    fontWeight: "600",
  },
  roleBadge: {
    color: "#6b7280",
    fontStyle: "italic",
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 16,
  },
});
