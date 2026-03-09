// src/screens/VarietyHistoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, SHADOW } from '../components/theme';

const VARIETY_COLORS = {
  Butawerala:      '#2e7d32',
  Dingirala:       '#1565c0',
  Kohukuburerala:  '#6a1b9a',
};

export default function VarietyHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      AsyncStorage.getItem('variety_history').then((raw) => {
        if (active && raw) setHistory(JSON.parse(raw));
      }).catch(() => {});
      return () => { active = false; };
    }, [])
  );

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Delete all variety scan records? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All', style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('variety_history');
            setHistory([]);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const color = VARIETY_COLORS[item.result] ?? C.lime;
    return (
      <TouchableOpacity
        style={[s.card, { borderLeftColor: color }]}
        onPress={() => navigation.navigate('VarietyInfo', { variety: item.result })}
        activeOpacity={0.85}
      >
        <View style={s.cardRow}>
          {item.image
            ? <Image source={{ uri: item.image }} style={s.thumb} />
            : <View style={[s.thumbEmpty, { backgroundColor: color + '22' }]}><Text style={{ fontSize: 22 }}>🍃</Text></View>
          }
          <View style={{ flex: 1 }}>
            <Text style={[s.varietyName, { color }]}>{item.result ?? 'Unknown'}</Text>
            <Text style={s.confidence}>
              {item.confidence != null ? `Confidence: ${item.confidence}%` : ''}
            </Text>
            <Text style={s.date}>{item.savedAt}</Text>
          </View>
          <Text style={[s.arrow, { color }]}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={[C.bg0, C.bg2]} style={s.hero}>
        <Text style={s.heroTitle}>Scan History</Text>
        <Text style={s.heroSub}>{history.length} variety identification{history.length !== 1 ? 's' : ''} recorded</Text>
      </LinearGradient>

      {history.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🍃</Text>
          <Text style={s.emptyTitle}>No Scans Yet</Text>
          <Text style={s.emptySub}>Identified varieties will appear here after you use the Identify Variety screen.</Text>
          <TouchableOpacity
            style={s.scanBtn}
            onPress={() => navigation.navigate('VarietyIdentify')}
            activeOpacity={0.85}
          >
            <Text style={s.scanBtnTxt}>🔍  Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity style={s.clearBtn} onPress={clearHistory} activeOpacity={0.85}>
            <Text style={s.clearBtnTxt}>🗑️  Clear All History</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg1 },
  hero:   { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 22 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: C.white, marginBottom: 4 },
  heroSub:   { fontSize: 12, color: C.muted },
  list:   { padding: 16, paddingBottom: 80 },
  card:   { backgroundColor: C.bg3, borderRadius: 16, padding: 14, marginBottom: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: C.border, ...SHADOW.sm },
  cardRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb:      { width: 56, height: 56, borderRadius: 12 },
  thumbEmpty: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  varietyName:{ fontSize: 15, fontWeight: '800', marginBottom: 3 },
  confidence: { fontSize: 12, color: C.muted, marginBottom: 2 },
  date:       { fontSize: 11, color: C.dim },
  arrow:      { fontSize: 26, fontWeight: '300' },
  clearBtn:   { position: 'absolute', bottom: 24, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 28, backgroundColor: C.bg3, borderRadius: 99, borderWidth: 1, borderColor: '#7f1d1d' },
  clearBtnTxt:{ fontSize: 13, fontWeight: '700', color: '#fca5a5' },
  empty:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16, opacity: 0.4 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.white, marginBottom: 8 },
  emptySub:   { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24, maxWidth: 280 },
  scanBtn:    { backgroundColor: C.lime, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 },
  scanBtnTxt: { color: C.bg0, fontSize: 14, fontWeight: '800' },
});