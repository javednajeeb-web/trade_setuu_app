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
  Image,
  Platform,
} from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import GlobalLogisticsHubScreen from './src/globalhublogistics';
import ServiceHubScreen from './src/screens/ServiceHubScreen';


const TS_LOGO = require('./1795099375380.png');
const AGMARKNET_API_KEY = '579b464db66ec23bdd00000126e3ad53d0e049c374bb6bbccfee0b03';
const AGMARKNET_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${AGMARKNET_API_KEY}&format=json&limit=45`;
const EXIM_NEWS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3DIndia%2Bexport%2Bimport%2BDGFT%2Bport%2Bshipping%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen';

const FALLBACK_MANDI = [
  { id: 'm1', commodity: 'Parboiled Paddy / Rice', variety: 'IR-64 / Mahamaya', market: 'Raipur APMC', state: 'Chhattisgarh', min: '2320', max: '2580', modal: '2490', date: '21 Nov 2026' },
  { id: 'm2', commodity: 'Yellow Maize', variety: 'Hybrid Feed Grade', market: 'Dhamtari Mandi', state: 'Chhattisgarh', min: '2150', max: '2340', modal: '2260', date: '21 Nov 2026' },
  { id: 'm3', commodity: 'Turmeric Finger', variety: 'Salem / Nizamabad', market: 'Sangli Mandi', state: 'Maharashtra', min: '13400', max: '14950', modal: '14200', date: '21 Nov 2026' },
  { id: 'm4', commodity: '1121 Basmati Paddy', variety: 'Export Grade', market: 'Karnal Mandi', state: 'Haryana', min: '4150', max: '4520', modal: '4380', date: '21 Nov 2026' },
  { id: 'm5', commodity: 'Soyabean Yellow', variety: 'FAQ Export', market: 'Indore Mandi', state: 'Madhya Pradesh', min: '4480', max: '4790', modal: '4650', date: '21 Nov 2026' },
];

const INTL_MARKET = [
  { id: 'f1', item: 'Indian Parboiled Rice (5% Broken)', port: 'FOB JNPT / Vizag', price: 'USD 465 / MT (₹43,082)' },
  { id: 'f2', item: '1121 Golden Sella Basmati Rice', port: 'FOB Mundra / Kandla', price: 'USD 980 / MT (₹90,797)' },
  { id: 'f3', item: 'Yellow Maize (Feed Grade <14%)', port: 'FOB Kakinada / Vizag', price: 'USD 268 / MT (₹24,830)' },
  { id: 'f4', item: 'LME Copper Grade A (3M Cash)', port: 'London Metal Exchange', price: 'USD 9,240 / MT (₹8,56,086)' },
  { id: 'f5', item: 'MS Billet & TMT Fe-550D', port: 'Ex-Plant Raipur', price: '₹45,500 / MT (USD 491)' },
];

const FALLBACK_NEWS = [
  {
    id: 'n1',
    title: 'DGFT Streamlines Non-Basmati Parboiled Rice Export Clearance at JNPT & Vizag',
    source: 'Exim Trade Desk',
    date: '21 Nov 2026',
    summary: 'Exporters shipping parboiled rice via JNPT, Vizag, and Kakinada ports can now complete customs EDI verification faster with digital LUT and APEDA sync.',
  },
  {
    id: 'n2',
    title: 'USD/INR Holds Near ₹92.65 — Stronger Realization for Indian Agro & Metal Exporters',
    source: 'Global FX Monitor',
    date: '21 Nov 2026',
    summary: 'With the US Dollar trading near ₹92.65, Indian rice, maize, spice, and metal exporters are locking in Q4 forward shipments to Gulf and West Africa.',
  },
];

const INITIAL_FEED = [
  {
    id: 'p1',
    category: 'India EXIM',
    post_type: 'Sell Offer',
    initials: 'UE',
    trader_name: 'UA EXIM Overseas',
    trader_role: 'Verified Exporter • Raipur, CG • 2h',
    title: 'Indian Non-Basmati Parboiled Rice (5% Broken, Sortex Clean)',
    desc: 'Ready mill stock packed in 50 Kg PP bags. SGS / APEDA inspection ready for immediate container stuffing.',
    qty: '2,500 MT',
    port: 'FOB JNPT / Vizag',
    price: 'USD 465 / MT',
    phone: '+919826100101',
    comments: ['Gulf Foodstuff: Please share latest lab report on WhatsApp.'],
  },
  {
    id: 'p2',
    category: 'International',
    post_type: 'Buy Requirement',
    initials: 'AG',
    trader_name: 'Apex Global Commodities',
    trader_role: 'Commodity Broker • Dubai / Singapore • 4h',
    title: 'Urgent Buyer Requirement: Yellow Maize (Moisture <14%, Aflatoxin <20ppb)',
    desc: 'Looking for direct millers or FOB exporters for regular monthly shipments to Port Klang & Vietnam.',
    qty: '1,000 MT',
    port: 'CIF Port Klang',
    price: 'USD 272 / MT',
    phone: '+919826100202',
    comments: [],
  },
  {
    id: 'p3',
    category: 'Domestic',
    post_type: 'Bulk Supply',
    initials: 'MB',
    trader_name: 'Mahamaya Bulk Logistics & Trade',
    trader_role: 'Domestic Supplier • Raipur -> Vizag • 6h',
    title: 'Direct Mill-to-Port Rake & 22-Wheeler Fleet Available for Rice & Maize',
    desc: 'GPS-enabled tarpaulin covered trucks with transit insurance and instant E-Way bill support.',
    qty: '35–42 MT / Truck',
    port: 'Raipur -> Vizag / JNPT',
    price: '₹2,150 / MT',
    phone: '+919826100303',
    comments: [],
  },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('en');

  // Auth & Role Onboarding
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState('Najeeb Javed');
  const [userCompany, setUserCompany] = useState('UA EXIM Overseas');
  const [userRole, setUserRole] = useState('Exporter & Trader');
  const [loginMobile, setLoginMobile] = useState('+91 98261 00000');

  // Navigation
  const [activeTab, setActiveTab] = useState('feed');
  const [feedFilter, setFeedFilter] = useState('All');
  const [mandiTab, setMandiTab] = useState('india');
  const [showLogistics, setShowLogistics] = useState(false);
  const [tabHistory, setTabHistory] = useState(['feed']);
  const [searchQuery, setSearchQuery] = useState('');

  // Vault, Loyalty & Subscription
  const [vaultBalance, setVaultBalance] = useState(500);
  const [loyaltyPts, setLoyaltyPts] = useState(320);
  const [isPaid, setIsPaid] = useState(false);
  const [planLabel, setPlanLabel] = useState('Free Member');

  // Live APIs
  const [usdInr, setUsdInr] = useState(92.65);
  const [mandiList, setMandiList] = useState(FALLBACK_MANDI);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('All India');
  const [priceAlerts, setPriceAlerts] = useState(['Parboiled Rice > ₹2,550/Qtl']);
  const [newsList, setNewsList] = useState(FALLBACK_NEWS);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedMandi, setSelectedMandi] = useState(null);

  // Feed & Modals
  const [posts, setPosts] = useState(INITIAL_FEED);
  const [likedIds, setLikedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [commentPost, setCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState(null);

  const [subRole, setSubRole] = useState('commodity_broker');
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adBudget, setAdBudget] = useState(299);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('India EXIM');
  const [newQty, setNewQty] = useState('');
  const [newPort, setNewPort] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const tickerRef = useRef(null);
  const tickerX = useRef(0);

  const isDark = theme === 'dark';
  const T = {
    bg: isDark ? '#090C10' : '#F3F5F8',
    card: isDark ? '#11161F' : '#FFFFFF',
    border: isDark ? '#1E293B' : '#E2E8F0',
    text: isDark ? '#F1F5F9' : '#0F172A',
    sub: isDark ? '#94A3B8' : '#64748B',
    pill: isDark ? '#18202C' : '#E9EEF5',
    accent: '#0D9488',
    gold: '#C9B89A',
  };

  useEffect(() => {
    let mounted = true;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((d) => { if (mounted && d?.rates?.INR) setUsdInr(Number(d.rates.INR.toFixed(2))); })
      .catch(() => {});

    setMandiLoading(true);
    fetch(AGMARKNET_URL)
      .then((r) => r.json())
      .then((d) => {
        if (mounted && Array.isArray(d?.records) && d.records.length > 0) {
          setMandiList(
            d.records.map((r, i) => ({
              id: 'ag-' + i,
              commodity: r.commodity || 'Agro Commodity',
              variety: r.variety || r.grade || 'Standard',
              market: r.market || 'APMC Mandi',
              state: r.state || 'India',
              min: String(r.min_price || '0'),
              max: String(r.max_price || '0'),
              modal: String(r.modal_price || '0'),
              date: r.arrival_date || '21 Nov 2026',
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setMandiLoading(false); });

    fetch(EXIM_NEWS_URL)
      .then((r) => r.json())
      .then((d) => {
        if (mounted && Array.isArray(d?.items) && d.items.length > 0) {
          setNewsList(
            d.items.slice(0, 8).map((it, idx) => ({
              id: 'nw-' + idx,
              title: it.title || 'Exim Trade Update',
              source: it.author || 'Global Exim Feed',
              date: (it.pubDate || '').slice(0, 10) || '21 Nov 2026',
              summary: (it.description || it.title || '').replace(/<[^>]*>?/gm, ''),
            }))
          );
        }
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (tickerRef.current && activeTab === 'mandi') {
        tickerX.current += 180;
        if (tickerX.current > 1000) tickerX.current = 0;
        tickerRef.current.scrollTo({ x: tickerX.current, animated: true });
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [activeTab]);

  useEffect(() => {
    const handler = () => {
      if (selectedNews) { setSelectedNews(null); return true; }
      if (selectedMandi) { setSelectedMandi(null); return true; }
      if (commentPost) { setCommentPost(null); return true; }
      if (modal) { setModal(null); return true; }
      if (drawerOpen) { setDrawerOpen(false); return true; }
      if (showLogistics) { setShowLogistics(false); return true; }
      if (tabHistory.length > 1) {
        const next = tabHistory.slice(0, -1);
        setTabHistory(next);
        setActiveTab(next[next.length - 1]);
        return true;
      }
      if (activeTab !== 'feed') { setActiveTab('feed'); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, [selectedNews, selectedMandi, commentPost, modal, drawerOpen, showLogistics, tabHistory, activeTab]);

  const switchTab = (t) => {
    setShowLogistics(false);
    setActiveTab(t);
    setTabHistory((prev) => (prev[prev.length - 1] === t ? prev : [...prev, t]));
  };
  

  const shareText = (title, body) => Share.share({ message: `${title}\n${body}\n— Trade SETUU` }).catch(() => {});
  const openWA = (phone, msg) => Linking.openURL(`https://wa.me/${(phone || '+919826100000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // LOGIN & ROLE ONBOARDING SCREEN (Shown on Logout or Role Switch)
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#090C10', justifyContent: 'center', padding: 20 }}>
        <StatusBar barStyle="light-content" backgroundColor="#090C10" />
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image source={TS_LOGO} style={{ width: 84, height: 84, borderRadius: 42, marginBottom: 12 }} />
          <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900' }}>Trade SETUU</Text>
          <Text style={{ color: '#14B8A6', fontSize: 12, fontWeight: '700' }}>Global Trade & Logistics Ecosystem</Text>
        </View>
        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Your Name</Text>
        <TextInput style={styles.mInp} value={userName} onChangeText={setUserName} />
        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Company / Firm Name</Text>
        <TextInput style={styles.mInp} value={userCompany} onChangeText={setUserCompany} />
        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Mobile / Email</Text>
        <TextInput style={styles.mInp} value={loginMobile} onChangeText={setLoginMobile} />
        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Select Your Business Role</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {['Exporter & Trader', 'Global Importer', 'Commodity Broker', 'Transporter / Fleet', 'Shipping Line', 'CHA / Customs'].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setUserRole(r)}
              style={[styles.chipBtn, userRole === r && { backgroundColor: '#0D9488', borderColor: '#14B8A6' }]}
            >
              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.mBtn} onPress={() => setIsLoggedIn(true)}>
          <Text style={styles.mBtnTxt}>Continue to Trade SETUU →</Text>
        </TouchableOpacity>
        <Text style={{ color: '#64748B', fontSize: 10, textAlign: 'center', marginTop: 18 }}>Powered by Apex Sync Technologies</Text>
      </SafeAreaView>
    );
  }

  const statesList = ['All India', ...Array.from(new Set(mandiList.map((m) => m.state).filter(Boolean)))];
  const filteredMandi = mandiList.filter((m) => {
    const okSt = selectedState === 'All India' || m.state === selectedState;
    const okQ = !searchQuery.trim() || `${m.commodity} ${m.market} ${m.state}`.toLowerCase().includes(searchQuery.toLowerCase());
    return okSt && okQ;
  });

  const visiblePosts = posts.filter((p) => {
    const okCat = feedFilter === 'All' || p.category === feedFilter;
    const okQ = !searchQuery.trim() || `${p.title} ${p.trader_name} ${p.port}`.toLowerCase().includes(searchQuery.toLowerCase());
    return okCat && okQ;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, paddingTop: Platform.OS === 'android' ? 4 : 0 }}>
      <StatusBar barStyle="light-content" backgroundColor="#090C10" />

      {/* CLEAN TOP HEADER */}
      <View style={hdr.bar}>
        {showLogistics ? (
          <TouchableOpacity style={hdr.backBtn} onPress={() => setShowLogistics(false)}>
            <Text style={{ color: '#C9B89A', fontSize: 12, fontWeight: '800' }}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setDrawerOpen(true)} style={hdr.logoWrap}>
            <Image source={TS_LOGO} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          </TouchableOpacity>
        )}
        <View style={hdr.searchWrap}>
          <Text style={{ fontSize: 12, marginRight: 6 }}>🔍</Text>
          <TextInput
            style={hdr.searchInput}
            placeholder="Search rice, maize, ports, mandi..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={hdr.iconBtn} onPress={() => setModal('chat')}>
          <Text style={{ fontSize: 14 }}>💬</Text>
          <View style={hdr.badge}><Text style={hdr.badgeTxt}>2</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={hdr.iconBtn} onPress={() => setModal('bell')}>
          <Text style={{ fontSize: 14 }}>🔔</Text>
          <View style={hdr.badge}><Text style={hdr.badgeTxt}>3</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={hdr.iconBtn} onPress={() => setModal('settings')}>
          <Text style={{ fontSize: 14 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {showLogistics ? (
        <LogisticsHubScreen theme={theme} />
      ) : (
        <>
          {/* TAB 1: LINKEDIN-STYLE OPEN EDGE-TO-EDGE TRADE FEED */}
          {activeTab === 'feed' && (
            <View style={{ flex: 1 }}>
              <View style={{ backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 9 }}>
                  {['All', 'India EXIM', 'Domestic', 'International', 'Market', 'Exim News'].map((tab) => {
                    const active = feedFilter === tab;
                    return (
                      <TouchableOpacity
                        key={tab}
                        onPress={() => setFeedFilter(tab)}
                        style={[styles.filterPill, { backgroundColor: active ? T.accent : T.pill }]}
                      >
                        <Text style={{ color: active ? '#FFF' : T.text, fontSize: 12, fontWeight: '800' }}>{tab}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {feedFilter === 'Market' ? (
                <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                  <View style={[styles.liCard, { backgroundColor: '#0D1B2A', borderColor: T.border }]}>
                    <Text style={{ color: '#C9B89A', fontSize: 11, fontWeight: '800' }}>LIVE FX REFERENCE</Text>
                    <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '900', marginTop: 2 }}>1 USD = ₹{usdInr} INR</Text>
                  </View>
                  {INTL_MARKET.map((item) => (
                    <View key={item.id} style={[styles.liCard, { backgroundColor: T.card, borderColor: T.border }]}>
                      <View style={styles.rowBetween}>
                        <Text style={{ color: T.text, fontSize: 15, fontWeight: '800', flex: 1 }}>{item.item}</Text>
                        <TouchableOpacity onPress={() => shareText(item.item, `${item.port}: ${item.price}`)}>
                          <Text style={{ fontSize: 16 }}>📤</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: T.sub, fontSize: 12, marginTop: 3 }}>📍 {item.port}</Text>
                      <Text style={{ color: T.accent, fontSize: 15, fontWeight: '900', marginTop: 6 }}>{item.price}</Text>
                    </View>
                  ))}
                </ScrollView>
              ) : feedFilter === 'Exim News' ? (
                <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                  {newsList.map((n) => (
                    <TouchableOpacity
                      key={n.id}
                      onPress={() => setSelectedNews(n)}
                      style={[styles.liCard, { backgroundColor: T.card, borderColor: T.border }]}
                    >
                      <View style={styles.rowBetween}>
                        <Text style={{ color: T.accent, fontSize: 11, fontWeight: '800' }}>{n.source} • {n.date}</Text>
                        <TouchableOpacity onPress={() => shareText(n.title, n.summary)}>
                          <Text style={{ fontSize: 16 }}>📤</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: T.text, fontSize: 15, fontWeight: '800', marginTop: 6 }}>{n.title}</Text>
                      <Text style={{ color: T.sub, fontSize: 13, marginTop: 5, lineHeight: 19 }} numberOfLines={3}>{n.summary}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 85 }}>
                  {/* Quick LinkedIn-Style Start a Trade Post Strip */}
                  <TouchableOpacity
                    onPress={() => setModal('post')}
                    style={[styles.startPostStrip, { backgroundColor: T.card, borderColor: T.border }]}
                  >
                    <View style={styles.avatarCircle}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>NJ</Text></View>
                    <View style={[styles.fakeInput, { borderColor: T.border }]}>
                      <Text style={{ color: T.sub, fontSize: 13 }}>Post a sell offer, buy requirement or fleet load...</Text>
                    </View>
                  </TouchableOpacity>
      {/* 5-TAB BOTTOM BAR: Trade Feed | Mandi Pulse | + | Logistics | Service Hub */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => switchTab('feed')}>
          <Text style={{ fontSize: 16 }}>🏠</Text>
          <Text style={[styles.navLbl, activeTab === 'feed' && { color: '#14B8A6' }]}>Trade Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => switchTab('mandi')}>
          <Text style={{ fontSize: 16 }}>📊</Text>
          <Text style={[styles.navLbl, activeTab === 'mandi' && { color: '#14B8A6' }]}>Mandi Pulse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.centerPlus} onPress={() => setModal('post')}>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: -2 }}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setShowLogistics(true)}>
          <Text style={{ fontSize: 16 }}>🌐</Text>
          <Text style={[styles.navLbl, showLogistics && { color: '#14B8A6' }]}>Logistics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => switchTab('services')}>
          <Text style={{ fontSize: 16 }}>🛠️</Text>
          <Text style={[styles.navLbl, activeTab === 'services' && !showLogistics && { color: '#14B8A6' }]}>Service Hub</Text>
        </TouchableOpacity>
      </View>
        
               
   </ScrollView>                   

                        {/* Clean Open Headline & Description */}
                        <Text style={{ color: T.text, fontSize: 15, fontWeight: '800', marginTop: 10, lineHeight: 21 }}>{post.title}</Text>
                        {!!post.desc && (
                          <Text style={{ color: T.sub, fontSize: 13, marginTop: 4, lineHeight: 19 }}>{post.desc}</Text>
                        )}

                        {/* Open 3-Column Spec Row */}
                        <View style={[styles.specStrip, { borderTopColor: T.border, borderBottomColor: T.border }]}>
                          <View style={styles.specCol}>
                            <Text style={{ color: T.sub, fontSize: 10, fontWeight: '700' }}>QUANTITY</Text>
                            <Text style={{ color: T.text, fontSize: 13, fontWeight: '800', marginTop: 2 }}>{post.qty}</Text>
                          </View>
                          <View style={[styles.specCol, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: T.border, paddingHorizontal: 10 }]}>
                            <Text style={{ color: T.sub, fontSize: 10, fontWeight: '700' }}>PORT / ROUTE</Text>
                            <Text style={{ color: T.text, fontSize: 13, fontWeight: '800', marginTop: 2 }} numberOfLines={1}>{post.port}</Text>
                          </View>
                          <View style={[styles.specCol, { paddingLeft: 10 }]}>
                            <Text style={{ color: T.sub, fontSize: 10, fontWeight: '700' }}>TARGET RATE</Text>
                            <Text style={{ color: T.accent, fontSize: 13, fontWeight: '900', marginTop: 2 }}>{post.price}</Text>
                          </View>
                        </View>

                        {/* LinkedIn-Style Bottom Action Bar */}
                        <View style={styles.liActionRow}>
                          <TouchableOpacity style={styles.liActBtn} onPress={() => setLikedIds(liked ? likedIds.filter((i) => i !== post.id) : [...likedIds, post.id])}>
                            <Text style={{ color: liked ? T.accent : T.sub, fontSize: 12, fontWeight: '800' }}>{liked ? '❤️ Liked' : '🤍 Like'}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.liActBtn} onPress={() => setCommentPost(post)}>
                            <Text style={{ color: T.sub, fontSize: 12, fontWeight: '800' }}>💬 Comment ({post.comments?.length || 0})</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.liActBtn} onPress={() => setSavedIds(saved ? savedIds.filter((i) => i !== post.id) : [...savedIds, post.id])}>
                            <Text style={{ color: saved ? T.gold : T.sub, fontSize: 12, fontWeight: '800' }}>{saved ? '🔖 Saved' : '📑 Save'}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.liActBtn} onPress={() => shareText(post.title, `${post.qty} | ${post.port} | ${post.price}`)}>
                            <Text style={{ color: T.sub, fontSize: 12, fontWeight: '800' }}>📤 Share</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.waCircle} onPress={() => openWA(post.phone, `Hi ${post.trader_name}, regarding ${post.title}`)}>
                            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '900' }}>WA</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          {/* TAB 2: MANDI PULSE */}
          {activeTab === 'mandi' && (
            <View style={{ flex: 1 }}>
              <View style={[styles.subBar, { backgroundColor: T.card, borderBottomColor: T.border }]}>
                {['india', 'intl'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setMandiTab(t)}
                    style={[styles.subTabBtn, mandiTab === t && { borderBottomColor: T.accent, borderBottomWidth: 2.5 }]}
                  >
                    <Text style={{ color: mandiTab === t ? T.accent : T.sub, fontSize: 13, fontWeight: '800' }}>
                      {t === 'india' ? 'Mandi Pulse (India)' : 'International FOB / LME'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {mandiTab === 'india' ? (
                <ScrollView contentContainerStyle={{ paddingBottom: 85 }}>
                  <ScrollView ref={tickerRef} horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10, paddingLeft: 12 }}>
                    {mandiList.slice(0, 8).map((m) => (
                      <TouchableOpacity key={'tk-' + m.id} onPress={() => setSelectedMandi(m)} style={styles.tickerBox}>
                        <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }} numberOfLines={1}>{m.commodity}</Text>
                        <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '900' }}>₹{m.modal}/Qtl</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 10 }} numberOfLines={1}>{m.market}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingBottom: 10, paddingLeft: 12 }}>
                    {statesList.map((st) => (
                      <TouchableOpacity
                        key={st}
                        onPress={() => setSelectedState(st)}
                        style={[styles.filterPill, { backgroundColor: selectedState === st ? T.accent : T.card }]}
                      >
                        <Text style={{ color: selectedState === st ? '#FFF' : T.text, fontSize: 11, fontWeight: '800' }}>{st}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {mandiLoading && <ActivityIndicator color={T.accent} style={{ marginVertical: 8 }} />}
                  {filteredMandi.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => setSelectedMandi(m)}
                      style={[styles.liCard, { backgroundColor: T.card, borderColor: T.border }]}
                    >
                      <View style={styles.rowBetween}>
                        <Text style={{ color: T.text, fontSize: 15, fontWeight: '800', flex: 1 }}>{m.commodity} ({m.variety})</Text>
                        <TouchableOpacity onPress={() => {
                          setPriceAlerts([...priceAlerts, `${m.commodity} @ ₹${m.modal}/Qtl`]);
                          Alert.alert('Price Alert Set ✓', `You will be notified on ${m.commodity} rate changes.`);
                        }}>
                          <Text style={{ color: T.gold, fontSize: 11, fontWeight: '800', marginRight: 10 }}>🔔 Alert</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => shareText(`${m.commodity} Rate`, `${m.market}, ${m.state}: ₹${m.modal}/Qtl`)}>
                          <Text style={{ fontSize: 15 }}>📤</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: T.sub, fontSize: 12, marginTop: 3 }}>📍 {m.market}, {m.state} • {m.date}</Text>
                      <Text style={{ color: T.accent, fontSize: 15, fontWeight: '900', marginTop: 5 }}>
                        Modal: ₹{m.modal}/Qtl  <Text style={{ color: T.sub, fontSize: 12, fontWeight: '600' }}>(Min ₹{m.min} • Max ₹{m.max})</Text>
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 85 }}>
                  {INTL_MARKET.map((f) => (
                    <View key={f.id} style={[styles.liCard, { backgroundColor: T.card, borderColor: T.border }]}>
                      <View style={styles.rowBetween}>
                        <Text style={{ color: T.text, fontSize: 15, fontWeight: '800', flex: 1 }}>{f.item}</Text>
                        <TouchableOpacity onPress={() => shareText(f.item, `${f.port}: ${f.price}`)}>
                          <Text style={{ fontSize: 15 }}>📤</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: T.sub, fontSize: 12, marginTop: 3 }}>🚢 {f.port}</Text>
                      <Text style={{ color: T.accent, fontSize: 15, fontWeight: '900', marginTop: 5 }}>{f.price}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* TAB 4: SETUU CALC PRO */}
          {activeTab === 'calc' && <SetuuCalcProScreen theme={theme} />}

          {/* TAB 5: SERVICE HUB */}
          {activeTab === 'services' && (
            <ServiceHubScreen
              theme={theme}
              isPaid={isPaid}
              vaultBalance={vaultBalance}
              onDeductVault={(amt, note) => setVaultBalance((v) => Math.max(0, v - amt))}
              onOpenCalc={() => switchTab('calc')}
              onOpenLogistics={() => setShowLogistics(true)}
            />
          )}
        </>
      )}

      {/* 5-TAB BOTTOM BAR: Trade Feed | Mandi Pulse | + | Calc Pro | Service Hub */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => switchTab('feed')}>
          <Text style={{ fontSize: 16 }}>🏠</Text>
          <Text style={[styles.navLbl, activeTab === 'feed' && { color: '#14B8A6' }]}>Trade Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => switchTab('mandi')}>
          <Text style={{ fontSize: 16 }}>📊</Text>
          <Text style={[styles.navLbl, activeTab === 'mandi' && { color: '#14B8A6' }]}>Mandi Pulse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.centerPlus} onPress={() => setModal('post')}>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: -2 }}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => switchTab('calc')}>
          <Text style={{ fontSize: 16 }}>🧮</Text>
          <Text style={[styles.navLbl, activeTab === 'calc' && { color: '#14B8A6' }]}>Calc Pro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => switchTab('services')}>
          <Text style={{ fontSize: 16 }}>🛠️</Text>
          <Text style={[styles.navLbl, activeTab === 'services' && { color: '#14B8A6' }]}>Service Hub</Text>
        </TouchableOpacity>
      </View>

      {/* SIDE DRAWER */}
      <Modal visible={drawerOpen} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <ScrollView style={styles.drawerPanel} contentContainerStyle={{ paddingBottom: 35 }}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={TS_LOGO} style={{ width: 42, height: 42, borderRadius: 21, marginRight: 10 }} />
                <View>
                  <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '900' }}>{userName}</Text>
                  <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '700' }}>{userCompany} • {planLabel}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setDrawerOpen(false)} style={styles.closeBtn}>
                <Text style={{ color: '#FFF', fontWeight: '900' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.vaultCard}>
              <View style={styles.rowBetween}>
                <Text style={{ color: '#C9B89A', fontSize: 12, fontWeight: '800' }}>Setuu Vault</Text>
                <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>{loyaltyPts} Loyalty Pts</Text>
              </View>
              <View style={[styles.rowBetween, { marginTop: 4 }]}>
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>₹ {vaultBalance} +</Text>
                <TouchableOpacity style={styles.vaultAddBtn} onPress={() => setVaultBalance((v) => v + 500)}>
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>+ Add ₹500</Text>
                </TouchableOpacity>
              </View>
            </View>

            {[
              { id: 'profile', label: '👤 My Profile & Storefront' },
              { id: 'catalogue', label: '📦 Company Product Catalogue' },
              { id: 'dashboard', label: '📈 Business Dashboard' },
              { id: 'logistics', label: '🌐 Global Logistics Hub' },
              { id: 'blind', label: '🔐 Blind Deal Room (Preview)' },
              { id: 'ad', label: '📢 Ad Manager (Setuu Vault)' },
              { id: 'custom_ad', label: '✨ Custom Ad Manager (Pro)' },
              { id: 'sub', label: '💎 Subscription Plans (Broker ₹11,499)' },
              { id: 'settings', label: '⚙️ Theme & Language Settings' },
              { id: 'logout', label: '🚪 Switch Role / Logout' },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.menuItem}
                onPress={() => {
                  setDrawerOpen(false);
                  if (m.id === 'logistics') setShowLogistics(true);
                  else if (m.id === 'logout') setIsLoggedIn(false);
                  else if (m.id === 'custom_ad') Alert.alert('Custom Ad Manager', 'Available with Paid Subscription (Coming Soon).');
                  else setModal(m.id);
                }}
              >
                <Text style={{ color: '#F1F5F9', fontSize: 13, fontWeight: '700' }}>{m.label}</Text>
              </TouchableOpacity>
            ))}

            <Text style={{ color: '#8A8F98', fontSize: 11, fontWeight: '800', marginTop: 18 }}>Powered by Apex Sync Technologies</Text>
          </ScrollView>
        </View>
      </Modal>

      {/* UNIVERSAL MODALS */}
      <Modal visible={!!modal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={styles.modalBox}>
              {modal === 'post' && (
                <View>
                  <Text style={styles.mHead}>Create Trade Post</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    {['India EXIM', 'Domestic', 'International'].map((c) => (
                      <TouchableOpacity key={c} onPress={() => setNewCat(c)} style={[styles.chipBtn, newCat === c && { backgroundColor: '#0D9488' }]}>
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput style={styles.mInp} placeholder="Commodity & Grade (e.g. 500 MT IR-64 Rice)" placeholderTextColor="#64748B" value={newTitle} onChangeText={setNewTitle} />
                  <TextInput style={styles.mInp} placeholder="Quantity (e.g. 500 MT / 20 Containers)" placeholderTextColor="#64748B" value={newQty} onChangeText={setNewQty} />
                  <TextInput style={styles.mInp} placeholder="Port / Route (e.g. FOB JNPT -> Dakar)" placeholderTextColor="#64748B" value={newPort} onChangeText={setNewPort} />
                  <TextInput style={styles.mInp} placeholder="Rate (e.g. USD 465 / MT)" placeholderTextColor="#64748B" value={newPrice} onChangeText={setNewPrice} />
                  <TouchableOpacity
                    style={styles.mBtn}
                    onPress={() => {
                      if (!newTitle.trim()) return;
                      setPosts([{
                        id: 'u-' + Date.now(),
                        category: newCat,
                        post_type: 'Sell Offer',
                        initials: 'NJ',
                        trader_name: userName,
                        trader_role: `${userCompany} • Just now`,
                        title: newTitle.trim(),
                        desc: 'Verified listing posted via Trade SETUU.',
                        qty: newQty.trim() || 'Ready Stock',
                        port: newPort.trim() || 'FOB Indian Port',
                        price: newPrice.trim() || 'Best Quote',
                        phone: '+919826100000',
                        comments: [],
                      }, ...posts]);
                      setNewTitle(''); setNewQty(''); setNewPort(''); setNewPrice('');
                      setModal(null);
                    }}
                  >
                    <Text style={styles.mBtnTxt}>Publish Post</Text>
                  </TouchableOpacity>
                </View>
              )}

              {modal === 'ad' && (
                <View>
                  <Text style={styles.mHead}>Ad Manager (Setuu Vault: ₹{vaultBalance})</Text>
                  <TextInput style={styles.mInp} placeholder="Ad Headline" placeholderTextColor="#64748B" value={adTitle} onChangeText={setAdTitle} />
                  <TextInput style={styles.mInp} placeholder="Offer & Port Details" placeholderTextColor="#64748B" value={adDesc} onChangeText={setAdDesc} />
                  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    {[199, 299, 499].map((b) => (
                      <TouchableOpacity key={b} onPress={() => setAdBudget(b)} style={[styles.chipBtn, adBudget === b && { backgroundColor: '#0D9488' }]}>
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>₹{b} Boost</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.mBtn}
                    onPress={() => {
                      if (vaultBalance < adBudget) { Alert.alert('Low Balance', 'Add funds to Setuu Vault first.'); return; }
                      setVaultBalance((v) => v - adBudget);
                      setPosts([{
                        id: 'ad-' + Date.now(),
                        category: 'India EXIM',
                        post_type: 'Sponsored',
                        initials: 'NJ',
                        trader_name: userCompany,
                        trader_role: 'Sponsored Promotion',
                        title: adTitle || 'Featured Export Offer',
                        desc: adDesc || 'Direct verified exporter supply.',
                        qty: 'Bulk Ready',
                        port: 'Pan-India / Global',
                        price: `Promoted • ₹${adBudget}`,
                        phone: '+919826100000',
                        comments: [],
                      }, ...posts]);
                      setModal(null);
                    }}
                  >
                    <Text style={styles.mBtnTxt}>Pay ₹{adBudget} & Boost</Text>
                  </TouchableOpacity>
                </View>
              )}

              {modal === 'sub' && (
                <View>
                  <Text style={styles.mHead}>Subscription Plans</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {[
                      { id: 'commodity_broker', label: 'Commodity Broker' },
                      { id: 'shipping_line', label: 'Shipping Line' },
                      { id: 'transporter', label: 'Transporter' },
                    ].map((r) => (
                      <TouchableOpacity key={r.id} onPress={() => setSubRole(r.id)} style={[styles.chipBtn, subRole === r.id && { backgroundColor: '#0D9488' }]}>
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{r.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {subRole === 'commodity_broker' ? (
                    <View>
                      <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>SINGLE COMPLETE PLAN</Text>
                      <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900', marginVertical: 6 }}>₹11,499 Only</Text>
                      <TouchableOpacity style={styles.mBtn} onPress={() => { setIsPaid(true); setPlanLabel('Commodity Broker (₹11,499)'); setModal(null); }}>
                        <Text style={styles.mBtnTxt}>Activate Commodity Broker — ₹11,499</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        {['monthly', 'yearly'].map((c) => (
                          <TouchableOpacity key={c} onPress={() => setBillingCycle(c)} style={[styles.chipBtn, billingCycle === c && { backgroundColor: '#0D9488' }]}>
                            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{c === 'yearly' ? 'Yearly' : 'Monthly'}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 8 }}>
                        {subRole === 'shipping_line' ? (billingCycle === 'yearly' ? '₹21,999 / Year' : '₹2,499 / Month') : (billingCycle === 'yearly' ? '₹12,999 / Year' : '₹1,499 / Month')}
                      </Text>
                      <TouchableOpacity style={styles.mBtn} onPress={() => { setIsPaid(true); setPlanLabel('Pro Member'); setModal(null); }}>
                        <Text style={styles.mBtnTxt}>Activate Plan</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {modal === 'settings' && (
                <View>
                  <Text style={styles.mHead}>Theme & Language</Text>
                  <TouchableOpacity style={styles.mBtn} onPress={() => setTheme(isDark ? 'light' : 'dark')}>
                    <Text style={styles.mBtnTxt}>{isDark ? '🌤️ Switch to Clean Light Mode' : '🌙 Switch to Dark Mode'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {(modal === 'profile' || modal === 'catalogue' || modal === 'dashboard' || modal === 'blind' || modal === 'chat' || modal === 'bell') && (
                <View>
                  <Text style={styles.mHead}>{modal.toUpperCase()}</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 13, lineHeight: 20 }}>
                    {modal === 'catalogue'
                      ? '• 1121 Sella Basmati Rice\n• IR-64 Parboiled Rice (5% Broken)\n• Yellow Maize Feed Grade\n• Nutmeg ABC Grade'
                      : modal === 'bell'
                      ? `• USD/INR Live: ₹${usdInr}\n• Active Price Alerts: ${priceAlerts.join(', ')}`
                      : `${userName} (${userRole}) • ${userCompany}\nIEC, GSTIN & LUT Verified`}
                  </Text>
                </View>
              )}

              <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setModal(null)}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* COMMENT, MANDI & NEWS MODALS */}
      <Modal visible={!!commentPost} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.mHead}>Comments — {commentPost?.trader_name}</Text>
            {(commentPost?.comments || []).map((c, idx) => (
              <Text key={idx} style={{ color: '#CBD5E1', fontSize: 12, marginBottom: 6 }}>• {c}</Text>
            ))}
            <TextInput style={styles.mInp} placeholder="Write a comment or enquiry..." placeholderTextColor="#64748B" value={commentText} onChangeText={setCommentText} />
            <TouchableOpacity
              style={styles.mBtn}
              onPress={() => {
                if (!commentText.trim()) return;
                setPosts(posts.map((p) => (p.id === commentPost.id ? { ...p, comments: [...(p.comments || []), `${userName}: ${commentText.trim()}`] } : p)));
                setCommentText('');
                setCommentPost(null);
              }}
            >
              <Text style={styles.mBtnTxt}>Post Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setCommentPost(null)}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedMandi} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.mHead}>{selectedMandi?.commodity} ({selectedMandi?.variety})</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 12 }}>📍 {selectedMandi?.market}, {selectedMandi?.state}</Text>
            <Text style={{ color: '#14B8A6', fontSize: 16, fontWeight: '900', marginVertical: 8 }}>Modal: ₹{selectedMandi?.modal}/Qtl</Text>
            <TouchableOpacity style={styles.mBtn} onPress={() => shareText(selectedMandi?.commodity, `${selectedMandi?.market}: ₹${selectedMandi?.modal}/Qtl`)}>
              <Text style={styles.mBtnTxt}>📤 Share Rate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setSelectedMandi(null)}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedNews} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.mHead}>{selectedNews?.title}</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 13, lineHeight: 19 }}>{selectedNews?.summary}</Text>
            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setSelectedNews(null)}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const hdr = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#090C10', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  logoWrap: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: '#14B8A6', overflow: 'hidden' },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#11161F', borderRadius: 18, paddingHorizontal: 10, height: 35, marginHorizontal: 8, borderWidth: 1, borderColor: '#1E293B' },
  searchInput: { flex: 1, color: '#F1F5F9', fontSize: 12, paddingVertical: 0 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#11161F', alignItems: 'center', justifyContent: 'center', marginLeft: 4, position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#0D9488', width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  badgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  backBtn: { backgroundColor: '#11161F', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6 },
});

const styles = StyleSheet.create({
  filterPill: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 18, marginRight: 7 },
  startPostStrip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, marginBottom: 8 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0D9488', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  fakeInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  liCard: { paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 0.5, borderBottomWidth: 0.5, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerPill: { color: '#14B8A6', fontSize: 11, fontWeight: '800', backgroundColor: 'rgba(13,148,136,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  specStrip: { flexDirection: 'row', borderTopWidth: 0.5, borderBottomWidth: 0.5, paddingVertical: 9, marginTop: 12 },
  specCol: { flex: 1 },
  liActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 },
  liActBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  waCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  subBar: { flexDirection: 'row', borderBottomWidth: 1 },
  subTabBtn: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tickerBox: { width: 170, backgroundColor: '#11161F', borderRadius: 10, borderWidth: 1, borderColor: '#0D9488', padding: 9, marginRight: 8 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#090C10', borderTopWidth: 1, borderTopColor: '#1E293B', paddingVertical: 6, alignItems: 'center' },
  navBtn: { flex: 1, alignItems: 'center' },
  navLbl: { color: '#94A3B8', fontSize: 10, fontWeight: '800', marginTop: 2 },
  centerPlus: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginTop: -16, borderWidth: 3, borderColor: '#090C10' },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', flexDirection: 'row' },
  drawerPanel: { width: '83%', backgroundColor: '#090C10', padding: 16, borderRightWidth: 1, borderRightColor: '#1E293B' },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  vaultCard: { backgroundColor: '#11161F', borderRadius: 12, padding: 12, marginVertical: 12, borderWidth: 1, borderColor: '#C9B89A' },
  vaultAddBtn: { backgroundColor: '#0D9488', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  menuItem: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#0D1B2A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C9B89A' },
  mHead: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  mInp: { backgroundColor: '#11161F', color: '#FFF', borderWidth: 1, borderColor: '#1E293B', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, marginBottom: 9 },
  mBtn: { backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  mBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '900' },
  chipBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginRight: 6, marginBottom: 6 },
});
