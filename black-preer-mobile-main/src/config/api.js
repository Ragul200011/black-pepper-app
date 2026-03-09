// src/config/api.js
// ─────────────────────────────────────────────────────────────────────────────
//  Central API configuration for Black Pepper AI
//
//  HOW TO SET YOUR HOST:
//    • Android Emulator  → DEV_HOST = '10.0.2.2'
//    • iOS Simulator     → DEV_HOST = '127.0.0.1'
//    • Physical Device   → DEV_HOST = your PC's LAN IP (e.g. '192.168.1.10')
//    • Web (Expo Web)    → automatically uses 127.0.0.1
// ─────────────────────────────────────────────────────────────────────────────
import { Platform } from 'react-native';

// ── Change this to your PC's local IP when testing on a real device ──────────
const DEV_HOST = '10.0.2.2'; // ← Android emulator default

const BASE =
  Platform.OS === 'web'
    ? 'http://127.0.0.1:5001'
    : `http://${DEV_HOST}:5001`;

// ── Exported base URL (used by predict.js and variety screens) ────────────────
export const API_BASE = BASE;

// ── Soil / Fertilizer endpoints (Node.js backend → port 5001) ────────────────
export const SOIL_ANALYSIS_URL = `${BASE}/api/soil-analysis`;
export const FERTILIZER_URL    = `${BASE}/api/fertilizer`;

// ── Weather endpoint (Node.js backend) ───────────────────────────────────────
export const WEATHER_URL = `${BASE}/api/weather`;

// ── Berry / Image Analysis endpoint ──────────────────────────────────────────
// Both berry analysis and image prediction are served by the same Node.js
// backend on port 5001. If you split them onto a separate Python server,
// update BERRY_ANALYSIS_URL to point to that host/port.
export const BERRY_ANALYSIS_URL = `${BASE}/api/analyze`;

// ── Weather icon helper (OpenWeatherMap) ─────────────────────────────────────
export const weatherIconUrl = (iconCode) =>
  `https://openweathermap.org/img/wn/${iconCode}@2x.png`;