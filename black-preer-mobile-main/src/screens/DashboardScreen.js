// src/screens/DashboardScreen.js
// ─────────────────────────────────────────────────────────────────────────────
//  Black Pepper AI – Farm Dashboard
//  • Live GPS via expo-location (run: npx expo install expo-location)
//  • Nearby good farming spots via Google Places API
//  • Weather from /api/weather backend
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import axios from 'axios';
import { WEATHER_URL } from '../config/api';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

// ─── Google Places API key ────────────────────────────────────────────────────
// Get a FREE key: https://console.cloud.google.com → Enable "Places API"
// Replace the string below, then nearby real farm spots will appear on the map
const GOOGLE_PLACES_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';

// ─── Your registered farm plots ──────────────────────────────────────────────
const FARMS = [
  { id:1, title:'SLIIT Research Plot',       lat:6.9147, lon:79.9729, status:'healthy',         n:82,  p:38, k:115, ph:6.2, area:'0.8 ha' },
  { id:2, title:'Engineering Faculty Field',  lat:6.9021, lon:79.9610, status:'needs_attention', n:18,  p:8,  k:28,  ph:4.8, area:'0.5 ha' },
  { id:3, title:'Campus Garden',              lat:6.9200, lon:79.9800, status:'healthy',         n:65,  p:22, k:95,  ph:6.5, area:'1.2 ha' },
  { id:4, title:'South Research Farm',        lat:6.8950, lon:79.9500, status:'needs_attention', n:35,  p:12, k:55,  ph:5.1, area:'2.0 ha' },
];

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ─── Score a Google Place for black pepper farming suitability ────────────────
function farmScore(place) {
  const name = (place.name ?? '').toLowerCase();
  const types = place.types ?? [];
  let score = 45;
  if (types.includes('park'))            score += 20;
  if (types.includes('natural_feature')) score += 25;
  if (name.includes('farm'))             score += 30;
  if (name.includes('plantation'))       score += 30;
  if (name.includes('garden'))           score += 18;
  if (name.includes('field'))            score += 18;
  if (name.includes('agri'))             score += 22;
  if (name.includes('pepper'))           score += 40;
  if (name.includes('paddy'))            score += 15;
  if (place.rating >= 4)                 score += 10;
  return Math.min(99, score);
}

function suitLabel(score) {
  if (score >= 80) return { label:'Excellent', color:'#2e7d32' };
  if (score >= 65) return { label:'Good',      color:'#558b2f' };
  if (score >= 50) return { label:'Moderate',  color:'#f57f17' };
  return                  { label:'Low',        color:'#c62828' };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const [weather,      setWeather]      = useState(null);
  const [weatherLoad,  setWeatherLoad]  = useState(true);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [userLoc,      setUserLoc]      = useState(null);
  const [locStatus,    setLocStatus]    = useState('loading'); // loading | ok | error
  const [locMsg,       setLocMsg]       = useState('');
  const [suggestions,  setSuggestions]  = useState([]);
  const [suggsLoad,    setSuggsLoad]    = useState(false);
  const mapRef   = useRef(null);
  const mounted  = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  // ── Get live GPS ───────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      let lat = 6.9147, lon = 79.9729; // fallback: Western Province, Sri Lanka
      try {
        let Location;
        try { Location = require('expo-location'); }
        catch { throw new Error('Run: npx expo install expo-location'); }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Location permission denied');

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;

        if (!mounted.current) return;
        const coords = { latitude: lat, longitude: lon };
        setUserLoc(coords);
        setLocStatus('ok');
        setLocMsg(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);

        setTimeout(() => {
          mapRef.current?.animateToRegion({ ...coords, latitudeDelta:0.06, longitudeDelta:0.06 }, 700);
        }, 600);

      } catch (e) {
        if (!mounted.current) return;
        setLocStatus('error');
        setLocMsg(e.message);
        setUserLoc({ latitude: lat, longitude: lon });
      }

      fetchWeather(lat, lon);
      fetchSuggestions(lat, lon);
    })();
  }, []);

  // ── Weather ────────────────────────────────────────────────────────────────
  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      const res = await axios.get(`${WEATHER_URL}?lat=${lat}&lon=${lon}`, { timeout:10000 });
      if (mounted.current) setWeather(res.data);
    } catch {}
    if (mounted.current) setWeatherLoad(false);
  }, []);

  // ── Nearby farming suggestions ─────────────────────────────────────────────
  const fetchSuggestions = useCallback(async (lat, lon) => {
    if (!mounted.current) return;
    setSuggsLoad(true);
    try {
      if (!GOOGLE_PLACES_KEY || GOOGLE_PLACES_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
        // No API key → show own farms ranked by distance
        const local = FARMS
          .map(f => ({ id:String(f.id), name:f.title, vicinity:f.area, lat:f.lat, lon:f.lon,
            score: f.status==='healthy'?88:52, distance:haversine(lat,lon,f.lat,f.lon), isOwnFarm:true }))
          .sort((a,b) => a.distance - b.distance);
        if (mounted.current) setSuggestions(local);
        return;
      }

      // Real Google Places search
      const keywords = ['farm', 'plantation', 'agricultural field', 'paddy field'];
      const all = [];
      for (const kw of keywords.slice(0,3)) {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
          + `?location=${lat},${lon}&radius=10000&keyword=${encodeURIComponent(kw)}&key=${GOOGLE_PLACES_KEY}`;
        const res = await axios.get(url, { timeout:8000 });
        if (res.data?.results) all.push(...res.data.results);
      }

      const seen = new Set();
      const unique = all
        .filter(p => { if (seen.has(p.place_id)) return false; seen.add(p.place_id); return true; })
        .map(p => ({
          id:       p.place_id,
          name:     p.name,
          vicinity: p.vicinity,
          lat:      p.geometry.location.lat,
          lon:      p.geometry.location.lng,
          score:    farmScore(p),
          rating:   p.rating,
          distance: haversine(lat, lon, p.geometry.location.lat, p.geometry.location.lng),
          isOwnFarm: false,
        }))
        .filter(p => p.score >= 50)
        .sort((a,b) => b.score - a.score)
        .slice(0, 6);

      if (mounted.current) setSuggestions(unique);
    } catch (e) {
      console.warn('Suggestions error:', e.message);
    } finally {
      if (mounted.current) setSuggsLoad(false);
    }
  }, []);

  const focusMap = (lat, lon) => mapRef.current?.animateToRegion(
    { latitude:lat, longitude:lon, latitudeDelta:0.02, longitudeDelta:0.02 }, 600
  );

  const healthyCount = FARMS.filter(f=>f.status==='healthy').length;

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── HEADER STRIP ── */}
        <LinearGradient colors={['#050f02','#0d2206']} style={s.strip}>
          <View style={s.stripItem}>
            <Text style={s.stripNum}>{FARMS.length}</Text>
            <Text style={s.stripLbl}>Farms</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Text style={[s.stripNum,{color:'#a3d977'}]}>{healthyCount}</Text>
            <Text style={s.stripLbl}>Healthy</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Text style={[s.stripNum,{color:'#ffb74d'}]}>{FARMS.length-healthyCount}</Text>
            <Text style={s.stripLbl}>Attention</Text>
          </View>
          <View style={s.stripDiv} />
          <TouchableOpacity style={s.wChip} onPress={()=>navigation.navigate('Weather')}>
            {weatherLoad
              ? <ActivityIndicator size="small" color="#a3d977"/>
              : weather
                ? <><Text style={s.wChipT}>{Math.round(weather.temperature)}°C</Text>
                    <Text style={s.wChipS}>{weather.humidity}% · 🌤️</Text></>
                : <Text style={s.wChipS}>Weather →</Text>}
          </TouchableOpacity>
        </LinearGradient>

        {/* ── GPS BANNER ── */}
        {locStatus === 'loading' && (
          <View style={[s.locBanner,s.locLoading]}>
            <ActivityIndicator size="small" color="#2e7d32"/>
            <Text style={s.locLoadTxt}>  Getting your live GPS location…</Text>
          </View>
        )}
        {locStatus === 'ok' && (
          <View style={[s.locBanner,s.locOk]}>
            <Text style={s.locOkTxt}>📍 Live GPS · {locMsg}</Text>
          </View>
        )}
        {locStatus === 'error' && (
          <View style={[s.locBanner,s.locErr]}>
            <Text style={s.locErrTitle}>📍 Location unavailable — using default</Text>
            <Text style={s.locErrSub}>{locMsg}</Text>
            <Text style={s.locErrFix}>Fix: npx expo install expo-location → restart app</Text>
          </View>
        )}

        {/* ── WEATHER CARD ── */}
        {weather && (
          <TouchableOpacity onPress={()=>navigation.navigate('Weather')} activeOpacity={0.9} style={s.wCard}>
            <LinearGradient colors={['#1a4a08','#0d2206']} style={s.wCardGrad}>
              <View style={{flex:1}}>
                <Text style={s.wCity}>{weather.city}</Text>
                <Text style={s.wCond}>{weather.weather}</Text>
                <View style={s.wRow}>
                  <Text style={s.wDetail}>💧{weather.humidity}%</Text>
                  <Text style={s.wDetail}>💨{weather.wind}m/s</Text>
                  <Text style={s.wDetail}>🤗{Math.round(weather.feels_like)}°C</Text>
                </View>
              </View>
              <View style={{alignItems:'flex-end',justifyContent:'space-between'}}>
                <Text style={s.wBigT}>{Math.round(weather.temperature)}°</Text>
                <Text style={s.wMore}>Tap →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── MAP ── */}
        <View style={s.mapWrap}>
          <Text style={s.secTitle}>🗺️ Farm Map</Text>
          <Text style={s.secSub}>
            {locStatus==='ok' ? 'Live GPS active · blue = you · tap pins for details'
              : 'Tap a farm pin for soil details'}
          </Text>

          <MapView
            ref={mapRef}
            style={s.map}
            initialRegion={{
              latitude:  userLoc?.latitude  ?? 6.910,
              longitude: userLoc?.longitude ?? 79.965,
              latitudeDelta:0.06, longitudeDelta:0.06,
            }}
            mapType="satellite"
            showsUserLocation={locStatus==='ok'}
            showsMyLocationButton={locStatus==='ok'}
          >
            {/* User location pulse ring */}
            {userLoc && locStatus==='ok' && (
              <>
                <Marker coordinate={{latitude:userLoc.latitude,longitude:userLoc.longitude}}
                  title="📍 You Are Here" pinColor="#4fc3f7"/>
                <Circle center={{latitude:userLoc.latitude,longitude:userLoc.longitude}}
                  radius={400} fillColor="rgba(79,195,247,0.10)" strokeColor="rgba(79,195,247,0.45)" strokeWidth={2}/>
              </>
            )}

            {/* Registered farm markers */}
            {FARMS.map(farm=>(
              <Marker key={`f${farm.id}`}
                coordinate={{latitude:farm.lat,longitude:farm.lon}}
                pinColor={farm.status==='healthy'?'#a3d977':'#ffb74d'}
                onPress={()=>setSelectedFarm(farm)}>
                <Callout>
                  <View style={s.callout}>
                    <Text style={s.calloutName}>{farm.title}</Text>
                    <Text style={{color:farm.status==='healthy'?'#2e7d32':'#e65100',fontSize:12,fontWeight:'600'}}>
                      {farm.status==='healthy'?'✅ Healthy':'⚠️ Needs Attention'}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            ))}

            {/* Nearby suggestion markers (non-own-farm) */}
            {suggestions.filter(s=>!s.isOwnFarm).map(sg=>{
              const {color} = suitLabel(sg.score);
              return (
                <Marker key={`sg${sg.id}`}
                  coordinate={{latitude:sg.lat,longitude:sg.lon}}
                  title={`🌱 ${sg.name}`}
                  description={`${sg.score}% suitable for black pepper`}
                  pinColor={color}/>
              );
            })}
          </MapView>

          {/* Legend */}
          <View style={s.legend}>
            {[
              {color:'#4fc3f7',label:'You'},
              {color:'#a3d977',label:'Healthy'},
              {color:'#ffb74d',label:'Attention'},
              {color:'#2e7d32',label:'Good Spot'},
            ].map(l=>(
              <View key={l.label} style={s.legItem}>
                <View style={[s.legDot,{backgroundColor:l.color}]}/>
                <Text style={s.legTxt}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── SELECTED FARM DETAIL ── */}
        {selectedFarm && (
          <View style={s.farmDetail}>
            <View style={s.farmDHdr}>
              <View style={{flex:1}}>
                <Text style={s.farmDTitle}>{selectedFarm.title}</Text>
                <Text style={{color:selectedFarm.status==='healthy'?'#2e7d32':'#e65100',fontSize:12,fontWeight:'600',marginTop:2}}>
                  {selectedFarm.status==='healthy'?'✅ Healthy':'⚠️ Needs Attention'} · {selectedFarm.area}
                </Text>
              </View>
              <TouchableOpacity onPress={()=>{ focusMap(selectedFarm.lat,selectedFarm.lon); }} style={s.closeBtn}>
                <Text style={{fontSize:16}}>🗺️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setSelectedFarm(null)} style={s.closeBtn}>
                <Text style={s.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            {[
              {label:'Nitrogen',   val:selectedFarm.n,  max:150,color:'#2e7d32',unit:'mg/kg'},
              {label:'Phosphorus', val:selectedFarm.p,  max:60, color:'#ad1457',unit:'mg/kg'},
              {label:'Potassium',  val:selectedFarm.k,  max:200,color:'#6d4c41',unit:'mg/kg'},
              {label:'pH',         val:selectedFarm.ph, max:9,  color:'#6a1b9a',unit:''},
            ].map(n=>(
              <View key={n.label} style={s.nutriRow}>
                <Text style={s.nutriLbl}>{n.label}</Text>
                <View style={s.nutriBar}>
                  <View style={[s.nutriFill,{width:`${Math.min(100,(n.val/n.max)*100)}%`,backgroundColor:n.color}]}/>
                </View>
                <Text style={[s.nutriVal,{color:n.color}]}>{n.val}{n.unit}</Text>
              </View>
            ))}
            <TouchableOpacity style={s.fertCTA} onPress={()=>navigation.navigate('Fertilizer',{
              nitrogen:selectedFarm.n,phosphorus:selectedFarm.p,
              potassium:selectedFarm.k,ph:selectedFarm.ph,farmName:selectedFarm.title,
            })} activeOpacity={0.85}>
              <LinearGradient colors={['#1a4a08','#0d2206']} style={s.fertGrad}>
                <Text style={s.fertTxt}>🌿  Get Fertilizer Plan →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ── NEARBY GOOD FARMING SPOTS ── */}
        <View style={s.suggsWrap}>
          <Text style={s.secTitle}>🌱 Nearby Farming Spots</Text>
          <Text style={s.secSub}>Locations near you suitable for black pepper cultivation</Text>

          {suggsLoad && (
            <View style={s.suggsRow}>
              <ActivityIndicator color="#2e7d32"/>
              <Text style={{fontSize:12,color:'#2e7d32',marginLeft:8}}>Searching nearby…</Text>
            </View>
          )}

          {!suggsLoad && suggestions.length === 0 && (
            <View style={s.suggsEmpty}>
              <Text style={s.suggsEmptyTxt}>No suggestions found yet.</Text>
            </View>
          )}

          {suggestions.map(sg=>{
            const {label,color} = suitLabel(sg.score);
            return (
              <TouchableOpacity key={sg.id} style={s.suggCard}
                onPress={()=>focusMap(sg.lat,sg.lon)} activeOpacity={0.85}>
                <View style={[s.suggBadge,{backgroundColor:color}]}>
                  <Text style={s.suggNum}>{sg.score}%</Text>
                  <Text style={s.suggFit}>fit</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={s.suggName} numberOfLines={1}>
                    {sg.isOwnFarm?'🏡 ':'🌿 '}{sg.name}
                  </Text>
                  <Text style={s.suggVic}>{sg.vicinity}</Text>
                  {sg.distance!=null&&<Text style={s.suggDist}>{sg.distance.toFixed(1)} km from you</Text>}
                </View>
                <View style={[s.suitTag,{backgroundColor:color+'22',borderColor:color+'55'}]}>
                  <Text style={[s.suitTagTxt,{color}]}>{label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* API key hint */}
          {(!GOOGLE_PLACES_KEY || GOOGLE_PLACES_KEY==='YOUR_GOOGLE_PLACES_API_KEY') && (
            <View style={s.keyHint}>
              <Text style={s.keyHintT}>💡 Get Real Nearby Suggestions</Text>
              <Text style={s.keyHintS}>
                Add your Google Places API key in DashboardScreen.js → GOOGLE_PLACES_KEY{'\n'}
                Free key: console.cloud.google.com → Enable "Places API"
              </Text>
            </View>
          )}
        </View>

        {/* ── ALL FARMS LIST ── */}
        <View style={s.farmListWrap}>
          <Text style={s.secTitle}>📋 All Farms</Text>
          {FARMS.map(farm=>(
            <TouchableOpacity key={farm.id} style={s.farmRow}
              onPress={()=>{setSelectedFarm(farm);focusMap(farm.lat,farm.lon);}} activeOpacity={0.8}>
              <View style={[s.farmDot,{backgroundColor:farm.status==='healthy'?'#a3d977':'#ffb74d'}]}/>
              <View style={{flex:1}}>
                <Text style={s.farmRowT}>{farm.title}</Text>
                <Text style={s.farmRowS}>N:{farm.n} · P:{farm.p} · K:{farm.k} · pH:{farm.ph} · {farm.area}</Text>
              </View>
              <TouchableOpacity style={s.farmFertBtn}
                onPress={()=>navigation.navigate('Fertilizer',{
                  nitrogen:farm.n,phosphorus:farm.p,potassium:farm.k,ph:farm.ph,farmName:farm.title})}
                activeOpacity={0.85}>
                <Text style={{fontSize:18}}>🌱</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── QUICK NAV ── */}
        <View style={s.quickNav}>
          {[
            {emoji:'🌱',label:'Soil',    screen:'SoilAnalysis'},
            {emoji:'🔬',label:'Disease', screen:'DiseaseIdentification'},
            {emoji:'🫑',label:'Variety', screen:'VarietyHub'},
            {emoji:'🌤️',label:'Weather', screen:'Weather'},
            {emoji:'📊',label:'Analysis',screen:'Analysis'},
          ].map(it=>(
            <TouchableOpacity key={it.screen} style={s.qBtn}
              onPress={()=>navigation.navigate(it.screen)} activeOpacity={0.8}>
              <Text style={s.qEmoji}>{it.emoji}</Text>
              <Text style={s.qLbl}>{it.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{height:30}}/>
      </ScrollView>
      <BottomNav navigation={navigation} active="Dashboard"/>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:'#f4f8f1'},
  scroll:{paddingBottom:16},
  // Strip
  strip:{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingVertical:16},
  stripItem:{flex:1,alignItems:'center'},
  stripNum:{fontSize:22,fontWeight:'900',color:'#f0fce8'},
  stripLbl:{fontSize:10,color:'#5a8a3a',marginTop:2},
  stripDiv:{width:1,height:34,backgroundColor:'rgba(163,217,119,0.2)'},
  wChip:{flex:1,alignItems:'center'},
  wChipT:{fontSize:18,fontWeight:'900',color:'#a3d977'},
  wChipS:{fontSize:10,color:'#5a8a3a',marginTop:2},
  // Location banners
  locBanner:{marginHorizontal:16,marginTop:12,borderRadius:12,padding:12},
  locLoading:{flexDirection:'row',alignItems:'center',backgroundColor:'#e8f5e9',borderWidth:1,borderColor:'#c8e6c9'},
  locLoadTxt:{fontSize:12,color:'#2e7d32'},
  locOk:{backgroundColor:'#e8f5e9',borderWidth:1,borderColor:'#a5d6a7'},
  locOkTxt:{fontSize:12,color:'#2e7d32',fontWeight:'600'},
  locErr:{backgroundColor:'#fff8e1',borderWidth:1,borderColor:'#ffe082'},
  locErrTitle:{fontSize:12,color:'#f57f17',fontWeight:'700'},
  locErrSub:{fontSize:11,color:'#888',marginTop:2},
  locErrFix:{fontSize:11,color:'#e65100',marginTop:4,fontStyle:'italic'},
  // Weather card
  wCard:{marginHorizontal:16,marginTop:14,borderRadius:20,overflow:'hidden',elevation:4},
  wCardGrad:{flexDirection:'row',padding:18,gap:14},
  wCity:{fontSize:18,fontWeight:'900',color:'#f0fce8'},
  wCond:{fontSize:12,color:'#a3d977',textTransform:'capitalize',marginTop:2,marginBottom:10},
  wRow:{flexDirection:'row',gap:10},
  wDetail:{fontSize:11,color:'#7aad55'},
  wBigT:{fontSize:52,fontWeight:'900',color:'#f0fce8'},
  wMore:{fontSize:11,color:'#a3d977'},
  // Map
  mapWrap:{padding:16},
  secTitle:{fontSize:17,fontWeight:'800',color:'#1a3409',marginBottom:4},
  secSub:{fontSize:11,color:'#888',marginBottom:10},
  map:{width:'100%',height:300,borderRadius:20,overflow:'hidden'},
  callout:{padding:6,minWidth:140},
  calloutName:{fontSize:13,fontWeight:'700',color:'#1a3409',marginBottom:3},
  legend:{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:10,paddingHorizontal:4},
  legItem:{flexDirection:'row',alignItems:'center',gap:5},
  legDot:{width:10,height:10,borderRadius:5},
  legTxt:{fontSize:11,color:'#555'},
  // Farm detail
  farmDetail:{marginHorizontal:16,backgroundColor:'#fff',borderRadius:20,padding:18,elevation:4,marginBottom:10},
  farmDHdr:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14},
  farmDTitle:{fontSize:16,fontWeight:'800',color:'#1a3409',maxWidth:200},
  closeBtn:{padding:6},
  closeTxt:{fontSize:16,color:'#888'},
  nutriRow:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:10},
  nutriLbl:{width:80,fontSize:12,fontWeight:'600',color:'#555'},
  nutriBar:{flex:1,height:8,backgroundColor:'#f0f0f0',borderRadius:4,overflow:'hidden'},
  nutriFill:{height:8,borderRadius:4},
  nutriVal:{width:55,fontSize:12,fontWeight:'700',textAlign:'right'},
  fertCTA:{borderRadius:12,overflow:'hidden',elevation:3,marginTop:10},
  fertGrad:{paddingVertical:13,alignItems:'center'},
  fertTxt:{color:'#a3d977',fontSize:14,fontWeight:'700'},
  // Suggestions
  suggsWrap:{paddingHorizontal:16,paddingBottom:8},
  suggsRow:{flexDirection:'row',alignItems:'center',padding:12,backgroundColor:'#f1f8e9',borderRadius:12,marginBottom:8},
  suggsEmpty:{padding:14,backgroundColor:'#f5f5f5',borderRadius:12,marginBottom:8},
  suggsEmptyTxt:{fontSize:13,color:'#888'},
  suggCard:{backgroundColor:'#fff',borderRadius:16,padding:14,marginBottom:10,
    flexDirection:'row',alignItems:'center',gap:12,elevation:2,borderWidth:1,borderColor:'#e8f5e9'},
  suggBadge:{width:46,height:46,borderRadius:12,justifyContent:'center',alignItems:'center',flexShrink:0},
  suggNum:{fontSize:15,fontWeight:'900',color:'#fff'},
  suggFit:{fontSize:9,fontWeight:'700',color:'rgba(255,255,255,0.8)'},
  suggName:{fontSize:14,fontWeight:'700',color:'#1a3409',marginBottom:2},
  suggVic:{fontSize:11,color:'#888',marginBottom:1},
  suggDist:{fontSize:11,color:'#2e7d32',fontWeight:'600'},
  suitTag:{paddingHorizontal:8,paddingVertical:4,borderRadius:99,borderWidth:1},
  suitTagTxt:{fontSize:10,fontWeight:'700'},
  keyHint:{backgroundColor:'#fffde7',borderRadius:14,padding:14,marginTop:4,borderWidth:1,borderColor:'#ffe082'},
  keyHintT:{fontSize:13,fontWeight:'800',color:'#f57f17',marginBottom:6},
  keyHintS:{fontSize:11,color:'#888',lineHeight:18},
  // Farm list
  farmListWrap:{paddingHorizontal:16,paddingBottom:8},
  farmRow:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#fff',
    borderRadius:14,padding:14,marginBottom:8,elevation:2},
  farmDot:{width:12,height:12,borderRadius:6},
  farmRowT:{fontSize:13,fontWeight:'700',color:'#1a3409'},
  farmRowS:{fontSize:11,color:'#888',marginTop:2},
  farmFertBtn:{width:36,height:36,borderRadius:10,backgroundColor:'#f1f8e9',
    justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#c8e6a0'},
  // Quick nav
  quickNav:{flexDirection:'row',justifyContent:'space-around',paddingHorizontal:12,
    paddingTop:16,paddingBottom:8,backgroundColor:'#fff',
    marginHorizontal:16,borderRadius:18,marginBottom:16,elevation:2},
  qBtn:{alignItems:'center',gap:4},
  qEmoji:{fontSize:24},
  qLbl:{fontSize:10,color:'#2d5016',fontWeight:'600'},
});