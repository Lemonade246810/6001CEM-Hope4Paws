import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebaseConfig";

export default function FeaturedPets({ selectedCategory }) {
  const [pets, setPets] = useState([]);     // ✅ FIX 1: Add state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, [selectedCategory]);

  const fetchPets = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "Animals"),
        where("species", "==", selectedCategory) // ✅ "Cat" or "Dog"
      );

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPets(list);
      setLoading(false);

    } catch (err) {
      console.log("Error fetching pets:", err);
      setLoading(false);
    }
  };

  return (
    <View style={{ marginTop: 25 }}>
      <Text style={{ fontSize: 22, fontFamily: "roboto-medium", marginBottom: 10 }}>
        Featured Pets
      </Text>

      {/* ✅ FIX 2: Replace wrong variable "category" with selectedCategory */}
      {loading ? (
        <Text>Loading...</Text>
      ) : pets.length === 0 ? (
        <Text>No pets available in {selectedCategory} category.</Text>
      ) : (
        <FlatList
          data={pets}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/adopt/${item.id}`)}
              style={{
                backgroundColor: "#fff",
                marginRight: 12,
                padding: 12,
                borderRadius: 12,
                width: 160,
                elevation: 3,
              }}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: "100%", height: 110, borderRadius: 10 }}
              />

              <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 8 }}>
                {item.name}
              </Text>

              <Text style={{ color: "#777", fontSize: 12 }}>{item.breed}</Text>

              <TouchableOpacity
                onPress={() => router.push(`/adopt/${item.id}`)}
                style={{
                  marginTop: 8,
                  paddingVertical: 6,
                  backgroundColor: "#1E3A8A",
                  borderRadius: 8,
                }}
              >
                <Text style={{ textAlign: "center", color: "#fff" }}>View</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
