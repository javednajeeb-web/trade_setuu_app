import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, StatusBar } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
      <Image
        source={require('../../1795099387435.png')}
        style={s.globeBg}
        resizeMode="cover"
      />
      <SafeAreaView style={s.overlay}>
        <View style={s.topSection}>
          <Image
            source={require('../../1795099375380.png')}
            style={s.tsLogo}
            resizeMode="contain"
          />
          <Text style={s.brandTitle}>
            Trade <Text style={s.brandTeal}>SETUU</Text>
          </Text>
          <Text style={s.subTag}>Global Trade & Logistics Ecosystem</Text>
          <View style={s.divider} />
          <Text style={s.pillars}>Connect  •  Trade  •  Ship  •  Grow</Text>
        </View>

        <View style={s.footer}>
          <Text style={s.poweredLabel}>Powered by</Text>
          <View style={s.apexRow}>
            <Image
              source={require('../../1795099381934.png')}
              style={s.apexLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={s.apexMain}>Apex Sync</Text>
              <Text style={s.apexSub}>Technologies</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0D12' },
  globeBg: { position: 'absolute', bottom: 40, width: '100%', height: '48%', opacity: 0.92 },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  topSection: { alignItems: 'center', marginTop: 28 },
  tsLogo: { width: 118, height: 118, marginBottom: 16 },
  brandTitle: { fontSize: 34, fontWeight: '800', color: '#D9DDE3', letterSpacing: 0.6 },
  brandTeal: { color: '#00D2C4' },
  subTag: { fontSize: 13, color: '#D9DDE3', marginTop: 6, letterSpacing: 0.4 },
  divider: { width: 44, height: 1, backgroundColor: '#8A8F98', marginVertical: 12, opacity: 0.6 },
  pillars: { fontSize: 13, fontWeight: '600', color: '#C9B89A', letterSpacing: 0.8 },
  footer: { alignItems: 'center', marginBottom: 6 },
  poweredLabel: { fontSize: 11, color: '#D9DDE3', marginBottom: 6, opacity: 0.85 },
  apexRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  apexLogo: { width: 32, height: 32 },
  apexMain: { fontSize: 15, fontWeight: '700', color: '#D9DDE3', lineHeight: 17 },
  apexSub: { fontSize: 11, color: '#8A8F98', letterSpacing: 0.6 },
});
