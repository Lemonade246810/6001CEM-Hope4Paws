import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/authContext";

export default function VolunteerHeader({ title }) {
  const router = useRouter();
  const segments = useSegments();
  const { user, logout } = useAuth();

  const [expanded, setExpanded] = useState(false);

  const isSubPage =
    segments[segments.length - 1] === "volunteerNotifications" ||
    segments[segments.length - 1] === "volunteerSettings";

  const handleLogout = async () => {
    await logout();
    router.replace("/(app)/signIn");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {/* LEFT SECTION */}
        <View style={styles.leftSection}>
          {isSubPage && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#1E293B" />
            </TouchableOpacity>
          )}

          {/* CLICKABLE TEXT (Expands content) */}
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
            style={{ flexShrink: 1 }}
          >
            <View style={styles.textContainer}>
              <Text
                style={styles.title}
                numberOfLines={expanded ? 10 : 1}
              >
                {title}
              </Text>

              <Text
                style={styles.subtitle}
                numberOfLines={expanded ? 10 : 1}
              >
                Welcome, {user?.username || "Volunteer"}{" "}
                <Text style={styles.roleBadge}>
                  ({user?.role || "volunteer"})
                </Text>{" "}
                👋
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* RIGHT SECTION - Icons always fully visible */}
        <View style={styles.icons}>
          <TouchableOpacity
            onPress={() => router.push("/(volunteer)/volunteerNotifications")}
            style={styles.iconButton}
          >
            <MaterialIcons name="notifications" size={26} color="#3b82f6" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(volunteer)/volunteerSettings")}
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
    backgroundColor: "#EFF6FF",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#EFF6FF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    elevation: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  textContainer: {
    flexShrink: 1,
    maxWidth: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitle: {
    color: "#1E40AF",
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
    flexShrink: 0,
  },
  iconButton: {
    marginLeft: 14,
  },
});
