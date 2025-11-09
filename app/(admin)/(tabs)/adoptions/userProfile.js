import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
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
import { db } from "../../../../config/firebaseConfig";

export default function UserProfile() {
  const { email, name } = useLocalSearchParams();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserPets = async () => {
      try {
        const q = query(
          collection(db, "UserPets"),
          where("userEmail", "==", email)
        );

        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

        setPets(list);
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    loadUserPets();
  }, []);

  if (loading)
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      {/* User Info */}
      <View style={styles.profileCard}>
        <Ionicons name="person-circle" size={80} color="#1E40AF" />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Adopted Pets</Text>

      {pets.length === 0 && (
        <Text style={styles.noPets}>No adopted pets found.</Text>
      )}

      {pets.map((p) => (
        <View key={p.id} style={styles.petCard}>
          <Image
            source={{ uri: p.imageUrl }}
            style={styles.petImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.petName}>{p.petName}</Text>
            <Text style={styles.petInfo}>
              Species: {p.species} • Gender: {p.gender}
            </Text>
            <Text style={styles.petInfo}>Adopted on: {p.adoptedDate?.toDate?.().toDateString()}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#FFF7ED", flex: 1 },

  backBtn: {
    marginBottom: 10,
  },

  profileCard: {
    backgroundColor: "#E0E7FF",
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },

  name: { fontSize: 22, fontWeight: "700", marginTop: 10 },
  email: { fontSize: 16, color: "#555" },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 10,
  },

  noPets: { textAlign: "center", color: "#777", fontSize: 16 },

  petCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FCD9B6",
  },

  petImage: { width: 85, height: 85, borderRadius: 10, marginRight: 12 },

  petName: { fontSize: 18, fontWeight: "bold" },
  petInfo: { color: "#666", marginTop: 4 },
});
