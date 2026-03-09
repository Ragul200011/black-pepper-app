// src/screens/SoilAnalysisScreen.js
// ─────────────────────────────────────────────────────────────────────────────
//  Black Pepper AI – Live Soil Analysis Screen
//  • Fetches live sensor data from ThingSpeak via Node.js backend (port 5001)
//  • Displays 7 sensor readings: Temperature, Moisture, N, P, K, pH, Humidity
//  • Animated metric cards with ideal-zone bar charts
//  • AI ensemble verdict: RF + XGBoost + SVM consensus
//  • Input validation on all user-triggered actions
//  • One-tap navigation to Fertilizer Advisor with pre-filled values
//  • Auto-refresh every 30 seconds with live countdown
//  • Matches dark forest-green design of the rest of the app
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { C, SHADOW } from '../components/theme';
import BottomNav from '../components/BottomNav';
import { SOIL_ANALYSIS_URL } from '../config/api';

// ─── Constants ───────────────────────────────────────────────────────────────
const AUTO_REFRESH_SECONDS = 30;
const REQUEST_TIMEOUT_MS   = 15000;

// ─── Sensor metadata ─────────────────────────────────────────────────────────
// Ordered to match the RS485 7-in-1 sensor hardware output:
// field1=Moisture  field2=Temperature  field4=pH  field5=N  field6=P  field7=K
const METRICS = [
  { key: 'Moisture',    label: 'Moisture',    unit: '%',     emoji: '💧', color: C.blue,    min: 0,  max: 100, ideal: [50, 75]   },
  { key: 'Temperature', label: 'Temperature', unit: '°C',    emoji: '🌡️', color: C.amber,   min: 15, max: 40,  ideal: [22, 32]   },
  { key: 'pH',          label: 'pH Level',    unit: '',      emoji: '🧪', color: C.purple,  min: 3,  max: 9,   ideal: [5.5, 7.0] },
  { key: 'Nitrogen',    label: 'Nitrogen',    unit: 'mg/kg', emoji: '🌿', color: C.green,   min: 0,  max: 300, ideal: [40, 80]   },
  { key: 'Phosphorus',  label: 'Phosphorus',  unit: 'mg/kg', emoji: '🌸', color: C.rose,    min: 0,  max: 100, ideal: [20, 40]   },
  { key: 'Potassium',   label: 'Potassium',   unit: 'mg/kg', emoji: '🟤', color: C.brown,   min: 0,  max: 400, ideal: [60, 120]  },
  // Humidity is not sent by this sensor hardware — shows 0 and is hidden in the UI
];

// ─── Validation ──────────────────────────────────────────────────────────────
/**
 * Validates that sensor data object contains all required keys
 * with numeric values within plausible physical ranges.
 * Returns { valid: boolean, issues: string[] }
 */
function validateSensorData(sensors) {
  if (!sensors || typeof sensors !== 'object') {
    return { valid: false, issues: ['No sensor data received from server.'] };
  }
  const issues = [];
  METRICS.forEach((m) => {
    if (m.key === 'Humidity') return; // Not sent by this sensor hardware — skip validation
    const raw = sensors[m.key];
    if (raw == null) {
      issues.push(`Missing field: ${m.label}`);
      return;
    }
    const val = parseFloat(raw);
    if (isNaN(val)) {
      issues.push(`${m.label} is not a number (got: ${raw})`);
    } else if (val < m.min - 1 || val > m.max + 1) {
      issues.push(`${m.label} out of expected range: ${val}${m.unit}`);
    }
  });
  return { valid: issues.length === 0, issues };
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function statusOf(key, rawValue) {
  const m   = METRICS.find((x) => x.key === key);
  const val = parseFloat(rawValue);
  if (!m || isNaN(val)) return { color: '#888', label: '—' };
  if (val >= m.ideal[0] && val <= m.ideal[1])
    return { color: C.green,  label: 'Optimal' };
  if (val < m.ideal[0] * 0.75 || val > m.ideal[1] * 1.35)
    return { color: C.red,    label: 'Critical' };
  return                 { color: C.amber,  label: 'Off-range' };
}

function barPct(key, rawValue) {
  const m   = METRICS.find((x) => x.key === key);
  const val = parseFloat(rawValue);
  if (!m || isNaN(val)) return 2;
  return Math.min(100, Math.max(2, ((val - m.min) / (m.max - m.min)) * 100));
}

function idealLeft(m)  { return ((m.ideal[0] - m.min) / (m.max - m.min)) * 100; }
function idealWidth(m) { return ((m.ideal[1] - m.ideal[0]) / (m.max - m.min)) * 100; }

// ─── Error parsing ────────────────────────────────────────────────────────────
function parseError(e) {
  if (e.response) {
    const b = e.response.data || {};
    return {
      title:  b.error  || `Server error ${e.response.status}`,
      reason: b.reason || b.hint || '',
      hint:   b.hint   || '',
      raw:    b.raw    || '',
    };
  }
  if (
    e.message?.includes('Network request failed') ||
    e.message?.includes('Network Error') ||
    e.message?.includes('ECONNREFUSED')
  ) {
    return {
      title:  'Cannot reach backend (port 5001)',
      reason: 'The app cannot connect to the Node.js server on your PC.',
      hint: [
        'Android Emulator → set DEV_HOST = "10.0.2.2" in src/config/api.js',
        'Physical device  → set DEV_HOST = your PC LAN IP (e.g. 192.168.1.10)',
        'iOS Simulator    → set DEV_HOST = "127.0.0.1"',
        'Then: cd backend → npm install → npm run dev',
      ].join('\n'),
      raw: '',
    };
  }
  if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
    return {
      title:  'Request timed out',
      reason: 'Backend or ThingSpeak did not respond within 15 seconds.',
      hint:   'Ensure the Node.js server is running: cd backend && npm run dev',
      raw: '',
    };
  }
  return { title: 'Unexpected error', reason: e.message, hint: '', raw: '' };
}

// ─── Animated MetricRow component ────────────────────────────────────────────
function MetricRow({ m, value, delay }) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  const { color, label } = statusOf(m.key, value);
  const pct = barPct(m.key, value);

  const displayVal =
    value != null
      ? m.key === 'pH'
        ? parseFloat(value).toFixed(1)
        : Math.round(parseFloat(value))
      : '—';

  return (
    <Animated.View
      style={[s.metricCard, { opacity: fade, transform: [{ translateY: slide }] }]}
      accessible
      accessibilityLabel={`${m.label}: ${displayVal}${m.unit}. Status: ${label}`}
    >
      <View style={s.metricTop}>
        <View style={[s.metricIconWrap, { backgroundColor: color + '22' }]}>
          <Text style={s.metricEmoji}>{m.emoji}</Text>
        </View>

        <View style={s.metricTextWrap}>
          <Text style={s.metricKey}>{m.label}</Text>
          <Text style={[s.metricVal, { color }]}>
            {displayVal}{m.unit ? ` ${m.unit}` : ''}
          </Text>
        </View>

        <View style={[s.statusTag, { backgroundColor: color + '22' }]}>
          <View style={[s.statusDot, { backgroundColor: color }]} />
          <Text style={[s.statusTagTxt, { color }]}>{label}</Text>
        </View>
      </View>

      {/* Bar with ideal zone */}
      <View style={s.barBg}>
        <View
          style={[
            s.idealZone,
            { left: `${idealLeft(m)}%`, width: `${idealWidth(m)}%` },
          ]}
        />
        <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={s.idealText}>
        Ideal: {m.ideal[0]}–{m.ideal[1]}{m.unit || ''}
      </Text>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SoilAnalysisScreen({ navigation }) {
  const [loading,      setLoading]      = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [data,         setData]         = useState(null);
  const [errInfo,      setErrInfo]      = useState(null);
  const [lastFetch,    setLastFetch]    = useState(null);
  const [countdown,    setCountdown]    = useState(null);
  const [dataWarnings, setDataWarnings] = useState([]);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  // ── Auto-refresh countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      fetchData(true);
      return;
    }
    const t = setTimeout(() => {
      if (isMounted.current) setCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setErrInfo(null);
    setDataWarnings([]);

    try {
      const res = await axios.get(SOIL_ANALYSIS_URL, { timeout: REQUEST_TIMEOUT_MS });

      // ── Validate server response structure ──
      if (!res.data || typeof res.data !== 'object') {
        throw new Error('Invalid response structure from server.');
      }
      if (!res.data.sensors) {
        throw new Error('Server response missing "sensors" field.');
      }
      // ai_analysis may be null if Python/ML is unavailable — sensors still show

      // ── Validate sensor values ──
      const { valid, issues } = validateSensorData(res.data.sensors);
      if (!valid) {
        // Show warnings but still display data — don't block the user
        if (isMounted.current) setDataWarnings(issues);
      }

      if (isMounted.current) {
        setData(res.data);
        setLastFetch(new Date().toLocaleTimeString());
        setCountdown(AUTO_REFRESH_SECONDS);
      }
    } catch (e) {
      if (isMounted.current) {
        setErrInfo(parseError(e));
        setCountdown(null);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // ── Pull-to-refresh ────────────────────────────────────────────────────────
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // ── Navigate to Fertilizer ─────────────────────────────────────────────────
  const goToFertilizer = useCallback(() => {
    if (!sensors) return;

    // Validate values before navigating
    const n  = parseFloat(sensors.Nitrogen);
    const p  = parseFloat(sensors.Phosphorus);
    const k  = parseFloat(sensors.Potassium);
    const ph = parseFloat(sensors.pH);

    if ([n, p, k, ph].some(isNaN)) {
      Alert.alert(
        'Invalid Sensor Data',
        'One or more sensor readings are not valid numbers. Please re-fetch data before continuing.',
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('Fertilizer', {
      nitrogen:   n,
      phosphorus: p,
      potassium:  k,
      ph:         ph,
      farmName:   'Live Sensor Data',
    });
  }, [navigation, data]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const sensors     = data?.sensors     ?? null;
  const ai          = data?.ai_analysis ?? null;
  const isHealthy   = ai?.status === 'Healthy' || ai?.prediction === 'Healthy';
  const isRuleBased = !!ai?.rule_based;
  const serverWarn  = data?.warning ?? null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.lime}
            colors={[C.lime]}
          />
        }
      >
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <LinearGradient colors={[C.bg0, C.bg2, C.pine]} style={s.hero}>
          <View style={s.blob1} />
          <View style={s.blob2} />

          <View style={s.heroBadge}>
            <View style={s.heroBadgeDot} />
            <Text style={s.heroBadgeTxt}>🌱 LIVE THINGSPEAK IoT</Text>
          </View>

          <Text style={s.heroTitle}>Soil Monitor</Text>
          <Text style={s.heroSub}>
            Real-time NPK · Temperature · Moisture · pH · Humidity{'\n'}
            Ensemble AI verdict: RF + XGBoost + SVM
          </Text>

          <View style={s.statusRow}>
            <View style={s.statusItem}>
              <Text style={s.statusVal}>{lastFetch ?? '—'}</Text>
              <Text style={s.statusLbl}>Last Read</Text>
            </View>
            <View style={s.statusDiv} />
            <View style={s.statusItem}>
              <View
                style={[
                  s.onlinePill,
                  { backgroundColor: errInfo ? C.red + '22' : lastFetch ? C.green + '22' : C.amber + '22' },
                ]}
              >
                <View
                  style={[
                    s.onlineDot,
                    { backgroundColor: errInfo ? C.red : lastFetch ? C.green : C.amber },
                  ]}
                />
                <Text
                  style={[
                    s.onlineTxt,
                    { color: errInfo ? C.red : lastFetch ? C.lime : C.amber },
                  ]}
                >
                  {errInfo ? 'Offline' : lastFetch ? 'Online' : 'Ready'}
                </Text>
              </View>
              <Text style={s.statusLbl}>Status</Text>
            </View>
            <View style={s.statusDiv} />
            <View style={s.statusItem}>
              <Text style={s.statusVal}>
                {countdown != null ? `${countdown}s` : '—'}
              </Text>
              <Text style={s.statusLbl}>Auto-refresh</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── FETCH BUTTON ──────────────────────────────────────────────── */}
        <View style={s.fetchWrap}>
          <TouchableOpacity
            style={[s.fetchBtn, loading && s.fetchBtnDisabled]}
            onPress={() => fetchData(false)}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityLabel="Read sensors now"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[C.lime, '#7ab84e']}
              style={s.fetchBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={C.bg0} />
              ) : (
                <Text style={s.fetchBtnTxt}>📡  Read Sensors Now</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <Text style={s.pullHint}>or pull down to refresh</Text>
        </View>

        {/* ── ERROR CARD ────────────────────────────────────────────────── */}
        {errInfo && (
          <View style={s.errorCard} accessibilityRole="alert">
            <View style={s.errorHeader}>
              <Text style={s.errorEmoji}>🔌</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.errorTitle}>{errInfo.title}</Text>
                {!!errInfo.reason && (
                  <Text style={s.errorReason}>{errInfo.reason}</Text>
                )}
              </View>
            </View>

            {!!errInfo.hint && (
              <View style={s.hintBox}>
                <Text style={s.hintTitle}>💡 How to fix</Text>
                <Text style={s.hintTxt}>{errInfo.hint}</Text>
              </View>
            )}

            {!!errInfo.raw && (
              <TouchableOpacity
                style={s.rawBtn}
                onPress={() => Alert.alert('Raw server error', errInfo.raw)}
              >
                <Text style={s.rawBtnTxt}>Show raw error →</Text>
              </TouchableOpacity>
            )}

            <View style={s.checklist}>
              <Text style={s.checklistTitle}>📋 Setup checklist</Text>
              {[
                'cd backend  →  npm install  →  npm run dev',
                'Backend prints: 🌿 Running on http://localhost:5001',
                'Test: open http://localhost:5001/health in your browser',
                'Android emulator: DEV_HOST = "10.0.2.2" in src/config/api.js',
                'Physical device:  DEV_HOST = your PC LAN IP (e.g. 192.168.1.10)',
              ].map((step, i) => (
                <View key={i} style={s.checkRow}>
                  <Text style={s.checkN}>{i + 1}</Text>
                  <Text style={s.checkTxt}>{step}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={s.retryBtn}
              onPress={() => fetchData(false)}
              activeOpacity={0.85}
              accessibilityLabel="Retry fetching sensor data"
            >
              <Text style={s.retryTxt}>🔄  Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── DATA VALIDATION WARNINGS ──────────────────────────────────── */}
        {dataWarnings.length > 0 && (
          <View style={s.warnCard}>
            <Text style={s.warnCardTitle}>⚠️ Data Quality Warnings</Text>
            {dataWarnings.map((w, i) => (
              <Text key={i} style={s.warnTxt}>• {w}</Text>
            ))}
          </View>
        )}

        {/* ── SERVER WARNING ────────────────────────────────────────────── */}
        {!!serverWarn && (
          <View style={s.warnPill}>
            <Text style={s.warnTxt}>⚠️ {serverWarn}</Text>
          </View>
        )}

        {/* ── RULE-BASED NOTICE ─────────────────────────────────────────── */}
        {isRuleBased && !serverWarn && (
          <View style={s.warnPill}>
            <Text style={s.warnTxt}>
              🟡 Rule-based prediction in use (ML models not loaded).
              Install model files in model_results_smote/ for full ensemble accuracy.
            </Text>
          </View>
        )}

        {/* ── AI WARNING BANNER ── */}
        {data?.ai_warning && (
          <View style={s.section}>
            <View style={s.aiWarnCard}>
              <Text style={s.aiWarnEmoji}>🤖</Text>
              <View style={{flex:1}}>
                <Text style={s.aiWarnTitle}>AI Model Unavailable</Text>
                <Text style={s.aiWarnTxt}>Live sensor data is shown above. ML prediction is offline: {data.ai_warning}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── AI VERDICT ────────────────────────────────────────────────── */}
        {ai && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🤖 AI Fertilizer Verdict</Text>
            <LinearGradient
              colors={isHealthy ? [C.green, '#1b5e20'] : ['#b71c1c', C.red]}
              style={s.verdictCard}
            >
              <View style={s.verdictBlob} />
              <Text style={s.verdictEmoji}>{isHealthy ? '✅' : '⚠️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>
                  {ai.consensus ?? ai.prediction ?? '—'}
                </Text>
                <Text style={s.verdictSub}>
                  {isRuleBased
                    ? `Rule-based · ${ai.note ?? ''}`
                    : `RF: ${ai.rf ?? '—'}  ·  XGB: ${ai.xgb ?? '—'}  ·  SVM: ${ai.svm ?? '—'}`}
                </Text>
              </View>
              <View
                style={[
                  s.verdictBadge,
                  { backgroundColor: isHealthy ? '#c8e6c9' : '#ffcdd2' },
                ]}
              >
                <Text
                  style={[
                    s.verdictBadgeTxt,
                    { color: isHealthy ? '#1b5e20' : '#b71c1c' },
                  ]}
                >
                  {isHealthy ? 'Healthy Soil' : 'Needs Attention'}
                </Text>
              </View>
            </LinearGradient>

            <View style={s.verdictNote}>
              <Text style={s.verdictNoteTxt}>
                {isHealthy
                  ? '✅  Soil nutrient levels are within the optimal range for black pepper cultivation. Maintain your current fertilizer schedule.'
                  : '⚠️  One or more soil nutrients are outside the optimal range. Tap the button below to get a detailed fertilizer plan.'}
              </Text>
            </View>
          </View>
        )}

        {/* ── SENSOR READINGS ───────────────────────────────────────────── */}
        {sensors && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>📊 Sensor Readings</Text>
            <Text style={s.sectionSub}>
              6 live parameters from your RS-485 IoT sensor via ThingSpeak
            </Text>
            {METRICS.map((m, i) => {
              if (m.key === 'Humidity') return null; // Not sent by this sensor
              const val = sensors[m.key];
              if (val == null) return null;
              return (
                <MetricRow key={m.key} m={m} value={val} delay={i * 55} />
              );
            })}
          </View>
        )}

        {/* ── OPTIMAL RANGES REFERENCE TABLE ────────────────────────────── */}
        {sensors && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>📋 Optimal Ranges — Black Pepper</Text>
            <View style={s.rangeCard}>
              {METRICS.filter(m => m.key !== 'Humidity').map((m, i, arr) => {
                const { color, label } = statusOf(m.key, sensors[m.key]);
                return (
                  <View
                    key={m.key}
                    style={[
                      s.rangeRow,
                      i < arr.length - 1 && s.rangeRowBorder,
                    ]}
                  >
                    <Text style={s.rangeEmoji}>{m.emoji}</Text>
                    <Text style={s.rangeName}>{m.label}</Text>
                    <Text style={s.rangeVal}>
                      {m.ideal[0]}–{m.ideal[1]}{m.unit ? ` ${m.unit}` : ''}
                    </Text>
                    <View style={[s.rangeBadge, { backgroundColor: color + '22' }]}>
                      <Text style={[s.rangeBadgeTxt, { color }]}>{label}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── ACTION BUTTONS ────────────────────────────────────────────── */}
        {sensors && (
          <View style={s.section}>
            <TouchableOpacity
              style={s.fertBtn}
              onPress={goToFertilizer}
              activeOpacity={0.85}
              accessibilityLabel="Get fertilizer recommendations"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[C.lime, '#7ab84e']}
                style={s.fertBtnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={s.fertBtnTxt}>🌿  Get Fertilizer Recommendations →</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.dashBtn}
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.85}
              accessibilityLabel="View regional dashboard"
              accessibilityRole="button"
            >
              <Text style={s.dashBtnTxt}>🗺️  View Regional Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── EMPTY STATE ───────────────────────────────────────────────── */}
        {!data && !loading && !errInfo && (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>📡</Text>
            <Text style={s.emptyTitle}>Ready to read sensors</Text>
            <Text style={s.emptySub}>
              Tap the green button above to fetch live soil data from ThingSpeak
              (Channel 3187265). Make sure your backend server is running first.
            </Text>
            <View style={s.emptySteps}>
              {[
                'cd backend',
                'npm install',
                'npm run dev',
              ].map((cmd, i) => (
                <View key={i} style={s.emptyStep}>
                  <Text style={s.emptyStepN}>{i + 1}</Text>
                  <Text style={s.emptyStepCmd}>{cmd}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <BottomNav navigation={navigation} active="SoilAnalysis" />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg1 },
  scroll: { paddingBottom: 16 },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    paddingTop: 56, paddingBottom: 32, paddingHorizontal: 22,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: C.pine + 'aa', top: -80, right: -70,
  },
  blob2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: '#0a2a06aa', bottom: -40, left: -30,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.lime + '18', borderWidth: 1, borderColor: C.lime + '35',
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, marginBottom: 14,
  },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  heroBadgeTxt: { fontSize: 10, color: C.lime, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle:    { fontSize: 28, fontWeight: '900', color: C.white, marginBottom: 8, letterSpacing: -0.5 },
  heroSub:      { fontSize: 12, color: C.sage, lineHeight: 20, marginBottom: 20 },

  // Status strip
  statusRow:  {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  statusItem: { flex: 1, alignItems: 'center' },
  statusVal:  { fontSize: 14, fontWeight: '900', color: C.white, marginBottom: 3 },
  statusLbl:  { fontSize: 9, fontWeight: '600', color: C.dim, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusDiv:  { width: 1, height: 28, backgroundColor: C.border },
  onlinePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginBottom: 3,
  },
  onlineDot:  { width: 6, height: 6, borderRadius: 3 },
  onlineTxt:  { fontSize: 12, fontWeight: '700' },

  // ── Fetch button ────────────────────────────────────────────────────────
  fetchWrap:       { padding: 20, paddingBottom: 8 },
  fetchBtn:        { borderRadius: 16, overflow: 'hidden', ...SHADOW.md },
  fetchBtnDisabled:{ opacity: 0.6 },
  fetchBtnGrad:    { paddingVertical: 17, alignItems: 'center' },
  fetchBtnTxt:     { color: C.bg0, fontSize: 16, fontWeight: '800' },
  pullHint:        { textAlign: 'center', fontSize: 10, color: C.dim, marginTop: 6 },

  // ── Error card ──────────────────────────────────────────────────────────
  errorCard:      {
    marginHorizontal: 16, backgroundColor: C.bg3, borderRadius: 20,
    padding: 20, borderWidth: 1.5, borderColor: '#7f1d1d',
    marginBottom: 14, ...SHADOW.md,
  },
  errorHeader:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  errorEmoji:     { fontSize: 28 },
  errorTitle:     { fontSize: 15, fontWeight: '800', color: '#fca5a5', marginBottom: 3 },
  errorReason:    { fontSize: 12, color: '#888', lineHeight: 18 },
  hintBox:        {
    backgroundColor: 'rgba(255,248,225,0.06)', borderRadius: 12, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,224,130,0.25)',
  },
  hintTitle:      { fontSize: 12, fontWeight: '700', color: C.amber, marginBottom: 6 },
  hintTxt: {
    fontSize: 11, color: '#ccc', lineHeight: 19,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  rawBtn:         { alignSelf: 'flex-start', marginBottom: 10 },
  rawBtnTxt:      { fontSize: 11, color: '#64b5f6', fontWeight: '600' },
  checklist:      { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginBottom: 14 },
  checklistTitle: { fontSize: 11, fontWeight: '700', color: C.sage, marginBottom: 10 },
  checkRow:       { flexDirection: 'row', gap: 10, marginBottom: 7, alignItems: 'flex-start' },
  checkN:         { fontSize: 11, fontWeight: '900', color: C.lime, width: 16 },
  checkTxt: {
    flex: 1, fontSize: 11, color: '#aaa', lineHeight: 17,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  retryBtn:  { backgroundColor: C.pine, borderRadius: 12, paddingVertical: 12, alignItems: 'center', ...SHADOW.sm },
  retryTxt:  { color: C.lime, fontSize: 14, fontWeight: '700' },

  // ── Warnings ────────────────────────────────────────────────────────────
  warnCard: {
    marginHorizontal: 16, backgroundColor: 'rgba(255,248,225,0.07)',
    borderRadius: 14, padding: 14, borderWidth: 1,
    borderColor: 'rgba(255,224,130,0.4)', marginBottom: 12,
  },
  warnCardTitle: { fontSize: 13, fontWeight: '700', color: C.amber, marginBottom: 8 },
  warnPill: {
    marginHorizontal: 16, backgroundColor: 'rgba(255,248,225,0.07)',
    borderRadius: 12, padding: 12, borderWidth: 1,
    borderColor: 'rgba(255,224,130,0.3)', marginBottom: 12,
  },
  warnTxt: { fontSize: 12, color: C.amber, lineHeight: 18 },

  // ── Section ─────────────────────────────────────────────────────────────
  section:      { paddingHorizontal: 16, paddingBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.white, marginBottom: 4 },
  sectionSub:   { fontSize: 11, color: C.muted, marginBottom: 12, lineHeight: 16 },

  // ── AI Verdict ──────────────────────────────────────────────────────────
  aiWarnCard:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#7c3aed55' },
  aiWarnEmoji: { fontSize: 24 },
  aiWarnTitle: { fontSize: 13, fontWeight: '800', color: '#c4b5fd', marginBottom: 4 },
  aiWarnTxt:   { fontSize: 11, color: '#888', lineHeight: 17 },
  verdictCard: {
    borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center',
    gap: 14, overflow: 'hidden', marginBottom: 10, ...SHADOW.lg,
  },
  verdictBlob: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40,
  },
  verdictEmoji:    { fontSize: 36, flexShrink: 0 },
  verdictTitle:    { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4, letterSpacing: -0.3 },
  verdictSub:      { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  verdictBadge:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexShrink: 0 },
  verdictBadgeTxt: { fontSize: 11, fontWeight: '800' },
  verdictNote: {
    backgroundColor: C.bg3, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  verdictNoteTxt: { fontSize: 13, color: C.sage, lineHeight: 20 },

  // ── Metric cards ────────────────────────────────────────────────────────
  metricCard: {
    backgroundColor: C.bg3, borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: C.border, ...SHADOW.sm,
  },
  metricTop:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  metricIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  metricEmoji:    { fontSize: 18 },
  metricTextWrap: { flex: 1 },
  metricKey:      { fontSize: 13, fontWeight: '700', color: C.white, marginBottom: 2 },
  metricVal:      { fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  statusTag:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, flexShrink: 0 },
  statusDot:      { width: 5, height: 5, borderRadius: 99 },
  statusTagTxt:   { fontSize: 10, fontWeight: '700' },
  barBg:          { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', position: 'relative' },
  barFill:        { height: 8, borderRadius: 4, position: 'absolute', top: 0, left: 0 },
  idealZone:      { position: 'absolute', top: 0, height: 8, backgroundColor: 'rgba(163,217,119,0.2)' },
  idealText:      { fontSize: 9, color: C.dim, marginTop: 4, textAlign: 'right', fontWeight: '600' },

  // ── Optimal ranges table ─────────────────────────────────────────────────
  rangeCard: {
    backgroundColor: C.bg3, borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border, ...SHADOW.sm,
  },
  rangeRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  rangeRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  rangeEmoji:     { fontSize: 16 },
  rangeName:      { flex: 1, fontSize: 13, fontWeight: '700', color: C.white },
  rangeVal:       { fontSize: 11, color: C.muted, marginRight: 6 },
  rangeBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  rangeBadgeTxt:  { fontSize: 10, fontWeight: '700' },

  // ── Action buttons ───────────────────────────────────────────────────────
  fertBtn:     { borderRadius: 14, overflow: 'hidden', marginBottom: 12, ...SHADOW.md },
  fertBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  fertBtnTxt:  { color: C.bg0, fontSize: 15, fontWeight: '800' },
  dashBtn:     {
    paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
    borderColor: C.border, alignItems: 'center', backgroundColor: C.bg3,
  },
  dashBtnTxt: { color: C.lime, fontSize: 14, fontWeight: '700' },

  // ── Empty state ──────────────────────────────────────────────────────────
  emptyWrap:    { padding: 40, alignItems: 'center' },
  emptyEmoji:   { fontSize: 64, marginBottom: 18, opacity: 0.5 },
  emptyTitle:   { fontSize: 20, fontWeight: '800', color: C.white, marginBottom: 8 },
  emptySub:     { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, maxWidth: 320, marginBottom: 24 },
  emptySteps:   { gap: 8, alignSelf: 'stretch', maxWidth: 260 },
  emptyStep:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emptyStepN:   { width: 22, height: 22, borderRadius: 11, backgroundColor: C.lime + '20', textAlign: 'center', fontSize: 11, fontWeight: '900', color: C.lime, lineHeight: 22, borderWidth: 1, borderColor: C.lime + '40' },
  emptyStepCmd: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12, color: C.sage },
});