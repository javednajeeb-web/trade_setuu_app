import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

const AGRO_COMMODITIES = [
  { name: 'IR-64 Parboiled Rice (5% Broken)', hs: '100630', bagKg: 50, cbmPerBag: 0.072 },
  { name: 'IR-64 Raw White Rice (5% Broken)', hs: '100630', bagKg: 50, cbmPerBag: 0.070 },
  { name: 'Swarna Parboiled Rice', hs: '100630', bagKg: 50, cbmPerBag: 0.072 },
  { name: '1121 Golden Sella Basmati Rice', hs: '100630', bagKg: 25, cbmPerBag: 0.038 },
  { name: '1121 Steam Basmati Rice', hs: '100630', bagKg: 25, cbmPerBag: 0.039 },
  { name: '1509 Sella Basmati Rice', hs: '100630', bagKg: 25, cbmPerBag: 0.038 },
  { name: '1718 Basmati Rice', hs: '100630', bagKg: 25, cbmPerBag: 0.038 },
  { name: 'Pusa Basmati Rice', hs: '100630', bagKg: 25, cbmPerBag: 0.038 },
  { name: 'Broken Rice (25% / 100% Sortex)', hs: '100640', bagKg: 50, cbmPerBag: 0.068 },
  { name: 'Paddy / Dhan (Common / Grade A)', hs: '100610', bagKg: 40, cbmPerBag: 0.075 },
  { name: 'Yellow Maize (Feed Grade)', hs: '100590', bagKg: 50, cbmPerBag: 0.074 },
  { name: 'White Maize (Food / Starch Grade)', hs: '100590', bagKg: 50, cbmPerBag: 0.074 },
  { name: 'Milling Wheat (14% Moisture)', hs: '100199', bagKg: 50, cbmPerBag: 0.069 },
  { name: 'Sorghum / Jowar', hs: '100790', bagKg: 50, cbmPerBag: 0.072 },
  { name: 'Pearl Millet / Bajra', hs: '100821', bagKg: 50, cbmPerBag: 0.071 },
  { name: 'Finger Millet / Ragi', hs: '100890', bagKg: 50, cbmPerBag: 0.070 },
  { name: 'Chana / Chickpeas (Kabuli / Desi)', hs: '071320', bagKg: 50, cbmPerBag: 0.066 },
  { name: 'Toor / Pigeon Peas (Arhar)', hs: '071360', bagKg: 50, cbmPerBag: 0.068 },
  { name: 'Moong Whole / Split (Green Gram)', hs: '071331', bagKg: 50, cbmPerBag: 0.065 },
  { name: 'Urad Whole / Split (Black Gram)', hs: '071339', bagKg: 50, cbmPerBag: 0.066 },
  { name: 'Masoor / Red Lentils', hs: '071340', bagKg: 50, cbmPerBag: 0.065 },
  { name: 'Soybean Seed / Non-GMO Meal', hs: '120190', bagKg: 50, cbmPerBag: 0.078 },
  { name: 'Groundnut / Peanuts (Bold / Java)', hs: '120242', bagKg: 50, cbmPerBag: 0.088 },
  { name: 'Sesame Seeds (White / Hulled / Black)', hs: '120740', bagKg: 25, cbmPerBag: 0.042 },
  { name: 'Mustard Seeds / Rapeseed', hs: '120750', bagKg: 50, cbmPerBag: 0.075 },
  { name: 'Castor Seeds / Castor Oil', hs: '120730', bagKg: 50, cbmPerBag: 0.076 },
  { name: 'Sunflower Seeds / Oil', hs: '120600', bagKg: 40, cbmPerBag: 0.085 },
  { name: 'Flaxseeds / Linseed', hs: '120400', bagKg: 50, cbmPerBag: 0.074 },
  { name: 'Turmeric Finger / Bulb (Salem / Sangli)', hs: '091030', bagKg: 50, cbmPerBag: 0.086 },
  { name: 'Red Chilli Whole / Stemless (Teja / Sannam)', hs: '090421', bagKg: 25, cbmPerBag: 0.078 },
  { name: 'Coriander Seeds (Eagle / Scooter)', hs: '090921', bagKg: 40, cbmPerBag: 0.082 },
  { name: 'Cumin Seeds / Jeera (Singapore / Europe)', hs: '090931', bagKg: 25, cbmPerBag: 0.052 },
  { name: 'Fennel Seeds / Saunf', hs: '090961', bagKg: 25, cbmPerBag: 0.054 },
  { name: 'Black Pepper (Garbled / Bold)', hs: '090411', bagKg: 50, cbmPerBag: 0.084 },
  { name: 'Green Cardamom (7mm / 8mm Bold)', hs: '090831', bagKg: 10, cbmPerBag: 0.025 },
  { name: 'Nutmeg Without Shell (ABC Grade)', hs: '090811', bagKg: 25, cbmPerBag: 0.046 },
  { name: 'Mace / Javitri', hs: '090821', bagKg: 20, cbmPerBag: 0.048 },
  { name: 'Cloves Whole', hs: '090710', bagKg: 25, cbmPerBag: 0.050 },
  { name: 'Tamarind Whole / Seedless', hs: '081340', bagKg: 40, cbmPerBag: 0.062 },
  { name: 'Ginger Dried / Fresh', hs: '091011', bagKg: 30, cbmPerBag: 0.058 },
  { name: 'Fresh Cavendish Bananas', hs: '080390', bagKg: 13, cbmPerBag: 0.036 },
  { name: 'Fresh Pomegranates (Bhagwa)', hs: '081090', bagKg: 4, cbmPerBag: 0.012 },
  { name: 'Fresh Mangoes (Alphonso / Kesar)', hs: '080450', bagKg: 5, cbmPerBag: 0.015 },
  { name: 'Fresh Red / Pink Onions (Nashik)', hs: '070310', bagKg: 50, cbmPerBag: 0.076 },
  { name: 'Fresh Potatoes', hs: '070190', bagKg: 50, cbmPerBag: 0.074 },
  { name: 'Fresh Green Chillies / Okra', hs: '070960', bagKg: 6, cbmPerBag: 0.018 },
  { name: 'Raw Cane Sugar (ICUMSA 600–1200)', hs: '170114', bagKg: 50, cbmPerBag: 0.062 },
  { name: 'Refined White Sugar (ICUMSA 45)', hs: '170199', bagKg: 50, cbmPerBag: 0.060 },
  { name: 'Jaggery / Gur Blocks & Powder', hs: '170113', bagKg: 30, cbmPerBag: 0.044 },
  { name: 'Raw Cotton Bales (Shankar-6)', hs: '520100', bagKg: 170, cbmPerBag: 0.420 },
  { name: 'Cashew Kernels (W240 / W320)', hs: '080132', bagKg: 22.68, cbmPerBag: 0.045 },
  { name: 'Dessicated Coconut Powder', hs: '080111', bagKg: 25, cbmPerBag: 0.056 },
  { name: 'Copra / Dried Coconut', hs: '120300', bagKg: 50, cbmPerBag: 0.110 },
  { name: 'Tea Leaf / CTC / Orthodox', hs: '090240', bagKg: 35, cbmPerBag: 0.095 },
  { name: 'Roasted / Green Coffee Beans', hs: '090111', bagKg: 60, cbmPerBag: 0.105 },
  { name: 'Psyllium Husk / Isabgol', hs: '121190', bagKg: 25, cbmPerBag: 0.068 },
  { name: 'Guar Gum Split / Powder', hs: '130232', bagKg: 25, cbmPerBag: 0.044 },
  { name: 'De-Oiled Rice Bran (DORB)', hs: '230690', bagKg: 50, cbmPerBag: 0.092 },
  { name: 'Soyabean Extraction Meal', hs: '230400', bagKg: 50, cbmPerBag: 0.088 },
  { name: 'Rapeseed / Mustard DOC', hs: '230641', bagKg: 50, cbmPerBag: 0.085 },
  { name: 'Biomass Pellets / Briquettes', hs: '440131', bagKg: 50, cbmPerBag: 0.082 },
  { name: 'Makhana / Fox Nuts', hs: '200819', bagKg: 12, cbmPerBag: 0.075 },
  { name: 'Almonds / Walnuts / Raisins', hs: '080212', bagKg: 25, cbmPerBag: 0.055 },
  { name: 'Garlic Peeled / Whole', hs: '070320', bagKg: 20, cbmPerBag: 0.042 },
  { name: 'Hibiscus / Lemongrass / Moringa Leaf', hs: '121190', bagKg: 20, cbmPerBag: 0.064 },
];

const SEVEN_TOOLS = [
  { id: 'container', short: 'Container & CBM', icon: '📦' },
  { id: 'fob', short: 'FOB Price', icon: '🚢' },
  { id: 'cif', short: 'CIF & CFR', icon: '🌊' },
  { id: 'freight', short: 'Freight Cost', icon: '🚛' },
  { id: 'landed', short: 'Landed / Duty', icon: '🏛️' },
  { id: 'fx', short: 'FX Convert', icon: '💱' },
  { id: 'profit', short: 'Profit & Margin', icon: '📈' },
];

const CONTAINER_SPECS = {
  '20ft GP': { maxKg: 28000, maxCbm: 33.2 },
  '40ft GP': { maxKg: 28500, maxCbm: 67.7 },
  '40ft HC': { maxKg: 28600, maxCbm: 76.3 },
  '40ft Reefer': { maxKg: 27700, maxCbm: 59.3 },
};

const n = (v, fb = 0) => {
  const x = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(x) ? x : fb;
};
export default function SetuuCalcProScreen({ theme = 'dark' }) {
  const isDark = theme === 'dark';
  const T = {
    bg: isDark ? '#0B0D12' : '#F4F6F9',
    card: isDark ? '#11161F' : '#FFFFFF',
    border: isDark ? '#1E293B' : '#E2E8F0',
    text: isDark ? '#F1F5F9' : '#0F172A',
    sub: isDark ? '#94A3B8' : '#64748B',
    input: isDark ? '#0D131D' : '#F1F5F9',
    accent: '#0D9488',
    gold: '#C9B89A',
  };

  const [tool, setTool] = useState('container');

  // Shared Agro Commodity Type & Auto-Suggestion State
  const [commodityQuery, setCommodityQuery] = useState('IR-64 Parboiled Rice (5% Broken)');
  const [hsCode, setHsCode] = useState('100630');
  const [bagWeightKg, setBagWeightKg] = useState('50');
  const [cbmPerBag, setCbmPerBag] = useState('0.072');
  const [bagsCount, setBagsCount] = useState('520');
  const [containerType, setContainerType] = useState('20ft GP');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // FOB / CIF / Freight / Landed / FX / Profit Inputs
  const [exFactoryCost, setExFactoryCost] = useState('380');
  const [inlandFreight, setInlandFreight] = useState('28');
  const [chaPortCost, setChaPortCost] = useState('22');
  const [fobBase, setFobBase] = useState('465');
  const [oceanFreight, setOceanFreight] = useState('35');
  const [insuranceRate, setInsuranceRate] = useState('0.6');
  const [freightRatePerMt, setFreightRatePerMt] = useState('2200');
  const [mtQty, setMtQty] = useState('26');
  const [dutyPct, setDutyPct] = useState('5');
  const [igstPct, setIgstPct] = useState('5');
  const [rodtepPct, setRodtepPct] = useState('1.1');
  const [usdToInr, setUsdToInr] = useState('84.50');
  const [usdAmt, setUsdAmt] = useState('1000');
  const [sellPrice, setSellPrice] = useState('490');
  const [brokerage, setBrokerage] = useState('8');

  const suggestions = useMemo(() => {
    const q = commodityQuery.trim().toLowerCase();
    if (!q) return AGRO_COMMODITIES.slice(0, 8);
    return AGRO_COMMODITIES.filter(
      (item) => item.name.toLowerCase().includes(q) || item.hs.includes(q)
    ).slice(0, 8);
  }, [commodityQuery]);

  const applySuggestion = (item) => {
    setCommodityQuery(item.name);
    setHsCode(item.hs);
    setBagWeightKg(String(item.bagKg));
    setCbmPerBag(String(item.cbmPerBag));
    setShowSuggestions(false);
  };

  const renderCalculationBox = () => {
    if (tool === 'container') {
      const totalKg = n(bagsCount) * n(bagWeightKg);
      const totalMt = totalKg / 1000;
      const totalCbm = n(bagsCount) * n(cbmPerBag);
      const spec = CONTAINER_SPECS[containerType] || CONTAINER_SPECS['20ft GP'];
      const wtUtil = ((totalKg / spec.maxKg) * 100).toFixed(1);
      const volUtil = ((totalCbm / spec.maxCbm) * 100).toFixed(1);
      const byWeight = Math.floor(spec.maxKg / Math.max(n(bagWeightKg, 50), 0.1));
      const byVol = Math.floor(spec.maxCbm / Math.max(n(cbmPerBag, 0.05), 0.001));
      const estBags = Math.min(byWeight, byVol);

      return (
        <View style={[styles.resBox, { backgroundColor: '#0D1B2A', borderColor: T.accent }]}>
          <Text style={styles.resTitle}>Container & CBM Planner Output</Text>
          <Text style={styles.resLine}>Commodity: {commodityQuery || 'Custom Agro'} (HS: {hsCode || 'N/A'})</Text>
          <Text style={styles.resLine}>Total Weight: {totalKg.toLocaleString()} Kg ({totalMt.toFixed(2)} MT) • Volume: {totalCbm.toFixed(2)} CBM</Text>
          <Text style={styles.resLine}>{containerType} Utilization: Weight {wtUtil}% | Volume {volUtil}%</Text>
          <Text style={styles.resHighlight}>Max Safe Load in {containerType}: ~{estBags.toLocaleString()} Bags ({((estBags * n(bagWeightKg)) / 1000).toFixed(2)} MT)</Text>
        </View>
      );
    }

    if (tool === 'fob') {
      const fob = n(exFactoryCost) + n(inlandFreight) + n(chaPortCost);
      return (
        <View style={[styles.resBox, { backgroundColor: '#0D1B2A', borderColor: T.accent }]}>
          <Text style={styles.resTitle}>Indicative FOB Calculation</Text>
          <Text style={styles.resLine}>Ex-Factory + Inland + Port/CHA: {n(exFactoryCost)} + {n(inlandFreight)} + {n(chaPortCost)}</Text>
          <Text style={styles.resHighlight}>Estimated FOB Rate: {fob.toFixed(2)} / MT</Text>
        </View>
      );
    }

    if (tool === 'cif') {
      const ins = (n(fobBase) + n(oceanFreight)) * (n(insuranceRate) / 100);
      const cif = n(fobBase) + n(oceanFreight) + ins;
      return (
        <View style={[styles.resBox, { backgroundColor: '#0D1B2A', borderColor: T.accent }]}>
          <Text style={styles.resTitle}>CIF / CFR Calculation</Text>
          <Text style={styles.resLine}>CFR ({(n(fobBase) + n(oceanFreight)).toFixed(2)}) + Insurance ({ins.toFixed(2)})</Text>
          <Text style={styles.resHighlight}>Estimated CIF Rate: {cif.toFixed(2)} / MT</Text>
        </View>
      );
    }

    if (tool === 'freight') {
      const total = n(mtQty) * n(freightRatePerMt);
      return (
        <View style={[styles.resBox, { backgroundColor: '#0D1B2A', borderColor: T.accent }]}>
          <Text style={styles.resTitle}>Freight & Logistics Cost</Text>
          <Text style={styles.resLine}>{n(mtQty)} MT × ₹{n(freightRatePerMt)} / MT</Text>
          <Text style={styles.resHighlight}>Total Freight: ₹{total.toLocaleString('en-IN')}</Text>
        </View>
      );
    }

    if (tool === 'landed') {
      const base = n(fobBase) + n(oceanFreight);
      const duty = base * (n(dutyPct) / 100);
      const igst = (base + duty) * (n(igstPct) / 100);
      const rodtep = n(fobBase) * (n(rodtepPct) / 100);
      const landed = base + duty + igst - rodtep;
      return (
        <View style={[styles.resBox, { backgroundColor: '#0D1B2A', borderColor: T.accent }]}>
          <Text style={styles.resTitle}>Landed Cost, Duty, IGST & RoDTEP Estimate</Text>
          <Text style={styles.resLine}>Duty: {duty.toFixed(2)} • IGST: {igst.toFixed(2)} • RoDTEP Credit: -{rodtep.toFixed(2)}</Text>
          <Text style={styles.resHighlight}>Net Landed Estimate: {landed.toFixed(2)} / MT (Verify official tariff)</Text>
        </View>
      );
    }

    if (tool === 'fx') {
      const converted = n(usdAmt) * n(usdToInr);
      return (
        <View style={[styles.resBox, { backgroundColor: '#0D1B2A', borderColor: T.accent }]}>
          <Text style={styles.resTitle}>Currency Converter (Manual / Reference Rate)</Text>
          <Text style={styles.resLine}>{n(usdAmt).toLocaleString()} USD @ {n(usdToInr)} INR</Text>
          <Text style={styles.resHighlight}>Converted Value: ₹{converted.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
        </View>
      );
    }

    const gross = (n(sellPrice) - n(fobBase)) * n(mtQty);
    const net = gross - n(brokerage) * n(mtQty);
    return (
      <View style={[styles.resBox, { backgroundColor: '#0D1B2A', borderColor: T.accent }]}>
        <Text style={styles.resTitle}>Profit & Margin Estimate</Text>
        <Text style={styles.resLine}>Gross Margin: {gross.toFixed(2)} • Less Commission ({n(brokerage)}/MT)</Text>
        <Text style={styles.resHighlight}>Net Deal Estimate: {net.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ padding: 14, paddingBottom: 85 }}>
      <Text style={[styles.head, { color: T.text }]}>7-in-1 Trade & Logistics Calculator</Text>
      <Text style={[styles.sub, { color: T.sub }]}>65+ Agro Commodity Auto-Suggest • Editable Inputs • Audit-Ready Formulas</Text>

      {/* 7-in-1 Calculator Selector Grid */}
      <View style={styles.grid7}>
        {SEVEN_TOOLS.map((t) => {
          const active = tool === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTool(t.id)}
              style={[styles.toolTile, { backgroundColor: active ? T.accent : T.card, borderColor: active ? T.accent : T.border }]}
            >
              <Text style={{ fontSize: 15 }}>{t.icon}</Text>
              <Text style={[styles.toolTxt, { color: active ? '#FFF' : T.text }]} numberOfLines={1}>{t.short}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Agro Commodity Type & Auto-Suggestion Block */}
      <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
        <Text style={[styles.cTitle, { color: T.gold }]}>🌾 Agro Commodity Type & Auto-Suggestion</Text>
        <Text style={[styles.lbl, { color: T.sub }]}>Type Commodity Name or HS Code (Auto-Suggests 65+ Items)</Text>
        <TextInput
          style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]}
          value={commodityQuery}
          onChangeText={(txt) => {
            setCommodityQuery(txt);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type rice, maize, basmati, turmeric, chana, sesame..."
          placeholderTextColor={T.sub}
        />

        {showSuggestions && suggestions.length > 0 && (
          <View style={[styles.sugBox, { backgroundColor: T.input, borderColor: T.accent }]}>
            {suggestions.map((s) => (
              <TouchableOpacity key={s.name} style={styles.sugRow} onPress={() => applySuggestion(s)}>
                <Text style={{ color: T.text, fontSize: 12, fontWeight: '800', flex: 1 }}>{s.name}</Text>
                <Text style={{ color: '#14B8A6', fontSize: 10, fontWeight: '800' }}>HS {s.hs} • {s.bagKg}Kg</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={[styles.lbl, { color: T.sub }]}>HS Code</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={hsCode} onChangeText={setHsCode} />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={[styles.lbl, { color: T.sub }]}>Bag / Pack Wt (Kg)</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={bagWeightKg} onChangeText={setBagWeightKg} />
          </View>
        </View>
      </View>

      {/* Active Tool Inputs */}
      <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
        {tool === 'container' && (
          <View>
            <Text style={[styles.cTitle, { color: T.text }]}>Container Load & CBM Inputs</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
              {Object.keys(CONTAINER_SPECS).map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setContainerType(c)}
                  style={[styles.cChip, containerType === c && { backgroundColor: T.accent }]}
                >
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={[styles.lbl, { color: T.sub }]}>Number of Bags</Text>
                <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={bagsCount} onChangeText={setBagsCount} />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={[styles.lbl, { color: T.sub }]}>CBM per Bag</Text>
                <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={cbmPerBag} onChangeText={setCbmPerBag} />
              </View>
            </View>
          </View>
        )}

        {tool === 'fob' && (
          <View>
            <Text style={[styles.cTitle, { color: T.text }]}>FOB Price Inputs (Per MT)</Text>
            <Text style={[styles.lbl, { color: T.sub }]}>Ex-Factory Cost</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={exFactoryCost} onChangeText={setExFactoryCost} />
            <Text style={[styles.lbl, { color: T.sub }]}>Inland Haulage</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={inlandFreight} onChangeText={setInlandFreight} />
            <Text style={[styles.lbl, { color: T.sub }]}>Port / CHA / Stuffing</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={chaPortCost} onChangeText={setChaPortCost} />
          </View>
        )}

        {tool === 'cif' && (
          <View>
            <Text style={[styles.cTitle, { color: T.text }]}>CIF & CFR Inputs (Per MT)</Text>
            <Text style={[styles.lbl, { color: T.sub }]}>FOB Rate</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={fobBase} onChangeText={setFobBase} />
            <Text style={[styles.lbl, { color: T.sub }]}>Ocean Freight</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={oceanFreight} onChangeText={setOceanFreight} />
            <Text style={[styles.lbl, { color: T.sub }]}>Marine Insurance (%)</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={insuranceRate} onChangeText={setInsuranceRate} />
          </View>
        )}

        {tool === 'freight' && (
          <View>
            <Text style={[styles.cTitle, { color: T.text }]}>Freight & Transport Inputs</Text>
            <Text style={[styles.lbl, { color: T.sub }]}>Quantity (MT)</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={mtQty} onChangeText={setMtQty} />
            <Text style={[styles.lbl, { color: T.sub }]}>Rate per MT (₹)</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={freightRatePerMt} onChangeText={setFreightRatePerMt} />
          </View>
        )}

        {tool === 'landed' && (
          <View>
            <Text style={[styles.cTitle, { color: T.text }]}>Landed Cost, Duty, IGST & RoDTEP (%)</Text>
            <Text style={[styles.lbl, { color: T.sub }]}>Customs Duty (%)</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={dutyPct} onChangeText={setDutyPct} />
            <Text style={[styles.lbl, { color: T.sub }]}>IGST (%)</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={igstPct} onChangeText={setIgstPct} />
            <Text style={[styles.lbl, { color: T.sub }]}>RoDTEP / Drawback Credit (%)</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={rodtepPct} onChangeText={setRodtepPct} />
          </View>
        )}

        {tool === 'fx' && (
          <View>
            <Text style={[styles.cTitle, { color: T.text }]}>Currency Converter (USD to INR)</Text>
            <Text style={[styles.lbl, { color: T.sub }]}>Amount (USD)</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={usdAmt} onChangeText={setUsdAmt} />
            <Text style={[styles.lbl, { color: T.sub }]}>Exchange Rate (1 USD = INR)</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={usdToInr} onChangeText={setUsdToInr} />
          </View>
        )}

        {tool === 'profit' && (
          <View>
            <Text style={[styles.cTitle, { color: T.text }]}>Profit & Margin Inputs</Text>
            <Text style={[styles.lbl, { color: T.sub }]}>Target Selling Price / MT</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={sellPrice} onChangeText={setSellPrice} />
            <Text style={[styles.lbl, { color: T.sub }]}>Brokerage / Commission / MT</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={brokerage} onChangeText={setBrokerage} />
          </View>
        )}

        {renderCalculationBox()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: { fontSize: 18, fontWeight: '900' },
  sub: { fontSize: 11, marginTop: 2, marginBottom: 10 },
  grid7: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  toolTile: { width: '23.8%', borderRadius: 10, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center', marginBottom: 7 },
  toolTxt: { fontSize: 9.5, fontWeight: '800', marginTop: 3, textAlign: 'center' },
  card: { borderRadius: 13, borderWidth: 1, padding: 13, marginBottom: 10 },
  cTitle: { fontSize: 14, fontWeight: '900', marginBottom: 8 },
  lbl: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  inp: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8, fontSize: 13, marginBottom: 10 },
  sugBox: { borderWidth: 1, borderRadius: 9, marginBottom: 10, overflow: 'hidden' },
  sugRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#1E293B' },
  cChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1E293B', marginRight: 6, marginBottom: 6 },
  resBox: { borderRadius: 11, borderWidth: 1, padding: 12, marginTop: 4 },
  resTitle: { color: '#C9B89A', fontSize: 11, fontWeight: '900', marginBottom: 4 },
  resLine: { color: '#E2E8F0', fontSize: 12, marginBottom: 3 },
  resHighlight: { color: '#14B8A6', fontSize: 13, fontWeight: '900', marginTop: 4 },
});
