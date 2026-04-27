// src/components/theme.js — Black Pepper AI Design System v5
import { Platform } from 'react-native';

export const C = {
  // ── Page & Surface ──────────────────────────────────────────────────────
  bg: '#F4F7F1',
  surface: '#FFFFFF',
  surface2: '#EFF5EA',
  surface3: '#E4EFD8',

  // ── Brand Greens ────────────────────────────────────────────────────────
  primary: '#2E7D32',
  primary2: '#388E3C',
  primaryDk: '#1B5E20',
  accent: '#66BB6A',
  light: '#C8E6C9',
  xlight: '#E8F5E9',
  xxlight: '#F1F8F1',

  // ── Text ────────────────────────────────────────────────────────────────
  text: '#1A2E1A',
  text2: '#3D5A3E',
  text3: '#6B8F6C',
  label: '#4A7050',
  hint: '#9DB89E',

  // ── Status ──────────────────────────────────────────────────────────────
  success: '#2E7D32',
  warning: '#F57F17',
  error: '#C62828',
  info: '#1565C0',

  // ── Data colours ────────────────────────────────────────────────────────
  green: '#2E7D32',
  amber: '#F57F17',
  red: '#C62828',
  blue: '#1565C0',
  teal: '#00838F',
  purple: '#6A1B9A',
  rose: '#AD1457',
  brown: '#6D4C41',
  lime: '#558B2F',
  orange: '#E65100',
  indigo: '#283593',

  // ── Borders ─────────────────────────────────────────────────────────────
  border: '#DCE8D5',
  border2: '#C5D9BB',
  divider: '#EDF3E8',

  // ── Gradients ───────────────────────────────────────────────────────────
  gradStart: '#1B5E20',
  gradMid: '#2E7D32',
  gradEnd: '#388E3C',

  white: '#FFFFFF',
  black: '#0D1A0D',
};

export const SHADOW = {
  xs: Platform.select({
    ios: {
      shadowColor: '#1A2E1A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
    },
    android: { elevation: 1 },
    web: { boxShadow: '0 1px 4px rgba(26,46,26,0.07)' },
  }),
  sm: Platform.select({
    ios: {
      shadowColor: '#1A2E1A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.09,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    web: { boxShadow: '0 2px 8px rgba(26,46,26,0.09)' },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#1A2E1A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.11,
      shadowRadius: 14,
    },
    android: { elevation: 4 },
    web: { boxShadow: '0 4px 16px rgba(26,46,26,0.11)' },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#1A2E1A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.13,
      shadowRadius: 24,
    },
    android: { elevation: 8 },
    web: { boxShadow: '0 8px 32px rgba(26,46,26,0.13)' },
  }),
};

export const T = {
  h1: { fontSize: 28, fontWeight: '900', color: '#1A2E1A', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '800', color: '#1A2E1A', letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700', color: '#1A2E1A' },
  body: { fontSize: 14, fontWeight: '400', color: '#3D5A3E', lineHeight: 21 },
  small: { fontSize: 12, fontWeight: '400', color: '#6B8F6C', lineHeight: 18 },
  cap: { fontSize: 10, fontWeight: '800', color: '#6B8F6C', letterSpacing: 2 },
};
