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

const SERVICES = [
  { id: 'logistics', icon: '🚛', title: 'Global Logistics Hub', live: true },
  { id: 'tradedocs', icon: '📄', title: 'Setuu DocForge', live: true },
  { id: 'portrescue', icon: '🚨', title: 'Port Rescue', live: true },
  { id: 'shipping', icon: '🚢', title: 'Shipping & Freight', live: true },
  { id: 'cha', icon: '🛃', title: 'CHA & Customs', live: true },
  { id: 'licensing', icon: '📋', title: 'IEC & Compliance', live: true },
  { id: 'packaging', icon: '📦', title: 'Packaging & Print', live: true },
  { id: 'eway', icon: '🧾', title: 'E-Way & Domestic', live: true },
  { id: 'contactus', icon: '📞', title: 'Contact Us', live: true },
  { id: 'finance', icon: '🏦', title: 'Trade Finance', live: false },
  { id: 'insurance', icon: '🛡️', title: 'Marine Insurance', live: false },
  { id: 'inspection', icon: '🔬', title: 'Lab & Inspection', live: false },
  { id: 'certs', icon: '🏅', title: 'Certifications', live: false },
  { id: 'merchanting', icon: '🌐', title: 'Merchanting Trade', live: false },
  { id: 'capital', icon: '💼', title: 'Working Capital', live: false },
  { id: 'dgft', icon: '🏛️', title: 'DGFT & RoDTEP', live: false },
  { id: 'legal', icon: '⚖️', title: 'Exim Legal Desk', live: false },
  { id: 'blacklist', icon: '🚫', title: 'Blacklist Check', live: false },
];

const PORT_RESCUE_LOTS = [
  {
    id: 'PR-01',
    title: 'Port-Stuck Lot: 2 x 20ft Parboiled Rice (52 MT)',
    port: 'JNPT Nhava Sheva CFS • Ready Docs',
    discount: 'USD 415 / MT (12% Distress Discount)',
    reason: 'Original Buyer LC Delay — Immediate Re-routing Available',
  },
  {
    id: 'PR-02',
    title: 'Urgent Lot: 1 x 40ft Reefer Cavendish Banana (1,540 Boxes)',
    port: 'Mundra Port Cold Yard',
    discount: 'USD 560 / MT Spot Deal',
    reason: 'Vessel Roll-over — Immediate Gulf / Iran Dispatch',
  },
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

export default function ServiceHubScreen({ theme, onOpenLogistics, onEarnPoints }) {
  const T = theme || DEFAULT_THEME;
  const [selectedService, setSelectedService] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [docType, setDocType] = useState('Proforma Invoice (PI)');
  const [currency, setCurrency] = useState('USD');
  const [docNo, setDocNo] = useState('TS-2026-001');
  const [sellerName, setSellerName] = useState('Trade SETUU Overseas');
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

  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('General Trade Support');
  const [requirement, setRequirement] = useState('');

  const sendWhatsAppText = async (msg) => {
    const url = 'whatsapp://send?text=' + encodeURIComponent(msg);
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url);
    else Share.share({ message: msg });
  };

  const handleCardPress = (item) => {
    if (!item.live) {
      Alert.alert(
        item.title + ' — Coming Soon',
        'Yeh module agle verified phase mein live hoga. Tab tak aap Live Services aur Setuu DocForge ka upyog kar sakte hain.'
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
      'TRADE SETUU (Setuu DocForge) — ' + docType.toUpperCase(),
      '====================================',
      'Ref No: ' + docNo + '   |   Date: ' + today,
      '------------------------------------',
      'ISSUER / SELLER:',
      sellerName || 'N/A',
      iecGst,
      '------------------------------------',
      'RECEIVER / BUYER:',
      buyerName || 'Valued Trade Partner',
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
      'Powered by Apex Sync Technologies',
    ].join('\n');
  };
        if (selectedService && selectedService.id === 'tradedocs') {
    return (
      <View style={[styles.container, { backgroundColor: T.bg }]}>
        <View style={[styles.subHeader, { backgroundColor: T.navy }]}>
          <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Services</Text>
          </TouchableOpacity>
          <Text style={styles.subTitle}>Setuu DocForge</Text>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.label, { color: T.subText }]}>1. SELECT DOCUMENT TYPE</Text>
            <View style={styles.chipRow}>
              {DOC_TYPES.map((dt) => (
                <TouchableOpacity
                  key={dt}
                  onPress={() => setDocType(dt)}
                  style={[
                    styles.chip,
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    docType === dt && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: docType === dt ? '#FFF' : T.text, fontSize: 11, fontWeight: '600' }}>{dt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: T.subText }]}>2. CURRENCY & REFERENCE NO.</Text>
            <View style={styles.chipRow}>
              {CURRENCIES.map((cur) => (
                <TouchableOpacity
                  key={cur}
                  onPress={() => setCurrency(cur)}
                  style={[
                    styles.chip,
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    currency === cur && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: currency === cur ? '#FFF' : T.text, fontSize: 11, fontWeight: '700' }}>{cur}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={docNo} onChangeText={setDocNo} />

            <Text style={[styles.label, { color: T.subText }]}>SELLER / EXPORTER NAME</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={sellerName} onChangeText={setSellerName} />

            <Text style={[styles.label, { color: T.subText }]}>IEC & GSTIN DETAILS</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={iecGst} onChangeText={setIecGst} />

            <Text style={[styles.label, { color: T.subText }]}>BUYER / IMPORTER PARTY NAME</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={buyerName} onChangeText={setBuyerName} placeholder="Enter Buyer Company Name" placeholderTextColor={T.subText} />

            <Text style={[styles.label, { color: T.subText }]}>COMMODITY & SPECIFICATION</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={commodity} onChangeText={setCommodity} />

            <View style={styles.gridRow}>
              <View style={styles.half}>
                <Text style={[styles.label, { color: T.subText }]}>HS CODE</Text>
                <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={hsCode} onChangeText={setHsCode} />
              </View>
              <View style={styles.half}>
                <Text style={[styles.label, { color: T.subText }]}>QUANTITY</Text>
                <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={quantity} onChangeText={setQuantity} />
              </View>
            </View>

            <Text style={[styles.label, { color: T.subText }]}>PACKAGING</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={packing} onChangeText={setPacking} />

            <View style={styles.gridRow}>
              <View style={styles.half}>
                <Text style={[styles.label, { color: T.subText }]}>RATE ({currency})</Text>
                <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={unitPrice} onChangeText={setUnitPrice} />
              </View>
              <View style={styles.half}>
                <Text style={[styles.label, { color: T.subText }]}>INCOTERMS & PORT</Text>
                <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={incoterm} onChangeText={setIncoterm} />
              </View>
            </View>

            <Text style={[styles.label, { color: T.subText }]}>DESTINATION PORT</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={destinationPort} onChangeText={setDestinationPort} />

            <Text style={[styles.label, { color: T.subText }]}>PAYMENT TERMS</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={paymentTerms} onChangeText={setPaymentTerms} />

            <Text style={[styles.label, { color: T.subText }]}>BANK / AD CODE DETAILS</Text>
            <TextInput style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={bankDetails} onChangeText={setBankDetails} />

            <TouchableOpacity
              style={[styles.previewToggleBtn, { backgroundColor: T.inputBg, borderColor: T.border }]}
              onPress={() => setShowPreview(!showPreview)}
            >
              <Text style={[styles.previewToggleTxt, { color: T.teal }]}>
                {showPreview ? 'Hide Document Preview ▲' : 'Preview Formatted Document ▼'}
              </Text>
            </TouchableOpacity>

            {showPreview && (
              <View style={[styles.previewBox, { backgroundColor: T.inputBg, borderColor: T.teal }]}>
                <Text style={[styles.previewCode, { color: T.text }]}>{buildDocText()}</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', marginTop: 14, gap: 8 }}>
              <TouchableOpacity
                style={[styles.waBtn, { flex: 2 }]}
                onPress={() => {
                  if (onEarnPoints) onEarnPoints(20);
                  sendWhatsAppText(buildDocText());
                }}
              >
                <Text style={styles.waBtnTxt}>💬 Send on WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1, marginTop: 0, backgroundColor: T.gold }]}
                onPress={() => {
                  if (onEarnPoints) onEarnPoints(20);
                  Share.share({ message: buildDocText() });
                }}
              >
                <Text style={styles.primaryBtnTxt}>↗ Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
  if (selectedService && selectedService.id === 'portrescue') {
    return (
      <View style={[styles.container, { backgroundColor: T.bg }]}>
        <View style={[styles.subHeader, { backgroundColor: T.navy }]}>
          <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Services</Text>
          </TouchableOpacity>
          <Text style={styles.subTitle}>Port Rescue • Urgent Cargo</Text>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {PORT_RESCUE_LOTS.map((lot) => (
            <View key={lot.id} style={[styles.card, { backgroundColor: T.card, borderColor: T.border, marginBottom: 12 }]}>
              <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>
                🚨 URGENT PORT-STUCK LOT • {lot.id}
              </Text>
              <Text style={{ color: T.text, fontSize: 15, fontWeight: '800' }}>{lot.title}</Text>
              <Text style={{ color: T.subText, fontSize: 12, marginTop: 4 }}>{lot.port}</Text>
              <Text style={{ color: T.teal, fontSize: 14, fontWeight: '800', marginTop: 6 }}>{lot.discount}</Text>
              <Text style={{ color: T.gold, fontSize: 11, marginTop: 4 }}>{lot.reason}</Text>
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                <TouchableOpacity
                  style={[styles.waBtn, { flex: 2 }]}
                  onPress={() =>
                    sendWhatsAppText(
                      'TRADE SETUU — PORT RESCUE INQUIRY:\nLot: ' +
                        lot.title +
                        '\nLocation: ' +
                        lot.port +
                        '\nOffer: ' +
                        lot.discount
                    )
                  }
                >
                  <Text style={styles.waBtnTxt}>💬 Claim Lot on WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1, marginTop: 0, backgroundColor: T.gold }]}
                  onPress={() => Share.share({ message: lot.title + ' — ' + lot.discount })}
                >
                  <Text style={styles.primaryBtnTxt}>↗ Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (selectedService && selectedService.id === 'contactus') {
    return (
      <View style={[styles.container, { backgroundColor: T.bg }]}>
        <View style={[styles.subHeader, { backgroundColor: T.navy }]}>
          <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Services</Text>
          </TouchableOpacity>
          <Text style={styles.subTitle}>Contact Us & Trade Desk</Text>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border, marginBottom: 12 }]}>
            <Text style={{ color: T.text, fontSize: 16, fontWeight: '800', marginBottom: 6 }}>
              Trade SETUU Support & Partner Desk
            </Text>
            <Text style={{ color: T.subText, fontSize: 12, marginBottom: 12 }}>
              Mon – Sat • 10:00 AM to 7:00 PM IST (Priority CHA & Shipment Desk)
            </Text>

            <TouchableOpacity
              style={[styles.waBtn, { marginBottom: 12 }]}
              onPress={() =>
                sendWhatsAppText('Hello Trade SETUU Team, I need assistance with my trade account.')
              }
            >
              <Text style={styles.waBtnTxt}>💬 Chat Directly on WhatsApp</Text>
            </TouchableOpacity>

            <Text style={{ color: T.text, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>
              📧 Support Email: support@tradesetuu.com
            </Text>
            <Text style={{ color: T.text, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>
              🤝 Partnerships & Shipping Lines: partners@tradesetuu.com
            </Text>
            <Text style={{ color: T.gold, fontSize: 12, fontWeight: '700', marginTop: 4 }}>
              📍 HQ: Raipur, Chhattisgarh, India
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={{ color: T.text, fontSize: 15, fontWeight: '800', marginBottom: 8 }}>
              Send Testing Feedback / Inquiry
            </Text>
            <View style={styles.chipRow}>
              {['General Trade Support', 'Beta Testing Feedback', 'CHA / Logistics Help', 'Partner Onboarding'].map((tp) => (
                <TouchableOpacity
                  key={tp}
                  onPress={() => setTopic(tp)}
                  style={[
                    styles.chip,
                    { backgroundColor: T.inputBg, borderColor: T.border },
                    topic === tp && { backgroundColor: T.teal, borderColor: T.teal },
                  ]}
                >
                  <Text style={{ color: topic === tp ? '#FFF' : T.text, fontSize: 11 }}>{tp}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]}
              value={company}
              onChangeText={setCompany}
              placeholder="Your Name / Company"
              placeholderTextColor={T.subText}
            />
            <TextInput
              style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border, height: 80, textAlignVertical: 'top' }]}
              value={requirement}
              onChangeText={setRequirement}
              multiline
              placeholder="Write your message or bug/feature suggestion..."
              placeholderTextColor={T.subText}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: T.gold }]}
              onPress={() => {
                if (onEarnPoints) onEarnPoints(10);
                Alert.alert('Message Sent (+10 Loyalty Pts)', 'Aapka feedback Trade SETUU team ko bhej diya gaya hai.');
                setRequirement('');
              }}
            >
              <Text style={styles.primaryBtnTxt}>Submit Message</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.footer, { color: T.subText }]}>Powered by Apex Sync Technologies</Text>
        </ScrollView>
      </View>
    );
  }
  if (selectedService) {
    return (
      <View style={[styles.container, { backgroundColor: T.bg }]}>
        <View style={[styles.subHeader, { backgroundColor: T.navy }]}>
          <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Services</Text>
          </TouchableOpacity>
          <Text style={styles.subTitle}>{selectedService.title}</Text>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.label, { color: T.subText }]}>YOUR COMPANY / FIRM NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]}
              value={company}
              onChangeText={setCompany}
              placeholder="e.g. Global Agro Exports"
              placeholderTextColor={T.subText}
            />
            <Text style={[styles.label, { color: T.subText }]}>WHATSAPP / MOBILE NUMBER</Text>
            <TextInput
              style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+91..."
              placeholderTextColor={T.subText}
            />
            <Text style={[styles.label, { color: T.subText }]}>REQUIREMENT DETAILS</Text>
            <TextInput
              style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border, height: 90, textAlignVertical: 'top' }]}
              value={requirement}
              onChangeText={setRequirement}
              multiline
              placeholder="Mention port, commodity, volume, or license needed..."
              placeholderTextColor={T.subText}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: T.gold }]}
              onPress={() => {
                if (onEarnPoints) onEarnPoints(15);
                const msg =
                  'TRADE SETUU — ' +
                  selectedService.title.toUpperCase() +
                  '\nCompany: ' +
                  (company || 'N/A') +
                  '\nPhone: ' +
                  (phone || 'N/A') +
                  '\nDetails: ' +
                  (requirement || 'Need support');
                Alert.alert('Request Logged (+15 Loyalty Pts)', 'Direct WhatsApp par share karein?', [
                  { text: 'Done', onPress: () => setSelectedService(null) },
                  {
                    text: 'WhatsApp',
                    onPress: () => {
                      sendWhatsAppText(msg);
                      setSelectedService(null);
                    },
                  },
                ]);
              }}
            >
              <Text style={styles.primaryBtnTxt}>Submit & Request Quote</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <View style={[styles.bannerBox, { backgroundColor: T.navy }]}>
        <Text style={styles.bannerTitle}>Service Hub</Text>
        <Text style={styles.bannerSub}>
          9 Live Trade Desks • 9 Upcoming Ecosystem Modules
        </Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.grid3}>
          {SERVICES.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleCardPress(item)}
              style={[
                styles.tile,
                { backgroundColor: T.card, borderColor: T.border },
                !item.live && { opacity: 0.68 },
              ]}
            >
              {!item.live && (
                <View style={styles.soonPill}>
                  <Text style={styles.soonPillTxt}>Soon</Text>
                </View>
              )}
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: T.inputBg },
                  item.live && { backgroundColor: 'rgba(13,148,136,0.18)', borderWidth: 1, borderColor: T.teal },
                ]}
              >
                <Text style={styles.tileIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.tileTitle, { color: T.text }]} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.footer, { color: T.subText }]}>Powered by Apex Sync Technologies</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerBox: { marginHorizontal: 14, marginTop: 12, marginBottom: 4, borderRadius: 12, padding: 14 },
  bannerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  bannerSub: { color: '#C9B89A', fontSize: 11, marginTop: 3 },
  subHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, marginRight: 10 },
  backTxt: { color: '#C9B89A', fontWeight: '700', fontSize: 12 },
  subTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', flex: 1 },
  body: { flex: 1 },
  bodyContent: { padding: 12, paddingBottom: 30 },
  grid3: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { width: '31.5%', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', borderWidth: 1, marginBottom: 10, position: 'relative' },
  soonPill: { position: 'absolute', top: 5, right: 5, backgroundColor: '#374151', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 },
  soonPillTxt: { color: '#C9B89A', fontSize: 8, fontWeight: '800' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  tileIcon: { fontSize: 18 },
  tileTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1 },
  label: { fontSize: 10, fontWeight: '700', marginBottom: 4, marginTop: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, marginBottom: 6 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48.5%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  chip: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginRight: 6, marginBottom: 6 },
  previewToggleBtn: { marginTop: 10, paddingVertical: 9, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  previewToggleTxt: { fontSize: 12, fontWeight: '700' },
  previewBox: { marginTop: 10, padding: 12, borderRadius: 8, borderWidth: 1 },
  previewCode: { fontSize: 11, lineHeight: 16 },
  waBtn: { backgroundColor: '#16A34A', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  waBtnTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  primaryBtn: { marginTop: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  primaryBtnTxt: { color: '#0B0D12', fontSize: 13, fontWeight: '800' },
  footer: { textAlign: 'center', fontSize: 11, marginTop: 18 },
});
