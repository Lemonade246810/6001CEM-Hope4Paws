import { router } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../config/firebaseConfig";

export default function AdoptionScreen({ petId }) {
  const [pet, setPet] = useState(null);
  const [shelter, setShelter] = useState(null);
  const [similarPets, setSimilarPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactVisible, setContactVisible] = useState(false);

  const hasContact = useMemo(
    () => Boolean(shelter?.phone || shelter?.email),
    [shelter]
  );

  // ✅ Fetch pet + shelter + similar pets
  useEffect(() => {
    const fetchPetAndShelter = async () => {
      try {
        const docRef = doc(db, "Animals", petId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const petData = { id: docSnap.id, ...docSnap.data() };
          setPet(petData);

          // ✅ Find shelter by matching name
          const sheltersSnapshot = await getDocs(collection(db, "Shelters"));
          const matchedShelter = sheltersSnapshot.docs.find(
            (s) => s.data().name === petData.shelter
          );

          if (matchedShelter) {
            setShelter({
              id: matchedShelter.id,
              ...matchedShelter.data(),
            });
          }

          // ✅ Fetch similar pets
          const q = query(
            collection(db, "Animals"),
            where("species", "==", petData.species),
            limit(3)
          );
          const snapshot = await getDocs(q);

          const others = snapshot.docs
            .filter((d) => d.id !== petData.id)
            .map((d) => ({ id: d.id, ...d.data() }));

          setSimilarPets(others);
        }
      } catch (error) {
        console.error("Error fetching pet or shelter:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPetAndShelter();
  }, [petId]);

  // ✅ Age Calculator
  const calculateAge = (birthDate) => {
    if (!birthDate?.toDate) return "Unknown";
    const b = birthDate.toDate();
    const now = new Date();
    const years = now.getFullYear() - b.getFullYear();
    const months = now.getMonth() - b.getMonth();
    const totalMonths = years * 12 + months;

    if (totalMonths < 12)
      return `${totalMonths} month${totalMonths > 1 ? "s" : ""}`;

    const y = Math.floor(totalMonths / 12);
    return `${y} year${y > 1 ? "s" : ""}`;
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 50 }} />
    );

  if (!pet) return <Text style={{ margin: 20 }}>Pet not found.</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ✅ BACK BUTTON */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
        >
          <Text style={{ fontSize: 16, color: "#1E3A8A" }}>← Back</Text>
        </TouchableOpacity>

        {/* 🐾 PET IMAGE */}
        <Image source={{ uri: pet.imageUrl }} style={styles.image} />

        <View style={styles.headerInfo}>
          <View>
            <Text style={styles.name}>{pet.name}</Text>
            <Text
              style={[
                styles.status,
                pet.status === "Available"
                  ? styles.statusAvailable
                  : styles.statusAdopted,
              ]}
            >
              {pet.status}
            </Text>
          </View>
        </View>

        {/* ✅ INFO GRID */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{calculateAge(pet.birthDate)}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{pet.gender}</Text>
          </View>

          {pet.breed && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Breed</Text>
              <Text style={styles.infoValue}>{pet.breed}</Text>
            </View>
          )}

          {pet.weight && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{pet.weight}</Text>
            </View>
          )}
        </View>

        {/* ✅ ABOUT */}
        <Text style={styles.sectionTitle}>About {pet.name}</Text>
        <Text style={styles.story}>{pet.story}</Text>

        {/* ✅ HEALTH */}
        <Text style={styles.sectionTitle}>Health & Care</Text>
        <View style={styles.badgeContainer}>
          {pet.health?.split(",").map((h, idx) => (
            <Text key={idx} style={styles.healthBadge}>
              ✅ {h.trim()}
            </Text>
          ))}

          {/* ✅ Neutered/Spayed */}
          {pet.isSpayedOrNeutered !== undefined && (
            <Text
              style={[
                styles.healthBadge,
                !pet.isSpayedOrNeutered && {
                  backgroundColor: "#FDE7E7",
                  color: "#B22222",
                },
              ]}
            >
              {pet.isSpayedOrNeutered
                ? pet.gender === "Male"
                  ? "✅ Neutered"
                  : "✅ Spayed"
                : pet.gender === "Male"
                ? "❌ Not Neutered"
                : "❌ Not Spayed"}
            </Text>
          )}
        </View>

        {/* ✅ SHELTER INFO */}
        <Text style={styles.sectionTitle}>Shelter Information</Text>
        <View style={styles.shelterBox}>
          <Text style={styles.shelterName}>{shelter?.name}</Text>
          <Text style={styles.shelterAddress}>{shelter?.address}</Text>

          <TouchableOpacity
            style={[styles.contactButton]}
            onPress={() => setContactVisible(true)}
          >
            <Text style={styles.contactButtonText}>Contact Shelter</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ CONTACT MODAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={contactVisible}
          onRequestClose={() => setContactVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Contact {shelter?.name}</Text>

              {shelter?.phone && (
                <Pressable
                  style={styles.modalButton}
                  onPress={() => {
                    const phoneUrl =
                      Platform.OS === "android"
                        ? `tel:${shelter.phone}`
                        : `telprompt:${shelter.phone}`;
                    Linking.openURL(phoneUrl);
                    setContactVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>
                    📞 Call {shelter.phone}
                  </Text>
                </Pressable>
              )}

              {shelter?.phone && (
                <Pressable
                  style={styles.modalButton}
                  onPress={() => {
                    const formatted = shelter.phone.replace(/[^\d]/g, "");
                    Linking.openURL(`https://wa.me/${formatted}`);
                    setContactVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>💬 WhatsApp</Text>
                </Pressable>
              )}

              {shelter?.email && (
                <Pressable
                  style={styles.modalButton}
                  onPress={() => {
                    const mailUrl = `mailto:${shelter.email}?subject=Adoption%20Enquiry&body=Hi%20${
                      shelter.name
                    },%0AI am interested in adopting ${pet.name}.`;
                    Linking.openURL(mailUrl);
                    setContactVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>
                    ✉️ Email {shelter.email}
                  </Text>
                </Pressable>
              )}

              {shelter?.website && (
                <Pressable
                  style={styles.modalButton}
                  onPress={() => {
                    Linking.openURL(shelter.website);
                    setContactVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>🌐 Visit Website</Text>
                </Pressable>
              )}

              {shelter?.latitude && shelter?.longitude && (
                <Pressable
                  style={styles.modalButton}
                  onPress={() => {
                    const lat = shelter.latitude;
                    const lng = shelter.longitude;

                    const url =
                      Platform.OS === "ios"
                        ? `maps://?q=${lat},${lng}`
                        : `geo:${lat},${lng}?q=${lat},${lng}`;

                    Linking.openURL(url);
                    setContactVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>📍 Open in Maps</Text>
                </Pressable>
              )}

              <Pressable
                style={[styles.modalButton, { backgroundColor: "#e5e5e5" }]}
                onPress={() => setContactVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#333" }]}>
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ✅ SIMILAR PETS */}
        {similarPets.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Similar Pets</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              {similarPets.map((sp) => (
                <TouchableOpacity
                  key={sp.id}
                  style={styles.similarCard}
                  onPress={() => router.push(`/adopt/${sp.id}`)}
                >
                  <Image
                    source={{ uri: sp.imageUrl }}
                    style={styles.similarImage}
                  />
                  <Text style={styles.similarName}>{sp.name}</Text>
                  <Text style={styles.similarInfo}>
                    {calculateAge(sp.birthDate)} • {sp.breed || sp.species}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ✅ ADOPTION BUTTON */}
        {pet.status === "Available" ? (
          <TouchableOpacity
            style={styles.adoptButton}
            onPress={() =>
              router.push({
                pathname: "/adopt/AdoptionApplicationForm",
                params: { petId: pet.id },
              })
            }
          >
            <Text style={styles.adoptButtonText}>Start Adoption Process</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.adoptedText}>This pet has been adopted 🏠</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

//
// ✅ STYLES
//
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 15,
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 28, fontWeight: "bold", color: "#333" },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
    fontWeight: "600",
  },
  statusAvailable: { backgroundColor: "#DFF6DD", color: "#2E8B57" },
  statusAdopted: { backgroundColor: "#FDE7E7", color: "#B22222" },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  infoBox: { width: "48%", marginBottom: 12 },
  infoLabel: { color: "#888", fontSize: 13 },
  infoValue: { fontSize: 16, fontWeight: "600", color: "#333" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#1E3A8A",
  },
  story: { color: "#444", fontSize: 15, lineHeight: 22 },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  healthBadge: {
    backgroundColor: "#E8F5E9",
    color: "#2E8B57",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 13,
  },
  shelterBox: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  shelterName: { fontWeight: "700", fontSize: 16, color: "#333" },
  shelterAddress: { fontSize: 14, color: "#555", marginVertical: 4 },
  contactButton: {
    backgroundColor: "#1E3A8A",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  contactButtonText: { color: "#fff", fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1E3A8A",
  },
  modalButton: {
    backgroundColor: "#1E3A8A",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 6,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  similarCard: {
    width: 130,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    paddingBottom: 8,
  },
  similarImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  similarName: {
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 6,
    color: "#333",
  },
  similarInfo: { textAlign: "center", color: "#666", fontSize: 12 },

  adoptButton: {
    backgroundColor: "#1E3A8A",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 30,
  },
  adoptButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  adoptedText: {
    color: "#B22222",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 30,
  },
});
