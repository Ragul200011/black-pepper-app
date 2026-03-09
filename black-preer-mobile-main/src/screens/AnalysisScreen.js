// src/screens/AnalysisScreen.js
// ─────────────────────────────────────────────────────────────────────────────
//  Black Pepper AI – Berry Analysis Screen
//  • Image capture from camera or gallery
//  • Full field validation with inline error messages
//  • Correct API URL via central config (no hardcoded localhost)
//  • Results: Quality Grade, Defect Detection, Curing Prediction, Assessment
//  • Matches dark forest-green design of the rest of the app
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BERRY_ANALYSIS_URL } from '../config/api';
import { C, SHADOW } from '../components/theme';

// ─── Validation rules ─────────────────────────────────────────────────────────
const DRYING_METHODS = ['Sun', 'Solar', 'Mechanical'];

const FIELD_RULES = {
  moisture_content: { label: 'Moisture Content', min: 0,   max: 100, required: false },
  temperature:      { label: 'Temperature',       min: 0,   max: 60,  required: false },
  humidity:         { label: 'Humidity',           min: 0,   max: 100, required: false },
  berry_size:       { label: 'Berry Size',         min: 1,   max: 15,  required: true  },
  target_moisture:  { label: 'Target Moisture',    min: 0,   max: 100, required: true  },
};

function validateField(key, value) {
  const rule = FIELD_RULES[key];
  if (!rule) return null;

  const trimmed = String(value ?? '').trim();

  if (rule.required && trimmed === '') {
    return `${rule.label} is required.`;
  }
  if (trimmed === '') return null; // optional empty → OK

  const num = parseFloat(trimmed);
  if (isNaN(num)) return `${rule.label} must be a number.`;
  if (num < rule.min) return `${rule.label} cannot be less than ${rule.min}.`;
  if (num > rule.max) return `${rule.label} cannot exceed ${rule.max}.`;
  return null;
}

function validateForm(imageUri, formData) {
  const errors = {};

  if (!imageUri) {
    errors.image = 'Please upload or capture a berry image.';
  }

  Object.keys(FIELD_RULES).forEach((key) => {
    const err = validateField(key, formData[key]);
    if (err) errors[key] = err;
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── Default form values ──────────────────────────────────────────────────────
const DEFAULT_FORM = {
  moisture_content: '',
  temperature:      '',
  humidity:         '',
  berry_size:       '4.5',
  drying_method:    'Sun',
  batch_id:         '',
  target_moisture:  '11.5',
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AnalysisScreen() {
  const [imageUri,  setImageUri]  = useState(null);
  const [formData,  setFormData]  = useState(DEFAULT_FORM);
  const [fieldErrs, setFieldErrs] = useState({});
  const [loading,   setLoading]   = useState(false);
  const [results,   setResults]   = useState(null);
  const [apiError,  setApiError]  = useState(null);

  // ── Image helpers ──────────────────────────────────────────────────────────
  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please grant photo library permission to select images.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.85,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
        setFieldErrs((e) => ({ ...e, image: null }));
        setApiError(null);
      }
    } catch {
      Alert.alert('Error', 'Failed to open image gallery. Please try again.');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please grant camera permission to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
        setFieldErrs((e) => ({ ...e, image: null }));
        setApiError(null);
      }
    } catch {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  }, []);

  // ── Field change ───────────────────────────────────────────────────────────
  const handleChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field as user types
    const err = validateField(name, value);
    setFieldErrs((prev) => ({ ...prev, [name]: err }));
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const { valid, errors } = validateForm(imageUri, formData);
    setFieldErrs(errors);

    if (!valid) {
      const messages = Object.values(errors).filter(Boolean).join('\n');
      Alert.alert('Please fix the following:', messages, [{ text: 'OK' }]);
      return;
    }

    setLoading(true);
    setApiError(null);
    setResults(null);

    try {
      const payload = new FormData();

      // Image
      const filename = imageUri.split('/').pop() || 'berry.jpg';
      const ext      = (/\.(\w+)$/.exec(filename) ?? [])[1] ?? 'jpeg';
      payload.append('image', {
        uri:  imageUri,
        name: filename,
        type: `image/${ext}`,
      });

      // Text fields (use defaults when optional fields are empty)
      payload.append('moisture_content', formData.moisture_content || '35.0');
      payload.append('temperature',      formData.temperature      || '32.0');
      payload.append('humidity',         formData.humidity         || '60.0');
      payload.append('berry_size',       formData.berry_size);
      payload.append('drying_method',    formData.drying_method);
      payload.append('batch_id',         formData.batch_id || `BATCH_${Date.now()}`);
      payload.append('target_moisture',  formData.target_moisture);

      const response = await axios.post(BERRY_ANALYSIS_URL, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      if (!response.data) throw new Error('Empty response from server.');
      setResults(response.data);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED' ? 'Request timed out. Check your server.' : null) ||
        (err.message?.includes('Network') ? 'Cannot reach server. Check backend is running.' : null) ||
        'Analysis failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, [imageUri, formData]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setImageUri(null);
    setFormData(DEFAULT_FORM);
    setFieldErrs({});
    setResults(null);
    setApiError(null);
  }, []);

  // ── Drying method cycle ────────────────────────────────────────────────────
  const cycleDryingMethod = useCallback(() => {
    const idx  = DRYING_METHODS.indexOf(formData.drying_method);
    const next = DRYING_METHODS[(idx + 1) % DRYING_METHODS.length];
    handleChange('drying_method', next);
  }, [formData.drying_method, handleChange]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[C.bg0, C.bg2, C.pine]}
          style={s.hero}
        >
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeTxt}>🫑 BERRY ANALYSIS</Text>
          </View>
          <Text style={s.heroTitle}>Berry Health &{'\n'}Post-Harvest Grading</Text>
          <Text style={s.heroSub}>
            Upload a berry image with environmental parameters for comprehensive AI analysis
          </Text>
        </LinearGradient>

        <View style={s.card}>
          <Text style={s.sectionTitle}>📸 Input Information</Text>

          {/* ── Image upload ── */}
          <Text style={s.label}>Berry Image <Text style={s.required}>*</Text></Text>
          <View style={s.imageButtons}>
            <TouchableOpacity style={s.imageBtn} onPress={pickImage} activeOpacity={0.85}>
              <Text style={s.imageBtnTxt}>📷 Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.imageBtn} onPress={takePhoto} activeOpacity={0.85}>
              <Text style={s.imageBtnTxt}>📸 Camera</Text>
            </TouchableOpacity>
          </View>
          {!!fieldErrs.image && <Text style={s.errorTxt}>{fieldErrs.image}</Text>}
          {imageUri && (
            <Image source={{ uri: imageUri }} style={s.previewImage} resizeMode="cover" />
          )}

          {/* ── Batch ID ── */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Batch ID <Text style={s.optional}>(optional)</Text></Text>
            <TextInput
              style={s.input}
              value={formData.batch_id}
              onChangeText={(v) => handleChange('batch_id', v)}
              placeholder="e.g. BATCH_001"
              placeholderTextColor="#aaa"
              returnKeyType="next"
              autoCapitalize="characters"
            />
          </View>

          {/* ── Moisture content ── */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Current Moisture Content (%) <Text style={s.optional}>(optional)</Text></Text>
            <TextInput
              style={[s.input, fieldErrs.moisture_content && s.inputError]}
              value={formData.moisture_content}
              onChangeText={(v) => handleChange('moisture_content', v)}
              placeholder="e.g. 35.0"
              placeholderTextColor="#aaa"
              keyboardType="decimal-pad"
              returnKeyType="next"
            />
            {fieldErrs.moisture_content
              ? <Text style={s.errorTxt}>{fieldErrs.moisture_content}</Text>
              : <Text style={s.helperTxt}>Optional — improves curing prediction accuracy</Text>
            }
          </View>

          {/* ── Temperature & Humidity ── */}
          <Text style={s.subTitle}>🌡️ Environmental Conditions</Text>
          <View style={s.row}>
            <View style={s.half}>
              <Text style={s.label}>Temperature (°C) <Text style={s.optional}>(opt.)</Text></Text>
              <TextInput
                style={[s.input, fieldErrs.temperature && s.inputError]}
                value={formData.temperature}
                onChangeText={(v) => handleChange('temperature', v)}
                placeholder="32.0"
                placeholderTextColor="#aaa"
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
              {!!fieldErrs.temperature && <Text style={s.errorTxt}>{fieldErrs.temperature}</Text>}
            </View>
            <View style={s.half}>
              <Text style={s.label}>Humidity (%) <Text style={s.optional}>(opt.)</Text></Text>
              <TextInput
                style={[s.input, fieldErrs.humidity && s.inputError]}
                value={formData.humidity}
                onChangeText={(v) => handleChange('humidity', v)}
                placeholder="60.0"
                placeholderTextColor="#aaa"
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
              {!!fieldErrs.humidity && <Text style={s.errorTxt}>{fieldErrs.humidity}</Text>}
            </View>
          </View>

          {/* ── Berry size & Drying method ── */}
          <View style={s.row}>
            <View style={s.half}>
              <Text style={s.label}>Berry Size (mm) <Text style={s.required}>*</Text></Text>
              <TextInput
                style={[s.input, fieldErrs.berry_size && s.inputError]}
                value={formData.berry_size}
                onChangeText={(v) => handleChange('berry_size', v)}
                placeholder="4.5"
                placeholderTextColor="#aaa"
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
              {!!fieldErrs.berry_size && <Text style={s.errorTxt}>{fieldErrs.berry_size}</Text>}
            </View>
            <View style={s.half}>
              <Text style={s.label}>Drying Method</Text>
              <TouchableOpacity style={s.pickerBtn} onPress={cycleDryingMethod} activeOpacity={0.8}>
                <Text style={s.pickerTxt}>{formData.drying_method} ▾</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Target moisture ── */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Target Moisture (%) <Text style={s.required}>*</Text></Text>
            <TextInput
              style={[s.input, fieldErrs.target_moisture && s.inputError]}
              value={formData.target_moisture}
              onChangeText={(v) => handleChange('target_moisture', v)}
              placeholder="11.5"
              placeholderTextColor="#aaa"
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
            {fieldErrs.target_moisture
              ? <Text style={s.errorTxt}>{fieldErrs.target_moisture}</Text>
              : <Text style={s.helperTxt}>Standard export: 11–12%</Text>
            }
          </View>

          {/* API error */}
          {!!apiError && (
            <View style={s.apiErrorBox}>
              <Text style={s.apiErrorTxt}>⚠️ {apiError}</Text>
            </View>
          )}

          {/* Buttons */}
          <TouchableOpacity
            style={[s.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Analyze berry"
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.submitBtnTxt}>🔍 Analyze Berry</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={s.resetBtn}
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Reset form"
          >
            <Text style={s.resetBtnTxt}>Reset Form</Text>
          </TouchableOpacity>
        </View>

        {/* ── Results ── */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>📊 Analysis Results</Text>

          {!results && !loading && (
            <View style={s.emptyResults}>
              <Text style={s.emptyEmoji}>📈</Text>
              <Text style={s.emptyTxt}>
                Upload an image and tap "Analyze Berry" to see results
              </Text>
            </View>
          )}

          {loading && (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="large" color={C.green} />
              <Text style={s.loadingTxt}>Processing berry image…</Text>
            </View>
          )}

          {results && (
            <View>
              {/* Quality */}
              <View style={[s.resultCard, s.qualityCard]}>
                <Text style={s.resultTitle}>⭐ Quality Grading</Text>
                <Text style={s.gradeText}>Grade {results.quality?.grade ?? '—'}</Text>
                <Text style={s.resultDesc}>{results.quality?.description}</Text>
                <View style={[
                  s.badge,
                  results.quality?.export_ready ? s.badgeGreen : s.badgeOrange,
                ]}>
                  <Text style={s.badgeTxt}>
                    {results.quality?.export_ready ? '✓ Export Ready' : '⚠ Not Export Ready'}
                  </Text>
                </View>
              </View>

              {/* Defects */}
              <View style={[s.resultCard, s.defectCard]}>
                <Text style={s.resultTitle}>🔍 Defect Detection</Text>
                <Text style={s.defectStatus}>
                  {results.defects?.is_defect_free
                    ? '✓ No Defects'
                    : `${results.defects?.count ?? 0} Defect(s) Found`}
                </Text>
                {results.defects?.detected?.length > 0 && (
                  <View style={s.tagRow}>
                    {results.defects.detected.map((d, i) => (
                      <View key={i} style={s.defectTag}>
                        <Text style={s.defectTagTxt}>{d}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Curing */}
              <View style={[s.resultCard, s.curingCard]}>
                <Text style={s.resultTitle}>⏱️ Curing Time Prediction</Text>
                <Text style={s.curingTime}>
                  {results.curing?.time_days != null
                    ? `${parseFloat(results.curing.time_days).toFixed(1)} Days`
                    : '—'}
                </Text>
                {results.curing?.completion_date && (
                  <Text style={s.resultDesc}>
                    Completion: {results.curing.completion_date}
                  </Text>
                )}
              </View>

              {/* Overall */}
              <View style={[s.resultCard, s.overallCard]}>
                <Text style={s.resultTitle}>📋 Overall Assessment</Text>
                <View style={[
                  s.badge,
                  results.overall?.export_ready ? s.badgeGreen : s.badgeBlue,
                ]}>
                  <Text style={s.badgeTxt}>
                    {results.overall?.export_ready
                      ? '✓ Ready for Export'
                      : '⚠ Not Ready for Export'}
                  </Text>
                </View>
                {results.overall?.recommendations?.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={s.recTitle}>Recommendations:</Text>
                    {results.overall.recommendations.map((r, i) => (
                      <Text key={i} style={s.recItem}>• {r}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg1 },

  hero: {
    paddingTop: 56, paddingBottom: 36, paddingHorizontal: 22,
  },
  heroBadge: {
    backgroundColor: C.lime + '18', borderWidth: 1, borderColor: C.lime + '35',
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, marginBottom: 14,
  },
  heroBadgeTxt: { fontSize: 10, color: C.lime, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle:    { fontSize: 28, fontWeight: '900', color: C.white, marginBottom: 8, lineHeight: 34 },
  heroSub:      { fontSize: 12, color: C.sage, lineHeight: 18 },

  card: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 22, padding: 20,
    marginTop: 0, marginBottom: 16, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2d5016', marginBottom: 18 },
  subTitle:     { fontSize: 15, fontWeight: '600', color: '#2d5016', marginTop: 16, marginBottom: 12 },
  label:        { fontSize: 13, fontWeight: '600', color: '#2d5016', marginBottom: 6 },
  required:     { color: '#c62828' },
  optional:     { color: '#aaa', fontWeight: '400' },
  helperTxt:    { fontSize: 11, color: '#999', marginTop: 4 },
  fieldWrap:    { marginBottom: 14 },
  row:          { flexDirection: 'row', gap: 12, marginBottom: 14 },
  half:         { flex: 1 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
    padding: 12, fontSize: 15, color: '#222', backgroundColor: '#fafafa',
  },
  inputError: { borderColor: '#c62828' },
  errorTxt:   { fontSize: 11, color: '#c62828', marginTop: 4 },

  imageButtons: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  imageBtn: {
    flex: 1, backgroundColor: C.pine, paddingVertical: 13,
    borderRadius: 12, alignItems: 'center',
  },
  imageBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  previewImage: { width: '100%', height: 220, borderRadius: 12, marginTop: 8, marginBottom: 8 },

  pickerBtn: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
    padding: 12, backgroundColor: '#fafafa',
  },
  pickerTxt:  { fontSize: 15, color: '#333' },

  apiErrorBox: {
    backgroundColor: '#fff0f0', borderWidth: 1, borderColor: '#f5c6cb',
    borderRadius: 12, padding: 14, marginBottom: 12,
  },
  apiErrorTxt: { fontSize: 13, color: '#c62828', lineHeight: 19 },

  submitBtn: {
    backgroundColor: C.pine, paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', marginBottom: 10, ...SHADOW.md,
  },
  submitBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resetBtn: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd',
  },
  resetBtnTxt: { color: '#666', fontSize: 15 },

  emptyResults: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji:   { fontSize: 56, marginBottom: 16, opacity: 0.4 },
  emptyTxt:     { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 21 },
  loadingWrap:  { alignItems: 'center', paddingVertical: 40 },
  loadingTxt:   { marginTop: 14, fontSize: 15, color: C.green },

  resultCard:    { padding: 16, borderRadius: 14, marginBottom: 14 },
  qualityCard:   { backgroundColor: '#e8f5e9', borderLeftWidth: 4, borderLeftColor: '#4caf50' },
  defectCard:    { backgroundColor: '#fff3e0', borderLeftWidth: 4, borderLeftColor: '#ff9800' },
  curingCard:    { backgroundColor: '#e3f2fd', borderLeftWidth: 4, borderLeftColor: '#2196f3' },
  overallCard:   { backgroundColor: '#f3e5f5', borderLeftWidth: 4, borderLeftColor: '#9c27b0' },
  resultTitle:   { fontSize: 15, fontWeight: '700', color: '#2d5016', marginBottom: 8 },
  gradeText:     { fontSize: 30, fontWeight: '800', color: '#4caf50', marginBottom: 4 },
  resultDesc:    { fontSize: 13, color: '#666', marginBottom: 8 },
  defectStatus:  { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  tagRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  defectTag:     { backgroundColor: '#f44336', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  defectTagTxt:  { color: '#fff', fontSize: 12, fontWeight: '600' },
  curingTime:    { fontSize: 28, fontWeight: '800', color: '#2196f3', marginBottom: 4 },

  badge:       { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginTop: 4 },
  badgeGreen:  { backgroundColor: '#4caf50' },
  badgeOrange: { backgroundColor: '#ff9800' },
  badgeBlue:   { backgroundColor: '#2196f3' },
  badgeTxt:    { color: '#fff', fontSize: 13, fontWeight: '700' },

  recTitle: { fontSize: 13, fontWeight: '700', color: '#2d5016', marginBottom: 6 },
  recItem:  { fontSize: 13, color: '#555', marginBottom: 4, lineHeight: 20 },
});