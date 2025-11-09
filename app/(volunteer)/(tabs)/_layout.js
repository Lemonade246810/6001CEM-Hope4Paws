import { Tabs } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../context/authContext";

// Expo vector icons
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function VolunteerTabsLayout() {
  const { user } = useAuth();
  const [assignedCount, setAssignedCount] = useState(0);

  // Count live assigned reports
  useEffect(() => {
    if (!user?.userId) return;

    const q = query(
      collection(db, "AnimalReports"),
      where("assignedTo", "==", user.userId),
      where("status", "==", "Assigned")
    );

    const unsub = onSnapshot(q, (snap) => {
      setAssignedCount(snap.docs.length);
    });

    return unsub;
  }, [user?.userId]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fbbf24",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 65,
        },
      }}
    >

      {/* Dashboard */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Assigned Reports */}
      <Tabs.Screen
        name="assignedReports"
        options={{
          title: "Assigned",
          tabBarBadge: assignedCount > 0 ? assignedCount : null,
          tabBarBadgeStyle: {
            backgroundColor: "red",
            color: "white",
            fontWeight: "bold",
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
