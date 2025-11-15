import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StatusChip from "../../../components/StatusChip";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../context/authContext";

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [assignedCount, setAssignedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recentTasks, setRecentTasks] = useState([]);

  // Fetch stats + recent tasks
  useEffect(() => {
    if (!user?.userId) return;

    // Count assigned
    const q1 = query(
      collection(db, "AnimalReports"),
      where("assignedVolunteerId", "==", user.userId),
      where("status", "==", "Assigned")
    );
    const unsub1 = onSnapshot(q1, snap => setAssignedCount(snap.docs.length));

    // Count completed
    const q2 = query(
      collection(db, "AnimalReports"),
      where("assignedVolunteerId", "==", user.userId),
      where("status", "==", "Completed")
    );
    const unsub2 = onSnapshot(q2, snap => setCompletedCount(snap.docs.length));

    // Recent tasks (last 3)
    const q3 = query(
      collection(db, "AnimalReports"),
      where("assignedVolunteerId", "==", user.userId),
      orderBy("assignedAt", "desc"),
      limit(3)
    );
    const unsub3 = onSnapshot(q3, snap =>
      setRecentTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [user?.userId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#FFF7ED", padding: 20 }}>

      {/* Welcome */}
      <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 10 }}>
        👋 Welcome Back
      </Text>
      <Text style={{ fontSize: 16, color: "#6B7280", marginBottom: 20 }}>
        {user?.username || "Volunteer"}
      </Text>

      {/* Stats Section */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 25 }}>
        
        {/* Assigned */}
        <View style={styles.statCardYellow}>
          <Text style={styles.statLabel}>Assigned</Text>
          <Text style={styles.statValue}>{assignedCount}</Text>
        </View>

        {/* Completed */}
        <View style={styles.statCardGreen}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>{completedCount}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Quick Actions</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 25 }}>

        <TouchableOpacity
          onPress={() => router.push("/(volunteer)/assignedReports")}
          style={styles.actionBlue}
        >
          <Text style={styles.actionText}>View Assigned</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(volunteer)/completedTasks")}
          style={styles.actionGreen}
        >
          <Text style={styles.actionText}>Completed Tasks</Text>
        </TouchableOpacity>

      </View>

      {/* Recent Tasks */}
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Recent Assigned Tasks</Text>

      {recentTasks.length === 0 && (
        <Text style={{ color: "#6B7280" }}>No recent tasks.</Text>
      )}

      {/* New card with image preview */}
      {recentTasks.map(r => (
        <TouchableOpacity
          key={r.id}
          onPress={() => router.push(`/(volunteer)/reportDetails/${r.id}`)}
          style={styles.card}
        >
          {/* Image */}
          <Image
            source={{
              uri:
                r.photoUrl ||
                r.imageUrl ||
                "https://cdn-icons-png.flaticon.com/512/616/616430.png",
            }}
            style={styles.thumbnail}
          />

          {/* Text */}
          <View style={{ flex: 1 }}>
            <Text style={styles.animal}>{r.animalType}</Text>
            <Text style={styles.line}>Condition: {r.condition}</Text>
            <Text style={styles.line}>Address: {r.address}</Text>

            <View style={{ marginTop: 6 }}>
              <StatusChip status={r.status} />
            </View>
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={22} color="#6B7280" />
        </TouchableOpacity>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statCardYellow: {
    backgroundColor: "#fff",
    borderRadius: 14,
    flex: 1,
    padding: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#FCD34D"
  },
  statCardGreen: {
    backgroundColor: "#fff",
    borderRadius: 14,
    flex: 1,
    padding: 18,
    borderWidth: 1,
    borderColor: "#86efac"
  },
  statLabel: { fontSize: 14, color: "#6B7280" },
  statValue: { fontSize: 28, fontWeight: "800" },

  actionBlue: {
    backgroundColor: "#1E3A8A",
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginRight: 10
  },
  actionGreen: {
    backgroundColor: "#059669",
    flex: 1,
    padding: 16,
    borderRadius: 12
  },
  actionText: { color: "#fff", fontWeight: "700" },

  /* NEW CARD STYLING */
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FBBF24",
    marginBottom: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: "#f3f4f6",
  },
  animal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  line: {
    color: "#6B7280",
    marginTop: 2,
  },
});
