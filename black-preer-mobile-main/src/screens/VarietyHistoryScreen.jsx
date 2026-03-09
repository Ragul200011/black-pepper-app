import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function VarietyHistoryScreen() {
  const [history, setHistory] = useState([]);
  const { width } = useWindowDimensions();
  const [selectedItem, setSelectedItem] = useState(null);

  // Responsive breakpoints
  const isSmall = width < 480;    // phone portrait
  const isMedium = width >= 480 && width < 768; // phone landscape / small tablet
  const isLarge = width >= 768 && width < 1100; // tablet
  const isXLarge = width >= 1100; // desktop / large tablet

  // Number of columns per breakpoint
  const numColumns = isSmall ? 1 : isMedium ? 2 : isLarge ? 2 : 3;

  // Card width calculation: subtract page padding and gaps
  const pagePadding = isSmall ? 16 : 24;
  const cardGap = isSmall ? 12 : 16;
  const availableWidth = Math.min(width - pagePadding * 2, 1180);
  const cardWidth = numColumns === 1
    ? availableWidth
    : (availableWidth - cardGap * (numColumns - 1)) / numColumns;

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('scanHistory');
      const parsed = stored ? JSON.parse(stored) : [];

      const valid = parsed.filter(
        (item) =>
          item &&
          item.image &&
          item.timestamp &&
          item.result &&
          item.result !== 'Unknown Variety'
      );

      if (valid.length !== parsed.length) {
        await AsyncStorage.setItem('scanHistory', JSON.stringify(valid));
      }

      setHistory(valid);
    } catch (e) {
      console.log('Error loading history:', e);
    }
  };

  const clearHistory = async () => {
    try {
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Are you sure you want to delete all scan history?');
        if (!confirmed) return;
        await AsyncStorage.removeItem('scanHistory');
        setHistory([]);
        return;
      }

      Alert.alert(
        'Clear History',
        'Are you sure you want to delete all scan history?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.removeItem('scanHistory');
                setHistory([]);
              } catch (e) {
                console.log('Error clearing history:', e);
              }
            },
          },
        ]
      );
    } catch (e) {
      console.log('Error clearing history:', e);
    }
  };

  const deleteItem = async (index) => {
    try {
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Do you want to remove this scan from history?');
        if (!confirmed) return;
        const updated = history.filter((_, i) => i !== index);
        setHistory(updated);
        await AsyncStorage.setItem('scanHistory', JSON.stringify(updated));
        return;
      }

      Alert.alert(
        'Delete Record',
        'Do you want to remove this scan from history?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const updated = history.filter((_, i) => i !== index);
                setHistory(updated);
                await AsyncStorage.setItem('scanHistory', JSON.stringify(updated));
              } catch (e) {
                console.log('Error deleting item:', e);
              }
            },
          },
        ]
      );
    } catch (e) {
      console.log('Error deleting item:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const imageHeight = isSmall ? 180 : isMedium ? 160 : 200;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <LinearGradient
          colors={['#dbeadf', '#c7ddce', '#b4cfbc']}
          style={styles.gradient}
        >
          <View style={[styles.page, { paddingHorizontal: pagePadding }]}>

            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroBadge}>
                <Ionicons name="time-outline" size={16} color="#1f6f43" />
                <Text style={styles.heroBadgeText}>Prediction Records</Text>
              </View>

              <View style={styles.heroIconCircle}>
                <Ionicons name="document-text-outline" size={32} color="#1c5636" />
              </View>

              <Text style={[styles.title, isSmall && { fontSize: 24 }]}>Scan History</Text>
              <Text style={[styles.subtitle, isSmall && { fontSize: 13 }]}>
                Review previously identified black pepper leaf scans, including
                prediction confidence, stage details, and scan timestamps.
              </Text>
            </View>

            {/* Content */}
            <View style={styles.contentWrapper}>

              {/* Top Card */}
              <View style={[styles.topCard, isSmall && styles.topCardSmall]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="albums-outline" size={18} color="#1f6f43" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitle, isSmall && { fontSize: 16 }]}>
                      Stored Scan Records
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      Total scans: {history.length}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.clearButton, isSmall && styles.clearButtonSmall]}
                    onPress={clearHistory}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="trash-outline" size={16} color="#fff" style={{ marginRight: isSmall ? 0 : 8 }} />
                    {!isSmall && <Text style={styles.clearButtonText}>Clear History</Text>}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Empty State */}
              {history.length === 0 ? (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIconWrap}>
                    <Ionicons name="folder-open-outline" size={42} color="#6f8578" />
                  </View>
                  <Text style={styles.emptyTitle}>No scan history yet</Text>
                  <Text style={styles.emptyText}>
                    Your previous leaf identification results will appear here
                    after you complete a scan.
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.historyGrid,
                    numColumns > 1 && {
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: cardGap,
                    },
                  ]}
                >
                  {history.map((item, index) => (
                    <View
                      key={item.id || `${item.timestamp}-${index}`}
                      style={[
                        styles.historyCard,
                        { width: cardWidth },
                        numColumns === 1 && { marginBottom: cardGap },
                      ]}
                    >
                      {/* Image */}
                      <View style={styles.historyImageWrap}>
                        {item.image ? (
                          <Image
                            source={{ uri: item.image }}
                            style={[styles.historyImage, { height: imageHeight }]}
                          />
                        ) : (
                          <View style={[styles.historyImageFallback, { height: imageHeight }]}>
                            <Ionicons name="image-outline" size={28} color="#7b9485" />
                          </View>
                        )}
                      </View>

                      {/* Info */}
                      <View style={styles.historyInfo}>
                        <View style={styles.historyHeaderRow}>
                          <View style={styles.resultBadge}>
                            <Ionicons name="leaf-outline" size={13} color="#fff" />
                            <Text style={styles.resultBadgeText}>Prediction</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteItem(index)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons name="trash-outline" size={16} color="#b3261e" />
                          </TouchableOpacity>
                        </View>

                        <Text
                          style={[
                            styles.historyResult,
                            isSmall && { fontSize: 18 },
                            isMedium && { fontSize: 16 },
                          ]}
                          numberOfLines={2}
                        >
                          {item.result || 'Unknown Variety'}
                        </Text>

                        <View style={styles.metricsRow}>
                          <View style={styles.metricChip}>
                            <Text style={styles.metricChipLabel}>Confidence</Text>
                            <Text style={styles.metricChipValue}>
                              {item.confidence ?? '--'}%
                            </Text>
                          </View>
                          <View style={styles.metricChip}>
                            <Text style={styles.metricChipLabel}>Stage</Text>
                            <Text style={styles.metricChipValue}>
                              {item.stage || '--'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.timestampRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={13}
                            color="#6f8578"
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.historyDate} numberOfLines={1}>
                            {item.timestamp || 'No timestamp'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
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
  screen: {
    flex: 1,
    backgroundColor: '#dbeadf',
  },
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
  topCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eaf3ed',
    ...shadowStyle,
  },
  topCardSmall: {
    padding: 14,
    borderRadius: 18,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#163a28',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6f8578',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#be1a11',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 12,
  },
  clearButtonSmall: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 54,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eaf3ed',
    ...shadowStyle,
  },
  emptyIconWrap: {
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: '#eef7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1c3f2b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14.5,
    color: '#73877c',
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 420,
  },
  historyGrid: {
    width: '100%',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8f1ea',
    ...shadowStyle,
  },
  historyImageWrap: {
    marginBottom: 12,
  },
  historyImage: {
    width: '100%',
    borderRadius: 14,
    resizeMode: 'cover',
    backgroundColor: '#edf3ee',
  },
  historyImageFallback: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#f4f8f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2ece5',
  },
  historyInfo: {
    flex: 1,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d4f',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  resultBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },
  historyResult: {
    fontSize: 20,
    fontWeight: '800',
    color: '#173725',
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  metricChip: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#f8fbf9',
    borderWidth: 1,
    borderColor: '#e5efe8',
    borderRadius: 12,
    padding: 10,
  },
  metricChipLabel: {
    fontSize: 11,
    color: '#6f8578',
    marginBottom: 3,
    fontWeight: '700',
  },
  metricChipValue: {
    fontSize: 14,
    color: '#1f6f43',
    fontWeight: '800',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12,
    color: '#708579',
    lineHeight: 18,
    flex: 1,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#f5c2c0',
  },
});