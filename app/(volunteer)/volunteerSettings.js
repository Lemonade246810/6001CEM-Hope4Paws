import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function VolunteerSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volunteer Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          thumbColor={notificationsEnabled ? "#2563EB" : "#CBD5E1"}
          trackColor={{ true: "#93C5FD", false: "#E2E8F0" }}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <Switch thumbColor="#CBD5E1" trackColor={{ false: "#E2E8F0" }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#1E293B",
  },
});
