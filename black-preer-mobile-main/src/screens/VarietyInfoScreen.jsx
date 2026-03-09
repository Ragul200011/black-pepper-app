import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function VarietyInfoScreen() {
  const [selectedVariety, setSelectedVariety] = useState(null);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const varieties = [
    {
      key: 'dingirala',
      name: 'Dingi Rala',
      short: 'Balanced hybrid with good productivity and reliable spice quality.',
      icon: 'leaf-outline',
      parentage:
        'Cross: Panniyur-1 × GK 49\n\nThis hybrid brings together genetics from two well-known high-yielding parents:\n• Panniyur-1: a popular Indian high-yield variety\n• GK 49: a selection known for quality traits in Sri Lanka',
      agronomy:
        '• Panicle length: ~12 cm\n• Filling %: ~80%\n• Annual yield: ~2245 g per vine\n\nThese figures indicate a strong productive capacity and relatively good quality berry set.',
      quality:
        '• Oleoresin: ~12.9%\n• Oil: ~2.8%\n• Piperine: ~5.6%\n\nPiperine is the key compound that gives pepper its heat and pungency, so Dingi Rala has a respectable pungency.',
      summary:
        'Dingi Rala is a balanced and reliable hybrid that combines good yield with acceptable spice quality and practical field performance.',
    },
    {
      key: 'kohu',
      name: 'Kohukumbure Rala',
      short: 'Good yield with strong aroma and higher oleoresin content.',
      icon: 'flask-outline',
      parentage:
        'Cross: MW 21 × Panniyur-1\n\nThis hybrid uses a local selection (MW 21) crossed with the established Panniyur-1, aiming for improved performance under local growing conditions.',
      agronomy:
        '• Panicle length: ~12 cm\n• Filling %: ~80%\n• Annual yield: ~2340 g per vine\n\nThis places Kohukumbure Rala in the middle range for yield among the three varieties.',
      quality:
        '• Oleoresin: ~15.4%\n• Oil: ~3.6%\n• Piperine: ~6%\n\nThe relatively high oleoresin and oil content may improve aroma, flavor depth, and processed pepper quality.',
      summary:
        'Kohukumbure Rala offers a good balance between agronomic performance and stronger aromatic quality.',
    },
    {
      key: 'bootawe',
      name: 'Bootawe Rala',
      short: 'Highest-yielding hybrid with strong spice characteristics.',
      icon: 'trophy-outline',
      parentage:
        'Cross: Panniyur-1 × DM 7\n\nThis hybrid pairs Panniyur-1 with DM 7, another local line with desirable agronomic performance.',
      agronomy:
        '• Panicle length: ~14 cm\n• Filling %: ~80%\n• Annual yield: ~2724 g per vine\n\nThese figures make Bootawe Rala the highest yielder among the three main hybrids.',
      quality:
        '• Oleoresin: ~12.9%\n• Oil: ~3.1%\n• Piperine: ~6.3%\n\nBootawe Rala stands out with stronger oil and piperine values, which contribute to pungency and processing appeal.',
      summary:
        'Bootawe Rala is often considered a premium hybrid due to its higher productivity and stronger spice-related characteristics.',
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#dbeadf', '#c7ddce', '#b4cfbc']}
          style={styles.gradient}
        >
          <View style={styles.page}>
            <View style={styles.heroSection}>
              <View style={styles.heroBadge}>
                <Ionicons name="book-outline" size={16} color="#1f6f43" />
                <Text style={styles.heroBadgeText}>Research Knowledge Base</Text>
              </View>

              <View style={styles.heroIconCircle}>
                <Ionicons name="library-outline" size={32} color="#1c5636" />
              </View>

              <Text style={styles.title}>Black Pepper Variety Information</Text>
              <Text style={styles.subtitle}>
                Learn about the main Sri Lankan black pepper varieties and review
                their breeding background, agronomic performance, and quality
                attributes.
              </Text>
            </View>

            <View style={styles.contentWrapper}>
              <View style={styles.infoCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="information-circle-outline" size={18} color="#1f6f43" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>About Sri Lankan Pepper Varieties</Text>
                    <Text style={styles.sectionSubtitle}>
                      Background of improved local hybrids
                    </Text>
                  </View>
                </View>

                <Text style={styles.text}>
                  Although black pepper is believed to have originated in the
                  Malabar Coast of India, Sri Lanka is also home to several wild
                  pepper types. The Department of Export Agriculture has introduced
                  improved local hybrids such as Dingi Rala, Kohukumbure Rala, and
                  Bootawe Rala to support productivity and quality under local
                  conditions.
                </Text>
              </View>

              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Available Varieties</Text>
                <Text style={styles.listSubtitle}>
                  Select a variety to view complete details
                </Text>
              </View>

              <View style={[styles.varietiesGrid, isLargeScreen && styles.varietiesGridLarge]}>
                {varieties.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.varietyCard, isLargeScreen && styles.varietyCardLarge]}
                    onPress={() => setSelectedVariety(item)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.varietyTopRow}>
                      <View style={styles.varietyIconWrap}>
                        <Text style={styles.varietyEmoji}>🍃</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#6d8277" />
                    </View>

                    <Text style={styles.varietyName}>{item.name}</Text>
                    <Text style={styles.varietyShort}>{item.short}</Text>

                    <View style={styles.varietyFooter}>
                      <Text style={styles.varietyFooterText}>View detailed profile</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={!!selectedVariety}
        onRequestClose={() => setSelectedVariety(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedVariety && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleWrap}>
                    <View style={styles.modalTitleIcon}>
                      <Ionicons
                        name={selectedVariety.icon}
                        size={22}
                        color="#1f6f43"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalTitle}>{selectedVariety.name}</Text>
                      <Text style={styles.modalSubtitle}>Detailed variety profile</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedVariety(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={22} color="#4f6659" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.detailSection}>
                    <View style={styles.detailTitleRow}>
                      <Ionicons name="git-branch-outline" size={18} color="#1f6f43" />
                      <Text style={styles.modalSectionTitle}>Parentage & Breeding</Text>
                    </View>
                    <Text style={styles.modalText}>{selectedVariety.parentage}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailTitleRow}>
                      <Ionicons name="leaf-outline" size={18} color="#1f6f43" />
                      <Text style={styles.modalSectionTitle}>Agronomic Traits</Text>
                    </View>
                    <Text style={styles.modalText}>{selectedVariety.agronomy}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailTitleRow}>
                      <Ionicons name="flask-outline" size={18} color="#1f6f43" />
                      <Text style={styles.modalSectionTitle}>Quality Attributes</Text>
                    </View>
                    <Text style={styles.modalText}>{selectedVariety.quality}</Text>
                  </View>

                  <View style={styles.summaryBox}>
                    <View style={styles.summaryHeader}>
                      <Ionicons name="sparkles-outline" size={18} color="#1f6f43" />
                      <Text style={styles.summaryTitle}>Summary Insight</Text>
                    </View>
                    <Text style={styles.summaryText}>{selectedVariety.summary}</Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#eaf3ed',
    ...shadowStyle,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
  text: {
    fontSize: 15,
    lineHeight: 26,
    color: '#44574c',
  },
  listHeader: {
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#163a28',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#6f8578',
  },
  varietiesGrid: {
    gap: 14,
  },
  varietiesGridLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  varietyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8f1ea',
    ...shadowStyle,
  },
  varietyCardLarge: {
    width: '32%',
    minWidth: 280,
    marginBottom: 16,
  },
  varietyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  varietyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d8ebdd',
  },
  varietyEmoji: {
    fontSize: 26,
  },
  varietyName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#173725',
    marginBottom: 10,
  },
  varietyShort: {
    fontSize: 14,
    color: '#6f8478',
    lineHeight: 22,
    marginBottom: 18,
  },
  varietyFooter: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eef4f0',
  },
  varietyFooterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f6f43',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 18, 11, 0.55)',
    justifyContent: 'center',
    padding: 18,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e8f1ea',
    ...shadowStyle,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef3ef',
  },
  modalTitleWrap: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  modalTitleIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#edf8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#143b27',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13.5,
    color: '#708579',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f4f8f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  detailSection: {
    backgroundColor: '#fbfdfb',
    borderWidth: 1,
    borderColor: '#e8f1ea',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#163a28',
    marginLeft: 8,
  },
  modalText: {
    fontSize: 14.5,
    lineHeight: 24,
    color: '#44574c',
  },
  summaryBox: {
    backgroundColor: '#edf8f0',
    padding: 16,
    borderRadius: 18,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#dcecdf',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#163a28',
  },
  summaryText: {
    color: '#29523c',
    fontSize: 14.5,
    lineHeight: 24,
  },
});