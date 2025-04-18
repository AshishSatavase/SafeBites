import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { RadioButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { FontAwesome, Ionicons } from "@expo/vector-icons"; // Import FontAwesome
import axios from "axios"; // Import axios
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { useRouter } from "expo-router"; // Import useRouter for navigation
import * as FileSystem from "expo-file-system";


const SignUp: React.FC = () => {
  const [selectedAllergy, setSelectedAllergy] = useState<string>("");
  const [dietPreference, setDietPreference] = useState<"veg" | "nonveg">("veg");
  const [name,setName]=useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const router = useRouter(); // useRouter for navigation

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // Navigate to the tabs page if token exists
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking token:", error);
      }
    };

    checkToken();
  }, []); // Run only once on component load

  // Handle Sign-Up
  const handleSignUp = async () => {
    setIsLoading(true); // Set loading to true
    try {
      const response = await axios.post("https://safebites-somw.onrender.com/register", {
        name,
        userId: username,
        age,  // Ensure age is a string if expected
        password,
        allergy: selectedAllergy,
        dietPreference
      });

      // Log the full response for debugging
      console.log(response);

      // Check if the registration was successful based on response status
      if (response.status === 200 && response.data.status === "ok") {
          await AsyncStorage.setItem("token", JSON.stringify(response.data.user));  // Save the user data as token
          router.push("/(tabs)"); // Navigate to the tabs page
      } else {
          alert("Registration failed: " + response.data.message);  // Show error message if registration fails
      }

    } catch (error) {
      console.error("Error during registration:", error); // Log the error
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false); // Set loading to false
    }
};

  return (
    <ScrollView className="flex-1 bg-white">
      <Image
        source={require("../assets/images/Signup.png")}
        className="h-[300px] w-full object-cover"
      />
      <Text className="text-center text-3xl font-bold mb-5 color-blue-600 mt-5">Signup!!</Text>
      
      {/* Form Section */}
      <View className="flex justify-center items-center gap-6">
        {/* Username Input */}
        <View className="flex flex-row items-center border-2 rounded-2xl w-[300px] pl-2">
          <FontAwesome name="smile-o" size={20} className="mx-2" />
          <TextInput
            placeholder="Full Name"
            className="flex-1 p-3"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="flex flex-row items-center border-2 rounded-2xl w-[300px] pl-2">
          <Ionicons name="calendar-number-outline" size={20} className="mx-2" />
          <TextInput
            placeholder="Enter age"
            className="flex-1 p-3"
            value={age}
            onChangeText={setAge}
          />
        </View>

        <View className="flex flex-row items-center border-2 rounded-2xl w-[300px] pl-2">
          <FontAwesome name="user-o" size={20} className="mx-2" />
          <TextInput
            placeholder="Enter Username"
            className="flex-1 p-3"
            value={username}
            onChangeText={setUsername}
          />
        </View>


        {/* Password Input */}
        <View className="flex flex-row items-center border-2 rounded-2xl w-[300px] pl-2">
          <FontAwesome name="lock" size={20} className="mx-2" />
          <TextInput
            placeholder="Enter Password"
            secureTextEntry
            className="flex-1 p-3"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Confirm Password Input */}

        {/* Allergies Picker */}
        <Picker
          selectedValue={selectedAllergy}
          onValueChange={(itemValue) => setSelectedAllergy(itemValue)}
          style={{ height: 70, width: 300 }}
        >
          <Picker.Item label="Select Your Allergy" value="" />
          <Picker.Item label="Milk" value="Milk" />
          <Picker.Item label="Egg" value="Egg" />
          <Picker.Item label="Peanuts" value="Nut" />          
          <Picker.Item label="Fish" value="Fish" />
          <Picker.Item label="Crustacean" value="Crustacean" />
          <Picker.Item label="Soy" value="Soy" />
          <Picker.Item label="Sulphite" value="Sulphite" />
        </Picker>

        {/* Diet Preference Radio Buttons */}
        <View className="flex-row justify-around w-[300px] my-4">
          {/* Veg Radio Button */}
          <View className="flex-row items-center">
            <RadioButton
              value="veg"
              status={dietPreference === "veg" ? "checked" : "unchecked"}
              onPress={() => setDietPreference("veg")}
              color="green"
            />
            <Text className=" font-medium">Veg</Text>
          </View>

          {/* Non-Veg Radio Button */}
          <View className="flex-row items-center">
            <RadioButton
              value="nonveg"
              status={dietPreference === "nonveg" ? "checked" : "unchecked"}
              onPress={() => setDietPreference("nonveg")}
              color="maroon"
            />
            <Text className=" font-medium">Non-Veg</Text>
          </View>
        </View>


        {/* Sign-Up Button */}
        <TouchableOpacity
          onPress={handleSignUp}
          className="bg-blue-500 p-3 w-[300px] rounded-xl mb-32"
        >
          <Text className="text-center font-semibold text-xl text-white ">
            {isLoading ? "Signing Up..." : "Signup"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SignUp;
