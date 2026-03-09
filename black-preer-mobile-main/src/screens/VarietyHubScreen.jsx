import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const MENU_ITEMS = [
  {
    title: 'Identify Leaf',
    subtitle: 'Scan a black pepper leaf and predict its variety using AI',
    icon: 'camera-outline',
    accent: '#2d7a4f',
    lightAccent: '#e8f5ee',
    borderAccent: '#b8dfc9',
    badge: 'AI Powered',
    navigate: 'VarietyIdentify',
  },
  {
    title: 'Variety Info',
    subtitle: 'Explore detailed profiles of black pepper varieties',
    icon: 'book-outline',
    accent: '#1a6b8a',
    lightAccent: '#e5f4fa',
    borderAccent: '#a8d8ea',
    badge: 'Encyclopedia',
    navigate: 'VarietyInfo',
  },
  {
    title: 'Scan History',
    subtitle: 'Review previous scan results and prediction records',
    icon: 'time-outline',
    accent: '#6b4fa0',
    lightAccent: '#f0eaf8',
    borderAccent: '#c9b8e8',
    badge: 'Records',
    navigate: 'VarietyHistory',
  },
];

const cardShadow = Platform.select({
  ios:     { shadowColor: '#0f2618', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.09, shadowRadius: 18 },
  android: { elevation: 5 },
  web:     { boxShadow: '0px 6px 24px rgba(15,38,24,0.09)' },
});

const iconShadow = Platform.select({
  ios:     { shadowColor: '#0f2618', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  android: { elevation: 4 },
  web:     { boxShadow: '0px 4px 16px rgba(15,38,24,0.1)' },
});

function MenuCard({ item, onPress, animValue, isWide, cardWidth }) {
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <Animated.View
      style={[
        { opacity: animValue, transform: [{ translateY }] },
        isWide ? { width: cardWidth, marginBottom: 0 } : { width: '100%' },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.menuCard,
          {
            borderColor: item.borderAccent,
            backgroundColor: '#ffffff',
          },
          cardShadow,
        ]}
        onPress={onPress}
        activeOpacity={0.86}
      >
        {/* Top row: icon + badge */}
        <View style={styles.cardTopRow}>
          <View style={[styles.cardIconWrap, { backgroundColor: item.lightAccent }]}>
            <Ionicons name={item.icon} size={26} color={item.accent} />
          </View>
          <View style={[styles.cardBadge, { backgroundColor: item.lightAccent, borderColor: item.borderAccent }]}>
            <View style={[styles.badgeDot, { backgroundColor: item.accent }]} />
            <Text style={[styles.cardBadgeText, { color: item.accent }]}>{item.badge}</Text>
          </View>
        </View>

        {/* Text */}
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

        {/* Bottom CTA */}
        <View style={[styles.cardCta, { borderTopColor: item.borderAccent }]}>
          <Text style={[styles.cardCtaText, { color: item.accent }]}>Get started</Text>
          <View style={[styles.ctaArrow, { backgroundColor: item.lightAccent }]}>
            <Ionicons name="arrow-forward" size={14} color={item.accent} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function VarietyHubScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const isSmall  = width < 480;
  const isMedium = width >= 480 && width < 900;
  const isLarge  = width >= 900;

  const pagePadding   = isSmall ? 18 : isLarge ? 60 : 28;
  const maxContent    = 1000;
  const availableWidth = Math.min(width - pagePadding * 2, maxContent);
  const cardGap       = 16;
  const numCols       = isLarge ? 3 : isMedium ? 2 : 1;
  const cardWidth     = numCols === 1
    ? availableWidth
    : numCols === 2
    ? (availableWidth - cardGap) / 2
    : (availableWidth - cardGap * 2) / 3;

  // Animations
  const heroAnim  = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(0))).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();

    Animated.stagger(
      120,
      cardAnims.map(anim =>
        Animated.timing(anim, { toValue: 1, duration: 480, useNativeDriver: true })
      )
    ).start();
  }, []);

  const heroTranslate = heroAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f7f2" />
      <LinearGradient
        colors={['#f0f7f2', '#e4f0e8', '#d6e9dc']}
        style={styles.gradient}
      >
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: pagePadding },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.heroSection,
                { opacity: heroAnim, transform: [{ translateY: heroTranslate }] },
                isLarge && styles.heroSectionLarge,
              ]}
            >
              {/* Module badge */}
              <View style={styles.moduleBadge}>
                <Ionicons name="leaf" size={13} color="#2d7a4f" />
                <Text style={styles.moduleBadgeText}>Variety Module</Text>
              </View>

              {/* Logo */}
              <Animated.View style={[styles.heroIconCircle, iconShadow, { transform: [{ scale: logoScale }] }]}>
                <LinearGradient
                  colors={['#e8f5ee', '#d0ebda']}
                  style={styles.heroIconGradient}
                >
                  <Ionicons name="leaf" size={36} color="#2d7a4f" />
                </LinearGradient>
              </Animated.View>

              <Text style={[
                styles.heroTitle,
                isSmall && { fontSize: 24 },
                isLarge && { fontSize: 38 },
              ]}>
                Black Pepper{'\n'}
                <Text style={styles.heroTitleAccent}>Variety Hub</Text>
              </Text>

              <Text style={[
                styles.heroSubtitle,
                isLarge && { fontSize: 16, maxWidth: 560 },
              ]}>
                Identify leaf varieties, explore detailed variety profiles, and
                keep track of all your previous scan records — all in one place.
              </Text>

              {/* Stats strip */}
              <View style={[styles.statsStrip, cardShadow]}>
                {[
                  { val: '3',    label: 'Features'   },
                  { val: '97%',  label: 'Accuracy'   },
                  { val: 'AI',   label: 'Powered'    },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <View style={styles.statsDivider} />}
                    <View style={styles.statItem}>
                      <Text style={styles.statVal}>{s.val}</Text>
                      <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </Animated.View>

            {/* SECTION LABEL */}
            <Animated.View style={[styles.sectionLabelRow, { opacity: cardAnims[0] }]}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionLabel}>Choose a Feature</Text>
            </Animated.View>

            {/* MENU CARDS */}
            {numCols === 1 ? (
              // Single column — mobile
              <View style={styles.cardList}>
                {MENU_ITEMS.map((item, i) => (
                  <MenuCard
                    key={item.navigate}
                    item={item}
                    onPress={() => navigation.navigate(item.navigate)}
                    animValue={cardAnims[i]}
                    isWide={false}
                    cardWidth={cardWidth}
                  />
                ))}
              </View>
            ) : (
              // Multi-column — tablet / desktop
              <View style={[styles.cardGrid, { gap: cardGap }]}>
                {MENU_ITEMS.map((item, i) => (
                  <MenuCard
                    key={item.navigate}
                    item={item}
                    onPress={() => navigation.navigate(item.navigate)}
                    animValue={cardAnims[i]}
                    isWide={true}
                    cardWidth={cardWidth}
                  />
                ))}
              </View>
            )}

            {/* ── FOOTER ── */}
            <Animated.View style={[styles.footer, { opacity: heroAnim }]}>
              <Ionicons name="information-circle-outline" size={14} color="#7a9985" />
              <Text style={styles.footerText}>
                Designed to support quick and easy black pepper variety analysis.
              </Text>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f7f2',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Blobs
  blob1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#5db87a',
    opacity: 0.1,
    top: -80,
    right: -60,
  },
  blob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#a8d5b5',
    opacity: 0.13,
    bottom: 80,
    left: -50,
  },

  // Hero
  heroSection: {
    width: '100%',
    maxWidth: 1000,
    alignItems: 'center',
    marginBottom: 32,
  },
  heroSectionLarge: {
    paddingHorizontal: 4,
  },

  moduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c8e2d2',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#0f2618', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 8px rgba(15,38,24,0.06)' },
    }),
  },
  moduleBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2d7a4f',
    letterSpacing: 0.2,
  },

  heroIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c8e2d2',
  },
  heroIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0f2618',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroTitleAccent: {
    color: '#2d7a4f',
  },
  heroSubtitle: {
    fontSize: 14.5,
    color: '#4a6857',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 480,
    marginBottom: 24,
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#d4e9db',
    gap: 0,
  },
  statsDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#deeee5',
    marginHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2d7a4f',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b8c78',
    marginTop: 2,
  },

  // Section label
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 1000,
    marginBottom: 16,
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2d7a4f',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2d7a4f',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Cards — single column
  cardList: {
    width: '100%',
    maxWidth: 1000,
    gap: 14,
  },

  // Cards — multi-column
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: 1000,
    justifyContent: 'flex-start',
  },

  // Individual card
  menuCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 20,
    flex: 1,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f2618',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#5a7a66',
    lineHeight: 20,
    marginBottom: 16,
  },

  // CTA row at bottom of card
  cardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 14,
  },
  cardCtaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer
  footer: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12.5,
    color: '#7a9985',
    textAlign: 'center',
    lineHeight: 18,
  },
});