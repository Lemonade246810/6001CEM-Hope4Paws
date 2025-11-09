import { StyleSheet } from "react-native";

export const adminStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12,
  },
  searchBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  filterBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
  },
  card: {
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fcd34d",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#fbbf24",
  },
  buttonDanger: {
    backgroundColor: "#ef4444",
  },
  buttonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#94A3B8",
    marginTop: 8,
    fontSize: 15,
  },
});
