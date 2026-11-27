// src/screens/HomeScreen.js

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Image,
  Share,
  Modal,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import TradeSetuuHeader from '../src/components/TradeSetuuHeader';
import { fetchEximNews } from '../services/exim-news-service';
import { translateText } from '../services/translationService';

const INITIAL_TRADE_POSTS = [
  {
    id: 'tp-1',
    company: 'ABC Global Exports',
    badge: 'Verified Business · India · 12m',
    type: 'Sell Offer',
    title: 'IR64 Non-Basmati Rice Available for Export',
    body: 'Export-ready stock available. Share destination port, quantity, and packing preference for formal quotation.',
    meta: 'Qty: 500 MT · Packing: 50 kg PP · Origin: India',
    cta: 'Contact Seller →',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',
    },
  },
  {
    id: 'tp-2',
    company: 'Shanghai Grain & Feed Co.',
    badge: 'Verified Importer · China · 25m',
    type: 'Buy Requirement',
    title: '采购黄玉米粒及碎米，目的港上海洋山港',
    body: '寻求长期稳定的印度黄玉米及碎米供应商，需提供植物检疫证书及第三方质检报告，请报CIF上海价格。',
    meta: 'Target: Shanghai · Monthly Lot · CIF',
    cta: 'Respond to Requirement →',
    media: {
      type: 'pdf',
      fileName: 'Import_Specs_Shanghai_Lot2026.pdf',
      fileSize: '1.8 MB · PDF',
      url: '',
    },
  },
  {
    id: 'tp-3',
    company: 'Gulf Maritime & Logistics',
    badge: 'Logistics Partner · UAE · 1h',
    type: 'Logistics',
    title: 'JNPT to Jebel Ali Weekly Reefer & Dry Container Slots Open',
    body: 'Guaranteed weekly allocation with fast customs clearance support at Nhava Sheva and Jebel Ali.',
    meta: 'Route: INNSA → AEJEA · 20ft / 40ft HC',
    cta: 'Book Slot →',
    media: {
      type: 'video',
      thumbnail:
        'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1000&q=80',
      duration: '0:42',
      url: '',
    },
  },
];

const NEWS_FILTERS = ['All', 'India', 'Global', 'Shipping', 'Customs'];

export default function HomeScreen({
  posts = INITIAL_TRADE_POSTS,
  onOpenMenu,
  onOpenChat,
  onOpenNotifications,
  onOpenSettings,
  onOpenOpportunities,
  onContactPost,
}) {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'news'
  const [searchQuery, setSearchQuery] = useState('');
  const [newsFilter, setNewsFilter] = useState('All');

  // EXIM News state
  const [newsArticles, setNewsArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsNotice, setNewsNotice] = useState(null);

  // Full Article Reader Modal state
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Translation state per item id: { [id]: { visible: boolean, lang: 'en' | 'hi', text: string, loading: boolean } }
  const [translations, setTranslations] = useState({});

  const loadNews = async (forceRefresh = false) => {
    setLoadingNews(true);
    const res = await fetchEximNews({ forceRefresh });
    setNewsArticles(res.articles);
    setNewsNotice(res.liveError);
    setLoadingNews(false);
  };

  useEffect(() => {
    if (activeTab === 'news' && newsArticles.length === 0) {
      loadNews(false);
    }
  }, [activeTab]);

  const handleToggleTranslation = async (id, title, body, preferredLang) => {
    const current = translations[id];
    const targetLang = preferredLang || current?.lang || 'en';

    // If already visible and user didn't switch language, hide translation
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

    const combinedText = `${title}\n${body}`;
    const translated = await translateText(combinedText, targetLang);

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

  const handleShareItem = async ({ title, summary, url, source }) => {
    try {
      const lines = [
        title,
        summary ? `\n${summary}` : '',
        source ? `\nSource: ${source}` : '',
        url ? `\n${url}` : '',
        '\nShared via Trade SETUU',
      ].filter(Boolean);

      await Share.share({
        message: lines.join(''),
        title,
      });
    } catch (e) {
      // User dismissed share sheet
    }
  };

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.body?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const filteredNews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return newsArticles.filter((item) => {
      const matchesFilter =
        newsFilter === 'All' ||
        item.countryTag === newsFilter ||
        item.categoryTag === newsFilter;
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q) ||
        item.source?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [newsArticles, newsFilter, searchQuery]);

  const renderTranslationControls = (id, title, body) => {
    const tState = translations[id];
    const activeLang = tState?.lang || 'en';

    return (
      <View style={styles.translationSection}>
        <View style={styles.translationBar}>
          <TouchableOpacity
            onPress={() => handleToggleTranslation(id, title, body)}
            style={styles.translateToggleBtn}
          >
            <Text style={styles.translateToggleTxt}>
              {tState?.visible ? 'Show Original' : 'Show Translation'}
            </Text>
          </TouchableOpacity>

          <View style={styles.langSwitchRow}>
            {['en', 'hi'].map((code) => {
              const isSelected = activeLang === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.langPill, isSelected && styles.langPillActive]}
                  onPress={() => handleToggleTranslation(id, title, body, code)}
                >
                  <Text style={[styles.langPillTxt, isSelected && styles.langPillTxtActive]}>
                    {code === 'en' ? 'EN' : 'हिंदी'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {tState?.visible ? (
          <View style={styles.translatedBox}>
            {tState.loading ? (
              <Text style={styles.translatingTxt}>Translating...</Text>
            ) : (
              <Text style={styles.translatedBodyTxt}>{tState.text}</Text>
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const renderPostMedia = (media) => {
    if (!media) return null;

    // 1. Video: Large, prominent full-width container
    if (media.type === 'video') {
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.videoContainer}
          onPress={() => media.url && Linking.openURL(media.url).catch(() => {})}
        >
          {media.thumbnail ? (
            <Image source={{ uri: media.thumbnail }} style={styles.videoThumb} resizeMode="cover" />
          ) : null}
          <View style={styles.videoOverlay}>
            <View style={styles.playCircle}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={styles.videoDurationTxt}>Video · {media.duration || 'Play'}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // 2. Image: Medium, clean balanced height (smaller than video)
    if (media.type === 'image' && (media.url || media.uri)) {
      return (
        <Image
          source={{ uri: media.url || media.uri }}
          style={styles.postImage}
          resizeMode="cover"
        />
      );
    }

    // 3. PDF: Compact, clean document card
    if (media.type === 'pdf') {
      return (
        <TouchableOpacity
          style={styles.pdfCompactCard}
          onPress={() => media.url && Linking.openURL(media.url).catch(() => {})}
        >
          <View style={styles.pdfBadge}>
            <Text style={styles.pdfBadgeTxt}>PDF</Text>
          </View>
          <View style={styles.flexOne}>
            <Text style={styles.pdfFileName} numberOfLines={1}>
              {media.fileName || 'Trade_Document.pdf'}
            </Text>
            <Text style={styles.pdfFileMeta}>{media.fileSize || 'Document Attachment'}</Text>
          </View>
          <Text style={styles.ctaTxt}>Open</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <TradeSetuuHeader
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onOpenMenu={onOpenMenu}
        onOpenChat={onOpenChat}
        onOpenNotifications={onOpenNotifications}
        onOpenSettings={onOpenSettings}
      />

      {/* Two Primary Home Tabs: Trade Feed & EXIM News */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'feed' && styles.tabBtnActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[styles.tabTxt, activeTab === 'feed' && styles.tabTxtActive]}>
            Trade Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'news' && styles.tabBtnActive]}
          onPress={() => setActiveTab('news')}
        >
          <Text style={[styles.tabTxt, activeTab === 'news' && styles.tabTxtActive]}>
            EXIM News
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'feed' ? (
          <>
            {filteredPosts.map((post) => (
              <View key={post.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.flexOne}>
                    <Text style={styles.companyTxt}>{post.company}</Text>
                    <Text style={styles.metaSubTxt}>{post.badge}</Text>
                  </View>
                  <View style={styles.typePill}>
                    <Text style={styles.typePillTxt}>{post.type}</Text>
                  </View>
                </View>

                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postBody}>{post.body}</Text>

                {renderTranslationControls(post.id, post.title, post.body)}

                {renderPostMedia(post.media)}

                {post.meta ? <Text style={styles.specsTxt}>{post.meta}</Text> : null}

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    onPress={() =>
                      handleShareItem({
                        title: post.title,
                        summary: post.body,
                        source: post.company,
                      })
                    }
                  >
                    <Text style={styles.mutedAction}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => onContactPost && onContactPost(post)}>
                    <Text style={styles.ctaTxt}>{post.cta || 'Connect →'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Compact Trade Opportunity Signal */}
            <View style={styles.oppCard}>
              <Text style={styles.oppLabel}>TRADE OPPORTUNITY SIGNAL</Text>
              <Text style={styles.oppTitle}>
                Regional demand shifts & import policy alerts matching your trade activity
              </Text>
              <TouchableOpacity onPress={onOpenOpportunities}>
                <Text style={styles.ctaTxt}>View Opportunities →</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* EXIM News Filter Chips + Sync */}
            <View style={styles.filterRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {NEWS_FILTERS.map((f) => {
                  const selected = newsFilter === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      style={[styles.chip, selected && styles.chipActive]}
                      onPress={() => setNewsFilter(f)}
                    >
                      <Text style={[styles.chipTxt, selected && styles.chipTxtActive]}>{f}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={() => loadNews(true)}
                disabled={loadingNews}
              >
                <Text style={styles.refreshTxt}>{loadingNews ? '...' : 'Sync'}</Text>
              </TouchableOpacity>
            </View>

            {newsNotice ? (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeTxt}>{newsNotice}</Text>
              </View>
            ) : null}

            {loadingNews && newsArticles.length === 0 ? (
              <View style={styles.centerLoader}>
                <ActivityIndicator color="#14B8A6" />
                <Text style={styles.loaderTxt}>Fetching EXIM News...</Text>
              </View>
            ) : (
              filteredNews.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  style={styles.card}
                  onPress={() => setSelectedArticle(item)}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.tagRow}>
                      <View style={styles.typePill}>
                        <Text style={styles.typePillTxt}>{item.categoryTag}</Text>
                      </View>
                      <View style={styles.countryPill}>
                        <Text style={styles.countryPillTxt}>{item.countryTag}</Text>
                      </View>
                    </View>
                    <Text style={styles.metaSubTxt}>{item.source}</Text>
                  </View>

                  <Text style={styles.postTitle}>{item.title}</Text>
                  <Text style={styles.postBody}>{item.summary}</Text>

                  {renderTranslationControls(item.id, item.title, item.summary)}

                  <View style={styles.cardFooter}>
                    <TouchableOpacity onPress={() => handleShareItem(item)}>
                      <Text style={styles.mutedAction}>Share News</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setSelectedArticle(item)}>
                      <Text style={styles.ctaTxt}>Read Complete News →</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Complete News In-App Reader Modal */}
      <Modal
        visible={Boolean(selectedArticle)}
        animationType="slide"
        onRequestClose={() => setSelectedArticle(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedArticle(null)} style={styles.modalBtn}>
              <Text style={styles.modalBtnTxt}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.modalHeaderTitle} numberOfLines={1}>
              {selectedArticle?.source || 'EXIM News'}
            </Text>

            <TouchableOpacity
              onPress={() => selectedArticle && handleShareItem(selectedArticle)}
              style={styles.modalBtn}
            >
              <Text style={styles.ctaTxt}>Share</Text>
            </TouchableOpacity>
          </View>

          {selectedArticle?.url ? (
            <WebView
              source={{ uri: selectedArticle.url }}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.centerLoader}>
                  <ActivityIndicator color="#14B8A6" />
                  <Text style={styles.loaderTxt}>Loading full article...</Text>
                </View>
              )}
            />
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.postTitle}>{selectedArticle?.title}</Text>
              <Text style={styles.metaSubTxt}>
                {selectedArticle?.source} · {selectedArticle?.publishedAt}
              </Text>
              <Text style={[styles.postBody, { marginTop: 14 }]}>{selectedArticle?.summary}</Text>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07121E' },
  flexOne: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 12,
    paddingTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: '#14B8A6' },
  tabTxt: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  tabTxtActive: { color: '#FFFFFF' },
  scrollContent: { padding: 12, paddingBottom: 80 },
  card: {
    backgroundColor: '#0D1B2A',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  companyTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  metaSubTxt: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  typePill: {
    backgroundColor: 'rgba(20, 184, 166, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typePillTxt: { color: '#2DD4BF', fontSize: 11, fontWeight: '700' },
  tagRow: { flexDirection: 'row', gap: 6 },
  countryPill: {
    backgroundColor: 'rgba(148, 163, 184, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countryPillTxt: { color: '#CBD5E1', fontSize: 11, fontWeight: '700' },
  postTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', lineHeight: 20 },
  postBody: { color: '#CBD5E1', fontSize: 12, lineHeight: 18, marginTop: 6 },

  // Translation controls
  translationSection: { marginTop: 8 },
  translationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  translateToggleBtn: { paddingVertical: 4 },
  translateToggleTxt: { color: '#38BDF8', fontSize: 11, fontWeight: '700' },
  langSwitchRow: { flexDirection: 'row', gap: 5 },
  langPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#253952',
    backgroundColor: '#0A1624',
  },
  langPillActive: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.16)',
  },
  langPillTxt: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
  langPillTxtActive: { color: '#2DD4BF' },
  translatedBox: {
    marginTop: 6,
    padding: 9,
    borderRadius: 8,
    backgroundColor: '#091522',
    borderWidth: 1,
    borderColor: '#1B3048',
  },
  translatingTxt: { color: '#94A3B8', fontSize: 11, fontStyle: 'italic' },
  translatedBodyTxt: { color: '#E2E8F0', fontSize: 12, lineHeight: 18 },

  // Media sizing: Video (Large) > Image (Medium) > PDF (Compact)
  videoContainer: {
    marginTop: 10,
    width: '100%',
    height: 225,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#050C14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoThumb: { width: '100%', height: '100%', opacity: 0.78 },
  videoOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(13, 148, 136, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#FFFFFF', fontSize: 18, marginLeft: 3 },
  videoDurationTxt: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  postImage: {
    marginTop: 10,
    width: '100%',
    height: 155,
    borderRadius: 10,
    backgroundColor: '#0A1624',
  },
  pdfCompactCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 9,
    backgroundColor: '#091522',
    borderWidth: 1,
    borderColor: '#1E324A',
  },
  pdfBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pdfBadgeTxt: { color: '#F87171', fontSize: 11, fontWeight: '800' },
  pdfFileName: { color: '#E2E8F0', fontSize: 12, fontWeight: '700' },
  pdfFileMeta: { color: '#94A3B8', fontSize: 10, marginTop: 2 },

  specsTxt: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#16263A',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#16263A',
  },
  mutedAction: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  ctaTxt: { color: '#2DD4BF', fontSize: 12, fontWeight: '800' },
  oppCard: {
    backgroundColor: '#0B1928',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    marginBottom: 12,
  },
  oppLabel: { color: '#2DD4BF', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  oppTitle: { color: '#E2E8F0', fontSize: 13, fontWeight: '700', marginVertical: 6 },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  chip: {
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 7,
  },
  chipActive: { backgroundColor: '#0D9488', borderColor: '#0D9488' },
  chipTxt: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  chipTxtActive: { color: '#FFFFFF' },
  refreshBtn: {
    marginLeft: 6,
    backgroundColor: '#16263A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253952',
  },
  refreshTxt: { color: '#E2E8F0', fontSize: 12, fontWeight: '700' },
  noticeBox: {
    backgroundColor: 'rgba(202, 138, 4, 0.14)',
    borderColor: 'rgba(202, 138, 4, 0.35)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  noticeTxt: { color: '#FDE047', fontSize: 11 },
  centerLoader: { paddingVertical: 30, alignItems: 'center' },
  loaderTxt: { color: '#94A3B8', fontSize: 12, marginTop: 8 },
  modalContainer: { flex: 1, backgroundColor: '#07121E' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0D1B2A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  modalBtnTxt: { color: '#E2E8F0', fontSize: 13, fontWeight: '700' },
  modalHeaderTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginHorizontal: 8,
  },
});
