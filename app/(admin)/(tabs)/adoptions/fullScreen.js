import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function FullScreenImage() {
  const { image } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <Image
        source={{ uri: image }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 100,
  },
  image: { width: "100%", height: "100%" },
});
