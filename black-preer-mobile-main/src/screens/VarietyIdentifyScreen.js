// src/screens/VarietyIdentifyScreen.js — FIXED
// Fix 1: import path corrected to '../services/predict' (not '../api/predict')
// Fix 2: deprecated ImagePicker.MediaTypeOptions replaced with ['images']
// Fix 3: AsyncStorage key unified to 'variety_history' (matches VarietyHistoryScreen)
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, SHADOW } from '../components/theme';
import BottomNav from '../components/BottomNav';
import { predictImage } from '../api/predict'; // ✅ FIXED: correct path

export default function VarietyIdentifyScreen({ navigation }) {
  const [asset,   setAsset]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');

  const requestPermission = useCallback(async (type) => {
    const perm = type === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required',
        `${type === 'camera' ? 'Camera' : 'Gallery'} permission is required.`);
      return false;
    }
    return true;
  }, []);

  const pickFromGallery = useCallback(async () => {
    if (!(await requestPermission('gallery'))) return;
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],      // ✅ FIXED: deprecated option removed
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.length > 0) {
        setAsset(res.assets[0]);
        setResult(null);
        setError('');
      }
    } catch { Alert.alert('Error', 'Failed to open gallery.'); }
  }, [requestPermission]);

  const takePhoto = useCallback(async () => {
    if (!(await requestPermission('camera'))) return;
    try {
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],      // ✅ FIXED: deprecated option removed
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.length > 0) {
        setAsset(res.assets[0]);
        setResult(null);
        setError('');
      }
    } catch { Alert.alert('Error', 'Failed to open camera.'); }
  }, [requestPermission]);

  // ✅ FIXED: key is 'variety_history' — matches VarietyHistoryScreen
  const saveToHistory = useCallback(async (predictionData, uri) => {
    try {
      const existing = await AsyncStorage.getItem('variety_history');
      const history  = existing ? JSON.parse(existing) : [];
      const newItem  = {
        id:         Date.now().toString(),
        imageUri:   Platform.OS === 'web' && uri?.startsWith('blob:') ? null : uri,
        result:     predictionData.result,
        confidence: predictionData.confidence,
        stage:      predictionData.stage,
        timestamp:  new Date().toISOString(),
      };
      history.unshift(newItem);
      if (history.length > 50) history.splice(50); // keep max 50
      await AsyncStorage.setItem('variety_history', JSON.stringify(history));
    } catch (e) {
      console.warn('History save error:', e);
    }
  }, []);

  const handlePredict = useCallback(async () => {
    if (!asset) { setError('Please select an image first.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await predictImage(asset.uri);
      setResult(data);
      await saveToHistory(data, asset.uri);
      // Navigate to VarietyInfo with the result
      navigation.navigate('VarietyInfo', {
        variety: data.result,
        result:  data,
      });
    } catch (e) {
      console.warn('Prediction error:', e);
      setError('Prediction failed. Please check backend connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [asset, saveToHistory, navigation]);

  const handleReset = useCallback(() => {
    setAsset(null);
    setResult(null);
    setError('');
  }, []);

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* HERO */}
        <LinearGradient colors={[C.bg0, C.bg2, C.pine]} style={s.hero}>
          <View style={s.heroBadge}>
            <View style={s.heroBadgeDot} />
            <Text style={s.heroBadgeTxt}>🍃 AI VARIETY DETECTION</Text>
          </View>
          <Text style={s.heroTitle}>Identify Leaf Variety</Text>
          <Text style={s.heroSub}>
            Upload or capture a pepper leaf image.{'\n'}
            The AI classifies it as Butawerala, Dingirala, or Kohukuburerala.
          </Text>
        </LinearGradient>

        <View style={s.card}>
          {/* Picker buttons */}
          <Text style={s.cardTitle}>📸 Select Leaf Image</Text>
          <View style={s.pickerRow}>
            <TouchableOpacity style={s.pickerBtn} onPress={pickFromGallery} activeOpacity={0.82}>
              <View style={[s.pickerIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="images-outline" size={26} color={C.blue} />
              </View>
              <Text style={s.pickerBtnTxt}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.pickerBtn} onPress={takePhoto} activeOpacity={0.82}>
              <View style={[s.pickerIcon, { backgroundColor: C.xlight }]}>
                <Ionicons name="camera-outline" size={26} color={C.primary} />
              </View>
              <Text style={s.pickerBtnTxt}>Camera</Text>
            </TouchableOpacity>
          </View>

          {/* Preview */}
          {asset ? (
            <View style={s.previewWrap}>
              <Image source={{ uri: asset.uri }} style={s.preview} resizeMode="cover" />
              <TouchableOpacity style={s.clearBtn} onPress={handleReset}>
                <Ionicons name="close-circle" size={26} color={C.error} />
              </TouchableOpacity>
              <View style={s.selectedBadge}>
                <Ionicons name="checkmark-circle" size={13} color={C.success} />
                <Text style={s.selectedTxt}>Image selected</Text>
              </View>
            </View>
          ) : (
            <View style={s.emptyPreview}>
              <Ionicons name="leaf-outline" size={48} color={C.border2} />
              <Text style={s.emptyPreviewTxt}>No image selected</Text>
              <Text style={s.emptyPreviewHint}>Choose from gallery or take a photo</Text>
            </View>
          )}

          {/* Error */}
          {!!error && (
            <View style={s.errBox}>
              <Ionicons name="warning-outline" size={15} color={C.error} />
              <Text style={s.errTxt}>{error}</Text>
            </View>
          )}

          {/* Analyse button */}
          <TouchableOpacity
            style={[s.analyseBtn, (!asset || loading) && s.analyseBtnDisabled]}
            onPress={handlePredict}
            disabled={!asset || loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[C.lime, '#7ab84e']} style={s.analyseBtnGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading
                ? <ActivityIndicator color={C.bg0} />
                : <Text style={s.analyseBtnTxt}>🔍  Identify Variety</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          {loading && (
            <View style={s.loadingHint}>
              <ActivityIndicator size="small" color={C.primary} />
              <Text style={s.loadingTxt}>Processing leaf image…</Text>
            </View>
          )}
        </View>

        {/* History shortcut */}
        <TouchableOpacity style={s.historyBtn}
          onPress={() => navigation.navigate('VarietyHistory')} activeOpacity={0.85}>
          <Ionicons name="time-outline" size={18} color={C.primary} />
          <Text style={s.historyBtnTxt}>View Scan History</Text>
          <Ionicons name="chevron-forward" size={16} color={C.hint} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      <BottomNav navigation={navigation} active="Variety" />
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg1 },
  scroll: { paddingBottom: 16 },

  hero:          { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 22 },
  heroBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.lime + '18', borderWidth: 1, borderColor: C.lime + '35', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 14 },
  heroBadgeDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  heroBadgeTxt:  { fontSize: 10, color: C.lime, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle:     { fontSize: 28, fontWeight: '900', color: C.white, marginBottom: 8 },
  heroSub:       { fontSize: 12, color: C.sage, lineHeight: 20 },

  card:      { marginHorizontal: 16, backgroundColor: C.bg3, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, marginTop: 0, marginBottom: 14, ...SHADOW.md },
  cardTitle: { fontSize: 17, fontWeight: '800', color: C.white, marginBottom: 16 },

  pickerRow:    { flexDirection: 'row', gap: 12, marginBottom: 16 },
  pickerBtn:    { flex: 1, alignItems: 'center', backgroundColor: C.bg2, borderRadius: 16, paddingVertical: 16, borderWidth: 1, borderColor: C.border },
  pickerIcon:   { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  pickerBtnTxt: { fontSize: 13, fontWeight: '700', color: C.sage },

  previewWrap:   { position: 'relative', marginBottom: 16 },
  preview:       { width: '100%', height: 240, borderRadius: 14 },
  clearBtn:      { position: 'absolute', top: 8, right: 8, backgroundColor: C.bg3, borderRadius: 99 },
  selectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  selectedTxt:   { fontSize: 12, color: C.success, fontWeight: '600' },

  emptyPreview:    { height: 160, borderRadius: 14, backgroundColor: C.bg2, justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed', marginBottom: 16 },
  emptyPreviewTxt: { fontSize: 14, color: C.muted, fontWeight: '600' },
  emptyPreviewHint:{ fontSize: 12, color: C.dim },

  errBox:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#3b0f0f', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: C.error + '55' },
  errTxt:  { flex: 1, fontSize: 13, color: '#fca5a5', lineHeight: 18 },

  analyseBtn:         { borderRadius: 14, overflow: 'hidden', ...SHADOW.md },
  analyseBtnDisabled: { opacity: 0.5 },
  analyseBtnGrad:     { paddingVertical: 16, alignItems: 'center' },
  analyseBtnTxt:      { color: C.bg0, fontSize: 16, fontWeight: '800' },

  loadingHint: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 12 },
  loadingTxt:  { fontSize: 13, color: C.sage },

  historyBtn:    { marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.bg3, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  historyBtnTxt: { flex: 1, fontSize: 14, fontWeight: '700', color: C.white },
});