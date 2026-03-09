// src/screens/LandingScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SHADOW } from '../components/theme';

const { width } = Dimensions.get('window');

const CARDS = [
  { emoji:'🫑', title:'Berry Analysis',     sub:'Grade · Defect · Curing prediction',         screen:'Home',                accent:C.lime   },
  { emoji:'🌱', title:'Soil Monitor',        sub:'Live NPK via ThingSpeak IoT',                screen:'SoilAnalysis',        accent:C.blue   },
  { emoji:'🔬', title:'Disease Detection',   sub:'EfficientNetB0 · leaf blight · slow wilt',   screen:'DiseaseIdentification',accent:'#ef5350'},
  { emoji:'🫑', title:'Variety Identifier',  sub:'Butawerala · Dingirala · Kohukuburerala',    screen:'VarietyHub',          accent:'#26c6da'},
  { emoji:'🌿', title:'Fertilizer Advisor',  sub:'7 fertilizers · AI-ranked · reason',         screen:'Fertilizer',          accent:C.amber  },
  { emoji:'🗺️', title:'Farm Dashboard',      sub:'Map · 4 farms · soil at a glance',           screen:'Dashboard',           accent:C.rose   },
  { emoji:'🌤️', title:'Weather Station',     sub:'Live weather · black pepper farming tips',   screen:'Weather',             accent:C.teal   },
];

export default function LandingScreen({ navigation }) {
  const fade  = useRef(new Animated.Value(0)).current;
  const rise  = useRef(new Animated.Value(44)).current;
  const cards = CARDS.map(() => useRef(new Animated.Value(60)).current);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue:1, duration:700, useNativeDriver:true }),
      Animated.timing(rise, { toValue:0, duration:700, useNativeDriver:true }),
    ]).start(() =>
      Animated.stagger(55, cards.map(a =>
        Animated.spring(a, { toValue:0, tension:90, friction:11, useNativeDriver:true })
      )).start()
    );
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg0} />

      {/* Background */}
      <LinearGradient colors={[C.bg0, C.bg1, C.bg2]} style={StyleSheet.absoluteFill} />
      <View style={[s.orb, { top:-100, right:-80,  width:300, height:300, backgroundColor:C.pine+'cc' }]} />
      <View style={[s.orb, { bottom:60, left:-100, width:240, height:240, backgroundColor:'#0a2a06cc' }]} />

      <SafeAreaView style={{ flex:1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* ── HEADER ── */}
          <Animated.View style={[s.header, { opacity:fade, transform:[{ translateY:rise }] }]}>
            <View style={s.logoRow}>
              <View style={s.logoIcon}><Text style={{ fontSize:26 }}>🌿</Text></View>
              <View style={{ flex:1 }}>
                <Text style={s.logoName}>Black Pepper AI</Text>
                <Text style={s.logoTagline}>Smart Guardian System</Text>
              </View>
              {/* Auth row */}
              <View style={s.authRow}>
                <TouchableOpacity style={s.signInPill} onPress={() => navigation.navigate('SignIn')}>
                  <Text style={s.signInTxt}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.signUpPill} onPress={() => navigation.navigate('SignUp')}>
                  <Text style={s.signUpTxt}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero */}
            <View style={s.hero}>
              <View style={s.heroBadge}>
                <View style={s.heroBadgeDot} />
                <Text style={s.heroBadgeTxt}>AI-POWERED AGRICULTURE</Text>
              </View>
              <Text style={s.heroHeadline}>Intelligent Farming{'\n'}Starts Here</Text>
              <Text style={s.heroBody}>
                Computer vision · IoT soil sensors · ensemble ML · real-time weather analytics for black pepper cultivation
              </Text>

              <View style={s.statsRow}>
                {[['95%+','AI Accuracy'],['3000+','Berry Images'],['5','ML Models'],['Live','IoT Data']].map(([n,l]) => (
                  <View key={l} style={s.statBox}>
                    <Text style={s.statN}>{n}</Text>
                    <Text style={s.statL}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* ── MODULE CARDS ── */}
          <View style={s.menuSection}>
            <Text style={s.menuLabel}>MODULES  ·  {CARDS.length} FEATURES</Text>
            {CARDS.map((c, i) => (
              <Animated.View key={c.screen} style={{ transform:[{ translateY:cards[i] }], opacity:fade }}>
                <TouchableOpacity
                  activeOpacity={0.78}
                  style={[s.card, i===0 && { borderColor:c.accent+'55' }]}
                  onPress={() => navigation.navigate(c.screen)}
                >
                  <LinearGradient
                    colors={i===0 ? [c.accent+'1a', C.bg2] : [C.bg3, C.bg2]}
                    start={{ x:0,y:0 }} end={{ x:1,y:1 }}
                    style={s.cardGrad}
                  >
                    {/* Featured badge on first card */}
                    {i===0 && (
                      <View style={[s.featBadge, { backgroundColor:c.accent+'22', borderColor:c.accent+'44' }]}>
                        <Text style={[s.featBadgeTxt, { color:c.accent }]}>⭐ FEATURED</Text>
                      </View>
                    )}
                    <View style={[s.cardIcon, { backgroundColor:c.accent+'22', borderColor:c.accent+'33' }]}>
                      <Text style={{ fontSize:24 }}>{c.emoji}</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={[s.cardTitle, i===0 && { color:c.accent }]}>{c.title}</Text>
                      <Text style={s.cardSub}>{c.sub}</Text>
                    </View>
                    <View style={[s.cardArrow, { backgroundColor:c.accent+'18' }]}>
                      <Text style={{ fontSize:20, color:c.accent }}>›</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <Animated.Text style={[s.footer, { opacity:fade }]}>
            SLIIT Research Project · v2.0
          </Animated.Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex:1, backgroundColor:C.bg0 },
  scroll:      { paddingBottom:48 },
  orb:         { position:'absolute', borderRadius:999, opacity:0.55 },

  header:      { paddingHorizontal:20, paddingTop:14 },
  logoRow:     { flexDirection:'row', alignItems:'center', gap:12, marginBottom:22 },
  logoIcon:    { width:48, height:48, borderRadius:15, backgroundColor:C.pine, justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:C.border },
  logoName:    { fontSize:17, fontWeight:'900', color:C.white, letterSpacing:0.2 },
  logoTagline: { fontSize:10, color:C.sage, marginTop:1, letterSpacing:0.5 },

  authRow:     { flexDirection:'row', gap:6 },
  signInPill:  { backgroundColor:C.lime+'18', paddingHorizontal:12, paddingVertical:7, borderRadius:20, borderWidth:1, borderColor:C.lime+'40' },
  signInTxt:   { color:C.lime, fontSize:12, fontWeight:'700' },
  signUpPill:  { backgroundColor:C.lime, paddingHorizontal:12, paddingVertical:7, borderRadius:20 },
  signUpTxt:   { color:C.bg0, fontSize:12, fontWeight:'800' },

  hero:        { backgroundColor:'rgba(255,255,255,0.03)', borderRadius:24, padding:22, borderWidth:1, borderColor:C.border, marginBottom:28 },
  heroBadge:   { flexDirection:'row', alignItems:'center', gap:6, marginBottom:14 },
  heroBadgeDot:{ width:7, height:7, borderRadius:4, backgroundColor:C.lime },
  heroBadgeTxt:{ fontSize:10, color:C.lime, fontWeight:'700', letterSpacing:1.8 },
  heroHeadline:{ fontSize:32, fontWeight:'900', color:C.white, lineHeight:38, marginBottom:10 },
  heroBody:    { fontSize:13, color:C.muted, lineHeight:20, marginBottom:20 },
  statsRow:    { flexDirection:'row', gap:8 },
  statBox:     { flex:1, backgroundColor:'rgba(184,240,74,0.07)', borderRadius:14, padding:10, alignItems:'center', borderWidth:1, borderColor:C.border },
  statN:       { fontSize:15, fontWeight:'900', color:C.lime },
  statL:       { fontSize:9,  color:C.sage, marginTop:3, textAlign:'center' },

  menuSection: { paddingHorizontal:20, gap:10 },
  menuLabel:   { fontSize:10, fontWeight:'800', color:C.dim, letterSpacing:2.5, marginBottom:4 },

  card:        { borderRadius:20, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,255,255,0.07)', ...SHADOW.sm },
  cardGrad:    { flexDirection:'row', alignItems:'center', padding:16, gap:14 },
  featBadge:   { position:'absolute', top:10, right:12, paddingHorizontal:8, paddingVertical:3, borderRadius:99, borderWidth:1 },
  featBadgeTxt:{ fontSize:9, fontWeight:'800', letterSpacing:0.5 },
  cardIcon:    { width:52, height:52, borderRadius:16, justifyContent:'center', alignItems:'center', borderWidth:1 },
  cardTitle:   { fontSize:15, fontWeight:'800', color:C.white, marginBottom:3 },
  cardSub:     { fontSize:11, color:C.sage, lineHeight:15 },
  cardArrow:   { width:34, height:34, borderRadius:11, justifyContent:'center', alignItems:'center' },

  footer:      { textAlign:'center', color:C.dim, fontSize:11, letterSpacing:1, marginTop:32 },
});