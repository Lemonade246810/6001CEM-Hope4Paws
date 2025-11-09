import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import AdminHeader from "../../components/AdminHeader";

export default function AdminLayout() {
  return (
    <View style={styles.wrapper}>
      {/* ✅ Always visible Admin Header */}
      <AdminHeader title="Hope4Paws Admin Panel" />

      {/* ✅ Admin Stack Navigation */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFF7ED" },
        }}
      >
        <Stack.Screen name="adoptions/index" options={{ headerShown: false }} />
        <Stack.Screen name="adoptions/view" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#FFF7ED" },
});
