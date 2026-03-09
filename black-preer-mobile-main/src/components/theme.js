// src/components/theme.js
// Shared design tokens – Black Pepper AI
import { Platform } from 'react-native';

export const C = {
  // ── Dark green backgrounds ──────────────────────────────────────────────
  bg0:    '#050f02',   // page root (very dark)
  bg1:    '#0a1a04',   // section bg (dark)
  bg2:    '#0d2206',   // card bg (mid-dark)
  bg3:    '#111f08',   // elevated card
  pine:   '#1a4a08',   // rich pine green
  forest: '#2d5016',   // interactive green

  // ── Accent / highlight ──────────────────────────────────────────────────
  lime:   '#a3d977',   // primary CTA / highlight
  sage:   '#7aad55',   // secondary text on dark
  muted:  '#5a8a3a',   // muted text on dark
  dim:    '#2d4a1a',   // very dim labels

  // ── Sensor status colours ───────────────────────────────────────────────
  green:  '#2e7d32',   // optimal / healthy
  amber:  '#e65100',   // warning / slightly off
  red:    '#c62828',   // critical / error
  rose:   '#ad1457',   // phosphorus
  blue:   '#1565c0',   // moisture / info
  teal:   '#00838f',   // potassium/weather accent
  brown:  '#6d4c41',   // potassium bar
  purple: '#6a1b9a',   // pH / lime fertilizer

  // ── Neutrals (for light surfaces) ───────────────────────────────────────
  white:  '#f0fce8',
  border: 'rgba(163,217,119,0.18)',
};

export const SHADOW = {
  sm: Platform.select({
    ios:     { shadowColor:'#0d2206', shadowOffset:{width:0,height:2}, shadowOpacity:0.12, shadowRadius:6  },
    android: { elevation:2 },
    web:     { boxShadow:'0px 2px 8px rgba(13,34,6,0.12)' },
  }),
  md: Platform.select({
    ios:     { shadowColor:'#0d2206', shadowOffset:{width:0,height:4}, shadowOpacity:0.16, shadowRadius:12 },
    android: { elevation:4 },
    web:     { boxShadow:'0px 4px 16px rgba(13,34,6,0.16)' },
  }),
  lg: Platform.select({
    ios:     { shadowColor:'#0d2206', shadowOffset:{width:0,height:8}, shadowOpacity:0.20, shadowRadius:20 },
    android: { elevation:8 },
    web:     { boxShadow:'0px 8px 32px rgba(13,34,6,0.20)' },
  }),
};