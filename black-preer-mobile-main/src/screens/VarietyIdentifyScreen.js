// src/screens/VarietyIdentifyScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { predictImage } from '../services/predict';
import { C, SHADOW } from '../components/theme';

export default function VarietyIdentifyScreen({ navigation }) {
  const [asset,   setAsset]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const pickFromGallery = useCallback(async () => {
    setWarning('');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is needed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) setAsset(result.assets[0]);
  }, []);

  const pickFromCamera = useCallback(async () => {
    setWarning('');
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) setAsset(result.assets[0]);
  }, []);

  const handleIdentify = useCallback(async () => {
    if (!asset) { setWarning('Please select or capture a leaf image first.'); return; }
    setLoading(true);
    setWarning('');
    try {
      const result = await predictImage(asset.uri);

      if (!result.accepted) {
        setWarning(result.error ?? 'Image was not accepted. Please upload a clear pepper leaf.');
        return;
      }

      // Save to history
      try {
        const existing = await AsyncStorage.getItem('variety_history');
        const history  = existing ? JSON.parse(existing) : [];
        history.unshift({
          id:         Date.now().toString(),
          image:      Platform.OS === 'web' && asset.uri?.startsWith('blob:') ? null : asset.uri,
          result:     result.result,
          confidence: result.confidence,
          savedAt:    new Date().toLocaleString(),
        });
        await AsyncStorage.setItem('variety_history', JSON.stringify(history.slice(0, 50)));
      } catch { /* history save failure is non-critical */ }

      navigation.navigate('VarietyInfo', { variety: result.result, result });
    } catch (e) {
      setWarning(e.message ?? 'Identification failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [asset, navigation]);

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <LinearGradient colors={[C.bg0, C.bg2, C.pine]} style={s.hero}>
        <View style={s.heroBadge}>
          <View style={s.dot} /><Text style={s.badgeTxt}>🔍 VARIETY IDENTIFICATION</Text>
        </View>
        <Text style={s.heroTitle}>Identify Variety</Text>
        <Text style={s.heroSub}>Upload a black pepper leaf image for AI-powered variety classification.</Text>
      </LinearGradient>

      <View style={s.card}>
        {/* Preview */}
        <View style={s.previewBox}>
          {asset?.uri
            ? <Image source={{ uri: asset.uri }} style={s.previewImg} resizeMode="cover" />
            : (
              <View style={s.emptyPreview}>
                <Text style={s.emptyIcon}>🍃</Text>
                <Text style={s.emptyTxt}>No image selected</Text>
              </View>
            )
          }
        </View>

        {/* Warning */}
        {!!warning && (
          <View style={s.warnBox}>
            <Text style={s.warnTxt}>⚠️ {warning}</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={s.btnRow}>
          <TouchableOpacity style={s.pickerBtn} onPress={pickFromCamera} activeOpacity={0.85}>
            <Text style={s.pickerBtnTxt}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.pickerBtn} onPress={pickFromGallery} activeOpacity={0.85}>
            <Text style={s.pickerBtnTxt}>🖼️ Gallery</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[s.identifyBtn, loading && { opacity: 0.6 }]}
          onPress={handleIdentify}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[C.lime, '#7ab84e']} style={s.identifyBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color={C.bg0} /> : <Text style={s.identifyBtnTxt}>🔍  Identify Variety</Text>}
          </LinearGradient>
        </TouchableOpacity>

        {/* Tips */}
        <View style={s.tipsBox}>
          <Text style={s.tipsTitle}>Tips for Best Results</Text>
          {['Use a clear, well-lit leaf image','Ensure the full leaf is visible','Simple background works best','Avoid blurry or dark photos'].map((t, i) => (
            <Text key={i} style={s.tipItem}>• {t}</Text>
          ))}
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg1 },
  scroll: { paddingBottom: 16 },
  hero:   { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 22 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.lime + '18', borderWidth: 1, borderColor: C.lime + '35', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 14 },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  badgeTxt:  { fontSize: 10, color: C.lime, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: C.white, marginBottom: 8 },
  heroSub:   { fontSize: 12, color: C.sage, lineHeight: 20 },
  card:       { marginHorizontal: 16, backgroundColor: C.bg3, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: C.border, ...SHADOW.md },
  previewBox: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: C.border },
  previewImg: { width: '100%', height: 240 },
  emptyPreview: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg2 },
  emptyIcon:  { fontSize: 48, marginBottom: 10, opacity: 0.4 },
  emptyTxt:   { fontSize: 13, color: C.muted },
  warnBox:    { backgroundColor: 'rgba(255,248,225,0.08)', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,224,130,0.3)' },
  warnTxt:    { fontSize: 12, color: C.amber, lineHeight: 18 },
  btnRow:     { flexDirection: 'row', gap: 12, marginBottom: 14 },
  pickerBtn:  { flex: 1, backgroundColor: C.pine, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  pickerBtnTxt: { color: C.white, fontWeight: '700', fontSize: 14 },
  identifyBtn:     { borderRadius: 14, overflow: 'hidden', marginBottom: 18, ...SHADOW.md },
  identifyBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  identifyBtnTxt:  { color: C.bg0, fontSize: 16, fontWeight: '800' },
  tipsBox:    { backgroundColor: C.bg2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  tipsTitle:  { fontSize: 13, fontWeight: '700', color: C.white, marginBottom: 8 },
  tipItem:    { fontSize: 12, color: C.muted, lineHeight: 20 },
});