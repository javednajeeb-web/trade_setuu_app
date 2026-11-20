import React, { useState, useEffect } from 'react';
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

const RESCUE_DEALS = [
  {
    id: 'pr-1',
    title: 'IR 64 Parboiled Rice • 2x20ft (52 MT)',
    port: 'JNPT / Nhava Sheva (Stranded Export)',
    urgency: 'Demurrage starts in 36 hrs • 28% OFF',
    marketPrice: 'USD 465 / MT',
    rescuePrice: 'USD 335 / MT (₹31,035/MT)',
    supplier: 'Shree Balaji Agro Exports Pvt. Ltd.',
    phone: '+919826144210',
    masked: 'Shree B•••••• Exports | +91 98261 •••10',
  },
  {
    id: 'pr-2',
    title: 'Yellow Maize Feed Grade • 3x20ft (78 MT)',
    port: 'Mundra Port CFS (Buyer LC Cancelled)',
    urgency: 'Immediate Gate-Out • 24% OFF',
    marketPrice: 'USD 268 / MT',
    rescuePrice: 'USD 204 / MT (₹18,900/MT)',
    supplier: 'Narmada Overseas Commodities',
    phone: '+919425219834',
    masked: 'Narmada O•••••• Comm. | +91 94252 •••34',
  },
  {
    id: 'pr-3',
    title: '1121 Golden Sella Basmati • 1x40ft (27 MT)',
    port: 'Jebel Ali Port (Distress Resale)',
    urgency: 'Ready BL Transfer • 22% OFF',
    marketPrice: 'USD 980 / MT',
    rescuePrice: 'USD 765 / MT (₹70,875/MT)',
    supplier: 'Kingdom Grain & Spice Trading',
    phone: '+919811077520',
    masked: 'Kingdom G•••••• Trading | +91 98110 •••20',
  },
];

const INITIAL_BACKHAULS = [
  { id: 'bh-1', truck: '18-Wheeler (35 MT)', route: 'Katni -> Raipur', rate: '₹1,450 / MT • Empty Return Today', phone: '+919827155410' },
  { id: 'bh-2', truck: '22-Wheeler (42 MT)', route: 'Vizag Port -> Raipur', rate: '₹2,150 / MT • Ready at Gate', phone: '+919425511890' },
  { id: 'bh-3', truck: '16-Wheeler (30 MT)', route: 'Raipur -> JNPT Mumbai', rate: '₹3,400 / MT • Dry Container / Open', phone: '+919826099321' },
];

const CONTAINER_SHARE_LIST = [
  { id: 'cs-1', route: 'JNPT -> Jebel Ali', space: '10 CBM / 8 MT Available', vessel: 'MSC Diana • Sailing in 4 Days', rate: 'USD 42 / CBM' },
  { id: 'cs-2', route: 'Mundra -> Rotterdam', space: '14 CBM / 11 MT Available', vessel: 'Maersk Sentosa • Sailing in 6 Days', rate: 'USD 68 / CBM' },
  { id: 'cs-3', route: 'Vizag -> Singapore / Port Klang', space: '8 CBM / 6.5 MT Available', vessel: 'CMA CGM Titus • Sailing in 3 Days', rate: 'USD 38 / CBM' },
];

export default function LogisticsHubScreen({
  theme = 'dark',
  lang = 'en',
  initialTab = 'rescue',
  walletBalance = 0,
  onDeductWallet,
}) {
  const isDark = theme === 'dark';
  const T = {
    bg: isDark ? '#0B0D12' : '#F2F4F8',
    card: isDark ? '#131924' : '#FAFBFD',
    border: isDark ? '#1E293B' : '#DCE2EC',
    text: isDark ? '#F1F5F9' : '#1E293B',
    subText: isDark ? '#94A3B8' : '#64748B',
    inputBg: isDark ? '#0F1520' : '#EEF2F7',
    accent: '#0D9488',
  };

  const [activeTab, setActiveTab] = useState(initialTab || 'rescue');
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [unlockModalDeal, setUnlockModalDeal] = useState(null);

  const [backhauls, setBackhauls] = useState(INITIAL_BACKHAULS);
  const [vehicle, setVehicle] = useState('16-Wheeler');
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [capacity, setCapacity] = useState('30 MT');
  const [driverPhone, setDriverPhone] = useState('');
  const [bookedIds, setBookedIds] = useState([]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleConfirmUnlock = (useWallet) => {
    if (!unlockModalDeal) return;
    if (useWallet) {
      if (walletBalance < 499) {
        Alert.alert(
          lang === 'hi' ? 'वॉलेट बैलेंस कम है' : 'Insufficient Setuu Wallet Balance',
          lang === 'hi' ? 'कृपया Setuu Wallet में ₹499 जोड़ें या डायरेक्ट ₹499 से अनलॉक करें।' : 'Please add ₹499 to Setuu Wallet or use Direct ₹499 Unlock.'
        );
        return;
      }
      if (onDeductWallet) onDeductWallet(499, `Port Rescue Unlock: ${unlockModalDeal.title}`);
    }
    setUnlockedIds([...unlockedIds, unlockModalDeal.id]);
    const doneTitle = unlockModalDeal.title;
    setUnlockModalDeal(null);
    Alert.alert(
      lang === 'hi' ? 'कॉन्टैक्ट अनलॉक हो गया ✓' : 'Contact Unlocked ✓',
      `${doneTitle}\n${lang === 'hi' ? 'अब आप सप्लायर को सीधे कॉल या WhatsApp कर सकते हैं।' : 'You can now call or WhatsApp the supplier directly.'}`
    );
  };

  const handlePostBackhaul = () => {
    if (!origin.trim() || !dest.trim()) {
      Alert.alert('Missing Route', 'Please enter both Loading Point and Unloading Point.');
      return;
    }
    const item = {
      id: String(Date.now()),
      truck: `${vehicle} (${capacity})`,
      route: `${origin.trim()} -> ${dest.trim()}`,
      rate: 'Empty Return Available Now',
      phone: driverPhone.trim() || '+919826100000',
    };
    setBackhauls([item, ...backhauls]);
    setOrigin('');
    setDest('');
    setDriverPhone('');
    Alert.alert(lang === 'hi' ? 'ट्रक लाइव हो गया ✓' : 'Return Truck Posted ✓', item.route);
  };
             return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <View style={styles.tabRow}>
        {[
          { id: 'rescue', label: lang === 'hi' ? '🚨 पोर्ट रेस्क्यू' : '🚨 Port Rescue' },
          { id: 'backhaul', label: lang === 'hi' ? '🚛 बैकहोल ट्रक' : '🚛 Backhaul' },
          { id: 'space', label: lang === 'hi' ? '📦 कंटेनर शेयर' : '📦 Container Share' },
        ].map((t) => {
          const active = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              style={[styles.tabBtn, { backgroundColor: active ? '#0D1B2A' : T.card, borderColor: active ? '#14B8A6' : T.border }]}
            >
              <Text style={{ color: active ? '#14B8A6' : T.text, fontSize: 11, fontWeight: '800' }}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        {activeTab === 'rescue' && (
          <View>
            <View style={[styles.banner, { backgroundColor: '#0D1B2A', borderColor: '#C9B89A' }]}>
              <Text style={{ color: '#C9B89A', fontSize: 12, fontWeight: '800' }}>
                {lang === 'hi' ? '⚡ डिस्ट्रेस पोर्ट कार्गो — ₹499 में डायरेक्ट सप्लायर कॉन्टैक्ट खोलें' : '⚡ Stranded Port Cargo — Unlock Direct Supplier Contact for ₹499 Only'}
              </Text>
            </View>

            {RESCUE_DEALS.map((deal) => {
              const isUnlocked = unlockedIds.includes(deal.id);
              return (
                <View key={deal.id} style={[styles.card, { backgroundColor: T.card, borderColor: isUnlocked ? '#14B8A6' : T.border }]}>
                  <Text style={styles.urgencyBadge}>{deal.urgency}</Text>
                  <Text style={[styles.cardTitle, { color: T.text }]}>{deal.title}</Text>
                  <Text style={[styles.listSub, { color: T.subText }]}>📍 {deal.port}</Text>
                  <Text style={[styles.listSub, { color: T.subText }]}>Market Rate: {deal.marketPrice}</Text>
                  <Text style={styles.listHighlight}>Rescue Deal: {deal.rescuePrice}</Text>

                  {isUnlocked ? (
                    <View style={styles.unlockedBox}>
                      <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>✓ UNLOCKED SUPPLIER DETAILS</Text>
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginTop: 3 }}>{deal.supplier}</Text>
                      <Text style={{ color: '#CBD5E1', fontSize: 12, marginTop: 2 }}>📞 {deal.phone}</Text>
                      <View style={{ flexDirection: 'row', marginTop: 8 }}>
                        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${deal.phone}`)}>
                          <Text style={styles.smallBtnTxt}>📞 Call Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.waBtn}
                          onPress={() => Linking.openURL(`https://wa.me/${deal.phone.replace('+', '')}?text=${encodeURIComponent('Hi, interested in Port Rescue deal: ' + deal.title)}`)}
                        >
                          <Text style={styles.smallBtnTxt}>💬 WhatsApp</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.lockedBox, { backgroundColor: T.inputBg, borderColor: T.border }]}>
                      <Text style={{ color: T.subText, fontSize: 12, fontWeight: '700' }}>🔒 {deal.masked}</Text>
                      <TouchableOpacity style={styles.unlockBtn} onPress={() => setUnlockModalDeal(deal)}>
                        <Text style={styles.unlockBtnTxt}>
                          {lang === 'hi' ? '🔓 कॉन्टैक्ट अनलॉक करें — ₹499 बस' : '🔓 Unlock Contact — ₹499 Only'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'backhaul' && (
          <View>
            <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[styles.cardTitle, { color: T.text }]}>{lang === 'hi' ? 'खाली रिटर्न ट्रक पोस्ट करें' : 'Post Empty Return Truck'}</Text>
              <View style={styles.chipRow}>
                {['16-Wheeler', '18-Wheeler', '22-Wheeler', 'Trailer'].map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setVehicle(v)}
                    style={[styles.chip, { backgroundColor: vehicle === v ? T.accent : T.inputBg, borderColor: T.border }]}
                  >
                    <Text style={{ color: vehicle === v ? '#FFF' : T.text, fontSize: 11, fontWeight: '700' }}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.label, { color: T.subText }]}>Loading Point / Origin</Text>
              <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={origin} onChangeText={setOrigin} placeholder="e.g. Katni / Vizag" placeholderTextColor={T.subText} />
              <Text style={[styles.label, { color: T.subText }]}>Unloading Point</Text>
              <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={dest} onChangeText={setDest} placeholder="e.g. Raipur / JNPT" placeholderTextColor={T.subText} />
              <Text style={[styles.label, { color: T.subText }]}>Mobile / WhatsApp Number</Text>
              <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={driverPhone} onChangeText={setDriverPhone} placeholder="+91 98XXXXXXXX" placeholderTextColor={T.subText} keyboardType="phone-pad" />
              <TouchableOpacity style={styles.primaryBtn} onPress={handlePostBackhaul}>
                <Text style={styles.primaryBtnTxt}>{lang === 'hi' ? 'रिटर्न ट्रक लाइव करें' : 'Confirm & Post Return Truck'}</Text>
              </TouchableOpacity>
            </View>

            {backhauls.map((b) => (
              <View key={b.id} style={[styles.listCard, { backgroundColor: T.card, borderColor: T.border }]}>
                <Text style={[styles.listHead, { color: T.text }]}>{b.route} • {b.truck}</Text>
                <Text style={[styles.listSub, { color: T.subText }]}>{b.rate}</Text>
                <TouchableOpacity style={styles.smallBtn} onPress={() => Linking.openURL(`tel:${b.phone}`)}>
                  <Text style={styles.smallBtnTxt}>📞 Call Fleet ({b.phone})</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'space' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cardTitle, { color: T.text }]}>{lang === 'hi' ? 'उपलब्ध LCL कंटेनर स्पेस' : 'Available Shared Container Space'}</Text>
            {CONTAINER_SHARE_LIST.map((s) => {
              const booked = bookedIds.includes(s.id);
              return (
                <View key={s.id} style={[styles.listCard, { backgroundColor: T.inputBg, borderColor: T.border }]}>
                  <Text style={[styles.listHead, { color: T.text }]}>{s.route}</Text>
                  <Text style={[styles.listSub, { color: T.subText }]}>{s.space} • {s.vessel}</Text>
                  <Text style={styles.listHighlight}>{s.rate}</Text>
                  <TouchableOpacity
                    style={[styles.smallBtn, booked && { backgroundColor: '#1E293B' }]}
                    onPress={() => {
                      if (!booked) setBookedIds([...bookedIds, s.id]);
                      Alert.alert('Container Space Request', `Space request sent for ${s.route}`);
                    }}
                  >
                    <Text style={styles.smallBtnTxt}>{booked ? '✓ Request Sent' : 'Book LCL Space'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!unlockModalDeal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#C9B89A', fontSize: 12, fontWeight: '800' }}>PORT RESCUE INSTANT UNLOCK</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', marginTop: 6 }}>{unlockModalDeal?.title}</Text>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>{unlockModalDeal?.port}</Text>
            <View style={styles.pricePill}>
              <Text style={{ color: '#14B8A6', fontSize: 20, fontWeight: '900' }}>₹499 Only</Text>
              <Text style={{ color: '#CBD5E1', fontSize: 11 }}>One-Time Fee • Direct Supplier Mobile & WhatsApp</Text>
            </View>
            <TouchableOpacity style={styles.walletPayBtn} onPress={() => handleConfirmUnlock(true)}>
              <Text style={styles.primaryBtnTxt}>👛 Pay ₹499 from Setuu Wallet (Bal: ₹{walletBalance})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.upiPayBtn} onPress={() => handleConfirmUnlock(false)}>
              <Text style={styles.primaryBtnTxt}>⚡ Unlock Now — ₹499 Direct</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setUnlockModalDeal(null)}>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 10 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1, alignItems: 'center', marginHorizontal: 3 },
  banner: { borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  urgencyBadge: { color: '#F59E0B', fontSize: 11, fontWeight: '800', marginBottom: 4 },
  listCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  listHead: { fontSize: 14, fontWeight: '800', marginBottom: 3 },
  listSub: { fontSize: 12, marginBottom: 3 },
  listHighlight: { color: '#0D9488', fontSize: 13, fontWeight: '900', marginTop: 3 },
  lockedBox: { borderRadius: 10, borderWidth: 1, padding: 10, marginTop: 8 },
  unlockBtn: { backgroundColor: '#0D9488', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
  unlockBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  unlockedBox: { backgroundColor: '#0D1B2A', borderRadius: 10, padding: 11, marginTop: 8, borderWidth: 1, borderColor: '#14B8A6' },
  callBtn: { flex: 1, backgroundColor: '#1E293B', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginRight: 6 },
  waBtn: { flex: 1, backgroundColor: '#16A34A', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginRight: 6, marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, marginBottom: 9 },
  primaryBtn: { backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginTop: 4 },
  primaryBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  smallBtn: { backgroundColor: '#0D9488', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start', marginTop: 6 },
  smallBtnTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 18 },
  modalCard: { backgroundColor: '#0D1B2A', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#C9B89A' },
  pricePill: { backgroundColor: '#132235', borderRadius: 10, padding: 12, marginVertical: 12, alignItems: 'center' },
  walletPayBtn: { backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginBottom: 8 },
  upiPayBtn: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
});                      
    
