import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';

const SERVICE_TILES = [
  { id: 'logistics', icon: '🌐', title: 'Logistics & Transport', sub: 'Truck, Container, WH', status: 'Limited Beta' },
  { id: 'docforge', icon: '📄', title: 'DocForge Maker', sub: 'PI, LOI, PO, CI & PL', status: 'Limited Beta' },
  { id: 'shipping', icon: '🚢', title: 'Shipping & Freight', sub: 'Routes & Schedules', status: 'Limited Beta' },
  { id: 'cha', icon: '🛃', title: 'CHA & Customs', sub: 'Verified CHA Desk', status: 'Limited Beta' },
  { id: 'ecgc', icon: '🏦', title: 'ECGC Credit Cover', sub: 'Partner Referral Only', status: 'Limited Beta' },
  { id: 'marine', icon: '🛡️', title: 'Marine Insurance', sub: 'Insurer Referral', status: 'Limited Beta' },
  { id: 'inspection', icon: '🔬', title: 'Inspection & Lab', sub: 'Agency Quotes', status: 'Limited Beta' },
  { id: 'insp_pack', icon: '📋', title: 'Inspection Match Pack', sub: '₹499 One-Time', status: 'Limited Beta' },
  { id: 'pass', icon: '📲', title: 'Digital Inspection Pass', sub: 'QR Visitor Entry', status: 'Preview' },
  { id: 'dgft', icon: '📜', title: 'DGFT & ODOP Desk', sub: 'Guidance & Checklist', status: 'Limited Beta' },
  { id: 'capital', icon: '💱', title: 'Trade Capital Desk', sub: 'Partner Referral Only', status: 'Preview' },
  { id: 'rescue', icon: '🚨', title: 'Port Rescue', sub: '₹499 + $15/Cont', status: 'Limited Beta' },
  { id: 'dispute', icon: '⚖️', title: 'Dispute Resolution', sub: 'Case Intake & Log', status: 'Limited Beta' },
  { id: 'scam', icon: '🚨', title: 'Scam Alert & Reports', sub: 'Official + 3-Factor', status: 'Live' },
  { id: 'packaging', icon: '📦', title: 'Packaging & Printing', sub: 'Vendor Quotes', status: 'Limited Beta' },
  { id: 'warehouse', icon: '🏭', title: 'Warehousing & Cold', sub: 'Storage Discovery', status: 'Limited Beta' },
  { id: 'support', icon: '🎧', title: 'Support & Help Desk', sub: 'Tickets & FAQs', status: 'Live' },
];

const OFFICIAL_SCAM_ALERTS = [
  {
    id: 'oa-1',
    entity: 'DEMO – Al-Mizan General Trading LLC',
    country: 'UAE',
    authority: 'DGFT / International Trade Enforcement Advisory',
    reference: 'Notice Ref #DGFT-ADV-2026-88',
    pubDate: '14 Nov 2026',
    lastChecked: '21 Nov 2026',
    status: 'Official Alert',
    sourceUrl: 'https://www.dgft.gov.in',
    summary: 'Official enforcement notice regarding circulation of unverified SWIFT MT103 instruments. Verify LC authenticity via advising bank.',
  },
];

const DISTRESS_LISTINGS = [
  {
    id: 'dl-1',
    title: 'DEMO – IR-64 Parboiled Rice • 2x20ft (52 MT)',
    port: 'JNPT Nhava Sheva (Stranded Export)',
    proof: 'Title & BL Ownership Verified • No Port Lien',
    price: 'USD 335 / MT (28% Below Reference)',
    masked: 'S•••••• Agro Exports Pvt. Ltd. | +91 98261 •••10',
    seller: 'DEMO – Shree Balaji Agro Exports Pvt. Ltd.',
    phone: '+919826144210',
  },
];

export default function ServiceHubScreen({ theme = 'dark', onOpenLogistics }) {
  const isDark = theme === 'dark';
  const T = {
    bg: isDark ? '#0B0D12' : '#F4F6F9',
    card: isDark ? '#11161F' : '#FFFFFF',
    border: isDark ? '#1E293B' : '#E2E8F0',
    text: isDark ? '#F1F5F9' : '#0F172A',
    sub: isDark ? '#94A3B8' : '#64748B',
    input: isDark ? '#0D131D' : '#F1F5F9',
    accent: '#0D9488',
    gold: '#C9B89A',
  };

  const [screen, setScreen] = useState('grid');
  const [scamTab, setScamTab] = useState('official');
  const [communityReports, setCommunityReports] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState([]);

  const [subjName, setSubjName] = useState('');
  const [subjCountry, setSubjCountry] = useState('');
  const [txRef, setTxRef] = useState('');
  const [chronology, setChronology] = useState('');
  const [evidenceList, setEvidenceList] = useState('Contract, Invoice, Bank Ref, BL');
  const [consentChecked, setConsentChecked] = useState(true);

  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const [f3, setF3] = useState('');
  const [qrPass, setQrPass] = useState('');

  const openTile = (id) => {
    if (id === 'logistics') {
      if (onOpenLogistics) onOpenLogistics();
      return;
    }
    setF1('');
    setF2('');
    setF3('');
    setQrPass('');
    setScreen(id);
  };
  if (screen !== 'grid') {
    const tile = SERVICE_TILES.find((t) => t.id === screen);
    return (
      <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 85 }}>
        <TouchableOpacity style={{ paddingVertical: 8, marginBottom: 6 }} onPress={() => setScreen('grid')}>
          <Text style={{ color: '#14B8A6', fontSize: 13, fontWeight: '900' }}>← Back to Service Hub & Trust Desk</Text>
        </TouchableOpacity>

        <View style={styles.rowBetween}>
          <Text style={[styles.head, { color: T.text }]}>{tile?.icon} {tile?.title}</Text>
          <Text style={styles.statusTag}>{tile?.status}</Text>
        </View>
        <Text style={[styles.sub, { color: T.sub }]}>{tile?.sub}</Text>

        {screen === 'scam' && (
          <View>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TouchableOpacity onPress={() => setScamTab('official')} style={[styles.tabBtn, scamTab === 'official' && { backgroundColor: T.accent }]}>
                <Text style={styles.tabTxt}>Official Alerts (Traceable)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScamTab('community')} style={[styles.tabBtn, scamTab === 'community' && { backgroundColor: T.accent }]}>
                <Text style={styles.tabTxt}>Community Report (Private)</Text>
              </TouchableOpacity>
            </View>

            {scamTab === 'official' ? (
              <View>
                <Text style={{ color: T.sub, fontSize: 11, marginBottom: 8 }}>
                  Only traceable government, regulator, court & enforcement alerts are displayed here. Never merged with unverified user reports.
                </Text>
                {OFFICIAL_SCAM_ALERTS.map((a) => (
                  <View key={a.id} style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
                    <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '900' }}>{a.status.toUpperCase()} • {a.country}</Text>
                    <Text style={{ color: T.text, fontSize: 15, fontWeight: '900', marginTop: 4 }}>{a.entity}</Text>
                    <Text style={{ color: T.accent, fontSize: 11, fontWeight: '700', marginTop: 2 }}>{a.authority} ({a.reference})</Text>
                    <Text style={{ color: T.sub, fontSize: 11, marginTop: 2 }}>Published: {a.pubDate} • Last Checked: {a.lastChecked}</Text>
                    <Text style={{ color: T.text, fontSize: 13, marginTop: 6, lineHeight: 19 }}>{a.summary}</Text>
                    <TouchableOpacity style={[styles.tealBtn, { marginTop: 10 }]} onPress={() => Linking.openURL(a.sourceUrl)}>
                      <Text style={styles.btnTxt}>Verify Official Source URL</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
                <Text style={{ color: T.gold, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>
                  Private Intake • Three-Factor Review (Target Window: 7–15 Days)
                </Text>
                <Text style={{ color: T.sub, fontSize: 11, lineHeight: 17, marginBottom: 10 }}>
                  1. Identity/Entity Match • 2. Documentary Evidence • 3. Independent Corroboration. Subject receives notice & right-to-respond before any moderated publication.
                </Text>
                <Text style={[styles.lbl, { color: T.sub }]}>Subject Company / Entity Name</Text>
                <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={subjName} onChangeText={setSubjName} placeholder="Legal entity name" placeholderTextColor={T.sub} />
                <Text style={[styles.lbl, { color: T.sub }]}>Country & Registration / Port Details</Text>
                <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={subjCountry} onChangeText={setSubjCountry} placeholder="e.g. India / UAE / Nigeria" placeholderTextColor={T.sub} />
                <Text style={[styles.lbl, { color: T.sub }]}>Transaction & Invoice / LC Reference</Text>
                <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={txRef} onChangeText={setTxRef} placeholder="PO / Invoice / Bank Ref" placeholderTextColor={T.sub} />
                <Text style={[styles.lbl, { color: T.sub }]}>Supporting Evidence Checklist</Text>
                <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={evidenceList} onChangeText={setEvidenceList} />
                <Text style={[styles.lbl, { color: T.sub }]}>Incident Chronology</Text>
                <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border, height: 75 }]} multiline value={chronology} onChangeText={setChronology} placeholder="Date-wise sequence of events..." placeholderTextColor={T.sub} />

                <TouchableOpacity onPress={() => setConsentChecked(!consentChecked)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: T.accent, fontSize: 15, marginRight: 8 }}>{consentChecked ? '☑️' : '⬜'}</Text>
                  <Text style={{ color: T.sub, fontSize: 11, flex: 1 }}>
                    I confirm my KYC identity, documentary authenticity, and consent to confidential moderation & right-to-respond review.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tealBtn}
                  onPress={() => {
                    if (!subjName.trim() || !chronology.trim() || !consentChecked) {
                      Alert.alert('Incomplete', 'Please fill entity name, chronology, and confirm consent.');
                      return;
                    }
                    const rec = { id: 'CR-' + Date.now(), entity: subjName.trim(), status: 'Submitted (Private Intake)', date: '21 Nov 2026' };
                    setCommunityReports([rec, ...communityReports]);
                    setSubjName('');
                    setChronology('');
                    Alert.alert('Private Report Logged ✓', `Case ID: ${rec.id}\nStatus: Submitted\nVisible only to authorized moderation reviewers.`);
                  }}
                >
                  <Text style={styles.btnTxt}>Submit Confidential Report</Text>
                </TouchableOpacity>

                {communityReports.map((cr) => (
                  <View key={cr.id} style={{ marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: T.input }}>
                    <Text style={{ color: T.text, fontSize: 12, fontWeight: '800' }}>{cr.id} • {cr.entity}</Text>
                    <Text style={{ color: T.gold, fontSize: 11 }}>Status: {cr.status} ({cr.date})</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {screen === 'rescue' && (
          <View>
            <View style={[styles.card, { backgroundColor: '#0D1B2A', borderColor: T.gold }]}>
              <Text style={{ color: T.gold, fontSize: 12, fontWeight: '900' }}>Fee Structure: ₹499 One-Time Contact Unlock + $15 / Container on Deal Completion</Text>
            </View>
            {DISTRESS_LISTINGS.map((d) => {
              const open = unlockedIds.includes(d.id);
              return (
                <View key={d.id} style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
                  <Text style={{ color: T.text, fontSize: 15, fontWeight: '900' }}>{d.title}</Text>
                  <Text style={{ color: T.sub, fontSize: 12, marginTop: 3 }}>📍 {d.port}</Text>
                  <Text style={{ color: T.gold, fontSize: 11, marginTop: 2 }}>✓ {d.proof}</Text>
                  <Text style={{ color: T.accent, fontSize: 14, fontWeight: '900', marginVertical: 6 }}>{d.price}</Text>
                  {open ? (
                    <Text style={{ color: T.text, fontSize: 13, fontWeight: '800' }}>Unlocked: {d.seller} ({d.phone})</Text>
                  ) : (
                    <View>
                      <Text style={{ color: T.sub, fontSize: 12, marginBottom: 8 }}>🔒 {d.masked}</Text>
                      <TouchableOpacity
                        style={styles.tealBtn}
                        onPress={() => {
                          setUnlockedIds([...unlockedIds, d.id]);
                          Alert.alert('Contact Unlocked (₹499 One-Time) ✓', `${d.seller}\n${d.phone}\n\nNote: $15/container completion success fee applies upon deal closure.`);
                        }}
                      >
                        <Text style={styles.btnTxt}>🔓 Unlock Seller Contact — ₹499 One-Time</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {screen === 'pass' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cTitle, { color: T.text }]}>Digital Inspection Pass (Preview / Early Access)</Text>
            <Text style={[styles.lbl, { color: T.sub }]}>Participating Facility / Warehouse</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={f1} onChangeText={setF1} placeholder="Factory / Godown name" placeholderTextColor={T.sub} />
            <Text style={[styles.lbl, { color: T.sub }]}>Visitor / Inspector Name</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={f2} onChangeText={setF2} placeholder="Inspector & Agency" placeholderTextColor={T.sub} />
            <TouchableOpacity style={styles.tealBtn} onPress={() => setQrPass(`TS-PASS-${Math.floor(100000 + Math.random() * 900000)}`)}>
              <Text style={styles.btnTxt}>Generate QR Entry Pass (Host Approval)</Text>
            </TouchableOpacity>
            {!!qrPass && (
              <View style={{ marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: '#0D1B2A', alignItems: 'center' }}>
                <Text style={{ color: '#14B8A6', fontWeight: '900' }}>QR PASS ISSUED: {qrPass}</Text>
                <Text style={{ color: '#CBD5E1', fontSize: 11, marginTop: 3 }}>Entry/Exit Audit Log Active</Text>
              </View>
            )}
          </View>
        )}

        {screen !== 'scam' && screen !== 'rescue' && screen !== 'pass' && (
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.cTitle, { color: T.text }]}>{tile?.title} — Request & Workflow</Text>
            {(screen === 'ecgc' || screen === 'capital') && (
              <Text style={{ color: T.gold, fontSize: 11, marginBottom: 8 }}>
                Partner Referral Desk Only — Trade SETUU does not act as a lender, insurer, or deposit-taking institution.
              </Text>
            )}
            {screen === 'dgft' && (
              <Text style={{ color: T.gold, fontSize: 11, marginBottom: 8 }}>
                Guidance & Document Checklist Only — Official approvals are issued solely by DGFT / Customs authorities.
              </Text>
            )}
            {screen === 'insp_pack' && (
              <Text style={{ color: T.gold, fontSize: 11, marginBottom: 8 }}>
                ₹499 One-Time Recommendation Service — Actual laboratory & inspection charges are billed separately by the selected provider.
              </Text>
            )}
            <Text style={[styles.lbl, { color: T.sub }]}>Commodity / Deal Reference</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={f1} onChangeText={setF1} placeholder="e.g. 500 MT Parboiled Rice / HS 100630" placeholderTextColor={T.sub} />
            <Text style={[styles.lbl, { color: T.sub }]}>Port / Location / Country</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={f2} onChangeText={setF2} placeholder="e.g. JNPT / Mundra / Dubai" placeholderTextColor={T.sub} />
            <Text style={[styles.lbl, { color: T.sub }]}>Specific Requirement</Text>
            <TextInput style={[styles.inp, { backgroundColor: T.input, color: T.text, borderColor: T.border }]} value={f3} onChangeText={setF3} placeholder="Enter scope, document type, or ticket details" placeholderTextColor={T.sub} />
            <TouchableOpacity style={styles.tealBtn} onPress={() => { setScreen('grid'); Alert.alert('Request Logged ✓', `${tile?.title} request submitted with audit timestamp.`); }}>
              <Text style={styles.btnTxt}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ paddingBottom: 85 }}>
      <View style={[styles.headerStrip, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <Text style={[styles.head, { color: T.text }]}>Service Hub & Trust Desk</Text>
        <Text style={[styles.sub, { color: T.sub }]}>Trade Services, Compliance Guidance, Scam Alerts & Dispute Intake</Text>
      </View>

      <View style={styles.gridWrap}>
        {SERVICE_TILES.map((s) => (
          <TouchableOpacity key={s.id} onPress={() => openTile(s.id)} style={[styles.tile, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.badge, s.status === 'Live' && { color: '#34D399' }]}>{s.status}</Text>
            <Text style={{ fontSize: 21, marginTop: 4 }}>{s.icon}</Text>
            <Text style={[styles.tileTitle, { color: T.text }]} numberOfLines={2}>{s.title}</Text>
            <Text style={[styles.tileSub, { color: T.sub }]} numberOfLines={1}>{s.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerStrip: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  head: { fontSize: 17, fontWeight: '900' },
  sub: { fontSize: 12, marginTop: 2, marginBottom: 10 },
  statusTag: { color: '#14B8A6', fontSize: 11, fontWeight: '800', backgroundColor: 'rgba(13,148,136,0.14)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 12 },
  tile: { width: '31.5%', borderRadius: 12, borderWidth: 1, padding: 9, marginBottom: 10, alignItems: 'center' },
  badge: { alignSelf: 'flex-end', color: '#C9B89A', fontSize: 8, fontWeight: '900' },
  tileTitle: { fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 5 },
  tileSub: { fontSize: 9, textAlign: 'center', marginTop: 2 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: '#1E293B', alignItems: 'center', marginHorizontal: 3 },
  tabTxt: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  cTitle: { fontSize: 15, fontWeight: '900', marginBottom: 10 },
  lbl: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  inp: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 9, fontSize: 13, marginBottom: 10 },
  tealBtn: { backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  btnTxt: { color: '#FFF', fontSize: 12, fontWeight: '900' },
});
