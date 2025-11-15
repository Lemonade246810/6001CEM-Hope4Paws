import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
    collection,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import {
    getDownloadURL,
    ref,
    uploadBytes,
} from "firebase/storage";
import { useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db, storage } from "../../config/firebaseConfig";
import { useAuth } from "../../context/authContext";

export default function EditProfile() {
  const { user, setUserData } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [imageUri, setImageUri] = useState(user?.profileImage || null);
  const [uploading, setUploading] = useState(false);

  // Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Convert URI to blob
  const uriToBlob = async (uri) => {
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error("Blob conversion failed"));
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Invalid", "Username cannot be empty.");
      return;
    }

    try {
      setUploading(true);

      let uploadedImageUrl = user?.profileImage;

      // Upload new image if changed
      if (imageUri && imageUri !== user.profileImage) {
        const blob = await uriToBlob(imageUri);
        const fileRef = ref(storage, `profile/${user.userId}_${Date.now()}.jpg`);

        await uploadBytes(fileRef, blob, { contentType: "image/jpeg" });
        uploadedImageUrl = await getDownloadURL(fileRef);
      }

      // Update Firestore user document
      await updateDoc(doc(db, "users", user.userId), {
        username,
        profileImage: uploadedImageUrl,
      });

      // Update AnimalReports assigned to this volunteer
      const q = query(
        collection(db, "AnimalReports"),
        where("assignedVolunteerId", "==", user.userId)
      );
      const snap = await getDocs(q);

      const updates = snap.docs.map((d) =>
        updateDoc(doc(db, "AnimalReports", d.id), {
          assignedVolunteerName: username,
        })
      );

      await Promise.all(updates);

      // Update context (sync UI instantly)
      setUserData({
        ...user,
        username,
        profileImage: uploadedImageUrl,
      });

      Alert.alert("Success", "Profile updated successfully.");
      router.back();

    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Edit Profile</Text>

      {/* Image Picker */}
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{
            uri:
              imageUri ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TouchableOpacity
        style={[styles.saveButton, uploading && { opacity: 0.6 }]}
        disabled={uploading}
        onPress={handleSave}
      >
        <Text style={styles.saveText}>
          {uploading ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    padding: 20,
  },

  backBtn: {
    marginBottom: 10,
    paddingVertical: 4,
    width: 70,
  },

  backText: {
    fontSize: 16,
    color: "#1E3A8A",
    fontWeight: "600",
  },

  header: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
    color: "#1E293B",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 20,
    color: "#000",
  },

  saveButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});
