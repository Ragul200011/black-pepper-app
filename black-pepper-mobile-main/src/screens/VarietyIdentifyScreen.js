// src/screens/VarietyIdentifyScreen.js  — Light Theme, all fixes applied
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, SHADOW } from '../components/theme';
import BottomNav from '../components/BottomNav';
import { predictImage } from '../api/predict';

export default function VarietyIdentifyScreen({ navigation }) {
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestPermission = useCallback(async (type) => {
    const perm =
      type === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission Required',
        `${type === 'camera' ? 'Camera' : 'Gallery'} permission is required.`,
      );
      return false;
    }
    return true;
  }, []);

  const pickFromGallery = useCallback(async () => {
    if (!(await requestPermission('gallery'))) return;
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.length > 0) {
        setAsset(res.assets[0]);
        setError('');
      }
    } catch {
      Alert.alert('Error', 'Failed to open gallery.');
    }
  }, [requestPermission]);

  const takePhoto = useCallback(async () => {
    if (!(await requestPermission('camera'))) return;
    try {
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.length > 0) {
        setAsset(res.assets[0]);
        setError('');
      }
    } catch {
      Alert.alert('Error', 'Failed to open camera.');
    }
  }, [requestPermission]);

  const saveToHistory = useCallback(async (data, uri) => {
    try {
      const existing = await AsyncStorage.getItem('variety_history');
      const history = existing ? JSON.parse(existing) : [];
      history.unshift({
        id: Date.now().toString(),
        imageUri: Platform.OS === 'web' && uri?.startsWith('blob:') ? null : uri,
        result: data.result,
        confidence: data.confidence,
        stage: data.stage,
        timestamp: new Date().toISOString(),
      });
      if (history.length > 50) history.splice(50);
      await AsyncStorage.setItem('variety_history', JSON.stringify(history));
    } catch (e) {
      console.warn('History save error:', e);
    }
  }, []);

  const handlePredict = useCallback(async () => {
    if (!asset) {
      setError('Please select an image first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await predictImage(asset.uri);
      await saveToHistory(data, asset.uri);
      navigation.navigate('VarietyInfo', { variety: data.result, result: data });
    } catch (e) {
      console.warn('Prediction error:', e);
      setError('Prediction failed. Please check backend connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [asset, saveToHistory, navigation]);

  const handleReset = useCallback(() => {
    setAsset(null);
    setError('');
  }, []);

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <LinearGradient colors={[C.gradStart, C.gradMid, C.gradEnd]} style={s.hero}>
          <View style={s.heroBadge}>
            <View style={s.heroDot} />
            <Text style={s.heroBadgeTxt}>LEAF VARIETY DETECTION</Text>
          </View>
          <Text style={s.heroTitle}>Identify Leaf Variety</Text>
          <Text style={s.heroSub}>
            Upload or capture a pepper leaf image to identify the variety using AI.
          </Text>
        </LinearGradient>

        <View style={s.card}>
          <Text style={s.cardTitle}>Select Leaf Image</Text>
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
              <Ionicons name="leaf-outline" size={40} color={C.hint} />
              <Text style={s.emptyTxt}>No image selected</Text>
            </View>
          )}

          {!!error && (
            <View style={s.errBox}>
              <Ionicons name="warning-outline" size={15} color={C.error} />
              <Text style={s.errTxt}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.analyseBtn, (!asset || loading) && { opacity: 0.5 }]}
            onPress={handlePredict}
            disabled={!asset || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <>
                <ActivityIndicator color={C.white} size="small" />
                <Text style={s.analyseBtnTxt}> Analysing…</Text>
              </>
            ) : (
              <Text style={s.analyseBtnTxt}>🔍 Identify Variety</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>Tips for Best Results</Text>
          {[
            'Use a clear, well-lit close-up of a single leaf',
            'Ensure the full leaf is visible',
            'Avoid blurry or shadowed images',
          ].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={14} color={C.success} />
              <Text style={s.tipTxt}>{tip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={s.historyBtn}
          onPress={() => navigation.navigate('VarietyHistory')}
          activeOpacity={0.85}
        >
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
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 16 },
  hero: { paddingTop: 52, paddingBottom: 28, paddingHorizontal: 22 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.8)' },
  heroBadgeTxt: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  heroTitle: { fontSize: 26, fontWeight: '900', color: C.white, marginBottom: 6 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 18 },
  card: {
    margin: 16,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW.sm,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 16 },
  pickerRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  pickerBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  pickerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerBtnTxt: { fontSize: 13, fontWeight: '700', color: C.text2 },
  previewWrap: { position: 'relative', marginBottom: 16 },
  preview: { width: '100%', height: 240, borderRadius: 14 },
  clearBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: C.white, borderRadius: 99 },
  selectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  selectedTxt: { fontSize: 12, color: C.success, fontWeight: '600' },
  emptyPreview: {
    height: 160,
    borderRadius: 14,
    backgroundColor: C.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  emptyTxt: { fontSize: 13, color: C.hint },
  errBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.error + '33',
  },
  errTxt: { flex: 1, fontSize: 13, color: C.error, lineHeight: 18 },
  analyseBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    ...SHADOW.md,
  },
  analyseBtnTxt: { color: C.white, fontSize: 16, fontWeight: '800' },
  tipsCard: {
    marginHorizontal: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.light,
    marginBottom: 12,
  },
  tipsTitle: { fontSize: 13, fontWeight: '800', color: C.primary, marginBottom: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  tipTxt: { flex: 1, fontSize: 12, color: C.text2, lineHeight: 18 },
  historyBtn: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW.xs,
  },
  historyBtnTxt: { flex: 1, fontSize: 14, fontWeight: '700', color: C.text },
});
