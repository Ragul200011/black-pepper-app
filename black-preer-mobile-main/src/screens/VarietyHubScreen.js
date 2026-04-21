// src/screens/VarietyHubScreen.js — Premium v4
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C, SHADOW, T } from '../components/theme';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

const VARIETIES = [
  {
    name:'Butawerala', color:'#4CAF50', icon:'leaf',
    traits:['High yield','Disease resistant','Bold berries'],
    desc:'The most widely cultivated variety in Sri Lanka. Bold berries, strong disease resistance.',
  },
  {
    name:'Dingirala', color:C.info, icon:'leaf-outline',
    traits:['Aromatic','Early bearing','Medium yield'],
    desc:'Prized for intense aroma and pungency. Reaches bearing stage earlier than other varieties.',
  },
  {
    name:'Kohukuburerala', color:C.purple, icon:'flower-outline',
    traits:['Long bunches','Shade tolerant','Premium quality'],
    desc:'Known for exceptionally long spikes. Thrives in shaded environments.',
  },
];

export default function VarietyHubScreen({ navigation }) {
  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#020A01','#030D01','#0D1A08']} style={s.hero}>
          <View style={s.glow} />
          <View style={s.heroIconBox}>
            <Ionicons name="scan" size={34} color={C.teal} />
          </View>
          <Text style={s.heroTitle}>Variety Identification</Text>
          <Text style={s.heroSub}>Two-stage AI identifies Sri Lankan black pepper varieties from leaf images with high confidence.</Text>
          <View style={s.heroBtns}>
            <TouchableOpacity style={s.identifyBtn} onPress={() => navigation.navigate('VarietyIdentify')} activeOpacity={0.85}>
              <LinearGradient colors={[C.teal,'#006064']} style={s.identifyGrad}>
                <Ionicons name="scan-outline" size={17} color="#fff" style={{marginRight:8}} />
                <Text style={s.identifyTxt}>Identify Variety</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={s.histBtn} onPress={() => navigation.navigate('VarietyHistory')} activeOpacity={0.8}>
              <Ionicons name="time-outline" size={15} color={C.text2} style={{marginRight:5}} />
              <Text style={s.histTxt}>History</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={s.section}>
          <Text style={s.secCap}>THREE VARIETIES</Text>
          {VARIETIES.map(v => (
            <TouchableOpacity key={v.name} style={s.vCard} onPress={() => navigation.navigate('VarietyInfo', { variety:v.name })} activeOpacity={0.8}>
              <View style={[s.vAccent, {backgroundColor:v.color}]} />
              <View style={s.vBody}>
                <View style={s.vTop}>
                  <View style={[s.vIconBox, {backgroundColor:v.color+'18'}]}>
                    <Ionicons name={v.icon} size={20} color={v.color} />
                  </View>
                  <View style={{flex:1, marginLeft:12}}>
                    <Text style={[s.vName, {color:v.color}]}>{v.name}</Text>
                    <Text style={s.vDesc} numberOfLines={2}>{v.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.dim} />
                </View>
                <View style={s.traitsRow}>
                  {v.traits.map(t => (
                    <View key={t} style={[s.traitChip, {backgroundColor:v.color+'15', borderColor:v.color+'30'}]}>
                      <Text style={[s.traitTxt, {color:v.color}]}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.secCap}>HOW IT WORKS</Text>
          {[
            { icon:'camera-outline',  color:C.teal,  title:'Capture leaf',       desc:'Take or upload a clear photo of a black pepper leaf.' },
            { icon:'layers-outline',  color:C.lime,  title:'Stage A — Leaf check',desc:'Model verifies it is a genuine black pepper leaf.' },
            { icon:'scan-outline',    color:C.gold,  title:'Stage B — Variety ID',desc:'Second model classifies the exact variety with confidence scores.' },
          ].map(step => (
            <View key={step.title} style={s.stepRow}>
              <View style={[s.stepIcon, {backgroundColor:step.color+'18'}]}>
                <Ionicons name={step.icon} size={18} color={step.color} />
              </View>
              <View style={{flex:1}}>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{height:20}} />
      </ScrollView>
      <BottomNav navigation={navigation} active="VarietyHub" />
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex:1, backgroundColor:C.bg },
  hero:  { paddingTop: Platform.OS==='ios'?58:44, paddingHorizontal:22, paddingBottom:28, overflow:'hidden' },
  glow:  { position:'absolute', width:260, height:260, borderRadius:130, backgroundColor:'rgba(38,198,218,0.06)', top:-80, right:-70 },
  heroIconBox:{ width:72, height:72, borderRadius:22, backgroundColor:'rgba(38,198,218,0.10)', justifyContent:'center', alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'rgba(38,198,218,0.18)' },
  heroTitle:{ fontSize:28, fontWeight:'900', color:C.text, letterSpacing:-0.6, marginBottom:10 },
  heroSub:  { fontSize:13, color:C.text3, lineHeight:21, marginBottom:24 },
  heroBtns: { flexDirection:'row', gap:12 },
  identifyBtn:  { flex:2, borderRadius:14, overflow:'hidden', ...SHADOW.md },
  identifyGrad: { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:15 },
  identifyTxt:  { fontSize:15, fontWeight:'800', color:'#fff' },
  histBtn:  { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:C.bg2, borderRadius:14, borderWidth:1, borderColor:C.border },
  histTxt:  { fontSize:13, fontWeight:'700', color:C.text2 },

  section:  { paddingHorizontal:22, paddingTop:24, paddingBottom:4 },
  secCap:   { ...T.cap, marginBottom:14 },

  vCard:   { backgroundColor:C.bg2, borderRadius:18, overflow:'hidden', marginBottom:12, borderWidth:1, borderColor:C.border, ...SHADOW.sm, flexDirection:'row' },
  vAccent: { width:4 },
  vBody:   { flex:1, padding:16 },
  vTop:    { flexDirection:'row', alignItems:'center', marginBottom:12 },
  vIconBox:{ width:40, height:40, borderRadius:12, justifyContent:'center', alignItems:'center' },
  vName:   { fontSize:16, fontWeight:'800', marginBottom:3 },
  vDesc:   { fontSize:11, color:C.text3, lineHeight:16 },
  traitsRow:{ flexDirection:'row', flexWrap:'wrap', gap:6 },
  traitChip:{ borderRadius:8, paddingHorizontal:8, paddingVertical:4, borderWidth:1 },
  traitTxt: { fontSize:10, fontWeight:'700' },

  stepRow:  { flexDirection:'row', alignItems:'flex-start', gap:14, paddingVertical:14, borderBottomWidth:1, borderBottomColor:C.border },
  stepIcon: { width:40, height:40, borderRadius:12, justifyContent:'center', alignItems:'center', flexShrink:0 },
  stepTitle:{ fontSize:14, fontWeight:'700', color:C.text, marginBottom:4 },
  stepDesc: { fontSize:12, color:C.text3, lineHeight:18 },
});