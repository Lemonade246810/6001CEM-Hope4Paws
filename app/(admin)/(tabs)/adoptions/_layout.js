import { Stack } from "expo-router";

export default function AdoptionStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This is the tab's main screen */}
      <Stack.Screen name="index" />
      {/* Detail page - hidden from tabs, opened via router.push(...) */}
      <Stack.Screen name="view" />
    </Stack>
  );
}