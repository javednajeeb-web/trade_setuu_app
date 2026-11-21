import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
} from 'react-native';
import { SERVICE_HUB_TILES } from '../data/serviceHubTiles';

export default function ServiceHubScreen({ onOpenService }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTile, setActiveTile] = useState(null);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(SERVICE_HUB_TILES.map((item) => item.category))
    );
    return ['All', ...unique];
  }, []);

  const filteredTiles = useMemo(() => {
    return SERVICE_HUB_TILES.filter((tile) => {
      const matchesCategory =
        selectedCategory === 'All' || tile.category === selectedCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        tile.title.toLowerCase().includes(q) ||
        tile.subtitle.toLowerCase().includes(q) ||
        tile.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  const handleTilePress = (tile) => {
    if (typeof onOpenService === 'function') {
      onOpenService(tile);
    }
    setActiveTile(tile);
  };

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
            20 specialized trade, logistics, compliance & market tools
          </Text>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search service (e.g. DocForge, Freight, Mandi, HS Code)..."
            placeholderTextColor="#64748B"
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            Showing {filteredTiles.length} of {SERVICE_HUB_TILES.length} services
          </Text>
          <Text style={styles.metaBrand}>Apex Sync</Text>
        </View>

        <View style={styles.grid}>
          {filteredTiles.map((tile) => {
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
                <Text style={styles.tileSubtitle} numberOfLines={2}>
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

      <Modal
        visible={Boolean(activeTile)}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveTile(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {activeTile && (
              <>
                <Text style={styles.modalCategory}>
                  {activeTile.category} • #{activeTile.code}
                </Text>
                <Text style={styles.modalTitle}>{activeTile.title}</Text>
                <Text style={styles.modalDesc}>{activeTile.subtitle}</Text>
                <Text style={styles.modalNote}>
                  Module key: {activeTile.actionType}
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setActiveTile(null)}
                  >
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => setActiveTile(null)}
                  >
                    <Text style={styles.primaryBtnText}>Ready</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13.5,
  },
  clearBtn: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  chipsRow: {
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(45, 212, 191, 0.16)',
    borderColor: '#2DD4BF',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#2DD4BF',
    fontWeight: '700',
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
    minHeight: 146,
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
    fontSize: 14.5,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0B1120',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(243, 210, 122, 0.35)',
  },
  modalCategory: {
    color: '#D4AF37',
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalDesc: {
    color: '#CBD5E1',
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 10,
  },
  modalNote: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 10,
  },
  closeBtnText: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 13,
  },
  primaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2DD4BF',
  },
  primaryBtnText: {
    color: '#050811',
    fontWeight: '800',
    fontSize: 13,
  },
});
