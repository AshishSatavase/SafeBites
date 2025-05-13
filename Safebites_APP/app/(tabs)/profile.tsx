import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Modal, TextInput, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SimpleLineIcons, MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCustomFonts } from '../fonts';
import axios from 'axios';

const ALLERGIES = [
  { label: "Milk", value: "Milk" },
  { label: "Egg", value: "Egg" },
  { label: "Peanuts", value: "Nut" },
  { label: "Fish", value: "Fish" },
  { label: "Crustacean", value: "Crustacean" },
  { label: "Soy", value: "Soy" },
  { label: "Sulphite", value: "Sulphite" },
];

interface User {
  name: string;
  age: string;
  allergy: string;
  dietPreference: string;
  userId: string;
}

const Profile = () => {
  const fontsLoaded = useCustomFonts();
  const [user, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedAge, setEditedAge] = useState('');
  const [editedDietPreference, setEditedDietPreference] = useState<'veg' | 'nonveg'>('veg');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const user = JSON.parse(token);
        setUserData(user);
        setEditedName(user.name);
        setEditedAge(user.age);
        setEditedDietPreference(user.dietPreference);
        setSelectedAllergies(user.allergy.split(',').map((a: string) => a.trim()));
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  };

  const handleAllergySelect = (allergy: string) => {
    if (!selectedAllergies.includes(allergy)) {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
    setShowAllergyModal(false);
  };

  const handleAllergyRemove = (allergyToRemove: string) => {
    setSelectedAllergies(selectedAllergies.filter(allergy => allergy !== allergyToRemove));
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await axios.put("https://safebites-somw.onrender.com/updateprofile", {
        userId: user.userId,
        name: editedName,
        age: editedAge,
        allergy: selectedAllergies.join(", "),
        dietPreference: editedDietPreference
      });

      if (response.status === 200 && response.data.status === "ok") {
        await AsyncStorage.setItem("token", JSON.stringify(response.data.user));
        setUserData(response.data.user);
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeToken = async () => {
    try {
      await AsyncStorage.removeItem("token");
      console.log("Token removed successfully");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  };

  const logout = () => {
    removeToken();
    router.navigate("/login");
  };

  useEffect(() => {
    getUserData();
  }, []);

  const getAllergies = () => {
    return user?.allergy.split(',').map(allergy => allergy.trim()) || [];
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {user ? (
        <>
          <LinearGradient
            colors={['#60A5FA', '#3B82F6', '#2563EB']}
            style={styles.headerGradient}
          >
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Allergy Detection Profile</Text>
             
            </View>
            
            <View style={styles.profileSection}>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userTitle}>Safety First Member</Text>
              </View>
              <View style={styles.profileImageContainer}>
                <Image
                  source={require("../../assets/images/Login.png")}
                  style={styles.profileImage}
                />
              </View>
            </View>
          </LinearGradient>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={24} color="#2563EB" />
              <Text style={styles.statValue}>{user.age}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="nutrition-outline" size={24} color="#2563EB" />
              <Text style={styles.statValue}>{getAllergies().length}</Text>
              <Text style={styles.statLabel}>Allergies</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="restaurant-outline" size={24} color="#2563EB" />
              <Text style={styles.statValue}>Active</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>

          {/* Detailed Information */}
          <View style={styles.detailsContainer}>
            {/* Diet Preferences */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="restaurant" size={24} color="#2563EB" />
                <Text style={styles.cardTitle}>Dietary Preferences</Text>
              </View>
              <View style={styles.dietPreferenceDisplay}>
                {user.dietPreference === 'veg' ? (
                  <View style={styles.dietIndicator}>
                    <View style={[styles.dietDot, styles.vegDot]} />
                    <Text style={styles.dietText}>Veg</Text>
                  </View>
                ) : (
                  <View style={styles.dietIndicator}>
                    <View style={[styles.dietDot, styles.nonVegDot]} />
                    <Text style={styles.dietText}>Non-Veg</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Allergies */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="warning" size={24} color="#2563EB" />
                <Text style={styles.cardTitle}>Your Allergies</Text>
              </View>
              <View style={styles.allergyContainer}>
                {getAllergies().map((allergy, index) => (
                  <View key={index} style={styles.allergyTag}>
                    <Text style={styles.allergyText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Safety Tips */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark" size={24} color="#2563EB" />
                <Text style={styles.cardTitle}>Safety Tips</Text>
              </View>
              <Text style={styles.cardContent}>
                Always scan products before consumption and keep your allergy profile updated.
              </Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => setIsEditing(true)}
            >
              <LinearGradient
                colors={['#60A5FA', '#3B82F6']}
                style={styles.editProfileGradient}
              >
                <Ionicons name="pencil" size={24} color="white" />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Enhanced Logout Button */}
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.logoutGradient}
              >
                <SimpleLineIcons name="logout" size={24} color="white" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Edit Profile Modal */}
          <Modal
            visible={isEditing}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsEditing(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <TouchableOpacity onPress={() => setIsEditing(false)}>
                    <Ionicons name="close" size={24} color="#1E40AF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Name Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={styles.input}
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Enter your name"
                    />
                  </View>

                  {/* Age Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Age</Text>
                    <TextInput
                      style={styles.input}
                      value={editedAge}
                      onChangeText={setEditedAge}
                      placeholder="Enter your age"
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Diet Preference */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Diet Preference</Text>
                    <View style={styles.dietPreferenceContainer}>
                      <TouchableOpacity
                        style={[
                          styles.dietButton,
                          editedDietPreference === 'veg' && styles.dietButtonActive
                        ]}
                        onPress={() => setEditedDietPreference('veg')}
                      >
                        <Text style={[
                          styles.dietButtonText,
                          editedDietPreference === 'veg' && styles.dietButtonTextActive
                        ]}>Veg</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.dietButton,
                          editedDietPreference === 'nonveg' && styles.dietButtonActive
                        ]}
                        onPress={() => setEditedDietPreference('nonveg')}
                      >
                        <Text style={[
                          styles.dietButtonText,
                          editedDietPreference === 'nonveg' && styles.dietButtonTextActive
                        ]}>Non-Veg</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Allergies Selection */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Allergies</Text>
                    <TouchableOpacity
                      style={styles.allergyButton}
                      onPress={() => setShowAllergyModal(true)}
                    >
                      <Text style={styles.allergyButtonText}>Select Allergies</Text>
                      <Ionicons name="chevron-down" size={20} color="#1E40AF" />
                    </TouchableOpacity>

                    <View style={styles.selectedAllergiesContainer}>
                      {selectedAllergies.map((allergy) => (
                        <View key={allergy} style={styles.allergyTag}>
                          <Text style={styles.allergyText}>{allergy}</Text>
                          <TouchableOpacity onPress={() => handleAllergyRemove(allergy)}>
                            <Ionicons name="close-circle" size={16} color="#1E40AF" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Update Button */}
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateProfile}
                    disabled={isLoading}
                  >
                    <Text style={styles.updateButtonText}>
                      {isLoading ? "Updating..." : "Update Profile"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>

            {/* Allergies Selection Modal */}
            <Modal
              visible={showAllergyModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowAllergyModal(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Allergies</Text>
                    <TouchableOpacity onPress={() => setShowAllergyModal(false)}>
                      <Ionicons name="close" size={24} color="#1E40AF" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={ALLERGIES}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.allergyOption}
                        onPress={() => handleAllergySelect(item.value)}
                      >
                        <Text style={styles.allergyOptionText}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>
          </Modal>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 16,
    color: '#E0F2FE',
    fontFamily: 'Fredoka-Medium',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Fredoka-Medium',
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Fredoka-Bold',
  },
  userTitle: {
    fontSize: 16,
    color: '#BFDBFE',
    marginTop: 4,
    fontFamily: 'Fredoka-Medium',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: -30,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginTop: 8,
    fontFamily: 'Fredoka-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'Fredoka',
  },
  detailsContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginLeft: 12,
    fontFamily: 'Fredoka-Bold',
  },
  cardContent: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    fontFamily: 'Fredoka',
  },
  allergyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  allergyText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Fredoka-Medium',
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    fontFamily: 'Fredoka-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
    fontFamily: 'Fredoka-Medium',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    fontFamily: 'Fredoka-Bold',
  },
  modalBody: {
    maxHeight: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#1E40AF',
    marginBottom: 8,
    fontFamily: 'Fredoka-Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Fredoka',
  },
  dietPreferenceContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dietButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
  },
  dietButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dietButtonText: {
    color: '#1E40AF',
    fontSize: 16,
    fontFamily: 'Fredoka-Medium',
  },
  dietButtonTextActive: {
    color: 'white',
  },
  allergyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
  },
  allergyButtonText: {
    color: '#1E40AF',
    fontSize: 16,
    fontFamily: 'Fredoka-Medium',
  },
  selectedAllergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  allergyOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  allergyOptionText: {
    fontSize: 16,
    color: '#1E40AF',
    fontFamily: 'Fredoka',
  },
  updateButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Fredoka-Bold',
  },
  dietPreferenceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dietIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dietDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vegDot: {
    backgroundColor: '#22C55E',
  },
  nonVegDot: {
    backgroundColor: '#EF4444',
  },
  dietText: {
    fontSize: 16,
    color: '#1E40AF',
    fontFamily: 'Fredoka-Medium',
  },
  editProfileButton: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  editProfileText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    fontFamily: 'Fredoka-Bold',
  },
});

export default Profile;