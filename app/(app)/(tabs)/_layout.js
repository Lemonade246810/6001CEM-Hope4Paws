import { AntDesign, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#fbbf24", // Amber highlight
            tabBarInactiveTintColor: "#9ca3af", // Neutral gray
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
          }}
        >
          {/* 🏠 Home */}
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ focused, size }) => (
                <FontAwesome5
                  name="home"
                  size={size}
                  color={focused ? "#fbbf24" : "#9ca3af"}
                  style={focused && styles.activeIcon}
                />
              ),
            }}
          />

          {/* 📋 Report */}
          <Tabs.Screen
            name="report"
            options={{
              title: "Report",
              tabBarIcon: ({ focused, size }) => (
                <MaterialIcons
                  name="report-problem"
                  size={size + 1}
                  color={focused ? "#f87171" : "#9ca3af"}
                  style={focused && styles.activeIcon}
                />
              ),
            }}
          />

          {/* 🐕 Adopt */}
          <Tabs.Screen
            name="adopt"
            options={{
              title: "Adopt",
              tabBarIcon: ({ focused, size }) => (
                <MaterialIcons
                  name="pets"
                  size={size + 2}
                  color={focused ? "#4ade80" : "#9ca3af"}
                  style={focused && styles.activeIcon}
                />
              ),
            }}
          />

          {/* 💬 Community */}
          <Tabs.Screen
            name="community"
            options={{
              title: "Community",
              tabBarIcon: ({ focused, size }) => (
                <AntDesign
                  name="message" // ✅ fixed icon name
                  size={size}
                  color={focused ? "#60a5fa" : "#9ca3af"}
                  style={focused && styles.activeIcon}
                />
              ),
            }}
          />

          {/* 👤 Profile */}
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ focused, size }) => (
                <Ionicons
                  name="person-circle"
                  size={size + 2}
                  color={focused ? "#fbbf24" : "#9ca3af"}
                  style={focused && styles.activeIcon}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    height: 65,
    paddingBottom: Platform.OS === "ios" ? 12 : 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
});
