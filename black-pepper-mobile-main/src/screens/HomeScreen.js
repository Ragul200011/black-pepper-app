// src/screens/HomeScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/slices/userSlice';
import { C, SHADOW } from '../components/theme';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

const QUICK = [
  { emoji:'🌱', label:'Soil',       screen:'SoilAnalysis',          color:C.blue,    bg:'#E3F2FD' },
  { emoji:'🔬', label:'Disease',    screen:'DiseaseIdentification', color:'#D32F2F', bg:'#FFEBEE' },
  { emoji:'🫑', label:'Variety',    screen:'VarietyHub',            color:C.teal,    bg:'#E0F7FA' },
  { emoji:'🌿', label:'Fertilizer', screen:'Fertilizer',            color:C.warning, bg:'#FFF8E1' },
  { emoji:'🗺️', label:'Dashboard',  screen:'Dashboard',             color:C.rose,    bg:'#FCE4EC' },
  { emoji:'🌤️', label:'Weather',    screen:'Weather',               color:C.indigo,  bg:'#E8EAF6' },
];

const FEATURES = [
  { emoji:'🔬', title:'Disease Detection',  desc:'EfficientNetB0 detects leaf blight & slow wilt from leaf photos with 95%+ accuracy.',      color:'#D32F2F', screen:'DiseaseIdentification' },
  { emoji:'🫑', title:'Variety Identifier', desc:'Two-stage AI classifies Butawerala, Dingirala & Kohukuburerala from leaf images.',          color:C.teal,    screen:'VarietyHub'            },
  { emoji:'🌱', title:'Soil Monitoring',    desc:'Live NPK, pH, moisture & temperature from RS-485 IoT sensors via ThingSpeak cloud.',        color:C.blue,    screen:'SoilAnalysis'          },
  { emoji:'🌿', title:'Fertilizer Advisor', desc:'Ensemble RF+XGBoost+SVM ranks all 7 fertilizers by match percentage for your soil.',        color:C.warning, screen:'Fertilizer'            },
  { emoji:'🗺️', title:'Farm Dashboard',    desc:'GPS satellite map with field markers, soil overlays and nearby farming spots.',              color:C.rose,    screen:'Dashboard'             },
  { emoji:'🌤️', title:'Weather Station',   desc:'Live OpenWeatherMap data with auto-refreshing black pepper farming advisories.',             color:C.indigo,  screen:'Weather'               },
];

export default function HomeScreen({ navigation }) {
  const user = useSelector(selectCurrentUser);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue:1, duration:500, useNativeDriver:true }),
      Animated.timing(rise, { toValue:0, duration:450, useNativeDriver:true }),
    ]).start();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={{flex:1, backgroundColor:C.bg}}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <LinearGradient colors={[C.gradStart, C.gradMid, C.gradEnd]} style={s.hero}>
          <Animated.View style={{opacity:fade, transform:[{translateY:rise}]}}>
            <View style={s.heroTop}>
              <View>
                <Text style={s.greeting}>{greeting}, {user?.name ?? 'Farmer'} 👋</Text>
                <Text style={s.heroTitle}>Black Pepper{'\n'}Smart Guardian</Text>
              </View>
              <TouchableOpacity style={s.heroIcon} activeOpacity={0.8}
                onPress={() => navigation.navigate('Dashboard')}>
                <Ionicons name="map-outline" size={22} color={C.white} />
              </TouchableOpacity>
            </View>
            <Text style={s.heroSub}>
              Disease detection · Variety ID · Soil monitoring · Fertilizer advice
            </Text>

            {/* Quick stat pills */}
            <View style={s.pillRow}>
              {[
                {icon:'leaf-outline',      txt:'4 AI Models'},
                {icon:'wifi-outline',      txt:'Live IoT'},
                {icon:'shield-checkmark-outline', txt:'95%+ Accuracy'},
              ].map(p => (
                <View key={p.txt} style={s.pill}>
                  <Ionicons name={p.icon} size={12} color="rgba(255,255,255,0.9)" />
                  <Text style={s.pillTxt}>{p.txt}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* QUICK ACCESS */}
        <View style={s.quickSection}>
          <Text style={s.cap}>QUICK ACCESS</Text>
          <View style={s.quickGrid}>
            {QUICK.map(it => (
              <TouchableOpacity key={it.screen} style={s.quickBtn}
                onPress={() => navigation.navigate(it.screen)} activeOpacity={0.75}>
                <View style={[s.quickIcon, {backgroundColor:it.bg}]}>
                  <Text style={{fontSize:22}}>{it.emoji}</Text>
                </View>
                <Text style={[s.quickLabel, {color:it.color}]}>{it.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FEATURE CARDS */}
        <View style={s.section}>
          <Text style={s.cap}>RESEARCH COMPONENTS</Text>
          <Text style={s.sectionTitle}>Integrated AI System</Text>
          {FEATURES.map(f => (
            <TouchableOpacity key={f.title} style={[s.featCard, {borderLeftColor:f.color}]}
              onPress={() => navigation.navigate(f.screen)} activeOpacity={0.8}>
              <View style={[s.featIconWrap, {backgroundColor:f.color+'14'}]}>
                <Text style={{fontSize:24}}>{f.emoji}</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={[s.featTitle, {color:f.color}]}>{f.title}</Text>
                <Text style={s.featDesc}>{f.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.hint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* HOW IT WORKS */}
        <View style={s.howCard}>
          <Text style={s.cap}>HOW IT WORKS</Text>
          <Text style={s.sectionTitle}>Four Simple Steps</Text>
          {[
            {n:'1', emoji:'📸', t:'Capture / Upload',  d:'Take a clear photo of a leaf or enter sensor readings'},
            {n:'2', emoji:'🤖', t:'AI Processing',     d:'Deep learning models analyse your image or data'},
            {n:'3', emoji:'📊', t:'View Results',      d:'Disease, variety, soil verdict & recommendations'},
            {n:'4', emoji:'🌿', t:'Take Action',       d:'Apply the fertilizer plan or treatment advice'},
          ].map(step => (
            <View key={step.n} style={s.stepRow}>
              <View style={s.stepNum}><Text style={s.stepNumTxt}>{step.n}</Text></View>
              <Text style={{fontSize:22, marginRight:12}}>{step.emoji}</Text>
              <View style={{flex:1}}>
                <Text style={s.stepTitle}>{step.t}</Text>
                <Text style={s.stepSub}>{step.d}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* RESEARCH CARD */}
        <LinearGradient colors={[C.gradStart, C.gradMid]} style={s.researchCard}>
          <View style={s.researchRow}>
            <Text style={{fontSize:40}}>🎓</Text>
            <View style={{flex:1, marginLeft:14}}>
              <Text style={s.researchTitle}>SLIIT Research Project</Text>
              <Text style={s.researchDesc}>
                AI-powered black pepper cultivation management for Sri Lankan farmers.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{height:24}} />
      </ScrollView>
      <BottomNav navigation={navigation} active="Home" />
    </View>
  );
}

const s = StyleSheet.create({
  hero:     {paddingTop:52, paddingBottom:28, paddingHorizontal:22},
  heroTop:  {flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10},
  greeting: {fontSize:13, color:'rgba(255,255,255,0.82)', fontWeight:'600', marginBottom:4},
  heroTitle:{fontSize:26, fontWeight:'900', color:C.white, lineHeight:33, letterSpacing:-0.4},
  heroIcon: {width:44, height:44, borderRadius:14, backgroundColor:'rgba(255,255,255,0.18)', justifyContent:'center', alignItems:'center'},
  heroSub:  {fontSize:12, color:'rgba(255,255,255,0.8)', lineHeight:18, marginBottom:16},
  pillRow:  {flexDirection:'row', gap:8},
  pill:     {flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(255,255,255,0.16)', borderRadius:20, paddingHorizontal:10, paddingVertical:5},
  pillTxt:  {fontSize:10, color:'rgba(255,255,255,0.9)', fontWeight:'700'},

  quickSection:{backgroundColor:C.white, paddingHorizontal:20, paddingVertical:18, borderBottomWidth:1, borderBottomColor:C.border},
  cap:         {fontSize:10, fontWeight:'800', color:C.text3, letterSpacing:2, marginBottom:14},
  quickGrid:   {flexDirection:'row', justifyContent:'space-between'},
  quickBtn:    {alignItems:'center', gap:6, width:(width-40)/6},
  quickIcon:   {width:48, height:48, borderRadius:15, justifyContent:'center', alignItems:'center'},
  quickLabel:  {fontSize:10, fontWeight:'800'},

  section:      {padding:20},
  sectionTitle: {fontSize:20, fontWeight:'900', color:C.text, marginBottom:14},
  featCard:     {flexDirection:'row', alignItems:'center', gap:14, backgroundColor:C.white, borderRadius:18, padding:16, borderLeftWidth:4, borderWidth:1, borderColor:C.border, marginBottom:10, ...SHADOW.xs},
  featIconWrap: {width:46, height:46, borderRadius:14, justifyContent:'center', alignItems:'center', flexShrink:0},
  featTitle:    {fontSize:14, fontWeight:'800', marginBottom:3},
  featDesc:     {fontSize:12, color:C.text3, lineHeight:17},

  howCard:   {backgroundColor:C.white, margin:16, borderRadius:22, padding:20, borderWidth:1, borderColor:C.border, ...SHADOW.sm},
  stepRow:   {flexDirection:'row', alignItems:'flex-start', marginBottom:18},
  stepNum:   {width:30, height:30, borderRadius:10, backgroundColor:C.xlight, justifyContent:'center', alignItems:'center', marginRight:12, borderWidth:1, borderColor:C.light},
  stepNumTxt:{fontSize:13, fontWeight:'900', color:C.primary},
  stepTitle: {fontSize:14, fontWeight:'700', color:C.text, marginBottom:2},
  stepSub:   {fontSize:12, color:C.text3},

  researchCard:{marginHorizontal:16, borderRadius:20, padding:20, marginBottom:4},
  researchRow: {flexDirection:'row', alignItems:'center'},
  researchTitle:{fontSize:16, fontWeight:'900', color:C.white, marginBottom:6},
  researchDesc: {fontSize:12, color:'rgba(255,255,255,0.85)', lineHeight:18},
});