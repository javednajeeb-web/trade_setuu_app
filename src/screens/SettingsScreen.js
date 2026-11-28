// src/screens/SettingsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  TextInput,
  Alert,
  BackHandler,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';

export const DEFAULT_APP_SETTINGS = {
  // 01. Appearance & Language
  themeMode: 'system', // 'system' | 'dark' | 'light'
  appLanguage: 'English',
  translationLanguage: 'Hindi',
  autoTranslation: false,
  showOriginalText: true,

  // 02. Trade Preferences
  defaultHomeScreen: 'Trade Feed', // 'Trade Feed' | 'EXIM News'
  tradeFocus: 'Both', // 'Export' | 'Import' | 'Both'
  preferredMarkets: ['UAE', 'Vietnam', 'Saudi Arabia', 'Indonesia'],
  preferredProducts: ['Rice', 'Maize', 'Spices'],
  currency: 'USD', // 'USD' | 'INR' | 'EUR' | 'AED'
  measurementUnit: 'MT', // 'MT' | 'KG' | 'Quintal' | 'CBM'
  incoterms: 'FOB', // 'FOB' | 'CIF' | 'CFR' | 'EXW'

  // 03. Global Market Intelligence
  globalMonitoring: true,
  demandAlerts: true,
  priceMovementAlerts: true,
  newMarketAlerts: true,
  policyAlerts: true,
  alertSensitivity: 'Significant Changes Only', // 'Significant Changes Only' | 'All Market Updates'

  // 04. Notifications & AI
  notifBuyerReq: true,
  notifSellerOffers: true,
  notifPriceAlerts: true,
  notifEximRegulatory: true,
  notifMessages: true,
  channelInApp: true,
  channelPush: true,
  channelWhatsApp: false,
  quietHoursEnabled: false,
  aiAssistanceEnabled: true,
  aiWritingStyle: 'Professional Trade', // 'Professional Trade' | 'Short & Direct'
  aiVoiceInputEnabled: true,

  // 05. Account & Security
  whoCanViewProfile: 'Verified Traders', // 'Everyone' | 'Verified Traders' | 'Connections'
  whoCanViewPosts: 'Everyone', // 'Everyone' | 'Verified Traders' | 'Connections'
  whoCanMessageMe: 'Verified Traders', // 'Everyone' | 'Verified Traders' | 'Connections' | 'No One'
  loginAlerts: true,
  safeLinkFilter: true,

  // 06. Payments, Wallet & Escrow
  defaultPaymentMethod: 'UPI / Bank Transfer', // 'UPI / Bank Transfer' | 'Payment Gateway' | 'Setuu Wallet'
  paymentAuthMethod: 'OTP + PIN', // Mandatory re-auth method (cannot be disabled)
  walletAutoDeduction: false, // Default OFF per security rule
  walletAutoScope: 'Ad Boosts Only',
  walletLowBalanceAlert: '500',
  walletMonthlyLimit: '25000',
  escrowNeutralLockDefault: true,
  escrowStatusAlerts: true,
  escrowMilestoneAlerts: true,

  // 07. App Management
  wifiOnlyMedia: false,
  mobileDataSaver: false,
  confirmExternalLinks: true,
};

const ALL_COUNTRIES = [
  'UAE',
  'Saudi Arabia',
  'Vietnam',
  'Indonesia',
  'Malaysia',
  'Bangladesh',
  'Oman',
  'Qatar',
  'Singapore',
  'USA',
];

const ALL_PRODUCTS = [
  'Rice',
  'Maize',
  'Wheat',
  'Spices',
  'Pulses',
  'Sugar',
  'Petroleum',
  'Chemicals',
  'Metals',
];

const SECTIONS = [
  {
    code: '01 · APPEARANCE & LANGUAGE',
    items: [
      { id: 'appearance', title: 'Theme & Appearance', subtitleKey: 'theme' },
      { id: 'language', title: 'Language & Translation', subtitleKey: 'language' },
    ],
  },
  {
    code: '02 · TRADE PREFERENCES',
    items: [
      { id: 'tradeFeed', title: 'Trade Feed Preferences', subtitleKey: 'tradeFeed' },
      { id: 'regionCurrency', title: 'Region & Currency', subtitleKey: 'regionCurrency' },
    ],
  },
  {
    code: '03 · GLOBAL MARKET INTELLIGENCE',
    items: [
      { id: 'marketIntel', title: 'Global Demand & Price Alerts', subtitleKey: 'marketIntel' },
    ],
  },
  {
    code: '04 · NOTIFICATIONS & AI',
    items: [
      { id: 'notifications', title: 'Notifications & Alerts', subtitleKey: 'notifications' },
      { id: 'setuAi', title: 'SETU AI Preferences', subtitleKey: 'setuAi' },
    ],
  },
  {
    code: '05 · ACCOUNT & SECURITY',
    items: [
      { id: 'account', title: 'Account Settings', subtitleKey: 'account' },
      { id: 'security', title: 'Security & Privacy', subtitleKey: 'security' },
    ],
  },
  {
    code: '06 · PAYMENTS, WALLET & ESCROW',
    items: [
      { id: 'payments', title: 'Payments, Wallet & Escrow', subtitleKey: 'payments' },
    ],
  },
  {
    code: '07 · APP MANAGEMENT',
    items: [
      { id: 'storage', title: 'Storage & Data', subtitleKey: 'storage' },
      { id: 'appPrefs', title: 'App Preferences', subtitleKey: 'appPrefs' },
    ],
  },
  {
    code: '08 · ABOUT & LEGAL',
    items: [
      { id: 'about', title: 'About Trade SETUU', subtitleKey: 'about' },
    ],
  },
];

export default function SettingsScreen({
  onClose,
  settings = DEFAULT_APP_SETTINGS,
  onUpdateSettings,
  userInfo = {
    name: 'Najeeb Javed',
    company: 'UA EXIM Overseas',
    role: 'Exporter & Trader',
    mobile: '+91 98261 00000',
    verified: true,
  },
  onClearTranslationCache,
  onLogout,
}) {
  const systemScheme = useColorScheme();
  const [localSettings, setLocalSettings] = useState({
    ...DEFAULT_APP_SETTINGS,
    ...settings,
  });
  const [activeSubScreen, setActiveSubScreen] = useState(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    setLocalSettings((prev) => ({ ...prev, ...settings }));
  }, [settings]);

  useEffect(() => {
    const onBack = () => {
      if (activeSubScreen) {
        setActiveSubScreen(null);
        return true;
      }
      if (typeof onClose === 'function') {
        onClose();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [activeSubScreen, onClose]);

  const effectiveMode =
    localSettings.themeMode === 'system'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : localSettings.themeMode;

  const isDark = effectiveMode === 'dark';

  // Exact Recommended Palette (No harsh bright glare in Light Mode)
  const C = isDark
    ? {
        bg: '#0C141D',
        card: '#151F29',
        cardAlt: '#1B2734',
        border: '#223140',
        text: '#E7EDF2',
        sub: '#93A3B3',
        teal: '#20BFAE',
        tealSoft: 'rgba(32, 191, 174, 0.14)',
        danger: '#F87171',
      }
    : {
        bg: '#F1F4F5',
        card: '#FFFFFF',
        cardAlt: '#E7ECEE',
        border: '#DCE3E6',
        text: '#25313A',
        sub: '#62727E',
        teal: '#168F88',
        tealSoft: 'rgba(22, 143, 136, 0.12)',
        danger: '#DC2626',
      };

  const updateKey = (key, value) => {
    const next = { ...localSettings, [key]: value };
    setLocalSettings(next);
    if (typeof onUpdateSettings === 'function') {
      onUpdateSettings(next);
    }
  };

  const toggleListValue = (key, item) => {
    const current = Array.isArray(localSettings[key]) ? localSettings[key] : [];
    const exists = current.includes(item);
    const next = exists ? current.filter((x) => x !== item) : [...current, item];
    updateKey(key, next);
  };

  const getRowSubtitle = (subtitleKey) => {
    switch (subtitleKey) {
      case 'theme':
        return localSettings.themeMode === 'system'
          ? `System Default (${isDark ? 'Dark' : 'Light'})`
          : localSettings.themeMode === 'dark'
          ? 'Dark Mode'
          : 'Light Mode';
      case 'language':
        return `${localSettings.appLanguage} · Translate to ${localSettings.translationLanguage}`;
      case 'tradeFeed':
        return `${localSettings.defaultHomeScreen} · ${localSettings.tradeFocus}`;
      case 'regionCurrency':
        return `${localSettings.currency} · ${localSettings.measurementUnit} · ${localSettings.incoterms}`;
      case 'marketIntel':
        return localSettings.globalMonitoring
          ? `Global ON · ${localSettings.preferredMarkets.length} countries`
          : 'Global Paused';
      case 'notifications':
        return localSettings.quietHoursEnabled ? 'Quiet Hours Active' : 'In-App & Push Active';
      case 'setuAi':
        return localSettings.aiAssistanceEnabled ? 'Optional Assistance ON' : 'Manual Mode Only';
      case 'account':
        return `${userInfo.company} · ${userInfo.verified ? 'Verified' : 'Standard'}`;
      case 'security':
        return `Profile: ${localSettings.whoCanViewProfile} · Safe Links ${localSettings.safeLinkFilter ? 'ON' : 'OFF'}`;
      case 'payments':
        return `${localSettings.defaultPaymentMethod} · Auto-Deduct ${localSettings.walletAutoDeduction ? 'ON' : 'OFF'}`;
      case 'storage':
        return localSettings.mobileDataSaver ? 'Data Saver ON' : 'Cache & Downloads';
      case 'appPrefs':
        return 'Permissions & External Links';
      case 'about':
        return 'v1.0.0 · Apex Sync Technologies';
      default:
        return '';
    }
  };

  const renderOptionPills = (options, selectedValue, onSelect) => (
    <View style={styles.pillWrap}>
      {options.map((opt) => {
        const active = selectedValue === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.85}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.optionPill,
              {
                backgroundColor: active ? C.teal : C.cardAlt,
                borderColor: active ? C.teal : C.border,
              },
            ]}
          >
            <Text style={[styles.optionPillTxt, { color: active ? '#FFFFFF' : C.text }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSwitchRow = (label, description, value, onValueChange) => (
    <View style={[styles.controlRow, { borderBottomColor: C.border }]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[styles.controlTitle, { color: C.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.controlDesc, { color: C.sub }]}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={Boolean(value)}
        onValueChange={onValueChange}
        trackColor={{ false: C.border, true: C.teal }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const renderSubScreenBody = () => {
    switch (activeSubScreen) {
      case 'appearance':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>THEME MODE</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {[
                {
                  value: 'system',
                  title: 'System Default',
                  desc: 'Matches your phone Dark or Light setting automatically',
                },
                {
                  value: 'dark',
                  title: 'Dark Mode',
                  desc: 'Deep navy & charcoal surface with Teal accents',
                },
                {
                  value: 'light',
                  title: 'Light Mode',
                  desc: 'Soft neutral grey base with comfortable low-glare cards',
                },
              ].map((m, idx, arr) => {
                const selected = localSettings.themeMode === m.value;
                return (
                  <TouchableOpacity
                    key={m.value}
                    activeOpacity={0.85}
                    onPress={() => updateKey('themeMode', m.value)}
                    style={[
                      styles.radioRow,
                      idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border },
                    ]}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={[styles.controlTitle, { color: C.text }]}>{m.title}</Text>
                      <Text style={[styles.controlDesc, { color: C.sub }]}>{m.desc}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: selected ? C.teal : C.sub },
                      ]}
                    >
                      {selected ? <View style={[styles.radioInner, { backgroundColor: C.teal }]} /> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'language':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>APP INTERFACE LANGUAGE</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              {renderOptionPills(
                [
                  { value: 'English', label: 'English (Default)' },
                  { value: 'Hindi', label: 'हिंदी (Hindi)' },
                ],
                localSettings.appLanguage,
                (v) => updateKey('appLanguage', v)
              )}
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>POST & NEWS TRANSLATION</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              <Text style={[styles.controlDesc, { color: C.sub, marginBottom: 8 }]}>
                Preferred target language when translating feed posts or EXIM news:
              </Text>
              {renderOptionPills(
                [
                  { value: 'Hindi', label: 'हिंदी (Hindi)' },
                  { value: 'English', label: 'English' },
                  { value: 'Arabic', label: 'Arabic' },
                ],
                localSettings.translationLanguage,
                (v) => updateKey('translationLanguage', v)
              )}
            </View>

            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, marginTop: 12 }]}>
              {renderSwitchRow(
                'Auto-Translation Option',
                'Offer quick one-tap translation on posts in different languages',
                localSettings.autoTranslation,
                (v) => updateKey('autoTranslation', v)
              )}
              {renderSwitchRow(
                'Show Original Text Option',
                'Keep original post text accessible alongside translated text',
                localSettings.showOriginalText,
                (v) => updateKey('showOriginalText', v)
              )}
            </View>
          </View>
        );

      case 'tradeFeed':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>DEFAULT HOME LANDING</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              {renderOptionPills(
                [
                  { value: 'Trade Feed', label: 'Trade Feed' },
                  { value: 'EXIM News', label: 'EXIM News' },
                ],
                localSettings.defaultHomeScreen,
                (v) => updateKey('defaultHomeScreen', v)
              )}
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>TRADE FOCUS</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              {renderOptionPills(
                [
                  { value: 'Export', label: 'Export Only' },
                  { value: 'Import', label: 'Import Only' },
                  { value: 'Both', label: 'Import & Export' },
                ],
                localSettings.tradeFocus,
                (v) => updateKey('tradeFocus', v)
              )}
            </View>
          </View>
        );

      case 'regionCurrency':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>DISPLAY CURRENCY</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              {renderOptionPills(
                [
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'INR', label: 'INR (₹)' },
                  { value: 'AED', label: 'AED' },
                  { value: 'EUR', label: 'EUR (€)' },
                ],
                localSettings.currency,
                (v) => updateKey('currency', v)
              )}
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>MEASUREMENT UNITS</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              {renderOptionPills(
                [
                  { value: 'MT', label: 'Metric Ton (MT)' },
                  { value: 'KG', label: 'Kilogram (KG)' },
                  { value: 'Quintal', label: 'Quintal' },
                  { value: 'CBM', label: 'CBM' },
                ],
                localSettings.measurementUnit,
                (v) => updateKey('measurementUnit', v)
              )}
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>PREFERRED INCOTERMS</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              {renderOptionPills(
                [
                  { value: 'FOB', label: 'FOB' },
                  { value: 'CIF', label: 'CIF' },
                  { value: 'CFR', label: 'CFR' },
                  { value: 'EXW', label: 'EXW' },
                ],
                localSettings.incoterms,
                (v) => updateKey('incoterms', v)
              )}
              <Text style={[styles.helperNote, { color: C.sub }]}>
                Display preference only — never alters agreed contract or deal terms automatically.
              </Text>
            </View>
          </View>
        );

      case 'marketIntel':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>GLOBAL MONITORING</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {renderSwitchRow(
                'Global Monitoring (All Countries)',
                'Track demand & price signals across all available countries even if none are pinned',
                localSettings.globalMonitoring,
                (v) => updateKey('globalMonitoring', v)
              )}
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>PRIORITY COUNTRIES</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              <TextInput
                style={[styles.searchInp, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text }]}
                placeholder="Filter countries..."
                placeholderTextColor={C.sub}
                value={countrySearch}
                onChangeText={setCountrySearch}
              />
              <View style={styles.pillWrap}>
                {ALL_COUNTRIES.filter((c) =>
                  c.toLowerCase().includes(countrySearch.trim().toLowerCase())
                ).map((country) => {
                  const selected = localSettings.preferredMarkets.includes(country);
                  return (
                    <TouchableOpacity
                      key={country}
                      onPress={() => toggleListValue('preferredMarkets', country)}
                      style={[
                        styles.optionPill,
                        {
                          backgroundColor: selected ? C.teal : C.cardAlt,
                          borderColor: selected ? C.teal : C.border,
                        },
                      ]}
                    >
                      <Text style={[styles.optionPillTxt, { color: selected ? '#FFF' : C.text }]}>
                        {selected ? `✓ ${country}` : country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>TRACKED PRODUCTS</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              <TextInput
                style={[styles.searchInp, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text }]}
                placeholder="Filter commodities..."
                placeholderTextColor={C.sub}
                value={productSearch}
                onChangeText={setProductSearch}
              />
              <View style={styles.pillWrap}>
                {ALL_PRODUCTS.filter((p) =>
                  p.toLowerCase().includes(productSearch.trim().toLowerCase())
                ).map((prod) => {
                  const selected = localSettings.preferredProducts.includes(prod);
                  return (
                    <TouchableOpacity
                      key={prod}
                      onPress={() => toggleListValue('preferredProducts', prod)}
                      style={[
                        styles.optionPill,
                        {
                          backgroundColor: selected ? C.teal : C.cardAlt,
                          borderColor: selected ? C.teal : C.border,
                        },
                      ]}
                    >
                      <Text style={[styles.optionPillTxt, { color: selected ? '#FFF' : C.text }]}>
                        {selected ? `✓ ${prod}` : prod}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>SIGNAL TYPES & SENSITIVITY</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {renderSwitchRow(
                'Rising & Falling Demand Signals',
                'Alerts when import quantity or value shifts significantly',
                localSettings.demandAlerts,
                (v) => updateKey('demandAlerts', v)
              )}
              {renderSwitchRow(
                'Price & Unit Value Movement',
                'Alerts on benchmark or import unit value changes',
                localSettings.priceMovementAlerts,
                (v) => updateKey('priceMovementAlerts', v)
              )}
              {renderSwitchRow(
                'New Market Opportunities',
                'Emerging importing countries for your tracked products',
                localSettings.newMarketAlerts,
                (v) => updateKey('newMarketAlerts', v)
              )}
              {renderSwitchRow(
                'Trade Policy & Tariff Updates',
                'DGFT, customs duty, FTA and restriction updates',
                localSettings.policyAlerts,
                (v) => updateKey('policyAlerts', v)
              )}
            </View>
          </View>
        );

      case 'notifications':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>ALERT CATEGORIES</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {renderSwitchRow('Buyer Requirements', null, localSettings.notifBuyerReq, (v) =>
                updateKey('notifBuyerReq', v)
              )}
              {renderSwitchRow('Seller & Stock Offers', null, localSettings.notifSellerOffers, (v) =>
                updateKey('notifSellerOffers', v)
              )}
              {renderSwitchRow('Market Price Alerts', null, localSettings.notifPriceAlerts, (v) =>
                updateKey('notifPriceAlerts', v)
              )}
              {renderSwitchRow('EXIM Regulatory Alerts', null, localSettings.notifEximRegulatory, (v) =>
                updateKey('notifEximRegulatory', v)
              )}
              {renderSwitchRow('Direct Messages', null, localSettings.notifMessages, (v) =>
                updateKey('notifMessages', v)
              )}
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>DELIVERY CHANNELS & QUIET HOURS</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {renderSwitchRow('In-App Notifications', null, localSettings.channelInApp, (v) =>
                updateKey('channelInApp', v)
              )}
              {renderSwitchRow('Push Notifications', null, localSettings.channelPush, (v) =>
                updateKey('channelPush', v)
              )}
              {renderSwitchRow(
                'WhatsApp Trade Alerts',
                `Requires verified mobile (${userInfo.mobile}) & explicit opt-in`,
                localSettings.channelWhatsApp,
                (v) => updateKey('channelWhatsApp', v)
              )}
              {renderSwitchRow(
                'Quiet Hours (10:00 PM – 07:00 AM)',
                'Mute non-urgent alerts overnight',
                localSettings.quietHoursEnabled,
                (v) => updateKey('quietHoursEnabled', v)
              )}
            </View>
          </View>
        );

      case 'setuAi':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>SETU AI CONTROLS</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {renderSwitchRow(
                'SETU AI Assistance (Optional)',
                'Manual posting and drafting always remain available without AI',
                localSettings.aiAssistanceEnabled,
                (v) => updateKey('aiAssistanceEnabled', v)
              )}
              {renderSwitchRow(
                'Voice Input Drafting',
                'Allow voice-to-draft assistance inside post composer',
                localSettings.aiVoiceInputEnabled,
                (v) => updateKey('aiVoiceInputEnabled', v)
              )}
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>AI WRITING STYLE</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              {renderOptionPills(
                [
                  { value: 'Professional Trade', label: 'Professional Trade' },
                  { value: 'Short & Direct', label: 'Short & Direct' },
                ],
                localSettings.aiWritingStyle,
                (v) => updateKey('aiWritingStyle', v)
              )}
              <Text style={[styles.helperNote, { color: C.sub }]}>
                Safety Rule: SETU AI never publishes a post or sends a message without your manual confirmation.
              </Text>
            </View>
          </View>
        );

      case 'account':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>ACCOUNT IDENTITY SUMMARY</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              <Text style={[styles.infoLine, { color: C.text }]}>Name: {userInfo.name}</Text>
              <Text style={[styles.infoLine, { color: C.text }]}>Company: {userInfo.company}</Text>
              <Text style={[styles.infoLine, { color: C.text }]}>Role: {userInfo.role}</Text>
              <Text style={[styles.infoLine, { color: C.sub }]}>Mobile: {userInfo.mobile}</Text>
              <Text style={[styles.helperNote, { color: C.teal }]}>
                Full Business Storefront & KYC editing opens from Profile in the Side Drawer.
              </Text>
            </View>

            {typeof onLogout === 'function' ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  Alert.alert('Switch Role / Logout', 'Kya aap current session se logout karna chahte hain?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', style: 'destructive', onPress: onLogout },
                  ]);
                }}
                style={[styles.actionBtn, { borderColor: C.danger, marginTop: 14 }]}
              >
                <Text style={{ color: C.danger, fontSize: 13.5, fontWeight: '800' }}>
                  Switch Role / Logout
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );

      case 'security':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>PRIVACY & ACCESS CONTROL</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              <Text style={[styles.controlTitle, { color: C.text, marginBottom: 6 }]}>
                Who Can View My Profile
              </Text>
              {renderOptionPills(
                [
                  { value: 'Everyone', label: 'Everyone' },
                  { value: 'Verified Traders', label: 'Verified Traders' },
                  { value: 'Connections', label: 'Connections' },
                ],
                localSettings.whoCanViewProfile,
                (v) => updateKey('whoCanViewProfile', v)
              )}

              <Text style={[styles.controlTitle, { color: C.text, marginTop: 14, marginBottom: 6 }]}>
                Who Can View My Posts
              </Text>
              {renderOptionPills(
                [
                  { value: 'Everyone', label: 'Everyone' },
                  { value: 'Verified Traders', label: 'Verified Traders' },
                  { value: 'Connections', label: 'Connections' },
                ],
                localSettings.whoCanViewPosts,
                (v) => updateKey('whoCanViewPosts', v)
              )}

              <Text style={[styles.controlTitle, { color: C.text, marginTop: 14, marginBottom: 6 }]}>
                Who Can Message Me
              </Text>
              {renderOptionPills(
                [
                  { value: 'Everyone', label: 'Everyone' },
                  { value: 'Verified Traders', label: 'Verified Traders' },
                  { value: 'Connections', label: 'Connections' },
                  { value: 'No One', label: 'No One' },
                ],
                localSettings.whoCanMessageMe,
                (v) => updateKey('whoCanMessageMe', v)
              )}

              <Text style={[styles.helperNote, { color: C.sub }]}>
                If an individual post has stricter visibility than your global setting, the stricter rule applies.
              </Text>
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>SESSION & LINK SAFETY</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {renderSwitchRow(
                'New Device Login Alerts',
                'Notify when your account signs in on a new device',
                localSettings.loginAlerts,
                (v) => updateKey('loginAlerts', v)
              )}
              {renderSwitchRow(
                'Safe Link Filter in Feed',
                'Block unsafe scripts/shorteners and verify links before opening',
                localSettings.safeLinkFilter,
                (v) => updateKey('safeLinkFilter', v)
              )}
            </View>
          </View>
        );

      case 'payments':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>PAYMENT & AUTHENTICATION</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              <Text style={[styles.controlTitle, { color: C.text, marginBottom: 6 }]}>
                Default Payment Method
              </Text>
              {renderOptionPills(
                [
                  { value: 'UPI / Bank Transfer', label: 'UPI / Bank' },
                  { value: 'Payment Gateway', label: 'Gateway' },
                  { value: 'Setuu Wallet', label: 'Setuu Wallet' },
                ],
                localSettings.defaultPaymentMethod,
                (v) => updateKey('defaultPaymentMethod', v)
              )}

              <Text style={[styles.controlTitle, { color: C.text, marginTop: 14, marginBottom: 6 }]}>
                High-Value Transaction Verification (Required)
              </Text>
              {renderOptionPills(
                [
                  { value: 'OTP + PIN', label: 'OTP + PIN' },
                  { value: 'Biometric + OTP', label: 'Biometric + OTP' },
                ],
                localSettings.paymentAuthMethod,
                (v) => updateKey('paymentAuthMethod', v)
              )}
              <Text style={[styles.helperNote, { color: C.sub }]}>
                Security Rule: Re-authentication for high-value payments cannot be turned off.
              </Text>
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>WALLET CONTROLS</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {renderSwitchRow(
                'Wallet Auto-Deduction (Default OFF)',
                'Only applies to approved utility/ad charges when enabled',
                localSettings.walletAutoDeduction,
                (v) => updateKey('walletAutoDeduction', v)
              )}
              <View style={{ padding: 14 }}>
                <Text style={[styles.controlTitle, { color: C.text, marginBottom: 6 }]}>
                  Monthly Wallet Spend Cap (₹)
                </Text>
                <TextInput
                  style={[styles.searchInp, { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginBottom: 0 }]}
                  keyboardType="numeric"
                  value={String(localSettings.walletMonthlyLimit)}
                  onChangeText={(v) => updateKey('walletMonthlyLimit', v.replace(/[^0-9]/g, ''))}
                />
              </View>
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>ESCROW PREFERENCES</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {renderSwitchRow(
                'Prefer Neutral Escrow Lock for Eligible Deals',
                'Applies to future deals only',
                localSettings.escrowNeutralLockDefault,
                (v) => updateKey('escrowNeutralLockDefault', v)
              )}
              {renderSwitchRow(
                'Escrow Lock & Milestone Alerts',
                'Notify on fund lock, delivery proof, and release requests',
                localSettings.escrowMilestoneAlerts,
                (v) => updateKey('escrowMilestoneAlerts', v)
              )}
              <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
                <Text style={[styles.helperNote, { color: C.sub }]}>
                  Once an Escrow deal is locked, neither party can unilaterally modify release terms.
                </Text>
              </View>
            </View>
          </View>
        );

      case 'storage':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>DATA USAGE</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {renderSwitchRow(
                'Mobile Data Saver',
                'Reduce automatic heavy media loading on cellular data',
                localSettings.mobileDataSaver,
                (v) => updateKey('mobileDataSaver', v)
              )}
              {renderSwitchRow(
                'Wi-Fi Only Video Previews',
                'Load high-resolution clips only on Wi-Fi',
                localSettings.wifiOnlyMedia,
                (v) => updateKey('wifiOnlyMedia', v)
              )}
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>CACHE MANAGEMENT</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.actionBtn, { borderColor: C.teal }]}
                onPress={() => {
                  if (typeof onClearTranslationCache === 'function') {
                    onClearTranslationCache();
                  }
                  Alert.alert(
                    'Cache Cleared',
                    'Translation & temporary cache cleared. Your saved posts and account data remain safe.'
                  );
                }}
              >
                <Text style={{ color: C.teal, fontSize: 13.5, fontWeight: '800' }}>
                  Clear Translation & Temp Cache
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'appPrefs':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>LINK & DISPLAY BEHAVIOR</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border }]}>
              {renderSwitchRow(
                'Confirm Before Opening External Websites',
                'Show URL preview prompt before leaving Trade SETUU',
                localSettings.confirmExternalLinks,
                (v) => updateKey('confirmExternalLinks', v)
              )}
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>DEVICE PERMISSIONS</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              <Text style={[styles.controlDesc, { color: C.sub, lineHeight: 20 }]}>
                • Photos & Media: Requested only when attaching images/videos in Create Post.{'\n'}
                • Documents / Storage: Requested only when attaching PDF specifications.{'\n'}
                • Notifications: Managed in your device system settings.
              </Text>
            </View>
          </View>
        );

      case 'about':
        return (
          <View>
            <Text style={[styles.subGroupTitle, { color: C.teal }]}>APPLICATION INFO</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              <Text style={[styles.controlTitle, { color: C.text }]}>Trade SETUU</Text>
              <Text style={[styles.controlDesc, { color: C.sub, marginTop: 3 }]}>
                Global Trade & Logistics Operating System · Version 1.0.0
              </Text>
              <Text style={[styles.controlDesc, { color: C.teal, marginTop: 10, fontWeight: '800' }]}>
                Powered by Apex Sync Technologies
              </Text>
            </View>

            <Text style={[styles.subGroupTitle, { color: C.teal }]}>POLICIES & TERMS</Text>
            <View style={[styles.cardBox, { backgroundColor: C.card, borderColor: C.border, padding: 14 }]}>
              <Text style={[styles.controlDesc, { color: C.sub, lineHeight: 20 }]}>
                • Terms & Conditions: B2B trade listings, escrow rules, and platform usage policies.{'\n'}
                • Privacy Policy: Trade data protection, visibility controls, and consent standards.{'\n'}
                • Data Attribution: FX & EXIM market feeds displayed with source context.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const activeItemMeta = SECTIONS.flatMap((s) => s.items).find((i) => i.id === activeSubScreen);

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? 4 : 0 },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.bg, borderBottomColor: C.border }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (activeSubScreen) setActiveSubScreen(null);
            else if (typeof onClose === 'function') onClose();
          }}
          style={[styles.backBtn, { backgroundColor: C.card, borderColor: C.border }]}
        >
          <Text style={[styles.backTxt, { color: C.teal }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.text }]} numberOfLines={1}>
          {activeItemMeta ? activeItemMeta.title : 'Settings'}
        </Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeSubScreen ? (
          renderSubScreenBody()
        ) : (
          SECTIONS.map((sec) => (
            <View key={sec.code} style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: C.teal }]}>{sec.code}</Text>
              <View style={[styles.sectionCard, { backgroundColor: C.card, borderColor: C.border }]}>
                {sec.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.82}
                    onPress={() => setActiveSubScreen(item.id)}
                    style={[
                      styles.menuRow,
                      idx < sec.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: C.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={[styles.rowTitle, { color: C.text }]}>{item.title}</Text>
                      <Text style={[styles.rowSub, { color: C.sub }]} numberOfLines={1}>
                        {getRowSubtitle(item.subtitleKey)}
                      </Text>
                    </View>
                    <Text style={[styles.chevron, { color: C.sub }]}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTxt: { fontSize: 18, fontWeight: '800', lineHeight: 20 },
  headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 0.2 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 32 },
  sectionBlock: { marginBottom: 16 },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 7,
    marginLeft: 2,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowTitle: { fontSize: 14.5, fontWeight: '800' },
  rowSub: { fontSize: 11.5, marginTop: 2, fontWeight: '600' },
  chevron: { fontSize: 21, fontWeight: '600', marginLeft: 6 },

  subGroupTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginTop: 6,
    marginBottom: 7,
    marginLeft: 2,
  },
  cardBox: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  controlTitle: { fontSize: 14, fontWeight: '800' },
  controlDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionPillTxt: { fontSize: 12.5, fontWeight: '700' },
  searchInp: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 10,
  },
  helperNote: { fontSize: 11.5, marginTop: 10, lineHeight: 17 },
  infoLine: { fontSize: 13.5, fontWeight: '700', marginBottom: 6 },
  actionBtn: {
    borderWidth: 1.2,
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
