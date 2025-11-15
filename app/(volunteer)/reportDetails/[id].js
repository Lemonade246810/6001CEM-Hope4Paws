import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../context/authContext";

import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import StatusChip from "../../../components/StatusChip";

export default function VolunteerReportDetails() {
  const { id } = useLocalSearchParams(); // report document ID
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Live subscribe to this report document
  useEffect(() => {
    if (!id) return;

    const ref = doc(db, "AnimalReports", String(id));
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setReport({ id: snap.id, ...snap.data() });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Report subscribe error:", err);
        setLoading(false);
      }
    );

    return unsub;
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.center}>
        <Text>Report not found.</Text>
      </View>
    );
  }

  const canComplete = report.status !== "Completed";

  // Open Google Maps navigation
  const handleOpenMaps = () => {
    if (!report.latitude || !report.longitude) {
      Alert.alert("No Location", "This report has no GPS coordinates.");
      return;
    }

    const lat = report.latitude;
    const lng = report.longitude;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.openURL(url).catch((err) => {
      console.error("Maps open error:", err);
      Alert.alert("Error", "Could not open maps.");
    });
  };

  // Confirm + mark as completed
  const confirmComplete = () => {
    if (!canComplete) return;

    Alert.alert(
      "Mark as Completed",
      "Are you sure you've completed this rescue task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Completed",
          style: "destructive",
          onPress: () => handleComplete(),
        },
      ]
    );
  };

  const handleComplete = async () => {
    try {
      setUpdating(true);

      const ref = doc(db, "AnimalReports", report.id);

      await updateDoc(ref, {
        status: "Completed",
        completedAt: serverTimestamp(),
        completedById: user.userId,
        completedByName: user.username,
      });

      Alert.alert("Success", "Task marked as completed.");
      router.back();
    } catch (err) {
      console.error("Complete error:", err);
      Alert.alert("Error", "Failed to mark as completed.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>

      {/* BACK */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* HEADER */}
      <Text style={styles.header}>Report Details</Text>

      {/* SUMMARY CARD */}
      <View style={styles.summaryCard}>

        {/* Thumbnail */}
        <Image
          source={{
            uri:
              report.photoUrl ||
              report.imageUrl ||
              "https://cdn-icons-png.flaticon.com/512/616/616430.png",
          }}
          style={styles.summaryImage}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.summaryCase}>
            Case Number: {report.caseNumber || "N/A"}
          </Text>

          <Text style={styles.summaryLine}>
            Condition: {report.condition || "-"}
          </Text>

          <Text style={styles.summaryLine}>
            Address: {report.address || "-"}
          </Text>

          {/* Status */}
          <View style={{ marginTop: 6 }}>
            <StatusChip status={report.status} />
          </View>
        </View>
      </View>

      {/* FULL IMAGE */}
      {report.photoUrl || report.imageUrl ? (
        <Image
          source={{ uri: report.photoUrl || report.imageUrl }}
          style={styles.photo}
        />
      ) : null}

      {/* BASIC INFO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Case Information</Text>

        <Text style={styles.line}>Animal: {report.animalType || "-"}</Text>
        <Text style={styles.line}>Condition: {report.condition || "-"}</Text>

        {report.description ? (
          <Text style={[styles.line, { marginTop: 6 }]}>
            Description: {report.description}
          </Text>
        ) : null}
      </View>

      {/* LOCATION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location</Text>

        <Text style={styles.line}>Address: {report.address || "-"}</Text>

        {report.latitude && report.longitude ? (
          <Text style={styles.coords}>
            Lat: {report.latitude} • Lng: {report.longitude}
          </Text>
        ) : null}

        <TouchableOpacity style={styles.mapsBtn} onPress={handleOpenMaps}>
          <Text style={styles.mapsText}>📍 Navigate with Google Maps</Text>
        </TouchableOpacity>
      </View>

      {/* ASSIGNMENT INFO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assignment</Text>

        <Text style={styles.line}>
          Assigned Volunteer: {report.assignedVolunteerName || "-"}
        </Text>

        <Text style={styles.line}>
          Assigned At:{" "}
          {report.assignedAt?.toDate
            ? report.assignedAt.toDate().toLocaleString()
            : "-"}
        </Text>

        {report.status === "Completed" && (
          <Text style={styles.line}>
            Completed At:{" "}
            {report.completedAt?.toDate
              ? report.completedAt.toDate().toLocaleString()
              : "-"}
          </Text>
        )}
      </View>

      {/* COMPLETE BUTTON */}
      <TouchableOpacity
        style={[
          styles.completeBtn,
          (!canComplete || updating) && { backgroundColor: "#9CA3AF" },
        ]}
        disabled={!canComplete || updating}
        onPress={confirmComplete}
      >
        <Text style={styles.completeText}>
          {canComplete
            ? updating
              ? "Updating..."
              : "Mark as Completed"
            : "Already Completed"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    padding: 16,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED",
  },

  backBtn: {
    paddingVertical: 4,
    width: 70,
    marginBottom: 6,
  },
  backText: {
    fontSize: 16,
    color: "#1E3A8A",
    fontWeight: "600",
  },

  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  /* SUMMARY */
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FBBF24",
    marginBottom: 14,
  },
  summaryImage: {
    width: 85,
    height: 85,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: "#f3f4f6",
  },
  summaryCase: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  summaryLine: {
    fontSize: 14,
    color: "#374151",
    marginTop: 2,
  },

  /* FULL IMAGE */
  photo: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 14,
  },

  /* CARDS */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FBBF24",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  line: {
    marginTop: 4,
    color: "#374151",
  },
  coords: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 12,
  },

  mapsBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
  },
  mapsText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  completeBtn: {
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    alignItems: "center",
  },
  completeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
