// src/screens/DiseaseIdentificationScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C, SHADOW } from '../components/theme';
import BottomNav from '../components/BottomNav';

const DISEASES = [
  {
    name: 'Leaf Blight',
    emoji: '🍂',
    color: '#C62828',
    desc: 'Brown/black necrotic lesions on leaves. Caused by Colletotrichum gloeosporioides.',
  },
  {
    name: 'Slow Wilt',
    emoji: '🥀',
    color: '#E65100',
    desc: 'Progressive wilting and yellowing. Caused by Phytophthora capsici in soil.',
  },
  {
    name: 'Healthy Leaf',
    emoji: '🌿',
    color: C.success,
    desc: 'No signs of disease. Ideal leaf condition for black pepper cultivation.',
  },
];

export default function DiseaseIdentificationScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  // fade/slide are refs to Animated.Values and intentionally stable

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* HERO */}
        <LinearGradient colors={['#B71C1C', '#C62828', '#D32F2F']} style={s.hero}>
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            <View style={s.heroBadge}>
              <View style={s.heroDot} />
              <Text style={s.heroBadgeTxt}>LEAF DISEASE AI</Text>
            </View>
            <Text style={s.heroTitle}>Disease{'\n'}Detection</Text>
            <Text style={s.heroSub}>
              EfficientNetB0 identifies leaf blight & slow wilt from leaf photos with 95%+ accuracy
            </Text>
          </Animated.View>
        </LinearGradient>

        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          {/* ACTION CARDS */}
          <View style={s.section}>
            <Text style={s.sectionCap}>QUICK ACTIONS</Text>
            <TouchableOpacity
              style={s.primaryAction}
              onPress={() => navigation.navigate('DiseaseUpload')}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#C62828', '#D32F2F']} style={s.primaryActionGrad}>
                <View style={s.primaryActionIcon}>
                  <Ionicons name="camera-outline" size={28} color={C.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.primaryActionTitle}>Start Detection</Text>
                  <Text style={s.primaryActionDesc}>
                    Upload or capture a leaf image for AI analysis
                  </Text>
                </View>
                <View style={s.arrowCircle}>
                  <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.9)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.secondaryAction}
              onPress={() => navigation.navigate('DiseaseHistory')}
              activeOpacity={0.85}
            >
              <View style={[s.secondaryActionIcon, { backgroundColor: '#FFF5F5' }]}>
                <Ionicons name="time-outline" size={24} color={C.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.secondaryActionTitle}>Detection History</Text>
                <Text style={s.secondaryActionDesc}>Review all previous detection results</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.hint} />
            </TouchableOpacity>
          </View>

          {/* DETECTABLE CONDITIONS */}
          <View style={s.section}>
            <Text style={s.sectionCap}>DETECTABLE CONDITIONS</Text>
            <Text style={s.sectionTitle}>3 Classification Classes</Text>
            {DISEASES.map((d) => (
              <View key={d.name} style={[s.diseaseCard, { borderLeftColor: d.color }]}>
                <View style={[s.diseaseIcon, { backgroundColor: d.color + '14' }]}>
                  <Text style={{ fontSize: 24 }}>{d.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.diseaseName, { color: d.color }]}>{d.name}</Text>
                  <Text style={s.diseaseDesc}>{d.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* HOW IT WORKS */}
          <View style={s.infoCard}>
            <View style={s.infoHeader}>
              <Ionicons name="hardware-chip-outline" size={18} color={C.error} />
              <Text style={s.infoTitle}>How the AI Works</Text>
            </View>
            {[
              { icon: 'image-outline', txt: 'Upload a clear leaf photo — camera or gallery' },
              { icon: 'scan-outline', txt: 'Leaf detector verifies it is a pepper leaf first' },
              {
                icon: 'analytics-outline',
                txt: 'EfficientNetB0 classifies the disease with confidence %',
              },
              {
                icon: 'medical-outline',
                txt: 'Treatment guidance provided for identified disease',
              },
            ].map((item, i) => (
              <View key={i} style={s.infoRow}>
                <View style={s.infoIconWrap}>
                  <Ionicons name={item.icon} size={16} color={C.error} />
                </View>
                <Text style={s.infoTxt}>{item.txt}</Text>
              </View>
            ))}
          </View>

          {/* TIPS */}
          <View style={s.tipsCard}>
            <Text style={s.tipsTitle}>📸 Photo Tips for Best Results</Text>
            {[
              'Use a clear, well-lit close-up of a single leaf',
              'Ensure the entire leaf is visible in frame',
              'Avoid blurry, shadowed, or heavily cropped images',
              'Natural daylight gives the most accurate detection',
            ].map((tip, i) => (
              <View key={i} style={s.tipRow}>
                <Ionicons name="checkmark-circle" size={15} color={C.success} />
                <Text style={s.tipTxt}>{tip}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
        <View style={{ height: 20 }} />
      </ScrollView>
      <BottomNav navigation={navigation} active="Disease" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 16 },

  hero: { paddingTop: 52, paddingBottom: 28, paddingHorizontal: 22 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.8)' },
  heroBadgeTxt: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '800',
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: C.white,
    lineHeight: 34,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 18 },

  section: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  sectionCap: {
    fontSize: 10,
    fontWeight: '800',
    color: C.text3,
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: C.text, marginBottom: 14 },

  primaryAction: { borderRadius: 20, overflow: 'hidden', marginBottom: 10, ...SHADOW.md },
  primaryActionGrad: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 },
  primaryActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionTitle: { fontSize: 18, fontWeight: '900', color: C.white, marginBottom: 4 },
  primaryActionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.82)' },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW.xs,
  },
  secondaryActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 3 },
  secondaryActionDesc: { fontSize: 12, color: C.text3 },

  diseaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    ...SHADOW.xs,
  },
  diseaseIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  diseaseName: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  diseaseDesc: { fontSize: 12, color: C.text3, lineHeight: 17 },

  infoCard: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 6,
    ...SHADOW.xs,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  infoTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  infoTxt: { flex: 1, fontSize: 13, color: C.text2, lineHeight: 18 },

  tipsCard: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.light,
    marginTop: 14,
  },
  tipsTitle: { fontSize: 13, fontWeight: '800', color: C.primary, marginBottom: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 7 },
  tipTxt: { flex: 1, fontSize: 12, color: C.text2, lineHeight: 18 },
});
