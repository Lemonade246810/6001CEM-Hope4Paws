import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "../../config/firebaseConfig";

export default function ManageNotifications() {
  const [items, setItems] = useState([]);
  const lastTopIdRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db,"AnimalReports"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, (snapshot)=>{
      const list = snapshot.docs.map(d=>({id:d.id, ...d.data()}));
      setItems(list);

      // pop an alert only when a new top item arrives
      const top = list[0]?.id;
      if (top && lastTopIdRef.current && lastTopIdRef.current !== top) {
        Alert.alert("🚨 New Report", "A new animal has been reported. Review now.");
      }
      lastTopIdRef.current = top || lastTopIdRef.current;
    });
    return ()=>unsub();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🔔 Notifications</Text>
      {items.length===0 ? (
        <Text style={styles.empty}>No new reports yet.</Text>
      ):(
        items.map(n=>(
          <View key={n.id} style={styles.card}>
            <Text style={styles.title}>{n.animalType || "Unknown Animal"}</Text>
            <Text style={styles.line}>{n.condition || "-"}</Text>
            <Text style={styles.mute}>📍 {n.address || "No address"}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ padding:16 },
  header:{ fontSize:20, fontWeight:"800", color:"#1E293B", marginBottom:12 },
  empty:{ textAlign:"center", color:"#94A3B8", marginTop:20 },
  card:{ backgroundColor:"#fff7ed", borderRadius:12, padding:16, marginBottom:12, borderWidth:1, borderColor:"#fcd34d" },
  title:{ fontSize:16, fontWeight:"700", color:"#1E293B" },
  line:{ fontSize:14, color:"#475569", marginVertical:4 },
  mute:{ fontSize:13, color:"#9CA3AF" },
});
