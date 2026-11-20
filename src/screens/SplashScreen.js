import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';

const TS_LOGO = require('../../116115.png');
const GLOBE_GRAPHIC = require('../../116117.png');
const APEX_LOGO = require('../../116116.png');

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050811" />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Top TS Logo */}
        <View style={styles.tsWrapper}>
          <Image source={TS_LOGO} style={styles.tsImage} />
        </View>

        {/* Brand Title & Taglines */}
        <View style={styles.titleBlock}>
          <View style={styles.brandRow}>
            <Text style={styles.tradeWord}>Trade </Text>
            <Text style={styles.setuuWord}>SETUU</Text>
          </View>
          <Text style={styles.mainTagline}>
            Global Trade & Logistics Ecosystem
          </Text>
          <View style={styles.divider} />
          <Text style={styles.subTagline}>Connect • Trade • Ship • Grow</Text>
        </View>

        {/* Middle Earth / Globe Graphic */}
        <View style={styles.globeWrapper}>
          <Image source={GLOBE_GRAPHIC} style={styles.globeImage} />
        </View>
      </Animated.View>

      {/* Bottom Footer — Apex Sync Logo Masked to Avoid White Border */}
      <View style={styles.footer}>
        <Text style={styles.poweredBy}>Powered by</Text>
        <View style={styles.apexRow}>
          <View style={styles.apexMask}>
            <Image source={APEX_LOGO} style={styles.apexImage} />
          </View>
          <View>
            <Text style={styles.apexTitle}>Apex Sync</Text>
            <Text style={styles.apexSub}>Technologies</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050811',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 42,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tsWrapper: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
    backgroundColor: '#050811',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  tsImage: {
    width: 124,
    height: 124,
    resizeMode: 'cover',
  },
  titleBlock: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tradeWord: {
    color: '#F1F5F9',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  setuuWord: {
    color: '#2DD4BF',
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0.8,
  },
  mainTagline: {
    color: '#E2E8F0',
    fontSize: 13.5,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  divider: {
    width: 44,
    height: 1.5,
    backgroundColor: 'rgba(226, 232, 240, 0.35)',
    marginVertical: 10,
  },
  subTagline: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  globeWrapper: {
    width: width,
    height: 230,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050811',
  },
  globeImage: {
    width: width * 1.12,
    height: 245,
    resizeMode: 'cover',
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#050811',
    paddingTop: 4,
  },
  poweredBy: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  apexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apexMask: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: '#050811',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  apexImage: {
    width: 58,
    height: 58,
    resizeMode: 'cover',
  },
  apexTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 17,
  },
  apexSub: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    lineHeight: 13,
  },
});
