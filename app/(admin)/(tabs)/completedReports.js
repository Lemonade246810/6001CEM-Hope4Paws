import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../config/firebaseConfig";

export default function CompletedReports() {
  const [completed, setCompleted] = useState([]);
  const router = useRouter();

  const refs = useMemo(
    () => ({
      reportsCol: collection(db, "AnimalReports"),
    }),
    []
  );

  // Load Completed reports LIVE
  useEffect(() => {
    const q = query(
      refs.reportsCol,
      where("status", "==", "Completed"),
      orderBy("completedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setCompleted(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [refs]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/ (admin)/completedReports/${item.id}`)}
    >
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/80" }}
        style={styles.photo}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.animalType}</Text>
        <Text style={styles.line}>Condition: {item.condition}</Text>
        <Text style={styles.line}>Address: {item.address}</Text>

        <Text style={styles.completed}>
          ✅ Completed:{" "}
          {item.completedAt?.toDate
            ? item.completedAt.toDate().toLocaleString()
            : "Unknown"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>✅ Completed Reports</Text>

      {completed.length === 0 ? (
        <Text style={styles.empty}>No completed reports yet.</Text>
      ) : (
        <FlatList
          data={completed}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: "#FFF7ED" },

  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12,
  },

  empty: { textAlign: "center", marginTop: 20, color: "#6B7280" },

  card: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  photo: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  line: {
    color: "#374151",
    marginTop: 3,
  },

  completed: {
    marginTop: 8,
    color: "#059669",
    fontWeight: "700",
  },
});
