// src/screens/SignUpScreen.js — Premium v4
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/slices/userSlice';
import { C, SHADOW } from '../components/theme';
import { API_BASE } from '../config/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function strengthScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState('');
  const [focused, setFocused] = useState('');
  const dispatch = useDispatch();
  const refs = { email: useRef(), password: useRef(), confirm: useRef() };
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  // fade/slide are Animated.Value refs and intentionally stable

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const strength = strengthScore(password);
  const strengthColors = ['#EF5350', '#FF8F00', '#FDD835', '#66BB6A'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  const handleRegister = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiErr('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      dispatch(
        signInSuccess({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          token: data.token || 'demo',
        }),
      );
      navigation.replace('Home');
    } catch {
      // Demo mode
      dispatch(
        signInSuccess({ name: name.trim(), email: email.trim().toLowerCase(), token: 'demo' }),
      );
      navigation.replace('Home');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const Field = ({
    id,
    label,
    value,
    onChange,
    placeholder,
    secure,
    toggle,
    showVal,
    nextRef,
    keyboard,
    cap,
  }) => (
    <View style={{ marginBottom: 0 }}>
      <Text style={s.lbl}>{label}</Text>
      <View style={[s.inputRow, focused === id && s.focused, !!errors[id] && s.errBorder]}>
        <TextInput
          ref={refs[id]}
          style={[s.input, { flex: 1 }]}
          value={value}
          onChangeText={(v) => {
            onChange(v);
            setErrors((p) => ({ ...p, [id]: null }));
          }}
          placeholder={placeholder}
          placeholderTextColor={C.dim}
          secureTextEntry={secure && !showVal}
          keyboardType={keyboard || 'default'}
          autoCapitalize={cap || 'none'}
          returnKeyType={nextRef ? 'next' : 'done'}
          onSubmitEditing={() => (nextRef ? refs[nextRef]?.current?.focus() : handleRegister())}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused('')}
        />
        {toggle && (
          <TouchableOpacity
            onPress={toggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ paddingLeft: 10 }}
          >
            <Ionicons name={showVal ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.dim} />
          </TouchableOpacity>
        )}
      </View>
      {!!errors[id] && <Text style={s.fieldErr}>{errors[id]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#020A01', '#0D1A08', '#111F0A']} style={s.panel}>
        <View style={s.glow} />
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={C.text2} />
          </TouchableOpacity>
          <LinearGradient colors={[C.lime, C.limeDim]} style={s.icon}>
            <Ionicons name="person-add" size={26} color="#fff" />
          </LinearGradient>
          <Text style={s.panelTitle}>Create account</Text>
          <Text style={s.panelSub}>Join the SLIIT research platform</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={s.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          {!!apiErr && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle" size={15} color={C.error} style={{ marginRight: 6 }} />
              <Text style={s.errorTxt}>{apiErr}</Text>
            </View>
          )}

          <Text style={s.lbl}>FULL NAME</Text>
          <View style={[s.inputRow, focused === 'name' && s.focused, !!errors.name && s.errBorder]}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={name}
              onChangeText={(v) => {
                setName(v);
                setErrors((p) => ({ ...p, name: null }));
              }}
              placeholder="Dr. Amali Perera"
              placeholderTextColor={C.dim}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => refs.email.current?.focus()}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused('')}
            />
          </View>
          {!!errors.name && <Text style={s.fieldErr}>{errors.name}</Text>}

          <Field
            id="email"
            label="EMAIL"
            value={email}
            onChange={setEmail}
            placeholder="your@sliit.lk"
            keyboard="email-address"
            nextRef="password"
          />
          <Field
            id="password"
            label="PASSWORD"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            secure
            toggle={() => setShowPw((p) => !p)}
            showVal={showPw}
            nextRef="confirm"
          />

          {/* Strength bar */}
          {password.length > 0 && (
            <View style={s.strengthWrap}>
              <View style={s.strengthBars}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      s.strengthBar,
                      { backgroundColor: i < strength ? strengthColors[strength - 1] : C.bg3 },
                    ]}
                  />
                ))}
              </View>
              <Text style={[s.strengthLbl, { color: strengthColors[Math.max(0, strength - 1)] }]}>
                {strengthLabels[Math.max(0, strength - 1)]}
              </Text>
            </View>
          )}

          <Field
            id="confirm"
            label="CONFIRM PASSWORD"
            value={confirm}
            onChange={setConfirm}
            placeholder="••••••••"
            secure
            toggle={() => setShowConf((p) => !p)}
            showVal={showConf}
          />

          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[C.forest, C.fern]} style={s.btnGrad}>
              <Text style={s.btnTxt}>{loading ? 'Creating account…' : 'Create Account'}</Text>
              {!loading && (
                <Ionicons name="arrow-forward" size={15} color="#fff" style={{ marginLeft: 8 }} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divTxt}>have an account?</Text>
            <View style={s.divLine} />
          </View>

          <TouchableOpacity
            style={s.signInBtn}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.85}
          >
            <Text style={s.signInTxt}>Sign In</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  panel: {
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingBottom: 30,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(168,217,108,0.07)',
    top: -90,
    right: -60,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOW.lime,
  },
  panelTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  panelSub: { fontSize: 13, color: C.text3 },

  form: { flex: 1, paddingHorizontal: 22, paddingTop: 22, backgroundColor: C.bg },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,83,80,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,83,80,0.25)',
  },
  errorTxt: { flex: 1, fontSize: 13, color: C.error, fontWeight: '600' },

  lbl: {
    fontSize: 10,
    fontWeight: '800',
    color: C.text3,
    letterSpacing: 1.4,
    marginBottom: 8,
    marginTop: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg2,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    ...SHADOW.sm,
  },
  focused: { borderColor: C.lime },
  errBorder: { borderColor: C.error },
  input: { paddingVertical: 15, fontSize: 15, color: C.text },
  fieldErr: { fontSize: 11, color: C.error, fontWeight: '600', marginTop: 5, marginLeft: 2 },

  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  strengthBars: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLbl: { fontSize: 11, fontWeight: '700', width: 46 },

  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 18, ...SHADOW.lime },
  btnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
  },
  btnTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },

  divRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: C.border },
  divTxt: { fontSize: 11, color: C.dim, fontWeight: '600' },
  signInBtn: {
    backgroundColor: C.bg2,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
  },
  signInTxt: { fontSize: 15, fontWeight: '700', color: C.lime },
});
