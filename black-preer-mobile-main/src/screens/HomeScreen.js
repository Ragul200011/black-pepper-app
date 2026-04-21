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

const FEATURES = [
  { emoji:'🔬', title:'Disease Detection',   desc:'EfficientNetB0 detects leaf blight & slow wilt from leaf photos.',    color:C.error   },
  { emoji:'🫑', title:'Variety Identifier',  desc:'Two-stage AI classifies Butawerala, Dingirala & Kohukuburerala.',    color:C.teal    },
  { emoji:'🌱', title:'Soil Monitoring',      desc:'Live NPK, pH, moisture & temperature via RS-485 IoT sensors.',      color:C.blue    },
  { emoji:'🌿', title:'Fertilizer Advisor',  desc:'Ensemble RF+XGBoost+SVM ranks all fertilizers for your soil data.', color:C.warning },
  { emoji:'🗺️', title:'Farm Dashboard',      desc:'GPS-based field map with satellite view and soil overlays.',         color:C.rose    },
  { emoji:'🌤️', title:'Weather Station',     desc:'Live OpenWeatherMap data with black pepper farming advisories.',     color:C.info    },
];

const QUICK = [
  { emoji:'🌱', label:'Soil',       screen:'SoilAnalysis',          color:C.blue    },
  { emoji:'🔬', label:'Disease',    screen:'DiseaseIdentification', color:'#E53935' },
  { emoji:'🫑', label:'Variety',    screen:'VarietyHub',            color:C.teal    },
  { emoji:'🌿', label:'Fertilizer', screen:'Fertilizer',            color:C.warning },
  { emoji:'🗺️', label:'Map',        screen:'Dashboard',             color:C.rose    },
  { emoji:'🌤️', label:'Weather',    screen:'Weather',               color:'#0277BD' },
];

export default function HomeScreen({ navigation }) {
  const user = useSelector(selectCurrentUser);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue:1, duration:500, useNativeDriver:true }),
      Animated.timing(rise, { toValue:0, duration:500, useNativeDriver:true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <LinearGradient colors={[C.gradStart, C.gradMid, C.gradEnd]} style={s.hero}>
          <Animated.View style={{ opacity:fade, transform:[{translateY:rise}] }}>
            <Text style={s.greeting}>Hello, {user?.name ?? 'Farmer'} 👋</Text>
            <Text style={s.heroTitle}>Black Pepper{'\n'}Smart Guardian</Text>
            <Text style={s.heroSub}>
              Disease detection · Variety ID · Soil monitoring · Fertilizer advice
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* QUICK ACCESS */}
        <View style={s.quickSection}>
          <Text style={s.cap}>QUICK ACCESS</Text>
          <View style={s.quickGrid}>
            {QUICK.map(it => (
              <TouchableOpacity key={it.screen} style={s.quickBtn}
                onPress={() => navigation.navigate(it.screen)} activeOpacity={0.75}
                accessibilityRole="button" accessibilityLabel={it.label}>
                <View style={[s.quickIcon, { backgroundColor:it.color+'18' }]}>
                  <Text style={{ fontSize:22 }}>{it.emoji}</Text>
                </View>
                <Text style={s.quickLabel}>{it.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FEATURES */}
        <View style={s.section}>
          <Text style={s.cap}>RESEARCH COMPONENTS</Text>
          <Text style={s.sectionTitle}>Integrated AI System</Text>
          <View style={s.featGrid}>
            {FEATURES.map(f => (
              <View key={f.title} style={[s.featCard, { borderLeftColor:f.color }]}>
                <View style={[s.featIconWrap, { backgroundColor:f.color+'15' }]}>
                  <Text style={{ fontSize:22 }}>{f.emoji}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={s.featTitle}>{f.title}</Text>
                  <Text style={s.featDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* HOW IT WORKS */}
        <View style={s.howSection}>
          <Text style={[s.cap, { color:C.text3 }]}>HOW IT WORKS</Text>
          <Text style={s.sectionTitle}>Four Simple Steps</Text>
          {[
            { n:'1', emoji:'📸', t:'Capture / Upload', d:'Take a clear photo of a leaf or enter sensor readings' },
            { n:'2', emoji:'🤖', t:'AI Processing',    d:'Deep learning models analyse the image or data'        },
            { n:'3', emoji:'📊', t:'View Results',     d:'Disease, variety, soil verdict & recommendations'       },
            { n:'4', emoji:'🌿', t:'Take Action',      d:'Apply the fertilizer plan or treatment advice'          },
          ].map(step => (
            <View key={step.n} style={s.stepRow}>
              <View style={s.stepNum}><Text style={s.stepNumTxt}>{step.n}</Text></View>
              <Text style={{ fontSize:20, marginRight:10 }}>{step.emoji}</Text>
              <View style={{ flex:1 }}>
                <Text style={s.stepTitle}>{step.t}</Text>
                <Text style={s.stepSub}>{step.d}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* RESEARCH INFO */}
        <View style={s.researchCard}>
          <View style={s.researchHeader}>
            <Ionicons name="school-outline" size={20} color={C.primary} />
            <Text style={s.researchTitle}>SLIIT Research Project</Text>
          </View>
          <Text style={s.researchDesc}>
            This system was developed as part of a SLIIT final year research project focused on improving black pepper cultivation in Sri Lanka using AI and IoT technologies, targeting the Jaffna district.
          </Text>
          <View style={s.researchTags}>
            {['Machine Learning','Computer Vision','IoT Sensors','React Native'].map(tag => (
              <View key={tag} style={s.researchTag}>
                <Text style={s.researchTagTxt}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height:20 }} />
      </ScrollView>
      <BottomNav navigation={navigation} active="Home" />
    </View>
  );
}

const s = StyleSheet.create({
  hero:      { paddingTop:52, paddingBottom:32, paddingHorizontal:22 },
  greeting:  { fontSize:13, color:'rgba(255,255,255,0.82)', fontWeight:'600', marginBottom:6 },
  heroTitle: { fontSize:28, fontWeight:'900', color:C.white, lineHeight:35, marginBottom:10 },
  heroSub:   { fontSize:13, color:'rgba(255,255,255,0.82)', lineHeight:19 },

  quickSection: { backgroundColor:C.white, padding:18, borderBottomWidth:1, borderBottomColor:C.border },
  cap:          { fontSize:10, fontWeight:'800', color:C.text3, letterSpacing:2, marginBottom:12 },
  quickGrid:    { flexDirection:'row', justifyContent:'space-between' },
  quickBtn:     { alignItems:'center', gap:6, width:(width-36)/6 },
  quickIcon:    { width:46, height:46, borderRadius:14, justifyContent:'center', alignItems:'center' },
  quickLabel:   { fontSize:10, color:C.text3, fontWeight:'700' },

  section:      { padding:20, backgroundColor:C.bg },
  sectionTitle: { fontSize:20, fontWeight:'900', color:C.text, marginBottom:16 },
  featGrid:     { gap:10 },
  featCard:     { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:C.white, borderRadius:16, padding:16, borderLeftWidth:4, borderWidth:1, borderColor:C.border, ...SHADOW.xs },
  featIconWrap: { width:44, height:44, borderRadius:12, justifyContent:'center', alignItems:'center', flexShrink:0 },
  featTitle:    { fontSize:14, fontWeight:'800', color:C.text, marginBottom:3 },
  featDesc:     { fontSize:12, color:C.text3, lineHeight:17 },

  howSection:  { backgroundColor:C.white, margin:16, borderRadius:20, padding:20, borderWidth:1, borderColor:C.border, ...SHADOW.sm },
  stepRow:     { flexDirection:'row', alignItems:'flex-start', marginBottom:18 },
  stepNum:     { width:28, height:28, borderRadius:9, backgroundColor:C.xlight, justifyContent:'center', alignItems:'center', marginRight:12, borderWidth:1, borderColor:C.light },
  stepNumTxt:  { fontSize:12, fontWeight:'900', color:C.primary },
  stepTitle:   { fontSize:14, fontWeight:'700', color:C.text, marginBottom:2 },
  stepSub:     { fontSize:12, color:C.text3 },

  researchCard:   { margin:16, backgroundColor:C.xlight, borderRadius:18, padding:18, borderWidth:1, borderColor:C.light },
  researchHeader: { flexDirection:'row', alignItems:'center', gap:8, marginBottom:10 },
  researchTitle:  { fontSize:15, fontWeight:'800', color:C.primary },
  researchDesc:   { fontSize:13, color:C.text2, lineHeight:20, marginBottom:12 },
  researchTags:   { flexDirection:'row', flexWrap:'wrap', gap:8 },
  researchTag:    { backgroundColor:C.white, borderRadius:20, paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:C.border },
  researchTagTxt: { fontSize:11, fontWeight:'700', color:C.text3 },
});