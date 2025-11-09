import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../context/authContext";
import { useVolunteerAlerts } from "../../../hooks/useVolunteerAlerts";

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // Real-time alert listener
  useVolunteerAlerts(user?.userId);

  const [assignedReports, setAssignedReports] = useState([]);

  // Live Assigned Reports List
  useEffect(() => {
    if (!user?.userId) return;

    const q = query(
      collection(db, "AnimalReports"),
      where("assignedTo", "==", user.userId),
      where("status", "==", "Assigned")
    );

    const unsub = onSnapshot(q, (snap) => {
      setAssignedReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [user?.userId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF7ED" }}>
      {/* Remove header — now handled by (volunteer)/_layout.js */}

      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 15 }}>
          ✅ Assigned Tasks
        </Text>

        {assignedReports.length === 0 && (
          <Text style={{ color: "#6B7280" }}>
            No tasks assigned to you yet.
          </Text>
        )}

        {assignedReports.map((r) => (
          <TouchableOpacity
            key={r.id}
            onPress={() =>
              router.push(`/(volunteer)/reportDetails/${r.id}`)
            }
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 12,
              borderColor: "#FBBF24",
              borderWidth: 1,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              {r.animalType}
            </Text>
            <Text style={{ color: "#6B7280" }}>Condition: {r.condition}</Text>
            <Text style={{ color: "#6B7280" }}>Address: {r.address}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
