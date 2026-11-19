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
} from 'react-native';

const TABS = [
  { id: 'rates', label: '1. Freight Rates', live: true },
  { id: 'truck', label: '2. Book Truck', live: true },
  { id: 'space', label: '3. Spare Space', live: true },
  { id: 'return', label: '4. Return Load', live: true },
  { id: 'warehouse', label: '5. Warehouse', live: true },
  { id: 'cha', label: '6. CHA Desk', live: true },
  { id: 'tracking', label: '7. Live Vessel', live: false },
  { id: 'port', label: '8. Port Schedule', live: false },
];

const SAMPLE_RETURN_LOADS = [
  {
    id: 'RL-101',
    route: 'JNPT (Nhava Sheva) -> Raipur',
    truck: '32ft Multi-Axle (25 MT)',
    rate: 'INR 46,000 Flat',
    avail: 'Ready Today',
  },
  {
    id: 'RL-102',
    route: 'Mundra Port -> Indore / Bhopal',
    truck: '40ft High Bed Trailer (30 MT)',
    rate: 'INR 54,500 Flat',
    avail: 'Tomorrow Morning',
  },
  {
    id: 'RL-103',
    route: 'Katni -> Raipur / Bilaspur',
    truck: '12-Tyre Taurus (21 MT)',
    rate: 'INR 1,450 / MT',
    avail: 'Available Now',
  },
];

const SAMPLE_SPARE_SPACE = [
  {
    id: 'SP-201',
    corridor: 'JNPT -> Jebel Ali (Dubai)',
    type: '40ft HC Spare LCL Space',
    space: '18 CBM / 8 MT Open',
    cutoff: 'Cut-off: 48 Hrs',
  },
  {
    id: 'SP-202',
    corridor: 'Mundra -> Dakar / Banjul',
    type: '20ft FCL Consolidator',
    space: '11 CBM / 6.5 MT Open',
    cutoff: 'Cut-off: 3 Days',
  },
];

export default function LogisticsHubScreen() {
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

  const submitRequest = async (moduleTitle) => {
    const summary = [
      'TRADE SETUU — LOGISTICS DESK',
      'Service: ' + moduleTitle,
      'Route / Location: ' + origin + ' -> ' + dest,
      'Cargo: ' + cargo + ' (' + weight + ')',
      'Spec: ' + vehicle,
      contact ? 'Contact: ' + contact : '',
      'Powered by Apex Sync Technologies',
    ]
      .filter(Boolean)
      .join('\n');

    Alert.alert(
      'Logistics Request Logged',
      'Aapki ' +
        moduleTitle +
        ' inquiry register ho gayi hai. Kya aap ise WhatsApp par share karna chahte hain?',
      [
        { text: 'OK', style: 'cancel' },
        {
          text: 'Share Quote',
          onPress: () => Share.share({ message: summary }),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GLOBAL LOGISTICS HUB</Text>
        <Text style={styles.subtitle}>
          Road Freight • Container Space • Return Load • Warehouse
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
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
                active && styles.tabPillActive,
                !t.live && styles.tabPillSoon,
              ]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t.label}
                {!t.live ? ' (Soon)' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
      >
        {/* 1. FREIGHT RATE SEARCH */}
        {activeTab === 'rates' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              1. Instant Freight Rate Search
            </Text>
            <Text style={styles.label}>Origin City / ICD / Factory</Text>
            <TextInput
              style={styles.input}
              value={origin}
              onChangeText={setOrigin}
              placeholderTextColor="#64748B"
            />
            <Text style={styles.label}>Destination Port / City</Text>
            <TextInput
              style={styles.input}
              value={dest}
              onChangeText={setDest}
              placeholderTextColor="#64748B"
            />
            <Text style={styles.label}>Commodity & Packaging</Text>
            <TextInput
              style={styles.input}
              value={cargo}
              onChangeText={setCargo}
              placeholderTextColor="#64748B"
            />
            <Text style={styles.label}>Total Load / Container</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholderTextColor="#64748B"
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => submitRequest('Freight Rate Quote')}
            >
              <Text style={styles.primaryBtnTxt}>Get Best Freight Rate</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. BOOK A TRUCK */}
        {activeTab === 'truck' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Book Commercial Truck</Text>
            <View style={styles.chipRow}>
              {[
                '10-Tyre (16 MT)',
                '12-Tyre Taurus (21 MT)',
                '32ft MXL (25 MT)',
                '40ft Trailer (30 MT)',
              ].map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setVehicle(v)}
                  style={[styles.chip, vehicle === v && styles.chipActive]}
                >
                  <Text style={styles.chipTxt}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Loading Point</Text>
            <TextInput
              style={styles.input}
              value={origin}
              onChangeText={setOrigin}
            />
            <Text style={styles.label}>Unloading Point</Text>
            <TextInput
              style={styles.input}
              value={dest}
              onChangeText={setDest}
            />
            <Text style={styles.label}>Mobile / WhatsApp Number</Text>
            <TextInput
              style={styles.input}
              value={contact}
              onChangeText={setContact}
              keyboardType="phone-pad"
              placeholder="+91..."
              placeholderTextColor="#64748B"
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                submitRequest('Truck Placement (' + vehicle + ')')
              }
            >
              <Text style={styles.primaryBtnTxt}>Confirm Truck Request</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. SPARE CONTAINER SPACE (LCL / FCL) */}
        {activeTab === 'space' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              3. LCL / FCL Spare Container Space
            </Text>
            {SAMPLE_SPARE_SPACE.map((s) => (
              <View key={s.id} style={styles.listCard}>
                <Text style={styles.listHead}>{s.corridor}</Text>
                <Text style={styles.listSub}>{s.type}</Text>
                <Text style={styles.listHighlight}>
                  {s.space} • {s.cutoff}
                </Text>
                <TouchableOpacity
                  style={styles.smallBtn}
                  onPress={() =>
                    submitRequest('Spare Container Space: ' + s.corridor)
                  }
                >
                  <Text style={styles.smallBtnTxt}>Book This Spare Space</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 4. RETURN LOAD / EMPTY TRUCK BACKHAUL */}
        {activeTab === 'return' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              4. Live Return Load & Empty Trucks
            </Text>
            {SAMPLE_RETURN_LOADS.map((r) => (
              <View key={r.id} style={styles.listCard}>
                <Text style={styles.listHead}>{r.route}</Text>
                <Text style={styles.listSub}>{r.truck}</Text>
                <Text style={styles.listHighlight}>
                  {r.rate} ({r.avail})
                </Text>
                <TouchableOpacity
                  style={styles.smallBtn}
                  onPress={() =>
                    submitRequest('Return Load Booking: ' + r.route)
                  }
                >
                  <Text style={styles.smallBtnTxt}>Lock Return Vehicle</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 5. WAREHOUSE & COLD STORAGE LIVE BOOKING */}
        {activeTab === 'warehouse' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              5. Warehouse & Cold Storage Booking
            </Text>
            <View style={styles.chipRow}>
              {[
                'Ambient Agro Godown',
                'Cold Storage (-18°C to +4°C)',
                'Customs Bonded Warehouse',
              ].map((w) => (
                <TouchableOpacity
                  key={w}
                  onPress={() => setWhType(w)}
                  style={[styles.chip, whType === w && styles.chipActive]}
                >
                  <Text style={styles.chipTxt}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>City / Near Port Location</Text>
            <TextInput
              style={styles.input}
              value={origin}
              onChangeText={setOrigin}
            />
            <Text style={styles.label}>Required Capacity (MT / Sq.Ft)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
            />
            <Text style={styles.label}>Storage Duration</Text>
            <TextInput
              style={styles.input}
              value={whDays}
              onChangeText={setWhDays}
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                submitRequest(
                  'Warehouse Booking: ' + whType + ' (' + whDays + ')'
                )
              }
            >
              <Text style={styles.primaryBtnTxt}>Book Storage Slot</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 6. CHA & CUSTOMS CLEARANCE DESK */}
        {activeTab === 'cha' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              6. CHA & Customs Clearance Desk
            </Text>
            <View style={styles.chipRow}>
              {[
                'JNPT (Nhava Sheva)',
                'Mundra Port',
                'Kandla Port',
                'Vizag / Chennai',
                'Raipur / Nagpur ICD',
              ].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPortName(p)}
                  style={[styles.chip, portName === p && styles.chipActive]}
                >
                  <Text style={styles.chipTxt}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Shipment Type (Export / Import)</Text>
            <TextInput
              style={styles.input}
              value={cargo}
              onChangeText={setCargo}
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => submitRequest('CHA Clearance at ' + portName)}
            >
              <Text style={styles.primaryBtnTxt}>Connect Verified CHA</Text>
            </TouchableOpacity>
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
  tabPillSoon: { opacity: 0.65, borderColor: '#374151' },
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
  label: {
    color: '#8A8F98',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
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
    marginBottom: 8,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#1A202C',
    borderWidth: 1,
    borderColor: '#2D3748',
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: '#0D9488', borderColor: '#14B8A6' },
  chipTxt: { color: '#D9DDE3', fontSize: 12, fontWeight: '600' },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: '#C9B89A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnTxt: { color: '#0B0D12', fontSize: 13, fontWeight: '800' },
  listCard: {
    backgroundColor: '#0B0D12',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 10,
  },
  listHead: { color: '#D9DDE3', fontSize: 14, fontWeight: '700' },
  listSub: { color: '#8A8F98', fontSize: 12, marginTop: 2 },
  listHighlight: {
    color: '#14B8A6',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  smallBtn: {
    marginTop: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  footer: {
    textAlign: 'center',
    color: '#8A8F98',
    fontSize: 11,
    marginTop: 20,
  },
});
