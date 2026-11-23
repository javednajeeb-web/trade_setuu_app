import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';

const CATEGORIES = [
  {
    key: 'CARGO',
    title: 'Cargo & Logistics',
    subtitle: 'Container, Packing, Freight & Shipment Management (01–07)',
    tools: [
      { id: '01', key: 'CONTAINER_CBM', name: 'Container & CBM Calculator', short: 'Container & CBM' },
      { id: '02', key: 'CONTAINER_OPT', name: 'Container Loading Optimizer', short: 'Loading Optimizer' },
      { id: '03', key: 'FREIGHT_COST', name: 'Freight Cost Calculator', short: 'Freight Cost' },
      { id: '04', key: 'AIR_WEIGHT', name: 'Air Freight Chargeable Weight', short: 'Air Chargeable Wt' },
      { id: '05', key: 'PALLETIZATION', name: 'Palletization Calculator', short: 'Palletization' },
      { id: '06', key: 'DEMURRAGE', name: 'Demurrage & Detention Calculator', short: 'Demurrage / Det.' },
      { id: '07', key: 'COST_ALLOCATOR', name: 'Shipment Cost Allocator', short: 'Cost Allocator' },
    ],
  },
  {
    key: 'PRICING',
    title: 'Pricing & Profit',
    subtitle: 'Export Pricing, Import Cost, Finance & Profitability (08–14)',
    tools: [
      { id: '08', key: 'FOB_PRICE', name: 'FOB Price Calculator', short: 'FOB Price' },
      { id: '09', key: 'CIF_CFR', name: 'CIF & CFR Calculator', short: 'CIF & CFR' },
      { id: '10', key: 'LANDED_COST', name: 'Import Landed Cost / Duty Calculator', short: 'Landed / Duty' },
      { id: '11', key: 'BREAK_EVEN', name: 'Break-even Price Calculator', short: 'Break-even Price' },
      { id: '12', key: 'PROFIT_MARGIN', name: 'Profit & Margin Calculator', short: 'Profit & Margin' },
      { id: '13', key: 'LC_COST', name: 'LC Cost Calculator', short: 'LC Cost' },
      { id: '14', key: 'PAYMENT_FINANCE', name: 'Payment & Finance Calculator', short: 'Payment & Finance' },
    ],
  },
  {
    key: 'INTELLIGENCE',
    title: 'Trade & Financial Intelligence',
    subtitle: 'Currency, Compliance, Insurance & Trade Benefits (15–21)',
    tools: [
      { id: '15', key: 'HS_LOOKUP', name: 'HS Code & Duty Lookup', short: 'HS & Duty Lookup' },
      { id: '16', key: 'FX_CONVERT', name: 'FX Currency Converter', short: 'FX Converter' },
      { id: '17', key: 'FX_RISK', name: 'Currency Risk Calculator', short: 'Currency Risk' },
      { id: '18', key: 'EXPORT_INCENTIVE', name: 'Export Incentive Calculator', short: 'Export Incentive' },
      { id: '19', key: 'MARINE_INSURANCE', name: 'Marine Insurance Calculator', short: 'Marine Insurance' },
      { id: '20', key: 'GST_TAX', name: 'GST & Tax Calculator', short: 'GST & Tax' },
      { id: '21', key: 'COMMISSION_SPLIT', name: 'Trade Commission Split', short: 'Commission Split' },
    ],
  },
];

const CONTAINER_SPECS = {
  '20ft GP': { usableCbm: 33.2, maxPayloadKg: 28000, dims: '5.89m × 2.35m × 2.39m' },
  '40ft GP': { usableCbm: 67.5, maxPayloadKg: 28600, dims: '12.03m × 2.35m × 2.39m' },
  '40ft HC': { usableCbm: 76.2, maxPayloadKg: 28500, dims: '12.03m × 2.35m × 2.69m' },
  '40ft Reefer': { usableCbm: 58.0, maxPayloadKg: 27700, dims: '11.58m × 2.29m × 2.50m' },
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'CNY', 'JPY', 'TRY', 'SGD', 'INR'];

const n = (v) => {
  const x = parseFloat(String(v || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(x) ? x : 0;
};

const fmt = (val, cur = 'USD') => {
  const num = Number(val || 0);
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return cur ? `${cur} ${formatted}` : formatted;
};

export default function SetuCalcProSuiteScreen({ onBack }) {
  const [activeCatKey, setActiveCatKey] = useState('CARGO');
  const [activeToolKey, setActiveToolKey] = useState('CONTAINER_CBM');

  // Common Trade Data Master
  const [master, setMaster] = useState({
    commodity: 'IR64 Parboiled Rice (5% Broken)',
    hsCode: '10063020',
    origin: 'India',
    destination: 'Dakar, Senegal',
    qtyMt: '1000',
    bagWeightKg: '50',
    cbmPerBag: '0.072',
    currency: 'USD',
  });

  // Tool 01 / 02: Container & CBM
  const [containerType, setContainerType] = useState('20ft GP');
  const [bagsCount, setBagsCount] = useState('520');
  const [palletized, setPalletized] = useState(false);

  // Tool 03: Freight Cost
  const [freightMode, setFreightMode] = useState('Per MT');
  const [freightRate, setFreightRate] = useState('35');
  const [freightExtra, setFreightExtra] = useState('0');

  // Tool 08: FOB Price
  const [exFactory, setExFactory] = useState('380');
  const [inlandHaulage, setInlandHaulage] = useState('28');
  const [portChaStuffing, setPortChaStuffing] = useState('22');
  const [fobQuoteMode, setFobQuoteMode] = useState('Internal Cost');

  // Tool 09: CIF & CFR
  const [fobRate, setFobRate] = useState('465');
  const [oceanFreight, setOceanFreight] = useState('35');
  const [insurancePct, setInsurancePct] = useState('0.6');
  const [insBasis, setInsBasis] = useState('110% CIF');

  // Tool 10: Import Landed Cost (separate from Export Incentive)
  const [cifValueForImport, setCifValueForImport] = useState('503.32');
  const [bcdPct, setBcdPct] = useState('5');
  const [swsPct, setSwsPct] = useState('10');
  const [igstPct, setIgstPct] = useState('5');
  const [importOtherCharges, setImportOtherCharges] = useState('15');

  // Tool 18: Export Incentive (separate)
  const [fobExportValue, setFobExportValue] = useState('465000');
  const [rodtepPct, setRodtepPct] = useState('1.1');
  const [drawbackPct, setDrawbackPct] = useState('0');

  // Tool 16: FX Converter (Manual rate mode; live feed not attached)
  const [fxAmount, setFxAmount] = useState('1000');
  const [fxFrom, setFxFrom] = useState('USD');
  const [fxTo, setFxTo] = useState('INR');
  const [manualFxRate, setManualFxRate] = useState('84.50');
  const [fxMarginPct, setFxMarginPct] = useState('0');

  // Tool 12: Profit & Margin (unit & total properly matched + scenario)
  const [purchasePricePerMt, setPurchasePricePerMt] = useState('415');
  const [sellingPricePerMt, setSellingPricePerMt] = useState('455');
  const [brokeragePerMt, setBrokeragePerMt] = useState('8');
  const [otherDealCostTotal, setOtherDealCostTotal] = useState('0');
  const [scenarioPriceDelta, setScenarioPriceDelta] = useState('10');

  // Secondary/specialized inputs for remaining tools (04–07, 11, 13–15, 17, 19–21)
  const [genericA, setGenericA] = useState('100');
  const [genericB, setGenericB] = useState('5');

  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.key === activeCatKey) || CATEGORIES[0],
    [activeCatKey]
  );

  const activeTool = useMemo(() => {
    for (const cat of CATEGORIES) {
      const found = cat.tools.find((t) => t.key === activeToolKey);
      if (found) return found;
    }
    return CATEGORIES[0].tools[0];
  }, [activeToolKey]);

  const setMasterField = (k, v) => setMaster((prev) => ({ ...prev, [k]: v }));

  const handleSelectCategory = (catKey) => {
    setActiveCatKey(catKey);
    const cat = CATEGORIES.find((c) => c.key === catKey);
    if (cat && cat.tools.length > 0) {
      setActiveToolKey(cat.tools[0].key);
    }
  };

  const calc = useMemo(() => {
    const qtyMtNum = Math.max(0, n(master.qtyMt));
    const bagWtKg = Math.max(0.001, n(master.bagWeightKg));
    const cbmPerBagNum = Math.max(0.00001, n(master.cbmPerBag));
    const bagsNum = Math.max(0, n(bagsCount));

    const cSpec = CONTAINER_SPECS[containerType] || CONTAINER_SPECS['20ft GP'];
    const palletFactor = palletized ? 0.85 : 1.0;
    const effectiveCbm = cSpec.usableCbm * palletFactor;

    const totalWeightKg = bagsNum * bagWtKg;
    const totalVolumeCbm = bagsNum * cbmPerBagNum;
    const weightUtilPct = (totalWeightKg / cSpec.maxPayloadKg) * 100;
    const volUtilPct = (totalVolumeCbm / effectiveCbm) * 100;

    const maxBagsByWeight = Math.floor(cSpec.maxPayloadKg / bagWtKg);
    const maxBagsByVolume = Math.floor(effectiveCbm / cbmPerBagNum);
    const maxSafeBags = Math.max(0, Math.min(maxBagsByWeight, maxBagsByVolume));
    const maxSafeMt = (maxSafeBags * bagWtKg) / 1000;

    const fobPerMt = n(exFactory) + n(inlandHaulage) + n(portChaStuffing);

    const fobNum = n(fobRate);
    const freightOceanNum = n(oceanFreight);
    const cfrPerMt = fobNum + freightOceanNum;
    const rateDec = n(insurancePct) / 100;
    let cifPerMt = cfrPerMt;
    let insPerMt = 0;
    if (insBasis === '110% CIF') {
      const denom = Math.max(0.01, 1 - 1.1 * rateDec);
      cifPerMt = cfrPerMt / denom;
      insPerMt = cifPerMt - cfrPerMt;
    } else {
      insPerMt = cfrPerMt * rateDec;
      cifPerMt = cfrPerMt + insPerMt;
    }

    const freightUnits = freightMode === 'Per Container' ? Math.max(1, Math.ceil(qtyMtNum / 25)) : qtyMtNum;
    const totalFreight = freightUnits * n(freightRate) + n(freightExtra);
    const freightPerMt = qtyMtNum > 0 ? totalFreight / qtyMtNum : 0;

    const av = n(cifValueForImport);
    const bcd = av * (n(bcdPct) / 100);
    const sws = bcd * (n(swsPct) / 100);
    const igstBase = av + bcd + sws;
    const igst = igstBase * (n(igstPct) / 100);
    const landedCostPerMt = av + bcd + sws + igst + n(importOtherCharges);

    const fobExpNum = n(fobExportValue);
    const rodtepAmt = fobExpNum * (n(rodtepPct) / 100);
    const drawbackAmt = fobExpNum * (n(drawbackPct) / 100);
    const totalIncentive = rodtepAmt + drawbackAmt;

    const fxEffRate = n(manualFxRate) * (1 + n(fxMarginPct) / 100);
    const fxConverted = n(fxAmount) * fxEffRate;

    const totalPurchase = n(purchasePricePerMt) * qtyMtNum;
    const totalRevenue = n(sellingPricePerMt) * qtyMtNum;
    const grossProfit = totalRevenue - totalPurchase;
    const totalBrokerage = n(brokeragePerMt) * qtyMtNum;
    const totalExpenses = totalBrokerage + n(otherDealCostTotal);
    const netProfit = grossProfit - totalExpenses;
    const netMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const breakEvenPerMt = qtyMtNum > 0 ? (totalPurchase + totalExpenses) / qtyMtNum : 0;

    const altSellPerMt = n(sellingPricePerMt) + n(scenarioPriceDelta);
    const altNetProfit = altSellPerMt * qtyMtNum - totalPurchase - totalExpenses;

    return {
      qtyMtNum,
      cSpec,
      effectiveCbm,
      totalWeightKg,
      totalVolumeCbm,
      weightUtilPct,
      volUtilPct,
      maxSafeBags,
      maxSafeMt,
      fobPerMt,
      cfrPerMt,
      cifPerMt,
      insPerMt,
      totalFreight,
      freightPerMt,
      av,
      bcd,
      sws,
      igst,
      landedCostPerMt,
      rodtepAmt,
      drawbackAmt,
      totalIncentive,
      fxEffRate,
      fxConverted,
      totalPurchase,
      totalRevenue,
      grossProfit,
      totalBrokerage,
      netProfit,
      netMarginPct,
      breakEvenPerMt,
      altSellPerMt,
      altNetProfit,
    };
  }, [
    master,
    containerType,
    bagsCount,
    palletized,
    freightMode,
    freightRate,
    freightExtra,
    exFactory,
    inlandHaulage,
    portChaStuffing,
    fobRate,
    oceanFreight,
    insurancePct,
    insBasis,
    cifValueForImport,
    bcdPct,
    swsPct,
    igstPct,
    importOtherCharges,
    fobExportValue,
    rodtepPct,
    drawbackPct,
    fxAmount,
    manualFxRate,
    fxMarginPct,
    purchasePricePerMt,
    sellingPricePerMt,
    brokeragePerMt,
    otherDealCostTotal,
    scenarioPriceDelta,
  ]);

  const renderToolWorkspace = () => {
    const cur = master.currency;

    switch (activeToolKey) {
      case 'CONTAINER_CBM':
      case 'CONTAINER_OPT':
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {activeTool.id} • {activeTool.name}
            </Text>
            <Text style={styles.hint}>
              Specs ({containerType}): {calc.cSpec.dims} • Max Payload: {calc.cSpec.maxPayloadKg} kg • Usable CBM: {calc.effectiveCbm.toFixed(1)}
            </Text>

            <Text style={styles.label}>Container Type</Text>
            <View style={styles.chipRow}>
              {Object.keys(CONTAINER_SPECS).map((ct) => (
                <TouchableOpacity
                  key={ct}
                  onPress={() => setContainerType(ct)}
                  style={[styles.chip, containerType === ct && styles.chipActive]}
                >
                  <Text style={[styles.chipTxt, containerType === ct && styles.chipTxtActive]}>{ct}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Palletized Loading (85% Usable Volume)</Text>
              <TouchableOpacity
                onPress={() => setPalletized((p) => !p)}
                style={[styles.chip, palletized && styles.chipActive]}
              >
                <Text style={[styles.chipTxt, palletized && styles.chipTxtActive]}>
                  {palletized ? 'Palletized' : 'Floor / Loose'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Number of Bags</Text>
            <TextInput
              value={bagsCount}
              onChangeText={setBagsCount}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#64748B"
            />

            <View style={styles.resultBox}>
              <Text style={styles.resLine}>Total Weight: {calc.totalWeightKg.toLocaleString()} kg ({calc.weightUtilPct.toFixed(1)}% payload)</Text>
              <Text style={styles.resLine}>Total Volume: {calc.totalVolumeCbm.toFixed(2)} CBM ({calc.volUtilPct.toFixed(1)}% volume)</Text>
              <Text style={styles.resHighlight}>
                Max Safe Load: {calc.maxSafeBags} bags ({calc.maxSafeMt.toFixed(2)} MT)
              </Text>
              {(calc.weightUtilPct > 100 || calc.volUtilPct > 100) ? (
                <Text style={styles.warnTxt}>
                  Warning: Container capacity exceeded ({calc.volUtilPct > 100 ? 'Volume limit' : 'Payload limit'}). Reduce bags or add container.
                </Text>
              ) : null}
            </View>
          </View>
        );

      case 'FREIGHT_COST':
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>03 • Freight Cost Calculator</Text>
            <Text style={styles.label}>Billing Basis</Text>
            <View style={styles.chipRow}>
              {['Per MT', 'Per Container'].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setFreightMode(m)}
                  style={[styles.chip, freightMode === m && styles.chipActive]}
                >
                  <Text style={[styles.chipTxt, freightMode === m && styles.chipTxtActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Freight Rate ({cur})</Text>
            <TextInput value={freightRate} onChangeText={setFreightRate} keyboardType="numeric" style={styles.input} />

            <Text style={styles.label}>THC / Fuel / Local Charges ({cur})</Text>
            <TextInput value={freightExtra} onChangeText={setFreightExtra} keyboardType="numeric" style={styles.input} />

            <View style={styles.resultBox}>
              <Text style={styles.resHighlight}>Total Freight: {fmt(calc.totalFreight, cur)}</Text>
              <Text style={styles.resLine}>Per MT Equivalent: {fmt(calc.freightPerMt, cur)} / MT</Text>
            </View>
          </View>
        );

      case 'FOB_PRICE':
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>08 • FOB Price Calculator</Text>
            <View style={styles.chipRow}>
              {['Internal Cost', 'Buyer Quote'].map((md) => (
                <TouchableOpacity
                  key={md}
                  onPress={() => setFobQuoteMode(md)}
                  style={[styles.chip, fobQuoteMode === md && styles.chipActive]}
                >
                  <Text style={[styles.chipTxt, fobQuoteMode === md && styles.chipTxtActive]}>{md}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Ex-Factory Cost / MT ({cur})</Text>
            <TextInput value={exFactory} onChangeText={setExFactory} keyboardType="numeric" style={styles.input} />

            <Text style={styles.label}>Inland Haulage / MT ({cur})</Text>
            <TextInput value={inlandHaulage} onChangeText={setInlandHaulage} keyboardType="numeric" style={styles.input} />

            <Text style={styles.label}>Port / CHA / Stuffing / MT ({cur})</Text>
            <TextInput value={portChaStuffing} onChangeText={setPortChaStuffing} keyboardType="numeric" style={styles.input} />

            <View style={styles.resultBox}>
              <Text style={styles.resHighlight}>
                {fobQuoteMode} FOB: {fmt(calc.fobPerMt, cur)} / MT
              </Text>
              <Text style={styles.resLine}>
                Total ({calc.qtyMtNum} MT): {fmt(calc.fobPerMt * calc.qtyMtNum, cur)}
              </Text>
            </View>
          </View>
        );

      case 'CIF_CFR':
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>09 • CIF & CFR Calculator</Text>
            <Text style={styles.label}>Insurance Valuation Basis</Text>
            <View style={styles.chipRow}>
              {['110% CIF', 'CFR Basis'].map((b) => (
                <TouchableOpacity
                  key={b}
                  onPress={() => setInsBasis(b)}
                  style={[styles.chip, insBasis === b && styles.chipActive]}
                >
                  <Text style={[styles.chipTxt, insBasis === b && styles.chipTxtActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>FOB Rate / MT ({cur})</Text>
            <TextInput value={fobRate} onChangeText={setFobRate} keyboardType="numeric" style={styles.input} />

            <Text style={styles.label}>Ocean Freight / MT ({cur})</Text>
            <TextInput value={oceanFreight} onChangeText={setOceanFreight} keyboardType="numeric" style={styles.input} />

            <Text style={styles.label}>Marine Insurance Rate (%)</Text>
            <TextInput value={insurancePct} onChangeText={setInsurancePct} keyboardType="numeric" style={styles.input} />

            <View style={styles.resultBox}>
              <Text style={styles.resLine}>CFR: {fmt(calc.cfrPerMt, cur)} / MT</Text>
              <Text style={styles.resLine}>Est. Insurance: {fmt(calc.insPerMt, cur)} / MT</Text>
              <Text style={styles.resHighlight}>CIF: {fmt(calc.cifPerMt, cur)} / MT</Text>
            </View>
          </View>
        );

      case 'LANDED_COST':
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>10 • Import Landed Cost / Duty Calculator</Text>
            <Text style={styles.hint}>
              Export incentives (RoDTEP/Drawback) are kept separate in Tool 18. Verify tariff & IGST rules for the import date.
            </Text>

            <Text style={styles.label}>Assessable / CIF Value per MT</Text>
            <TextInput value={cifValueForImport} onChangeText={setCifValueForImport} keyboardType="numeric" style={styles.input} />

            <Text style={styles.label}>Basic Customs Duty (%)</Text>
            <TextInput value={bcdPct} onChangeText={setBcdPct} keyboardType="numeric" style={styles.input} />

            <Text style={styles.label}>SWS (% of BCD) & IGST (%)</Text>
                     <View style={styles.row2}>
              <TextInput value={swsPct} onChangeText={setSwsPct} keyboardType="numeric" style={[styles.input, styles.half]} placeholder="SWS %" placeholderTextColor="#64748B" />
              <TextInput value={igstPct} onChangeText={setIgstPct} keyboardType="numeric" style={[styles.input, styles.half]} placeholder="IGST %" placeholderTextColor="#64748B" />
            </View>

            <Text style={styles.label}>Port / CHA / Inland Charges per MT</Text>
            <TextInput value={importOtherCharges} onChangeText={setImportOtherCharges} keyboardType="numeric" style={styles.input} />

            <View style={styles.resultBox}>
              <Text style={styles.resLine}>BCD: {fmt(calc.bcd, '')} | SWS: {fmt(calc.sws, '')} | IGST: {fmt(calc.igst, '')}</Text>
              <Text style={styles.resHighlight}>Est. Landed Cost: {fmt(calc.landedCostPerMt, '')} / MT</Text>
            </View>
          </View>
        );

          <View style={styles.card}>
            <Text style={styles.cardTitle}>18 • Export Incentive Calculator</Text>
            <Text style={styles.hint}>
              Estimate only — verify current HS code rate, value caps, and notifications before final claim.
            </Text>

            <Text style={styles.label}>FOB Export Value</Text>
            <TextInput value={fobExportValue} onChangeText={setFobExportValue} keyboardType="numeric" style={styles.input} />

            <Text style={styles.label}>RoDTEP (%) & Drawback (%)</Text>
            <View style={styles.row2}>
              <TextInput value={rodtepPct} onChangeText={setRodtepPct} keyboardType="numeric" style={[styles.input, styles.half]} />
              <TextInput value={drawbackPct} onChangeText={setDrawbackPct} keyboardType="numeric" style={[styles.input, styles.half]} />
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resLine}>RoDTEP Est.: {fmt(calc.rodtepAmt, '')} | Drawback Est.: {fmt(calc.drawbackAmt, '')}</Text>
              <Text style={styles.resHighlight}>Total Est. Export Incentive: {fmt(calc.totalIncentive, '')}</Text>
            </View>
          </View>
        );

      case 'FX_CONVERT':
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>16 • FX Currency Converter</Text>
            <Text style={styles.hint}>
              Manual rate mode active (live feed not attached; stale rates are not shown as live).
            </Text>

            <Text style={styles.label}>From → To</Text>
            <View style={styles.chipRow}>
              {CURRENCIES.slice(0, 6).map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setFxFrom(c)}
                  style={[styles.chip, fxFrom === c && styles.chipActive]}
                >
                  <Text style={[styles.chipTxt, fxFrom === c && styles.chipTxtActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.chipRow}>
              {['INR', 'USD', 'EUR', 'AED'].map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setFxTo(c)}
                  style={[styles.chip, fxTo === c && styles.chipActive]}
                >
                  <Text style={[styles.chipTxt, fxTo === c && styles.chipTxtActive]}>→ {c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Amount ({fxFrom})</Text>
            <TextInput value={fxAmount} onChangeText={setFxAmount} keyboardType="numeric" style={styles.input} />

            <Text style={styles.label}>Manual Exchange Rate (1 {fxFrom} in {fxTo}) & Margin (%)</Text>
            <View style={styles.row2}>
              <TextInput value={manualFxRate} onChangeText={setManualFxRate} keyboardType="numeric" style={[styles.input, styles.half]} />
              <TextInput value={fxMarginPct} onChangeText={setFxMarginPct} keyboardType="numeric" style={[styles.input, styles.half]} placeholder="Margin %" placeholderTextColor="#64748B" />
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resLine}>Effective Rate: 1 {fxFrom} = {calc.fxEffRate.toFixed(4)} {fxTo}</Text>
              <Text style={styles.resHighlight}>Converted: {fmt(calc.fxConverted, fxTo)}</Text>
            </View>
          </View>
        );

      case 'PROFIT_MARGIN':
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>12 • Profit & Margin Calculator</Text>
            <Text style={styles.hint}>
              Per-unit brokerage is multiplied by {calc.qtyMtNum} MT before subtracting from deal margin.
            </Text>

            <Text style={styles.label}>Purchase Price / MT & Selling Price / MT ({cur})</Text>
            <View style={styles.row2}>
              <TextInput value={purchasePricePerMt} onChangeText={setPurchasePricePerMt} keyboardType="numeric" style={[styles.input, styles.half]} placeholder="Buy/MT" placeholderTextColor="#64748B" />
              <TextInput value={sellingPricePerMt} onChangeText={setSellingPricePerMt} keyboardType="numeric" style={[styles.input, styles.half]} placeholder="Sell/MT" placeholderTextColor="#64748B" />
            </View>

            <Text style={styles.label}>Brokerage / MT ({cur}) & Other Total Costs ({cur})</Text>
            <View style={styles.row2}>
              <TextInput value={brokeragePerMt} onChangeText={setBrokeragePerMt} keyboardType="numeric" style={[styles.input, styles.half]} placeholder="Brok/MT" placeholderTextColor="#64748B" />
              <TextInput value={otherDealCostTotal} onChangeText={setOtherDealCostTotal} keyboardType="numeric" style={[styles.input, styles.half]} placeholder="Other Total" placeholderTextColor="#64748B" />
            </View>

            <Text style={styles.label}>Scenario: Selling Price Change / MT ({cur})</Text>
            <TextInput value={scenarioPriceDelta} onChangeText={setScenarioPriceDelta} keyboardType="numeric" style={styles.input} />

            <View style={styles.resultBox}>
              <Text style={styles.resLine}>Gross Profit: {fmt(calc.grossProfit, cur)} | Brokerage ({calc.qtyMtNum} MT): {fmt(calc.totalBrokerage, cur)}</Text>
              <Text style={styles.resHighlight}>Net Profit: {fmt(calc.netProfit, cur)} ({calc.netMarginPct.toFixed(2)}%)</Text>
              <Text style={styles.resLine}>Break-even Price: {fmt(calc.breakEvenPerMt, cur)} / MT</Text>
              <Text style={styles.resLine}>
                Scenario ({fmt(calc.altSellPerMt, cur)}/MT): Net Profit {fmt(calc.altNetProfit, cur)}
              </Text>
            </View>
          </View>
        );

      default: {
        const valA = n(genericA);
        const valB = n(genericB);
        const estOutput = valA * (1 + valB / 100);
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {activeTool.id} • {activeTool.name}
            </Text>
            <Text style={styles.hint}>
              Structured inside the 7 × 3 CalcPro Suite using shared commodity ({master.commodity}) & {calc.qtyMtNum} MT context.
            </Text>
            <Text style={styles.label}>Base Value ({cur})</Text>
            <TextInput value={genericA} onChangeText={setGenericA} keyboardType="numeric" style={styles.input} />
            <Text style={styles.label}>Adjustment / Rate (%)</Text>
            <TextInput value={genericB} onChangeText={setGenericB} keyboardType="numeric" style={styles.input} />
            <View style={styles.resultBox}>
              <Text style={styles.resHighlight}>Estimated Output: {fmt(estOutput, cur)}</Text>
            </View>
          </View>
        );
      }
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050811" />

      <View style={styles.topBar}>
        {typeof onBack === 'function' ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backSpace} />
        )}
        <Text style={styles.headerTitle}>सेतु केल्प्रो सूट</Text>
        <Text style={styles.headerBadge}>7×3 • 21</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 3 Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {CATEGORIES.map((cat) => {
            const active = cat.key === activeCatKey;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => handleSelectCategory(cat.key)}
                style={[styles.catTab, active && styles.catTabActive]}
              >
                <Text style={[styles.catTabTitle, active && styles.catTabTitleActive]}>
                  {cat.title}
                </Text>
                <Text style={styles.catTabSub}>7 Tools</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.catDesc}>{activeCategory.subtitle}</Text>

        {/* 7 Tools in Active Category */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolRow}>
          {activeCategory.tools.map((t) => {
            const active = t.key === activeToolKey;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setActiveToolKey(t.key)}
                style={[styles.toolChip, active && styles.toolChipActive]}
              >
                <Text style={[styles.toolChipId, active && styles.toolChipIdActive]}>{t.id}</Text>
                <Text style={[styles.toolChipName, active && styles.toolChipNameActive]}>{t.short}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Common Trade Data Master */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Common Trade Data Master</Text>
          <View style={styles.row2}>
            <TextInput
              value={master.commodity}
              onChangeText={(v) => setMasterField('commodity', v)}
              placeholder="Commodity"
              placeholderTextColor="#64748B"
              style={[styles.input, styles.half]}
            />
            <TextInput
              value={master.qtyMt}
              onChangeText={(v) => setMasterField('qtyMt', v)}
              keyboardType="numeric"
              placeholder="Qty (MT)"
              placeholderTextColor="#64748B"
              style={[styles.input, styles.half]}
            />
          </View>
          <View style={styles.row2}>
            <TextInput
              value={master.hsCode}
              onChangeText={(v) => setMasterField('hsCode', v)}
              placeholder="HS Code"
              placeholderTextColor="#64748B"
              style={[styles.input, styles.half]}
            />
            <TextInput
              value={master.bagWeightKg}
              onChangeText={(v) => setMasterField('bagWeightKg', v)}
              keyboardType="numeric"
              placeholder="Bag Wt (kg)"
              placeholderTextColor="#64748B"
              style={[styles.input, styles.half]}
            />
          </View>
          <View style={styles.chipRow}>
            {['USD', 'EUR', 'INR', 'AED'].map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setMasterField('currency', c)}
                style={[styles.chip, master.currency === c && styles.chipActive]}
              >
                <Text style={[styles.chipTxt, master.currency === c && styles.chipTxtActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Tool Workspace */}
        {renderToolWorkspace()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050811' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backTxt: { color: '#2DD4BF', fontSize: 13.5, fontWeight: '700' },
  backSpace: { width: 48 },
  headerTitle: { color: '#F8FAFC', fontSize: 16.5, fontWeight: '800' },
  headerBadge: {
    color: '#2DD4BF',
    fontSize: 11.5,
    fontWeight: '900',
    backgroundColor: 'rgba(45, 212, 191, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  content: { padding: 14, paddingBottom: 36 },
  catRow: { marginBottom: 8 },
  catTab: {
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 8,
  },
  catTabActive: { backgroundColor: 'rgba(45, 212, 191, 0.15)', borderColor: '#2DD4BF' },
  catTabTitle: { color: '#E2E8F0', fontSize: 12.5, fontWeight: '800' },
  catTabTitleActive: { color: '#2DD4BF' },
  catTabSub: { color: '#64748B', fontSize: 10.5, marginTop: 2 },
  catDesc: { color: '#94A3B8', fontSize: 11.5, marginBottom: 10 },
  toolRow: { marginBottom: 12 },
  toolChip: {
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 7,
  },
  toolChipActive: { backgroundColor: 'rgba(243, 210, 122, 0.14)', borderColor: '#F3D27A' },
  toolChipId: { color: '#64748B', fontSize: 10, fontWeight: '800' },
  toolChipIdActive: { color: '#F3D27A' },
  toolChipName: { color: '#CBD5E1', fontSize: 11.5, fontWeight: '700' },
  toolChipNameActive: { color: '#F8FAFC' },
  card: {
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { color: '#F3D27A', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  hint: { color: '#94A3B8', fontSize: 11, lineHeight: 16, marginBottom: 10 },
  label: { color: '#CBD5E1', fontSize: 12, fontWeight: '700', marginBottom: 5, marginTop: 4 },
  input: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 13,
    marginBottom: 8,
  },
  row2: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  chip: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: 'rgba(45, 212, 191, 0.16)', borderColor: '#2DD4BF' },
  chipTxt: { color: '#94A3B8', fontSize: 11.5, fontWeight: '700' },
  chipTxtActive: { color: '#2DD4BF' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  resultBox: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.35)',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  resLine: { color: '#E2E8F0', fontSize: 12, marginBottom: 3 },
  resHighlight: { color: '#2DD4BF', fontSize: 13.5, fontWeight: '900', marginTop: 2 },
  warnTxt: { color: '#FBBF24', fontSize: 11, marginTop: 5, fontWeight: '700' },
});;

          
