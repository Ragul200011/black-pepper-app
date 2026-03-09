// src/navigation/AppNavigator.js
// ─────────────────────────────────────────────────────────────────────────────
//  Black Pepper AI – Root Navigator (Full)
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../components/theme';

import LandingScreen               from '../screens/LandingScreen';
import SignInScreen                from '../screens/SignInScreen';
import SignUpScreen                from '../screens/SignUpScreen';
import HomeScreen                  from '../screens/HomeScreen';
import AnalysisScreen              from '../screens/AnalysisScreen';
import SoilAnalysisScreen          from '../screens/SoilAnalysisScreen';
import FertilizerScreen            from '../screens/FertilizerScreen';
import DashboardScreen             from '../screens/DashboardScreen';
import WeatherScreen               from '../screens/WeatherScreen';
import DiseaseIdentificationScreen from '../screens/DiseaseIdentificationScreen';
import DiseaseUploadScreen         from '../screens/DiseaseUploadScreen';
import DiseaseResultScreen         from '../screens/DiseaseResultScreen';
import DiseaseHistoryScreen        from '../screens/DiseaseHistoryScreen';
import VarietyHubScreen            from '../screens/VarietyHubScreen';
import VarietyIdentifyScreen       from '../screens/VarietyIdentifyScreen';
import VarietyInfoScreen           from '../screens/VarietyInfoScreen';
import VarietyHistoryScreen        from '../screens/VarietyHistoryScreen';

const Stack = createNativeStackNavigator();

const ICON = {
  Landing:'leaf-outline', SignIn:'person-outline', SignUp:'person-add-outline',
  Home:'home-outline', Analysis:'stats-chart-outline', SoilAnalysis:'flask-outline',
  Fertilizer:'nutrition-outline', Dashboard:'grid-outline', Weather:'partly-sunny-outline',
  DiseaseIdentification:'bug-outline', DiseaseUpload:'cloud-upload-outline',
  DiseaseResult:'checkmark-circle-outline', DiseaseHistory:'document-text-outline',
  VarietyHub:'leaf-outline', VarietyIdentify:'scan-outline',
  VarietyInfo:'information-circle-outline', VarietyHistory:'time-outline',
};

function BackBtn({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={nb.back} activeOpacity={0.75}
      hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
      <Ionicons name="chevron-back" size={20} color="#fff" />
    </TouchableOpacity>
  );
}

function HeaderTitle({ title, screenName }) {
  const icon = ICON[screenName] ?? 'ellipse-outline';
  return (
    <LinearGradient colors={[C.bg0, C.bg2, C.pine]} start={{ x:0,y:0 }} end={{ x:1,y:1 }} style={nb.grad}>
      <View style={nb.circle1} /><View style={nb.circle2} />
      <View style={nb.row}>
        <View style={nb.iconWrap}>
          <Ionicons name={icon} size={18} color="#fff" />
        </View>
        <View style={{ flex:1 }}>
          <Text style={nb.title} numberOfLines={1}>{title}</Text>
          <View style={nb.pill}>
            <View style={nb.pillDot} />
            <Text style={nb.pillTxt}>Black Pepper AI</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const headerShadow = Platform.select({
  ios:     { shadowColor:'#050f02', shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:12 },
  android: { elevation:8 },
  web:     { boxShadow:'0px 4px 20px rgba(5,15,2,0.25)' },
});

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={({ navigation, route }) => ({
          headerStyle: { backgroundColor:C.bg0, height:Platform.OS==='ios'?100:72, ...headerShadow },
          headerLeft: ({ canGoBack }) => canGoBack ? <BackBtn onPress={() => navigation.goBack()} /> : null,
          headerLeftContainerStyle: { paddingLeft:10, zIndex:10 },
          headerTitleAlign: 'left',
          headerTitle: ({ children }) => <HeaderTitle title={children ?? route.name} screenName={route.name} />,
          headerTitleContainerStyle: { left:0, right:0, marginLeft:0 },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
          statusBarStyle: 'light',
          statusBarColor: C.bg0,
        })}
      >
        {/* ── Auth ─────────────────────────────────────────── */}
        <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown:false }} />
        <Stack.Screen name="SignIn"  component={SignInScreen}  options={{ headerShown:false }} />
        <Stack.Screen name="SignUp"  component={SignUpScreen}  options={{ headerShown:false }} />

        {/* ── Core Modules ─────────────────────────────────── */}
        <Stack.Screen name="Home"         component={HomeScreen}         options={{ title:'Berry Health & Grading' }} />
        <Stack.Screen name="Analysis"     component={AnalysisScreen}     options={{ title:'Berry Analysis' }} />
        <Stack.Screen name="SoilAnalysis" component={SoilAnalysisScreen} options={{ title:'Live Soil Monitor' }} />
        <Stack.Screen name="Fertilizer"   component={FertilizerScreen}   options={{ title:'Fertilizer Advisor' }} />
        <Stack.Screen name="Dashboard"    component={DashboardScreen}    options={{ title:'Farm Dashboard' }} />
        <Stack.Screen name="Weather"      component={WeatherScreen}      options={{ title:'Weather Station' }} />

        {/* ── Disease Module ───────────────────────────────── */}
        <Stack.Screen name="DiseaseIdentification" component={DiseaseIdentificationScreen} options={{ title:'Disease Detection' }} />
        <Stack.Screen name="DiseaseUpload"         component={DiseaseUploadScreen}         options={{ title:'Upload Leaf Image' }} />
        <Stack.Screen name="DiseaseResult"         component={DiseaseResultScreen}         options={{ title:'Detection Result' }} />
        <Stack.Screen name="DiseaseHistory"        component={DiseaseHistoryScreen}        options={{ title:'Detection History' }} />

        {/* ── Variety Module ───────────────────────────────── */}
        <Stack.Screen name="VarietyHub"      component={VarietyHubScreen}      options={{ title:'Variety Module' }} />
        <Stack.Screen name="VarietyIdentify" component={VarietyIdentifyScreen} options={{ title:'Identify Variety' }} />
        <Stack.Screen name="VarietyInfo"     component={VarietyInfoScreen}     options={{ title:'Variety Info' }} />
        <Stack.Screen name="VarietyHistory"  component={VarietyHistoryScreen}  options={{ title:'Scan History' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const nb = StyleSheet.create({
  back:    { width:36, height:36, borderRadius:11, backgroundColor:'rgba(163,217,119,0.12)', borderWidth:1, borderColor:'rgba(163,217,119,0.25)', justifyContent:'center', alignItems:'center' },
  grad:    { flex:1, flexDirection:'row', alignItems:'center', marginLeft:-8, paddingLeft:12, marginRight:-16, paddingRight:12, overflow:'hidden' },
  circle1: { position:'absolute', width:130, height:130, borderRadius:65, backgroundColor:'rgba(163,217,119,0.06)', top:-55, right:10 },
  circle2: { position:'absolute', width:70,  height:70,  borderRadius:35, backgroundColor:'rgba(163,217,119,0.04)', bottom:-30, right:90 },
  row:     { flexDirection:'row', alignItems:'center', gap:12, flex:1, paddingVertical:6 },
  iconWrap:{ width:40, height:40, borderRadius:13, backgroundColor:'rgba(163,217,119,0.14)', borderWidth:1, borderColor:'rgba(163,217,119,0.25)', justifyContent:'center', alignItems:'center' },
  title:   { fontSize:15, fontWeight:'800', color:'#fff', letterSpacing:-0.2 },
  pill:    { flexDirection:'row', alignItems:'center', alignSelf:'flex-start', backgroundColor:'rgba(163,217,119,0.12)', borderWidth:1, borderColor:'rgba(163,217,119,0.2)', paddingHorizontal:8, paddingVertical:3, borderRadius:99, gap:5, marginTop:3 },
  pillDot: { width:5, height:5, borderRadius:99, backgroundColor:C.lime },
  pillTxt: { fontSize:10, fontWeight:'700', color:'rgba(163,217,119,0.85)', letterSpacing:0.5 },
});