// src/screens/WeatherScreen.js  — Light Theme
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { WEATHER_URL } from '../config/api';
import { C, SHADOW } from '../components/theme';
import BottomNav from '../components/BottomNav';

const AUTO_REFRESH = 60;
const TIMEOUT_MS   = 12000;

function getFarmingTips(w) {
  if (!w) return [];
  const tips = [];
  const t = w.temperature, h = w.humidity, wind = w.wind;
  const cond = (w.weather ?? '').toLowerCase();

  if (t < 20)       tips.push({ icon:'thermometer-outline',  color:'#0277BD', text:`Temperature ${Math.round(t)}°C is low. Pepper prefers 20–35°C. Consider vine protection.` });
  else if (t > 35)  tips.push({ icon:'sunny-outline',        color:'#E65100', text:`High temperature ${Math.round(t)}°C. Ensure adequate irrigation and shade for vines.` });
  else              tips.push({ icon:'checkmark-circle-outline', color:C.success, text:`Temperature ${Math.round(t)}°C is ideal for black pepper growth.` });

  if (h < 50)       tips.push({ icon:'water-outline',        color:C.warning, text:`Low humidity (${h}%). Increase irrigation to prevent moisture stress.` });
  else if (h > 90)  tips.push({ icon:'warning-outline',      color:C.error,   text:`Very high humidity (${h}%). Monitor for Phytophthora and leaf blight.` });
  else              tips.push({ icon:'leaf-outline',          color:C.success, text:`Humidity ${h}% is suitable. Continue regular disease monitoring.` });

  if (cond.includes('rain') || cond.includes('drizzle'))
    tips.push({ icon:'rainy-outline',  color:C.info,    text:'Rainfall expected. Delay fertilizer application — rain washes nutrients away.' });
  else if (cond.includes('clear') || cond.includes('sun'))
    tips.push({ icon:'sunny-outline',  color:C.warning, text:'Clear conditions. Good time to apply foliar fertilizers or inspect fields.' });

  if (wind > 10)
    tips.push({ icon:'arrow-forward-circle-outline', color:'#455A64', text:'Strong winds. Check vine supports and trellises to prevent stem damage.' });

  return tips;
}

function condEmoji(c) {
  const s = (c ?? '').toLowerCase();
  if (s.includes('thunder')) return '⛈️';
  if (s.includes('drizzle')) return '🌦️';
  if (s.includes('rain'))    return '🌧️';
  if (s.includes('snow'))    return '❄️';
  if (s.includes('mist') || s.includes('fog')) return '🌫️';
  if (s.includes('cloud'))   return '☁️';
  if (s.includes('clear'))   return '☀️';
  return '🌡️';
}

function Tile({ emoji, label, value, color }) {
  return (
    <View style={[t.tile, { borderTopColor:color }]}>
      <Text style={t.emoji}>{emoji}</Text>
      <Text style={[t.val, { color }]}>{value}</Text>
      <Text style={t.lbl}>{label}</Text>
    </View>
  );
}

export default function WeatherScreen({ navigation }) {
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [weather,    setWeather]    = useState(null);
  const [errMsg,     setErrMsg]     = useState(null);
  const [lastFetch,  setLastFetch]  = useState(null);
  const [countdown,  setCountdown]  = useState(null);
  const isMounted = useRef(true);
  useEffect(() => () => { isMounted.current = false; }, []);

  const fetchWeather = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setErrMsg(null);
    try {
      const res = await axios.get(`${WEATHER_URL}?lat=6.9147&lon=79.9729`, { timeout: TIMEOUT_MS });
      if (!res.data || typeof res.data !== 'object') throw new Error('Invalid weather response.');
      if (isMounted.current) {
        setWeather(res.data);
        setLastFetch(new Date().toLocaleTimeString());
        setCountdown(AUTO_REFRESH);
      }
    } catch (e) {
      if (isMounted.current) {
        const msg = e.response
          ? `Server error ${e.response.status}`
          : e.message?.match(/Network|ECONNREFUSED/i)
            ? 'Cannot reach backend. Make sure it is running on port 5001.'
            : e.code === 'ECONNABORTED' ? 'Request timed out.'
            : e.message ?? 'Unexpected error.';
        setErrMsg(msg);
        setCountdown(null);
      }
    } finally {
      if (isMounted.current) { setLoading(false); setRefreshing(false); }
    }
  }, []);

  useEffect(() => { fetchWeather(false); }, [fetchWeather]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { fetchWeather(true); return; }
    const t = setTimeout(() => { if (isMounted.current) setCountdown(c => c - 1); }, 1000);
    return () => clearTimeout(t);
  }, [countdown, fetchWeather]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchWeather(true); }, [fetchWeather]);
  const tips = getFarmingTips(weather);

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor={C.primary} colors={[C.primary]} />}>

        {/* HERO */}
        <LinearGradient colors={[C.gradStart, C.gradMid, C.gradEnd]} style={s.hero}>
          <View style={s.heroBadge}>
            <View style={s.heroDot} />
            <Text style={s.heroBadgeTxt}>🌤️ LIVE WEATHER STATION</Text>
          </View>
          <Text style={s.heroTitle}>Weather Monitor</Text>
          <Text style={s.heroSub}>Live conditions · Farming advisories · Auto-refreshes every {AUTO_REFRESH}s</Text>

          <View style={s.statusRow}>
            {[
              { val:lastFetch ?? '—',                                              lbl:'Last Read'  },
              { val:errMsg ? 'Offline' : lastFetch ? 'Online' : 'Ready',           lbl:'Status',    dot:true, dotColor: errMsg ? C.red : lastFetch ? '#69F0AE' : C.amber },
              { val:countdown != null ? `${countdown}s` : '—',                    lbl:'Refresh In' },
            ].map((item, i) => (
              <React.Fragment key={item.lbl}>
                {i > 0 && <View style={s.statusDiv} />}
                <View style={s.statusItem}>
                  {item.dot
                    ? <View style={s.dotRow}><View style={[s.dot,{backgroundColor:item.dotColor}]}/><Text style={s.statusVal}>{item.val}</Text></View>
                    : <Text style={s.statusVal}>{item.val}</Text>}
                  <Text style={s.statusLbl}>{item.lbl}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </LinearGradient>

        {/* REFRESH BUTTON */}
        <View style={s.btnWrap}>
          <TouchableOpacity style={[s.refreshBtn, loading && {opacity:0.6}]}
            onPress={() => fetchWeather(false)} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={s.refreshBtnTxt}>🌤️  Refresh Weather</Text>}
          </TouchableOpacity>
          <Text style={s.pullHint}>or pull down to refresh</Text>
        </View>

        {/* ERROR */}
        {!!errMsg && (
          <View style={s.errorCard}>
            <Ionicons name="cloud-offline-outline" size={28} color={C.error} />
            <View style={{flex:1}}>
              <Text style={s.errorTitle}>Weather Unavailable</Text>
              <Text style={s.errorSub}>{errMsg}</Text>
            </View>
            <TouchableOpacity style={s.retryBtn} onPress={() => fetchWeather(false)}>
              <Text style={s.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MAIN WEATHER CARD */}
        {weather && (
          <>
            <View style={s.section}>
              <View style={s.mainCard}>
                <View style={s.mainTop}>
                  <View style={{flex:1}}>
                    <Text style={s.city}>{weather.city ?? 'Current Location'}</Text>
                    <Text style={s.condition}>{condEmoji(weather.weather)}  {weather.weather ?? '—'}</Text>
                  </View>
                  <Text style={s.bigTemp}>{Math.round(weather.temperature ?? 0)}°</Text>
                </View>
                <Text style={s.feelsLike}>Feels like {Math.round(weather.feels_like ?? weather.temperature ?? 0)}°C</Text>
              </View>
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>📊 Conditions</Text>
              <View style={s.tileGrid}>
                <Tile emoji="💧" label="Humidity"    value={`${weather.humidity ?? '—'}%`}                                          color={C.blue}    />
                <Tile emoji="💨" label="Wind"        value={`${weather.wind ?? '—'} m/s`}                                            color={C.teal}    />
                <Tile emoji="🌡️" label="Temperature" value={`${Math.round(weather.temperature ?? 0)}°C`}                             color={C.warning} />
                <Tile emoji="🤗" label="Feels Like"  value={`${Math.round(weather.feels_like ?? weather.temperature ?? 0)}°C`}        color={C.rose}    />
              </View>
            </View>

            {tips.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>🌿 Farming Advisories</Text>
                {tips.map((tip, i) => (
                  <View key={i} style={s.tipCard}>
                    <View style={[s.tipIconWrap, {backgroundColor:tip.color+'15'}]}>
                      <Ionicons name={tip.icon} size={20} color={tip.color} />
                    </View>
                    <Text style={s.tipTxt}>{tip.text}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={s.section}>
              <TouchableOpacity style={s.navBtn} onPress={() => navigation.navigate('SoilAnalysis')} activeOpacity={0.85}>
                <Ionicons name="leaf-outline" size={18} color={C.primary} />
                <Text style={s.navBtnTxt}>Check Soil Conditions →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.navBtn, {marginTop:10, backgroundColor:C.xlight}]}
                onPress={() => navigation.navigate('Dashboard')} activeOpacity={0.85}>
                <Ionicons name="map-outline" size={18} color={C.primary} />
                <Text style={s.navBtnTxt}>View Farm Dashboard →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {!weather && !loading && !errMsg && (
          <View style={s.empty}>
            <Text style={{fontSize:56,marginBottom:16,opacity:0.4}}>🌤️</Text>
            <Text style={s.emptyTitle}>Weather data loading…</Text>
            <Text style={s.emptySub}>Tap Refresh to load live weather data.</Text>
          </View>
        )}

        <View style={{height:30}} />
      </ScrollView>
      <BottomNav navigation={navigation} active="Weather" />
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex:1, backgroundColor:C.bg },
  scroll: { paddingBottom:16 },

  hero:        { paddingTop:52, paddingBottom:24, paddingHorizontal:20 },
  heroBadge:   { flexDirection:'row', alignItems:'center', gap:6, marginBottom:12 },
  heroDot:     { width:7, height:7, borderRadius:4, backgroundColor:'rgba(255,255,255,0.8)' },
  heroBadgeTxt:{ fontSize:10, color:'rgba(255,255,255,0.85)', fontWeight:'700', letterSpacing:1.8 },
  heroTitle:   { fontSize:26, fontWeight:'900', color:C.white, marginBottom:6 },
  heroSub:     { fontSize:12, color:'rgba(255,255,255,0.82)', lineHeight:18, marginBottom:16 },

  statusRow:  { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.18)', borderRadius:14, padding:12 },
  statusItem: { flex:1, alignItems:'center' },
  statusVal:  { fontSize:13, fontWeight:'800', color:C.white, marginBottom:2 },
  statusLbl:  { fontSize:9, color:'rgba(255,255,255,0.7)', fontWeight:'600', letterSpacing:0.5 },
  statusDiv:  { width:1, backgroundColor:'rgba(255,255,255,0.3)', marginVertical:4 },
  dotRow:     { flexDirection:'row', alignItems:'center', gap:5, marginBottom:2 },
  dot:        { width:7, height:7, borderRadius:4 },

  btnWrap:      { padding:16, paddingBottom:8 },
  refreshBtn:   { backgroundColor:C.primary, borderRadius:14, paddingVertical:15, alignItems:'center', ...SHADOW.md },
  refreshBtnTxt:{ color:C.white, fontSize:15, fontWeight:'800' },
  pullHint:     { textAlign:'center', fontSize:10, color:C.hint, marginTop:6 },

  errorCard:  { marginHorizontal:16, backgroundColor:C.white, borderRadius:16, padding:16, borderWidth:1.5, borderColor:C.error+'44', marginBottom:14, flexDirection:'row', alignItems:'center', gap:12, ...SHADOW.sm },
  errorTitle: { fontSize:14, fontWeight:'800', color:C.error, marginBottom:3 },
  errorSub:   { fontSize:12, color:C.text3, lineHeight:17 },
  retryBtn:   { backgroundColor:C.error, borderRadius:10, paddingVertical:8, paddingHorizontal:14 },
  retryTxt:   { color:C.white, fontSize:12, fontWeight:'700' },

  section:      { paddingHorizontal:16, paddingBottom:10 },
  sectionTitle: { fontSize:17, fontWeight:'800', color:C.text, marginBottom:12 },

  mainCard:  { backgroundColor:C.white, borderRadius:20, padding:20, borderWidth:1, borderColor:C.border, ...SHADOW.md },
  mainTop:   { flexDirection:'row', alignItems:'flex-start', marginBottom:6 },
  city:      { fontSize:20, fontWeight:'900', color:C.text, marginBottom:4 },
  condition: { fontSize:14, color:C.text3, textTransform:'capitalize' },
  bigTemp:   { fontSize:64, fontWeight:'900', color:C.primary, lineHeight:68 },
  feelsLike: { fontSize:12, color:C.text3 },

  tileGrid: { flexDirection:'row', flexWrap:'wrap', gap:10 },

  tipCard:     { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:C.white, borderRadius:14, padding:14, marginBottom:10, borderWidth:1, borderColor:C.border, ...SHADOW.xs },
  tipIconWrap: { width:40, height:40, borderRadius:12, justifyContent:'center', alignItems:'center', flexShrink:0 },
  tipTxt:      { flex:1, fontSize:13, color:C.text2, lineHeight:19 },

  navBtn:    { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:C.surface2, borderRadius:14, padding:16, borderWidth:1, borderColor:C.border },
  navBtnTxt: { flex:1, fontSize:14, fontWeight:'700', color:C.primary },

  empty:      { padding:60, alignItems:'center' },
  emptyTitle: { fontSize:18, fontWeight:'700', color:C.text2, marginBottom:6 },
  emptySub:   { fontSize:13, color:C.text3, textAlign:'center' },
});

const t = StyleSheet.create({
  tile:  { flex:1, minWidth:'45%', backgroundColor:C.white, borderRadius:14, padding:14, borderTopWidth:3, alignItems:'center', borderWidth:1, borderColor:C.border, ...SHADOW.sm },
  emoji: { fontSize:22, marginBottom:6 },
  val:   { fontSize:20, fontWeight:'900', marginBottom:2 },
  lbl:   { fontSize:10, color:C.text3, fontWeight:'600', textTransform:'uppercase', letterSpacing:0.5 },
});