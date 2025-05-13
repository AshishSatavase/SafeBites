import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Shield, Zap, Microscope, Search, Camera } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCustomFonts } from '../fonts';

export default function Index() {
  const fontsLoaded = useCustomFonts();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Enhanced Hero Section with Gradient */}
      <LinearGradient
        colors={['#1E40AF', '#2563EB', '#3B82F6']}
        style={styles.heroGradient}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Welcome to{'\n'}<Text style={styles.appName}>SafeBites</Text></Text>
          <Text style={styles.heroSubtitle}>Your Personal Allergen{'\n'}Detection Assistant</Text>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/scan')}
        >
          <Camera size={32} color="#2563EB" />
          <Text style={styles.actionText}>Scan Product</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/searchBar')}
        >
          <Search size={32} color="#2563EB" />
          <Text style={styles.actionText}>Search Product</Text>
        </TouchableOpacity>
      </View>

      {/* How It Works - Enhanced */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          {[
            "Scan or search for any food product",
            "Get instant allergen analysis based on your profile",
            "View detailed safety information",
            "Make informed food choices"
          ].map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Why Choose SafeBites - Vertical Layout */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Why Choose SafeBites?</Text>
        <View style={styles.featuresContainer}>
          {[
            { 
              Icon: Shield, 
              title: 'Safe & Reliable', 
              description: 'Accurate allergen detection for your safety' 
            },
            { 
              Icon: Zap, 
              title: 'Quick & Easy', 
              description: 'Instant results with just a scan' 
            },
            { 
              Icon: Microscope, 
              title: 'Complete Coverage', 
              description: 'Comprehensive allergen database' 
            },
          ].map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <feature.Icon size={24} color="#2563EB" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Call to Action */}
      <LinearGradient
        colors={['#2563EB', '#1E40AF']}
        style={styles.ctaContainer}
      >
        <Text style={styles.ctaTitle}>Ready to Eat with Confidence?</Text>
        <Text style={styles.ctaSubtitle}>Start scanning products now to ensure they're safe for you</Text>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => router.push('/searchBar')}
        >
          <Text style={styles.ctaButtonText}>Get Started</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  heroGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 44,
    fontFamily: 'Fredoka-Bold',
  },
  appName: {
    fontFamily: 'cursive',
    fontSize: 40,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#E0F2FE',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    fontFamily: 'Fredoka-Medium',
  },
  actionsContainer: {
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
  sectionContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 20,
    fontFamily: 'Fredoka-Bold',
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
    fontFamily: 'Fredoka-Medium',
  },
  featureDescription: {
    color: '#64748B',
    lineHeight: 20,
    fontFamily: 'Fredoka',
  },
  stepsContainer: {
    gap: 12,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
  },
  stepNumber: {
    backgroundColor: '#2563EB',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Fredoka-Bold',
  },
  stepText: {
    flex: 1,
    color: '#1E40AF',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Fredoka',
  },
  ctaContainer: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Fredoka-Bold',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#BFDBFE',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Fredoka',
  },
  ctaButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: 'Fredoka-Medium',
  },
});