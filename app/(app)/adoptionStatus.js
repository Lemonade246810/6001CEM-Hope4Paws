import { router } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../config/firebaseConfig";

export default function AdoptionStatus() {
  const user = auth.currentUser;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    setLoading(true);

    try {
      // ✅ Main Query (requires index)
      const q = query(
        collection(db, "AdoptionApplications"),
        where("email", "==", user.email),
        orderBy("createdAt", "desc")
      );

      // ✅ Real-time listener
      const unsub = onSnapshot(
        q,
        async (snapshot) => {
          const results = [];

          for (const docSnap of snapshot.docs) {
            const app = { id: docSnap.id, ...docSnap.data() };

            // ✅ Fetch pet image
            let petImage = null;
            if (app.petId) {
              const petRef = doc(db, "Animals", app.petId);
              const petSnap = await getDoc(petRef);
              petImage = petSnap.exists() ? petSnap.data().imageUrl : null;
            }

            results.push({
              ...app,
              petImage: petImage || "https://placekitten.com/300",
            });
          }

          setApplications(results);
          setLoading(false);
        },

        // ✅ ERROR HANDLING
        async (error) => {
          console.error("Firestore Error:", error);

          // ✅ If index missing → use fallback
          if (error.code === "failed-precondition") {
            console.warn(
              "⚠️ Missing Firestore index. Falling back to no-orderBy query."
            );

            const fallbackQ = query(
              collection(db, "AdoptionApplications"),
              where("email", "==", user.email)
            );

            onSnapshot(fallbackQ, async (snap2) => {
              const results = [];

              for (const docSnap of snap2.docs) {
                const app = { id: docSnap.id, ...docSnap.data() };

                let petImage = null;
                if (app.petId) {
                  const petRef = doc(db, "Animals", app.petId);
                  const petSnap = await getDoc(petRef);
                  petImage = petSnap.exists()
                    ? petSnap.data().imageUrl
                    : null;
                }

                results.push({
                  ...app,
                  petImage: petImage || "https://placekitten.com/300",
                });
              }

              setApplications(results);
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        }
      );

      return () => unsub();
    } catch (err) {
      console.error("Query failed:", err);
      setLoading(false);
    }
  }, [user]);

  // ✅ Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  // ✅ No applications
  if (applications.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>You have no adoption applications.</Text>
      </View>
    );
  }

  // ✅ Display applications
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.container}>

        {/* ✅ BACK BUTTON (now clickable) */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}  // larger tap area
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {applications.map((app) => (
          <View key={app.id} style={styles.card}>
            <Image source={{ uri: app.petImage }} style={styles.petImage} />

            <Text style={styles.petName}>{app.petName}</Text>

            <Text style={styles.statusLabel}>
              Status:{" "}
              <Text
                style={{
                  color:
                    app.status === "Approved"
                      ? "green"
                      : app.status === "Rejected"
                      ? "red"
                      : "orange",
                  fontWeight: "bold",
                }}
              >
                {app.status}
              </Text>
            </Text>

            <Text style={styles.dateText}>
              Sent at:{" "}
              {app.createdAt?.toDate
                ? app.createdAt.toDate().toLocaleString()
                : "Unknown"}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

}

//
// ✅ STYLES
//
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { fontSize: 18, color: "#555" },
  card: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  petImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  backButton: {
    marginTop: 10, 
    marginBottom: 15,
    marginTop: 5,
  },

  backText: {
    fontSize: 16,
    color: "#1E3A8A",
    fontWeight: "600",
  },
  statusLabel: { marginTop: 5, fontSize: 16 },
  dateText: { marginTop: 5, color: "#444" },
});
