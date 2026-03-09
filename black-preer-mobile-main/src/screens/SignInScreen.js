// src/screens/SignInScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SHADOW } from '../components/theme';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/userSlice';

export default function SignInScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(30)).current;
  const dispatch = useDispatch();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue:1, duration:600, useNativeDriver:true }),
      Animated.timing(rise, { toValue:0, duration:600, useNativeDriver:true }),
    ]).start();
  }, []);

  const signIn = () => {
    if (!email || !password) { Alert.alert('Missing fields', 'Enter your email and password.'); return; }
    setLoading(true);
    setTimeout(() => {
      dispatch(setUser({ email, name: email.split('@')[0] }));
      setLoading(false);
      navigation.replace('Home');
    }, 900);
  };

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined}>
      <LinearGradient colors={[C.bg0, C.bg1, C.bg2]} style={{ flex:1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Animated.View style={[s.top, { opacity:fade, transform:[{ translateY:rise }] }]}>
            <View style={s.topIcon}><Text style={{ fontSize:40 }}>🌿</Text></View>
            <Text style={s.topTitle}>Welcome Back</Text>
            <Text style={s.topSub}>Sign in to your Black Pepper AI account</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View style={[s.card, { opacity:fade, transform:[{ translateY:rise }] }]}>

            {/* Email */}
            <Text style={s.label}>Email Address</Text>
            <View style={s.inputRow}>
              <Text style={s.inputIcon}>✉️</Text>
              <TextInput
                style={s.input} value={email} onChangeText={setEmail}
                placeholder="you@example.com" placeholderTextColor={C.dim}
                keyboardType="email-address" autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Text style={[s.label, { marginTop:18 }]}>Password</Text>
            <View style={s.inputRow}>
              <Text style={s.inputIcon}>🔑</Text>
              <TextInput
                style={s.input} value={password} onChangeText={setPassword}
                placeholder="••••••••" placeholderTextColor={C.dim} secureTextEntry
              />
            </View>
            <TouchableOpacity style={s.forgotRow}>
              <Text style={s.forgotTxt}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In */}
            <TouchableOpacity style={[s.btn, loading && { opacity:0.6 }]} onPress={signIn} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={[C.lime, '#8fd628']} style={s.btnInner} start={{ x:0,y:0 }} end={{ x:1,y:0 }}>
                <Text style={s.btnTxt}>{loading ? 'Signing in…' : 'Sign In  →'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.divLine} /><Text style={s.divTxt}>or</Text><View style={s.divLine} />
            </View>

            {/* Guest */}
            <TouchableOpacity style={s.guestBtn} onPress={() => navigation.replace('Home')} activeOpacity={0.8}>
              <Text style={s.guestTxt}>Continue as Guest</Text>
            </TouchableOpacity>

            {/* Register — navigates to SignUp screen */}
            <View style={s.registerRow}>
              <Text style={s.registerTxt}>No account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.75}>
                <Text style={s.registerLink}>Register free →</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Features */}
          <Animated.View style={[s.feats, { opacity:fade }]}>
            {[
              '✓  Access all 7 modules including Disease & Variety detection',
              '✓  Save soil analysis & disease detection history',
              '✓  Auto-refresh IoT sensor monitoring',
              '✓  Export fertilizer recommendation reports',
            ].map(f => (
              <Text key={f} style={s.featTxt}>{f}</Text>
            ))}
          </Animated.View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll:       { flexGrow:1, paddingBottom:40 },
  top:          { alignItems:'center', paddingTop:56, paddingBottom:10, paddingHorizontal:28 },
  topIcon:      { width:80, height:80, borderRadius:24, backgroundColor:C.pine, justifyContent:'center', alignItems:'center', marginBottom:18, borderWidth:1, borderColor:C.border, ...SHADOW.md },
  topTitle:     { fontSize:30, fontWeight:'900', color:C.white, marginBottom:8 },
  topSub:       { fontSize:14, color:C.muted, textAlign:'center' },
  card:         { backgroundColor:'rgba(255,255,255,0.04)', marginHorizontal:20, borderRadius:26, padding:26, marginTop:22, borderWidth:1, borderColor:C.border, ...SHADOW.md },
  label:        { fontSize:12, fontWeight:'700', color:C.muted, marginBottom:8, letterSpacing:0.5 },
  inputRow:     { flexDirection:'row', alignItems:'center', backgroundColor:C.bg0+'cc', borderRadius:14, borderWidth:1, borderColor:C.border, paddingHorizontal:14, gap:8 },
  inputIcon:    { fontSize:16 },
  input:        { flex:1, paddingVertical:14, fontSize:15, color:C.white },
  forgotRow:    { alignSelf:'flex-end', marginTop:10, marginBottom:4 },
  forgotTxt:    { fontSize:12, color:C.lime, fontWeight:'600' },
  btn:          { marginTop:20, borderRadius:16, overflow:'hidden', ...SHADOW.md },
  btnInner:     { paddingVertical:16, alignItems:'center' },
  btnTxt:       { color:C.bg0, fontSize:16, fontWeight:'900' },
  divider:      { flexDirection:'row', alignItems:'center', gap:10, marginVertical:20 },
  divLine:      { flex:1, height:1, backgroundColor:C.border },
  divTxt:       { fontSize:12, color:C.dim },
  guestBtn:     { paddingVertical:14, borderRadius:16, borderWidth:1, borderColor:C.border, alignItems:'center', marginBottom:18 },
  guestTxt:     { color:C.muted, fontSize:14, fontWeight:'600' },
  registerRow:  { flexDirection:'row', justifyContent:'center', alignItems:'center' },
  registerTxt:  { fontSize:13, color:C.dim },
  registerLink: { fontSize:13, color:C.lime, fontWeight:'700' },
  feats:        { marginHorizontal:20, marginTop:24, padding:20, backgroundColor:'rgba(255,255,255,0.03)', borderRadius:20, borderWidth:1, borderColor:C.border, gap:10 },
  featTxt:      { fontSize:13, color:C.muted, lineHeight:20 },
});