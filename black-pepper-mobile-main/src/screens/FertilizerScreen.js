// src/screens/FertilizerScreen.js
// ─────────────────────────────────────────────────────────────────────────────
//  Black Pepper AI – Fertilizer Advisor
//  • Accepts pre-filled soil values from SoilAnalysisScreen / DashboardScreen
//  • Validates all four inputs (N, P, K, pH) before scoring
//  • Ranks all 7 fertilizers by match score (API → local fallback)
//  • Expandable cards with reason, application guide and cautions
//  • Matches dark forest-green design of the rest of the app
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { FERTILIZER_URL } from '../config/api';

// ─── Fertilizer catalogue ─────────────────────────────────────────────────────
const FERTS = [
  {
    id: 1,
    emoji: '🌿',
    name: 'Urea (46-0-0)',
    type: 'Nitrogen Booster',
    color: '#2e7d32',
    npk: '46-0-0',
    desc: 'Fast-acting nitrogen source. Rapidly boosts vegetative growth.',
    app: '50–200 g per plant. Water immediately. Split into 2 doses 6 weeks apart.',
    best: 'N < 40 mg/kg',
    caution: 'Do not use if N > 80 mg/kg — causes leaf burn.',
  },
  {
    id: 2,
    emoji: '⚖️',
    name: 'NPK 15-15-15',
    type: 'Balanced Complete',
    color: '#1565c0',
    npk: '15-15-15',
    desc: 'Equal N, P, K. Perfect when all nutrients are moderate.',
    app: '150–300 g per plant every 3 months.',
    best: 'All nutrients moderate or slightly deficient',
    caution: 'Avoid if any individual nutrient is already at optimal.',
  },
  {
    id: 3,
    emoji: '🌸',
    name: 'Single Super Phosphate',
    type: 'Phosphorus Booster',
    color: '#ad1457',
    npk: '0-16-0',
    desc: 'Stimulates root development and berry formation.',
    app: '30–120 g per plant in topsoil. Apply 4–6 weeks before flowering.',
    best: 'P < 20 mg/kg',
    caution: 'Over-application blocks zinc & iron uptake.',
  },
  {
    id: 4,
    emoji: '🟤',
    name: 'MOP — Muriate of Potash',
    type: 'Potassium Booster',
    color: '#6d4c41',
    npk: '0-0-60',
    desc: 'Strengthens berry walls, improves disease resistance.',
    app: '40–160 g per plant at early flowering.',
    best: 'K < 60 mg/kg',
    caution: 'Excess K blocks magnesium uptake.',
  },
  {
    id: 5,
    emoji: '🪨',
    name: 'Agricultural Lime',
    type: 'pH Corrector',
    color: '#6a1b9a',
    npk: '0-0-0 + Ca + Mg',
    desc: 'Raises soil pH. Unlocks nutrients locked by soil acidity.',
    app: '500 g–1.5 kg per plant. Wait 4–6 weeks before other fertilizers.',
    best: 'pH < 5.5',
    caution: 'Do not apply if pH > 7.0.',
  },
  {
    id: 6,
    emoji: '🌱',
    name: 'Organic Compost',
    type: 'Soil Conditioner',
    color: '#4e342e',
    npk: '~1-1-1',
    desc: 'Improves soil structure and microbial activity. Always safe.',
    app: '2–5 kg per plant around root zone. Every 2 months.',
    best: 'Any soil condition',
    caution: 'Ensure fully decomposed before application.',
  },
  {
    id: 7,
    emoji: '💎',
    name: 'NPK 12-32-16',
    type: 'Root & Bloom Blend',
    color: '#00838f',
    npk: '12-32-16',
    desc: 'High-phosphorus formula ideal for transplanting and flowering.',
    app: '100–200 g per plant at transplanting or early growth.',
    best: 'Young plants or very low P',
    caution: 'Single application per season only.',
  },
];

// ─── Validation ───────────────────────────────────────────────────────────────
const FIELD_RULES = {
  n: { label: 'Nitrogen', min: 0, max: 1000, unit: 'mg/kg' },
  p: { label: 'Phosphorus', min: 0, max: 500, unit: 'mg/kg' },
  k: { label: 'Potassium', min: 0, max: 1000, unit: 'mg/kg' },
  ph: { label: 'Soil pH', min: 3.0, max: 9.0, unit: '' },
};

/**
 * Validates a single field.
 * Returns error string or null.
 */
function validateField(key, raw) {
  const rule = FIELD_RULES[key];
  if (!raw || raw.trim() === '') return `${rule.label} is required.`;
  const val = parseFloat(raw);
  if (isNaN(val)) return `${rule.label} must be a number.`;
  if (val < rule.min)
    return `${rule.label} cannot be less than ${rule.min}${rule.unit ? ' ' + rule.unit : ''}.`;
  if (val > rule.max)
    return `${rule.label} cannot exceed ${rule.max}${rule.unit ? ' ' + rule.unit : ''}.`;
  return null;
}

/**
 * Validates all four inputs. Returns { valid, errors } where errors is an
 * object keyed by field name.
 */
function validateAll(n, p, k, ph) {
  const errors = {
    n: validateField('n', n),
    p: validateField('p', p),
    k: validateField('k', k),
    ph: validateField('ph', ph),
  };
  const valid = Object.values(errors).every((e) => e === null);
  return { valid, errors };
}

// ─── Local scoring (offline fallback) ────────────────────────────────────────
function localScore(id, n, p, k, ph) {
  let s = 0;
  if (id === 1) {
    s = 20;
    if (n < 20) s += 55;
    else if (n < 40) s += 40;
    else if (n < 60) s += 15;
    else if (n < 80) s += 2;
    else s -= 25;
    if (ph >= 5.5 && ph <= 7) s += 15;
    else if (ph < 5.5) s -= 10;
  } else if (id === 2) {
    s = 25;
    if (n >= 20 && n <= 70 && p >= 10 && p <= 35 && k >= 30 && k <= 100) s += 40;
    if (ph >= 5.5 && ph <= 7) s += 20;
  } else if (id === 3) {
    s = 18;
    if (p < 10) s += 58;
    else if (p < 20) s += 42;
    else if (p < 30) s += 20;
    else if (p < 40) s += 5;
    else s -= 15;
    if (ph >= 5.5 && ph <= 6.5) s += 14;
  } else if (id === 4) {
    s = 18;
    if (k < 30) s += 58;
    else if (k < 60) s += 42;
    else if (k < 90) s += 20;
    else if (k < 120) s += 5;
    else s -= 15;
    if (ph >= 5.5 && ph <= 7) s += 14;
  } else if (id === 5) {
    s = 15;
    if (ph < 4.5) s += 65;
    else if (ph < 5) s += 55;
    else if (ph < 5.5) s += 40;
    else if (ph < 6) s += 15;
    else if (ph > 7) s -= 25;
  } else if (id === 6) {
    s = 50;
    if (n < 30 || p < 15 || k < 40) s += 15;
    if (ph < 5.5 || ph > 7.5) s += 10;
  } else if (id === 7) {
    s = 15;
    if (p < 15) s += 38;
    if (n >= 15 && n <= 50) s += 18;
    if (k >= 20 && k <= 80) s += 15;
    if (ph >= 5.5 && ph <= 6.8) s += 14;
  }
  return Math.max(0, Math.min(100, s));
}

const matchLabel = (s) => (s >= 75 ? 'Excellent' : s >= 50 ? 'Good' : s >= 30 ? 'Fair' : 'Low');
const matchColor = (s) => (s >= 75 ? '#2e7d32' : s >= 50 ? '#e65100' : '#c62828');

function buildReason(id, n, p, k, ph) {
  if (id === 1)
    return n < 20
      ? `N critically low (${n} mg/kg). Urea (46% N) will rapidly restore vegetative growth.`
      : `N at ${n} mg/kg needs a boost. Urea is the fastest nitrogen source available.`;
  if (id === 2)
    return `All nutrients moderate. NPK 15-15-15 prevents any single deficiency from developing.`;
  if (id === 3)
    return p < 10
      ? `P critically low (${p} mg/kg). SSP will strengthen roots and improve berry formation.`
      : `P at ${p} mg/kg is below optimal. SSP improves root health and flowering.`;
  if (id === 4)
    return k < 30
      ? `K very low (${k} mg/kg). MOP rapidly raises potassium, improving berry size and disease resistance.`
      : `K at ${k} mg/kg needs a boost for optimal berry development.`;
  if (id === 5)
    return ph < 5.5
      ? `Soil is acidic (pH ${ph}). Lime MUST be applied first — acidity locks out all nutrients.`
      : `pH correction will improve overall nutrient availability across the soil profile.`;
  if (id === 6)
    return `Organic compost improves soil structure and helps all other fertilizers work more effectively.`;
  if (id === 7)
    return `High-P blend ideal for current soil profile — especially during root establishment.`;
  return '';
}

// ─── Fertilizer card component ────────────────────────────────────────────────
function FertCard({ item, rank, expanded, onToggle }) {
  const isTop = rank === 0;
  const sc = item.score ?? 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggle}
      style={[s.card, isTop && { borderWidth: 2, borderColor: item.color + '88' }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${matchLabel(sc)} match, ${sc}%`}
      accessibilityHint="Double tap to expand details"
    >
      {isTop && (
        <LinearGradient
          colors={[item.color + '22', item.color + '08']}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Tags row */}
      <View style={s.cardHead}>
        <View style={[s.rankTag, { backgroundColor: isTop ? item.color : '#eee' }]}>
          <Text style={[s.rankTxt, { color: isTop ? '#fff' : '#777' }]}>
            {isTop ? '⭐ BEST' : `#${rank + 1}`}
          </Text>
        </View>
        <View style={[s.matchTag, { backgroundColor: matchColor(sc) + '22' }]}>
          <Text style={[s.matchTxt, { color: matchColor(sc) }]}>{matchLabel(sc)} Match</Text>
        </View>
      </View>

      {/* Name row */}
      <View style={s.cardMain}>
        <Text style={s.cEmoji}>{item.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.cName}>{item.name}</Text>
          <Text style={s.cType}>
            {item.type} · NPK {item.npk}
          </Text>
        </View>
        <View style={[s.scoreCircle, { borderColor: matchColor(sc) }]}>
          <Text style={[s.scoreNum, { color: matchColor(sc) }]}>{sc}%</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={s.barBg}>
        <View style={[s.barFill, { width: `${sc}%`, backgroundColor: matchColor(sc) }]} />
      </View>
      <Text style={s.tapHint}>{expanded ? '▲ Collapse' : '▼ Tap for reason & details'}</Text>

      {/* Expanded detail */}
      {expanded && (
        <View style={s.expanded}>
          <View style={[s.reasonBox, { borderLeftColor: item.color }]}>
            <Text style={s.reasonTitle}>💡 Why This Match?</Text>
            <Text style={s.reasonTxt}>{item.reason}</Text>
          </View>
          {[
            { icon: '📋', label: 'Description', val: item.desc },
            { icon: '🎯', label: 'Best For', val: item.best },
            { icon: '📐', label: 'Application', val: item.app },
            { icon: '⚠️', label: 'Caution', val: item.caution },
          ].map((row) => (
            <View key={row.label} style={s.dRow}>
              <Text style={s.dIcon}>{row.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.dLabel}>{row.label}</Text>
                <Text style={s.dVal}>{row.val}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Numeric input sub-component ──────────────────────────────────────────────
function NumericInput({ label, unit, value, onChange, color, hint, error }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[ni.label, { color }]}>
        {label}
        {unit ? ` (${unit})` : ''}
      </Text>
      <TextInput
        style={[ni.input, { borderColor: error ? '#c62828' : color + '60' }]}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder={hint}
        placeholderTextColor="#bbb"
        returnKeyType="done"
        accessibilityLabel={label}
        accessibilityHint={`Enter ${label}${unit ? ' in ' + unit : ''}`}
      />
      {!!error && <Text style={ni.errorTxt}>{error}</Text>}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function FertilizerScreen({ navigation }) {
  const route = useRoute();
  const params = route.params ?? {};
  const farmName = params.farmName ?? null;

  // ── State ──────────────────────────────────────────────────────────────────
  const [n, setN] = useState(params.nitrogen != null ? String(params.nitrogen) : '');
  const [p, setP] = useState(params.phosphorus != null ? String(params.phosphorus) : '');
  const [k, setK] = useState(params.potassium != null ? String(params.potassium) : '');
  const [ph, setPh] = useState(params.ph != null ? String(params.ph) : '');
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [source, setSource] = useState(null);

  // Auto-analyse when arriving from soil screen with pre-filled data
  useEffect(() => {
    if (params.nitrogen != null) analyse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Analyse ────────────────────────────────────────────────────────────────
  const analyse = useCallback(async () => {
    const { valid, errors: errs } = validateAll(n, p, k, ph);
    setErrors(errs);

    if (!valid) {
      const messages = Object.values(errs).filter(Boolean).join('\n');
      Alert.alert('Invalid Input', messages, [{ text: 'OK' }]);
      return;
    }

    const nv = parseFloat(n);
    const pv = parseFloat(p);
    const kv = parseFloat(k);
    const phv = parseFloat(ph);

    setLoading(true);
    setExpanded(null);
    setResults(null);

    let ranked;

    try {
      const res = await axios.get(`${FERTILIZER_URL}?n=${nv}&p=${pv}&k=${kv}&ph=${phv}`, {
        timeout: 6000,
      });

      const apiList = res.data?.all_ranked;
      if (!Array.isArray(apiList) || apiList.length === 0) {
        throw new Error('Empty ranked list from API.');
      }

      ranked = apiList.map((f) => {
        const local = FERTS.find((x) => x.id === f.id) ?? {};
        return { ...local, ...f, reason: buildReason(f.id, nv, pv, kv, phv) };
      });
      setSource('api');
    } catch {
      // Graceful offline fallback
      ranked = FERTS.map((f) => {
        const sc = localScore(f.id, nv, pv, kv, phv);
        return {
          ...f,
          score: sc,
          match_label: matchLabel(sc),
          reason: buildReason(f.id, nv, pv, kv, phv),
        };
      }).sort((a, b) => b.score - a.score);
      setSource('local');
    }

    setResults(ranked);
    setLoading(false);
  }, [n, p, k, ph]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient colors={['#050f02', '#1a4a08', '#2d5016']} style={s.header}>
          <Text style={s.headerTitle}>🌱 Fertilizer Advisor</Text>
          {!!farmName && <Text style={s.farmTag}>📍 {farmName}</Text>}
          <Text style={s.headerSub}>
            Enter soil values to get AI-ranked recommendations with match % and reason
          </Text>
        </LinearGradient>

        {/* Input card */}
        <View style={s.inputCard}>
          <Text style={s.inputTitle}>🔬 Soil Parameters</Text>

          <View style={s.inputRow}>
            <NumericInput
              label="Nitrogen"
              unit="mg/kg"
              value={n}
              onChange={(v) => {
                setN(v);
                setErrors((e) => ({ ...e, n: null }));
              }}
              color="#2e7d32"
              hint="e.g. 45"
              error={errors.n}
            />
            <NumericInput
              label="Phosphorus"
              unit="mg/kg"
              value={p}
              onChange={(v) => {
                setP(v);
                setErrors((e) => ({ ...e, p: null }));
              }}
              color="#ad1457"
              hint="e.g. 25"
              error={errors.p}
            />
          </View>

          <View style={s.inputRow}>
            <NumericInput
              label="Potassium"
              unit="mg/kg"
              value={k}
              onChange={(v) => {
                setK(v);
                setErrors((e) => ({ ...e, k: null }));
              }}
              color="#6d4c41"
              hint="e.g. 80"
              error={errors.k}
            />
            <NumericInput
              label="Soil pH"
              unit=""
              value={ph}
              onChange={(v) => {
                setPh(v);
                setErrors((e) => ({ ...e, ph: null }));
              }}
              color="#6a1b9a"
              hint="e.g. 6.2"
              error={errors.ph}
            />
          </View>

          {/* Reference ranges */}
          <View style={s.refBox}>
            <Text style={s.refTitle}>📌 Optimal ranges for Black Pepper</Text>
            <View style={s.refGrid}>
              {[
                ['🟢', 'N', '40–80 mg/kg'],
                ['🟠', 'P', '20–40 mg/kg'],
                ['🔴', 'K', '60–120 mg/kg'],
                ['🟣', 'pH', '5.5–7.0'],
              ].map(([e, l, v]) => (
                <View key={l} style={s.refItem}>
                  <Text style={s.refEmoji}>{e}</Text>
                  <Text style={s.refLbl}>{l}</Text>
                  <Text style={s.refVal}>{v}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[s.analyseBtn, loading && { opacity: 0.7 }]}
            onPress={analyse}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityLabel="Rank all 7 fertilizers"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={['#a3d977', '#7ab84e']}
              style={s.analyseBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#0d2206" />
              ) : (
                <Text style={s.analyseBtnTxt}>🔍 Rank All 7 Fertilizers</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {results && (
          <View style={s.results}>
            {/* Source indicator */}
            <View
              style={[s.sourcePill, { backgroundColor: source === 'api' ? '#e8f5e9' : '#fff8e1' }]}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: source === 'api' ? '#2e7d32' : '#e65100',
                }}
              >
                {source === 'api'
                  ? '🟢 Results from Python AI API'
                  : '🟡 Local scoring — backend offline'}
              </Text>
            </View>

            {/* Top recommendation banner */}
            <LinearGradient
              colors={[results[0].color + '18', results[0].color + '08']}
              style={[s.topBanner, { borderColor: results[0].color }]}
            >
              <Text style={s.topTag}>⭐ Best Fertilizer for Your Soil</Text>
              <View style={s.topRow}>
                <Text style={s.topEmoji}>{results[0].emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.topName, { color: results[0].color }]}>{results[0].name}</Text>
                  <Text style={s.topScore}>
                    {results[0].score}% match · {matchLabel(results[0].score)} Match
                  </Text>
                </View>
              </View>
              <Text style={s.topReason}>{results[0].reason}</Text>
            </LinearGradient>

            <Text style={s.allTitle}>📊 All 7 Fertilizers Ranked</Text>
            <Text style={s.allSub}>Tap any card to see reason and application guide</Text>

            {results.map((item, i) => (
              <FertCard
                key={item.id}
                item={item}
                rank={i}
                expanded={expanded === item.id}
                onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              />
            ))}

            <TouchableOpacity
              style={s.backBtn}
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.85}
            >
              <Text style={s.backBtnTxt}>🗺️ View on Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f1' },
  header: { paddingTop: 30, paddingBottom: 28, paddingHorizontal: 22, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#f0fce8', marginBottom: 4 },
  farmTag: { fontSize: 12, color: '#a3d977', marginBottom: 4 },
  headerSub: { fontSize: 12, color: '#7aad55', textAlign: 'center', lineHeight: 18 },
  inputCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: 22,
    padding: 20,
    elevation: 6,
    shadowColor: '#2d5016',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    marginBottom: 14,
  },
  inputTitle: { fontSize: 16, fontWeight: '800', color: '#1a3409', marginBottom: 14 },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  refBox: { backgroundColor: '#f4f8f1', borderRadius: 14, padding: 14, marginBottom: 14 },
  refTitle: { fontSize: 11, fontWeight: '700', color: '#2d5016', marginBottom: 10 },
  refGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  refItem: { alignItems: 'center', gap: 3 },
  refEmoji: { fontSize: 14 },
  refLbl: { fontSize: 11, fontWeight: '700', color: '#555' },
  refVal: { fontSize: 10, color: '#888', textAlign: 'center' },
  analyseBtn: { borderRadius: 14, overflow: 'hidden', elevation: 4 },
  analyseBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  analyseBtnTxt: { color: '#050f02', fontSize: 16, fontWeight: '800' },
  results: { paddingHorizontal: 16 },
  sourcePill: { borderRadius: 10, padding: 9, alignItems: 'center', marginBottom: 12 },
  topBanner: { borderRadius: 20, borderWidth: 1.5, padding: 18, marginBottom: 18 },
  topTag: { fontSize: 11, fontWeight: '700', color: '#888', marginBottom: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  topEmoji: { fontSize: 32 },
  topName: { fontSize: 19, fontWeight: '900' },
  topScore: { fontSize: 13, color: '#666', marginTop: 2 },
  topReason: { fontSize: 13, color: '#444', lineHeight: 19 },
  allTitle: { fontSize: 17, fontWeight: '800', color: '#1a3409' },
  allSub: { fontSize: 11, color: '#999', marginTop: 2, marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHead: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  rankTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  rankTxt: { fontSize: 11, fontWeight: '700' },
  matchTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  matchTxt: { fontSize: 11, fontWeight: '700' },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cEmoji: { fontSize: 28 },
  cName: { fontSize: 14, fontWeight: '700', color: '#1a3409' },
  cType: { fontSize: 11, color: '#999', marginTop: 2 },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNum: { fontSize: 14, fontWeight: '900' },
  barBg: { height: 7, backgroundColor: '#eee', borderRadius: 4, marginBottom: 5 },
  barFill: { height: 7, borderRadius: 4 },
  tapHint: { fontSize: 11, color: '#ccc', textAlign: 'center' },
  expanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  reasonBox: {
    borderLeftWidth: 3,
    padding: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonTitle: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 5 },
  reasonTxt: { fontSize: 13, color: '#444', lineHeight: 19 },
  dRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'flex-start' },
  dIcon: { fontSize: 14, marginTop: 2 },
  dLabel: { fontSize: 11, fontWeight: '700', color: '#888', marginBottom: 2 },
  dVal: { fontSize: 13, color: '#333', lineHeight: 18 },
  backBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#c8e6a0',
    padding: 13,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    marginTop: 6,
  },
  backBtnTxt: { color: '#2d5016', fontSize: 14, fontWeight: '700' },
});

const ni = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#fafafa',
  },
  errorTxt: { fontSize: 10, color: '#c62828', marginTop: 4 },
});
