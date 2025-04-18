import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Animated,
  StyleSheet
} from "react-native";
import { Search, Package, X, CheckCircle2, XCircle } from 'lucide-react-native';
import products from "../../db/products";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../../config";
import { LinearGradient } from 'expo-linear-gradient';
import { useCustomFonts } from '../fonts';

interface Product {
  id: number;
  name: string;
}

const SearchBarWithModal = () => {
  const fontsLoaded = useCustomFonts();
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [productStatus, setProductStatus] = useState("");
  const [productAllergies, setProductAllergies] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (productStatus) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [productStatus]);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const filterProducts = useCallback(
    (text: string) => {
      if (text.trim() === "") {
        setFilteredData([]);
      } else {
        const filtered = products.filter((item) =>
          item.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredData(filtered.slice(0, 5));
      }
    },
    []
  );

  const debouncedSearch = useMemo(() => debounce(filterProducts, 300), [filterProducts]);

  const handleSearch = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const checkAllergy = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      let userAllergies = null;
      if (token) {
        const user = JSON.parse(token);
        userAllergies = user.allergy;
      }
      if (!userAllergies) {
        Alert.alert("Error", "No allergies found in your profile.");
        return;
      }
      const payload = {
        productName: selectedProduct.name,
        userAllergies: userAllergies,
      };
      console.log(payload);
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
        return;
      }
      const result = await response.json();
      setProductAllergies(result.allergens);
      setProductStatus(result.status === "safe" ? "Safe to eat" : "Not Safe to eat");
    } catch (error) {
      console.error("Allergy detection error:", error);
      Alert.alert("Error", "Failed to check allergies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setProductStatus("");
    setProductAllergies(null);
    setModalVisible(true);
    scaleAnim.setValue(0);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
    setProductStatus("");
    setProductAllergies(null);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#60A5FA', '#3B82F6', '#2563EB']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Search Products</Text>
          <Text style={styles.headerSubtitle}>Find and check allergens in your favorite products</Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={24} color="#2563EB" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={handleSearch}
          />
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          style={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.productItem}
              onPress={() => openModal(item)}
            >
              <Package size={24} color="#2563EB" />
              <Text style={styles.productName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Package size={24} color="#1E40AF" />
                <Text style={styles.modalTitle}>Product Details</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeModal}
              >
                <X size={24} color="#1E40AF" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Checking for allergens...</Text>
              </View>
            ) : productStatus ? (
              <View style={styles.resultContainer}>
                <Animated.View 
                  style={[styles.statusIconContainer, { transform: [{ scale: scaleAnim }] }]}
                >
                  {productStatus === "Safe to eat" ? (
                    <CheckCircle2 size={60} color="#10B981" />
                  ) : (
                    <XCircle size={60} color="#EF4444" />
                  )}
                </Animated.View>
                <Text style={styles.productTitle}>
                  {selectedProduct?.name}
                </Text>
                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[
                      styles.detailValue,
                      productStatus === "Safe to eat" ? styles.safeText : styles.notSafeText
                    ]}>
                      {productStatus}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Allergens:</Text>
                    <Text style={styles.detailValue}>
                      {productAllergies || "None"}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.checkContainer}>
                <Text style={styles.productTitle}>
                  {selectedProduct?.name}
                </Text>
                <TouchableOpacity 
                  style={styles.checkButton}
                  onPress={checkAllergy}
                >
                  <Text style={styles.checkButtonText}>Check for Allergens</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
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
  searchContainer: {
    flex: 1,
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E40AF',
    fontFamily: 'Fredoka',
  },
  listContainer: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productName: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '500',
    fontFamily: 'Fredoka-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginLeft: 12,
    fontFamily: 'Fredoka-Bold',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
    fontFamily: 'Fredoka-Medium',
  },
  resultContainer: {
    alignItems: 'center',
  },
  statusIconContainer: {
    marginBottom: 16,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Fredoka-Bold',
  },
  detailsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'Fredoka-Medium',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Fredoka-Bold',
  },
  safeText: {
    color: '#10B981',
  },
  notSafeText: {
    color: '#EF4444',
  },
  checkContainer: {
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  checkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Fredoka-Medium',
  },
  headerIcon: {
    marginBottom: 16,
  },
});

export default SearchBarWithModal;
