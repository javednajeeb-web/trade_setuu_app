import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
  Linking,
} from 'react-native';

const TABS = [
  { id: 'rates', label: '1. Freight Rates', live: true },
  { id: 'truck', label: '2. Book Truck', live: true },
  { id: 'space', label: '3. Container Share', live: true },
  { id: 'return', label: '4. Backhaul Express', live: true },
  { id: 'warehouse', label: '5. Warehouse', live: true },
  { id: 'cha', label: '6. CHA Desk', live: true },
  { id: 'tracking', label: '7. Live Vessel', live: false },
  { id: 'port', label: '8. Port Schedule', live: false },
];

const BACKHAUL_LIST = [
  {
    id: 'BH-101',
    route: 'JNPT (Nhava Sheva) -> Raipur',
    truck: '32ft Multi-Axle (25 MT)',
    rate: 'INR 46,000 Flat',
    avail: 'Ready Today',
  },
  {
    id: 'BH-102',
    route: 'Mundra Port -> Indore / Bhopal',
    truck: '40ft High Bed Trailer (30 MT)',
    rate: 'INR 54,500 Flat',
    avail: 'Tomorrow Morning',
  },
  {
    id: 'BH-103',
    route: 'Katni -> Raipur / Bilaspur',
    truck: '12-Tyre Taurus (21 MT)',
    rate: 'INR 1,450 / MT',
    avail: 'Available Now',
  },
];

const CONTAINER_SHARE_LIST = [
  {
    id: 'CS-201',
    corridor: 'JNPT -> Jebel Ali (Dubai)',
    type: '40ft HC Spare LCL Space',
    space: '18 CBM / 8 MT Open',
    cutoff: 'Cut-off: 48 Hrs',
  },
  {
    id: 'CS-202',
    corridor: 'Mundra -> Dakar / Banjul',
    type: '20ft FCL Consolidator',
    space: '11 CBM / 6.5 MT Open',
    cutoff: 'Cut-off: 3 Days',
  },
];

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

export default function LogisticsHubScreen({ theme, onEarnPoints }) {
  const T = theme || DEFAULT_THEME;
  const [activeTab, setActiveTab] = useState('rates');
  const [origin, setOrigin] = useState('Raipur');
  const [dest, setDest] = useState('JNPT Nhava Sheva');
  const [cargo, setCargo] = useState('Parboiled Rice (50kg PP Bags)');
  const [weight, setWeight] = useState('28 MT');
  const [vehicle, setVehicle] = useState('32ft MXL / 20ft FCL');
  const [whType, setWhType] = useState('Ambient Agro Godown');
  const [whDays, setWhDays] = useState('30 Days');
  const [portName, setPortName] = useState('JNPT (Nhava Sheva)');
  const [contact, setContact] = useState('');

  const handleTabPress = (tab) => {
    if (!tab.live) {
      Alert.alert(
        tab.label + ' — Coming Soon',
        'Live AIS Satellite Vessel Tracking aur Automated Port Terminal Feed agle phase mein active honge.'
      );
      return;
    }
    setActiveTab(tab.id);
  };

  const submitRequest = (moduleTitle) => {
    if (onEarnPoints) onEarnPoints(15);
    const summary = [
      'TRADE SETUU — GLOBAL LOGISTICS HUB',
      'Module: ' + moduleTitle,
      'Route / Location: ' + origin + ' -> ' + dest,
      'Cargo: ' + cargo + ' (' + weight + ')',
      'Spec: ' + vehicle,
      contact ? 'Contact: ' + contact : '',
      'Powered by Apex Sync Technologies',
    ]
      .filter(Boolean)
      .join('\n');

    Alert.alert(
      'Logistics Request Logged (+15 Loyalty Pts)',
      moduleTitle + ' inquiry register ho gayi hai. Direct WhatsApp par bhejein?',
      [
        { text: 'OK', style: 'cancel' },
        {
          text: 'WhatsApp',
          onPress: async () => {
            const url = 'whatsapp://send?text=' + encodeURIComponent(summary);
            const ok = await Linking.canOpenURL(url);
            if (ok) Linking.openURL(url);
            else Share.share({ message: summary });
          },
        },
        {
          text: 'Share',
          onPress: () => Share.share({ message: summary }),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <View style={[styles.header, { backgroundColor: T.navy }]}>
        <Text style={styles.title}>GLOBAL LOGISTICS HUB</Text>
        <Text style={styles.subtitle}>
          Freight • Container Share • Backhaul Express • Warehouse
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabBar, { borderBottomColor: T.border }]}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((t) => {
          const active = activeTab === t.id && t.live;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => handleTabPress(t)}
              style={[
                styles.tabPill,
                { backgroundColor: T.card, borderColor: T.border },
                active && { backgroundColor: T.teal, borderColor: T.teal },
                !t.live && { opacity: 0.6 },
              ]}
            >
              <Text style={{ color: active ? '#FFF' : T.subText, fontSize: 12, fontWeight: '700' }}>
                {t.label}
                {!t.live ? ' (Soon)' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {activeTab === 'rates' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>1. Instant Freight Rate Search</Text>
            <Text style={[styles.label, { color: T.subText }]}>Origin City / ICD / Factory</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={origin} onChangeText={setOrigin} />
            <Text style={[styles.label, { color: T.subText }]}>Destination Port / City</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={dest} onChangeText={setDest} />
            <Text style={[styles.label, { color: T.subText }]}>Commodity & Packaging</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={cargo} onChangeText={setCargo} />
            <Text style={[styles.label, { color: T.subText }]}>Total Load / Container</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={weight} onChangeText={setWeight} />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: T.gold }]} onPress={() => submitRequest('Freight Rate Quote')}>
              <Text style={styles.primaryBtnTxt}>Get Best Freight Rate</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'truck' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>2. Book Commercial Truck</Text>
            <View style={styles.chipRow}>
              {['10-Tyre (16 MT)', '12-Tyre Taurus (21 MT)', '32ft MXL (25 MT)', '40ft Trailer (30 MT)'].map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setVehicle(v)}
                  style={[
                    styles.chip,
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    vehicle === v && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: vehicle === v ? '#FFF' : T.text, fontSize: 12, fontWeight: '600' }}>{v}</Text>
                </TouchableOpacity>
              ))}
                    </View>
        <Text style={[styles.label, { color: T.subText }]}>Loading Point / Origin</Text>
            
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={origin} onChangeText={setOrigin} />
            <Text style={[styles.label, { color: T.subText }]}>Unloading Point</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={dest} onChangeText={setDest} />
            <Text style={[styles.label, { color: T.subText }]}>Mobile / WhatsApp Number</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={contact} onChangeText={setContact} keyboardType="phone-pad" placeholder="+91..." placeholderTextColor={T.subText} />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: T.gold }]} onPress={() => submitRequest('Truck Placement (' + vehicle + ')')}>
              <Text style={styles.primaryBtnTxt}>Confirm Truck Request</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'space' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>3. Container Share (LCL / FCL Spare Space)</Text>
            {CONTAINER_SHARE_LIST.map((s) => (
              <View key={s.id} style={[styles.listCard, { backgroundColor: T.inputBg, borderColor: T.border }]}>
                <Text style={[styles.listHead, { color: T.text }]}>{s.corridor}</Text>
                <Text style={[styles.listSub, { color: T.subText }]}>{s.type}</Text>
                <Text style={[styles.listHighlight, { color: T.teal }]}>{s.space} • {s.cutoff}</Text>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: T.teal }]} onPress={() => submitRequest('Container Share: ' + s.corridor)}>
                  <Text style={styles.smallBtnTxt}>Book Container Share</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'return' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>4. Backhaul Express (Empty Return Trucks)</Text>
            {BACKHAUL_LIST.map((r) => (
              <View key={r.id} style={[styles.listCard, { backgroundColor: T.inputBg, borderColor: T.border }]}>
                <Text style={[styles.listHead, { color: T.text }]}>{r.route}</Text>
                <Text style={[styles.listSub, { color: T.subText }]}>{r.truck}</Text>
                <Text style={[styles.listHighlight, { color: T.teal }]}>{r.rate} ({r.avail})</Text>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: T.teal }]} onPress={() => submitRequest('Backhaul Express: ' + r.route)}>
                  <Text style={styles.smallBtnTxt}>Lock Backhaul Truck</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'warehouse' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>5. Warehouse & Cold Storage Booking</Text>
            <View style={styles.chipRow}>
              {['Ambient Agro Godown', 'Cold Storage (-18°C to +4°C)', 'Customs Bonded Warehouse'].map((w) => (
                <TouchableOpacity
                  key={w}
                  onPress={() => setWhType(w)}
                  style={[
                    styles.chip,
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    whType === w && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: whType === w ? '#FFF' : T.text, fontSize: 12, fontWeight: '600' }}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.label, { color: T.subText }]}>City / Near Port Location</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={origin} onChangeText={setOrigin} />
            <Text style={[styles.label, { color: T.subText }]}>Required Capacity (MT / Sq.Ft)</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={weight} onChangeText={setWeight} />
            <Text style={[styles.label, { color: T.subText }]}>Storage Duration</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={whDays} onChangeText={setWhDays} />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: T.gold }]} onPress={() => submitRequest('Warehouse Booking: ' + whType)}>
              <Text style={styles.primaryBtnTxt}>Book Storage Slot</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'cha' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>6. CHA & Customs Clearance Desk</Text>
            <View style={styles.chipRow}>
              {['JNPT (Nhava Sheva)', 'Mundra Port', 'Kandla Port', 'Vizag / Chennai', 'Raipur / Nagpur ICD'].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPortName(p)}
                  style={[
                    styles.chip,
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    portName === p && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: portName === p ? '#FFF' : T.text, fontSize: 12, fontWeight: '600' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.label, { color: T.subText }]}>Shipment Type (Export / Import)</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={cargo} onChangeText={setCargo} />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: T.gold }]} onPress={() => submitRequest('CHA Clearance at ' + portName)}>
              <Text style={styles.primaryBtnTxt}>Connect Verified CHA</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.footer, { color: T.subText }]}>Powered by Apex Sync Technologies</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: '#C9B89A', fontSize: 11, marginTop: 2 },
  tabBar: { maxHeight: 52, borderBottomWidth: 1 },
  tabBarContent: { paddingHorizontal: 12, alignItems: 'center' },
  tabPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  body: { flex: 1 },
  bodyContent: { padding: 14, paddingBottom: 36 },
  card: { borderRadius: 14, padding: 15, borderWidth: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '600', marginBottom: 4, marginTop: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1, marginRight: 6, marginBottom: 6 },
  primaryBtn: { marginTop: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryBtnTxt: { color: '#0B0D12', fontSize: 13, fontWeight: '800' },
  listCard: { borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 10 },
  listHead: { fontSize: 14, fontWeight: '700' },
  listSub: { fontSize: 12, marginTop: 2 },
  listHighlight: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  smallBtn: { marginTop: 8, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  smallBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 11, marginTop: 20 },
});
          
