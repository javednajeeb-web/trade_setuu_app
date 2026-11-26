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
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const TS_LOGO = require('../1795099375380.png');

const REGIONS = [
  { code: 'IN', label: 'India (IN)', currency: 'INR', weightUnit: 'MT', factor: 1.0 },
  { code: 'GLOBAL', label: 'Global (Auto)', currency: 'USD', weightUnit: 'MT', factor: 1.06 },
  { code: 'AE', label: 'United Arab Emirates (AE)', currency: 'AED', weightUnit: 'MT', factor: 1.15 },
  { code: 'US', label: 'United States (US)', currency: 'USD', weightUnit: 'MT', factor: 1.32 },
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
  { id: '16w', name: '16-Wheeler (18–21 MT)', capMt: 21, ratePerKm: 64, availability: 'Indicative Fleet • 4 Trucks (Raipur)' },
  { id: '18w', name: '18-Wheeler (22–25 MT)', capMt: 25, ratePerKm: 72, availability: 'Indicative Fleet • 3 Trucks (Raipur)' },
  { id: '22w', name: '22-Wheeler Multi-Axle (28–32 MT)', capMt: 32, ratePerKm: 84, availability: 'Indicative Fleet • 6 Trucks (Corridor)' },
  { id: 'cont40', name: '40ft Trailer / Container Carrier', capMt: 28, ratePerKm: 88, availability: 'Indicative Fleet • Port Lane Ready' },
];

const RETURN_LOAD_TRIPS = [
  { id: 'ret1', route: 'Visakhapatnam → Raipur', truck: '22-Wheeler (32 MT)', offerInr: 41500, saving: 'Indicative ~18% Return Match' },
  { id: 'ret2', route: 'Mumbai / Bhiwandi → Raipur', truck: '18-Wheeler (25 MT)', offerInr: 46800, saving: 'Indicative Reverse Corridor' },
  { id: 'ret3', route: 'Nagpur → Raipur', truck: '16-Wheeler (21 MT)', offerInr: 16200, saving: 'Indicative Return Bid' },
];

const CARRIER_QUOTES = [
  {
    id: 'maersk',
    name: 'MAERSK',
    badgeLeft: '(Indicative)',
    badgeStyle: 'indicative',
    badgeRight: 'Indicative',
    rating: '4.8',
    inrPrice: 123400,
    tt: '14 - 16 Days',
    validity: '7 Days (Indicative)',
    serviceType: 'Port-to-Port • Direct',
    included: 'Base Ocean Freight + Origin Documentation',
    excluded: 'Dest. THC, Customs Clearance, Detention',
  },
  {
    id: 'msc',
    name: 'MSC',
    badgeLeft: '(Indicative Best Value)',
    badgeStyle: 'bestValue',
    badgeRight: 'Best Value',
    rating: '4.7',
    inrPrice: 118600,
    tt: '15 - 17 Days',
    validity: '7 Days (Indicative)',
    serviceType: 'Port-to-Port • Weekly Sailing',
    included: 'Base Ocean Freight + Seal + B/L Fee',
    excluded: 'Dest. Port THC, Import Duty & Local Haulage',
  },
  {
    id: 'cma',
    name: 'CMA CGM',
    badgeLeft: '(Indicative Quote)',
    badgeStyle: 'strike',
    badgeRight: 'Indicative',
    rating: '4.6',
    inrPrice: 130900,
    tt: '14 - 18 Days',
    validity: '7 Days (Indicative)',
    serviceType: 'Priority Equipment Estimate',
    included: 'Base Freight + Origin THC + Priority Slot',
    excluded: 'Dest. Customs & Destination THC',
  },
];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function convertWeightValue(val, fromUnit, toUnit) {
  const num = parseFloat(val);
  if (Number.isNaN(num) || num <= 0 || fromUnit === toUnit) return val;
  const mt = fromUnit === 'KG' ? num / 1000 : fromUnit === 'LB' ? num / 2204.6226 : num;
  if (toUnit === 'MT') return String(Number(mt.toFixed(3)));
  if (toUnit === 'KG') return String(Math.round(mt * 1000));
  return String(Math.round(mt * 2204.6226));
}

function formatMoney(inrAmount, curCode) {
  const rate = FX_TO_INR[curCode] || 1;
  const converted = inrAmount / rate;
  if (curCode === 'INR') return `₹${Math.round(converted).toLocaleString('en-IN')}`;
  if (curCode === 'USD') return `$${Math.round(converted).toLocaleString('en-US')}`;
  return `${curCode} ${converted.toFixed(0)}`;
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
    warnRed: '#F87171',
  };

  const [screen, setScreen] = useState('hub');

  // Region, Tx Currency, Display Currency & Weight Unit
  const [recentRegionCodes, setRecentRegionCodes] = useState(['IN', 'AE', 'US']);
  const [region, setRegion] = useState(REGIONS[0]);
  const [txCurrency, setTxCurrency] = useState('INR');
  const [dispCurrency, setDispCurrency] = useState('INR');
  const [weightUnit, setWeightUnit] = useState('MT');

  const [idCounter, setIdCounter] = useState(1002);
  const [myRequests, setMyRequests] = useState([
    {
      id: 'TS-REQ-1001',
      module: 'Inland Transport (Demo)',
      route: 'Raipur (492001) → Visakhapatnam (530001)',
      status: 'Indicative Quote Requested',
    },
  ]);

  const [pickerOpen, setPickerOpen] = useState(null);
  const [searchText, setSearchText] = useState('');

  // 1. Inland State
  const [loadTab, setLoadTab] = useState('book');
  const [inlandStep, setInlandStep] = useState(1);
  const [pickupLoc, setPickupLoc] = useState('Mumbai, India (400001)');
  const [deliveryLoc, setDeliveryLoc] = useState('Ahmedabad, India (380001)');
  const [cargoCategory, setCargoCategory] = useState('Agro / Bulk Grain');
  const [cargoPackaging, setCargoPackaging] = useState('50 kg PP Bags / Palletized');
  const [cargoWeightVal, setCargoWeightVal] = useState('20');
  const [distanceKm, setDistanceKm] = useState('524');
  const [selectedVehicleId, setSelectedVehicleId] = useState('22w');
  const [selectedCarrierId, setSelectedCarrierId] = useState('partner-best');
  const [bookingRequestId, setBookingRequestId] = useState('');
  const [selectedReturnTrip, setSelectedReturnTrip] = useState(RETURN_LOAD_TRIPS[0]);
  const [bidOfferAmount, setBidOfferAmount] = useState('40000');

  // 2. Rail Freight State (Full Rake / Mini Rake / Two-Point)
  const [railOrigin, setRailOrigin] = useState('Raipur Goods Shed (R)');
  const [railDest, setRailDest] = useState('Bhiwandi / Mumbai Terminal');
  const [railCommodity, setRailCommodity] = useState('1121 Sella Rice / Bulk Grain');
  const [railQtyMt, setRailQtyMt] = useState('500');
  const [railProduct, setRailProduct] = useState('Full Rake');
  const [railCalculatedAt, setRailCalculatedAt] = useState('Initial Indicative Estimate');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // 3. Ocean State
  const [oceanRoute, setOceanRoute] = useState('Nhava Sheva (INNSA) → Jebel Ali (AEJEA)');
  const [oceanServiceMode, setOceanServiceMode] = useState('Port-to-Port');
  const [oceanShipmentType, setOceanShipmentType] = useState('FCL');
  const [oceanContainer, setOceanContainer] = useState("40' HC");
  const [oceanWeightMt, setOceanWeightMt] = useState('24');
  const [oceanCbm, setOceanCbm] = useState('14');
  const [oceanReadyDate, setOceanReadyDate] = useState('2026-12-02');
  const [oceanHsCode, setOceanHsCode] = useState('1006.30');
  const [oceanPrefLine, setOceanPrefLine] = useState('MSC / Maersk');
  const [incoterm, setIncoterm] = useState('CIF');
  const [selectedOceanCarrierId, setSelectedOceanCarrierId] = useState('msc');
  const [showOceanRates, setShowOceanRates] = useState(false);

  // 4. Air Freight State
  const [airTab, setAirTab] = useState('calculator');
  const [airRoute, setAirRoute] = useState('DEL (India) → FRA (Germany)');
  const [airActualKg, setAirActualKg] = useState('1000');
  const [airLen, setAirLen] = useState('120');
  const [airWid, setAirWid] = useState('100');
  const [airHei, setAirHei] = useState('104');
  const [volDivisor, setVolDivisor] = useState('5000');
  const [airRatePerKgInr, setAirRatePerKgInr] = useState('195');
  const [airDocs, setAirDocs] = useState({
    invoice: true,
    packingList: true,
    awb: true,
    cooPhyto: false,
  });

  // 5. Sample & Tracking State
  const [sampleMainTab, setSampleMainTab] = useState('request');
  const [sampleScope, setSampleScope] = useState('domestic');
  const [domesticMethod, setDomesticMethod] = useState('train');
  const [intlCourier, setIntlCourier] = useState('DHL Express');
  const [sampleCommodity, setSampleCommodity] = useState('1121 Basmati Rice Sample (5 kg)');
  const [samplePickup, setSamplePickup] = useState('Raipur, CG (PIN 492001)');
  const [sampleReceiver, setSampleReceiver] = useState('Mumbai Lab / Buyer (PIN 400001)');
  const [trainStationFrom, setTrainStationFrom] = useState('Raipur Jn (R)');
  const [trainStationTo, setTrainStationTo] = useState('CSMT / LTT Mumbai');
  const [trainServiceType, setTrainServiceType] = useState('Railway Parcel Van / Brake Van');
  const [transportOperator, setTransportOperator] = useState('VRL / TCI / Local Road Transport');
  const [biltyType, setBiltyType] = useState('Door-to-Door / Godown Delivery');
  const [latestSampleRefId, setLatestSampleRefId] = useState('TS-SMP-2041');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCategory, setTrackingCategory] = useState('courier');

  const handleWeightUnitChange = (nextUnit) => {
    if (nextUnit === weightUnit) return;
    const converted = convertWeightValue(cargoWeightVal, weightUnit, nextUnit);
    setCargoWeightVal(converted);
    setWeightUnit(nextUnit);
  };

  const swapInlandRoute = () => {
    const t = pickupLoc;
    setPickupLoc(deliveryLoc);
    setDeliveryLoc(t);
  };

  const selectedVehicle = useMemo(
    () => VEHICLE_FLEET.find((v) => v.id === selectedVehicleId) || VEHICLE_FLEET[2],
    [selectedVehicleId]
  );

  const inlandCalc = useMemo(() => {
    const km = Math.max(20, parseFloat(distanceKm) || 524);
    const rawWt = Math.max(0, parseFloat(cargoWeightVal) || 0);
    const wtMt = weightUnit === 'KG' ? rawWt / 1000 : weightUnit === 'LB' ? rawWt / 2204.6226 : rawWt;
    const exceedsCapacity = wtMt > selectedVehicle.capMt;
    const suggestedVehicle = VEHICLE_FLEET.find((v) => v.capMt >= wtMt) || VEHICLE_FLEET[VEHICLE_FLEET.length - 1];

    const regionFactor = region.factor || 1.0;
    const txFactor = txCurrency === 'INR' ? 1.0 : 1.01;
    const baseFreightInr = Math.round((km * selectedVehicle.ratePerKm + Math.max(1, wtMt) * 120) * regionFactor * txFactor);
    const platformFeeInr = Math.round(Math.max(1, wtMt) * 25);
    const partnerQuoteInr = Math.round(baseFreightInr * 0.96);

    return {
      wtMt,
      exceedsCapacity,
      suggestedVehicle,
      baseFreightInr,
      platformFeeInr,
      partnerQuoteInr,
    };
  }, [distanceKm, cargoWeightVal, weightUnit, selectedVehicle, region, txCurrency]);

  const railCalc = useMemo(() => {
    const mt = Math.max(1, parseFloat(railQtyMt) || 500);
    const ratePerMt =
      railProduct === 'Full Rake'
        ? 1450
        : railProduct === 'Mini Rake'
          ? 1620
          : 1540;
    const basicRailInr = Math.round(mt * ratePerMt * (region.factor || 1.0));
    const terminalHandlingInr = Math.round(mt * 110);
    const firstLastMileInr = Math.round(mt * 240);
    const totalRailInr = basicRailInr + terminalHandlingInr + firstLastMileInr;
    const roadEstInr = Math.round(totalRailInr * 1.15);
    return { basicRailInr, terminalHandlingInr, firstLastMileInr, totalRailInr, roadEstInr, ratePerMt };
  }, [railQtyMt, railProduct, region]);

  const airCalc = useMemo(() => {
    const act = Math.max(0, parseFloat(airActualKg) || 0);
    const l = Math.max(0, parseFloat(airLen) || 0);
    const w = Math.max(0, parseFloat(airWid) || 0);
    const h = Math.max(0, parseFloat(airHei) || 0);
    const div = Math.max(1000, parseFloat(volDivisor) || 5000);
    const vol = Number(((l * w * h) / div).toFixed(2));
    const chargeable = Number(Math.max(act, vol).toFixed(2));
    const rateKg = Math.max(1, parseFloat(airRatePerKgInr) || 195);
    const indicativeAirCostInr = Math.round(chargeable * rateKg * (region.factor || 1.0));
    return { act, vol, chargeable, div, indicativeAirCostInr };
  }, [airActualKg, airLen, airWid, airHei, volDivisor, airRatePerKgInr, region]);

  const activeIncotermObj = useMemo(
    () => INCOTERMS_INFO.find((item) => item.code === incoterm) || INCOTERMS_INFO[4],
    [incoterm]
  );

  const selectedOceanCarrier = useMemo(
    () => CARRIER_QUOTES.find((c) => c.id === selectedOceanCarrierId) || CARRIER_QUOTES[1],
    [selectedOceanCarrierId]
  );

  const recentRegions = useMemo(
    () => recentRegionCodes.map((code) => REGIONS.find((r) => r.code === code)).filter(Boolean),
    [recentRegionCodes]
  );

  const addRequest = (moduleName, routeStr, statusStr = 'Indicative Quote Requested') => {
    const nextNum = idCounter + 1;
    setIdCounter(nextNum);
    const reqId = `TS-REQ-${nextNum}`;
    setMyRequests((prev) => [{ id: reqId, module: moduleName, route: routeStr, status: statusStr }, ...prev]);
    return reqId;
  };

  const shareRailEstimatePdf = async () => {
    const docRef = `TS-RAIL-${idCounter}`;
    const generatedAt = new Date().toLocaleString('en-IN');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #0F172A; padding: 28px; }
            .letterhead { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0D9488; padding-bottom: 14px; margin-bottom: 20px; }
            .brand { font-size: 24px; font-weight: 900; color: #071521; letter-spacing: 0.5px; }
            .brand span { color: #0D9488; }
            .sub { font-size: 11px; color: #475569; margin-top: 3px; }
            .meta { text-align: right; font-size: 11px; color: #334155; }
            .badge { display: inline-block; background: #FEF3C7; color: #92400E; font-weight: 700; padding: 4px 10px; border-radius: 6px; font-size: 11px; margin-bottom: 14px; }
            .grid { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
            .grid td { border: 1px solid #CBD5E1; padding: 9px 12px; font-size: 12px; }
            .lbl { font-weight: 700; color: #334155; width: 36%; background: #F8FAFC; }
            .total-row td { background: #F0FDFA; font-weight: 900; color: #0F172A; font-size: 13px; border-top: 2px solid #0D9488; }
            .compare-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; font-size: 12px; margin-bottom: 18px; }
            .note { font-size: 10px; color: #64748B; line-height: 1.5; border-top: 1px solid #E2E8F0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div>
              <div class="brand">TRADE <span>SETUU</span></div>
              <div class="sub">Global Trade • Sourcing • Logistics • Finance</div>
            </div>
            <div class="meta">
              <div><strong>Estimate Ref:</strong> ${escapeHtml(docRef)}</div>
              <div><strong>Generated:</strong> ${escapeHtml(generatedAt)}</div>
              <div><strong>Display / Tx:</strong> ${escapeHtml(dispCurrency)} / ${escapeHtml(txCurrency)}</div>
            </div>
          </div>

          <div class="badge">INDICATIVE RAIL FREIGHT ESTIMATE (NON-OFFICIAL TARIFF)</div>

          <table class="grid">
            <tr><td class="lbl">Loading Station / Goods Shed</td><td>${escapeHtml(railOrigin)}</td></tr>
            <tr><td class="lbl">Unloading Station / Goods Shed</td><td>${escapeHtml(railDest)}</td></tr>
            <tr><td class="lbl">Commodity</td><td>${escapeHtml(railCommodity)}</td></tr>
            <tr><td class="lbl">Total Quantity</td><td>${escapeHtml(railQtyMt)} MT</td></tr>
            <tr><td class="lbl">Rail Mode</td><td>${escapeHtml(railProduct)}</td></tr>
            <tr><td class="lbl">Basic Rail Freight (Indicative)</td><td>${escapeHtml(formatMoney(railCalc.basicRailInr, dispCurrency))}</td></tr>
            <tr><td class="lbl">Terminal Handling (Indicative)</td><td>${escapeHtml(formatMoney(railCalc.terminalHandlingInr, dispCurrency))}</td></tr>
            <tr><td class="lbl">First & Last Mile Road (Indicative)</td><td>${escapeHtml(formatMoney(railCalc.firstLastMileInr, dispCurrency))}</td></tr>
            <tr class="total-row"><td class="lbl">Estimated Total Rail Cost</td><td>${escapeHtml(formatMoney(railCalc.totalRailInr, dispCurrency))}</td></tr>
          </table>

          <div class="compare-box">
            <strong>Smart Road vs Rail Comparison (Indicative):</strong><br/>
            Road Transport Estimate: <strong>${escapeHtml(formatMoney(railCalc.roadEstInr, dispCurrency))}</strong> vs Rail Estimate: <strong>${escapeHtml(formatMoney(railCalc.totalRailInr, dispCurrency))}</strong>.
          </div>

          <div class="note">
            <strong>Disclaimer:</strong> Indicative planning estimate only; not an official Indian Railways tariff or demand receipt. Official FOIS / RailSAHAY rules, registration fees, and live railway tariff apply.<br/>
            <em>Powered by Apex Sync Technologies</em>
          </div>
        </body>
      </html>
    `;

    try {
      setIsGeneratingPdf(true);
      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Trade SETUU Rail Estimate (${docRef})`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Created', `Saved at:\n${uri}`);
      }
    } catch {
      const fallbackText =
        `TRADE SETUU — Indicative Rail Estimate (${docRef})\n` +
        `Route: ${railOrigin} → ${railDest}\n` +
        `Commodity: ${railCommodity} (${railQtyMt} MT) • ${railProduct}\n` +
        `Total Rail Estimate: ${formatMoney(railCalc.totalRailInr, dispCurrency)}\n` +
        `Road Comparison: ${formatMoney(railCalc.roadEstInr, dispCurrency)}`;
      await Share.share({ message: fallbackText });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 96 }}>
      {/* TOP BRAND HEADER */}
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
                handleWeightUnitChange(weightUnit === 'MT' ? 'KG' : weightUnit === 'KG' ? 'LB' : 'MT')
              }
              style={[styles.unitPill, { backgroundColor: C.cardAlt, borderColor: C.border }]}
            >
              <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>{weightUnit}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* =========================================================
          0. GLOBAL LOGISTICS HUB DASHBOARD (2 + 2 + 1 LAYOUT)
          Row 1: Inland Transport | Rail Freight
          Row 2: Ocean & Shipping | Air Freight
          Row 3: Full-width Sample & Tracking Card
      ========================================================= */}
      {screen === 'hub' && (
        <View style={{ padding: 14 }}>
          {/* Hero Section with Globe / Trade Corridor Visual */}
          <View style={[styles.heroCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.hubMainTitle, { color: C.text }]}>GLOBAL LOGISTICS HUB</Text>
              <Text style={[styles.hubTagline, { color: C.teal }]}>
                Plan • Compare • Quote • Book • Track
              </Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 4 }}>
                Corridor: India (IN) ↔ UAE / Global Lanes
              </Text>
            </View>
            <View style={[styles.globeOrb, { backgroundColor: '#0B1D2C', borderColor: C.teal }]}>
              <Text style={{ fontSize: 22 }}>🌐</Text>
              <Text style={{ color: C.amber, fontSize: 8, fontWeight: '900', marginTop: 1 }}>LIVE HUB</Text>
            </View>
          </View>

          {/* Large Region, Tx Currency & Display Currency Selectors */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => { setSearchText(''); setPickerOpen('region'); }}
              style={[styles.largeFilterBox, { flex: 1.35, backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.sub, fontSize: 10 }}>Region</Text>
              <View style={[styles.rowBetween, { marginTop: 2 }]}>
                <Text style={{ color: C.text, fontSize: 12, fontWeight: '900' }} numberOfLines={1}>
                  {region.label}
                </Text>
                <Text style={{ color: C.teal, fontSize: 12 }}>▾</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSearchText(''); setPickerOpen('txCur'); }}
              style={[styles.largeFilterBox, { flex: 0.85, backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.sub, fontSize: 10 }}>Tx Currency</Text>
              <View style={[styles.rowBetween, { marginTop: 2 }]}>
                <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900' }}>{txCurrency}</Text>
                <Text style={{ color: C.sub, fontSize: 12 }}>▾</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSearchText(''); setPickerOpen('dispCur'); }}
              style={[styles.largeFilterBox, { flex: 0.9, backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.sub, fontSize: 10 }}>Display</Text>
              <View style={[styles.rowBetween, { marginTop: 2 }]}>
                <Text style={{ color: C.amber, fontSize: 12, fontWeight: '900' }}>{dispCurrency}</Text>
                <Text style={{ color: C.sub, fontSize: 12 }}>▾</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ROW 1: 1. INLAND TRANSPORT & 2. RAIL FREIGHT */}
          <View style={styles.cardsGrid}>
            <TouchableOpacity
              onPress={() => { setInlandStep(1); setScreen('inland'); }}
              style={[styles.largeModuleCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.largeVisualStage, { backgroundColor: '#122D42', borderColor: C.border }]}>
                <Text style={{ fontSize: 34 }}>🚛</Text>
                <Text style={{ color: C.teal, fontSize: 9, fontWeight: '900', marginTop: 4 }}>
                  Road • Truck • Return Load • Bidding
                </Text>
              </View>

              <Text style={[styles.largeCardTitle, { color: C.text }]}>INLAND TRANSPORT</Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                Pickup → Drop • 1,240 km • 28.0 MT
              </Text>

              <View style={[styles.cardFooterSplit, { borderTopColor: C.border, marginTop: 8 }]}>
                <Text style={{ color: C.text, fontSize: 10, fontWeight: '800' }}>92% Util.</Text>
                <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>Open ›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setScreen('rail')}
              style={[styles.largeModuleCard, { backgroundColor: C.card, borderColor: C.teal }]}
            >
              <View style={[styles.largeVisualStage, { backgroundColor: '#122D42', borderColor: C.border }]}>
                <Text style={{ fontSize: 34 }}>🚆</Text>
                <Text style={{ color: C.amber, fontSize: 9, fontWeight: '900', marginTop: 4 }}>
                  Full Rake • Mini Rake • Two-Point
                </Text>
              </View>

              <Text style={[styles.largeCardTitle, { color: C.text }]}>RAIL FREIGHT</Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                Goods Shed • Bulk Rake • Road vs Rail
              </Text>

              <View style={[styles.cardFooterSplit, { borderTopColor: C.border, marginTop: 8 }]}>
                <Text style={{ color: C.amber, fontSize: 10, fontWeight: '800' }}>PDF Sheet</Text>
                <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>Open ›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ROW 2: 3. OCEAN & SHIPPING & 4. AIR FREIGHT */}
          <View style={styles.cardsGrid}>
            <TouchableOpacity
              onPress={() => setScreen('ocean')}
              style={[styles.largeModuleCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.largeVisualStage, { backgroundColor: '#122D42', borderColor: C.border }]}>
                <Text style={{ fontSize: 34 }}>🚢</Text>
                <Text style={{ color: C.teal, fontSize: 9, fontWeight: '900', marginTop: 4 }}>
                  FCL • LCL • Bulk • Breakbulk
                </Text>
              </View>

              <Text style={[styles.largeCardTitle, { color: C.text }]}>OCEAN & SHIPPING</Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                INNSA → AEJEA • 40' HC • 14–18d
              </Text>

              <View style={[styles.cardFooterSplit, { borderTopColor: C.border, marginTop: 8 }]}>
                <Text style={{ color: C.text, fontSize: 10, fontWeight: '800' }}>Incoterms</Text>
                <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>Open ›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setScreen('air')}
              style={[styles.largeModuleCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.largeVisualStage, { backgroundColor: '#122D42', borderColor: C.border }]}>
                <Text style={{ fontSize: 34 }}>✈️</Text>
                <Text style={{ color: C.amber, fontSize: 9, fontWeight: '900', marginTop: 4 }}>
                  Airport • Express • Cargo
                </Text>
              </View>

              <Text style={[styles.largeCardTitle, { color: C.text }]}>AIR FREIGHT</Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                DEL → FRA • Chargeable: 1,250 kg
              </Text>

              <View style={[styles.cardFooterSplit, { borderTopColor: C.border, marginTop: 8 }]}>
                <Text style={{ color: C.text, fontSize: 10, fontWeight: '800' }}>Vol. Calc</Text>
                <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>Open ›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ROW 3: 5. FULL-WIDTH SAMPLE & TRACKING CARD */}
          <TouchableOpacity
            onPress={() => setScreen('sample')}
            style={[styles.fullWidthSampleCard, { backgroundColor: C.card, borderColor: C.amber }]}
          >
            <View style={[styles.sampleSideArt, { backgroundColor: '#122D42', borderColor: C.border }]}>
              <Text style={{ fontSize: 28 }}>📦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.largeCardTitle, { color: C.text }]}>SAMPLE & TRACKING</Text>
              <Text style={{ color: C.amber, fontSize: 10, fontWeight: '800', marginTop: 2 }}>
                Sample • Courier • Lab • Inspection
              </Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 3 }}>
                India Train / Road • DHL / FedEx • Separate Timelines
              </Text>
            </View>
            <Text style={{ color: C.teal, fontSize: 13, fontWeight: '900' }}>Open ›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* =========================================================
          1. INLAND TRANSPORT
      ========================================================= */}
      {screen === 'inland' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.screenHeading, { color: C.text }]}>Inland Transport</Text>

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
                  <Text style={{ color: C.sub, fontSize: 11 }}>Vehicle Cap</Text>
                  <Text style={[styles.specInput, { color: C.text }]} numberOfLines={1}>
                    {selectedVehicle.name.split(' ')[0]} ({selectedVehicle.capMt} MT)
                  </Text>
                </View>
              </View>

              <View style={styles.cardsGrid}>
                <View style={[styles.specBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Distance (km, Indicative)</Text>
                  <TextInput
                    value={distanceKm}
                    onChangeText={setDistanceKm}
                    keyboardType="numeric"
                    style={[styles.specInput, { color: C.text }]}
                  />
                </View>
                <View style={[styles.specBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Est. Fee (₹25/MT)</Text>
                  <Text style={[styles.specInput, { color: C.amber }]}>
                    {formatMoney(inlandCalc.platformFeeInr, dispCurrency)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardsGrid}>
                <View style={[styles.specBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Cargo Category</Text>
                  <TextInput
                    value={cargoCategory}
                    onChangeText={setCargoCategory}
                    style={[styles.specInput, { color: C.text }]}
                  />
                </View>
                <View style={[styles.specBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Packaging / Dimensions</Text>
                  <TextInput
                    value={cargoPackaging}
                    onChangeText={setCargoPackaging}
                    style={[styles.specInput, { color: C.text }]}
                  />
                </View>
              </View>

              {inlandCalc.exceedsCapacity && (
                <View style={[styles.warnBox, { backgroundColor: 'rgba(248,113,113,0.12)', borderColor: C.warnRed }]}>
                  <Text style={{ color: C.warnRed, fontSize: 11, fontWeight: '800' }}>
                    Capacity Alert: {inlandCalc.wtMt.toFixed(1)} MT exceeds {selectedVehicle.name} ({selectedVehicle.capMt} MT). Suggested: {inlandCalc.suggestedVehicle.name}.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => setInlandStep(2)}
                style={[styles.tealActionBtn, { backgroundColor: C.teal }]}
              >
                <Text style={{ color: '#071521', fontSize: 14, fontWeight: '900' }}>Find Transport Options</Text>
              </TouchableOpacity>

              {inlandStep >= 2 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.compareHeading, { color: C.text, marginBottom: 8 }]}>
                    Step 2: Select Vehicle & Check Capacity
                  </Text>
                  {VEHICLE_FLEET.map((vf) => {
                    const active = selectedVehicleId === vf.id;
                    const overCap = inlandCalc.wtMt > vf.capMt;
                    return (
                      <TouchableOpacity
                        key={vf.id}
                        onPress={() => setSelectedVehicleId(vf.id)}
                        style={[
                          styles.carrierCard,
                          {
                            backgroundColor: C.card,
                            borderColor: active ? (overCap ? C.amber : C.teal) : C.border,
                          },
                        ]}
                      >
                        <View style={styles.rowBetween}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>{vf.name}</Text>
                            <Text style={{ color: overCap ? C.amber : C.sub, fontSize: 11, marginTop: 2 }}>
                              {overCap ? `Exceeds ${vf.capMt} MT for ${inlandCalc.wtMt.toFixed(1)} MT` : vf.availability}
                            </Text>
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

              {inlandStep >= 3 && (
                <View style={{ marginTop: 18 }}>
                  <Text style={[styles.compareHeading, { color: C.text }]}>
                    Step 3: Freight Rate Comparison (Indicative)
                  </Text>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '800', marginTop: 4 }}>
                    {pickupLoc} → {deliveryLoc}
                  </Text>
                  <Text style={{ color: C.sub, fontSize: 11, marginTop: 2, marginBottom: 10 }}>
                    {selectedVehicle.name} | {inlandCalc.wtMt.toFixed(1)} MT | Region: {region.code} | Fee: ₹25/MT (Indicative User Fee)
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
                      name: 'PARTNER RATE (INDICATIVE)',
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
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
                        const id = addRequest(
                          `Inland (${selectedVehicle.name})`,
                          `${pickupLoc} → ${deliveryLoc}`,
                          'Indicative Quote Requested'
                        );
                        setBookingRequestId(id);
                        setInlandStep(4);
                      }}
                      style={[styles.secondaryActionBtn, { backgroundColor: C.card, borderColor: C.border }]}
                    >
                      <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>Request Final Quote</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        const id = addRequest(
                          `Inland (${selectedVehicle.name})`,
                          `${pickupLoc} → ${deliveryLoc}`,
                          'Booking Request Logged (Pending Confirmation)'
                        );
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

              {inlandStep === 4 && bookingRequestId ? (
                <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.teal, flexDirection: 'column', marginTop: 14 }]}>
                  <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>
                    STEP 4: REQUEST LOGGED (LOCAL SESSION)
                  </Text>
                  <Text style={{ color: C.text, fontSize: 16, fontWeight: '900', marginTop: 4 }}>
                    Request ID: {bookingRequestId}
                  </Text>
                  <Text style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>
                    Route: {pickupLoc} → {deliveryLoc} • Vehicle: {selectedVehicle.name}
                  </Text>
                  <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800', marginTop: 4 }}>
                    Status: Saved in Session Requests • Backend DB sync pending integration
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <View>
              <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900', marginBottom: 8 }}>
                RETURN LOAD / BIDDING (INDICATIVE CORRIDORS)
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
                <Text style={{ color: C.sub, fontSize: 11 }}>Indicative Bid Offer ({dispCurrency}) for {selectedReturnTrip.route}</Text>
                <TextInput
                  value={bidOfferAmount}
                  onChangeText={setBidOfferAmount}
                  keyboardType="numeric"
                  style={[styles.inlineInput, { color: C.text, marginTop: 4, marginBottom: 10 }]}
                />
                <TouchableOpacity
                  onPress={() => {
                    const id = addRequest('Return Load Bid (Indicative)', selectedReturnTrip.route, 'Bid Logged');
                    Alert.alert('Bid Logged', `Ref: ${id}\nCorridor: ${selectedReturnTrip.route}`);
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
          2. RAIL FREIGHT MODULE (EXISTING RAIL SCREEN)
      ========================================================= */}
      {screen === 'rail' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.screenHeading, { color: C.text }]}>Rail Freight (Indicative Estimate)</Text>

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

            <Text style={{ color: C.sub, fontSize: 11 }}>Commodity & Quantity (MT)</Text>
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

            <Text style={{ color: C.sub, fontSize: 11, marginBottom: 6 }}>Rail Rake / Movement Mode</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {['Full Rake', 'Mini Rake', 'Two-Point'].map((rp) => {
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
              onPress={() => {
                setRailCalculatedAt(`Calculated at ${new Date().toLocaleTimeString('en-IN')}`);
              }}
              style={[styles.tealActionBtn, { backgroundColor: C.teal }]}
            >
              <Text style={{ color: '#071521', fontSize: 14, fontWeight: '900' }}>
                Calculate Indicative Rail Freight
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.teal, flexDirection: 'column' }]}>
            <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>
              INDICATIVE COST BREAKDOWN ({railProduct.toUpperCase()}) • {railCalculatedAt}
            </Text>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 4 }}>
              {formatMoney(railCalc.totalRailInr, dispCurrency)}
            </Text>
            <Text style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>
              • Basic Rail (Indicative ₹{railCalc.ratePerMt}/MT base): {formatMoney(railCalc.basicRailInr, dispCurrency)}
            </Text>
            <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>
              • Terminal Handling (Indicative ₹110/MT base): {formatMoney(railCalc.terminalHandlingInr, dispCurrency)}
            </Text>
            <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>
              • First & Last Mile (Indicative ₹240/MT base): {formatMoney(railCalc.firstLastMileInr, dispCurrency)}
            </Text>
            <Text style={{ color: C.teal, fontSize: 11, fontWeight: '800', marginTop: 6 }}>
              Road vs Rail (Indicative): Road ~ {formatMoney(railCalc.roadEstInr, dispCurrency)} vs Rail ~ {formatMoney(railCalc.totalRailInr, dispCurrency)}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                onPress={shareRailEstimatePdf}
                disabled={isGeneratingPdf}
                style={[styles.secondaryActionBtn, { backgroundColor: C.cardAlt, borderColor: C.teal }]}
              >
                <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900' }}>
                  {isGeneratingPdf ? 'Creating PDF...' : 'Share Estimate PDF'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const id = addRequest(`Rail (${railProduct})`, `${railOrigin} → ${railDest}`, 'FOIS Assistance Logged');
                  Alert.alert('Assisted Request Logged', `Ref: ${id}\nIndicative estimate only; FOIS registration applies on Indian Railways.`);
                }}
                style={[styles.primaryProceedBtn, { backgroundColor: C.teal }]}
              >
                <Text style={{ color: '#071521', fontSize: 12, fontWeight: '900' }}>Request Assistance</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* =========================================================
          3. OCEAN & SHIPPING
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
              <Text style={{ color: '#071521', fontSize: 14, fontWeight: '900' }}>Get Indicative Freight Quotes →</Text>
            </TouchableOpacity>
          </View>

          {showOceanRates && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.compareHeading, { color: C.text, marginBottom: 8 }]}>
                Indicative Ocean Rate Comparison ({oceanRoute})
              </Text>
              {CARRIER_QUOTES.map((q) => {
                const isBest = q.badgeStyle === 'bestValue';
                const isSelected = selectedOceanCarrierId === q.id;
                return (
                  <TouchableOpacity
                    key={q.id}
                    onPress={() => setSelectedOceanCarrierId(q.id)}
                    style={[
                      styles.carrierCard,
                      {
                        backgroundColor: isBest ? '#0E2F2E' : C.card,
                        borderColor: isSelected ? C.teal : C.border,
                      },
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
                    <Text style={{ color: isSelected ? C.teal : C.sub, fontSize: 10, fontWeight: '800', marginTop: 6 }}>
                      {isSelected ? 'Selected Carrier ✓' : 'Tap to Select Carrier'}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.bottomActionRow}>
                <TouchableOpacity
                  onPress={() => {
                    const id = addRequest(
                      `Ocean ${selectedOceanCarrier.name} (${incoterm})`,
                      oceanRoute,
                      'Indicative Quote Requested'
                    );
                    Alert.alert('Quote Logged', `Ref: ${id}\nCarrier: ${selectedOceanCarrier.name}`);
                  }}
                  style={[styles.secondaryActionBtn, { backgroundColor: C.card, borderColor: C.border }]}
                >
                  <Text style={{ color: C.text, fontSize: 12, fontWeight: '800' }}>Request Final Quote</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const id = addRequest(
                      `Ocean ${selectedOceanCarrier.name} (${oceanShipmentType})`,
                      oceanRoute,
                      'Booking Inquiry Logged'
                    );
                    Alert.alert('Proceeded', `Ref: ${id}\nSelected: ${selectedOceanCarrier.name}`);
                  }}
                  style={[styles.primaryProceedBtn, { backgroundColor: C.teal }]}
                >
                  <Text style={{ color: '#071521', fontSize: 12, fontWeight: '900' }}>Proceed →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          4. AIR FREIGHT
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

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Actual Weight (KG)</Text>
                  <TextInput
                    value={airActualKg}
                    onChangeText={setAirActualKg}
                    keyboardType="numeric"
                    style={[styles.inlineInput, { color: C.text, marginTop: 3 }]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Indicative Rate / KG (INR base)</Text>
                  <TextInput
                    value={airRatePerKgInr}
                    onChangeText={setAirRatePerKgInr}
                    keyboardType="numeric"
                    style={[styles.inlineInput, { color: C.text, marginTop: 3 }]}
                  />
                </View>
              </View>

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
              <Text style={{ color: C.teal, fontSize: 15, fontWeight: '900', marginTop: 4 }}>
                Chargeable Weight: {airCalc.chargeable} kg
              </Text>
              <Text style={{ color: C.amber, fontSize: 13, fontWeight: '800', marginTop: 2, marginBottom: 12 }}>
                Indicative Air Estimate: {formatMoney(airCalc.indicativeAirCostInr, dispCurrency)}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  const id = addRequest(
                    `Air (${airCalc.chargeable} kg)`,
                    airRoute,
                    'Indicative Air Quote Requested'
                  );
                  Alert.alert('Air Quote Logged', `Ref: ${id}\nChargeable Wt: ${airCalc.chargeable} kg`);
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
          5. SAMPLE & TRACKING
      ========================================================= */}
      {screen === 'sample' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.screenHeading, { color: C.text }]}>Sample & Tracking</Text>

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
                Shipment Tracking (Demo)
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
                  const uniqueSmp = `TS-SMP-${Date.now().toString().slice(-5)}`;
                  setLatestSampleRefId(uniqueSmp);
                  const modeUsed =
                    sampleScope === 'domestic'
                      ? domesticMethod === 'train'
                        ? `Train Parcel (${trainStationFrom} → ${trainStationTo})`
                        : domesticMethod === 'road'
                          ? `Road Transport (${transportOperator})`
                          : 'Domestic Courier'
                      : intlCourier;
                  const reqId = addRequest(`Sample (${modeUsed})`, `${samplePickup} → ${sampleReceiver}`, `Sample Ref: ${uniqueSmp}`);
                  Alert.alert(
                    'Sample Request Logged',
                    `Unique Sample Ref ID: ${uniqueSmp}\nRequest ID: ${reqId}\nMode: ${modeUsed}`
                  );
                }}
                style={[styles.tealActionBtn, { backgroundColor: C.teal }]}
              >
                <Text style={{ color: '#071521', fontSize: 14, fontWeight: '900' }}>
                  Create Sample Request
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={[styles.tabContainer, { backgroundColor: C.card, borderColor: C.border }]}>
                <TouchableOpacity
                  onPress={() => setTrackingCategory('courier')}
                  style={[styles.tabPill, trackingCategory === 'courier' && { backgroundColor: C.amber }]}
                >
                  <Text style={{ color: trackingCategory === 'courier' ? '#071521' : C.text, fontSize: 12, fontWeight: '900' }}>
                    Transit Timeline (Demo)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTrackingCategory('lab')}
                  style={[styles.tabPill, trackingCategory === 'lab' && { backgroundColor: C.amber }]}
                >
                  <Text style={{ color: trackingCategory === 'lab' ? '#071521' : C.text, fontSize: 12, fontWeight: '900' }}>
                    Lab Timeline (Demo)
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.routeCard, { backgroundColor: C.card, borderColor: C.border, flexDirection: 'column' }]}>
                <Text style={{ color: C.sub, fontSize: 11 }}>
                  AWB / Railway RR No. / Bilty (Latest Sample Ref: {latestSampleRefId})
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
                      DEMO TRANSIT MILESTONES ({latestSampleRefId})
                    </Text>
                    {['1. Sample Pickup Logged', '2. In Transit (Rail / Road / Air)', '3. Destination / Customs Check', '4. Delivered to Receiver / Lab'].map(
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
                      DEMO LAB MILESTONES ({latestSampleRefId})
                    </Text>
                    {['1. Sample Received at Lab', '2. Quality & Moisture Check', '3. Lab Verification', '4. Digital Lab Report (e-Certificate)'].map(
                      (st, idx) => (
                        <Text key={st} style={{ color: idx === 0 ? C.text : C.sub, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                          {idx === 0 ? '● ' : '○ '} {st}
                        </Text>
                      )
                    )}
                  </View>
                )}

                <Text style={{ color: C.amber, fontSize: 10, fontWeight: '700', marginTop: 8 }}>
                  Demo Status Preview: Live carrier/lab API integration is not yet connected.
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
          <Text style={[styles.screenHeading, { color: C.text }]}>My Shipments & Requests (Session)</Text>
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
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  globeOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  hubMainTitle: { fontSize: 19, fontWeight: '900', letterSpacing: 0.3 },
  hubTagline: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  largeFilterBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
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
  largeModuleCard: { flex: 1, borderWidth: 1.2, borderRadius: 14, padding: 10 },
  largeVisualStage: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  largeCardTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 0.3 },
  cardFooterSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 6,
  },
  fullWidthSampleCard: {
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  sampleSideArt: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
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
  warnBox: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 },
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
