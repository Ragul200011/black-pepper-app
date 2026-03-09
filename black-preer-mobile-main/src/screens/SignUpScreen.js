// src/screens/SignUpScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
  useWindowDimensions, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/userSlice';
import { C, SHADOW } from '../components/theme';

export default function SignUpScreen({ navigation }) {
  const [fullName,         setFullName]         = useState('');
  const [email,            setEmail]            = useState('');
  const [password,         setPassword]         = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [showPassword,     setShowPassword]     = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [nameFocused,      setNameFocused]      = useState(false);
  const [emailFocused,     setEmailFocused]     = useState(false);
  const [passFocused,      setPassFocused]      = useState(false);
  const [confirmFocused,   setConfirmFocused]   = useState(false);
  const [loading,          setLoading]          = useState(false);

  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const dispatch  = useDispatch();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue:1, duration:650, useNativeDriver:true }),
      Animated.timing(slideAnim, { toValue:0, duration:600, useNativeDriver:true }),
      Animated.spring(logoScale, { toValue:1, friction:6, tension:80, useNativeDriver:true }),
    ]).start();
  }, []);

  const handleSignUp = () => {
    if (!fullName.trim()) { Alert.alert('Missing name', 'Please enter your full name.'); return; }
    if (!email.trim())    { Alert.alert('Missing email', 'Please enter your email address.'); return; }
    if (password.length < 6) { Alert.alert('Weak password', 'Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { Alert.alert('Password mismatch', 'Passwords do not match.'); return; }

    setLoading(true);
    setTimeout(() => {
      dispatch(setUser({ email, name: fullName }));
      setLoading(false);
      navigation.replace('Home');
    }, 900);
  };

  const cardWidth = isLarge ? Math.min(480, width * 0.46) : Math.min(width - 40, 440);

  const FormContent = () => (
    <View>
      <View style={st.formHeader}>
        <Text style={st.formTitle}>Create account</Text>
        <Text style={st.formSubtitle}>Sign up to start using Black Pepper AI</Text>
      </View>

      {/* Full name */}
      <View style={st.fieldWrap}>
        <Text style={st.fieldLabel}>Full name</Text>
        <View style={[st.inputWrap, nameFocused && st.inputFocused]}>
          <View style={st.inputIconWrap}>
            <Ionicons name="person-outline" size={18} color={nameFocused ? C.lime : C.muted} />
          </View>
          <TextInput style={st.input} value={fullName} onChangeText={setFullName}
            placeholder="Enter your full name" placeholderTextColor={C.dim}
            autoCapitalize="words"
            onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)} />
        </View>
      </View>

      {/* Email */}
      <View style={st.fieldWrap}>
        <Text style={st.fieldLabel}>Email address</Text>
        <View style={[st.inputWrap, emailFocused && st.inputFocused]}>
          <View style={st.inputIconWrap}>
            <Ionicons name="mail-outline" size={18} color={emailFocused ? C.lime : C.muted} />
          </View>
          <TextInput style={st.input} value={email} onChangeText={setEmail}
            placeholder="you@example.com" placeholderTextColor={C.dim}
            keyboardType="email-address" autoCapitalize="none"
            onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} />
        </View>
      </View>

      {/* Password */}
      <View style={st.fieldWrap}>
        <Text style={st.fieldLabel}>Password</Text>
        <View style={[st.inputWrap, passFocused && st.inputFocused]}>
          <View style={st.inputIconWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={passFocused ? C.lime : C.muted} />
          </View>
          <TextInput style={[st.input, { flex:1 }]} value={password} onChangeText={setPassword}
            placeholder="Create a password (6+ chars)" placeholderTextColor={C.dim}
            secureTextEntry={!showPassword} autoCapitalize="none"
            onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)} />
          <TouchableOpacity style={st.eyeBtn} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={C.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password */}
      <View style={st.fieldWrap}>
        <Text style={st.fieldLabel}>Confirm password</Text>
        <View style={[st.inputWrap, confirmFocused && st.inputFocused]}>
          <View style={st.inputIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={18} color={confirmFocused ? C.lime : C.muted} />
          </View>
          <TextInput style={[st.input, { flex:1 }]} value={confirmPassword} onChangeText={setConfirmPassword}
            placeholder="Re-enter your password" placeholderTextColor={C.dim}
            secureTextEntry={!showConfirm} autoCapitalize="none"
            onFocus={() => setConfirmFocused(true)} onBlur={() => setConfirmFocused(false)} />
          <TouchableOpacity style={st.eyeBtn} onPress={() => setShowConfirm(!showConfirm)} activeOpacity={0.7}>
            <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color={C.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[st.submitBtn, loading && { opacity:0.6 }]}
        onPress={handleSignUp} disabled={loading} activeOpacity={0.85}
      >
        <LinearGradient colors={[C.lime, '#7ab84e']} start={{ x:0,y:0 }} end={{ x:1,y:0 }} style={st.submitGrad}>
          {loading
            ? <Text style={st.submitTxt}>Creating account…</Text>
            : <>
                <Text style={st.submitTxt}>Create Account</Text>
                <Ionicons name="person-add-outline" size={18} color={C.bg0} style={{ marginLeft:8 }} />
              </>
          }
        </LinearGradient>
      </TouchableOpacity>

      {/* Divider */}
      <View style={st.divider}>
        <View style={st.divLine} /><Text style={st.divTxt}>or continue with</Text><View style={st.divLine} />
      </View>

      {/* Guest */}
      <TouchableOpacity style={st.guestBtn} onPress={() => navigation.replace('Home')} activeOpacity={0.8}>
        <Ionicons name="person-outline" size={17} color={C.sage} style={{ marginRight:8 }} />
        <Text style={st.guestTxt}>Continue as Guest</Text>
      </TouchableOpacity>

      {/* Already have account */}
      <View style={st.signinRow}>
        <Text style={st.signinTxt}>Already have an account? </Text>
        <TouchableOpacity activeOpacity={0.75} onPress={() => navigation.navigate('SignIn')}>
          <Text style={st.signinLink}>Sign In →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{ flex:1 }}>
      <LinearGradient colors={[C.bg0, C.bg1, C.bg2]} style={{ flex:1 }}>
        {/* Decorative orbs */}
        <View style={[s.orb, { top:-100, right:-80,  width:280, height:280, backgroundColor:C.pine+'cc' }]} />
        <View style={[s.orb, { bottom:60, left:-100, width:200, height:200, backgroundColor:'#0a2a06cc' }]} />

        <ScrollView
          contentContainerStyle={[s.scroll, isLarge && s.scrollLarge]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLarge ? (
            <View style={s.desktopWrap}>
              {/* Left panel */}
              <Animated.View style={[s.leftPanel, { opacity:fadeAnim, transform:[{ translateY:slideAnim }] }]}>
                <Animated.View style={[s.logoCircle, { transform:[{ scale:logoScale }] }]}>
                  <Text style={{ fontSize:36 }}>🌿</Text>
                </Animated.View>
                <Text style={s.brandName}>Black Pepper AI</Text>
                <Text style={s.brandTagline}>
                  Create your account and access{'\n'}intelligent farming insights
                </Text>
                <View style={s.featureList}>
                  {[
                    { icon:'leaf-outline',              text:'Berry Quality & Disease Detection' },
                    { icon:'flask-outline',             text:'Live IoT Soil Monitoring'          },
                    { icon:'nutrition-outline',         text:'AI Fertilizer Recommendations'     },
                    { icon:'shield-checkmark-outline',  text:'Secure User Data Storage'          },
                  ].map(f => (
                    <View key={f.icon} style={s.featItem}>
                      <View style={s.featIconWrap}>
                        <Ionicons name={f.icon} size={15} color={C.lime} />
                      </View>
                      <Text style={s.featText}>{f.text}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>

              <View style={s.dividerV} />

              {/* Form */}
              <Animated.View style={[s.formCard, { width:cardWidth, opacity:fadeAnim, transform:[{ translateY:slideAnim }] }]}>
                <FormContent />
              </Animated.View>
            </View>
          ) : (
            <Animated.View style={[s.mobileWrap, { opacity:fadeAnim, transform:[{ translateY:slideAnim }] }]}>
              <View style={s.mobileBrand}>
                <Animated.View style={[s.logoCircle, { transform:[{ scale:logoScale }] }]}>
                  <Text style={{ fontSize:36 }}>🌿</Text>
                </Animated.View>
                <Text style={s.brandName}>Black Pepper AI</Text>
                <Text style={[s.brandTagline, { textAlign:'center', fontSize:13 }]}>
                  Create your account to access all 7 modules
                </Text>
              </View>
              <View style={[s.formCard, { width:cardWidth }]}>
                <FormContent />
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  orb:        { position:'absolute', borderRadius:999, opacity:0.5 },
  scroll:     { flexGrow:1, justifyContent:'center', alignItems:'center', paddingVertical:40, paddingHorizontal:20 },
  scrollLarge:{ paddingVertical:60, paddingHorizontal:40 },
  desktopWrap:{ flexDirection:'row', alignItems:'center', justifyContent:'center', width:'100%', maxWidth:940 },
  leftPanel:  { flex:1, maxWidth:360, alignItems:'flex-start', paddingRight:48, paddingVertical:20 },
  dividerV:   { width:1, height:540, backgroundColor:C.border, marginRight:48 },
  mobileWrap: { width:'100%', alignItems:'center' },
  mobileBrand:{ alignItems:'center', marginBottom:28 },
  logoCircle: { width:72, height:72, borderRadius:22, backgroundColor:C.pine, justifyContent:'center', alignItems:'center', marginBottom:16, borderWidth:1, borderColor:C.border, ...SHADOW.md },
  brandName:  { fontSize:22, fontWeight:'900', color:C.white, marginBottom:8, letterSpacing:-0.3 },
  brandTagline:{ fontSize:14, color:C.muted, lineHeight:22, marginBottom:28 },
  featureList:{ gap:14, marginBottom:32 },
  featItem:   { flexDirection:'row', alignItems:'center', gap:12 },
  featIconWrap:{ width:32, height:32, borderRadius:10, backgroundColor:C.lime+'18', borderWidth:1, borderColor:C.lime+'30', justifyContent:'center', alignItems:'center' },
  featText:   { fontSize:13, color:C.white, fontWeight:'600' },
  formCard:   { backgroundColor:'rgba(255,255,255,0.04)', borderRadius:26, padding:28, borderWidth:1, borderColor:C.border, ...SHADOW.md },
});

const st = StyleSheet.create({
  formHeader:   { marginBottom:24 },
  formTitle:    { fontSize:26, fontWeight:'900', color:C.white, marginBottom:5, letterSpacing:-0.3 },
  formSubtitle: { fontSize:13, color:C.muted, lineHeight:19 },
  fieldWrap:    { marginBottom:18 },
  fieldLabel:   { fontSize:12, fontWeight:'700', color:C.muted, marginBottom:7, letterSpacing:0.3 },
  inputWrap:    { flexDirection:'row', alignItems:'center', backgroundColor:C.bg0+'cc', borderWidth:1.5, borderColor:C.border, borderRadius:14, paddingHorizontal:14, height:52 },
  inputFocused: { borderColor:C.lime, backgroundColor:C.bg3 },
  inputIconWrap:{ marginRight:10 },
  input:        { flex:1, fontSize:15, color:C.white, paddingVertical:0 },
  eyeBtn:       { padding:4, marginLeft:8 },
  submitBtn:    { borderRadius:14, overflow:'hidden', marginTop:6, marginBottom:22, ...SHADOW.md },
  submitGrad:   { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:16 },
  submitTxt:    { color:C.bg0, fontSize:16, fontWeight:'900' },
  divider:      { flexDirection:'row', alignItems:'center', gap:10, marginBottom:16 },
  divLine:      { flex:1, height:1, backgroundColor:C.border },
  divTxt:       { fontSize:11, color:C.dim, fontWeight:'600' },
  guestBtn:     { flexDirection:'row', alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:C.border, borderRadius:14, paddingVertical:13, backgroundColor:C.bg3, marginBottom:20 },
  guestTxt:     { fontSize:14, color:C.sage, fontWeight:'700' },
  signinRow:    { flexDirection:'row', justifyContent:'center', alignItems:'center' },
  signinTxt:    { fontSize:13, color:C.dim },
  signinLink:   { fontSize:13, color:C.lime, fontWeight:'700' },
});