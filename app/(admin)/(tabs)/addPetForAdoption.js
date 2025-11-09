import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { db, storage } from "../../../config/firebaseConfig";

export default function AddPetForAdoption() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Pet Details
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [health, setHealth] = useState("");
  const [story, setStory] = useState("");
  const [shelter, setShelter] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [adoptionFee, setAdoptionFee] = useState("");
  const [deposit, setDeposit] = useState("");
  const [isSpayedOrNeutered, setIsSpayedOrNeutered] = useState("");

  // ✅ Pick Image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ✅ Upload image to Firebase Storage
  const uploadImage = async () => {
    if (!image) return null;

    setUploading(true);

    const imageName = `pet_${Date.now()}.jpg`;
    const storageRef = ref(storage, `pets/${imageName}`);

    const response = await fetch(image);
    const blob = await response.blob();

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    setUploading(false);

    return downloadURL;
  };

  // ✅ Submit to Firestore
  const handleSubmit = async () => {
    if (!name || !species || !breed || !gender || !shelter) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    try {
      const imageUrl = await uploadImage();

      await addDoc(collection(db, "Animals"), {
        name,
        species,
        breed,
        gender,
        health,
        story,
        shelter,
        admissionDate: new Date(admissionDate),
        birthDate: new Date(birthDate),
        adoptionFee: Number(adoptionFee),
        deposit: Number(deposit),
        isSpayedOrNeutered: isSpayedOrNeutered === "yes",
        status: "Available",
        imageUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert("✅ Success", "Pet added to adoption list!");

      // Reset
      setImage(null);
      setName("");
      setSpecies("");
      setBreed("");
      setGender("");
      setHealth("");
      setAdmissionDate("");
      setBirthDate("");
      setStory("");
      setShelter("");
      setAdoptionFee("");
      setDeposit("");
      setIsSpayedOrNeutered("");

    } catch (error) {
      console.log("Error adding pet:", error);
      Alert.alert("Error", "Failed to add pet.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add New Pet for Adoption</Text>

      {/* ✅ Image Picker */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>📸 Tap to upload pet photo</Text>
        )}
      </TouchableOpacity>

      {/* ✅ Form Fields */}
      <TextInput placeholder="Name *" placeholderTextColor="#4B5563" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Species (Dog, Cat...) *" placeholderTextColor="#4B5563" style={styles.input} value={species} onChangeText={setSpecies} />
      <TextInput placeholder="Breed *" placeholderTextColor="#4B5563" style={styles.input} value={breed} onChangeText={setBreed} />
      <TextInput placeholder="Gender *" placeholderTextColor="#4B5563" style={styles.input} value={gender} onChangeText={setGender} />
      <TextInput placeholder="Health Notes" placeholderTextColor="#4B5563" style={styles.input} value={health} onChangeText={setHealth} />
      <TextInput placeholder="Story / Background" placeholderTextColor="#4B5563" style={styles.inputLong} value={story} onChangeText={setStory} multiline />

      <TextInput placeholder="Shelter Name *" placeholderTextColor="#4B5563" style={styles.input} value={shelter} onChangeText={setShelter} />
      <TextInput placeholder="Admission Date (YYYY-MM-DD)" placeholderTextColor="#4B5563" style={styles.input} value={admissionDate} onChangeText={setAdmissionDate} />
      <TextInput placeholder="Birth Date (YYYY-MM-DD)" placeholderTextColor="#4B5563" style={styles.input} value={birthDate} onChangeText={setBirthDate} />

      <TextInput placeholder="Adoption Fee" keyboardType="numeric" placeholderTextColor="#4B5563" style={styles.input} value={adoptionFee} onChangeText={setAdoptionFee} />
      <TextInput placeholder="Deposit" keyboardType="numeric" placeholderTextColor="#4B5563" style={styles.input} value={deposit} onChangeText={setDeposit} />
      <TextInput placeholder="Is Spayed/Neutered? (yes/no)" placeholderTextColor="#4B5563" style={styles.input}
        value={isSpayedOrNeutered} onChangeText={setIsSpayedOrNeutered} />

      {/* ✅ Submit Button */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={uploading}
      >
        <Text style={styles.submitText}>{uploading ? "Uploading..." : "Add Pet"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED", padding: 16 },
  header: { fontSize: 22, fontWeight: "800", color: "#1E293B", marginBottom: 16 },

  imageBox: {
    height: 200,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    marginBottom: 14,
  },

  image: { width: "100%", height: "100%", borderRadius: 14 },

  imagePlaceholder: { color: "#6B7280", fontSize: 16 },

  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  inputLong: {
    height: 100,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    textAlignVertical: "top",
  },

  submitBtn: {
    backgroundColor: "#f59e0b",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  submitText: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
  },
});
