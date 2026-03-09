// src/screens/VarietyHubScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SHADOW } from '../components/theme';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

const VARIETIES = [
  {
    name: 'Butawerala',
    emoji: '🫑',
    color: '#2e7d32',
    traits: ['High yield', 'Disease resistant', 'Bold berries'],
    desc: 'The most widely cultivated variety in Sri Lanka. Known for its bold berries and strong disease resistance.',
  },
  {
    name: 'Dingirala',
    emoji: '🌿',
    color: '#1565c0',
    traits: ['Aromatic', 'Medium yield', 'Early bearing'],
    desc: 'Prized for its strong aroma and pungency. Reaches bearing stage earlier than other varieties.',
  },
  {
    name: 'Kohukuburerala',
    emoji: '🍃',
    color: '#6a1b9a',
    traits: ['Long spikes', 'High pungency', 'Heavy fruiting'],
    desc: 'Distinguished by its exceptionally long spikes and high piperine content. Preferred for export quality.',
  },
];

export default function VarietyHubScreen({ navigation }) {
  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <LinearGradient colors={[C.bg0, C.bg2, C.pine]} style={s.hero}>
          <View style={s.blob1} />
          <View style={s.heroBadge}>
            <View style={s.dot} />
            <Text style={s.badgeTxt}>🫑 VARIETY IDENTIFICATION AI</Text>
          </View>
          <Text style={s.heroTitle}>Black Pepper{'\n'}Variety Module</Text>
          <Text style={s.heroSub}>
            Two-stage AI identifies Butawerala, Dingirala &amp; Kohukuburerala
            from leaf images with high accuracy.
          </Text>
        </LinearGradient>

        {/* Quick actions */}
        <View style={s.section}>
          <View style={s.actionRow}>
            <TouchableOpacity
              style={[s.actionCard, { borderColor: C.lime + '55' }]}
              onPress={() => navigation.navigate('VarietyIdentify')}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[C.lime + '18', C.bg2]} style={s.actionGrad}>
                <Text style={s.actionEmoji}>🔍</Text>
                <Text style={[s.actionTitle, { color: C.lime }]}>Identify Variety</Text>
                <Text style={s.actionSub}>Upload a leaf image for AI classification</Text>
                <View style={[s.actionBtn, { backgroundColor: C.lime }]}>
                  <Text style={[s.actionBtnTxt, { color: C.bg0 }]}>Start →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionCard}
              onPress={() => navigation.navigate('VarietyHistory')}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[C.bg3, C.bg2]} style={s.actionGrad}>
                <Text style={s.actionEmoji}>🕘</Text>
                <Text style={s.actionTitle}>Scan History</Text>
                <Text style={s.actionSub}>Review previous identifications</Text>
                <View style={s.actionBtn}>
                  <Text style={s.actionBtnTxt}>View →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Variety cards */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🌿 Known Varieties</Text>
          <Text style={s.sectionSub}>Tap a variety card to view detailed information</Text>
          {VARIETIES.map((v) => (
            <TouchableOpacity
              key={v.name}
              style={[s.varietyCard, { borderTopColor: v.color }]}
              onPress={() => navigation.navigate('VarietyInfo', { variety: v.name })}
              activeOpacity={0.85}
            >
              <View style={s.varietyRow}>
                <View style={[s.varietyIcon, { backgroundColor: v.color + '22' }]}>
                  <Text style={{ fontSize: 26 }}>{v.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.varietyName, { color: v.color }]}>{v.name}</Text>
                  <Text style={s.varietyDesc} numberOfLines={2}>{v.desc}</Text>
                  <View style={s.traitRow}>
                    {v.traits.map((tr) => (
                      <View key={tr} style={[s.traitBadge, { backgroundColor: v.color + '18' }]}>
                        <Text style={[s.traitTxt, { color: v.color }]}>{tr}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Text style={[s.arrow, { color: v.color }]}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
      <BottomNav navigation={navigation} active="VarietyHub" />
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg1 },
  scroll: { paddingBottom: 16 },
  hero:   { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 22, overflow: 'hidden' },
  blob1:  { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: C.pine + 'aa', top: -70, right: -60 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.lime + '18', borderWidth: 1, borderColor: C.lime + '35', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 14 },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  badgeTxt:  { fontSize: 10, color: C.lime, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: C.white, marginBottom: 8, lineHeight: 34 },
  heroSub:   { fontSize: 12, color: C.sage, lineHeight: 20 },
  section:      { paddingHorizontal: 16, paddingBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.white, marginBottom: 4 },
  sectionSub:   { fontSize: 11, color: C.muted, marginBottom: 12 },
  actionRow:    { flexDirection: 'row', gap: 12, marginVertical: 16 },
  actionCard:   { flex: 1, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.border, ...SHADOW.sm },
  actionGrad:   { padding: 18, alignItems: 'center' },
  actionEmoji:  { fontSize: 30, marginBottom: 8 },
  actionTitle:  { fontSize: 15, fontWeight: '800', color: C.white, marginBottom: 6, textAlign: 'center' },
  actionSub:    { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 16, marginBottom: 14 },
  actionBtn:    { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: C.border },
  actionBtnTxt: { fontSize: 13, fontWeight: '700', color: C.white },
  varietyCard:  { backgroundColor: C.bg3, borderRadius: 16, padding: 16, marginBottom: 12, borderTopWidth: 3, borderWidth: 1, borderColor: C.border, ...SHADOW.sm },
  varietyRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  varietyIcon:  { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  varietyName:  { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  varietyDesc:  { fontSize: 12, color: C.muted, lineHeight: 18, marginBottom: 8 },
  traitRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  traitBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  traitTxt:     { fontSize: 10, fontWeight: '700' },
  arrow:        { fontSize: 28, fontWeight: '300', alignSelf: 'center' },
});