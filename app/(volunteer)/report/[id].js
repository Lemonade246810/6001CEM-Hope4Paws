import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
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
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../config/firebaseConfig";

export default function VolunteerReportDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const ref = doc(db, "AnimalReports", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          Alert.alert("Error", "Report not found.");
          router.back();
          return;
        }
        setReport({ id, ...snap.data() });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [id]);

  const handleMarkCompleted = async () => {
    try {
      await updateDoc(doc(db, "AnimalReports", id), {
        status: "Completed",
        completedAt: serverTimestamp(),
      });
      Alert.alert("✅ Completed", "This task is now marked as completed.");
      router.replace("/(volunteer)/dashboard");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not update report.");
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Title */}
        <Text style={styles.header}>🐾 Report Details</Text>

        {/* Photo */}
        <Image source={{ uri: report.photoUrl }} style={styles.image} />

        <Text style={styles.title}>{report.animalType}</Text>

        <Text style={styles.label}>Condition</Text>
        <Text style={styles.value}>{report.condition}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{report.description}</Text>

        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{report.address}</Text>

        {/* Map */}
        {report.latitude && report.longitude && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: report.latitude,
              longitude: report.longitude,
              latitudeDelta: 0.003,
              longitudeDelta: 0.003,
            }}
          >
            <Marker
              coordinate={{
                latitude: report.latitude,
                longitude: report.longitude,
              }}
            />
          </MapView>
        )}

        {/* Extra padding so the scrollable content does not hide behind button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ Fixed bottom button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.completeBtn} onPress={handleMarkCompleted}>
          <Text style={styles.completeText}>✅ Mark as Completed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF7ED" },
  container: { padding: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1E293B",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 15,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF7ED",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  completeBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
  },
  completeText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
});
