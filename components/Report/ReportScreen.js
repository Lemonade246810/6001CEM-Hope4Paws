import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useState } from "react";
import { db, storage } from "../../config/firebaseConfig";


// CASE NUMBER GENERATOR
async function generateCaseNumber(db) {
  const counterRef = doc(db, "AppMeta", "ReportCounter");

  return await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef);

    if (!snapshot.exists()) {
      throw new Error("Counter document does not exist!");
    }

    let lastNumber = snapshot.data().lastNumber || 0;
    const newNumber = lastNumber + 1;

    transaction.update(counterRef, { lastNumber: newNumber });

    const year = new Date().getFullYear();
    const padded = String(newNumber).padStart(5, "0");

    return `H4P-${year}-${padded}`;
  });
}

// Converts local file URI → Blob (compatible with Firebase Storage)
async function uriToBlob(uri) {
  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new Error("uriToBlob failed"));
    };

    xhr.responseType = "blob"; 
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

// UPLOAD IMAGE TO FIREBASE STORAGE (Expo-Compatible)
async function uploadImageAsync(uri) {
  // Convert URI to blob using XMLHttpRequest (Expo compatible)
  const blob = await uriToBlob(uri);

  // Prepare Firebase Storage path
  const fileRef = ref(storage, `reports/${Date.now()}.jpg`);

  // Upload blob
  await uploadBytes(fileRef, blob, {
    contentType: "image/jpeg",
  });

  // Get download URL
  return await getDownloadURL(fileRef);
}

export default function ReportScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [form, setForm] = useState({
    animalType: "",
    condition: "",
    description: "",
  });
  const [uploading, setUploading] = useState(false);



  // PICK IMAGE
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Universal safe option
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        console.log("📸 Selected image URI:", uri);
        setImageUri(uri);
      }
    } catch (error) {
      console.error("❌ Image Picker Error:", error);
      Alert.alert("Error", "Failed to select an image.");
    }
  };




  // GET LOCATION
  const handleUseLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const reverse = await Location.reverseGeocodeAsync(loc.coords);

    const address = `${reverse[0].name || ""}, ${reverse[0].city || ""}`;

    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      address,
    });
  };



  // SUBMIT REPORT
  const handleSubmit = async () => {
    try {
      if (
        !form.animalType ||
        !form.condition ||
        !form.description ||
        !imageUri ||
        !location
      ) {
        Alert.alert("Incomplete", "Please fill all fields and upload a photo.");
        return;
      }

      setUploading(true);

      // Generate Case Number
      const caseNumber = await generateCaseNumber(db);
      console.log("Generated case number:", caseNumber);

      // Upload image to Firebase Storage
      const downloadURL = await uploadImageAsync(imageUri);

      // Save Firestore document
      await addDoc(collection(db, "AnimalReports"), {
        caseNumber,
        ...form,

        photoUrl: downloadURL,

        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,

        status: "Pending",
        assignedTo: null,
        assignedAt: null,

        timestamp: serverTimestamp(),
      });

      Alert.alert("✅ Report Submitted", "Thank you for helping the animals!");

      // Reset fields
      setForm({ animalType: "", condition: "", description: "" });
      setImageUri(null);
      setLocation(null);

    } catch (err) {
      console.error("❌ Error submitting report:", err);
      Alert.alert("Upload Error", err.message);
    } finally {
      setUploading(false);
    }
  };



  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Report Injured or Stray Animal</Text>

      {/* IMAGE PICKER */}
      <TouchableOpacity style={styles.photoBox} onPress={handlePickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.uploadText}>📷 Tap to upload a photo</Text>
        )}
      </TouchableOpacity>

      {/* LOCATION */}
      <TouchableOpacity style={styles.locButton} onPress={handleUseLocation}>
        <Text style={styles.locButtonText}>
          {location ? `📍 ${location.address}` : "Use My Location"}
        </Text>
      </TouchableOpacity>

      {/* MAP PREVIEW */}
      {location && (
        <View style={{ marginBottom: 15 }}>
          <Text>Location: {location.address}</Text>
        </View>
      )}

      {/* INPUT FIELDS */}
      <TextInput
        placeholder="Animal Type (Dog, Cat, Bird...)"
        style={styles.input}
        value={form.animalType}
        onChangeText={(t) => setForm({ ...form, animalType: t })}
      />
      <TextInput
        placeholder="Condition (Injured, Stray, Lost...)"
        style={styles.input}
        value={form.condition}
        onChangeText={(t) => setForm({ ...form, condition: t })}
      />
      <TextInput
        placeholder="Description"
        placeholderTextColor="#555"
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        multiline
        value={form.description}
        onChangeText={(t) => setForm({ ...form, description: t })}
      />

      {/* SUBMIT BUTTON */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          uploading && { backgroundColor: "#999" },
        ]}
        onPress={handleSubmit}
        disabled={uploading}
      >
        <Text style={styles.submitButtonText}>
          {uploading ? "Submitting..." : "🚨 Submit Report"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 15,
  },
  photoBox: {
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 10,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  photoPreview: { width: "100%", height: "100%", borderRadius: 10 },
  uploadText: { color: "#888" },
  locButton: {
    backgroundColor: "#1E3A8A",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  locButtonText: { color: "#fff", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#E63946",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
