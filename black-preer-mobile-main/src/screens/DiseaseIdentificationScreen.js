import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const isSmallScreen = width < 480;
const isMediumScreen = width >= 480 && width < 768;
const isWideScreen = width >= 768;

export default function DiseaseIdentificationScreen({ navigation }) {
  const handleStartDetection = () => {
    navigation.navigate('DiseaseUpload');
  };

  const handleViewHistory = () => {
    navigation.navigate('DiseaseHistory');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroBadge}>Black Pepper AI</Text>

          <Text style={styles.heroTitle}>
            Black Pepper Leaf{'\n'}Disease Identification
          </Text>

          <Text style={styles.heroSubtitle}>
            Detect diseases in black pepper leaves using computer vision and deep
            learning. Upload a leaf image and receive fast, intelligent predictions
            with confidence levels and treatment guidance.
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSubtitle}>
          Choose an option to start a new detection or review previous results
        </Text>

        <View
          style={[
            styles.actionsContainer,
            isWideScreen && styles.actionsContainerWide,
          ]}
        >
          <TouchableOpacity
            style={[styles.actionCard, styles.primaryCard]}
            onPress={handleStartDetection}
            activeOpacity={0.85}
          >
            <View style={styles.cardInner}>
              <Text style={styles.actionEmoji}>📸</Text>
              <Text style={styles.primaryCardTitle}>Start Detection</Text>
              <Text style={styles.primaryCardText}>
                Upload a leaf image and get an AI-powered disease detection result.
              </Text>

              <View style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Open Detection</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.secondaryCard]}
            onPress={handleViewHistory}
            activeOpacity={0.85}
          >
            <View style={styles.cardInner}>
              <Text style={styles.actionEmoji}>🕘</Text>
              <Text style={styles.secondaryCardTitle}>View History</Text>
              <Text style={styles.secondaryCardText}>
                Check your previous detections and review past disease analysis
                records.
              </Text>

              <View style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Open History</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  heroSection: {
    paddingTop: isSmallScreen ? 32 : isMediumScreen ? 44 : 60,
    paddingBottom: isSmallScreen ? 24 : isMediumScreen ? 28 : 36,
    paddingHorizontal: isSmallScreen ? 14 : 20,
    backgroundColor: '#f5f9f4',
  },

  heroContent: {
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: 900,
  },

  heroBadge: {
    backgroundColor: '#dcefdc',
    color: '#2d5016',
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '700',
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 5 : 6,
    borderRadius: 20,
    marginBottom: isSmallScreen ? 12 : 16,
    overflow: 'hidden',
  },

  heroTitle: {
    fontSize: isSmallScreen ? 20 : isMediumScreen ? 24 : 28,
    fontWeight: '900',
    color: '#2d5016',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: isSmallScreen ? 28 : isMediumScreen ? 32 : 36,
  },

  heroSubtitle: {
    fontSize: isSmallScreen ? 13 : isMediumScreen ? 15 : 16,
    color: '#2d5016',
    textAlign: 'center',
    lineHeight: isSmallScreen ? 20 : isMediumScreen ? 22 : 24,
    opacity: 0.8,
    maxWidth: 760,
    paddingHorizontal: isSmallScreen ? 4 : 0,
  },

  actionsSection: {
    paddingVertical: isSmallScreen ? 20 : 28,
    paddingHorizontal: isSmallScreen ? 14 : 20,
    backgroundColor: '#ffffff',
  },

  sectionTitle: {
    fontSize: isSmallScreen ? 20 : isMediumScreen ? 22 : 24,
    fontWeight: '800',
    color: '#2d5016',
    textAlign: 'center',
    marginBottom: 8,
  },

  sectionSubtitle: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: isSmallScreen ? 18 : 20,
    marginBottom: isSmallScreen ? 18 : 24,
    paddingHorizontal: 10,
  },

  actionsContainer: {
    flexDirection: 'column',
    gap: isSmallScreen ? 12 : 16,
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
  },

  actionsContainerWide: {
    flexDirection: 'row',
  },

  actionCard: {
    flex: 1,
    borderRadius: isSmallScreen ? 16 : 22,
    padding: isSmallScreen ? 16 : isMediumScreen ? 18 : 22,
    minHeight: isSmallScreen ? 190 : isMediumScreen ? 210 : 230,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },

  primaryCard: {
    backgroundColor: '#eef8e8',
    borderWidth: 1,
    borderColor: '#d8ebcb',
  },

  secondaryCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  actionEmoji: {
    fontSize: isSmallScreen ? 26 : isMediumScreen ? 30 : 34,
    marginBottom: isSmallScreen ? 10 : 14,
    textAlign: 'center',
  },

  primaryCardTitle: {
    fontSize: isSmallScreen ? 18 : isMediumScreen ? 20 : 22,
    fontWeight: '800',
    color: '#1f3d0f',
    marginBottom: 8,
    textAlign: 'center',
  },

  secondaryCardTitle: {
    fontSize: isSmallScreen ? 18 : isMediumScreen ? 20 : 22,
    fontWeight: '800',
    color: '#2d5016',
    marginBottom: 8,
    textAlign: 'center',
  },

  primaryCardText: {
    fontSize: isSmallScreen ? 13 : 15,
    color: '#35521f',
    lineHeight: isSmallScreen ? 19 : 22,
    marginBottom: 14,
    textAlign: 'center',
    maxWidth: 320,
  },

  secondaryCardText: {
    fontSize: isSmallScreen ? 13 : 15,
    color: '#5f6368',
    lineHeight: isSmallScreen ? 19 : 22,
    marginBottom: 14,
    textAlign: 'center',
    maxWidth: 320,
  },

  primaryButton: {
    backgroundColor: '#2d5016',
    paddingVertical: isSmallScreen ? 11 : 13,
    paddingHorizontal: isSmallScreen ? 18 : 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: isSmallScreen ? 140 : 160,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '700',
    textAlign: 'center',
  },

  secondaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: isSmallScreen ? 11 : 13,
    paddingHorizontal: isSmallScreen ? 18 : 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cfd8dc',
    minWidth: isSmallScreen ? 140 : 160,
  },

  secondaryButtonText: {
    color: '#2d5016',
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});