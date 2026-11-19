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
  Platform,
} from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import { supabase } from './src/lib/supabase';
import MultiCalculatorScreen from './src/MultiCalculatorScreen';
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
    verified_by: 'Global Agro Exports • Verified',
    likes: 42,
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
    verified_by: 'Mekong Agri Trading • Verified',
    likes: 29,
    isMine: false,
  },
  {
    id: 'seed-3',
    post_type: 'Sell Offer',
    scope: 'Domestic',
    title: 'Fresh Green Cavendish Banana (G9 Export Grade)',
    qty_label: '150 MT • 13 Kg Corrugated Box',
    route_port: 'Ex-Farm MH / MP -> Mundra / JNPT',
    price: 'INR 1,850 / Quintal',
    verified_by: 'Sahyadri Fresh Farms • Verified',
    likes: 35,
    isMine: false,
  },
  {
    id: 'seed-4',
    post_type: 'Sell Offer',
    scope: 'International',
    title: 'HMT & Swarna Steam Rice (Silky Sortex)',
    qty_label: '500 MT • 25 Kg / 50 Kg Bags',
    route_port: 'Raipur Mill -> Export / Domestic',
    price: 'INR 3,580 / Quintal',
    verified_by: 'Chhattisgarh Rice Mills • Verified',
    likes: 51,
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
  { id: 'm7', marketType: 'Domestic', category: 'Spices', commodity: 'Cumin (Jeera)', mandi: 'Unjha, GJ', rate: 'INR 25,400 / Qtl', change_pct: '-0.5%', is_up: false },
  { id: 'm8', marketType: 'International', category: 'Grains', commodity: '5% Broken White Rice', mandi: 'FOB Ho Chi Minh, Vietnam', rate: 'USD 515 / MT', change_pct: '+0.7%', is_up: true },
  { id: 'm9', marketType: 'International', category: 'Grains', commodity: 'Parboiled Rice 5%', mandi: 'FOB Bangkok, Thailand', rate: 'USD 528 / MT', change_pct: '+0.4%', is_up: true },
  { id: 'm10', marketType: 'International', category: 'Grains', commodity: 'Yellow Corn FOB', mandi: 'Santos Port, Brazil', rate: 'USD 218 / MT', change_pct: '-0.3%', is_up: false },
  { id: 'm11', marketType: 'International', category: 'Spices', commodity: 'Black Pepper 550 GL', mandi: 'CIF Jebel Ali, UAE', rate: 'USD 6,450 / MT', change_pct: '+1.5%', is_up: true },
  { id: 'm12', marketType: 'International', category: 'Pulses', commodity: 'Red Lentils (Masoor)', mandi: 'FOB Mersin, Turkey', rate: 'USD 740 / MT', change_pct: '+0.5%', is_up: true },
];

const TOP_PAD = Platform.OS === 'android' ? (StatusBar.currentHeight || 26) : 0;

export default function App() {
  const [booting, setBooting] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // Navigation & Drawer Overlays
  const [tab, setTab] = useState('feed');
  const [drawerOpen, setDrawerOpen] = useState(false);
  // overlayScreen: null | 'logistics' | 'blindroom' | 'wallet' | 'profile' | 'dashboard' | 'myposts' | 'saved' | 'plans' | 'settings' | 'support'
  const [overlayScreen, setOverlayScreen] = useState(null);
  const [walletBalance] = useState(500);

  // User Profile State
  const [userName, setUserName] = useState('Najeeb Javed');
  const [companyName, setCompanyName] = useState('Trade SETUU Overseas');
  const [userRole, setUserRole] = useState('Exporter & Importer');
  const [userIec, setUserIec] = useState('AAACT1234F');
  const [userGst, setUserGst] = useState('22AAACT1234F1Z5');
  const [activePlan, setActivePlan] = useState('Free Ecosystem Plan');
  const [prefCurrency, setPrefCurrency] = useState('USD / INR');
  const [prefUnit, setPrefUnit] = useState('Metric Ton (MT)');

  // Feed States
  const [feedSubTab, setFeedSubTab] = useState('Post Feed');
  const [feedFilter, setFeedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [feed, setFeed] = useState(INITIAL_FEED);
  const [likedIds, setLikedIds] = useState({});
  const [savedIds, setSavedIds] = useState({ 'seed-1': true });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mandi States
  const [mandiScope, setMandiScope] = useState('Domestic');
  const [mandiCat, setMandiCat] = useState('All');
  const [mandiList, setMandiList] = useState(MANDI_DATA);

  // Create Post Modal (+ Button)
  const [postModal, setPostModal] = useState(false);
  const [postIntent, setPostIntent] = useState('Sell Offer'); // 'Buy Requirement' | 'Sell Offer'
  const [postScope, setPostScope] = useState('Export'); // 'Export' | 'Import' | 'Domestic' | 'International'
  const [postTitle, setPostTitle] = useState('');
  const [postQty, setPostQty] = useState('');
  const [postUnit, setPostUnit] = useState('MT');
  const [postPort, setPostPort] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postDesc, setPostDesc] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

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
          likes: d.likes || 14,
        }));
        setFeed([...normalized, ...INITIAL_FEED]);
      }
      if (mRes.data && mRes.data.length > 0) {
        const normMandi = mRes.data.map((m) => ({
          ...m,
          marketType: m.marketType || 'Domestic',
        }));
        setMandiList([...normMandi, ...MANDI_DATA]);
      }
    } catch (e) {}
    setLoading(false);
    setRefreshing(false);
  }

  const toggleLike = (id) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id) => {
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
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
      verified_by: companyName + ' • Verified',
      likes: 1,
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

    try {
      await supabase.from('trade_feed').insert([
        {
          post_type: postScope,
          title: newItem.title,
          route_port: newItem.route_port,
          price: newItem.price,
          verified_by: newItem.verified_by,
        },
      ]);
    } catch (e) {}
  }

  if (booting) return <SplashScreen />;

  if (!loggedIn) {
    return (
      <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
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
            style={s.input}
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
                style={s.input}
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

  // --- DRAWER OVERLAY SCREENS ---
  if (overlayScreen) {
    const renderOverlayHeader = (title) => (
      <View style={s.overlayBar}>
        <TouchableOpacity onPress={() => setOverlayScreen(null)} style={s.backPill}>
          <Text style={s.backPillTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.overlayBarTitle}>{title}</Text>
      </View>
    );

    if (overlayScreen === 'logistics') {
      return (
        <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
          {renderOverlayHeader('Global Logistics Hub')}
          <LogisticsHubScreen />
        </SafeAreaView>
      );
    }

    // STRICTLY LOCKED BLIND DEAL ROOM: ONLY Jugaad Shield & The Neutral Lock + Lock Popup
    if (overlayScreen === 'blindroom') {
      const openVaultAlert = (optName) => {
        Alert.alert(
          '🔒 ' + optName + ' — Locked',
          'Blind Deal Room is strictly sealed. Access unlocks only after escrow & compliance verification.'
        );
      };
      return (
        <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
          {renderOverlayHeader('BLIND DEAL ROOM 🔒')}
          <View style={s.vaultContainer}>
            <View style={s.vaultHeaderCard}>
              <Text style={s.vaultLockIcon}>🔒</Text>
              <Text style={s.vaultTitle}>BLIND DEAL ROOM</Text>
            </View>

            <TouchableOpacity
              style={s.shieldCard}
              onPress={() => openVaultAlert('Jugaad Shield')}
            >
              <Text style={s.shieldTitle}>🛡️  Jugaad Shield</Text>
              <Text style={s.lockBadge}>LOCKED</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.shieldCard}
              onPress={() => openVaultAlert('The Neutral Lock')}
            >
              <Text style={s.shieldTitle}>🔐  The Neutral Lock</Text>
              <Text style={s.lockBadge}>LOCKED</Text>
            </TouchableOpacity>

            <Text style={s.footerBrand}>Powered by Apex Sync Technologies</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (overlayScreen === 'wallet') {
      return (
        <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
          {renderOverlayHeader('Wallet & Credits')}
          <ScrollView style={{ padding: 16 }}>
            <View style={s.walletBigCard}>
              <Text style={s.goldBadge}>AVAILABLE TRADE CREDITS</Text>
              <Text style={s.walletAmt}>₹ {walletBalance}.00</Text>
              <Text style={s.cardRoute}>
                Surprise Box (₹500 / ₹1,500) bonus reward unlocks after final KYC setup.
              </Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>Ledger Summary</Text>
              <Text style={s.cardRoute}>• Ecosystem Onboarding Credit: +₹500.00</Text>
              <Text style={s.cardRoute}>• Trade Document Generator: Unlimited Free</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    if (overlayScreen === 'profile') {
      return (
        <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
          {renderOverlayHeader('My Profile & KYC')}
          <ScrollView style={{ padding: 16 }}>
            <View style={s.card}>
              <Text style={s.label}>FULL NAME</Text>
              <TextInput style={s.input} value={userName} onChangeText={setUserName} />
              <Text style={s.label}>COMPANY / FIRM NAME</Text>
              <TextInput style={s.input} value={companyName} onChangeText={setCompanyName} />
              <Text style={s.label}>TRADE ROLE</Text>
              <TextInput style={s.input} value={userRole} onChangeText={setUserRole} />
              <Text style={s.label}>IEC NUMBER</Text>
              <TextInput style={s.input} value={userIec} onChangeText={setUserIec} />
              <Text style={s.label}>GSTIN</Text>
              <TextInput style={s.input} value={userGst} onChangeText={setUserGst} />
              <TouchableOpacity
                style={s.primaryBtn}
                onPress={() => Alert.alert('Profile Saved', 'Business KYC details updated.')}
              >
                <Text style={s.primaryBtnText}>Save Profile & KYC</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    if (overlayScreen === 'dashboard') {
      const myCount = feed.filter((x) => x.isMine).length;
      const savedCount = Object.values(savedIds).filter(Boolean).length;
      return (
        <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
          {renderOverlayHeader('Business Dashboard')}
          <ScrollView style={{ padding: 16 }}>
            <View style={s.dashGrid}>
              <View style={s.dashBox}>
                <Text style={s.dashNum}>{feed.length}</Text>
                <Text style={s.dashLbl}>Live Market Leads</Text>
              </View>
              <View style={s.dashBox}>
                <Text style={s.dashNum}>{myCount}</Text>
                <Text style={s.dashLbl}>My Active Posts</Text>
              </View>
              <View style={s.dashBox}>
                <Text style={s.dashNum}>{savedCount}</Text>
                <Text style={s.dashLbl}>Saved Shortlist</Text>
              </View>
              <View style={s.dashBox}>
                <Text style={s.dashNum}>₹{walletBalance}</Text>
                <Text style={s.dashLbl}>Wallet Credits</Text>
              </View>
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>{companyName}</Text>
              <Text style={s.cardRoute}>Role: {userRole} • IEC: {userIec}</Text>
              <Text style={s.verifiedText}>Active Tier: {activePlan}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    if (overlayScreen === 'myposts') {
      const myItems = feed.filter((x) => x.isMine);
      return (
        <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
          {renderOverlayHeader('My Posts & Listings')}
          <ScrollView style={{ padding: 16 }}>
            {myItems.length === 0 ? (
              <View style={s.card}>
                <Text style={s.cardTitle}>No Posts Published Yet</Text>
                <Text style={s.cardRoute}>
                  Tap the center (+) button on the bottom bar to publish your Buy Requirement or Sell Offer.
                </Text>
              </View>
            ) : (
              myItems.map((item) => (
                <View key={item.id} style={s.card}>
                  <Text style={s.goldBadge}>{item.post_type} • {item.scope}</Text>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  <Text style={s.cardRoute}>{item.route_port} • {item.price}</Text>
                  <TouchableOpacity
                    style={[s.inquireBtn, { alignSelf: 'flex-start' }]}
                    onPress={() => setFeed(feed.filter((f) => f.id !== item.id))}
                  >
                    <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>Delete Post</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    if (overlayScreen === 'saved') {
      const savedList = feed.filter((x) => savedIds[x.id]);
      return (
        <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
          {renderOverlayHeader('Saved / Shortlist')}
          <ScrollView style={{ padding: 16 }}>
            {savedList.length === 0 ? (
              <View style={s.card}>
                <Text style={s.cardTitle}>No Shortlisted Deals</Text>
                <Text style={s.cardRoute}>Tap ☆ Save on any feed post to bookmark it here.</Text>
              </View>
            ) : (
              savedList.map((item) => (
                <View key={item.id} style={s.card}>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  <Text style={s.cardRoute}>{item.route_port} • {item.price}</Text>
                  <TouchableOpacity onPress={() => toggleSave(item.id)}>
                    <Text style={{ color: '#C9B89A', fontSize: 12, fontWeight: '700' }}>Remove from Shortlist</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    if (overlayScreen === 'plans') {
      const plans = [
        { name: 'Free Ecosystem Plan', price: '₹ 0 / Forever', desc: 'Feed, Mandi Live, 7-in-1 Calculator & Trade Doc Maker' },
        { name: 'Domestic Gold Exporter', price: '₹ 1,499 / Month', desc: 'Priority RFQs, Verified Badge & Direct Buyer Contacts' },
        { name: 'International Global Pro', price: '$ 29 / Month', desc: 'Global Importer Leads, Logistics Priority & Multi-Currency Desk' },
      ];
      return (
        <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
          {renderOverlayHeader('Membership Plans')}
          <ScrollView style={{ padding: 16 }}>
            {plans.map((p) => (
              <View key={p.name} style={s.card}>
                <View style={s.rowBetween}>
                  <Text style={s.cardTitle}>{p.name}</Text>
                  <Text style={s.priceText}>{p.price}</Text>
                </View>
                <Text style={s.cardRoute}>{p.desc}</Text>
                <TouchableOpacity
                  style={s.primaryBtn}
                  onPress={() => {
                    setActivePlan(p.name);
                    Alert.alert('Plan Selected', p.name + ' activated on your profile.');
                  }}
                >
                  <Text style={s.primaryBtnText}>
                    {activePlan === p.name ? '✓ Active Plan' : 'Select Plan'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      );
    }

    if (overlayScreen === 'settings') {
      return (
        <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
          {renderOverlayHeader('App Settings')}
          <ScrollView style={{ padding: 16 }}>
            <View style={s.card}>
              <Text style={s.label}>DEFAULT CURRENCY PAIR</Text>
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                {['USD / INR', 'AED / INR', 'EUR / USD'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[s.chip, prefCurrency === c && s.chipActive]}
                    onPress={() => setPrefCurrency(c)}
                  >
                    <Text style={[s.chipText, prefCurrency === c && s.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.label}>DEFAULT WEIGHT UNIT</Text>
              <View style={{ flexDirection: 'row' }}>
                {['Metric Ton (MT)', 'Quintal (100 Kg)'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[s.chip, prefUnit === u && s.chipActive]}
                    onPress={() => setPrefUnit(u)}
                  >
                    <Text style={[s.chipText, prefUnit === u && s.chipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    if (overlayScreen === 'support') {
      return (
        <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
          {renderOverlayHeader('Help & Support')}
          <ScrollView style={{ padding: 16 }}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Trade SETUU Support Desk</Text>
              <Text style={s.cardRoute}>
                Need assistance with Export Documentation, CHA Clearance, Freight Quotes, or Account KYC?
              </Text>
              <TouchableOpacity
                style={s.primaryBtn}
                onPress={() =>
                  Share.share({
                    message: 'Hello Trade SETUU Support Team, I need trade assistance for ' + companyName,
                  })
                }
              >
                <Text style={s.primaryBtnText}>Connect with Trade Support</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }
  }

  // Filtered Feed
  const visibleFeed = feed.filter((item) => {
    const matchesFilter =
      feedFilter === 'All' ||
      (item.scope && item.scope.toLowerCase() === feedFilter.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.route_port.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered Mandi
  const visibleMandi = mandiList.filter((m) => {
    const scopeOk = m.marketType === mandiScope;
    const catOk = mandiCat === 'All' || m.category === mandiCat;
    return scopeOk && catOk;
  });

  return (
    <SafeAreaView style={[s.root, { paddingTop: TOP_PAD }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />

      {/* UNIFIED TOP HEADER WITH CIRCULAR 'TS' LOGO */}
      <View style={s.header}>
        <TouchableOpacity style={s.menuBtn} onPress={() => setDrawerOpen(true)}>
          <Text style={s.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={s.brandCenter}>
          <View style={s.tsOrbit}>
            <Text style={s.tsLogoTxt}>TS</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>
              Trade <Text style={s.teal}>SETUU</Text>
            </Text>
            <Text style={s.headerSub}>Global Trade & Logistics Ecosystem</Text>
          </View>
        </View>

        <TouchableOpacity
          style={s.walletPill}
          onPress={() => setOverlayScreen('wallet')}
        >
          <Text style={s.walletPillTxt}>₹{walletBalance}</Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: HOME (POST FEED | MARKET | EXIM NEWS) — NO LOGISTICS BANNER */}
      {tab === 'feed' && (
        <View style={{ flex: 1 }}>
          <View style={s.searchWrap}>
            <TextInput
              style={s.searchInput}
              placeholder="Search products, ports, companies, RFQ..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={s.segBar}>
            {['Post Feed', 'Market', 'Exim News'].map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => setFeedSubTab(st)}
                style={[s.segBtn, feedSubTab === st && s.segBtnActive]}
              >
                <Text style={[s.segTxt, feedSubTab === st && s.segTxtActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={s.body}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchAllData();
                }}
                tintColor="#0D9488"
              />
            }
          >
            {feedSubTab === 'Post Feed' && (
              <View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 12 }}
                >
                  {['All', 'Import', 'Export', 'Domestic', 'International'].map(
                    (f) => (
                      <TouchableOpacity
                        key={f}
                        style={[s.chip, feedFilter === f && s.chipActive]}
                        onPress={() => setFeedFilter(f)}
                      >
                        <Text
                          style={[
                            s.chipText,
                            feedFilter === f && s.chipTextActive,
                          ]}
                        >
                          {f}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>

                {loading && !refreshing ? (
                  <ActivityIndicator color="#0D9488" style={{ marginTop: 20 }} />
                ) : (
                  visibleFeed.map((item) => {
                    const isLiked = !!likedIds[item.id];
                    const isSaved = !!savedIds[item.id];
                    return (
                      <View key={item.id} style={s.card}>
                        <View style={s.rowBetween}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={s.tag}>
                              <Text style={s.tagText}>{item.scope.toUpperCase()}</Text>
                            </View>
                            <Text style={s.intentTag}>  • {item.post_type}</Text>
                          </View>
                          <Text style={s.priceText}>{item.price}</Text>
                        </View>

                        <Text style={s.cardTitle}>{item.title}</Text>

                        <View style={s.specStrip}>
                          <Text style={s.specStripTxt}>📦 {item.qty_label}</Text>
                          <Text style={s.specStripTxt}>🚢 {item.route_port}</Text>
                        </View>

                        <Text style={s.verifiedText}>{item.verified_by}</Text>

                        <View style={s.actionBar}>
                          <TouchableOpacity
                            style={s.miniAction}
                            onPress={() => toggleLike(item.id)}
                          >
                            <Text style={[s.miniActionTxt, isLiked && { color: '#EF4444' }]}>
                              {isLiked ? '♥' : '♡'} {(item.likes || 12) + (isLiked ? 1 : 0)}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={s.miniAction}
                            onPress={() => toggleSave(item.id)}
                          >
                            <Text style={[s.miniActionTxt, isSaved && { color: '#C9B89A' }]}>
                              {isSaved ? '★ Saved' : '☆ Save'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={s.inquireBtn}
                            onPress={() =>
                              Share.share({
                                message:
                                  'TRADE SETUU DEAL INQUIRY:\n' +
                                  item.title +
                                  '\nSpec: ' +
                                  item.qty_label +
                                  '\nRoute: ' +
                                  item.route_port +
                                  '\nTarget: ' +
                                  item.price,
                              })
                            }
                          >
                            <Text style={s.inquireText}>Request Quote →</Text>
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
                <Text style={s.secTitle}>LIVE COMMODITY & CURRENCY BENCHMARKS</Text>
                <View style={s.card}>
                  <View style={s.rowBetween}>
                    <Text style={s.cardTitle}>USD / INR Spot Reference</Text>
                    <Text style={s.priceText}>₹ 84.50</Text>
                  </View>
                  <Text style={s.cardRoute}>
                    AED: ₹23.01  |  EUR: ₹91.85  |  SAR: ₹22.53  |  VND: 25,400/$
                  </Text>
                </View>

                {mandiList.slice(0, 5).map((m) => (
                  <View key={m.id} style={s.card}>
                    <View style={s.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.goldBadge}>{m.marketType.toUpperCase()} • {m.category}</Text>
                        <Text style={s.cardTitle}>{m.commodity}</Text>
                        <Text style={s.cardRoute}>{m.mandi}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={s.priceText}>{m.rate}</Text>
                        <Text style={[s.pctText, { color: m.is_up ? '#10B981' : '#EF4444' }]}>
                          {m.change_pct}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={s.primaryBtn}
                  onPress={() => setTab('mandi')}
                >
                  <Text style={s.primaryBtnText}>View Full Mandi Live →</Text>
                </TouchableOpacity>
              </View>
            )}

            {feedSubTab === 'Exim News' && (
              <View>
                <Text style={s.secTitle}>LATEST IMPORT-EXPORT & DGFT NEWS</Text>
                {EXIM_NEWS.map((news) => (
                  <View key={news.id} style={s.card}>
                    <View style={s.rowBetween}>
                      <Text style={s.goldBadge}>{news.tag}</Text>
                      <Text style={s.headerSub}>{news.time}</Text>
                    </View>
                    <Text style={s.cardTitle}>{news.title}</Text>
                    <Text style={s.cardRoute}>{news.summary}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      )}

      {/* TAB 2: MANDI LIVE UPDATES */}
      {tab === 'mandi' && (
        <View style={{ flex: 1 }}>
          <View style={s.toggleBox}>
            {['Domestic', 'International'].map((sc) => (
              <TouchableOpacity
                key={sc}
                onPress={() => setMandiScope(sc)}
                style={[s.scopeBtn, mandiScope === sc && s.scopeBtnActive]}
              >
                <Text
                  style={[s.scopeTxt, mandiScope === sc && s.scopeTxtActive]}
                >
                  {sc === 'Domestic' ? 'Domestic (India)' : 'International FOB/CIF'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={s.body}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
            >
              {['All', 'Grains', 'Pulses', 'Oilseeds', 'Spices'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[s.chip, mandiCat === cat && s.chipActive]}
                  onPress={() => setMandiCat(cat)}
                >
                  <Text
                    style={[
                      s.chipText,
                      mandiCat === cat && s.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {visibleMandi.map((item) => (
              <View key={item.id} style={s.card}>
                <View style={s.rowBetween}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={s.cardTitle}>{item.commodity}</Text>
                    <Text style={s.cardRoute}>{item.mandi}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.priceText}>{item.rate}</Text>
                    <Text
                      style={[
                        s.pctText,
                        { color: item.is_up ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {item.change_pct}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      )}

      {/* TAB 4: 7-IN-1 MULTI CALCULATOR */}
      {tab === 'calc' && <MultiCalculatorScreen />}

      {/* TAB 5: SERVICE HUB */}
      {tab === 'services' && (
        <ServiceHubScreen
          onOpenLogistics={() => setOverlayScreen('logistics')}
        />
      )}

      {/* 5 BOTTOM NAVIGATION TABS WITH ICONS & SAFE PADDING */}
      <View style={s.navBar}>
        <TouchableOpacity style={s.navItem} onPress={() => setTab('feed')}>
          <Text style={s.navIcon}>🏠</Text>
          <Text style={[s.navText, tab === 'feed' && s.navTextActive]}>Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem} onPress={() => setTab('mandi')}>
          <Text style={s.navIcon}>📊</Text>
          <Text style={[s.navText, tab === 'mandi' && s.navTextActive]}>Mandi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.plusBtn}
          onPress={() => setPostModal(true)}
        >
          <Text style={s.plusBtnTxt}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem} onPress={() => setTab('calc')}>
          <Text style={s.navIcon}>🧮</Text>
          <Text style={[s.navText, tab === 'calc' && s.navTextActive]}>
            Calculator
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem} onPress={() => setTab('services')}>
          <Text style={s.navIcon}>🛎️</Text>
          <Text style={[s.navText, tab === 'services' && s.navTextActive]}>
            Services
          </Text>
        </TouchableOpacity>
      </View>

      {/* COMPLETE SIDE DRAWER (NO JOB RECRUITMENT) */}
      <Modal visible={drawerOpen} transparent animationType="fade">
        <View style={s.drawerOverlay}>
          <View style={[s.drawerPanel, { paddingTop: TOP_PAD + 10 }]}>
            <View style={s.drawerTop}>
              <Text style={s.drawerUser}>{userName}</Text>
              <Text style={s.goldBadge}>{userRole} • {companyName}</Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
              <TouchableOpacity
                style={s.drawerWallet}
                onPress={() => {
                  setDrawerOpen(false);
                  setOverlayScreen('wallet');
                }}
              >
                <Text style={s.drawerWalletTitle}>💰 Wallet & Credits</Text>
                <Text style={s.drawerWalletAmt}>₹ {walletBalance}</Text>
              </TouchableOpacity>

              {[
                { key: 'profile', label: '👤  My Profile & KYC' },
                { key: 'dashboard', label: '📈  Business Dashboard' },
                { key: 'logistics', label: '🌐  Global Logistics Hub' },
                { key: 'blindroom', label: '🔒  Blind Deal Room', special: true },
                { key: 'myposts', label: '📝  My Posts & Listings' },
                { key: 'saved', label: '⭐  Saved / Shortlist' },
                { key: 'plans', label: '👑  Subscription Plans' },
                { key: 'settings', label: '⚙️  Settings' },
                { key: 'support', label: '🎧  Help & Support' },
              ].map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={[s.drawerItem, d.special && s.drawerBlindItem]}
                  onPress={() => {
                    setDrawerOpen(false);
                    setOverlayScreen(d.key);
                  }}
                >
                  <Text style={d.special ? s.drawerBlindTxt : s.drawerItemTxt}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={s.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  setLoggedIn(false);
                }}
              >
                <Text style={[s.drawerItemTxt, { color: '#EF4444' }]}>
                  🚪  Logout
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={s.drawerCloseBtn}
              onPress={() => setDrawerOpen(false)}
            >
              <Text style={s.drawerCloseTxt}>Close Menu</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setDrawerOpen(false)}
          />
        </View>
      </Modal>

      {/* FULL CREATE POST MODAL (+ BUTTON) */}
      <Modal visible={postModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>Create Trade Post</Text>

              <Text style={s.label}>POST TYPE</Text>
              <View style={s.toggleBox}>
                {['Buy Requirement', 'Sell Offer'].map((pt) => (
                  <TouchableOpacity
                    key={pt}
                    style={[s.scopeBtn, postIntent === pt && s.scopeBtnActive]}
                    onPress={() => setPostIntent(pt)}
                  >
                    <Text style={[s.scopeTxt, postIntent === pt && s.scopeTxtActive]}>
                      {pt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>MARKET SCOPE</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {['Export', 'Import', 'Domestic', 'International'].map((sc) => (
                  <TouchableOpacity
                    key={sc}
                    style={[s.chip, postScope === sc && s.chipActive]}
                    onPress={() => setPostScope(sc)}
                  >
                    <Text
                      style={[
                        s.chipText,
                        postScope === sc && s.chipTextActive,
                      ]}
                    >
                      {sc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={s.input}
                placeholder="Product / Commodity (e.g. IR 64 Parboiled Rice)"
                placeholderTextColor="#6B7280"
                value={postTitle}
                onChangeText={setPostTitle}
              />

              <View style={s.rowBetween}>
                <TextInput
                  style={[s.input, { width: '48%' }]}
                  placeholder="Quantity (e.g. 500)"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  value={postQty}
                  onChangeText={setPostQty}
                />
                <View style={{ width: '48%', flexDirection: 'row', flexWrap: 'wrap' }}>
                  {['MT', 'Qtl', '20ft', '40ft'].map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[s.unitPill, postUnit === u && s.chipActive]}
                      onPress={() => setPostUnit(u)}
                    >
                      <Text style={s.chipText}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                style={s.input}
                placeholder="Origin / Destination Port (e.g. FOB JNPT -> Jebel Ali)"
                placeholderTextColor="#6B7280"
                value={postPort}
                onChangeText={setPostPort}
              />

              <TextInput
                style={s.input}
                placeholder="Target Price (e.g. USD 445 / MT)"
                placeholderTextColor="#6B7280"
                value={postPrice}
                onChangeText={setPostPrice}
              />

              <TextInput
                style={s.input}
                placeholder="Specs / Packaging (e.g. 5% Broken, 50kg PP Bag)"
                placeholderTextColor="#6B7280"
                value={postDesc}
                onChangeText={setPostDesc}
              />

              <View style={s.rowBetween}>
                <TouchableOpacity
                  style={s.cancelBtn}
                  onPress={() => setPostModal(false)}
                >
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
  root: { flex: 1, backgroundColor: '#0B0D12' },
  teal: { color: '#0D9488' },
  goldBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C9B89A',
    letterSpacing: 0.8,
  },
  loginBox: { flex: 1, justifyContent: 'center', padding: 24 },
  loginTitle: { fontSize: 32, fontWeight: '800', color: '#D9DDE3', marginVertical: 8 },
  loginSub: { fontSize: 13, color: '#8A8F98', lineHeight: 20, marginBottom: 24 },
  label: { fontSize: 10, fontWeight: '700', color: '#8A8F98', marginBottom: 5 },
  input: {
    backgroundColor: '#141821',
    borderWidth: 1,
    borderColor: '#232936',
    borderRadius: 10,
    padding: 11,
    color: '#D9DDE3',
    fontSize: 13,
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F2B',
  },
  menuBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#141821',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#232936',
  },
  menuIcon: { color: '#D9DDE3', fontSize: 18, fontWeight: '800' },
  brandCenter: { flexDirection: 'row', alignItems: 'center' },
  tsOrbit: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#121824',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tsLogoTxt: { color: '#D9DDE3', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#D9DDE3' },
  headerSub: { fontSize: 10, color: '#8A8F98' },
  walletPill: {
    backgroundColor: '#1A202C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C9B89A',
  },
  walletPillTxt: { color: '#C9B89A', fontWeight: '800', fontSize: 12 },
  searchWrap: { paddingHorizontal: 14, paddingTop: 10 },
  searchInput: {
    backgroundColor: '#12161F',
    borderWidth: 1,
    borderColor: '#232936',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#D9DDE3',
    fontSize: 13,
  },
  segBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F2B',
  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segBtnActive: { borderBottomColor: '#0D9488' },
  segTxt: { color: '#8A8F98', fontSize: 13, fontWeight: '700' },
  segTxtActive: { color: '#D9DDE3' },
  toggleBox: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: '#12161F',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#232936',
  },
  scopeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  scopeBtnActive: { backgroundColor: '#0D9488' },
  scopeTxt: { color: '#8A8F98', fontSize: 12, fontWeight: '700' },
  scopeTxtActive: { color: '#FFFFFF' },
  body: { flex: 1, padding: 14 },
  secTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8F98',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#12161F',
    borderWidth: 1,
    borderColor: '#1E2430',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: 'rgba(13,148,136,0.2)',
  },
  tagText: { fontSize: 10, fontWeight: '800', color: '#14B8A6' },
  intentTag: { fontSize: 11, color: '#8A8F98', fontWeight: '600' },
  priceText: { fontSize: 14, fontWeight: '800', color: '#14B8A6' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#D9DDE3', marginTop: 6 },
  specStrip: {
    backgroundColor: '#0B0D12',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1A202C',
  },
  specStripTxt: { color: '#D9DDE3', fontSize: 11, marginBottom: 2 },
  cardRoute: { fontSize: 12, color: '#8A8F98', marginTop: 4, marginBottom: 8 },
  verifiedText: { fontSize: 11, color: '#C9B89A', fontWeight: '600', marginTop: 8 },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1A1F2B',
  },
  miniAction: { paddingVertical: 4, paddingHorizontal: 8 },
  miniActionTxt: { color: '#8A8F98', fontSize: 12, fontWeight: '700' },
  inquireBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inquireText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#141821',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#232936',
  },
  unitPill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#141821',
    marginRight: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#232936',
  },
  chipActive: { backgroundColor: '#0D9488', borderColor: '#14B8A6' },
  chipText: { color: '#8A8F98', fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: '#FFFFFF' },
  pctText: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1A1F2B',
    backgroundColor: '#0E1118',
    paddingTop: 6,
    paddingBottom: 14,
    alignItems: 'center',
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 16, marginBottom: 2 },
  navText: { fontSize: 10, fontWeight: '700', color: '#8A8F98' },
  navTextActive: { color: '#14B8A6' },
  plusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  plusBtnTxt: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: -2 },
  overlayBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2430',
  },
  backPill: {
    backgroundColor: '#1A202C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  backPillTxt: { color: '#C9B89A', fontWeight: '700', fontSize: 12 },
  overlayBarTitle: { color: '#D9DDE3', fontSize: 16, fontWeight: '800' },
  vaultContainer: { flex: 1, padding: 18 },
  vaultHeaderCard: {
    backgroundColor: '#121620',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C9B89A',
    marginBottom: 18,
  },
  vaultLockIcon: { fontSize: 34, marginBottom: 6 },
  vaultTitle: { color: '#C9B89A', fontSize: 17, fontWeight: '800', letterSpacing: 1.2 },
  shieldCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121620',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#262D3D',
    marginBottom: 14,
  },
  shieldTitle: { color: '#D9DDE3', fontSize: 16, fontWeight: '800' },
  lockBadge: {
    backgroundColor: '#374151',
    color: '#C9B89A',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  walletBigCard: {
    backgroundColor: '#121620',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#C9B89A',
    marginBottom: 14,
  },
  walletAmt: { color: '#14B8A6', fontSize: 32, fontWeight: '800', marginVertical: 6 },
  dashGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dashBox: {
    width: '48%',
    backgroundColor: '#12161F',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#232936',
    marginBottom: 12,
    alignItems: 'center',
  },
  dashNum: { color: '#14B8A6', fontSize: 22, fontWeight: '800' },
  dashLbl: { color: '#8A8F98', fontSize: 11, marginTop: 4 },
  drawerOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.75)' },
  drawerPanel: {
    width: '78%',
    backgroundColor: '#0E1118',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderRightWidth: 1,
    borderRightColor: '#232936',
  },
  drawerTop: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2430',
    marginBottom: 10,
  },
  drawerUser: { color: '#D9DDE3', fontSize: 17, fontWeight: '800', marginBottom: 3 },
  drawerWallet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#141821',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C9B89A',
    marginBottom: 10,
  },
  drawerWalletTitle: { color: '#D9DDE3', fontSize: 13, fontWeight: '700' },
  drawerWalletAmt: { color: '#14B8A6', fontSize: 15, fontWeight: '800' },
  drawerItem: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#161B26',
  },
  drawerItemTxt: { color: '#D9DDE3', fontSize: 13, fontWeight: '600' },
  drawerBlindItem: {
    backgroundColor: 'rgba(201,184,154,0.08)',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  drawerBlindTxt: { color: '#C9B89A', fontSize: 13, fontWeight: '800' },
  drawerCloseBtn: {
    backgroundColor: '#1A202C',
    padding: 11,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  drawerCloseTxt: { color: '#D9DDE3', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#12161F',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#232936',
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#D9DDE3', marginBottom: 10 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#1A202C',
  },
  cancelText: { color: '#8A8F98', fontWeight: '700' },
  saveBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#0D9488',
  },
  saveText: { color: '#FFFFFF', fontWeight: '800' },
  footerBrand: {
    textAlign: 'center',
    color: '#8A8F98',
    fontSize: 11,
    marginTop: 24,
  },
});
