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

const FULL_SPLASH_BG = require('../../img_1795099375380.png');
const TS_LOGO = require('../../img_1795099381934.png');
const GLOBE_GRAPHIC = require('../../img_1795099387435.png');
const APEX_LOGO = require('../../img_1795099393138.png');

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
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

      {/* Full-screen base layer */}
      <Image
        source={FULL_SPLASH_BG}
        style={styles.fullBgImage}
        resizeMode="cover"
      />
      <View style={styles.darkOverlay} />

      <Animated.View
        style={[
          styles.foreground,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* TS Logo */}
        <View style={styles.tsCircle}>
          <Image
            source={TS_LOGO}
            style={styles.tsImage}
            resizeMode="cover"
          />
        </View>

        {/* Brand & Taglines */}
        <View style={styles.brandBlock}>
          <View style={styles.brandRow}>
            <Text style={styles.tradeText}>Trade </Text>
            <Text style={styles.setuuText}>SETUU</Text>
          </View>
          <Text style={styles.mainTagline}>
            Global Trade & Logistics Ecosystem
          </Text>
          <View style={styles.divider} />
          <Text style={styles.subTagline}>Connect • Trade • Ship • Grow</Text>
        </View>

        {/* Globe Layer */}
        <View style={styles.globeBox}>
          <Image
            source={GLOBE_GRAPHIC}
            style={styles.globeImage}
            resizeMode="contain"
          />
        </View>

        {/* Footer — Apex Sync Logo without White Frame */}
        <View style={styles.footer}>
          <Text style={styles.poweredBy}>Powered by</Text>
          <View style={styles.apexRow}>
            <View style={styles.apexClip}>
              <Image
                source={APEX_LOGO}
                style={styles.apexImage}
                resizeMode="cover"
              />
            </View>
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
  fullBgImage: {
    position: 'absolute',
    width,
    height,
    top: 0,
    left: 0,
    opacity: 0.35,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 17, 0.72)',
  },
  foreground: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  tsCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
    backgroundColor: '#050811',
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
    fontSize: 32,
    fontWeight: '800',
  },
  setuuText: {
    color: '#2DD4BF',
    fontSize: 32,
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
  globeBox: {
    width: width,
    height: 210,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  globeImage: {
    width: width * 1.08,
    height: 210,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  apexClip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#050811',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  apexImage: {
    width: 58,
    height: 58,
  },
  apexName: {
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
