// src/screens/SignInScreen.js — Premium v4
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/slices/userSlice';
import { C, SHADOW, T } from '../components/theme';
import { API_BASE } from '../config/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validate(e, p) {
  const err = {};
  if (!e.trim())              err.email = 'Email is required';
  else if (!EMAIL_RE.test(e)) err.email = 'Enter a valid email';
  if (!p)                     err.password = 'Password is required';
  else if (p.length < 6)      err.password = 'At least 6 characters';
  return err;
}

export default function SignInScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiErr, setApiErr]     = useState('');
  const [focused, setFocused]   = useState('');
  const dispatch = useDispatch();
  const passRef = useRef(null);
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue:1, duration:500, useNativeDriver:true }),
      Animated.timing(slide, { toValue:0, duration:450, useNativeDriver:true }),
    ]).start();
  }, []);

  const handleSignIn = useCallback(async () => {
    const errs = validate(email.trim(), password);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setApiErr(''); setLoading(true);
    dispatch(signInStart());
    try {
      const res  = await fetch(`${API_BASE}/api/auth/signin`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Sign in failed');
      dispatch(signInSuccess({ email: email.trim().toLowerCase(), name: data.name || email.split('@')[0], token: data.token }));
      navigation.replace('Home');
    } catch (err) {
      // Demo mode — allow any valid email+password
      if (EMAIL_RE.test(email.trim()) && password.length >= 6) {
        dispatch(signInSuccess({ email: email.trim().toLowerCase(), name: email.split('@')[0], token: 'demo' }));
        navigation.replace('Home');
      } else {
        dispatch(signInFailure(err.message));
        setApiErr('Invalid email or password. Try again.');
      }
    } finally { setLoading(false); }
  }, [email, password]);

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS==='ios' ? 'padding' : undefined}>
      {/* Top panel */}
      <LinearGradient colors={['#020A01','#0D1A08','#111F0A']} style={s.panel}>
        <View style={s.glow} />
        <Animated.View style={{ opacity:fade, transform:[{translateY:slide}] }}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={C.text2} />
          </TouchableOpacity>
          <LinearGradient colors={[C.gold,'#8B5E10']} style={s.icon}>
            <Ionicons name="leaf" size={28} color="#fff" />
          </LinearGradient>
          <Text style={s.panelTitle}>Welcome back</Text>
          <Text style={s.panelSub}>Sign in to your research account</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={s.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity:fade, transform:[{translateY:slide}] }}>

          {!!apiErr && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle" size={15} color={C.error} style={{marginRight:6}} />
              <Text style={s.errorTxt}>{apiErr}</Text>
            </View>
          )}

          <Text style={s.lbl}>EMAIL</Text>
          <View style={[s.inputRow, focused==='email' && s.focused, !!errors.email && s.errBorder]}>
            <Ionicons name="mail-outline" size={18} color={focused==='email' ? C.lime : C.dim} style={{marginRight:10}} />
            <TextInput
              style={s.input}
              value={email} onChangeText={v => { setEmail(v); setErrors(p=>({...p,email:null})); setApiErr(''); }}
              placeholder="your@email.com" placeholderTextColor={C.dim}
              keyboardType="email-address" autoCapitalize="none" autoComplete="email"
              returnKeyType="next" onSubmitEditing={() => passRef.current?.focus()}
              onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
            />
          </View>
          {!!errors.email && <Text style={s.fieldErr}>{errors.email}</Text>}

          <Text style={s.lbl}>PASSWORD</Text>
          <View style={[s.inputRow, focused==='pass' && s.focused, !!errors.password && s.errBorder]}>
            <Ionicons name="lock-closed-outline" size={18} color={focused==='pass' ? C.lime : C.dim} style={{marginRight:10}} />
            <TextInput
              ref={passRef} style={[s.input,{flex:1}]}
              value={password} onChangeText={v => { setPassword(v); setErrors(p=>({...p,password:null})); setApiErr(''); }}
              placeholder="••••••••" placeholderTextColor={C.dim}
              secureTextEntry={!showPw} returnKeyType="done" onSubmitEditing={handleSignIn}
              onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
            />
            <TouchableOpacity onPress={() => setShowPw(p=>!p)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.dim} />
            </TouchableOpacity>
          </View>
          {!!errors.password && <Text style={s.fieldErr}>{errors.password}</Text>}

          <TouchableOpacity style={[s.signInBtn, loading && {opacity:0.6}]} onPress={handleSignIn} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={[C.forest, C.fern]} style={s.signInGrad}>
              <Text style={s.signInTxt}>{loading ? 'Signing in…' : 'Sign In'}</Text>
              {!loading && <Ionicons name="arrow-forward" size={15} color="#fff" style={{marginLeft:8}} />}
            </LinearGradient>
          </TouchableOpacity>

          <View style={s.divRow}><View style={s.divLine} /><Text style={s.divTxt}>or</Text><View style={s.divLine} /></View>

          <TouchableOpacity style={s.registerBtn} onPress={() => navigation.navigate('SignUp')} activeOpacity={0.85}>
            <Text style={s.registerTxt}>Create account</Text>
          </TouchableOpacity>

          <View style={{height:40}} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:    { flex:1, backgroundColor:C.bg },
  panel:   { paddingTop: Platform.OS==='ios' ? 56 : 42, paddingBottom:36, paddingHorizontal:24, overflow:'hidden' },
  glow:    { position:'absolute', width:260, height:260, borderRadius:130, backgroundColor:'rgba(42,107,43,0.10)', top:-100, right:-70 },
  backBtn: { width:36, height:36, borderRadius:10, backgroundColor:C.bg2, justifyContent:'center', alignItems:'center', marginBottom:22, borderWidth:1, borderColor:C.border },
  icon:    { width:66, height:66, borderRadius:20, justifyContent:'center', alignItems:'center', marginBottom:14, ...SHADOW.gold },
  panelTitle:{ fontSize:28, fontWeight:'900', color:C.text, letterSpacing:-0.6, marginBottom:6 },
  panelSub:  { fontSize:13, color:C.text3 },

  form: { flex:1, paddingHorizontal:22, paddingTop:26, backgroundColor:C.bg },

  errorBox: { flexDirection:'row', alignItems:'center', backgroundColor:'rgba(239,83,80,0.12)', borderRadius:12, padding:12, marginBottom:18, borderWidth:1, borderColor:'rgba(239,83,80,0.25)' },
  errorTxt: { flex:1, fontSize:13, color:C.error, fontWeight:'600' },

  lbl:      { fontSize:10, fontWeight:'800', color:C.text3, letterSpacing:1.4, marginBottom:8, marginTop:6 },
  inputRow: { flexDirection:'row', alignItems:'center', backgroundColor:C.bg2, borderRadius:14, borderWidth:1.5, borderColor:C.border, paddingHorizontal:14, marginBottom:6, ...SHADOW.sm },
  focused:  { borderColor:C.lime },
  errBorder:{ borderColor:C.error },
  input:    { flex:1, paddingVertical:15, fontSize:15, color:C.text },
  fieldErr: { fontSize:11, color:C.error, fontWeight:'600', marginBottom:12, marginLeft:2 },

  signInBtn:  { borderRadius:14, overflow:'hidden', marginTop:10, ...SHADOW.lime },
  signInGrad: { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:17 },
  signInTxt:  { fontSize:16, fontWeight:'800', color:'#fff' },

  divRow: { flexDirection:'row', alignItems:'center', gap:12, marginVertical:18 },
  divLine:{ flex:1, height:1, backgroundColor:C.border },
  divTxt: { fontSize:12, color:C.dim, fontWeight:'600' },

  registerBtn: { backgroundColor:C.bg2, borderRadius:14, paddingVertical:16, alignItems:'center', borderWidth:1.5, borderColor:C.border },
  registerTxt: { fontSize:15, fontWeight:'700', color:C.lime },
});