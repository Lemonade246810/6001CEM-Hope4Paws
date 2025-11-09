import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "../../config/firebaseConfig";

function StatCard({ title, value, subtitle, onPress }) {
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.7 }
      ]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </Pressable>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    completed: 0,
    volunteers: 0
  });

  const refs = useMemo(() => ({
    reports: collection(db, "AnimalReports"),
    users: collection(db, "users"),
  }), []);

  useEffect(() => {
    const unsubs = [];

    // Total reports
    unsubs.push(
      onSnapshot(refs.reports, (snap) =>
        setStats(s => ({ ...s, total: snap.size }))
      )
    );

    // Pending reports
    unsubs.push(
      onSnapshot(
        query(refs.reports, where("status", "==", "Pending")),
        (snap) => setStats(s => ({ ...s, pending: snap.size }))
      )
    );

    // Assigned reports
    unsubs.push(
      onSnapshot(
        query(refs.reports, where("status", "==", "Assigned")),
        (snap) => setStats(s => ({ ...s, assigned: snap.size }))
      )
    );

    // Completed reports
    unsubs.push(
      onSnapshot(
        query(refs.reports, where("status", "==", "Completed")),
        (snap) => setStats(s => ({ ...s, completed: snap.size }))
      )
    );

    // Volunteers
    unsubs.push(
      onSnapshot(
        query(refs.users, where("role", "==", "volunteer")),
        (snap) => setStats(s => ({ ...s, volunteers: snap.size }))
      )
    );

    return () => unsubs.forEach(u => u && u());
  }, [refs]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.header}>🐾 Admin Dashboard</Text>

      {/* Row 1 */}
      <View style={styles.row}>
        <StatCard
          title="Total Reports"
          value={stats.total}
          subtitle="All reports submitted"
          onPress={() => router.push("/(admin)/(tabs)/manageReports")}
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          subtitle="Needs attention"
          onPress={() => router.push("/(admin)/(tabs)/manageReports")}
        />
      </View>

      {/* Row 2 */}
      <View style={[styles.row, { marginTop: 12 }]}>
        <StatCard
          title="Assigned"
          value={stats.assigned}
          subtitle="In progress"
          onPress={() => router.push("/(admin)/(tabs)/manageReports")}
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          subtitle="Finished cases"
          onPress={() => router.push("/(admin)/(tabs)/completedReports")}
        />
      </View>

      {/* Row 3 */}
      <View style={[styles.row, { marginTop: 12 }]}>
        <StatCard
          title="Volunteers"
          value={stats.volunteers}
          subtitle="Active members"
          onPress={() => router.push("/(admin)/(tabs)/manageSettings")}
        />

        <StatCard
          title="Adoption Requests"
          value={0}
          subtitle="Coming soon"
          onPress={() => {}}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    minHeight: 110,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, color: "#64748B", fontWeight: "600" },
  cardValue: { fontSize: 32, color: "#0F172A", fontWeight: "900" },
  cardSubtitle: { fontSize: 12, color: "#94A3B8" },
});
