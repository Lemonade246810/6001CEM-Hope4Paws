import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../../config/firebaseConfig";

export default function CompletedReportDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "AnimalReports", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setReport({ id: snap.id, ...snap.data() });
      }
    };
    load();
  }, [id]);

  if (!report) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#6B7280" }}>Loading...</Text>
      </View>
    );
  }

  const completedTime =
    report.completedAt?.toDate().toLocaleString() ?? "Unknown";

  return (
    <ScrollView style={styles.screen}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Image */}
      <Image
        source={{ uri: report.imageUrl || report.photoUrl || "https://via.placeholder.com/300" }}
        style={styles.mainImage}
      />

      {/* Title */}
      <Text style={styles.title}>{report.animalType}</Text>
      <Text style={styles.status}>🟢 Completed</Text>

      {/* Info Box */}
      <View style={styles.box}>
        <Text style={styles.label}>Condition:</Text>
        <Text style={styles.value}>{report.condition}</Text>

        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{report.address}</Text>

        <Text style={styles.label}>Completed At:</Text>
        <Text style={styles.value}>{completedTime}</Text>

        {report.description ? (
          <>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{report.description}</Text>
          </>
        ) : null}

        {report.volunteerName ? (
          <>
            <Text style={styles.label}>Handled By:</Text>
            <Text style={styles.value}>{report.volunteerName}</Text>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    padding: 16,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
  },

  backBtn: {
    marginBottom: 10,
  },

  backText: {
    fontSize: 18,
    color: "#2563EB",
    fontWeight: "600",
  },

  mainImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E293B",
  },

  status: {
    fontSize: 16,
    color: "#10B981",
    marginBottom: 20,
    fontWeight: "700",
  },

  box: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
    color: "#374151",
  },

  value: {
    fontSize: 15,
    color: "#1F2937",
    marginTop: 4,
  },
});
