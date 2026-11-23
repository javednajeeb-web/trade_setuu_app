import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const LAB_CATEGORIES = [
  'All Categories',
  'Food & Agriculture',
  'Rice, Grain & Cereal',
  'Spices & Commodity',
  'Chemical & Petroleum',
  'Microbiology & Water',
  'Textile & Packaging',
  'Heavy Metals & Residue',
];

const SAMPLE_LABS = [
  {
    id: 'LAB-101',
    name: 'Global Agro & Grain Analytical Lab',
    country: 'United Arab Emirates',
    city: 'Dubai (Jebel Ali)',
    category: 'Rice, Grain & Cereal',
    accreditation: 'ISO/IEC 17025 • EIAC',
    validity: 'Valid till Dec 2027',
    turnaround: '2–4 Business Days',
    priceRange: '$140 – $320',
    pickup: 'DHL / FedEx / Local Courier',
    status: 'Verified Partner',
  },
  {
    id: 'LAB-102',
    name: 'EuroSpec Residue & Food Testing Centre',
    country: 'Netherlands',
    city: 'Rotterdam',
    category: 'Heavy Metals & Residue',
    accreditation: 'ISO/IEC 17025 • RvA',
    validity: 'Valid till Aug 2027',
    turnaround: '3–5 Business Days',
    priceRange: '€180 – €450',
    pickup: 'Courier / Port Drop-off',
    status: 'Verified Partner',
  },
  {
    id: 'LAB-103',
    name: 'Pacific Commodity & Polymer Lab',
    country: 'Singapore',
    city: 'Singapore',
    category: 'Chemical & Petroleum',
    accreditation: 'ISO/IEC 17025 • SAC-SINGLAS',
    validity: 'Valid till Nov 2027',
    turnaround: '2–3 Business Days',
    priceRange: 'S$190 – S$410',
    pickup: 'Express Pickup Available',
    status: 'Verified Partner',
  },
  {
    id: 'LAB-104',
    name: 'Atlas Spices & Micro Quality Lab',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    category: 'Spices & Commodity',
    accreditation: 'ISO/IEC 17025 • BoA',
    validity: 'Valid till May 2027',
    turnaround: '2–4 Business Days',
    priceRange: '$110 – $260',
    pickup: 'Factory / Courier Pickup',
    status: 'Verified Partner',
  },
];

const SAMPLE_AGENCIES = [
  {
    id: 'AGY-201',
    name: 'Meridian Global Inspection & Tally',
    region: 'Middle East & Asia Ports',
    scope: 'PSI, Loading Supervision, Container & Weight Tally',
    rate: 'From $220 / inspection',
    status: 'Verified Agency',
  },
  {
    id: 'AGY-202',
    name: 'Continental Quality & Factory Audit',
    region: 'Europe & Global Trade Lanes',
    scope: 'Pre-Dispatch, Factory Audit, Seal & Spec Check',
    rate: 'From €260 / inspection',
    status: 'Verified Agency',
  },
  {
    id: 'AGY-203',
    name: 'Independent Commodity Surveyors Network',
    region: 'Multi-Country Coverage',
    scope: 'Draft Survey, Stuffing Check & Cargo Condition',
    rate: 'Custom Quote',
    status: 'Verified Network',
  },
];

const SAMPLE_REPORTS = [
  {
    id: 'COA-8841',
    title: 'Certificate of Analysis (Moisture, Foreign Matter, Aflatoxin)',
    lab: 'Global Agro & Grain Analytical Lab',
    date: '18 Nov 2026',
    status: 'Issued by Lab',
  },
  {
    id: 'PSI-5519',
    title: 'Pre-Shipment & Container Stuffing Inspection Report',
    lab: 'Meridian Global Inspection & Tally',
    date: '14 Nov 2026',
    status: 'Issued by Agency',
  },
];

const INSPECTION_TYPES = [
  'Pre-Shipment (PSI)',
  'Pre-Dispatch',
  'Factory / Warehouse',
  'Loading Supervision',
  'Quantity / Weight / Quality',
  'Container Inspection',
];

export default function SetuVerifyScreen({ onBack }) {
  const [topMode, setTopMode] = useState('CLIENT'); // CLIENT | ONBOARDING | PARTNER_DESK
  const [activeTool, setActiveTool] = useState('FIND_LAB'); // FIND_LAB | BOOK_INSPECTION | LAB_TESTING | AGENCIES | SAMPLE_EXPRESS | REPORTS

  // Find Lab filters
  const [labSearch, setLabSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLabId, setSelectedLabId] = useState('LAB-101');

  // Book Inspection form
  const [inspType, setInspType] = useState('Pre-Shipment (PSI)');
  const [inspCommodity, setInspCommodity] = useState('');
  const [inspQuantity, setInspQuantity] = useState('');
  const [inspOrigin, setInspOrigin] = useState('');
  const [inspLocation, setInspLocation] = useState('');
  const [inspDate, setInspDate] = useState('');
  const [inspNotes, setInspNotes] = useState('');

  // Lab Testing workflow
  const [testCommodity, setTestCommodity] = useState('');
  const [testParameters, setTestParameters] = useState('');
  const [testCountry, setTestCountry] = useState('');
  const [testStage, setTestStage] = useState(1); // 1..4 quick status step

  // Sample Express (DHL / FedEx / Express Logistics)
  const [sampleCommodity, setSampleCommodity] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [destLab, setDestLab] = useState('Global Agro & Grain Analytical Lab (Dubai)');
  const [courierProvider, setCourierProvider] = useState('DHL Express');
  const [sampleRefId, setSampleRefId] = useState('SV-SMP-7042');
  const [awbNumber, setAwbNumber] = useState('');

  // Partner Onboarding state
  const [partnerKind, setPartnerKind] = useState('LAB'); // LAB | INSPECTION
  const [partnerName, setPartnerName] = useState('');
  const [partnerCountry, setPartnerCountry] = useState('');
  const [partnerCert, setPartnerCert] = useState('');
  const [partnerScope, setPartnerScope] = useState('');
  const [submittedPartners, setSubmittedPartners] = useState([]);

  const filteredLabs = useMemo(() => {
    return SAMPLE_LABS.filter((lab) => {
      const matchesCat =
        selectedCategory === 'All Categories' || lab.category === selectedCategory;
      const q = labSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        lab.name.toLowerCase().includes(q) ||
        lab.country.toLowerCase().includes(q) ||
        lab.city.toLowerCase().includes(q) ||
        lab.accreditation.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [labSearch, selectedCategory]);

  const handleCreateInspection = () => {
    if (!inspCommodity.trim() || !inspLocation.trim()) {
      Alert.alert(
        'Required Details',
        'Please enter Commodity / Product and Inspection Location.'
      );
      return;
    }
    Alert.alert(
      'Inspection Request Drafted',
      `${inspType} for "${inspCommodity.trim()}" at ${inspLocation.trim()} is ready for agency matching.`
    );
  };

  const handleSubmitLabRequest = () => {
    if (!testCommodity.trim() || !testParameters.trim()) {
      Alert.alert(
        'Required Details',
        'Please enter Product / Commodity and Required Test Parameters.'
      );
      return;
    }
    setTestStage(2);
    Alert.alert(
      'Testing Request Submitted',
      `Quote request prepared for "${testCommodity.trim()}" (${testParameters.trim()}).`
    );
  };

  const handleGenerateSampleRef = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newRef = `SV-SMP-${randomCode}`;
    setSampleRefId(newRef);
    setAwbNumber(`${courierProvider.slice(0, 3).toUpperCase()}-${randomCode}8891`);
    Alert.alert(
      'Sample Dispatch Prepared',
      `Sample ID ${newRef} created with ${courierProvider} via Express Logistics.`
    );
  };

  const handlePartnerSubmit = () => {
    if (!partnerName.trim() || !partnerCountry.trim()) {
      Alert.alert(
        'Missing Info',
        'Please enter Organization / Inspector Name and Country.'
      );
      return;
    }
    const newEntry = {
      id: `APP-${Date.now().toString().slice(-4)}`,
      kind: partnerKind === 'LAB' ? 'Laboratory Partner' : 'Inspection Partner',
      name: partnerName.trim(),
      country: partnerCountry.trim(),
      cert: partnerCert.trim() || 'Details Provided',
      scope: partnerScope.trim() || 'General Trade Scope',
      status: 'Pending Platform Verification',
    };
    setSubmittedPartners((prev) => [newEntry, ...prev]);
    setPartnerName('');
    setPartnerCountry('');
    setPartnerCert('');
    setPartnerScope('');
    Alert.alert(
      'Application Submitted',
      'Your application is queued under Pending Platform Verification.'
    );
  };

  const renderDashboardCards = () => {
    const cards = [
      {
        key: 'FIND_LAB',
        title: '1. Find a Lab',
        desc: 'Global directory, country/city, category & ISO 17025 filters',
      },
      {
        key: 'BOOK_INSPECTION',
        title: '2. Book Inspection',
        desc: 'PSI, pre-dispatch, factory, loading, weight & container checks',
      },
      {
        key: 'LAB_TESTING',
        title: '3. Lab Testing',
        desc: 'Select commodity, tests, compare labs & track progress',
      },
      {
        key: 'AGENCIES',
        title: '4. Inspection Agencies',
        desc: 'Global agencies, regional firms & independent inspectors',
      },
      {
        key: 'SAMPLE_EXPRESS',
        title: '5. Sample Express',
        desc: 'Sample ID, pickup & Express Logistics (DHL / FedEx)',
      },
      {
        key: 'REPORTS',
        title: '6. Reports & COA',
        desc: 'COAs, inspection reports, history & issuer verification',
      },
    ];

    return (
      <View style={styles.grid}>
        {cards.map((item) => {
          const isSelected = activeTool === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.gridCard, isSelected && styles.gridCardActive]}
              onPress={() => setActiveTool(item.key)}
            >
              <Text style={styles.gridTitle}>{item.title}</Text>
              <Text style={styles.gridDesc}>{item.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderActiveTool = () => {
    if (activeTool === 'FIND_LAB') {
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Global Laboratory Network</Text>
          <TextInput
            style={styles.input}
            placeholder="Search by country, city, lab name or ISO 17025..."
            placeholderTextColor="#7C8BA1"
            value={labSearch}
            onChangeText={setLabSearch}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {LAB_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filteredLabs.map((lab) => {
            const isPicked = selectedLabId === lab.id;
            return (
              <TouchableOpacity
                key={lab.id}
                style={[styles.listCard, isPicked && styles.listCardSelected]}
                onPress={() => setSelectedLabId(lab.id)}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>{lab.name}</Text>
                  <Text style={styles.badgeLight}>{lab.status}</Text>
                </View>
                <Text style={styles.itemMeta}>
                  {lab.city}, {lab.country} • {lab.category}
                </Text>
                <Text style={styles.itemMeta}>
                  {lab.accreditation} ({lab.validity})
                </Text>
                <Text style={styles.itemHighlight}>
                  TAT: {lab.turnaround} • Est. {lab.priceRange} • {lab.pickup}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (activeTool === 'BOOK_INSPECTION') {
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Book Third-Party Inspection</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {INSPECTION_TYPES.map((t) => {
              const active = inspType === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setInspType(t)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TextInput
            style={styles.input}
            placeholder="Product / Commodity (e.g., Basmati Rice, Maize, Textiles)"
            placeholderTextColor="#7C8BA1"
            value={inspCommodity}
            onChangeText={setInspCommodity}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantity & Packaging (e.g., 500 MT in 50kg PP bags)"
            placeholderTextColor="#7C8BA1"
            value={inspQuantity}
            onChangeText={setInspQuantity}
          />
          <TextInput
            style={styles.input}
            placeholder="Country of Origin (e.g., India, Vietnam, Brazil)"
            placeholderTextColor="#7C8BA1"
            value={inspOrigin}
            onChangeText={setInspOrigin}
          />
          <TextInput
            style={styles.input}
            placeholder="Inspection Location / Port / Plant"
            placeholderTextColor="#7C8BA1"
            value={inspLocation}
            onChangeText={setInspLocation}
          />
          <TextInput
            style={styles.input}
            placeholder="Preferred Inspection Date (e.g., 28 Nov 2026)"
            placeholderTextColor="#7C8BA1"
            value={inspDate}
            onChangeText={setInspDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Standards / Special Instructions"
            placeholderTextColor="#7C8BA1"
            value={inspNotes}
            onChangeText={setInspNotes}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateInspection}>
            <Text style={styles.primaryBtnText}>Prepare Inspection Booking</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTool === 'LAB_TESTING') {
      const stages = [
        '1. Request & Scope',
        '2. Sample Dispatch',
        '3. Testing in Lab',
        '4. COA Ready',
      ];
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Lab Testing & Quotation Workflow</Text>
          <TextInput
            style={styles.input}
            placeholder="Select / Enter Commodity (e.g., White Rice, Spices, Polymer)"
            placeholderTextColor="#7C8BA1"
            value={testCommodity}
            onChangeText={setTestCommodity}
          />
          <TextInput
            style={styles.input}
            placeholder="Required Tests / Parameters (e.g., Moisture, Ash, Heavy Metals)"
            placeholderTextColor="#7C8BA1"
            value={testParameters}
            onChangeText={setTestParameters}
          />
          <TextInput
            style={styles.input}
            placeholder="Target Lab Country (e.g., UAE, Singapore, Netherlands)"
            placeholderTextColor="#7C8BA1"
            value={testCountry}
            onChangeText={setTestCountry}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmitLabRequest}>
            <Text style={styles.primaryBtnText}>Request Testing Quotation</Text>
          </TouchableOpacity>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Testing Progress Tracker</Text>
            {stages.map((st, idx) => {
              const stepNum = idx + 1;
              const done = stepNum <= testStage;
              return (
                <Text
                  key={st}
                  style={[styles.stepText, done && styles.stepTextActive]}
                >
                  {done ? '✓ ' : '• '}
                  {st}
                </Text>
              );
            })}
          </View>
        </View>
      );
    }

    if (activeTool === 'AGENCIES') {
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Global Inspection Agencies & Surveyors</Text>
          {SAMPLE_AGENCIES.map((ag) => (
            <View key={ag.id} style={styles.listCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.itemTitle}>{ag.name}</Text>
                <Text style={styles.badgeLight}>{ag.status}</Text>
              </View>
              <Text style={styles.itemMeta}>Coverage: {ag.region}</Text>
              <Text style={styles.itemMeta}>{ag.scope}</Text>
              <Text style={styles.itemHighlight}>{ag.rate}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (activeTool === 'SAMPLE_EXPRESS') {
      const couriers = ['DHL Express', 'FedEx Express', 'Trade SETUU Express'];
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>
            Sample Management & Express Logistics
          </Text>
          <Text style={styles.itemMeta}>
            Connected with global express couriers (DHL, FedEx & Express Logistics).
          </Text>

          <View style={styles.rowWrap}>
            {couriers.map((c) => {
              const active = courierProvider === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCourierProvider(c)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Sample Commodity & Batch / Lot Ref"
            placeholderTextColor="#7C8BA1"
            value={sampleCommodity}
            onChangeText={setSampleCommodity}
          />
          <TextInput
            style={styles.input}
            placeholder="Pickup Address (Factory / Warehouse / City)"
            placeholderTextColor="#7C8BA1"
            value={pickupAddress}
            onChangeText={setPickupAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Destination Laboratory"
            placeholderTextColor="#7C8BA1"
            value={destLab}
            onChangeText={setDestLab}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerateSampleRef}>
            <Text style={styles.primaryBtnText}>
              Generate Sample ID & Express AWB
            </Text>
          </TouchableOpacity>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Sample Dispatch Pass</Text>
            <Text style={styles.itemMeta}>Sample Reference ID: {sampleRefId}</Text>
            <Text style={styles.itemMeta}>Courier: {courierProvider}</Text>
            <Text style={styles.itemMeta}>
              AWB / Tracking: {awbNumber || 'Generated upon dispatch'}
            </Text>
            <Text style={styles.itemMeta}>Destination: {destLab}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Reports, COA & Verification History</Text>
        {SAMPLE_REPORTS.map((rep) => (
          <View key={rep.id} style={styles.listCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>
                {rep.id} • {rep.status}
              </Text>
              <Text style={styles.itemMeta}>{rep.date}</Text>
            </View>
            <Text style={styles.itemMeta}>{rep.title}</Text>
            <Text style={styles.itemHighlight}>Issuing Provider: {rep.lab}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderOnboarding = () => (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Partner Onboarding</Text>
      <Text style={styles.itemMeta}>
        Register as a Laboratory Partner or Inspection Agency under your Trade SETUU account.
      </Text>

      <View style={styles.rowWrap}>
        <TouchableOpacity
          style={[styles.chip, partnerKind === 'LAB' && styles.chipActive]}
          onPress={() => setPartnerKind('LAB')}
        >
          <Text
            style={[
              styles.chipText,
              partnerKind === 'LAB' && styles.chipTextActive,
            ]}
          >
            Become a Lab Partner
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, partnerKind === 'INSPECTION' && styles.chipActive]}
          onPress={() => setPartnerKind('INSPECTION')}
        >
          <Text
            style={[
              styles.chipText,
              partnerKind === 'INSPECTION' && styles.chipTextActive,
            ]}
          >
            Become an Inspection Partner
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={
          partnerKind === 'LAB'
            ? 'Laboratory / Company Name'
            : 'Inspection Agency / Inspector Name'
        }
        placeholderTextColor="#7C8BA1"
        value={partnerName}
        onChangeText={setPartnerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Country & Service Cities"
        placeholderTextColor="#7C8BA1"
        value={partnerCountry}
        onChangeText={setPartnerCountry}
      />
      <TextInput
        style={styles.input}
        placeholder="Accreditation Body, Number & Validity / Registration"
        placeholderTextColor="#7C8BA1"
        value={partnerCert}
        onChangeText={setPartnerCert}
      />
      <TextInput
        style={styles.input}
        placeholder="Testing Categories / Inspection Scope & Turnaround"
        placeholderTextColor="#7C8BA1"
        value={partnerScope}
        onChangeText={setPartnerScope}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handlePartnerSubmit}>
        <Text style={styles.primaryBtnText}>Submit for Verification</Text>
      </TouchableOpacity>

      {submittedPartners.map((p) => (
        <View key={p.id} style={styles.listCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.itemTitle}>{p.name}</Text>
            <Text style={styles.badgePending}>{p.status}</Text>
          </View>
          <Text style={styles.itemMeta}>
            {p.kind} • {p.country}
          </Text>
          <Text style={styles.itemMeta}>
            {p.cert} • {p.scope}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderPartnerDesk = () => (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Lab & Inspection Partner Desk</Text>
      <View style={styles.grid}>
        <View style={styles.miniStat}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLabel}>New Requests</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLabel}>Awaiting Sample</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLabel}>Reports Pending</Text>
        </View>
      </View>
      <Text style={styles.itemMeta}>
        Manage test/inspection services, pricing, sample receipt, COA uploads and configurable country/currency commission agreements.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.screenTitle}>SetuVerify</Text>
            <Text style={styles.screenSub}>
              Global Lab Testing, Inspection & Sample Express
            </Text>
          </View>
          <View style={styles.betaPill}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            Trade SETUU is a global marketplace platform. Test reports & COAs are issued directly by accredited third-party labs and inspection providers.
          </Text>
        </View>

        <View style={styles.modeSwitchRow}>
          {[
            { id: 'CLIENT', label: 'Trader Hub' },
            { id: 'ONBOARDING', label: 'Partner Onboarding' },
            { id: 'PARTNER_DESK', label: 'Partner Desk' },
          ].map((m) => {
            const active = topMode === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeBtn, active && styles.modeBtnActive]}
                onPress={() => setTopMode(m.id)}
              >
                <Text style={[styles.modeBtnText, active && styles.modeBtnTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {topMode === 'CLIENT' && (
          <>
            {renderDashboardCards()}
            {renderActiveTool()}
          </>
        )}
        {topMode === 'ONBOARDING' && renderOnboarding()}
        {topMode === 'PARTNER_DESK' && renderPartnerDesk()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#151E30',
  },
  backText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  headerTextWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  screenSub: {
    color: '#94A3B8',
    fontSize: 12,
  },
  betaPill: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  betaText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  disclaimerBox: {
    backgroundColor: '#111827',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  disclaimerText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
  },
  modeSwitchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modeBtnActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#3B82F6',
  },
  modeBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  gridCardActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#0F172A',
  },
  gridTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  gridDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
  },
  panel: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#090D16',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#243046',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 10,
  },
  chipScroll: {
    marginBottom: 12,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#243046',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#60A5FA',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listCard: {
    backgroundColor: '#090D16',
    borderRadius: 10,
    padding: 11,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  listCardSelected: {
    borderColor: '#38BDF8',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  itemTitle: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  itemMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 3,
    lineHeight: 17,
  },
  itemHighlight: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  badgeLight: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  badgePending: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryBox: {
    backgroundColor: '#090D16',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#243046',
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepText: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
  stepTextActive: {
    color: '#34D399',
    fontWeight: '600',
  },
  miniStat: {
    width: '48.5%',
    backgroundColor: '#090D16',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  statNum: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
});
