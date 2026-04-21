// src/screens/DiseaseIdentificationScreen.js — Premium v4
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C, SHADOW, T } from '../components/theme';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

const DISEASES = [
  { name:'Healthy',       icon:'checkmark-circle-outline', color:C.success, desc:'No visible disease markers. Continue routine care.' },
  { name:'Leaf Blight',   icon:'warning-outline',          color:C.warning, desc:'Fungal infection causing brown spots and yellowing.' },
  { name:'Slow Wilt',     icon:'alert-circle-outline',     color:C.error,   desc:'Bacterial disease causing gradual wilting of vines.' },
];

export default function DiseaseIdentificationScreen({ navigation }) {
  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#020A01','#0D1A08','#200606']} style={s.hero}>
          <View style={s.glow} />
          <View style={s.heroIconBox}>
            <Ionicons name="bug" size={36} color={C.error} />
          </View>
          <Text style={s.heroTitle}>Disease Detection</Text>
          <Text style={s.heroSub}>EfficientNetB0 identifies leaf conditions with high accuracy. Upload a clear leaf photo to begin.</Text>

          <View style={s.btnRow}>
            <TouchableOpacity style={s.scanBtn} onPress={() => navigation.navigate('DiseaseUpload')} activeOpacity={0.85}>
              <LinearGradient colors={['#B71C1C','#EF5350']} style={s.scanGrad}>
                <Ionicons name="camera-outline" size={18} color="#fff" style={{marginRight:8}} />
                <Text style={s.scanTxt}>Scan Leaf</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={s.histBtn} onPress={() => navigation.navigate('DiseaseHistory')} activeOpacity={0.8}>
              <Ionicons name="time-outline" size={16} color={C.text2} style={{marginRight:6}} />
              <Text style={s.histTxt}>History</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={s.section}>
          <Text style={s.secCap}>DETECTABLE CONDITIONS</Text>
          {DISEASES.map(d => (
            <View key={d.name} style={s.diseaseCard}>
              <View style={[s.diseaseIcon, {backgroundColor: d.color+'18'}]}>
                <Ionicons name={d.icon} size={22} color={d.color} />
              </View>
              <View style={{flex:1}}>
                <Text style={[s.diseaseName, {color:d.color}]}>{d.name}</Text>
                <Text style={s.diseaseDesc}>{d.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.secCap}>TIPS FOR BEST RESULTS</Text>
          {['Take photo in good natural light','Focus on affected leaf area','Avoid blurry or dark images','Use a single leaf per scan'].map(t => (
            <View key={t} style={s.tipRow}>
              <View style={s.tipDot} />
              <Text style={s.tipTxt}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={{height:20}} />
      </ScrollView>
      <BottomNav navigation={navigation} active="DiseaseIdentification" />
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex:1, backgroundColor:C.bg },
  hero:  { paddingTop: Platform.OS==='ios'?58:44, paddingHorizontal:22, paddingBottom:30, overflow:'hidden' },
  glow:  { position:'absolute', width:260, height:260, borderRadius:130, backgroundColor:'rgba(239,83,80,0.08)', top:-80, right:-70 },
  heroIconBox:{ width:72, height:72, borderRadius:22, backgroundColor:'rgba(239,83,80,0.12)', justifyContent:'center', alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'rgba(239,83,80,0.2)' },
  heroTitle:{ fontSize:28, fontWeight:'900', color:C.text, letterSpacing:-0.6, marginBottom:10 },
  heroSub:  { fontSize:13, color:C.text3, lineHeight:21, marginBottom:24 },
  btnRow:   { flexDirection:'row', gap:12 },
  scanBtn:  { flex:2, borderRadius:14, overflow:'hidden', ...SHADOW.md },
  scanGrad: { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:16 },
  scanTxt:  { fontSize:15, fontWeight:'800', color:'#fff' },
  histBtn:  { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:C.bg2, borderRadius:14, borderWidth:1, borderColor:C.border },
  histTxt:  { fontSize:14, fontWeight:'700', color:C.text2 },

  section:     { paddingHorizontal:22, paddingTop:24, paddingBottom:4 },
  secCap:      { ...T.cap, marginBottom:14 },
  diseaseCard: { flexDirection:'row', alignItems:'flex-start', gap:14, backgroundColor:C.bg2, borderRadius:16, padding:16, marginBottom:10, borderWidth:1, borderColor:C.border, ...SHADOW.sm },
  diseaseIcon: { width:44, height:44, borderRadius:13, justifyContent:'center', alignItems:'center', flexShrink:0 },
  diseaseName: { fontSize:15, fontWeight:'800', marginBottom:4 },
  diseaseDesc: { fontSize:12, color:C.text3, lineHeight:18 },
  tipRow:  { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:9, borderBottomWidth:1, borderBottomColor:C.border },
  tipDot:  { width:6, height:6, borderRadius:3, backgroundColor:C.lime, flexShrink:0 },
  tipTxt:  { fontSize:13, color:C.text2 },
});