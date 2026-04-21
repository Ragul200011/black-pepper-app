// src/components/theme.js  — Black Pepper AI  Light Theme v4
import { Platform } from 'react-native';

export const C = {
  // Backgrounds
  bg:       '#F4F7F1',
  surface:  '#FFFFFF',
  surface2: '#EFF4EA',
  surface3: '#E5EDE0',

  // Brand greens
  primary:  '#2E7D32',
  primary2: '#388E3C',
  accent:   '#66BB6A',
  light:    '#C8E6C9',
  xlight:   '#E8F5E9',

  // Text
  text:     '#1A2E1A',
  text2:    '#3D5A3E',
  text3:    '#6B8F6C',
  label:    '#4A7050',
  hint:     '#9DB89E',

  // Status
  success:  '#2E7D32',
  warning:  '#F57F17',
  error:    '#C62828',
  info:     '#1565C0',

  // Data colours
  green:    '#2E7D32',
  amber:    '#F57F17',
  red:      '#C62828',
  blue:     '#1565C0',
  teal:     '#00838F',
  purple:   '#6A1B9A',
  rose:     '#AD1457',
  brown:    '#6D4C41',
  lime:     '#558B2F',
  orange:   '#E65100',

  // Borders
  border:   '#DCE8D5',
  border2:  '#C5D9BB',
  divider:  '#EDF3E8',

  // Gradient
  gradStart: '#2E7D32',
  gradMid:   '#388E3C',
  gradEnd:   '#43A047',

  white:  '#FFFFFF',
  black:  '#0D1A0D',
};

export const SHADOW = {
  xs: Platform.select({
    ios:     { shadowColor:'#1A2E1A', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:3  },
    android: { elevation:1 },
    web:     { boxShadow:'0 1px 4px rgba(26,46,26,0.06)' },
  }),
  sm: Platform.select({
    ios:     { shadowColor:'#1A2E1A', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6  },
    android: { elevation:2 },
    web:     { boxShadow:'0 2px 8px rgba(26,46,26,0.08)' },
  }),
  md: Platform.select({
    ios:     { shadowColor:'#1A2E1A', shadowOffset:{width:0,height:4}, shadowOpacity:0.10, shadowRadius:12 },
    android: { elevation:4 },
    web:     { boxShadow:'0 4px 16px rgba(26,46,26,0.10)' },
  }),
  lg: Platform.select({
    ios:     { shadowColor:'#1A2E1A', shadowOffset:{width:0,height:8}, shadowOpacity:0.12, shadowRadius:24 },
    android: { elevation:8 },
    web:     { boxShadow:'0 8px 32px rgba(26,46,26,0.12)' },
  }),
};

export const T = {
  h1:    { fontSize:28, fontWeight:'800', color:'#1A2E1A', letterSpacing:-0.5, lineHeight:34 },
  h2:    { fontSize:22, fontWeight:'800', color:'#1A2E1A', letterSpacing:-0.3, lineHeight:28 },
  h3:    { fontSize:18, fontWeight:'700', color:'#1A2E1A', lineHeight:24 },
  h4:    { fontSize:15, fontWeight:'700', color:'#1A2E1A', lineHeight:20 },
  body:  { fontSize:14, fontWeight:'400', color:'#3D5A3E', lineHeight:21 },
  small: { fontSize:12, fontWeight:'400', color:'#6B8F6C', lineHeight:18 },
  label: { fontSize:12, fontWeight:'700', color:'#4A7050', letterSpacing:0.3 },
  cap:   { fontSize:10, fontWeight:'700', color:'#6B8F6C', letterSpacing:1.5 },
};