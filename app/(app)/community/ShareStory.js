import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db, storage } from "../../../config/firebaseConfig";

export default function ShareStory() {
  const user = auth.currentUser;
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.prefillCaption) setCaption(params.prefillCaption);
    if (params.petImage) setImage(params.petImage);
  }, [params]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadStory = async () => {
    if (!caption.trim()) {
      Alert.alert("Write something", "Please add a caption for your story.");
      return;
    }

    setUploading(true);

    try {
      // get Firestore user document
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert("Error", "User profile not found in Firestore.");
        return;
      }

      const userData = userSnap.data();

      let uploadedImageUrl = null;

      // Upload image if exists
      if (image) {
        const imageRef = ref(storage, `community/${Date.now()}.jpg`);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        uploadedImageUrl = await getDownloadURL(imageRef);
      }

      // Add new community post WITH username & avatar
      await addDoc(collection(db, "CommunityPosts"), {
        userId: user.uid,
        userEmail: user.email,
        username: userData.username,
        userProfile: userData.profileImage,
        storyText: caption,
        imageUrl: uploadedImageUrl,
        likes: [],
        createdAt: serverTimestamp(),
      });

      Alert.alert("Posted!", "Your story has been shared.");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to post your story.");
    }

    setUploading(false);
  };


  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Share Your Story</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <Text style={styles.pickText}>Tap to choose an image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Write your story here..."
        style={styles.input}
        multiline
        value={caption}
        onChangeText={setCaption}
      />

      <TouchableOpacity
        style={styles.postButton}
        onPress={uploadStory}
        disabled={uploading}
      >
        <Text style={styles.postText}>
          {uploading ? "Posting..." : "Post Story"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 20, padding: 16, backgroundColor: "#fff", flex: 1 },
  back: { color: "#1E3A8A", marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  imagePicker: {
    height: 180,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  preview: { width: "100%", height: "100%", borderRadius: 10 },
  pickText: { color: "#6B7280" },
  input: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    height: 120,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: "#1E3A8A",
    padding: 14,
    alignItems: "center",
    borderRadius: 10,
  },
  postText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
