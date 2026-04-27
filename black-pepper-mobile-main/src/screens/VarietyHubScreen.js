// src/screens/VarietyHubScreen.js — Light Theme v3
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C, SHADOW } from '../components/theme';
import BottomNav from '../components/BottomNav';

const VARIETIES = [
  {
    name: 'Butawerala',
    emoji: '🫑',
    color: '#2E7D32',
    traits: ['High yield', 'Disease resistant', 'Bold berries'],
    desc: 'The most widely cultivated variety in Sri Lanka. Known for bold berries and strong disease resistance.',
  },
  {
    name: 'Dingirala',
    emoji: '🌿',
    color: C.blue,
    traits: ['Aromatic', 'Medium yield', 'Early bearing'],
    desc: 'Prized for its strong aroma and pungency. Reaches bearing stage earlier than other varieties.',
  },
  {
    name: 'Kohukuburerala',
    emoji: '🍃',
    color: C.purple,
    traits: ['Long spikes', 'High pungency', 'Heavy fruiting'],
    desc: 'Distinguished by long spikes and high piperine content. Preferred for export quality.',
  },
];

export default function VarietyHubScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  // fade/slide are Animated.Value refs and intentionally stable

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient colors={[C.teal, '#00ACC1', '#26C6DA']} style={s.hero}>
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            <View style={s.heroBadge}>
              <View style={s.heroBadgeDot} />
              <Text style={s.heroBadgeTxt}>TWO-STAGE AI IDENTIFICATION</Text>
            </View>
            <Text style={s.heroTitle}>Black Pepper{'\n'}Variety Module</Text>
            <Text style={s.heroSub}>
              AI identifies Butawerala, Dingirala & Kohukuburerala from leaf images with high
              accuracy
            </Text>
          </Animated.View>
        </LinearGradient>

        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          {/* Quick actions */}
          <View style={s.section}>
            <Text style={s.sectionCap}>QUICK ACTIONS</Text>
            <View style={s.actionRow}>
              <TouchableOpacity
                style={[s.actionCard, { borderColor: C.teal + '44', backgroundColor: '#E0F7FA' }]}
                onPress={() => navigation.navigate('VarietyIdentify')}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="Identify variety"
              >
                <View style={[s.actionIcon, { backgroundColor: '#B2EBF2' }]}>
                  <Ionicons name="scan-outline" size={26} color={C.teal} />
                </View>
                <Text style={[s.actionTitle, { color: C.teal }]}>Identify Variety</Text>
                <Text style={s.actionDesc}>Upload a leaf image for AI classification</Text>
                <View style={[s.actionBtn, { backgroundColor: C.teal }]}>
                  <Text style={s.actionBtnTxt}>Start →</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.actionCard, { backgroundColor: C.white, borderColor: C.border }]}
                onPress={() => navigation.navigate('VarietyHistory')}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="View scan history"
              >
                <View style={[s.actionIcon, { backgroundColor: C.xlight }]}>
                  <Ionicons name="time-outline" size={26} color={C.primary} />
                </View>
                <Text style={[s.actionTitle, { color: C.primary }]}>Scan History</Text>
                <Text style={s.actionDesc}>Review all previous variety scans</Text>
                <View
                  style={[
                    s.actionBtn,
                    { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.primary },
                  ]}
                >
                  <Text style={[s.actionBtnTxt, { color: C.primary }]}>Open →</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Varieties */}
          <View style={s.section}>
            <Text style={s.sectionCap}>KNOWN VARIETIES</Text>
            <Text style={s.sectionTitle}>3 Sri Lankan Varieties</Text>
            {VARIETIES.map((v) => (
              <TouchableOpacity
                key={v.name}
                style={s.varietyCard}
                onPress={() => navigation.navigate('VarietyInfo', { variety: v.name })}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <View style={[s.varietyIcon, { backgroundColor: v.color + '18' }]}>
                  <Text style={{ fontSize: 24 }}>{v.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.varietyName, { color: v.color }]}>{v.name}</Text>
                  <Text style={s.varietyDesc} numberOfLines={2}>
                    {v.desc}
                  </Text>
                  <View style={s.traitRow}>
                    {v.traits.map((t) => (
                      <View
                        key={t}
                        style={[
                          s.trait,
                          { backgroundColor: v.color + '15', borderColor: v.color + '33' },
                        ]}
                      >
                        <Text style={[s.traitTxt, { color: v.color }]}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.hint} />
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Info */}
          <View style={s.infoCard}>
            <Text style={s.infoTitle}>🤖 How the AI Works</Text>
            {[
              {
                icon: 'shield-checkmark-outline',
                txt: 'Stage A: Verifies the image is a black pepper leaf (filters non-leaf images)',
              },
              {
                icon: 'scan-outline',
                txt: 'Stage B: EfficientNet classifies among 3 Sri Lankan varieties',
              },
              { icon: 'stats-chart-outline', txt: 'Confidence scores shown for all 3 varieties' },
            ].map((item, i) => (
              <View key={i} style={s.infoRow}>
                <Ionicons name={item.icon} size={16} color={C.teal} />
                <Text style={s.infoTxt}>{item.txt}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
        <View style={{ height: 20 }} />
      </ScrollView>
      <BottomNav navigation={navigation} active="Variety" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 16 },

  hero: { paddingTop: 52, paddingBottom: 28, paddingHorizontal: 22 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  heroBadgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.8)' },
  heroBadgeTxt: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  heroTitle: { fontSize: 26, fontWeight: '900', color: C.white, lineHeight: 33, marginBottom: 8 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 18 },

  section: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  sectionCap: {
    fontSize: 10,
    fontWeight: '800',
    color: C.text3,
    letterSpacing: 2,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 14 },

  actionRow: { gap: 10 },
  actionCard: { borderRadius: 20, padding: 18, borderWidth: 1, ...SHADOW.xs, marginBottom: 2 },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: { fontSize: 19, fontWeight: '900', marginBottom: 5 },
  actionDesc: { fontSize: 13, color: C.text3, lineHeight: 18, marginBottom: 14 },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  actionBtnTxt: { color: C.white, fontSize: 13, fontWeight: '700' },

  varietyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW.xs,
  },
  varietyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  varietyName: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  varietyDesc: { fontSize: 12, color: C.text3, marginBottom: 8, lineHeight: 16 },
  traitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  trait: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
  traitTxt: { fontSize: 10, fontWeight: '700' },

  infoCard: {
    backgroundColor: C.xlight,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.light,
    marginTop: 6,
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: C.primary, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  infoTxt: { flex: 1, fontSize: 13, color: C.text2, lineHeight: 18 },
});
