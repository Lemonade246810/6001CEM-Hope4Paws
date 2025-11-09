import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
    updateEmail,
    updatePassword
} from "firebase/auth";
import {
    doc,
    updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db, storage } from "../../config/firebaseConfig";
import { useAuth } from "../../context/authContext";

export default function EditProfile() {
  const router = useRouter();
  const { user } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [uploading, setUploading] = useState(false);

  // ✅ Pick Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // ✅ Upload Image to Firebase Storage
  const uploadProfileImage = async () => {
    if (!profileImage || profileImage === user?.profileImage) return user?.profileImage;

    const response = await fetch(profileImage);
    const blob = await response.blob();

    const storageRef = ref(storage, `profileImages/${user.userId}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);

    return downloadUrl;
  };

  // ✅ Save Changes
  const saveChanges = async () => {
    try {
      setUploading(true);

      const userRef = doc(db, "users", user.userId);

      let uploadedImage = await uploadProfileImage();

      const updates = {
        username,
        phone,
        email,
        profileImage: uploadedImage,
      };

      await updateDoc(userRef, updates);

      // ✅ Update Auth email
      if (email !== user.email) {
        await updateEmail(auth.currentUser, email);
      }

      // ✅ Update password
      if (password.trim() !== "") {
        await updatePassword(auth.currentUser, password);
      }

      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (err) {
      Alert.alert("Error updating profile", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Profile Photo */}
      <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
        <Image
          source={{
            uri:
              profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      {/* Input Fields */}
      <View style={styles.card}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Leave blank to keep current password"
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>

      {uploading && (
        <ActivityIndicator
          size="large"
          color="#1E3A8A"
          style={{ marginTop: 20 }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8F8F8", flex: 1 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
  avatarWrapper: { alignItems: "center", marginBottom: 25 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#facc15",
  },
  changePhotoText: {
    marginTop: 10,
    color: "#1E40AF",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },
  inputWrapper: { marginBottom: 18 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  saveBtn: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  saveBtnText: { color: "#fff", fontSize: 18, textAlign: "center" },
});
