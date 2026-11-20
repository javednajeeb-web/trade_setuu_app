import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Share,
  Linking,
  StatusBar,
  SafeAreaView,
  BackHandler,
  ActivityIndicator,
  Platform,
} from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import { supabase } from './src/lib/supabase';
import SetuuCalcProScreen from './src/SetuuCalcProScreen';
import LogisticsHubScreen from './src/LogisticsHubScreen';
import ServiceHubScreen from './src/ServiceHubScreen';

const AGMARKNET_API_KEY = '579b464db66ec23bdd00000126e3ad53d0e049c374bb6bbccfee0b03';
const AGMARKNET_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${AGMARKNET_API_KEY}&format=json&limit=40`;
const EXIM_NEWS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3DIndia%2Bexport%2Bimport%2BDGFT%2Bport%2Bshipping%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen';

const FALLBACK_MANDI = [
  { id: 'm1', commodity: 'Paddy / Parboiled Rice', variety: 'IR-64 / Mahamaya', market: 'Raipur Mandi', district: 'Raipur', state: 'Chhattisgarh', min: '2320', max: '2580', modal: '2490', date: '20 Nov 2026' },
  { id: 'm2', commodity: 'Yellow Maize', variety: 'Hybrid Feed Grade', market: 'Jagdalpur / Dhamtari', district: 'Dhamtari', state: 'Chhattisgarh', min: '2150', max: '2340', modal: '2260', date: '20 Nov 2026' },
  { id: 'm3', commodity: 'Turmeric Finger', variety: 'Salem / Nizamabad', market: 'Sangli Mandi', district: 'Sangli', state: 'Maharashtra', min: '13400', max: '14950', modal: '14200', date: '20 Nov 2026' },
  { id: 'm4', commodity: '1121 Basmati Paddy', variety: 'Export Grade', market: 'Karnal Mandi', district: 'Karnal', state: 'Haryana', min: '4150', max: '4520', modal: '4380', date: '20 Nov 2026' },
  { id: 'm5', commodity: 'Soyabean Yellow', variety: 'FAQ Export', market: 'Indore Mandi', district: 'Indore', state: 'Madhya Pradesh', min: '4480', max: '4790', modal: '4650', date: '20 Nov 2026' },
  { id: 'm6', commodity: 'Cumin (Jeera)', variety: 'A-Grade Export', market: 'Unjha APMC', district: 'Mehsana', state: 'Gujarat', min: '23800', max: '25600', modal: '24750', date: '20 Nov 2026' },
];

const METALS_LME_DATA = [
  { id: 'mt1', commodity: 'LME Copper (Grade A)', variety: '3-Month Cash Settlement', market: 'London Metal Exchange', district: 'Global Benchmark', state: 'LME / International', min: 'USD 9,180/MT', max: 'USD 9,295/MT', modal: 'USD 9,240/MT (₹8,56,086)', date: '20 Nov 2026' },
  { id: 'mt2', commodity: 'LME Aluminium Primary', variety: 'High Grade Ingot', market: 'London Metal Exchange', district: 'Global Benchmark', state: 'LME / International', min: 'USD 2,610/MT', max: 'USD 2,665/MT', modal: 'USD 2,642/MT (₹2,44,781)', date: '20 Nov 2026' },
  { id: 'mt3', commodity: 'LME Zinc Special HG', variety: 'SHG 99.995%', market: 'London Metal Exchange', district: 'Global Benchmark', state: 'LME / International', min: 'USD 2,980/MT', max: 'USD 3,040/MT', modal: 'USD 3,015/MT (₹2,79,340)', date: '20 Nov 2026' },
  { id: 'mt4', commodity: 'MS Billet & TMT Fe-550D', variety: 'Ex-Plant Raipur', market: 'Raipur Steel Hub', district: 'Raipur', state: 'Chhattisgarh', min: '₹44,800/MT', max: '₹46,200/MT', modal: '₹45,500/MT', date: '20 Nov 2026' },
  { id: 'mt5', commodity: 'Industrial Steam Coal', variety: 'GCV 4800 Imported', market: 'Vizag / Gangavaram Port', district: 'Visakhapatnam', state: 'Andhra Pradesh', min: '₹7,150/MT', max: '₹7,480/MT', modal: '₹7,320/MT', date: '20 Nov 2026' },
];

const FALLBACK_NEWS = [
  {
    id: 'n1',
    title: 'DGFT Streamlines Non-Basmati Parboiled Rice Export Documentation at JNPT & Vizag',
    source: 'Exim Trade Desk',
    date: '20 Nov 2026',
    summary: 'Exporters shipping parboiled rice via JNPT, Vizag, and Kakinada ports can now complete customs EDI verification faster with digital LUT and APEDA certificate sync, cutting container dwell time by up to 18 hours.',
    link: 'https://www.dgft.gov.in',
  },
  {
    id: 'n2',
    title: 'USD/INR Holds Near ₹92.65 Level — Higher Realization for Indian Agro & Engineering Exporters',
    source: 'Global FX & Trade Monitor',
    date: '20 Nov 2026',
    summary: 'With the US Dollar trading around ₹92.65, Indian rice, maize, spice, and metal exporters are locking in forward contracts for Q4 shipments to Gulf, West Africa, and European ports.',
    link: 'https://www.rbi.org.in',
  },
  {
    id: 'n3',
    title: 'Container Freight Index Stabilizes on India–Middle East & Red Sea Feeder Routes',
    source: 'Maritime Logistics Bulletin',
    date: '19 Nov 2026',
    summary: '20ft dry container rates from Nhava Sheva and Mundra to Jebel Ali and Dammam show steady slot availability ahead of peak December agro dispatch.',
    link: 'https://www.trade.gov',
  },
];

const INITIAL_FEED = [
  {
    id: 'seed-1',
    post_type: 'Sell Offer',
    title: 'Indian Non-Basmati Parboiled Rice (5% Broken)',
    qty_label: '2,500 MT • 50 Kg PP Bag',
    route_port: 'FOB JNPT / Vizag -> Jebel Ali / Dakar',
    price: 'USD 465 / MT (₹43,082)',
    trader_name: 'UA EXIM Overseas',
    trader_role: 'Verified Exporter',
    phone: '+919826100101',
    verified: true,
    sponsored: false,
  },
  {
    id: 'seed-2',
    post_type: 'Buy Requirement',
    title: 'Yellow Maize (Feed Grade, Moisture <14%)',
    qty_label: '1,000 MT • Bulk / 50 Kg Bag',
    route_port: 'CIF Port Klang / Vietnam',
    price: 'USD 272 / MT',
    trader_name: 'Apex Global Commodities',
    trader_role: 'Commodity Broker',
    phone: '+919826100202',
    verified: true,
    sponsored: false,
  },
];

const PAID_EXCLUSIVE_MODULES = [
  { id: 'ex1', title: 'Setuu DocForge AI (Proforma, Packing List, BL & COO)', desc: 'Auto-generate export-ready customs & bank documents in 1 click.' },
  { id: 'ex2', title: 'Direct Verified Buyer Vault (140+ Countries)', desc: 'Unlocked importer directories with past shipment & LC history.' },
  { id: 'ex3', title: 'Priority Commodity Broker Deal-Room', desc: 'Direct commission protection & NCNDA digital escrow room.' },
];

function TradeSetuuHeader({ searchQuery, onChangeSearch, onOpenMenu, onBack, title, lang, onToggleLang, onOpenNotifications }) {
  const renderMonogram = () => (
    <View style={hdr.orbitOuter}>
      <View style={hdr.orbitTealArc} />
      <View style={hdr.orbitGoldArc} />
      <View style={hdr.innerCircle}>
        <Text style={hdr.tStem}>T</Text>
        <View style={hdr.interlockBridge} />
        <Text style={hdr.sCurve}>S</Text>
      </View>
    </View>
  );

  if (onBack) {
    return (
      <View style={hdr.bar}>
        <TouchableOpacity style={hdr.backBtn} onPress={onBack}>
          <Text style={hdr.backTxt}>← {lang === 'hi' ? 'पीछे' : 'Back'}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {renderMonogram()}
          <Text style={hdr.subTitle} numberOfLines={1}>{title}</Text>
        </View>
        <TouchableOpacity style={hdr.langPill} onPress={onToggleLang}>
          <Text style={hdr.langTxt}>{lang === 'hi' ? 'EN' : 'हिं'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={hdr.bar}>
      <TouchableOpacity onPress={onOpenMenu} activeOpacity={0.85}>
        {renderMonogram()}
      </TouchableOpacity>
      <View style={hdr.searchWrap}>
        <Text style={{ fontSize: 12, marginRight: 5 }}>🔍</Text>
        <TextInput
          style={hdr.searchInput}
          placeholder={lang === 'hi' ? 'कमोडिटी, पोर्ट, मंडी खोजें...' : 'Search rice, maize, ports, mandi...'}
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={onChangeSearch}
        />
      </View>
      <TouchableOpacity style={hdr.langPill} onPress={onToggleLang}>
        <Text style={hdr.langTxt}>{lang === 'hi' ? 'EN' : 'हिं'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={hdr.bellBtn} onPress={onOpenNotifications}>
        <Text style={{ fontSize: 14 }}>🔔</Text>
      </TouchableOpacity>
    </View>
  );
}
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('en');

  const [activeTab, setActiveTab] = useState('feed');
  const [tabHistory, setTabHistory] = useState(['feed']);
  const [serviceInitial, setServiceInitial] = useState('shipping');
  const [logisticsInitial, setLogisticsInitial] = useState('rescue');
  const [searchQuery, setSearchQuery] = useState('');

  // Subscription & Paid-Only Coming Soon Access
  const [isPaid, setIsPaid] = useState(false);
  const [activePlanName, setActivePlanName] = useState('Free Tier');
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subRole, setSubRole] = useState('commodity_broker');
  const [billingCycle, setBillingCycle] = useState('yearly');

  // Setuu Wallet & Ad Manager
  const [walletBalance, setWalletBalance] = useState(1500);
  const [walletTxns, setWalletTxns] = useState([
    { id: 'tx-1', title: 'Initial Setuu Wallet Credit', amount: '+₹1,500', date: '20 Nov 2026' },
  ]);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adDetails, setAdDetails] = useState('');
  const [adPhone, setAdPhone] = useState('');
  const [adBudget, setAdBudget] = useState(499);

  // Live Mandi & Metals/LME
  const [mandiList, setMandiList] = useState(FALLBACK_MANDI);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('All India');
  const [marketSegment, setMarketSegment] = useState('agro');
  const [selectedMandiItem, setSelectedMandiItem] = useState(null);

  // Live Exim News
  const [newsList, setNewsList] = useState(FALLBACK_NEWS);
  const [showAllNews, setShowAllNews] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState(null);

  // Feed & Modals
  const [feedPosts, setFeedPosts] = useState(INITIAL_FEED);
  const [likedIds, setLikedIds] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostRoute, setNewPostRoute] = useState('');
  const [newPostPrice, setNewPostPrice] = useState('');
  const [newPostPhone, setNewPostPhone] = useState('');
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  const tickerRef = useRef(null);
  const tickerOffset = useRef(0);

  const isDark = theme === 'dark';
  const T = {
    bg: isDark ? '#0B0D12' : '#F2F4F8',
    card: isDark ? '#131924' : '#FAFBFD',
    border: isDark ? '#1E293B' : '#DCE2EC',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#64748B',
    pill: isDark ? '#182232' : '#E7ECF4',
    accent: '#0D9488',
    gold: '#C9B89A',
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Live Agmarknet Mandi Prices & Live Exim News
  useEffect(() => {
    let mounted = true;
    const loadLiveApis = async () => {
      try {
        setMandiLoading(true);
        const mRes = await fetch(AGMARKNET_URL);
        const mJson = await mRes.json();
        if (mounted && mJson && Array.isArray(mJson.records) && mJson.records.length > 0) {
          const mapped = mJson.records.map((r, idx) => ({
            id: 'ag-' + idx,
            commodity: r.commodity || 'Agro Commodity',
            variety: r.variety || r.grade || 'Standard',
            market: r.market || 'APMC Mandi',
            district: r.district || '',
            state: r.state || 'India',
            min: String(r.min_price || '0'),
            max: String(r.max_price || '0'),
            modal: String(r.modal_price || '0'),
            date: r.arrival_date || '20 Nov 2026',
          }));
          setMandiList(mapped);
        }
      } catch (e) {
        // Keep FALLBACK_MANDI seamlessly
      } finally {
        if (mounted) setMandiLoading(false);
      }

      try {
        const nRes = await fetch(EXIM_NEWS_URL);
        const nJson = await nRes.json();
        if (mounted && nJson && Array.isArray(nJson.items) && nJson.items.length > 0) {
          const mappedNews = nJson.items.slice(0, 8).map((item, idx) => ({
            id: 'live-n-' + idx,
            title: item.title || 'Global Trade Update',
            source: item.author || 'Exim Live Feed',
            date: (item.pubDate || '').slice(0, 10) || '20 Nov 2026',
            summary: (item.description || item.title || '').replace(/<[^>]*>?/gm, ''),
            link: item.link || 'https://www.dgft.gov.in',
          }));
          setNewsList(mappedNews);
        }
      } catch (e) {
        // Keep FALLBACK_NEWS seamlessly
      }
    };
    loadLiveApis();
    return () => { mounted = false; };
  }, []);

  // Auto-Scroll Mandi Pulse Strip on Home Feed
  useEffect(() => {
    const interval = setInterval(() => {
      if (tickerRef.current && activeTab === 'feed') {
        tickerOffset.current += 190;
        if (tickerOffset.current > 1100) tickerOffset.current = 0;
        tickerRef.current.scrollTo({ x: tickerOffset.current, animated: true });
      }
    }, 3200);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Android Side-Gesture / Hardware Back Button Handling
  useEffect(() => {
    const onBackPress = () => {
      if (selectedNewsItem) { setSelectedNewsItem(null); return true; }
      if (selectedMandiItem) { setSelectedMandiItem(null); return true; }
      if (adModalOpen) { setAdModalOpen(false); return true; }
      if (subModalOpen) { setSubModalOpen(false); return true; }
      if (postModalOpen) { setPostModalOpen(false); return true; }
      if (notifModalOpen) { setNotifModalOpen(false); return true; }
      if (drawerOpen) { setDrawerOpen(false); return true; }
      if (tabHistory.length > 1) {
        const nextHist = tabHistory.slice(0, -1);
        setTabHistory(nextHist);
        setActiveTab(nextHist[nextHist.length - 1]);
        return true;
      }
      if (activeTab !== 'feed') {
        setActiveTab('feed');
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [selectedNewsItem, selectedMandiItem, adModalOpen, subModalOpen, postModalOpen, notifModalOpen, drawerOpen, tabHistory, activeTab]);

  const navigateTab = (tab) => {
    setActiveTab(tab);
    setTabHistory((prev) => (prev[prev.length - 1] === tab ? prev : [...prev, tab]));
  };

  const deductWallet = (amount, reason) => {
    setWalletBalance((prev) => Math.max(0, prev - amount));
    setWalletTxns((prev) => [{ id: String(Date.now()), title: reason, amount: `-₹${amount}`, date: 'Today' }, ...prev]);
  };

  const handleAddWalletMoney = (amt) => {
    setWalletBalance((prev) => prev + amt);
    setWalletTxns((prev) => [{ id: String(Date.now()), title: 'Setuu Wallet Top-Up', amount: `+₹${amt}`, date: 'Today' }, ...prev]);
    Alert.alert('Setuu Wallet Updated ✓', `₹${amt} added to your Setuu Wallet.`);
  };

  const handleLaunchAd = () => {
    if (!adTitle.trim() || !adDetails.trim()) {
      Alert.alert('Missing Ad Info', 'Please enter your Ad Headline and Commodity/Service details.');
      return;
    }
    if (walletBalance < adBudget) {
      Alert.alert(
        lang === 'hi' ? 'Setuu Wallet में बैलेंस कम है' : 'Insufficient Setuu Wallet Balance',
        lang === 'hi' ? `इस विज्ञापन के लिए ₹${adBudget} चाहिए। कृपया पहले वॉलेट में पैसे जोड़ें।` : `You need ₹${adBudget} in Setuu Wallet. Please add funds first.`
      );
      return;
    }
    deductWallet(adBudget, `Ad Campaign: ${adTitle.trim()}`);
    const sponsoredPost = {
      id: 'ad-' + Date.now(),
      post_type: 'Sponsored Ad',
      title: adTitle.trim(),
      qty_label: adDetails.trim(),
      route_port: 'Pan-India & Global Export Verified',
      price: `Promoted • ₹${adBudget} Reach`,
      trader_name: 'Your Business (Promoted)',
      trader_role: 'Verified Advertiser',
      phone: adPhone.trim() || '+919826100000',
      verified: true,
      sponsored: true,
    };
    setFeedPosts([sponsoredPost, ...feedPosts]);
    setAdTitle('');
    setAdDetails('');
    setAdPhone('');
    setAdModalOpen(false);
    navigateTab('feed');
    Alert.alert(
      lang === 'hi' ? 'विज्ञापन लाइव हो गया ✓' : 'Ad Live on Trade Feed ✓',
      `₹${adBudget} deducted from Setuu Wallet.`
    );
  };

  const handleActivatePlan = (planTitle, priceLabel) => {
    setIsPaid(true);
    setActivePlanName(`${planTitle} (${priceLabel})`);
    setSubModalOpen(false);
    Alert.alert(
      lang === 'hi' ? 'प्रीमियम प्लान सक्रिय ✓' : 'Subscription Activated ✓',
      `${planTitle} (${priceLabel})\n\n${lang === 'hi' ? 'अब आपके साइड ड्रॉअर में Exclusive Pro & Coming Soon मॉड्यूल खुल गए हैं।' : 'Exclusive Pro & Coming Soon modules are now unlocked in your Side Drawer!'}`
    );
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim()) {
      Alert.alert('Required', 'Please enter commodity or trade requirement.');
      return;
    }
    const created = {
      id: 'post-' + Date.now(),
      post_type: 'Trade Offer',
      title: newPostTitle.trim(),
      qty_label: 'Ready Dispatch • Verified Quality',
      route_port: newPostRoute.trim() || 'FOB Indian Port / Domestic',
      price: newPostPrice.trim() || 'Best Market Quote',
      trader_name: 'Najeeb Javed (Trade SETUU)',
      trader_role: activePlanName,
      phone: newPostPhone.trim() || '+919826100000',
      verified: true,
      sponsored: false,
    };
    setFeedPosts([created, ...feedPosts]);
    setNewPostTitle('');
    setNewPostRoute('');
    setNewPostPrice('');
    setNewPostPhone('');
    setPostModalOpen(false);
  };

  const shareContent = async (title, msg) => {
    try {
      await Share.share({ message: `${title}\n${msg}\n\n— Shared via Trade SETUU (Global Trade & Logistics Ecosystem)` });
    } catch (e) {}
  };

  const openWhatsApp = (phone, text) => {
    const clean = (phone || '+919826100000').replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`);
  };

  const availableStates = ['All India', ...Array.from(new Set(mandiList.map((m) => m.state).filter(Boolean)))];
  const filteredMandi = mandiList.filter((m) => {
    const matchState = selectedState === 'All India' || m.state === selectedState;
    const matchSearch = !searchQuery.trim() || `${m.commodity} ${m.market} ${m.state}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchState && matchSearch;
  });
  const filteredPosts = feedPosts.filter(
    (p) => !searchQuery.trim() || `${p.title} ${p.route_port} ${p.trader_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showSplash) {
    return <SplashScreen />;
  }
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />

      <TradeSetuuHeader
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onOpenMenu={() => setDrawerOpen(true)}
        onBack={activeTab !== 'feed' ? () => navigateTab('feed') : null}
        title={
          activeTab === 'market' ? (lang === 'hi' ? 'मंडी पल्स और LME मार्केट' : 'Mandi Pulse & LME Market') :
          activeTab === 'calc' ? 'Setuu Calc Pro' :
          activeTab === 'services' ? (lang === 'hi' ? 'सर्विस हब' : 'Service Hub') :
          activeTab === 'logistics' ? (lang === 'hi' ? 'ग्लोबल लॉजिस्टिक्स हब' : 'Global Logistics Hub') : ''
        }
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'hi' : 'en')}
        onOpenNotifications={() => setNotifModalOpen(true)}
      />

      {activeTab === 'feed' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: 75 }}>
          {/* Live Auto-Scrolling Mandi Pulse Ticker */}
          <View style={[styles.sectionBox, { backgroundColor: T.card, borderColor: T.border }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.secHead, { color: T.text }]}>
                📈 {lang === 'hi' ? 'लाइव मंडी पल्स (Agmarknet)' : 'Live Mandi Pulse (Agmarknet)'}
              </Text>
              <TouchableOpacity onPress={() => navigateTab('market')}>
                <Text style={{ color: T.accent, fontSize: 12, fontWeight: '800' }}>{lang === 'hi' ? 'सभी राज्य →' : 'State Filter →'}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView ref={tickerRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {mandiList.slice(0, 10).map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setSelectedMandiItem(m)}
                  style={[styles.tickerCard, { backgroundColor: T.pill, borderColor: T.border }]}
                >
                  <Text style={{ color: T.accent, fontSize: 11, fontWeight: '800' }} numberOfLines={1}>{m.commodity}</Text>
                  <Text style={{ color: T.text, fontSize: 13, fontWeight: '900', marginVertical: 2 }}>₹{m.modal}/Qtl</Text>
                  <Text style={{ color: T.sub, fontSize: 10 }} numberOfLines={1}>{m.market} • {m.state}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Quick Action Strip */}
          <View style={styles.quickRow}>
            <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#0D1B2A', borderColor: '#14B8A6' }]} onPress={() => setPostModalOpen(true)}>
              <Text style={{ color: '#14B8A6', fontSize: 12, fontWeight: '800' }}>+ {lang === 'hi' ? 'डील पोस्ट करें' : 'Post Trade Offer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickBtn, { backgroundColor: T.card, borderColor: T.border }]} onPress={() => { setLogisticsInitial('rescue'); navigateTab('logistics'); }}>
              <Text style={{ color: T.text, fontSize: 12, fontWeight: '800' }}>🚨 {lang === 'hi' ? 'पोर्ट रेस्क्यू (₹499)' : 'Port Rescue (₹499)'}</Text>
            </TouchableOpacity>
          </View>

          {/* Trade Feed Cards with Circular WhatsApp Button */}
          {filteredPosts.map((post) => {
            const liked = likedIds.includes(post.id);
            return (
              <View key={post.id} style={[styles.postCard, { backgroundColor: T.card, borderColor: post.sponsored ? '#C9B89A' : T.border }]}>
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.postTag}>{post.post_type}</Text>
                    {post.verified && <Text style={styles.verBadge}>✓ Verified</Text>}
                  </View>
                  <Text style={{ color: T.sub, fontSize: 11 }}>{post.trader_role}</Text>
                </View>
                <Text style={[styles.postTitle, { color: T.text }]}>{post.title}</Text>
                <Text style={[styles.postMeta, { color: T.sub }]}>📦 {post.qty_label} • 🚢 {post.route_port}</Text>
                <Text style={styles.postPrice}>{post.price}</Text>

                <View style={[styles.postFooter, { borderTopColor: T.border }]}>
                  <Text style={{ color: T.text, fontSize: 12, fontWeight: '700', flex: 1 }} numberOfLines={1}>{post.trader_name}</Text>
                  <TouchableOpacity
                    style={styles.actIcon}
                    onPress={() => setLikedIds(liked ? likedIds.filter((i) => i !== post.id) : [...likedIds, post.id])}
                  >
                    <Text style={{ fontSize: 14 }}>{liked ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actIcon}
                    onPress={() => shareContent(post.title, `${post.qty_label} | ${post.route_port} | ${post.price}`)}
                  >
                    <Text style={{ fontSize: 14 }}>📤</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.waCircle}
                    onPress={() => openWhatsApp(post.phone, `Hi ${post.trader_name}, saw your listing on Trade SETUU: ${post.title}`)}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>WA</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Live Exim News Section */}
          <View style={[styles.sectionBox, { backgroundColor: T.card, borderColor: T.border, marginTop: 6 }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.secHead, { color: T.text }]}>📰 {lang === 'hi' ? 'लाइव एक्सिम न्यूज़' : 'Live Exim News'}</Text>
              <TouchableOpacity onPress={() => setShowAllNews(!showAllNews)}>
                <Text style={{ color: T.accent, fontSize: 12, fontWeight: '800' }}>{showAllNews ? 'Show Less' : 'See More →'}</Text>
              </TouchableOpacity>
            </View>
            {(showAllNews ? newsList : newsList.slice(0, 3)).map((n) => (
              <TouchableOpacity
                key={n.id}
                onPress={() => setSelectedNewsItem(n)}
                style={[styles.newsItem, { borderBottomColor: T.border }]}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: T.text, fontSize: 13, fontWeight: '700' }}>{n.title}</Text>
                  <Text style={{ color: T.sub, fontSize: 11, marginTop: 3 }}>{n.source} • {n.date}</Text>
                </View>
                <TouchableOpacity onPress={() => shareContent(n.title, n.summary)} style={styles.actIcon}>
                  <Text style={{ fontSize: 14 }}>📤</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {activeTab === 'market' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: 75 }}>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: marketSegment === 'agro' ? T.accent : T.card, borderColor: T.border }]}
              onPress={() => setMarketSegment('agro')}
            >
              <Text style={{ color: marketSegment === 'agro' ? '#FFF' : T.text, fontSize: 12, fontWeight: '800' }}>🌾 Agro Mandis (Live API)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: marketSegment === 'metals' ? T.accent : T.card, borderColor: T.border }]}
              onPress={() => setMarketSegment('metals')}
            >
              <Text style={{ color: marketSegment === 'metals' ? '#FFF' : T.text, fontSize: 12, fontWeight: '800' }}>⚙️ Metals, LME & Industrial</Text>
            </TouchableOpacity>
          </View>

          {marketSegment === 'agro' ? (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {availableStates.map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setSelectedState(st)}
                    style={[styles.stateChip, { backgroundColor: selectedState === st ? '#0D1B2A' : T.card, borderColor: selectedState === st ? '#14B8A6' : T.border }]}
                  >
                    <Text style={{ color: selectedState === st ? '#14B8A6' : T.text, fontSize: 11, fontWeight: '800' }}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {mandiLoading && <ActivityIndicator color={T.accent} style={{ marginVertical: 10 }} />}
              {filteredMandi.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setSelectedMandiItem(m)}
                  style={[styles.postCard, { backgroundColor: T.card, borderColor: T.border }]}
                >
                  <View style={styles.rowBetween}>
                    <Text style={{ color: T.text, fontSize: 14, fontWeight: '800' }}>{m.commodity} ({m.variety})</Text>
                    <TouchableOpacity onPress={() => shareContent(`${m.commodity} Mandi Rate`, `${m.market}, ${m.state}: Modal ₹${m.modal}/Qtl`)}>
                      <Text style={{ fontSize: 15 }}>📤</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>📍 {m.market}, {m.state} • {m.date}</Text>
                  <Text style={{ color: T.accent, fontSize: 14, fontWeight: '900', marginTop: 5 }}>
                    Modal: ₹{m.modal}/Qtl  (Min ₹{m.min} • Max ₹{m.max})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View>
              {METALS_LME_DATA.map((mt) => (
                <TouchableOpacity
                  key={mt.id}
                  onPress={() => setSelectedMandiItem(mt)}
                  style={[styles.postCard, { backgroundColor: T.card, borderColor: T.border }]}
                >
                  <View style={styles.rowBetween}>
                    <Text style={{ color: T.text, fontSize: 14, fontWeight: '800' }}>{mt.commodity}</Text>
                    <TouchableOpacity onPress={() => shareContent(mt.commodity, `${mt.market}: ${mt.modal}`)}>
                      <Text style={{ fontSize: 15 }}>📤</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>{mt.variety} • {mt.market}</Text>
                  <Text style={{ color: '#C9B89A', fontSize: 13, fontWeight: '900', marginTop: 5 }}>{mt.modal}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'calc' && <SetuuCalcProScreen theme={theme} lang={lang} />}
      {activeTab === 'services' && <ServiceHubScreen theme={theme} lang={lang} initialService={serviceInitial} />}
      {activeTab === 'logistics' && (
        <LogisticsHubScreen
          theme={theme}
          lang={lang}
          initialTab={logisticsInitial}
          walletBalance={walletBalance}
          onDeductWallet={deductWallet}
        />
      )}

      {/* Bottom 5-Tab Bar */}
      <View style={[styles.bottomBar, { backgroundColor: '#0B0D12', borderTopColor: '#1E293B' }]}>
        {[
          { id: 'feed', icon: '🏠', label: lang === 'hi' ? 'फ़ीड' : 'Feed' },
          { id: 'market', icon: '📊', label: lang === 'hi' ? 'मंडी' : 'Mandi' },
          { id: 'calc', icon: '🧮', label: lang === 'hi' ? 'कैलक' : 'Calc Pro' },
          { id: 'services', icon: '🛠️', label: lang === 'hi' ? 'सर्विस' : 'Services' },
          { id: 'logistics', icon: '🚢', label: lang === 'hi' ? 'लॉजिस्टिक्स' : 'Logistics' },
        ].map((t) => (
          <TouchableOpacity key={t.id} style={styles.navItem} onPress={() => navigateTab(t.id)}>
            <Text style={{ fontSize: 17 }}>{t.icon}</Text>
            <Text style={{ color: activeTab === t.id ? '#14B8A6' : '#94A3B8', fontSize: 10, fontWeight: '800', marginTop: 2 }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SIDE DRAWER MODAL (Wallet + Ad Manager + Commodity Broker ₹11,499 + Paid-Only Coming Soon) */}
      <Modal visible={drawerOpen} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <ScrollView style={styles.drawerBox} contentContainerStyle={{ paddingBottom: 35 }}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={{ color: '#D9DDE3', fontSize: 18, fontWeight: '900' }}>Trade SETUU</Text>
                <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '700' }}>Global Trade & Logistics Ecosystem</Text>
              </View>
              <TouchableOpacity onPress={() => setDrawerOpen(false)} style={styles.closePill}>
                <Text style={{ color: '#FFF', fontWeight: '900' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tierCard}>
              <Text style={{ color: '#C9B89A', fontSize: 11, fontWeight: '800' }}>ACTIVE MEMBERSHIP</Text>
              <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '900', marginTop: 2 }}>{activePlanName}</Text>
            </View>

            {/* Setuu Wallet */}
            <View style={styles.walletCard}>
              <View style={styles.rowBetween}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>👛 Setuu Wallet Balance</Text>
                <TouchableOpacity style={styles.topupBtn} onPress={() => handleAddWalletMoney(1000)}>
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>+ ₹1,000 Top-Up</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ color: '#14B8A6', fontSize: 22, fontWeight: '900', marginVertical: 4 }}>₹{walletBalance.toLocaleString('en-IN')}</Text>
              {walletTxns.slice(0, 2).map((tx) => (
                <Text key={tx.id} style={{ color: '#CBD5E1', fontSize: 10 }}>• {tx.title}: {tx.amount}</Text>
              ))}
            </View>

            {/* Ad Manager (Connected to Setuu Wallet) */}
            <TouchableOpacity style={styles.drawerBtn} onPress={() => { setDrawerOpen(false); setAdModalOpen(true); }}>
              <Text style={styles.drawerBtnTxt}>📢 Ad Manager (Pay via Setuu Wallet)</Text>
            </TouchableOpacity>

            {/* Subscription Plans (₹11,499 Commodity Broker) */}
            <TouchableOpacity style={styles.drawerBtn} onPress={() => { setDrawerOpen(false); setSubModalOpen(true); }}>
              <Text style={styles.drawerBtnTxt}>💎 Subscription Plans (Commodity Broker ₹11,499)</Text>
            </TouchableOpacity>

            {/* Theme & Language */}
            <TouchableOpacity style={styles.drawerBtn} onPress={() => setTheme(isDark ? 'light' : 'dark')}>
              <Text style={styles.drawerBtnTxt}>{isDark ? '🌤️ Switch to Soft Ivory Light Mode' : '🌙 Switch to Dark Mode'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerBtn} onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}>
              <Text style={styles.drawerBtnTxt}>🌐 Language: {lang === 'en' ? 'English -> हिंदी बदलें' : 'हिंदी -> Switch to English'}</Text>
            </TouchableOpacity>

            {/* Coming Soon / Advanced Modules — SHOWN ONLY TO PAID SUBSCRIBERS */}
            {isPaid && (
              <View style={styles.proBox}>
                <Text style={{ color: '#C9B89A', fontSize: 12, fontWeight: '900', marginBottom: 6 }}>
                  ⭐ PAID SUBSCRIBER EXCLUSIVE & COMING SOON
                </Text>
                {PAID_EXCLUSIVE_MODULES.map((mod) => (
                  <View key={mod.id} style={{ marginBottom: 8 }}>
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>• {mod.title}</Text>
                    <Text style={{ color: '#94A3B8', fontSize: 11 }}>{mod.desc}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ marginTop: 22, borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 12 }}>
              <Text style={{ color: '#8A8F98', fontSize: 11, fontWeight: '800' }}>Powered by Apex Sync Technologies</Text>
              <Text style={{ color: '#64748B', fontSize: 9, marginTop: 2 }}>BUILD • CONNECT • AUTOMATE • SCALE GLOBALLY</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* AD MANAGER MODAL */}
      <Modal visible={adModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#C9B89A', fontSize: 12, fontWeight: '800' }}>SETUU AD MANAGER • WALLET CONNECTED</Text>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', marginVertical: 4 }}>Promote Your Commodity / Service</Text>
            <Text style={{ color: '#14B8A6', fontSize: 12, fontWeight: '700', marginBottom: 10 }}>Available Setuu Wallet: ₹{walletBalance}</Text>

            <TextInput style={styles.mInput} placeholder="Ad Headline (e.g. 1121 Basmati Ready Stock)" placeholderTextColor="#64748B" value={adTitle} onChangeText={setAdTitle} />
            <TextInput style={styles.mInput} placeholder="Quantity, Port & Offer Details" placeholderTextColor="#64748B" value={adDetails} onChangeText={setAdDetails} />
            <TextInput style={styles.mInput} placeholder="Direct WhatsApp Number (+91...)" placeholderTextColor="#64748B" keyboardType="phone-pad" value={adPhone} onChangeText={setAdPhone} />

            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {[299, 499, 999].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setAdBudget(amt)}
                  style={[styles.budgetChip, adBudget === amt && { backgroundColor: '#0D9488', borderColor: '#14B8A6' }]}
                >
                  <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>₹{amt} Boost</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryModalBtn} onPress={handleLaunchAd}>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>🚀 Pay ₹{adBudget} from Wallet & Launch Ad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setAdModalOpen(false)}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUBSCRIPTION PLANS MODAL (Commodity Broker Single ₹11,499 + Yearly Shipping/Transporter) */}
      <Modal visible={subModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={styles.modalCard}>
              <Text style={{ color: '#C9B89A', fontSize: 12, fontWeight: '800' }}>TRADE SETUU MEMBERSHIP PLANS</Text>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 10 }}>Unlock Paid Pro & Coming Soon Suite</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {[
                  { id: 'commodity_broker', label: 'Commodity Broker' },
                  { id: 'shipping_line', label: 'Shipping Line' },
                  { id: 'transporter', label: 'Transporter' },
                  { id: 'shipping_broker', label: 'Shipping Broker' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setSubRole(r.id)}
                    style={[styles.budgetChip, subRole === r.id && { backgroundColor: '#0D9488', borderColor: '#14B8A6' }]}
                  >
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {subRole === 'commodity_broker' ? (
                <View style={styles.planBox}>
                  <Text style={{ color: '#14B8A6', fontSize: 12, fontWeight: '800' }}>SINGLE LIFETIME / COMPLETE ACCESS PLAN</Text>
                  <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '900', marginVertical: 6 }}>₹11,499 Only</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 12, lineHeight: 18 }}>
                    • Direct Agro & Metal Commodity Deal-Room{'\n'}
                    • Verified Exporter & Global Importer Leads{'\n'}
                    • Full Access to All Paid-Only & Coming Soon Tools
                  </Text>
                  <TouchableOpacity style={[styles.primaryModalBtn, { marginTop: 12 }]} onPress={() => handleActivatePlan('Commodity Broker', '₹11,499')}>
                    <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>Activate Commodity Broker — ₹11,499</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.planBox}>
                  {(subRole === 'shipping_line' || subRole === 'transporter') && (
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                      {['monthly', 'yearly'].map((cyc) => (
                        <TouchableOpacity
                          key={cyc}
                          onPress={() => setBillingCycle(cyc)}
                          style={[styles.budgetChip, billingCycle === cyc && { backgroundColor: '#0D9488' }]}
                        >
                          <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>
                            {cyc === 'yearly' ? 'Yearly (Save 25%)' : 'Monthly'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 6 }}>
                    {subRole === 'shipping_line'
                      ? (billingCycle === 'yearly' ? '₹21,999 / Year' : '₹2,499 / Month')
                      : subRole === 'transporter'
                      ? (billingCycle === 'yearly' ? '₹12,999 / Year' : '₹1,499 / Month')
                      : '₹3,499 / Month'}
                  </Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 12, marginBottom: 12 }}>
                    • Verified Fleet / Line Badge & Priority RFQ Leads{'\n'}
                    • Unlocks Exclusive Paid-Only & Coming Soon Modules
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryModalBtn}
                    onPress={() =>
                      handleActivatePlan(
                        subRole.replace('_', ' ').toUpperCase(),
                        subRole === 'shipping_line'
                          ? (billingCycle === 'yearly' ? '₹21,999/Yr' : '₹2,499/Mo')
                          : subRole === 'transporter'
                          ? (billingCycle === 'yearly' ? '₹12,999/Yr' : '₹1,499/Mo')
                          : '₹3,499/Mo'
                      )
                    }
                  >
                    <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>Activate Plan Now</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setSubModalOpen(false)}>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MANDI / METAL DETAIL MODAL */}
      <Modal visible={!!selectedMandiItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>{selectedMandiItem?.state}</Text>
            <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '900', marginTop: 4 }}>{selectedMandiItem?.commodity}</Text>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>Variety: {selectedMandiItem?.variety}</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 13, marginTop: 8 }}>📍 Market: {selectedMandiItem?.market}</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 13, marginTop: 4 }}>📅 Date: {selectedMandiItem?.date}</Text>
            <Text style={{ color: '#C9B89A', fontSize: 16, fontWeight: '900', marginTop: 10 }}>
              Modal Price: ₹{selectedMandiItem?.modal}
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 3 }}>
              Range: Min {selectedMandiItem?.min} — Max {selectedMandiItem?.max}
            </Text>
            <TouchableOpacity
              style={[styles.primaryModalBtn, { marginTop: 14 }]}
              onPress={() => shareContent(`${selectedMandiItem?.commodity} Rate`, `${selectedMandiItem?.market} (${selectedMandiItem?.state}): ₹${selectedMandiItem?.modal}`)}
            >
              <Text style={{ color: '#FFF', fontWeight: '900' }}>📤 Share Mandi Rate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setSelectedMandiItem(null)}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EXIM NEWS FULL READER MODAL */}
      <Modal visible={!!selectedNewsItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>{selectedNewsItem?.source} • {selectedNewsItem?.date}</Text>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', marginVertical: 8 }}>{selectedNewsItem?.title}</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 13, lineHeight: 20 }}>{selectedNewsItem?.summary}</Text>
            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.primaryModalBtn, { flex: 1, marginRight: 6 }]}
                onPress={() => shareContent(selectedNewsItem?.title, selectedNewsItem?.summary)}
              >
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>📤 Share News</Text>
              </TouchableOpacity>
              {selectedNewsItem?.link && (
                <TouchableOpacity
                  style={[styles.primaryModalBtn, { flex: 1, marginLeft: 6, backgroundColor: '#1E293B' }]}
                  onPress={() => Linking.openURL(selectedNewsItem.link)}
                >
                  <Text style={{ color: '#14B8A6', fontWeight: '800', fontSize: 12 }}>🌐 Read Source</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setSelectedNewsItem(null)}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CREATE POST MODAL */}
      <Modal visible={postModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 10 }}>Post New Trade Offer / RFQ</Text>
            <TextInput style={styles.mInput} placeholder="Commodity & Grade (e.g. 500 MT IR-64 Rice)" placeholderTextColor="#64748B" value={newPostTitle} onChangeText={setNewPostTitle} />
            <TextInput style={styles.mInput} placeholder="Port / Route (e.g. FOB JNPT -> Dakar)" placeholderTextColor="#64748B" value={newPostRoute} onChangeText={setNewPostRoute} />
            <TextInput style={styles.mInput} placeholder="Target Price (e.g. USD 465 / MT)" placeholderTextColor="#64748B" value={newPostPrice} onChangeText={setNewPostPrice} />
            <TextInput style={styles.mInput} placeholder="WhatsApp Number (+91...)" placeholderTextColor="#64748B" keyboardType="phone-pad" value={newPostPhone} onChangeText={setNewPostPhone} />
            <TouchableOpacity style={styles.primaryModalBtn} onPress={handleCreatePost}>
              <Text style={{ color: '#FFF', fontWeight: '900' }}>Publish to Trade Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setPostModalOpen(false)}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NOTIFICATIONS MODAL */}
      <Modal visible={notifModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 8 }}>Trade SETUU Alerts</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 12, marginBottom: 6 }}>• Live USD/INR synced at ₹92.65</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 12, marginBottom: 6 }}>• Agmarknet Mandi & Exim News feeds active</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 12, marginBottom: 12 }}>• 3 New Port Rescue deals available (₹499 unlock)</Text>
            <TouchableOpacity style={styles.primaryModalBtn} onPress={() => setNotifModalOpen(false)}>
              <Text style={{ color: '#FFF', fontWeight: '800' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const hdr = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0D12', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  orbitOuter: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0B0D12', borderWidth: 1.5, borderColor: '#D9DDE3', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  orbitTealArc: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent', borderTopColor: '#14B8A6', borderRightColor: '#14B8A6', transform: [{ rotate: '25deg' }] },
  orbitGoldArc: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'transparent', borderBottomColor: '#C9B89A', borderLeftColor: '#C9B89A' },
  innerCircle: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tStem: { position: 'absolute', top: 1, left: 4, color: '#D9DDE3', fontSize: 17, fontWeight: '900' },
  interlockBridge: { position: 'absolute', width: 10, height: 2.5, backgroundColor: '#14B8A6', borderRadius: 2, transform: [{ rotate: '-28deg' }] },
  sCurve: { position: 'absolute', bottom: 1, right: 4, color: '#14B8A6', fontSize: 17, fontWeight: '900' },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#131924', borderRadius: 18, paddingHorizontal: 10, height: 35, marginHorizontal: 8, borderWidth: 1, borderColor: '#1E293B' },
  searchInput: { flex: 1, color: '#F1F5F9', fontSize: 12, paddingVertical: 0 },
  langPill: { backgroundColor: '#131924', borderWidth: 1, borderColor: '#C9B89A', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5, marginRight: 6 },
  langTxt: { color: '#C9B89A', fontSize: 11, fontWeight: '900' },
  bellBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#131924', alignItems: 'center', justifyContent: 'center' },
  backBtn: { backgroundColor: '#131924', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  backTxt: { color: '#C9B89A', fontSize: 12, fontWeight: '800' },
  subTitle: { color: '#F1F5F9', fontSize: 14, fontWeight: '800', marginLeft: 8, flex: 1 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? 4 : 0 },
  sectionBox: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  secHead: { fontSize: 14, fontWeight: '800' },
  tickerCard: { width: 175, borderRadius: 10, borderWidth: 1, padding: 9, marginRight: 8 },
  quickRow: { flexDirection: 'row', marginBottom: 10 },
  quickBtn: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 10, alignItems: 'center', marginHorizontal: 3 },
  postCard: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  postTag: { backgroundColor: '#0D1B2A', color: '#14B8A6', fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  verBadge: { color: '#C9B89A', fontSize: 10, fontWeight: '800', marginLeft: 6 },
  postTitle: { fontSize: 14, fontWeight: '800', marginTop: 6 },
  postMeta: { fontSize: 12, marginTop: 3 },
  postPrice: { color: '#0D9488', fontSize: 14, fontWeight: '900', marginTop: 5 },
  postFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 8, marginTop: 8 },
  actIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  waCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  newsItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1 },
  stateChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16, borderWidth: 1, marginRight: 6 },
  bottomBar: { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 7 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', flexDirection: 'row' },
  drawerBox: { width: '84%', backgroundColor: '#0B0D12', padding: 16, borderRightWidth: 1, borderRightColor: '#1E293B' },
  closePill: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  tierCard: { backgroundColor: '#131924', borderRadius: 12, padding: 12, marginTop: 14, borderWidth: 1, borderColor: '#1E293B' },
  walletCard: { backgroundColor: '#131924', borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#0D9488' },
  topupBtn: { backgroundColor: '#0D9488', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  drawerBtn: { backgroundColor: '#131924', borderRadius: 10, padding: 12, marginTop: 9, borderWidth: 1, borderColor: '#1E293B' },
  drawerBtnTxt: { color: '#F1F5F9', fontSize: 12, fontWeight: '800' },
  proBox: { backgroundColor: '#131924', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#C9B89A' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#0D1B2A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C9B89A' },
  mInput: { backgroundColor: '#131924', color: '#FFF', borderWidth: 1, borderColor: '#1E293B', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8, fontSize: 13, marginBottom: 9 },
  budgetChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 14, borderWidth: 1, borderColor: '#334155', marginRight: 6 },
  planBox: { backgroundColor: '#131924', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#14B8A6' },
  primaryModalBtn: { backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
});
