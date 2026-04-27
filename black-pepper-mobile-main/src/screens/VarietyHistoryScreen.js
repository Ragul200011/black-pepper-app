// src/screens/VarietyHistoryScreen.js  — Light Theme
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { C, SHADOW } from '../components/theme';
import { EmptyState } from '../components/ui';
import BottomNav from '../components/BottomNav';

const VARIETY_COLORS = {
  Butawerala: C.success,
  Dingirala: C.info,
  Kohukuburerala: C.purple,
};

function HistoryItem({ item, onPress }) {
  const varColor = VARIETY_COLORS[item.result] ?? C.text3;
  const confidence =
    typeof item.confidence === 'number'
      ? item.confidence.toFixed(1)
      : String(item.confidence ?? '—');

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      {/* Image */}
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={s.thumb} resizeMode="cover" />
      ) : (
        <View style={s.thumbPlaceholder}>
          <Ionicons name="leaf-outline" size={24} color={C.hint} />
        </View>
      )}

      {/* Content */}
      <View style={s.cardContent}>
        <View
          style={[
            s.varietyBadge,
            { backgroundColor: varColor + '18', borderColor: varColor + '44' },
          ]}
        >
          <View style={[s.varietyDot, { backgroundColor: varColor }]} />
          <Text style={[s.varietyName, { color: varColor }]}>{item.result ?? 'Unknown'}</Text>
        </View>
        <View style={s.metaRow}>
          <Ionicons name="analytics-outline" size={13} color={C.text3} />
          <Text style={s.metaTxt}>Confidence: {confidence}%</Text>
        </View>
        {item.stage && (
          <View style={s.metaRow}>
            <Ionicons name="layers-outline" size={13} color={C.text3} />
            <Text style={s.metaTxt}>Stage: {item.stage}</Text>
          </View>
        )}
        <View style={s.metaRow}>
          <Ionicons name="time-outline" size={13} color={C.text3} />
          <Text style={s.metaTxt}>
            {item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={C.hint} style={s.chevron} />
    </TouchableOpacity>
  );
}

export default function VarietyHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('variety_history');
      setHistory(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.warn('Failed to load variety history:', e);
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const handleClear = useCallback(() => {
    Alert.alert('Clear History', 'Delete all scan records? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('variety_history');
          setHistory([]);
        },
      },
    ]);
  }, []);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <LinearGradientHeader />
        <View style={s.headerContent}>
          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>Scan History</Text>
            <Text style={s.headerSub}>
              {history.length} record{history.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity style={s.clearBtn} onPress={handleClear} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={16} color={C.error} />
              <Text style={s.clearBtnTxt}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={history.length === 0 ? s.emptyContainer : s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadHistory();
            }}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        ListEmptyComponent={
          !loading && (
            <EmptyState
              emoji="📋"
              title="No Scans Yet"
              subtitle={'Identify a pepper leaf variety to\nsee your history here.'}
            />
          )
        }
        renderItem={({ item }) => (
          <HistoryItem
            item={item}
            onPress={() =>
              navigation.navigate('VarietyInfo', {
                variety: item.result,
                result: item,
              })
            }
          />
        )}
      />

      <BottomNav navigation={navigation} active="Variety" />
    </View>
  );
}

// Simple gradient bar — no dark tokens needed
function LinearGradientHeader() {
  const { LinearGradient } = require('expo-linear-gradient');
  return <LinearGradient colors={[C.gradStart, C.gradEnd]} style={s.gradBar} />;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  gradBar: { height: 4 },

  header: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    ...SHADOW.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {},
  headerTitle: { fontSize: 20, fontWeight: '900', color: C.text },
  headerSub: { fontSize: 12, color: C.text3, marginTop: 2 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.error + '33',
  },
  clearBtnTxt: { color: C.error, fontSize: 12, fontWeight: '700' },

  list: { padding: 16, paddingBottom: 24 },
  emptyContainer: { flex: 1, justifyContent: 'center' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW.xs,
  },
  thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: C.surface2 },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: C.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: { flex: 1, marginLeft: 12, gap: 5 },
  chevron: { marginLeft: 4 },

  varietyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    marginBottom: 2,
  },
  varietyDot: { width: 6, height: 6, borderRadius: 3 },
  varietyName: { fontSize: 13, fontWeight: '800' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTxt: { fontSize: 11, color: C.text3 },
});
