import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Modal,
  RefreshControl,
  Share,
  Linking,
  Platform,
  useColorScheme,
} from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import { supabase } from './src/lib/supabase';
import TradeSetuuHeader from './src/TradeSetuuHeader';
import SetuuCalcProScreen from './src/SetuuCalcProScreen';
import LogisticsHubScreen from './src/LogisticsHubScreen';
import ServiceHubScreen from './src/ServiceHubScreen';

const INITIAL_FEED = [
  {
    id: 'seed-1',
    post_type: 'Sell Offer',
    scope: 'Export',
    title: 'Indian Non-Basmati Parboiled Rice (5% Broken)',
    qty_label: '2,500 MT • 50 Kg PP Bag',
    route_port: 'FOB JNPT / Vizag -> Jebel Ali & West Africa',
    price: 'USD 465 / MT',
    trader_name: 'Global Agro Exports',
    trader_role: 'Exporter & Mill Owner',
    yellow_tick: true,
    blue_tick: true,
    lightning: true,
    likes: 42,
    comments: [
      { id: 'c1', user: 'Al-Bahr Foods UAE', text: 'Please share SGS lab report & 500 MT CIF Jebel Ali rate.' },
    ],
    isMine: false,
  },
  {
    id: 'seed-2',
    post_type: 'Buy Requirement',
    scope: 'Import',
    title: 'Urgent Requirement: Yellow Maize Feed Grade',
    qty_label: '1,000 MT • Bulk / Jumbo Bags',
    route_port: 'CIF Cat Lai Port, Vietnam',
    price: 'USD 268 / MT',
    trader_name: 'Mekong Agri Trading',
    trader_role: 'International Importer',
    yellow_tick: true,
    blue_tick: true,
    lightning: true,
    likes: 29,
    comments: [],
    isMine: false,
  },
  {
    id: 'seed-3',
    post_type: 'Direct Deal',
    scope: 'Direct Deals',
    title: 'Direct Mill Lot: Swarna Steam Rice (Silky Sortex)',
    qty_label: '500 MT • Ready Dispatch',
    route_port: 'Raipur / Dhamtari Mill -> Any Indian Port',
    price: 'INR 3,560 / Quintal',
    trader_name: 'Chhattisgarh Rice Mills',
    trader_role: 'Manufacturer & Exporter',
    yellow_tick: true,
    blue_tick: false,
    lightning: true,
    likes: 51,
    comments: [],
    isMine: false,
  },
  {
    id: 'seed-4',
    post_type: 'Govt / PSU Tender',
    scope: 'Tender / Govt',
    title: 'Institutional Supply Tender: Non-Basmati White Rice & Pulses',
    qty_label: '5,000 MT • EMD & Bank Guarantee Applicable',
    route_port: 'Ex-Warehouse Central & West India',
    price: 'Tender Quote Open',
    trader_name: 'Institutional Procurement Desk',
    trader_role: 'Verified Tender Agency',
    yellow_tick: true,
    blue_tick: true,
    lightning: false,
    likes: 18,
    comments: [],
    isMine: false,
  },
  {
    id: 'seed-5',
    post_type: 'Surplus Stock',
    scope: 'Surplus Lot',
    title: 'Close-Out Export Lot: Fresh G9 Cavendish Banana Boxes',
    qty_label: '60 MT (4 x 40ft Reefer) • Immediate Loading',
    route_port: 'Ex-Farm MH -> Mundra / JNPT',
    price: 'INR 1,780 / Quintal',
    trader_name: 'Sahyadri Fresh Farms',
    trader_role: 'Agro Exporter & Fleet',
    yellow_tick: true,
    blue_tick: false,
    lightning: true,
    likes: 35,
    comments: [],
    isMine: false,
  },
];

const EXIM_NEWS = [
  {
    id: 'n1',
    tag: 'DGFT POLICY',
    time: '2h ago',
    title: 'RoDTEP Benefit Extension Approved for Agro & Processed Food HS Chapters',
    summary: 'Exporters can claim remissions smoothly on shipping bills filed through EDI ports.',
  },
  {
    id: 'n2',
    tag: 'GLOBAL FREIGHT',
    time: '5h ago',
    title: 'JNPT & Mundra to Middle East (Jebel Ali / Dammam) 20ft FCL Rates Stabilize',
    summary: 'Container availability improves ahead of peak agricultural export dispatch window.',
  },
  {
    id: 'n3',
    tag: 'CUSTOMS & CHA',
    time: '1d ago',
    title: 'ICEGATE Single-Window Phytosanitary & COO Digital Clearance Update',
    summary: 'Faster port gate-in clearance for containerized rice, spices, and maize shipments.',
  },
];

const MANDI_DATA = [
  { id: 'm1', marketType: 'Domestic', category: 'Grains', commodity: 'Swarna Parboiled Rice', mandi: 'Raipur, CG', rate: 'INR 3,420 / Qtl', change_pct: '+1.2%', is_up: true },
  { id: 'm2', marketType: 'Domestic', category: 'Grains', commodity: 'Yellow Maize (Feed)', mandi: 'Chhindwara, MP', rate: 'INR 2,290 / Qtl', change_pct: '+0.8%', is_up: true },
  { id: 'm3', marketType: 'Domestic', category: 'Grains', commodity: '1121 Basmati Steam', mandi: 'Karnal, HR', rate: 'INR 7,850 / Qtl', change_pct: '-0.4%', is_up: false },
  { id: 'm4', marketType: 'Domestic', category: 'Pulses', commodity: 'Chana Desi (Bold)', mandi: 'Indore, MP', rate: 'INR 6,150 / Qtl', change_pct: '+0.9%', is_up: true },
  { id: 'm5', marketType: 'Domestic', category: 'Oilseeds', commodity: 'Soybean Yellow', mandi: 'Ujjain, MP', rate: 'INR 4,680 / Qtl', change_pct: '+0.6%', is_up: true },
  { id: 'm6', marketType: 'Domestic', category: 'Spices', commodity: 'Turmeric Finger (Salem)', mandi: 'Nizamabad, TS', rate: 'INR 14,900 / Qtl', change_pct: '+1.8%', is_up: true },
  { id: 'm7', marketType: 'Domestic', category: 'MSP Rates', commodity: 'Paddy Common (Govt MSP)', mandi: 'All India MSP', rate: 'INR 2,369 / Qtl', change_pct: 'MSP Fixed', is_up: true },
  { id: 'm8', marketType: 'Domestic', category: 'MSP Rates', commodity: 'Maize & Tur (Govt MSP)', mandi: 'All India MSP', rate: 'INR 2,400 / Qtl', change_pct: 'MSP Fixed', is_up: true },
  { id: 'm9', marketType: 'International', category: 'Grains', commodity: '5% Broken White Rice', mandi: 'FOB Ho Chi Minh, Vietnam', rate: 'USD 515 / MT', change_pct: '+0.7%', is_up: true },
  { id: 'm10', marketType: 'International', category: 'Grains', commodity: 'Parboiled Rice 5%', mandi: 'FOB Bangkok, Thailand', rate: 'USD 528 / MT', change_pct: '+0.4%', is_up: true },
  { id: 'm11', marketType: 'International', category: 'Grains', commodity: 'Yellow Corn FOB', mandi: 'Santos Port, Brazil', rate: 'USD 218 / MT', change_pct: '-0.3%', is_up: false },
  { id: 'm12', marketType: 'International', category: 'Spices', commodity: 'Black Pepper 550 GL', mandi: 'CIF Jebel Ali, UAE', rate: 'USD 6,450 / MT', change_pct: '+1.5%', is_up: true },
];
    
const SUBSCRIPTION_CATALOG = {
  'Exporter / Importer': [
    { name: 'Free Starter Plan', price: '₹ 0 / Forever', gateway: 'Free Tier', desc: 'Trade Feed, Mandi Pulse, Setuu Calc Pro & Basic DocForge' },
    { name: 'Domestic Exporter / Importer (Monthly)', price: '₹ 3,499 / Month', gateway: 'Razorpay (INR)', desc: 'Blue Tick Badge, Unlimited RFQs & Priority Buyer Leads' },
    { name: 'Domestic Exporter / Importer (Annual)', price: '₹ 34,999 / Year', gateway: 'Razorpay (INR)', desc: 'Full India B2B Access, Direct Buyer Contacts & Featured Storefront' },
    { name: 'International Global Pro (Easy Way)', price: '$ 499 / Year', gateway: 'Stripe (USD)', desc: 'Global Importer-Exporter Network & Cross-Border Trade Desk' },
  ],
  'Shipping Line': [
    { name: 'Shipping Line / NVOCC Basic Listing', price: '₹ 4,999 / Month', gateway: 'Razorpay / Stripe', desc: 'Port-to-Port Container Availability & Direct Exporter Inquiries' },
    { name: 'Featured Shipping Line & Route Priority', price: '₹ 14,999 / Quarter', gateway: 'Razorpay / Stripe', desc: 'Top Corridor Placement, FCL/LCL Space Broadcast & Priority Badge' },
  ],
  'Transporter': [
    { name: 'Transporter / Fleet Basic Registration', price: '₹ 0 (Free Listing)', gateway: 'Free Tier', desc: 'List Trucks, Backhaul Express & Receive Route Inquiries' },
    { name: 'Verified Priority Fleet Partner', price: '₹ 1,999 / Month', gateway: 'Razorpay (INR)', desc: 'Top Visibility in Logistics Hub & Verified Fleet Badge' },
  ],
  'Shipping Broker': [
    { name: 'India Freight & Chartering Broker (Monthly)', price: '₹ 2,499 / Month', gateway: 'Razorpay (INR)', desc: 'Access Bulk Cargo Leads, CHA Desk & Multi-Port Freight RFQs' },
    { name: 'India Freight & Chartering Broker (Annual)', price: '₹ 19,999 / Year', gateway: 'Razorpay (INR)', desc: 'Full-Year Broker Desk & Priority Load Alerts' },
    { name: 'International Shipping Broker (Global)', price: '$ 349 / Year', gateway: 'Stripe (USD)', desc: 'Global Vessel / Container Chartering & Forwarder Network' },
  ],
};

const DARK_THEME = {
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

const LIGHT_THEME = {
  isDark: false,
  navy: '#0D1B2A',
  bg: '#F1F5F9',
  card: '#FFFFFF',
  inputBg: '#F8FAFC',
  border: '#CBD5E1',
  text: '#0F172A',
  subText: '#475569',
  teal: '#0D9488',
  gold: '#B45309',
};

const TOP_PAD = Platform.OS === 'android' ? (StatusBar.currentHeight || 26) : 0;

export default function App() {
  const sysScheme = useColorScheme();
  const [themePref, setThemePref] = useState('dark');
  const isDarkMode =
    themePref === 'dark' ? true : themePref === 'light' ? false : sysScheme !== 'light';
  const T = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const [booting, setBooting] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [tab, setTab] = useState('feed');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [overlayScreen, setOverlayScreen] = useState(null);
  const [selectedTrader, setSelectedTrader] = useState(null);

  // Setuu Vault & Loyalty Points
  const [walletBalance, setWalletBalance] = useState(500);
  const [loyaltyPoints, setLoyaltyPoints] = useState(320);
  const [topupAmount, setTopupAmount] = useState('500');
  const [walletLogs, setWalletLogs] = useState([
    '• Setuu Vault Welcome Credit: +₹500.00',
    '• Fast Responder & Activity Bonus: +320 Loyalty Pts',
  ]);

  const [planCategory, setPlanCategory] = useState('Exporter / Importer');
  const [activePlan, setActivePlan] = useState('Free Starter Plan');

  // LinkedIn-Style User Profile
  const [userName, setUserName] = useState('Najeeb Javed');
  const [companyName, setCompanyName] = useState('Trade SETUU Overseas');
  const [userRole, setUserRole] = useState('Exporter • Importer • Logistics');
  const [userAbout, setUserAbout] = useState(
    'Global agro-commodity exporter & bulk logistics coordinator operating across JNPT, Mundra & Raipur corridors. Specializing in Parboiled Rice, Yellow Maize & Fresh Cavendish Bananas.'
  );
  const [userIec, setUserIec] = useState('AAACT1234F');
  const [userGst, setUserGst] = useState('22AAACT1234F1Z5');
  const [profileTab, setProfileTab] = useState('About Me');
  const [prefCurrency, setPrefCurrency] = useState('USD / INR');
  const [prefUnit, setPrefUnit] = useState('Metric Ton (MT)');

  // Feed, Comments & Chat States
  const [feedSubTab, setFeedSubTab] = useState('Post Feed');
  const [feedFilter, setFeedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [feed, setFeed] = useState(INITIAL_FEED);
  const [likedIds, setLikedIds] = useState({});
  const [savedIds, setSavedIds] = useState({ 'seed-1': true });
  const [commentPost, setCommentPost] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [mandiScope, setMandiScope] = useState('Domestic');
  const [mandiCat, setMandiCat] = useState('All');
  const [mandiList, setMandiList] = useState(MANDI_DATA);

  // Create Post Modal
  const [postModal, setPostModal] = useState(false);
  const [postIntent, setPostIntent] = useState('Sell Offer');
  const [postScope, setPostScope] = useState('Export');
  const [postTitle, setPostTitle] = useState('');
  const [postQty, setPostQty] = useState('');
  const [postUnit, setPostUnit] = useState('MT');
  const [postPort, setPostPort] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postDesc, setPostDesc] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const addLoyaltyPoints = (pts, reason) => {
    setLoyaltyPoints((p) => p + pts);
    if (reason) {
      setWalletLogs((prev) => ['• +' + pts + ' Loyalty Pts: ' + reason, ...prev]);
    }
  };
  async function fetchAllData() {
    setLoading(true);
    try {
      const [fRes, mRes] = await Promise.all([
        supabase.from('trade_feed').select('*').order('created_at', { ascending: false }),
        supabase.from('mandi_rates').select('*').order('updated_at', { ascending: false }),
      ]);
      if (fRes.data && fRes.data.length > 0) {
        const normalized = fRes.data.map((d) => ({
          ...d,
          scope: d.scope || (d.post_type === 'Buy' ? 'Import' : 'Export'),
          qty_label: d.qty_label || 'Verified Lot',
          trader_name: d.verified_by || 'Verified Trader',
          trader_role: 'Exporter & Importer',
          yellow_tick: true,
          blue_tick: true,
          lightning: true,
          likes: d.likes || 14,
          comments: [],
        }));
        setFeed([...normalized, ...INITIAL_FEED]);
      }
      if (mRes.data && mRes.data.length > 0) {
        setMandiList([...mRes.data.map((m) => ({ ...m, marketType: m.marketType || 'Domestic' })), ...MANDI_DATA]);
      }
    } catch (e) {}
    setLoading(false);
    setRefreshing(false);
  }

  const sendWhatsApp = async (msg) => {
    const url = 'whatsapp://send?text=' + encodeURIComponent(msg);
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url);
    else Share.share({ message: msg });
  };

  const handleWalletTopup = (gatewayLabel) => {
    const amt = parseFloat(topupAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    Alert.alert(
      '🔒 ' + gatewayLabel + ' — Testing Phase',
      'Live gateway final login & touch-up ke waqt unlock hoga. Abhi testing ke liye ₹' + amt + ' add karein?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '+ Add ₹' + amt + ' (Test)',
          onPress: () => {
            setWalletBalance((prev) => prev + amt);
            setWalletLogs((prev) => ['• Setuu Vault Top-up (' + gatewayLabel + '): +₹' + amt.toFixed(2), ...prev]);
          },
        },
      ]
    );
  };

  const handleAddComment = () => {
    if (!commentPost || !commentDraft.trim()) return;
    const newC = { id: 'c-' + Date.now(), user: userName + ' (' + companyName + ')', text: commentDraft.trim() };
    setFeed((prev) =>
      prev.map((item) =>
        item.id === commentPost.id ? { ...item, comments: [...(item.comments || []), newC] } : item
      )
    );
    setCommentPost((prev) => ({ ...prev, comments: [...(prev.comments || []), newC] }));
    setCommentDraft('');
    addLoyaltyPoints(5, 'Trade Feed Comment');
  };

  async function handleCreatePost() {
    if (!postTitle || !postPort || !postPrice) {
      Alert.alert('Missing Details', 'Please fill commodity, port/route, and target price.');
      return;
    }
    const newItem = {
      id: 'local-' + Date.now(),
      post_type: postIntent,
      scope: postScope,
      title: postTitle + (postDesc ? ' — ' + postDesc : ''),
      qty_label: (postQty || 'Open') + ' ' + postUnit,
      route_port: postPort,
      price: postPrice,
      trader_name: companyName,
      trader_role: userRole,
      yellow_tick: true,
      blue_tick: activePlan !== 'Free Starter Plan',
      lightning: true,
      likes: 1,
      comments: [],
      isMine: true,
    };
    setFeed([newItem, ...feed]);
    setPostModal(false);
    setPostTitle('');
    setPostQty('');
    setPostPort('');
    setPostPrice('');
    setPostDesc('');
    setTab('feed');
    setFeedSubTab('Post Feed');
    addLoyaltyPoints(25, 'New Trade Post Published');
  }

  // LINKEDIN-STYLE PROFILE VIEW (SELF OR PUBLIC TRADER)
  const renderLinkedInProfile = (prof, isSelf) => {
    const certs = [
      { code: 'IEC', title: 'Importer Exporter Code', num: prof.iec || 'AAACT1234F', status: 'DGFT VERIFIED' },
      { code: 'GST', title: 'GST Registration Certificate', num: prof.gst || '22AAACT1234F1Z5', status: 'ACTIVE' },
      { code: 'RCMC', title: 'APEDA / FIEO RCMC Membership', num: 'RCMC/2026/88412', status: 'VERIFIED' },
      { code: 'AD', title: 'Authorized Dealer (AD) Bank Code', num: 'UBIN-0542190', status: 'PORT REGISTERED' },
      { code: 'ISO', title: 'ISO 22000 & Phytosanitary Export', num: 'ISO-9001-2026', status: 'CERTIFIED' },
    ];
    const storefrontItems = [
      { name: 'Indian Parboiled Rice (5% Broken)', moq: '100 MT (4 x 20ft FCL)', rate: 'USD 465 / MT FOB' },
      { name: 'Yellow Maize (Animal Feed Grade)', moq: '250 MT', rate: 'USD 265 / MT FOB' },
      { name: '32ft Multi-Axle Bulk Fleet Service', moq: '25 MT / Trip', rate: 'Raipur <-> JNPT / Mundra' },
    ];
    return (
      <ScrollView style={{ flex: 1, backgroundColor: T.bg }}>
        {/* Midnight Navy Blue Cover & Header */}
        <View style={s.liCover}>
          <Text style={s.liCoverTag}>COVER PHOTO • VERIFIED B2B TRADE ECOSYSTEM</Text>
          <View style={s.liGoldenSideBadge}>
            <Text style={s.liGoldenSideTxt}>👑 {prof.blueTick ? 'GOLD MEMBER' : 'VERIFIED TRADER'}</Text>
          </View>
        </View>

        <View style={[s.liBody, { backgroundColor: T.bg }]}>
          <View style={s.liAvatarRow}>
            <View style={s.liGoldenRing}>
              <View style={s.liAvatarCircle}>
                <Text style={{ fontSize: 32 }}>👤</Text>
              </View>
            </View>
            <View style={s.liLightningPill}>
              <Text style={s.liLightningTxt}>⚡ Lightning Responder (&lt;15m)</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            <Text style={[s.liName, { color: T.text }]}>{prof.name}</Text>
            {prof.yellowTick && <Text style={s.yellowTick}>  🟡</Text>}
            {prof.blueTick && <Text style={s.blueTick}>  🔵</Text>}
          </View>
          <Text style={[s.liCompany, { color: T.teal }]}>{prof.company}</Text>
          <Text style={[s.liRole, { color: T.subText }]}>{prof.role}</Text>

          <View style={[s.liStatsBar, { backgroundColor: T.card, borderColor: T.border }]}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: T.teal, fontWeight: '900', fontSize: 15 }}>98%</Text>
              <Text style={{ color: T.subText, fontSize: 10 }}>Response Rate</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: T.gold, fontWeight: '900', fontSize: 15 }}>{loyaltyPoints} Pts</Text>
              <Text style={{ color: T.subText, fontSize: 10 }}>Loyalty Score</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: T.text, fontWeight: '900', fontSize: 15 }}>5 Docs</Text>
              <Text style={{ color: T.subText, fontSize: 10 }}>Verified KYC</Text>
            </View>
          </View>

          {/* 4 LinkedIn-Style Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
            {['About Me', 'Activities', 'Storefront', 'Certificates'].map((pt) => (
              <TouchableOpacity
                key={pt}
                style={[
                  s.chip,
                  { backgroundColor: T.card, borderColor: T.border },
                  profileTab === pt && { backgroundColor: T.teal, borderColor: T.teal },
                ]}
                onPress={() => setProfileTab(pt)}
              >
                <Text style={{ color: profileTab === pt ? '#FFF' : T.text, fontSize: 12, fontWeight: '700' }}>
                  {pt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {profileTab === 'About Me' && (
            <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[s.cardTitle, { color: T.text }]}>About Company & Trade Operations</Text>
              <Text style={[s.cardRoute, { color: T.subText }]}>{prof.about}</Text>
              {isSelf && (
                <>
                  <Text style={[s.label, { color: T.subText }]}>EDIT COMPANY NAME</Text>
                  <TextInput style={[s.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={companyName} onChangeText={setCompanyName} />
                  <Text style={[s.label, { color: T.subText }]}>EDIT ROLE (Exporter / Importer / Fleet / Broker)</Text>
                  <TextInput style={[s.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} value={userRole} onChangeText={setUserRole} />
                  <TouchableOpacity style={s.primaryBtn} onPress={() => Alert.alert('Saved', 'Profile & Storefront updated.')}>
                    <Text style={s.primaryBtnText}>Save Profile Updates</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {profileTab === 'Activities' && (
            <View>
              {feed.slice(0, 3).map((act) => (
                <View key={act.id} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                  <Text style={s.goldBadge}>{act.post_type} • {act.scope}</Text>
                  <Text style={[s.cardTitle, { color: T.text }]}>{act.title}</Text>
                  <Text style={[s.cardRoute, { color: T.subText }]}>{act.route_port} • {act.price}</Text>
                </View>
              ))}
            </View>
          )}

          {profileTab === 'Storefront' && (
            <View>
              {storefrontItems.map((st, idx) => (
                <View key={idx} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                  <Text style={s.goldBadge}>VERIFIED CATALOG ITEM</Text>
                  <Text style={[s.cardTitle, { color: T.text }]}>{st.name}</Text>
                  <Text style={[s.cardRoute, { color: T.subText }]}>MOQ: {st.moq}</Text>
                  <View style={s.rowBetween}>
                    <Text style={s.priceText}>{st.rate}</Text>
                    <TouchableOpacity
                      style={s.waMiniBtn}
                      onPress={() => sendWhatsApp('Storefront Inquiry (' + prof.company + '): ' + st.name)}
                    >
                      <Text style={s.waMiniTxt}>💬 WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {profileTab === 'Certificates' && (
            <View>
              {certs.map((c) => (
                <View key={c.code} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                  <View style={s.rowBetween}>
                    <Text style={s.goldBadge}>{c.code} DOCUMENT</Text>
                    <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>✓ {c.status}</Text>
                  </View>
                  <Text style={[s.cardTitle, { color: T.text }]}>{c.title}</Text>
                  <Text style={[s.cardRoute, { color: T.subText }]}>Reg / Ref: {c.num}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    );
  };
  if (booting) return <SplashScreen />;

  if (!loggedIn) {
    return (
      <SafeAreaView style={[s.root, { paddingTop: TOP_PAD, backgroundColor: '#0B0D12' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />
        <View style={s.loginBox}>
          <Text style={s.goldBadge}>TRADE SETUU • B2B ECOSYSTEM</Text>
          <Text style={s.loginTitle}>
            Global Trade <Text style={s.teal}>Access</Text>
          </Text>
          <Text style={s.loginSub}>
            Connect directly with verified exporters, importers, CHAs & fleet operators.
          </Text>
          <Text style={s.label}>MOBILE NUMBER (+91)</Text>
          <TextInput
            style={[s.input, { backgroundColor: '#141821', color: '#D9DDE3', borderColor: '#232936' }]}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
          {otpSent && (
            <>
              <Text style={s.label}>ENTER 4-DIGIT OTP (Use 1234)</Text>
              <TextInput
                style={[s.input, { backgroundColor: '#141821', color: '#D9DDE3', borderColor: '#232936' }]}
                placeholder="• • • •"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                maxLength={4}
                value={otp}
                onChangeText={setOtp}
              />
            </>
          )}
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => {
              if (!otpSent) {
                if (phone.length < 10) {
                  Alert.alert('Invalid Number', 'Enter 10-digit mobile number.');
                  return;
                }
                setOtpSent(true);
              } else {
                if (otp.length === 4) setLoggedIn(true);
                else Alert.alert('Invalid OTP', 'Enter 4-digit OTP (e.g. 1234).');
              }
            }}
          >
            <Text style={s.primaryBtnText}>
              {otpSent ? 'Verify & Enter Trade Desk' : 'Send Verification OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- OVERLAY SCREENS ---
  if (overlayScreen) {
    const titlesMap = {
      logistics: 'Global Logistics Hub',
      blindroom: 'Blind Deal Room 🔒',
      vault: 'Setuu Vault & Loyalty',
      chat: 'Trade Inbox & Chats',
      notifications: 'Alerts & Fast-Response Feed',
      profile: 'My LinkedIn-Style Profile',
      publicProfile: selectedTrader ? selectedTrader.company : 'Trader Profile',
      dashboard: 'Business Dashboard',
      myposts: 'My Posts & Listings',
      saved: 'Saved / Shortlist',
      plans: 'Subscription Plans (₹ / $)',
      settings: 'Theme & App Settings',
      support: 'Help & Support',
    };

    return (
      <SafeAreaView style={[s.root, { paddingTop: TOP_PAD, backgroundColor: T.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />
        <TradeSetuuHeader
          title={titlesMap[overlayScreen] || 'Trade SETUU'}
          onBack={() => setOverlayScreen(null)}
          onOpenSettings={() => setOverlayScreen('settings')}
        />

        {overlayScreen === 'logistics' && (
          <LogisticsHubScreen theme={T} onEarnPoints={(p) => addLoyaltyPoints(p, 'Logistics Request')} />
        )}

        {overlayScreen === 'profile' &&
          renderLinkedInProfile(
            {
              name: userName,
              company: companyName,
              role: userRole,
              about: userAbout,
              iec: userIec,
              gst: userGst,
              yellowTick: true,
              blueTick: activePlan !== 'Free Starter Plan',
            },
            true
          )}

        {overlayScreen === 'publicProfile' &&
          selectedTrader &&
          renderLinkedInProfile(
            {
              name: selectedTrader.trader_name,
              company: selectedTrader.trader_name,
              role: selectedTrader.trader_role,
              about: 'Verified B2B trade partner on Trade SETUU. Operating across domestic mandis and international container ports.',
              yellowTick: selectedTrader.yellow_tick,
              blueTick: selectedTrader.blue_tick,
            },
            false
          )}

        {overlayScreen === 'blindroom' && (
          <View style={s.vaultContainer}>
            <View style={[s.vaultHeaderCard, { backgroundColor: T.card }]}>
              <Text style={s.vaultLockIcon}>🔒</Text>
              <Text style={s.vaultTitle}>BLIND DEAL ROOM</Text>
            </View>
            <TouchableOpacity
              style={[s.shieldCard, { backgroundColor: T.card, borderColor: T.border }]}
              onPress={() => Alert.alert('🔒 Jugaad Shield — Locked', 'Strict deal protection unlocks after escrow verification.')}
            >
              <Text style={[s.shieldTitle, { color: T.text }]}>🛡️  Jugaad Shield</Text>
              <Text style={s.lockBadge}>LOCKED</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.shieldCard, { backgroundColor: T.card, borderColor: T.border }]}
              onPress={() => Alert.alert('🔒 The Neutral Lock — Locked', 'Neutral settlement lock unlocks after compliance check.')}
            >
              <Text style={[s.shieldTitle, { color: T.text }]}>🔐  The Neutral Lock</Text>
              <Text style={s.lockBadge}>LOCKED</Text>
            </TouchableOpacity>
            <Text style={[s.footerBrand, { color: T.subText }]}>Powered by Apex Sync Technologies</Text>
          </View>
        )}

        {overlayScreen === 'vault' && (
          <ScrollView style={{ padding: 14 }}>
            <View style={[s.vaultHeaderCard, { backgroundColor: T.card }]}>
              <Text style={s.goldBadge}>SETUU VAULT • TRADE CREDITS</Text>
              <Text style={s.walletAmt}>₹ {walletBalance.toFixed(2)}</Text>
              <Text style={{ color: T.subText, fontSize: 11 }}>
                Balance kam hone ya ₹0 hone par neeche se तुरंत add karein
              </Text>
            </View>

            <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[s.cardTitle, { color: T.text }]}>+ Add Funds to Setuu Vault</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
                {['500', '1000', '2500', '5000'].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[s.chip, { backgroundColor: T.inputBg, borderColor: T.border }, topupAmount === amt && s.chipActive]}
                    onPress={() => setTopupAmount(amt)}
                  >
                    <Text style={{ color: topupAmount === amt ? '#FFF' : T.text, fontSize: 11, fontWeight: '700' }}>
                      + ₹{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[s.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]}
                keyboardType="numeric"
                value={topupAmount}
                onChangeText={setTopupAmount}
              />
              <View style={s.rowBetween}>
                <TouchableOpacity style={[s.primaryBtn, { flex: 1, marginRight: 6 }]} onPress={() => handleWalletTopup('Razorpay (INR)')}>
                  <Text style={s.primaryBtnText}>+ Razorpay 🔒</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.primaryBtn, { flex: 1, marginLeft: 6, backgroundColor: '#C9B89A' }]} onPress={() => handleWalletTopup('Stripe (USD)')}>
                  <Text style={[s.primaryBtnText, { color: '#0B0D12' }]}>+ Stripe 🔒</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
              <View style={s.rowBetween}>
                <Text style={s.goldBadge}>🏆 ACTIVITY LOYALTY POINTS</Text>
                <Text style={s.priceText}>{loyaltyPoints} Pts</Text>
              </View>
              <Text style={[s.cardTitle, { color: T.text }]}>Voucher Redemption (Committee Milestones)</Text>
              <Text style={[s.cardRoute, { color: T.subText }]}>
                Active rehne, 15-min ke andar respond karne aur posts dalne par points milte hain. Committee final slab decide karne ke baad vouchers redeem honge:
              </Text>
              <Text style={{ color: T.gold, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
                • 500 Pts ➔ ₹500 Logistics / CHA Credit Voucher (Soon)
              </Text>
              <Text style={{ color: T.gold, fontSize: 12, fontWeight: '700' }}>
                • 1,500 Pts ➔ Free Port Inspection / Subscription Discount (Soon)
              </Text>
            </View>

            <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[s.cardTitle, { color: T.text }]}>Vault & Points Ledger</Text>
              {walletLogs.map((l, i) => (
                <Text key={i} style={[s.cardRoute, { color: T.subText }]}>{l}</Text>
              ))}
            </View>
          </ScrollView>
        )}

        {overlayScreen === 'chat' && (
          <ScrollView style={{ padding: 14 }}>
            <View style={s.liLightningPill}>
              <Text style={s.liLightningTxt}>⚡ Respond within 15 mins to keep your Lightning Badge active!</Text>
            </View>
            {[
              { name: 'Global Agro Exports', msg: 'Ready to lock 500 MT Parboiled Rice FOB JNPT. Share PI?', time: '4m ago' },
              { name: 'JNPT Fleet Logistics', msg: '32ft MXL truck placement confirmed for Raipur loading.', time: '28m ago' },
            ].map((ch, idx) => (
              <View key={idx} style={[s.card, { backgroundColor: T.card, borderColor: T.border, marginTop: 10 }]}>
                <View style={s.rowBetween}>
                  <Text style={[s.cardTitle, { color: T.text }]}>{ch.name}</Text>
                  <Text style={{ color: T.teal, fontSize: 11, fontWeight: '700' }}>{ch.time}</Text>
                </View>
                <Text style={[s.cardRoute, { color: T.subText }]}>{ch.msg}</Text>
                <TouchableOpacity
                  style={s.waMiniBtn}
                  onPress={() => {
                    addLoyaltyPoints(10, 'Fast <15m Buyer Reply');
                    sendWhatsApp('Reply from ' + companyName + ' regarding: ' + ch.msg);
                  }}
                >
                  <Text style={s.waMiniTxt}>💬 Quick Reply on WhatsApp (+10 Pts)</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {overlayScreen === 'notifications' && (
          <ScrollView style={{ padding: 14 }}>
            {[
              { tag: '⚡ LIGHTNING BADGE', text: 'Your average response time is 9 mins! Lightning Responder badge is ACTIVE.' },
              { tag: '📊 MANDI PULSE', text: 'Swarna Parboiled Rice (Raipur) up +1.2% at INR 3,420 / Qtl.' },
              { tag: '🏆 LOYALTY POINTS', text: 'You have ' + loyaltyPoints + ' Loyalty Points in Setuu Vault.' },
            ].map((nt, i) => (
              <View key={i} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                <Text style={s.goldBadge}>{nt.tag}</Text>
                <Text style={[s.cardTitle, { color: T.text }]}>{nt.text}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {overlayScreen === 'plans' && (
          <View style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Object.keys(SUBSCRIPTION_CATALOG).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[s.chip, { backgroundColor: T.card, borderColor: T.border }, planCategory === cat && s.chipActive]}
                    onPress={() => setPlanCategory(cat)}
                  >
                    <Text style={{ color: planCategory === cat ? '#FFF' : T.text, fontSize: 11, fontWeight: '700' }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <ScrollView style={{ padding: 14 }}>
              <View style={s.noticeBanner}>
                <Text style={s.noticeTxt}>
                  🔒 Razorpay (INR) & Stripe (USD) Gateways are locked during Beta Testing.
                </Text>
              </View>
              {(SUBSCRIPTION_CATALOG[planCategory] || []).map((p) => {
                const isFree = p.gateway === 'Free Tier';
                return (
                  <View key={p.name} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                    <View style={s.rowBetween}>
                      <Text style={s.goldBadge}>{p.gateway}</Text>
                      <Text style={s.priceText}>{p.price}</Text>
                    </View>
                    <Text style={[s.cardTitle, { color: T.text }]}>{p.name}</Text>
                    <Text style={[s.cardRoute, { color: T.subText }]}>{p.desc}</Text>
                    <TouchableOpacity
                      style={[s.primaryBtn, !isFree && { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#C9B89A' }]}
                      onPress={() => {
                        if (isFree) {
                          setActivePlan(p.name);
                          Alert.alert('Plan Active', p.name + ' is active.');
                        } else {
                          Alert.alert('🔒 ' + p.gateway + ' Locked', 'Payment gateway final login & touch-up ke waqt unlock hoga.');
                        }
                      }}
                    >
                      <Text style={[s.primaryBtnText, !isFree && { color: '#C9B89A' }]}>
                        {isFree ? (activePlan === p.name ? '✓ Active Free Plan' : 'Activate Free Plan') : '🔒 Proceed via ' + p.gateway}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {overlayScreen === 'settings' && (
          <ScrollView style={{ padding: 14 }}>
            <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[s.cardTitle, { color: T.text }]}>App Theme (Midnight Navy Base)</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                {[
                  { id: 'dark', label: 'Navy + Black (Dark)' },
                  { id: 'light', label: 'Navy + White (Light)' },
                  { id: 'system', label: 'System Default' },
                ].map((th) => (
                  <TouchableOpacity
                    key={th.id}
                    style={[s.chip, { backgroundColor: T.inputBg, borderColor: T.border }, themePref === th.id && s.chipActive]}
                    onPress={() => setThemePref(th.id)}
                  >
                    <Text style={{ color: themePref === th.id ? '#FFF' : T.text, fontSize: 11, fontWeight: '700' }}>
                      {th.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.label, { color: T.subText, marginTop: 12 }]}>DEFAULT CURRENCY PAIR</Text>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {['USD / INR', 'AED / INR', 'EUR / USD'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[s.chip, { backgroundColor: T.inputBg, borderColor: T.border }, prefCurrency === c && s.chipActive]}
                    onPress={() => setPrefCurrency(c)}
                  >
                    <Text style={{ color: prefCurrency === c ? '#FFF' : T.text, fontSize: 11 }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.label, { color: T.subText }]}>DEFAULT WEIGHT UNIT</Text>
              <View style={{ flexDirection: 'row' }}>
                {['Metric Ton (MT)', 'Quintal (100 Kg)'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[s.chip, { backgroundColor: T.inputBg, borderColor: T.border }, prefUnit === u && s.chipActive]}
                    onPress={() => setPrefUnit(u)}
                  >
                    <Text style={{ color: prefUnit === u ? '#FFF' : T.text, fontSize: 11 }}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {(overlayScreen === 'dashboard' || overlayScreen === 'myposts' || overlayScreen === 'saved' || overlayScreen === 'support') && (
          <ScrollView style={{ padding: 14 }}>
            <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[s.cardTitle, { color: T.text }]}>{titlesMap[overlayScreen]}</Text>
              <Text style={[s.cardRoute, { color: T.subText }]}>
                Active Posts: {feed.filter((x) => x.isMine).length} • Shortlisted: {Object.values(savedIds).filter(Boolean).length} • Setuu Vault: ₹{walletBalance} • Loyalty: {loyaltyPoints} Pts
              </Text>
              <TouchableOpacity
                style={s.waMiniBtn}
                onPress={() => sendWhatsApp('Hello Trade SETUU Support Desk, inquiry from ' + companyName)}
              >
                <Text style={s.waMiniTxt}>💬 Connect Support on WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }
  const visibleFeed = feed.filter((item) => {
    const matchesFilter = feedFilter === 'All' || (item.scope && item.scope.toLowerCase() === feedFilter.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.route_port.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const visibleMandi = mandiList.filter((m) => m.marketType === mandiScope && (mandiCat === 'All' || m.category === mandiCat));

  return (
    <SafeAreaView style={[s.root, { paddingTop: TOP_PAD, backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* UNIFIED LINKEDIN-STYLE HEADER (TS LOGO + SEARCH + CHAT + NOTIFICATIONS + SETTINGS) */}
      <TradeSetuuHeader
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onOpenMenu={() => setDrawerOpen(true)}
        onOpenChat={() => setOverlayScreen('chat')}
        onOpenNotifications={() => setOverlayScreen('notifications')}
        onOpenSettings={() => setOverlayScreen('settings')}
      />

      {/* TAB 1: TRADE FEED (POST FEED | MARKET | EXIM NEWS) */}
      {tab === 'feed' && (
        <View style={{ flex: 1 }}>
          <View style={[s.segBar, { borderBottomColor: T.border }]}>
            {['Post Feed', 'Market', 'Exim News'].map((st) => (
              <TouchableOpacity key={st} onPress={() => setFeedSubTab(st)} style={[s.segBtn, feedSubTab === st && s.segBtnActive]}>
                <Text style={[s.segTxt, { color: feedSubTab === st ? T.text : T.subText }]}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={s.body}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAllData(); }} tintColor="#0D9488" />}
          >
            {feedSubTab === 'Post Feed' && (
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  {['All', 'Import', 'Export', 'Domestic', 'International', 'Direct Deals', 'Tender / Govt', 'Surplus Lot'].map((f) => (
                    <TouchableOpacity key={f} style={[s.chip, { backgroundColor: T.card, borderColor: T.border }, feedFilter === f && s.chipActive]} onPress={() => setFeedFilter(f)}>
                      <Text style={{ color: feedFilter === f ? '#FFF' : T.subText, fontSize: 11, fontWeight: '700' }}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {loading && !refreshing ? (
                  <ActivityIndicator color="#0D9488" style={{ marginTop: 20 }} />
                ) : (
                  visibleFeed.map((item) => {
                    const isLiked = !!likedIds[item.id];
                    const isSaved = !!savedIds[item.id];
                    const shareText =
                      'TRADE SETUU DEAL:\n' +
                      item.title +
                      '\nSpec: ' +
                      item.qty_label +
                      '\nRoute: ' +
                      item.route_port +
                      '\nTarget: ' +
                      item.price +
                      '\nBy: ' +
                      item.trader_name;
                    return (
                      <View key={item.id} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                        {/* Tappable Trader Profile Strip */}
                        <TouchableOpacity
                          style={s.traderStrip}
                          onPress={() => {
                            setSelectedTrader(item);
                            setProfileTab('About Me');
                            setOverlayScreen('publicProfile');
                          }}
                        >
                          <View style={s.miniGoldRing}>
                            <Text style={{ fontSize: 13 }}>👤</Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={{ color: T.text, fontSize: 12, fontWeight: '800' }}>{item.trader_name}</Text>
                              {item.yellow_tick && <Text style={{ fontSize: 10 }}> 🟡</Text>}
                              {item.blue_tick && <Text style={{ fontSize: 10 }}> 🔵</Text>}
                              {item.lightning && <Text style={{ fontSize: 10 }}> ⚡</Text>}
                            </View>
                            <Text style={{ color: T.subText, fontSize: 10 }}>{item.trader_role} • View Storefront ›</Text>
                          </View>
                          <Text style={s.priceText}>{item.price}</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                          <View style={s.tag}>
                            <Text style={s.tagText}>{item.scope.toUpperCase()}</Text>
                          </View>
                          <Text style={[s.intentTag, { color: T.subText }]}>  • {item.post_type}</Text>
                        </View>

                        <Text style={[s.cardTitle, { color: T.text }]}>{item.title}</Text>

                        <View style={[s.specStrip, { backgroundColor: T.inputBg, borderColor: T.border }]}>
                          <Text style={[s.specStripTxt, { color: T.text }]}>📦 {item.qty_label}</Text>
                          <Text style={[s.specStripTxt, { color: T.text }]}>🚢 {item.route_port}</Text>
                        </View>

                        {/* 4 Social & Direct WhatsApp Actions */}
                        <View style={[s.actionBar, { borderTopColor: T.border }]}>
                          <TouchableOpacity
                            style={s.miniAction}
                            onPress={() => {
                              setLikedIds((p) => ({ ...p, [item.id]: !p[item.id] }));
                              if (!isLiked) addLoyaltyPoints(2, 'Liked Trade Post');
                            }}
                          >
                            <Text style={[s.miniActionTxt, { color: isLiked ? '#EF4444' : T.subText }]}>
                              {isLiked ? '♥' : '♡'} {(item.likes || 12) + (isLiked ? 1 : 0)}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={s.miniAction} onPress={() => setCommentPost(item)}>
                            <Text style={[s.miniActionTxt, { color: T.subText }]}>
                              💬 {(item.comments || []).length}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={s.waMiniBtn} onPress={() => sendWhatsApp(shareText)}>
                            <Text style={s.waMiniTxt}>WhatsApp</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={s.miniAction} onPress={() => Share.share({ message: shareText })}>
                            <Text style={[s.miniActionTxt, { color: T.gold }]}>↗ Share</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {feedSubTab === 'Market' && (
              <View>
                <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                  <View style={s.rowBetween}>
                    <Text style={[s.cardTitle, { color: T.text }]}>USD / INR Spot Reference</Text>
                    <Text style={s.priceText}>₹ 84.50</Text>
                  </View>
                  <Text style={[s.cardRoute, { color: T.subText }]}>
                    AED: ₹23.01  |  EUR: ₹91.85  |  SAR: ₹22.53  |  VND: 25,400/$
                  </Text>
                </View>
                {mandiList.slice(0, 5).map((m) => (
                  <View key={m.id} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                    <View style={s.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.goldBadge}>{m.marketType.toUpperCase()} • {m.category}</Text>
                        <Text style={[s.cardTitle, { color: T.text }]}>{m.commodity}</Text>
                        <Text style={[s.cardRoute, { color: T.subText }]}>{m.mandi}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={s.priceText}>{m.rate}</Text>
                        <Text style={[s.pctText, { color: m.is_up ? '#10B981' : '#EF4444' }]}>{m.change_pct}</Text>
                      </View>
                    </View>
                  </View>
                ))}
                <TouchableOpacity style={s.primaryBtn} onPress={() => setTab('mandi')}>
                  <Text style={s.primaryBtnText}>Open Mandi Pulse →</Text>
                </TouchableOpacity>
              </View>
            )}

            {feedSubTab === 'Exim News' && (
              <View>
                {EXIM_NEWS.map((news) => (
                  <View key={news.id} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                    <View style={s.rowBetween}>
                      <Text style={s.goldBadge}>{news.tag}</Text>
                      <Text style={{ color: T.subText, fontSize: 10 }}>{news.time}</Text>
                    </View>
                    <Text style={[s.cardTitle, { color: T.text }]}>{news.title}</Text>
                    <Text style={[s.cardRoute, { color: T.subText }]}>{news.summary}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      )}

      {/* TAB 2: MANDI PULSE */}
      {tab === 'mandi' && (
        <View style={{ flex: 1 }}>
          <View style={[s.toggleBox, { backgroundColor: T.card, borderColor: T.border }]}>
            {['Domestic', 'International'].map((sc) => (
              <TouchableOpacity key={sc} onPress={() => setMandiScope(sc)} style={[s.scopeBtn, mandiScope === sc && s.scopeBtnActive]}>
                <Text style={[s.scopeTxt, { color: mandiScope === sc ? '#FFF' : T.subText }]}>
                  {sc === 'Domestic' ? 'Mandi Pulse (India)' : 'International FOB/CIF'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView style={s.body}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {['All', 'Grains', 'Pulses', 'Oilseeds', 'Spices', 'MSP Rates'].map((cat) => (
                <TouchableOpacity key={cat} style={[s.chip, { backgroundColor: T.card, borderColor: T.border }, mandiCat === cat && s.chipActive]} onPress={() => setMandiCat(cat)}>
                  <Text style={{ color: mandiCat === cat ? '#FFF' : T.subText, fontSize: 11, fontWeight: '700' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {visibleMandi.map((item) => (
              <View key={item.id} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                <View style={s.rowBetween}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[s.cardTitle, { color: T.text }]}>{item.commodity}</Text>
                    <Text style={[s.cardRoute, { color: T.subText }]}>{item.mandi}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.priceText}>{item.rate}</Text>
                    <Text style={[s.pctText, { color: item.is_up ? '#10B981' : '#EF4444' }]}>{item.change_pct}</Text>
                  </View>
                </View>
              </View>
            ))}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      )}

      {/* TAB 4: SETUU CALC PRO */}
      {tab === 'calc' && <SetuuCalcProScreen theme={T} />}

      {/* TAB 5: SERVICE HUB */}
      {tab === 'services' && (
        <ServiceHubScreen
          theme={T}
          onOpenLogistics={() => setOverlayScreen('logistics')}
          onEarnPoints={(p) => addLoyaltyPoints(p, 'Service Hub Activity')}
        />
      )}

      {/* 5 BOTTOM NAVIGATION TABS */}
      <View style={[s.navBar, { backgroundColor: '#0D1B2A', borderTopColor: '#1E293B' }]}>
        <TouchableOpacity style={s.navItem} onPress={() => setTab('feed')}>
          <Text style={s.navIcon}>🏠</Text>
          <Text style={[s.navText, tab === 'feed' && s.navTextActive]}>Trade Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => setTab('mandi')}>
          <Text style={s.navIcon}>📊</Text>
          <Text style={[s.navText, tab === 'mandi' && s.navTextActive]}>Mandi Pulse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.plusBtn} onPress={() => setPostModal(true)}>
          <Text style={s.plusBtnTxt}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => setTab('calc')}>
          <Text style={s.navIcon}>🧮</Text>
          <Text style={[s.navText, tab === 'calc' && s.navTextActive]}>Calc Pro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => setTab('services')}>
          <Text style={s.navIcon}>🛎️</Text>
          <Text style={[s.navText, tab === 'services' && s.navTextActive]}>Service Hub</Text>
        </TouchableOpacity>
      </View>

      {/* SIDE DRAWER */}
      <Modal visible={drawerOpen} transparent animationType="fade">
        <View style={s.drawerOverlay}>
          <View style={[s.drawerPanel, { paddingTop: TOP_PAD + 10 }]}>
            <TouchableOpacity
              style={s.drawerTop}
              onPress={() => {
                setDrawerOpen(false);
                setProfileTab('About Me');
                setOverlayScreen('profile');
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={s.drawerUser}>{userName}</Text>
                <Text style={{ fontSize: 12 }}> 🟡 🔵 ⚡</Text>
              </View>
              <Text style={s.goldBadge}>{companyName} • View Profile ›</Text>
            </TouchableOpacity>

            <ScrollView style={{ flex: 1 }}>
              <TouchableOpacity
                style={s.drawerWallet}
                onPress={() => {
                  setDrawerOpen(false);
                  setOverlayScreen('vault');
                }}
              >
                <View>
                  <Text style={s.drawerWalletTitle}>🔐 Setuu Vault</Text>
                  <Text style={{ color: '#C9B89A', fontSize: 10 }}>{loyaltyPoints} Loyalty Pts</Text>
                </View>
                <Text style={s.drawerWalletAmt}>₹ {walletBalance} +</Text>
              </TouchableOpacity>

              {[
                { key: 'profile', label: '👤  My Profile, Storefront & KYC' },
                { key: 'dashboard', label: '📈  Business Dashboard' },
                { key: 'logistics', label: '🌐  Global Logistics Hub' },
                { key: 'blindroom', label: '🔒  Blind Deal Room', special: true },
                { key: 'myposts', label: '📝  My Posts & Listings' },
                { key: 'saved', label: '⭐  Saved / Shortlist' },
                { key: 'plans', label: '👑  Subscription Plans (₹ / $)' },
                { key: 'settings', label: '⚙️  Theme & Settings' },
                { key: 'support', label: '🎧  Contact Us & Support' },
              ].map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={[s.drawerItem, d.special && s.drawerBlindItem]}
                  onPress={() => {
                    setDrawerOpen(false);
                    setOverlayScreen(d.key);
                  }}
                >
                  <Text style={d.special ? s.drawerBlindTxt : s.drawerItemTxt}>{d.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={s.drawerItem} onPress={() => { setDrawerOpen(false); setLoggedIn(false); }}>
                <Text style={[s.drawerItemTxt, { color: '#EF4444' }]}>🚪  Logout</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={s.drawerCloseBtn} onPress={() => setDrawerOpen(false)}>
              <Text style={s.drawerCloseTxt}>Close Menu</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setDrawerOpen(false)} />
        </View>
      </Modal>

      {/* COMMENTS MODAL */}
      <Modal visible={!!commentPost} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[s.modalTitle, { color: T.text }]}>Deal Comments & Quotes</Text>
            <ScrollView style={{ maxHeight: 200, marginBottom: 10 }}>
              {(commentPost?.comments || []).length === 0 ? (
                <Text style={{ color: T.subText, fontSize: 12 }}>No comments yet. Be the first to respond!</Text>
              ) : (
                (commentPost?.comments || []).map((c) => (
                  <View key={c.id} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: T.border }}>
                    <Text style={{ color: T.teal, fontSize: 11, fontWeight: '800' }}>{c.user}</Text>
                    <Text style={{ color: T.text, fontSize: 12 }}>{c.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <TextInput
              style={[s.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]}
              placeholder="Write a comment or quote..."
              placeholderTextColor={T.subText}
              value={commentDraft}
              onChangeText={setCommentDraft}
            />
            <View style={s.rowBetween}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setCommentPost(null)}>
                <Text style={s.cancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleAddComment}>
                <Text style={s.saveText}>Post Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CREATE POST MODAL (+ BUTTON) */}
      <Modal visible={postModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={[s.modalCard, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[s.modalTitle, { color: T.text }]}>Create Trade Post (+25 Pts)</Text>
              <View style={[s.toggleBox, { backgroundColor: T.inputBg, borderColor: T.border }]}>
                {['Buy Requirement', 'Sell Offer'].map((pt) => (
                  <TouchableOpacity key={pt} style={[s.scopeBtn, postIntent === pt && s.scopeBtnActive]} onPress={() => setPostIntent(pt)}>
                    <Text style={{ color: postIntent === pt ? '#FFF' : T.subText, fontSize: 12, fontWeight: '700' }}>{pt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {['Export', 'Import', 'Domestic', 'International', 'Direct Deals', 'Tender / Govt', 'Surplus Lot'].map((sc) => (
                  <TouchableOpacity key={sc} style={[s.chip, { backgroundColor: T.inputBg, borderColor: T.border }, postScope === sc && s.chipActive]} onPress={() => setPostScope(sc)}>
                    <Text style={{ color: postScope === sc ? '#FFF' : T.subText, fontSize: 11 }}>{sc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={[s.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} placeholder="Product / Commodity" placeholderTextColor={T.subText} value={postTitle} onChangeText={setPostTitle} />
              <View style={s.rowBetween}>
                <TextInput style={[s.input, { width: '48%', backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} placeholder="Quantity (e.g. 500)" placeholderTextColor={T.subText} keyboardType="numeric" value={postQty} onChangeText={setPostQty} />
                <View style={{ width: '48%', flexDirection: 'row', flexWrap: 'wrap' }}>
                  {['MT', 'Qtl', '20ft', '40ft'].map((u) => (
                    <TouchableOpacity key={u} style={[s.unitPill, { backgroundColor: T.inputBg, borderColor: T.border }, postUnit === u && s.chipActive]} onPress={() => setPostUnit(u)}>
                      <Text style={{ color: postUnit === u ? '#FFF' : T.subText, fontSize: 11 }}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TextInput style={[s.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} placeholder="Port / Route (e.g. FOB JNPT -> Jebel Ali)" placeholderTextColor={T.subText} value={postPort} onChangeText={setPostPort} />
              <TextInput style={[s.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} placeholder="Target Price (e.g. USD 445 / MT)" placeholderTextColor={T.subText} value={postPrice} onChangeText={setPostPrice} />
              <TextInput style={[s.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]} placeholder="Specs / Packaging" placeholderTextColor={T.subText} value={postDesc} onChangeText={setPostDesc} />
              <View style={s.rowBetween}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setPostModal(false)}>
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={handleCreatePost}>
                  <Text style={s.saveText}>Post Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  teal: { color: '#0D9488' },
  goldBadge: { fontSize: 10, fontWeight: '800', color: '#C9B89A', letterSpacing: 0.7 },
  loginBox: { flex: 1, justifyContent: 'center', padding: 24 },
  loginTitle: { fontSize: 32, fontWeight: '800', color: '#D9DDE3', marginVertical: 8 },
  loginSub: { fontSize: 13, color: '#8A8F98', lineHeight: 20, marginBottom: 24 },
  label: { fontSize: 10, fontWeight: '700', marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 10, padding: 11, fontSize: 13, marginBottom: 10 },
  primaryBtn: { backgroundColor: '#0D9488', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 6 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  segBar: { flexDirection: 'row', paddingHorizontal: 14, paddingTop: 6, borderBottomWidth: 1 },
  segBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  segBtnActive: { borderBottomColor: '#0D9488' },
  segTxt: { fontSize: 13, fontWeight: '700' },
  toggleBox: { flexDirection: 'row', marginHorizontal: 14, marginTop: 10, marginBottom: 6, borderRadius: 10, padding: 4, borderWidth: 1 },
  scopeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  scopeBtnActive: { backgroundColor: '#0D9488' },
  scopeTxt: { fontSize: 12, fontWeight: '700' },
  body: { flex: 1, padding: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 13, marginBottom: 12 },
  traderStrip: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.15)' },
  miniGoldRing: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1B2A' },
  noticeBanner: { backgroundColor: 'rgba(201,184,154,0.12)', borderWidth: 1, borderColor: '#C9B89A', borderRadius: 10, padding: 10, marginBottom: 12 },
  noticeTxt: { color: '#C9B89A', fontSize: 11, lineHeight: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: 'rgba(13,148,136,0.2)' },
  tagText: { fontSize: 10, fontWeight: '800', color: '#14B8A6' },
  intentTag: { fontSize: 11, fontWeight: '600' },
  priceText: { fontSize: 14, fontWeight: '800', color: '#14B8A6' },
  cardTitle: { fontSize: 14, fontWeight: '800', marginTop: 6 },
  specStrip: { borderRadius: 8, padding: 8, marginTop: 8, borderWidth: 1 },
  specStripTxt: { fontSize: 11, marginBottom: 2 },
  cardRoute: { fontSize: 12, marginTop: 4, marginBottom: 8 },
  actionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  miniAction: { paddingVertical: 4, paddingHorizontal: 6 },
  miniActionTxt: { fontSize: 12, fontWeight: '700' },
  waMiniBtn: { backgroundColor: '#16A34A', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 7, alignItems: 'center' },
  waMiniTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  chip: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20, marginRight: 7, marginBottom: 6, borderWidth: 1 },
  unitPill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, marginRight: 4, marginBottom: 4, borderWidth: 1 },
  chipActive: { backgroundColor: '#0D9488', borderColor: '#14B8A6' },
  pctText: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  navBar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 6, paddingBottom: 14, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 16, marginBottom: 2 },
  navText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  navTextActive: { color: '#14B8A6' },
  plusBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0D9488', alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  plusBtnTxt: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: -2 },
  liCover: { height: 110, backgroundColor: '#0D1B2A', padding: 14, justifyContent: 'space-between', flexDirection: 'row' },
  liCoverTag: { color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  liGoldenSideBadge: { backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: '#F59E0B', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  liGoldenSideTxt: { color: '#FBBF24', fontSize: 10, fontWeight: '900' },
  liBody: { paddingHorizontal: 14, marginTop: -34 },
  liAvatarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  liGoldenRing: { width: 74, height: 74, borderRadius: 37, borderWidth: 3, borderColor: '#F59E0B', padding: 2, backgroundColor: '#0D1B2A' },
  liAvatarCircle: { flex: 1, borderRadius: 34, backgroundColor: '#16263A', alignItems: 'center', justifyContent: 'center' },
  liLightningPill: { backgroundColor: 'rgba(245,158,11,0.16)', borderWidth: 1, borderColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  liLightningTxt: { color: '#F59E0B', fontSize: 11, fontWeight: '800' },
  liName: { fontSize: 20, fontWeight: '900' },
  liCompany: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  liRole: { fontSize: 12, marginTop: 2 },
  liStatsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 12 },
  vaultContainer: { flex: 1, padding: 18 },
  vaultHeaderCard: { borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#C9B89A', marginBottom: 14 },
  vaultLockIcon: { fontSize: 34, marginBottom: 6 },
  vaultTitle: { color: '#C9B89A', fontSize: 17, fontWeight: '800', letterSpacing: 1.2 },
  shieldCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 18, borderWidth: 1, marginBottom: 14 },
  shieldTitle: { fontSize: 16, fontWeight: '800' },
  lockBadge: { backgroundColor: '#374151', color: '#C9B89A', fontSize: 10, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  walletAmt: { color: '#14B8A6', fontSize: 32, fontWeight: '800', marginVertical: 6 },
  drawerOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.75)' },
  drawerPanel: { width: '78%', backgroundColor: '#0D1B2A', paddingHorizontal: 16, paddingBottom: 16, borderRightWidth: 1, borderRightColor: '#1E293B' },
  drawerTop: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1E293B', marginBottom: 10 },
  drawerUser: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 3 },
  drawerWallet: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#16263A', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#C9B89A', marginBottom: 10 },
  drawerWalletTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  drawerWalletAmt: { color: '#14B8A6', fontSize: 15, fontWeight: '900' },
  drawerItem: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#16263A' },
  drawerItemTxt: { color: '#D9DDE3', fontSize: 13, fontWeight: '600' },
  drawerBlindItem: { backgroundColor: 'rgba(201,184,154,0.1)', paddingHorizontal: 10, borderRadius: 8 },
  drawerBlindTxt: { color: '#C9B89A', fontSize: 13, fontWeight: '800' },
  drawerCloseBtn: { backgroundColor: '#16263A', padding: 11, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  drawerCloseTxt: { color: '#FFFFFF', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', padding: 16, justifyContent: 'center' },
  modalCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10 },
  cancelBtn: { flex: 1, padding: 12, alignItems: 'center', marginRight: 8, borderRadius: 8, backgroundColor: '#1E293B' },
  cancelText: { color: '#94A3B8', fontWeight: '700' },
  saveBtn: { flex: 1, padding: 12, alignItems: 'center', marginLeft: 8, borderRadius: 8, backgroundColor: '#0D9488' },
  saveText: { color: '#FFFFFF', fontWeight: '800' },
  footerBrand: { textAlign: 'center', fontSize: 11, marginTop: 24 },
});
