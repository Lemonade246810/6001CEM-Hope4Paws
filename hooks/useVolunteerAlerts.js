import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { db } from "../config/firebaseConfig";

export function useVolunteerAlerts(volunteerId) {
  const alreadyShown = useRef(new Set()); // Prevent duplicate alerts

  useEffect(() => {
    if (!volunteerId) return;

    const q = query(
      collection(db, "AnimalReports"),
      where("assignedTo", "==", volunteerId),
      where("status", "==", "Assigned")
    );

    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const report = change.doc.data();

          // Prevent repeated alerts for the same report
          if (alreadyShown.current.has(change.doc.id)) return;

          alreadyShown.current.add(change.doc.id);

          Alert.alert(
            "🚨 New Rescue Assigned!",
            `A new ${report.animalType} report was assigned to you.`,
            [{ text: "OK" }]
          );
        }
      });
    });

    return () => unsub();
  }, [volunteerId]);
}
