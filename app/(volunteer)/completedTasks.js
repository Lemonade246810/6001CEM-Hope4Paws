import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useRouter } from "expo-router";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/authContext";

import {
    collection,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";

export default function CompletedTasks() {
  const { user } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!user?.userId) return;

    const q = query(
      collection(db, "AnimalReports"),
      where("assignedVolunteerId", "==", user.userId),
      where("status", "==", "Completed")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReports(list);
    });

    return unsub;
  }, [user?.userId]);

  return (
    <View style={styles.screen}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Completed Tasks</Text>

      {reports.length === 0 ? (
        <Text style={styles.empty}>You have no completed tasks yet.</Text>
      ) : (
        <ScrollView>
          {reports.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.card}
              onPress={() => router.push(`/(volunteer)/report/${r.id}`)}
            >
              <Text style={styles.title}>{r.animalType || "Animal"}</Text>
              <Text style={styles.line}>Condition: {r.condition || "-"}</Text>
              <Text style={styles.line}>Address: {r.address || "-"}</Text>
              {r.completedAt?.toDate && (
                <Text style={styles.completedAt}>
                  Completed: {r.completedAt.toDate().toLocaleString()}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    padding: 16,
  },
  backBtn: {
    paddingVertical: 4,
    width: 70,
    marginBottom: 6,
  },
  backText: {
    fontSize: 16,
    color: "#1E3A8A",
    fontWeight: "600",
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  empty: {
    marginTop: 24,
    textAlign: "center",
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#4ADE80",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  line: {
    marginTop: 4,
    color: "#374151",
  },
  completedAt: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
  },
});