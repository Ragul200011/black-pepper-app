// src/screens/LandingScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/slices/userSlice';
import { C, SHADOW } from '../components/theme';

const { width } = Dimensions.get('window');

const MODULES = [
  { emoji:'🌱', title:'Soil Monitor',       sub:'Live NPK · Temperature · Moisture · pH via ThingSpeak IoT', screen:'SoilAnalysis',          color:C.blue    },
  { emoji:'🔬', title:'Disease Detection',  sub:'Leaf blight · Slow wilt detection · EfficientNetB0 AI',     screen:'DiseaseIdentification', color:'#E53935' },
  { emoji:'🫑', title:'Variety Identifier', sub:'Butawerala · Dingirala · Kohukuburerala classification',    screen:'VarietyHub',            color:C.teal    },
  { emoji:'🌿', title:'Fertilizer Advisor', sub:'AI-ranked NPK fertilizer recommendations for your soil',    screen:'Fertilizer',            color:C.warning },
  { emoji:'🗺️', title:'Farm Dashboard',     sub:'GPS map · Field overview · Nearby farming spots',           screen:'Dashboard',             color:C.rose    },
  { emoji:'🌤️', title:'Weather Station',    sub:'Live weather conditions · Black pepper farming advisories', screen:'Weather',               color:'#0277BD' },
];

const STATS = [
  { val:'95%+', lbl:'Accuracy'  },
  { val:'3K+',  lbl:'Images'    },
  { val:'4',    lbl:'ML Models' },
  { val:'Live', lbl:'IoT Data'  },
];

export default function LandingScreen({ navigation }) {
  const currentUser = useSelector(selectCurrentUser);
  const fade      = useRef(new Animated.Value(0)).current;
  const rise      = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(MODULES.map(() => new Animated.Value(40))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue:1, duration:500, useNativeDriver:true }),
      Animated.timing(rise, { toValue:0, duration:500, useNativeDriver:true }),
    ]).start(() =>
      Animated.stagger(60, cardAnims.map(a =>
        Animated.spring(a, { toValue:0, tension:90, friction:12, useNativeDriver:true })
      )).start()
    );
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.gradStart} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* HERO */}
        <LinearGradient colors={[C.gradStart, C.gradMid, C.gradEnd]} style={s.hero}>
          <SafeAreaView edges={['top']}>
            <Animated.View style={{ opacity:fade, transform:[{translateY:rise}] }}>
              {/* Top bar */}
              <View style={s.topBar}>
                <View style={s.logoRow}>
                  <View style={s.logoIcon}><Text style={{fontSize:22}}>🌿</Text></View>
                  <View>
                    <Text style={s.logoName}>Black Pepper AI</Text>
                    <Text style={s.logoSub}>Smart Guardian System</Text>
                  </View>
                </View>
                {currentUser ? (
                  <View style={s.userBadge}>
                    <Ionicons name="person-circle-outline" size={16} color={C.white} />
                    <Text style={s.userBadgeTxt} numberOfLines={1}>{currentUser.name}</Text>
                  </View>
                ) : (
                  <View style={s.authBtns}>
                    <TouchableOpacity style={s.btnOutlineW} onPress={() => navigation.navigate('SignIn')}>
                      <Text style={s.btnOutlineWTxt}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.btnSolidW} onPress={() => navigation.navigate('SignUp')}>
                      <Text style={s.btnSolidWTxt}>Register</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Hero text */}
              <View style={s.heroBody}>
                <View style={s.heroBadge}>
                  <View style={s.heroBadgeDot} />
                  <Text style={s.heroBadgeTxt}>AI-POWERED AGRICULTURE · SLIIT</Text>
                </View>
                <Text style={s.heroTitle}>Intelligent{'\n'}Farming Starts Here</Text>
                <Text style={s.heroDesc}>
                  Computer vision · IoT sensors · Ensemble ML · Real-time analytics for black pepper cultivation in Sri Lanka
                </Text>
                <View style={s.statsRow}>
                  {STATS.map(({ val, lbl }) => (
                    <View key={lbl} style={s.statBox}>
                      <Text style={s.statVal}>{val}</Text>
                      <Text style={s.statLbl}>{lbl}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>

        {/* MODULES */}
        <View style={s.moduleSection}>
          <View style={s.sectionHead}>
            <Text style={s.sectionCap}>ALL MODULES</Text>
            <Text style={s.sectionTitle}>6 AI Features</Text>
          </View>

          {MODULES.map((m, i) => (
            <Animated.View key={m.screen}
              style={{ transform:[{translateY:cardAnims[i]}], opacity:fade }}>
              <TouchableOpacity style={s.moduleCard} activeOpacity={0.78}
                onPress={() => navigation.navigate(m.screen)}
                accessibilityRole="button" accessibilityLabel={`Open ${m.title}`}>
                <View style={[s.moduleIcon, { backgroundColor:m.color+'15' }]}>
                  <Text style={{ fontSize:24 }}>{m.emoji}</Text>
                </View>
                <View style={s.moduleText}>
                  <Text style={s.moduleTitle}>{m.title}</Text>
                  <Text style={s.moduleSub}>{m.sub}</Text>
                </View>
                <View style={[s.moduleArrow, { backgroundColor:m.color+'15' }]}>
                  <Ionicons name="chevron-forward" size={16} color={m.color} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Text style={s.footer}>SLIIT Research Project  ·  v2.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex:1, backgroundColor:C.bg },
  scroll: { paddingBottom:40 },

  hero:    { paddingBottom:32 },
  topBar:  { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingTop:12, marginBottom:24 },
  logoRow: { flexDirection:'row', alignItems:'center', gap:10 },
  logoIcon:{ width:40, height:40, borderRadius:13, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center' },
  logoName:{ fontSize:15, fontWeight:'900', color:C.white },
  logoSub: { fontSize:9, color:'rgba(255,255,255,0.7)', letterSpacing:0.3 },

  authBtns:      { flexDirection:'row', gap:8 },
  btnOutlineW:   { paddingHorizontal:12, paddingVertical:7, borderRadius:20, borderWidth:1, borderColor:'rgba(255,255,255,0.5)' },
  btnOutlineWTxt:{ color:C.white, fontSize:12, fontWeight:'700' },
  btnSolidW:     { paddingHorizontal:12, paddingVertical:7, borderRadius:20, backgroundColor:'rgba(255,255,255,0.2)' },
  btnSolidWTxt:  { color:C.white, fontSize:12, fontWeight:'800' },

  userBadge:    { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:12, paddingVertical:7, borderRadius:20 },
  userBadgeTxt: { color:C.white, fontSize:12, fontWeight:'700', maxWidth:90 },

  heroBody:    { paddingHorizontal:20 },
  heroBadge:   { flexDirection:'row', alignItems:'center', gap:6, marginBottom:14 },
  heroBadgeDot:{ width:7, height:7, borderRadius:4, backgroundColor:'rgba(255,255,255,0.8)' },
  heroBadgeTxt:{ fontSize:10, color:'rgba(255,255,255,0.8)', fontWeight:'700', letterSpacing:1.8 },
  heroTitle:   { fontSize:30, fontWeight:'900', color:C.white, lineHeight:37, marginBottom:10 },
  heroDesc:    { fontSize:13, color:'rgba(255,255,255,0.82)', lineHeight:20, marginBottom:20 },

  statsRow: { flexDirection:'row', gap:8 },
  statBox:  { flex:1, backgroundColor:'rgba(255,255,255,0.15)', borderRadius:12, padding:10, alignItems:'center' },
  statVal:  { fontSize:16, fontWeight:'900', color:C.white },
  statLbl:  { fontSize:9, color:'rgba(255,255,255,0.7)', marginTop:2 },

  moduleSection: { paddingHorizontal:16, paddingTop:24 },
  sectionHead:   { marginBottom:16 },
  sectionCap:    { fontSize:10, fontWeight:'800', color:C.text3, letterSpacing:2, marginBottom:4 },
  sectionTitle:  { fontSize:20, fontWeight:'900', color:C.text },

  moduleCard:  { flexDirection:'row', alignItems:'center', backgroundColor:C.white, borderRadius:18, padding:16, marginBottom:10, borderWidth:1, borderColor:C.border, ...SHADOW.sm },
  moduleIcon:  { width:52, height:52, borderRadius:16, justifyContent:'center', alignItems:'center', marginRight:14 },
  moduleText:  { flex:1 },
  moduleTitle: { fontSize:15, fontWeight:'800', color:C.text, marginBottom:3 },
  moduleSub:   { fontSize:11, color:C.text3, lineHeight:16 },
  moduleArrow: { width:32, height:32, borderRadius:10, justifyContent:'center', alignItems:'center' },

  footer: { textAlign:'center', color:C.hint, fontSize:11, letterSpacing:0.8, marginTop:24, marginBottom:8 },
});