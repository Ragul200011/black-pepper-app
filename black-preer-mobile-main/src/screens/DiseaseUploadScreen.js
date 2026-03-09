import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const { width } = Dimensions.get('window');

const isSmallScreen = width < 480;
const isWideScreen = width >= 768;

const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5001'
    : 'http://192.168.8.110:5001';

export default function DiseaseUploadScreen({ navigation }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const pickFromCamera = async () => {
    try {
      setWarningMessage('');

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedAsset(result.assets[0]);
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const pickFromGallery = async () => {
    try {
      setWarningMessage('');

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Gallery permission is needed to select an image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedAsset(result.assets[0]);
      }
    } catch (error) {
      console.log('Gallery error:', error);
      Alert.alert('Error', 'Could not open gallery.');
    }
  };

  const handleDetectDisease = async () => {
    if (!selectedAsset) {
      setWarningMessage('Please upload or capture a leaf image first.');
      return;
    }

    try {
      setLoading(true);
      setWarningMessage('');

      const formData = new FormData();

      if (Platform.OS === 'web') {
        if (!selectedAsset.file) {
          throw new Error('Web image file not found. Please select the image again.');
        }
        formData.append('file', selectedAsset.file);
      } else {
        formData.append('file', {
          uri: selectedAsset.uri,
          name: selectedAsset.fileName || `leaf_${Date.now()}.jpg`,
          type: selectedAsset.mimeType || 'image/jpeg',
        });
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/predict-image`,
        formData,
        { timeout: 60000 }
      );

      const data = response.data;

      if (!data?.ai_analysis) {
        throw new Error('Invalid response from server.');
      }

      const result = data.ai_analysis;

      if (result.rejected) {
        setWarningMessage(
          result.reject_reason ||
            'The uploaded image is not recognized as a black pepper leaf. Please upload a clear black pepper leaf image.'
        );
        return;
      }

      navigation.navigate('DiseaseResult', {
        image: selectedAsset.uri,
        disease: result.prediction || 'Unknown',
        confidence: `${result.confidence ?? 0}%`,
        treatment: result.advice || 'Consult an agricultural expert.',
        description: result.description || '',
        probabilities: result.all_probabilities || {},
        pepperScore: result.pepper_score || null,
        lowConfidence: result.low_confidence || false,
      });
    } catch (error) {
      console.log('Detection error:', error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.details ||
        error?.response?.data?.stdout ||
        error?.message ||
        'Failed to process image.';

      setWarningMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#1a3409', '#2d5016', '#1a3409']}
        style={styles.header}
      >
        <Text style={styles.badge}>AI Image Upload</Text>
        <Text style={styles.title}>Leaf Image Upload</Text>
        <Text style={styles.headerSubtitle}>
          Select a clear black pepper leaf image to get an AI-powered disease prediction.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {warningMessage ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠ Warning</Text>
            <Text style={styles.warningText}>{warningMessage}</Text>
          </View>
        ) : null}

        <View style={styles.previewCard}>
          {selectedAsset?.uri ? (
            <>
              <Image source={{ uri: selectedAsset.uri }} style={styles.previewImage} />
              <View style={styles.previewFooter}>
                <Text style={styles.previewFooterTitle}>Image Ready</Text>
                <Text style={styles.previewFooterText}>
                  Your selected leaf image is ready for disease analysis.
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍃</Text>
              <Text style={styles.emptyTitle}>No Image Selected</Text>
              <Text style={styles.emptyText}>
                Use your camera or gallery to upload a black pepper leaf image.
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.actionGrid,
            isWideScreen && styles.actionGridWide,
          ]}
        >
          <TouchableOpacity
            style={styles.actionCard}
            onPress={pickFromCamera}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionTitle}>Open Camera</Text>
            <Text style={styles.actionText}>
              Capture a fresh photo of the leaf using your device camera.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={pickFromGallery}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>🖼️</Text>
            <Text style={styles.actionTitle}>Open Gallery</Text>
            <Text style={styles.actionText}>
              Select an existing black pepper leaf image from your gallery.
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.detectButton, loading && styles.disabledButton]}
          onPress={handleDetectDisease}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.detectButtonText}>🦠 Detect Disease</Text>
          )}
        </TouchableOpacity>

        <View style={styles.tipsCard}>
          <Text style={styles.cardHeading}>Tips for Better Results</Text>

          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Use a clear image with good lighting.</Text>
          </View>

          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Capture the full leaf inside the frame.</Text>
          </View>

          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Avoid blurry or dark photos.</Text>
          </View>

          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Keep the background simple if possible.</Text>
          </View>

          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Upload only black pepper leaf images.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7faf7',
  },

  scrollContent: {
    paddingBottom: 28,
  },

  header: {
    paddingTop: isSmallScreen ? 42 : 60,
    paddingBottom: isSmallScreen ? 24 : 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },

  title: {
    color: '#fff',
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },

  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: isSmallScreen ? 13 : 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 760,
  },

  content: {
    padding: isSmallScreen ? 14 : 20,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },

  warningCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffe08a',
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
  },

  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 6,
  },

  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },

  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#dceccf',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  previewImage: {
    width: '100%',
    height: isSmallScreen ? 220 : isWideScreen ? 380 : 280,
    resizeMode: 'cover',
  },

  previewFooter: {
    padding: 16,
    backgroundColor: '#f8fbf7',
  },

  previewFooterTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 4,
  },

  previewFooterText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  emptyState: {
    minHeight: isSmallScreen ? 250 : 320,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },

  emptyIcon: {
    fontSize: isSmallScreen ? 54 : 64,
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 420,
  },

  actionGrid: {
    flexDirection: 'column',
    gap: 14,
    marginBottom: 18,
  },

  actionGridWide: {
    flexDirection: 'row',
  },

  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dceccf',
    borderRadius: 18,
    padding: isSmallScreen ? 16 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallScreen ? 140 : 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },

  actionIcon: {
    fontSize: isSmallScreen ? 28 : 34,
    marginBottom: 10,
  },

  actionTitle: {
    fontSize: isSmallScreen ? 17 : 18,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 8,
    textAlign: 'center',
  },

  actionText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  detectButton: {
    backgroundColor: '#2d5016',
    paddingVertical: isSmallScreen ? 15 : 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  disabledButton: {
    opacity: 0.7,
  },

  detectButtonText: {
    color: '#fff',
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '700',
  },

  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: isSmallScreen ? 16 : 20,
    borderWidth: 1,
    borderColor: '#dceccf',
  },

  cardHeading: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 12,
  },

  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  tipBullet: {
    fontSize: 16,
    color: '#2d5016',
    marginRight: 8,
    lineHeight: 20,
  },

  tipText: {
    flex: 1,
    fontSize: isSmallScreen ? 13 : 14,
    color: '#555',
    lineHeight: 20,
  },
});