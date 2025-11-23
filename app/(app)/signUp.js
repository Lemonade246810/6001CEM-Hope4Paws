import { AntDesign, Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/authContext";

export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);

  const usernameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const confirmRef = useRef("");

  const [password, setPassword] = useState("");
  const [showRules, setShowRules] = useState(false);

  // ----------------------
  // PASSWORD VALIDATION
  // ----------------------
  const rules = {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const isStrong =
    rules.length && rules.upper && rules.lower && rules.number && rules.symbol;

  const getColor = (passed) => (passed ? "#10B981" : "#DC2626");

  // ----------------------
  // REGISTER HANDLER
  // ----------------------
  const handleRegister = async () => {
    if (!usernameRef.current || !emailRef.current || !passwordRef.current) {
      Alert.alert("Sign Up", "Please fill all the fields!");
      return;
    }

    if (!isStrong) {
      Alert.alert(
        "Weak Password",
        "Your password does not meet the strength requirements."
      );
      return;
    }

    if (passwordRef.current !== confirmRef.current) {
      Alert.alert("Password Error", "Passwords do not match!");
      return;
    }

    setLoading(true);
    const response = await register(
      emailRef.current,
      passwordRef.current,
      usernameRef.current
    );
    setLoading(false);

    if (!response.success) {
      Alert.alert("Sign Up", response.msg);
    } else {
      Alert.alert("Success", "Account created successfully!");
      router.replace("/signIn");
    }
  };

  return (
    <View className="flex-1 bg-[#FFF7ED]">
      <StatusBar style="dark" />

      <View
        style={{ paddingTop: hp(3), paddingHorizontal: wp(5) }}
        className="flex-1 gap-10"
      >
        {/* IMAGE */}
        <View className="items-center">
          <Image
            style={{ height: hp(35) }}
            resizeMode="contain"
            source={require("../../assets/images/kitten-puppy-signUp.png")}
          />
        </View>

        <View className="gap-8">
          <Text
            style={{ fontSize: hp(4) }}
            className="font-bold tracking-wider text-center text-neutral-700"
          >
            Sign Up
          </Text>

          <View className="gap-3">
            {/* Username */}
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
            >
              <FontAwesome5 name="user" size={hp(3)} color="gray" />
              <TextInput
                onChangeText={(v) => (usernameRef.current = v)}
                style={{ fontSize: hp(2) }}
                className="flex-1 font-semibold text-neutral-500"
                placeholder="Username"
                placeholderTextColor="gray"
              />
            </View>

            {/* Email */}
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
            >
              <Feather name="mail" size={hp(3)} color="gray" />
              <TextInput
                onChangeText={(v) => (emailRef.current = v)}
                style={{ fontSize: hp(2) }}
                className="flex-1 font-semibold text-neutral-500"
                placeholder="Email Address"
                placeholderTextColor="gray"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View>
              <View
                style={{ height: hp(7) }}
                className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
              >
                <AntDesign name="lock" size={hp(3)} color="gray" />
                <TextInput
                  onChangeText={(v) => {
                    passwordRef.current = v;
                    setPassword(v);
                  }}
                  onFocus={() => setShowRules(true)}
                  onBlur={() => setShowRules(false)}
                  style={{ fontSize: hp(2) }}
                  className="flex-1 font-semibold text-neutral-500"
                  placeholder="Password"
                  secureTextEntry
                  placeholderTextColor="gray"
                />
              </View>

              {/* FLOATING PASSWORD RULE BOX */}
              {showRules && (
                <View
                  style={{
                    marginTop: 8,
                    backgroundColor: "white",
                    padding: 12,
                    borderRadius: 10,
                    borderColor: "#e5e7eb",
                    borderWidth: 1,
                    elevation: 5,
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                  }}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
                  >
                    <Entypo
                      name={rules.length ? "check" : "cross"}
                      size={18}
                      color={getColor(rules.length)}
                    />
                    <Text style={{ marginLeft: 8, color: getColor(rules.length) }}>
                      At least 12 characters
                    </Text>
                  </View>

                  <View
                    style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
                  >
                    <Entypo
                      name={rules.upper ? "check" : "cross"}
                      size={18}
                      color={getColor(rules.upper)}
                    />
                    <Text style={{ marginLeft: 8, color: getColor(rules.upper) }}>
                      Contains uppercase letter
                    </Text>
                  </View>

                  <View
                    style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
                  >
                    <Entypo
                      name={rules.lower ? "check" : "cross"}
                      size={18}
                      color={getColor(rules.lower)}
                    />
                    <Text style={{ marginLeft: 8, color: getColor(rules.lower) }}>
                      Contains lowercase letter
                    </Text>
                  </View>

                  <View
                    style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
                  >
                    <Entypo
                      name={rules.number ? "check" : "cross"}
                      size={18}
                      color={getColor(rules.number)}
                    />
                    <Text style={{ marginLeft: 8, color: getColor(rules.number) }}>
                      Contains number
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Entypo
                      name={rules.symbol ? "check" : "cross"}
                      size={18}
                      color={getColor(rules.symbol)}
                    />
                    <Text style={{ marginLeft: 8, color: getColor(rules.symbol) }}>
                      Contains symbol (!@#$%^&)
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
            >
              <AntDesign name="lock" size={hp(3)} color="gray" />
              <TextInput
                onChangeText={(v) => (confirmRef.current = v)}
                style={{ fontSize: hp(2) }}
                className="flex-1 font-semibold text-neutral-500"
                placeholder="Confirm Password"
                secureTextEntry
                placeholderTextColor="gray"
              />
            </View>

            {/* Submit Button */}
            {loading ? (
              <View className="flex-row justify-center">
                <Loading size={hp(8)} />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleRegister}
                style={{ height: hp(6) }}
                className="bg-amber-400 rounded-xl justify-center items-center"
              >
                <Text
                  style={{ fontSize: hp(3) }}
                  className="text-white font-bold tracking-wider"
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            )}

            {/* Redirect to Sign In */}
            <View className="flex-row justify-center">
              <Text
                style={{ fontSize: hp(1.7) }}
                className="font-semibold text-neutral-400"
              >
                Already have an account?{" "}
              </Text>
              <Pressable onPress={() => router.push("/signIn")}>
                <Text
                  style={{ fontSize: hp(1.7) }}
                  className="font-bold text-amber-500"
                >
                  Sign In
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
