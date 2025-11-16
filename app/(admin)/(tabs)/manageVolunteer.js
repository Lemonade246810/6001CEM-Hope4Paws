import { router } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../../config/firebaseConfig";

export default function ManageVolunteers() {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "volunteer")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVolunteers(list);
    });

    return unsub;
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header row with Add button */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Volunteers</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(admin)/addVolunteer")}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {volunteers.length === 0 && (
        <Text style={styles.emptyText}>No volunteers registered yet.</Text>
      )}

      {volunteers.map((v) => (
        <View key={v.id} style={styles.card}>
          <Text style={styles.name}>{v.username || v.email}</Text>
          <Text style={styles.email}>{v.email}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Phone: </Text>
            <Text style={styles.value}>{v.phone || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Availability: </Text>
            <Text
              style={[
                styles.badge,
                v.isAvailable ? styles.badgeAvailable : styles.badgeBusy,
              ]}
            >
              {v.isAvailable ? "Available" : "Busy / Assigned"}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
  },
  addButton: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  email: {
    color: "#6B7280",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
  },
  label: {
    color: "#4B5563",
    fontWeight: "600",
  },
  value: {
    color: "#4B5563",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeAvailable: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  badgeBusy: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
  },
});