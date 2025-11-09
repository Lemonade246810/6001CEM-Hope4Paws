import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import {
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db, storage } from "../../../../config/firebaseConfig";

export default function EditStory() {
  const { postId } = useLocalSearchParams();

  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, [postId]);

  const loadStory = async () => {
    try {
      const refDoc = doc(db, "CommunityPosts", postId);
      const snap = await getDoc(refDoc);

      if (snap.exists()) {
        const story = snap.data();
        setCaption(story.storyText);
        setImage(story.imageUrl);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error loading story");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.9,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveChanges = async () => {
    try {
      let imageUrl = image;

      // Upload new image if changed
      if (image && !image.startsWith("http")) {
        const imageRef = ref(storage, `community/${Date.now()}.jpg`);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        imageUrl = await getDownloadURL(imageRef);
      }

      await updateDoc(doc(db, "CommunityPosts", postId), {
        storyText: caption,
        imageUrl,
      });

      Alert.alert("Updated!", "Your story has been updated.");
      router.back();
    } catch (err) {
      console.log(err);
      Alert.alert("Failed to update story");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* BACK BUTTON */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Edit Story</Text>

      {/* IMAGE */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <Text style={styles.pickText}>Tap to select an image</Text>
        )}
      </TouchableOpacity>

      {/* CAPTION */}
      <TextInput
        style={styles.input}
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      {/* SAVE BUTTON */}
      <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  back: { color: "#1E3A8A", marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  imagePicker: {
    height: 200,
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
  },
  saveButton: {
    backgroundColor: "#1E3A8A",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
