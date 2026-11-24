import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';

const COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.0 },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'AED ', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.15 },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$', weightUnit: 'LB', dimUnit: 'IN', regionFactor: 1.35 },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: 'S$', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.25 },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', symbol: '€', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.28 },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: 'SAR ', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'CN', name: 'China', currency: 'USD', symbol: '$', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.12 },
  { code: 'VN', name: 'Vietnam', currency: 'USD', symbol: '$', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.08 },
];

const CURRENCIES = ['INR', 'USD', 'AED', 'EUR', 'SGD', 'GBP', 'SAR'];

const FX_TO_INR = {
  INR: 1,
  USD: 92.65,
  AED: 25.23,
  EUR: 100.4,
  SGD: 69.1,
  GBP: 117.5,
  SAR: 24.7,
};

const PORTS_BY_COUNTRY = {
  IN: ['Nhava Sheva (INNSA)', 'Mundra (INMUN)', 'Chennai (INMAA)', 'Visakhapatnam (INVTZ)', 'Kakinada (INKAK)'],
  AE: ['Jebel Ali (AEJEA)', 'Khalifa Port (AUH)', 'Sharjah Port (SHJ)'],
  NL: ['Rotterdam (NLRTM)', 'Amsterdam (NLAMS)'],
  SG: ['PSA Singapore (SGSIN)', 'Jurong Port (SGJUR)'],
  DE: ['Hamburg (DEHAM)', 'Bremerhaven (DEBRV)'],
  US: ['Los Angeles (USLAX)', 'Savannah (USSAV)', 'New York / NJ (USNYC)'],
  GB: ['Felixstowe (GBFXT)', 'Southampton (GBSOU)'],
  SA: ['Jeddah Islamic Port (SAJED)', 'Dammam Port (SADMM)'],
  CN: ['Shanghai (CNSHA)', 'Shenzhen (CNSZX)'],
  VN: ['Ho Chi Minh (VNSGN)', 'Hai Phong (VNHPH)'],
};

const ALL_PORTS = Object.values(PORTS_BY_COUNTRY).flat();

const AIRPORTS = [
  'DEL — New Delhi, India',
  'BOM — Mumbai, India',
  'BLR — Bengaluru, India',
  'DXB — Dubai, UAE',
  'FRA — Frankfurt, Germany',
  'SIN — Singapore',
  'LHR — London Heathrow, UK',
];

const FLEET_OPTIONS = [
  { id: 'mini', label: 'Mini Truck (1–3 MT)', maxMt: 3, baseInr: 4500, perKmInr: 22 },
  { id: 'lcv', label: 'LCV (3–7 MT)', maxMt: 7, baseInr: 8500, perKmInr: 32 },
  { id: '6w', label: '6-Wheeler (7–10 MT)', maxMt: 10, baseInr: 13000, perKmInr: 42 },
  { id: '10w', label: '10-Wheeler (15–16 MT)', maxMt: 16, baseInr: 19500, perKmInr: 55 },
  { id: '16w', label: '16-Wheeler (18–21 MT)', maxMt: 21, baseInr: 25000, perKmInr: 68 },
  { id: '22w', label: '22-Wheeler Multi-Axle (25–35 MT)', maxMt: 35, baseInr: 34000, perKmInr: 88 },
  { id: 'rail', label: 'Rail / Bulk Rake', maxMt: 60, baseInr: 48000, perKmInr: 72 },
];

const LOAD_MODES = ['FTL', 'PTL', 'Container', 'Reefer', 'Rail'];
const SEA_INCOTERMS = ['FOB', 'CIF', 'CFR', 'EXW', 'FCA', 'DAP', 'DDP'];

function formatMoney(inrAmount, targetCurrency) {
  const rate = FX_TO_INR[targetCurrency] || 1;
  const val = inrAmount / rate;
  if (targetCurrency === 'INR') {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  }
  return `${targetCurrency} ${val.toFixed(2)}`;
}

export default function GlobalLogisticsHub({ theme = 'dark' }) {
  const isDark = theme === 'dark';

  const C = {
    bg: isDark ? '#090C10' : '#F3F5F8',
    card: isDark ? '#11161F' : '#FFFFFF',
    cardAlt: isDark ? '#151D2B' : '#F8FAFC',
    border: isDark ? '#1F2937' : '#E2E8F0',
    text: isDark ? '#F8FAFC' : '#0F172A',
    sub: isDark ? '#94A3B8' : '#64748B',
    teal: '#0D9488',
    tealBright: '#14B8A6',
    gold: '#C9B89A',
    pill: isDark ? '#182230' : '#E2E8F0',
  };

  // Active Screen: null (4-Tile Hub), 'inland', 'ocean', 'air', 'sample', 'requests'
  const [activeScreen, setActiveScreen] = useState(null);

  // Country History & Region / Currency State
  const [recentCodes, setRecentCodes] = useState(['IN', 'AE', 'US']);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [txCurrency, setTxCurrency] = useState('INR');
  const [dispCurrency, setDispCurrency] = useState('INR');
  const [weightUnit, setWeightUnit] = useState('MT');
  const [dimUnit, setDimUnit] = useState('CM');
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Inland State
  const [inlandMode, setInlandMode] = useState('normal'); // 'normal' | 'backhaul'
  const [loadMode, setLoadMode] = useState('FTL');
  const [pickupLoc, setPickupLoc] = useState('');
  const [deliveryLoc, setDeliveryLoc] = useState('');
  const [distanceKm, setDistanceKm] = useState('450');
  const [inlandCargo, setInlandCargo] = useState('');
  const [inlandWeight, setInlandWeight] = useState('20');
  const [showVehicleOptions, setShowVehicleOptions] = useState(false);
  const [selectedFleetId, setSelectedFleetId] = useState('22w');
  const [showIndicativeRates, setShowIndicativeRates] = useState(false);
  const [backhaulRoute, setBackhaulRoute] = useState('');
  const [backhaulWeight, setBackhaulWeight] = useState('25');

  // Ocean State
  const [originCountryCode, setOriginCountryCode] = useState('IN');
  const [destCountryCode, setDestCountryCode] = useState('AE');
  const [originPort, setOriginPort] = useState(PORTS_BY_COUNTRY.IN[0]);
  const [destPort, setDestPort] = useState(PORTS_BY_COUNTRY.AE[0]);
  const [oceanType, setOceanType] = useState('FCL'); // 'FCL' | 'LCL' | 'Bulk'
  const [containerSize, setContainerSize] = useState('40 ft');
  const [incoterm, setIncoterm] = useState('CIF');
  const [oceanCargo, setOceanCargo] = useState('');
  const [showOceanQuotes, setShowOceanQuotes] = useState(false);

  // Air State
  const [airTab, setAirTab] = useState('calculator'); // 'details' | 'calculator' | 'documents'
  const [originAirport, setOriginAirport] = useState(AIRPORTS[0]);
  const [destAirport, setDestAirport] = useState(AIRPORTS[4]);
  const [airCargoType, setAirCargoType] = useState('General Cargo');
  const [actualWeightKg, setActualWeightKg] = useState('250');
  const [dimL, setDimL] = useState('120');
  const [dimW, setDimW] = useState('80');
  const [dimH, setDimH] = useState('75');
  const [airDocs, setAirDocs] = useState({
    invoicePacking: true,
    awbDraft: true,
    msdsDg: false,
    permits: false,
  });

  // Sample & Tracking State
  const [sampleTab, setSampleTab] = useState('express'); // 'express' | 'track'
  const [courierPref, setCourierPref] = useState('DHL Express');
  const [sampleCommodity, setSampleCommodity] = useState('');
  const [sampleOrigin, setSampleOrigin] = useState('');
  const [sampleDest, setSampleDest] = useState('');
  const [sampleRefId] = useState('TS-SMP-2041');
  const [awbRef, setAwbRef] = useState('');
  const [trackInput, setTrackInput] = useState('TS-SMP-2041');

  // Requests History
  const [requests, setRequests] = useState([
    {
      id: 'TS-REQ-1001',
      mode: 'Inland (22-Wheeler)',
      route: 'Raipur → Visakhapatnam',
      status: 'Quote Requested',
    },
  ]);

  const recentCountries = useMemo(() => {
    return recentCodes
      .map((code) => COUNTRIES.find((c) => c.code === code))
      .filter(Boolean);
  }, [recentCodes]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const handleSelectCountry = (c) => {
    setSelectedCountry(c);
    setTxCurrency(c.currency);
    setDispCurrency(c.currency);
    setWeightUnit(c.weightUnit);
    setDimUnit(c.dimUnit);
    setRecentCodes((prev) => [c.code, ...prev.filter((item) => item !== c.code)].slice(0, 5));
    setCountryModalOpen(false);
    setCountrySearch('');
  };

  const handleOriginCountryChange = (code) => {
    setOriginCountryCode(code);
    const list = PORTS_BY_COUNTRY[code] || ALL_PORTS;
    setOriginPort(list[0] || '');
  };

  const handleDestCountryChange = (code) => {
    setDestCountryCode(code);
    const list = PORTS_BY_COUNTRY[code] || ALL_PORTS;
    setDestPort(list[0] || '');
  };

  const selectedFleet = useMemo(
    () => FLEET_OPTIONS.find((f) => f.id === selectedFleetId) || FLEET_OPTIONS[5],
    [selectedFleetId]
  );

  // All-inclusive indicative inland calculation (distance + weight + regional factor + margin)
  const inlandEstimateInr = useMemo(() => {
    const km = Math.max(20, parseFloat(distanceKm) || 350);
    const wt = Math.max(1, parseFloat(inlandMode === 'backhaul' ? backhaulWeight : inlandWeight) || 15);
    const rawTrip = selectedFleet.baseInr + km * selectedFleet.perKmInr + wt * 140;
    const withRegion = rawTrip * (selectedCountry.regionFactor || 1);
    const marginMultiplier = inlandMode === 'backhaul' ? 1.06 : 1.1;
    return Math.round(withRegion * marginMultiplier);
  }, [distanceKm, inlandWeight, backhaulWeight, inlandMode, selectedFleet, selectedCountry]);

  // Air Freight Chargeable Weight (KG & CM)
  const airCalc = useMemo(() => {
    const actKg = Math.max(0, parseFloat(actualWeightKg) || 0);
    const l = Math.max(0, parseFloat(dimL) || 0);
    const w = Math.max(0, parseFloat(dimW) || 0);
    const h = Math.max(0, parseFloat(dimH) || 0);
    const volKg = Number(((l * w * h) / 5000).toFixed(2));
    const chargeableKg = Number(Math.max(actKg, volKg).toFixed(2));
    return { actKg, volKg, chargeableKg };
  }, [actualWeightKg, dimL, dimW, dimH]);

  const createRequestRecord = (modeLabel, routeLabel) => {
    const newId = `TS-REQ-${Math.floor(1002 + Math.random() * 8997)}`;
    setRequests((prev) => [
      { id: newId, mode: modeLabel, route: routeLabel, status: 'Quote Requested' },
      ...prev,
    ]);
    Alert.alert('Request Submitted', `Reference ID: ${newId}\nSaved in My Requests.`);
  };

  const originPortsList = PORTS_BY_COUNTRY[originCountryCode] || ALL_PORTS;
  const destPortsList = PORTS_BY_COUNTRY[destCountryCode] || ALL_PORTS;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 96 }}>
      {/* TOP HEADER + REGION / CURRENCY BAR */}
      <View style={[styles.headerCard, { backgroundColor: C.card, borderBottomColor: C.border }]}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: C.tealBright }]}>TRADE SETUU • LOGISTICS</Text>
            <Text style={[styles.hubTitle, { color: C.text }]}>
              {activeScreen === null && 'Global Logistics Hub'}
              {activeScreen === 'inland' && 'Inland Transport'}
              {activeScreen === 'ocean' && 'Ocean & Shipping'}
              {activeScreen === 'air' && 'Air Freight'}
              {activeScreen === 'sample' && 'Sample & Tracking'}
              {activeScreen === 'requests' && 'My Logistics Requests'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              onPress={() => setActiveScreen(activeScreen === 'requests' ? null : 'requests')}
              style={[styles.backPill, { backgroundColor: C.cardAlt, borderColor: C.border }]}
            >
              <Text style={{ color: C.gold, fontSize: 11, fontWeight: '800' }}>
                Requests ({requests.length})
              </Text>
            </TouchableOpacity>

            {activeScreen !== null && (
              <TouchableOpacity
                onPress={() => setActiveScreen(null)}
                style={[styles.backPill, { backgroundColor: C.pill, borderColor: C.border }]}
              >
                <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>← Hub</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Country Search/Dropdown + Transaction & Display Currency */}
        <View style={styles.regionGrid}>
          <TouchableOpacity
            onPress={() => setCountryModalOpen(true)}
            style={[styles.regionBox, { backgroundColor: C.cardAlt, borderColor: C.tealBright }]}
          >
            <Text style={{ color: C.sub, fontSize: 10, fontWeight: '800' }}>COUNTRY / REGION</Text>
            <Text style={{ color: C.text, fontSize: 12, fontWeight: '900', marginTop: 2 }} numberOfLines={1}>
              {selectedCountry.name} ({selectedCountry.code}) ▾
            </Text>
          </TouchableOpacity>

          <View style={[styles.regionBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
            <Text style={{ color: C.sub, fontSize: 10, fontWeight: '800' }}>TX CURRENCY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
              {CURRENCIES.map((cur) => (
                <TouchableOpacity
                  key={'tx-' + cur}
                  onPress={() => setTxCurrency(cur)}
                  style={[styles.miniChip, txCurrency === cur && { backgroundColor: C.teal }]}
                >
                  <Text style={{ color: txCurrency === cur ? '#FFF' : C.text, fontSize: 10, fontWeight: '800' }}>
                    {cur}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.regionBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
            <Text style={{ color: C.sub, fontSize: 10, fontWeight: '800' }}>DISPLAY CURRENCY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
              {CURRENCIES.map((cur) => (
                <TouchableOpacity
                  key={'dp-' + cur}
                  onPress={() => setDispCurrency(cur)}
                  style={[styles.miniChip, dispCurrency === cur && { backgroundColor: C.gold }]}
                >
                  <Text style={{ color: dispCurrency === cur ? '#090C10' : C.text, fontSize: 10, fontWeight: '800' }}>
                    {cur}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* =========================================================
          0. 4-TILE HUB DASHBOARD
      ========================================================= */}
      {activeScreen === null && (
        <View style={{ padding: 14 }}>
          <View style={[styles.heroBanner, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.heroRouteBar}>
              <View style={styles.heroNode}>
                <Text style={{ color: C.tealBright, fontSize: 11, fontWeight: '900' }}>INLAND</Text>
                <Text style={{ color: C.sub, fontSize: 10 }}>Truck • Rail</Text>
              </View>
              <Text style={{ color: C.gold, fontSize: 13, fontWeight: '900' }}>── ✈ ──</Text>
              <View style={styles.heroNode}>
                <Text style={{ color: C.tealBright, fontSize: 11, fontWeight: '900' }}>OCEAN</Text>
                <Text style={{ color: C.sub, fontSize: 10 }}>FCL • LCL • Bulk</Text>
              </View>
              <Text style={{ color: C.gold, fontSize: 13, fontWeight: '900' }}>── 🚢 ──</Text>
              <View style={styles.heroNode}>
                <Text style={{ color: C.tealBright, fontSize: 11, fontWeight: '900' }}>SAMPLES</Text>
                <Text style={{ color: C.sub, fontSize: 10 }}>Express • Lab</Text>
              </View>
            </View>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: '900', marginTop: 10 }}>
              Plan • Compare • Quote • Track
            </Text>
            <Text style={{ color: C.sub, fontSize: 12, marginTop: 2, lineHeight: 17 }}>
              Active Context: {selectedCountry.name} • Display {dispCurrency} • Settlement {txCurrency}
            </Text>
          </View>

          <View style={styles.gridRow}>
            <TouchableOpacity
              onPress={() => setActiveScreen('inland')}
              style={[styles.hubTile, { backgroundColor: C.card, borderColor: C.tealBright }]}
            >
              <View style={[styles.tileBadge, { backgroundColor: 'rgba(13,148,136,0.16)' }]}>
                <Text style={{ fontSize: 22 }}>🚛</Text>
              </View>
              <Text style={[styles.tileTitle, { color: C.text }]}>Inland Transport</Text>
              <Text style={[styles.tileSub, { color: C.sub }]}>FTL • PTL • Vehicles • Rates</Text>
              <Text style={[styles.tileCta, { color: C.tealBright }]}>Open →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveScreen('ocean')}
              style={[styles.hubTile, { backgroundColor: C.card, borderColor: C.gold }]}
            >
              <View style={[styles.tileBadge, { backgroundColor: 'rgba(201,184,154,0.18)' }]}>
                <Text style={{ fontSize: 22 }}>🚢</Text>
              </View>
              <Text style={[styles.tileTitle, { color: C.text }]}>Ocean & Shipping</Text>
              <Text style={[styles.tileSub, { color: C.sub }]}>Ports • Containers • Quotes</Text>
              <Text style={[styles.tileCta, { color: C.gold }]}>Compare Rates →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            <TouchableOpacity
              onPress={() => setActiveScreen('air')}
              style={[styles.hubTile, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.tileBadge, { backgroundColor: 'rgba(13,148,136,0.16)' }]}>
                <Text style={{ fontSize: 22 }}>✈️</Text>
              </View>
              <Text style={[styles.tileTitle, { color: C.text }]}>Air Freight</Text>
              <Text style={[styles.tileSub, { color: C.sub }]}>KG / CM Weight • Docs</Text>
              <Text style={[styles.tileCta, { color: C.tealBright }]}>Calculate →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveScreen('sample')}
              style={[styles.hubTile, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.tileBadge, { backgroundColor: 'rgba(201,184,154,0.18)' }]}>
                <Text style={{ fontSize: 22 }}>📦</Text>
              </View>
              <Text style={[styles.tileTitle, { color: C.text }]}>Sample & Tracking</Text>
              <Text style={[styles.tileSub, { color: C.sub }]}>Express • Lab Status</Text>
              <Text style={[styles.tileCta, { color: C.gold }]}>Track →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* =========================================================
          1. INLAND TRANSPORT (OPTIONS -> VEHICLE -> RATES)
      ========================================================= */}
      {activeScreen === 'inland' && (
        <View style={{ padding: 14 }}>
          <View style={[styles.modeBanner, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={{ color: C.tealBright, fontSize: 12, fontWeight: '900' }}>
              🚛 INLAND DISCOVERY & RATE COMPARISON • {selectedCountry.name.toUpperCase()}
            </Text>
            <Text style={{ color: C.sub, fontSize: 12, marginTop: 3 }}>
              Display: {dispCurrency} • Tx: {txCurrency}
            </Text>
          </View>

          <View style={[styles.segmentBar, { backgroundColor: C.card, borderColor: C.border }]}>
            <TouchableOpacity
              onPress={() => { setInlandMode('normal'); setShowIndicativeRates(false); }}
              style={[styles.segmentBtn, inlandMode === 'normal' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: inlandMode === 'normal' ? '#FFF' : C.text, fontSize: 12, fontWeight: '800' }}>
                Normal Booking
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setInlandMode('backhaul'); setShowIndicativeRates(false); }}
              style={[styles.segmentBtn, inlandMode === 'backhaul' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: inlandMode === 'backhaul' ? '#FFF' : C.text, fontSize: 12, fontWeight: '800' }}>
                Backhaul / Bidding
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[styles.label, { color: C.sub }]}>Load Mode</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {LOAD_MODES.map((lm) => (
                <TouchableOpacity
                  key={lm}
                  onPress={() => setLoadMode(lm)}
                  style={[styles.choiceChip, { borderColor: C.border }, loadMode === lm && { backgroundColor: C.teal, borderColor: C.tealBright }]}
                >
                  <Text style={{ color: loadMode === lm ? '#FFF' : C.text, fontSize: 11, fontWeight: '800' }}>{lm}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: C.sub }]}>Pickup Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
              placeholder="City, Plant or Yard"
              placeholderTextColor={C.sub}
              value={pickupLoc}
              onChangeText={setPickupLoc}
            />

            <Text style={[styles.label, { color: C.sub }]}>Delivery Location / Route</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
              placeholder={inlandMode === 'backhaul' ? 'Return Corridor (e.g. Vizag -> Raipur)' : 'City, Port or Warehouse'}
              placeholderTextColor={C.sub}
              value={inlandMode === 'backhaul' ? backhaulRoute : deliveryLoc}
              onChangeText={inlandMode === 'backhaul' ? setBackhaulRoute : setDeliveryLoc}
            />

            <View style={styles.rowBetween}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.label, { color: C.sub }]}>Cargo Weight ({weightUnit})</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                  placeholder="Weight"
                  placeholderTextColor={C.sub}
                  keyboardType="numeric"
                  value={inlandMode === 'backhaul' ? backhaulWeight : inlandWeight}
                  onChangeText={inlandMode === 'backhaul' ? setBackhaulWeight : setInlandWeight}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: C.sub }]}>Est. Distance (KM, Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                  placeholder="e.g. 520"
                  placeholderTextColor={C.sub}
                  keyboardType="numeric"
                  value={distanceKm}
                  onChangeText={setDistanceKm}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: C.sub }]}>Cargo / Commodity</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
              placeholder="e.g. Rice, Maize, Cement, Industrial Goods"
              placeholderTextColor={C.sub}
              value={inlandCargo}
              onChangeText={setInlandCargo}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: C.teal }]}
              onPress={() => { setShowVehicleOptions(true); setShowIndicativeRates(false); }}
            >
              <Text style={styles.primaryBtnTxt}>Find Transport Options →</Text>
            </TouchableOpacity>
          </View>

          {/* Step 2: Vehicle / Tonnage Options */}
          {showVehicleOptions && (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.tealBright }]}>
              <Text style={[styles.sectionHead, { color: C.text }]}>Select Vehicle / Tonnage Option</Text>
              {FLEET_OPTIONS.map((fl) => {
                const active = selectedFleetId === fl.id;
                return (
                  <TouchableOpacity
                    key={fl.id}
                    onPress={() => setSelectedFleetId(fl.id)}
                    style={[
                      styles.fleetRow,
                      { backgroundColor: C.cardAlt, borderColor: active ? C.tealBright : C.border },
                    ]}
                  >
                    <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>{fl.label}</Text>
                    <Text style={{ color: active ? C.tealBright : C.sub, fontSize: 11, fontWeight: '800' }}>
                      {active ? 'Selected ✓' : 'Select'}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: C.gold, marginTop: 10 }]}
                onPress={() => setShowIndicativeRates(true)}
              >
                <Text style={[styles.primaryBtnTxt, { color: '#090C10' }]}>View Indicative Rates →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Indicative Rate Comparison */}
          {showIndicativeRates && (
            <View style={[styles.resultCard, { backgroundColor: C.card, borderColor: C.gold }]}>
              <Text style={{ color: C.gold, fontSize: 12, fontWeight: '900' }}>
                INDICATIVE RATE COMPARISON ({dispCurrency})
              </Text>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 6 }}>
                {formatMoney(inlandEstimateInr, dispCurrency)}
              </Text>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>
                {selectedFleet.label} • {loadMode} • Indicative Market Estimate (Subject to Partner Confirmation)
              </Text>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 6 }}>
                Partner fleet quotes will appear alongside indicative estimates as operators join.
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: C.teal, marginTop: 12 }]}
                onPress={() =>
                  createRequestRecord(
                    `Inland ${loadMode} (${selectedFleet.label})`,
                    `${pickupLoc || selectedCountry.name} → ${deliveryLoc || backhaulRoute || 'Destination'}`
                  )
                }
              >
                <Text style={styles.primaryBtnTxt}>Request Quote / Book</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          2. OCEAN & SHIPPING
      ========================================================= */}
      {activeScreen === 'ocean' && (
        <View style={{ padding: 14 }}>
          <View style={[styles.modeBanner, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={{ color: C.gold, fontSize: 12, fontWeight: '900' }}>
              🚢 OCEAN FREIGHT & RATE COMPARISON
            </Text>
            <Text style={{ color: C.sub, fontSize: 12, marginTop: 3 }}>
              {originPort} → {destPort} • {incoterm}
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[styles.sectionHead, { color: C.text }]}>Route & Port Lane</Text>

            <Text style={[styles.label, { color: C.sub }]}>Origin Country</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={'oc-' + c.code}
                  onPress={() => handleOriginCountryChange(c.code)}
                  style={[styles.choiceChip, { borderColor: C.border }, originCountryCode === c.code && { backgroundColor: C.teal, borderColor: C.tealBright }]}
                >
                  <Text style={{ color: originCountryCode === c.code ? '#FFF' : C.text, fontSize: 11, fontWeight: '800' }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: C.sub }]}>Origin Port</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {originPortsList.map((p) => (
                <TouchableOpacity
                  key={'op-' + p}
                  onPress={() => setOriginPort(p)}
                  style={[styles.choiceChip, { borderColor: C.border }, originPort === p && { backgroundColor: C.teal, borderColor: C.tealBright }]}
                >
                  <Text style={{ color: originPort === p ? '#FFF' : C.text, fontSize: 11, fontWeight: '800' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: C.sub }]}>Destination Country</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={'dc-' + c.code}
                  onPress={() => handleDestCountryChange(c.code)}
                  style={[styles.choiceChip, { borderColor: C.border }, destCountryCode === c.code && { backgroundColor: C.teal, borderColor: C.tealBright }]}
                >
                  <Text style={{ color: destCountryCode === c.code ? '#FFF' : C.text, fontSize: 11, fontWeight: '800' }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: C.sub }]}>Destination Port</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {destPortsList.map((p) => (
                <TouchableOpacity
                  key={'dp-' + p}
                  onPress={() => setDestPort(p)}
                  style={[styles.choiceChip, { borderColor: C.border }, destPort === p && { backgroundColor: C.teal, borderColor: C.tealBright }]}
                >
                  <Text style={{ color: destPort === p ? '#FFF' : C.text, fontSize: 11, fontWeight: '800' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: C.sub }]}>Shipment & Container</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['FCL', 'LCL', 'Bulk'].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setOceanType(t)}
                  style={[styles.choiceChip, { borderColor: C.border }, oceanType === t && { backgroundColor: C.teal, borderColor: C.tealBright }]}
                >
                  <Text style={{ color: oceanType === t ? '#FFF' : C.text, fontSize: 11, fontWeight: '800' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {oceanType === 'FCL' && (
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {['20 ft', '40 ft', '40 ft HC'].map((sz) => (
                  <TouchableOpacity
                    key={sz}
                    onPress={() => setContainerSize(sz)}
                    style={[styles.choiceChip, { borderColor: C.border }, containerSize === sz && { backgroundColor: C.gold, borderColor: C.gold }]}
                  >
                    <Text style={{ color: containerSize === sz ? '#090C10' : C.text, fontSize: 11, fontWeight: '900' }}>{sz}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.label, { color: C.sub }]}>Incoterms</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {SEA_INCOTERMS.map((inc) => (
                <TouchableOpacity
                  key={inc}
                  onPress={() => setIncoterm(inc)}
                  style={[styles.choiceChip, { borderColor: C.border }, incoterm === inc && { backgroundColor: C.teal, borderColor: C.tealBright }]}
                >
                  <Text style={{ color: incoterm === inc ? '#FFF' : C.text, fontSize: 11, fontWeight: '800' }}>{inc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: C.sub }]}>Commodity Description</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
              placeholder="e.g. 1121 Sella Rice / Yellow Maize"
              placeholderTextColor={C.sub}
              value={oceanCargo}
              onChangeText={setOceanCargo}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: C.teal }]}
              onPress={() => setShowOceanQuotes(true)}
            >
              <Text style={styles.primaryBtnTxt}>Get Freight Quotes →</Text>
            </TouchableOpacity>
          </View>

          {showOceanQuotes && (
            <View>
              {[
                { name: 'Indicative Market Estimate', tag: 'Estimated', transit: '14–18 Days' },
                { name: 'Partner Forwarder Option', tag: 'Subject to Confirmation', transit: '15–20 Days' },
              ].map((opt) => (
                <View key={opt.name} style={[styles.quoteCard, { backgroundColor: C.card, borderColor: C.border }]}>
                  <View style={styles.rowBetween}>
                    <Text style={{ color: C.text, fontSize: 14, fontWeight: '900' }}>{opt.name}</Text>
                    <Text style={{ color: C.gold, fontSize: 11, fontWeight: '800' }}>{opt.tag}</Text>
                  </View>
                  <Text style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>
                    {originPort} → {destPort} • {oceanType === 'FCL' ? containerSize : oceanType} • Est. Transit: {opt.transit}
                  </Text>
                  <TouchableOpacity
                    style={[styles.secondaryBtn, { borderColor: C.tealBright, marginTop: 8 }]}
                    onPress={() => createRequestRecord(`Ocean ${oceanType} (${incoterm})`, `${originPort} → ${destPort}`)}
                  >
                    <Text style={{ color: C.tealBright, fontSize: 12, fontWeight: '900' }}>Request Final Quote</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          3. AIR FREIGHT (KG & CM)
      ========================================================= */}
      {activeScreen === 'air' && (
        <View style={{ padding: 14 }}>
          <View style={[styles.modeBanner, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={{ color: C.tealBright, fontSize: 12, fontWeight: '900' }}>
              ✈️ AIR FREIGHT • CHARGEABLE WEIGHT ({dimUnit} / KG)
            </Text>
            <Text style={{ color: C.sub, fontSize: 12, marginTop: 3 }}>
              {originAirport} → {destAirport}
            </Text>
          </View>

          <View style={[styles.segmentBar, { backgroundColor: C.card, borderColor: C.border }]}>
            {[
              { id: 'details', label: 'Details' },
              { id: 'calculator', label: 'Calculator' },
              { id: 'documents', label: 'Documents' },
            ].map((tb) => (
              <TouchableOpacity
                key={tb.id}
                onPress={() => setAirTab(tb.id)}
                style={[styles.segmentBtn, airTab === tb.id && { backgroundColor: C.teal }]}
              >
                <Text style={{ color: airTab === tb.id ? '#FFF' : C.text, fontSize: 12, fontWeight: '800' }}>{tb.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {airTab === 'details' && (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.label, { color: C.sub }]}>Origin Airport</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {AIRPORTS.map((ap) => (
                  <TouchableOpacity
                    key={'oa-' + ap}
                    onPress={() => setOriginAirport(ap)}
                    style={[styles.choiceChip, { borderColor: C.border }, originAirport === ap && { backgroundColor: C.teal, borderColor: C.tealBright }]}
                  >
                    <Text style={{ color: originAirport === ap ? '#FFF' : C.text, fontSize: 11, fontWeight: '800' }}>{ap}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: C.sub }]}>Destination Airport</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {AIRPORTS.map((ap) => (
                  <TouchableOpacity
                    key={'da-' + ap}
                    onPress={() => setDestAirport(ap)}
                    style={[styles.choiceChip, { borderColor: C.border }, destAirport === ap && { backgroundColor: C.teal, borderColor: C.tealBright }]}
                  >
                    <Text style={{ color: destAirport === ap ? '#FFF' : C.text, fontSize: 11, fontWeight: '800' }}>{ap}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: C.sub }]}>Cargo Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {['General Cargo', 'Perishable Cargo', 'High-Value Cargo'].map((ct) => (
                  <TouchableOpacity
                    key={ct}
                    onPress={() => setAirCargoType(ct)}
                    style={[styles.choiceChip, { borderColor: C.border }, airCargoType === ct && { backgroundColor: C.gold, borderColor: C.gold }]}
                  >
                    <Text style={{ color: airCargoType === ct ? '#090C10' : C.text, fontSize: 11, fontWeight: '900' }}>{ct}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {airTab === 'calculator' && (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.sectionHead, { color: C.text }]}>Chargeable Weight Calculator</Text>

              <Text style={[styles.label, { color: C.sub }]}>Actual Weight (KG)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="Actual Weight in KG"
                placeholderTextColor={C.sub}
                keyboardType="numeric"
                value={actualWeightKg}
                onChangeText={setActualWeightKg}
              />

              <Text style={[styles.label, { color: C.sub }]}>Dimensions (L × W × H in CM)</Text>
              <View style={styles.rowBetween}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 6, backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                  placeholder="L (cm)"
                  placeholderTextColor={C.sub}
                  keyboardType="numeric"
                  value={dimL}
                  onChangeText={setDimL}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 6, backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                  placeholder="W (cm)"
                  placeholderTextColor={C.sub}
                  keyboardType="numeric"
                  value={dimW}
                  onChangeText={setDimW}
                />
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                  placeholder="H (cm)"
                  placeholderTextColor={C.sub}
                  keyboardType="numeric"
                  value={dimH}
                  onChangeText={setDimH}
                />
              </View>

              <View style={[styles.calcSummaryBox, { backgroundColor: C.cardAlt, borderColor: C.teal }]}>
                <View style={styles.rowBetween}>
                  <Text style={{ color: C.sub, fontSize: 12 }}>Actual Weight:</Text>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>{airCalc.actKg} KG</Text>
                </View>
                <View style={[styles.rowBetween, { marginTop: 4 }]}>
                  <Text style={{ color: C.sub, fontSize: 12 }}>Volumetric Weight:</Text>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>{airCalc.volKg} KG</Text>
                </View>
                <View style={[styles.rowBetween, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border }]}>
                  <Text style={{ color: C.tealBright, fontSize: 13, fontWeight: '900' }}>Chargeable Weight:</Text>
                  <Text style={{ color: C.gold, fontSize: 16, fontWeight: '900' }}>{airCalc.chargeableKg} KG</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: C.teal, marginTop: 12 }]}
                onPress={() =>
                  createRequestRecord(`Air Freight (${airCalc.chargeableKg} KG)`, `${originAirport} → ${destAirport}`)
                }
              >
                <Text style={styles.primaryBtnTxt}>Request Air Quote →</Text>
              </TouchableOpacity>
            </View>
          )}

          {airTab === 'documents' && (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.sectionHead, { color: C.text }]}>Air Cargo Document Checklist</Text>
              {[
                { key: 'invoicePacking', label: 'Commercial Invoice & Packing List' },
                { key: 'awbDraft', label: 'Air Waybill (AWB) Details' },
                { key: 'msdsDg', label: 'MSDS / Dangerous Goods Declaration' },
                { key: 'permits', label: 'Export / Import Permits & Certificates' },
              ].map((doc) => {
                const checked = !!airDocs[doc.key];
                return (
                  <TouchableOpacity
                    key={doc.key}
                    onPress={() => setAirDocs((prev) => ({ ...prev, [doc.key]: !prev[doc.key] }))}
                    style={[styles.docRow, { borderBottomColor: C.border }]}
                  >
                    <Text style={{ color: C.text, fontSize: 13, fontWeight: '700', flex: 1 }}>{doc.label}</Text>
                    <Text style={{ color: checked ? C.tealBright : C.sub, fontSize: 12, fontWeight: '900' }}>
                      {checked ? '✓ Ready' : 'Pending'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          4. SAMPLE & TRACKING
      ========================================================= */}
      {activeScreen === 'sample' && (
        <View style={{ padding: 14 }}>
          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={{ color: C.gold, fontSize: 12, fontWeight: '900' }}>
              📦 SAMPLE EXPRESS & LAB TIMELINE
            </Text>
            <View style={styles.timelineRow}>
              {['Pickup', 'In Transit', 'Testing', 'Report'].map((st, idx) => (
                <View key={st} style={styles.timelineStep}>
                  <View style={[styles.dot, { backgroundColor: idx < 3 ? C.tealBright : C.border }]} />
                  <Text style={{ color: idx < 3 ? C.text : C.sub, fontSize: 10, fontWeight: '800', marginTop: 4 }}>{st}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.refStrip, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
              <Text style={{ color: C.sub, fontSize: 11 }}>
                Sample Ref ID: <Text style={{ color: C.text, fontWeight: '900' }}>{sampleRefId}</Text>
              </Text>
              <Text style={{ color: C.sub, fontSize: 11 }}>
                AWB: <Text style={{ color: C.gold, fontWeight: '900' }}>{awbRef || 'Pending'}</Text>
              </Text>
            </View>
          </View>

          <View style={[styles.segmentBar, { backgroundColor: C.card, borderColor: C.border }]}>
            <TouchableOpacity
              onPress={() => setSampleTab('express')}
              style={[styles.segmentBtn, sampleTab === 'express' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: sampleTab === 'express' ? '#FFF' : C.text, fontSize: 12, fontWeight: '800' }}>
                Sample Express
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSampleTab('track')}
              style={[styles.segmentBtn, sampleTab === 'track' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: sampleTab === 'track' ? '#FFF' : C.text, fontSize: 12, fontWeight: '800' }}>
                Track Shipment
              </Text>
            </TouchableOpacity>
          </View>

          {sampleTab === 'express' ? (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.label, { color: C.sub }]}>Courier Preference</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                {['DHL Express', 'FedEx', 'Other Partner'].map((cp) => (
                  <TouchableOpacity
                    key={cp}
                    onPress={() => setCourierPref(cp)}
                    style={[styles.choiceChip, { borderColor: C.border }, courierPref === cp && { backgroundColor: C.teal, borderColor: C.tealBright }]}
                  >
                    <Text style={{ color: courierPref === cp ? '#FFF' : C.text, fontSize: 11, fontWeight: '800' }}>{cp}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: C.sub }]}>Sample Commodity</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="e.g. Rice / Spice / Lab Sample"
                placeholderTextColor={C.sub}
                value={sampleCommodity}
                onChangeText={setSampleCommodity}
              />

              <Text style={[styles.label, { color: C.sub }]}>Pickup Location</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="Factory / Office / City"
                placeholderTextColor={C.sub}
                value={sampleOrigin}
                onChangeText={setSampleOrigin}
              />

              <Text style={[styles.label, { color: C.sub }]}>Receiver / Lab Location</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="Buyer / Lab City & Country"
                placeholderTextColor={C.sub}
                value={sampleDest}
                onChangeText={setSampleDest}
              />

              <Text style={[styles.label, { color: C.sub }]}>AWB Reference (Separate from Sample Ref ID)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="Enter courier AWB if available"
                placeholderTextColor={C.sub}
                value={awbRef}
                onChangeText={setAwbRef}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: C.teal }]}
                onPress={() =>
                  createRequestRecord(`Sample (${courierPref})`, `${sampleOrigin || selectedCountry.name} → ${sampleDest || 'Lab'}`)
                }
              >
                <Text style={styles.primaryBtnTxt}>Create Sample Shipment Request →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.label, { color: C.sub }]}>Enter Sample Ref ID or AWB</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="e.g. TS-SMP-2041 or AWB"
                placeholderTextColor={C.sub}
                value={trackInput}
                onChangeText={setTrackInput}
              />
              <View style={[styles.comingSoonBox, { backgroundColor: C.cardAlt, borderColor: C.gold }]}>
                <Text style={{ color: C.gold, fontSize: 12, fontWeight: '900' }}>
                  LIVE TRACKING & AUTO CARRIER SYNC — COMING SOON
                </Text>
                <Text style={{ color: C.sub, fontSize: 12, marginTop: 4, lineHeight: 17 }}>
                  Real-time carrier tracking and automated milestone sync will be available in a future update.
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          5. MY LOGISTICS REQUESTS
      ========================================================= */}
      {activeScreen === 'requests' && (
        <View style={{ padding: 14 }}>
          {requests.map((req) => (
            <View key={req.id} style={[styles.quoteCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: C.tealBright, fontSize: 12, fontWeight: '900' }}>{req.id}</Text>
                <Text style={{ color: C.gold, fontSize: 11, fontWeight: '800' }}>{req.status}</Text>
              </View>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: '800', marginTop: 4 }}>{req.mode}</Text>
              <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{req.route}</Text>
            </View>
          ))}
        </View>
      )}

      {/* =========================================================
          COUNTRY SEARCH + HISTORY + DROPDOWN MODAL
      ========================================================= */}
      <Modal visible={countryModalOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.rowBetween}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>Search & Select Country</Text>
              <TouchableOpacity onPress={() => setCountryModalOpen(false)}>
                <Text style={{ color: C.tealBright, fontSize: 13, fontWeight: '800' }}>Close</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border, marginTop: 10 }]}
              placeholder="Type country name, code or currency..."
              placeholderTextColor={C.sub}
              value={countrySearch}
              onChangeText={setCountrySearch}
            />

            {recentCountries.length > 0 && !countrySearch.trim() && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: C.gold, fontSize: 11, fontWeight: '900', marginBottom: 6 }}>
                  RECENTLY SELECTED (HISTORY)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {recentCountries.map((rc) => (
                    <TouchableOpacity
                      key={'rec-' + rc.code}
                      onPress={() => handleSelectCountry(rc)}
                      style={[
                        styles.choiceChip,
                        { borderColor: C.gold, backgroundColor: C.cardAlt },
                      ]}
                    >
                      <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>
                        {rc.name} ({rc.currency})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={{ color: C.sub, fontSize: 11, fontWeight: '800', marginBottom: 4 }}>ALL COUNTRIES</Text>
            <ScrollView style={{ maxHeight: 280 }}>
              {filteredCountries.map((c) => {
                const isCurrent = selectedCountry.code === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => handleSelectCountry(c)}
                    style={[styles.countryItem, { borderBottomColor: C.border }]}
                  >
                    <Text style={{ color: isCurrent ? C.tealBright : C.text, fontSize: 13, fontWeight: '800' }}>
                      {c.name} ({c.code}) {isCurrent ? '• Active' : ''}
                    </Text>
                    <Text style={{ color: C.sub, fontSize: 12, fontWeight: '800' }}>
                      {c.currency} • {c.weightUnit}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerCard: { padding: 14, borderBottomWidth: 1 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  hubTitle: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  backPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  regionGrid: { flexDirection: 'row', marginTop: 12, gap: 8 },
  regionBox: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 8 },
  miniChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, marginRight: 4 },
  heroBanner: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  heroRouteBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroNode: { alignItems: 'center' },
  gridRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  hubTile: { flex: 1, borderWidth: 1.2, borderRadius: 14, padding: 14 },
  tileBadge: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  tileTitle: { fontSize: 14, fontWeight: '900' },
  tileSub: { fontSize: 11, marginTop: 3, lineHeight: 15 },
  tileCta: { fontSize: 12, fontWeight: '800', marginTop: 10 },
  modeBanner: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  segmentBar: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 4, marginBottom: 12 },
  segmentBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  sectionHead: { fontSize: 15, fontWeight: '900', marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '800', marginBottom: 5, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, marginBottom: 10 },
  choiceChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, borderWidth: 1, marginRight: 7, marginBottom: 7 },
  fleetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 11,
    marginBottom: 8,
  },
  primaryBtn: { borderRadius: 11, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  primaryBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '900' },
  secondaryBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  resultCard: { borderWidth: 1.2, borderRadius: 14, padding: 14, marginBottom: 12 },
  quoteCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  calcSummaryBox: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 4 },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 0.5 },
  timelineRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 14 },
  timelineStep: { alignItems: 'center', flex: 1 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  refStrip: { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderRadius: 10, padding: 10 },
  comingSoonBox: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 4 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, padding: 16 },
  countryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5 },
});
