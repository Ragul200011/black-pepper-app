// src/screens/HomeScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SHADOW } from '../components/theme';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

const FEATURES = [
  { emoji:'⭐', title:'Quality Grading',    desc:'MobileNetV2 classifies A–D grade with 95%+ accuracy in seconds.',         color:C.lime   },
  { emoji:'🔍', title:'Defect Detection',   desc:'EfficientNetB0 identifies shriveled, broken, immature & discolored.',      color:C.rose   },
  { emoji:'⏱️', title:'Curing Prediction',  desc:'Predicts remaining curing time from moisture & environment.',              color:C.amber  },
  { emoji:'🔬', title:'Disease Detection',  desc:'Leaf blight & slow wilt detected from live leaf photos.',                  color:'#ef5350' },
  { emoji:'🫑', title:'Variety Identifier', desc:'Two-stage AI identifies Butawerala, Dingirala & Kohukuburerala.',          color:'#26c6da' },
  { emoji:'📦', title:'Storage Monitoring', desc:'IoT sensors track temp & humidity for optimal preservation.',              color:'#0277bd' },
];

export default function HomeScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue:1, duration:600, useNativeDriver:true }),
      Animated.timing(rise, { toValue:0, duration:600, useNativeDriver:true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex:1, backgroundColor:C.bg1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <LinearGradient colors={[C.bg0, C.bg2, C.pine]} style={s.hero}>
          <Animated.View style={{ opacity:fade, transform:[{ translateY:rise }] }}>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeTxt}>VISUAL AI · DEEP LEARNING</Text>
            </View>
            <Text style={s.heroTitle}>Berry Health &{'\n'}Post-Harvest Grading</Text>
            <Text style={s.heroSub}>
              Automated quality assessment, defect detection & intelligent curing prediction
            </Text>
            <TouchableOpacity style={s.ctaBtn} onPress={() => navigation.navigate('Analysis')} activeOpacity={0.85}>
              <LinearGradient colors={[C.lime, '#8fd628']} style={s.ctaBtnInner} start={{ x:0,y:0 }} end={{ x:1,y:0 }}>
                <Text style={s.ctaBtnTxt}>🚀  Start Analysis</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>

        {/* ── QUICK NAV (all 6 shortcuts) ── */}
        <View style={s.quickSection}>
          <Text style={s.quickLabel}>QUICK ACCESS</Text>
          <View style={s.quickGrid}>
            {[
              { emoji:'🌱', label:'Soil',      screen:'SoilAnalysis',         color:C.blue    },
              { emoji:'🌿', label:'Fertilizer',screen:'Fertilizer',            color:C.amber   },
              { emoji:'🔬', label:'Disease',   screen:'DiseaseIdentification', color:'#ef5350' },
              { emoji:'🫑', label:'Variety',   screen:'VarietyHub',            color:'#26c6da' },
              { emoji:'🗺️', label:'Map',       screen:'Dashboard',             color:C.rose    },
              { emoji:'🌤️', label:'Weather',   screen:'Weather',               color:C.teal    },
            ].map(it => (
              <TouchableOpacity key={it.screen} style={s.quickBtn} onPress={() => navigation.navigate(it.screen)} activeOpacity={0.75}>
                <View style={[s.quickIcon, { backgroundColor:it.color+'20', borderColor:it.color+'40' }]}>
                  <Text style={{ fontSize:22 }}>{it.emoji}</Text>
                </View>
                <Text style={s.quickLabel2}>{it.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── FEATURES ── */}
        <View style={s.section}>
          <Text style={s.sectionChip}>COMPONENTS</Text>
          <Text style={s.sectionTitle}>Integrated Analysis System</Text>
          <View style={s.featureGrid}>
            {FEATURES.map(f => (
              <View key={f.title} style={[s.featureCard, { borderTopColor:f.color }]}>
                <Text style={s.featureEmoji}>{f.emoji}</Text>
                <Text style={s.featureTitle}>{f.title}</Text>
                <Text style={s.featureSub}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── HOW IT WORKS ── */}
        <LinearGradient colors={[C.bg1, C.bg2]} style={s.howSection}>
          <Text style={[s.sectionChip, { color:C.sage }]}>HOW IT WORKS</Text>
          <Text style={[s.sectionTitle, { color:C.white }]}>Four Simple Steps</Text>
          {[
            { n:'1', emoji:'📸', t:'Capture Image',    d:'Take or upload a clear photo of berries or leaves' },
            { n:'2', emoji:'📝', t:'Enter Parameters', d:'Moisture, temperature & days processed'            },
            { n:'3', emoji:'🤖', t:'AI Processing',    d:'5 deep learning models analyse in parallel'        },
            { n:'4', emoji:'📊', t:'View Results',     d:'Grade, defects, disease, variety & recommendations'},
          ].map(step => (
            <View key={step.n} style={s.stepRow}>
              <View style={s.stepNum}><Text style={s.stepNumTxt}>{step.n}</Text></View>
              <Text style={{ fontSize:22, marginRight:10 }}>{step.emoji}</Text>
              <View style={{ flex:1 }}>
                <Text style={s.stepTitle}>{step.t}</Text>
                <Text style={s.stepSub}>{step.d}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={s.ctaBtn2} onPress={() => navigation.navigate('Analysis')} activeOpacity={0.85}>
            <Text style={s.ctaBtn2Txt}>Begin Analysis →</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height:20 }} />
      </ScrollView>

      <BottomNav navigation={navigation} active="Home" />
    </View>
  );
}

const s = StyleSheet.create({
  hero:          { paddingTop:48, paddingBottom:36, paddingHorizontal:22 },
  heroBadge:     { backgroundColor:C.lime+'18', alignSelf:'flex-start', paddingHorizontal:12, paddingVertical:5, borderRadius:20, marginBottom:14, borderWidth:1, borderColor:C.lime+'35' },
  heroBadgeTxt:  { fontSize:10, color:C.lime, fontWeight:'800', letterSpacing:1.8 },
  heroTitle:     { fontSize:30, fontWeight:'900', color:C.white, lineHeight:37, marginBottom:10 },
  heroSub:       { fontSize:13, color:C.muted, lineHeight:20, marginBottom:24 },
  ctaBtn:        { borderRadius:16, overflow:'hidden', alignSelf:'flex-start', ...SHADOW.md },
  ctaBtnInner:   { paddingVertical:15, paddingHorizontal:28 },
  ctaBtnTxt:     { color:C.bg0, fontSize:16, fontWeight:'800' },

  quickSection:  { backgroundColor:C.bg2, paddingTop:16, paddingBottom:18, paddingHorizontal:18, borderBottomWidth:1, borderBottomColor:C.border },
  quickLabel:    { fontSize:9, fontWeight:'800', color:C.dim, letterSpacing:2, marginBottom:12 },
  quickGrid:     { flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'space-between' },
  quickBtn:      { width:(width - 36 - 50) / 6, alignItems:'center', gap:5 },
  quickIcon:     { width:48, height:48, borderRadius:15, justifyContent:'center', alignItems:'center', borderWidth:1 },
  quickLabel2:   { fontSize:10, color:C.muted, fontWeight:'600' },

  section:       { padding:22, backgroundColor:'#0d1a06' },
  sectionChip:   { fontSize:10, fontWeight:'800', color:C.lime, letterSpacing:2, marginBottom:4 },
  sectionTitle:  { fontSize:22, fontWeight:'900', color:C.white, marginBottom:18 },
  featureGrid:   { gap:12 },
  featureCard:   { backgroundColor:C.bg3, borderRadius:18, padding:18, borderTopWidth:3, ...SHADOW.sm },
  featureEmoji:  { fontSize:28, marginBottom:8 },
  featureTitle:  { fontSize:15, fontWeight:'800', color:C.white, marginBottom:5 },
  featureSub:    { fontSize:12, color:C.muted, lineHeight:18 },

  howSection:    { padding:26 },
  stepRow:       { flexDirection:'row', alignItems:'flex-start', marginBottom:20 },
  stepNum:       { width:30, height:30, borderRadius:10, backgroundColor:C.lime+'20', justifyContent:'center', alignItems:'center', marginRight:12, borderWidth:1, borderColor:C.lime+'40' },
  stepNumTxt:    { fontSize:13, fontWeight:'900', color:C.lime },
  stepTitle:     { fontSize:14, fontWeight:'700', color:C.white, marginBottom:2 },
  stepSub:       { fontSize:12, color:C.muted },
  ctaBtn2:       { marginTop:10, backgroundColor:C.lime, borderRadius:14, paddingVertical:15, alignItems:'center' },
  ctaBtn2Txt:    { color:C.bg0, fontSize:15, fontWeight:'800' },
});