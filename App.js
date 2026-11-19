import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, StatusBar, Alert, Modal, RefreshControl
} from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import { supabase } from './src/lib/supabase';

const DENSITIES = [
  { name: 'Basmati / Non-Basmati Rice', factor: 0.78, max20ft: 25.0 },
  { name: 'Yellow Maize (Bulk/Bags)', factor: 0.72, max20ft: 24.0 },
  { name: 'Fresh Banana (13kg Boxes)', factor: 0.48, max20ft: 14.5 },
  { name: 'Whole Spices / Nutmeg', factor: 0.55, max20ft: 16.5 },
];

export default function App() {
  const [booting, setBooting] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [tab, setTab] = useState('feed');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [feed, setFeed] = useState([]);
  const [mandi, setMandi] = useState([]);
  const [services, setServices] = useState([]);
  const [mandiCat, setMandiCat] = useState('All');

  // New Post Modal
  const [postModal, setPostModal] = useState(false);
  const [postType, setPostType] = useState('Buy');
  const [postTitle, setPostTitle] = useState('');
  const [postPort, setPostPort] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postCompany, setPostCompany] = useState('');

  // Multi-Calculator State
  const [selectedComm, setSelectedComm] = useState(0);
  const [mtQty, setMtQty] = useState('25');
  const [inrQtl, setInrQtl] = useState('3620');
  const [usdRate, setUsdRate] = useState('84.5');
  const [freightMt, setFreightMt] = useState('45');

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loggedIn) fetchAllData();
  }, [loggedIn]);

  async function fetchAllData() {
    setLoading(true);
    try {
      const [fRes, mRes, sRes] = await Promise.all([
        supabase.from('trade_feed').select('*').order('created_at', { ascending: false }),
        supabase.from('mandi_rates').select('*').order('updated_at', { ascending: false }),
        supabase.from('services_hub').select('*'),
      ]);
      if (fRes.data) setFeed(fRes.data);
      if (mRes.data) setMandi(mRes.data);
      if (sRes.data) setServices(sRes.data);
    } catch (e) {
      Alert.alert('Network Notice', 'Could not sync live data.');
    }
    setLoading(false);
    setRefreshing(false);
  }

  async function handleCreatePost() {
    if (!postTitle || !postPort || !postPrice) {
      Alert.alert('Missing Details', 'Please fill commodity, port/route, and target price.');
      return;
    }
    const { error } = await supabase.from('trade_feed').insert([{
      post_type: postType,
      title: postTitle,
      route_port: postPort,
      price: postPrice,
      verified_by: (postCompany || 'Member Trader') + ' • Verified',
    }]);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setPostModal(false);
      setPostTitle('');
      setPostPort('');
      setPostPrice('');
      fetchAllData();
    }
  }

  if (booting) return <SplashScreen />;

  if (!loggedIn) {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
        <View style={s.loginBox}>
          <Text style={s.badge}>TRADE SETUU • B2B NETWORK</Text>
          <Text style={s.loginTitle}>
            Global Trade <Text style={s.teal}>Access</Text>
          </Text>
          <Text style={s.loginSub}>
            Connect directly with verified exporters, importers, CHAs & fleet operators.
          </Text>

          <Text style={s.label}>MOBILE NUMBER (+91)</Text>
          <TextInput
            style={s.input}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />

          {otpSent && (
            <>
              <Text style={s.label}>ENTER 4-DIGIT OTP (Use 1234 for instant access)</Text>
              <TextInput
                style={s.input}
                placeholder="• • • •"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                maxLength={4}
                value={otp}
                onChangeText={setOtp}
              />
            </>
          )}

          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => {
              if (!otpSent) {
                if (phone.length < 10) {
                  Alert.alert('Invalid Number', 'Please enter a 10-digit mobile number.');
                  return;
                }
                setOtpSent(true);
              } else {
                if (otp.length === 4) setLoggedIn(true);
                else Alert.alert('Invalid OTP', 'Enter 4-digit OTP (e.g. 1234).');
              }
            }}
          >
            <Text style={s.primaryBtnText}>{otpSent ? 'Verify & Enter Trade Desk' : 'Send Verification OTP'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculator math
  const comm = DENSITIES[selectedComm];
  const qtyNum = parseFloat(mtQty) || 0;
  const fcl20Count = Math.ceil(qtyNum / comm.max20ft);
  const estCbm = (qtyNum / comm.factor).toFixed(1);
  const fobUsdMt = (((parseFloat(inrQtl) || 0) * 10) / (parseFloat(usdRate) || 84.5)).toFixed(2);
  const cifUsdMt = (parseFloat(fobUsdMt) + (parseFloat(freightMt) || 0)).toFixed(2);

  const filteredMandi = mandiCat === 'All' ? mandi : mandi.filter(i => i.category === mandiCat);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />

      {/* Top Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>
            Trade <Text style={s.teal}>SETUU</Text>
          </Text>
          <Text style={s.headerSub}>Live Global Trade & Mandi Desk</Text>
        </View>
        {tab === 'feed' && (
          <TouchableOpacity style={s.postBtn} onPress={() => setPostModal(true)}>
            <Text style={s.postBtnText}>+ Post Lead</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#00D2C4" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={s.body}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAllData(); }} tintColor="#00D2C4" />}
        >
          {/* TAB 1: LIVE TRADE FEED */}
          {tab === 'feed' && (
            <View>
              <Text style={s.secTitle}>ACTIVE TRADE & LOGISTICS LEADS ({feed.length})</Text>
              {feed.map(item => (
                <View key={item.id} style={s.card}>
                  <View style={s.rowBetween}>
                    <View style={[s.tag, item.post_type === 'Buy' ? s.tagBuy : item.post_type === 'Sell' ? s.tagSell : s.tagLog]}>
                      <Text style={s.tagText}>{item.post_type.toUpperCase()}</Text>
                    </View>
                    <Text style={s.priceText}>{item.price}</Text>
                  </View>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  <Text style={s.cardRoute}>Port / Route: {item.route_port}</Text>
                  <View style={s.rowBetween}>
                    <Text style={s.verifiedText}>{item.verified_by}</Text>
                    <TouchableOpacity
                      style={s.inquireBtn}
                      onPress={() => Alert.alert('Direct Trade Desk', `Lead: ${item.title}\nParty: ${item.verified_by}\nQuote: ${item.price}`)}
                    >
                      <Text style={s.inquireText}>Connect →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 2: MANDI LIVE RATES */}
          {tab === 'mandi' && (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {['All', 'Grain', 'Fresh', 'Spices'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[s.chip, mandiCat === cat && s.chipActive]}
                    onPress={() => setMandiCat(cat)}
                  >
                    <Text style={[s.chipText, mandiCat === cat && s.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredMandi.map(item => (
                <View key={item.id} style={s.card}>
                  <View style={s.rowBetween}>
                    <View>
                      <Text style={s.cardTitle}>{item.commodity}</Text>
                      <Text style={s.cardRoute}>{item.mandi}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.priceText}>{item.rate}</Text>
                      <Text style={[s.pctText, { color: item.is_up ? '#10B981' : '#EF4444' }]}>
                        {item.change_pct}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 3: EXPORT & CARGO MULTI-CALCULATOR */}
          {tab === 'calc' && (
            <View>
              <Text style={s.secTitle}>1. CONTAINER LOAD & CBM CALCULATOR</Text>
              <View style={s.card}>
                <Text style={s.label}>SELECT COMMODITY DENSITY</Text>
                {DENSITIES.map((d, idx) => (
                  <TouchableOpacity
                    key={d.name}
                    style={[s.commRow, selectedComm === idx && s.commRowActive]}
                    onPress={() => setSelectedComm(idx)}
                  >
                    <Text style={s.commText}>{d.name}</Text>
                    <Text style={s.commCap}>Max {d.max20ft} MT / 20ft</Text>
                  </TouchableOpacity>
                ))}

                <Text style={[s.label, { marginTop: 12 }]}>CARGO QUANTITY (METRIC TONS)</Text>
                <TextInput
                  style={s.input}
                  keyboardType="numeric"
                  value={mtQty}
                  onChangeText={setMtQty}
                />

                <View style={s.resultBox}>
                  <View style={s.resultCol}>
                    <Text style={s.resLabel}>20ft FCL Needed</Text>
                    <Text style={s.resVal}>{fcl20Count} Container{fcl20Count > 1 ? 's' : ''}</Text>
                  </View>
                  <View style={s.resultCol}>
                    <Text style={s.resLabel}>Est. Volume</Text>
                    <Text style={s.resVal}>{estCbm} CBM</Text>
                  </View>
                </View>
              </View>

              <Text style={s.secTitle}>2. MANDI (₹/QTL) TO EXPORT FOB / CIF ($/MT)</Text>
              <View style={s.card}>
                <Text style={s.label}>MANDI / EX-MILL RATE (₹ PER QUINTAL)</Text>
                <TextInput style={s.input} keyboardType="numeric" value={inrQtl} onChangeText={setInrQtl} />

                <View style={s.rowBetween}>
                  <View style={{ width: '48%' }}>
                    <Text style={s.label}>USD/INR RATE</Text>
                    <TextInput style={s.input} keyboardType="numeric" value={usdRate} onChangeText={setUsdRate} />
                  </View>
                  <View style={{ width: '48%' }}>
                    <Text style={s.label}>SEA FREIGHT ($/MT)</Text>
                    <TextInput style={s.input} keyboardType="numeric" value={freightMt} onChangeText={setFreightMt} />
                  </View>
                </View>

                <View style={s.resultBox}>
                  <View style={s.resultCol}>
                    <Text style={s.resLabel}>FOB India Price</Text>
                    <Text style={s.resVal}>${fobUsdMt} / MT</Text>
                  </View>
                  <View style={s.resultCol}>
                    <Text style={s.resLabel}>CIF Destination</Text>
                    <Text style={s.resVal}>${cifUsdMt} / MT</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* TAB 4: SERVICES HUB */}
          {tab === 'services' && (
            <View>
              <Text style={s.secTitle}>VERIFIED CHA, INSPECTION & TRADE FINANCE</Text>
              {services.map(srv => (
                <View key={srv.id} style={s.card}>
                  <View style={s.rowBetween}>
                    <Text style={s.badge}>{srv.category.toUpperCase()}</Text>
                    <Text style={s.priceText}>{srv.rate_info}</Text>
                  </View>
                  <Text style={s.cardTitle}>{srv.title}</Text>
                  <Text style={s.cardRoute}>{srv.provider} • {srv.location}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {/* Bottom Navigation Bar */}
      <View style={s.navBar}>
        {[
          { key: 'feed', label: 'Trade Feed' },
          { key: 'mandi', label: 'Mandi Live' },
          { key: 'calc', label: 'Multi Calc' },
          { key: 'services', label: 'Services' },
        ].map(item => (
          <TouchableOpacity key={item.key} style={s.navItem} onPress={() => setTab(item.key)}>
            <Text style={[s.navText, tab === item.key && s.navTextActive]}>{item.label}</Text>
            {tab === item.key && <View style={s.navDot} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Post New Trade Lead Modal */}
      <Modal visible={postModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Publish Live Trade Lead</Text>
            <View style={[s.rowBetween, { marginBottom: 10 }]}>
              {['Buy', 'Sell', 'Logistics'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.chip, postType === t && s.chipActive]}
                  onPress={() => setPostType(t)}
                >
                  <Text style={[s.chipText, postType === t && s.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={s.input} placeholder="Commodity & Qty (e.g. IR 64 Rice - 200 MT)" placeholderTextColor="#6B7280" value={postTitle} onChangeText={setPostTitle} />
            <TextInput style={s.input} placeholder="Port / Route (e.g. FOB Vizag / Vietnam)" placeholderTextColor="#6B7280" value={postPort} onChangeText={setPostPort} />
            <TextInput style={s.input} placeholder="Target Rate (e.g. $410/MT)" placeholderTextColor="#6B7280" value={postPrice} onChangeText={setPostPrice} />
            <TextInput style={s.input} placeholder="Company Name (e.g. UA EXIM Overseas)" placeholderTextColor="#6B7280" value={postCompany} onChangeText={setPostCompany} />
            <View style={s.rowBetween}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setPostModal(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleCreatePost}>
                <Text style={s.saveText}>Publish Live</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0D12' },
  teal: { color: '#00D2C4' },
  loginBox: { flex: 1, justifyContent: 'center', padding: 24 },
  badge: { fontSize: 11, fontWeight: '700', color: '#C9B89A', letterSpacing: 1, marginBottom: 8 },
  loginTitle: { fontSize: 32, fontWeight: '800', color: '#D9DDE3', marginBottom: 8 },
  loginSub: { fontSize: 13, color: '#8A8F98', lineHeight: 20, marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '700', color: '#8A8F98', letterSpacing: 0.6, marginBottom: 6 },
  input: { backgroundColor: '#141821', borderWidth: 1, borderColor: '#232936', borderRadius: 10, padding: 13, color: '#D9DDE3', fontSize: 14, marginBottom: 14 },
  primaryBtn: { backgroundColor: '#00D2C4', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 6 },
  primaryBtnText: { color: '#0B0D12', fontWeight: '800', fontSize: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1A1F2B' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#D9DDE3' },
  headerSub: { fontSize: 11, color: '#8A8F98' },
  postBtn: { backgroundColor: '#00D2C4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  postBtnText: { color: '#0B0D12', fontWeight: '800', fontSize: 12 },
  body: { flex: 1, padding: 16 },
  secTitle: { fontSize: 11, fontWeight: '700', color: '#8A8F98', letterSpacing: 0.8, marginBottom: 10 },
  card: { backgroundColor: '#12161F', borderWidth: 1, borderColor: '#1E2430', borderRadius: 12, padding: 14, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  tagBuy: { backgroundColor: 'rgba(0,210,196,0.16)' },
  tagSell: { backgroundColor: 'rgba(201,184,154,0.18)' },
  tagLog: { backgroundColor: 'rgba(96,165,250,0.18)' },
  tagText: { fontSize: 10, fontWeight: '800', color: '#00D2C4' },
  priceText: { fontSize: 15, fontWeight: '800', color: '#00D2C4' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#D9DDE3', marginTop: 8 },
  cardRoute: { fontSize: 12, color: '#8A8F98', marginTop: 4, marginBottom: 10 },
  verifiedText: { fontSize: 11, color: '#C9B89A', fontWeight: '600' },
  inquireBtn: { backgroundColor: '#1A212E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  inquireText: { color: '#00D2C4', fontSize: 12, fontWeight: '700' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#141821', marginRight: 8, borderWidth: 1, borderColor: '#232936' },
  chipActive: { backgroundColor: '#00D2C4', borderColor: '#00D2C4' },
  chipText: { color: '#8A8F98', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#0B0D12' },
  pctText: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  commRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 8, backgroundColor: '#161B26', marginBottom: 6 },
  commRowActive: { borderWidth: 1, borderColor: '#00D2C4', backgroundColor: 'rgba(0,210,196,0.08)' },
  commText: { color: '#D9DDE3', fontSize: 12, fontWeight: '600' },
  commCap: { color: '#C9B89A', fontSize: 11 },
  resultBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0B0D12', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1E2633', marginTop: 4 },
  resultCol: { alignItems: 'center', flex: 1 },
  resLabel: { fontSize: 11, color: '#8A8F98' },
  resVal: { fontSize: 16, fontWeight: '800', color: '#00D2C4', marginTop: 3 },
  navBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1A1F2B', backgroundColor: '#0E1118', paddingVertical: 10 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 12, fontWeight: '700', color: '#8A8F98' },
  navTextActive: { color: '#00D2C4' },
  navDot: { width: 18, height: 3, backgroundColor: '#00D2C4', borderRadius: 2, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#12161F', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#232936' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#D9DDE3', marginBottom: 14 },
  cancelBtn: { flex: 1, padding: 12, alignItems: 'center', marginRight: 8, borderRadius: 8, backgroundColor: '#1A202C' },
  cancelText: { color: '#8A8F98', fontWeight: '700' },
  saveBtn: { flex: 1, padding: 12, alignItems: 'center', marginLeft: 8, borderRadius: 8, backgroundColor: '#00D2C4' },
  saveText: { color: '#0B0D12', fontWeight: '800' },
});
