// src/components/NetworkBanner.js
// ─────────────────────────────────────────────────────────────────────────────
//  Black Pepper AI — Offline Detection Banner
//  • Uses @react-native-community/netinfo to detect connectivity
//  • Shows animated red banner when offline
//  • Shows brief green "Back online" banner when reconnected
//  Install: npx expo install @react-native-community/netinfo
//
//  USAGE: Add <NetworkBanner /> inside App.js (inside Provider)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let NetInfo;
try { NetInfo = require('@react-native-community/netinfo').default; }
catch { NetInfo = null; }

export default function NetworkBanner() {
  const [status,   setStatus]   = useState('unknown'); // unknown | online | offline
  const slideAnim = useRef(new Animated.Value(-60)).current;

  const show = () => Animated.spring(slideAnim, { toValue: 0,   useNativeDriver: true, tension: 80 }).start();
  const hide = () => Animated.timing(slideAnim,  { toValue: -60, useNativeDriver: true, duration: 300 }).start();

  useEffect(() => {
    if (!NetInfo) return;

    let backOnlineTimer;
    const unsub = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable !== false;

      if (!connected) {
        clearTimeout(backOnlineTimer);
        setStatus('offline');
        show();
      } else {
        if (status === 'offline') {
          setStatus('online');
          show();
          backOnlineTimer = setTimeout(() => hide(), 2500);
        } else {
          setStatus('online');
        }
      }
    });

    return () => { unsub(); clearTimeout(backOnlineTimer); };
  }, [status]);

  if (status === 'unknown') return null;

  const isOffline = status === 'offline';

  return (
    <Animated.View
      style={[s.banner, isOffline ? s.offline : s.online, { transform: [{ translateY: slideAnim }] }]}
      pointerEvents="none"
    >
      <Ionicons
        name={isOffline ? 'cloud-offline-outline' : 'cloud-done-outline'}
        size={16}
        color="#fff"
        style={{ marginRight: 6 }}
      />
      <Text style={s.txt}>
        {isOffline
          ? 'No internet connection — some features unavailable'
          : '✓ Back online'}
      </Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner:  { position:'absolute', top:0, left:0, right:0, zIndex:9999, flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:10, paddingHorizontal:16 },
  offline: { backgroundColor:'#C62828' },
  online:  { backgroundColor:'#2E7D32' },
  txt:     { color:'#fff', fontSize:12, fontWeight:'700' },
});