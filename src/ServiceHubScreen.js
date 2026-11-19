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

const SERVICES = [
  { id: 'logistics', icon: '🚛', title: 'Logistics & Transport', live: true },
  { id: 'tradedocs', icon: '📄', title: 'Quotation, PI, LOI & PO', live: true },
  { id: 'shipping', icon: '🚢', title: 'Shipping & Freight', live: true },
  { id: 'cha', icon: '🛃', title: 'CHA & Customs', live: true },
  { id: 'licensing', icon: '📋', title: 'IEC & Compliance', live: true },
  { id: 'packaging', icon: '📦', title: 'Packaging & Print', live: true },
  { id: 'eway', icon: '🧾', title: 'E-Way & Domestic', live: true },
  { id: 'advisory', icon: '🎧', title: 'Trade Advisory', live: true },
  { id: 'finance', icon: '🏦', title: 'Trade Finance', live: false },
  { id: 'insurance', icon: '🛡️', title: 'Marine Insurance', live: false },
  { id: 'inspection', icon: '🔬', title: 'Lab & Inspection', live: false },
  { id: 'certs', icon: '🏅', title: 'Certifications', live: false },
  { id: 'merchanting', icon: '🌐', title: 'Merchanting Trade', live: false },
  { id: 'distress', icon: '⚡', title: 'Distress Cargo', live: false },
  { id: 'capital', icon: '💼', title: 'Working Capital', live: false },
  { id: 'dgft', icon: '🏛️', title: 'DGFT & RoDTEP', live: false },
  { id: 'legal', icon: '⚖️', title: 'Exim Legal Desk', live: false },
  { id: 'blacklist', icon: '🚫', title: 'Blacklist Check', live: false },
];

const DOC_TYPES = [
  'Quotation / FCO',
  'Proforma Invoice (PI)',
  'Letter of Intent (LOI)',
  'Purchase Order (PO)',
  'Commercial Invoice',
  'Packing List',
];

const CURRENCIES = ['USD', 'INR', 'EUR', 'AED'];

export default function ServiceHubScreen({ onOpenLogistics }) {
  const [selectedService, setSelectedService] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Trade Document Generator State
  const [docType, setDocType] = useState('Proforma Invoice (PI)');
  const [currency, setCurrency] = useState('USD');
  const [docNo, setDocNo] = useState('TS-2026-001');
  const [sellerName, setSellerName] = useState('Trade SETUU Exports Pvt Ltd');
  const [iecGst, setIecGst] = useState('IEC: AAACT1234F • GST: 22AAACT1234F1Z5');
  const [buyerName, setBuyerName] = useState('');
  const [commodity, setCommodity] = useState('Indian Parboiled Rice 5% Broken');
  const [hsCode, setHsCode] = useState('1006.30.10');
  const [quantity, setQuantity] = useState('54 MT (2 x 20ft FCL)');
  const [packing, setPacking] = useState('50 Kg PP Woven Bags');
  const [unitPrice, setUnitPrice] = useState('485 / MT');
  const [incoterm, setIncoterm] = useState('FOB JNPT, India');
  const [destinationPort, setDestinationPort] = useState('Jebel Ali, UAE');
  const [paymentTerms, setPaymentTerms] = useState('30% Advance, 70% against Scan BL');
  const [bankDetails, setBankDetails] = useState('Union Bank of India • AD Code Registered');

  // General Service Inquiry State
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [requirement, setRequirement] = useState('');

  const handleCardPress = (item) => {
    if (!item.live) {
      Alert.alert(
        item.title + ' — Coming Soon',
        'Yeh module agle verified phase mein active hoga. Tab tak aap Live Desks aur Trade Document Maker ka upyog kar sakte hain.'
      );
      return;
    }
    if (item.id === 'logistics' && onOpenLogistics) {
      onOpenLogistics();
      return;
    }
    setShowPreview(false);
    setSelectedService(item);
  };

  const buildDocText = () => {
    const today = new Date().toLocaleDateString('en-IN');
    return [
      '====================================',
      'TRADE SETUU — ' + docType.toUpperCase(),
      '====================================',
      'Ref No: ' + docNo + '   |   Date: ' + today,
      '------------------------------------',
      'ISSUER / SELLER:',
      sellerName || 'N/A',
      iecGst,
      '------------------------------------',
      'RECEIVER / BUYER:',
      buyerName || 'Valued International Buyer',
      '------------------------------------',
      'COMMODITY: ' + commodity,
      'HS CODE: ' + hsCode,
      'QUANTITY: ' + quantity,
      'PACKAGING: ' + packing,
      'UNIT RATE: ' + currency + ' ' + unitPrice + ' (' + incoterm + ')',
      'DESTINATION: ' + destinationPort,
      'PAYMENT TERMS: ' + paymentTerms,
      'BANK / AD INFO: ' + bankDetails,
      '------------------------------------',
      'Generated via Trade SETUU Ecosystem',
      'Powered by Apex Sync Technologies',
    ].join('\n');
  };

  const submitServiceInquiry = () => {
    const msg = [
      'TRADE SETUU — SERVICE INQUIRY',
      'Desk: ' + selectedService.title,
      'Company: ' + (company || 'N/A'),
      'Contact: ' + (phone || 'N/A'),
      'Requirement: ' + (requirement || 'Need quote & support'),
      'Powered by Apex Sync Technologies',
    ].join('\n');

    Alert.alert(
      'Request Submitted',
      selectedService.title + ' ke liye aapki inquiry register ho gayi hai.',
      [
        { text: 'Done', onPress: () => setSelectedService(null) },
        {
          text: 'Share on WhatsApp',
          onPress: () => {
            Share.share({ message: msg });
            setSelectedService(null);
          },
        },
      ]
    );
  };

  // --- VIEW 1: QUOTATION, PI, LOI, PO GENERATOR + LIVE PREVIEW ---
  if (selectedService && selectedService.id === 'tradedocs') {
    return (
      <View style={styles.container}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Services</Text>
          </TouchableOpacity>
          <Text style={styles.subTitle}>Quotation, PI, LOI & PO Maker</Text>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.card}>
            <Text style={styles.label}>1. SELECT DOCUMENT TYPE</Text>
            <View style={styles.chipRow}>
              {DOC_TYPES.map((dt) => (
                <TouchableOpacity
                  key={dt}
                  onPress={() => setDocType(dt)}
                  style={[styles.chip, docType === dt && styles.chipActive]}
                >
                  <Text style={styles.chipTxt}>{dt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>2. CURRENCY & REFERENCE NO.</Text>
            <View style={styles.chipRow}>
              {CURRENCIES.map((cur) => (
                <TouchableOpacity
                  key={cur}
                  onPress={() => setCurrency(cur)}
                  style={[styles.chip, currency === cur && styles.chipActive]}
                >
                  <Text style={styles.chipTxt}>{cur}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} value={docNo} onChangeText={setDocNo} />

            <Text style={styles.label}>SELLER / EXPORTER NAME</Text>
            <TextInput style={styles.input} value={sellerName} onChangeText={setSellerName} />

            <Text style={styles.label}>IEC & GSTIN DETAILS</Text>
            <TextInput style={styles.input} value={iecGst} onChangeText={setIecGst} />

            <Text style={styles.label}>BUYER / IMPORTER PARTY NAME</Text>
            <TextInput
              style={styles.input}
              value={buyerName}
              onChangeText={setBuyerName}
              placeholder="Enter Buyer Company Name"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.label}>COMMODITY & SPECIFICATION</Text>
            <TextInput style={styles.input} value={commodity} onChangeText={setCommodity} />

            <View style={styles.gridRow}>
              <View style={styles.half}>
                <Text style={styles.label}>HS CODE</Text>
                <TextInput style={styles.input} value={hsCode} onChangeText={setHsCode} />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>QUANTITY</Text>
                <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} />
              </View>
            </View>

            <Text style={styles.label}>PACKAGING</Text>
            <TextInput style={styles.input} value={packing} onChangeText={setPacking} />

            <View style={styles.gridRow}>
              <View style={styles.half}>
                <Text style={styles.label}>RATE ({currency})</Text>
                <TextInput style={styles.input} value={unitPrice} onChangeText={setUnitPrice} />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>INCOTERMS & PORT</Text>
                <TextInput style={styles.input} value={incoterm} onChangeText={setIncoterm} />
              </View>
            </View>

            <Text style={styles.label}>DESTINATION PORT</Text>
            <TextInput style={styles.input} value={destinationPort} onChangeText={setDestinationPort} />

            <Text style={styles.label}>PAYMENT TERMS</Text>
            <TextInput style={styles.input} value={paymentTerms} onChangeText={setPaymentTerms} />

            <Text style={styles.label}>BANK / AD CODE DETAILS</Text>
            <TextInput style={styles.input} value={bankDetails} onChangeText={setBankDetails} />

            <TouchableOpacity
              style={styles.previewToggleBtn}
              onPress={() => setShowPreview(!showPreview)}
            >
              <Text style={styles.previewToggleTxt}>
                {showPreview ? 'Hide Document Preview ▲' : 'Preview Formatted Document ▼'}
              </Text>
            </TouchableOpacity>

            {showPreview && (
              <View style={styles.previewBox}>
                <Text style={styles.previewCode}>{buildDocText()}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => Share.share({ message: buildDocText() })}
            >
              <Text style={styles.primaryBtnTxt}>
                Export & Share {docType.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footer}>Powered by Apex Sync Technologies</Text>
        </ScrollView>
      </View>
    );
  }

  // --- VIEW 2: GENERAL LIVE SERVICE INQUIRY FORM ---
  if (selectedService) {
    return (
      <View style={styles.container}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Services</Text>
          </TouchableOpacity>
          <Text style={styles.subTitle}>{selectedService.title}</Text>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.card}>
            <Text style={styles.label}>YOUR COMPANY / FIRM NAME</Text>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="e.g. Global Agro Exports"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.label}>WHATSAPP / MOBILE NUMBER</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+91..."
              placeholderTextColor="#64748B"
            />
            <Text style={styles.label}>REQUIREMENT DETAILS</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              value={requirement}
              onChangeText={setRequirement}
              multiline
              placeholder="Mention port, commodity, volume, or license needed..."
              placeholderTextColor="#64748B"
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={submitServiceInquiry}>
              <Text style={styles.primaryBtnTxt}>Submit & Request Callback</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // --- VIEW 3: 3x3 SERVICE HUB GRID ---
  return (
    <View style={styles.container}>
      <View style={styles.bannerBox}>
        <Text style={styles.bannerTitle}>Service Hub</Text>
        <Text style={styles.bannerSub}>
          Complete Trade Support • 8 Live Desks & 10 Upcoming Modules
        </Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.grid3}>
          {SERVICES.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleCardPress(item)}
              style={[styles.tile, !item.live && styles.tileSoon]}
            >
              {!item.live && (
                <View style={styles.soonPill}>
                  <Text style={styles.soonPillTxt}>Soon</Text>
                </View>
              )}
              <View style={[styles.iconCircle, item.live && styles.iconCircleLive]}>
                <Text style={styles.tileIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.tileTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.footer}>Powered by Apex Sync Technologies</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D12' },
  bannerBox: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: '#121824',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  bannerTitle: { color: '#D9DDE3', fontSize: 17, fontWeight: '800' },
  bannerSub: { color: '#C9B89A', fontSize: 11, marginTop: 3 },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2430',
  },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1A202C',
    borderRadius: 8,
    marginRight: 10,
  },
  backTxt: { color: '#C9B89A', fontWeight: '700', fontSize: 12 },
  subTitle: { color: '#D9DDE3', fontSize: 15, fontWeight: '800', flex: 1 },
  body: { flex: 1 },
  bodyContent: { padding: 12, paddingBottom: 30 },
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '31.5%',
    backgroundColor: '#121620',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#232A38',
    marginBottom: 10,
    position: 'relative',
  },
  tileSoon: { opacity: 0.72, borderColor: '#1A202C' },
  soonPill: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#374151',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  soonPillTxt: { color: '#C9B89A', fontSize: 8, fontWeight: '800' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A202C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconCircleLive: {
    backgroundColor: 'rgba(13,148,136,0.18)',
    borderWidth: 1,
    borderColor: '#0D9488',
  },
  tileIcon: { fontSize: 18 },
  tileTitle: {
    color: '#D9DDE3',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  card: {
    backgroundColor: '#121620',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#232A38',
  },
  label: { color: '#8A8F98', fontSize: 10, fontWeight: '700', marginBottom: 4, marginTop: 6 },
  input: {
    backgroundColor: '#0B0D12',
    color: '#D9DDE3',
    borderWidth: 1,
    borderColor: '#2A3242',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 6,
  },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48.5%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1A202C',
    borderWidth: 1,
    borderColor: '#2D3748',
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: '#0D9488', borderColor: '#14B8A6' },
  chipTxt: { color: '#D9DDE3', fontSize: 11, fontWeight: '600' },
  previewToggleBtn: {
    marginTop: 10,
    backgroundColor: '#1A202C',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  previewToggleTxt: { color: '#14B8A6', fontSize: 12, fontWeight: '700' },
  previewBox: {
    marginTop: 10,
    backgroundColor: '#0B0D12',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0D9488',
  },
  previewCode: { color: '#D9DDE3', fontSize: 11, lineHeight: 16 },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: '#C9B89A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnTxt: { color: '#0B0D12', fontSize: 13, fontWeight: '800' },
  footer: { textAlign: 'center', color: '#8A8F98', fontSize: 11, marginTop: 18 },
});
