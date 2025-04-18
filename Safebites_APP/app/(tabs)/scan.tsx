import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, Upload } from 'lucide-react-native';
import { AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import { config } from '../../config';
import { LinearGradient } from 'expo-linear-gradient';
import { useCustomFonts } from '../fonts';

const Scan = () => {
  const fontsLoaded = useCustomFonts();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const [productStatus, setProductStatus] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [productAllergies, setProductAllergies] = useState<string | null>(null);
  const [userAllergies, setUserAllergies] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const user = JSON.parse(token);
          setUserAllergies(user.allergy);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
  
    fetchToken();
  }, []);
  
  const ocrUrl = 'https://jaided.ai/api/ocr';
  const ocrHeaders = {
    username: 'atharva',
    apikey: 'EnGkQUW9Ag6GodIYmArKhQemB89IzrLn'
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera access is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Gallery access is required to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleOCR = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any);

      const ocrResponse = await fetch(ocrUrl, {
        method: 'POST',
        headers: ocrHeaders,
        body: formData,
      });

      if (!ocrResponse.ok) {
        throw new Error('Failed to process image');
      }

      const result = await ocrResponse.json();
      let maxArea = 0;
      let mainText = '';

      result.result.forEach((item: any) => {
        const bbox = item.bbox;
        const text = item.text;
        const [x1, y1] = bbox[0];
        const [x2, y2] = bbox[2];
        const area = (x2 - x1) * (y2 - y1);

        if (area > maxArea) {
          maxArea = area;
          mainText = text;
        }
      });

      if (mainText) {
        setDetectedText(mainText);
      } else {
        Alert.alert('No Text Detected', 'Please try again with a clearer image.');
      }
    } catch (error) {
      console.error('OCR error:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkAllergy = async () => {
    setLoading(true);
    try {
      if (!userAllergies) {
        Alert.alert("Error", "No allergies found in your profile.");
        return;
      }
  
      const payload = {
        productName: detectedText,
        userAllergies: userAllergies,
      };
  
      const response = await fetch(`https://safebites-somw.onrender.com/scanproduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setProductStatus("Not Safe to eat");
        setProductAllergies(userAllergies);
        setProductName(detectedText);
        return;
      }
  
      const result = await response.json();
      setProductName(result.productName);
      setProductAllergies(result.allergens);
      setProductStatus(result.status === "safe" ? "Safe to consume" : "Not safe to consume");
    } catch (error) {
      console.error("Allergy detection error:", error);
      Alert.alert("Error", "Failed to check allergies. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const retry = () => {
    setSelectedImage(null);
    setDetectedText(null);
    setProductStatus(null);
  };

  if (!fontsLoaded) {
    return null;
  }

  return loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>Processing your request...</Text>
    </View>
  ) : (
    <ScrollView style={styles.container}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#60A5FA', '#3B82F6', '#2563EB']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Scan Product</Text>
          <Text style={styles.headerSubtitle}>Check for allergens in your food products</Text>
        </View>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={openCamera}
        >
          <Camera size={32} color="#2563EB" />
          <Text style={styles.actionText}>Open Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={openGallery}
        >
          <Upload size={32} color="#2563EB" />
          <Text style={styles.actionText}>Upload Image</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview Section */}
      {selectedImage ? (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.previewImage}
          />
          <View style={styles.imageActionsContainer}>
            <TouchableOpacity
              style={[styles.imageActionButton, styles.scanButton]}
              onPress={handleOCR}
            >
              <MaterialIcons name="search" size={24} color="white" />
              <Text style={styles.actionButtonText}>Scan Product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageActionButton, styles.retryButton]}
              onPress={retry}
            >
              <AntDesign name="reload1" size={24} color="white" />
              <Text style={styles.actionButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Feather name="image" size={48} color="#1E40AF" />
          <Text style={styles.placeholderText}>Select an image to scan</Text>
        </View>
      )}

      {/* Detection Results */}
      {detectedText && (
        <View style={styles.resultsContainer}>
          <View style={styles.detectedTextCard}>
            <Text style={styles.cardTitle}>Detected Text</Text>
            <Text style={styles.detectedText}>{detectedText}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkAllergensButton}
            onPress={checkAllergy}
          >
            <Text style={styles.checkAllergensText}>Check for Allergens</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product Status Card */}
      {productStatus && (
        <View style={styles.productStatusCard}>
          <View style={styles.productHeader}>
            <Image
              source={{ uri: selectedImage || '' }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{productName}</Text>
              <View style={styles.divider} />
              <Text style={styles.allergenLabel}>
                Allergens: <Text style={styles.allergenText}>{productAllergies}</Text>
              </Text>
            </View>
          </View>

          <View style={[
            styles.statusContainer,
            productStatus === "Not Safe to eat" ? styles.notSafeStatus : styles.safeStatus
          ]}>
            <Text style={styles.statusText}>{productStatus}</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
    fontFamily: 'Fredoka-Medium',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Fredoka-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0F2FE',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Fredoka-Medium',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    fontFamily: 'Fredoka-Medium',
  },
  imagePreviewContainer: {
    padding: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 20,
    marginBottom: 16,
  },
  imageActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    justifyContent: 'center',
  },
  scanButton: {
    backgroundColor: '#2563EB',
  },
  retryButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Fredoka-Medium',
  },
  placeholderContainer: {
    margin: 16,
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Fredoka',
  },
  resultsContainer: {
    padding: 16,
  },
  detectedTextCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
    fontFamily: 'Fredoka-Bold',
  },
  detectedText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    fontFamily: 'Fredoka',
  },
  checkAllergensButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkAllergensText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Fredoka-Medium',
  },
  productStatusCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
    fontFamily: 'Fredoka-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  allergenLabel: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Fredoka',
  },
  allergenText: {
    color: '#1E40AF',
    fontWeight: '500',
    fontFamily: 'Fredoka-Medium',
  },
  statusContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  safeStatus: {
    backgroundColor: '#10B981',
  },
  notSafeStatus: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Fredoka-Bold',
  },
});

export default Scan;