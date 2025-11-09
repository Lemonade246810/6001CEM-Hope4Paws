import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/authContext";

export default function ManageSettings() {
  const { logout } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  // Confirm logout first
  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: handleLogout },
      ]
    );
  };

  const handleLogout = async () => {
    const res = await logout();
    if (!res.success) {
      Alert.alert("Logout failed", res.msg || "Please try again");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚙️ Admin Settings</Text>

      {/* Notifications Section */}
      <Text style={styles.sectionTitle}>Notifications</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <MaterialIcons name="email" size={22} color="#f59e0b" />
          </View>
          <Text style={styles.label}>Email Alerts</Text>
          <Switch value={emailAlerts} onValueChange={setEmailAlerts} />
        </View>

        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="notifications" size={22} color="#f59e0b" />
          </View>
          <Text style={styles.label}>Push Notifications</Text>
          <Switch value={pushAlerts} onValueChange={setPushAlerts} />
        </View>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>

      <TouchableOpacity style={styles.cardButton} onPress={confirmLogout}>
        <View style={styles.logoutRow}>
          <MaterialIcons name="logout" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    padding: 16,
  },

  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
    marginTop: 18,
    marginBottom: 6,
  },

  // Card container
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  iconBox: {
    width: 32,
    height: 32,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  label: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },

  // Logout button section
  cardButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
