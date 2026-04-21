// src/screens/DiseaseResultScreen.js — Premium v4
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C, SHADOW, T } from '../components/theme';

const { width } = Dimensions.get('window');

const CONFIG = {
  healthy:     { color:C.success, icon:'checkmark-circle', label:'Healthy',     bg:'rgba(76,175,80,0.10)' },
  leaf_blight: { color:C.warning, icon:'warning',          label:'Leaf Blight', bg:'rgba(255,143,0,0.10)' },
  slow_wilt:   { color:C.error,   icon:'alert-circle',     label:'Slow Wilt',   bg:'rgba(239,83,80,0.10)' },
};

export default function DiseaseResultScreen({ route, navigation }) {
  const { image, disease, confidence, treatment, description, probabilities, lowConfidence } = route.params ?? {};
  const key = (disease ?? '').toLowerCase().replace(/\s+/g,'_');
  const cfg = CONFIG[key] ?? { color:C.text3, icon:'help-circle', label:disease, bg:C.bg2 };

  const probs = probabilities ?? {};
  const maxProb = Math.max(1, ...Object.values(probs));

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false}>
      {/* Image */}
      {image && (
        <View style={s.imageWrap}>
          <Image source={{uri:image}} style={s.image} resizeMode="cover" />
          <LinearGradient colors={['transparent','rgba(8,15,5,0.9)']} style={s.imageOverlay} />
          <View style={s.imageBadge}>
            <Ionicons name={cfg.icon} size={20} color={cfg.color} style={{marginRight:6}} />
            <Text style={[s.imageBadgeTxt, {color:cfg.color}]}>{cfg.label}</Text>
          </View>
        </View>
      )}

      <View style={s.body}>
        {/* Result card */}
        <View style={[s.resultCard, {backgroundColor:cfg.bg, borderColor:cfg.color+'30'}]}>
          <View style={s.resultTop}>
            <Ionicons name={cfg.icon} size={32} color={cfg.color} />
            <View style={{flex:1, marginLeft:12}}>
              <Text style={s.resultCap}>DETECTION RESULT</Text>
              <Text style={[s.resultLabel, {color:cfg.color}]}>{cfg.label}</Text>
            </View>
            <View style={[s.confBadge, {borderColor:cfg.color+'40'}]}>
              <Text style={[s.confPct, {color:cfg.color}]}>{Number(confidence ?? 0).toFixed(1)}%</Text>
              <Text style={s.confLbl}>confidence</Text>
            </View>
          </View>

          {lowConfidence && (
            <View style={s.lowConfWarn}>
              <Ionicons name="warning-outline" size={14} color={C.warning} style={{marginRight:6}} />
              <Text style={s.lowConfTxt}>Low confidence — try a clearer, better-lit photo</Text>
            </View>
          )}
        </View>

        {/* Probabilities */}
        {Object.keys(probs).length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Model Probabilities</Text>
            {Object.entries(probs).sort((a,b)=>b[1]-a[1]).map(([k,v]) => {
              const pct = ((v/maxProb)*100).toFixed(0);
              const c2 = CONFIG[k.toLowerCase().replace(/\s+/g,'_')]?.color ?? C.text3;
              return (
                <View key={k} style={s.probRow}>
                  <Text style={s.probLabel} numberOfLines={1}>{k.replace(/_/g,' ')}</Text>
                  <View style={s.probTrack}>
                    <View style={[s.probFill, {width:`${pct}%`, backgroundColor:c2}]} />
                  </View>
                  <Text style={[s.probPct, {color:c2}]}>{Number(v).toFixed(1)}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Description */}
        {!!description && (
          <View style={s.card}>
            <Text style={s.cardTitle}>About this condition</Text>
            <Text style={s.cardBody}>{description}</Text>
          </View>
        )}

        {/* Treatment */}
        {!!treatment && (
          <View style={[s.card, {borderColor:cfg.color+'25'}]}>
            <View style={s.treatHeader}>
              <Ionicons name="medkit-outline" size={16} color={cfg.color} style={{marginRight:8}} />
              <Text style={[s.cardTitle, {color:cfg.color}]}>Recommended Treatment</Text>
            </View>
            <Text style={s.cardBody}>{treatment}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('DiseaseUpload')} activeOpacity={0.85}>
            <LinearGradient colors={['#B71C1C','#EF5350']} style={s.actionGrad}>
              <Ionicons name="camera-outline" size={16} color="#fff" style={{marginRight:6}} />
              <Text style={s.actionTxt}>Scan Again</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtnOutline} onPress={() => navigation.navigate('DiseaseHistory')} activeOpacity={0.8}>
            <Ionicons name="time-outline" size={16} color={C.text2} style={{marginRight:6}} />
            <Text style={s.actionOutlineTxt}>View History</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{height:32}} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex:1, backgroundColor:C.bg },

  imageWrap:    { height:260, position:'relative' },
  image:        { width:'100%', height:'100%' },
  imageOverlay: { position:'absolute', bottom:0, left:0, right:0, height:120 },
  imageBadge:   { position:'absolute', bottom:16, left:20, flexDirection:'row', alignItems:'center', backgroundColor:'rgba(8,15,5,0.7)', borderRadius:20, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:C.border },
  imageBadgeTxt:{ fontSize:14, fontWeight:'800' },

  body: { padding:20 },

  resultCard: { borderRadius:18, padding:18, marginBottom:14, borderWidth:1.5 },
  resultTop:  { flexDirection:'row', alignItems:'center' },
  resultCap:  { fontSize:9, fontWeight:'800', color:C.text3, letterSpacing:1.4, marginBottom:4 },
  resultLabel:{ fontSize:22, fontWeight:'900', letterSpacing:-0.4 },
  confBadge:  { alignItems:'center', borderWidth:1, borderRadius:14, paddingHorizontal:12, paddingVertical:8 },
  confPct:    { fontSize:20, fontWeight:'900' },
  confLbl:    { fontSize:9, color:C.text3, fontWeight:'600' },
  lowConfWarn:{ flexDirection:'row', alignItems:'center', marginTop:12, backgroundColor:'rgba(255,143,0,0.10)', borderRadius:10, padding:10 },
  lowConfTxt: { fontSize:12, color:C.warning, flex:1 },

  card:      { backgroundColor:C.bg2, borderRadius:18, padding:18, marginBottom:12, borderWidth:1, borderColor:C.border, ...SHADOW.sm },
  cardTitle: { fontSize:14, fontWeight:'800', color:C.text, marginBottom:12 },
  cardBody:  { fontSize:13, color:C.text3, lineHeight:21 },

  probRow:   { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  probLabel: { width:100, fontSize:12, color:C.text2, fontWeight:'600' },
  probTrack: { flex:1, height:8, backgroundColor:C.bg3, borderRadius:4, overflow:'hidden' },
  probFill:  { height:8, borderRadius:4 },
  probPct:   { width:42, fontSize:12, fontWeight:'800', textAlign:'right' },

  treatHeader: { flexDirection:'row', alignItems:'center', marginBottom:10 },

  actionsRow:      { flexDirection:'row', gap:12, marginTop:8 },
  actionBtn:       { flex:2, borderRadius:14, overflow:'hidden', ...SHADOW.md },
  actionGrad:      { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:15 },
  actionTxt:       { fontSize:15, fontWeight:'800', color:'#fff' },
  actionBtnOutline:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:C.bg2, borderRadius:14, borderWidth:1, borderColor:C.border },
  actionOutlineTxt:{ fontSize:14, fontWeight:'700', color:C.text2 },
});