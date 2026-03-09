// src/screens/WeatherScreen.js
// ─────────────────────────────────────────────────────────────────────────────
//  Black Pepper AI – Weather Station Screen
//  • Fetches live weather via Node.js backend /api/weather
//  • Shows temperature, humidity, wind, feels-like, conditions
//  • Black pepper farming tips based on current conditions
//  • Pull-to-refresh + auto-refresh every 60 s
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
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { WEATHER_URL } from '../config/api';
import { C, SHADOW } from '../components/theme';
import BottomNav from '../components/BottomNav';

// ─── Constants ────────────────────────────────────────────────────────────────
const AUTO_REFRESH_SECONDS = 60;
const REQUEST_TIMEOUT_MS   = 12000;

// ─── Farming tips based on weather conditions ────────────────────────────────
function getFarmingTips(weather) {
  if (!weather) return [];
  const tips = [];
  const temp = weather.temperature;
  const hum  = weather.humidity;
  const wind = weather.wind;
  const cond = (weather.weather ?? '').toLowerCase();

  if (temp < 20)
    tips.push({ emoji: '🥶', text: 'Temperature is low. Black pepper prefers 20–35°C. Consider protective coverings for young vines.' });
  else if (temp > 35)
    tips.push({ emoji: '🌡️', text: 'High temperature alert. Ensure adequate irrigation and shade for pepper vines.' });
  else
    tips.push({ emoji: '✅', text: `Temperature ${Math.round(temp)}°C is within the optimal range for black pepper growth.` });

  if (hum < 50)
    tips.push({ emoji: '💧', text: 'Low humidity detected. Increase irrigation frequency to prevent moisture stress.' });
  else if (hum > 90)
    tips.push({ emoji: '⚠️', text: 'Very high humidity. Monitor for fungal diseases like Phytophthora and leaf blight.' });
  else
    tips.push({ emoji: '✅', text: `Humidity ${hum}% is suitable. Maintain regular monitoring for disease signs.` });

  if (cond.includes('rain') || cond.includes('drizzle'))
    tips.push({ emoji: '🌧️', text: 'Rainfall expected. Delay fertilizer application — rain washes nutrients away.' });
  else if (cond.includes('clear') || cond.includes('sun'))
    tips.push({ emoji: '☀️', text: 'Clear conditions. Good time to apply foliar fertilizers or conduct field inspections.' });

  if (wind > 10)
    tips.push({ emoji: '💨', text: 'Strong winds. Check vine supports and trellises to prevent stem damage.' });

  return tips;
}

// ─── Weather condition → emoji mapping ───────────────────────────────────────
function conditionEmoji(condition) {
  const c = (condition ?? '').toLowerCase();
  if (c.includes('thunder'))        return '⛈️';
  if (c.includes('drizzle'))        return '🌦️';
  if (c.includes('rain'))           return '🌧️';
  if (c.includes('snow'))           return '❄️';
  if (c.includes('mist') || c.includes('fog')) return '🌫️';
  if (c.includes('cloud'))          return '☁️';
  if (c.includes('clear'))          return '☀️';
  if (c.includes('sun'))            return '🌤️';
  return '🌡️';
}

// ─── Error parser ─────────────────────────────────────────────────────────────
function parseError(e) {
  if (e.response) {
    return `Server error ${e.response.status}: ${e.response.data?.error ?? 'Unknown error'}`;
  }
  if (e.message?.includes('Network') || e.message?.includes('ECONNREFUSED')) {
    return 'Cannot reach backend. Make sure the Node.js server is running on port 5001.';
  }
  if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
    return 'Request timed out. Check your network and server.';
  }
  return e.message ?? 'Unexpected error occurred.';
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ emoji, label, value, color }) {
  return (
    <View style={[t.tile, { borderTopColor: color }]}>
      <Text style={t.tileEmoji}>{emoji}</Text>
      <Text style={[t.tileVal, { color }]}>{value}</Text>
      <Text style={t.tileLbl}>{label}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function WeatherScreen({ navigation }) {
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [weather,    setWeather]    = useState(null);
  const [errMsg,     setErrMsg]     = useState(null);
  const [lastFetch,  setLastFetch]  = useState(null);
  const [countdown,  setCountdown]  = useState(null);

  const isMounted = useRef(true);
  useEffect(() => () => { isMounted.current = false; }, []);

  // ── Auto-refresh countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { fetchWeather(true); return; }
    const t = setTimeout(() => {
      if (isMounted.current) setCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchWeather = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setErrMsg(null);

    try {
      // Fixed coordinates for black pepper farming region (Sri Lanka)
      // Update these in src/config/api.js if your farm is elsewhere
      const lat = 6.9147, lon = 79.9729; // default: Western Province, Sri Lanka

      const res = await axios.get(`${WEATHER_URL}?lat=${lat}&lon=${lon}`, {
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!res.data || typeof res.data !== 'object') {
        throw new Error('Invalid response from weather server.');
      }

      if (isMounted.current) {
        setWeather(res.data);
        setLastFetch(new Date().toLocaleTimeString());
        setCountdown(AUTO_REFRESH_SECONDS);
      }
    } catch (e) {
      if (isMounted.current) {
        setErrMsg(parseError(e));
        setCountdown(null);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Fetch on mount
  useEffect(() => { fetchWeather(false); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWeather(true);
  }, [fetchWeather]);

  const tips = getFarmingTips(weather);

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
        {/* ── HERO ── */}
        <LinearGradient colors={[C.bg0, C.bg2, C.pine]} style={s.hero}>
          <View style={s.blob1} />
          <View style={s.blob2} />

          <View style={s.heroBadge}>
            <View style={s.heroBadgeDot} />
            <Text style={s.heroBadgeTxt}>🌤️ LIVE WEATHER STATION</Text>
          </View>

          <Text style={s.heroTitle}>Weather Monitor</Text>
          <Text style={s.heroSub}>
            Live conditions · Black pepper farming advisories{'\n'}
            Auto-refreshes every {AUTO_REFRESH_SECONDS} seconds
          </Text>

          {/* Status strip */}
          <View style={s.statusRow}>
            <View style={s.statusItem}>
              <Text style={s.statusVal}>{lastFetch ?? '—'}</Text>
              <Text style={s.statusLbl}>Last Read</Text>
            </View>
            <View style={s.statusDiv} />
            <View style={s.statusItem}>
              <View style={[
                s.onlinePill,
                { backgroundColor: errMsg ? C.red + '22' : lastFetch ? C.green + '22' : C.amber + '22' },
              ]}>
                <View style={[
                  s.onlineDot,
                  { backgroundColor: errMsg ? C.red : lastFetch ? C.green : C.amber },
                ]} />
                <Text style={[
                  s.onlineTxt,
                  { color: errMsg ? C.red : lastFetch ? C.lime : C.amber },
                ]}>
                  {errMsg ? 'Offline' : lastFetch ? 'Online' : 'Ready'}
                </Text>
              </View>
              <Text style={s.statusLbl}>Status</Text>
            </View>
            <View style={s.statusDiv} />
            <View style={s.statusItem}>
              <Text style={s.statusVal}>
                {countdown != null ? `${countdown}s` : '—'}
              </Text>
              <Text style={s.statusLbl}>Refresh In</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── REFRESH BUTTON ── */}
        <View style={s.btnWrap}>
          <TouchableOpacity
            style={[s.refreshBtn, loading && s.refreshBtnDisabled]}
            onPress={() => fetchWeather(false)}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Refresh weather"
          >
            <LinearGradient
              colors={[C.lime, '#7ab84e']}
              style={s.refreshBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading
                ? <ActivityIndicator color={C.bg0} />
                : <Text style={s.refreshBtnTxt}>🌤️  Refresh Weather</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
          <Text style={s.pullHint}>or pull down to refresh</Text>
        </View>

        {/* ── ERROR CARD ── */}
        {!!errMsg && (
          <View style={s.errorCard} accessibilityRole="alert">
            <Text style={s.errorEmoji}>🔌</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.errorTitle}>Weather Unavailable</Text>
              <Text style={s.errorReason}>{errMsg}</Text>
            </View>
            <TouchableOpacity
              style={s.retryBtn}
              onPress={() => fetchWeather(false)}
              activeOpacity={0.85}
            >
              <Text style={s.retryTxt}>🔄 Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MAIN WEATHER CARD ── */}
        {weather && (
          <>
            <View style={s.section}>
              <LinearGradient
                colors={[C.pine, C.bg2]}
                style={s.mainCard}
              >
                <View style={s.mainCardBlob} />

                <View style={s.mainTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cityName}>{weather.city ?? 'Current Location'}</Text>
                    <Text style={s.condition}>
                      {conditionEmoji(weather.weather)}  {weather.weather ?? '—'}
                    </Text>
                  </View>
                  <Text style={s.bigTemp}>{Math.round(weather.temperature ?? 0)}°</Text>
                </View>

                <Text style={s.feelsLike}>
                  Feels like {Math.round(weather.feels_like ?? weather.temperature ?? 0)}°C
                </Text>
              </LinearGradient>
            </View>

            {/* ── STAT TILES ── */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>📊 Conditions</Text>
              <View style={s.tileGrid}>
                <StatTile emoji="💧" label="Humidity"    value={`${weather.humidity ?? '—'}%`}          color={C.blue}   />
                <StatTile emoji="💨" label="Wind"        value={`${weather.wind ?? '—'} m/s`}           color={C.teal}   />
                <StatTile emoji="🌡️" label="Temperature" value={`${Math.round(weather.temperature ?? 0)}°C`} color={C.amber}  />
                <StatTile emoji="🤗" label="Feels Like"  value={`${Math.round(weather.feels_like ?? weather.temperature ?? 0)}°C`} color={C.sage} />
              </View>
            </View>

            {/* ── FARMING TIPS ── */}
            {tips.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>🌿 Farming Advisories</Text>
                <Text style={s.sectionSub}>
                  AI-generated tips based on current weather conditions
                </Text>
                {tips.map((tip, i) => (
                  <View key={i} style={s.tipCard}>
                    <Text style={s.tipEmoji}>{tip.emoji}</Text>
                    <Text style={s.tipTxt}>{tip.text}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ── QUICK NAV ── */}
            <View style={s.section}>
              <TouchableOpacity
                style={s.soilBtn}
                onPress={() => navigation.navigate('SoilAnalysis')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[C.lime, '#7ab84e']}
                  style={s.soilBtnGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={s.soilBtnTxt}>🌱  Check Soil Conditions →</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.dashBtn}
                onPress={() => navigation.navigate('Dashboard')}
                activeOpacity={0.85}
              >
                <Text style={s.dashBtnTxt}>🗺️  View Farm Dashboard</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── EMPTY STATE ── */}
        {!weather && !loading && !errMsg && (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🌤️</Text>
            <Text style={s.emptyTitle}>Fetching weather…</Text>
            <Text style={s.emptySub}>
              Tap the button above to load live weather data for your location.
            </Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <BottomNav navigation={navigation} active="Weather" />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg1 },
  scroll: { paddingBottom: 16 },

  // Hero
  hero: { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 22, overflow: 'hidden' },
  blob1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: C.pine + 'aa', top: -80, right: -70 },
  blob2: { position: 'absolute', width: 140, height: 140, borderRadius: 70,  backgroundColor: '#0a2a06aa', bottom: -40, left: -30 },
  heroBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.lime + '18', borderWidth: 1, borderColor: C.lime + '35', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 14 },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  heroBadgeTxt: { fontSize: 10, color: C.lime, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle:    { fontSize: 28, fontWeight: '900', color: C.white, marginBottom: 8, letterSpacing: -0.5 },
  heroSub:      { fontSize: 12, color: C.sage, lineHeight: 20, marginBottom: 20 },

  // Status strip
  statusRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingVertical: 12, paddingHorizontal: 16 },
  statusItem: { flex: 1, alignItems: 'center' },
  statusVal:  { fontSize: 14, fontWeight: '900', color: C.white, marginBottom: 3 },
  statusLbl:  { fontSize: 9, fontWeight: '600', color: C.dim, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusDiv:  { width: 1, height: 28, backgroundColor: C.border },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginBottom: 3 },
  onlineDot:  { width: 6, height: 6, borderRadius: 3 },
  onlineTxt:  { fontSize: 12, fontWeight: '700' },

  // Button
  btnWrap:           { padding: 20, paddingBottom: 8 },
  refreshBtn:        { borderRadius: 16, overflow: 'hidden', ...SHADOW.md },
  refreshBtnDisabled:{ opacity: 0.6 },
  refreshBtnGrad:    { paddingVertical: 17, alignItems: 'center' },
  refreshBtnTxt:     { color: C.bg0, fontSize: 16, fontWeight: '800' },
  pullHint:          { textAlign: 'center', fontSize: 10, color: C.dim, marginTop: 6 },

  // Warnings
  warnPill: { marginHorizontal: 16, backgroundColor: 'rgba(255,248,225,0.07)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,224,130,0.3)', marginBottom: 12 },
  warnTxt:  { fontSize: 12, color: C.amber, lineHeight: 18 },

  // Error
  errorCard:   { marginHorizontal: 16, backgroundColor: C.bg3, borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#7f1d1d', marginBottom: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, ...SHADOW.md },
  errorEmoji:  { fontSize: 28 },
  errorTitle:  { fontSize: 15, fontWeight: '800', color: '#fca5a5', marginBottom: 4 },
  errorReason: { fontSize: 12, color: '#888', lineHeight: 18, marginBottom: 10 },
  retryBtn:    { backgroundColor: C.pine, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: 4 },
  retryTxt:    { color: C.lime, fontSize: 13, fontWeight: '700' },

  // Section
  section:      { paddingHorizontal: 16, paddingBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.white, marginBottom: 4 },
  sectionSub:   { fontSize: 11, color: C.muted, marginBottom: 12, lineHeight: 16 },

  // Main weather card
  mainCard:     { borderRadius: 24, padding: 24, overflow: 'hidden', marginBottom: 4, ...SHADOW.lg },
  mainCardBlob: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -40 },
  mainTop:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cityName:     { fontSize: 22, fontWeight: '900', color: C.white, marginBottom: 6 },
  condition:    { fontSize: 14, color: C.lime, textTransform: 'capitalize' },
  bigTemp:      { fontSize: 72, fontWeight: '900', color: C.white, lineHeight: 76 },
  feelsLike:    { fontSize: 13, color: 'rgba(255,255,255,0.6)' },

  // Stat tiles
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});

const t = StyleSheet.create({
  tile:      { flex: 1, minWidth: '45%', backgroundColor: C.bg3, borderRadius: 16, padding: 16, borderTopWidth: 3, alignItems: 'center', borderWidth: 1, borderColor: C.border, ...SHADOW.sm },
  tileEmoji: { fontSize: 22, marginBottom: 6 },
  tileVal:   { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  tileLbl:   { fontSize: 10, color: C.dim, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});

// Farming tips (reuse s styles below)
Object.assign(s, {
  tipCard: { backgroundColor: C.bg3, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: C.border, ...SHADOW.sm },
  tipEmoji:{ fontSize: 20, flexShrink: 0, marginTop: 1 },
  tipTxt:  { flex: 1, fontSize: 13, color: C.sage, lineHeight: 20 },
  soilBtn:     { borderRadius: 14, overflow: 'hidden', marginBottom: 12, ...SHADOW.md },
  soilBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  soilBtnTxt:  { color: C.bg0, fontSize: 15, fontWeight: '800' },
  dashBtn:     { paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', backgroundColor: C.bg3 },
  dashBtnTxt:  { color: C.lime, fontSize: 14, fontWeight: '700' },
  emptyWrap:   { padding: 60, alignItems: 'center' },
  emptyEmoji:  { fontSize: 64, marginBottom: 18, opacity: 0.5 },
  emptyTitle:  { fontSize: 20, fontWeight: '800', color: C.white, marginBottom: 8 },
  emptySub:    { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, maxWidth: 300 },
});