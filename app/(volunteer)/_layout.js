import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import VolunteerHeader from "../../components/VolunteerHeader";

export default function VolunteerLayout() {
  return (
    <View style={styles.wrapper}>
      {/* ✅ Fixed top header for all volunteer pages */}
      <VolunteerHeader title="Hope4Paws Volunteer Dashboard" />

      {/* Nested screens (dashboard, settings, etc.) */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#EFF6FF" },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#EFF6FF",
  },
});
