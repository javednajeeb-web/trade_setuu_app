import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Linking,
} from 'react-native';

const LIVE_TILES = [
  { id: 'logistics', icon: '🌐', title: 'Global Logistics Hub', sub: 'Freight & Share', badge: 'Live' },
  { id: 'docforge', icon: '📄', title: 'Setuu DocForge', sub: 'PI, PL & COO', badge: 'Live' },
  { id: 'rescue', icon: '🚨', title: 'Port Rescue', sub: 'Distress Cargo', badge: 'Live' },
  { id: 'shipping', icon: '🚢', title: 'Shipping & Freight', sub: 'Sea & Air Quotes', badge: 'Live' },
  { id: 'cha', icon: '🛃', title: 'CHA & Customs', sub: 'Clearance Agents', badge: 'Live' },
  { id: 'iec', icon: '📜', title: 'IEC & Compliance', sub: 'DGFT / APEDA', badge: 'Live' },
  { id: 'packaging', icon: '📦', title: 'Packaging & Print', sub: 'Export Bags/Boxes', badge: 'Live' },
  { id: 'eway', icon: '🚛', title: 'E-Way & Domestic', sub: 'Inland Trucking', badge: 'Live' },
  { id: 'contact', icon: '🎧', title: 'Contact Us', sub: '24x7 Trade Desk', badge: 'Live' },
];

const COMING_SOON_TILES = [
  { id: 'cs1', icon: '🏦', title: 'Trade Finance & LC', sub: 'Bank LC / Discounting' },
  { id: 'cs2', icon: '🛡️', title: 'Marine Insurance', sub: 'All-Risk Cargo Cover' },
  { id: 'cs3', icon: '🔬', title: 'SGS / Quality Lab', sub: 'Pre-Shipment Testing' },
  { id: 'cs4', icon: '📡', title: 'Live Container GPS', sub: 'AIS Vessel Tracking' },
  { id: 'cs5', icon: '🤝', title: 'Escrow PayVault', sub: 'Milestone Settlement' },
  { id: 'cs6', icon: '🏭', title: 'Bonded Warehouses', sub: 'Port Storage Slots' },
];

const RESCUE_CARGO = [
  {
    id: 'r1',
    title: 'IR-64 Parboiled Rice • 2x20ft (52 MT)',
    port: 'JNPT / Nhava Sheva (Stranded Export)',
    offer: 'USD 335 / MT (28% OFF Market)',
    masked: 'Shree B•••••• Exports | +91 98261 •••10',
    supplier: 'Shree Balaji Agro Exports Pvt. Ltd.',
    phone: '+919826144210',
  },
  {
    id: 'r2',
    title: 'Yellow Maize Feed Grade • 3x20ft (78 MT)',
    port: 'Mundra Port CFS (LC Cancelled)',
    offer: 'USD 204 / MT (24% OFF Market)',
    masked: 'Narmada O•••••• Comm. | +91 94252 •••34',
    supplier: 'Narmada Overseas Commodities',
    phone: '+919425219834',
  },
];

export default function ServiceHubScreen({
  theme = 'dark',
  lang = 'en',
  isPaid = false,
  vaultBalance = 500,
  onDeductVault,
  onOpenLogistics,
  onOpenSub,
}) {
  const isDark = theme === 'dark';
  const T = {
    bg: isDark ? '#0B0D12' : '#EFF2F6',
    card: isDark ? '#131924' : '#FAFBFD',
    border: isDark ? '#1E293B' : '#D5DCE6',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#5B677A',
    input: isDark ? '#0D131D' : '#E9EEF5',
    accent: '#0D9488',
    gold: '#C9B89A',
  };

  const [activeServiceModal, setActiveServiceModal] = useState(null);
  const [unlockedRescue, setUnlockedRescue] = useState([]);

  // 5 Distinct Service Form States
  const [f1, setF1] = useState('JNPT Nhava Sheva -> Jebel Ali');
  const [f2, setF2] = useState('20ft Dry Container • 26 MT');
  const [f3, setF3] = useState('Parboiled Rice / Agro Commodity');
  const [f4, setF4] = useState('Within 7 Days');

  const handleTilePress = (id) => {
    if (id === 'logistics') {
      if (onOpenLogistics) onOpenLogistics();
      return;
    }
    if (id === 'shipping') {
      setF1('JNPT Nhava Sheva -> Jebel Ali');
      setF2('20ft Dry Container • 26 MT');
      setF3('Parboiled Rice / Agro');
      setF4('Within 7 Days');
    } else if (id === 'cha') {
      setF1('Export Customs Clearance');
      setF2('Mundra / JNPT / Vizag Port');
      setF3('HS Code: 10063010 (Rice)');
      setF4('Invoice, Packing List & AD Code Ready');
    } else if (id === 'iec') {
      setF1('APEDA / FIEO RCMC Registration');
      setF2('New IEC / Bank AD Code / LUT');
      setF3('Proprietorship / LLP / Pvt Ltd');
      setF4('Raipur, Chhattisgarh');
    } else if (id === 'packaging') {
      setF1('50 Kg PP Woven / 30 Kg BOPP Bag');
      setF2('Multicolor Rotogravure Export Print');
      setF3('MOQ: 10,000 Bags');
      setF4('Delivery at Factory / Port');
    } else if (id === 'eway') {
      setF1('16-Wheeler (30 MT) / 18-Wheeler (35 MT)');
      setF2('Raipur -> Vizag / JNPT Port');
      setF3('E-Way Bill + Transit Insurance');
      setF4('Loading Tomorrow');
    } else if (id === 'docforge') {
      setF1('Proforma Invoice (PI) & Packing List');
      setF2('Buyer: Gulf Foodstuff Trading LLC, Dubai');
      setF3('52 MT Parboiled Rice @ USD 465/MT');
      setF4('FOB JNPT • LC / 30% Advance');
    }
    setActiveServiceModal(id);
  };

  const handleUnlock499 = (item) => {
    Alert.alert(
      'Unlock Supplier Contact — ₹499 Only',
      `${item.title}\n${item.port}\n\nOne-time fee ₹499 to unlock direct supplier phone & WhatsApp.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Pay ₹499 (Vault: ₹${vaultBalance})`,
          onPress: () => {
            if (vaultBalance >= 499 && onDeductVault) {
              onDeductVault(499, `Port Rescue Unlock: ${item.title}`);
            }
            setUnlockedRescue([...unlockedRescue, item.id]);
            Alert.alert('Unlocked ✓', `${item.supplier}\nPhone: ${item.phone}`);
          },
        },
        {
          text: 'Direct ₹499 Unlock',
          onPress: () => {
            setUnlockedRescue([...unlockedRescue, item.id]);
            Alert.alert('Unlocked ✓', `${item.supplier}\nPhone: ${item.phone}`);
          },
        },
      ]
    );
  };
  const renderFormLabels = () => {
    switch (activeServiceModal) {
      case 'shipping':
        return ['Port of Loading -> Discharge', 'Container Size & Load', 'Commodity Name', 'Target Sailing Window'];
      case 'cha':
        return ['Clearance Mode (Export/Import)', 'Custom Port / ICD Location', 'HS Code & Cargo Details', 'Document Readiness'];
      case 'iec':
        return ['Primary License (IEC / RCMC)', 'Additional Compliance (LUT / AD Code)', 'Business Constitution', 'Registered City & State'];
      case 'packaging':
        return ['Bag / Box Specification', 'Printing & Lamination Type', 'Order Quantity', 'Delivery Location'];
      case 'eway':
        return ['Truck / Trailer Capacity', 'Loading -> Unloading Route', 'E-Way Bill & Insurance', 'Dispatch Schedule'];
      case 'docforge':
        return ['Document Type (PI / PL / COO)', 'Consignee / Importer Name', 'Commodity, Qty & Rate', 'Incoterm & Payment Terms'];
      default:
        return ['Field 1', 'Field 2', 'Field 3', 'Field 4'];
    }
  };

  const labels = renderFormLabels();

  return (
    <ScrollView style={[styles.container, { backgroundColor: T.bg }]} contentContainerStyle={{ padding: 14, paddingBottom: 80 }}>
      <Text style={[styles.mainHead, { color: T.text }]}>SERVICE HUB</Text>
      <Text style={[styles.subHead, { color: T.sub }]}>End-to-End Export, Logistics & Compliance Desk</Text>

      <View style={styles.grid}>
        {LIVE_TILES.map((tile) => (
          <TouchableOpacity
            key={tile.id}
            onPress={() => handleTilePress(tile.id)}
            style={[styles.tile, { backgroundColor: T.card, borderColor: T.border }]}
          >
            <View style={styles.liveBadge}><Text style={styles.liveTxt}>{tile.badge}</Text></View>
            <Text style={{ fontSize: 22, marginTop: 4 }}>{tile.icon}</Text>
            <Text style={[styles.tileTitle, { color: T.text }]} numberOfLines={2}>{tile.title}</Text>
            <Text style={[styles.tileSub, { color: T.sub }]} numberOfLines={1}>{tile.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isPaid && (
        <View style={{ marginTop: 14 }}>
          <Text style={{ color: T.gold, fontSize: 12, fontWeight: '900', marginBottom: 8 }}>
            ⭐ PAID SUBSCRIBER EXCLUSIVE & COMING SOON MODULES
          </Text>
          <View style={styles.grid}>
            {COMING_SOON_TILES.map((tile) => (
              <TouchableOpacity
                key={tile.id}
                onPress={() => Alert.alert(tile.title, 'Rolling out exclusively for Paid Subscription Members.')}
                style={[styles.tile, { backgroundColor: T.card, borderColor: T.gold }]}
              >
                <View style={styles.soonBadge}><Text style={styles.soonTxt}>Soon</Text></View>
                <Text style={{ fontSize: 20, marginTop: 4 }}>{tile.icon}</Text>
                <Text style={[styles.tileTitle, { color: T.text }]} numberOfLines={2}>{tile.title}</Text>
                <Text style={[styles.tileSub, { color: T.sub }]} numberOfLines={1}>{tile.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <Modal visible={!!activeServiceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {activeServiceModal === 'rescue' ? (
              <View>
                <Text style={{ color: '#C9B89A', fontSize: 11, fontWeight: '800' }}>PORT RESCUE • DISTRESS CARGO DEALS</Text>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', marginVertical: 6 }}>Unlock Direct Supplier for ₹499 Only</Text>
                {RESCUE_CARGO.map((item) => {
                  const open = unlockedRescue.includes(item.id);
                  return (
                    <View key={item.id} style={styles.rescueCard}>
                      <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>{item.title}</Text>
                      <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 2 }}>📍 {item.port}</Text>
                      <Text style={{ color: '#14B8A6', fontSize: 12, fontWeight: '900', marginTop: 4 }}>{item.offer}</Text>
                      {open ? (
                        <View style={{ marginTop: 8 }}>
                          <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>✓ {item.supplier} ({item.phone})</Text>
                          <TouchableOpacity
                            style={styles.waBtn}
                            onPress={() => Linking.openURL(`https://wa.me/${item.phone.replace('+', '')}?text=${encodeURIComponent('Interested in Port Rescue: ' + item.title)}`)}
                          >
                            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>💬 WhatsApp Supplier</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={{ marginTop: 8 }}>
                          <Text style={{ color: '#94A3B8', fontSize: 11 }}>🔒 {item.masked}</Text>
                          <TouchableOpacity style={styles.unlockBtn} onPress={() => handleUnlock499(item)}>
                            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>🔓 Unlock Contact — ₹499 Only</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : activeServiceModal === 'contact' ? (
              <View>
                <Text style={{ color: '#C9B89A', fontSize: 11, fontWeight: '800' }}>TRADE SETUU SUPPORT DESK</Text>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', marginVertical: 6 }}>24x7 Exim & Logistics Concierge</Text>
                <Text style={{ color: '#CBD5E1', fontSize: 12, marginBottom: 12 }}>
                  Operated by Apex Sync Technologies • Raipur, Chhattisgarh
                </Text>
                <TouchableOpacity style={styles.waBtn} onPress={() => Linking.openURL('https://wa.me/919826100000?text=Hello%20Trade%20SETUU%20Support')}>
                  <Text style={{ color: '#FFF', fontWeight: '900' }}>💬 Connect on WhatsApp Desk</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>
                  {LIVE_TILES.find((t) => t.id === activeServiceModal)?.title.toUpperCase()}
                </Text>
                <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '900', marginVertical: 6 }}>
                  {activeServiceModal === 'docforge' ? 'Generate Export Document Draft' : 'Submit Verified Service Request'}
                </Text>
                <Text style={styles.mLbl}>{labels[0]}</Text>
                <TextInput style={styles.mInp} value={f1} onChangeText={setF1} />
                <Text style={styles.mLbl}>{labels[1]}</Text>
                <TextInput style={styles.mInp} value={f2} onChangeText={setF2} />
                <Text style={styles.mLbl}>{labels[2]}</Text>
                <TextInput style={styles.mInp} value={f3} onChangeText={setF3} />
                <Text style={styles.mLbl}>{labels[3]}</Text>
                <TextInput style={styles.mInp} value={f4} onChangeText={setF4} />
                <TouchableOpacity
                  style={styles.unlockBtn}
                  onPress={() => {
                    const title = LIVE_TILES.find((t) => t.id === activeServiceModal)?.title;
                    setActiveServiceModal(null);
                    Alert.alert(
                      activeServiceModal === 'docforge' ? 'Document Draft Generated ✓' : 'Request Submitted ✓',
                      `${title}\n• ${f1}\n• ${f2}\n• ${f3}`
                    );
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>
                    {activeServiceModal === 'docforge' ? 'Generate & Preview Document' : 'Send to Verified Partners'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setActiveServiceModal(null)}>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainHead: { fontSize: 18, fontWeight: '900' },
  subHead: { fontSize: 12, marginTop: 2, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { width: '31.5%', borderRadius: 14, borderWidth: 1, padding: 10, marginBottom: 10, alignItems: 'center', position: 'relative' },
  liveBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#064E3B', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 },
  liveTxt: { color: '#34D399', fontSize: 8, fontWeight: '900' },
  soonBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#3B2F1E', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 },
  soonTxt: { color: '#C9B89A', fontSize: 8, fontWeight: '900' },
  tileTitle: { fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  tileSub: { fontSize: 9, textAlign: 'center', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#0D1B2A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C9B89A' },
  rescueCard: { backgroundColor: '#132235', borderRadius: 12, padding: 11, marginBottom: 10, borderWidth: 1, borderColor: '#1E3A5F' },
  unlockBtn: { backgroundColor: '#0D9488', borderRadius: 9, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
  waBtn: { backgroundColor: '#16A34A', borderRadius: 9, paddingVertical: 9, alignItems: 'center', marginTop: 6 },
  mLbl: { color: '#94A3B8', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  mInp: { backgroundColor: '#131924', color: '#FFF', borderWidth: 1, borderColor: '#1E293B', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, marginBottom: 9 },
});
