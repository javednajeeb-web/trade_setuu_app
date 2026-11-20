import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, StatusBar } from 'react-native';

const TS_LOGO = require('../../1795099375380.png');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />

      <Animated.View style={[styles.centerBlock, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.tsRing}>
          <Image source={TS_LOGO} style={styles.tsImage} />
        </View>

        <Text style={styles.brandTitle}>Trade SETUU</Text>
        <Text style={styles.taglineMain}>Global Trade & Logistics Ecosystem</Text>
        <Text style={styles.taglineSub}>Connect • Trade • Ship • Grow</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.apexRow}>
          <View style={styles.apexEmblem}>
            <Text style={styles.apexLetter}>A</Text>
          </View>
          <View>
            <Text style={styles.poweredBy}>Powered by</Text>
            <Text style={styles.apexName}>Apex Sync Technologies</Text>
          </View>
        </View>
        <Text style={styles.apexTagline}>BUILD • CONNECT • AUTOMATE • SCALE GLOBALLY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D12',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tsRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#0B0D12',
    borderWidth: 2,
    borderColor: '#14B8A6',
    overflow: 'hidden',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  brandTitle: {
    color: '#D9DDE3',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  taglineMain: {
    color: '#14B8A6',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 0.4,
  },
  taglineSub: {
    color: '#C9B89A',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 1.5,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#0B0D12',
  },
  apexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0D12',
  },
  apexEmblem: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#131924',
    borderWidth: 1.2,
    borderColor: '#C9B89A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  apexLetter: {
    color: '#D9DDE3',
    fontSize: 15,
    fontWeight: '900',
  },
  poweredBy: {
    color: '#8A8F98',
    fontSize: 9,
    fontWeight: '700',
  },
  apexName: {
    color: '#D9DDE3',
    fontSize: 12,
    fontWeight: '800',
  },
  apexTagline: {
    color: '#8A8F98',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 6,
  },
});
