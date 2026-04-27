// src/config/api.js — v4
import { Platform } from 'react-native';

// ── Change DEV_HOST to your machine's LAN IP when testing on real device ──
const DEV_HOST = '10.0.2.2'; // Android emulator default (127.0.0.1 for iOS sim)

const BASE = Platform.OS === 'web' ? 'http://127.0.0.1:5001' : `http://${DEV_HOST}:5001`;

export const API_BASE = BASE;
export const SOIL_ANALYSIS_URL = `${BASE}/api/soil-analysis`;
export const FERTILIZER_URL = `${BASE}/api/fertilizer`;
export const WEATHER_URL = `${BASE}/api/weather`;
export const BERRY_ANALYSIS_URL = `${BASE}/api/analyze`;
export const weatherIconUrl = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`;
