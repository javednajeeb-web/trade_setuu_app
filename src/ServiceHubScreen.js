import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

const SERVICES = [
  { id: 'shipping', icon: '🚢', en: 'Shipping & Freight', hi: 'शिपिंग और फ्रेट' },
  { id: 'cha', icon: '🛃', en: 'CHA & Customs', hi: 'CHA और कस्टम्स' },
  { id: 'iec', icon: '📜', en: 'IEC & Compliance', hi: 'IEC और लाइसेंस' },
  { id: 'packaging', icon: '🛍️', en: 'Packaging & Print', hi: 'पैकेजिंग और प्रिंट' },
  { id: 'eway', icon: '🚛', en: 'E-Way & Domestic', hi: 'ई-वे और डोमेस्टिक' },
];

export default function ServiceHubScreen({ theme = 'dark', lang = 'en', initialService = 'shipping' }) {
  const isDark = theme === 'dark';
  const T = {
    bg: isDark ? '#0B0D12' : '#F2F4F8',
    card: isDark ? '#131924' : '#FAFBFD',
    border: isDark ? '#1E293B' : '#DCE2EC',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#64748B',
    input: isDark ? '#0F1520' : '#EEF2F7',
    accent: '#0D9488',
  };

  const [service, setService] = useState(initialService || 'shipping');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (initialService) setService(initialService);
  }, [initialService]);

  // 1. Shipping & Freight state
  const [pol, setPol] = useState('JNPT / Nhava Sheva');
  const [pod, setPod] = useState('Jebel Ali');
  const [contSize, setContSize] = useState('20ft Dry');
  const [shipCargo, setShipCargo] = useState('Parboiled Rice • 26 MT');
  const [sailingDate, setSailingDate] = useState('Within 7 Days');

  // 2. CHA & Customs state
  const [chaPort, setChaPort] = useState('Mundra / JNPT');
  const [chaMode, setChaMode] = useState('Export Clearance');
  const [hsCode, setHsCode] = useState('10063010 (Rice)');
  const [chaDocs, setChaDocs] = useState('Invoice, Packing List, AD Code Ready');

  // 3. IEC & Compliance state
  const [compType, setCompType] = useState('APEDA / FIEO RCMC');
  const [firmType, setFirmType] = useState('Proprietorship / LLP');
  const [compCity, setCompCity] = useState('Raipur, Chhattisgarh');

  // 4. Packaging & Print state
  const [bagType, setBagType] = useState('50 Kg PP Woven Bag');
  const [printStyle, setPrintStyle] = useState('Multicolor BOPP Laminated');
  const [bagQty, setBagQty] = useState('10,000 Bags');

  // 5. E-Way & Domestic state
  const [truckType, setTruckType] = useState('16-Wheeler (30 MT)');
  const [domRoute, setDomRoute] = useState('Raipur -> Vizag Port');
  const [ewayNeed, setEwayNeed] = useState('Yes (E-Way + Transit Insurance)');

  const submitQuote = (title, summary) => {
    const newReq = {
      id: String(Date.now()),
      title,
      summary,
      status: lang === 'hi' ? 'वेरिफाइड पार्टनर्स को भेजा गया' : 'Sent to Verified Partners',
    };
    setRequests([newReq, ...requests]);
    Alert.alert(
      lang === 'hi' ? 'रिक्वेस्ट सबमिट हो गई ✓' : 'Quote Request Submitted ✓',
      `${title}\n${summary}\n\n${lang === 'hi' ? 'वेरिफाइड सर्विस प्रोवाइडर्स जल्द ही आपसे संपर्क करेंगे।' : 'Verified service providers will respond shortly.'}`
    );
  };

  const renderChips = (options, selected, onSelect) => (
    <View style={styles.chipWrap}>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            style={[styles.chip, { backgroundColor: active ? T.accent : T.input, borderColor: active ? T.accent : T.border }]}
          >
            <Text style={{ color: active ? '#FFF' : T.text, fontSize: 11, fontWeight: '700' }}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
  return (
    <ScrollView style={[styles.container, { backgroundColor: T.bg }]} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {SERVICES.map((s) => {
          const active = service === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => setService(s.id)}
              style={[styles.topTab, { backgroundColor: active ? '#0D1B2A' : T.card, borderColor: active ? T.accent : T.border }]}
            >
              <Text style={{ fontSize: 15, marginRight: 5 }}>{s.icon}</Text>
              <Text style={{ color: active ? '#14B8A6' : T.text, fontSize: 12, fontWeight: '800' }}>
                {lang === 'hi' ? s.hi : s.en}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {service === 'shipping' && (
        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.head, { color: T.text }]}>🚢 {lang === 'hi' ? 'समुद्री फ्रेट और कंटेनर बुकिंग' : 'Ocean Freight & Container Quote'}</Text>
          <Text style={[styles.lbl, { color: T.sub }]}>Port of Loading (POL)</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={pol} onChangeText={setPol} />
          <Text style={[styles.lbl, { color: T.sub }]}>Port of Discharge (POD)</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={pod} onChangeText={setPod} />
          <Text style={[styles.lbl, { color: T.sub }]}>Container Size</Text>
          {renderChips(['20ft Dry', '40ft HC', '40ft Reefer', 'LCL Cargo'], contSize, setContSize)}
          <Text style={[styles.lbl, { color: T.sub }]}>Commodity & Weight</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={shipCargo} onChangeText={setShipCargo} />
          <Text style={[styles.lbl, { color: T.sub }]}>Target Sailing Window</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={sailingDate} onChangeText={setSailingDate} />
          <TouchableOpacity style={styles.btn} onPress={() => submitQuote('Shipping & Freight', `${pol} -> ${pod} | ${contSize} | ${shipCargo}`)}>
            <Text style={styles.btnTxt}>{lang === 'hi' ? 'शिपिंग लाइन से रेट मँगवाएँ' : 'Get Shipping Line Rates'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {service === 'cha' && (
        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.head, { color: T.text }]}>🛃 {lang === 'hi' ? 'CHA और कस्टम्स क्लियरेंस' : 'CHA & Customs Clearance'}</Text>
          <Text style={[styles.lbl, { color: T.sub }]}>Clearance Type</Text>
          {renderChips(['Export Clearance', 'Import Clearance', 'ICD Stuffing'], chaMode, setChaMode)}
          <Text style={[styles.lbl, { color: T.sub }]}>Custom Port / ICD Location</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={chaPort} onChangeText={setChaPort} />
          <Text style={[styles.lbl, { color: T.sub }]}>HS Code & Cargo Description</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={hsCode} onChangeText={setHsCode} />
          <Text style={[styles.lbl, { color: T.sub }]}>Available Documents</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={chaDocs} onChangeText={setChaDocs} />
          <TouchableOpacity style={styles.btn} onPress={() => submitQuote('CHA & Customs', `${chaMode} @ ${chaPort} | HS: ${hsCode}`)}>
            <Text style={styles.btnTxt}>{lang === 'hi' ? 'वेरिफाइड CHA से संपर्क करें' : 'Request Verified CHA Quote'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {service === 'iec' && (
        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.head, { color: T.text }]}>📜 {lang === 'hi' ? 'IEC, RCMC और एक्सपोर्ट लाइसेंस' : 'IEC, RCMC & Export Compliance'}</Text>
          <Text style={[styles.lbl, { color: T.sub }]}>Select Compliance Service</Text>
          {renderChips(['New IEC Code', 'APEDA / FIEO RCMC', 'Bank AD Code', 'LUT Filing', 'COO & Phyto'], compType, setCompType)}
          <Text style={[styles.lbl, { color: T.sub }]}>Entity Constitution</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={firmType} onChangeText={setFirmType} />
          <Text style={[styles.lbl, { color: T.sub }]}>Registered City & State</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={compCity} onChangeText={setCompCity} />
          <TouchableOpacity style={styles.btn} onPress={() => submitQuote('IEC & Compliance', `${compType} | ${firmType} | ${compCity}`)}>
            <Text style={styles.btnTxt}>{lang === 'hi' ? 'कम्प्लायंस एक्सपर्ट बुक करें' : 'Book Compliance Expert'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {service === 'packaging' && (
        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.head, { color: T.text }]}>🛍️ {lang === 'hi' ? 'एक्सपोर्ट बैग्स और प्रिंटिंग' : 'Export Packaging & Custom Print'}</Text>
          <Text style={[styles.lbl, { color: T.sub }]}>Packaging Material</Text>
          {renderChips(['50 Kg PP Woven Bag', '25/30 Kg BOPP Bag', 'Export Carton Box', '1 MT Jumbo Bag'], bagType, setBagType)}
          <Text style={[styles.lbl, { color: T.sub }]}>Printing & Lamination</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={printStyle} onChangeText={setPrintStyle} />
          <Text style={[styles.lbl, { color: T.sub }]}>Order Quantity</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={bagQty} onChangeText={setBagQty} />
          <TouchableOpacity style={styles.btn} onPress={() => submitQuote('Packaging & Print', `${bagType} | ${printStyle} | Qty: ${bagQty}`)}>
            <Text style={styles.btnTxt}>{lang === 'hi' ? 'मैन्युफैक्चरर रेट मँगवाएँ' : 'Get Manufacturer Quote'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {service === 'eway' && (
        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.head, { color: T.text }]}>🚛 {lang === 'hi' ? 'ई-वे बिल और डोमेस्टिक ट्रक लोड' : 'E-Way Bill & Domestic Fleet'}</Text>
          <Text style={[styles.lbl, { color: T.sub }]}>Truck / Trailer Type</Text>
          {renderChips(['12-Wheeler (21 MT)', '16-Wheeler (30 MT)', '18-Wheeler (35 MT)', '22-Wheeler (42 MT)'], truckType, setTruckType)}
          <Text style={[styles.lbl, { color: T.sub }]}>Loading to Unloading Route</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={domRoute} onChangeText={setDomRoute} />
          <Text style={[styles.lbl, { color: T.sub }]}>E-Way Bill & Insurance</Text>
          <TextInput style={[styles.input, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={ewayNeed} onChangeText={setEwayNeed} />
          <TouchableOpacity style={styles.btn} onPress={() => submitQuote('E-Way & Domestic', `${truckType} | ${domRoute} | ${ewayNeed}`)}>
            <Text style={styles.btnTxt}>{lang === 'hi' ? 'ट्रक और ई-वे सपोर्ट लें' : 'Book Truck & E-Way Support'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {requests.map((r) => (
        <View key={r.id} style={[styles.reqCard, { backgroundColor: T.card, borderColor: T.accent }]}>
          <Text style={{ color: T.accent, fontSize: 12, fontWeight: '800' }}>✓ {r.title} — {r.status}</Text>
          <Text style={{ color: T.text, fontSize: 12, marginTop: 3 }}>{r.summary}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  head: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  lbl: { fontSize: 12, fontWeight: '600', marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginRight: 6, marginBottom: 6 },
  btn: { backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  btnTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  reqCard: { borderRadius: 10, borderWidth: 1, padding: 10, marginTop: 8 },
});
