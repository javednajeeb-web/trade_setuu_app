import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import DocForgeMakerScreen from './DocForgeMakerScreen';
import ChaCustomsScreen from './ChaCustomsScreen';
import PrePostCreditScreen from './PrePostCreditScreen';
import EcgCreditCoverScreen from './EcgCreditCoverScreen';
import MarineInsuranceScreen from './MarineInsuranceScreen';
import TradeFinanceDeskScreen from './TradeFinanceDeskScreen';
import BlindDealRoomScreen from './BlindDealRoomScreen';

const ACTIVE_HUB_TILES = [
  {
    id: 'doc_forge_maker',
    code: '01',
    title: 'DocForge Maker',
    subtitle: 'PI, LOI, PO, CI & PL drafts with separate document fields',
    category: 'Documentation',
    badge: 'READY',
    accent: '#2DD4BF',
    actionType: 'DOC_FORGE',
  },
  {
    id: 'cha_customs',
    code: '02',
    title: 'CHA & Customs',
    subtitle: 'Export Shipping Bill & Import BOE clearance brief with attached docs',
    category: 'Compliance',
    badge: 'NEW',
    accent: '#F3D27A',
    actionType: 'CHA_CUSTOMS',
  },  
  {
    id: 'pre_post_credit',
    code: '03',
    title: 'Pre & Post Credit',
    subtitle: 'Packing credit & post-shipment finance brief',
    category: 'Trade Finance',
    badge: 'NEW',
    accent: '#2DD4BF',
    actionType: 'PRE_POST_CREDIT',
  },
  {
    id: 'ecg_credit_cover',
    code: '04',
    title: 'ECGC Credit Cover',
    subtitle: 'Buyer limit & policy/claim brief • Coming Soon live sync',
    category: 'Credit Risk',
    badge: 'BETA',
    accent: '#F3D27A',
    actionType: 'ECG_CREDIT_COVER',
  },
  {
    id: 'marine_insurance',
    code: '05',
    title: 'Marine Insurance',
    subtitle: 'Cargo cover & claim brief • Coming Soon live policy',
    category: 'Cargo Insurance',
    badge: 'BETA',
    accent: '#2DD4BF',
    actionType: 'MARINE_INSURANCE',
  },
  { 
    title: 'Trade Finance Desk',
    subtitle: 'LC, BG/SBLC, buyer/supply credit & partner brief',
    category: 'Trade Finance',
    badge: 'BETA',
    accent: '#2DD4BF',
    actionType: 'TRADE_FINANCE_DESK',
  },
  {
    title: 'Blind Deal Room',
    subtitle: 'Protected deal workspace',
    category: 'Deal Room',
    badge: 'SOON',
    accent: '#F3D27A',
    actionType: 'BLIND_DEAL_ROOM',
    enabled: true,
   },
    
];

export default function ServiceHubScreen({ onOpenService }) {
  const [openScreenKey, setOpenScreenKey] = useState(null);

  const handleTilePress = (tile) => {
    if (typeof onOpenService === 'function') {
      onOpenService(tile);
    }
    setOpenScreenKey(tile.actionType);
  };

  if (openScreenKey === 'DOC_FORGE') {
    return <DocForgeMakerScreen onBack={() => setOpenScreenKey(null)} />;
  }

  if (openScreenKey === 'CHA_CUSTOMS') {
    return <ChaCustomsScreen onBack={() => setOpenScreenKey(null)} />;
  }
  if (openScreenKey === 'PRE_POST_CREDIT') {
    return <PrePostCreditScreen onBack={() => setOpenScreenKey(null)} />;
  }
  if (openScreenKey === 'ECG_CREDIT_COVER') {
    return <EcgCreditCoverScreen onBack={() => setOpenScreenKey(null)} />;
  }
  if (openScreenKey === 'MARINE_INSURANCE') {
    return <MarineInsuranceScreen onBack={() => setOpenScreenKey(null)} />;
  }
  if (openScreenKey === 'TRADE_FINANCE_DESK') {
    return <TradeFinanceDeskScreen onBack={() => setOpenScreenKey(null)} />;
  }
  if (openScreenKey === 'BLIND_DEAL_ROOM') {
  return <BlindDealRoomScreen onBack={() => setOpenScreenKey(null)} />;
}
  
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050811" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>TRADE SETUU ECOSYSTEM</Text>
          <View style={styles.titleRow}>
            <Text style={styles.titleMain}>Service </Text>
            <Text style={styles.titleGold}>Hub</Text>
          </View>
          <Text style={styles.subtitle}>
            Modular service screens — building tiles step by step
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            Showing {ACTIVE_HUB_TILES.length} prepared service tiles
          </Text>
          <Text style={styles.metaBrand}>Apex Sync</Text>
        </View>

        <View style={styles.grid}>
          {ACTIVE_HUB_TILES.map((tile) => {
            const isGold = tile.accent === '#F3D27A';
            return (
              <TouchableOpacity
                key={tile.id}
                activeOpacity={0.82}
                onPress={() => handleTilePress(tile)}
                style={[
                  styles.tileCard,
                  {
                    borderColor: isGold
                      ? 'rgba(243, 210, 122, 0.28)'
                      : 'rgba(45, 212, 191, 0.24)',
                  },
                ]}
              >
                <View style={styles.tileTopRow}>
                  <Text
                    style={[
                      styles.tileCode,
                      { color: isGold ? '#F3D27A' : '#2DD4BF' },
                    ]}
                  >
                    #{tile.code}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isGold
                          ? 'rgba(212, 175, 55, 0.16)'
                          : 'rgba(45, 212, 191, 0.14)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: isGold ? '#F3D27A' : '#2DD4BF' },
                      ]}
                    >
                      {tile.badge}
                    </Text>
                  </View>
                </View>

                <Text style={styles.tileTitle} numberOfLines={2}>
                  {tile.title}
                </Text>
                <Text style={styles.tileSubtitle} numberOfLines={3}>
                  {tile.subtitle}
                </Text>

                <View style={styles.tileFooter}>
                  <Text style={styles.tileCategory}>{tile.category}</Text>
                  <Text
                    style={[
                      styles.openArrow,
                      { color: isGold ? '#F3D27A' : '#2DD4BF' },
                    ]}
                  >
                    Open →
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050811',
  },
  scrollContent: {
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 14,
  },
  kicker: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleMain: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
  },
  titleGold: {
    color: '#F3D27A',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    color: '#64748B',
    fontSize: 12,
  },
  metaBrand: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tileCard: {
    width: '48.5%',
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    minHeight: 158,
    justifyContent: 'space-between',
  },
  tileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileCode: {
    fontSize: 12,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tileTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  tileSubtitle: {
    color: '#94A3B8',
    fontSize: 11.5,
    lineHeight: 16,
  },
  tileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.12)',
  },
  tileCategory: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '600',
  },
  openArrow: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
