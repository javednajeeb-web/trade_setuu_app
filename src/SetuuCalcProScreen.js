import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const COMMODITY_PRESETS = [
  { id: 'rice_pb', name: 'Parboiled / Sella Rice', unit: '50 Kg PP Bag', unitKg: 50, cap20: 26, cap40: 28, reefer: false, fobUsd: 465 },
  { id: 'rice_bas', name: '1121 Basmati Rice', unit: '30 Kg BOPP Bag', unitKg: 30, cap20: 25, cap40: 27, reefer: false, fobUsd: 980 },
  { id: 'maize', name: 'Yellow Maize (Feed/Starch)', unit: '50 Kg Jute/PP Bag', unitKg: 50, cap20: 26, cap40: 28, reefer: false, fobUsd: 268 },
  { id: 'banana', name: 'Fresh Cavendish Banana', unit: '13.5 Kg Carton', unitKg: 13.5, cap20: 11, cap40: 21.5, reefer: true, fobUsd: 540 },
  { id: 'turmeric', name: 'Turmeric Fingers (Nizamabad)', unit: '50 Kg Jute Bag', unitKg: 50, cap20: 18, cap40: 25, reefer: false, fobUsd: 1680 },
  { id: 'pulses', name: 'Chickpeas / Kabuli Chana', unit: '50 Kg PP Bag', unitKg: 50, cap20: 25, cap40: 27, reefer: false, fobUsd: 890 },
];

export default function SetuuCalcProScreen({ theme, lang = 'en' }) {
  const isDark = theme === 'dark';
  const T = {
    bg: isDark ? '#0B0D12' : '#F2F4F8',
    card: isDark ? '#131924' : '#FAFBFD',
    border: isDark ? '#1E293B' : '#DCE2EC',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#64748B',
    input: isDark ? '#0F1520' : '#EEF2F7',
    accent: '#0D9488',
    gold: '#C9B89A',
  };

  const [tab, setTab] = useState('commodity');
  const [selectedComm, setSelectedComm] = useState(COMMODITY_PRESETS[0]);
  const [containerType, setContainerType] = useState('20FT');
  const [containers, setContainers] = useState('1');
  const [customPriceUsd, setCustomPriceUsd] = useState(String(COMMODITY_PRESETS[0].fobUsd));
  const [freightUsd, setFreightUsd] = useState('850');

  const [usdRate, setUsdRate] = useState(92.65);
  const [rates, setRates] = useState({ INR: 92.65, AED: 3.67, EUR: 0.92, SAR: 3.75, GBP: 0.79 });
  const [rateLoading, setRateLoading] = useState(false);
  const [rateUpdated, setRateUpdated] = useState('Live Market Base');
  const [amountInput, setAmountInput] = useState('1000');
  const [targetCurr, setTargetCurr] = useState('INR');

  useEffect(() => {
    let mounted = true;
    const fetchRates = async () => {
      try {
        setRateLoading(true);
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (mounted && data && data.rates && data.rates.INR) {
          const inr = Number(data.rates.INR.toFixed(2));
          setUsdRate(inr);
          setRates({
            INR: inr,
            AED: Number((data.rates.AED || 3.67).toFixed(3)),
            EUR: Number((data.rates.EUR || 0.92).toFixed(3)),
            SAR: Number((data.rates.SAR || 3.75).toFixed(3)),
            GBP: Number((data.rates.GBP || 0.79).toFixed(3)),
          });
          setRateUpdated('Live API Synced');
        }
      } catch (e) {
        if (mounted) setRateUpdated('Market Rate ₹92.65');
      } finally {
        if (mounted) setRateLoading(false);
      }
    };
    fetchRates();
    return () => { mounted = false; };
  }, []);

  const selectCommodity = (item) => {
    setSelectedComm(item);
    setCustomPriceUsd(String(item.fobUsd));
    if (item.reefer) setContainerType('40RF');
    else if (containerType === '40RF') setContainerType('20FT');
  };

  const numCont = Math.max(1, parseFloat(containers) || 1);
  const perContMt = containerType === '20FT' ? selectedComm.cap20 : selectedComm.cap40;
  const totalMt = +(perContMt * numCont).toFixed(2);
  const totalPackages = Math.round((totalMt * 1000) / selectedComm.unitKg);
  const fobPerMt = parseFloat(customPriceUsd) || 0;
  const freightPerCont = parseFloat(freightUsd) || 0;
  const totalFobUsd = +(totalMt * fobPerMt).toFixed(2);
  const totalCifUsd = +(totalFobUsd + freightPerCont * numCont).toFixed(2);
  const totalCifInr = Math.round(totalCifUsd * usdRate);
  const convertedVal = ((parseFloat(amountInput) || 0) * (rates[targetCurr] || 1)).toFixed(2);
  return (
    <ScrollView style={[styles.container, { backgroundColor: T.bg }]} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, { backgroundColor: tab === 'commodity' ? T.accent : T.card, borderColor: T.border }]}
          onPress={() => setTab('commodity')}
        >
          <Text style={[styles.tabTxt, { color: tab === 'commodity' ? '#FFF' : T.text }]}>
            {lang === 'hi' ? '📦 कमोडिटी लोड कैलकुलेटर' : '📦 Commodity Load Calc'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, { backgroundColor: tab === 'fx' ? T.accent : T.card, borderColor: T.border }]}
          onPress={() => setTab('fx')}
        >
          <Text style={[styles.tabTxt, { color: tab === 'fx' ? '#FFF' : T.text }]}>
            {lang === 'hi' ? '💱 लाइव करेंसी (₹' + usdRate + ')' : '💱 Live FX (₹' + usdRate + ')'}
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'commodity' ? (
        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.secTitle, { color: T.text }]}>
            {lang === 'hi' ? '1. एग्रो कमोडिटी चुनें' : '1. Select Agro Commodity'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {COMMODITY_PRESETS.map((c) => {
              const active = selectedComm.id === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => selectCommodity(c)}
                  style={[styles.chip, { backgroundColor: active ? T.accent : T.input, borderColor: active ? T.accent : T.border }]}
                >
                  <Text style={{ color: active ? '#FFF' : T.text, fontSize: 12, fontWeight: '700' }}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.lbl, { color: T.sub }]}>Packing Standard: {selectedComm.unit}</Text>

          <View style={styles.row3}>
            {['20FT', '40FT', '40RF'].map((ct) => (
              <TouchableOpacity
                key={ct}
                onPress={() => setContainerType(ct)}
                style={[styles.ctBtn, { backgroundColor: containerType === ct ? '#0D1B2A' : T.input, borderColor: containerType === ct ? T.accent : T.border }]}
              >
                <Text style={{ color: containerType === ct ? '#14B8A6' : T.text, fontWeight: '800', fontSize: 12 }}>
                  {ct === '40RF' ? '40ft Reefer' : ct + ' Dry'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row2}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={[styles.lbl, { color: T.sub }]}>Containers (Qty)</Text>
              <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={containers} onChangeText={setContainers} />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={[styles.lbl, { color: T.sub }]}>FOB Rate (USD / MT)</Text>
              <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={customPriceUsd} onChangeText={setCustomPriceUsd} />
            </View>
          </View>

          <Text style={[styles.lbl, { color: T.sub }]}>Sea Freight per Container (USD)</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={freightUsd} onChangeText={setFreightUsd} />

          <View style={[styles.resultBox, { backgroundColor: '#0D1B2A', borderColor: '#14B8A6' }]}>
            <Text style={styles.resHead}>{selectedComm.name} • {containerType}</Text>
            <Text style={styles.resLine}>Net Cargo Weight: <Text style={styles.resBold}>{totalMt} MT ({totalPackages.toLocaleString()} {selectedComm.unit}s)</Text></Text>
            <Text style={styles.resLine}>Total FOB Value: <Text style={styles.resBold}>USD {totalFobUsd.toLocaleString()}</Text></Text>
            <Text style={styles.resLine}>Total CIF Value: <Text style={styles.resBold}>USD {totalCifUsd.toLocaleString()}</Text></Text>
            <Text style={styles.resInr}>≈ ₹ {totalCifInr.toLocaleString('en-IN')} (@ ₹{usdRate}/USD)</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={[styles.secTitle, { color: T.text, marginBottom: 0 }]}>Live Export FX Converter</Text>
            {rateLoading ? <ActivityIndicator size="small" color={T.accent} /> : <Text style={{ color: T.accent, fontSize: 11, fontWeight: '700' }}>{rateUpdated}</Text>}
          </View>
          <Text style={[styles.lbl, { color: T.sub }]}>Amount in USD ($)</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} keyboardType="numeric" value={amountInput} onChangeText={setAmountInput} />
          <View style={styles.row3}>
            {Object.keys(rates).map((cur) => (
              <TouchableOpacity
                key={cur}
                onPress={() => setTargetCurr(cur)}
                style={[styles.ctBtn, { backgroundColor: targetCurr === cur ? T.accent : T.input, borderColor: T.border }]}
              >
                <Text style={{ color: targetCurr === cur ? '#FFF' : T.text, fontWeight: '800', fontSize: 12 }}>{cur}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.resultBox, { backgroundColor: '#0D1B2A', borderColor: '#14B8A6' }]}>
            <Text style={styles.resHead}>1 USD = {rates[targetCurr]} {targetCurr}</Text>
            <Text style={styles.resInr}>{amountInput || '0'} USD = {convertedVal} {targetCurr}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { flexDirection: 'row', marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center', marginHorizontal: 3 },
  tabTxt: { fontSize: 12, fontWeight: '800' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  secTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  lbl: { fontSize: 12, fontWeight: '600', marginBottom: 5 },
  row3: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  row2: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ctBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, borderWidth: 1, alignItems: 'center', marginHorizontal: 3 },
  input: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  resultBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 6 },
  resHead: { color: '#C9B89A', fontSize: 13, fontWeight: '800', marginBottom: 6 },
  resLine: { color: '#CBD5E1', fontSize: 13, marginBottom: 4 },
  resBold: { color: '#FFFFFF', fontWeight: '800' },
  resInr: { color: '#14B8A6', fontSize: 17, fontWeight: '900', marginTop: 6 },
});
