// src/screens/FertilizerScreen.js — Premium v4
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { FERTILIZER_URL } from '../config/api';
import { C, SHADOW, T } from '../components/theme';

const FERTS = [
  { name:'Urea (46-0-0)',         n:46,  p:0,   k:0,   note:'Fast N source. Apply cautiously — avoid over-application.' },
  { name:'DAP (18-46-0)',         n:18,  p:46,  k:0,   note:'Excellent P source. Good for establishment.' },
  { name:'MOP (0-0-60)',          n:0,   p:0,   k:60,  note:'Potassium boost. Best when K is very low.' },
  { name:'NPK 15-15-15',          n:15,  p:15,  k:15,  note:'Balanced fertilizer for general maintenance.' },
  { name:'NPK 10-26-26',          n:10,  p:26,  k:26,  note:'Low N, high P/K — ideal pre-flowering.' },
  { name:'Organic Compost',       n:2,   p:1,   k:2,   note:'Improves soil structure and microbial activity.' },
  { name:'Lime (pH correction)',  n:0,   p:0,   k:0,   note:'Raises soil pH. Use only when pH < 5.5.' },
];

function localScore(n, p, k, ph) {
  return FERTS.map(f => {
    let score = 0;
    if (n < 50 && f.n > 10) score += 30;
    if (p < 20 && f.p > 20) score += 25;
    if (k < 80 && f.k > 20) score += 25;
    if (ph < 5.5 && f.name.includes('Lime')) score += 40;
    if (ph > 7.0 && f.name.includes('Lime')) score -= 30;
    score += Math.min(20, (f.n + f.p + f.k) / 5);
    return { ...f, score: Math.max(0, Math.min(100, Math.round(score))) };
  }).sort((a, b) => b.score - a.score);
}

function Chip({ color, label }) {
  return (
    <View style={[chip.wrap, {backgroundColor: color+'18', borderColor: color+'30'}]}>
      <Text style={[chip.txt, {color}]}>{label}</Text>
    </View>
  );
}
const chip = StyleSheet.create({
  wrap:{ borderRadius:8, paddingHorizontal:8, paddingVertical:3, borderWidth:1, marginRight:6, marginTop:4 },
  txt: { fontSize:10, fontWeight:'700' },
});

export default function FertilizerScreen({ navigation }) {
  const route = useRoute();
  const params = route.params ?? {};

  const [n,      setN]      = useState(String(params.n ?? ''));
  const [p,      setP]      = useState(String(params.p ?? ''));
  const [k,      setK]      = useState(String(params.k ?? ''));
  const [ph,     setPh]     = useState(String(params.ph ?? ''));
  const [results,setResults]= useState([]);
  const [loading,setLoading]= useState(false);
  const [error,  setError]  = useState('');
  const [expanded,setExpanded]=useState(null);

  const analyse = useCallback(async () => {
    const nv=parseFloat(n), pv=parseFloat(p), kv=parseFloat(k), phv=parseFloat(ph);
    if ([nv,pv,kv,phv].some(isNaN)) { setError('Please enter valid numbers for all four fields.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await axios.post(FERTILIZER_URL, {n:nv,p:pv,k:kv,ph:phv}, {timeout:10000});
      setResults(res.data.recommendations ?? localScore(nv,pv,kv,phv));
    } catch {
      setResults(localScore(nv,pv,kv,phv));
    } finally { setLoading(false); }
  }, [n,p,k,ph]);

  useEffect(() => { if (params.n) analyse(); }, []);

  const fields = [
    { label:'Nitrogen (N)',   val:n,  set:setN,  unit:'mg/kg', icon:'leaf-outline',        color:C.lime   },
    { label:'Phosphorus (P)', val:p,  set:setP,  unit:'mg/kg', icon:'flask-outline',       color:C.rose   },
    { label:'Potassium (K)',  val:k,  set:setK,  unit:'mg/kg', icon:'nutrition-outline',   color:C.brown  },
    { label:'pH Level',       val:ph, set:setPh, unit:'',      icon:'analytics-outline',   color:C.purple },
  ];

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView style={s.root} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <LinearGradient colors={['#020A01','#0D1A08','#1A1304']} style={s.hero}>
          <View style={[s.heroIconBox, {backgroundColor:'rgba(212,168,67,0.12)', borderColor:'rgba(212,168,67,0.2)'}]}>
            <Ionicons name="flask" size={34} color={C.gold} />
          </View>
          <Text style={s.heroTitle}>Fertilizer Advisor</Text>
          <Text style={s.heroSub}>Enter your soil values to get AI-ranked fertilizer recommendations for black pepper.</Text>
        </LinearGradient>

        <View style={s.body}>
          {/* Input grid */}
          <Text style={s.secCap}>SOIL PARAMETERS</Text>
          <View style={s.inputGrid}>
            {fields.map(f => (
              <View key={f.label} style={s.inputCard}>
                <View style={[s.inputIcon, {backgroundColor: f.color+'18'}]}>
                  <Ionicons name={f.icon} size={16} color={f.color} />
                </View>
                <Text style={s.inputLabel}>{f.label}</Text>
                <TextInput
                  style={s.inputField}
                  value={f.val}
                  onChangeText={v => { f.set(v); setError(''); }}
                  placeholder="0.0"
                  placeholderTextColor={C.dim}
                  keyboardType="numeric"
                />
                {!!f.unit && <Text style={s.inputUnit}>{f.unit}</Text>}
              </View>
            ))}
          </View>

          {!!error && (
            <View style={s.errorRow}>
              <Ionicons name="alert-circle" size={14} color={C.error} style={{marginRight:6}} />
              <Text style={s.errorTxt}>{error}</Text>
            </View>
          )}

          <TouchableOpacity style={[s.analyseBtn, loading&&{opacity:0.6}]} onPress={analyse} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={[C.gold,'#8B5E10']} style={s.analyseGrad}>
              {loading
                ? <><ActivityIndicator size="small" color="#fff" style={{marginRight:8}} /><Text style={s.analyseTxt}>Analysing…</Text></>
                : <><Ionicons name="analytics-outline" size={17} color="#fff" style={{marginRight:8}} /><Text style={s.analyseTxt}>Get Recommendations</Text></>
              }
            </LinearGradient>
          </TouchableOpacity>

          {/* Results */}
          {results.length > 0 && (
            <View style={{marginTop:24}}>
              <Text style={s.secCap}>RANKED RECOMMENDATIONS</Text>
              {results.map((r,i) => (
                <TouchableOpacity key={r.name} style={s.fertCard} onPress={() => setExpanded(expanded===i?null:i)} activeOpacity={0.8}>
                  <View style={s.fertTop}>
                    <View style={[s.rankBadge, {backgroundColor: i===0?C.gold:i===1?C.text3:C.brown, opacity: i===0?1:i===1?0.7:0.5}]}>
                      <Text style={s.rankTxt}>#{i+1}</Text>
                    </View>
                    <View style={{flex:1, marginLeft:12}}>
                      <Text style={s.fertName}>{r.name}</Text>
                      <View style={s.fertNPKRow}>
                        <Chip color={C.lime}  label={`N ${r.n}`} />
                        <Chip color={C.rose}  label={`P ${r.p}`} />
                        <Chip color={C.brown} label={`K ${r.k}`} />
                      </View>
                    </View>
                    <View style={s.scoreCircle}>
                      <Text style={[s.scoreNum, {color: r.score>=70?C.success:r.score>=40?C.warning:C.error}]}>{r.score}</Text>
                      <Text style={s.scoreLbl}>score</Text>
                    </View>
                    <Ionicons name={expanded===i?'chevron-up':'chevron-down'} size={16} color={C.dim} style={{marginLeft:8}} />
                  </View>

                  {/* Score bar */}
                  <View style={s.scoreBar}>
                    <View style={[s.scoreBarFill, {width:`${r.score}%`, backgroundColor: r.score>=70?C.success:r.score>=40?C.warning:C.error}]} />
                  </View>

                  {expanded === i && (
                    <View style={s.fertExpanded}>
                      <Text style={s.fertNote}>{r.note}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{height:32}} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex:1, backgroundColor:C.bg },
  hero: { paddingTop: Platform.OS==='ios'?58:44, paddingHorizontal:22, paddingBottom:26 },
  heroIconBox:{ width:72, height:72, borderRadius:22, justifyContent:'center', alignItems:'center', marginBottom:16, borderWidth:1 },
  heroTitle:  { fontSize:28, fontWeight:'900', color:C.text, letterSpacing:-0.6, marginBottom:10 },
  heroSub:    { fontSize:13, color:C.text3, lineHeight:21 },

  body: { padding:22 },
  secCap: { ...T.cap, marginBottom:14 },

  inputGrid: { flexDirection:'row', flexWrap:'wrap', gap:12, marginBottom:16 },
  inputCard: { width:'47%', backgroundColor:C.bg2, borderRadius:16, padding:14, borderWidth:1, borderColor:C.border, ...SHADOW.sm },
  inputIcon: { width:34, height:34, borderRadius:10, justifyContent:'center', alignItems:'center', marginBottom:8 },
  inputLabel:{ fontSize:10, color:C.text3, fontWeight:'700', letterSpacing:0.5, marginBottom:6 },
  inputField:{ fontSize:22, fontWeight:'900', color:C.text, paddingVertical:0 },
  inputUnit: { fontSize:10, color:C.dim, marginTop:4 },

  errorRow:  { flexDirection:'row', alignItems:'center', backgroundColor:'rgba(239,83,80,0.10)', borderRadius:10, padding:10, marginBottom:12, borderWidth:1, borderColor:'rgba(239,83,80,0.2)' },
  errorTxt:  { fontSize:12, color:C.error, flex:1 },

  analyseBtn:  { borderRadius:14, overflow:'hidden', ...SHADOW.gold },
  analyseGrad: { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:17 },
  analyseTxt:  { fontSize:16, fontWeight:'800', color:'#fff' },

  fertCard:   { backgroundColor:C.bg2, borderRadius:18, padding:16, marginBottom:10, borderWidth:1, borderColor:C.border, ...SHADOW.sm },
  fertTop:    { flexDirection:'row', alignItems:'center' },
  rankBadge:  { width:32, height:32, borderRadius:10, justifyContent:'center', alignItems:'center' },
  rankTxt:    { fontSize:12, fontWeight:'900', color:'#fff' },
  fertName:   { fontSize:14, fontWeight:'800', color:C.text, marginBottom:4 },
  fertNPKRow: { flexDirection:'row', flexWrap:'wrap' },
  scoreCircle:{ alignItems:'center' },
  scoreNum:   { fontSize:20, fontWeight:'900' },
  scoreLbl:   { fontSize:9, color:C.text3, fontWeight:'600' },

  scoreBar:     { height:5, backgroundColor:C.bg3, borderRadius:3, overflow:'hidden', marginTop:12 },
  scoreBarFill: { height:5, borderRadius:3 },
  fertExpanded: { marginTop:12, paddingTop:12, borderTopWidth:1, borderTopColor:C.border },
  fertNote:     { fontSize:13, color:C.text3, lineHeight:20 },
});