import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { RadioButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";

const ALLERGIES = [
  { label: "Milk", value: "Milk" },
  { label: "Egg", value: "Egg" },
  { label: "Peanuts", value: "Nut" },
  { label: "Fish", value: "Fish" },
  { label: "Crustacean", value: "Crustacean" },
  { label: "Soy", value: "Soy" },
  { label: "Sulphite", value: "Sulphite" },
];

const SignUp: React.FC = () => {
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [dietPreference, setDietPreference] = useState<"veg" | "nonveg">("veg");
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

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

  const handleAllergySelect = (allergy: string) => {
    if (!selectedAllergies.includes(allergy)) {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
    setShowAllergyModal(false);
  };

  const handleAllergyRemove = (allergyToRemove: string) => {
    setSelectedAllergies(selectedAllergies.filter(allergy => allergy !== allergyToRemove));
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("https://safebites-somw.onrender.com/register", {
        name,
        userId: username,
        age,
        password,
        allergy: selectedAllergies.join(", "), // Join allergies with comma and space
        dietPreference
      });

      if (response.status === 200 && response.data.status === "ok") {
        await AsyncStorage.setItem("token", JSON.stringify(response.data.user));
        router.push("/(tabs)");
      } else {
        alert("Registration failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <Image
        source={require("../assets/images/Signup.png")}
        className="h-[300px] w-full object-cover"
      />
      <Text className="text-center text-3xl font-bold mb-5 color-blue-600 mt-5">Signup!!</Text>
      
      <View className="flex justify-center items-center gap-6">
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

        {/* Allergies Selection */}
        <View className="w-[300px]">
          <TouchableOpacity
            onPress={() => setShowAllergyModal(true)}
            className="flex flex-row items-center border-2 rounded-2xl p-3"
          >
            <FontAwesome name="exclamation-circle" size={20} className="mx-2" />
            <Text className="flex-1">Select Allergies</Text>
            <Ionicons name="chevron-down" size={20} />
          </TouchableOpacity>

          {/* Selected Allergies Display */}
          <View className="flex-row flex-wrap mt-2 gap-2">
            {selectedAllergies.map((allergy) => (
              <View
                key={allergy}
                className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center"
              >
                <Text className="text-blue-800 mr-1">{allergy}</Text>
                <TouchableOpacity onPress={() => handleAllergyRemove(allergy)}>
                  <Ionicons name="close-circle" size={16} color="#1e40af" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Diet Preference Radio Buttons */}
        <View className="flex-row justify-around w-[300px] my-4">
          <View className="flex-row items-center">
            <RadioButton
              value="veg"
              status={dietPreference === "veg" ? "checked" : "unchecked"}
              onPress={() => setDietPreference("veg")}
              color="green"
            />
            <Text className="font-medium">Veg</Text>
          </View>

          <View className="flex-row items-center">
            <RadioButton
              value="nonveg"
              status={dietPreference === "nonveg" ? "checked" : "unchecked"}
              onPress={() => setDietPreference("nonveg")}
              color="maroon"
            />
            <Text className="font-medium">Non-Veg</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSignUp}
          className="bg-blue-500 p-3 w-[300px] rounded-xl mb-32"
        >
          <Text className="text-center font-semibold text-xl text-white">
            {isLoading ? "Signing Up..." : "Signup"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Allergies Modal */}
      <Modal
        visible={showAllergyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAllergyModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Select Allergies</Text>
              <TouchableOpacity onPress={() => setShowAllergyModal(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ALLERGIES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAllergySelect(item.value)}
                  className="p-3 border-b border-gray-200"
                >
                  <Text className="text-lg">{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default SignUp;
