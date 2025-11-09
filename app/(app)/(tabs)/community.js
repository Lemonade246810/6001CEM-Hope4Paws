import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import moment from "moment";
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

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const user = auth.currentUser;

  // FETCH POSTS LIVE
  useEffect(() => {
    const q = query(
      collection(db, "CommunityPosts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPosts(list);
    });

    return unsubscribe;
  }, []);

  // DELETE STORY
  const deleteStory = (postId) => {
    Alert.alert(
      "Delete Story",
      "Are you sure you want to delete this story?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "CommunityPosts", postId));
              Alert.alert("Deleted", "Your story has been removed.");
            } catch (error) {
              console.log(error);
              Alert.alert("Error", "Failed to delete the story.");
            }
          },
        },
      ]
    );
  };

  // LIKE / UNLIKE
  const toggleLike = async (postId, currentLikes) => {
    const userId = user?.uid;
    if (!userId) return;

    const postRef = doc(db, "CommunityPosts", postId);
    const updatedLikes = currentLikes.includes(userId)
      ? currentLikes.filter((id) => id !== userId)
      : [...currentLikes, userId];

    await updateDoc(postRef, { likes: updatedLikes });
  };

  // RENDER UI

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Community Stories</Text>

      {/* SHARE BUTTON */}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => router.push("/community/ShareStory")}
      >
        <Text style={styles.shareText}>+ Share Your Story</Text>
      </TouchableOpacity>

      {/* POST LIST */}
      {posts.map((post) => {
        const isOwner = post.userEmail === user?.email;

        return (
          <View key={post.id} style={styles.card}>
            {/* USER HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.userInfo}>
                <Image source={{ uri: post.userProfile }} style={styles.avatar} />

                <View>
                  <Text style={styles.username}>{post.username}</Text>
                  <Text style={styles.time}>
                    {post.createdAt?.seconds
                      ? moment(post.createdAt.toDate()).fromNow()
                      : "Just now"}
                  </Text>
                </View>
              </View>

              {/* 3-DOT MENU (ONLY FOR OWNER) */}
              {isOwner && (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Story Options", "", [
                      {
                        text: "Edit Story",
                        onPress: () =>
                          router.push(`/community/edit/${post.id}`),
                      },
                      {
                        text: "Delete Story",
                        style: "destructive",
                        onPress: () => deleteStory(post.id),
                      },
                      { text: "Cancel", style: "cancel" },
                    ])
                  }
                >
                  <Ionicons name="ellipsis-vertical" size={22} color="#444" />
                </TouchableOpacity>
              )}
            </View>

            {/* POST IMAGE */}
            {post.imageUrl && (
              <Image
                source={{ uri: post.imageUrl }}
                style={styles.postImage}
              />
            )}

            {/* CAPTION */}
            <Text style={styles.caption}>{post.storyText}</Text>

            {/* LIKE BUTTON */}
            <TouchableOpacity
              onPress={() => toggleLike(post.id, post.likes || [])}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginTop: 6,
                  color: (post.likes || []).includes(user?.uid)
                    ? "#e63946"
                    : "#444",
                }}
              >
                {(post.likes || []).includes(user?.uid)
                  ? "❤️ Liked"
                  : "🤍 Like"}
              </Text>
            </TouchableOpacity>

            {/* LIKE COUNT */}
            <Text style={styles.likesCount}>
              {(post.likes || []).length} likes
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  shareButton: {
    backgroundColor: "#1E3A8A",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  shareText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontWeight: "bold", fontSize: 16 },
  time: { color: "#777", fontSize: 12 },

  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },

  caption: { fontSize: 15, marginBottom: 10 },
  likesCount: { color: "#777", fontSize: 12, marginTop: 4 },
});
