import { AntDesign, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { sendPasswordResetEmail } from "firebase/auth";
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
import { auth } from "../../config/firebaseConfig";
import { useAuth } from "../../context/authContext";

export default function SignIn() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const emailRef = useRef("");
  const passwordRef = useRef("");

  // Forgot Password
  const handleForgotPassword = async () => {
    if (!emailRef.current) {
      Alert.alert("Forgot Password", "Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, emailRef.current);
      Alert.alert("Password Reset", "A reset link has been sent to your email.");
    } catch (error) {
      Alert.alert("Error", "Unable to send reset link. Please try again.");
    }
  };

  // Login Handler
  const handleLogin = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Sign In", "Please fill all the fields!");
      return;
    }

    setLoading(true);
    const response = await login(emailRef.current, passwordRef.current);
    setLoading(false);

    if (!response.success) {
      Alert.alert("Sign In", response.msg);
      return;
    }

    // Unified navigation (no more admin/volunteer separation)
    router.replace("/home");
  };

  return (
    <View className="flex-1 bg-[#FFF7ED]">
      <StatusBar style="dark" />
      <View
        style={{ paddingTop: hp(3), paddingHorizontal: wp(5) }}
        className="flex-1 gap-10"
      >
        {/* App Image */}
        <View className="items-center">
          <Image
            style={{ height: hp(35) }}
            resizeMode="contain"
            source={require("../../assets/images/kitten-puppy-image.png")}
          />
        </View>

        <View className="gap-8">
          <Text
            style={{ fontSize: hp(4) }}
            className="font-bold tracking-wider text-center text-neutral-700"
          >
            Sign In
          </Text>

          {/* Inputs */}
          <View className="gap-3">
            {/* Email */}
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
            >
              <Feather name="mail" size={hp(3)} color="gray" />
              <TextInput
                onChangeText={(value) => (emailRef.current = value)}
                style={{ fontSize: hp(2) }}
                className="flex-1 font-semibold text-neutral-500"
                placeholder="Email Address"
                placeholderTextColor="gray"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
            >
              <AntDesign name="lock" size={hp(3)} color="gray" />
              <TextInput
                onChangeText={(value) => (passwordRef.current = value)}
                style={{ fontSize: hp(2) }}
                className="flex-1 font-semibold text-neutral-500"
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="gray"
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text
                style={{ fontSize: hp(1.7) }}
                className="font-semibold text-right text-amber-500"
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <View>
              {loading ? (
                <View className="flex-row justify-center">
                  <Loading size={hp(8)} />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleLogin}
                  style={{ height: hp(6) }}
                  className="bg-amber-400 rounded-xl justify-center items-center"
                >
                  <Text
                    style={{ fontSize: hp(3) }}
                    className="text-white font-bold tracking-wider"
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sign Up Redirect */}
            <View className="flex-row justify-center">
              <Text
                style={{ fontSize: hp(1.7) }}
                className="font-semibold text-neutral-400"
              >
                Don't have an account?{" "}
              </Text>
              <Pressable onPress={() => router.push("/signUp")}>
                <Text
                  style={{ fontSize: hp(1.7) }}
                  className="font-bold text-amber-500"
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
