import React, { useState, useEffect } from 'react';
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
  Image,
  Platform,
} from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import GlobalLogisticsHubScreen from './src/GlobalLogisticsHub';
import ServiceHubScreen from './src/screens/ServiceHubScreen';
import MarketPulseScreen from './src/screens/MarketPulseScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import { fetchEximNews } from './src/services/exim-news-service';
import { translateText } from './src/services/translationService';

const TS_LOGO = require('./1795099375380.png');

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
    summary:
      'Exporters shipping parboiled rice via JNPT, Vizag, and Kakinada ports can now complete customs EDI verification faster with digital LUT and APEDA sync.',
    url: '',
  },
  {
    id: 'n2',
    title: 'USD/INR Holds Near ₹92.65 — Stronger Realization for Indian Agro & Metal Exporters',
    source: 'Global FX Monitor',
    date: '21 Nov 2026',
    summary:
      'With the US Dollar trading near ₹92.65, Indian rice, maize, spice, and metal exporters are locking in Q4 forward shipments to Gulf and West Africa.',
    url: '',
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

  // Auth & Role Onboarding
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState('Najeeb Javed');
  const [userCompany, setUserCompany] = useState('UA EXIM Overseas');
  const [userRole, setUserRole] = useState('Exporter & Trader');
  const [loginMobile, setLoginMobile] = useState('+91 98261 00000');

  // Navigation
  const [activeTab, setActiveTab] = useState('feed');
  const [feedFilter, setFeedFilter] = useState('All');
  const [tabHistory, setTabHistory] = useState(['feed']);
  const [searchQuery, setSearchQuery] = useState('');

  // Full-screen CreatePostScreen state
  const [showCreatePostScreen, setShowCreatePostScreen] = useState(false);

  // Translation state per item id: { [id]: { visible, lang, text, loading } }
  const [translations, setTranslations] = useState({});

  // Vault, Loyalty & Subscription
  const [vaultBalance, setVaultBalance] = useState(500);
  const [loyaltyPts, setLoyaltyPts] = useState(320);
  const [isPaid, setIsPaid] = useState(false);
  const [planLabel, setPlanLabel] = useState('Free Member');

  // Live FX & News
  const [usdInr, setUsdInr] = useState(92.65);
  const [priceAlerts] = useState(['Parboiled Rice > ₹2,550/Qtl']);
  const [newsList, setNewsList] = useState(FALLBACK_NEWS);
  const [selectedNews, setSelectedNews] = useState(null);

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
      .then((d) => {
        if (mounted && d?.rates?.INR) setUsdInr(Number(d.rates.INR.toFixed(2)));
      })
      .catch(() => {});

    fetchEximNews()
      .then((res) => {
        if (mounted && Array.isArray(res?.articles) && res.articles.length > 0) {
          setNewsList(
            res.articles.slice(0, 12).map((it, idx) => ({
              id: it.id || 'nw-' + idx,
              title: it.title || 'Exim Trade Update',
              source: it.source || 'Global Exim Feed',
              date: it.publishedAt || 'Latest',
              summary: it.summary || it.title || '',
              url: it.url || '',
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      if (showCreatePostScreen) {
        setShowCreatePostScreen(false);
        return true;
      }
      if (selectedNews) {
        setSelectedNews(null);
        return true;
      }
      if (commentPost) {
        setCommentPost(null);
        return true;
      }
      if (modal) {
        setModal(null);
        return true;
      }
      if (drawerOpen) {
        setDrawerOpen(false);
        return true;
      }
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
  }, [showCreatePostScreen, selectedNews, commentPost, modal, drawerOpen, tabHistory, activeTab]);

  const switchTab = (t) => {
    setActiveTab(t);
    setTabHistory((prev) => (prev[prev.length - 1] === t ? prev : [...prev, t]));
  };

  const shareText = (title, body) =>
    Share.share({ message: `${title}\n${body}\n— Trade SETUU` }).catch(() => {});

  const openWA = (phone, msg) =>
    Linking.openURL(
      `https://wa.me/${(phone || '+919826100000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`
    );

  const handleToggleTranslation = async (id, title, body, preferredLang) => {
    const current = translations[id];
    const targetLang = preferredLang || current?.lang || 'en';

    if (current?.visible && !preferredLang) {
      setTranslations((prev) => ({
        ...prev,
        [id]: { ...prev[id], visible: false },
      }));
      return;
    }

    setTranslations((prev) => ({
      ...prev,
      [id]: {
        visible: true,
        lang: targetLang,
        text: current?.text || '',
        loading: true,
      },
    }));

    const translated = await translateText(`${title || ''}\n${body || ''}`.trim(), targetLang);

    setTranslations((prev) => ({
      ...prev,
      [id]: {
        visible: true,
        lang: targetLang,
        text: translated,
        loading: false,
      },
    }));
  };

  const renderTranslationBlock = (id, title, body) => {
    const tState = translations[id];
    const activeLang = tState?.lang || 'en';

    return (
      <View style={styles.transWrap}>
        <View style={styles.rowBetween}>
          <TouchableOpacity onPress={() => handleToggleTranslation(id, title, body)}>
            <Text style={styles.transToggleTxt}>
              {tState?.visible ? 'Show Original' : 'Show Translation'}
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {['en', 'hi'].map((code) => {
              const selected = activeLang === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.langChip, selected && styles.langChipActive]}
                  onPress={() => handleToggleTranslation(id, title, body, code)}
                >
                  <Text style={[styles.langChipTxt, selected && styles.langChipTxtActive]}>
                    {code === 'en' ? 'EN' : 'हिंदी'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {tState?.visible ? (
          <View style={[styles.transBox, { backgroundColor: T.pill, borderColor: T.border }]}>
            <Text style={{ color: T.text, fontSize: 12, lineHeight: 18 }}>
              {tState.loading ? 'Translating...' : tState.text}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderFeedMedia = (media) => {
    if (!media) return null;

    if (media.type === 'video') {
      return (
        <View style={styles.videoBox}>
          {media.thumbnail ? (
            <Image source={{ uri: media.thumbnail }} style={styles.videoThumb} resizeMode="cover" />
          ) : null}
          <Text style={styles.videoBadge}>▶ Video · {media.duration || 'Clip'}</Text>
        </View>
      );
    }

    if (media.type === 'image' && (media.url || media.uri)) {
      return (
        <Image
          source={{ uri: media.url || media.uri }}
          style={styles.feedImg}
          resizeMode="cover"
        />
      );
    }

    if (media.type === 'pdf') {
      return (
        <View style={[styles.pdfCard, { backgroundColor: T.pill, borderColor: T.border }]}>
          <Text style={styles.pdfTag}>PDF</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: T.text, fontSize: 12, fontWeight: '800' }} numberOfLines={1}>
              {media.fileName || 'Trade_Document.pdf'}
            </Text>
            <Text style={{ color: T.sub, fontSize: 10 }}>{media.fileSize || 'Document'}</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showCreatePostScreen) {
    return (
      <CreatePostScreen
        onClose={() => setShowCreatePostScreen(false)}
        onPublishPost={(newPost) => {
          setPosts((prev) => [
            {
              ...newPost,
              category: 'India EXIM',
              initials: (userName || 'TS')
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
              trader_name: userName,
              trader_role: `${userCompany} • Just now`,
              qty: newPost.meta || 'Ready Stock',
              port: 'EXIM / Domestic',
              price: 'Best Quote',
              phone: '+919826100000',
              comments: [],
            },
            ...prev,
          ]);
          setActiveTab('feed');
        }}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#090C10', justifyContent: 'center', padding: 20 }}>
        <StatusBar barStyle="light-content" backgroundColor="#090C10" />
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image source={TS_LOGO} style={{ width: 84, height: 84, borderRadius: 42, marginBottom: 12 }} />
          <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900' }}>Trade SETUU</Text>
          <Text style={{ color: '#14B8A6', fontSize: 12, fontWeight: '700' }}>
            Global Trade & Logistics Ecosystem
          </Text>
        </View>
        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Your Name</Text>
        <TextInput style={styles.mInp} value={userName} onChangeText={setUserName} />
        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Company / Firm Name</Text>
        <TextInput style={styles.mInp} value={userCompany} onChangeText={setUserCompany} />
        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Mobile / Email</Text>
        <TextInput style={styles.mInp} value={loginMobile} onChangeText={setLoginMobile} />
        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
          Select Your Business Role
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            'Exporter & Trader',
            'Global Importer',
            'Commodity Broker',
            'Transporter / Fleet',
            'Shipping Line',
            'CHA / Customs',
          ].map((r) => (
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
        <Text style={{ color: '#64748B', fontSize: 10, textAlign: 'center', marginTop: 18 }}>
          Powered by Apex Sync Technologies
        </Text>
      </SafeAreaView>
    );
  }

  const visiblePosts = posts.filter((p) => {
    const okCat = feedFilter === 'All' || p.category === feedFilter;
    const okQ =
      !searchQuery.trim() ||
      `${p.title} ${p.trader_name} ${p.port}`.toLowerCase().includes(searchQuery.toLowerCase());
    return okCat && okQ;
  });

  const showTopGlobalHeader = activeTab !== 'mandi' && activeTab !== 'logistics';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, paddingTop: Platform.OS === 'android' ? 4 : 0 }}>
      <StatusBar barStyle="light-content" backgroundColor="#060D12" />

      {/* CLEAN TOP HEADER */}
      {showTopGlobalHeader && (
        <View style={hdr.bar}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setDrawerOpen(true)}
            style={hdr.brandBtn}
          >
            <View style={hdr.logoRing}>
              <Image
                source={TS_LOGO}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />
            </View>
            <View style={hdr.brandTextCol}>
              <Text style={hdr.brandTitle} numberOfLines={1}>
                Trade <Text style={hdr.brandAccent}>SETUU</Text>
              </Text>
              <Text style={hdr.brandSub} numberOfLines={1}>
                Global Trade Network
              </Text>
            </View>
          </TouchableOpacity>

          <View style={hdr.divider} />

          <View style={hdr.searchWrap}>
            <Text style={hdr.searchIcon}>🔍</Text>
            <TextInput
              style={hdr.searchInput}
              placeholder="Search rice, maize, ports..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={hdr.iconBtn}
            onPress={() => setModal('chat')}
          >
            <Text style={hdr.iconGlyph}>💬</Text>
            <View style={hdr.badge}>
              <Text style={hdr.badgeTxt}>2</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={hdr.iconBtn}
            onPress={() => setModal('bell')}
          >
            <Text style={hdr.iconGlyph}>🔔</Text>
            <View style={hdr.badge}>
              <Text style={hdr.badgeTxt}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={hdr.iconBtn}
            onPress={() => setModal('settings')}
          >
            <Text style={hdr.iconGlyph}>⚙️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TAB 1: TRADE FEED */}
      {activeTab === 'feed' && (
        <View style={{ flex: 1 }}>
          <View style={{ backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 9 }}
            >
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
            <ScrollView contentContainerStyle={{ paddingBottom: 95 }}>
              <View style={[styles.liCard, { backgroundColor: '#0D1B2A', borderColor: T.border }]}>
                <Text style={{ color: '#C9B89A', fontSize: 11, fontWeight: '800' }}>LIVE FX REFERENCE</Text>
                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '900', marginTop: 2 }}>
                  1 USD = ₹{usdInr} INR
                </Text>
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
            <ScrollView contentContainerStyle={{ paddingBottom: 95 }}>
              {newsList.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => setSelectedNews(n)}
                  style={[styles.liCard, { backgroundColor: T.card, borderColor: T.border }]}
                >
                  <View style={styles.rowBetween}>
                    <Text style={{ color: T.accent, fontSize: 11, fontWeight: '800' }}>
                      {n.source} • {n.date}
                    </Text>
                    <TouchableOpacity onPress={() => shareText(n.title, n.summary)}>
                      <Text style={{ fontSize: 16 }}>📤</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: T.text, fontSize: 15, fontWeight: '800', marginTop: 6 }}>{n.title}</Text>
                  <Text style={{ color: T.sub, fontSize: 13, marginTop: 5, lineHeight: 19 }} numberOfLines={3}>
                    {n.summary}
                  </Text>
                  {renderTranslationBlock(n.id, n.title, n.summary)}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 95 }}>
              {visiblePosts.map((post) => {
                const liked = likedIds.includes(post.id);
                const saved = savedIds.includes(post.id);
                return (
                  <View key={post.id} style={[styles.liCard, { backgroundColor: T.card, borderColor: T.border }]}>
                    <View style={styles.rowBetween}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={styles.avatarCircle}>
                          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>
                            {post.initials || 'TS'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: T.text, fontSize: 14, fontWeight: '800' }}>{post.trader_name}</Text>
                          <Text style={{ color: T.sub, fontSize: 11 }}>{post.trader_role}</Text>
                        </View>
                      </View>
                      <Text style={styles.offerPill}>{post.post_type}</Text>
                    </View>

                    <Text style={{ color: T.text, fontSize: 15, fontWeight: '800', marginTop: 10, lineHeight: 21 }}>
                      {post.title}
                    </Text>
                    {!!post.desc && (
                      <Text style={{ color: T.sub, fontSize: 13, marginTop: 4, lineHeight: 19 }}>{post.desc}</Text>
                    )}

                    {renderTranslationBlock(post.id, post.title, post.desc)}
                    {renderFeedMedia(post.media)}

                    <View style={[styles.specStrip, { borderTopColor: T.border, borderBottomColor: T.border }]}>
                      <View style={styles.specCol}>
                        <Text style={{ color: T.sub, fontSize: 10, fontWeight: '700' }}>QUANTITY</Text>
                        <Text style={{ color: T.text, fontSize: 13, fontWeight: '800', marginTop: 2 }}>{post.qty}</Text>
                      </View>
                      <View
                        style={[
                          styles.specCol,
                          { borderLeftWidth: 1, borderRightWidth: 1, borderColor: T.border, paddingHorizontal: 10 },
                        ]}
                      >
                        <Text style={{ color: T.sub, fontSize: 10, fontWeight: '700' }}>PORT / ROUTE</Text>
                        <Text style={{ color: T.text, fontSize: 13, fontWeight: '800', marginTop: 2 }} numberOfLines={1}>
                          {post.port}
                        </Text>
                      </View>
                      <View style={[styles.specCol, { paddingLeft: 10 }]}>
                        <Text style={{ color: T.sub, fontSize: 10, fontWeight: '700' }}>TARGET RATE</Text>
                        <Text style={{ color: T.accent, fontSize: 13, fontWeight: '900', marginTop: 2 }}>
                          {post.price}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.liActionRow}>
                      <TouchableOpacity
                        style={styles.liActBtn}
                        onPress={() =>
                          setLikedIds(liked ? likedIds.filter((i) => i !== post.id) : [...likedIds, post.id])
                        }
                      >
                        <Text style={{ color: liked ? T.accent : T.sub, fontSize: 12, fontWeight: '800' }}>
                          {liked ? '❤️ Liked' : '🤍 Like'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.liActBtn} onPress={() => setCommentPost(post)}>
                        <Text style={{ color: T.sub, fontSize: 12, fontWeight: '800' }}>
                          💬 Comment ({post.comments?.length || 0})
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.liActBtn}
                        onPress={() =>
                          setSavedIds(saved ? savedIds.filter((i) => i !== post.id) : [...savedIds, post.id])
                        }
                      >
                        <Text style={{ color: saved ? T.gold : T.sub, fontSize: 12, fontWeight: '800' }}>
                          {saved ? '🔖 Saved' : '📑 Save'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.liActBtn}
                        onPress={() => shareText(post.title, `${post.qty} | ${post.port} | ${post.price}`)}
                      >
                        <Text style={{ color: T.sub, fontSize: 12, fontWeight: '800' }}>📤 Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.waCircle}
                        onPress={() => openWA(post.phone, `Hi ${post.trader_name}, regarding ${post.title}`)}
                      >
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

      {/* TAB 2: MARKET PULSE */}
      {activeTab === 'mandi' && (
        <MarketPulseScreen
          theme={theme}
          onBackToApp={() => switchTab('feed')}
        />
      )}

      {/* TAB 4: GLOBAL LOGISTICS HUB */}
      {activeTab === 'logistics' && (
        <GlobalLogisticsHubScreen
          theme={theme}
          onExitHub={() => switchTab('feed')}
        />
      )}

      {/* TAB 5: SERVICE HUB */}
      {activeTab === 'services' && (
        <ServiceHubScreen
          theme={theme}
          isPaid={isPaid}
          vaultBalance={vaultBalance}
          onDeductVault={(amt) => setVaultBalance((v) => Math.max(0, v - amt))}
          onOpenCalc={() => switchTab('services')}
          onOpenLogistics={() => switchTab('logistics')}
        />
      )}

      {/* BOTTOM BAR */}
      <View style={styles.bottomDockOuter}>
        <View style={styles.bottomDock}>
          {/* 1. Trade Feed */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.navItem, activeTab === 'feed' && styles.navItemActive]}
            onPress={() => switchTab('feed')}
          >
            <Text style={[styles.navIcon, activeTab === 'feed' && styles.navIconActive]}>
              ❖
            </Text>
            <Text
              style={[styles.navLbl, activeTab === 'feed' && styles.navLblActive]}
              numberOfLines={1}
            >
              Trade Feed
            </Text>
          </TouchableOpacity>

          {/* 2. Market Pulse */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.navItem, activeTab === 'mandi' && styles.navItemActive]}
            onPress={() => switchTab('mandi')}
          >
            <Text style={[styles.navIcon, activeTab === 'mandi' && styles.navIconActive]}>
              📈
            </Text>
            <Text
              style={[styles.navLbl, activeTab === 'mandi' && styles.navLblActive]}
              numberOfLines={1}
            >
              Market Pulse
            </Text>
          </TouchableOpacity>

          {/* 3. Center Floating Create (+) */}
          <View style={styles.centerCreateWrap}>
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.centerPlus}
              onPress={() => setShowCreatePostScreen(true)}
            >
              <Text style={styles.centerPlusTxt}>+</Text>
            </TouchableOpacity>
            <Text style={styles.centerLbl} numberOfLines={1}>
              Create
            </Text>
          </View>

          {/* 4. Global Logistics Hub (Slightly larger icon + 2-line label) */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.navItem, activeTab === 'logistics' && styles.navItemActive]}
            onPress={() => switchTab('logistics')}
          >
            <Text style={[styles.logisticsIcon, activeTab === 'logistics' && styles.navIconActive]}>
              🌐
            </Text>
            <Text style={[styles.navLblTwoLine, activeTab === 'logistics' && styles.navLblActive]}>
              {'Global\nLogistics Hub'}
            </Text>
          </TouchableOpacity>

          {/* 5. Service Hub */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.navItem, activeTab === 'services' && styles.navItemActive]}
            onPress={() => switchTab('services')}
          >
            <Text style={[styles.navIcon, activeTab === 'services' && styles.navIconActive]}>
              ⊞
            </Text>
            <Text
              style={[styles.navLbl, activeTab === 'services' && styles.navLblActive]}
              numberOfLines={1}
            >
              Service Hub
            </Text>
          </TouchableOpacity>
        </View>
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
                  <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '700' }}>
                    {userCompany} • {planLabel}
                  </Text>
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
                  if (m.id === 'logistics') switchTab('logistics');
                  else if (m.id === 'logout') setIsLoggedIn(false);
                  else if (m.id === 'custom_ad')
                    Alert.alert('Custom Ad Manager', 'Available with Paid Subscription (Coming Soon).');
                  else setModal(m.id);
                }}
              >
                <Text style={{ color: '#F1F5F9', fontSize: 13, fontWeight: '700' }}>{m.label}</Text>
              </TouchableOpacity>
            ))}

            <Text style={{ color: '#8A8F98', fontSize: 11, fontWeight: '800', marginTop: 18 }}>
              Powered by Apex Sync Technologies
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* UNIVERSAL MODALS */}
      <Modal visible={!!modal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={styles.modalBox}>
              {modal === 'ad' && (
                <View>
                  <Text style={styles.mHead}>Ad Manager (Setuu Vault: ₹{vaultBalance})</Text>
                  <TextInput
                    style={styles.mInp}
                    placeholder="Ad Headline"
                    placeholderTextColor="#64748B"
                    value={adTitle}
                    onChangeText={setAdTitle}
                  />
                  <TextInput
                    style={styles.mInp}
                    placeholder="Offer & Port Details"
                    placeholderTextColor="#64748B"
                    value={adDesc}
                    onChangeText={setAdDesc}
                  />
                  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    {[199, 299, 499].map((b) => (
                      <TouchableOpacity
                        key={b}
                        onPress={() => setAdBudget(b)}
                        style={[styles.chipBtn, adBudget === b && { backgroundColor: '#0D9488' }]}
                      >
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>₹{b} Boost</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.mBtn}
                    onPress={() => {
                      if (vaultBalance < adBudget) {
                        Alert.alert('Low Balance', 'Add funds to Setuu Vault first.');
                        return;
                      }
                      setVaultBalance((v) => v - adBudget);
                      setPosts([
                        {
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
                        },
                        ...posts,
                      ]);
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
                      <TouchableOpacity
                        key={r.id}
                        onPress={() => setSubRole(r.id)}
                        style={[styles.chipBtn, subRole === r.id && { backgroundColor: '#0D9488' }]}
                      >
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{r.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {subRole === 'commodity_broker' ? (
                    <View>
                      <Text style={{ color: '#14B8A6', fontSize: 11, fontWeight: '800' }}>SINGLE COMPLETE PLAN</Text>
                      <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900', marginVertical: 6 }}>
                        ₹11,499 Only
                      </Text>
                      <TouchableOpacity
                        style={styles.mBtn}
                        onPress={() => {
                          setIsPaid(true);
                          setPlanLabel('Commodity Broker (₹11,499)');
                          setModal(null);
                        }}
                      >
                        <Text style={styles.mBtnTxt}>Activate Commodity Broker — ₹11,499</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        {['monthly', 'yearly'].map((c) => (
                          <TouchableOpacity
                            key={c}
                            onPress={() => setBillingCycle(c)}
                            style={[styles.chipBtn, billingCycle === c && { backgroundColor: '#0D9488' }]}
                          >
                            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>
                              {c === 'yearly' ? 'Yearly' : 'Monthly'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 8 }}>
                        {subRole === 'shipping_line'
                          ? billingCycle === 'yearly'
                            ? '₹21,999 / Year'
                            : '₹2,499 / Month'
                          : billingCycle === 'yearly'
                            ? '₹12,999 / Year'
                            : '₹1,499 / Month'}
                      </Text>
                      <TouchableOpacity
                        style={styles.mBtn}
                        onPress={() => {
                          setIsPaid(true);
                          setPlanLabel('Pro Member');
                          setModal(null);
                        }}
                      >
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
                    <Text style={styles.mBtnTxt}>
                      {isDark ? '🌤️ Switch to Clean Light Mode' : '🌙 Switch to Dark Mode'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {(modal === 'profile' ||
                modal === 'catalogue' ||
                modal === 'dashboard' ||
                modal === 'blind' ||
                modal === 'chat' ||
                modal === 'bell') && (
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

      {/* COMMENT & NEWS MODALS */}
      <Modal visible={!!commentPost} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.mHead}>Comments — {commentPost?.trader_name}</Text>
            {(commentPost?.comments || []).map((c, idx) => (
              <Text key={idx} style={{ color: '#CBD5E1', fontSize: 12, marginBottom: 6 }}>
                • {c}
              </Text>
            ))}
            <TextInput
              style={styles.mInp}
              placeholder="Write a comment or enquiry..."
              placeholderTextColor="#64748B"
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={styles.mBtn}
              onPress={() => {
                if (!commentText.trim()) return;
                setPosts(
                  posts.map((p) =>
                    p.id === commentPost.id
                      ? { ...p, comments: [...(p.comments || []), `${userName}: ${commentText.trim()}`] }
                      : p
                  )
                );
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

      <Modal visible={!!selectedNews} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.mHead}>{selectedNews?.title}</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 13, lineHeight: 19 }}>{selectedNews?.summary}</Text>
            {selectedNews?.url ? (
              <TouchableOpacity
                style={[styles.mBtn, { marginTop: 12 }]}
                onPress={() => Linking.openURL(selectedNews.url).catch(() => {})}
              >
                <Text style={styles.mBtnTxt}>Open Complete Article →</Text>
              </TouchableOpacity>
            ) : null}
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
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#060D12',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#132833',
  },
  brandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 128,
  },
  logoRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.8,
    borderColor: '#14B8A6',
    overflow: 'hidden',
    backgroundColor: '#0A161E',
  },
  brandTextCol: {
    marginLeft: 6,
    flexShrink: 1,
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  brandAccent: {
    color: '#14B8A6',
  },
  brandSub: {
    color: '#94A3B8',
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#1E333E',
    marginHorizontal: 7,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C1821',
    borderRadius: 18,
    paddingHorizontal: 9,
    height: 34,
    borderWidth: 1,
    borderColor: '#1B3442',
  },
  searchIcon: {
    fontSize: 11,
    marginRight: 5,
    opacity: 0.85,
  },
  searchInput: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 11.5,
    paddingVertical: 0,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0B1720',
    borderWidth: 1,
    borderColor: '#1B3A46',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    position: 'relative',
  },
  iconGlyph: {
    fontSize: 13,
    color: '#E2E8F0',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -3,
    backgroundColor: '#10B981',
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#060D12',
  },
  badgeTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
  },
});

const styles = StyleSheet.create({
  filterPill: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 18, marginRight: 7 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  liCard: { paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 0.5, borderBottomWidth: 0.5, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerPill: {
    color: '#14B8A6',
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: 'rgba(13,148,136,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  transWrap: { marginTop: 8 },
  transToggleTxt: { color: '#38BDF8', fontSize: 11, fontWeight: '800' },
  langChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langChipActive: { borderColor: '#14B8A6', backgroundColor: 'rgba(20,184,166,0.16)' },
  langChipTxt: { color: '#94A3B8', fontSize: 10, fontWeight: '800' },
  langChipTxtActive: { color: '#2DD4BF' },
  transBox: { marginTop: 6, padding: 8, borderRadius: 8, borderWidth: 1 },
  videoBox: {
    marginTop: 10,
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#050C14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoThumb: { width: '100%', height: '100%', opacity: 0.75 },
  videoBadge: {
    position: 'absolute',
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  feedImg: { marginTop: 10, width: '100%', height: 155, borderRadius: 10 },
  pdfCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  pdfTag: {
    color: '#F87171',
    backgroundColor: 'rgba(239,68,68,0.16)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 11,
    fontWeight: '900',
  },
  specStrip: { flexDirection: 'row', borderTopWidth: 0.5, borderBottomWidth: 0.5, paddingVertical: 9, marginTop: 12 },
  specCol: { flex: 1 },
  liActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 },
  liActBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  waCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Dock
  bottomDockOuter: {
    backgroundColor: '#070B10',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 14 : 8,
  },
  bottomDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A131C',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#162838',
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 2,
    borderRadius: 18,
    minHeight: 54,
  },
  navItemActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.55)',
  },
  navIcon: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 2,
  },
  logisticsIcon: {
    fontSize: 20,
    color: '#94A3B8',
    marginBottom: 1,
  },
  navIconActive: {
    color: '#5EEAD4',
  },
  navLbl: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  navLblTwoLine: {
    color: '#CBD5E1',
    fontSize: 9.5,
    fontWeight: '700',
    lineHeight: 11.5,
    textAlign: 'center',
  },
  navLblActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  centerCreateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    marginTop: -22,
  },
  centerPlus: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#2DD4BF',
    elevation: 12,
  },
  centerPlusTxt: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
  centerLbl: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },

  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', flexDirection: 'row' },
  drawerPanel: { width: '83%', backgroundColor: '#090C10', padding: 16, borderRightWidth: 1, borderRightColor: '#1E293B' },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  vaultCard: {
    backgroundColor: '#11161F',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#C9B89A',
  },
  vaultAddBtn: { backgroundColor: '#0D9488', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  menuItem: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#0D1B2A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C9B89A' },
  mHead: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  mInp: {
    backgroundColor: '#11161F',
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 9,
  },
  mBtn: { backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  mBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '900' },
  chipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 6,
    marginBottom: 6,
  },
});
