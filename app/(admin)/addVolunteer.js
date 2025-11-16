import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { httpsCallable } from "firebase/functions";
import { functions } from "../../config/firebaseConfig";
import { useAuth } from "../../context/authContext";

export default function AddVolunteer() {
  const { user } = useAuth();

  // STATE
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Callable function
  const createVolunteerFn = httpsCallable(functions, "createVolunteerAccount");

  const handleSubmit = async () => {

    // ADMIN CHECK
    if (!user) {
      Alert.alert("Authentication error", "You must be logged in.");
      return;
    }

    if (user.role !== "admin") {
      Alert.alert("Permission denied", "Only admins can add volunteers.");
      return;
    }

    // FIELD CHECK
    if (!username || !email || !password) {
      Alert.alert(
        "Missing fields",
        "Username, email, and password are required."
      );
      return;
    }

    setLoading(true);

    try {
      // CALL CLOUD FUNCTION
      const response = await createVolunteerFn({
        username,
        email,
        phone,
        password,
      });

      Alert.alert("Success 🎉", "Volunteer account successfully created!");

      // RESET FIELDS
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");

    } catch (err) {
      console.error("❌ Volunteer creation error:", err);

      let message = "Failed to create volunteer.";

      if (err.code === "unauthenticated")
        message = "You must be logged in as an admin.";
      else if (err.code === "permission-denied")
        message = "Only admins can create volunteer accounts.";
      else if (err.code === "invalid-argument")
        message = "Missing or invalid input fields.";
      else if (err.code === "already-exists")
        message = "This email is already registered.";
      else if (err.message) 
        message = err.message;

      Alert.alert("Error", message);
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add New Volunteer</Text>

      <Text style={styles.label}>Full Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="volunteer@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Phone (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="012-3456789"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Password *</Text>
      <TextInput
        style={styles.input}
        placeholder="Minimum 6 characters"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Volunteer</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  label: {
    fontSize: 14,
    marginTop: 10,
    color: "#6B7280",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FCD34D",
    padding: 14,
    borderRadius: 10,
    marginTop: 5,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
