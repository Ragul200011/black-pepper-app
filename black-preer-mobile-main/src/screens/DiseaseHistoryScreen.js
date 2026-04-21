// src/screens/DiseaseHistoryScreen.js
// ─────────────────────────────────────────────────────────────────────────────
//  Black Pepper AI – Disease Detection History  (Light Theme v2)
//  • White cards on C.bg background
//  • Colour-coded disease badge per result
//  • Accessible empty state + clear history confirmation
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { C, SHADOW } from '../components/theme';
import { exportScanReport } from '../utils/exportReport';

const { width } = Dimensions.get('window');
const isSmall = width < 480;
const isWide  = width >= 768;

const DISEASE_CONFIG = {
  'Healthy':     { color: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7', icon: '✅' },
  'Leaf Blight': { color: '#C62828', bg: '#FFEBEE', border: '#EF9A9A', icon: '🍂' },
  'Slow Wilt':   { color: '#E65100', bg: '#FFF3E0', border: '#FFCC80', icon: '🥀' },
};

function getDiseaseStyle(disease = '') {
  const key = Object.keys(DISEASE_CONFIG).find((k) => disease.toLowerCase().includes(k.toLowerCase()));
  return DISEASE_CONFIG[key] ?? { color: C.primary, bg: C.xlight, border: C.light, icon: '🔬' };
}

function isDisplayableImage(uri) {
  if (!uri || typeof uri !== 'string') return false;
  if (uri.startsWith('blob:')) return false;
  return uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('file://') || uri.startsWith('data:image/') || uri.startsWith('/');
}

function truncate(text, max = 90) {
  if (!text) return 'No description available.';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function DiseaseHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const stored = await AsyncStorage.getItem('disease_history');
          const parsed = stored ? JSON.parse(stored) : [];
          setHistory(Array.isArray(parsed) ? parsed : []);
        } catch (err) {
          console.log('History load error:', err);
        }
      })();
    }, [])
  );

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all saved results?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All', style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('disease_history');
              setHistory([]);
            } catch (err) {
              console.log('Clear error:', err);
            }
          },
        },
      ]
    );
  };

  const openItem = (item) => {
    navigation.navigate('DiseaseResult', {
      image: item.image, disease: item.disease, confidence: item.confidence,
      treatment: item.treatment, description: item.description,
      probabilities: item.probabilities, lowConfidence: item.lowConfidence,
    });
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

      {/* HERO */}
      <LinearGradient colors={['#B71C1C', '#C62828', '#D32F2F']} style={s.hero}>
        <View style={s.heroBadge}><Text style={s.heroBadgeTxt}>🗂️ SAVED RESULTS</Text></View>
        <Text style={s.heroTitle}>Detection History</Text>
        <Text style={s.heroSub}>Review your previous black pepper leaf disease detections in one place.</Text>
      </LinearGradient>

      <View style={s.content}>

        {/* EMPTY STATE */}
        {history.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🗂️</Text>
            <Text style={s.emptyTitle}>No Saved Results Yet</Text>
            <Text style={s.emptyText}>Your saved disease detection records will appear here after you save a result.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('DiseaseUpload')} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Start a new disease detection">
              <Text style={s.emptyBtnTxt}>Start New Detection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ACTION ROW */}
            <View style={[s.actionRow, isWide && { flexDirection: 'row' }]}>
              <TouchableOpacity style={s.newBtn} onPress={() => navigation.navigate('DiseaseUpload')} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Start new detection">
                <Text style={s.newBtnTxt}>➕  New Detection</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.exportBtn} onPress={exportScanReport} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Export report">
                <Ionicons name="share-outline" size={16} color={C.primary} />
                {!isSmall && <Text style={s.exportBtnTxt}>  Export</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.clearBtn} onPress={clearHistory} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Clear all history">
                <Text style={s.clearBtnTxt}>🗑  Clear History</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.countTxt}>{history.length} saved {history.length === 1 ? 'result' : 'results'}</Text>

            {/* HISTORY CARDS */}
            {history.map((item, index) => {
              const style   = getDiseaseStyle(item.disease ?? '');
              const canShow = isDisplayableImage(item.image);
              const cardKey = item.id ?? `${item.savedAt ?? 'item'}-${index}`;

              return (
                <TouchableOpacity
                  key={cardKey}
                  style={s.card}
                  onPress={() => openItem(item)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.disease || 'Unknown'}, ${item.confidence || 'N/A'} confidence. Tap to view details.`}
                >
                  {/* Thumbnail */}
                  {canShow ? (
                    <Image source={{ uri: item.image }} style={s.thumb} accessibilityLabel="Leaf image thumbnail" />
                  ) : (
                    <View style={s.thumbPlaceholder}>
                      <Text style={s.thumbIcon}>🖼️</Text>
                      <Text style={s.thumbNoImg}>No preview</Text>
                    </View>
                  )}

                  {/* Content */}
                  <View style={s.cardContent}>
                    <View style={s.cardTopRow}>
                      <View style={[s.diseaseBadge, { backgroundColor: style.bg, borderColor: style.border }]}>
                        <Text style={[s.diseaseBadgeTxt, { color: style.color }]}>{style.icon}  {item.disease || 'Unknown'}</Text>
                      </View>
                      {item.lowConfidence && (
                        <View style={s.lowConfBadge}>
                          <Text style={s.lowConfTxt}>Low confidence</Text>
                        </View>
                      )}
                    </View>

                    <Text style={s.metaTxt}>Confidence: <Text style={{ color: style.color, fontWeight: '700' }}>{item.confidence || 'N/A'}</Text></Text>
                    <Text style={s.metaTxt}>Saved: {item.savedAt || 'Unknown date'}</Text>
                    <Text style={s.descTxt}>{truncate(item.description)}</Text>

                    <View style={s.viewBadge}>
                      <Text style={s.viewBadgeTxt}>View Details →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 28 },

  hero:        { paddingTop: isSmall ? 50 : 64, paddingBottom: 30, paddingHorizontal: 22, alignItems: 'center' },
  heroBadge:   { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 12 },
  heroBadgeTxt:{ fontSize: 10, color: '#fff', fontWeight: '800', letterSpacing: 1.4 },
  heroTitle:   { fontSize: isSmall ? 24 : 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 8 },
  heroSub:     { fontSize: isSmall ? 12 : 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22, maxWidth: 420 },

  content: { padding: isSmall ? 14 : 20, maxWidth: 980, width: '100%', alignSelf: 'center' },

  emptyCard:  { backgroundColor: C.surface, padding: 28, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: C.border, ...SHADOW.sm },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: isSmall ? 20 : 22, fontWeight: '700', color: C.text, marginBottom: 8, textAlign: 'center' },
  emptyText:  { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: 20, maxWidth: 360 },
  emptyBtn:   { backgroundColor: C.primary, paddingVertical: 13, paddingHorizontal: 24, borderRadius: 14, ...SHADOW.sm },
  emptyBtnTxt:{ color: '#fff', fontWeight: '700', fontSize: 14 },

  actionRow: { flexDirection: 'column', gap: 12, marginBottom: 14 },
  newBtn:    { flex: 1, backgroundColor: C.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', ...SHADOW.sm },
  newBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  clearBtn:  { flex: 1, backgroundColor: '#C62828', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  clearBtnTxt:{ color: '#fff', fontWeight: '700', fontSize: 14 },

  countTxt: { fontSize: 13, color: C.textMuted, marginBottom: 14, paddingHorizontal: 2 },

  card:        { backgroundColor: C.surface, borderRadius: 18, padding: isSmall ? 12 : 14, borderWidth: 1, borderColor: C.border, flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 14, ...SHADOW.sm },
  thumb:       { width: isSmall ? 88 : 104, height: isSmall ? 88 : 104, borderRadius: 12 },
  thumbPlaceholder: { width: isSmall ? 88 : 104, height: isSmall ? 88 : 104, borderRadius: 12, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  thumbIcon:   { fontSize: 24, marginBottom: 4 },
  thumbNoImg:  { fontSize: 10, color: C.textMuted, textAlign: 'center' },

  cardContent: { flex: 1 },
  cardTopRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8, alignItems: 'center' },

  diseaseBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  diseaseBadgeTxt:{ fontSize: 12, fontWeight: '700' },
  lowConfBadge:   { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  lowConfTxt:     { fontSize: 10, fontWeight: '700', color: '#E65100' },

  metaTxt: { fontSize: 13, color: C.textSecondary, marginBottom: 3 },
  descTxt: { fontSize: 13, color: C.textMuted, marginTop: 5, lineHeight: 19 },

  viewBadge:   { marginTop: 10, alignSelf: 'flex-start', backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  viewBadgeTxt:{ color: C.primary, fontSize: 12, fontWeight: '700' },
});