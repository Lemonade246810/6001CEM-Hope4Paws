import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../../config/firebaseConfig";

export default function AdminAdoptionView() {
  const { appId } = useLocalSearchParams();
  const [app, setApp] = useState(null);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!appId) return;

      const appRef = doc(db, "AdoptionApplications", appId);
      const appSnap = await getDoc(appRef);
      if (!appSnap.exists()) return;

      const appData = { id: appSnap.id, ...appSnap.data() };
      setApp(appData);

      if (appData.petId) {
        const petSnap = await getDoc(doc(db, "Animals", appData.petId));
        if (petSnap.exists()) setPet(petSnap.data());
      }

      setLoading(false);
    };

    load();
  }, [appId]);

  const approveAdoption = async () => {
    if (!app?.id || !pet) return;
    try {
      await updateDoc(doc(db, "AdoptionApplications", app.id), {
        status: "Approved",
        approvedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "Animals", app.petId), {
        status: "Unavailable",
      });

      await setDoc(doc(db, "UserPets", app.email + "_" + app.petId), {
        userEmail: app.email,
        userName: app.name,
        petId: app.petId,
        petName: pet.name,
        species: pet.species,
        gender: pet.gender,
        imageUrl: pet.imageUrl,
        adoptedDate: serverTimestamp(),
      });

      Alert.alert("Success", "Adoption Approved!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to approve adoption.");
    }
  };

  const rejectAdoption = async () => {
    if (!app?.id) return;
    await updateDoc(doc(db, "AdoptionApplications", app.id), {
      status: "Rejected",
    });

    Alert.alert("Rejected", "Application rejected.");
    router.back();
  };

  if (loading)
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  if (!app) {
    return (
      <Text style={{ marginTop: 40, textAlign: "center", fontSize: 18 }}>
        Application not found.
      </Text>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Adoption Application</Text>

      {/* ✅ Clickable Image → Full Screen */}
      <TouchableOpacity
        style={styles.imageWrapper}
        onPress={() =>
          router.push({
            pathname: "/(admin)/(tabs)/adoptions/fullscreen",
            params: { image: pet?.imageUrl },
          })
        }
      >
        <Image
          source={{
            uri: pet?.imageUrl || "https://via.placeholder.com/400?text=No+Image",
          }}
          style={styles.petImage}
        />
      </TouchableOpacity>

      {/* ✅ Pet Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pet Information</Text>
        <Text style={styles.info}>Name: {pet?.name}</Text>
        <Text style={styles.info}>Species: {pet?.species}</Text>
        <Text style={styles.info}>Breed: {pet?.breed || "Unknown"}</Text>
        <Text style={styles.info}>Gender: {pet?.gender}</Text>
        <Text style={styles.info}>Age: {pet?.age}</Text>
        <Text style={styles.info}>Condition: {pet?.condition}</Text>
        <Text style={styles.info}>Location: {pet?.location}</Text>
        <Text style={styles.info}>
          Vaccinated: {pet?.vaccinated ? "Yes ✅" : "No ❌"}
        </Text>
      </View>

      {/* ✅ Applicant Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Applicant Information</Text>
        <Text style={styles.info}>Name: {app.name}</Text>
        <Text style={styles.info}>Email: {app.email}</Text>
        <Text style={styles.info}>Phone: {app.phone}</Text>
      </View>

      {/* ✅ Message */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Message</Text>
        <Text style={styles.info}>{app.message}</Text>
      </View>

      {/* ✅ Buttons */}
      <TouchableOpacity
        style={[styles.btn, styles.approve]}
        onPress={approveAdoption}
      >
        <Text style={styles.btnText}>✅ Approve</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.reject]}
        onPress={rejectAdoption}
      >
        <Text style={styles.btnText}>❌ Reject</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#3B82F6" }]}
        onPress={() =>
          router.push({
            pathname: "/(admin)/(tabs)/adoptions/userProfile",
            params: { email: app.email, name: app.name },
          })
        }
      >
        <Text style={styles.btnText}>👤 View User Profile</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },

  imageWrapper: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f3f3f3",
    marginBottom: 20,
  },
  petImage: { width: "100%", height: "100%", resizeMode: "cover" },

  card: {
    backgroundColor: "#FFF4E6",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#FFD6A5",
  },

  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },

  info: { fontSize: 16, color: "#444", marginBottom: 4 },

  btn: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  approve: { backgroundColor: "#16A34A" },
  reject: { backgroundColor: "#DC2626" },

  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
