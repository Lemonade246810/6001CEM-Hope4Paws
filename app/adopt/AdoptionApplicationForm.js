import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../config/firebaseConfig";

export default function AdoptionApplicationForm() {
  const { petId } = useLocalSearchParams();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // ✅ Fetch Pet Data
  useEffect(() => {
    const fetchPet = async () => {
      try {
        if (!petId) return;

        const docRef = doc(db, "Animals", petId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPet({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching pet:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [petId]);

  // ✅ Submit Form
  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "AdoptionApplications"), {
        ...form,
        petId: petId,
        petName: pet?.name,
        petShelter: pet?.shelter,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        "Application Submitted",
        `Your adoption request for ${pet?.name} has been successfully sent.`,
        [{ text: "OK", onPress: () => router.push("/adopt") }]
      );
    } catch (error) {
      console.error("Error submitting adoption form:", error);
      Alert.alert("Error", "Failed to submit application. Please try again.");
    }
  };

  if (loading) return <Text style={{ margin: 20 }}>Loading...</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ✅ BACK BUTTON */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* ✅ Pet Header */}
        {pet && (
          <View style={styles.petHeader}>
            <Image source={{ uri: pet.imageUrl }} style={styles.image} />

            <View>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petDetails}>
                {pet.species} • {pet.gender}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.title}>Adoption Application</Text>

        {/* ✅ Form Fields */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="012-3456789"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
        />

        <Text style={styles.label}>Why do you want to adopt?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Share your reason..."
          value={form.message}
          onChangeText={(t) => setForm({ ...form, message: t })}
        />

        {/* ✅ Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Application</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

//
// ✅ STYLES
//
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  // ✅ Back Button
  backButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: "#1E3A8A",
  },

  // ✅ Pet Section
  petHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 15,
  },
  petName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  petDetails: {
    color: "#777",
    marginTop: 3,
  },

  // ✅ Form
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 15,
    marginTop: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },

  // ✅ Submit Button
  submitButton: {
    backgroundColor: "#1E3A8A",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
