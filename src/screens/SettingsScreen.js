// SettingsScreen.js (or src/screens/SettingsScreen.js)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Alert,
  BackHandler,
  StyleSheet,
  Platform,
} from 'react-native';

const THEME_MODES = ['System', 'Dark', 'Light'];
const LANGUAGES = ['English', 'हिन्दी', 'Hinglish'];
const AI_STYLES = ['Professional Trade', 'Short & Direct', 'Detailed Brief'];
const ALERT_SENSITIVITIES = ['Significant Changes Only', 'All Market Updates'];
const QUIET_WINDOWS = ['10:00 PM – 07:00 AM', '11:00 PM – 06:30 AM', '09:30 PM – 07:30 AM'];

function SectionHeader({ number, title, color }) {
  return (
    <View style={styles.sectionHeaderWrap}>
      <Text style={[styles.sectionHeaderText, { color }]}>
        {number} · {title}
      </Text>
    </View>
  );
}

function SettingRow({
  title,
  subtitle,
  valueText,
  onPress,
  rightComponent,
  themeColors,
  isLast = false,
}) {
  const RowContent = (
    <View
      style={[
        styles.rowContainer,
        !isLast && { borderBottomWidth: 1, borderBottomColor: themeColors.divider },
      ]}
    >
      <View style={styles.rowTextCol}>
        <Text style={[styles.rowTitle, { color: themeColors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: themeColors.subtext }]}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.rowRightCol}>
        {valueText ? (
          <Text style={[styles.rowValue, { color: themeColors.accent }]} numberOfLines={1}>
            {valueText}
          </Text>
        ) : null}
        {rightComponent ? (
          rightComponent
        ) : onPress ? (
          <Text style={[styles.chevron, { color: themeColors.subtext }]}>›</Text>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.72} onPress={onPress}>
        {RowContent}
      </TouchableOpacity>
    );
  }
  return RowContent;
}

function SegmentedPills({ options, selected, onSelect, themeColors }) {
  return (
    <View style={styles.pillsWrap}>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            activeOpacity={0.8}
            onPress={() => onSelect(opt)}
            style={[
              styles.pill,
              {
                backgroundColor: active ? themeColors.accent : themeColors.pillBg,
                borderColor: active ? themeColors.accent : themeColors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: active ? '#FFFFFF' : themeColors.text },
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function SettingsScreen({
  isDark = true,
  themeMode = 'System',
  onChangeThemeMode,
  onClose,
  onOpenAiCopilot,
  onOpenLegalDoc,
  onSignOut,
}) {
  // 01 · ACCOUNT & TRADE PROFILE
  const [accountVerified] = useState(true);
  const [kycStatus] = useState('Verified (GST / IEC Ready)');
  const [tradeRole, setTradeRole] = useState('Exporter & Freight Broker');

  // 02 · APPEARANCE & LANGUAGE
  const [language, setLanguage] = useState('Hinglish');

  // 03 · GLOBAL MARKET INTELLIGENCE
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [alertSensitivity, setAlertSensitivity] = useState('Significant Changes Only');
  const [corridorAlerts, setCorridorAlerts] = useState(true);
  const [currencyDisplay, setCurrencyDisplay] = useState('INR / USD');

  // 04 · NOTIFICATIONS & AI (SETU AI Co-Pilot)
  const [pushEnabled, setPushEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState(true);
  const [quietWindow, setQuietWindow] = useState('10:00 PM – 07:00 AM');
  const [aiAskFirstContext, setAiAskFirstContext] = useState(true);
  const [aiWritingStyle, setAiWritingStyle] = useState('Professional Trade');

  // 05 · ACCOUNT & SECURITY
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [blockedUsersCount, setBlockedUsersCount] = useState(2);
  const [activeSessionsCount, setActiveSessionsCount] = useState(2);

  // 06 · PAYMENTS, WALLET & ESCROW
  const [escrowAlerts, setEscrowAlerts] = useState(true);
  const [autoDeductScope, setAutoDeductScope] = useState('Manual Approval Only');

  useEffect(() => {
    const onBackPress = () => {
      if (typeof onClose === 'function') {
        onClose();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [onClose]);

  const C = isDark
    ? {
        bg: '#0C141D',
        card: '#151F29',
        pillBg: '#1C2936',
        border: '#243444',
        divider: '#1F2D3B',
        text: '#E7EDF2',
        subtext: '#93A3B3',
        accent: '#20BFAE',
        danger: '#F87171',
      }
    : {
        bg: '#F1F4F5',
        card: '#FFFFFF',
        pillBg: '#E7ECEF',
        border: '#D5DEE3',
        divider: '#E6ECEF',
        text: '#25313A',
        subtext: '#5E6F7B',
        accent: '#168F88',
        danger: '#DC2626',
      };

  const cycleTradeRole = () => {
    const roles = [
      'Exporter & Freight Broker',
      'Merchant Exporter',
      'Logistics & Fleet Coordinator',
      'FoodTech / B2B Buyer',
    ];
    const next = roles[(roles.indexOf(tradeRole) + 1) % roles.length];
    setTradeRole(next);
  };

  const cycleAlertSensitivity = () => {
    const next =
      ALERT_SENSITIVITIES[
        (ALERT_SENSITIVITIES.indexOf(alertSensitivity) + 1) % ALERT_SENSITIVITIES.length
      ];
    setAlertSensitivity(next);
  };

  const cycleQuietWindow = () => {
    const next =
      QUIET_WINDOWS[(QUIET_WINDOWS.indexOf(quietWindow) + 1) % QUIET_WINDOWS.length];
    setQuietWindow(next);
  };

  const cycleCurrency = () => {
    const list = ['INR / USD', 'INR Only', 'USD Only'];
    setCurrencyDisplay(list[(list.indexOf(currencyDisplay) + 1) % list.length]);
  };

  const cycleAutoDeduct = () => {
    const list = ['Manual Approval Only', 'Verified Escrow Milestones'];
    setAutoDeductScope(list[(list.indexOf(autoDeductScope) + 1) % list.length]);
  };

  const handleManageBlockedUsers = () => {
    Alert.alert(
      'Blocked / Restricted Users',
      `Currently ${blockedUsersCount} restricted/blocked account(s) on your trade feed.`,
      [
        {
          text: 'Clear 1 Restriction',
          onPress: () => setBlockedUsersCount((c) => Math.max(0, c - 1)),
        },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const handleManageSessions = () => {
    Alert.alert(
      'Active Sessions',
      `Current device + ${Math.max(0, activeSessionsCount - 1)} other active session(s).`,
      [
        {
          text: 'Sign Out Other Sessions',
          onPress: () => {
            setActiveSessionsCount(1);
            Alert.alert('Sessions Updated', 'Other sessions have been signed out.');
          },
        },
        { text: 'Keep Active', style: 'cancel' },
      ]
    );
  };

  const handleOpenLegal = (docKey, title) => {
    if (typeof onOpenLegalDoc === 'function') {
      onOpenLegalDoc(docKey, title);
    } else {
      Alert.alert(title, `${title} for Trade SETUU.`);
    }
  };

  const handleSignOutPress = () => {
    Alert.alert('Sign Out', 'Do you want to sign out of Trade SETUU?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          if (typeof onSignOut === 'function') onSignOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? 4 : 0 },
      ]}
    >
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: C.bg, borderBottomColor: C.divider }]}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onClose}
          style={[styles.backBtn, { backgroundColor: C.card, borderColor: C.border }]}
        >
          <Text style={[styles.backArrow, { color: C.accent }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Settings</Text>
          <Text style={[styles.headerSub, { color: C.subtext }]}>
            Trade SETUU · Preferences & Controls
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 01 · ACCOUNT & TRADE PROFILE */}
        <SectionHeader number="01" title="ACCOUNT & TRADE PROFILE" color={C.accent} />
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <SettingRow
            title="Account & Verification"
            subtitle={kycStatus}
            valueText={accountVerified ? 'Verified' : 'Pending'}
            themeColors={C}
            onPress={() =>
              Alert.alert(
                'Trade Verification',
                `Status: ${kycStatus}\nKeep business details accurate for trade inquiries.`
              )
            }
          />
          <SettingRow
            title="Primary Trade Role"
            subtitle="Tap to switch trade focus"
            valueText={tradeRole}
            themeColors={C}
            onPress={cycleTradeRole}
            isLast
          />
        </View>

        {/* 02 · APPEARANCE & LANGUAGE */}
        <SectionHeader number="02" title="APPEARANCE & LANGUAGE" color={C.accent} />
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={[styles.blockPad, { borderBottomWidth: 1, borderBottomColor: C.divider }]}>
            <Text style={[styles.rowTitle, { color: C.text }]}>Theme Mode</Text>
            <Text style={[styles.rowSubtitle, { color: C.subtext, marginBottom: 10 }]}>
              System follows device theme; Dark or Light overrides manually
            </Text>
            <SegmentedPills
              options={THEME_MODES}
              selected={themeMode}
              onSelect={(mode) => {
                if (typeof onChangeThemeMode === 'function') onChangeThemeMode(mode);
              }}
              themeColors={C}
            />
          </View>

          <View style={styles.blockPad}>
            <Text style={[styles.rowTitle, { color: C.text }]}>App & Feed Language</Text>
            <Text style={[styles.rowSubtitle, { color: C.subtext, marginBottom: 10 }]}>
              Choose preferred language for labels and trade summaries
            </Text>
            <SegmentedPills
              options={LANGUAGES}
              selected={language}
              onSelect={setLanguage}
              themeColors={C}
            />
          </View>
        </View>

        {/* 03 · GLOBAL MARKET INTELLIGENCE */}
        <SectionHeader number="03" title="GLOBAL MARKET INTELLIGENCE" color={C.accent} />
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <SettingRow
            title="Market & Commodity Alerts"
            subtitle="Price & trade updates on tracked commodities"
            themeColors={C}
            rightComponent={
              <Switch
                value={marketAlerts}
                onValueChange={setMarketAlerts}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            title="Alert Sensitivity"
            subtitle="Control how frequently market updates notify you"
            valueText={alertSensitivity}
            themeColors={C}
            onPress={cycleAlertSensitivity}
          />
          <SettingRow
            title="Corridor & Freight Updates"
            subtitle="Route & logistics movement notifications"
            themeColors={C}
            rightComponent={
              <Switch
                value={corridorAlerts}
                onValueChange={setCorridorAlerts}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            title="Display Currency"
            subtitle="Preferred rate & quote display format"
            valueText={currencyDisplay}
            themeColors={C}
            onPress={cycleCurrency}
            isLast
          />
        </View>

        {/* 04 · NOTIFICATIONS & AI */}
        <SectionHeader number="04" title="NOTIFICATIONS & AI" color={C.accent} />
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <SettingRow
            title="Push Notifications"
            subtitle="Inquiries, trade activity & system alerts"
            themeColors={C}
            rightComponent={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            title="Quiet Hours"
            subtitle={
              quietHours
                ? `Muted during ${quietWindow} (tap to change time)`
                : 'Off — alerts allowed anytime'
            }
            valueText={quietHours ? quietWindow : 'Off'}
            themeColors={C}
            onPress={cycleQuietWindow}
            rightComponent={
              <Switch
                value={quietHours}
                onValueChange={setQuietHours}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            title="SETU AI · Ask Before Attaching Context"
            subtitle="Always ask permission before reading current screen/item"
            themeColors={C}
            rightComponent={
              <Switch
                value={aiAskFirstContext}
                onValueChange={setAiAskFirstContext}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            title="SETU AI · Draft Tone"
            subtitle="Default style for trade replies & summaries"
            valueText={aiWritingStyle}
            themeColors={C}
            onPress={() => {
              const next =
                AI_STYLES[(AI_STYLES.indexOf(aiWritingStyle) + 1) % AI_STYLES.length];
              setAiWritingStyle(next);
            }}
          />
          <SettingRow
            title="Open SETU AI Co-Pilot"
            subtitle="Launch central trade co-pilot workspace"
            valueText="Open"
            themeColors={C}
            onPress={() => {
              if (typeof onOpenAiCopilot === 'function') onOpenAiCopilot();
            }}
            isLast
          />
        </View>

        {/* 05 · ACCOUNT & SECURITY */}
        <SectionHeader number="05" title="ACCOUNT & SECURITY" color={C.accent} />
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <SettingRow
            title="Two-Factor Protection"
            subtitle="Extra verification for sensitive account changes"
            themeColors={C}
            rightComponent={
              <Switch
                value={twoFactorAuth}
                onValueChange={setTwoFactorAuth}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            title="Blocked / Restricted Users"
            subtitle="Manage restricted counterparties on your feed"
            valueText={`${blockedUsersCount} Active`}
            themeColors={C}
            onPress={handleManageBlockedUsers}
          />
          <SettingRow
            title="Active Sessions"
            subtitle="Review devices currently signed in"
            valueText={`${activeSessionsCount} Device(s)`}
            themeColors={C}
            onPress={handleManageSessions}
            isLast
          />
        </View>

        {/* 06 · PAYMENTS, WALLET & ESCROW */}
        <SectionHeader number="06" title="PAYMENTS, WALLET & ESCROW" color={C.accent} />
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <SettingRow
            title="Escrow Status & Release Alerts"
            subtitle="Notify on milestone lock, verification & release"
            themeColors={C}
            rightComponent={
              <Switch
                value={escrowAlerts}
                onValueChange={setEscrowAlerts}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            title="Payment & Deduction Approval"
            subtitle="Manual confirmation required before fund actions"
            valueText={autoDeductScope}
            themeColors={C}
            onPress={cycleAutoDeduct}
            isLast
          />
        </View>

        {/* 07 · LEGAL, SUPPORT & ACCOUNT ACTIONS */}
        <SectionHeader number="07" title="LEGAL, SUPPORT & ACCOUNT ACTIONS" color={C.accent} />
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <SettingRow
            title="Terms of Use"
            themeColors={C}
            onPress={() => handleOpenLegal('terms', 'Terms of Use')}
          />
          <SettingRow
            title="Privacy Policy"
            themeColors={C}
            onPress={() => handleOpenLegal('privacy', 'Privacy Policy')}
          />
          <SettingRow
            title="Trade & Escrow Disclaimer"
            themeColors={C}
            onPress={() => handleOpenLegal('disclaimer', 'Trade & Escrow Disclaimer')}
          />
          <SettingRow
            title="Help & Support"
            subtitle="Contact Trade SETUU support"
            themeColors={C}
            onPress={() =>
              Alert.alert(
                'Help & Support',
                'For trade, verification, or app assistance, reach out via official Trade SETUU support channels.'
              )
            }
          />
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleSignOutPress}
            style={styles.signOutRow}
          >
            <Text style={[styles.signOutText, { color: C.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 19, fontWeight: '800' },
  headerTitleCol: { marginLeft: 12, flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  headerSub: { fontSize: 12, marginTop: 1 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  sectionHeaderWrap: { marginTop: 14, marginBottom: 7, paddingHorizontal: 2 },
  sectionHeaderText: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.7 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  blockPad: { padding: 14 },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 54,
  },
  rowTextCol: { flex: 1, paddingRight: 10 },
  rowTitle: { fontSize: 14.5, fontWeight: '700' },
  rowSubtitle: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  rowRightCol: { flexDirection: 'row', alignItems: 'center', maxWidth: '46%' },
  rowValue: { fontSize: 12.5, fontWeight: '700', marginRight: 6 },
  chevron: { fontSize: 20, fontWeight: '600', lineHeight: 22 },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: { fontSize: 12.5, fontWeight: '700' },
  signOutRow: { paddingHorizontal: 14, paddingVertical: 15, alignItems: 'center' },
  signOutText: { fontSize: 14.5, fontWeight: '800' },
});
