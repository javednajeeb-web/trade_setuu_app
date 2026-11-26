import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
  Alert,
  Linking,
  Share,
  BackHandler,
} from 'react-native';

const TILE_COVER_IMAGE = require('../1795697528724.jpg');
const DASHBOARD_COVER_IMAGE = require('../1795697543454.jpg');

/**
 * Services Hub mein is tile ko render karne ke liye:
 * <ComplianceTileCard onPress={() => ...} />
 */
export function ComplianceTileCard({ onPress, isDark = true }) {
  const cardBg = isDark ? '#102738' : '#FFFFFF';
  const borderCol = isDark ? '#1E3E54' : '#E2E8F0';
  const textCol = isDark ? '#DCE8EF' : '#0F172A';
  const subCol = isDark ? '#8FAAC0' : '#64748B';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[tileStyles.card, { backgroundColor: cardBg, borderColor: borderCol }]}
    >
      <Image source={TILE_COVER_IMAGE} style={tileStyles.coverImg} resizeMode="cover" />
      <Text style={[tileStyles.title, { color: textCol }]}>Global Licensing & Compliance</Text>
      <Text style={[tileStyles.sub, { color: subCol }]}>
        Discover • Apply • Track • Renew
      </Text>
      <View style={[tileStyles.footer, { borderTopColor: borderCol }]}>
        <Text style={tileStyles.amberTag}>DGFT • MSME • FSSAI</Text>
        <Text style={tileStyles.tealOpen}>Open ›</Text>
      </View>
    </TouchableOpacity>
  );
}

const tileStyles = StyleSheet.create({
  card: { flex: 1, borderWidth: 1.2, borderRadius: 14, padding: 10 },
  coverImg: { width: '100%', height: 82, borderRadius: 10, marginBottom: 8 },
  title: { fontSize: 12, fontWeight: '900', letterSpacing: 0.2 },
  sub: { fontSize: 10, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 6,
    marginTop: 8,
  },
  amberTag: { color: '#F59E0B', fontSize: 10, fontWeight: '800' },
  tealOpen: { color: '#20C8C1', fontSize: 10, fontWeight: '900' },
});

const COUNTRIES_DATA = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    coverageStatus: 'verified',
    coverageLabel: 'Verified Core Coverage',
    coverageNote: 'Indian business, tax, export & food registrations verified for guidance.',
    structures: ['Individual / Proprietorship', 'Partnership / LLP', 'Private Limited Company'],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    coverageStatus: 'partial',
    coverageLabel: 'Partial Coverage',
    coverageNote: 'Key UAE trade license overview in Beta; emirate/freezone rules expanding.',
    structures: ['LLC', 'Sole Establishment', 'Free Zone Company'],
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    coverageStatus: 'coming_soon',
    coverageLabel: 'Coming Soon',
    coverageNote: 'Import compliance checklist under verification for upcoming release.',
    structures: ['LLC', 'Corporation', 'Sole Proprietorship'],
  },
];

const LICENSES_CATALOG = [
  {
    id: 'in_udyam',
    countryCode: 'IN',
    name: 'Udyam (MSME) Registration',
    authorityBadge: 'MSME / Udyam',
    category: 'Business Setup',
    officialUrl: 'https://udyamregistration.gov.in/',
    govFeeAmount: 0,
    govFeeText: '₹0 (Free on Official Portal)',
    tradeFlatFee: 0,
    defaultPartnerFee: 0,
    commissionPct: 0,
    assistanceAvailable: false,
    assistanceNote: 'Official registration is free; no registration fee charged. Use official portal & free guide.',
    validity: 'Lifetime (with periodic updates)',
    activities: ['Domestic', 'Import', 'Export', 'Both'],
    roles: ['Trader', 'Merchant Exporter', 'Manufacturer', 'Processor'],
    docs: ['PAN & Business Details', 'Bank Account Details', 'NIC Activity Details'],
    purpose: 'Establishes MSME identity and enables access to eligible schemes and bank benefits.',
  },
  {
    id: 'in_gst',
    countryCode: 'IN',
    name: 'GST Registration & LUT',
    authorityBadge: 'GSTN / CBIC',
    category: 'Tax',
    officialUrl: 'https://www.gst.gov.in/',
    govFeeAmount: 0,
    govFeeText: '₹0 (As per GST portal)',
    tradeFlatFee: 299,
    defaultPartnerFee: 500,
    commissionPct: 15,
    assistanceAvailable: true,
    assistanceNote: 'Assisted document preparation & guidance available; filing done via authorized process.',
    validity: 'Active (Periodic returns / LUT as applicable)',
    activities: ['Domestic', 'Import', 'Export', 'Both'],
    roles: ['Trader', 'Merchant Exporter', 'Manufacturer', 'Processor'],
    docs: ['PAN & Business Constitution Proof', 'Principal Place of Business Proof', 'Bank Account / Cancelled Cheque'],
    purpose: 'Required for taxable supply/inter-state trade and LUT filing for zero-rated exports.',
  },
  {
    id: 'in_iec',
    countryCode: 'IN',
    name: 'IEC (Import Export Code)',
    authorityBadge: 'DGFT',
    category: 'Import / Export',
    officialUrl: 'https://www.dgft.gov.in/',
    govFeeAmount: 500,
    govFeeText: '₹500 (Indicative DGFT fee)',
    tradeFlatFee: 249,
    defaultPartnerFee: 450,
    commissionPct: 15,
    assistanceAvailable: true,
    assistanceNote: 'Assisted preparation available. Commission applies only on partner service fee, never on gov fee.',
    validity: 'Active (Annual DGFT profile update required)',
    activities: ['Import', 'Export', 'Both'],
    roles: ['Trader', 'Merchant Exporter', 'Manufacturer', 'Processor'],
    docs: ['Firm/Individual PAN', 'Bank Certificate / Cancelled Cheque', 'Address Proof & Email/Mobile'],
    purpose: 'Mandatory authorization code for importing into or exporting from India.',
  },
  {
    id: 'in_fssai',
    countryCode: 'IN',
    name: 'FSSAI Food License / Registration',
    authorityBadge: 'FSSAI / FoSCoS',
    category: 'Food & Agri',
    officialUrl: 'https://foscos.fssai.gov.in/',
    govFeeAmount: 100,
    govFeeText: '₹100+ (Varies by registration/license kind & years)',
    tradeFlatFee: 299,
    defaultPartnerFee: 550,
    commissionPct: 15,
    assistanceAvailable: true,
    assistanceNote: 'Assisted checklist & preparation available; official FoSCoS rules apply.',
    validity: '1 to 5 Years',
    activities: ['Domestic', 'Import', 'Export', 'Both'],
    roles: ['Trader', 'Merchant Exporter', 'Manufacturer', 'Processor'],
    docs: ['ID & Address Proof', 'Premises Proof / NOC', 'Food Category / Product List'],
    purpose: 'Required for food business operators handling, storing, processing, or trading food/agri items.',
  },
  {
    id: 'in_apeda',
    countryCode: 'IN',
    name: 'APEDA e-RCMC Registration',
    authorityBadge: 'APEDA / DGFT',
    category: 'Food & Agri',
    officialUrl: 'https://www.dgft.gov.in/CP/index.jsp?opt=e-rcmc',
    govFeeAmount: 5900,
    govFeeText: '₹5,900 (Indicative incl. GST; verify current tariff)',
    tradeFlatFee: 349,
    defaultPartnerFee: 700,
    commissionPct: 18,
    assistanceAvailable: true,
    assistanceNote: 'Assisted documentation support available. Government fee is shown separately.',
    validity: '5 Years',
    activities: ['Export', 'Both'],
    roles: ['Merchant Exporter', 'Manufacturer', 'Processor', 'Trader'],
    docs: ['IEC Certificate', 'Bank Certificate / AD Code details', 'Product / Commodity Details'],
    purpose: 'Registration-cum-Membership for scheduled agricultural & processed food exports.',
  },
  {
    id: 'ae_trade_lic',
    countryCode: 'AE',
    name: 'UAE Commercial / Trade License (Overview)',
    authorityBadge: 'UAE DED / Freezone',
    category: 'Business Setup',
    officialUrl: 'https://www.invest.gov.ae/',
    govFeeAmount: 0,
    govFeeText: 'Varies by Emirate / Jurisdiction',
    tradeFlatFee: 0,
    defaultPartnerFee: 0,
    commissionPct: 12,
    assistanceAvailable: false,
    assistanceNote: 'Partial overview in Beta; verify exact emirate/freezone requirements.',
    validity: 'Annual (Typically 1 Year)',
    activities: ['Domestic', 'Import', 'Export', 'Both'],
    roles: ['Trader', 'Merchant Exporter', 'Manufacturer'],
    docs: ['Passport / Emirates ID copies', 'Trade Name & Activity Selection', 'Office / Lease Proof'],
    purpose: 'Core commercial license to operate legally in the UAE.',
  },
];

const APPLICATION_STATUSES = [
  'Draft / Preparation Started',
  'Documents Ready',
  'Submitted on Official Portal',
  'Under Review',
  'Query / Objection Raised',
  'Approved / Rejected',
  'Certificate Uploaded',
];

function calculatePricingBreakdown({
  govFeeAmount = 0,
  tradeFlatFee = 0,
  partnerServiceFee = 0,
  commissionPct = 15,
  assistanceAvailable = true,
}) {
  const safeGov = Math.max(0, Number(govFeeAmount) || 0);
  if (!assistanceAvailable) {
    return {
      govFee: safeGov,
      tradeFee: 0,
      partnerFee: 0,
      commissionPct: 0,
      platformCommission: 0,
      totalTradeAndPartner: 0,
      estimatedTotalOutlay: safeGov,
    };
  }
  const safeTrade = Math.max(0, Number(tradeFlatFee) || 0);
  const safePartner = Math.max(0, Number(partnerServiceFee) || 0);
  const pct = Math.min(20, Math.max(10, Number(commissionPct) || 15));
  const platformCommission = Number(((safePartner * pct) / 100).toFixed(2));
  const totalTradeAndPartner = Number((safeTrade + safePartner).toFixed(2));
  const estimatedTotalOutlay = Number((safeGov + totalTradeAndPartner).toFixed(2));

  return {
    govFee: safeGov,
    tradeFee: safeTrade,
    partnerFee: safePartner,
    commissionPct: pct,
    platformCommission,
    totalTradeAndPartner,
    estimatedTotalOutlay,
  };
}

function getDaysRemaining(expiryIsoStr) {
  if (!expiryIsoStr) return null;
  const target = new Date(`${expiryIsoStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getRenewalTier(daysLeft) {
  if (daysLeft === null) return { label: 'No Expiry Set', tone: 'sub' };
  if (daysLeft < 0) return { label: `Expired (${Math.abs(daysLeft)}d ago)`, tone: 'warn' };
  if (daysLeft <= 7) return { label: `7-Day Urgent (${daysLeft}d left)`, tone: 'warn' };
  if (daysLeft <= 15) return { label: `15-Day Reminder (${daysLeft}d left)`, tone: 'amber' };
  if (daysLeft <= 30) return { label: `30-Day Primary Alert (${daysLeft}d left)`, tone: 'teal' };
  return { label: `Active (${daysLeft}d left)`, tone: 'ok' };
}

export default function GlobalLicensingCompliance({ theme = 'dark', onExitModule }) {
  const isDark = theme !== 'light';

  const C = {
    bg: isDark ? '#071521' : '#F3F5F8',
    card: isDark ? '#102738' : '#FFFFFF',
    cardAlt: isDark ? '#0B1D2C' : '#F8FAFC',
    border: isDark ? '#1E3E54' : '#E2E8F0',
    text: isDark ? '#DCE8EF' : '#0F172A',
    sub: isDark ? '#8FAAC0' : '#64748B',
    teal: '#20C8C1',
    amber: '#F59E0B',
    ok: '#4ADE80',
    warn: '#F87171',
  };

  const [screen, setScreen] = useState('dashboard');
  const [history, setHistory] = useState([]);

  const openScreen = useCallback(
    (nextScreen) => {
      if (nextScreen === screen) return;
      setHistory((prev) => [...prev, screen]);
      setScreen(nextScreen);
    },
    [screen]
  );

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const prevScreen = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setScreen(prevScreen);
      return true;
    }
    if (screen !== 'dashboard') {
      setScreen('dashboard');
      return true;
    }
    if (typeof onExitModule === 'function') {
      onExitModule();
      return true;
    }
    return false;
  }, [history, screen, onExitModule]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => goBack());
    return () => sub.remove();
  }, [goBack]);

  const [countryCode, setCountryCode] = useState('IN');
  const [journeyStage, setJourneyStage] = useState('Starting from Zero');

  const [businessName, setBusinessName] = useState('');
  const [businessStructure, setBusinessStructure] = useState('Individual / Proprietorship');
  const [industry, setIndustry] = useState('Agriculture & Food');
  const [productName, setProductName] = useState('1121 Sella Basmati Rice');
  const [tradeActivity, setTradeActivity] = useState('Export');
  const [businessRole, setBusinessRole] = useState('Merchant Exporter');
  const [stateCity, setStateCity] = useState('Raipur, Chhattisgarh');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeLicenseId, setActiveLicenseId] = useState('in_iec');

  const [eligHasPanOrTax, setEligHasPanOrTax] = useState(true);
  const [eligHasBank, setEligHasBank] = useState(true);
  const [eligHasContact, setEligHasContact] = useState(true);
  const [eligExistingHolder, setEligExistingHolder] = useState(false);

  const [partnerFeeInput, setPartnerFeeInput] = useState('450');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  const [statusFilter, setStatusFilter] = useState('All');
  const [applications, setApplications] = useState([
    {
      id: 'APP-101',
      licenseId: 'in_iec',
      licenseName: 'IEC (Import Export Code)',
      authorityBadge: 'DGFT',
      countryCode: 'IN',
      refNumber: 'DGFT-IN-2026-8841',
      appliedDate: '2026-11-10',
      status: 'Under Review',
      source: 'Manual',
      nextAction: 'Check DGFT portal / email for updates or clarification.',
      certificateRef: '',
    },
  ]);

  const [vaultDocs, setVaultDocs] = useState([
    {
      id: 'DOC-1',
      licenseName: 'Udyam (MSME) Registration',
      authorityBadge: 'MSME / Udyam',
      countryCode: 'IN',
      certNumber: 'UDYAM-CG-14-0019283',
      issueDate: '2025-04-12',
      expiryDate: '2026-12-20',
      fileLabel: 'udyam_certificate_copy.pdf',
      channels: { inApp: true, email: true, whatsapp: true },
    },
    {
      id: 'DOC-2',
      licenseName: 'APEDA e-RCMC Registration',
      authorityBadge: 'APEDA / DGFT',
      countryCode: 'IN',
      certNumber: 'APEDA/RCMC/2025/4412',
      issueDate: '2025-01-15',
      expiryDate: '2026-12-05',
      fileLabel: 'apeda_rcmc_scan.pdf',
      channels: { inApp: true, email: true, whatsapp: true },
    },
  ]);

  const [newDocName, setNewDocName] = useState('');
  const [newDocCertNo, setNewDocCertNo] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('2027-06-30');
  const [newDocFileLabel, setNewDocFileLabel] = useState('certificate_upload.pdf');

  const [notifications, setNotifications] = useState([
    {
      id: 'N-1',
      title: 'Application Status Update',
      detail: 'IEC (Import Export Code) status: Under Review (Source: Manual).',
      channels: 'In-App • Email • WhatsApp (Beta Trigger)',
      time: 'Today',
    },
  ]);

  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const selectedCountry = useMemo(
    () => COUNTRIES_DATA.find((c) => c.code === countryCode) || COUNTRIES_DATA[0],
    [countryCode]
  );

  const handleSelectCountry = (c) => {
    setCountryCode(c.code);
    if (c.structures && !c.structures.includes(businessStructure)) {
      setBusinessStructure(c.structures[0]);
    }
    setCountryModalOpen(false);
  };

  const countryLicenses = useMemo(
    () => LICENSES_CATALOG.filter((l) => l.countryCode === countryCode),
    [countryCode]
  );

  const filteredLicenses = useMemo(() => {
    return countryLicenses.filter((item) => {
      const catMatch = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const qMatch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.authorityBadge.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [countryLicenses, selectedCategory, searchQuery]);

  const activeLicense = useMemo(
    () => LICENSES_CATALOG.find((l) => l.id === activeLicenseId) || countryLicenses[0] || LICENSES_CATALOG[0],
    [activeLicenseId, countryLicenses]
  );

  const eligibilityResults = useMemo(() => {
    const applicableList = countryLicenses.filter((lic) => lic.activities.includes(tradeActivity));
    const likelyRequired = [];
    const mayBeRequired = [];
    const notApplicable = [];

    countryLicenses.forEach((lic) => {
      const matchTrade = lic.activities.includes(tradeActivity);
      const matchRole = lic.roles.includes(businessRole);
      if (!matchTrade) {
        notApplicable.push({
          ...lic,
          reason: `Not matched for selected trade activity (${tradeActivity}).`,
        });
      } else if (lic.id === 'in_udyam' || lic.id === 'in_gst' || lic.id === 'in_iec' || lic.id === 'ae_trade_lic') {
        likelyRequired.push({
          ...lic,
          reason: `Applicable for ${selectedCountry.name} • ${tradeActivity} • ${businessRole}.`,
        });
      } else if (matchRole) {
        mayBeRequired.push({
          ...lic,
          reason: `Product/category specific check needed (${productName || industry}).`,
        });
      } else {
        mayBeRequired.push({
          ...lic,
          reason: 'Verify if your specific operation requires this certificate.',
        });
      }
    });

    const missingBasics = [];
    if (!eligHasPanOrTax) missingBasics.push('Tax / PAN Identification');
    if (!eligHasBank) missingBasics.push('Business Bank Account');
    if (!eligHasContact) missingBasics.push('Verified Mobile & Email');

    return {
      applicableCount: applicableList.length,
      likelyRequired,
      mayBeRequired,
      notApplicable,
      missingBasics,
    };
  }, [countryLicenses, tradeActivity, businessRole, selectedCountry, productName, industry, eligHasPanOrTax, eligHasBank, eligHasContact]);

  const readinessScore = useMemo(() => {
    const profilePoints =
      (countryCode ? 15 : 0) +
      (businessStructure ? 15 : 0) +
      (industry ? 10 : 0) +
      (tradeActivity ? 10 : 0);
    const completedApps = applications.filter(
      (a) => a.status === 'Approved / Rejected' || a.status === 'Certificate Uploaded'
    ).length;
    const vaultCount = vaultDocs.length;
    const progressPoints = Math.min(50, completedApps * 15 + vaultCount * 15);
    const total = Math.min(100, profilePoints + progressPoints);
    const completedItems = completedApps + vaultCount;
    const totalTargetItems = Math.max(3, eligibilityResults.likelyRequired.length || 3);
    return { score: total, completedItems, totalTargetItems };
  }, [countryCode, businessStructure, industry, tradeActivity, applications, vaultDocs, eligibilityResults]);

  const pricingPreview = useMemo(() => {
    const pFee = activeLicense.id === 'in_iec' && partnerFeeInput ? Number(partnerFeeInput) : activeLicense.defaultPartnerFee;
    return calculatePricingBreakdown({
      govFeeAmount: activeLicense.govFeeAmount,
      tradeFlatFee: activeLicense.tradeFlatFee,
      partnerServiceFee: pFee,
      commissionPct: activeLicense.commissionPct,
      assistanceAvailable: activeLicense.assistanceAvailable,
    });
  }, [activeLicense, partnerFeeInput]);

  const pushNotificationEvent = (title, detail, channelsStr = 'In-App • Email • WhatsApp (Beta)') => {
    setNotifications((prev) => [
      { id: `N-${Date.now()}`, title, detail, channels: channelsStr, time: 'Just now' },
      ...prev,
    ]);
  };

  const openOfficialPortal = async (url, licName) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Official Portal', `${licName}\nURL: ${url}`);
      }
    } catch {
      Alert.alert('Official Portal', `${licName}\nURL: ${url}`);
    }
  };

  const createTrackingFromLicense = (lic, modeLabel = 'Self-Service') => {
    const newId = `APP-${102 + applications.length}`;
    const newEntry = {
      id: newId,
      licenseId: lic.id,
      licenseName: lic.name,
      authorityBadge: lic.authorityBadge,
      countryCode: lic.countryCode,
      refNumber: `TS-REF-${Date.now().toString().slice(-5)}`,
      appliedDate: new Date().toISOString().slice(0, 10),
      status: 'Draft / Preparation Started',
      source: 'Manual',
      nextAction: `${modeLabel}: Prepare checklist & update status as you progress.`,
      certificateRef: '',
    };
    setApplications((prev) => [newEntry, ...prev]);
    pushNotificationEvent(
      `Application Added (${lic.authorityBadge})`,
      `${lic.name} added in Draft / Preparation Started (${modeLabel}).`,
      'In-App + WhatsApp/Email Beta Hook'
    );
    Alert.alert('Added to My Applications', `${lic.name}\nStatus: Draft / Preparation Started`);
  };

  const updateApplicationStatus = (appId, nextStatus) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: nextStatus,
              nextAction:
                nextStatus === 'Certificate Uploaded'
                  ? 'Certificate saved in tracking; add to Document Vault for 30/15/7-day alerts.'
                  : `Status updated to ${nextStatus} (${a.source}).`,
            }
          : a
      )
    );
    const target = applications.find((a) => a.id === appId);
    if (target) {
      pushNotificationEvent(
        `Status Updated: ${target.licenseName}`,
        `New status: ${nextStatus} (Source: Manual — Trade SETUU tracking status).`,
        'In-App + Email + WhatsApp Trigger Ready'
      );
    }
  };

  const addVaultCertificate = () => {
    if (!newDocName.trim() || !newDocCertNo.trim()) {
      Alert.alert('Missing Details', 'Please enter Certificate/License Name and Certificate Number.');
      return;
    }
    const docItem = {
      id: `DOC-${Date.now()}`,
      licenseName: newDocName.trim(),
      authorityBadge: selectedCountry.code === 'IN' ? 'India Compliance' : selectedCountry.code,
      countryCode: selectedCountry.code,
      certNumber: newDocCertNo.trim(),
      issueDate: new Date().toISOString().slice(0, 10),
      expiryDate: newDocExpiry.trim() || '2027-06-30',
      fileLabel: newDocFileLabel.trim() || 'certificate_document.pdf',
      channels: { inApp: true, email: true, whatsapp: true },
    };
    setVaultDocs((prev) => [docItem, ...prev]);
    pushNotificationEvent(
      `Vault Record Saved: ${docItem.licenseName}`,
      `Expiry: ${docItem.expiryDate} • Renewal alerts scheduled at 30, 15 & 7 days before expiry.`,
      'In-App + Email + WhatsApp (30/15/7d)'
    );
    setNewDocName('');
    setNewDocCertNo('');
    Alert.alert('Saved in My Document Vault', `${docItem.licenseName}\nExpiry: ${docItem.expiryDate}`);
  };

  const shareRenewalAlert = async (doc) => {
    const daysLeft = getDaysRemaining(doc.expiryDate);
    const tier = getRenewalTier(daysLeft);
    const msg =
      `Trade SETUU — Compliance Renewal Alert\n` +
      `Certificate: ${doc.licenseName} (${doc.certNumber})\n` +
      `Country: ${doc.countryCode} | Expiry Date: ${doc.expiryDate}\n` +
      `Alert Stage: ${tier.label} (Reminders: 30 / 15 / 7 days before expiry)`;
    try {
      await Share.share({ message: msg });
    } catch {
      Alert.alert('Renewal Reminder', msg);
    }
  };

  const visibleApplications = useMemo(() => {
    if (statusFilter === 'All') return applications;
    if (statusFilter === 'Completed') {
      return applications.filter(
        (a) => a.status === 'Approved / Rejected' || a.status === 'Certificate Uploaded'
      );
    }
    return applications.filter(
      (a) => a.status !== 'Approved / Rejected' && a.status !== 'Certificate Uploaded'
    );
  }, [applications, statusFilter]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 96 }}>
      {/* TOP BAR */}
      <View style={[styles.topBar, { backgroundColor: C.card, borderBottomColor: C.border }]}>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {(screen !== 'dashboard' || history.length > 0) && (
              <TouchableOpacity onPress={goBack} style={styles.backBtn}>
                <Text style={{ color: C.teal, fontSize: 22, fontWeight: '900' }}>‹</Text>
              </TouchableOpacity>
            )}
            <View>
              <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 }}>
                TRADE SETUU
              </Text>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>
                Global Licensing & Compliance
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => openScreen('notifications')}
            style={[styles.pillBtn, { backgroundColor: C.cardAlt, borderColor: C.border }]}
          >
            <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>
              Alerts ({notifications.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SCREEN 1 — MAIN DASHBOARD */}
      {screen === 'dashboard' && (
        <View style={{ padding: 14 }}>
          <View style={[styles.heroBox, { backgroundColor: C.card, borderColor: C.border }]}>
            <Image
              source={DASHBOARD_COVER_IMAGE}
              style={styles.heroImg}
              resizeMode="cover"
            />
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 10 }}>
              Global Licensing & Compliance
            </Text>
            <Text style={{ color: C.teal, fontSize: 11, fontWeight: '800', marginTop: 2 }}>
              Discover • Check Eligibility • Apply / Assist • Track • Renew (30/15/7d)
            </Text>
          </View>

          <Text style={[styles.secLabel, { color: C.sub }]}>1. SELECT COUNTRY & COVERAGE STATUS</Text>
          <TouchableOpacity
            onPress={() => setCountryModalOpen(true)}
            style={[styles.selectorCard, { backgroundColor: C.card, borderColor: C.border }]}
          >
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ color: C.text, fontSize: 14, fontWeight: '900' }}>
                  {selectedCountry.flag} {selectedCountry.name}
                </Text>
                <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>
                  {selectedCountry.coverageNote}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: C.cardAlt, borderColor: C.teal }]}>
                <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>
                  {selectedCountry.coverageLabel} ▾
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <Text style={[styles.secLabel, { color: C.sub }]}>2. BUSINESS JOURNEY STAGE</Text>
          <View style={{ flexDirection: 'row', gap: 7, marginBottom: 14 }}>
            {['Starting from Zero', 'Have a Business', 'Already Trading'].map((st) => {
              const active = journeyStage === st;
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => setJourneyStage(st)}
                  style={[
                    styles.stageChip,
                    {
                      backgroundColor: active ? C.teal : C.card,
                      borderColor: active ? C.teal : C.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? '#071521' : C.text,
                      fontSize: 10,
                      fontWeight: '900',
                      textAlign: 'center',
                    }}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.secLabel, { color: C.sub }]}>3. EXPLORE & TAKE ACTION</Text>
          <View style={styles.grid2}>
            <TouchableOpacity
              onPress={() => openScreen('profile')}
              style={[styles.actionCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>PROFILE</Text>
              <Text style={[styles.actionTitle, { color: C.text }]}>Business Profile</Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                {businessStructure} • {tradeActivity}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openScreen('directory')}
              style={[styles.actionCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>DIRECTORY</Text>
              <Text style={[styles.actionTitle, { color: C.text }]}>License Directory</Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                Udyam, IEC, GST, FSSAI, APEDA
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid2}>
            <TouchableOpacity
              onPress={() => openScreen('eligibility')}
              style={[styles.actionCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>CHECKER</Text>
              <Text style={[styles.actionTitle, { color: C.text }]}>Eligibility Checker</Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                Likely / May Be / Not Applicable
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openScreen('apply')}
              style={[styles.actionCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>APPLY / ASSIST</Text>
              <Text style={[styles.actionTitle, { color: C.text }]}>Apply or Get Help</Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                Self portal or Assisted + 10–20% partner
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid2}>
            <TouchableOpacity
              onPress={() => openScreen('applications')}
              style={[styles.actionCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>TRACKER</Text>
              <Text style={[styles.actionTitle, { color: C.text }]}>My Applications</Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                {applications.length} tracked (Manual status)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openScreen('vault')}
              style={[styles.actionCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>VAULT & RENEW</Text>
              <Text style={[styles.actionTitle, { color: C.text }]}>Document Vault</Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                {vaultDocs.length} docs • 30 / 15 / 7d alerts
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.readinessCard, { backgroundColor: C.card, borderColor: C.teal }]}>
            <View style={styles.rowBetween}>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: '900' }}>
                My Compliance Readiness
              </Text>
              <Text style={{ color: C.teal, fontSize: 16, fontWeight: '900' }}>
                {readinessScore.score}%
              </Text>
            </View>
            <Text style={{ color: C.sub, fontSize: 11, marginTop: 3 }}>
              {readinessScore.completedItems} of {readinessScore.totalTargetItems} tracked items/certificates recorded • Stage: {journeyStage}
            </Text>
          </View>
        </View>
      )}

      {/* SCREEN 2 — BUSINESS PROFILE */}
      {screen === 'profile' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.pageTitle, { color: C.text }]}>Business Profile</Text>
          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[styles.fieldLbl, { color: C.sub }]}>Country</Text>
            <TouchableOpacity
              onPress={() => setCountryModalOpen(true)}
              style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}
            >
              <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>
                {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.coverageLabel})
              </Text>
            </TouchableOpacity>

            <Text style={[styles.fieldLbl, { color: C.sub }]}>Business / Firm Name (Optional)</Text>
            <TextInput
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Enter business name"
              placeholderTextColor={C.sub}
              style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text }]}
            />

            <Text style={[styles.fieldLbl, { color: C.sub }]}>Business Structure ({selectedCountry.name})</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {selectedCountry.structures.map((bs) => {
                const active = businessStructure === bs;
                return (
                  <TouchableOpacity
                    key={bs}
                    onPress={() => setBusinessStructure(bs)}
                    style={[
                      styles.choiceChip,
                      { backgroundColor: active ? C.teal : C.cardAlt, borderColor: active ? C.teal : C.border },
                    ]}
                  >
                    <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{bs}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.fieldLbl, { color: C.sub }]}>Trade Activity</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {['Domestic', 'Import', 'Export', 'Both'].map((ta) => {
                const active = tradeActivity === ta;
                return (
                  <TouchableOpacity
                    key={ta}
                    onPress={() => setTradeActivity(ta)}
                    style={[
                      styles.choiceChip,
                      { backgroundColor: active ? C.amber : C.cardAlt, borderColor: active ? C.amber : C.border },
                    ]}
                  >
                    <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>{ta}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.fieldLbl, { color: C.sub }]}>Business Role</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {['Trader', 'Merchant Exporter', 'Manufacturer', 'Processor'].map((rl) => {
                const active = businessRole === rl;
                return (
                  <TouchableOpacity
                    key={rl}
                    onPress={() => setBusinessRole(rl)}
                    style={[
                      styles.choiceChip,
                      { backgroundColor: active ? C.teal : C.cardAlt, borderColor: active ? C.teal : C.border },
                    ]}
                  >
                    <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{rl}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.fieldLbl, { color: C.sub }]}>Industry & Key Product</Text>
            <TextInput
              value={industry}
              onChangeText={setIndustry}
              placeholder="Industry"
              placeholderTextColor={C.sub}
              style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginBottom: 8 }]}
            />
            <TextInput
              value={productName}
              onChangeText={setProductName}
              placeholder="Primary Product"
              placeholderTextColor={C.sub}
              style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginBottom: 8 }]}
            />

            <Text style={[styles.fieldLbl, { color: C.sub }]}>State / Province & City</Text>
            <TextInput
              value={stateCity}
              onChangeText={setStateCity}
              placeholder="City, State"
              placeholderTextColor={C.sub}
              style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginBottom: 12 }]}
            />

            <TouchableOpacity
              onPress={() => openScreen('eligibility')}
              style={[styles.primaryBtn, { backgroundColor: C.teal }]}
            >
              <Text style={{ color: '#071521', fontSize: 13, fontWeight: '900' }}>
                Save & Check Eligibility →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SCREEN 3 — LICENSE DIRECTORY */}
      {screen === 'directory' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.pageTitle, { color: C.text }]}>
            License Directory ({selectedCountry.flag} {selectedCountry.name})
          </Text>
          <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800', marginBottom: 8 }}>
            {selectedCountry.coverageLabel}: {selectedCountry.coverageNote}
          </Text>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search IEC, Udyam, GST, FSSAI, APEDA..."
            placeholderTextColor={C.sub}
            style={[styles.inputBox, { backgroundColor: C.card, borderColor: C.border, color: C.text, marginBottom: 8 }]}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {['All', 'Business Setup', 'Tax', 'Import / Export', 'Food & Agri'].map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.choiceChip,
                      { backgroundColor: active ? C.teal : C.card, borderColor: active ? C.teal : C.border },
                    ]}
                  >
                    <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {filteredLicenses.map((lic) => (
            <TouchableOpacity
              key={lic.id}
              onPress={() => {
                setActiveLicenseId(lic.id);
                setPartnerFeeInput(String(lic.defaultPartnerFee || 450));
                openScreen('license_detail');
              }}
              style={[styles.listCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={styles.rowBetween}>
                <Text style={{ color: C.text, fontSize: 14, fontWeight: '900', flex: 1 }}>{lic.name}</Text>
                <View style={[styles.authBadge, { backgroundColor: C.cardAlt, borderColor: C.teal }]}>
                  <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>{lic.authorityBadge}</Text>
                </View>
              </View>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>{lic.purpose}</Text>
              <View style={[styles.rowBetween, { marginTop: 8 }]}>
                <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800' }}>Gov: {lic.govFeeText}</Text>
                <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>Details ›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* SCREEN 3B — LICENSE DETAIL */}
      {screen === 'license_detail' && activeLicense && (
        <View style={{ padding: 14 }}>
          <View style={styles.rowBetween}>
            <Text style={[styles.pageTitle, { color: C.text, flex: 1, marginBottom: 4 }]}>{activeLicense.name}</Text>
            <View style={[styles.authBadge, { backgroundColor: C.card, borderColor: C.teal }]}>
              <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>{activeLicense.authorityBadge}</Text>
            </View>
          </View>
          <Text style={{ color: C.sub, fontSize: 12, marginBottom: 10 }}>{activeLicense.purpose}</Text>

          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>VALIDITY & RENEWAL WINDOW</Text>
            <Text style={{ color: C.text, fontSize: 12, marginTop: 3 }}>
              {activeLicense.validity} • Renewal alerts: 30 / 15 / 7 days before expiry
            </Text>

            <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900', marginTop: 10 }}>REQUIRED DOCUMENTS</Text>
            {activeLicense.docs.map((d) => (
              <Text key={d} style={{ color: C.text, fontSize: 12, marginTop: 3 }}>
                • {d}
              </Text>
            ))}

            <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900', marginTop: 10 }}>
              FEE BREAKDOWN (SEPARATED)
            </Text>
            <Text style={{ color: C.text, fontSize: 12, marginTop: 3 }}>
              Government Fee: {activeLicense.govFeeText}
            </Text>
            {activeLicense.assistanceAvailable ? (
              <>
                <Text style={{ color: C.text, fontSize: 12, marginTop: 2 }}>
                  Trade SETUU Facilitation Fee: ₹{pricingPreview.tradeFee}
                </Text>
                <Text style={{ color: C.text, fontSize: 12, marginTop: 2 }}>
                  Partner Service Fee: ₹{pricingPreview.partnerFee} (Platform Commission: {pricingPreview.commissionPct}% on partner fee = ₹{pricingPreview.platformCommission}, never on gov fee)
                </Text>
              </>
            ) : (
              <Text style={{ color: C.ok, fontSize: 12, fontWeight: '800', marginTop: 2 }}>
                {activeLicense.assistanceNote}
              </Text>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => {
                  createTrackingFromLicense(activeLicense, 'Self-Service');
                  openOfficialPortal(activeLicense.officialUrl, activeLicense.name);
                }}
                style={[styles.secondaryBtn, { backgroundColor: C.cardAlt, borderColor: C.teal }]}
              >
                <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900' }}>Apply on Official Portal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openScreen('apply')}
                style={[styles.primaryBtn, { backgroundColor: C.teal, flex: 1 }]}
              >
                <Text style={{ color: '#071521', fontSize: 12, fontWeight: '900' }}>Assistance Options →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* SCREEN 4 — ELIGIBILITY CHECKER */}
      {screen === 'eligibility' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.pageTitle, { color: C.text }]}>Eligibility Checker</Text>
          <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800', marginBottom: 10 }}>
            Guidance indicator only — not an official government approval or legal determination.
          </Text>

          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900', marginBottom: 6 }}>
              QUICK READINESS CHECKS
            </Text>
            {[
              { label: 'PAN / Tax ID Ready?', val: eligHasPanOrTax, set: setEligHasPanOrTax },
              { label: 'Business Bank Account Active?', val: eligHasBank, set: setEligHasBank },
              { label: 'Mobile & Email Accessible?', val: eligHasContact, set: setEligHasContact },
              { label: 'Already Hold Prior Registration?', val: eligExistingHolder, set: setEligExistingHolder },
            ].map((chk) => (
              <TouchableOpacity
                key={chk.label}
                onPress={() => chk.set(!chk.val)}
                style={[styles.checkRow, { borderBottomColor: C.border }]}
              >
                <Text style={{ color: C.text, fontSize: 12, fontWeight: '700' }}>{chk.label}</Text>
                <Text style={{ color: chk.val ? C.ok : C.amber, fontSize: 12, fontWeight: '900' }}>
                  {chk.val ? 'Yes ✓' : 'No'}
                </Text>
              </TouchableOpacity>
            ))}

            {eligibilityResults.missingBasics.length > 0 && (
              <Text style={{ color: C.warn, fontSize: 11, fontWeight: '800', marginTop: 8 }}>
                Pending basics: {eligibilityResults.missingBasics.join(', ')}
              </Text>
            )}
          </View>

          <Text style={[styles.secLabel, { color: C.ok }]}>
            LIKELY REQUIRED ({eligibilityResults.likelyRequired.length})
          </Text>
          {eligibilityResults.likelyRequired.map((item) => (
            <View key={item.id} style={[styles.listCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>{item.name}</Text>
                <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>{item.authorityBadge}</Text>
              </View>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 3 }}>{item.reason}</Text>
            </View>
          ))}

          <Text style={[styles.secLabel, { color: C.amber }]}>
            MAY BE REQUIRED ({eligibilityResults.mayBeRequired.length})
          </Text>
          {eligibilityResults.mayBeRequired.map((item) => (
            <View key={item.id} style={[styles.listCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>{item.name}</Text>
                <Text style={{ color: C.amber, fontSize: 10, fontWeight: '900' }}>{item.authorityBadge}</Text>
              </View>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 3 }}>{item.reason}</Text>
            </View>
          ))}

          <Text style={[styles.secLabel, { color: C.sub }]}>
            NOT APPLICABLE / NOT IDENTIFIED ({eligibilityResults.notApplicable.length})
          </Text>
          {eligibilityResults.notApplicable.map((item) => (
            <View key={item.id} style={[styles.listCard, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
              <Text style={{ color: C.sub, fontSize: 12, fontWeight: '800' }}>
                {item.name} ({item.authorityBadge})
              </Text>
              <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>{item.reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* SCREEN 5 — APPLY / ASSISTED WORKFLOW */}
      {screen === 'apply' && activeLicense && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.pageTitle, { color: C.text }]}>Apply or Get Assistance</Text>

          <Text style={[styles.fieldLbl, { color: C.sub }]}>Select Item</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {countryLicenses.map((lic) => (
                <TouchableOpacity
                  key={lic.id}
                  onPress={() => {
                    setActiveLicenseId(lic.id);
                    setPartnerFeeInput(String(lic.defaultPartnerFee || 450));
                  }}
                  style={[
                    styles.choiceChip,
                    {
                      backgroundColor: activeLicense.id === lic.id ? C.teal : C.card,
                      borderColor: activeLicense.id === lic.id ? C.teal : C.border,
                    },
                  ]}
                >
                  <Text style={{ color: activeLicense.id === lic.id ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>
                    {lic.authorityBadge}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.rowBetween}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>{activeLicense.name}</Text>
              <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900' }}>{activeLicense.authorityBadge}</Text>
            </View>

            <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900', marginTop: 10 }}>
              TRANSPARENT FEE BREAKDOWN (SEPARATED)
            </Text>
            <Text style={{ color: C.text, fontSize: 12, marginTop: 4 }}>
              1. Government Fee: {activeLicense.govFeeText}
            </Text>

            {activeLicense.assistanceAvailable ? (
              <>
                <Text style={{ color: C.text, fontSize: 12, marginTop: 2 }}>
                  2. Trade SETUU Facilitation Fee: ₹{pricingPreview.tradeFee}
                </Text>
                <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>
                  3. Partner Service Fee: ₹{pricingPreview.partnerFee} (Trade SETUU {pricingPreview.commissionPct}% commission = ₹{pricingPreview.platformCommission} on partner fee only)
                </Text>

                <Text style={[styles.fieldLbl, { color: C.sub, marginTop: 10 }]}>Your Contact (Phone & Email)</Text>
                <TextInput
                  value={applicantPhone}
                  onChangeText={setApplicantPhone}
                  placeholder="Mobile / WhatsApp number"
                  placeholderTextColor={C.sub}
                  keyboardType="phone-pad"
                  style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginBottom: 8 }]}
                />
                <TextInput
                  value={applicantEmail}
                  onChangeText={setApplicantEmail}
                  placeholder="Email address"
                  placeholderTextColor={C.sub}
                  style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginBottom: 8 }]}
                />

                <TouchableOpacity
                  onPress={() => setConsentChecked(!consentChecked)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}
                >
                  <Text style={{ color: consentChecked ? C.teal : C.sub, fontSize: 16, fontWeight: '900' }}>
                    {consentChecked ? '☑' : '☐'}
                  </Text>
                  <Text style={{ color: C.sub, fontSize: 11, flex: 1 }}>
                    I consent to share preparation details for assisted support and receive updates via In-App / Email / WhatsApp.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (!consentChecked) {
                      Alert.alert('Consent Required', 'Please confirm consent before submitting assistance request.');
                      return;
                    }
                    createTrackingFromLicense(activeLicense, 'Assisted Preparation');
                    openScreen('applications');
                  }}
                  style={[styles.primaryBtn, { backgroundColor: C.teal }]}
                >
                  <Text style={{ color: '#071521', fontSize: 13, fontWeight: '900' }}>
                    Request Assisted Preparation →
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: C.ok, fontSize: 12, fontWeight: '800', marginBottom: 10 }}>
                  {activeLicense.assistanceNote}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    createTrackingFromLicense(activeLicense, 'Free Self-Guide');
                    openOfficialPortal(activeLicense.officialUrl, activeLicense.name);
                  }}
                  style={[styles.primaryBtn, { backgroundColor: C.teal }]}
                >
                  <Text style={{ color: '#071521', fontSize: 13, fontWeight: '900' }}>
                    Open Official Free Portal →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* SCREEN 6 — MY APPLICATIONS TRACKER */}
      {screen === 'applications' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.pageTitle, { color: C.text }]}>My Applications</Text>
          <Text style={{ color: C.sub, fontSize: 11, marginBottom: 10 }}>
            Trade SETUU tracking statuses (Manual updates in Beta; not a live government portal claim).
          </Text>

          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
            {['All', 'In Progress', 'Completed'].map((tf) => {
              const active = statusFilter === tf;
              return (
                <TouchableOpacity
                  key={tf}
                  onPress={() => setStatusFilter(tf)}
                  style={[
                    styles.choiceChip,
                    { backgroundColor: active ? C.teal : C.card, borderColor: active ? C.teal : C.border },
                  ]}
                >
                  <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>{tf}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {visibleApplications.map((app) => (
            <View key={app.id} style={[styles.listCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: C.text, fontSize: 14, fontWeight: '900', flex: 1 }}>{app.licenseName}</Text>
                <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>{app.authorityBadge}</Text>
              </View>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 3 }}>
                Ref: {app.refNumber} • Applied: {app.appliedDate} • Source: {app.source}
              </Text>
              <Text style={{ color: C.amber, fontSize: 12, fontWeight: '900', marginTop: 6 }}>
                Status: {app.status}
              </Text>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>{app.nextAction}</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {APPLICATION_STATUSES.map((st) => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => updateApplicationStatus(app.id, st)}
                      style={[
                        styles.miniStatusBtn,
                        {
                          backgroundColor: app.status === st ? C.teal : C.cardAlt,
                          borderColor: app.status === st ? C.teal : C.border,
                        },
                      ]}
                    >
                      <Text style={{ color: app.status === st ? '#071521' : C.sub, fontSize: 10, fontWeight: '800' }}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </View>
      )}

      {/* SCREEN 7 — DOCUMENT VAULT & 30 / 15 / 7 DAY RENEWALS */}
      {screen === 'vault' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.pageTitle, { color: C.text }]}>Document Vault & Renewals</Text>
          <Text style={{ color: C.sub, fontSize: 11, marginBottom: 10 }}>
            Renewal reminder windows: 30 days (Primary), 15 days (Reminder), 7 days (Urgent). Scheduled alerts run via backend cron in production.
          </Text>

          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900', marginBottom: 6 }}>
              ADD CERTIFICATE TO VAULT
            </Text>
            <TextInput
              value={newDocName}
              onChangeText={setNewDocName}
              placeholder="Certificate / License Name (e.g., IEC, FSSAI)"
              placeholderTextColor={C.sub}
              style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginBottom: 8 }]}
            />
            <TextInput
              value={newDocCertNo}
              onChangeText={setNewDocCertNo}
              placeholder="Certificate / Registration Number"
              placeholderTextColor={C.sub}
              style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginBottom: 8 }]}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.sub, fontSize: 10 }}>Expiry Date (YYYY-MM-DD)</Text>
                <TextInput
                  value={newDocExpiry}
                  onChangeText={setNewDocExpiry}
                  placeholder="2027-06-30"
                  placeholderTextColor={C.sub}
                  style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginTop: 3 }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.sub, fontSize: 10 }}>File Reference</Text>
                <TextInput
                  value={newDocFileLabel}
                  onChangeText={setNewDocFileLabel}
                  placeholder="doc.pdf"
                  placeholderTextColor={C.sub}
                  style={[styles.inputBox, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginTop: 3 }]}
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={addVaultCertificate}
              style={[styles.primaryBtn, { backgroundColor: C.teal }]}
            >
              <Text style={{ color: '#071521', fontSize: 13, fontWeight: '900' }}>Save to Document Vault</Text>
            </TouchableOpacity>
          </View>

          {vaultDocs.map((doc) => {
            const daysLeft = getDaysRemaining(doc.expiryDate);
            const tier = getRenewalTier(daysLeft);
            const badgeColor =
              tier.tone === 'warn' ? C.warn : tier.tone === 'amber' ? C.amber : tier.tone === 'teal' ? C.teal : C.ok;
            return (
              <View key={doc.id} style={[styles.listCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={styles.rowBetween}>
                  <Text style={{ color: C.text, fontSize: 14, fontWeight: '900', flex: 1 }}>{doc.licenseName}</Text>
                  <Text style={{ color: badgeColor, fontSize: 10, fontWeight: '900' }}>{tier.label}</Text>
                </View>
                <Text style={{ color: C.sub, fontSize: 11, marginTop: 3 }}>
                  No.: {doc.certNumber} • Country: {doc.countryCode} • Expiry: {doc.expiryDate}
                </Text>
                <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                  File: {doc.fileLabel} • Channels: In-App, Email, WhatsApp
                </Text>
                <TouchableOpacity
                  onPress={() => shareRenewalAlert(doc)}
                  style={[styles.miniStatusBtn, { backgroundColor: C.cardAlt, borderColor: C.teal, alignSelf: 'flex-start', marginTop: 8 }]}
                >
                  <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>Share Renewal Alert (WhatsApp / Mail)</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* ALERTS LOG SCREEN */}
      {screen === 'notifications' && (
        <View style={{ padding: 14 }}>
          <Text style={[styles.pageTitle, { color: C.text }]}>Status & Renewal Alerts</Text>
          {notifications.map((n) => (
            <View key={n.id} style={[styles.listCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: C.teal, fontSize: 13, fontWeight: '900' }}>{n.title}</Text>
                <Text style={{ color: C.sub, fontSize: 10 }}>{n.time}</Text>
              </View>
              <Text style={{ color: C.text, fontSize: 12, marginTop: 4 }}>{n.detail}</Text>
              <Text style={{ color: C.amber, fontSize: 10, fontWeight: '800', marginTop: 4 }}>{n.channels}</Text>
            </View>
          ))}
        </View>
      )}

      {/* COUNTRY PICKER MODAL */}
      <Modal visible={countryModalOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.rowBetween}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>Select Country</Text>
              <TouchableOpacity onPress={() => setCountryModalOpen(false)}>
                <Text style={{ color: C.teal, fontSize: 13, fontWeight: '900' }}>Close</Text>
              </TouchableOpacity>
            </View>
            {COUNTRIES_DATA.map((c) => (
              <TouchableOpacity
                key={c.code}
                onPress={() => handleSelectCountry(c)}
                style={[styles.countryRow, { borderBottomColor: C.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 14, fontWeight: '900' }}>
                    {c.flag} {c.name}
                  </Text>
                  <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>{c.coverageNote}</Text>
                </View>
                <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>{c.coverageLabel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { paddingRight: 6, paddingVertical: 2 },
  pillBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9, borderWidth: 1 },
  heroBox: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 12 },
  heroImg: { width: '100%', height: 132, borderRadius: 10 },
  secLabel: { fontSize: 11, fontWeight: '900', marginBottom: 6, marginTop: 4 },
  selectorCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  stageChip: { flex: 1, paddingVertical: 9, paddingHorizontal: 6, borderRadius: 10, borderWidth: 1 },
  grid2: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 11 },
  actionTitle: { fontSize: 13, fontWeight: '900', marginTop: 3 },
  readinessCard: { borderWidth: 1.2, borderRadius: 14, padding: 12, marginTop: 2 },
  pageTitle: { fontSize: 19, fontWeight: '900', marginBottom: 10 },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 12 },
  fieldLbl: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  inputBox: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8, fontSize: 12, fontWeight: '800' },
  choiceChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  listCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  authBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, borderWidth: 1 },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 0.5 },
  miniStatusBtn: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  primaryBtn: { borderRadius: 11, paddingVertical: 12, alignItems: 'center' },
  secondaryBtn: { flex: 1, borderRadius: 11, paddingVertical: 12, paddingHorizontal: 8, borderWidth: 1, alignItems: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, padding: 16 },
  countryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5 },
});
