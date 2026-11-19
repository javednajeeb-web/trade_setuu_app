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
  { id: 'logistics', title: 'Logistics & Transport', sub: 'Truck, Space, Warehouse', live: true },
  { id: 'tradedocs', title: 'Quotation, PI, LOI & PO', sub: 'Instant Doc Generator', live: true },
  { id: 'shipping', title: 'Shipping & Freight', sub: 'Sea / Air FCL & LCL', live: true },
  { id: 'cha', title: 'CHA & Customs Desk', sub: 'Port Clearance Quote', live: true },
  { id: 'licensing', title: 'Licensing & Compliance', sub: 'IEC, RCMC, FSSAI, Phyto', live: true },
  { id: 'packaging', title: 'Packaging & Printing', sub: 'PP Bags, Boxes, Print', live: true },
  { id: 'eway', title: 'E-Way Bill & Domestic', sub: 'Domestic Transit Docs', live: true },
  { id: 'advisory', title: 'Trade Advisory & Help', sub: '1-on-1 Exim Support', live: true },
  { id: 'finance', title: 'Trade Finance & LC', sub: 'LC & Bill Discounting', live: false },
  { id: 'insurance', title: 'Marine & Cargo Insurance', sub: 'ECGC & Transit Cover', live: false },
  { id: 'inspection', title: 'Lab Testing & Inspection', sub: 'SGS / ICS / Quality', live: false },
  { id: 'certs', title: 'Export Certifications', sub: 'ISO, Halal, Organic', live: false },
  { id: 'merchanting', title: 'Merchanting Trade', sub: '3rd Country Cross-Trade', live: false },
  { id: 'distress', title: 'Distress Cargo Center', sub: 'Port-Stuck Lot Deals', live: false },
  { id: 'capital', title: 'Working Capital Desk', sub: 'Processing Finance', live: false },
  { id: 'dgft', title: 'DGFT & RoDTEP Desk', sub: 'Incentives & Duty Credit', live: false },
  { id: 'legal', title: 'Company & Exim Legal', sub: 'LLP, Pvt Ltd, Contracts', live: false },
  { id: 'blacklist', title: 'Fraud & Blacklist Check', sub: 'Buyer Risk Registry', live: false },
  { id: 'academy', title: 'Exim Training Desk', sub: 'Practical Trade Courses', live: false },
];

const DOC_TYPES = [
  'Quotation / Commercial Offer',
  'Proforma Invoice (PI)',
  'Letter of Intent (LOI)',
  'Purchase Order (PO)',
  'Commercial Invoice',
  'Packing List',
];

export default function ServiceHubScreen({ onOpenLogistics }) {
  const [selectedService, setSelectedService] = useState(null);

  // Trade Document Generator State (Quotation, PI, LOI, PO, CI, PL)
  const [docType, setDocType] = useState('Proforma Invoice (PI)');
  const [docNo, setDocNo] = useState('TS-2026-001');
  const [sellerName, setSellerName] = useState('Trade SETUU Exports Pvt Ltd');
  const [buyerName, setBuyerName] = useState('');
  const [commodity, setCommodity] = useState('Indian Parboiled Rice 5% Broken');
  const [hsCode, setHsCode] = useState('1006.30.10');
  const [quantity, setQuantity] = useState('54 MT (2 x 20ft FCL)');
  const [packing, setPacking] = useState('50 Kg PP Woven Bags');
  const [unitPrice, setUnitPrice] = useState('USD 485 / MT');
  const [incoterm, setIncoterm] = useState('FOB JNPT, India');
  const [paymentTerms, setPaymentTerms] = useState('30% Advance, 70% against Scan BL');
  const [destinationPort, setDestinationPort] = useState('Jebel Ali, UAE');

  // General Service Inquiry State
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [requirement, setRequirement] = useState('');

  const handleCardPress = (item) => {
    if (!item.live) {
      Alert.alert(
        item.title + ' — Coming Soon',
        'Yeh service agle verified phase mein live hogi. Tab tak aap Live Services aur Trade Document Maker ka upyog kar sakte hain.'
      );
      return;
    }
    if (item.id === 'logistics' && onOpenLogistics) {
      onOpenLogistics();
      return;
    }
    setSelectedService(item);
  };

  const generateAndShareDoc = async () => {
    const today = new Date().toLocaleDateString('en-IN');
    const text = [
      '====================================',
      'TRADE SETUU — ' + docType.toUpperCase(),
      '====================================',
      'Document No: ' + docNo,
      'Date: ' + today,
      '------------------------------------',
      'FROM (Seller / Issuer): ' + (sellerName || 'N/A'),
      'TO (Buyer / Receiver): ' + (buyerName || 'Valued Trade Partner'),
      '------------------------------------',
      'COMMODITY: ' + commodity,
      'HS CODE: ' + hsCode,
      'QUANTITY: ' + quantity,
      'PACKAGING: ' + packing,
      'PRICE & TERMS: ' + unitPrice + ' (' + incoterm + ')',
      'DESTINATION PORT: ' + destinationPort,
      'PAYMENT TERMS: ' + paymentTerms,
      '------------------------------------',
      'Generated via Trade SETUU Ecosystem',
      'Powered by Apex Sync Technologies',
    ].join('\n');

    await Share.share({ message: text });
  };

  const submitServiceInquiry = async () => {
    const msg = [
      'TRADE SETUU — SERVICE DESK INQUIRY',
      'Service: ' + selectedService.title,
      'Company: ' + (company || 'N/A'),
      'Contact: ' + (phone || 'N/A'),
      'Details: ' + (requirement || 'Need quotation & assistance'),
      'Powered by Apex Sync Technologies',
    ].join('\n');

    Alert.alert(
      'Inquiry Submitted',
      selectedService.title + ' ke liye aapki request log ho gayi hai.',
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

  // --- VIEW 1: QUOTATION, PI, LOI, PO GENERATOR ---
  if (selectedService && selectedService.id === 'tradedocs') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Back</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>TRADE DOCS GENERATOR</Text>
            <Text style={styles.subtitle}>Quotation • PI • LOI • PO • Invoice</Text>
          </View>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.card}>
            <Text style={styles.label}>Select Document Type</Text>
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

            <Text style={styles.label}>Document / Reference Number</Text>
            <TextInput style={styles.input} value={docNo} onChangeText={setDocNo} />

            <Text style={styles.label}>Seller / Exporter Company Name</Text>
            <TextInput style={styles.input} value={sellerName} onChangeText={setSellerName} />

            <Text style={styles.label}>Buyer / Importer Company Name</Text>
            <TextInput
              style={styles.input}
              value={buyerName}
              onChangeText={setBuyerName}
              placeholder="Enter Buyer / Party Name"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.label}>Product / Commodity Description</Text>
            <TextInput style={styles.input} value={commodity} onChangeText={setCommodity} />

            <View style={styles.gridRow}>
              <View style={styles.half}>
                <Text style={styles.label}>HS Code</Text>
                <TextInput style={styles.input} value={hsCode} onChangeText={setHsCode} />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} />
              </View>
            </View>

            <Text style={styles.label}>Packaging Specification</Text>
            <TextInput style={styles.input} value={packing} onChangeText={setPacking} />

            <View style={styles.gridRow}>
              <View style={styles.half}>
                <Text style={styles.label}>Rate / Unit Price</Text>
                <TextInput style={styles.input} value={unitPrice} onChangeText={setUnitPrice} />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Incoterms & Load Port</Text>
                <TextInput style={styles.input} value={incoterm} onChangeText={setIncoterm} />
              </View>
            </View>

            <Text style={styles.label}>Destination Port / Country</Text>
            <TextInput style={styles.input} value={destinationPort} onChangeText={setDestinationPort} />

            <Text style={styles.label}>Payment Terms (LC / Advance / TT)</Text>
            <TextInput style={styles.input} value={paymentTerms} onChangeText={setPaymentTerms} />

            <TouchableOpacity style={styles.primaryBtn} onPress={generateAndShareDoc}>
              <Text style={styles.primaryBtnTxt}>
                Generate & Share {docType.split(' ')[0]}
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
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Back</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{selectedService.title.toUpperCase()}</Text>
            <Text style={styles.subtitle}>{selectedService.sub}</Text>
          </View>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.card}>
            <Text style={styles.label}>Your Company / Firm Name</Text>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="e.g. Global Agro Exports"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.label}>WhatsApp / Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+91..."
              placeholderTextColor="#64748B"
            />
            <Text style={styles.label}>Requirement Details (Port, Product, Qty)</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              value={requirement}
              onChangeText={setRequirement}
              multiline
              placeholder="Write your requirement here..."
              placeholderTextColor="#64748B"
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={submitServiceInquiry}>
              <Text style={styles.primaryBtnTxt}>Request Callback & Quote</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // --- VIEW 3: MAIN SERVICE HUB GRID ---
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SERVICE HUB</Text>
        <Text style={styles.subtitle}>
          8 Live Trade Desks • 11 Upcoming Ecosystem Modules
        </Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.grid}>
          {SERVICES.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleCardPress(item)}
              style={[styles.gridItem, !item.live && styles.gridItemSoon]}
            >
              <View style={styles.badgeRow}>
                <View style={[styles.badge, item.live ? styles.badgeLive : styles.badgeSoon]}>
                  <Text style={styles.badgeTxt}>{item.live ? 'LIVE' : 'SOON'}</Text>
                </View>
              </View>
              <Text style={styles.gridTitle}>{item.title}</Text>
              <Text style={styles.gridSub}>{item.sub}</Text>
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
  header: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2430',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2430',
  },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1A202C',
    borderRadius: 8,
    marginRight: 12,
  },
  backTxt: { color: '#C9B89A', fontWeight: '700', fontSize: 13 },
  title: { color: '#D9DDE3', fontSize: 17, fontWeight: '800', letterSpacing: 0.8 },
  subtitle: { color: '#C9B89A', fontSize: 12, marginTop: 2 },
  body: { flex: 1 },
  bodyContent: { padding: 12, paddingBottom: 36 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48.5%',
    backgroundColor: '#121620',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#232A38',
    marginBottom: 10,
  },
  gridItemSoon: { opacity: 0.72, borderColor: '#1E2430' },
  badgeRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeLive: { backgroundColor: '#0D9488' },
  badgeSoon: { backgroundColor: '#374151' },
  badgeTxt: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  gridTitle: { color: '#D9DDE3', fontSize: 13, fontWeight: '700', marginBottom: 3 },
  gridSub: { color: '#8A8F98', fontSize: 11 },
  card: {
    backgroundColor: '#121620',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#232A38',
  },
  label: { color: '#8A8F98', fontSize: 11, fontWeight: '600', marginBottom: 4, marginTop: 6 },
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
    paddingHorizontal: 10,
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
