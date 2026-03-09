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
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { predictImage } from '../api/predict';
import { Ionicons } from '@expo/vector-icons';

export default function VarietyIdentifyScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const isLargeScreen = width >= 1024;

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow gallery access.');
        return;
      }

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!response.canceled && response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
        setResult(null);
        setError(null);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to open gallery.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access.');
        return;
      }

      const response = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!response.canceled && response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
        setResult(null);
        setError(null);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to open camera.');
    }
  };

  const saveToHistory = async (predictionData, uri) => {
    try {
      const existing = await AsyncStorage.getItem('scanHistory');
      const history = existing ? JSON.parse(existing) : [];

      const newItem = {
        id: Date.now().toString(),
        image: uri,
        result: predictionData.result,
        confidence: predictionData.confidence,
        stage: predictionData.stage,
        timestamp: new Date().toLocaleString(),
      };

      history.unshift(newItem);
      await AsyncStorage.setItem('scanHistory', JSON.stringify(history));
    } catch (e) {
      console.log('History save error:', e);
    }
  };

  const handlePredict = async () => {
    if (!imageUri) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictImage(imageUri);
      setResult(data);
      await saveToHistory(data, imageUri);
    } catch (e) {
      console.log('Prediction error:', e);
      setError('Prediction failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setResult(null);
    setError(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#dbeadf', '#c7ddce', '#b4cfbc']}
        style={styles.gradient}
      >
        <View style={styles.page}>
          <View style={styles.heroSection}>
            <View style={styles.heroBadge}>
              <Ionicons name="leaf-outline" size={18} color="#1f6f43" />
              <Text style={styles.heroBadgeText}>AI Variety Detection</Text>
            </View>

            <View style={styles.heroIconCircle}>
              <Ionicons name="leaf-outline" size={34} color="#1c5636" />
            </View>

            <Text style={styles.title}>Black Pepper Leaf Identification</Text>

            <Text style={styles.subtitle}>
              Upload or capture a leaf image to identify the black pepper variety
              using your trained classification model.
            </Text>
          </View>

          <View
            style={[
              styles.contentWrapper,
              isLargeScreen && styles.contentWrapperLarge,
            ]}
          >
            <View style={[styles.card, isLargeScreen && styles.leftCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="camera-outline" size={18} color="#1f6f43" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Leaf Image Input</Text>
                    <Text style={styles.sectionSubtitle}>
                      Choose a source and prepare the image for analysis
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.imageButtons,
                  !isSmallScreen && styles.imageButtonsRow,
                ]}
              >
                <TouchableOpacity
                  style={styles.imageOptionCard}
                  onPress={pickImage}
                  activeOpacity={0.9}
                >
                  <View style={[styles.iconBox, styles.galleryIconBox]}>
                    <Ionicons name="images-outline" size={30} color="#2563eb" />
                  </View>
                  <Text style={styles.imageOptionTitle}>Gallery</Text>
                  <Text style={styles.imageOptionText}>
                    Select a stored image from your device
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageOptionCard}
                  onPress={takePhoto}
                  activeOpacity={0.9}
                >
                  <View style={[styles.iconBox, styles.cameraIconBox]}>
                    <Ionicons name="camera-outline" size={30} color="#1f6f43" />
                  </View>
                  <Text style={styles.imageOptionTitle}>Camera</Text>
                  <Text style={styles.imageOptionText}>
                    Capture a clear leaf image instantly
                  </Text>
                </TouchableOpacity>
              </View>

              {imageUri ? (
                <View style={styles.previewWrapper}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <View style={styles.previewOverlay}>
                    <View style={styles.previewChip}>
                      <Ionicons name="image-outline" size={14} color="#fff" />
                      <Text style={styles.previewChipText}>Selected Image</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyPreview}>
                  <View style={styles.emptyPreviewIconWrap}>
                    <Ionicons name="image-outline" size={34} color="#7b9485" />
                  </View>
                  <Text style={styles.emptyPreviewTitle}>No image selected</Text>
                  <Text style={styles.emptyPreviewText}>
                    Choose an image from the gallery or capture one using the
                    camera.
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.actionButtons,
                  !isSmallScreen && styles.actionButtonsRow,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    loading && styles.primaryButtonDisabled,
                  ]}
                  onPress={handlePredict}
                  disabled={loading}
                  activeOpacity={0.92}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons
                        name="sparkles-outline"
                        size={18}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.primaryButtonText}>Identify Variety</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleReset}
                  activeOpacity={0.9}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color="#355f46"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.secondaryButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#b42318"
                    style={styles.errorIcon}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            <View style={[styles.card, isLargeScreen && styles.rightCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons
                      name="analytics-outline"
                      size={18}
                      color="#1f6f43"
                    />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Prediction Result</Text>
                    <Text style={styles.sectionSubtitle}>
                      Model output, confidence, and classification details
                    </Text>
                  </View>
                </View>
              </View>

              {!result && !loading && (
                <View style={styles.emptyResults}>
                  <View style={styles.emptyResultsIconWrap}>
                    <Ionicons
                      name="bar-chart-outline"
                      size={36}
                      color="#5f806e"
                    />
                  </View>
                  <Text style={styles.emptyResultsTitle}>No prediction yet</Text>
                  <Text style={styles.emptyResultsText}>
                    Run the model after selecting an image to view the predicted
                    variety and confidence values.
                  </Text>
                </View>
              )}

              {loading && (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingIconCircle}>
                    <ActivityIndicator size="large" color="#1f6f43" />
                  </View>
                  <Text style={styles.loadingText}>Processing image...</Text>
                  <Text style={styles.loadingSubText}>
                    Running leaf classification and confidence scoring
                  </Text>
                </View>
              )}

              {result && (
                <View style={styles.resultCard}>
                  <View style={styles.resultTopRow}>
                    <View style={styles.resultBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.resultBadgeText}>Prediction Ready</Text>
                    </View>
                  </View>

                  <Text style={styles.resultLabel}>Detected Variety</Text>
                  <Text style={styles.resultMain}>{result.result}</Text>

                  <View style={styles.metricsGrid}>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricTitle}>Confidence</Text>
                      <Text style={styles.metricValue}>{result.confidence}%</Text>
                    </View>

                    <View style={styles.metricBox}>
                      <Text style={styles.metricTitle}>Stage</Text>
                      <Text style={styles.metricValue}>{result.stage}</Text>
                    </View>
                  </View>

                  {result.confidence !== undefined && (
                    <View style={styles.confidenceSection}>
                      <View style={styles.confidenceHeader}>
                        <Text style={styles.confidenceLabel}>Confidence Level</Text>
                        <Text style={styles.confidencePercent}>
                          {result.confidence}%
                        </Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${Math.max(
                                0,
                                Math.min(Number(result.confidence) || 0, 100)
                              )}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  )}

                  {result.variety_probs && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>
                        Variety Probabilities
                      </Text>
                      {Object.entries(result.variety_probs).map(([key, value]) => (
                        <View key={key} style={styles.infoRow}>
                          <Text style={styles.infoKey}>{key}</Text>
                          <Text style={styles.infoValue}>{value}%</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {result.stageA_probs && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>
                        Stage A Probabilities
                      </Text>
                      {Object.entries(result.stageA_probs).map(([key, value]) => (
                        <View key={key} style={styles.infoRow}>
                          <Text style={styles.infoKey}>{key}</Text>
                          <Text style={styles.infoValue}>{value}%</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {!!result.message && (
                    <View style={styles.messageBox}>
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color="#215c3a"
                        style={styles.infoMessageIcon}
                      />
                      <Text style={styles.resultDescription}>{result.message}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#10231a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
  },
  android: {
    elevation: 5,
  },
  web: {
    boxShadow: '0px 12px 28px rgba(16, 35, 26, 0.08)',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbeadf',
  },
  gradient: {
    flex: 1,
    minHeight: '100%',
  },
  page: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  heroSection: {
    width: '100%',
    maxWidth: 1180,
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf8f0',
    borderWidth: 1,
    borderColor: '#d8ebdd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },
  heroBadgeText: {
    marginLeft: 8,
    color: '#1f6f43',
    fontSize: 13,
    fontWeight: '700',
  },
  heroIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e6f1e9',
    ...shadowStyle,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#143b27',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#5b7666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 760,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1180,
  },
  contentWrapperLarge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  leftCard: {
    flex: 1.02,
  },
  rightCard: {
    flex: 0.98,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eaf3ed',
    ...shadowStyle,
  },
  cardHeader: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef8f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#163a28',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13.5,
    color: '#6f8578',
    lineHeight: 20,
  },
  imageButtons: {
    gap: 14,
    marginBottom: 22,
  },
  imageButtonsRow: {
    flexDirection: 'row',
  },
  imageOptionCard: {
    flex: 1,
    backgroundColor: '#fbfdfb',
    borderWidth: 1,
    borderColor: '#e5efe8',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 118,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  galleryIconBox: {
    backgroundColor: '#eaf1ff',
  },
  cameraIconBox: {
    backgroundColor: '#e9f7ee',
  },
  imageOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#173725',
    marginBottom: 4,
  },
  imageOptionText: {
    fontSize: 12,
    color: '#71867a',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 170,
  },
  previewWrapper: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5efe8',
    backgroundColor: '#f7faf8',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: Platform.OS === 'web' ? 360 : 300,
    resizeMode: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 59, 39, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  previewChipText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyPreview: {
    minHeight: 260,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#dceadf',
    borderStyle: 'dashed',
    backgroundColor: '#f9fcfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  emptyPreviewIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#eef6f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyPreviewTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1c3f2b',
    marginBottom: 8,
  },
  emptyPreviewText: {
    fontSize: 14,
    color: '#7a9084',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
  },
  actionButtons: {
    gap: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1f6f43',
    minHeight: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f5f9f6',
    minHeight: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#d9e7dc',
  },
  secondaryButtonText: {
    color: '#355f46',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonIcon: {
    marginRight: 8,
  },
  errorContainer: {
    marginTop: 14,
    backgroundColor: '#fef3f2',
    borderWidth: 1,
    borderColor: '#fecdca',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    color: '#b42318',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 20,
    minHeight: 420,
  },
  emptyResultsIconWrap: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: '#eef7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyResultsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1c3f2b',
    marginBottom: 8,
  },
  emptyResultsText: {
    fontSize: 14,
    color: '#73877c',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 420,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 420,
    paddingVertical: 42,
    paddingHorizontal: 20,
  },
  loadingIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: '#eef7f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  loadingText: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    color: '#1f6f43',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 13.5,
    color: '#6f8478',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  resultCard: {
    backgroundColor: '#fbfdfb',
    borderWidth: 1,
    borderColor: '#e6efe8',
    borderRadius: 20,
    padding: 20,
  },
  resultTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d4f',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  resultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#708579',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  resultMain: {
    fontSize: 30,
    fontWeight: '800',
    color: '#174a2f',
    marginBottom: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  metricBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e6efe8',
  },
  metricTitle: {
    fontSize: 13,
    color: '#6d8277',
    marginBottom: 6,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 18,
    color: '#174a2f',
    fontWeight: '800',
  },
  confidenceSection: {
    marginBottom: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e6efe8',
    borderRadius: 16,
    padding: 14,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#375845',
  },
  confidencePercent: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f6f43',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#e8efe9',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2e7d4f',
    borderRadius: 999,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e7efe9',
    marginBottom: 14,
  },
  infoSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f3e2c',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f2',
  },
  infoKey: {
    fontSize: 14,
    color: '#4f6659',
    flex: 1,
    paddingRight: 10,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f6f43',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#edf8f0',
    padding: 14,
    borderRadius: 16,
    marginTop: 4,
  },
  infoMessageIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  resultDescription: {
    flex: 1,
    fontSize: 14,
    color: '#215c3a',
    lineHeight: 22,
  },
});