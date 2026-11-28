// src/screens/SetuAiCopilotScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Image,
  Animated,
  Easing,
  Keyboard,
  PanResponder,
  Dimensions,
  Clipboard,
  Alert,
  BackHandler,
  StyleSheet,
  Platform,
} from 'react-native';

function safeRequireImage(modulePath) {
  try {
    // eslint-disable-next-line global-require
    return require(modulePath);
  } catch (e) {
    return null;
  }
}

const COPILOT_CAPSULE_ASSET = safeRequireImage('../../IMG_20261128_171321.png');
const COPILOT_SQUARE_ASSET = safeRequireImage('../../IMG_20261128_171240.png');
const COPILOT_MINI_ASSET = safeRequireImage('../../IMG_20261128_171404.png');

const QUICK_PROMPTS = [
  {
    id: 'draft_offer',
    label: 'Draft Trade Offer',
    prompt:
      'Create a clean B2B export/supply offer draft with quantity, port, and terms placeholders.',
  },
  {
    id: 'buyer_check',
    label: 'Buyer & Deal Check',
    prompt:
      'Analyze this buyer/deal message for missing details, red flags, and verification checklist.',
  },
  {
    id: 'summarize',
    label: 'Summarize Context',
    prompt:
      'Summarize the attached screen/item clearly in short points for quick trade decision.',
  },
  {
    id: 'quick_reply',
    label: 'Quick Reply',
    prompt:
      'Draft a polite, clear commercial reply asking for specs, target rate, and payment/shipment terms.',
  },
];

function buildSmartBetaReply(userText, attachedContext, writingStyle = 'Professional Trade') {
  const q = (userText || '').trim();
  const ctxTitle = attachedContext?.title || attachedContext?.screenName || 'Current Screen';
  const ctxSummary = attachedContext?.summary || attachedContext?.text || '';

  const lower = q.toLowerCase();
  const isRiskOrBuyer =
    lower.includes('buyer') ||
    lower.includes('scam') ||
    lower.includes('risk') ||
    lower.includes('fee') ||
    lower.includes('advance') ||
    lower.includes('check');

  if (isRiskOrBuyer) {
    const hasFeeHint =
      (q + ' ' + ctxSummary).toLowerCase().includes('fee') ||
      (q + ' ' + ctxSummary).toLowerCase().includes('charge') ||
      (q + ' ' + ctxSummary).toLowerCase().includes('usd');

    return {
      text: [
        `Basis: ${
          attachedContext
            ? `Attached context (${ctxTitle}) + prompt`
            : 'Prompt only (preliminary beta check, not a final verdict)'
        }.`,
        '',
        '1. Summary: Commercial trade query / counterparty message reviewed for clarity and key terms.',
        hasFeeHint
          ? '2. Caution / Red Flags: Upfront registration/activation/processing fees or unverified payment requests require extra verification before paying anything.'
          : '2. Missing Details: Confirm exact product grade/spec, quantity, Incoterms (FOB/CIF), payment terms, and buyer company credentials.',
        '3. Suggested Next Steps: Verify official company registration, domain/email, and independent trade references before proceeding.',
      ].join('\n'),
      draft:
        'Hello, thank you for your inquiry. Please share full product specifications, required quantity, target Incoterms (FOB/CIF), destination port, and company details so we can share a formal quotation.',
    };
  }

  const concise = writingStyle === 'Short & Direct';
  const ctxLine = attachedContext
    ? `Context used: ${ctxTitle}${ctxSummary ? ` — ${ctxSummary.slice(0, 140)}` : ''}`
    : 'Context used: None (standalone request)';

  return {
    text: [
      ctxLine,
      '',
      concise
        ? `Draft ready for "${q || 'Trade Request'}". Review numbers & terms before using.`
        : `Here is a structured ${writingStyle.toLowerCase()} draft based on your request ("${
            q || 'Trade Assistance'
          }"). Please verify exact quantities, rates, and terms before sharing.`,
    ].join('\n'),
    draft: concise
      ? `Requirement / Offer: ${ctxTitle}\nSpecs & Qty: [Confirm Grade / MT]\nPort & Terms: [Confirm Port / FOB-CIF]\nNext Step: Share best quote & availability.`
      : `Subject: Trade Inquiry / Offer — ${ctxTitle}\n\nDear Team,\n\nRegarding ${ctxTitle}, kindly confirm:\n1. Product specification & grade\n2. Available / required quantity\n3. Pricing & Incoterms (FOB / CIF)\n4. Dispatch timeline & payment terms\n\nBest regards,`,
  };
}

/**
 * Movable Floating Trigger (Capsule / Square)
 * Default: bottom-right just above bottom navigation for easy right-thumb reach.
 * User can drag anywhere across the screen.
 */
export function SetuAiFloatingTrigger({
  isDark = true,
  compactSquare = false,
  capsuleSource,
  squareSource,
  onPress,
}) {
  const { width: winW, height: winH } = Dimensions.get('window');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const btnW = compactSquare ? 46 : 148;
  const btnH = 46;

  // Default: right side, just above bottom nav
  const defaultX = Math.max(12, winW - btnW - 14);
  const defaultY = Math.max(60, winH - btnH - 96);

  const pan = useRef(new Animated.ValueXY({ x: defaultX, y: defaultY })).current;
  const offsetRef = useRef({ x: defaultX, y: defaultY });
  const movedDistRef = useRef(0);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const clampedX = Math.min(Math.max(10, offsetRef.current.x), Math.max(10, winW - btnW - 10));
    const clampedY = Math.min(Math.max(44, offsetRef.current.y), Math.max(44, winH - btnH - 24));
    offsetRef.current = { x: clampedX, y: clampedY };
    pan.setValue({ x: clampedX, y: clampedY });
  }, [winW, winH, btnW, btnH, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderGrant: () => {
        movedDistRef.current = 0;
        pan.setOffset({ x: offsetRef.current.x, y: offsetRef.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, g) => {
        movedDistRef.current = Math.max(movedDistRef.current, Math.hypot(g.dx, g.dy));
        pan.setValue({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        const maxX = Math.max(10, winW - btnW - 10);
        const maxY = Math.max(44, winH - btnH - 24);
        const nextX = Math.min(Math.max(10, offsetRef.current.x + g.dx), maxX);
        const nextY = Math.min(Math.max(44, offsetRef.current.y + g.dy), maxY);
        offsetRef.current = { x: nextX, y: nextY };
        pan.setValue({ x: nextX, y: nextY });

        if (movedDistRef.current < 7) {
          triggerPulseAndOpen();
        }
      },
    })
  ).current;

  const triggerPulseAndOpen = () => {
    pulseAnim.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(pressScale, { toValue: 0.94, duration: 85, useNativeDriver: true }),
        Animated.spring(pressScale, { toValue: 1, friction: 5, tension: 180, useNativeDriver: true }),
      ]),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    if (typeof onPress === 'function') {
      onPress();
    }
  };

  if (keyboardVisible) return null;

  const rippleScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  const rippleOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 0.4, 0],
  });

  const activeSource = compactSquare
    ? squareSource || COPILOT_SQUARE_ASSET || COPILOT_MINI_ASSET
    : capsuleSource || COPILOT_CAPSULE_ASSET || COPILOT_SQUARE_ASSET;

  const accent = isDark ? '#20BFAE' : '#168F88';
  const mergeBg = isDark ? '#0B151E' : '#EBF2F4';
  const rimColor = isDark ? 'rgba(32, 191, 174, 0.65)' : 'rgba(22, 143, 136, 0.55)';

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.floatingMover,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: pressScale },
          ],
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulseRing,
          compactSquare ? styles.squareFrame : styles.capsuleFrame,
          {
            borderColor: accent,
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />

      <View
        style={[
          styles.mergedFrame,
          compactSquare ? styles.squareFrame : styles.capsuleFrame,
          {
            backgroundColor: mergeBg,
            borderColor: rimColor,
          },
        ]}
      >
        {activeSource ? (
          <Image
            source={activeSource}
            resizeMode="cover"
            style={[
              styles.assetImage,
              compactSquare ? styles.squareImage : styles.capsuleImage,
            ]}
          />
        ) : (
          <View style={styles.fallbackInner}>
            <View style={[styles.syncOrb, { backgroundColor: accent }]}>
              <View style={styles.syncOrbDot} />
            </View>
            {!compactSquare ? (
              <View>
                <Text
                  style={[styles.fallbackTitle, { color: isDark ? '#E7EDF2' : '#183238' }]}
                  numberOfLines={1}
                >
                  SETU AI
                </Text>
                <Text style={[styles.fallbackSub, { color: accent }]} numberOfLines={1}>
                  Co-Pilot
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * SETU AI Co-Pilot Screen
 * Supports both full-screen mode and a small movable floating window (`floatingWindow={true}`)
 * that the user can drag around the screen.
 */
export default function SetuAiCopilotScreen({
  isDark = true,
  floatingWindow = false,
  currentContext = null,
  writingStyle = 'Professional Trade',
  onClose,
  onToggleExpand,
  onApplyDraftToScreen,
}) {
  const { width: winW, height: winH } = Dimensions.get('window');

  const [contextAsked, setContextAsked] = useState(false);
  const [attachedContext, setAttachedContext] = useState(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: 'SETU AI Co-Pilot ready. Drag this window anywhere on screen. Ask for drafts, checks, or summaries.',
      draft: null,
    },
  ]);

  const winBoxW = Math.min(340, winW - 24);
  const winBoxH = Math.min(440, Math.round(winH * 0.56));
  const initX = Math.max(12, Math.round((winW - winBoxW) / 2));
  const initY = Math.max(56, Math.round((winH - winBoxH) / 2) - 24);

  const winPan = useRef(new Animated.ValueXY({ x: initX, y: initY })).current;
  const winOffsetRef = useRef({ x: initX, y: initY });

  const headerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => floatingWindow,
      onMoveShouldSetPanResponder: (_, g) =>
        floatingWindow && (Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2),
      onPanResponderGrant: () => {
        winPan.setOffset({ x: winOffsetRef.current.x, y: winOffsetRef.current.y });
        winPan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, g) => {
        winPan.setValue({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: (_, g) => {
        winPan.flattenOffset();
        const maxX = Math.max(8, winW - winBoxW - 8);
        const maxY = Math.max(36, winH - winBoxH - 20);
        const nx = Math.min(Math.max(8, winOffsetRef.current.x + g.dx), maxX);
        const ny = Math.min(Math.max(36, winOffsetRef.current.y + g.dy), maxY);
        winOffsetRef.current = { x: nx, y: ny };
        winPan.setValue({ x: nx, y: ny });
      },
    })
  ).current;

  useEffect(() => {
    if (floatingWindow) return;
    const onBack = () => {
      if (typeof onClose === 'function') {
        onClose();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [floatingWindow, onClose]);

  useEffect(() => {
    setContextAsked(false);
    setAttachedContext(null);
  }, [currentContext?.title, currentContext?.screenName]);

  const C = isDark
    ? {
        bg: '#0C141D',
        card: '#151F29',
        cardAlt: '#1B2836',
        border: '#233343',
        text: '#E7EDF2',
        sub: '#93A3B3',
        teal: '#20BFAE',
        tealSoft: 'rgba(32, 191, 174, 0.14)',
      }
    : {
        bg: '#F1F4F5',
        card: '#FFFFFF',
        cardAlt: '#E6ECEE',
        border: '#D9E1E5',
        text: '#25313A',
        sub: '#5E6F7B',
        teal: '#168F88',
        tealSoft: 'rgba(22, 143, 136, 0.12)',
      };

  const brandBadgeSource = COPILOT_MINI_ASSET || COPILOT_SQUARE_ASSET;

  const handleSend = (customPrompt) => {
    const promptVal = (typeof customPrompt === 'string' ? customPrompt : inputText).trim();
    if (!promptVal) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: promptVal,
      draft: null,
    };

    const reply = buildSmartBetaReply(promptVal, attachedContext, writingStyle);
    const aiMsg = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      text: reply.text,
      draft: reply.draft,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    if (typeof customPrompt !== 'string') {
      setInputText('');
    }
  };

  const handleCopy = (txt) => {
    Clipboard.setString(txt || '');
    Alert.alert('Copied', 'Draft copied to clipboard.');
  };

  const handleUseDraft = (draftText) => {
    if (!draftText) return;
    if (typeof onApplyDraftToScreen === 'function') {
      onApplyDraftToScreen({
        draftText,
        targetContext: attachedContext || currentContext,
      });
      Alert.alert(
        'Draft Sent to Screen',
        'Draft applied to your active screen. Review and send/publish manually.'
      );
    } else {
      handleCopy(draftText);
    }
  };

  const showAskContextBanner = Boolean(currentContext) && !contextAsked && !attachedContext;

  const innerContent = (
    <>
      {/* Draggable / Top Header */}
      <View
        {...(floatingWindow ? headerPanResponder.panHandlers : {})}
        style={[styles.topBar, { borderBottomColor: C.border, backgroundColor: C.card }]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onClose}
          style={[styles.iconCircle, { backgroundColor: C.cardAlt, borderColor: C.border }]}
        >
          <Text style={{ color: C.teal, fontSize: 16, fontWeight: '800' }}>✕</Text>
        </TouchableOpacity>

        {brandBadgeSource ? (
          <View
            style={[
              styles.headerMarkWrap,
              { backgroundColor: isDark ? '#0B151E' : '#EBF2F4', borderColor: C.teal },
            ]}
          >
            <Image
              source={brandBadgeSource}
              resizeMode="cover"
              style={styles.headerMarkImg}
            />
          </View>
        ) : null}

        <View style={{ flex: 1, marginHorizontal: 8 }}>
          <Text style={[styles.headerMain, { color: C.text }]} numberOfLines={1}>
            SETU AI Co-Pilot
          </Text>
          <Text style={[styles.headerSub, { color: C.sub }]} numberOfLines={1}>
            {floatingWindow
              ? 'Drag header to move · Ask-first'
              : attachedContext
              ? `Synced: ${attachedContext.title || attachedContext.screenName}`
              : 'Ask-first context · Manual approval'}
          </Text>
        </View>

        {typeof onToggleExpand === 'function' ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggleExpand}
            style={[styles.modeBtn, { backgroundColor: C.tealSoft, borderColor: C.teal }]}
          >
            <Text style={{ color: C.teal, fontSize: 11, fontWeight: '800' }}>
              {floatingWindow ? 'Full' : 'Float'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.bodyScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showAskContextBanner ? (
          <View style={[styles.contextCard, { backgroundColor: C.cardAlt, borderColor: C.teal }]}>
            <Text style={[styles.contextBadge, { color: C.teal }]}>ASK FIRST · CONTEXT</Text>
            <Text style={[styles.contextTitle, { color: C.text }]}>
              Attach "{currentContext.title || currentContext.screenName}"?
            </Text>
            <View style={styles.contextBtnRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setAttachedContext(currentContext);
                  setContextAsked(true);
                }}
                style={[styles.primaryPill, { backgroundColor: C.teal }]}
              >
                <Text style={styles.primaryPillTxt}>Attach</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setAttachedContext(null);
                  setContextAsked(true);
                }}
                style={[
                  styles.secondaryPill,
                  { backgroundColor: C.card, borderColor: C.border },
                ]}
              >
                <Text style={[styles.secondaryPillTxt, { color: C.text }]}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {attachedContext ? (
          <View
            style={[
              styles.attachedStrip,
              { backgroundColor: C.tealSoft, borderColor: C.teal },
            ]}
          >
            <Text style={[styles.attachedTxt, { color: C.text }]} numberOfLines={1}>
              Attached: {attachedContext.title || attachedContext.screenName}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setAttachedContext(null);
                setContextAsked(true);
              }}
            >
              <Text style={{ color: C.teal, fontSize: 11.5, fontWeight: '800' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.quickGrid}>
          {QUICK_PROMPTS.map((qp) => (
            <TouchableOpacity
              key={qp.id}
              activeOpacity={0.85}
              onPress={() => handleSend(qp.prompt)}
              style={[styles.quickChip, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <Text style={[styles.quickChipTxt, { color: C.text }]} numberOfLines={1}>
                {qp.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <View
              key={m.id}
              style={[
                styles.msgCard,
                {
                  backgroundColor: isUser ? C.tealSoft : C.card,
                  borderColor: isUser ? C.teal : C.border,
                },
              ]}
            >
              <Text style={[styles.msgRole, { color: isUser ? C.teal : C.sub }]}>
                {isUser ? 'YOU' : 'SETU AI CO-PILOT'}
              </Text>
              <Text style={[styles.msgText, { color: C.text }]}>{m.text}</Text>

              {m.draft ? (
                <View
                  style={[
                    styles.draftBox,
                    { backgroundColor: C.cardAlt, borderColor: C.border },
                  ]}
                >
                  <Text style={[styles.draftLabel, { color: C.teal }]}>DRAFT PREVIEW</Text>
                  <Text style={[styles.draftBody, { color: C.text }]}>{m.draft}</Text>
                  <View style={styles.draftActions}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleUseDraft(m.draft)}
                      style={[styles.smallBtn, { backgroundColor: C.teal }]}
                    >
                      <Text style={styles.smallBtnWhite}>Use Draft (OK)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleCopy(m.draft)}
                      style={[styles.smallBtnOutline, { borderColor: C.border }]}
                    >
                      <Text style={{ color: C.text, fontSize: 11.5, fontWeight: '700' }}>
                        Copy
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Prompt Input */}
      <View style={[styles.composerBar, { backgroundColor: C.card, borderTopColor: C.border }]}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask SETU AI..."
          placeholderTextColor={C.sub}
          multiline
          style={[
            styles.composerInput,
            { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text },
          ]}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleSend()}
          style={[styles.sendBtn, { backgroundColor: C.teal }]}
        >
          <Text style={styles.sendBtnTxt}>Ask</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  if (floatingWindow) {
    return (
      <Animated.View
        style={[
          styles.floatingWindowBox,
          {
            width: winBoxW,
            height: winBoxH,
            backgroundColor: C.bg,
            borderColor: C.teal,
            transform: [{ translateX: winPan.x }, { translateY: winPan.y }],
          },
        ]}
      >
        {innerContent}
      </Animated.View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.screenSafe,
        { backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? 4 : 0 },
      ]}
    >
      {innerContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  floatingMover: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 50,
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 1.5,
  },
  mergedFrame: {
    overflow: 'hidden',
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsuleFrame: {
    height: 46,
    width: 148,
    borderRadius: 23,
  },
  squareFrame: {
    width: 46,
    height: 46,
    borderRadius: 14,
  },
  assetImage: {
    width: '100%',
    height: '100%',
  },
  capsuleImage: {
    transform: [{ scale: 1.12 }],
  },
  squareImage: {
    transform: [{ scale: 1.08 }],
  },
  fallbackInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  syncOrb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncOrbDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  fallbackTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    lineHeight: 13,
  },
  fallbackSub: {
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },

  floatingWindowBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 60,
    borderRadius: 16,
    borderWidth: 1.4,
    overflow: 'hidden',
    elevation: 10,
  },
  screenSafe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMarkWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMarkImg: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.08 }],
  },
  headerMain: { fontSize: 15, fontWeight: '900' },
  headerSub: { fontSize: 10.5, marginTop: 1 },
  modeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  bodyScroll: { padding: 10, paddingBottom: 16 },
  contextCard: {
    borderWidth: 1.2,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  contextBadge: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  contextTitle: { fontSize: 13, fontWeight: '800', marginTop: 3 },
  contextBtnRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primaryPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  primaryPillTxt: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' },
  secondaryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryPillTxt: { fontSize: 11.5, fontWeight: '700' },
  attachedStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    marginBottom: 10,
  },
  attachedTxt: { flex: 1, fontSize: 11.5, fontWeight: '700', marginRight: 8 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  quickChipTxt: { fontSize: 11.5, fontWeight: '700' },
  msgCard: {
    borderWidth: 1,
    borderRadius: 11,
    padding: 10,
    marginBottom: 8,
  },
  msgRole: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
  msgText: { fontSize: 12.5, lineHeight: 18 },
  draftBox: {
    marginTop: 8,
    padding: 9,
    borderRadius: 9,
    borderWidth: 1,
  },
  draftLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  draftBody: { fontSize: 11.5, lineHeight: 16 },
  draftActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  smallBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  smallBtnWhite: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  smallBtnOutline: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12.5,
    maxHeight: 76,
  },
  sendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
