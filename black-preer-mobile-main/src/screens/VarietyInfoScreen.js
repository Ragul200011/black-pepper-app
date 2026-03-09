// src/screens/VarietyInfoScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SHADOW } from '../components/theme';

const VARIETY_DATA = {
  Butawerala: {
    color: '#2e7d32', emoji: '🫑',
    origin: 'Sri Lanka (Western Province)',
    yield: 'High (4–6 kg dry pepper per vine/year)',
    climate: 'Humid tropical, 22–32°C',
    soil: 'Well-drained loamy soil, pH 5.5–7.0',
    traits: ['Disease resistant', 'Bold berries', 'Strong vines', 'High yield'],
    desc: 'The most widely cultivated black pepper variety in Sri Lanka. Butawerala is known for its bold, heavy berries and exceptional disease resistance, making it the preferred choice for commercial cultivation.',
    tips: ['Space vines 2–3 m apart','Apply NPK 15-15-15 every 3 months','Harvest when 5–10% berries turn red','Prune after each harvest season'],
  },
  Dingirala: {
    color: '#1565c0', emoji: '🌿',
    origin: 'Sri Lanka (Sabaragamuwa)',
    yield: 'Medium (2–4 kg dry pepper per vine/year)',
    climate: 'Tropical, 20–30°C',
    soil: 'Rich organic soil, pH 5.8–6.8',
    traits: ['High aroma', 'Early bearing', 'Medium berries', 'Pungent'],
    desc: 'Dingirala is prized for its intense aroma and pungency. It reaches the bearing stage earlier than other varieties, making it suitable for farmers seeking faster returns.',
    tips: ['Ideal for shaded cultivation','Mulch heavily to retain moisture','Harvest before full maturity for maximum aroma','Suitable for organic farming systems'],
  },
  Kohukuburerala: {
    color: '#6a1b9a', emoji: '🍃',
    origin: 'Sri Lanka (Central Province)',
    yield: 'High (5–7 kg dry pepper per vine/year)',
    climate: 'Cooler tropical highlands, 18–28°C',
    soil: 'Deep fertile soil, pH 5.5–6.5',
    traits: ['Long spikes', 'High piperine', 'Heavy fruiting', 'Export quality'],
    desc: 'Distinguished by its exceptionally long spikes carrying many berries. Kohukuburerala has high piperine content making it highly valued for export and pharmaceutical use.',
    tips: ['Requires sturdy support poles','Water regularly during dry season','Apply potassium-rich fertilizer at flowering','Best suited for highland regions'],
  },
};

export default function VarietyInfoScreen({ route, navigation }) {
  const varietyName = route.params?.variety ?? 'Butawerala';
  const data        = VARIETY_DATA[varietyName] ?? VARIETY_DATA['Butawerala'];
  const result      = route.params?.result;

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <LinearGradient colors={[data.color + 'cc', C.bg0]} style={s.hero}>
        <Text style={s.heroEmoji}>{data.emoji}</Text>
        <Text style={s.heroName}>{varietyName}</Text>
        <Text style={s.heroOrigin}>📍 {data.origin}</Text>

        {/* Confidence from AI scan if available */}
        {result && (
          <View style={s.confBadge}>
            <Text style={s.confTxt}>
              AI Confidence: {result.confidence ?? '—'}%
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={s.content}>
        {/* Traits */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏷️ Key Traits</Text>
          <View style={s.traitRow}>
            {data.traits.map((tr) => (
              <View key={tr} style={[s.traitBadge, { backgroundColor: data.color + '22', borderColor: data.color + '44' }]}>
                <Text style={[s.traitTxt, { color: data.color }]}>{tr}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📋 Profile</Text>
          <View style={s.detailCard}>
            {[
              { label: 'Expected Yield', val: data.yield },
              { label: 'Climate',        val: data.climate },
              { label: 'Soil Preference',val: data.soil },
            ].map((row) => (
              <View key={row.label} style={s.detailRow}>
                <Text style={s.detailLabel}>{row.label}</Text>
                <Text style={s.detailVal}>{row.val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📖 Description</Text>
          <View style={s.descCard}>
            <Text style={s.descTxt}>{data.desc}</Text>
          </View>
        </View>

        {/* Cultivation tips */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🌱 Cultivation Tips</Text>
          <View style={s.tipsCard}>
            {data.tips.map((tip, i) => (
              <View key={i} style={s.tipRow}>
                <View style={[s.tipDot, { backgroundColor: data.color }]} />
                <Text style={s.tipTxt}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: data.color }]}
          onPress={() => navigation.navigate('VarietyIdentify')}
          activeOpacity={0.85}
        >
          <Text style={s.actionBtnTxt}>🔍  Scan Another Leaf</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryBtn}
          onPress={() => navigation.navigate('VarietyHistory')}
          activeOpacity={0.85}
        >
          <Text style={s.secondaryBtnTxt}>📜  View Scan History</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg1 },
  scroll: { paddingBottom: 16 },
  hero:   { paddingTop: 60, paddingBottom: 36, paddingHorizontal: 22, alignItems: 'center' },
  heroEmoji:  { fontSize: 56, marginBottom: 12 },
  heroName:   { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 6 },
  heroOrigin: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  confBadge:  { marginTop: 14, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 99 },
  confTxt:    { fontSize: 13, fontWeight: '700', color: '#fff' },
  content:    { paddingHorizontal: 16 },
  section:    { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.white, marginBottom: 10 },
  traitRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99, borderWidth: 1 },
  traitTxt:   { fontSize: 12, fontWeight: '700' },
  detailCard: { backgroundColor: C.bg3, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  detailRow:  { padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  detailLabel:{ fontSize: 11, fontWeight: '700', color: C.muted, marginBottom: 3 },
  detailVal:  { fontSize: 14, color: C.white },
  descCard:   { backgroundColor: C.bg3, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  descTxt:    { fontSize: 14, color: C.sage, lineHeight: 22 },
  tipsCard:   { backgroundColor: C.bg3, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 10 },
  tipRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipDot:     { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
  tipTxt:     { flex: 1, fontSize: 13, color: C.sage, lineHeight: 20 },
  actionBtn:    { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12, ...SHADOW.md },
  actionBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryBtn:    { paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', backgroundColor: C.bg3 },
  secondaryBtnTxt: { color: C.lime, fontSize: 14, fontWeight: '700' },
});