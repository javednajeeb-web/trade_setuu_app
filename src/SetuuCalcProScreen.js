import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  Linking,
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

const DEFAULT_THEME = {
  isDark: true,
  navy: '#0D1B2A',
  bg: '#0B0D12',
  card: '#121620',
  inputBg: '#0B0D12',
  border: '#232A38',
  text: '#D9DDE3',
  subText: '#8A8F98',
  teal: '#0D9488',
  gold: '#C9B89A',
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

export default function SetuuCalcProScreen({ theme }) {
  const T = theme || DEFAULT_THEME;
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

  const buildMsg = (title, lines) =>
    'TRADE SETUU (Setuu Calc Pro) — ' +
    title +
    '\n------------------------\n' +
    lines.join('\n') +
    '\n------------------------\nPowered by Apex Sync Technologies';

  const sendWhatsApp = async (title, lines) => {
    const msg = buildMsg(title, lines);
    const url = 'whatsapp://send?text=' + encodeURIComponent(msg);
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url);
    else Share.share({ message: msg });
  };

  const shareAny = (title, lines) => {
    Share.share({ message: buildMsg(title, lines) });
  };

  // Calculations
  const factor = cbmUnit === 'cm' ? 1000000 : 61023.74;
  const singleCbm = (num(len) * num(wid) * num(hgt)) / factor;
  const totalCbm = singleCbm * num(boxQty);
  const totalCft = totalCbm * 35.3147;
  const totalGrossKg = num(boxWt) * num(boxQty);
  const totalGrossMt = totalGrossKg / 1000;

  const contSpecs = {
    '20ft': { name: '20ft Standard', cbm: 33.2, maxMt: 28.0 },
    '40ft': { name: '40ft Standard', cbm: 67.7, maxMt: 28.5 },
    '40hc': { name: '40ft High Cube', cbm: 76.4, maxMt: 28.5 },
  };
  const spec = contSpecs[contType];
  const usableCbm = spec.cbm * (num(effPct) / 100);
  const unitCbm = loadMode === 'bag' ? (num(bagWt) / 1000) * 1.35 : num(pkgCbm);
  const maxByVol = unitCbm > 0 ? Math.floor(usableCbm / unitCbm) : 0;
  const maxByWt = num(bagWt) > 0 ? Math.floor((spec.maxMt * 1000) / num(bagWt)) : maxByVol;
  const finalUnits = loadMode === 'bag' ? Math.min(maxByVol, maxByWt) : maxByVol;
  const loadedMt = (finalUnits * num(bagWt)) / 1000;
  const limitReason =
    loadMode === 'bag' && maxByWt < maxByVol
      ? 'Max Payload Weight Limit'
      : 'Container Volume (CBM) Limit';

  const baseFreight = num(frQty) * num(frRate);
  const totalFreight = baseFreight + num(frHandling) + num(frExtra);
  const perUnitFr = num(frQty) > 0 ? totalFreight / num(frQty) : 0;

  const exMtInr = num(exPriceQ) * 10;
  const fobInrMt = exMtInr + num(packMt) + num(chaMt);
  const fxL = num(fxLanded) > 0 ? num(fxLanded) : 84.5;
  const fobUsdMt = fobInrMt / fxL;
  const cfrUsdMt = fobUsdMt + num(seaUsdMt);
  const cifUsdMt = cfrUsdMt * (1 + num(insPct) / 100);
  const cifInrMt = cifUsdMt * fxL;

  const selectCurrencies = (from, to) => {
    setFromCur(from);
    setToCur(to);
    const derived = FX_RATES[to] / FX_RATES[from];
    setCustomRate(derived >= 1 ? derived.toFixed(2) : derived.toFixed(5));
  };
  const convertedVal = num(fxAmt) * num(customRate);

  const fxP = num(fxProfit) > 0 ? num(fxProfit) : 84.5;
  const totalCostMtInr = num(buyMt) + num(procMt) + num(logMt);
  const sellInrMt = num(sellUsdMt) * fxP;
  const profitMtInr = sellInrMt - totalCostMtInr;
  const profitMtUsd = profitMtInr / fxP;
  const totalDealProfitInr = profitMtInr * num(dealMt);
  const totalDealProfitUsd = profitMtUsd * num(dealMt);
  const marginPct = sellInrMt > 0 ? (profitMtInr / sellInrMt) * 100 : 0;

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
      <Text style={[styles.fieldLabel, { color: T.subText }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: T.inputBg, color: T.text, borderColor: T.border },
        ]}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor={T.subText}
      />
    </View>
  );

  const renderRow = (k, v, highlight = false) => (
    <View style={[styles.resRow, { borderBottomColor: T.border }]} key={k}>
      <Text style={[styles.resKey, { color: T.subText }]}>{k}</Text>
      <Text
        style={[
          styles.resVal,
          { color: highlight ? T.teal : T.text },
          highlight && { fontSize: 14 },
        ]}
      >
        {v}
      </Text>
    </View>
  );

  const renderShareBar = (title, lines) => (
    <View style={styles.shareRow}>
      <TouchableOpacity
        style={styles.waBtn}
        onPress={() => sendWhatsApp(title, lines)}
      >
        <Text style={styles.waBtnTxt}>💬 WhatsApp Quote</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.shareBtn, { backgroundColor: T.gold }]}
        onPress={() => shareAny(title, lines)}
      >
        <Text style={styles.shareBtnTxt}>↗ Share</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <View style={[styles.header, { backgroundColor: T.navy }]}>
        <Text style={styles.title}>SETUU CALC PRO</Text>
        <Text style={styles.subtitle}>7-in-1 Global Trade & Logistics Suite</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabBar, { borderBottomColor: T.border }]}
        contentContainerStyle={styles.tabBarContent}
      >
        {TOOLS.map((t) => {
          const active = activeTool === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTool(t.id)}
              style={[
                styles.tabPill,
                { backgroundColor: T.card, borderColor: T.border },
                active && { backgroundColor: T.teal, borderColor: T.teal },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: active ? '#FFFFFF' : T.subText },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {activeTool === 'cbm' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>1. CBM & Volume Calculator</Text>
            <View style={styles.toggleRow}>
              {['cm', 'inch'].map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setCbmUnit(u)}
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    cbmUnit === u && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: cbmUnit === u ? '#FFF' : T.text, fontSize: 12, fontWeight: '700' }}>
                    Unit: {u.toUpperCase()}
                  </Text>
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
            <View style={[styles.resultBox, { backgroundColor: T.inputBg, borderColor: T.border }]}>
              {renderRow('Single Box Volume', fmt(singleCbm, 4) + ' CBM')}
              {renderRow('Total Volume (CBM)', fmt(totalCbm, 3) + ' m3', true)}
              {renderRow('Total Cubic Feet', fmt(totalCft, 2) + ' CFT')}
              {renderRow('Total Gross Weight', fmt(totalGrossKg, 1) + ' kg (' + fmt(totalGrossMt, 2) + ' MT)')}
            </View>
            {renderShareBar('CBM Calculation', [
              'Dimensions: ' + len + 'x' + wid + 'x' + hgt + ' ' + cbmUnit,
              'Boxes: ' + boxQty,
              'Total Volume: ' + fmt(totalCbm, 3) + ' CBM (' + fmt(totalCft, 2) + ' CFT)',
              'Total Weight: ' + fmt(totalGrossMt, 2) + ' MT',
            ])}
          </View>
        )}

        {activeTool === 'container' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>2. Container Load Planner</Text>
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
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    contType === c.id && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: contType === c.id ? '#FFF' : T.text, fontSize: 12, fontWeight: '700' }}>
                    {c.label}
                  </Text>
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
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    loadMode === m.id && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: loadMode === m.id ? '#FFF' : T.text, fontSize: 12, fontWeight: '700' }}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.gridRow}>
              {renderField('Bag / Box Weight (kg)', bagWt, setBagWt)}
              {loadMode === 'box'
                ? renderField('Single Box CBM', pkgCbm, setPkgCbm)
                : renderField('Space Efficiency (%)', effPct, setEffPct)}
            </View>
            <View style={[styles.resultBox, { backgroundColor: T.inputBg, borderColor: T.border }]}>
              {renderRow('Container Type', spec.name)}
              {renderRow('Max Loadable Units', finalUnits + (loadMode === 'bag' ? ' Bags' : ' Cartons'), true)}
              {renderRow('Total Cargo Weight', fmt(loadedMt, 2) + ' MT', true)}
              {renderRow('Governing Limit', limitReason)}
            </View>
            {renderShareBar('Container Stuffing Plan', [
              'Container: ' + spec.name,
              'Max Capacity: ' + finalUnits + ' units (' + fmt(loadedMt, 2) + ' MT)',
              'Note: ' + limitReason,
            ])}
          </View>
        )}

        {activeTool === 'freight' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>3. Freight & Transport Cost</Text>
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
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    frMode === m.id && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: frMode === m.id ? '#FFF' : T.text, fontSize: 12, fontWeight: '700' }}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.gridRow}>
              {renderField(frMode === 'road' ? 'Load Weight (MT)' : 'No. of Containers', frQty, setFrQty)}
              {renderField(frMode === 'road' ? 'Rate / MT (INR)' : 'Ocean Freight / Box ($)', frRate, setFrRate)}
            </View>
            <View style={styles.gridRow}>
              {renderField('Loading / Stuffing', frHandling, setFrHandling)}
              {renderField('Toll / BL / Misc', frExtra, setFrExtra)}
            </View>
            <View style={[styles.resultBox, { backgroundColor: T.inputBg, borderColor: T.border }]}>
              {renderRow('Base Freight', (frMode === 'road' ? 'INR ' : 'USD ') + fmt(baseFreight, 2))}
              {renderRow('Total Freight Cost', (frMode === 'road' ? 'INR ' : 'USD ') + fmt(totalFreight, 2), true)}
              {renderRow(frMode === 'road' ? 'Effective Cost / MT' : 'Cost / Container', (frMode === 'road' ? 'INR ' : 'USD ') + fmt(perUnitFr, 2))}
            </View>
            {renderShareBar('Freight Estimate', [
              'Mode: ' + (frMode === 'road' ? 'Road Transport' : 'Sea Freight'),
              'Total Freight: ' + (frMode === 'road' ? 'INR ' : 'USD ') + fmt(totalFreight, 2),
            ])}
          </View>
        )}

        {activeTool === 'landed' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>4. FOB & CIF Landed Cost</Text>
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
            <View style={[styles.resultBox, { backgroundColor: T.inputBg, borderColor: T.border }]}>
              {renderRow('Ex-Factory / MT', 'INR ' + fmt(exMtInr, 2))}
              {renderRow('FOB Price / MT', 'USD ' + fmt(fobUsdMt, 2), true)}
              {renderRow('CFR Price / MT', 'USD ' + fmt(cfrUsdMt, 2))}
              {renderRow('CIF Landed / MT', 'USD ' + fmt(cifUsdMt, 2), true)}
              {renderRow('CIF Landed (INR/MT)', 'INR ' + fmt(cifInrMt, 2))}
            </View>
            {renderShareBar('Export Price Quote (FOB/CIF)', [
              'FOB Quote: USD ' + fmt(fobUsdMt, 2) + ' / MT',
              'CFR Quote: USD ' + fmt(cfrUsdMt, 2) + ' / MT',
              'CIF Quote: USD ' + fmt(cifUsdMt, 2) + ' / MT',
            ])}
          </View>
        )}

        {activeTool === 'currency' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>5. Trade Currency Converter</Text>
            {renderField('Amount', fxAmt, setFxAmt)}
            <Text style={[styles.fieldLabel, { color: T.subText }]}>From Currency:</Text>
            <View style={styles.toggleRow}>
              {Object.keys(FX_RATES).map((c) => (
                <TouchableOpacity
                  key={'from-' + c}
                  onPress={() => selectCurrencies(c, toCur)}
                  style={[
                    styles.miniPill,
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    fromCur === c && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: fromCur === c ? '#FFF' : T.text, fontSize: 12, fontWeight: '700' }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.fieldLabel, { color: T.subText }]}>To Currency:</Text>
            <View style={styles.toggleRow}>
              {Object.keys(FX_RATES).map((c) => (
                <TouchableOpacity
                  key={'to-' + c}
                  onPress={() => selectCurrencies(fromCur, c)}
                  style={[
                    styles.miniPill,
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    toCur === c && { backgroundColor: T.teal, borderColor: T.teal },
                ]}
                >
                  <Text style={{ color: toCur === c ? '#FFF' : T.text, fontSize: 12, fontWeight: '700' }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {renderField('Exchange Rate (1 ' + fromCur + ' = ? ' + toCur + ')', customRate, setCustomRate)}
            <View style={[styles.resultBox, { backgroundColor: T.inputBg, borderColor: T.border }]}>
              {renderRow('Input Amount', fromCur + ' ' + fmt(num(fxAmt), 2))}
              {renderRow('Converted Value', toCur + ' ' + fmt(convertedVal, 2), true)}
            </View>
          </View>
        )}

        {activeTool === 'profit' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>6. Export Deal Profit & Margin</Text>
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
            <View style={[styles.resultBox, { backgroundColor: T.inputBg, borderColor: T.border }]}>
              {renderRow('All-in Cost / MT', 'INR ' + fmt(totalCostMtInr, 2))}
              {renderRow('Selling Price / MT', 'INR ' + fmt(sellInrMt, 2))}
              {renderRow('Net Profit / MT', 'INR ' + fmt(profitMtInr, 2) + ' ($' + fmt(profitMtUsd, 2) + ')', true)}
              {renderRow('Total Deal Profit', 'INR ' + fmt(totalDealProfitInr, 0) + ' ($' + fmt(totalDealProfitUsd, 2) + ')', true)}
              {renderRow('Net Profit Margin', fmt(marginPct, 2) + '%', true)}
            </View>
          </View>
        )}

        {activeTool === 'duty' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>7. Customs Duty, IGST & RoDTEP</Text>
            {renderField('Assessable CIF Value (INR)', cifVal, setCifVal)}
            <View style={styles.gridRow}>
              {renderField('Basic Duty BCD (%)', bcdPct, setBcdPct)}
              {renderField('SWS on BCD (%)', swsPct, setSwsPct)}
            </View>
            <View style={styles.gridRow}>
              {renderField('IGST (%)', igstPct, setIgstPct)}
              {renderField('RoDTEP / Drawback (%)', rodtepPct, setRodtepPct)}
            </View>
            <View style={[styles.resultBox, { backgroundColor: T.inputBg, borderColor: T.border }]}>
              {renderRow('Basic Customs Duty', 'INR ' + fmt(bcdAmt, 2))}
              {renderRow('Social Welfare Surcharge', 'INR ' + fmt(swsAmt, 2))}
              {renderRow('IGST Payable', 'INR ' + fmt(igstAmt, 2))}
              {renderRow('Total Customs Outflow', 'INR ' + fmt(totalTax, 2), true)}
              {renderRow('RoDTEP / Drawback Benefit', 'INR ' + fmt(incentiveAmt, 2))}
              {renderRow('Net Effective Tax Impact', 'INR ' + fmt(netTaxImpact, 2), true)}
            </View>
          </View>
        )}

        <Text style={[styles.footer, { color: T.subText }]}>Powered by Apex Sync Technologies</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: '#C9B89A', fontSize: 11, marginTop: 2 },
  tabBar: { maxHeight: 52, borderBottomWidth: 1 },
  tabBarContent: { paddingHorizontal: 12, alignItems: 'center' },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  tabText: { fontSize: 12, fontWeight: '700' },
  body: { flex: 1 },
  bodyContent: { padding: 14, paddingBottom: 36 },
  card: { borderRadius: 14, padding: 15, borderWidth: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  toggleRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 4,
  },
  miniPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 4,
  },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  fieldBox: { flex: 1, marginBottom: 10 },
  fieldLabel: { fontSize: 11, marginBottom: 4, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  resultBox: { marginTop: 8, borderRadius: 10, padding: 12, borderWidth: 1 },
  resRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  resKey: { fontSize: 12 },
  resVal: { fontSize: 13, fontWeight: '700' },
  shareRow: { flexDirection: 'row', marginTop: 14, gap: 8 },
  waBtn: {
    flex: 2,
    backgroundColor: '#16A34A',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  waBtnTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  shareBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareBtnTxt: { color: '#0B0D12', fontSize: 13, fontWeight: '800' },
  footer: { textAlign: 'center', fontSize: 11, marginTop: 20 },
});
