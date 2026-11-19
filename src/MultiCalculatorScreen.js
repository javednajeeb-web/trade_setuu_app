import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';

const TOOLS = [
  { id: 'cbm', label: '1. CBM' },
  { id: 'container', label: '2. Container' },
  { id: 'freight', label: '3. Freight' },
  { id: 'landed', label: '4. Landed Cost' },
  { id: 'currency', label: '5. Currency' },
  { id: 'profit', label: '6. Profit & Margin' },
  { id: 'duty', label: '7. Duty & GST' },
];

const FX_RATES = {
  USD: 1,
  INR: 84.5,
  EUR: 0.92,
  AED: 3.67,
  SAR: 3.75,
  VND: 25400,
  CNY: 7.24,
};

const num = (v) => {
  const n = parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const fmt = (n, d = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-IN', {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      })
    : '0.00';

export default function MultiCalculatorScreen() {
  const [activeTool, setActiveTool] = useState('cbm');

  // 1. CBM State
  const [cbmUnit, setCbmUnit] = useState('cm');
  const [len, setLen] = useState('60');
  const [wid, setWid] = useState('40');
  const [hgt, setHgt] = useState('30');
  const [boxWt, setBoxWt] = useState('25');
  const [boxQty, setBoxQty] = useState('400');

  // 2. Container State
  const [contType, setContType] = useState('20ft');
  const [loadMode, setLoadMode] = useState('bag');
  const [bagWt, setBagWt] = useState('50');
  const [pkgCbm, setPkgCbm] = useState('0.065');
  const [effPct, setEffPct] = useState('88');

  // 3. Freight State
  const [frMode, setFrMode] = useState('road');
  const [frQty, setFrQty] = useState('30');
  const [frRate, setFrRate] = useState('2400');
  const [frHandling, setFrHandling] = useState('4500');
  const [frExtra, setFrExtra] = useState('2500');

  // 4. Landed Cost State
  const [exPriceQ, setExPriceQ] = useState('3400');
  const [packMt, setPackMt] = useState('1200');
  const [chaMt, setChaMt] = useState('950');
  const [seaUsdMt, setSeaUsdMt] = useState('48');
  const [insPct, setInsPct] = useState('0.5');
  const [fxLanded, setFxLanded] = useState('84.5');

  // 5. Currency State
  const [fxAmt, setFxAmt] = useState('10000');
  const [fromCur, setFromCur] = useState('USD');
  const [toCur, setToCur] = useState('INR');
  const [customRate, setCustomRate] = useState('84.50');

  // 6. Profit & Margin State
  const [buyMt, setBuyMt] = useState('34000');
  const [procMt, setProcMt] = useState('1800');
  const [logMt, setLogMt] = useState('3200');
  const [sellUsdMt, setSellUsdMt] = useState('520');
  const [fxProfit, setFxProfit] = useState('84.5');
  const [dealMt, setDealMt] = useState('54');

  // 7. Duty & GST State
  const [cifVal, setCifVal] = useState('1500000');
  const [bcdPct, setBcdPct] = useState('10');
  const [swsPct, setSwsPct] = useState('10');
  const [igstPct, setIgstPct] = useState('5');
  const [rodtepPct, setRodtepPct] = useState('1.5');

  const shareSummary = async (title, lines) => {
    try {
      const msg =
        'TRADE SETUU — ' +
        title +
        '\n------------------------\n' +
        lines.join('\n') +
        '\n------------------------\nPowered by Apex Sync Technologies';
      await Share.share({ message: msg });
    } catch (e) {}
  };

  // --- Calculations ---
  // 1. CBM
  const factor = cbmUnit === 'cm' ? 1000000 : 61023.74;
  const singleCbm = (num(len) * num(wid) * num(hgt)) / factor;
  const totalCbm = singleCbm * num(boxQty);
  const totalCft = totalCbm * 35.3147;
  const totalGrossKg = num(boxWt) * num(boxQty);
  const totalGrossMt = totalGrossKg / 1000;

  // 2. Container
  const contSpecs = {
    '20ft': { name: '20ft Standard', cbm: 33.2, maxMt: 28.0 },
    '40ft': { name: '40ft Standard', cbm: 67.7, maxMt: 28.5 },
    '40hc': { name: '40ft High Cube', cbm: 76.4, maxMt: 28.5 },
  };
  const spec = contSpecs[contType];
  const usableCbm = spec.cbm * (num(effPct) / 100);
  const unitCbm =
    loadMode === 'bag' ? (num(bagWt) / 1000) * 1.35 : num(pkgCbm);
  const maxByVol = unitCbm > 0 ? Math.floor(usableCbm / unitCbm) : 0;
  const maxByWt =
    num(bagWt) > 0 ? Math.floor((spec.maxMt * 1000) / num(bagWt)) : maxByVol;
  const finalUnits =
    loadMode === 'bag' ? Math.min(maxByVol, maxByWt) : maxByVol;
  const loadedMt = (finalUnits * num(bagWt)) / 1000;
  const limitReason =
    loadMode === 'bag' && maxByWt < maxByVol
      ? 'Max Payload Weight Limit'
      : 'Container Volume (CBM) Limit';

  // 3. Freight
  const baseFreight = num(frQty) * num(frRate);
  const totalFreight = baseFreight + num(frHandling) + num(frExtra);
  const perUnitFr = num(frQty) > 0 ? totalFreight / num(frQty) : 0;

  // 4. Landed Cost
  const exMtInr = num(exPriceQ) * 10;
  const fobInrMt = exMtInr + num(packMt) + num(chaMt);
  const fxL = num(fxLanded) > 0 ? num(fxLanded) : 84.5;
  const fobUsdMt = fobInrMt / fxL;
  const cfrUsdMt = fobUsdMt + num(seaUsdMt);
  const cifUsdMt = cfrUsdMt * (1 + num(insPct) / 100);
  const cifInrMt = cifUsdMt * fxL;

  // 5. Currency
  const selectCurrencies = (from, to) => {
    setFromCur(from);
    setToCur(to);
    const derived = FX_RATES[to] / FX_RATES[from];
    setCustomRate(derived >= 1 ? derived.toFixed(2) : derived.toFixed(5));
  };
  const convertedVal = num(fxAmt) * num(customRate);

  // 6. Profit & Margin
  const fxP = num(fxProfit) > 0 ? num(fxProfit) : 84.5;
  const totalCostMtInr = num(buyMt) + num(procMt) + num(logMt);
  const sellInrMt = num(sellUsdMt) * fxP;
  const profitMtInr = sellInrMt - totalCostMtInr;
  const profitMtUsd = profitMtInr / fxP;
  const totalDealProfitInr = profitMtInr * num(dealMt);
  const totalDealProfitUsd = profitMtUsd * num(dealMt);
  const marginPct = sellInrMt > 0 ? (profitMtInr / sellInrMt) * 100 : 0;

  // 7. Duty & GST
  const cif = num(cifVal);
  const bcdAmt = cif * (num(bcdPct) / 100);
  const swsAmt = bcdAmt * (num(swsPct) / 100);
  const igstBase = cif + bcdAmt + swsAmt;
  const igstAmt = igstBase * (num(igstPct) / 100);
  const totalTax = bcdAmt + swsAmt + igstAmt;
  const incentiveAmt = cif * (num(rodtepPct) / 100);
  const netTaxImpact = totalTax - incentiveAmt;

  const renderField = (label, value, onChange, placeholder = '0') => (
    <View style={styles.fieldBox}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="#64748B"
      />
    </View>
  );

  const renderRow = (k, v, highlight = false) => (
    <View style={styles.resRow} key={k}>
      <Text style={styles.resKey}>{k}</Text>
      <Text style={[styles.resVal, highlight && styles.resHighlight]}>
        {v}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MULTI CALCULATOR</Text>
        <Text style={styles.subtitle}>
          7-in-1 Global Trade & Logistics Suite
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TOOLS.map((t) => {
          const active = activeTool === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTool(t.id)}
              style={[styles.tabPill, active && styles.tabPillActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
      >
        {/* 1. CBM CALCULATOR */}
        {activeTool === 'cbm' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. CBM & Volume Calculator</Text>
            <View style={styles.toggleRow}>
              {['cm', 'inch'].map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setCbmUnit(u)}
                  style={[
                    styles.toggleBtn,
                    cbmUnit === u && styles.toggleBtnActive,
                  ]}
                >
                  <Text style={styles.toggleTxt}>Unit: {u.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.gridRow}>
              {renderField('Length (' + cbmUnit + ')', len, setLen)}
              {renderField('Width (' + cbmUnit + ')', wid, setWid)}
            </View>
            <View style={styles.gridRow}>
              {renderField('Height (' + cbmUnit + ')', hgt, setHgt)}
              {renderField('Weight / Box (kg)', boxWt, setBoxWt)}
            </View>
            {renderField('Total Cartons / Boxes', boxQty, setBoxQty)}

            <View style={styles.resultBox}>
              {renderRow('Single Box Volume', fmt(singleCbm, 4) + ' CBM')}
              {renderRow('Total Volume (CBM)', fmt(totalCbm, 3) + ' m3', true)}
              {renderRow('Total Cubic Feet', fmt(totalCft, 2) + ' CFT')}
              {renderRow(
                'Total Gross Weight',
                fmt(totalGrossKg, 1) + ' kg (' + fmt(totalGrossMt, 2) + ' MT)'
              )}
            </View>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() =>
                shareSummary('CBM Calculation', [
                  'Dimensions: ' + len + 'x' + wid + 'x' + hgt + ' ' + cbmUnit,
                  'Quantity: ' + boxQty + ' boxes',
                  'Total Volume: ' + fmt(totalCbm, 3) + ' CBM (' + fmt(totalCft, 2) + ' CFT)',
                  'Total Weight: ' + fmt(totalGrossMt, 2) + ' MT',
                ])
              }
            >
              <Text style={styles.shareBtnTxt}>Share CBM Quote</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. CONTAINER LOAD CALCULATOR */}
        {activeTool === 'container' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Container Load Planner</Text>
            <View style={styles.toggleRow}>
              {[
                { id: '20ft', label: '20ft GP' },
                { id: '40ft', label: '40ft GP' },
                { id: '40hc', label: '40ft HC' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setContType(c.id)}
                  style={[
                    styles.toggleBtn,
                    contType === c.id && styles.toggleBtnActive,
                  ]}
                >
                  <Text style={styles.toggleTxt}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.toggleRow}>
              {[
                { id: 'bag', label: 'Agro / Commodity Bags' },
                { id: 'box', label: 'Carton / Box CBM' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setLoadMode(m.id)}
                  style={[
                    styles.toggleBtn,
                    loadMode === m.id && styles.toggleBtnActive,
                  ]}
                >
                  <Text style={styles.toggleTxt}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.gridRow}>
              {renderField('Bag / Box Weight (kg)', bagWt, setBagWt)}
              {loadMode === 'box'
                ? renderField('Single Box CBM', pkgCbm, setPkgCbm)
                : renderField('Space Efficiency (%)', effPct, setEffPct)}
            </View>

            <View style={styles.resultBox}>
              {renderRow('Container Type', spec.name)}
              {renderRow(
                'Max Loadable Units',
                finalUnits + (loadMode === 'bag' ? ' Bags' : ' Cartons'),
                true
              )}
              {renderRow('Total Cargo Weight', fmt(loadedMt, 2) + ' MT', true)}
              {renderRow('Governing Limit', limitReason)}
            </View>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() =>
                shareSummary('Container Stuffing Plan', [
                  'Container: ' + spec.name,
                  'Unit Weight: ' + bagWt + ' kg',
                  'Max Capacity: ' + finalUnits + ' units (' + fmt(loadedMt, 2) + ' MT)',
                  'Note: ' + limitReason,
                ])
              }
            >
              <Text style={styles.shareBtnTxt}>Share Stuffing Plan</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. FREIGHT & TRANSPORT CALCULATOR */}
        {activeTool === 'freight' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. Freight & Transport Cost</Text>
            <View style={styles.toggleRow}>
              {[
                { id: 'road', label: 'Road Truck (INR)' },
                { id: 'sea', label: 'Sea Container (USD)' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setFrMode(m.id)}
                  style={[
                    styles.toggleBtn,
                    frMode === m.id && styles.toggleBtnActive,
                  ]}
                >
                  <Text style={styles.toggleTxt}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.gridRow}>
              {renderField(
                frMode === 'road' ? 'Load Weight (MT)' : 'No. of Containers',
                frQty,
                setFrQty
              )}
              {renderField(
                frMode === 'road' ? 'Rate / MT (INR)' : 'Ocean Freight / Box ($)',
                frRate,
                setFrRate
              )}
            </View>
            <View style={styles.gridRow}>
              {renderField('Loading / Stuffing', frHandling, setFrHandling)}
              {renderField('Toll / BL / Misc', frExtra, setFrExtra)}
            </View>

            <View style={styles.resultBox}>
              {renderRow(
                'Base Freight',
                (frMode === 'road' ? 'INR ' : 'USD ') + fmt(baseFreight, 2)
              )}
              {renderRow(
                'Total Freight Cost',
                (frMode === 'road' ? 'INR ' : 'USD ') + fmt(totalFreight, 2),
                true
              )}
              {renderRow(
                frMode === 'road' ? 'Effective Cost / MT' : 'Cost / Container',
                (frMode === 'road' ? 'INR ' : 'USD ') + fmt(perUnitFr, 2)
              )}
            </View>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() =>
                shareSummary('Freight Estimate', [
                  'Mode: ' + (frMode === 'road' ? 'Road Transport' : 'Sea Freight'),
                  'Quantity: ' + frQty,
                  'Total Freight: ' +
                    (frMode === 'road' ? 'INR ' : 'USD ') +
                    fmt(totalFreight, 2),
                ])
              }
            >
              <Text style={styles.shareBtnTxt}>Share Freight Estimate</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. LANDED COST CALCULATOR */}
        {activeTool === 'landed' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>4. FOB & CIF Landed Cost</Text>
            <View style={styles.gridRow}>
              {renderField('Ex-Factory (INR/Quintal)', exPriceQ, setExPriceQ)}
              {renderField('Packing & Bags (INR/MT)', packMt, setPackMt)}
            </View>
            <View style={styles.gridRow}>
              {renderField('CHA & Port (INR/MT)', chaMt, setChaMt)}
              {renderField('Sea Freight (USD/MT)', seaUsdMt, setSeaUsdMt)}
            </View>
            <View style={styles.gridRow}>
              {renderField('Insurance (%)', insPct, setInsPct)}
              {renderField('USD to INR Rate', fxLanded, setFxLanded)}
            </View>

            <View style={styles.resultBox}>
              {renderRow('Ex-Factory / MT', 'INR ' + fmt(exMtInr, 2))}
              {renderRow('FOB Price / MT', 'USD ' + fmt(fobUsdMt, 2), true)}
              {renderRow('CFR Price / MT', 'USD ' + fmt(cfrUsdMt, 2))}
              {renderRow('CIF Landed / MT', 'USD ' + fmt(cifUsdMt, 2), true)}
              {renderRow('CIF Landed (INR/MT)', 'INR ' + fmt(cifInrMt, 2))}
            </View>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() =>
                shareSummary('Export Price Quote (FOB/CIF)', [
                  'FOB Quote: USD ' + fmt(fobUsdMt, 2) + ' / MT',
                  'CFR Quote: USD ' + fmt(cfrUsdMt, 2) + ' / MT',
                  'CIF Quote: USD ' + fmt(cifUsdMt, 2) + ' / MT',
                ])
              }
            >
              <Text style={styles.shareBtnTxt}>Share FOB / CIF Quote</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. CURRENCY CONVERTER */}
        {activeTool === 'currency' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>5. Trade Currency Converter</Text>
            {renderField('Amount', fxAmt, setFxAmt)}
            <Text style={styles.fieldLabel}>From Currency:</Text>
            <View style={styles.toggleRow}>
              {Object.keys(FX_RATES).map((c) => (
                <TouchableOpacity
                  key={'from-' + c}
                  onPress={() => selectCurrencies(c, toCur)}
                  style={[
                    styles.miniPill,
                    fromCur === c && styles.toggleBtnActive,
                  ]}
                >
                  <Text style={styles.toggleTxt}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>To Currency:</Text>
            <View style={styles.toggleRow}>
              {Object.keys(FX_RATES).map((c) => (
                <TouchableOpacity
                  key={'to-' + c}
                  onPress={() => selectCurrencies(fromCur, c)}
                  style={[
                    styles.miniPill,
                    toCur === c && styles.toggleBtnActive,
                  ]}
                >
                  <Text style={styles.toggleTxt}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {renderField(
              'Exchange Rate (1 ' + fromCur + ' = ? ' + toCur + ')',
              customRate,
              setCustomRate
            )}

            <View style={styles.resultBox}>
              {renderRow('Input Amount', fromCur + ' ' + fmt(num(fxAmt), 2))}
              {renderRow(
                'Converted Value',
                toCur + ' ' + fmt(convertedVal, 2),
                true
              )}
            </View>
          </View>
        )}

        {/* 6. PROFIT & MARGIN CALCULATOR */}
        {activeTool === 'profit' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              6. Export Deal Profit & Margin
            </Text>
            <View style={styles.gridRow}>
              {renderField('Buying Cost (INR/MT)', buyMt, setBuyMt)}
              {renderField('Packing/Proc (INR/MT)', procMt, setProcMt)}
            </View>
            <View style={styles.gridRow}>
              {renderField('Logistics/CHA (INR/MT)', logMt, setLogMt)}
              {renderField('Selling Price (USD/MT)', sellUsdMt, setSellUsdMt)}
            </View>
            <View style={styles.gridRow}>
              {renderField('USD-INR Rate', fxProfit, setFxProfit)}
              {renderField('Total Deal Qty (MT)', dealMt, setDealMt)}
            </View>

            <View style={styles.resultBox}>
              {renderRow('All-in Cost / MT', 'INR ' + fmt(totalCostMtInr, 2))}
              {renderRow('Selling Price / MT', 'INR ' + fmt(sellInrMt, 2))}
              {renderRow(
                'Net Profit / MT',
                'INR ' + fmt(profitMtInr, 2) + ' ($' + fmt(profitMtUsd, 2) + ')',
                true
              )}
              {renderRow(
                'Total Deal Profit',
                'INR ' +
                  fmt(totalDealProfitInr, 0) +
                  ' ($' +
                  fmt(totalDealProfitUsd, 2) +
                  ')',
                true
              )}
              {renderRow('Net Profit Margin', fmt(marginPct, 2) + '%', true)}
            </View>
          </View>
        )}

        {/* 7. EXPORT / IMPORT DUTY & GST ESTIMATOR */}
        {activeTool === 'duty' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              7. Customs Duty, IGST & RoDTEP
            </Text>
            {renderField('Assessable CIF Value (INR)', cifVal, setCifVal)}
            <View style={styles.gridRow}>
              {renderField('Basic Duty BCD (%)', bcdPct, setBcdPct)}
              {renderField('SWS on BCD (%)', swsPct, setSwsPct)}
            </View>
            <View style={styles.gridRow}>
              {renderField('IGST (%)', igstPct, setIgstPct)}
              {renderField('RoDTEP / Drawback (%)', rodtepPct, setRodtepPct)}
            </View>

            <View style={styles.resultBox}>
              {renderRow('Basic Customs Duty', 'INR ' + fmt(bcdAmt, 2))}
              {renderRow('Social Welfare Surcharge', 'INR ' + fmt(swsAmt, 2))}
              {renderRow('IGST Payable', 'INR ' + fmt(igstAmt, 2))}
              {renderRow('Total Customs Outflow', 'INR ' + fmt(totalTax, 2), true)}
              {renderRow(
                'RoDTEP / Drawback Benefit',
                'INR ' + fmt(incentiveAmt, 2)
              )}
              {renderRow(
                'Net Effective Tax Impact',
                'INR ' + fmt(netTaxImpact, 2),
                true
              )}
            </View>
          </View>
        )}

        <Text style={styles.footer}>Powered by Apex Sync Technologies</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D12' },
  header: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2430',
  },
  title: {
    color: '#D9DDE3',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: { color: '#C9B89A', fontSize: 12, marginTop: 2 },
  tabBar: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2430',
  },
  tabBarContent: { paddingHorizontal: 12, alignItems: 'center' },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#141821',
    borderWidth: 1,
    borderColor: '#262D3D',
    marginRight: 8,
  },
  tabPillActive: { backgroundColor: '#0D9488', borderColor: '#14B8A6' },
  tabText: { color: '#8A8F98', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#FFFFFF' },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 36 },
  card: {
    backgroundColor: '#121620',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#232A38',
  },
  cardTitle: {
    color: '#D9DDE3',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1A202C',
    borderWidth: 1,
    borderColor: '#2D3748',
    marginRight: 6,
    marginBottom: 4,
  },
  miniPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1A202C',
    borderWidth: 1,
    borderColor: '#2D3748',
    marginRight: 6,
    marginBottom: 4,
  },
  toggleBtnActive: { backgroundColor: '#0D9488', borderColor: '#14B8A6' },
  toggleTxt: { color: '#D9DDE3', fontSize: 12, fontWeight: '600' },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  fieldBox: { flex: 1, marginBottom: 10 },
  fieldLabel: {
    color: '#8A8F98',
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0B0D12',
    color: '#D9DDE3',
    borderWidth: 1,
    borderColor: '#2A3242',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 8,
    backgroundColor: '#0B0D12',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  resRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#161B26',
  },
  resKey: { color: '#8A8F98', fontSize: 12 },
  resVal: { color: '#D9DDE3', fontSize: 13, fontWeight: '700' },
  resHighlight: { color: '#14B8A6', fontSize: 14 },
  shareBtn: {
    marginTop: 14,
    backgroundColor: '#C9B89A',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareBtnTxt: { color: '#0B0D12', fontSize: 13, fontWeight: '800' },
  footer: {
    textAlign: 'center',
    color: '#8A8F98',
    fontSize: 11,
    marginTop: 20,
  },
});
