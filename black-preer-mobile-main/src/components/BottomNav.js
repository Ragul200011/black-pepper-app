// src/components/BottomNav.js
// Shared bottom navigation bar — all main modules
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { C, SHADOW } from './theme';

const TABS = [
  { label:'Home',    emoji:'🏠', screen:'Home'                },
  { label:'Soil',    emoji:'🌱', screen:'SoilAnalysis'        },
  { label:'Disease', emoji:'🔬', screen:'DiseaseIdentification'},
  { label:'Variety', emoji:'🫑', screen:'VarietyHub'          },
  { label:'Map',     emoji:'🗺️', screen:'Dashboard'           },
];

export default function BottomNav({ navigation, active }) {
  return (
    <View style={s.bar}>
      {TABS.map(tab => {
        const isActive = tab.label === active || tab.screen === active;
        return (
          <TouchableOpacity
            key={tab.screen}
            style={s.tab}
            onPress={() => !isActive && navigation.navigate(tab.screen)}
            activeOpacity={0.75}
          >
            <Text style={[s.emoji, isActive && s.emojiActive]}>{tab.emoji}</Text>
            <Text style={[s.label, isActive && s.labelActive]}>{tab.label}</Text>
            {isActive && <View style={s.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection:'row',
    backgroundColor: C.bg2,
    borderTopWidth:1,
    borderTopColor: C.border,
    paddingBottom: Platform.OS==='ios' ? 24 : 10,
    paddingTop:8,
    paddingHorizontal:4,
    ...SHADOW.md,
  },
  tab:         { flex:1, alignItems:'center', gap:3, paddingVertical:4, position:'relative' },
  emoji:       { fontSize:20 },
  emojiActive: { transform:[{ scale:1.12 }] },
  label:       { fontSize:10, color:C.dim,  fontWeight:'600' },
  labelActive: { color:C.lime, fontWeight:'800' },
  activeDot:   { position:'absolute', top:0, width:4, height:4, borderRadius:2, backgroundColor:C.lime },
});