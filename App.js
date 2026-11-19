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
} from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import { supabase } from './src/lib/supabase';
import MultiCalculatorScreen from './src/MultiCalculatorScreen';
import LogisticsHubScreen from './src/LogisticsHubScreen';
import ServiceHubScreen from './src/ServiceHubScreen';

const INITIAL_FEED = [
  {
    id: 'seed-1',
    post_type: 'Export',
    scope: 'International',
    title: 'Indian Non-Basmati Parboiled Rice (5% Broken) — 2,500 MT',
    route_port: 'FOB JNPT / Vizag -> Jebel Ali & West Africa',
    price: 'USD 465 / MT',
    verified_by: 'Global Agro Exports • Verified Exporter',
  },
  {
    id: 'seed-2',
    post_type: 'Buy',
    scope: 'Import',
    title: 'Urgent Requirement: Yellow Maize Feed Grade — 1,000 MT',
    route_port: 'CIF Cat Lai Port, Vietnam',
    price: 'USD 268 / MT',
    verified_by: 'Mekong Agri Trading • Verified Buyer',
  },
  {
    id: 'seed-3',
    post_type: 'Sell',
    scope: 'Domestic',
    title: 'Fresh Green Cavendish Banana (G9 Export Quality) — 150 MT',
    route_port: 'Ex-Farm Maharashtra / MP -> Mundra / JNPT',
    price: 'INR 1,850 / Quintal',
    verified_by: 'Sahyadri Fresh Farms • Verified',
  },
  {
    id: 'seed-4',
    post_type: 'Sell',
    scope: 'Domestic',
    title: 'HMT & Swarna Steam Rice (Silky Sortex) — 500 MT Ready',
    route_port: 'Raipur / Dhamtari Mill Delivery',
    price: 'INR 3,580 / Quintal',
    verified_by: 'Chhattisgarh Rice Mills • Verified',
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

export default function App() {
  const [booting, setBooting] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // Navigation & Overlays
  const [tab, setTab] = useState('feed');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [overlayScreen, setOverlayScreen] = useState(null); // 'logistics' | 'blindroom' | 'wallet'
  const [walletBalance] = useState(500);

  // Feed States
  const [feedSubTab, setFeedSubTab] = useState('Post Feed'); // 'Post Feed' | 'Market' | 'Exim News'
  const [feedFilter, setFeedFilter] = useState('All'); // 'All' | 'Import' | 'Export' | 'Domestic' | 'International'
  const [searchQuery, setSearchQuery] = useState('');
  const [feed, setFeed] = useState(INITIAL_FEED);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mandi States
  const [mandiScope, setMandiScope] = useState('Domestic'); // 'Domestic' | 'International'
  const [mandiCat, setMandiCat] = useState('All');
  const [mandiList, setMandiList] = useState(MANDI_DATA);

  // Create Post Modal
  const [postModal, setPostModal] = useState(false);
  const [postType, setPostType] = useState('Export Offer');
  const [postScope, setPostScope] = useState('Export');
  const [postTitle, setPostTitle] = useState('');
  const [postPort, setPostPort] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postCompany, setPostCompany] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2400);
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
    } catch (e) {
      // Fallback to built-in feed & mandi rates silently
    }
    setLoading(false);
    setRefreshing(false);
  }

  async function handleCreatePost() {
    if (!postTitle || !postPort || !postPrice) {
      Alert.alert('Missing Details', 'Please fill commodity, port/route, and target price.');
      return;
    }
    const newItem = {
      id: 'local-' + Date.now(),
      post_type: postScope,
      scope: postScope,
      title: postTitle,
      route_port: postPort,
      price: postPrice,
      verified_by: (postCompany || 'Trade SETUU Member') + ' • Verified',
    };
    setFeed([newItem, ...feed]);
    setPostModal(false);
    setPostTitle('');
    setPostPort('');
    setPostPrice('');
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

  // Login Screen (Accessed via Logout; full login + Surprise Box in final phase)
  if (!loggedIn) {
    return (
      <SafeAreaView style={s.root}>
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

  // --- OVERLAY 1: GLOBAL LOGISTICS HUB (From Sidebar or Services) ---
  if (overlayScreen === 'logistics') {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
        <View style={s.overlayBar}>
          <TouchableOpacity onPress={() => setOverlayScreen(null)} style={s.backPill}>
            <Text style={s.backPillTxt}>← Back to App</Text>
          </TouchableOpacity>
          <Text style={s.overlayBarTitle}>Logistics Hub</Text>
        </View>
        <LogisticsHubScreen />
      </SafeAreaView>
    );
  }

  // --- OVERLAY 2: LOCKED BLIND DEAL ROOM (Vault with ONLY Jugaad Shield & The Neutral Lock) ---
  if (overlayScreen === 'blindroom') {
    const triggerLockPopup = (featureName) => {
      Alert.alert(
        '🔒 ' + featureName + ' — Locked Vault',
        'Blind Deal Room abhi restricted mode mein hai. ' +
          featureName +
          ' sirf verified escrow & KYC approval ke baad agle phase mein unlock hoga.'
      );
    };

    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
        <View style={s.overlayBar}>
          <TouchableOpacity onPress={() => setOverlayScreen(null)} style={s.backPill}>
            <Text style={s.backPillTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.overlayBarTitle}>BLIND DEAL ROOM 🔒</Text>
        </View>

        <View style={s.vaultContainer}>
          <View style={s.vaultHeaderCard}>
            <Text style={s.vaultLockIcon}>🔒</Text>
            <Text style={s.vaultTitle}>RESTRICTED DEAL VAULT</Text>
            <Text style={s.vaultSub}>
              Zero-Leakage Anonymous Trade Execution. Inner deal rooms are sealed.
            </Text>
          </View>

          <TouchableOpacity
            style={s.shieldCard}
            onPress={() => triggerLockPopup('Jugaad Shield')}
          >
            <View style={s.rowBetween}>
              <Text style={s.shieldTitle}>🛡️ Jugaad Shield</Text>
              <Text style={s.lockBadge}>LOCKED</Text>
            </View>
            <Text style={s.shieldDesc}>
              Anti-Bypass & Commission Protection Layer for Intermediaries & Traders.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.shieldCard}
            onPress={() => triggerLockPopup('The Neutral Lock')}
          >
            <View style={s.rowBetween}>
              <Text style={s.shieldTitle}>🔐 The Neutral Lock</Text>
              <Text style={s.lockBadge}>LOCKED</Text>
            </View>
            <Text style={s.shieldDesc}>
              Continuous Identity & Document Custody Control Until Deal Settlement.
            </Text>
          </TouchableOpacity>

          <Text style={s.footerBrand}>Powered by Apex Sync Technologies</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- OVERLAY 3: TRADE WALLET & CREDITS ---
  if (overlayScreen === 'wallet') {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
        <View style={s.overlayBar}>
          <TouchableOpacity onPress={() => setOverlayScreen(null)} style={s.backPill}>
            <Text style={s.backPillTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.overlayBarTitle}>WALLET & CREDITS</Text>
        </View>
        <View style={{ padding: 18 }}>
          <View style={s.walletBigCard}>
            <Text style={s.goldBadge}>AVAILABLE TRADE CREDITS</Text>
            <Text style={s.walletAmt}>₹ {walletBalance}.00</Text>
            <Text style={s.cardRoute}>
              Welcome Bonus Active • Surprise Box (₹500 / ₹1,500) unlocks at final KYC verification.
            </Text>
          </View>
          <View style={s.card}>
            <Text style={s.cardTitle}>Recent Wallet Activity</Text>
            <Text style={s.cardRoute}>• Ecosystem Onboarding Credit: +₹500.00</Text>
            <Text style={s.cardRoute}>• Lead Unlock & Doc Generator: Free Tier Active</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Filtered Feed
  const visibleFeed = feed.filter((item) => {
    const matchesFilter =
      feedFilter === 'All' ||
      (item.scope && item.scope.toLowerCase() === feedFilter.toLowerCase()) ||
      (item.post_type && item.post_type.toLowerCase() === feedFilter.toLowerCase());
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
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />

      {/* Top Header with Side Drawer Button */}
      <View style={s.header}>
        <TouchableOpacity style={s.menuBtn} onPress={() => setDrawerOpen(true)}>
          <Text style={s.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>
            Trade <Text style={s.teal}>SETUU</Text>
          </Text>
          <Text style={s.headerSub}>Global Trade & Logistics Ecosystem</Text>
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

          {/* Top 3 Segment Toggles */}
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
                  visibleFeed.map((item) => (
                    <View key={item.id} style={s.card}>
                      <View style={s.rowBetween}>
                        <View style={s.tag}>
                          <Text style={s.tagText}>
                            {(item.scope || item.post_type).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={s.priceText}>{item.price}</Text>
                      </View>
                      <Text style={s.cardTitle}>{item.title}</Text>
                      <Text style={s.cardRoute}>Port / Route: {item.route_port}</Text>
                      <View style={s.rowBetween}>
                        <Text style={s.verifiedText}>{item.verified_by}</Text>
                        <TouchableOpacity
                          style={s.inquireBtn}
                          onPress={() =>
                            Share.share({
                              message:
                                'TRADE SETUU DEAL INQUIRY:\n' +
                                item.title +
                                '\nRoute: ' +
                                item.route_port +
                                '\nRate: ' +
                                item.price,
                            })
                          }
                        >
                          <Text style={s.inquireText}>Request Quote →</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {feedSubTab === 'Market' && (
              <View>
                <Text style={s.secTitle}>QUICK MARKET & FX PULSE</Text>
                <View style={s.card}>
                  <Text style={s.cardTitle}>USD / INR Reference Rate: ₹ 84.50</Text>
                  <Text style={s.cardRoute}>
                    AED/INR: ₹23.01 • EUR/INR: ₹91.85 • VND/USD: 25,400
                  </Text>
                </View>
                {MANDI_DATA.slice(0, 4).map((m) => (
                  <View key={m.id} style={s.card}>
                    <View style={s.rowBetween}>
                      <View>
                        <Text style={s.cardTitle}>{m.commodity}</Text>
                        <Text style={s.cardRoute}>{m.mandi}</Text>
                      </View>
                      <Text style={s.priceText}>{m.rate}</Text>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={s.primaryBtn}
                  onPress={() => setTab('mandi')}
                >
                  <Text style={s.primaryBtnText}>Open Full Mandi Live →</Text>
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

      {/* TAB 2: MANDI LIVE UPDATES (DOMESTIC / INTERNATIONAL TOGGLE) */}
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

      {/* TAB 5: SERVICE HUB (INCLUDES QUOTATION, PI, LOI, PO MAKER) */}
      {tab === 'services' && (
        <ServiceHubScreen
          onOpenLogistics={() => setOverlayScreen('logistics')}
        />
      )}

      {/* 5 BOTTOM NAVIGATION TABS (Feed | Mandi | + | Calculator | Services) */}
      <View style={s.navBar}>
        <TouchableOpacity style={s.navItem} onPress={() => setTab('feed')}>
          <Text style={[s.navText, tab === 'feed' && s.navTextActive]}>Feed</Text>
          {tab === 'feed' && <View style={s.navDot} />}
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem} onPress={() => setTab('mandi')}>
          <Text style={[s.navText, tab === 'mandi' && s.navTextActive]}>Mandi</Text>
          {tab === 'mandi' && <View style={s.navDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={s.plusBtn}
          onPress={() => setPostModal(true)}
        >
          <Text style={s.plusBtnTxt}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem} onPress={() => setTab('calc')}>
          <Text style={[s.navText, tab === 'calc' && s.navTextActive]}>
            Calculator
          </Text>
          {tab === 'calc' && <View style={s.navDot} />}
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem} onPress={() => setTab('services')}>
          <Text style={[s.navText, tab === 'services' && s.navTextActive]}>
            Services
          </Text>
          {tab === 'services' && <View style={s.navDot} />}
        </TouchableOpacity>
      </View>

      {/* SIDE DRAWER MODAL (NO JOB RECRUITMENT) */}
      <Modal visible={drawerOpen} transparent animationType="fade">
        <View style={s.drawerOverlay}>
          <View style={s.drawerPanel}>
            <View style={s.drawerTop}>
              <Text style={s.drawerUser}>Trade SETUU Member</Text>
              <Text style={s.goldBadge}>Exporter / Importer • Verified</Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
              <TouchableOpacity
                style={s.drawerWallet}
                onPress={() => {
                  setDrawerOpen(false);
                  setOverlayScreen('wallet');
                }}
              >
                <Text style={s.drawerWalletTitle}>Wallet & Credits</Text>
                <Text style={s.drawerWalletAmt}>₹ {walletBalance}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  setOverlayScreen('logistics');
                }}
              >
                <Text style={s.drawerItemTxt}>🌐 Global Logistics Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.drawerItem, s.drawerBlindItem]}
                onPress={() => {
                  setDrawerOpen(false);
                  setOverlayScreen('blindroom');
                }}
              >
                <Text style={s.drawerBlindTxt}>🔒 Blind Deal Room</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  setTab('services');
                }}
              >
                <Text style={s.drawerItemTxt}>📄 Quotation, PI, LOI & PO Maker</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  setTab('feed');
                  setFeedSubTab('Exim News');
                }}
              >
                <Text style={s.drawerItemTxt}>📰 Exim & DGFT News</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  Alert.alert(
                    'My Profile & KYC',
                    'Company KYC, IEC & GST verification badge module ready for final login integration.'
                  );
                }}
              >
                <Text style={s.drawerItemTxt}>👤 My Profile & KYC</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  Alert.alert(
                    'Membership Plans',
                    'Free Plan Active • Domestic & International Gold Plans available.'
                  );
                }}
              >
                <Text style={s.drawerItemTxt}>👑 Membership Plans</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  setLoggedIn(false);
                }}
              >
                <Text style={[s.drawerItemTxt, { color: '#EF4444' }]}>
                  🚪 Logout
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

      {/* CREATE POST MODAL (+ BUTTON) */}
      <Modal visible={postModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Create Trade Post</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
              {['Export', 'Import', 'Domestic', 'International'].map((sc) => (
                <TouchableOpacity
                  key={sc}
                  style={[s.chip, postScope === sc && s.chipActive]}
                  onPress={() => {
                    setPostScope(sc);
                    setPostType(sc);
                  }}
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
              placeholder="Commodity & Qty (e.g. IR 64 Rice - 500 MT)"
              placeholderTextColor="#6B7280"
              value={postTitle}
              onChangeText={setPostTitle}
            />
            <TextInput
              style={s.input}
              placeholder="Port / Route (e.g. FOB JNPT -> Jebel Ali)"
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
              placeholder="Your Company Name"
              placeholderTextColor="#6B7280"
              value={postCompany}
              onChangeText={setPostCompany}
            />
            <View style={s.rowBetween}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setPostModal(false)}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleCreatePost}>
                <Text style={s.saveText}>Publish Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0D12' },
  teal: { color: '#0D9488' },
  goldBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C9B89A',
    letterSpacing: 0.8,
  },
  loginBox: { flex: 1, justifyContent: 'center', padding: 24 },
  loginTitle: { fontSize: 32, fontWeight: '800', color: '#D9DDE3', marginVertical: 8 },
  loginSub: { fontSize: 13, color: '#8A8F98', lineHeight: 20, marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '700', color: '#8A8F98', marginBottom: 6 },
  input: {
    backgroundColor: '#141821',
    borderWidth: 1,
    borderColor: '#232936',
    borderRadius: 10,
    padding: 12,
    color: '#D9DDE3',
    fontSize: 14,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#D9DDE3' },
  headerSub: { fontSize: 11, color: '#8A8F98' },
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
    paddingTop: 10,
    paddingBottom: 6,
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
    margin: 14,
    backgroundColor: '#12161F',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#232936',
  },
  scopeBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
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
  priceText: { fontSize: 14, fontWeight: '800', color: '#14B8A6' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#D9DDE3', marginTop: 6 },
  cardRoute: { fontSize: 12, color: '#8A8F98', marginTop: 4, marginBottom: 8 },
  verifiedText: { fontSize: 11, color: '#C9B89A', fontWeight: '600', flex: 1 },
  inquireBtn: {
    backgroundColor: '#1A212E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inquireText: { color: '#14B8A6', fontSize: 11, fontWeight: '700' },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#141821',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#232936',
  },
  chipActive: { backgroundColor: '#0D9488', borderColor: '#14B8A6' },
  chipText: { color: '#8A8F98', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#FFFFFF' },
  pctText: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1A1F2B',
    backgroundColor: '#0E1118',
    paddingVertical: 8,
    alignItems: 'center',
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 11, fontWeight: '700', color: '#8A8F98' },
  navTextActive: { color: '#14B8A6' },
  navDot: {
    width: 16,
    height: 3,
    backgroundColor: '#0D9488',
    borderRadius: 2,
    marginTop: 3,
  },
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
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C9B89A',
    marginBottom: 16,
  },
  vaultLockIcon: { fontSize: 32, marginBottom: 6 },
  vaultTitle: { color: '#C9B89A', fontSize: 17, fontWeight: '800', letterSpacing: 1 },
  vaultSub: { color: '#8A8F98', fontSize: 12, textAlign: 'center', marginTop: 4 },
  shieldCard: {
    backgroundColor: '#121620',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262D3D',
    marginBottom: 12,
  },
  shieldTitle: { color: '#D9DDE3', fontSize: 16, fontWeight: '800' },
  lockBadge: {
    backgroundColor: '#374151',
    color: '#C9B89A',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shieldDesc: { color: '#8A8F98', fontSize: 12, marginTop: 6 },
  walletBigCard: {
    backgroundColor: '#121620',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#C9B89A',
    marginBottom: 14,
  },
  walletAmt: { color: '#14B8A6', fontSize: 32, fontWeight: '800', marginVertical: 6 },
  drawerOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.75)' },
  drawerPanel: {
    width: '78%',
    backgroundColor: '#0E1118',
    padding: 18,
    borderRightWidth: 1,
    borderRightColor: '#232936',
  },
  drawerTop: {
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2430',
    marginBottom: 12,
  },
  drawerUser: { color: '#D9DDE3', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  drawerWallet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#141821',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C9B89A',
    marginBottom: 12,
  },
  drawerWalletTitle: { color: '#D9DDE3', fontSize: 13, fontWeight: '700' },
  drawerWalletAmt: { color: '#14B8A6', fontSize: 15, fontWeight: '800' },
  drawerItem: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#161B26',
  },
  drawerItemTxt: { color: '#D9DDE3', fontSize: 14, fontWeight: '600' },
  drawerBlindItem: {
    backgroundColor: 'rgba(201,184,154,0.08)',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  drawerBlindTxt: { color: '#C9B89A', fontSize: 14, fontWeight: '800' },
  drawerCloseBtn: {
    backgroundColor: '#1A202C',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  drawerCloseTxt: { color: '#D9DDE3', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#12161F',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#232936',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#D9DDE3', marginBottom: 12 },
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
