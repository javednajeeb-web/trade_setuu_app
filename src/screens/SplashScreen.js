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

const TS_LOGO = require('../../img_1795099375380.png');
const GLOBE_GRAPHIC = require('../../img_1795099387435.png');
const APEX_LOGO = require('../../IMG_20261121_123036.png');

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (typeof onFinish === 'function') {
        onFinish();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050811" />

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Top TS Logo */}
        <View style={styles.tsWrapper}>
          <Image
            source={TS_LOGO}
            style={styles.tsImage}
            resizeMode="contain"
          />
        </View>

        {/* Title & Taglines */}
        <View style={styles.brandBlock}>
          <View style={styles.brandRow}>
            <Text style={styles.tradeText}>Trade </Text>
            <Text style={styles.setuuText}>SETUU</Text>
          </View>
          <Text style={styles.mainTagline}>
            Global Trade & Logistics Ecosystem
          </Text>
          <Text style={styles.subTagline}>Connect • Trade • Ship • Grow</Text>
        </View>

        {/* Globe Graphic — Blended seamlessly without square box */}
        <View style={styles.globeWrapper}>
          <Image
            source={GLOBE_GRAPHIC}
            style={styles.globeImage}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Footer — Golden Metallic Styling */}
        <View style={styles.footer}>
          <Text style={styles.poweredBy}>Powered by</Text>
          <View style={styles.apexRow}>
            <Image
              source={APEX_LOGO}
              style={styles.apexImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.apexName}>Apex Sync</Text>
              <Text style={styles.apexSub}>Technologies</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050811',
  },
  container: {
    flex: 1,
    backgroundColor: '#050811',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  tsWrapper: {
    width: 124,
    height: 124,
    borderRadius: 62,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tsImage: {
    width: 124,
    height: 124,
  },
  brandBlock: {
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tradeText: {
    color: '#F8FAFC',
    fontSize: 34,
    fontWeight: '800',
  },
  setuuText: {
    color: '#2DD4BF',
    fontSize: 34,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  mainTagline: {
    color: '#E2E8F0',
    fontSize: 13.5,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  subTagline: {
    color: '#F8FAFC',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 12,
    textAlign: 'center',
  },
  globeWrapper: {
    width: width,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globeImage: {
    width: width,
    height: 220,
  },
  footer: {
    alignItems: 'center',
  },
  poweredBy: {
    color: '#C9A23F',
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  apexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apexImage: {
    width: 38,
    height: 38,
    marginRight: 8,
  },
  apexName: {
    color: '#E6C36A',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 18,
    textShadowColor: 'rgba(138, 102, 22, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  apexSub: {
    color: '#C59B37',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.8,
    lineHeight: 13,
    textShadowColor: 'rgba(110, 78, 14, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2.5,
  },
});
