// src/screens/VarietyInfoScreen.js  — Light Theme
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C, SHADOW } from '../components/theme';

const VARIETY_DATA = {
  Butawerala: {
    color:'#2E7D32', emoji:'🫑',
    origin:'Sri Lanka (Western Province)',
    yield:'High (4–6 kg dry pepper per vine/year)',
    climate:'Humid tropical, 22–32°C',
    soil:'Well-drained loamy soil, pH 5.5–7.0',
    traits:['Disease resistant','Bold berries','Strong vines','High yield'],
    desc:'The most widely cultivated black pepper variety in Sri Lanka. Butawerala is known for its bold, heavy berries and exceptional disease resistance, making it the preferred choice for commercial cultivation.',
    tips:['Space vines 2–3 m apart','Apply NPK 15-15-15 every 3 months','Harvest when 5–10% berries turn red','Prune after each harvest season'],
  },
  Dingirala: {
    color:'#1565C0', emoji:'🌿',
    origin:'Sri Lanka (Sabaragamuwa)',
    yield:'Medium (2–4 kg dry pepper per vine/year)',
    climate:'Tropical, 20–30°C',
    soil:'Rich organic soil, pH 5.8–6.8',
    traits:['High aroma','Early bearing','Medium berries','Pungent'],
    desc:'Dingirala is prized for its intense aroma and pungency. It reaches the bearing stage earlier than other varieties, making it suitable for farmers seeking faster returns.',
    tips:['Ideal for shaded cultivation','Mulch heavily to retain moisture','Harvest before full maturity for maximum aroma','Suitable for organic farming systems'],
  },
  Kohukuburerala: {
    color:'#6A1B9A', emoji:'🍃',
    origin:'Sri Lanka (Central Province)',
    yield:'High (5–7 kg dry pepper per vine/year)',
    climate:'Cooler tropical highlands, 18–28°C',
    soil:'Deep fertile soil, pH 5.5–6.5',
    traits:['Long spikes','High piperine','Heavy fruiting','Export quality'],
    desc:'Distinguished by its exceptionally long spikes carrying many berries. Kohukuburerala has high piperine content making it highly valued for export and pharmaceutical use.',
    tips:['Requires sturdy support poles','Water regularly during dry season','Apply potassium-rich fertilizer at flowering','Best suited for highland regions'],
  },
};

export default function VarietyInfoScreen({ route, navigation }) {
  const varietyName = route.params?.variety ?? 'Butawerala';
  const data        = VARIETY_DATA[varietyName] ?? VARIETY_DATA['Butawerala'];
  const result      = route.params?.result;

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Hero */}
      <LinearGradient colors={[data.color, data.color + 'CC', data.color + '44', C.bg]} style={s.hero}>
        <Text style={s.heroEmoji}>{data.emoji}</Text>
        <Text style={s.heroName}>{varietyName}</Text>
        <Text style={s.heroOrigin}><Ionicons name="location-outline" size={12}/> {data.origin}</Text>
        {result && (
          <View style={s.confBadge}>
            <Text style={s.confTxt}>AI Confidence: {result.confidence ?? '—'}%</Text>
          </View>
        )}
      </LinearGradient>

      <View style={s.content}>
        {/* Traits */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Key Traits</Text>
          <View style={s.traitRow}>
            {data.traits.map(tr => (
              <View key={tr} style={[s.traitBadge, { backgroundColor:data.color+'18', borderColor:data.color+'44' }]}>
                <Text style={[s.traitTxt, {color:data.color}]}>{tr}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Profile */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Profile</Text>
          <View style={s.profileCard}>
            {[
              { label:'Expected Yield', val:data.yield   },
              { label:'Climate',        val:data.climate  },
              { label:'Soil',           val:data.soil     },
            ].map(row => (
              <View key={row.label} style={s.profileRow}>
                <Text style={s.profileLabel}>{row.label}</Text>
                <Text style={s.profileVal}>{row.val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Description</Text>
          <View style={s.descCard}><Text style={s.descTxt}>{data.desc}</Text></View>
        </View>

        {/* Tips */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Cultivation Tips</Text>
          <View style={s.tipsCard}>
            {data.tips.map((tip, i) => (
              <View key={i} style={s.tipRow}>
                <View style={[s.tipDot, {backgroundColor:data.color}]} />
                <Text style={s.tipTxt}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={[s.actionBtn, {backgroundColor:data.color}]}
          onPress={() => navigation.navigate('VarietyIdentify')} activeOpacity={0.85}>
          <Ionicons name="camera-outline" size={18} color={C.white} />
          <Text style={s.actionBtnTxt}>Scan Another Leaf</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn}
          onPress={() => navigation.navigate('VarietyHistory')} activeOpacity={0.85}>
          <Ionicons name="time-outline" size={18} color={C.primary} />
          <Text style={s.secondaryBtnTxt}>View Scan History</Text>
        </TouchableOpacity>
      </View>
      <View style={{height:40}} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:   {flex:1,backgroundColor:C.bg},
  scroll: {paddingBottom:16},
  hero:   {paddingTop:60,paddingBottom:36,paddingHorizontal:22,alignItems:'center'},
  heroEmoji:   {fontSize:56,marginBottom:12},
  heroName:    {fontSize:28,fontWeight:'900',color:C.white,marginBottom:6},
  heroOrigin:  {fontSize:13,color:'rgba(255,255,255,0.8)'},
  confBadge:   {marginTop:14,backgroundColor:'rgba(255,255,255,0.25)',paddingHorizontal:16,paddingVertical:6,borderRadius:99},
  confTxt:     {fontSize:13,fontWeight:'700',color:C.white},
  content:     {paddingHorizontal:16},
  section:     {marginBottom:16},
  sectionTitle:{fontSize:16,fontWeight:'800',color:C.text,marginBottom:10},
  traitRow:    {flexDirection:'row',flexWrap:'wrap',gap:8},
  traitBadge:  {paddingHorizontal:12,paddingVertical:5,borderRadius:99,borderWidth:1},
  traitTxt:    {fontSize:12,fontWeight:'700'},
  profileCard: {backgroundColor:C.white,borderRadius:16,overflow:'hidden',borderWidth:1,borderColor:C.border,...SHADOW.xs},
  profileRow:  {padding:14,borderBottomWidth:1,borderBottomColor:C.divider},
  profileLabel:{fontSize:11,fontWeight:'700',color:C.text3,marginBottom:3},
  profileVal:  {fontSize:14,color:C.text},
  descCard:    {backgroundColor:C.white,borderRadius:16,padding:16,borderWidth:1,borderColor:C.border,...SHADOW.xs},
  descTxt:     {fontSize:14,color:C.text2,lineHeight:22},
  tipsCard:    {backgroundColor:C.white,borderRadius:16,padding:16,borderWidth:1,borderColor:C.border,gap:12,...SHADOW.xs},
  tipRow:      {flexDirection:'row',alignItems:'flex-start',gap:10},
  tipDot:      {width:8,height:8,borderRadius:4,marginTop:6,flexShrink:0},
  tipTxt:      {flex:1,fontSize:13,color:C.text2,lineHeight:20},
  actionBtn:   {flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8,borderRadius:14,paddingVertical:16,marginBottom:12,...SHADOW.md},
  actionBtnTxt:{color:C.white,fontSize:15,fontWeight:'800'},
  secondaryBtn:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8,paddingVertical:14,borderRadius:14,borderWidth:1.5,borderColor:C.border,backgroundColor:C.white},
  secondaryBtnTxt:{color:C.primary,fontSize:14,fontWeight:'700'},
});