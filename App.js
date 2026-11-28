import React, { useState, useEffect, useMemo } from 'react';
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
  useColorScheme,
} from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import GlobalLogisticsHubScreen from './src/GlobalLogisticsHub';
import ServiceHubScreen from './src/screens/ServiceHubScreen';
import MarketPulseScreen from './src/screens/MarketPulseScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SetuAiCopilotScreen, { SetuAiFloatingTrigger } from './src/screens/SetuAiCopilotScreen';
import { fetchEximNews } from './src/services/eximNewsService';
import { translateText } from './src/services/translationService';

const TS_LOGO = require('./1795099375380.png');
const COPILOT_CAPSULE_IMG = require('./IMG_20261128_171321.png');
const COPILOT_SQUARE_IMG = require('./IMG_20261128_171240.png');
const BOTTOM_NAV_IMG = require('./IMG_20261128_171448.png');

/**
 * Common search/voice matcher usable across all search bars/engines:
 * - Matches full phrase or individual words when >= 3 letters or >= 3 words are entered.
 */
export function smartSearchMatch(rawQuery = '', targetText = '') {
  const q = String(rawQuery || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  if (!q) return true;

  const hay = String(targetText || '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
  if (!hay) return false;

  if (hay.includes(q)) return true;

  const words = q.split(' ').filter((w) => w.length >= 2);
  if (words.length >= 3) {
    return words.every((w) => hay.includes(w));
  }

  if (q.length >= 3) {
    return words.length > 0 ? words.every((w) => hay.includes(w)) : hay.includes(q);
  }

  return hay.includes(q);
}

const POST_TYPE_FILTERS = ['All', 'Sell Offer', 'Buy Requirement', 'Logistics', 'Sponsored'];

const EXIM_RELEVANCE_KEYWORDS = [
  'export',
  'import',
  'customs',
  'dgft',
  'apeda',
  'cbic',
  'tariff',
  'duty',
  'port',
  'jnpt',
  'mundra',
  'vizag',
  'kandla',
  'shipping',
  'freight',
  'cargo',
  'vessel',
  'container',
  'maritime',
  'logistics',
  'rice',
  'basmati',
  'maize',
  'wheat',
  'grain',
  'spice',
  'commodity',
  'trade deal',
  'fta',
  'exim',
];

const EXCLUDE_NOISE_KEYWORDS = [
  'zara',
  'h&m',
  'under armour',
  'black friday',
  'fashion',
  'sneaker',
  'movie',
  'celebrity',
  'tax case',
];

const BLOCKED_URL_PATTERNS = [
  /^\s*javascript:/i,
  /^\s*data:/i,
  /^\s*file:/i,
  /^\s*vbscript:/i,
  /bit\.ly|tinyurl\.com|t\.co|goo\.gl|rb\.gy/i,
];

function extractSafeLinks(text = '') {
  if (!text || typeof text !== 'string') return [];
  const rawMatches = text.match(/https?:\/\/[^\s<>"']+/gi) || [];

  return Array.from(new Set(rawMatches)).filter((url) => {
    const clean = url.trim().replace(/[.,;!?)]+$/, '');
    if (!/^https?:\/\//i.test(clean)) return false;
    if (BLOCKED_URL_PATTERNS.some((rx) => rx.test(clean))) return false;
    return true;
  });
}

function openFilteredLink(rawUrl) {
  const clean = (rawUrl || '').trim().replace(/[.,;!?)]+$/, '');
  const safeList = extractSafeLinks(clean);

  if (safeList.length === 0) {
    Alert.alert(
      'Unsafe or Invalid Link',
      'Yeh link security filter ki wajah se block kar diya gaya hai ya valid nahi hai.'
    );
    return;
  }

  const safeUrl = safeList[0];
  Alert.alert(
    'Open External Link',
    `Kya aap is website ya digital card link ko open karna chahte hain?\n\n${safeUrl}`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open',
        onPress: () => {
          Linking.openURL(safeUrl).catch(() => {
            Alert.alert('Error', 'Link open karne mein problem aayi.');
          });
        },
      },
    ]
  );
}

function isRelevantEximArticle(item) {
  const hay = `${item?.title || ''} ${item?.summary || ''}`.toLowerCase();
  if (!hay.trim()) return false;
  if (EXCLUDE_NOISE_KEYWORDS.some((w) => hay.includes(w))) return false;
  return EXIM_RELEVANCE_KEYWORDS.some((kw) => hay.includes(kw));
}

const FALLBACK_NEWS = [
  {
    id: 'n1',
    title: 'DGFT Streamlines Non-Basmati Parboiled Rice Export Clearance at JNPT & Vizag',
    source: 'Exim Trade Desk',
    date: '2026',
    summary:
      'Exporters shipping parboiled rice via JNPT, Vizag, and Kakinada ports can now complete customs EDI verification faster with digital LUT and APEDA sync. Port turnaround and container slot availability remain key focus areas for exporters.',
    url: '',
  },
  {
    id: 'n2',
    title: 'India & Gulf Trade Corridors: Customs Duty & Port Logistics Updates',
    source: 'Global Trade Desk',
    date: '2026',
    summary:
      'Bilateral trade negotiations, tariff adjustments, and shipping lane updates are shaping agricultural, food processing, and industrial export competitiveness.',
    url: '',
  },
  {
    id: 'n3',
    title: 'Global Container Freight, Port Congestion & Commodity Export Demand',
    source: 'Maritime & EXIM Desk',
    date: '2026',
    summary:
      'Shippers tracking FOB/CIF pricing, phytosanitary and quality inspection norms, and vessel schedules across Asian and Middle Eastern ports.',
    url: '',
  },
];

const INITIAL_FEED = [
  {
    id: 'p1',
    post_type: 'Sell Offer',
    initials: 'UE',
    trader_name: 'UA EXIM Overseas',
    trader_role: 'Verified Exporter • Raipur, CG • 2h',
    title: 'Indian Non-Basmati Parboiled Rice (5% Broken, Sortex Clean)',
    desc:
      'Ready mill stock packed in 50 Kg PP bags. SGS / APEDA inspection ready for immediate container stuffing. Full phytosanitary and origin documentation available for prompt dispatch.\n\n#RiceExport #ParboiledRice #FOBIndia #JNPT',
    qty: '2,500 MT',
    port: 'FOB JNPT / Vizag',
    price: 'USD 465 / MT',
    phone: '+919826100101',
    comments: ['Gulf Foodstuff: Please share latest lab report on WhatsApp.'],
  },
  {
    id: 'p2',
    post_type: 'Buy Requirement',
    initials: 'AG',
    trader_name: 'Apex Global Commodities',
    trader_role: 'Commodity Broker • Dubai / Singapore • 4h',
    title: 'Urgent Buyer Requirement: Yellow Maize (Moisture <14%, Aflatoxin <20ppb)',
    desc:
      'Looking for direct millers or FOB exporters for regular monthly shipments to Port Klang & Vietnam. LC or confirmed advance terms based on inspection.\n\n#YellowMaize #GrainImport #CIFPortKlang',
    qty: '1,000 MT',
    port: 'CIF Port Klang',
    price: 'USD 272 / MT',
    phone: '+919826100202',
    comments: [],
  },
  {
    id: 'p3',
    post_type: 'Logistics',
    initials: 'MB',
    trader_name: 'Mahamaya Bulk Logistics & Trade',
    trader_role: 'Logistics Partner • Raipur -> Vizag • 6h',
    title: 'Direct Mill-to-Port Rake & 22-Wheeler Fleet Available for Rice & Maize',
    desc:
      'GPS-enabled tarpaulin covered trucks with transit insurance and instant E-Way bill support for bulk agricultural and industrial cargo movement.\n\n#Freight #Logistics #VizagPort #BulkCargo',
    qty: '35–42 MT / Truck',
    port: 'Raipur -> Vizag',
    price: '₹2,150 / MT',
    phone: '+919826100303',
    comments: [],
  },
];

function extractHashtags(text = '') {
  const matches = text.match(/#[A-Za-z0-9_]+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

export default function App() {
  const systemScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [themeMode, setThemeMode] = useState('Dark');

  // Auth & Role Onboarding
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState('Najeeb Javed');
  const [userCompany, setUserCompany] = useState('UA EXIM Overseas');
  const [userRole, setUserRole] = useState('Exporter & Trader');
  const [loginMobile, setLoginMobile] = useState('+91 98261 00000');

  // Navigation & Built-in Filters
  const [activeTab, setActiveTab] = useState('feed');
  const [homeSubTab, setHomeSubTab] = useState('feed');
  const [selectedPostType, setSelectedPostType] = useState('All');
  const [activeHashtag, setActiveHashtag] = useState('');
  const [tabHistory, setTabHistory] = useState(['feed']);
  const [searchQuery, setSearchQuery] = useState('');

  // Voice Search modal state
  const [voiceSearchVisible, setVoiceSearchVisible] = useState(false);
  const [voiceSearchDraft, setVoiceSearchDraft] = useState('');

  // Full-screen CreatePostScreen & SettingsScreen state
  const [showCreatePostScreen, setShowCreatePostScreen] = useState(false);
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);

  // SETU AI Co-Pilot state
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotFloatingWindow, setCopilotFloatingWindow] = useState(true);
  const [copilotContext, setCopilotContext] = useState(null);
  const [appliedDraftForCreate, setAppliedDraftForCreate] = useState(null);

  // See more expansion per post id
  const [expandedPosts, setExpandedPosts] = useState({});

  // Translation state per item id
  const [translations, setTranslations] = useState({});

  // Vault, Loyalty & Subscription
  const [vaultBalance, setVaultBalance] = useState(500);
  const [loyaltyPts] = useState(320);
  const [isPaid, setIsPaid] = useState(false);
  const [planLabel, setPlanLabel] = useState('Free Member');

  // News & Full Reader Modal
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

  const isDark =
    themeMode === 'System' ? systemScheme !== 'light' : themeMode === 'Dark';
  const themeString = isDark ? 'dark' : 'light';

  const T = {
    bg: isDark ? '#060D12' : '#F3F5F8',
    card: isDark ? '#0B161E' : '#FFFFFF',
    border: isDark ? '#162C37' : '#E2E8F0',
    text: isDark ? '#F1F5F9' : '#0F172A',
    sub: isDark ? '#94A3B8' : '#64748B',
    pill: isDark ? '#0F222D' : '#E9EEF5',
    accent: '#0D9488',
    gold: '#C9B89A',
  };

  const currentScreenContext = useMemo(() => {
    if (showCreatePostScreen) {
      return {
        screenName: 'CreatePostScreen',
        title: 'Create Trade Post',
        summary: 'Drafting trade offer, requirement, or logistics update.',
      };
    }
    if (activeTab === 'mandi') {
      return {
        screenName: 'MarketPulseScreen',
        title: 'Market Pulse',
        summary: `Live commodity & USD/INR reference (₹${usdInr}).`,
      };
    }
    if (activeTab === 'logistics') {
      return {
        screenName: 'GlobalLogisticsHubScreen',
        title: 'Global Logistics Hub',
        summary: 'Freight corridors, ports, and container movement.',
      };
    }
    if (activeTab === 'services') {
      return {
        screenName: 'ServiceHubScreen',
        title: 'Service Hub',
        summary: `Trade tools & Setuu Vault balance (₹${vaultBalance}).`,
      };
    }
    return {
      screenName: 'TradeFeed',
      title: homeSubTab === 'news' ? 'EXIM News' : 'Trade Feed',
      summary: activeHashtag ? `Filtered by ${activeHashtag}` : 'Active trade posts & offers.',
    };
  }, [showCreatePostScreen, activeTab, usdInr, vaultBalance, homeSubTab, activeHashtag]);

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
        if (!mounted || !Array.isArray(res?.articles)) return;
        const cleanArticles = res.articles
          .filter(isRelevantEximArticle)
          .slice(0, 15)
          .map((it, idx) => ({
            id: it.id || 'nw-' + idx,
            title: it.title || 'EXIM Trade Update',
            source: it.source || 'EXIM Desk',
            date: it.publishedAt || 'Latest',
            summary: it.summary || it.title || '',
            url: it.url || '',
          }));
        if (cleanArticles.length > 0) {
          setNewsList(cleanArticles);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      if (voiceSearchVisible) {
        setVoiceSearchVisible(false);
        return true;
      }
      if (copilotOpen) {
        setCopilotOpen(false);
        return true;
      }
      if (showSettingsScreen) {
        setShowSettingsScreen(false);
        return true;
      }
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
      if (activeHashtag) {
        setActiveHashtag('');
        return true;
      }
      if (selectedPostType !== 'All') {
        setSelectedPostType('All');
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
  }, [
    voiceSearchVisible,
    copilotOpen,
    showSettingsScreen,
    showCreatePostScreen,
    selectedNews,
    commentPost,
    modal,
    drawerOpen,
    activeHashtag,
    selectedPostType,
    tabHistory,
    activeTab,
  ]);

  const switchTab = (t) => {
    setActiveTab(t);
    setTabHistory((prev) => (prev[prev.length - 1] === t ? prev : [...prev, t]));
  };

  const openCopilotWithContext = (ctxPayload = null) => {
    setCopilotContext(ctxPayload || currentScreenContext);
    setCopilotOpen(true);
  };

  const handleApplyDraftFromCopilot = (payload) => {
    if (!payload) return;
    setAppliedDraftForCreate(payload);
    setCopilotOpen(false);
  };

  const shareText = (title, body) =>
    Share.share({ message: `${title}\n${body}\n— Trade SETUU` }).catch(() => {});

  const openWA = (phone, msg) =>
    Linking.openURL(
      `https://wa.me/${(phone || '+919826100000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`
    );

  const toggleSeeMore = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

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
              {tState?.visible ? 'Hide Translation' : 'Translate'}
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
            <Text style={{ color: T.text, fontSize: 12.5, lineHeight: 19 }}>
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
            <Text style={{ color: T.text, fontSize: 13, fontWeight: '800' }} numberOfLines={1}>
              {media.fileName || 'Trade_Document.pdf'}
            </Text>
            <Text style={{ color: T.sub, fontSize: 11 }}>{media.fileSize || 'Document'}</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderGlobalCopilotOverlay = () => {
    if (!isLoggedIn || showSplash) return null;

    const useCompactSquare = activeTab === 'mandi' || activeTab === 'logistics';

    return (
      <>
        {!copilotOpen ? (
          <SetuAiFloatingTrigger
            isDark={isDark}
            compactSquare={useCompactSquare}
            capsuleSource={COPILOT_CAPSULE_IMG}
            squareSource={COPILOT_SQUARE_IMG}
            onPress={() => openCopilotWithContext(currentScreenContext)}
          />
        ) : null}

        {copilotOpen ? (
          <SetuAiCopilotScreen
            isDark={isDark}
            floatingWindow={copilotFloatingWindow}
            currentContext={copilotContext || currentScreenContext}
            onClose={() => setCopilotOpen(false)}
            onToggleExpand={() => setCopilotFloatingWindow((prev) => !prev)}
            onApplyDraftToScreen={handleApplyDraftFromCopilot}
          />
        ) : null}
      </>
    );
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showSettingsScreen) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <SettingsScreen
          isDark={isDark}
          themeMode={themeMode}
          onChangeThemeMode={(nextMode) => setThemeMode(nextMode)}
          onClose={() => setShowSettingsScreen(false)}
          onOpenAiCopilot={() => {
            setShowSettingsScreen(false);
            openCopilotWithContext({
              screenName: 'SettingsScreen',
              title: 'Settings & Preferences',
              summary: `Theme: ${themeMode}`,
            });
          }}
          onSignOut={() => {
            setShowSettingsScreen(false);
            setIsLoggedIn(false);
          }}
        />
        {renderGlobalCopilotOverlay()}
      </View>
    );
  }

  if (showCreatePostScreen) {
    return (
      <View style={{ flex: 1, backgroundColor: '#07121E' }}>
        <CreatePostScreen
          onClose={() => {
            setShowCreatePostScreen(false);
            setAppliedDraftForCreate(null);
          }}
          onOpenAiCopilot={(ctxPayload) => openCopilotWithContext(ctxPayload)}
          appliedDraft={appliedDraftForCreate}
          onConsumedAppliedDraft={() => setAppliedDraftForCreate(null)}
          onPublishPost={(newPost) => {
            setPosts((prev) => [
              {
                ...newPost,
                initials: (userName || 'TS')
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase(),
                trader_name: userName,
                trader_role: `${userCompany} • Just now`,
                qty: newPost.qty || 'Bulk / Lot',
                port: newPost.port || 'EXIM / Domestic',
                price: newPost.price || 'Best Quote',
                phone: '+919826100000',
                comments: [],
              },
              ...prev,
            ]);
            setAppliedDraftForCreate(null);
            setHomeSubTab('feed');
            setActiveTab('feed');
          }}
        />
        {renderGlobalCopilotOverlay()}
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#060D12', justifyContent: 'center', padding: 20 }}>
        <StatusBar barStyle="light-content" backgroundColor="#060D12" />
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
        <TouchableOpacity style={styles.mBtn} onPress={() => setIsLoggedIn(true)}>
          <Text style={styles.mBtnTxt}>Continue to Trade SETUU →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const visiblePosts = posts.filter((p) => {
    const okType = selectedPostType === 'All' || p.post_type === selectedPostType;
    const combined = `${p.title} ${p.desc || ''} ${p.trader_name} ${p.port || ''} ${p.post_type || ''}`;
    const okTag = !activeHashtag || smartSearchMatch(activeHashtag, combined);
    const okSearch = !searchQuery.trim() || smartSearchMatch(searchQuery, combined);
    return okType && okTag && okSearch;
  });

  const visibleNews = newsList.filter((n) => {
    if (!searchQuery.trim()) return true;
    return smartSearchMatch(searchQuery, `${n.title} ${n.summary} ${n.source}`);
  });

  const showTopGlobalHeader = activeTab !== 'mandi' && activeTab !== 'logistics';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, paddingTop: Platform.OS === 'android' ? 4 : 0 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="#060D12" />

      {/* CLEAN TOP HEADER + COMPLETE SEARCH BAR WITH VOICE & OPTIONS */}
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
                EXIM & Logistics
              </Text>
            </View>
          </TouchableOpacity>

          <View style={hdr.searchWrap}>
            <Text style={hdr.searchIcon}>🔍</Text>
            <TextInput
              style={hdr.searchInput}
              placeholder="Search rice, maize, ports, FOB..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={hdr.clearBtn}>
                <Text style={hdr.clearBtnTxt}>✕</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setVoiceSearchDraft(searchQuery);
                setVoiceSearchVisible(true);
              }}
              style={hdr.micBtn}
            >
              <Text style={hdr.micTxt}>🎙</Text>
            </TouchableOpacity>
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
            onPress={() => setShowSettingsScreen(true)}
          >
            <Text style={hdr.iconGlyph}>⚙️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TAB 1: Trade Feed | EXIM News + Built-in Filters */}
      {activeTab === 'feed' && (
        <View style={{ flex: 1 }}>
          <View style={[styles.twoToggleBar, { backgroundColor: T.card, borderBottomColor: T.border }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setHomeSubTab('feed')}
              style={[styles.twoToggleBtn, homeSubTab === 'feed' && styles.twoToggleBtnActive]}
            >
              <Text style={[styles.twoToggleTxt, homeSubTab === 'feed' && styles.twoToggleTxtActive]}>
                Trade Feed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setHomeSubTab('news')}
              style={[styles.twoToggleBtn, homeSubTab === 'news' && styles.twoToggleBtnActive]}
            >
              <Text style={[styles.twoToggleTxt, homeSubTab === 'news' && styles.twoToggleTxtActive]}>
                EXIM News
              </Text>
            </TouchableOpacity>
          </View>

          {homeSubTab === 'feed' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterStrip}
              style={{ backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border }}
            >
              {POST_TYPE_FILTERS.map((flt) => {
                const active = selectedPostType === flt;
                return (
                  <TouchableOpacity
                    key={flt}
                    activeOpacity={0.85}
                    onPress={() => setSelectedPostType(flt)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipTxt, active && styles.filterChipTxtActive]}>
                      {flt === 'All' ? 'All Posts' : flt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {activeHashtag ? (
            <View style={styles.activeTagBanner}>
              <Text style={styles.activeTagBannerTxt}>
                Sector Focus: {activeHashtag}
              </Text>
              <TouchableOpacity onPress={() => setActiveHashtag('')}>
                <Text style={styles.clearTagTxt}>Clear ✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {homeSubTab === 'news' ? (
            <ScrollView contentContainerStyle={{ paddingBottom: 105 }}>
              {visibleNews.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  activeOpacity={0.9}
                  onPress={() => setSelectedNews(n)}
                  style={[styles.spaciousCard, { backgroundColor: T.card, borderColor: T.border }]}
                >
                  <View style={styles.rowBetween}>
                    <Text style={{ color: '#2DD4BF', fontSize: 12, fontWeight: '800' }}>
                      {n.source} • {n.date}
                    </Text>
                    <TouchableOpacity onPress={() => shareText(n.title, n.summary)}>
                      <Text style={{ fontSize: 16 }}>📤</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={{ color: T.text, fontSize: 16.5, fontWeight: '900', marginTop: 8, lineHeight: 23 }}>
                    {n.title}
                  </Text>
                  <Text style={{ color: T.sub, fontSize: 13.5, marginTop: 6, lineHeight: 20 }} numberOfLines={3}>
                    {n.summary}
                  </Text>

                  {renderTranslationBlock(n.id, n.title, n.summary)}

                  <View style={styles.newsFooterRow}>
                    <Text style={{ color: '#2DD4BF', fontSize: 12.5, fontWeight: '800' }}>
                      Read Complete News Inside App →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 105 }}>
              {visiblePosts.length === 0 ? (
                <View style={[styles.spaciousCard, { backgroundColor: T.card, borderColor: T.border, alignItems: 'center' }]}>
                  <Text style={{ color: T.text, fontSize: 15, fontWeight: '800' }}>
                    No matching trade posts found
                  </Text>
                  <TouchableOpacity
                    style={[styles.mBtn, { marginTop: 12, paddingHorizontal: 18 }]}
                    onPress={() => {
                      setActiveHashtag('');
                      setSearchQuery('');
                      setSelectedPostType('All');
                    }}
                  >
                    <Text style={styles.mBtnTxt}>Reset Filters</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                visiblePosts.map((post) => {
                  const liked = likedIds.includes(post.id);
                  const saved = savedIds.includes(post.id);
                  const isExpanded = Boolean(expandedPosts[post.id]);
                  const bodyText = post.desc || '';
                  const isLongText = bodyText.length > 155 || bodyText.split('\n').length > 3;
                  const tags = extractHashtags(`${post.title} ${bodyText}`);
                  const safeLinks = extractSafeLinks(`${post.title} ${bodyText}`);

                  return (
                    <View
                      key={post.id}
                      style={[styles.spaciousCard, { backgroundColor: T.card, borderColor: T.border }]}
                    >
                      <View style={styles.rowBetween}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <View style={styles.avatarCircle}>
                            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>
                              {post.initials || 'TS'}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: T.text, fontSize: 15, fontWeight: '800' }}>
                              {post.trader_name}
                            </Text>
                            <Text style={{ color: T.sub, fontSize: 11.5, marginTop: 1 }}>
                              {post.trader_role}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.offerPill}>{post.post_type}</Text>
                      </View>

                      <Text style={{ color: T.text, fontSize: 16.5, fontWeight: '900', marginTop: 12, lineHeight: 23 }}>
                        {post.title}
                      </Text>

                      {!!bodyText && (
                        <View style={{ marginTop: 6 }}>
                          <Text
                            style={{ color: T.sub, fontSize: 14, lineHeight: 21 }}
                            numberOfLines={isExpanded ? undefined : 3}
                          >
                            {bodyText}
                          </Text>
                          {isLongText && (
                            <TouchableOpacity
                              onPress={() => toggleSeeMore(post.id)}
                              style={{ marginTop: 4, alignSelf: 'flex-start' }}
                            >
                              <Text style={styles.seeMoreTxt}>
                                {isExpanded ? 'Show less' : 'See more'}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      {safeLinks.length > 0 && (
                        <View style={styles.safeLinkRow}>
                          {safeLinks.map((lnk) => (
                            <TouchableOpacity
                              key={lnk}
                              style={styles.safeLinkBtn}
                              onPress={() => openFilteredLink(lnk)}
                            >
                              <Text style={styles.safeLinkTxt} numberOfLines={1}>
                                🔗 Open Website / Card →
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {tags.length > 0 && (
                        <View style={styles.hashtagRow}>
                          {tags.map((tag) => {
                            const selected = activeHashtag.toLowerCase() === tag.toLowerCase();
                            return (
                              <TouchableOpacity
                                key={tag}
                                style={[styles.hashtagChip, selected && styles.hashtagChipActive]}
                                onPress={() => setActiveHashtag(selected ? '' : tag)}
                              >
                                <Text style={[styles.hashtagTxt, selected && styles.hashtagTxtActive]}>
                                  {tag}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}

                      {renderTranslationBlock(post.id, post.title, bodyText)}
                      {renderFeedMedia(post.media)}

                      <View style={[styles.specStrip, { borderTopColor: T.border, borderBottomColor: T.border }]}>
                        <View style={styles.specCol}>
                          <Text style={{ color: T.sub, fontSize: 10.5, fontWeight: '700' }}>QUANTITY</Text>
                          <Text style={{ color: T.text, fontSize: 13.5, fontWeight: '800', marginTop: 3 }}>
                            {post.qty}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.specCol,
                            { borderLeftWidth: 1, borderRightWidth: 1, borderColor: T.border, paddingHorizontal: 10 },
                          ]}
                        >
                          <Text style={{ color: T.sub, fontSize: 10.5, fontWeight: '700' }}>PORT / ROUTE</Text>
                          <Text
                            style={{ color: T.text, fontSize: 13.5, fontWeight: '800', marginTop: 3 }}
                            numberOfLines={1}
                          >
                            {post.port}
                          </Text>
                        </View>
                        <View style={[styles.specCol, { paddingLeft: 10 }]}>
                          <Text style={{ color: T.sub, fontSize: 10.5, fontWeight: '700' }}>TARGET RATE</Text>
                          <Text style={{ color: '#14B8A6', fontSize: 13.5, fontWeight: '900', marginTop: 3 }}>
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
                          <Text style={{ color: liked ? '#14B8A6' : T.sub, fontSize: 12.5, fontWeight: '800' }}>
                            {liked ? '❤️ Liked' : '🤍 Like'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.liActBtn} onPress={() => setCommentPost(post)}>
                          <Text style={{ color: T.sub, fontSize: 12.5, fontWeight: '800' }}>
                            💬 ({post.comments?.length || 0})
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.liActBtn}
                          onPress={() =>
                            setSavedIds(saved ? savedIds.filter((i) => i !== post.id) : [...savedIds, post.id])
                          }
                        >
                          <Text style={{ color: saved ? T.gold : T.sub, fontSize: 12.5, fontWeight: '800' }}>
                            {saved ? '🔖 Saved' : '📑 Save'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.liActBtn}
                          onPress={() => shareText(post.title, `${post.qty} | ${post.port} | ${post.price}`)}
                        >
                          <Text style={{ color: T.sub, fontSize: 12.5, fontWeight: '800' }}>📤 Share</Text>
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
                })
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* TAB 2: MARKET PULSE */}
      {activeTab === 'mandi' && (
        <MarketPulseScreen
          theme={themeString}
          onBackToApp={() => switchTab('feed')}
        />
      )}

      {/* TAB 4: GLOBAL LOGISTICS HUB */}
      {activeTab === 'logistics' && (
        <GlobalLogisticsHubScreen
          theme={themeString}
          onExitHub={() => switchTab('feed')}
        />
      )}

      {/* TAB 5: SERVICE HUB */}
      {activeTab === 'services' && (
        <ServiceHubScreen
          theme={themeString}
          isPaid={isPaid}
          vaultBalance={vaultBalance}
          onDeductVault={(amt) => setVaultBalance((v) => Math.max(0, v - amt))}
          onOpenCalc={() => switchTab('services')}
          onOpenLogistics={() => switchTab('logistics')}
        />
      )}

      {/* BOTTOM NAVIGATION WITH UPLOADED REFERENCE IMAGE + 5 EXACT LABELS */}
      <View style={styles.bottomDockOuter}>
        <View style={styles.bottomDockFrame}>
          <Image
            source={BOTTOM_NAV_IMG}
            resizeMode="cover"
            style={styles.bottomDockBgImage}
          />

          <View style={styles.bottomDockOverlay}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.navSlot, activeTab === 'feed' && styles.navSlotActive]}
              onPress={() => switchTab('feed')}
            >
              <Text
                style={[styles.navLbl, activeTab === 'feed' && styles.navLblActive]}
                numberOfLines={1}
              >
                Trade Feed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.navSlot, activeTab === 'mandi' && styles.navSlotActive]}
              onPress={() => switchTab('mandi')}
            >
              <Text
                style={[styles.navLbl, activeTab === 'mandi' && styles.navLblActive]}
                numberOfLines={1}
              >
                Market Pulse
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.centerCreateSlot}
              onPress={() => setShowCreatePostScreen(true)}
            >
              <View style={styles.centerPlusCircle}>
                <Text style={styles.centerPlusTxt}>+</Text>
              </View>
              <Text style={styles.centerLbl} numberOfLines={1}>
                Create
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.navSlot, activeTab === 'logistics' && styles.navSlotActive]}
              onPress={() => switchTab('logistics')}
            >
              <Text
                style={[styles.navLblTwoLine, activeTab === 'logistics' && styles.navLblActive]}
                numberOfLines={2}
              >
                {'Global\nLogistics Hub'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.navSlot, activeTab === 'services' && styles.navSlotActive]}
              onPress={() => switchTab('services')}
            >
              <Text
                style={[styles.navLbl, activeTab === 'services' && styles.navLblActive]}
                numberOfLines={1}
              >
                Service Hub
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* VOICE / DICTATION SEARCH MODAL */}
      <Modal
        visible={voiceSearchVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVoiceSearchVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.mHead}>Voice / Smart Search</Text>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 8 }}>
              Bol kar ya keyboard mic se 3+ letters/words bolen — commodity, port ya post turant filter hoga.
            </Text>
            <TextInput
              style={[styles.mInp, { minHeight: 72 }]}
              placeholder="e.g., parboiled rice jnpt or yellow maize..."
              placeholderTextColor="#64748B"
              value={voiceSearchDraft}
              onChangeText={setVoiceSearchDraft}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[styles.readerSecondaryBtn, { flex: 1, alignItems: 'center' }]}
                onPress={() => setVoiceSearchVisible(false)}
              >
                <Text style={{ color: '#E2E8F0', fontSize: 12.5, fontWeight: '800' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mBtn}
                onPress={() => {
                  setSearchQuery(voiceSearchDraft.trim());
                  setVoiceSearchVisible(false);
                }}
              >
                <Text style={styles.mBtnTxt}>Search Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FULL IN-APP NEWS READER MODAL */}
      <Modal visible={!!selectedNews} transparent animationType="slide">
        <SafeAreaView style={styles.readerBackdrop}>
          <View style={styles.readerCard}>
            <View style={styles.readerHeader}>
              <Text style={{ color: '#2DD4BF', fontSize: 12, fontWeight: '800', flex: 1 }} numberOfLines={1}>
                {selectedNews?.source || 'EXIM News'} • {selectedNews?.date || ''}
              </Text>
              <TouchableOpacity onPress={() => setSelectedNews(null)} style={styles.readerCloseBtn}>
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 430 }} showsVerticalScrollIndicator={false}>
              <Text style={{ color: '#FFF', fontSize: 17.5, fontWeight: '900', lineHeight: 24 }}>
                {selectedNews?.title}
              </Text>
              <Text style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 22, marginTop: 10 }}>
                {selectedNews?.summary}
              </Text>
              {selectedNews &&
                renderTranslationBlock(`reader-${selectedNews.id}`, selectedNews.title, selectedNews.summary)}
            </ScrollView>

            <View style={styles.readerActionsRow}>
              <TouchableOpacity
                style={styles.readerSecondaryBtn}
                onPress={() => selectedNews && shareText(selectedNews.title, selectedNews.summary)}
              >
                <Text style={{ color: '#E2E8F0', fontSize: 12.5, fontWeight: '800' }}>Share</Text>
              </TouchableOpacity>

              {selectedNews?.url ? (
                <TouchableOpacity
                  style={styles.mBtn}
                  onPress={() => openFilteredLink(selectedNews.url)}
                >
                  <Text style={styles.mBtnTxt}>Open Source Link →</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </SafeAreaView>
      </Modal>

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
                  else if (m.id === 'settings') setShowSettingsScreen(true);
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
                          post_type: 'Sponsored',
                          initials: 'NJ',
                          trader_name: userCompany,
                          trader_role: 'Sponsored Promotion',
                          title: adTitle || 'Featured Export Offer',
                          desc: `${adDesc || 'Direct verified exporter supply.'}\n\n#FeaturedExport #TradeSETUU`,
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
                  <TouchableOpacity
                    style={styles.mBtn}
                    onPress={() => setThemeMode(isDark ? 'Light' : 'Dark')}
                  >
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

      {/* COMMENT MODAL */}
      <Modal visible={!!commentPost} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.mHead}>Comments — {commentPost?.trader_name}</Text>
            {(commentPost?.comments || []).map((c, idx) => (
              <Text key={idx} style={{ color: '#CBD5E1', fontSize: 12.5, marginBottom: 6 }}>
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

      {/* GLOBAL MOVABLE SETU AI CO-PILOT TRIGGER & FLOATING WINDOW */}
      {renderGlobalCopilotOverlay()}
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
    maxWidth: 120,
    marginRight: 6,
  },
  logoRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    fontSize: 12.5,
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
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C1821',
    borderRadius: 18,
    paddingHorizontal: 8,
    height: 34,
    borderWidth: 1,
    borderColor: '#1B3442',
  },
  searchIcon: {
    fontSize: 11,
    marginRight: 4,
    opacity: 0.85,
  },
  searchInput: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 11.5,
    paddingVertical: 0,
  },
  clearBtn: {
    paddingHorizontal: 4,
  },
  clearBtnTxt: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  micBtn: {
    paddingLeft: 4,
  },
  micTxt: {
    fontSize: 12,
  },
  iconBtn: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#0B1720',
    borderWidth: 1,
    borderColor: '#1B3A46',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    position: 'relative',
  },
  iconGlyph: {
    fontSize: 12.5,
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
  twoToggleBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
  },
  twoToggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 34, 45, 0.7)',
    borderWidth: 1,
    borderColor: '#1B3442',
  },
  twoToggleBtnActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.26)',
    borderColor: '#2DD4BF',
  },
  twoToggleTxt: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
  },
  twoToggleTxtActive: {
    color: '#FFFFFF',
  },
  filterStrip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 7,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#0D1B26',
    borderWidth: 1,
    borderColor: '#1B3442',
  },
  filterChipActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.3)',
    borderColor: '#2DD4BF',
  },
  filterChipTxt: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTxtActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  activeTagBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.16)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 212, 191, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  activeTagBannerTxt: {
    color: '#5EEAD4',
    fontSize: 12,
    fontWeight: '800',
  },
  clearTagTxt: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '800',
  },
  newsFooterRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#162C37',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  spaciousCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.75,
    borderBottomWidth: 0.75,
    marginBottom: 12,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerPill: {
    color: '#14B8A6',
    fontSize: 11.5,
    fontWeight: '800',
    backgroundColor: 'rgba(13,148,136,0.14)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  seeMoreTxt: {
    color: '#38BDF8',
    fontSize: 12.5,
    fontWeight: '800',
  },
  safeLinkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  safeLinkBtn: {
    backgroundColor: 'rgba(14, 165, 233, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    maxWidth: '100%',
  },
  safeLinkTxt: {
    color: '#7DD3FC',
    fontSize: 12,
    fontWeight: '800',
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  hashtagChip: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.28)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hashtagChipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#5EEAD4',
  },
  hashtagTxt: {
    color: '#2DD4BF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  hashtagTxtActive: {
    color: '#FFFFFF',
  },
  transWrap: { marginTop: 10 },
  transToggleTxt: { color: '#38BDF8', fontSize: 11.5, fontWeight: '800' },
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
  transBox: { marginTop: 6, padding: 9, borderRadius: 8, borderWidth: 1 },
  videoBox: {
    marginTop: 12,
    height: 225,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#050C14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoThumb: { width: '100%', height: '100%', opacity: 0.75 },
  videoBadge: {
    position: 'absolute',
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.68)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 8,
  },
  feedImg: { marginTop: 12, width: '100%', height: 170, borderRadius: 12 },
  pdfCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  pdfTag: {
    color: '#F87171',
    backgroundColor: 'rgba(239,68,68,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '900',
  },
  specStrip: { flexDirection: 'row', borderTopWidth: 0.6, borderBottomWidth: 0.6, paddingVertical: 11, marginTop: 14 },
  specCol: { flex: 1 },
  liActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  liActBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  waCircle: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Navigation with Reference Image + 5 Labels
  bottomDockOuter: {
    backgroundColor: '#050B10',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 14 : 8,
  },
  bottomDockFrame: {
    position: 'relative',
    height: 66,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#07141C',
    borderWidth: 1,
    borderColor: '#163844',
    justifyContent: 'flex-end',
  },
  bottomDockBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.06 }],
  },
  bottomDockOverlay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 4,
    paddingBottom: 5,
    backgroundColor: 'rgba(5, 13, 19, 0.32)',
  },
  navSlot: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 3,
    paddingHorizontal: 2,
  },
  navSlotActive: {
    backgroundColor: 'rgba(32, 191, 174, 0.16)',
    borderBottomWidth: 2,
    borderBottomColor: '#2DD4BF',
  },
  navLbl: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  navLblTwoLine: {
    color: '#E2E8F0',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 10.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  navLblActive: {
    color: '#5EEAD4',
  },
  centerCreateSlot: {
    width: 64,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 3,
  },
  centerPlusCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(13, 148, 136, 0.25)',
    borderWidth: 1.5,
    borderColor: '#5EEAD4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  centerPlusTxt: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  centerLbl: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // In-App Full News Reader
  readerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    padding: 14,
  },
  readerCard: {
    backgroundColor: '#09151E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3E4B',
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#152B36',
  },
  readerCloseBtn: {
    backgroundColor: '#162834',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  readerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  readerSecondaryBtn: {
    backgroundColor: '#132430',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#254252',
  },

  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', flexDirection: 'row' },
  drawerPanel: { width: '83%', backgroundColor: '#060D12', padding: 16, borderRightWidth: 1, borderRightColor: '#1E293B' },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  vaultCard: {
    backgroundColor: '#0B161E',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#C9B89A',
  },
  vaultAddBtn: { backgroundColor: '#0D9488', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  menuItem: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#09151E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C9B89A' },
  mHead: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  mInp: {
    backgroundColor: '#0B161E',
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 9,
  },
  mBtn: { flex: 1, backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
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
