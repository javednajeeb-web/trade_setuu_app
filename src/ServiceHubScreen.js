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

const SERVICES = [
  { id: 'logistics', icon: '🌐', title: 'Global Logistics', sub: 'Freight & Bidding', tag: 'Live' },
  { id: 'scam', icon: '🛡️', title: 'Scam Alert Board', sub: '3-Factor Verify', tag: 'Live' },
  { id: 'rescue', icon: '🚨', title: 'Port Rescue', sub: '₹499 Unlock', tag: 'Beta' },
  { id: 'docforge', icon: '📄', title: 'Setuu DocForge', sub: 'PI, PL & COO', tag: 'Beta' },
  { id: 'inspection', icon: '🔬', title: 'Inspection & Lab', sub: '₹499 Match Pack', tag: 'Beta' },
  { id: 'insurance', icon: '🏦', title: 'ECGC & Marine', sub: 'Credit & Cargo', tag: 'Beta' },
  { id: 'shipping', icon: '🚢', title: 'Shipping & CHA', sub: 'Customs & Sea', tag: 'Beta' },
  { id: 'iec', icon: '📜', title: 'DGFT & ODOP', sub: 'IEC / RCMC / LUT', tag: 'Beta' },
  { id: 'pass', icon: '📲', title: 'Inspection Pass', sub: 'QR Factory Visit', tag: 'Preview' },
];

const OFFICIAL_ALERTS = [
  {
    id: 'al1',
    entity: 'Al-Mizan General Trading (Unverified Shell)',
    country: 'UAE / Transit Port',
    source: 'DGFT & International Trade Advisory Ref #2026-88',
    status: 'Verified Official Alert',
    detail: 'Reported for issuing forged SWIFT MT103 copies on agro shipments. Always verify LC via advising bank.',
  },
  {
    id: 'al2',
    entity: 'West Coast Bulk Importers Ltd.',
    country: 'West Africa',
    source: 'Port & Customs Enforcement Notice #412',
    status: 'Substantiated Trade Incident',
    detail: 'Repeated container abandonment at destination port demanding 40% distress discount.',
  },
];

const RESCUE_DEALS = [
  {
    id: 'r1',
    title: 'IR-64 Parboiled Rice • 2x20ft (52 MT)',
    port: 'JNPT Nhava Sheva (Stranded Export)',
    offer: 'USD 335 / MT (28% OFF)',
    masked: 'Shree B•••••• Exports | +91 98261 •••10',
    supplier: 'Shree Balaji Agro Exports Pvt. Ltd.',
    phone: '+919826144210',
  },
  {
    id: 'r2',
    title: 'Yellow Maize Feed Grade • 3x20ft (78 MT)',
    port: 'Mundra Port CFS (LC Cancelled)',
    offer: 'USD 204 / MT (24% OFF)',
    masked: 'Narmada O•••••• Comm. | +91 94252 •••34',
    supplier: 'Narmada Overseas Commodities',
    phone: '+919425219834',
  },
];

export default function ServiceHubScreen({
  theme = 'dark',
  isPaid = false,
  vaultBalance = 500,
  onDeductVault,
  onOpenLogistics,
}) {
  const isDark = theme === 'dark';
  const T = {
    bg: isDark ? '#0B0D12' : '#F3F5F8',
    card: isDark ? '#131924' : '#FFFFFF',
    border: isDark ? '#1E293B' : '#E2E8F0',
    text: isDark ? '#F1F5F9' : '#0F172A',
    sub: isDark ? '#94A3B8' : '#64748B',
    input: isDark ? '#0D131D' : '#F1F5F9',
    accent: '#0D9488',
    gold: '#C9B89A',
  };

  const [modalId, setModalId] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [scamTab, setScamTab] = useState('alerts');
  const [reports, setReports] = useState(OFFICIAL_ALERTS);

  // 3-Factor Fraud Report Fields
  const [repCompany, setRepCompany] = useState('');
  const [repCountry, setRepCountry] = useState('');
  const [repDocs, setRepDocs] = useState('Contract + Invoice + Bank Swift Ref');
  const [repNotes, setRepNotes] = useState('');

  // Service Form Fields
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [v3, setV3] = useState('');

  const openTile = (id) => {
    if (id === 'logistics') {
      if (onOpenLogistics) onOpenLogistics();
      return;
    }
    setV1('');
    setV2('');
    setV3('');
    setModalId(id);
  };

  const unlock499 = (item) => {
    Alert.alert(
      'Unlock Supplier Contact — ₹499 Only',
      `${item.title}\nOne-time ₹499 fee to unlock direct phone & WhatsApp.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Pay ₹499 (Vault: ₹${vaultBalance})`,
          onPress: () => {
            if (vaultBalance >= 499 && onDeductVault) onDeductVault(499, item.title);
            setUnlockedIds([...unlockedIds, item.id]);
            Alert.alert('Unlocked ✓', `${item.supplier}\n${item.phone}`);
          },
        },
        {
          text: 'Direct ₹499 Unlock',
          onPress: () => {
            setUnlockedIds([...unlockedIds, item.id]);
            Alert.alert('Unlocked ✓', `${item.supplier}\n${item.phone}`);
          },
        },
      ]
    );
  };

  const submitFraudReport = () => {
    if (!repCompany.trim() || !repNotes.trim()) {
      Alert.alert('Required', 'Please enter Company Name and Incident Details.');
      return;
    }
    const newRep = {
      id: 'rep-' + Date.now(),
      entity: repCompany.trim(),
      country: repCountry.trim() || 'International',
      source: `3-Factor Submission (${repDocs})`,
      status: 'Under Review (7–15 Days)',
      detail: repNotes.trim(),
    };
    setReports([newRep, ...reports]);
    setRepCompany('');
    setRepCountry('');
    setRepNotes('');
    setScamTab('alerts');
    Alert.alert('Report Submitted ✓', 'Status: Under Review. Our moderation team will verify Identity, Documentary Evidence & Independent Records within 7–15 days.');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ paddingBottom: 85 }}>
      <View style={[styles.headerStrip, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <Text style={[styles.head, { color: T.text }]}>Service Hub & Trust Desk</Text>
        <Text style={[styles.sub, { color: T.sub }]}>Verified Trade Services • Scam Reporting • Port Rescue</Text>
      </View>

      <View style={styles.gridWrap}>
        {SERVICES.map((s) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => openTile(s.id)}
            style={[styles.tile, { backgroundColor: T.card, borderColor: T.border }]}
          >
            <Text style={styles.badge}>{s.tag}</Text>
            <Text style={{ fontSize: 22, marginTop: 4 }}>{s.icon}</Text>
            <Text style={[styles.tileTitle, { color: T.text }]} numberOfLines={1}>{s.title}</Text>
            <Text style={[styles.tileSub, { color: T.sub }]} numberOfLines={1}>{s.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feature-Flagged Coming Soon Modules — Visible Only to Paid Subscribers */}
      {isPaid && (
        <View style={[styles.proStrip, { backgroundColor: T.card, borderColor: T.gold }]}>
          <Text style={{ color: T.gold, fontSize: 12, fontWeight: '900', marginBottom: 6 }}>
            ⭐ GOLD EXCLUSIVE & COMING SOON (FEATURE-FLAGGED)
          </Text>
          <Text style={{ color: T.sub, fontSize: 12, lineHeight: 19 }}>
            • The Neutral Lock (Conditional Smart Escrow — Legal Setup){'\n'}
            • Jugaad Shield (Anti-Bypass & Commission Protection){'\n'}
            • AI Auto-Matching & Automated Compliance Intelligence
          </Text>
        </View>
      )}

      <Modal visible={!!modalId} transparent animationType="slide">
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={styles.modalBox}>
              {modalId === 'scam' ? (
                <View>
                  <Text style={styles.mTitle}>🛡️ Scam Alert & Fraud Reporting Board</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => setScamTab('alerts')} style={[styles.tabPill, scamTab === 'alerts' && { backgroundColor: '#0D9488' }]}>
                      <Text style={styles.pillTxt}>Verified Alerts ({reports.length})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setScamTab('report')} style={[styles.tabPill, scamTab === 'report' && { backgroundColor: '#0D9488' }]}>
                      <Text style={styles.pillTxt}>+ Report Fraud (3-Factor)</Text>
                    </TouchableOpacity>
                  </View>

                  {scamTab === 'alerts' ? (
                    reports.map((r) => (
                      <View key={r.id} style={styles.alertCard}>
                        <Text style={{ color: '#F59E0B', fontSize: 10, fontWeight: '800' }}>{r.status.toUpperCase()}</Text>
                        <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '900', marginTop: 2 }}>{r.entity} ({r.country})</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 2 }}>{r.source}</Text>
                        <Text style={{ color: '#CBD5E1', fontSize: 12, marginTop: 4 }}>{r.detail}</Text>
                      </View>
                    ))
                  ) : (
                    <View>
                      <Text style={{ color: '#C9B89A', fontSize: 11, marginBottom: 8 }}>
                        3-Factor Verification: 1. Identity • 2. Documentary Evidence • 3. Independent Review (7–15 Days)
                      </Text>
                      <TextInput style={styles.mInp} placeholder="Company / Entity Name" placeholderTextColor="#64748B" value={repCompany} onChangeText={setRepCompany} />
                      <TextInput style={styles.mInp} placeholder="Country / Port" placeholderTextColor="#64748B" value={repCountry} onChangeText={setRepCountry} />
                      <TextInput style={styles.mInp} placeholder="Evidence (Contract, Invoice, Bank Ref, BL)" placeholderTextColor="#64748B" value={repDocs} onChangeText={setRepDocs} />
                      <TextInput style={styles.mInp} placeholder="Incident Summary" placeholderTextColor="#64748B" value={repNotes} onChangeText={setRepNotes} />
                      <TouchableOpacity style={styles.mBtn} onPress={submitFraudReport}>
                        <Text style={styles.mBtnTxt}>Submit for 3-Factor Moderation</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : modalId === 'rescue' ? (
                <View>
                  <Text style={styles.mTitle}>🚨 Port Rescue — ₹499 Only</Text>
                  {RESCUE_DEALS.map((d) => {
                    const open = unlockedIds.includes(d.id);
                    return (
                      <View key={d.id} style={styles.alertCard}>
                        <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>{d.title}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 11 }}>{d.port}</Text>
                        <Text style={{ color: '#14B8A6', fontSize: 12, fontWeight: '900', marginVertical: 3 }}>{d.offer}</Text>
                        {open ? (
                          <TouchableOpacity style={styles.waBtn} onPress={() => Linking.openURL(`https://wa.me/${d.phone.replace('+', '')}`)}>
                            <Text style={styles.mBtnTxt}>💬 {d.supplier} ({d.phone})</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity style={styles.mBtn} onPress={() => unlock499(d)}>
                            <Text style={styles.mBtnTxt}>🔓 Unlock Contact — ₹499 Only</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : modalId === 'pass' ? (
                <View>
                  <Text style={styles.mTitle}>📲 Digital Inspection Pass (Preview)</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 12, lineHeight: 18, marginBottom: 10 }}>
                    Generate QR-verified factory & warehouse entry passes for buyer quality inspectors with timestamped audit logs.
                  </Text>
                  <TextInput style={styles.mInp} placeholder="Factory / Warehouse Name" placeholderTextColor="#64748B" value={v1} onChangeText={setV1} />
                  <TextInput style={styles.mInp} placeholder="Inspector / Agency Name (e.g. SGS / Bureau Veritas)" placeholderTextColor="#64748B" value={v2} onChangeText={setV2} />
                  <TouchableOpacity style={styles.mBtn} onPress={() => { setModalId(null); Alert.alert('QR Inspection Pass Generated ✓', `Pass ID: TS-PASS-${Math.floor(1000 + Math.random() * 9000)}`); }}>
                    <Text style={styles.mBtnTxt}>Generate QR Visitor Pass</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.mTitle}>{SERVICES.find((x) => x.id === modalId)?.title}</Text>
                  <Text style={{ color: '#C9B89A', fontSize: 11, marginBottom: 8 }}>
                    {modalId === 'inspection' ? 'Inspection Matching Recommendation Pack — ₹499 One-Time (Lab charges extra)' : 'Submit details to verified trade partners'}
                  </Text>
                  <TextInput style={styles.mInp} placeholder="Commodity & Quantity (e.g. 500 MT Turmeric)" placeholderTextColor="#64748B" value={v1} onChangeText={setV1} />
                  <TextInput style={styles.mInp} placeholder="Port / City Location" placeholderTextColor="#64748B" value={v2} onChangeText={setV2} />
                  <TextInput style={styles.mInp} placeholder="Specific Requirement (ECGC / Marine / PI / RCMC)" placeholderTextColor="#64748B" value={v3} onChangeText={setV3} />
                  <TouchableOpacity style={styles.mBtn} onPress={() => { setModalId(null); Alert.alert('Request Submitted ✓', 'Verified service desk will connect shortly.'); }}>
                    <Text style={styles.mBtnTxt}>Submit Request</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setModalId(null)}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerStrip: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, marginBottom: 10 },
  head: { fontSize: 17, fontWeight: '900' },
  sub: { fontSize: 12, marginTop: 2 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 12 },
  tile: { width: '31.5%', borderRadius: 12, borderWidth: 1, padding: 10, marginBottom: 10, alignItems: 'center' },
  badge: { alignSelf: 'flex-end', color: '#14B8A6', fontSize: 9, fontWeight: '900' },
  tileTitle: { fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  tileSub: { fontSize: 9, textAlign: 'center', marginTop: 2 },
  proStrip: { marginHorizontal: 12, marginTop: 6, padding: 14, borderRadius: 12, borderWidth: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#0D1B2A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C9B89A' },
  mTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  tabPill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 14, backgroundColor: '#131924', marginRight: 8 },
  pillTxt: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  alertCard: { backgroundColor: '#131924', borderRadius: 10, padding: 11, marginBottom: 9, borderWidth: 1, borderColor: '#1E293B' },
  mInp: { backgroundColor: '#131924', color: '#FFF', borderWidth: 1, borderColor: '#1E293B', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, marginBottom: 9 },
  mBtn: { backgroundColor: '#0D9488', borderRadius: 9, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  waBtn: { backgroundColor: '#16A34A', borderRadius: 9, paddingVertical: 9, alignItems: 'center', marginTop: 6 },
  mBtnTxt: { color: '#FFF', fontSize: 12, fontWeight: '900' },
});
