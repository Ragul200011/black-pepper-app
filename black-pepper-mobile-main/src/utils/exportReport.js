// src/utils/exportReport.js
// ─────────────────────────────────────────────────────────────────────────────
//  Black Pepper AI — Scan History Report Export
//  • Generates HTML-styled report from disease + variety history
//  • Prints/saves as PDF using expo-print
//  • Shares via expo-sharing (WhatsApp, email, Drive, etc.)
//  Install: npx expo install expo-print expo-sharing
// ─────────────────────────────────────────────────────────────────────────────
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Print, Sharing;
try { Print   = require('expo-print');   } catch {}
try { Sharing = require('expo-sharing'); } catch {}

// ─── Build HTML report ───────────────────────────────────────────────────────
function buildHTML({ disease, variety, generatedAt }) {
  const diseaseRows = disease.map(s => `
    <tr>
      <td>${s.timestamp ?? '—'}</td>
      <td style="color:${s.disease?.includes('healthy') ? '#2E7D32' : '#C62828'}; font-weight:700">
        ${s.disease ?? s.result ?? '—'}
      </td>
      <td>${s.confidence ?? '—'}%</td>
    </tr>`).join('');

  const varietyRows = variety.map(s => `
    <tr>
      <td>${s.timestamp ?? '—'}</td>
      <td style="font-weight:700">${s.result ?? '—'}</td>
      <td>${s.confidence ?? '—'}%</td>
      <td>${s.stage ?? '—'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Black Pepper AI — Scan Report</title>
<style>
  body { font-family: -apple-system, Arial, sans-serif; margin: 32px; color: #1A2E1A; }
  h1   { color: #2E7D32; border-bottom: 3px solid #2E7D32; padding-bottom: 10px; }
  h2   { color: #2E7D32; margin-top: 32px; font-size: 16px; }
  .meta{ background:#E8F5E9; border-radius:8px; padding:14px; margin-bottom:24px; font-size:13px; }
  table{ width:100%; border-collapse:collapse; margin-top:12px; font-size:13px; }
  th   { background:#2E7D32; color:#fff; padding:10px 12px; text-align:left; }
  td   { padding:9px 12px; border-bottom:1px solid #EDF3E8; }
  tr:nth-child(even) td { background:#F5F7F2; }
  .footer { margin-top:40px; font-size:11px; color:#888; text-align:center; }
  .badge  { display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; }
  .green  { background:#E8F5E9; color:#2E7D32; }
  .red    { background:#FFEBEE; color:#C62828; }
</style>
</head>
<body>
  <h1>🌿 Black Pepper AI — Scan Report</h1>
  <div class="meta">
    <b>Generated:</b> ${generatedAt}<br/>
    <b>Disease Scans:</b> ${disease.length} &nbsp;|&nbsp;
    <b>Variety Scans:</b> ${variety.length} &nbsp;|&nbsp;
    <b>Total:</b> ${disease.length + variety.length}<br/>
    <b>Research Group:</b> SLIIT AI Laboratory
  </div>

  <h2>🔬 Disease Detection Results</h2>
  ${disease.length === 0
    ? '<p style="color:#888">No disease scans recorded.</p>'
    : `<table>
        <thead><tr><th>Date / Time</th><th>Detection Result</th><th>Confidence</th></tr></thead>
        <tbody>${diseaseRows}</tbody>
       </table>`
  }

  <h2>🫑 Variety Identification Results</h2>
  ${variety.length === 0
    ? '<p style="color:#888">No variety scans recorded.</p>'
    : `<table>
        <thead><tr><th>Date / Time</th><th>Identified Variety</th><th>Confidence</th><th>Stage</th></tr></thead>
        <tbody>${varietyRows}</tbody>
       </table>`
  }

  <div class="footer">
    Black Pepper AI · SLIIT Research Project · Generated ${generatedAt}
  </div>
</body>
</html>`;
}

// ─── Main export function ─────────────────────────────────────────────────────
export async function exportScanReport() {
  if (!Print || !Sharing) {
    Alert.alert(
      'Export Not Available',
      'Install expo-print and expo-sharing to enable report export:\n\nnpx expo install expo-print expo-sharing',
      [{ text: 'OK' }]
    );
    return;
  }

  try {
    const [dRaw, vRaw] = await Promise.all([
      AsyncStorage.getItem('disease_history'),
      AsyncStorage.getItem('scanHistory'),
    ]);
    const disease = dRaw ? JSON.parse(dRaw) : [];
    const variety = vRaw ? JSON.parse(vRaw) : [];

    if (disease.length === 0 && variety.length === 0) {
      Alert.alert('No Data', 'No scan history found to export. Run some scans first.');
      return;
    }

    const html        = buildHTML({ disease, variety, generatedAt: new Date().toLocaleString() });
    const { uri }     = await Print.printToFileAsync({ html, base64: false });
    const canShare    = await Sharing.isAvailableAsync();

    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType:  'application/pdf',
        dialogTitle: 'Share Scan Report',
        UTI:       'com.adobe.pdf',
      });
    } else {
      Alert.alert('Report Saved', `PDF saved to:\n${uri}`);
    }
  } catch (e) {
    console.error('Export error:', e);
    Alert.alert('Export Failed', e.message ?? 'Unknown error');
  }
}

// ─── Convenience: just open the print dialog ──────────────────────────────────
export async function printScanReport() {
  if (!Print) {
    Alert.alert('Not Available', 'Install expo-print: npx expo install expo-print');
    return;
  }
  try {
    const [dRaw, vRaw] = await Promise.all([
      AsyncStorage.getItem('disease_history'),
      AsyncStorage.getItem('scanHistory'),
    ]);
    const html = buildHTML({
      disease:     dRaw ? JSON.parse(dRaw) : [],
      variety:     vRaw ? JSON.parse(vRaw) : [],
      generatedAt: new Date().toLocaleString(),
    });
    await Print.printAsync({ html });
  } catch (e) {
    Alert.alert('Print Failed', e.message);
  }
}