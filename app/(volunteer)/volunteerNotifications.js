import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function VolunteerNotifications() {
  const mockNotifications = [
    { id: 1, message: "You've been assigned a new rescue case 🐶" },
    { id: 2, message: "A user updated a report in your area 📍" },
    { id: 3, message: "Meeting scheduled for Sunday at 3 PM 📅" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Volunteer Notifications</Text>

      {mockNotifications.map((n) => (
        <View key={n.id} style={styles.notificationCard}>
          <Text style={styles.text}>{n.message}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  notificationCard: {
    backgroundColor: "#DBEAFE",
    borderRadius: 10,
    padding: 14,
  },
  text: {
    fontSize: 15,
    color: "#1E293B",
  },
});
