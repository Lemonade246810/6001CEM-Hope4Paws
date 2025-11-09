import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../../config/firebaseConfig";

export default function Profile() {
  const router = useRouter();
  const user = auth.currentUser;

  const [adoptedPets, setAdoptedPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);

  // Fetch Adopted Pets
  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, "UserPets"),
      where("userEmail", "==", user.email)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAdoptedPets(list);
      setLoadingPets(false);
    });

    return () => unsub();
  }, []);

  // Logout
  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/signIn");
  };

  // Share adoption story
  const handleShareToCommunity = (pet) => {
    Alert.alert(
      "Share to Community?",
      `Would you like to share your adoption story about ${pet.petName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: () =>
            router.push({
              pathname: "/community/ShareStory",
              params: {
                petImage: pet.imageUrl,
                prefillCaption: `I adopted ${pet.petName}! ❤️`,
              },
            }),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              user?.profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{user?.username || "User"}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        {/* Edit + Logout */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("/(app)/editProfile")}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Adoption Status */}
      <TouchableOpacity
        style={styles.adoptionStatusBtn}
        onPress={() => router.push("/(app)/adoptionStatus")}
      >
        <Text style={styles.adoptionStatusText}>My Adoption Status</Text>
      </TouchableOpacity>

      {/* Adopted Pets */}
      <Text style={styles.sectionTitle}>My Adopted Pets</Text>

      {adoptedPets.length === 0 ? (
        <Text style={{ color: "#777" }}>You have not adopted any pets yet.</Text>
      ) : (
        adoptedPets.map((pet) => {
          const adoptionDate = pet.adoptedAt?.seconds
            ? new Date(pet.adoptedAt.seconds * 1000).toDateString()
            : null;

          return (
            <TouchableOpacity
              key={pet.id}
              onLongPress={() => handleShareToCommunity(pet)}
              style={styles.petCard}
            >
              <Image source={{ uri: pet.imageUrl }} style={styles.petImage} />
              <Text style={styles.petName}>{pet.petName}</Text>

              <Text style={styles.petDate}>
                {adoptionDate ? `Adopted on ${adoptionDate}` : "Adoption date unavailable"}
              </Text>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8F8F8", flex: 1 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
  profileCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: "#facc15",
  },
  name: { fontSize: 22, fontWeight: "700", marginTop: 10 },
  email: { color: "#555", marginBottom: 10 },
  editBtn: {
    marginTop: 10,
    backgroundColor: "#1E40AF",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  editBtnText: { color: "white", fontWeight: "600" },
  logoutBtn: {
    marginTop: 10,
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  logoutText: { color: "white", fontWeight: "600" },
  adoptionStatusBtn: {
    marginTop: 25,
    backgroundColor: "#1E3A8A",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  adoptionStatusText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sectionTitle: { fontSize: 22, fontWeight: "700", marginTop: 25 },
  petCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginTop: 15,
    elevation: 3,
  },
  petImage: { width: "100%", height: 150, borderRadius: 10 },
  petName: { fontSize: 18, fontWeight: "700", marginTop: 10 },
  petDate: { color: "#777", fontSize: 12 },
});
