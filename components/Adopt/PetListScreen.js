import { router } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebaseConfig";

export default function PetListScreen() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("admissionDate");
  const [searchText, setSearchText] = useState("");

  const filters = ["All", "Dogs", "Cats"];
  const sorts = ["admissionDate", "age"];

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, "Animals"), orderBy("admissionDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Local sorting logic
      if (sortBy === "age") {
        data.sort((a, b) => {
          const aDate = a.birthDate?.toDate ? a.birthDate.toDate() : new Date();
          const bDate = b.birthDate?.toDate ? b.birthDate.toDate() : new Date();
          return aDate - bDate; // older pets first
        });
      } else if (sortBy === "admissionDate") {
        data.sort((a, b) => {
          const aDate = a.admissionDate?.toDate
            ? a.admissionDate.toDate()
            : new Date();
          const bDate = b.admissionDate?.toDate
            ? b.admissionDate.toDate()
            : new Date();
          return bDate - aDate; // newer first
        });
      }

      setPets(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sortBy]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  // Apply filters + search
  const filteredPets = pets.filter((pet) => {
    const species = pet.species?.toLowerCase();
    const matchesSearch = pet.name
      ?.toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Dogs" && species === "dog") ||
      (filter === "Cats" && species === "cat");

    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adopt a Pet</Text>

      {/* Search */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* SORT + FILTER BLOCK */}
      <View style={styles.sortFilterWrapper}>
        
        {/* Sort Buttons */}
        <View style={styles.sortContainer}>
          {sorts.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSortBy(s)}
              style={[
                styles.sortButton,
                sortBy === s && styles.sortButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.sortText,
                  sortBy === s && styles.sortTextActive,
                ]}
              >
                Sort by {s === "admissionDate" ? "Date Added" : "Age"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterButton,
                filter === f && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Pet Cards */}
      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.imageUrl || "https://placekitten.com/300" }}
              style={styles.image}
            />

            <View style={styles.cardContent}>
              <Text style={styles.petName}>{item.name}</Text>

              {/* Updated badge */}
              <Text
                style={[
                  styles.badge,
                  item.status === "Available"
                    ? styles.badgeAvailable
                    : styles.badgeUnavailable,
                ]}
              >
                {item.status === "Available"
                  ? "Available for Adoption"
                  : "Unavailable"}
              </Text>

              <Text style={styles.petDesc} numberOfLines={2}>
                {item.story ||
                  `Friendly ${item.gender?.toLowerCase()} ${item.species}`}
              </Text>

              <TouchableOpacity
                style={[
                  styles.button,
                  item.status !== "Available" && { opacity: 0.5 },
                ]}
                disabled={item.status !== "Available"} // prevent adopting unavailable pets
                onPress={() =>
                  router.push({
                    pathname: "/adopt/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.buttonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },

  searchBar: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },

  sortFilterWrapper: {
    marginBottom: 20,
  },

  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sortButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  sortButtonActive: {
    backgroundColor: "#1E3A8A",
  },

  sortText: {
    color: "#333",
    fontWeight: "500",
  },

  sortTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  filterScrollContent: {
    paddingVertical: 6,
    gap: 10,
  },

  filterButton: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },

  filterButtonActive: {
    backgroundColor: "#1E3A8A",
  },

  filterText: {
    color: "#333",
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  cardContent: {
    padding: 12,
  },

  petName: {
    fontSize: 18,
    fontWeight: "bold",
  },

  badge: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: "600",
    marginBottom: 6,
  },

  badgeAvailable: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },

  badgeUnavailable: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },

  petDesc: {
    color: "#555",
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
