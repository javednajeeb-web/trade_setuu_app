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
  Image,
  Share,
} from 'react-native';

const TS_LOGO = require('../1795099375380.png');

const REGIONS = [
  { code: 'IN', label: 'India (IN)', currency: 'INR', weightUnit: 'MT', factor: 1.0 },
  { code: 'GLOBAL', label: 'Global (Auto)', currency: 'USD', weightUnit: 'MT', factor: 1.05 },
  { code: 'AE', label: 'United Arab Emirates (AE)', currency: 'AED', weightUnit: 'MT', factor: 1.15 },
  { code: 'US', label: 'United States (US)', currency: 'USD', weightUnit: 'MT', factor: 1.35 },
  { code: 'NL', label: 'Netherlands (NL)', currency: 'EUR', weightUnit: 'MT', factor: 1.22 },
  { code: 'SG', label: 'Singapore (SG)', currency: 'SGD', weightUnit: 'MT', factor: 1.2 },
  { code: 'DE', label: 'Germany (DE)', currency: 'EUR', weightUnit: 'KG', factor: 1.25 },
  { code: 'SA', label: 'Saudi Arabia (SA)', currency: 'SAR', weightUnit: 'MT', factor: 1.18 },
  { code: 'CN', label: 'China (CN)', currency: 'USD', weightUnit: 'MT', factor: 1.12 },
];

const CURRENCIES = [
  { code: 'INR', label: 'INR (₹)' },
  { code: 'USD', label: 'USD ($)' },
  { code: 'AED', label: 'AED' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'SGD', label: 'SGD (S$)' },
  { code: 'SAR', label: 'SAR' },
];

const WEIGHT_UNITS = ['MT', 'KG', 'LB'];

const FX_TO_INR = {
  INR: 1,
  USD: 88.31,
  AED: 24.04,
  EUR: 95.8,
  GBP: 112.4,
  SGD: 66.2,
  SAR: 23.55,
};

const INCOTERMS_INFO = [
  { code: 'EXW', included: 'Ex-Works Factory Pickup Only', excluded: 'Export Customs, Origin THC, Ocean Freight, Dest. Charges' },
  { code: 'FCA', included: 'Origin Inland + Export Clearance', excluded: 'Main Ocean Freight, Insurance, Dest. Customs & THC' },
  { code: 'FOB', included: 'Origin Port Loading + Export Customs', excluded: 'Ocean Freight, Marine Insurance, Dest. THC & Customs' },
  { code: 'CFR', included: 'Origin Loading + Main Ocean Freight', excluded: 'Marine Insurance, Dest. THC, Customs & Last Mile' },
  { code: 'CIF', included: 'Origin Loading + Ocean Freight + Basic Insurance', excluded: 'Dest. THC, Import Customs Duty & Last Mile Delivery' },
  { code: 'DAP', included: 'Origin + Main Freight + Dest. Delivery (Unloaded Excluded)', excluded: 'Import Customs Duty & Local Taxes' },
  { code: 'DDP', included: 'Door-to-Door All-Inclusive + Import Duty', excluded: 'Demurrage / Detention beyond free days' },
];

const VEHICLE_FLEET = [
  { id: '16w', name: '16-Wheeler (18–21 MT)', capMt: 21, ratePerKm: 64, availability: 'Available • 4 Trucks near Raipur' },
  { id: '18w', name: '18-Wheeler (22–25 MT)', capMt: 25, ratePerKm: 72, availability: 'Available • 3 Trucks near Raipur' },
  { id: '22w', name: '22-Wheeler Multi-Axle (28–35 MT)', capMt: 32, ratePerKm: 84, availability: 'High Availability • 6 Trucks' },
  { id: 'cont40', name: '40ft Trailer / Container Carrier', capMt: 28, ratePerKm: 88, availability: 'Port Corridor Ready' },
];

const RETURN_LOAD_TRIPS = [
  { id: 'ret1', route: 'Visakhapatnam → Raipur', truck: '22-Wheeler (32 MT)', offerInr: 41500, saving: 'Save ~18% vs Standard' },
  { id: 'ret2', route: 'Mumbai / Bhiwandi → Raipur', truck: '18-Wheeler (25 MT)', offerInr: 46800, saving: 'Empty Return Match' },
  { id: 'ret3', route: 'Nagpur → Raipur', truck: '16-Wheeler (21 MT)', offerInr: 16200, saving: 'Lowest Bid Active' },
];

const CARRIER_QUOTES = [
  {
    id: 'maersk',
    name: 'MAERSK',
    badgeLeft: '(Indicative)',
    badgeStyle: 'indicative',
    badgeRight: 'Indicative',
    rating: '4.8',
    usdPrice: 1480,
    inrPrice: 123400,
    tt: '14 - 16 Days',
    validity: '7 Days',
    serviceType: 'Port-to-Port • Direct',
    included: 'Base Ocean Freight + Origin Documentation',
    excluded: 'Dest. THC, Customs Clearance, Detention',
  },
  {
    id: 'msc',
    name: 'MSC',
    badgeLeft: '(Best Value)',
    badgeStyle: 'bestValue',
    badgeRight: 'Best Value',
    rating: '4.7',
    usdPrice: 1420,
    inrPrice: 118600,
    tt: '15 - 17 Days',
    validity: '7 Days',
    serviceType: 'Port-to-Port • Weekly Sailing',
    included: 'Base Ocean Freight + Seal + B/L Fee',
    excluded: 'Dest. Port THC, Import Duty & Local Haulage',
  },
  {
    id: 'cma',
    name: 'CMA CGM',
    badgeLeft: '(Confirmed Partner)',
    badgeStyle: 'strike',
    badgeRight: 'Confirmed Quote',
    rating: '4.6',
    usdPrice: 1565,
    inrPrice: 130900,
    tt: '14 - 18 Days',
    validity: '7 Days',
    serviceType: 'Priority Equipment Guarantee',
    included: 'Base Freight + Origin THC + Priority Slot',
    excluded: 'Dest. Customs & Destination THC',
  },
];

function formatMoney(inrAmount, curCode) {
  if (curCode === 'INR') return `₹${Math.round(inrAmount).toLocaleString('en-IN')}`;
  const rate = FX_TO_INR[curCode] || 1;
  const val = inrAmount / rate;
  if (curCode === 'USD') return `$${Math.round(val).toLocaleString('en-US')}`;
  return `${curCode} ${val.toFixed(0)}`;
}

export default function GlobalLogisticsHub({ theme = 'dark' }) {
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
    greenBadge: '#16A34A',
  };

  // Active Screen: 'hub' | 'inland' | 'rail' | 'ocean' | 'air' | 'sample' | 'requests'
  const [screen, setScreen] = useState('hub');

  // Independent Region, Tx Currency, Display Currency & Weight Unit
  const [recentRegionCodes, setRecentRegionCodes] = useState(['IN', 'AE', 'US']);
  const [region, setRegion] = useState(REGIONS[0]);
  const [txCurrency, setTxCurrency] = useState('INR');
  const [dispCurrency, setDispCurrency] = useState('INR');
  const [weightUnit, setWeightUnit] = useState('MT');

  // Saved Requests / Shipments History
  const [myRequests, setMyRequests] = useState([
    {
      id: 'TS-REQ-1001',
      module: 'Inland Transport',
      route: 'Raipur (492001) → Visakhapatnam (530001)',
      status: 'Quote Requested',
    },
  ]);

  // Modal Picker: 'region' | 'txCur' | 'dispCur' | 'incoterm' | null
  const [pickerOpen, setPickerOpen] = useState(null);
  const [searchText, setSearchText] = useState('');

  // =========================================================
  // 1. INLAND TRANSPORT STATE (4-STEP FLOW + SEPARATE RETURN LOAD)
  // =========================================================
  const [loadTab, setLoadTab] = useState('book'); // 'book' | 'return'
  const [inlandStep, setInlandStep] = useState(1); // 1: Details, 2: Vehicle, 3: Rates, 4: Booking
  const [pickupLoc, setPickupLoc] = useState('Mumbai, India (400001)');
  const [deliveryLoc, setDeliveryLoc] = useState('Ahmedabad, India (380001)');
  const [cargoCategory, setCargoCategory] = useState('Agro / Bulk Grain');
  const [cargoDims, setCargoDims] = useState('Standard Bags / Palletized');
  const [cargoWeightVal, setCargoWeightVal] = useState('20');
  const [distanceKm, setDistanceKm] = useState('524');
  const [selectedVehicleId, setSelectedVehicleId] = useState('22w');
  const [selectedCarrierId, setSelectedCarrierId] = useState('msc');
  const [bookingRequestId, setBookingRequestId] = useState('');
  const [selectedReturnTrip, setSelectedReturnTrip] = useState(RETURN_LOAD_TRIPS[0]);
  const [bidOfferAmount, setBidOfferAmount] = useState('40000');

  // =========================================================
  // 2. RAIL FREIGHT STATE
  // =========================================================
  const [railOrigin, setRailOrigin] = useState('Raipur Goods Shed (R)');
  const [railDest, setRailDest] = useState('Bhiwandi / Mumbai Terminal');
  const [railCommodity, setRailCommodity] = useState('1121 Sella Rice / Bulk Grain');
  const [railQtyMt, setRailQtyMt] = useState('500');
  const [railProduct, setRailProduct] = useState('Full Rake'); // 'Full Rake' | 'Mini Rake' | 'Two-Point' | 'Rail Parcel'
  const [showRailEstimate, setShowRailEstimate] = useState(true);

  // =========================================================
  // 3. OCEAN & SHIPPING STATE
  // =========================================================
  const [oceanRoute, setOceanRoute] = useState('Nhava Sheva (INNSA) → Jebel Ali (AEJEA)');
  const [oceanServiceMode, setOceanServiceMode] = useState('Port-to-Port'); // 'Port-to-Port' | 'Door-to-Door'
  const [oceanShipmentType, setOceanShipmentType] = useState('FCL'); // 'FCL' | 'LCL' | 'Bulk'
  const [oceanContainer, setOceanContainer] = useState("40' HC");
  const [oceanWeightMt, setOceanWeightMt] = useState('24');
  const [oceanCbm, setOceanCbm] = useState('14');
  const [oceanReadyDate, setOceanReadyDate] = useState('2026-12-02');
  const [oceanHsCode, setOceanHsCode] = useState('1006.30');
  const [oceanPrefLine, setOceanPrefLine] = useState('MSC / Maersk');
  const [incoterm, setIncoterm] = useState('CIF');
  const [showOceanRates, setShowOceanRates] = useState(false);

  // =========================================================
  // 4. AIR FREIGHT STATE
  // =========================================================
  const [airTab, setAirTab] = useState('calculator'); // 'details' | 'calculator' | 'documents'
  const [airRoute, setAirRoute] = useState('DEL (India) → FRA (Germany)');
  const [airActualKg, setAirActualKg] = useState('1000');
  const [airLen, setAirLen] = useState('120');
  const [airWid, setAirWid] = useState('100');
  const [airHei, setAirHei] = useState('104');
  const [volDivisor, setVolDivisor] = useState('5000'); // '5000' | '6000'
  const [airDocs, setAirDocs] = useState({
    invoice: true,
    packingList: true,
    awb: true,
    cooPhyto: false,
  });

  // =========================================================
  // 5. SAMPLE & TRACKING STATE (SEPARATE REQUEST & TRACKING + INDIA TRAIN/ROAD)
  // =========================================================
  const [sampleMainTab, setSampleMainTab] = useState('request'); // 'request' | 'tracking'
  const [sampleScope, setSampleScope] = useState('domestic'); // 'domestic' | 'international'
  const [domesticMethod, setDomesticMethod] = useState('train'); // 'train' | 'road' | 'courier'
  const [intlCourier, setIntlCourier] = useState('DHL Express'); // 'DHL Express' | 'FedEx' | 'Other Partner'
  const [sampleCommodity, setSampleCommodity] = useState('1121 Basmati Rice Sample (5 kg)');
  const [samplePickup, setSamplePickup] = useState('Raipur, CG (PIN 492001)');
  const [sampleReceiver, setSampleReceiver] = useState('Mumbai Lab / Buyer (PIN 400001)');
  // Domestic Train / Parcel Specific Fields
  const [trainStationFrom, setTrainStationFrom] = useState('Raipur Jn (R)');
  const [trainStationTo, setTrainStationTo] = useState('CSMT / LTT Mumbai');
  const [trainServiceType, setTrainServiceType] = useState('Railway Parcel Van / Brake Van');
  // Domestic Road Transport Specific Fields
  const [transportOperator, setTransportOperator] = useState('VRL / TCI / Local Road Transport');
  const [biltyType, setBiltyType] = useState('Door-to-Door / Godown Delivery');
  // Separate Tracking Inputs
  const [sampleRefId] = useState('TS-SMP-2041');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCategory, setTrackingCategory] = useState('courier'); // 'courier' | 'lab'

  const swapInlandRoute = () => {
    const t = pickupLoc;
    setPickupLoc(deliveryLoc);
    setDeliveryLoc(t);
  };

  const selectedVehicle = useMemo(
    () => VEHICLE_FLEET.find((v) => v.id === selectedVehicleId) || VEHICLE_FLEET[2],
    [selectedVehicleId]
  );

  // Inland Rate + Transparent Platform Fee (₹25/MT User Service Fee)
  const inlandCalc = useMemo(() => {
    const km = Math.max(20, parseFloat(distanceKm) || 524);
    const rawWt = Math.max(1, parseFloat(cargoWeightVal) || 20);
    const wtMt = weightUnit === 'KG' ? rawWt / 1000 : weightUnit === 'LB' ? rawWt / 2204.62 : rawWt;
    const baseFreightInr = Math.round(km * selectedVehicle.ratePerKm + wtMt * 120);
    const platformFeeInr = Math.round(wtMt * 25); // ₹25/MT User Service Fee
    const partnerQuoteInr = Math.round(baseFreightInr * 0.96);
    return { wtMt, baseFreightInr, platformFeeInr, partnerQuoteInr };
  }, [distanceKm, cargoWeightVal, weightUnit, selectedVehicle]);

  // Rail Freight Calculation
  const railCalc = useMemo(() => {
    const mt = Math.max(1, parseFloat(railQtyMt) || 500);
    const ratePerMt =
      railProduct === 'Full Rake'
        ? 1450
        : railProduct === 'Mini Rake'
          ? 1620
          : railProduct === 'Two-Point'
            ? 1540
            : 2150;
    const basicRailInr = mt * ratePerMt;
    const terminalHandlingInr = mt * 110;
    const firstLastMileInr = mt * 240;
    const totalRailInr = basicRailInr + terminalHandlingInr + firstLastMileInr;
    const roadEstInr = Math.round(totalRailInr * 1.15);
    return { basicRailInr, terminalHandlingInr, firstLastMileInr, totalRailInr, roadEstInr };
  }, [railQtyMt, railProduct]);

  // Air Chargeable Weight Calculation
  const airCalc = useMemo(() => {
    const act = Math.max(0, parseFloat(airActualKg) || 0);
    const l = Math.max(0, parseFloat(airLen) || 0);
    const w = Math.max(0, parseFloat(airWid) || 0);
    const h = Math.max(0, parseFloat(airHei) || 0);
    const div = Math.max(1000, parseFloat(volDivisor) || 5000);
    const vol = Number(((l * w * h) / div).toFixed(2));
    const chargeable = Number(Math.max(act, vol).toFixed(2));
    return { act, vol, chargeable, div };
  }, [airActualKg, airLen, airWid, airHei, volDivisor]);

  const activeIncotermObj = useMemo(
    () => INCOTERMS_INFO.find((item) => item.code === incoterm) || INCOTERMS_INFO[4],
    [incoterm]
  );

  const selectedCarrier = useMemo(
    () => CARRIER_QUOTES.find((c) => c.id === selectedCarrierId) || CARRIER_QUOTES[1],
    [selectedCarrierId]
  );

  const recentRegions = useMemo(
    () => recentRegionCodes.map((code) => REGIONS.find((r) => r.code === code)).filter(Boolean),
    [recentRegionCodes]
  );

  const addRequest = (moduleName, routeStr, statusStr = 'Quote Requested') => {
    const reqId = `TS-REQ-${Math.floor(1002 + Math.random() * 8997)}`;
    setMyRequests((prev) => [{ id: reqId, module: moduleName, route: routeStr, status: statusStr }, ...prev]);
    return reqId;
  };

  const shareRailEstimateSheet = async () => {
    const msg =
      `TRADE SETUU — Indicative Rail Freight Estimate\n` +
      `Route: ${railOrigin} → ${railDest}\n` +
      `Commodity: ${railCommodity} (${railQtyMt} MT)\n` +
      `Product: ${railProduct}\n` +
      `Basic Rail: ${formatMoney(railCalc.basicRailInr, dispCurrency)}\n` +
      `Terminal Handling: ${formatMoney(railCalc.terminalHandlingInr, dispCurrency)}\n` +
      `1st/Last Mile: ${formatMoney(railCalc.firstLastMileInr, dispCurrency)}\n` +
      `Total Rail Estimate: ${formatMoney(railCalc.totalRailInr, dispCurrency)}\n` +
      `Road Comparison Est.: ${formatMoney(railCalc.roadEstInr, dispCurrency)}\n` +
      `Note: Indicative estimate only; FOIS e-Demand registration applies on Indian Railways.`;
    try {
      await Share.share({ message: msg });
    } catch {
      Alert.alert('Estimate Sheet', msg);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 96 }}>
      {/* TOP BRAND HEADER WITH ACTUAL LOGO FILE (1795099375380.png) */}
      <View style={[styles.topHeader, { backgroundColor: C.card, borderBottomColor: C.border }]}>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {screen !== 'hub' && (
              <TouchableOpacity onPress={() => setScreen('hub')} style={styles.backBtn}>
                <Text style={{ color: C.text, fontSize: 19, fontWeight: '800' }}>‹</Text>
              </TouchableOpacity>
            )}
            <Image source={TS_LOGO} style={styles.logoImg} resizeMode="contain" />
            <View>
              <Text style={[styles.brandTitle, { color: C.text }]}>
                TRADE <Text style={{ color: C.teal }}>SETUU</Text>
              </Text>
              <Text style={[styles.brandSub, { color: C.sub }]}>
                Global Trade • Sourcing • Logistics • Finance
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <TouchableOpacity
              onPress={() => setScreen(screen === 'requests' ? 'hub' : 'requests')}
              style={[styles.unitPill, { backgroundColor: C.cardAlt, borderColor: C.border }]}
            >
              <Text style={{ color: C.amber, fontSize: 10, fontWeight: '900' }}>
                Requests ({myRequests.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setWeightUnit((prev) => (prev === 'MT' ? 'KG' : prev === 'KG' ? 'LB' : 'MT'))
              }
              style={[styles.unitPill, { backgroundColor: C.cardAlt, borderColor: C.border }]}
            >
              <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>{weightUnit}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* =========================================================
          0. GLOBAL LOGISTICS HUB DASHBOARD (EXACT 127975_2.png STYLE)
          Order: 1. Inland | 2. Rail | 3. Ocean | 4. Air + 5. Sample Bar
      ========================================================= */}
      {screen === 'hub' && (
        <View style={{ padding: 14 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.hubMainTitle, { color: C.text }]}>GLOBAL LOGISTICS HUB</Text>
            <Text style={[styles.hubTagline, { color: C.sub }]}>
              Plan • Compare • Quote • Book • Track
            </Text>
          </View>

          {/* Independent Region, Tx Currency & Display Currency Controls */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => { setSearchText(''); setPickerOpen('region'); }}
              style={[styles.filterBox, { flex: 1.3, backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.sub, fontSize: 10 }}>
                Region: <Text style={{ color: C.text, fontWeight: '800' }}>{region.label}</Text>
              </Text>
              <Text style={{ color: C.sub, fontSize: 11 }}>▾</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSearchText(''); setPickerOpen('txCur'); }}
              style={[styles.filterBox, { flex: 0.85, backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.sub, fontSize: 10 }}>
                Tx: <Text style={{ color: C.teal, fontWeight: '900' }}>{txCurrency}</Text>
              </Text>
              <Text style={{ color: C.sub, fontSize: 11 }}>▾</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSearchText(''); setPickerOpen('dispCur'); }}
              style={[styles.filterBox, { flex: 0.9, backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.sub, fontSize: 10 }}>
                Show: <Text style={{ color: C.amber, fontWeight: '900' }}>{dispCurrency}</Text>
              </Text>
              <Text style={{ color: C.sub, fontSize: 11 }}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* ROW 1: 1. INLAND TRANSPORT & 2. RAIL FREIGHT */}
          <View style={styles.cardsGrid}>
            <TouchableOpacity
              onPress={() => { setInlandStep(1); setScreen('inland'); }}
              style={[styles.moduleCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.visualBanner, { backgroundColor: '#122D42', borderColor: C.border }]}>
                <Text style={[styles.cardHeadTitle, { color: C.text }]}>INLAND TRANSPORT</Text>
                <Text style={{ fontSize: 28, marginTop: 4 }}>🚛</Text>
              </View>

              <View style={styles.routeMiniRow}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11 }}>📍</Text>
                  <Text style={{ color: C.sub, fontSize: 9 }}>Pickup</Text>
                </View>
                <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>1,240 km</Text>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11 }}>📌</Text>
                  <Text style={{ color: C.sub, fontSize: 9 }}>Drop</Text>
                </View>
              </View>

              <View style={[styles.cardFooterSplit, { borderTopColor: C.border }]}>
                <View>
                  <Text style={{ color: C.text, fontSize: 11, fontWeight: '900' }}>28.0 MT</Text>
                  <Text style={{ color: C.sub, fontSize: 9 }}>Book / Return</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>92%</Text>
                  <Text style={{ color: C.sub, fontSize: 9 }}>Load Utilization</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setScreen('rail')}
              style={[styles.moduleCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.visualBanner, { backgroundColor: '#122D42', borderColor: C.border }]}>
                <Text style={[styles.cardHeadTitle, { color: C.text }]}>RAIL FREIGHT</Text>
                <Text style={{ fontSize: 28, marginTop: 4 }}>🚆</Text>
              </View>

              <View style={styles.routeMiniRow}>
                <View>
                  <Text style={{ color: C.sub, fontSize: 9 }}>Wagon / Rake</Text>
                  <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>Full • Mini</Text>
                </View>
                <Text style={{ color: C.amber, fontSize: 10, fontWeight: '800' }}>Road vs Rail</Text>
              </View>

              <View style={[styles.cardFooterSplit, { borderTopColor: C.border }]}>
                <View>
                  <Text style={{ color: C.text, fontSize: 11, fontWeight: '900' }}>Indicative</Text>
                  <Text style={{ color: C.sub, fontSize: 9 }}>FOIS Assist</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>Cost Sheet</Text>
                  <Text style={{ color: C.sub, fontSize: 9 }}>Share / PDF</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* ROW 2: 3. OCEAN & SHIPPING & 4. AIR FREIGHT */}
          <View style={styles.cardsGrid}>
            <TouchableOpacity
              onPress={() => setScreen('ocean')}
              style={[styles.moduleCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.visualBanner, { backgroundColor: '#122D42', borderColor: C.border }]}>
                <Text style={[styles.cardHeadTitle, { color: C.text }]}>OCEAN & SHIPPING</Text>
                <Text style={{ fontSize: 28, marginTop: 4 }}>🚢</Text>
              </View>

              <View style={styles.routeMiniRow}>
                <View>
                  <Text style={{ color: C.sub, fontSize: 9 }}>Origin Port</Text>
                  <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>SGP</Text>
                </View>
                <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800' }}>── ⚓ ──</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: C.sub, fontSize: 9 }}>Destination Port</Text>
                  <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>ROT</Text>
                </View>
              </View>

              <View style={[styles.cardFooterSplit, { borderTopColor: C.border }]}>
                <View>
                  <Text style={{ color: C.text, fontSize: 11, fontWeight: '900' }}>40' HC</Text>
                  <Text style={{ color: C.sub, fontSize: 9 }}>FCL • LCL • Bulk</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: C.text, fontSize: 10, fontWeight: '800' }}>14 - 18 Days</Text>
                  <Text style={{ color: C.sub, fontSize: 9 }}>ETA</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setScreen('air')}
              style={[styles.moduleCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.visualBanner, { backgroundColor: '#122D42', borderColor: C.border }]}>
                <Text style={[styles.cardHeadTitle, { color: C.text }]}>AIR FREIGHT</Text>
                <Text style={{ fontSize: 28, marginTop: 4 }}>✈️</Text>
              </View>

              <View style={styles.routeMiniRow}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: C.text, fontSize: 11, fontWeight: '900' }}>DEL</Text>
                  <Text style={{ color: C.sub, fontSize: 9 }}>(India)</Text>
                </View>
                <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800' }}>── ✈ ──</Text>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: C.text, fontSize: 11, fontWeight: '900' }}>FRA</Text>
                  <Text style={{ color: C.sub, fontSize: 9 }}>(Germany)</Text>
                </View>
              </View>

              <View style={[styles.cardFooterSplit, { borderTopColor: C.border }]}>
                <View>
                  <Text style={{ color: C.sub, fontSize: 9 }}>Chargeable Wt:</Text>
                  <Text style={{ color: C.text, fontSize: 11, fontWeight: '900' }}>1,250 kg</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: C.sub, fontSize: 9 }}>Act. / Vol. Wt:</Text>
                  <Text style={{ color: C.text, fontSize: 10, fontWeight: '800' }}>1,000 / 1,250</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* 5. WIDE HORIZONTAL BAR: SAMPLE & TRACKING */}
          <TouchableOpacity
            onPress={() => setScreen('sample')}
            style={[styles.wideSampleBar, { backgroundColor: C.card, borderColor: C.teal }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={[styles.sampleIconBox, { backgroundColor: 'rgba(32,200,193,0.14)' }]}>
                <Text style={{ fontSize: 20 }}>📦</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>SAMPLE & TRACKING</Text>
                <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                  India Train / Road Transport • DHL / FedEx • Lab & Shipment Status
                </Text>
              </View>
            </View>
            <Text style={{ color: C.teal, fontSize: 13, fontWeight: '900' }}>Open ›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* =========================================================
          1. INLAND TRANSPORT (EXACT 127976_2.png STYLE + 4-STEP FLOW)
      ========================================================= */}
      {screen === 'inland' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.screenHeading, { color: C.text }]}>Inland Transport</Text>

          {/* Book Load / Return Load Tabs */}
          <View style={[styles.tabContainer, { backgroundColor: C.card, borderColor: C.border }]}>
            <TouchableOpacity
              onPress={() => { setLoadTab('book'); setInlandStep(1); }}
              style={[styles.tabPill, loadTab === 'book' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: loadTab === 'book' ? '#071521' : C.text, fontSize: 13, fontWeight: '900' }}>
                Book Load
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLoadTab('return')}
              style={[styles.tabPill, loadTab === 'return' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: loadTab === 'return' ? '#071521' : C.text, fontSize: 13, fontWeight: '900' }}>
                Return Load
              </Text>
            </TouchableOpacity>
          </View>

          {loadTab === 'book' ? (
            <>
              {/* 4-Step Indicator */}
              <View style={styles.stepStrip}>
                {[
                  { n: 1, lbl: '1. Details' },
                  { n: 2, lbl: '2. Vehicle' },
                  { n: 3, lbl: '3. Rates' },
                  { n: 4, lbl: '4. Booking' },
                ].map((st) => (
                  <TouchableOpacity
                    key={st.n}
                    onPress={() => setInlandStep(st.n)}
                    style={[
                      styles.stepChip,
                      {
                        backgroundColor: inlandStep === st.n ? C.teal : C.card,
                        borderColor: inlandStep === st.n ? C.teal : C.border,
                      },
                    ]}
                  >
                    <Text style={{ color: inlandStep === st.n ? '#071521' : C.sub, fontSize: 10, fontWeight: '900' }}>
                      {st.lbl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Step 1: Shipment Details (Matches 127976_2.png layout) */}
              <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Pickup Location (City / PIN)</Text>
                  <TextInput
                    value={pickupLoc}
                    onChangeText={setPickupLoc}
                    placeholder="Enter Pickup City / PIN"
                    placeholderTextColor={C.sub}
                    style={[styles.inlineInput, { color: C.text }]}
                  />

                  <View style={[styles.hairline, { backgroundColor: C.border }]} />

                  <Text style={{ color: C.sub, fontSize: 11, marginTop: 8 }}>Delivery Location (City / PIN)</Text>
                  <TextInput
                    value={deliveryLoc}
                    onChangeText={setDeliveryLoc}
                    placeholder="Enter Delivery City / PIN"
                    placeholderTextColor={C.sub}
                    style={[styles.inlineInput, { color: C.text }]}
                  />
                </View>

                <TouchableOpacity
                  onPress={swapInlandRoute}
                  style={[styles.swapBtn, { backgroundColor: C.cardAlt, borderColor: C.border }]}
                >
                  <Text style={{ color: C.text, fontSize: 15, fontWeight: '800' }}>⇅</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardsGrid}>
                <View style={[styles.specBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Cargo Weight ({weightUnit})</Text>
                  <TextInput
                    value={cargoWeightVal}
                    onChangeText={setCargoWeightVal}
                    keyboardType="numeric"
                    style={[styles.specInput, { color: C.text }]}
                  />
                </View>
                <View style={[styles.specBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Vehicle</Text>
                  <Text style={[styles.specInput, { color: C.text }]} numberOfLines={1}>
                    {selectedVehicle.name.split(' ')[0]} ({selectedVehicle.capMt} MT)
                  </Text>
                </View>
              </View>

              <View style={styles.cardsGrid}>
                <View style={[styles.specBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Distance (km)</Text>
                  <TextInput
                    value={distanceKm}
                    onChangeText={setDistanceKm}
                    keyboardType="numeric"
                    style={[styles.specInput, { color: C.text }]}
                  />
                </View>
                <View style={[styles.specBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Est. Platform Fee (₹25/MT)</Text>
                  <Text style={[styles.specInput, { color: C.amber }]}>
                    {formatMoney(inlandCalc.platformFeeInr, dispCurrency)}
                  </Text>
                </View>
              </View>

              <View style={[styles.specBox, { backgroundColor: C.card, borderColor: C.border, marginBottom: 10 }]}>
                <Text style={{ color: C.sub, fontSize: 11 }}>Cargo Category & Packaging / Dimensions</Text>
                <TextInput
                  value={`${cargoCategory} • ${cargoDims}`}
                  onChangeText={(val) => setCargoCategory(val)}
                  style={[styles.specInput, { color: C.text }]}
                />
              </View>

              <TouchableOpacity
                onPress={() => setInlandStep(2)}
                style={[styles.tealActionBtn, { backgroundColor: C.teal }]}
              >
                <Text style={{ color: '#071521', fontSize: 14, fontWeight: '900' }}>Find Transport Options</Text>
              </TouchableOpacity>

              {/* Step 2: Vehicle Selection (16W / 18W / 22W / Container) */}
              {inlandStep >= 2 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.compareHeading, { color: C.text, marginBottom: 8 }]}>
                    Step 2: Select Vehicle & Capacity
                  </Text>
                  {VEHICLE_FLEET.map((vf) => {
                    const active = selectedVehicleId === vf.id;
                    return (
                      <TouchableOpacity
                        key={vf.id}
                        onPress={() => setSelectedVehicleId(vf.id)}
                        style={[
                          styles.carrierCard,
                          {
                            backgroundColor: C.card,
                            borderColor: active ? C.teal : C.border,
                          },
                        ]}
                      >
                        <View style={styles.rowBetween}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>{vf.name}</Text>
                            <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>{vf.availability}</Text>
                          </View>
                          <Text style={{ color: active ? C.teal : C.sub, fontSize: 12, fontWeight: '900' }}>
                            {active ? 'Selected ✓' : 'Select'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    onPress={() => setInlandStep(3)}
                    style={[styles.tealActionBtn, { backgroundColor: C.teal }]}
                  >
                    <Text style={{ color: '#071521', fontSize: 14, fontWeight: '900' }}>
                      Compare Indicative & Partner Rates →
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 3: Rate Comparison (Matches 127976_2.png Multi-Carrier style) */}
              {inlandStep >= 3 && (
                <View style={{ marginTop: 18 }}>
                  <Text style={[styles.compareHeading, { color: C.text }]}>
                    Step 3: Freight Rate Comparison
                  </Text>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '800', marginTop: 4 }}>
                    {pickupLoc} → {deliveryLoc}
                  </Text>
                  <Text style={{ color: C.sub, fontSize: 11, marginTop: 2, marginBottom: 10 }}>
                    {selectedVehicle.name} | {inlandCalc.wtMt.toFixed(1)} MT | User Service Fee: ₹25/MT
                  </Text>

                  {[
                    {
                      id: 'ind-est',
                      name: 'MARKET ESTIMATE',
                      badgeLeft: '(Indicative)',
                      badgeStyle: 'indicative',
                      badgeRight: 'Indicative',
                      inr: inlandCalc.baseFreightInr,
                      tt: 'Est. 2–3 Days',
                      validity: '24 Hrs',
                    },
                    {
                      id: 'partner-best',
                      name: 'VERIFIED FLEET PARTNER',
                      badgeLeft: '(Best Value)',
                      badgeStyle: 'bestValue',
                      badgeRight: 'Best Value',
                      inr: inlandCalc.partnerQuoteInr,
                      tt: 'Est. 2 Days',
                      validity: '48 Hrs',
                    },
                  ].map((opt) => {
                    const isBest = opt.badgeStyle === 'bestValue';
                    const isSel = selectedCarrierId === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setSelectedCarrierId(opt.id)}
                        style={[
                          styles.carrierCard,
                          {
                            backgroundColor: isBest ? '#0E2F2E' : C.card,
                            borderColor: isSel || isBest ? C.teal : C.border,
                          },
                        ]}
                      >
                        <View style={styles.rowBetween}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>{opt.name}</Text>
                              <Text style={{ color: isBest ? '#4ADE80' : C.amber, fontSize: 11, fontWeight: '800' }}>
                                {opt.badgeLeft}
                              </Text>
                            </View>
                            <Text style={{ color: C.sub, fontSize: 11, marginTop: 3 }}>
                              TT: {opt.tt} • Validity: {opt.validity}
                            </Text>
                          </View>

                          <View style={{ alignItems: 'flex-end' }}>
                            <View style={[styles.rightPill, { backgroundColor: isBest ? C.greenBadge : C.amber }]}>
                              <Text style={{ color: isBest ? '#FFF' : '#071521', fontSize: 10, fontWeight: '900' }}>
                                {opt.badgeRight}
                              </Text>
                            </View>
                            <Text style={{ color: C.text, fontSize: 15, fontWeight: '900', marginTop: 5 }}>
                              {formatMoney(opt.inr, dispCurrency)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <View style={styles.bottomActionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        const id = addRequest('Inland Transport', `${pickupLoc} → ${deliveryLoc}`, 'Quote Requested');
                        setBookingRequestId(id);
                        setInlandStep(4);
                      }}
                      style={[styles.secondaryActionBtn, { backgroundColor: C.card, borderColor: C.border }]}
                    >
                      <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>Request Final Quote</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        const id = addRequest('Inland Booking', `${pickupLoc} → ${deliveryLoc}`, 'Pending Vehicle Assignment');
                        setBookingRequestId(id);
                        setInlandStep(4);
                      }}
                      style={[styles.primaryProceedBtn, { backgroundColor: C.teal }]}
                    >
                      <Text style={{ color: '#071521', fontSize: 13, fontWeight: '900' }}>Proceed →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Step 4: Booking Confirmation & Request ID */}
              {inlandStep === 4 && bookingRequestId ? (
                <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.teal, flexDirection: 'column', marginTop: 14 }]}>
                  <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>
                    STEP 4: BOOKING REQUEST REGISTERED
                  </Text>
                  <Text style={{ color: C.text, fontSize: 16, fontWeight: '900', marginTop: 4 }}>
                    Request ID: {bookingRequestId}
                  </Text>
                  <Text style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>
                    Route: {pickupLoc} → {deliveryLoc} • Vehicle: {selectedVehicle.name}
                  </Text>
                  <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800', marginTop: 4 }}>
                    Status: Awaiting Partner Confirmation & Vehicle Assignment
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            /* SEPARATE RETURN LOAD / BIDDING WORKFLOW */
            <View>
              <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900', marginBottom: 8 }}>
                AVAILABLE RETURN TRIPS • EMPTY TRUCK CORRIDORS & BIDDING
              </Text>
              {RETURN_LOAD_TRIPS.map((rt) => {
                const active = selectedReturnTrip.id === rt.id;
                return (
                  <TouchableOpacity
                    key={rt.id}
                    onPress={() => {
                      setSelectedReturnTrip(rt);
                      setBidOfferAmount(String(rt.offerInr - 1500));
                    }}
                    style={[
                      styles.carrierCard,
                      { backgroundColor: C.card, borderColor: active ? C.teal : C.border },
                    ]}
                  >
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>{rt.route}</Text>
                        <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>{rt.truck}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: C.teal, fontSize: 14, fontWeight: '900' }}>
                          {formatMoney(rt.offerInr, dispCurrency)}
                        </Text>
                        <Text style={{ color: C.amber, fontSize: 10, fontWeight: '800' }}>{rt.saving}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.border, flexDirection: 'column', marginTop: 6 }]}>
                <Text style={{ color: C.sub, fontSize: 11 }}>Place Your Counter Bid ({dispCurrency}) for {selectedReturnTrip.route}</Text>
                <TextInput
                  value={bidOfferAmount}
                  onChangeText={setBidOfferAmount}
                  keyboardType="numeric"
                  style={[styles.inlineInput, { color: C.text, marginTop: 4, marginBottom: 10 }]}
                />
                <TouchableOpacity
                  onPress={() => {
                    const id = addRequest('Return Load Bid', selectedReturnTrip.route, 'Bid Submitted');
                    Alert.alert('Bid Submitted', `Ref: ${id}\nCorridor: ${selectedReturnTrip.route}`);
                  }}
                  style={[styles.tealActionBtn, { backgroundColor: C.teal }]}
                >
                  <Text style={{ color: '#071521', fontSize: 13, fontWeight: '900' }}>
                    Submit Return Load Bid →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          2. RAIL FREIGHT MODULE (RAKE / WAGON / ROAD VS RAIL / SHARE PDF)
      ========================================================= */}
      {screen === 'rail' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.screenHeading, { color: C.text }]}>Rail Freight & Rake Estimate</Text>

          <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.border, flexDirection: 'column' }]}>
            <Text style={{ color: C.sub, fontSize: 11 }}>Loading Station / Goods Shed</Text>
            <TextInput
              value={railOrigin}
              onChangeText={setRailOrigin}
              style={[styles.inlineInput, { color: C.text, marginTop: 3, marginBottom: 10 }]}
            />

            <Text style={{ color: C.sub, fontSize: 11 }}>Unloading Station / Goods Shed</Text>
            <TextInput
              value={railDest}
              onChangeText={setRailDest}
              style={[styles.inlineInput, { color: C.text, marginTop: 3, marginBottom: 10 }]}
            />

            <Text style={{ color: C.sub, fontSize: 11 }}>Commodity & Total Quantity (MT)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 10 }}>
              <TextInput
                value={railCommodity}
                onChangeText={setRailCommodity}
                style={[styles.specBox, { flex: 1.5, backgroundColor: C.cardAlt, color: C.text, fontSize: 12 }]}
              />
              <TextInput
                value={railQtyMt}
                onChangeText={setRailQtyMt}
                keyboardType="numeric"
                style={[styles.specBox, { flex: 0.7, backgroundColor: C.cardAlt, color: C.text, fontSize: 12 }]}
              />
            </View>

            <Text style={{ color: C.sub, fontSize: 11, marginBottom: 6 }}>Rail Transportation Product</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {['Full Rake', 'Mini Rake', 'Two-Point', 'Rail Parcel'].map((rp) => {
                const active = railProduct === rp;
                return (
                  <TouchableOpacity
                    key={rp}
                    onPress={() => setRailProduct(rp)}
                    style={[
                      styles.choicePill,
                      { backgroundColor: active ? C.teal : C.cardAlt, borderColor: active ? C.teal : C.border },
                    ]}
                  >
                    <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{rp}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setShowRailEstimate(true)}
              style={[styles.tealActionBtn, { backgroundColor: C.teal }]}
            >
              <Text style={{ color: '#071521', fontSize: 14, fontWeight: '900' }}>
                Calculate Indicative Rail Freight
              </Text>
            </TouchableOpacity>
          </View>

          {showRailEstimate && (
            <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.teal, flexDirection: 'column' }]}>
              <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>
                INDICATIVE COST BREAKDOWN ({railProduct.toUpperCase()})
              </Text>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 4 }}>
                {formatMoney(railCalc.totalRailInr, dispCurrency)}
              </Text>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>
                • Basic Rail Freight: {formatMoney(railCalc.basicRailInr, dispCurrency)}
              </Text>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>
                • Terminal / Loading & Unloading: {formatMoney(railCalc.terminalHandlingInr, dispCurrency)}
              </Text>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>
                • First & Last Mile Road: {formatMoney(railCalc.firstLastMileInr, dispCurrency)}
              </Text>
              <Text style={{ color: C.teal, fontSize: 11, fontWeight: '800', marginTop: 6 }}>
                Smart Road vs Rail: Road Estimate ~ {formatMoney(railCalc.roadEstInr, dispCurrency)}
              </Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={shareRailEstimateSheet}
                  style={[styles.secondaryActionBtn, { backgroundColor: C.cardAlt, borderColor: C.border }]}
                >
                  <Text style={{ color: C.text, fontSize: 12, fontWeight: '800' }}>Share / Save Estimate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const id = addRequest(`Rail (${railProduct})`, `${railOrigin} → ${railDest}`, 'FOIS Assistance Requested');
                    Alert.alert('Assisted Booking Logged', `Ref: ${id}\nFOIS e-Demand requires customer registration on Indian Railways.`);
                  }}
                  style={[styles.primaryProceedBtn, { backgroundColor: C.teal }]}
                >
                  <Text style={{ color: '#071521', fontSize: 12, fontWeight: '900' }}>Request Assistance</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          3. OCEAN & SHIPPING (BULK/LCL LOGIC + INCOTERMS BREAKDOWN + RATE COMPARE)
      ========================================================= */}
      {screen === 'ocean' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.screenHeading, { color: C.text }]}>Ocean & Shipping</Text>

          <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.border, flexDirection: 'column' }]}>
            <Text style={{ color: C.sub, fontSize: 11 }}>Port Lane (Origin → Destination)</Text>
            <TextInput
              value={oceanRoute}
              onChangeText={setOceanRoute}
              style={[styles.inlineInput, { color: C.text, marginTop: 4, marginBottom: 10 }]}
            />

            <Text style={{ color: C.sub, fontSize: 11, marginBottom: 6 }}>Service Scope</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              {['Port-to-Port', 'Door-to-Door'].map((sm) => (
                <TouchableOpacity
                  key={sm}
                  onPress={() => setOceanServiceMode(sm)}
                  style={[
                    styles.choicePill,
                    { backgroundColor: oceanServiceMode === sm ? C.teal : C.cardAlt, borderColor: oceanServiceMode === sm ? C.teal : C.border },
                  ]}
                >
                  <Text style={{ color: oceanServiceMode === sm ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{sm}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: C.sub, fontSize: 11, marginBottom: 6 }}>Shipment Mode</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              {['FCL', 'LCL', 'Bulk'].map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => setOceanShipmentType(st)}
                  style={[
                    styles.choicePill,
                    { backgroundColor: oceanShipmentType === st ? C.teal : C.cardAlt, borderColor: oceanShipmentType === st ? C.teal : C.border },
                  ]}
                >
                  <Text style={{ color: oceanShipmentType === st ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{st}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* FCL shows Container Size; LCL shows CBM; Bulk hides Container Size */}
            {oceanShipmentType === 'FCL' && (
              <>
                <Text style={{ color: C.sub, fontSize: 11 }}>Container Size</Text>
                <TextInput
                  value={oceanContainer}
                  onChangeText={setOceanContainer}
                  style={[styles.inlineInput, { color: C.text, marginTop: 4, marginBottom: 10 }]}
                />
              </>
            )}

            {oceanShipmentType === 'LCL' && (
              <>
                <Text style={{ color: C.sub, fontSize: 11 }}>Shipment Volume (CBM)</Text>
                <TextInput
                  value={oceanCbm}
                  onChangeText={setOceanCbm}
                  keyboardType="numeric"
                  style={[styles.inlineInput, { color: C.text, marginTop: 4, marginBottom: 10 }]}
                />
              </>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.sub, fontSize: 11 }}>Cargo Weight (MT)</Text>
                <TextInput
                  value={oceanWeightMt}
                  onChangeText={setOceanWeightMt}
                  keyboardType="numeric"
                  style={[styles.inlineInput, { color: C.text, marginTop: 3 }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.sub, fontSize: 11 }}>Cargo Ready Date</Text>
                <TextInput
                  value={oceanReadyDate}
                  onChangeText={setOceanReadyDate}
                  style={[styles.inlineInput, { color: C.text, marginTop: 3 }]}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.sub, fontSize: 11 }}>HS Code (Optional)</Text>
                <TextInput
                  value={oceanHsCode}
                  onChangeText={setOceanHsCode}
                  style={[styles.inlineInput, { color: C.text, marginTop: 3 }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.sub, fontSize: 11 }}>Preferred Line (Optional)</Text>
                <TextInput
                  value={oceanPrefLine}
                  onChangeText={setOceanPrefLine}
                  style={[styles.inlineInput, { color: C.text, marginTop: 3 }]}
                />
              </View>
            </View>

            <Text style={{ color: C.sub, fontSize: 11, marginBottom: 4 }}>Incoterms & Charge Responsibility</Text>
            <TouchableOpacity
              onPress={() => { setSearchText(''); setPickerOpen('incoterm'); }}
              style={[styles.filterBox, { backgroundColor: C.cardAlt, borderColor: C.border, marginBottom: 6 }]}
            >
              <Text style={{ color: C.teal, fontSize: 13, fontWeight: '900' }}>{incoterm}</Text>
              <Text style={{ color: C.sub, fontSize: 12 }}>Change ▾</Text>
            </TouchableOpacity>
            <Text style={{ color: C.sub, fontSize: 11, marginBottom: 2 }}>
              Included ({incoterm}): {activeIncotermObj.included}
            </Text>
            <Text style={{ color: C.amber, fontSize: 11, marginBottom: 12 }}>
              Excluded: {activeIncotermObj.excluded}
            </Text>

            <TouchableOpacity
              onPress={() => setShowOceanRates(true)}
              style={[styles.tealActionBtn, { backgroundColor: C.teal }]}
            >
              <Text style={{ color: '#071521', fontSize: 14, fontWeight: '900' }}>Get Freight Quotes →</Text>
            </TouchableOpacity>
          </View>

          {showOceanRates && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.compareHeading, { color: C.text, marginBottom: 8 }]}>
                Ocean Rate Comparison ({oceanRoute})
              </Text>
              {CARRIER_QUOTES.map((q) => {
                const isBest = q.badgeStyle === 'bestValue';
                return (
                  <View
                    key={q.id}
                    style={[
                      styles.carrierCard,
                      { backgroundColor: isBest ? '#0E2F2E' : C.card, borderColor: isBest ? C.teal : C.border },
                    ]}
                  >
                    <View style={styles.rowBetween}>
                      <Text style={{ color: C.text, fontSize: 14, fontWeight: '900' }}>
                        {q.name} <Text style={{ color: C.amber, fontSize: 11 }}>{q.badgeLeft}</Text>
                      </Text>
                      <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>
                        {formatMoney(q.inrPrice, dispCurrency)}
                      </Text>
                    </View>
                    <Text style={{ color: C.sub, fontSize: 11, marginTop: 3 }}>
                      {q.serviceType} • TT: {q.tt} • Validity: {q.validity}
                    </Text>
                    <Text style={{ color: C.teal, fontSize: 10, marginTop: 4 }}>Included: {q.included}</Text>
                    <Text style={{ color: C.amber, fontSize: 10, marginTop: 2 }}>Excluded: {q.excluded}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          4. AIR FREIGHT (CONFIGURABLE DIVISOR + DIRECT QUOTE + CHECKLIST)
      ========================================================= */}
      {screen === 'air' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.screenHeading, { color: C.text }]}>Air Freight</Text>

          <View style={[styles.tabContainer, { backgroundColor: C.card, borderColor: C.border }]}>
            {[
              { id: 'calculator', lbl: 'Calculator' },
              { id: 'documents', lbl: 'Documents' },
            ].map((tb) => (
              <TouchableOpacity
                key={tb.id}
                onPress={() => setAirTab(tb.id)}
                style={[styles.tabPill, airTab === tb.id && { backgroundColor: C.teal }]}
              >
                <Text style={{ color: airTab === tb.id ? '#071521' : C.text, fontSize: 13, fontWeight: '900' }}>
                  {tb.lbl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {airTab === 'calculator' ? (
            <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.border, flexDirection: 'column' }]}>
              <Text style={{ color: C.sub, fontSize: 11 }}>Airport Lane</Text>
              <TextInput
                value={airRoute}
                onChangeText={setAirRoute}
                style={[styles.inlineInput, { color: C.text, marginTop: 3, marginBottom: 10 }]}
              />

              <Text style={{ color: C.sub, fontSize: 11 }}>Actual Weight (KG)</Text>
              <TextInput
                value={airActualKg}
                onChangeText={setAirActualKg}
                keyboardType="numeric"
                style={[styles.inlineInput, { color: C.text, marginTop: 3, marginBottom: 10 }]}
              />

              <Text style={{ color: C.sub, fontSize: 11, marginBottom: 4 }}>Dimensions (L × W × H in cm)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <TextInput
                  value={airLen}
                  onChangeText={setAirLen}
                  keyboardType="numeric"
                  placeholder="L"
                  placeholderTextColor={C.sub}
                  style={[styles.specBox, { backgroundColor: C.cardAlt, color: C.text }]}
                />
                <TextInput
                  value={airWid}
                  onChangeText={setAirWid}
                  keyboardType="numeric"
                  placeholder="W"
                  placeholderTextColor={C.sub}
                  style={[styles.specBox, { backgroundColor: C.cardAlt, color: C.text }]}
                />
                <TextInput
                  value={airHei}
                  onChangeText={setAirHei}
                  keyboardType="numeric"
                  placeholder="H"
                  placeholderTextColor={C.sub}
                  style={[styles.specBox, { backgroundColor: C.cardAlt, color: C.text }]}
                />
              </View>

              <Text style={{ color: C.sub, fontSize: 11, marginBottom: 6 }}>
                Configurable Volumetric Divisor (Carrier Dependent)
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                {['5000', '6000'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setVolDivisor(d)}
                    style={[
                      styles.choicePill,
                      { backgroundColor: volDivisor === d ? C.teal : C.cardAlt, borderColor: volDivisor === d ? C.teal : C.border },
                    ]}
                  >
                    <Text style={{ color: volDivisor === d ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>
                      Divisor /{d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ color: C.sub, fontSize: 11 }}>
                Formula: (L × W × H) / {airCalc.div} = {airCalc.vol} kg vs Actual {airCalc.act} kg
              </Text>
              <Text style={{ color: C.teal, fontSize: 15, fontWeight: '900', marginTop: 4, marginBottom: 12 }}>
                Chargeable Weight: {airCalc.chargeable} kg
              </Text>

              <TouchableOpacity
                onPress={() => {
                  const id = addRequest(`Air (${airCalc.chargeable} kg)`, airRoute, 'Quote Requested');
                  Alert.alert('Air Quote Requested', `Ref: ${id}\nRoute: ${airRoute}\nChargeable Wt: ${airCalc.chargeable} kg`);
                }}
                style={[styles.tealActionBtn, { backgroundColor: C.teal }]}
              >
                <Text style={{ color: '#071521', fontSize: 14, fontWeight: '900' }}>Request Air Freight Quote →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.border, flexDirection: 'column' }]}>
              <Text style={[styles.compareHeading, { color: C.text, marginBottom: 8 }]}>
                Air Cargo Documents Checklist
              </Text>
              {[
                { key: 'invoice', label: 'Commercial Invoice' },
                { key: 'packingList', label: 'Packing List' },
                { key: 'awb', label: 'Air Waybill (AWB) Draft' },
                { key: 'cooPhyto', label: 'Certificate of Origin / Phytosanitary / MSDS' },
              ].map((doc) => (
                <TouchableOpacity
                  key={doc.key}
                  onPress={() => setAirDocs((p) => ({ ...p, [doc.key]: !p[doc.key] }))}
                  style={[styles.modalItem, { borderBottomColor: C.border }]}
                >
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '700' }}>{doc.label}</Text>
                  <Text style={{ color: airDocs[doc.key] ? C.teal : C.sub, fontSize: 12, fontWeight: '900' }}>
                    {airDocs[doc.key] ? '✓ Ready' : 'Pending'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          5. SAMPLE & TRACKING:
          - Separate Sample Request vs Tracking Timelines
          - Dedicated India Domestic Workflow (Train / Rail Parcel + Road Transport)
          - International Workflow (DHL Express / FedEx)
      ========================================================= */}
      {screen === 'sample' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.screenHeading, { color: C.text }]}>Sample & Tracking</Text>

          {/* Separate Process Tabs: Sample Request vs Shipment & Lab Tracking */}
          <View style={[styles.tabContainer, { backgroundColor: C.card, borderColor: C.border }]}>
            <TouchableOpacity
              onPress={() => setSampleMainTab('request')}
              style={[styles.tabPill, sampleMainTab === 'request' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: sampleMainTab === 'request' ? '#071521' : C.text, fontSize: 13, fontWeight: '900' }}>
                Sample Request
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSampleMainTab('tracking')}
              style={[styles.tabPill, sampleMainTab === 'tracking' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: sampleMainTab === 'tracking' ? '#071521' : C.text, fontSize: 13, fontWeight: '900' }}>
                Shipment Tracking
              </Text>
            </TouchableOpacity>
          </View>

          {sampleMainTab === 'request' ? (
            <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.border, flexDirection: 'column' }]}>
              <Text style={{ color: C.sub, fontSize: 11, marginBottom: 6 }}>Sample Destination Scope</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {[
                  { id: 'domestic', lbl: 'Within India (Domestic)' },
                  { id: 'international', lbl: 'Outside India (Export)' },
                ].map((sc) => (
                  <TouchableOpacity
                    key={sc.id}
                    onPress={() => setSampleScope(sc.id)}
                    style={[
                      styles.choicePill,
                      {
                        flex: 1,
                        alignItems: 'center',
                        backgroundColor: sampleScope === sc.id ? C.teal : C.cardAlt,
                        borderColor: sampleScope === sc.id ? C.teal : C.border,
                      },
                    ]}
                  >
                    <Text style={{ color: sampleScope === sc.id ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>
                      {sc.lbl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {sampleScope === 'domestic' ? (
                <>
                  <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900', marginBottom: 6 }}>
                    DOMESTIC SAMPLE DISPATCH MODE (INDIA)
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {[
                      { id: 'train', lbl: '🚆 Train / Rail Parcel' },
                      { id: 'road', lbl: '🚛 Road Transport' },
                      { id: 'courier', lbl: '📦 Domestic Courier' },
                    ].map((dm) => (
                      <TouchableOpacity
                        key={dm.id}
                        onPress={() => setDomesticMethod(dm.id)}
                        style={[
                          styles.choicePill,
                          {
                            backgroundColor: domesticMethod === dm.id ? C.amber : C.cardAlt,
                            borderColor: domesticMethod === dm.id ? C.amber : C.border,
                          },
                        ]}
                      >
                        <Text style={{ color: domesticMethod === dm.id ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>
                          {dm.lbl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {domesticMethod === 'train' && (
                    <View style={[styles.subWorkflowBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                      <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900', marginBottom: 6 }}>
                        TRAIN / RAIL PARCEL WORKFLOW
                      </Text>
                      <Text style={{ color: C.sub, fontSize: 10 }}>Origin Railway Station (Parcel Office)</Text>
                      <TextInput
                        value={trainStationFrom}
                        onChangeText={setTrainStationFrom}
                        style={[styles.inlineInput, { color: C.text, marginBottom: 8 }]}
                      />
                      <Text style={{ color: C.sub, fontSize: 10 }}>Destination Railway Station</Text>
                      <TextInput
                        value={trainStationTo}
                        onChangeText={setTrainStationTo}
                        style={[styles.inlineInput, { color: C.text, marginBottom: 8 }]}
                      />
                      <Text style={{ color: C.sub, fontSize: 10 }}>Parcel Service Type</Text>
                      <TextInput
                        value={trainServiceType}
                        onChangeText={setTrainServiceType}
                        style={[styles.inlineInput, { color: C.text }]}
                      />
                    </View>
                  )}

                  {domesticMethod === 'road' && (
                    <View style={[styles.subWorkflowBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                      <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900', marginBottom: 6 }}>
                        ROAD TRANSPORT SAMPLE WORKFLOW
                      </Text>
                      <Text style={{ color: C.sub, fontSize: 10 }}>Preferred Transport Line / Fleet</Text>
                      <TextInput
                        value={transportOperator}
                        onChangeText={setTransportOperator}
                        style={[styles.inlineInput, { color: C.text, marginBottom: 8 }]}
                      />
                      <Text style={{ color: C.sub, fontSize: 10 }}>Delivery Mode (Godown / Door)</Text>
                      <TextInput
                        value={biltyType}
                        onChangeText={setBiltyType}
                        style={[styles.inlineInput, { color: C.text }]}
                      />
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={{ color: C.sub, fontSize: 11, marginBottom: 6 }}>International Courier Partner</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    {['DHL Express', 'FedEx', 'Other Partner'].map((ic) => (
                      <TouchableOpacity
                        key={ic}
                        onPress={() => setIntlCourier(ic)}
                        style={[
                          styles.choicePill,
                          {
                            backgroundColor: intlCourier === ic ? C.amber : C.cardAlt,
                            borderColor: intlCourier === ic ? C.amber : C.border,
                          },
                        ]}
                      >
                        <Text style={{ color: intlCourier === ic ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>
                          {ic}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={{ color: C.sub, fontSize: 11 }}>Sample Commodity & Weight</Text>
              <TextInput
                value={sampleCommodity}
                onChangeText={setSampleCommodity}
                style={[styles.inlineInput, { color: C.text, marginTop: 3, marginBottom: 10 }]}
              />

              <Text style={{ color: C.sub, fontSize: 11 }}>Pickup Location (City / PIN)</Text>
              <TextInput
                value={samplePickup}
                onChangeText={setSamplePickup}
                style={[styles.inlineInput, { color: C.text, marginTop: 3, marginBottom: 10 }]}
              />

              <Text style={{ color: C.sub, fontSize: 11 }}>Receiver / Lab Location</Text>
              <TextInput
                value={sampleReceiver}
                onChangeText={setSampleReceiver}
                style={[styles.inlineInput, { color: C.text, marginTop: 3, marginBottom: 12 }]}
              />

              <TouchableOpacity
                onPress={() => {
                  const modeUsed =
                    sampleScope === 'domestic'
                      ? domesticMethod === 'train'
                        ? `Train Parcel (${trainStationFrom} → ${trainStationTo})`
                        : domesticMethod === 'road'
                          ? `Road Transport (${transportOperator})`
                          : 'Domestic Courier'
                      : intlCourier;
                  const reqId = addRequest(`Sample (${modeUsed})`, `${samplePickup} → ${sampleReceiver}`, 'Sample Request Created');
                  Alert.alert(
                    'Sample Request Created',
                    `Sample Ref ID: ${sampleRefId}\nRequest ID: ${reqId}\nMode: ${modeUsed}`
                  );
                }}
                style={[styles.tealActionBtn, { backgroundColor: C.teal }]}
              >
                <Text style={{ color: '#071521', fontSize: 14, fontWeight: '900' }}>
                  Create Sample Request ({sampleRefId})
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* SEPARATE TRACKING TIMELINES: COURIER / TRANSIT vs LAB TESTING */
            <View>
              <View style={[styles.tabContainer, { backgroundColor: C.card, borderColor: C.border }]}>
                <TouchableOpacity
                  onPress={() => setTrackingCategory('courier')}
                  style={[styles.tabPill, trackingCategory === 'courier' && { backgroundColor: C.amber }]}
                >
                  <Text style={{ color: trackingCategory === 'courier' ? '#071521' : C.text, fontSize: 12, fontWeight: '900' }}>
                    Courier / Transit Timeline
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTrackingCategory('lab')}
                  style={[styles.tabPill, trackingCategory === 'lab' && { backgroundColor: C.amber }]}
                >
                  <Text style={{ color: trackingCategory === 'lab' ? '#071521' : C.text, fontSize: 12, fontWeight: '900' }}>
                    Lab Testing Timeline
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.border, flexDirection: 'column' }]}>
                <Text style={{ color: C.sub, fontSize: 11 }}>
                  AWB / Railway RR No. / Transport Bilty (Separate from {sampleRefId})
                </Text>
                <TextInput
                  value={trackingNumber}
                  onChangeText={setTrackingNumber}
                  placeholder="Enter AWB, RR Number, or Bilty No."
                  placeholderTextColor={C.sub}
                  style={[styles.inlineInput, { color: C.text, marginTop: 4, marginBottom: 12 }]}
                />

                {trackingCategory === 'courier' ? (
                  <View>
                    <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900', marginBottom: 8 }}>
                      TRANSIT TIMELINE ({sampleRefId})
                    </Text>
                    {['1. Sample Pickup Completed', '2. In Transit (Rail / Road / Air)', '3. Customs / Destination Hub', '4. Delivered to Receiver / Lab'].map(
                      (st, idx) => (
                        <Text key={st} style={{ color: idx < 2 ? C.text : C.sub, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                          {idx < 2 ? '● ' : '○ '} {st}
                        </Text>
                      )
                    )}
                  </View>
                ) : (
                  <View>
                    <Text style={{ color: C.amber, fontSize: 12, fontWeight: '900', marginBottom: 8 }}>
                      LAB TESTING TIMELINE ({sampleRefId})
                    </Text>
                    {['1. Sample Received at Lab', '2. Moisture & Grain / Quality Analysis', '3. Purity & Lab Verification', '4. Digital Lab Report (e-Certificate)'].map(
                      (st, idx) => (
                        <Text key={st} style={{ color: idx === 0 ? C.text : C.sub, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                          {idx === 0 ? '● ' : '○ '} {st}
                        </Text>
                      )
                    )}
                  </View>
                )}

                <Text style={{ color: C.sub, fontSize: 10, marginTop: 8 }}>
                  Note: Live carrier API auto-sync will connect once carrier tracking credentials are linked.
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          6. MY REQUESTS / SHIPMENTS DASHBOARD
      ========================================================= */}
      {screen === 'requests' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.screenHeading, { color: C.text }]}>My Shipments & Requests</Text>
          {myRequests.map((req) => (
            <View key={req.id} style={[styles.carrierCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900' }}>{req.id}</Text>
                <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800' }}>{req.status}</Text>
              </View>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: '800', marginTop: 4 }}>{req.module}</Text>
              <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{req.route}</Text>
            </View>
          ))}
        </View>
      )}

      {/* SEARCHABLE PICKER MODAL */}
      <Modal visible={!!pickerOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.rowBetween}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>
                {pickerOpen === 'region'
                  ? 'Select Region'
                  : pickerOpen === 'txCur'
                    ? 'Select Transaction Currency'
                    : pickerOpen === 'dispCur'
                      ? 'Select Display Currency'
                      : 'Select Incoterm'}
              </Text>
              <TouchableOpacity onPress={() => setPickerOpen(null)}>
                <Text style={{ color: C.teal, fontSize: 13, fontWeight: '800' }}>Close</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search..."
              placeholderTextColor={C.sub}
              style={[
                styles.inlineInput,
                {
                  backgroundColor: C.cardAlt,
                  borderColor: C.border,
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  color: C.text,
                  marginTop: 10,
                  marginBottom: 8,
                },
              ]}
            />

            {pickerOpen === 'region' && recentRegions.length > 0 && !searchText.trim() && (
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                {recentRegions.map((rr) => (
                  <TouchableOpacity
                    key={'rec-' + rr.code}
                    onPress={() => {
                      setRegion(rr);
                      setRecentRegionCodes((p) => [rr.code, ...p.filter((x) => x !== rr.code)].slice(0, 5));
                      setPickerOpen(null);
                    }}
                    style={[styles.choicePill, { backgroundColor: C.cardAlt, borderColor: C.teal }]}
                  >
                    <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>{rr.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <ScrollView style={{ maxHeight: 260 }}>
              {pickerOpen === 'region' &&
                REGIONS.filter(
                  (r) => !searchText.trim() || r.label.toLowerCase().includes(searchText.trim().toLowerCase())
                ).map((r) => (
                  <TouchableOpacity
                    key={r.code}
                    onPress={() => {
                      setRegion(r);
                      setRecentRegionCodes((p) => [r.code, ...p.filter((x) => x !== r.code)].slice(0, 5));
                      setPickerOpen(null);
                    }}
                    style={[styles.modalItem, { borderBottomColor: C.border }]}
                  >
                    <Text style={{ color: region.code === r.code ? C.teal : C.text, fontSize: 13, fontWeight: '800' }}>
                      {r.label}
                    </Text>
                    <Text style={{ color: C.sub, fontSize: 11 }}>{r.currency}</Text>
                  </TouchableOpacity>
                ))}

              {(pickerOpen === 'txCur' || pickerOpen === 'dispCur') &&
                CURRENCIES.filter(
                  (cur) => !searchText.trim() || cur.label.toLowerCase().includes(searchText.trim().toLowerCase())
                ).map((cur) => {
                  const activeVal = pickerOpen === 'txCur' ? txCurrency : dispCurrency;
                  return (
                    <TouchableOpacity
                      key={cur.code}
                      onPress={() => {
                        if (pickerOpen === 'txCur') setTxCurrency(cur.code);
                        else setDispCurrency(cur.code);
                        setPickerOpen(null);
                      }}
                      style={[styles.modalItem, { borderBottomColor: C.border }]}
                    >
                      <Text style={{ color: activeVal === cur.code ? C.teal : C.text, fontSize: 13, fontWeight: '800' }}>
                        {cur.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

              {pickerOpen === 'incoterm' &&
                INCOTERMS_INFO.filter(
                  (item) => !searchText.trim() || item.code.toLowerCase().includes(searchText.trim().toLowerCase())
                ).map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    onPress={() => {
                      setIncoterm(item.code);
                      setPickerOpen(null);
                    }}
                    style={[styles.modalItem, { borderBottomColor: C.border }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: incoterm === item.code ? C.teal : C.text, fontSize: 13, fontWeight: '900' }}>
                        {item.code}
                      </Text>
                      <Text style={{ color: C.sub, fontSize: 10 }}>{item.included}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topHeader: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { paddingRight: 4, paddingVertical: 2 },
  logoImg: { width: 32, height: 32, borderRadius: 16 },
  brandTitle: { fontSize: 17, fontWeight: '900', letterSpacing: 0.4 },
  brandSub: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  unitPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
  },
  hubMainTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 0.3 },
  hubTagline: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardsGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  moduleCard: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 10 },
  visualBanner: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeadTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 0.3, textAlign: 'center' },
  routeMiniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    marginBottom: 6,
  },
  cardFooterSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 6,
  },
  wideSampleBar: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sampleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenHeading: { fontSize: 20, fontWeight: '900', marginBottom: 12 },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabPill: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  stepStrip: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  stepChip: { flex: 1, paddingVertical: 6, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  inlineInput: { fontSize: 13, fontWeight: '800', paddingVertical: 3 },
  hairline: { height: 1, marginTop: 8 },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  specBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  specInput: { fontSize: 13, fontWeight: '800', marginTop: 3, paddingVertical: 0 },
  choicePill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  subWorkflowBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  tealActionBtn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 2 },
  compareHeading: { fontSize: 16, fontWeight: '900' },
  carrierCard: { borderWidth: 1.2, borderRadius: 14, padding: 12, marginBottom: 10 },
  rightPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bottomActionRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  secondaryActionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryProceedBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, padding: 16 },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
});
