import { Picker } from "@react-native-picker/picker";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { db } from "../../../config/firebaseConfig";

export default function ManageReports() {
  const [pendingReports, setPendingReports] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selection, setSelection] = useState({});
  const loadingRef = useRef(false);

  const refs = useMemo(
    () => ({
      reportsCol: collection(db, "AnimalReports"),
      usersCol: collection(db, "users"),
    }),
    []
  );

  // Load pending reports LIVE (status == Pending)
  useEffect(() => {
    const q = query(
      refs.reportsCol,
      where("status", "==", "Pending"),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPendingReports(list);
    });

    return unsub;
  }, [refs]);

  // Load volunteers
  useEffect(() => {
    (async () => {
      const q = query(refs.usersCol, where("role", "==", "volunteer"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVolunteers(list);
    })();
  }, [refs]);

  // Assign volunteer to report
  const handleAssign = async (report) => {
    const volunteerId = selection[report.id];
    if (!volunteerId) {
      Alert.alert("Select Volunteer", "Please choose a volunteer to assign.");
      return;
    }
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;

      const volunteer = volunteers.find(
        (v) => (v.userId || v.id) === volunteerId
      );

      if (!volunteer) {
        Alert.alert("Error", "Volunteer not found.");
        return;
      }

      await updateDoc(doc(db, "AnimalReports", report.id), {
        assignedVolunteerId: volunteerId,
        assignedVolunteerName: volunteer.username || volunteer.email,
        assignedAt: serverTimestamp(),
        status: "Assigned",
      });

      Alert.alert("✅ Assigned", `Assigned to ${volunteer.username}`);
    } catch (err) {
      console.error("Assign error:", err);
      Alert.alert("Error", "Failed to assign report. Try again.");
    } finally {
      loadingRef.current = false;
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate?.() || new Date();
    return d.toLocaleString();
  };

  const renderItem = ({ item }) => {
    const selected = selection[item.id] || "";

    return (
      <View style={styles.card}>
        <Text style={styles.caseId}>{item.caseNumber || "—"}</Text>

        <Text style={styles.title}>{item.animalType}</Text>
        <Text style={styles.line}>Condition: {item.condition}</Text>
        <Text style={styles.line}>Address: {item.address}</Text>
        <Text style={styles.timestamp}>Submitted: {formatTime(item.timestamp)}</Text>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Assign Volunteer:</Text>

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selected}
              onValueChange={(val) =>
                setSelection((s) => ({ ...s, [item.id]: val }))
              }
            >
              <Picker.Item label="Select a volunteer…" value="" />
              {volunteers.map((v) => (
                <Picker.Item
                  key={v.userId || v.id}
                  label={v.username || v.email}
                  value={v.userId || v.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={styles.assignBtn}
          onPress={() => handleAssign(item)}
        >
          <Text style={styles.assignText}>Assign</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>🐾 Pending Reports</Text>

      {pendingReports.length === 0 ? (
        <Text style={styles.empty}>No pending reports right now.</Text>
      ) : (
        <FlatList
          data={pendingReports}
          renderItem={renderItem}
          keyExtractor={(it) => it.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF7ED", padding: 16 },
  header: { fontSize: 22, fontWeight: "800", color: "#1E293B", marginBottom: 12 },
  empty: { color: "#6B7280", textAlign: "center", marginTop: 24 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FCD34D",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  caseId: {
    fontSize: 14,
    color: "#92400E",
    fontWeight: "700",
    marginBottom: 4,
  },

  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  line: { color: "#374151", marginTop: 4 },
  timestamp: { color: "#6B7280", marginTop: 6, fontSize: 12 },

  label: { fontSize: 12, color: "#6B7280", marginBottom: 6 },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },

  assignBtn: {
    backgroundColor: "#f59e0b",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: "flex-end",
  },

  assignText: { color: "white", fontWeight: "700" },
});
