import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert, // For displaying alerts
} from "react-native";
import React, { useState, useEffect } from "react";
import { Link, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Login = () => {
  const router = useRouter();

  // State for User ID and Password inputs
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  // Check if the user is already logged in
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking token:", error);
      }
    };

    checkToken();
  }, []);

  // Function to handle login
  const handleLogin = async () => {
    if (!userId || !password) {
      Alert.alert("Error", "Please enter both User ID and Password");
      return;
    }

    try {
      const response = await axios.post("https://safebites-somw.onrender.com/login", {
        userId,password
    });
    if (response.status === 200) {
        await AsyncStorage.setItem("token", JSON.stringify(response.data.user));
        router.push("/(tabs)"); // Navigate to the tabs page
    }
} catch (error) {
    console.error("Error during LogIn:", error); // Log the error
    alert("Login failed. Please try again.");
} 

  };

  return (
    <ScrollView className="flex-1">
      <Image
        source={require("../assets/images/Login.png")}
        className="h-[400px] w-full object-cover"
      />
      <Text className="text-center text-3xl font-bold mb-5 text-blue-600">
        Login
      </Text>

      <View className="flex justify-center items-center gap-10">
        {/* User ID Input */}
        <View className="flex flex-row items-center border-2 rounded-2xl w-[300px] pl-2">
          <FontAwesome name="user-o" size={20} className="mx-2" />
          <TextInput
            placeholder="User ID"
            className="flex-1"
            value={userId}
            onChangeText={setUserId}
          />
        </View>

        {/* Password Input */}
        <View className="flex flex-row items-center border-2 rounded-2xl w-[300px] pl-2">
          <FontAwesome name="lock" size={20} className="mx-2" />
          <TextInput
            placeholder="Password"
            className="flex-1"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className="bg-blue-500 p-3 w-[300px] rounded-xl"
          onPress={handleLogin}
        >
          <Text className="text-center font-semibold text-xl text-white">
            Login
          </Text>
        </TouchableOpacity>
      </View>

      {/* Registration Link */}
      <Text className="text-center mt-10">
        Don't have an account?{" "}
        <Link href="/signup" className="text-blue-400 underline font-medium">
          Register now
        </Link>
      </Text>
    </ScrollView>
  );
};

export default Login;
