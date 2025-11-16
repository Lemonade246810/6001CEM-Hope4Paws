import { AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";
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
import Loading from "../components/Loading";
import { useAuth } from "../context/authContext";

export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");

  const handleRegister = async () => {
    if (!usernameRef.current || !emailRef.current || !passwordRef.current) {
      Alert.alert("Sign Up", "Please fill all the fields!");
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
      router.replace("/(app)/signIn");
    }
  };

  return (
    <View className="flex-1 bg-[#FFF7ED]">
      <StatusBar style="dark" />
      <View
        style={{ paddingTop: hp(3), paddingHorizontal: wp(5) }}
        className="flex-1 gap-10"
      >
        <View className="items-center">
          <Image
            style={{ height: hp(35) }}
            resizeMode="contain"
            source={require('../assets/images/kitten-puppy-signUp.png')}

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
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
            >
              <FontAwesome5 name="user" size={hp(3)} color="gray" />
              <TextInput
                onChangeText={(value) => (usernameRef.current = value)}
                style={{ fontSize: hp(2) }}
                className="flex-1 font-semibold text-neutral-500"
                placeholder="Username"
                placeholderTextColor="gray"
              />
            </View>

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

            <View className="flex-row justify-center">
              <Text
                style={{ fontSize: hp(1.7) }}
                className="font-semibold text-neutral-400"
              >
                Already have an account?{" "}
              </Text>
              <Pressable onPress={() => router.push("/(app)/signIn")}>
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
