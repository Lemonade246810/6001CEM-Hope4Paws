import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminTabsLayout() {
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
          height: 70,
        },
      }}
    >
      <Tabs.Screen
        name="manageReports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => (
            <Ionicons name="alert-circle" size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="completedReports"
        options={{
          title: "Completed",
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkmark-done-circle" size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="addPetForAdoption"
        options={{
          title: "Add Pet",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="pets" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="adoptions"
        options={{
          title: "Adoptions",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="assignment" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manageVolunteers"
        options={{
          title: "Volunteers",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="users" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}