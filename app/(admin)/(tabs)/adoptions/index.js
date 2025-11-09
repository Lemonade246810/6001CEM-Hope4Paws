import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../../../config/firebaseConfig";

export default function AdminAdoptionList() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, "AdoptionApplications"), where("status", "==", "Pending"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setApps(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Adoption Applications</Text>

      {apps.length === 0 && <Text>No pending applications.</Text>}

      {apps.map((app) => (
        <TouchableOpacity
          key={app.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/(admin)/adoptions/view",
              params: { appId: app.id },
            })
          }
        >
          <Text style={styles.petName}>{app.petName}</Text>
          <Text style={styles.info}>{app.name}</Text>
          <Text style={styles.info}>Status: {app.status}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  petName: { fontSize: 18, fontWeight: "bold" },
  info: { color: "#555" },
});
