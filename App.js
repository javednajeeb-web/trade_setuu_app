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
import { supabase } from './src/lib/supabase';
import SetuuCalcProScreen from './src/SetuuCalcProScreen';
import LogisticsHubScreen from './src/LogisticsHubScreen';
import ServiceHubScreen from './src/ServiceHubScreen';

const TS_LOGO = require('./1795099375380.png');
const AGMARKNET_API_KEY = '579b464db66ec23bdd00000126e3ad53d0e049c374bb6bbccfee0b03';
const AGMARKNET_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${AGMARKNET_API_KEY}&format=json&limit=45`;
const EXIM_NEWS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3DIndia%2Bexport%2Bimport%2BDGFT%2Bport%2Bshipping%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen';

const FALLBACK_MANDI = [
  { id: 'm1', commodity: 'Paddy / Parboiled Rice', variety: 'IR-64 / Mahamaya', market: 'Raipur APMC', district: 'Raipur', state: 'Chhattisgarh', min: '2320', max: '2580', modal: '2490', date: '21 Nov 2026' },
  { id: 'm2', commodity: 'Yellow Maize', variety: 'Hybrid Feed Grade', market: 'Dhamtari Mandi', district: 'Dhamtari', state: 'Chhattisgarh', min: '2150', max: '2340', modal: '2260', date: '21 Nov 2026' },
  { id: 'm3', commodity: 'Turmeric Finger', variety: 'Salem / Nizamabad', market: 'Sangli Mandi', district: 'Sangli', state: 'Maharashtra', min: '13400', max: '14950', modal: '14200', date: '21 Nov 2026' },
  { id: 'm4', commodity: '1121 Basmati Paddy', variety: 'Export Grade', market: 'Karnal Mandi', district: 'Karnal', state: 'Haryana', min: '4150', max: '4520', modal: '4380', date: '21 Nov 2026' },
  { id: 'm5', commodity: 'Soyabean Yellow', variety: 'FAQ Export', market: 'Indore Mandi', district: 'Indore', state: 'Madhya Pradesh', min: '4480', max: '4790', modal: '4650', date: '21 Nov 2026' },
  { id: 'm6', commodity: 'Cumin (Jeera)', variety: 'A-Grade Export', market: 'Unjha APMC', district: 'Mehsana', state: 'Gujarat', min: '23800', max: '25600', modal: '24750', date: '21 Nov 2026' },
];

const INTL_FOB_MARKET = [
  { id: 'f1', item: 'Indian Parboiled Rice (5% Broken)', port: 'FOB JNPT / Vizag', price: 'USD 465 / MT (₹43,082)', trend: '+1.2%' },
  { id: 'f2', item: '1121 Golden Sella Basmati Rice', port: 'FOB Mundra / Kandla', price: 'USD 980 / MT (₹90,797)', trend: '+0.8%' },
  { id: 'f3', item: 'Yellow Maize (Feed Grade <14% Moist)', port: 'FOB Kakinada / Vizag', price: 'USD 268 / MT (₹24,830)', trend: '+0.5%' },
  { id: 'f4', item: 'LME Copper Grade A (3M Cash)', port: 'London Metal Exchange', price: 'USD 9,240 / MT (₹8,56,086)', trend: '+1.6%' },
  { id: 'f5', item: 'LME Aluminium Primary Ingot', port: 'London Metal Exchange', price: 'USD 2,642 / MT (₹2,44,781)', trend: '-0.4%' },
  { id: 'f6', item: 'MS Billet & TMT Fe-550D', port: 'Ex-Plant Raipur', price: '₹45,500 / MT (USD 491)', trend: '+0.9%' },
];

const FALLBACK_NEWS = [
  {
    id: 'n1',
    title: 'DGFT Streamlines Non-Basmati Parboiled Rice Export Documentation at JNPT & Vizag',
    source: 'Exim Trade Desk',
    date: '21 Nov 2026',
    summary: 'Exporters shipping parboiled rice via JNPT, Vizag, and Kakinada ports can now complete customs EDI verification faster with digital LUT and APEDA certificate sync, cutting container dwell time by up to 18 hours.',
    link: 'https://www.dgft.gov.in',
  },
  {
    id: 'n2',
    title: 'USD/INR Holds Near ₹92.65 Level — Higher Realization for Indian Agro & Metal Exporters',
    source: 'Global FX & Trade Monitor',
    date: '21 Nov 2026',
    summary: 'With the US Dollar trading around ₹92.65, Indian rice, maize, spice, and metal exporters are locking in forward contracts for Q4 shipments to Gulf, West Africa, and European ports.',
    link: 'https://www.rbi.org.in',
  },
  {
    id: 'n3',
    title: 'Container Freight Rates Steady on India–Middle East & West Africa Feeder Routes',
    source: 'Maritime Logistics Bulletin',
    date: '20 Nov 2026',
    summary: '20ft dry container rates from Nhava Sheva and Mundra to Jebel Ali and Dakar show stable slot availability ahead of peak December agro dispatch.',
    link: 'https://www.trade.gov',
  },
];

const INITIAL_FEED = [
  {
    id: 'p1',
    post_type: 'Sell Offer',
    title: 'Indian Non-Basmati Parboiled Rice (5% Broken)',
    qty_label: '2,500 MT • 50 Kg PP Bag',
    route_port: 'FOB JNPT / Vizag -> Jebel Ali / Dakar',
    price: 'USD 465 / MT (₹43,082)',
    trader_name: 'UA EXIM Overseas',
    trader_role: 'Exporter • Raipur',
    phone: '+919826100101',
    verified: true,
    sponsored: false,
  },
  {
    id: 'p2',
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

function TradeSetuuHeader({ searchQuery, onChangeSearch, onOpenDrawer, onOpenChat, onOpenBell, onOpenSettings, subTitle, onBack }) {
  if (onBack) {
    return (
      <View style={hdr.bar}>
        <TouchableOpacity style={hdr.backBtn} onPress={onBack}>
          <Text style={hdr.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Image source={TS_LOGO} style={hdr.logoImgSmall} />
        <Text style={hdr.subTitle} numberOfLines={1}>{subTitle}</Text>
      </View>
    );
  }

  return (
    <View style={hdr.bar}>
      <TouchableOpacity onPress={onOpenDrawer} style={hdr.logoWrap} activeOpacity={0.85}>
        <Image source={TS_LOGO} style={hdr.logoImg} />
      </TouchableOpacity>
      <View style={hdr.searchWrap}>
        <Text style={{ fontSize: 12, marginRight: 5 }}>🔍</Text>
        <TextInput
          style={hdr.searchInput}
          placeholder="Search rice, maize, ports, mandi..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={onChangeSearch}
        />
      </View>
      <TouchableOpacity style={hdr.iconBtn} onPress={onOpenChat}>
        <Text style={{ fontSize: 14 }}>💬</Text>
        <View style={hdr.badge}><Text style={hdr.badgeTxt}>2</Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={hdr.iconBtn} onPress={onOpenBell}>
        <Text style={{ fontSize: 14 }}>🔔</Text>
        <View style={hdr.badge}><Text style={hdr.badgeTxt}>3</Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={hdr.iconBtn} onPress={onOpenSettings}>
        <Text style={{ fontSize: 14 }}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
    }
  export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('en');

  // Main 5-tab navigation + sub-screens
  const [activeTab, setActiveTab] = useState('feed');
  const [feedSubTab, setFeedSubTab] = useState('posts');
  const [mandiSubTab, setMandiSubTab] = useState('india');
  const [showLogistics, setShowLogistics] = useState(false);
  const [tabHistory, setTabHistory] = useState(['feed']);
  const [searchQuery, setSearchQuery] = useState('');

  // Setuu Vault (₹500 + 320 Loyalty Pts) & Subscription
  const [vaultBalance, setVaultBalance] = useState(500);
  const [loyaltyPts, setLoyaltyPts] = useState(320);
  const [isPaid, setIsPaid] = useState(false);
  const [planLabel, setPlanLabel] = useState('Free Member');

  // Live API Data
  const [usdInr, setUsdInr] = useState(92.65);
  const [mandiList, setMandiList] = useState(FALLBACK_MANDI);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('All India');
  const [selectedMandiItem, setSelectedMandiItem] = useState(null);

  const [newsList, setNewsList] = useState(FALLBACK_NEWS);
  const [showAllNews, setShowAllNews] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState(null);

  // Feed, Saved & Modals
  const [posts, setPosts] = useState(INITIAL_FEED);
  const [likedIds, setLikedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'post' | 'chat' | 'bell' | 'settings' | 'profile' | 'dashboard' | 'blind' | 'ad' | 'sub' | 'mylistings' | 'saved'

  // Forms
  const [subRole, setSubRole] = useState('commodity_broker');
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adPhone, setAdPhone] = useState('');
  const [adBudget, setAdBudget] = useState(299);
  const [newTitle, setNewTitle] = useState('');
  const [newRoute, setNewRoute] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const tickerRef = useRef(null);
  const tickerX = useRef(0);

  const isDark = theme === 'dark';
  const T = {
    bg: isDark ? '#0B0D12' : '#EFF2F6',
    card: isDark ? '#131924' : '#FAFBFD',
    border: isDark ? '#1E293B' : '#D5DCE6',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#5B677A',
    pill: isDark ? '#192232' : '#E5EAF2',
    accent: '#0D9488',
    gold: '#C9B89A',
  };

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Load Live Agmarknet Mandi, Exim News & USD/INR FX APIs
  useEffect(() => {
    let mounted = true;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((d) => {
        if (mounted && d && d.rates && d.rates.INR) setUsdInr(Number(d.rates.INR.toFixed(2)));
      })
      .catch(() => {});

    setMandiLoading(true);
    fetch(AGMARKNET_URL)
      .then((r) => r.json())
      .then((d) => {
        if (mounted && d && Array.isArray(d.records) && d.records.length > 0) {
          setMandiList(
            d.records.map((r, i) => ({
              id: 'ag-' + i,
              commodity: r.commodity || 'Agro Commodity',
              variety: r.variety || r.grade || 'Standard',
              market: r.market || 'APMC Mandi',
              district: r.district || '',
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
        if (mounted && d && Array.isArray(d.items) && d.items.length > 0) {
          setNewsList(
            d.items.slice(0, 8).map((it, idx) => ({
              id: 'nw-' + idx,
              title: it.title || 'Exim Trade Update',
              source: it.author || 'Global Exim Feed',
              date: (it.pubDate || '').slice(0, 10) || '21 Nov 2026',
              summary: (it.description || it.title || '').replace(/<[^>]*>?/gm, ''),
              link: it.link || 'https://www.dgft.gov.in',
            }))
          );
        }
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  // Auto-scroll Mandi Pulse ticker
  useEffect(() => {
    const timer = setInterval(() => {
      if (tickerRef.current && activeTab === 'mandi') {
        tickerX.current += 185;
        if (tickerX.current > 1100) tickerX.current = 0;
        tickerRef.current.scrollTo({ x: tickerX.current, animated: true });
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [activeTab]);

  // Android Edge-Swipe / Hardware Back Gesture
  useEffect(() => {
    const handler = () => {
      if (selectedNewsItem) { setSelectedNewsItem(null); return true; }
      if (selectedMandiItem) { setSelectedMandiItem(null); return true; }
      if (activeModal) { setActiveModal(null); return true; }
      if (drawerOpen) { setDrawerOpen(false); return true; }
      if (showLogistics) { setShowLogistics(false); return true; }
      if (tabHistory.length > 1) {
        const next = tabHistory.slice(0, -1);
        setTabHistory(next);
        setActiveTab(next[next.length - 1]);
        return true;
      }
      if (activeTab !== 'feed') {
        setActiveTab('feed');
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, [selectedNewsItem, selectedMandiItem, activeModal, drawerOpen, showLogistics, tabHistory, activeTab]);

  const switchTab = (t) => {
    setShowLogistics(false);
    setActiveTab(t);
    setTabHistory((prev) => (prev[prev.length - 1] === t ? prev : [...prev, t]));
  };

  const deductVault = (amt, note) => {
    setVaultBalance((prev) => Math.max(0, prev - amt));
    Alert.alert('Setuu Vault Debited', `₹${amt} used for ${note}`);
  };

  const handleLaunchAd = () => {
    if (!adTitle.trim() || !adDesc.trim()) {
      Alert.alert('Required', 'Please enter Ad Headline and Offer Details.');
      return;
    }
    if (vaultBalance < adBudget) {
      Alert.alert('Insufficient Setuu Vault Balance', `You need ₹${adBudget} in Setuu Vault. Please add money first.`);
      return;
    }
    setVaultBalance((prev) => prev - adBudget);
    const adPost = {
      id: 'ad-' + Date.now(),
      post_type: 'Sponsored Ad',
      title: adTitle.trim(),
      qty_label: adDesc.trim(),
      route_port: 'Pan-India & Global Export Verified',
      price: `Promoted • ₹${adBudget} Reach`,
      trader_name: 'Najeeb Javed (Promoted)',
      trader_role: 'UA EXIM Overseas',
      phone: adPhone.trim() || '+919826100000',
      verified: true,
      sponsored: true,
    };
    setPosts([adPost, ...posts]);
    setAdTitle('');
    setAdDesc('');
    setAdPhone('');
    setActiveModal(null);
    switchTab('feed');
    setFeedSubTab('posts');
    Alert.alert('Ad Live on Post Feed ✓', `₹${adBudget} deducted from Setuu Vault.`);
  };

  const handleCreatePost = () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter commodity or trade requirement.');
      return;
    }
    const item = {
      id: 'u-' + Date.now(),
      post_type: 'Sell Offer',
      title: newTitle.trim(),
      qty_label: 'Ready Dispatch • Verified Quality',
      route_port: newRoute.trim() || 'FOB Indian Port',
      price: newPrice.trim() || 'Best Market Quote',
      trader_name: 'Najeeb Javed',
      trader_role: 'UA EXIM Overseas',
      phone: newPhone.trim() || '+919826100000',
      verified: true,
      sponsored: false,
    };
    setPosts([item, ...posts]);
    setNewTitle('');
    setNewRoute('');
    setNewPrice('');
    setNewPhone('');
    setActiveModal(null);
  };

  const shareText = (title, body) => {
    Share.share({ message: `${title}\n${body}\n\n— Trade SETUU` }).catch(() => {});
  };

  const openWA = (phone, msg) => {
    const clean = (phone || '+919826100000').replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`);
  };

  const statesList = ['All India', ...Array.from(new Set(mandiList.map((m) => m.state).filter(Boolean)))];
  const filteredMandi = mandiList.filter((m) => {
    const okState = selectedState === 'All India' || m.state === selectedState;
    const okQ = !searchQuery.trim() || `${m.commodity} ${m.market} ${m.state}`.toLowerCase().includes(searchQuery.toLowerCase());
    return okState && okQ;
  });
  const filteredPosts = posts.filter(
    (p) => !searchQuery.trim() || `${p.title} ${p.route_port} ${p.trader_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showSplash) return <SplashScreen />;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />

      <TradeSetuuHeader
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenChat={() => setActiveModal('chat')}
        onOpenBell={() => setActiveModal('bell')}
        onOpenSettings={() => setActiveModal('settings')}
        onBack={showLogistics ? () => setShowLogistics(false) : null}
        subTitle="Global Logistics Hub"
      />

      {showLogistics ? (
        <LogisticsHubScreen theme={theme} isPaid={isPaid} onOpenSub={() => setActiveModal('sub')} />
      ) : (
        <>
          {/* TAB 1: TRADE FEED (Post Feed | Market | Exim News) */}
          {activeTab === 'feed' && (
            <View style={{ flex: 1 }}>
              <View style={[styles.subBar, { backgroundColor: T.card, borderBottomColor: T.border }]}>
                {[
                  { id: 'posts', label: lang === 'hi' ? 'पोस्ट फ़ीड' : 'Post Feed' },
                  { id: 'market', label: lang === 'hi' ? 'मार्केट' : 'Market' },
                  { id: 'news', label: lang === 'hi' ? 'एक्सिम न्यूज़' : 'Exim News' },
                ].map((st) => {
                  const active = feedSubTab === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      onPress={() => setFeedSubTab(st.id)}
                      style={[styles.subTabBtn, active && { borderBottomColor: T.accent, borderBottomWidth: 2.5 }]}
                    >
                      <Text style={{ color: active ? T.accent : T.sub, fontSize: 13, fontWeight: '800' }}>{st.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {feedSubTab === 'posts' && (
                <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 80 }}>
                  {filteredPosts.map((post) => {
                    const liked = likedIds.includes(post.id);
                    const saved = savedIds.includes(post.id);
                    return (
                      <View key={post.id} style={[styles.card, { backgroundColor: T.card, borderColor: post.sponsored ? T.gold : T.border }]}>
                        <View style={styles.rowBetween}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.tag}>{post.post_type}</Text>
                            {post.verified && <Text style={styles.ver}>✓ Verified</Text>}
                          </View>
                          <TouchableOpacity onPress={() => setSavedIds(saved ? savedIds.filter((x) => x !== post.id) : [...savedIds, post.id])}>
                            <Text style={{ fontSize: 15 }}>{saved ? '🔖' : '📑'}</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={[styles.cardTitle, { color: T.text }]}>{post.title}</Text>
                        <Text style={{ color: T.sub, fontSize: 12, marginTop: 3 }}>📦 {post.qty_label} • 🚢 {post.route_port}</Text>
                        <Text style={styles.priceTxt}>{post.price}</Text>

                        <View style={[styles.footerRow, { borderTopColor: T.border }]}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: T.text, fontSize: 12, fontWeight: '800' }} numberOfLines={1}>{post.trader_name}</Text>
                            <Text style={{ color: T.sub, fontSize: 10 }}>{post.trader_role}</Text>
                          </View>
                          <TouchableOpacity style={styles.miniIcon} onPress={() => setLikedIds(liked ? likedIds.filter((x) => x !== post.id) : [...likedIds, post.id])}>
                            <Text style={{ fontSize: 14 }}>{liked ? '❤️' : '🤍'}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.miniIcon} onPress={() => setActiveModal('chat')}>
                            <Text style={{ fontSize: 14 }}>💬</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.miniIcon} onPress={() => shareText(post.title, `${post.qty_label} | ${post.route_port} | ${post.price}`)}>
                            <Text style={{ fontSize: 14 }}>📤</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.waCircle}
                            onPress={() => openWA(post.phone, `Hi ${post.trader_name}, saw your listing on Trade SETUU: ${post.title}`)}
                          >
                            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '900' }}>WA</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              {feedSubTab === 'market' && (
                <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 80 }}>
                  <View style={[styles.fxBanner, { backgroundColor: '#0D1B2A', borderColor: T.accent }]}>
                    <Text style={{ color: '#C9B89A', fontSize: 11, fontWeight: '800' }}>LIVE FX REFERENCE</Text>
                    <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '900', marginTop: 2 }}>1 USD = ₹{usdInr} INR</Text>
                  </View>
                  {INTL_FOB_MARKET.map((item) => (
                    <View key={item.id} style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
                      <View style={styles.rowBetween}>
                        <Text style={{ color: T.text, fontSize: 14, fontWeight: '800', flex: 1 }}>{item.item}</Text>
                        <TouchableOpacity onPress={() => shareText(item.item, `${item.port}: ${item.price}`)}>
                          <Text style={{ fontSize: 15 }}>📤</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>📍 {item.port}</Text>
                      <Text style={{ color: T.accent, fontSize: 14, fontWeight: '900', marginTop: 5 }}>{item.price}  ({item.trend})</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              {feedSubTab === 'news' && (
                <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 80 }}>
                  {(showAllNews ? newsList : newsList.slice(0, 4)).map((n) => (
                    <TouchableOpacity
                      key={n.id}
                      onPress={() => setSelectedNewsItem(n)}
                      style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}
                    >
                      <View style={styles.rowBetween}>
                        <Text style={{ color: T.accent, fontSize: 11, fontWeight: '800' }}>{n.source} • {n.date}</Text>
                        <TouchableOpacity onPress={() => shareText(n.title, n.summary)}>
                          <Text style={{ fontSize: 15 }}>📤</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: T.text, fontSize: 14, fontWeight: '800', marginTop: 5 }}>{n.title}</Text>
                      <Text style={{ color: T.sub, fontSize: 12, marginTop: 4 }} numberOfLines={2}>{n.summary}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.seeMoreBtn} onPress={() => setShowAllNews(!showAllNews)}>
                    <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>{showAllNews ? 'Show Less' : 'See More Exim News'}</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          )}

          {/* TAB 2: MANDI PULSE (Mandi Pulse India + State Filter + Auto-Scroll | International FOB/CIF) */}
          {activeTab === 'mandi' && (
            <View style={{ flex: 1 }}>
              <View style={[styles.subBar, { backgroundColor: T.card, borderBottomColor: T.border }]}>
                {[
                  { id: 'india', label: 'Mandi Pulse (India)' },
                  { id: 'intl', label: 'International FOB/CIF' },
                ].map((st) => {
                  const active = mandiSubTab === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      onPress={() => setMandiSubTab(st.id)}
                      style={[styles.subTabBtn, active && { borderBottomColor: T.accent, borderBottomWidth: 2.5 }]}
                    >
                      <Text style={{ color: active ? T.accent : T.sub, fontSize: 13, fontWeight: '800' }}>{st.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {mandiSubTab === 'india' ? (
                <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 80 }}>
                  <ScrollView ref={tickerRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {mandiList.slice(0, 8).map((m) => (
                      <TouchableOpacity
                        key={'tk-' + m.id}
                        onPress={() => setSelectedMandiItem(m)}
                        style={[styles.tickerBox, { backgroundColor: '#0D1B2A', borderColor: T.accent }]}
                      >
                        <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }} numberOfLines={1}>{m.commodity}</Text>
                        <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '900' }}>₹{m.modal}/Qtl</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 10 }} numberOfLines={1}>{m.market}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {statesList.map((st) => (
                      <TouchableOpacity
                        key={st}
                        onPress={() => setSelectedState(st)}
                        style={[styles.stateChip, { backgroundColor: selectedState === st ? T.accent : T.card, borderColor: T.border }]}
                      >
                        <Text style={{ color: selectedState === st ? '#FFF' : T.text, fontSize: 11, fontWeight: '800' }}>{st}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {mandiLoading && <ActivityIndicator color={T.accent} style={{ marginVertical: 8 }} />}
                  {filteredMandi.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => setSelectedMandiItem(m)}
                      style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}
                    >
                      <View style={styles.rowBetween}>
                        <Text style={{ color: T.text, fontSize: 14, fontWeight: '800', flex: 1 }}>{m.commodity} ({m.variety})</Text>
                        <TouchableOpacity onPress={() => shareText(`${m.commodity} Mandi Rate`, `${m.market}, ${m.state}: Modal ₹${m.modal}/Qtl`)}>
                          <Text style={{ fontSize: 15 }}>📤</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>📍 {m.market}, {m.state} • {m.date}</Text>
                      <Text style={{ color: T.accent, fontSize: 14, fontWeight: '900', marginTop: 5 }}>
                        Modal: ₹{m.modal}/Qtl (Min ₹{m.min} • Max ₹{m.max})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 80 }}>
                  {INTL_FOB_MARKET.map((f) => (
                    <View key={f.id} style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
                      <View style={styles.rowBetween}>
                        <Text style={{ color: T.text, fontSize: 14, fontWeight: '800', flex: 1 }}>{f.item}</Text>
                        <TouchableOpacity onPress={() => shareText(f.item, `${f.port}: ${f.price}`)}>
                          <Text style={{ fontSize: 15 }}>📤</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>🚢 {f.port}</Text>
                      <Text style={{ color: T.accent, fontSize: 14, fontWeight: '900', marginTop: 5 }}>{f.price}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* TAB 4: CALC PRO */}
          {activeTab === 'calc' && <SetuuCalcProScreen theme={theme} lang={lang} />}

          {/* TAB 5: SERVICE HUB */}
          {activeTab === 'services' && (
            <ServiceHubScreen
              theme={theme}
              lang={lang}
              isPaid={isPaid}
              vaultBalance={vaultBalance}
              onDeductVault={deductVault}
              onOpenLogistics={() => setShowLogistics(true)}
              onOpenSub={() => setActiveModal('sub')}
            />
          )}
        </>
      )}

      {/* BOTTOM 5-ITEM BAR WITH CENTER GREEN (+) BUTTON */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => switchTab('feed')}>
          <Text style={{ fontSize: 16 }}>🏠</Text>
          <Text style={[styles.navLbl, activeTab === 'feed' && { color: '#14B8A6' }]}>Trade Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => switchTab('mandi')}>
          <Text style={{ fontSize: 16 }}>📊</Text>
          <Text style={[styles.navLbl, activeTab === 'mandi' && { color: '#14B8A6' }]}>Mandi Pulse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.centerPlus} onPress={() => setActiveModal('post')}>
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

      {/* SIDE DRAWER (Najeeb Javed + Setuu Vault ₹500 + Ad Manager + Custom Ad Manager + ₹11,499 Commodity Broker) */}
      <Modal visible={drawerOpen} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <ScrollView style={styles.drawerPanel} contentContainerStyle={{ paddingBottom: 35 }}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={TS_LOGO} style={{ width: 42, height: 42, borderRadius: 21, marginRight: 10 }} />
                <View>
                  <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '900' }}>Najeeb Javed</Text>
                  <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '700' }}>UA EXIM Overseas • {planLabel}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setDrawerOpen(false)} style={styles.closeBtn}>
                <Text style={{ color: '#FFF', fontWeight: '900' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Setuu Vault ₹ 500 + (320 Loyalty Pts) */}
            <View style={styles.vaultCard}>
              <View style={styles.rowBetween}>
                <Text style={{ color: '#C9B89A', fontSize: 12, fontWeight: '800' }}>Setuu Vault</Text>
                <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>{loyaltyPts} Loyalty Pts</Text>
              </View>
              <View style={[styles.rowBetween, { marginTop: 4 }]}>
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>₹ {vaultBalance} +</Text>
                <TouchableOpacity
                  style={styles.vaultAddBtn}
                  onPress={() => {
                    setVaultBalance((v) => v + 500);
                    Alert.alert('Setuu Vault Updated ✓', '₹500 added to Setuu Vault.');
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>+ Add Funds</Text>
                </TouchableOpacity>
              </View>
            </View>

            {[
              { id: 'profile', label: '👤 My Profile, Storefront & KYC' },
              { id: 'dashboard', label: '📈 Business Dashboard' },
              { id: 'logistics', label: '🌐 Global Logistics Hub' },
              { id: 'blind', label: '🔐 Blind Deal Room' },
              { id: 'ad', label: '📢 Ad Manager (Connected to Setuu Vault)' },
              { id: 'custom_ad', label: '✨ Custom Ad Manager (Pro)' },
              { id: 'mylistings', label: '📋 My Posts & Listings' },
              { id: 'saved', label: '🔖 Saved / Shortlist' },
              { id: 'sub', label: '💎 Subscription Plans (Commodity Broker ₹11,499)' },
              { id: 'settings', label: '⚙️ Theme & Settings (Soft Ivory / Dark)' },
              { id: 'support', label: '🎧 Contact Us & Support' },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.menuItem}
                onPress={() => {
                  setDrawerOpen(false);
                  if (m.id === 'logistics') setShowLogistics(true);
                  else if (m.id === 'custom_ad') {
                    Alert.alert(
                      'Custom Ad Manager — Subscribe / Coming Soon',
                      'Dedicated banner placements, state-targeted commodity campaigns & account manager are available with Paid Subscription (Rolling out soon).',
                      [
                        { text: 'Close', style: 'cancel' },
                        { text: 'View Subscription Plans', onPress: () => setActiveModal('sub') },
                      ]
                    );
                  } else if (m.id === 'support') {
                    Linking.openURL('https://wa.me/919826100000?text=Hello%20Trade%20SETUU%20Support');
                  } else {
                    setActiveModal(m.id);
                  }
                }}
              >
                <Text style={{ color: '#F1F5F9', fontSize: 13, fontWeight: '700' }}>{m.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ marginTop: 18, borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 10 }}>
              <Text style={{ color: '#8A8F98', fontSize: 11, fontWeight: '800' }}>Powered by Apex Sync Technologies</Text>
              <Text style={{ color: '#64748B', fontSize: 9, marginTop: 2 }}>BUILD • CONNECT • AUTOMATE • SCALE GLOBALLY</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* UNIVERSAL MODALS */}
      <Modal visible={!!activeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={styles.modalBox}>
              {activeModal === 'post' && (
                <View>
                  <Text style={styles.mHead}>Post Trade Offer / Requirement</Text>
                  <TextInput style={styles.mInp} placeholder="Commodity & Grade (e.g. 500 MT IR-64 Rice)" placeholderTextColor="#64748B" value={newTitle} onChangeText={setNewTitle} />
                  <TextInput style={styles.mInp} placeholder="Port / Route (e.g. FOB JNPT -> Dakar)" placeholderTextColor="#64748B" value={newRoute} onChangeText={setNewRoute} />
                  <TextInput style={styles.mInp} placeholder="Target Rate (e.g. USD 465 / MT)" placeholderTextColor="#64748B" value={newPrice} onChangeText={setNewPrice} />
                  <TextInput style={styles.mInp} placeholder="WhatsApp Number (+91...)" placeholderTextColor="#64748B" keyboardType="phone-pad" value={newPhone} onChangeText={setNewPhone} />
                  <TouchableOpacity style={styles.mBtn} onPress={handleCreatePost}><Text style={styles.mBtnTxt}>Publish to Trade Feed</Text></TouchableOpacity>
                </View>
              )}

              {activeModal === 'ad' && (
                <View>
                  <Text style={styles.mHead}>Ad Manager (Setuu Vault: ₹{vaultBalance})</Text>
                  <TextInput style={styles.mInp} placeholder="Ad Headline (e.g. 1121 Basmati Ready Stock)" placeholderTextColor="#64748B" value={adTitle} onChangeText={setAdTitle} />
                  <TextInput style={styles.mInp} placeholder="Offer Details & Port" placeholderTextColor="#64748B" value={adDesc} onChangeText={setAdDesc} />
                  <TextInput style={styles.mInp} placeholder="WhatsApp Number" placeholderTextColor="#64748B" keyboardType="phone-pad" value={adPhone} onChangeText={setAdPhone} />
                  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    {[199, 299, 499].map((b) => (
                      <TouchableOpacity key={b} onPress={() => setAdBudget(b)} style={[styles.chipBtn, adBudget === b && { backgroundColor: '#0D9488' }]}>
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>₹{b} Boost</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.mBtn} onPress={handleLaunchAd}><Text style={styles.mBtnTxt}>Pay ₹{adBudget} from Vault & Boost</Text></TouchableOpacity>
                </View>
              )}

              {activeModal === 'sub' && (
                <View>
                  <Text style={styles.mHead}>Subscription Plans</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {[
                      { id: 'commodity_broker', label: 'Commodity Broker' },
                      { id: 'shipping_line', label: 'Shipping Line' },
                      { id: 'transporter', label: 'Transporter' },
                      { id: 'shipping_broker', label: 'Shipping Broker' },
                    ].map((r) => (
                      <TouchableOpacity key={r.id} onPress={() => setSubRole(r.id)} style={[styles.chipBtn, subRole === r.id && { backgroundColor: '#0D9488' }]}>
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{r.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {subRole === 'commodity_broker' ? (
                    <View style={styles.subCard}>
                      <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>ONE-TIME COMPLETE PLAN (NO MONTHLY/YEARLY)</Text>
                      <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900', marginVertical: 4 }}>₹11,499 Only</Text>
                      <Text style={{ color: '#CBD5E1', fontSize: 12, marginBottom: 10 }}>• Full Commodity Broker Deal-Room & Exclusive Tools</Text>
                      <TouchableOpacity
                        style={styles.mBtn}
                        onPress={() => {
                          setIsPaid(true);
                          setPlanLabel('Commodity Broker (₹11,499)');
                          setActiveModal(null);
                          Alert.alert('Plan Activated ✓', 'Commodity Broker (₹11,499) is now active!');
                        }}
                      >
                        <Text style={styles.mBtnTxt}>Activate Commodity Broker — ₹11,499</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.subCard}>
                      {(subRole === 'shipping_line' || subRole === 'transporter') && (
                        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                          {['monthly', 'yearly'].map((c) => (
                            <TouchableOpacity key={c} onPress={() => setBillingCycle(c)} style={[styles.chipBtn, billingCycle === c && { backgroundColor: '#0D9488' }]}>
                              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{c === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 8 }}>
                        {subRole === 'shipping_line'
                          ? (billingCycle === 'yearly' ? '₹21,999 / Year' : '₹2,499 / Month')
                          : subRole === 'transporter'
                          ? (billingCycle === 'yearly' ? '₹12,999 / Year' : '₹1,499 / Month')
                          : '₹3,499 / Month'}
                      </Text>
                      <TouchableOpacity
                        style={styles.mBtn}
                        onPress={() => {
                          setIsPaid(true);
                          setPlanLabel(subRole.toUpperCase() + ' PRO');
                          setActiveModal(null);
                          Alert.alert('Subscription Activated ✓', 'Paid Pro & Coming Soon modules unlocked!');
                        }}
                      >
                        <Text style={styles.mBtnTxt}>Activate Plan</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {activeModal === 'settings' && (
                <View>
                  <Text style={styles.mHead}>Theme & Language Settings</Text>
                  <TouchableOpacity style={styles.mBtn} onPress={() => setTheme(isDark ? 'light' : 'dark')}>
                    <Text style={styles.mBtnTxt}>{isDark ? '🌤️ Switch to Soft Ivory Light Mode' : '🌙 Switch to Obsidian Dark Mode'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.mBtn, { backgroundColor: '#1E293B', marginTop: 8 }]} onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}>
                    <Text style={styles.mBtnTxt}>🌐 Language: {lang === 'en' ? 'English -> हिंदी' : 'हिंदी -> English'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeModal === 'profile' && (
                <View>
                  <Text style={styles.mHead}>Najeeb Javed — Trade Profile & KYC</Text>
                  <Text style={{ color: '#14B8A6', fontSize: 12, fontWeight: '800' }}>Export Manager • UA EXIM Overseas (Raipur, CG)</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 12, marginTop: 6 }}>✓ IEC, GSTIN & LUT Verified • Agro Commodities & Bulk Logistics</Text>
                </View>
              )}

              {activeModal === 'dashboard' && (
                <View>
                  <Text style={styles.mHead}>Business Dashboard</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 13 }}>• Active Listings: {posts.length}{'\n'}• Profile Views (30d): 418{'\n'}• Setuu Vault: ₹{vaultBalance} | Loyalty Pts: {loyaltyPts}</Text>
                </View>
              )}

              {activeModal === 'blind' && (
                <View>
                  <Text style={styles.mHead}>Blind Deal Room (NCNDA Protected)</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 12, lineHeight: 18 }}>
                    Protect your buyer & supplier identity while closing back-to-back agro & metal export contracts with digital NCNDA lock.
                  </Text>
                </View>
              )}

              {(activeModal === 'chat' || activeModal === 'bell' || activeModal === 'mylistings' || activeModal === 'saved') && (
                <View>
                  <Text style={styles.mHead}>{activeModal.toUpperCase()}</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 12 }}>
                    {activeModal === 'chat' ? '• Gulf Foodstuff Trading: Interested in 500 MT IR-64 Rice\n• Kingdom Overseas: Share FOB Vizag quote' :
                     activeModal === 'bell' ? '• Live USD/INR synced at ₹' + usdInr + '\n• Agmarknet Mandi & Exim News feeds updated' :
                     `• Total items: ${activeModal === 'saved' ? savedIds.length : posts.length}`}
                  </Text>
                </View>
              )}

              <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setActiveModal(null)}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MANDI DETAIL & NEWS DETAIL MODALS */}
      <Modal visible={!!selectedMandiItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>{selectedMandiItem?.state}</Text>
            <Text style={styles.mHead}>{selectedMandiItem?.commodity} ({selectedMandiItem?.variety})</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 12 }}>📍 {selectedMandiItem?.market} • {selectedMandiItem?.date}</Text>
            <Text style={{ color: '#C9B89A', fontSize: 16, fontWeight: '900', marginVertical: 8 }}>
              Modal: ₹{selectedMandiItem?.modal}/Qtl (Min ₹{selectedMandiItem?.min} • Max ₹{selectedMandiItem?.max})
            </Text>
            <TouchableOpacity style={styles.mBtn} onPress={() => shareText(`${selectedMandiItem?.commodity} Rate`, `${selectedMandiItem?.market}: ₹${selectedMandiItem?.modal}/Qtl`)}>
              <Text style={styles.mBtnTxt}>📤 Share Rate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setSelectedMandiItem(null)}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedNewsItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>{selectedNewsItem?.source} • {selectedNewsItem?.date}</Text>
            <Text style={styles.mHead}>{selectedNewsItem?.title}</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 13, lineHeight: 19 }}>{selectedNewsItem?.summary}</Text>
            <TouchableOpacity style={[styles.mBtn, { marginTop: 12 }]} onPress={() => shareText(selectedNewsItem?.title, selectedNewsItem?.summary)}>
              <Text style={styles.mBtnTxt}>📤 Share Article</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setSelectedNewsItem(null)}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const hdr = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0D12', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  logoWrap: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: '#14B8A6', overflow: 'hidden', backgroundColor: '#0B0D12' },
  logoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  logoImgSmall: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#131924', borderRadius: 18, paddingHorizontal: 10, height: 35, marginHorizontal: 8, borderWidth: 1, borderColor: '#1E293B' },
  searchInput: { flex: 1, color: '#F1F5F9', fontSize: 12, paddingVertical: 0 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#131924', alignItems: 'center', justifyContent: 'center', marginLeft: 4, position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#0D9488', width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  badgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  backBtn: { backgroundColor: '#131924', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  backTxt: { color: '#C9B89A', fontSize: 12, fontWeight: '800' },
  subTitle: { color: '#FFF', fontSize: 15, fontWeight: '900', flex: 1 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? 4 : 0 },
  subBar: { flexDirection: 'row', borderBottomWidth: 1 },
  subTabBtn: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  tag: { backgroundColor: '#0D1B2A', color: '#14B8A6', fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  ver: { color: '#C9B89A', fontSize: 10, fontWeight: '800', marginLeft: 6 },
  cardTitle: { fontSize: 14, fontWeight: '800', marginTop: 6 },
  priceTxt: { color: '#0D9488', fontSize: 14, fontWeight: '900', marginTop: 5 },
  footerRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 8, marginTop: 8 },
  miniIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', marginLeft: 3 },
  waCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginLeft: 5 },
  fxBanner: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  seeMoreBtn: { backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  tickerBox: { width: 175, borderRadius: 10, borderWidth: 1, padding: 9, marginRight: 8 },
  stateChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16, borderWidth: 1, marginRight: 6 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#0B0D12', borderTopWidth: 1, borderTopColor: '#1E293B', paddingVertical: 6, alignItems: 'center' },
  navBtn: { flex: 1, alignItems: 'center' },
  navLbl: { color: '#94A3B8', fontSize: 10, fontWeight: '800', marginTop: 2 },
  centerPlus: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginTop: -16, borderWidth: 3, borderColor: '#0B0D12' },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', flexDirection: 'row' },
  drawerPanel: { width: '83%', backgroundColor: '#0B0D12', padding: 16, borderRightWidth: 1, borderRightColor: '#1E293B' },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  vaultCard: { backgroundColor: '#131924', borderRadius: 12, padding: 12, marginVertical: 12, borderWidth: 1, borderColor: '#C9B89A' },
  vaultAddBtn: { backgroundColor: '#0D9488', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  menuItem: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#0D1B2A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C9B89A' },
  mHead: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  mInp: { backgroundColor: '#131924', color: '#FFF', borderWidth: 1, borderColor: '#1E293B', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, marginBottom: 9 },
  mBtn: { backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  mBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '900' },
  chipBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginRight: 6 },
  subCard: { backgroundColor: '#131924', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#14B8A6' },
});
