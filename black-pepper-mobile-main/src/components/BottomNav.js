// src/components/BottomNav.js — Premium v4
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, SHADOW } from './theme';

const TABS = [
  { label:'Home',    icon:'home-outline',       iconOn:'home',            screen:'Home'                  },
  { label:'Soil',    icon:'leaf-outline',        iconOn:'leaf',            screen:'SoilAnalysis'          },
  { label:'Disease', icon:'bug-outline',         iconOn:'bug',             screen:'DiseaseIdentification' },
  { label:'Variety', icon:'scan-outline',        iconOn:'scan',            screen:'VarietyHub'            },
  { label:'Map',     icon:'map-outline',         iconOn:'map',             screen:'Dashboard'             },
];

export default function BottomNav({ navigation, active }) {
  return (
    <View style={s.bar}>
      {TABS.map(tab => {
        const on = tab.label === active || tab.screen === active;
        return (
          <TouchableOpacity
            key={tab.screen}
            style={s.tab}
            onPress={() => !on && navigation.navigate(tab.screen)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            {on && <View style={s.pill} />}
            <Ionicons name={on ? tab.iconOn : tab.icon} size={22} color={on ? C.lime : C.dim} />
            <Text style={[s.lbl, on && s.lblOn]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection:'row', backgroundColor:C.bg2,
    borderTopWidth:1, borderTopColor:C.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop:10,
    ...SHADOW.md,
  },
  tab:   { flex:1, alignItems:'center', justifyContent:'center', position:'relative' },
  pill:  { position:'absolute', top:-10, width:40, height:3, borderRadius:2, backgroundColor:C.lime },
  lbl:   { fontSize:10, fontWeight:'600', color:C.dim, marginTop:4 },
  lblOn: { color:C.lime, fontWeight:'700' },
});