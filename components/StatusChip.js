import { StyleSheet, Text, View } from "react-native";

export default function StatusChip({ status }) {
  const colorStyles = {
    Pending:  { backgroundColor: "#FEF3C7", textColor: "#92400E" },   // yellow
    Assigned: { backgroundColor: "#DBEAFE", textColor: "#1E40AF" },   // blue
    Completed:{ backgroundColor: "#DCFCE7", textColor: "#166534" },   // green
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#f87171" }; // red
      case "Assigned":
        return { backgroundColor: "#3b82f6" }; // blue
      case "Completed":
        return { backgroundColor: "#22c55e" }; // green
      default:
        return { backgroundColor: "#6b7280" }; // gray
    }
  };

  const { backgroundColor, textColor } =
    colorStyles[status] || colorStyles.Pending;

  return (
    <View style={[styles.chip, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  text: {
    fontWeight: "600",
    fontSize: 12,
  },
});
