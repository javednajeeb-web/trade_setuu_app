import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Share,
  Alert,
  BackHandler,
} from 'react-native';

const SAMPLE_MARKET_ITEMS = [
  {
    id: 'mp-1',
    commodity: 'Maize (Hybrid)',
    category: 'Grains',
    market: 'Nagpur APMC',
    state: 'Maharashtra',
    country: 'India',
    marketScope: 'local',
    price: 2300,
    unit: '/ Qtl',
    currency: '₹',
    changePct: '+1.8%',
    isPositive: true,
    minPrice: 2200,
    modalPrice: 2300,
    maxPrice: 2500,
    source: 'Agmarknet / Mandi Feed (Sample)',
    dataUpdatedAt: '26 Nov 2026, 04:30 PM IST',
    analysisGeneratedAt: '26 Nov 2026, 07:30 PM IST',
    history: {
      '7D': [2210, 2225, 2240, 2235, 2260, 2258, 2300],
      '30D': [2140, 2175, 2200, 2255, 2300],
      '90D': [2050, 2120, 2190, 2260, 2300],
      '1Y': [1920, 2040, 2150, 2220, 2300],
    },
    nearbyMarkets: [
      { name: 'Nagpur APMC', price: '₹2,300 / Qtl' },
      { name: 'Raipur Mandi', price: '₹2,265 / Qtl' },
      { name: 'Indore Mandi', price: '₹2,290 / Qtl' },
    ],
    fobReference: 'Yellow Maize FOB Kakinada / Vizag — Indicative Export Lane',
  },
  {
    id: 'mp-2',
    commodity: 'Wheat (Sharbati / FAQ)',
    category: 'Grains',
    market: 'Indore Mandi',
    state: 'Madhya Pradesh',
    country: 'India',
    marketScope: 'local',
    price: 2520,
    unit: '/ Qtl',
    currency: '₹',
    changePct: '+2.4%',
    isPositive: true,
    minPrice: 2440,
    modalPrice: 2520,
    maxPrice: 2610,
    source: 'MP Mandi Board Feed (Sample)',
    dataUpdatedAt: '26 Nov 2026, 03:45 PM IST',
    analysisGeneratedAt: '26 Nov 2026, 07:30 PM IST',
    history: {
      '7D': [2420, 2435, 2450, 2465, 2480, 2461, 2520],
      '30D': [2360, 2395, 2430, 2475, 2520],
      '90D': [2290, 2340, 2410, 2485, 2520],
      '1Y': [2180, 2260, 2350, 2440, 2520],
    },
    nearbyMarkets: [
      { name: 'Indore Mandi', price: '₹2,520 / Qtl' },
      { name: 'Bhopal APMC', price: '₹2,495 / Qtl' },
      { name: 'Kota Mandi', price: '₹2,510 / Qtl' },
    ],
    fobReference: 'Domestic Mill & Flour Demand — Check Export Policy / Port Lane',
  },
  {
    id: 'mp-3',
    commodity: 'Rice (1121 Sella / Raw)',
    category: 'Agriculture',
    market: 'Raipur Market',
    state: 'Chhattisgarh',
    country: 'India',
    marketScope: 'local',
    price: 3100,
    unit: '/ Qtl',
    currency: '₹',
    changePct: '−0.8%',
    isPositive: false,
    minPrice: 3020,
    modalPrice: 3100,
    maxPrice: 3210,
    source: 'CG Market Feed (Sample)',
    dataUpdatedAt: '26 Nov 2026, 05:00 PM IST',
    analysisGeneratedAt: '26 Nov 2026, 07:30 PM IST',
    history: {
      '7D': [3160, 3150, 3140, 3130, 3125, 3125, 3100],
      '30D': [3040, 3080, 3135, 3120, 3100],
      '90D': [2960, 3020, 3090, 3125, 3100],
      '1Y': [2850, 2940, 3010, 3080, 3100],
    },
    nearbyMarkets: [
      { name: 'Raipur Market', price: '₹3,100 / Qtl' },
      { name: 'Dhamtari Mandi', price: '₹3,065 / Qtl' },
      { name: 'Bhatapara Mandi', price: '₹3,080 / Qtl' },
    ],
    fobReference: 'Parboiled / Basmati FOB Mundra & Kandla — Buyer Quote Basis',
  },
  {
    id: 'mp-4',
    commodity: 'Copper Cathode (LME Ref)',
    category: 'Metals',
    market: 'LME Global Benchmark',
    state: 'Global',
    country: 'Global',
    marketScope: 'global',
    price: 9140,
    unit: '/ MT',
    currency: '$',
    changePct: '+1.2%',
    isPositive: true,
    minPrice: 8990,
    modalPrice: 9140,
    maxPrice: 9230,
    source: 'Global Metal Benchmark (Sample)',
    dataUpdatedAt: '26 Nov 2026, 06:15 PM IST',
    analysisGeneratedAt: '26 Nov 2026, 07:30 PM IST',
    history: {
      '7D': [8960, 9010, 8995, 9050, 9080, 9031, 9140],
      '30D': [8810, 8890, 8950, 9040, 9140],
      '90D': [8600, 8750, 8880, 9010, 9140],
      '1Y': [8250, 8490, 8720, 8940, 9140],
    },
    nearbyMarkets: [
      { name: 'LME Benchmark', price: '$9,140 / MT' },
      { name: 'MCX India Ref', price: '₹8,12,500 / MT' },
    ],
    fobReference: 'Global Industrial Metal Reference — Freight & Duty Extra',
  },
];

const CATEGORIES = ['All', 'Agriculture', 'Grains', 'Vegetables', 'Spices', 'Metals', 'Energy'];

export default function MarketPulseScreen({ theme = 'dark', externalItems, onBackToApp }) {
  const isDark = theme !== 'light';

  const C = {
    bg: isDark ? '#071521' : '#F3F5F8',
    card: isDark ? '#102738' : '#FFFFFF',
    cardAlt: isDark ? '#0B1D2C' : '#F8FAFC',
    border: isDark ? '#1E3E54' : '#E2E8F0',
    text: isDark ? '#DCE8EF' : '#0F172A',
    sub: isDark ? '#8FAAC0' : '#64748B',
    teal: '#20C8C1',
    amber: '#F59E0B',
    ok: '#4ADE80',
    warn: '#F87171',
  };

  const items = Array.isArray(externalItems) && externalItems.length > 0 ? externalItems : SAMPLE_MARKET_ITEMS;

  // Sub-view state inside MarketPulseScreen ('list' | 'detail')
  const [subView, setSubView] = useState('list');
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || 'mp-1');
  const [historyRange, setHistoryRange] = useState('7D');

  // Filters & Search
  const [marketTab, setMarketTab] = useState('local'); // 'local' | 'global'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStateFilter, setSelectedStateFilter] = useState('All States');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickerCollapsed, setTickerCollapsed] = useState(false);

  // Share Report & Price Alert Modals
  const [shareModalItem, setShareModalItem] = useState(null);
  const [shareFormat, setShareFormat] = useState('image_card'); // 'image_card' | 'full_report'
  const [alertModalItem, setAlertModalItem] = useState(null);
  const [alertDirection, setAlertDirection] = useState('Falls Below'); // 'Falls Below' | 'Rises Above' | '% Move'
  const [alertTargetVal, setAlertTargetVal] = useState('');
  const [alertFrequency, setAlertFrequency] = useState('Once'); // 'Once' | 'Every time'
  const [savedAlerts, setSavedAlerts] = useState([]);

  const handleBack = useCallback(() => {
    if (shareModalItem) {
      setShareModalItem(null);
      return true;
    }
    if (alertModalItem) {
      setAlertModalItem(null);
      return true;
    }
    if (subView === 'detail') {
      setSubView('list');
      return true;
    }
    if (typeof onBackToApp === 'function') {
      onBackToApp();
      return true;
    }
    return false;
  }, [shareModalItem, alertModalItem, subView, onBackToApp]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => handleBack());
    return () => sub.remove();
  }, [handleBack]);

  const stateOptions = useMemo(() => {
    const set = new Set(['All States']);
    items.forEach((it) => {
      if (it.state && it.state !== 'Global') set.add(it.state);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const scopeMatch =
        q.length > 0 || selectedStateFilter !== 'All States'
          ? true
          : marketTab === 'local'
            ? it.marketScope !== 'global'
            : it.marketScope === 'global';

      const catMatch = selectedCategory === 'All' || it.category === selectedCategory;
      const stateMatch =
        selectedStateFilter === 'All States' ||
        (it.state && it.state.toLowerCase() === selectedStateFilter.toLowerCase());

      const textMatch =
        !q ||
        (it.commodity && it.commodity.toLowerCase().includes(q)) ||
        (it.market && it.market.toLowerCase().includes(q)) ||
        (it.state && it.state.toLowerCase().includes(q)) ||
        (it.category && it.category.toLowerCase().includes(q));

      return scopeMatch && catMatch && stateMatch && textMatch;
    });
  }, [items, searchQuery, selectedStateFilter, marketTab, selectedCategory]);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) || filteredItems[0] || items[0],
    [items, selectedItemId, filteredItems]
  );

  const openCommodityDetail = (item) => {
    setSelectedItemId(item.id);
    setSubView('detail');
  };

  const openShareForItem = (item) => {
    setShareFormat('image_card');
    setShareModalItem(item);
  };

  const openAlertForItem = (item) => {
    setAlertDirection('Falls Below');
    setAlertTargetVal(String(item.price || ''));
    setAlertFrequency('Once');
    setAlertModalItem(item);
  };

  const confirmCreateAlert = () => {
    if (!alertModalItem || !alertTargetVal.trim()) {
      Alert.alert('Enter Target', 'Please enter a target value or percentage.');
      return;
    }
    const rule = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      commodity: alertModalItem.commodity,
      market: alertModalItem.market,
      condition: `${alertDirection} ${alertTargetVal.trim()} ${alertModalItem.currency}`,
      frequency: alertFrequency,
    };
    setSavedAlerts((prev) => [rule, ...prev]);
    setAlertModalItem(null);
    Alert.alert(
      'Alert Rule Saved',
      `${rule.commodity} (${rule.market})\nRule: ${rule.condition} • ${rule.frequency}\nLive push alerts require backend price monitoring.`
    );
  };

  const shareReportPayload = async (item, mode) => {
    const body =
      `TRADE SETUU — Market Pulse Report (${mode === 'full_report' ? 'Full Report' : 'Market Snapshot'})\n` +
      `Commodity: ${item.commodity} (${item.market})\n` +
      `Rate: ${item.currency}${Number(item.price).toLocaleString('en-IN')} ${item.unit} (${item.changePct})\n` +
      `Min / Modal / Max: ${item.currency}${item.minPrice} / ${item.currency}${item.modalPrice} / ${item.currency}${item.maxPrice}\n` +
      `Data updated at: ${item.dataUpdatedAt}\n` +
      `Analysis generated at: ${item.analysisGeneratedAt}\n` +
      `Source: ${item.source}\n` +
      `Indicative market information — verify before trade execution.`;

    try {
      await Share.share({ message: body });
    } catch {
      Alert.alert('Share Report', body);
    }
  };

  const series = selectedItem?.history?.[historyRange] || [2200, 2240, 2280, 2300];
  const maxVal = Math.max(...series);
  const minVal = Math.min(...series);
  const spread = Math.max(1, maxVal - minVal);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 96 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* TOP HEADER */}
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.border }]}>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {subView === 'detail' && (
              <TouchableOpacity onPress={() => setSubView('list')} style={styles.backBtn}>
                <Text style={{ color: C.teal, fontSize: 22, fontWeight: '900' }}>‹</Text>
              </TouchableOpacity>
            )}
            <View>
              <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 }}>
                TRADE SETUU
              </Text>
              <Text style={{ color: C.text, fontSize: 16, fontWeight: '900' }}>
                Market Pulse
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {savedAlerts.length > 0 && (
              <View style={[styles.badgeChip, { backgroundColor: C.cardAlt, borderColor: C.amber }]}>
                <Text style={{ color: C.amber, fontSize: 10, fontWeight: '900' }}>
                  Alerts ({savedAlerts.length})
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setTickerCollapsed((c) => !c)}
              style={[styles.badgeChip, { backgroundColor: C.cardAlt, borderColor: C.border }]}
            >
              <Text style={{ color: C.sub, fontSize: 10, fontWeight: '800' }}>
                {tickerCollapsed ? 'Show Ticker' : 'Hide Ticker'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* =========================================================
          MAIN LIST VIEW — COMPACT RATES, SEARCH & FILTERS
      ========================================================= */}
      {subView === 'list' && (
        <View style={{ padding: 14 }}>
          {/* Compact Ticker Strip */}
          {!tickerCollapsed && (
            <View style={[styles.tickerWrap, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
              <Text style={{ color: C.amber, fontSize: 9, fontWeight: '900', marginBottom: 5 }}>
                MARKET WATCH • INDICATIVE / SAMPLE SNAPSHOT
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {items.slice(0, 4).map((t) => (
                    <TouchableOpacity
                      key={`tk-${t.id}`}
                      onPress={() => openCommodityDetail(t)}
                      style={[styles.tickerPill, { backgroundColor: C.card, borderColor: C.border }]}
                    >
                      <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }} numberOfLines={1}>
                        {t.commodity.split(' ')[0]}
                      </Text>
                      <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900', marginLeft: 5 }}>
                        {t.currency}{Number(t.price).toLocaleString('en-IN')}
                      </Text>
                      <Text
                        style={{
                          color: t.isPositive ? C.ok : C.warn,
                          fontSize: 10,
                          fontWeight: '800',
                          marginLeft: 4,
                        }}
                      >
                        {t.changePct}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Search Bar + Clear */}
          <View style={[styles.searchRow, { backgroundColor: C.card, borderColor: C.border }]}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search commodity, mandi, state (e.g. Nagpur)..."
              placeholderTextColor={C.sub}
              style={{ flex: 1, color: C.text, fontSize: 12, fontWeight: '700', paddingVertical: 4 }}
            />
            {(searchQuery.length > 0 || selectedStateFilter !== 'All States' || selectedCategory !== 'All') && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedStateFilter('All States');
                  setSelectedCategory('All');
                }}
              >
                <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Local Markets vs Global Markets */}
          <View style={[styles.segRow, { backgroundColor: C.card, borderColor: C.border }]}>
            <TouchableOpacity
              onPress={() => setMarketTab('local')}
              style={[styles.segBtn, marketTab === 'local' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: marketTab === 'local' ? '#071521' : C.text, fontSize: 12, fontWeight: '900' }}>
                Local Markets (Mandi / APMC)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMarketTab('global')}
              style={[styles.segBtn, marketTab === 'global' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: marketTab === 'global' ? '#071521' : C.text, fontSize: 12, fontWeight: '900' }}>
                Global Markets (FOB / LME)
              </Text>
            </TouchableOpacity>
          </View>

          {/* State Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {stateOptions.map((st) => {
                const active = selectedStateFilter === st;
                return (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setSelectedStateFilter(st)}
                    style={[
                      styles.filterChip,
                      { backgroundColor: active ? C.amber : C.card, borderColor: active ? C.amber : C.border },
                    ]}
                  >
                    <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{st}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Category Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.filterChip,
                      { backgroundColor: active ? C.teal : C.card, borderColor: active ? C.teal : C.border },
                    ]}
                  >
                    <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Compact Clickable Price Cards */}
          {filteredItems.map((item) => (
            <View
              key={item.id}
              style={[styles.rateCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <TouchableOpacity onPress={() => openCommodityDetail(item)} activeOpacity={0.85}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={{ color: C.text, fontSize: 14, fontWeight: '900' }}>{item.commodity}</Text>
                    <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>
                      {item.market} • {item.state}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: C.teal, fontSize: 16, fontWeight: '900' }}>
                      {item.currency}{Number(item.price).toLocaleString('en-IN')}
                      <Text style={{ color: C.sub, fontSize: 11, fontWeight: '700' }}> {item.unit}</Text>
                    </Text>
                    <Text
                      style={{
                        color: item.isPositive ? C.ok : C.warn,
                        fontSize: 11,
                        fontWeight: '800',
                        marginTop: 1,
                      }}
                    >
                      {item.changePct} Today
                    </Text>
                  </View>
                </View>

                <Text style={{ color: C.sub, fontSize: 10, marginTop: 6 }}>
                  Data updated: {item.dataUpdatedAt} • {item.source}
                </Text>
              </TouchableOpacity>

              {/* Separate Share & Alert Actions */}
              <View style={[styles.cardActionBar, { borderTopColor: C.border }]}>
                <TouchableOpacity onPress={() => openCommodityDetail(item)}>
                  <Text style={{ color: C.teal, fontSize: 11, fontWeight: '800' }}>Details & Trend ›</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <TouchableOpacity onPress={() => openShareForItem(item)}>
                    <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>Share ↗</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openAlertForItem(item)}>
                    <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800' }}>Alert 🔔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {filteredItems.length === 0 && (
            <View style={[styles.rateCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>No matching market entries</Text>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 3 }}>
                Try clearing search text or resetting State / Category filters.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          COMMODITY DETAIL SCREEN — GRAPH, ANALYSIS, COMPARISON
      ========================================================= */}
      {subView === 'detail' && selectedItem && (
        <View style={{ padding: 14 }}>
          <View style={[styles.detailCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 18, fontWeight: '900' }}>{selectedItem.commodity}</Text>
                <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>
                  {selectedItem.market} • {selectedItem.state}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: C.teal, fontSize: 18, fontWeight: '900' }}>
                  {selectedItem.currency}{Number(selectedItem.price).toLocaleString('en-IN')} {selectedItem.unit}
                </Text>
                <Text style={{ color: selectedItem.isPositive ? C.ok : C.warn, fontSize: 12, fontWeight: '800' }}>
                  {selectedItem.changePct}
                </Text>
              </View>
            </View>

            {/* Dual Timestamps */}
            <View style={[styles.metaBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
              <Text style={{ color: C.sub, fontSize: 10 }}>
                Data updated at: <Text style={{ color: C.text, fontWeight: '800' }}>{selectedItem.dataUpdatedAt}</Text>
              </Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                Analysis generated at: <Text style={{ color: C.teal, fontWeight: '800' }}>{selectedItem.analysisGeneratedAt}</Text>
              </Text>
            </View>

            {/* Min / Modal / Max */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              {[
                { lbl: 'Min', val: `${selectedItem.currency}${selectedItem.minPrice}` },
                { lbl: 'Modal', val: `${selectedItem.currency}${selectedItem.modalPrice}` },
                { lbl: 'Max', val: `${selectedItem.currency}${selectedItem.maxPrice}` },
              ].map((m) => (
                <View key={m.lbl} style={[styles.statBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                  <Text style={{ color: C.sub, fontSize: 10 }}>{m.lbl}</Text>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '900', marginTop: 2 }}>{m.val}</Text>
                </View>
              ))}
            </View>

            {/* Price History Range & Bar Visual */}
            <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900', marginTop: 14, marginBottom: 6 }}>
              Price History ({historyRange})
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
              {['7D', '30D', '90D', '1Y'].map((rng) => {
                const active = historyRange === rng;
                return (
                  <TouchableOpacity
                    key={rng}
                    onPress={() => setHistoryRange(rng)}
                    style={[
                      styles.filterChip,
                      { backgroundColor: active ? C.teal : C.cardAlt, borderColor: active ? C.teal : C.border },
                    ]}
                  >
                    <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>{rng}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.chartArea, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
              {series.map((v, idx) => {
                const pct = Math.max(18, Math.round(((v - minVal) / spread) * 82) + 18);
                return (
                  <View key={`${historyRange}-${idx}`} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Text style={{ color: C.sub, fontSize: 9, marginBottom: 3 }}>{v}</Text>
                    <View style={{ width: '64%', height: `${pct}%`, backgroundColor: C.teal, borderRadius: 4 }} />
                  </View>
                );
              })}
            </View>

            {/* Market Analysis */}
            <Text style={{ color: C.amber, fontSize: 12, fontWeight: '900', marginTop: 14 }}>
              Market Analysis & Direction
            </Text>
            <Text style={{ color: C.text, fontSize: 12, marginTop: 4, lineHeight: 18 }}>
              • Trend ({historyRange}): {selectedItem.isPositive ? 'Firm / upward movement in recent points' : 'Soft / range-bound movement in recent points'}.{'\n'}
              • Supply & Arrivals: Track mandi arrivals, local stock, and weather signals alongside verified feed data.{'\n'}
              • Disclaimer: Scenario guidance only; not a price guarantee.
            </Text>

            {/* Nearby Market Comparison */}
            <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900', marginTop: 12 }}>
              Nearby Market Comparison
            </Text>
            {selectedItem.nearbyMarkets.map((nm) => (
              <View key={nm.name} style={[styles.compareRow, { borderBottomColor: C.border }]}>
                <Text style={{ color: C.text, fontSize: 12, fontWeight: '700' }}>{nm.name}</Text>
                <Text style={{ color: C.amber, fontSize: 12, fontWeight: '900' }}>{nm.price}</Text>
              </View>
            ))}

            {/* Global / FOB Opportunity */}
            <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900', marginTop: 12 }}>
              Global Market & Export Reference
            </Text>
            <Text style={{ color: C.sub, fontSize: 12, marginTop: 3 }}>
              {selectedItem.fobReference}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => openShareForItem(selectedItem)}
                style={[styles.secondaryAction, { backgroundColor: C.cardAlt, borderColor: C.teal }]}
              >
                <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900' }}>Share Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openAlertForItem(selectedItem)}
                style={[styles.primaryAction, { backgroundColor: C.amber }]}
              >
                <Text style={{ color: '#071521', fontSize: 12, fontWeight: '900' }}>Set Price Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* =========================================================
          SHARE REPORT MODAL
      ========================================================= */}
      <Modal visible={!!shareModalItem} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.rowBetween}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>Share Market Report</Text>
              <TouchableOpacity onPress={() => setShareModalItem(null)}>
                <Text style={{ color: C.teal, fontSize: 13, fontWeight: '900' }}>Close</Text>
              </TouchableOpacity>
            </View>

            {shareModalItem && (
              <>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => setShareFormat('image_card')}
                    style={[
                      styles.filterChip,
                      {
                        flex: 1,
                        alignItems: 'center',
                        backgroundColor: shareFormat === 'image_card' ? C.teal : C.cardAlt,
                        borderColor: shareFormat === 'image_card' ? C.teal : C.border,
                      },
                    ]}
                  >
                    <Text style={{ color: shareFormat === 'image_card' ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>
                      Share Market Card
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShareFormat('full_report')}
                    style={[
                      styles.filterChip,
                      {
                        flex: 1,
                        alignItems: 'center',
                        backgroundColor: shareFormat === 'full_report' ? C.teal : C.cardAlt,
                        borderColor: shareFormat === 'full_report' ? C.teal : C.border,
                      },
                    ]}
                  >
                    <Text style={{ color: shareFormat === 'full_report' ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>
                      Full Market Report
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.previewCard, { backgroundColor: C.cardAlt, borderColor: C.teal }]}>
                  <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>
                    TRADE SETUU • MARKET PULSE
                  </Text>
                  <Text style={{ color: C.text, fontSize: 16, fontWeight: '900', marginTop: 3 }}>
                    {shareModalItem.commodity}
                  </Text>
                  <Text style={{ color: C.amber, fontSize: 17, fontWeight: '900', marginTop: 4 }}>
                    {shareModalItem.currency}{Number(shareModalItem.price).toLocaleString('en-IN')} {shareModalItem.unit} ({shareModalItem.changePct})
                  </Text>
                  <Text style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>
                    {shareModalItem.market} • {shareModalItem.state}
                  </Text>
                  <Text style={{ color: C.sub, fontSize: 10, marginTop: 6 }}>
                    Data updated at: {shareModalItem.dataUpdatedAt}
                  </Text>
                  <Text style={{ color: C.teal, fontSize: 10, marginTop: 2 }}>
                    Analysis generated at: {shareModalItem.analysisGeneratedAt}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => shareReportPayload(shareModalItem, shareFormat)}
                  style={[styles.primaryAction, { backgroundColor: C.teal, marginTop: 12 }]}
                >
                  <Text style={{ color: '#071521', fontSize: 13, fontWeight: '900' }}>
                    Share via WhatsApp / LinkedIn / More →
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* =========================================================
          CREATE PRICE ALERT MODAL
      ========================================================= */}
      <Modal visible={!!alertModalItem} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.rowBetween}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>Create Price Alert</Text>
              <TouchableOpacity onPress={() => setAlertModalItem(null)}>
                <Text style={{ color: C.teal, fontSize: 13, fontWeight: '900' }}>Close</Text>
              </TouchableOpacity>
            </View>

            {alertModalItem && (
              <>
                <Text style={{ color: C.teal, fontSize: 12, fontWeight: '800', marginTop: 8 }}>
                  {alertModalItem.commodity} • {alertModalItem.market}
                </Text>

                <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, marginBottom: 10 }}>
                  {['Falls Below', 'Rises Above', '% Move'].map((dir) => (
                    <TouchableOpacity
                      key={dir}
                      onPress={() => setAlertDirection(dir)}
                      style={[
                        styles.filterChip,
                        {
                          flex: 1,
                          alignItems: 'center',
                          backgroundColor: alertDirection === dir ? C.amber : C.cardAlt,
                          borderColor: alertDirection === dir ? C.amber : C.border,
                        },
                      ]}
                    >
                      <Text style={{ color: alertDirection === dir ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>
                        {dir}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ color: C.sub, fontSize: 11, marginBottom: 4 }}>Target Price / Threshold</Text>
                <TextInput
                  value={alertTargetVal}
                  onChangeText={setAlertTargetVal}
                  keyboardType="numeric"
                  placeholder="Enter target"
                  placeholderTextColor={C.sub}
                  style={[styles.searchRow, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginBottom: 10 }]}
                />

                <TouchableOpacity
                  onPress={confirmCreateAlert}
                  style={[styles.primaryAction, { backgroundColor: C.teal }]}
                >
                  <Text style={{ color: '#071521', fontSize: 13, fontWeight: '900' }}>Save Alert Rule</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { paddingRight: 6, paddingVertical: 2 },
  badgeChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  tickerWrap: { borderWidth: 1, borderRadius: 12, padding: 8, marginBottom: 10 },
  tickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  segRow: { flexDirection: 'row', borderWidth: 1, borderRadius: 11, padding: 3, marginBottom: 10 },
  segBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, borderWidth: 1 },
  rateCard: { borderWidth: 1, borderRadius: 13, padding: 12, marginBottom: 10 },
  cardActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 9,
    paddingTop: 8,
  },
  detailCard: { borderWidth: 1, borderRadius: 14, padding: 14 },
  metaBox: { borderWidth: 1, borderRadius: 10, padding: 9, marginTop: 10 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 9, alignItems: 'center' },
  chartArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryAction: { flex: 1, borderRadius: 11, paddingVertical: 12, alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, padding: 16 },
  previewCard: { borderWidth: 1.2, borderRadius: 12, padding: 12 },
});
