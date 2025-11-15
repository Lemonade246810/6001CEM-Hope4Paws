import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StatusChip from "../../../components/StatusChip";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../context/authContext";

export default function AssignedReports() {
  const { user } = useAuth();
  const router = useRouter();
  const [assignedReports, setAssignedReports] = useState([]);

  useEffect(() => {
    if (!user?.userId) return;

    const q = query(
      collection(db, "AnimalReports"),
      where("assignedVolunteerId", "==", user.userId),
      where("status", "==", "Assigned")
    );

    const unsub = onSnapshot(q, snap =>
      setAssignedReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return unsub;
  }, [user?.userId]);

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#FFF7ED" }}>

      {/* Header */}
      <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 20 }}>
        📋 Assigned Reports
      </Text>

      {/* No reports */}
      {assignedReports.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 50, color: "#6B7280" }}>
          You have no assigned reports.
        </Text>
      )}

      {/* Report Cards */}
      {assignedReports.map(r => (
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

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{r.animalType}</Text>

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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  line: {
    color: "#6B7280",
    marginTop: 2,
  },
});
