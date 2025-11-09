import { StyleSheet } from "react-native";

export const adminColors = {
  primary: "#1976D2",
  secondary: "#64B5F6",
  background: "#FFFFFF",
  card: "#F8F9FA",
  text: "#212121",
  accent: "#FFB300",
  danger: "#E53935",
};

export const adminStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: adminColors.background,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: adminColors.primary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: adminColors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold", color: adminColors.text },
  subtitle: { fontSize: 15, color: "#666", marginTop: 4 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    borderRadius: 6,
    paddingVertical: 8,
    width: "48%",
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: adminColors.primary,
  },
  buttonDanger: {
    backgroundColor: adminColors.danger,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});