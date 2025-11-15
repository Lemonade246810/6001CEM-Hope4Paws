import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "../../../context/authContext";

import { db } from "../../../config/firebaseConfig";

export default function Profile() {
  const { user, logout, setUserData } = useAuth();

  // 🛑 FIX: Prevent crash while loading
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 16, color: "#6B7280" }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [hasAssignedTask, setHasAssignedTask] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/(app)/signIn");
  };

  // 🔐 Auto-lock availability when assigned a task
  useEffect(() => {
    if (!user?.userId) return;

    const q = query(
      collection(db, "AnimalReports"),
      where("assignedVolunteerId", "==", user.userId),
      where("status", "==", "Assigned")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const hasTask = snap.docs.length > 0;
      setHasAssignedTask(hasTask);

      if (hasTask) {
        setIsAvailable(false);

        await updateDoc(doc(db, "users", user.userId), {
          isAvailable: false,
        });

        setUserData({
          ...user,
          isAvailable: false,
        });
      }
    });

    return unsub;
  }, [user?.userId]);

  // Manual toggle (only when no task)
  const toggleAvailability = async (value) => {
    setIsAvailable(value);

    await updateDoc(doc(db, "users", user.userId), {
      isAvailable: value,
    });

    setUserData({
      ...user,
      isAvailable: value,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Volunteer Profile</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              user?.photoURL ||
              user?.profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>
          {user?.username ||
            user?.email?.split("@")[0] || // safely chained
            "Volunteer"}
        </Text>

        <Text style={styles.email}>{user?.email || "-"}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Volunteer</Text>
        </View>
      </View>

      {/* MENU LIST */}
      <View style={styles.actionList}>
        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => router.push("/(volunteer)/editProfile")}
        >
          <Ionicons name="person-circle-outline" size={22} color="#1E3A8A" />
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Availability Toggle */}
        <View style={styles.actionItem}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#1E3A8A" />
          <Text style={styles.actionText}>Available for Tasks</Text>

          <View style={{ flex: 1 }} />

          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            disabled={hasAssignedTask}
            trackColor={{
              false: hasAssignedTask ? "#fca5a5" : "#d1d5db",
              true: "#1E3A8A",
            }}
            thumbColor="white"
          />
        </View>

        {hasAssignedTask && (
          <Text style={styles.lockText}>
            You have an active assigned task. Availability is locked.
          </Text>
        )}

        {/* Settings */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => router.push("/(volunteer)/volunteerSettings")}
        >
          <Ionicons name="settings-outline" size={22} color="#1E3A8A" />
          <Text style={styles.actionText}>Profile Settings</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => router.push("/(volunteer)/volunteerNotifications")}
        >
          <Ionicons name="notifications-outline" size={22} color="#1E3A8A" />
          <Text style={styles.actionText}>Notification Settings</Text>
        </TouchableOpacity>

        {/* Completed Tasks */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => router.push("/(volunteer)/completedTasks")}
        >
          <MaterialIcons name="check-circle-outline" size={22} color="#16A34A" />
          <Text style={styles.actionText}>Completed Tasks</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    padding: 20,
  },

  header: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
    color: "#1E1E1E",
  },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCD34D",
    marginBottom: 25,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 10,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },

  email: {
    color: "#6B7280",
    marginBottom: 8,
  },

  roleBadge: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 6,
  },

  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  actionList: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    padding: 5,
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  actionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#1E293B",
  },

  lockText: {
    color: "#DC2626",
    fontSize: 12,
    marginLeft: 50,
    marginBottom: 10,
  },

  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },

  logoutText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
});
