import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Share,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';

const AGMARKNET_API_KEY = '579b464db66ec23bdd00000126e3ad53d0e049c374bb6bbccfee0b03';
const AGMARKNET_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${AGMARKNET_API_KEY}&format=json&limit=45`;
const TRADE_SETUU_APP_LINK = 'https://tradesetuu.app/download';

const CATEGORIES = [
  'All',
  'Grains',
  'Pulses',
  'Oilseeds',
  'Spices',
  'Fruits',
  'Vegetables',
  'Metals',
  'Energy',
  'Petroleum',
  'Chemicals',
  'Fertilizers',
  'Machinery',
  'Other',
];

const SHARE_LANGUAGES = [
  { code: 'HI', label: 'हिंदी' },
  { code: 'EN', label: 'English' },
  { code: 'CG', label: 'छत्तीसगढ़ी' },
  { code: 'MR', label: 'मराठी' },
  { code: 'BN', label: 'বাংলা' },
];

const LANG_COPY = {
  HI: {
    header: 'TRADE SETUU — मार्केट पल्स',
    commodityLbl: 'कमोडिटी',
    marketLbl: 'मंडी / मार्केट',
    rateLbl: 'भाव',
    statusLbl: 'डेटा स्थिति',
    sourceLbl: 'स्रोत',
    updatedLbl: 'अपडेट',
    generatedLbl: 'रिपोर्ट समय',
    analystTitle: 'मार्केट एनालिस्ट व्यू (रुझान व आगे की दिशा)',
    outlookUp: 'बाज़ार में फ़िलहाल मज़बूती/खरीद रुझान दिख रहा है; आवक और डिमांड पर नज़र रखें।',
    outlookSoft: 'बाज़ार में फ़िलहाल नरमी या सीमित दायरे का रुझान दिख रहा है; सौदे से पहले ताज़ा भाव जांचें।',
    disclaimer: 'नोट: यह मार्केट एनालिसिस व इंडिकेटिव जानकारी है, गारंटीड ट्रेडिंग/निवेश सलाह नहीं।',
    cta: `पूरी जानकारी और रेगुलर मार्केट भाव के लिए Trade SETUU ऐप देखें: ${TRADE_SETUU_APP_LINK}`,
  },
  EN: {
    header: 'TRADE SETUU — MARKET PULSE',
    commodityLbl: 'Commodity',
    marketLbl: 'Market',
    rateLbl: 'Rate',
    statusLbl: 'Status',
    sourceLbl: 'Source',
    updatedLbl: 'Updated',
    generatedLbl: 'Generated',
    analystTitle: 'MARKET ANALYST OUTLOOK',
    outlookUp: 'Current movement shows firmer momentum; watch arrival pace and buyer demand.',
    outlookSoft: 'Current movement appears soft or range-bound; verify latest quotes before execution.',
    disclaimer: 'Note: Indicative market intelligence for reference only, not guaranteed investment advice.',
    cta: `For complete market intelligence and regular price updates, get Trade SETUU: ${TRADE_SETUU_APP_LINK}`,
  },
  CG: {
    header: 'TRADE SETUU — मार्केट पल्स',
    commodityLbl: 'कमोडिटी',
    marketLbl: 'मंडी / बाज़ार',
    rateLbl: 'भाव',
    statusLbl: 'डेटा स्थिति',
    sourceLbl: 'स्रोत',
    updatedLbl: 'अपडेट',
    generatedLbl: 'रिपोर्ट समय',
    analystTitle: 'मार्केट एनालिस्ट बिचार (अभी अउ आगे के रुख)',
    outlookUp: 'अक्ती मंडी/बाज़ार म मजबूती अउ मांग के रुख दिखत हे; आवक ऊपर धियान रखव।',
    outlookSoft: 'अक्ती बाज़ार म नरमी या तय दायरा के रुख दिखत हे; लेनदेन ले पहिली ताज़ा भाव देखव।',
    disclaimer: 'नोट: ये सिरिफ जानकारी अउ एनालिसिस आय, पक्का निवेश या ट्रेडिंग सलाह नोहय।',
    cta: `पूरा जानकारी अउ रोज के ताज़ा भाव बर Trade SETUU ऐप देखव: ${TRADE_SETUU_APP_LINK}`,
  },
  MR: {
    header: 'TRADE SETUU — मार्केट पल्स',
    commodityLbl: 'कमोडिटी',
    marketLbl: 'बाजार / मंडी',
    rateLbl: 'दर',
    statusLbl: 'डेटा स्थिती',
    sourceLbl: 'स्रोत',
    updatedLbl: 'अपडेट',
    generatedLbl: 'रिपोर्ट वेळ',
    analystTitle: 'मार्केट अ‍ॅनालिस्ट दृष्टिकोन',
    outlookUp: 'सध्या बाजारात मजबुतीचा कल दिसून येत आहे; आवक आणि मागणीवर लक्ष ठेवा.',
    outlookSoft: 'सध्या बाजारात मऊपणा किंवा मर्यादित हालचाल दिसत आहे; व्यवहारापूर्वी ताजे दर तपासा.',
    disclaimer: 'टीप: ही केवळ माहिती व विश्लेषणासाठी आहे, खात्रीशीर गुंतवणूक सल्ला नाही.',
    cta: `संपूर्ण माहिती आणि रोजचे ताजे बाजारभाव पाहण्यासाठी Trade SETUU अ‍ॅप पाहा: ${TRADE_SETUU_APP_LINK}`,
  },
  BN: {
    header: 'TRADE SETUU — মার্কেট পালস',
    commodityLbl: 'পণ্য',
    marketLbl: 'বাজার / মান্ডি',
    rateLbl: 'দর',
    statusLbl: 'তথ্যের অবস্থা',
    sourceLbl: 'উৎস',
    updatedLbl: 'আপডেট',
    generatedLbl: 'রিপোর্ট সময়',
    analystTitle: 'মার্কেট অ্যানালিস্ট আউটলুক',
    outlookUp: 'বর্তমানে বাজারে দৃঢ়তা/চাহিদার প্রবণতা দেখা যাচ্ছে; সরবরাহ ও চাহিদার দিকে নজর রাখুন।',
    outlookSoft: 'বর্তমানে বাজারে নরম বা সীমাবদ্ধ প্রবণতা দেখা যাচ্ছে; লেনদেনের আগে সর্বশেষ দর যাচাই করুন।',
    disclaimer: 'দ্রষ্টব্য: এটি কেবল বিশ্লেষণ ও নির্দেশনামূলক তথ্য, নিশ্চিত বিনিয়োগ পরামর্শ নয়।',
    cta: `সম্পূর্ণ তথ্য ও নিয়মিত বাজারদরের জন্য Trade SETUU অ্যাপ দেখুন: ${TRADE_SETUU_APP_LINK}`,
  },
};

const FALLBACK_ITEMS = [
  {
    id: 'mp-1',
    commodity: 'Maize (Hybrid)',
    category: 'Grains',
    market: 'Nagpur APMC',
    state: 'Maharashtra',
    country: 'India',
    marketScope: 'local',
    price: 2300,
    previousPrice: 2259,
    unit: '/ Qtl',
    currency: '₹',
    changePct: '+1.8%',
    isPositive: true,
    minPrice: 2200,
    modalPrice: 2300,
    maxPrice: 2500,
    dataTag: 'Sample / Indicative',
    source: 'Fallback Snapshot',
    dataUpdatedAt: '26 Nov 2026',
    analysisGeneratedAt: '27 Nov 2026, 11:20 AM IST',
    history: {
      '7D': [2210, 2225, 2240, 2235, 2260, 2258, 2300],
      '30D': [2140, 2175, 2200, 2255, 2300],
      '90D': [2050, 2120, 2190, 2260, 2300],
      '1Y': [1920, 2040, 2150, 2220, 2300],
    },
    nearbyMarkets: [
      { name: 'Nagpur APMC', price: '₹2,300 / Qtl' },
      { name: 'Raipur Mandi', price: '₹2,265 / Qtl' },
      { name: 'Indore Mandi', price: '₹2,290 / Qtl' },
    ],
    fobReference: 'Yellow Maize FOB Kakinada / Vizag — Indicative Export Lane',
  },
  {
    id: 'mp-2',
    commodity: 'Tomato (Hybrid)',
    category: 'Vegetables',
    market: 'Raipur Mandi',
    state: 'Chhattisgarh',
    country: 'India',
    marketScope: 'local',
    price: 1850,
    previousPrice: 1794,
    unit: '/ Qtl',
    currency: '₹',
    changePct: '+3.1%',
    isPositive: true,
    minPrice: 1650,
    modalPrice: 1850,
    maxPrice: 2050,
    dataTag: 'Sample / Indicative',
    source: 'Fallback Snapshot',
    dataUpdatedAt: '26 Nov 2026',
    analysisGeneratedAt: '27 Nov 2026, 11:20 AM IST',
    history: {
      '7D': [1620, 1680, 1710, 1740, 1790, 1794, 1850],
      '30D': [1450, 1560, 1690, 1780, 1850],
      '90D': [1320, 1480, 1620, 1750, 1850],
      '1Y': [1180, 1390, 1580, 1720, 1850],
    },
    nearbyMarkets: [
      { name: 'Raipur Mandi', price: '₹1,850 / Qtl' },
      { name: 'Nagpur Veg Market', price: '₹1,790 / Qtl' },
      { name: 'Indore Mandi', price: '₹1,820 / Qtl' },
    ],
    fobReference: 'Regional Fresh Produce — Short Shelf-Life Domestic / Nearby Lane',
  },
  {
    id: 'mp-3',
    commodity: 'Banana (Grand Naine)',
    category: 'Fruits',
    market: 'Jalgaon Mandi',
    state: 'Maharashtra',
    country: 'India',
    marketScope: 'local',
    price: 1620,
    previousPrice: 1640,
    unit: '/ Qtl',
    currency: '₹',
    changePct: '-1.2%',
    isPositive: false,
    minPrice: 1480,
    modalPrice: 1620,
    maxPrice: 1750,
    dataTag: 'Sample / Indicative',
    source: 'Fallback Snapshot',
    dataUpdatedAt: '26 Nov 2026',
    analysisGeneratedAt: '27 Nov 2026, 11:20 AM IST',
    history: {
      '7D': [1690, 1680, 1665, 1650, 1645, 1640, 1620],
      '30D': [1540, 1590, 1655, 1640, 1620],
      '90D': [1460, 1520, 1600, 1645, 1620],
      '1Y': [1350, 1450, 1550, 1610, 1620],
    },
    nearbyMarkets: [
      { name: 'Jalgaon Mandi', price: '₹1,620 / Qtl' },
      { name: 'Nagpur Market', price: '₹1,660 / Qtl' },
    ],
    fobReference: 'Fresh Banana Export Lane (JNPT -> Gulf) — Reefer & Quality Check',
  },
  {
    id: 'mp-4',
    commodity: 'Turmeric Finger',
    category: 'Spices',
    market: 'Sangli Mandi',
    state: 'Maharashtra',
    country: 'India',
    marketScope: 'local',
    price: 14200,
    previousPrice: 14004,
    unit: '/ Qtl',
    currency: '₹',
    changePct: '+1.4%',
    isPositive: true,
    minPrice: 13400,
    modalPrice: 14200,
    maxPrice: 14950,
    dataTag: 'Sample / Indicative',
    source: 'Fallback Snapshot',
    dataUpdatedAt: '26 Nov 2026',
    analysisGeneratedAt: '27 Nov 2026, 11:20 AM IST',
    history: {
      '7D': [13850, 13920, 13980, 14050, 14110, 14004, 14200],
      '30D': [13200, 13550, 13880, 14080, 14200],
      '90D': [12600, 13100, 13650, 14000, 14200],
      '1Y': [11400, 12200, 13100, 13800, 14200],
    },
    nearbyMarkets: [
      { name: 'Sangli Mandi', price: '₹14,200 / Qtl' },
      { name: 'Nizamabad Mandi', price: '₹14,050 / Qtl' },
    ],
    fobReference: 'Spice Export Reference — Moisture & Curcumin Spec Check',
  },
  {
    id: 'mp-5',
    commodity: 'Copper Cathode (LME Ref)',
    category: 'Metals',
    market: 'LME Global Benchmark',
    state: 'Global',
    country: 'Global',
    marketScope: 'global',
    price: 9140,
    previousPrice: 9032,
    unit: '/ MT',
    currency: '$',
    changePct: '+1.2%',
    isPositive: true,
    minPrice: 8990,
    modalPrice: 9140,
    maxPrice: 9230,
    dataTag: 'Sample / Indicative',
    source: 'Fallback Snapshot',
    dataUpdatedAt: '26 Nov 2026',
    analysisGeneratedAt: '27 Nov 2026, 11:20 AM IST',
    history: {
      '7D': [8960, 9010, 8995, 9050, 9080, 9031, 9140],
      '30D': [8810, 8890, 8950, 9040, 9140],
      '90D': [8600, 8750, 8880, 9010, 9140],
      '1Y': [8250, 8490, 8720, 8940, 9140],
    },
    nearbyMarkets: [
      { name: 'LME Benchmark', price: '$9,140 / MT' },
      { name: 'MCX India Ref', price: '₹8,12,500 / MT' },
    ],
    fobReference: 'Global Industrial Metal Reference — Freight & Duty Extra',
  },
];

function guessCategory(commodityName = '') {
  const c = String(commodityName).toLowerCase();
  if (
    c.includes('tomato') ||
    c.includes('potato') ||
    c.includes('onion') ||
    c.includes('gourd') ||
    c.includes('brinjal') ||
    c.includes('cabbage') ||
    c.includes('cauliflower') ||
    c.includes('vegetable')
  ) {
    return 'Vegetables';
  }
  if (
    c.includes('banana') ||
    c.includes('apple') ||
    c.includes('mango') ||
    c.includes('orange') ||
    c.includes('papaya') ||
    c.includes('guava') ||
    c.includes('pomegranate') ||
    c.includes('fruit')
  ) {
    return 'Fruits';
  }
  if (
    c.includes('turmeric') ||
    c.includes('chilli') ||
    c.includes('coriander') ||
    c.includes('cumin') ||
    c.includes('garlic') ||
    c.includes('ginger') ||
    c.includes('pepper') ||
    c.includes('cardamom')
  ) {
    return 'Spices';
  }
  if (
    c.includes('gram') ||
    c.includes('chana') ||
    c.includes('tur') ||
    c.includes('arhar') ||
    c.includes('moong') ||
    c.includes('urad') ||
    c.includes('lentil') ||
    c.includes('pulse')
  ) {
    return 'Pulses';
  }
  if (
    c.includes('mustard') ||
    c.includes('soybean') ||
    c.includes('sunflower') ||
    c.includes('groundnut') ||
    c.includes('sesame') ||
    c.includes('castor') ||
    c.includes('oilseed')
  ) {
    return 'Oilseeds';
  }
  if (
    c.includes('copper') ||
    c.includes('aluminium') ||
    c.includes('aluminum') ||
    c.includes('zinc') ||
    c.includes('steel') ||
    c.includes('brass') ||
    c.includes('lead') ||
    c.includes('nickel') ||
    c.includes('metal')
  ) {
    return 'Metals';
  }
  if (
    c.includes('petrol') ||
    c.includes('diesel') ||
    c.includes('kero') ||
    c.includes('lpg') ||
    c.includes('bitumen') ||
    c.includes('naphtha')
  ) {
    return 'Petroleum';
  }
  if (
    c.includes('crude') ||
    c.includes('gas') ||
    c.includes('coal') ||
    c.includes('power') ||
    c.includes('energy')
  ) {
    return 'Energy';
  }
  if (c.includes('fertilizer') || c.includes('urea') || c.includes('dap') || c.includes('potash')) {
    return 'Fertilizers';
  }
  if (c.includes('chemical') || c.includes('acid') || c.includes('solvent') || c.includes('polymer')) {
    return 'Chemicals';
  }
  if (c.includes('machine') || c.includes('pump') || c.includes('motor') || c.includes('tractor')) {
    return 'Machinery';
  }
  if (
    c.includes('wheat') ||
    c.includes('maize') ||
    c.includes('rice') ||
    c.includes('paddy') ||
    c.includes('barley') ||
    c.includes('sorghum') ||
    c.includes('bajra') ||
    c.includes('jowar') ||
    c.includes('grain')
  ) {
    return 'Grains';
  }
  return 'Other';
}

function computeChangeMeta(currentPrice, previousPrice, fallbackChangePct, fallbackIsPositive) {
  const curr = Number(currentPrice || 0);
  const prev = Number(previousPrice || 0);
  if (prev > 0 && curr > 0) {
    const pctNum = ((curr - prev) / prev) * 100;
    const rounded = pctNum.toFixed(1);
    return {
      changePct: `${pctNum > 0 ? '+' : ''}${rounded}%`,
      isPositive: pctNum >= 0,
      hasChange: true,
    };
  }
  if (typeof fallbackChangePct === 'string' && fallbackChangePct.trim().length > 0) {
    return {
      changePct: fallbackChangePct,
      isPositive: Boolean(fallbackIsPositive),
      hasChange: true,
    };
  }
  return {
    changePct: 'Change unavailable',
    isPositive: null,
    hasChange: false,
  };
}

function mapAgmarknetRecords(records = []) {
  const generatedStamp = new Date().toLocaleString('en-IN');
  return records.map((r, idx) => {
    const modalNum = Number(r.modal_price || r.min_price || r.max_price || 0);
    const minNum = Number(r.min_price || modalNum || 0);
    const maxNum = Number(r.max_price || modalNum || 0);
    const prevNum = Number(r.previous_price || r.prev_modal_price || 0);
    const { changePct, isPositive, hasChange } = computeChangeMeta(
      modalNum,
      prevNum,
      null,
      null
    );

    const baseName = r.commodity || 'Commodity';
    const fullCommodity = r.variety ? `${baseName} (${r.variety})` : baseName;
    const marketName = r.market || 'APMC Mandi';
    const stateName = r.state || 'India';
    const arrivalStamp = r.arrival_date || 'Arrival date not specified';

    return {
      id: `ag-${idx}-${marketName}-${arrivalStamp}`,
      commodity: fullCommodity,
      category: guessCategory(baseName),
      market: marketName,
      state: stateName,
      country: 'India',
      marketScope: 'local',
      price: modalNum,
      previousPrice: prevNum > 0 ? prevNum : null,
      unit: '/ Qtl',
      currency: '₹',
      changePct,
      isPositive,
      hasChange,
      minPrice: minNum,
      modalPrice: modalNum,
      maxPrice: maxNum,
      dataTag: 'Live',
      source: 'Agmarknet (data.gov.in)',
      dataUpdatedAt: `Arrival: ${arrivalStamp}`,
      analysisGeneratedAt: generatedStamp,
      history: {
        '7D': [minNum, modalNum, maxNum || modalNum],
        '30D': [minNum, modalNum, maxNum || modalNum],
        '90D': [minNum, modalNum, maxNum || modalNum],
        '1Y': [minNum, modalNum, maxNum || modalNum],
      },
      nearbyMarkets: [
        {
          name: marketName,
          price: `₹${modalNum.toLocaleString('en-IN')} / Qtl`,
        },
      ],
      fobReference: 'Check export policy, port logistics & quality specs for this commodity',
    };
  });
}

function buildShareDraft(item, mode, langCode) {
  const copy = LANG_COPY[langCode] || LANG_COPY.HI;
  const outlookLine =
    item.isPositive === false ? copy.outlookSoft : copy.outlookUp;
  const formattedPrice = `${item.currency}${Number(item.price || 0).toLocaleString('en-IN')} ${item.unit || ''}`;
  const changePart = item.hasChange !== false ? ` (${item.changePct})` : ` (${copy.statusLbl}: ${item.changePct})`;

  const lines = [
    `${copy.header} (${mode === 'full_report' ? 'Full Report' : 'Quick Card'})`,
    `${copy.commodityLbl}: ${item.commodity} [${item.category}]`,
    `${copy.marketLbl}: ${item.market}`,
    `${copy.rateLbl}: ${formattedPrice}${changePart}`,
  ];

  if (mode === 'full_report') {
    lines.push(
      `Min / Modal / Max: ${item.currency}${item.minPrice} / ${item.currency}${item.modalPrice} / ${item.currency}${item.maxPrice}`,
      `${copy.statusLbl}: ${item.dataTag} | ${copy.sourceLbl}: ${item.source}`,
      `${copy.updatedLbl}: ${item.dataUpdatedAt} | ${copy.generatedLbl}: ${item.analysisGeneratedAt}`,
      `${copy.analystTitle}: ${outlookLine}`,
      `Export / Trade Ref: ${item.fobReference}`
    );
  } else {
    lines.push(
      `${copy.analystTitle}: ${outlookLine}`,
      `${copy.statusLbl}: ${item.dataTag} | ${copy.updatedLbl}: ${item.dataUpdatedAt}`
    );
  }

  lines.push(copy.disclaimer, copy.cta);
  return lines.join('\n');
}

export default function MarketPulseScreen({
  theme = 'dark',
  externalItems,
  userProfile,
  onBackToApp,
}) {
  const isDark = theme !== 'light';

  const C = {
    bg: isDark ? '#071521' : '#F3F5F8',
    card: isDark ? '#102738' : '#FFFFFF',
    cardAlt: isDark ? '#0B1D2C' : '#F8FAFC',
    border: isDark ? '#1E3E54' : '#E2E8F0',
    text: isDark ? '#DCE8EF' : '#0F172A',
    sub: isDark ? '#8FAAC0' : '#64748B',
    teal: '#20C8C1',
    amber: '#F59E0B',
    ok: '#4ADE80',
    warn: '#F87171',
  };

  const defaultTab = useMemo(() => {
    const bizCountry = String(
      userProfile?.businessCountry || userProfile?.residenceCountry || ''
    ).toLowerCase();
    if (bizCountry && bizCountry !== 'india' && bizCountry !== 'in') {
      return 'global';
    }
    return 'local';
  }, [userProfile]);

  const [liveItems, setLiveItems] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [fetchNonce, setFetchNonce] = useState(0);

  useEffect(() => {
    if (Array.isArray(externalItems) && externalItems.length > 0) {
      setFeedError('');
      return;
    }
    let active = true;
    setLoadingLive(true);
    setFeedError('');

    fetch(AGMARKNET_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data?.records) && data.records.length > 0) {
          setLiveItems(mapAgmarknetRecords(data.records));
          setFeedError('');
        } else {
          setLiveItems([]);
          setFeedError('No live records returned right now; showing sample/indicative items.');
        }
      })
      .catch(() => {
        if (!active) return;
        setLiveItems([]);
        setFeedError('Live feed unavailable or network issue; showing sample/indicative items.');
      })
      .finally(() => {
        if (active) setLoadingLive(false);
      });

    return () => {
      active = false;
    };
  }, [externalItems, fetchNonce]);

  const items = useMemo(() => {
    const rawList =
      Array.isArray(externalItems) && externalItems.length > 0
        ? externalItems
        : liveItems.length > 0
          ? [...liveItems, ...FALLBACK_ITEMS.filter((f) => f.marketScope === 'global')]
          : FALLBACK_ITEMS;

    return rawList.map((it) => {
      const meta = computeChangeMeta(it.price, it.previousPrice, it.changePct, it.isPositive);
      return {
        ...it,
        category: CATEGORIES.includes(it.category) ? it.category : guessCategory(it.commodity),
        marketScope: it.marketScope === 'global' ? 'global' : 'local',
        changePct: meta.changePct,
        isPositive: meta.isPositive,
        hasChange: meta.hasChange,
      };
    });
  }, [externalItems, liveItems]);

  const [subView, setSubView] = useState('list');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [historyRange, setHistoryRange] = useState('7D');

  const [marketTab, setMarketTab] = useState(defaultTab);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [tickerCollapsed, setTickerCollapsed] = useState(false);

  const [shareModalItem, setShareModalItem] = useState(null);
  const [shareFormat, setShareFormat] = useState('image_card');
  const [shareLang, setShareLang] = useState('HI');
  const [alertModalItem, setAlertModalItem] = useState(null);
  const [alertDirection, setAlertDirection] = useState('Falls Below');
  const [alertTargetVal, setAlertTargetVal] = useState('');
  const [savedAlerts, setSavedAlerts] = useState([]);

  useEffect(() => {
    setMarketTab(defaultTab);
  }, [defaultTab]);

  const toggleWatchlist = (itemId) => {
    setWatchlistIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleBack = useCallback(() => {
    if (shareModalItem) {
      setShareModalItem(null);
      return true;
    }
    if (alertModalItem) {
      setAlertModalItem(null);
      return true;
    }
    if (subView === 'detail') {
      setSubView('list');
      return true;
    }
    if (typeof onBackToApp === 'function') {
      onBackToApp();
      return true;
    }
    return false;
  }, [shareModalItem, alertModalItem, subView, onBackToApp]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => handleBack());
    return () => sub.remove();
  }, [handleBack]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const scopeMatch =
        marketTab === 'local' ? it.marketScope !== 'global' : it.marketScope === 'global';

      const catMatch = selectedCategory === 'All' || it.category === selectedCategory;
      const watchMatch = !watchlistOnly || watchlistIds.includes(it.id);
      const textMatch =
        !q ||
        (it.commodity && it.commodity.toLowerCase().includes(q)) ||
        (it.market && it.market.toLowerCase().includes(q)) ||
        (it.state && it.state.toLowerCase().includes(q)) ||
        (it.country && it.country.toLowerCase().includes(q)) ||
        (it.category && it.category.toLowerCase().includes(q));

      return scopeMatch && catMatch && watchMatch && textMatch;
    });
  }, [items, searchQuery, selectedCategory, marketTab, watchlistOnly, watchlistIds]);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) || filteredItems[0] || items[0],
    [items, selectedItemId, filteredItems]
  );

  const openCommodityDetail = (item) => {
    Keyboard.dismiss();
    setSelectedItemId(item.id);
    setSubView('detail');
  };

  const openShareForItem = (item) => {
    Keyboard.dismiss();
    setShareFormat('image_card');
    setShareModalItem(item);
  };

  const openAlertForItem = (item) => {
    Keyboard.dismiss();
    setAlertDirection('Falls Below');
    setAlertTargetVal(String(item.price || ''));
    setAlertModalItem(item);
  };

  const handleSelectAlertDirection = (dir) => {
    setAlertDirection(dir);
    if (dir === '% Move') {
      setAlertTargetVal('5');
    } else if (alertModalItem?.price) {
      setAlertTargetVal(String(alertModalItem.price));
    }
  };

  const confirmCreateAlert = () => {
    if (!alertModalItem || !alertTargetVal.trim()) {
      Alert.alert('Enter Value', 'Please enter a target value or percentage threshold.');
      return;
    }
    const cleanVal = alertTargetVal.trim();
    const ruleText =
      alertDirection === '% Move'
        ? `${cleanVal}% move from reference (${alertModalItem.currency}${alertModalItem.price})`
        : `${alertDirection} ${cleanVal} ${alertModalItem.currency}`;

    const rule = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      commodity: alertModalItem.commodity,
      market: alertModalItem.market,
      condition: ruleText,
    };
    setSavedAlerts((prev) => [rule, ...prev]);
    setAlertModalItem(null);
    Alert.alert('Alert Rule Saved', `${rule.commodity} (${rule.market})\nRule: ${rule.condition}`);
  };

  const removeAlertRule = (id) => {
    setSavedAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const shareReportPayload = async (item, mode, langCode) => {
    const body = buildShareDraft(item, mode, langCode);
    try {
      await Share.share({ message: body });
    } catch {
      Alert.alert('Share Report', body);
    }
  };

  const series = selectedItem?.history?.[historyRange] || [2200, 2240, 2280, 2300];
  const maxVal = Math.max(...series);
  const minVal = Math.min(...series);
  const spread = Math.max(1, maxVal - minVal);

  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (watchlistOnly ? 1 : 0);

  const hasLiveFeed = useMemo(() => {
    if (liveItems.length > 0) return true;
    if (Array.isArray(externalItems) && externalItems.length > 0) {
      return externalItems.some((it) => it?.dataTag === 'Live');
    }
    return false;
  }, [liveItems, externalItems]);

  const activeLangCopy = LANG_COPY[shareLang] || LANG_COPY.HI;
  const activeOutlook =
    shareModalItem?.isPositive === false
      ? activeLangCopy.outlookSoft
      : activeLangCopy.outlookUp;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 90 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.border }]}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {subView === 'detail' && (
                <TouchableOpacity onPress={() => setSubView('list')} style={styles.backBtn}>
                  <Text style={{ color: C.teal, fontSize: 22, fontWeight: '900' }}>‹</Text>
                </TouchableOpacity>
              )}
              <View>
                <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 }}>
                  TRADE SETUU
                </Text>
                <Text style={{ color: C.text, fontSize: 16, fontWeight: '900' }}>Market Pulse</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {savedAlerts.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    const first = savedAlerts[0];
                    Alert.alert(
                      `Saved Alerts (${savedAlerts.length})`,
                      savedAlerts.map((a) => `• ${a.commodity}: ${a.condition}`).join('\n'),
                      [
                        { text: 'OK', style: 'cancel' },
                        first
                          ? {
                              text: `Remove "${first.commodity.split(' ')[0]}"`,
                              style: 'destructive',
                              onPress: () => removeAlertRule(first.id),
                            }
                          : undefined,
                      ].filter(Boolean)
                    );
                  }}
                  style={[styles.badgeChip, { backgroundColor: C.cardAlt, borderColor: C.amber }]}
                >
                  <Text style={{ color: C.amber, fontSize: 10, fontWeight: '900' }}>
                    Alerts ({savedAlerts.length})
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setTickerCollapsed((c) => !c)}
                style={[styles.badgeChip, { backgroundColor: C.cardAlt, borderColor: C.border }]}
              >
                <Text style={{ color: C.sub, fontSize: 10, fontWeight: '800' }}>
                  {tickerCollapsed ? 'Show Ticker' : 'Hide Ticker'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* MAIN LIST */}
        {subView === 'list' && (
          <View style={{ padding: 14 }}>
            {!tickerCollapsed && (
              <View style={[styles.tickerWrap, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                <View style={[styles.rowBetween, { marginBottom: 5 }]}>
                  <Text
                    style={{
                      color: hasLiveFeed ? C.ok : C.amber,
                      fontSize: 9,
                      fontWeight: '900',
                    }}
                  >
                    MARKET WATCH • {hasLiveFeed ? 'LIVE AGMARKNET FEED' : 'SAMPLE / INDICATIVE SNAPSHOT'}
                  </Text>
                  {!(Array.isArray(externalItems) && externalItems.length > 0) && (
                    <TouchableOpacity onPress={() => setFetchNonce((n) => n + 1)}>
                      <Text style={{ color: C.teal, fontSize: 9.5, fontWeight: '900' }}>Retry Sync</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {items.slice(0, 5).map((t) => (
                      <TouchableOpacity
                        key={`tk-${t.id}`}
                        onPress={() => openCommodityDetail(t)}
                        style={[styles.tickerPill, { backgroundColor: C.card, borderColor: C.border }]}
                      >
                        <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }} numberOfLines={1}>
                          {t.commodity.split(' ')[0]}
                        </Text>
                        <Text style={{ color: C.teal, fontSize: 11, fontWeight: '900', marginLeft: 5 }}>
                          {t.currency}{Number(t.price).toLocaleString('en-IN')}
                        </Text>
                        {t.hasChange !== false && (
                          <Text
                            style={{
                              color: t.isPositive ? C.ok : C.warn,
                              fontSize: 10,
                              fontWeight: '800',
                              marginLeft: 4,
                            }}
                          >
                            {t.changePct}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {feedError ? (
              <View style={[styles.noticeBanner, { backgroundColor: C.cardAlt, borderColor: C.amber }]}>
                <Text style={{ color: C.amber, fontSize: 10.5, fontWeight: '700', flex: 1 }}>
                  {feedError}
                </Text>
                <TouchableOpacity onPress={() => setFetchNonce((n) => n + 1)}>
                  <Text style={{ color: C.teal, fontSize: 10.5, fontWeight: '900', marginLeft: 8 }}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Search Bar */}
            <View style={[styles.searchRow, { backgroundColor: C.card, borderColor: C.border }]}>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search commodity, mandi, state or category..."
                placeholderTextColor={C.sub}
                returnKeyType="search"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{ flex: 1, color: C.text, fontSize: 12, fontWeight: '700', paddingVertical: 4 }}
              />
              {activeFilterCount > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setWatchlistOnly(false);
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>
                    Clear ({activeFilterCount})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Local vs Global Tab + Watchlist Filter */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <View style={[styles.segRow, { backgroundColor: C.card, borderColor: C.border, flex: 1, marginBottom: 0 }]}>
                <TouchableOpacity
                  onPress={() => setMarketTab('local')}
                  style={[styles.segBtn, marketTab === 'local' && { backgroundColor: C.teal }]}
                >
                  <Text
                    style={{
                      color: marketTab === 'local' ? '#071521' : C.text,
                      fontSize: 12,
                      fontWeight: '900',
                    }}
                  >
                    Local Markets
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMarketTab('global')}
                  style={[styles.segBtn, marketTab === 'global' && { backgroundColor: C.teal }]}
                >
                  <Text
                    style={{
                      color: marketTab === 'global' ? '#071521' : C.text,
                      fontSize: 12,
                      fontWeight: '900',
                    }}
                  >
                    Global Markets
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setWatchlistOnly((w) => !w)}
                style={[
                  styles.filterChip,
                  {
                    justifyContent: 'center',
                    backgroundColor: watchlistOnly ? C.amber : C.card,
                    borderColor: watchlistOnly ? C.amber : C.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: watchlistOnly ? '#071521' : C.text,
                    fontSize: 11,
                    fontWeight: '900',
                  }}
                >
                  ★ Watch ({watchlistIds.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[
                        styles.filterChip,
                        { backgroundColor: active ? C.teal : C.card, borderColor: active ? C.teal : C.border },
                      ]}
                    >
                      <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {loadingLive && <ActivityIndicator color={C.teal} style={{ marginVertical: 10 }} />}

            {/* Rate Cards */}
            {filteredItems.map((item) => {
              const watched = watchlistIds.includes(item.id);
              return (
                <View
                  key={item.id}
                  style={[styles.rateCard, { backgroundColor: C.card, borderColor: C.border }]}
                >
                  <TouchableOpacity onPress={() => openCommodityDetail(item)} activeOpacity={0.85}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text
                          style={{
                            color: item.dataTag === 'Live' ? C.ok : C.amber,
                            fontSize: 10,
                            fontWeight: '900',
                          }}
                        >
                          {item.category.toUpperCase()} • {item.dataTag}
                        </Text>
                        <Text style={{ color: C.text, fontSize: 14, fontWeight: '900', marginTop: 1 }}>
                          {item.commodity}
                        </Text>
                        <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>
                          {item.market}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: C.teal, fontSize: 16, fontWeight: '900' }}>
                          {item.currency}{Number(item.price).toLocaleString('en-IN')}
                          <Text style={{ color: C.sub, fontSize: 11, fontWeight: '700' }}> {item.unit}</Text>
                        </Text>
                        <Text
                          style={{
                            color:
                              item.hasChange === false
                                ? C.sub
                                : item.isPositive
                                  ? C.ok
                                  : C.warn,
                            fontSize: 10.5,
                            fontWeight: '800',
                            marginTop: 1,
                          }}
                        >
                          {item.changePct}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ color: C.sub, fontSize: 10, marginTop: 6 }}>
                      {item.dataUpdatedAt} • {item.source}
                    </Text>
                  </TouchableOpacity>

                  <View style={[styles.cardActionBar, { borderTopColor: C.border }]}>
                    <TouchableOpacity onPress={() => openCommodityDetail(item)}>
                      <Text style={{ color: C.teal, fontSize: 11, fontWeight: '800' }}>Details & Trend ›</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 14 }}>
                      <TouchableOpacity onPress={() => toggleWatchlist(item.id)}>
                        <Text style={{ color: watched ? C.amber : C.sub, fontSize: 11, fontWeight: '800' }}>
                          {watched ? '★ Saved' : '☆ Watch'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openShareForItem(item)}>
                        <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>Share ↗</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openAlertForItem(item)}>
                        <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800' }}>Alert 🔔</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {!loadingLive && filteredItems.length === 0 && (
              <View style={[styles.rateCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>No matching market entries</Text>
                <Text style={{ color: C.sub, fontSize: 11, marginTop: 3 }}>
                  Try another search term/category or switch Local/Global tab.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* DETAIL VIEW */}
        {subView === 'detail' && selectedItem && (
          <View style={{ padding: 14 }}>
            <View style={[styles.detailCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text
                style={{
                  color: selectedItem.dataTag === 'Live' ? C.ok : C.amber,
                  fontSize: 10,
                  fontWeight: '900',
                }}
              >
                {selectedItem.category.toUpperCase()} • {selectedItem.dataTag}
              </Text>
              <View style={[styles.rowBetween, { marginTop: 2 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 18, fontWeight: '900' }}>{selectedItem.commodity}</Text>
                  <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>
                    {selectedItem.market}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: C.teal, fontSize: 18, fontWeight: '900' }}>
                    {selectedItem.currency}{Number(selectedItem.price).toLocaleString('en-IN')} {selectedItem.unit}
                  </Text>
                  <Text
                    style={{
                      color:
                        selectedItem.hasChange === false
                          ? C.sub
                          : selectedItem.isPositive
                            ? C.ok
                            : C.warn,
                      fontSize: 11.5,
                      fontWeight: '800',
                    }}
                  >
                    {selectedItem.changePct}
                  </Text>
                </View>
              </View>

              <View style={[styles.metaBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                <Text style={{ color: C.sub, fontSize: 10 }}>
                  Period / Arrival: <Text style={{ color: C.text, fontWeight: '800' }}>{selectedItem.dataUpdatedAt}</Text>
                </Text>
                <Text style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                  Analysis generated at:{' '}
                  <Text style={{ color: C.teal, fontWeight: '800' }}>{selectedItem.analysisGeneratedAt}</Text>
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                {[
                  { lbl: 'Min', val: `${selectedItem.currency}${selectedItem.minPrice}` },
                  { lbl: 'Modal', val: `${selectedItem.currency}${selectedItem.modalPrice}` },
                  { lbl: 'Max', val: `${selectedItem.currency}${selectedItem.maxPrice}` },
                ].map((m) => (
                  <View key={m.lbl} style={[styles.statBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                    <Text style={{ color: C.sub, fontSize: 10 }}>{m.lbl}</Text>
                    <Text style={{ color: C.text, fontSize: 13, fontWeight: '900', marginTop: 2 }}>{m.val}</Text>
                  </View>
                ))}
              </View>

              <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900', marginTop: 14, marginBottom: 6 }}>
                Price History ({historyRange})
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                {['7D', '30D', '90D', '1Y'].map((rng) => {
                  const active = historyRange === rng;
                  return (
                    <TouchableOpacity
                      key={rng}
                      onPress={() => setHistoryRange(rng)}
                      style={[
                        styles.filterChip,
                        { backgroundColor: active ? C.teal : C.cardAlt, borderColor: active ? C.teal : C.border },
                      ]}
                    >
                      <Text style={{ color: active ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>
                        {rng}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.chartArea, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                {series.map((v, idx) => {
                  const pct = Math.max(18, Math.round(((v - minVal) / spread) * 82) + 18);
                  return (
                    <View
                      key={`${historyRange}-${idx}`}
                      style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
                    >
                      <Text style={{ color: C.sub, fontSize: 9, marginBottom: 3 }}>{v}</Text>
                      <View style={{ width: '64%', height: `${pct}%`, backgroundColor: C.teal, borderRadius: 4 }} />
                    </View>
                  );
                })}
              </View>

              <Text style={{ color: C.amber, fontSize: 12, fontWeight: '900', marginTop: 14 }}>
                Market Analysis & Direction
              </Text>
              <Text style={{ color: C.text, fontSize: 12, marginTop: 4, lineHeight: 18 }}>
                • Movement ({historyRange}):{' '}
                {selectedItem.hasChange === false
                  ? 'Previous trading-day comparison not yet available'
                  : selectedItem.isPositive
                    ? 'Firm / upward movement'
                    : 'Soft / range-bound movement'}
                .{'\n'}• Source: {selectedItem.source} ({selectedItem.dataTag}).{'\n'}
                • Note: Full multi-period historical database & external benchmark feeds will attach via backend.
              </Text>

              <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900', marginTop: 12 }}>
                Nearby Market Comparison
              </Text>
              {selectedItem.nearbyMarkets.map((nm) => (
                <View key={nm.name} style={[styles.compareRow, { borderBottomColor: C.border }]}>
                  <Text style={{ color: C.text, fontSize: 12, fontWeight: '700' }}>{nm.name}</Text>
                  <Text style={{ color: C.amber, fontSize: 12, fontWeight: '900' }}>{nm.price}</Text>
                </View>
              ))}

              <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900', marginTop: 12 }}>
                Global / Export Reference
              </Text>
              <Text style={{ color: C.sub, fontSize: 12, marginTop: 3 }}>{selectedItem.fobReference}</Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => openShareForItem(selectedItem)}
                  style={[styles.secondaryAction, { backgroundColor: C.cardAlt, borderColor: C.teal }]}
                >
                  <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900' }}>Share Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openAlertForItem(selectedItem)}
                  style={[styles.primaryAction, { backgroundColor: C.amber }]}
                >
                  <Text style={{ color: '#071521', fontSize: 12, fontWeight: '900' }}>Set Price Alert</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* SHARE MODAL */}
        <Modal visible={!!shareModalItem} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>Share Market Report</Text>
                <TouchableOpacity onPress={() => setShareModalItem(null)}>
                  <Text style={{ color: C.teal, fontSize: 13, fontWeight: '900' }}>Close</Text>
                </TouchableOpacity>
              </View>

              {shareModalItem && (
                <>
                  {/* Mode Selector: Quick Card vs Full Report */}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 8 }}>
                    <TouchableOpacity
                      onPress={() => setShareFormat('image_card')}
                      style={[
                        styles.filterChip,
                        {
                          flex: 1,
                          alignItems: 'center',
                          backgroundColor: shareFormat === 'image_card' ? C.teal : C.cardAlt,
                          borderColor: shareFormat === 'image_card' ? C.teal : C.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: shareFormat === 'image_card' ? '#071521' : C.text,
                          fontSize: 11,
                          fontWeight: '900',
                        }}
                      >
                        Quick Card
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShareFormat('full_report')}
                      style={[
                        styles.filterChip,
                        {
                          flex: 1,
                          alignItems: 'center',
                          backgroundColor: shareFormat === 'full_report' ? C.teal : C.cardAlt,
                          borderColor: shareFormat === 'full_report' ? C.teal : C.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: shareFormat === 'full_report' ? '#071521' : C.text,
                          fontSize: 11,
                          fontWeight: '900',
                        }}
                      >
                        Full Report
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Language Selector */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {SHARE_LANGUAGES.map((lng) => {
                        const active = shareLang === lng.code;
                        return (
                          <TouchableOpacity
                            key={lng.code}
                            onPress={() => setShareLang(lng.code)}
                            style={[
                              styles.filterChip,
                              {
                                backgroundColor: active ? C.amber : C.cardAlt,
                                borderColor: active ? C.amber : C.border,
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color: active ? '#071521' : C.text,
                                fontSize: 10.5,
                                fontWeight: '800',
                              }}
                            >
                              {lng.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>

                  <View style={[styles.previewCard, { backgroundColor: C.cardAlt, borderColor: C.teal }]}>
                    <Text style={{ color: C.teal, fontSize: 10, fontWeight: '900' }}>
                      {activeLangCopy.header} ({shareModalItem.dataTag})
                    </Text>
                    <Text style={{ color: C.text, fontSize: 16, fontWeight: '900', marginTop: 3 }}>
                      {shareModalItem.commodity}
                    </Text>
                    <Text style={{ color: C.amber, fontSize: 17, fontWeight: '900', marginTop: 4 }}>
                      {shareModalItem.currency}{Number(shareModalItem.price).toLocaleString('en-IN')}{' '}
                      {shareModalItem.unit}{' '}
                      {shareModalItem.hasChange !== false ? `(${shareModalItem.changePct})` : ''}
                    </Text>
                    <Text style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>
                      {activeLangCopy.marketLbl}: {shareModalItem.market}
                    </Text>

                    <Text style={{ color: C.teal, fontSize: 10.5, fontWeight: '800', marginTop: 8 }}>
                      {activeLangCopy.analystTitle}
                    </Text>
                    <Text style={{ color: C.text, fontSize: 11, marginTop: 2, lineHeight: 16 }}>
                      {activeOutlook}
                    </Text>

                    {shareFormat === 'full_report' && (
                      <Text style={{ color: C.sub, fontSize: 10.5, marginTop: 6, lineHeight: 15 }}>
                        Min/Modal/Max: {shareModalItem.currency}{shareModalItem.minPrice} /{' '}
                        {shareModalItem.currency}{shareModalItem.modalPrice} / {shareModalItem.currency}
                        {shareModalItem.maxPrice} • {activeLangCopy.sourceLbl}: {shareModalItem.source}
                      </Text>
                    )}

                    <Text style={{ color: C.sub, fontSize: 10, marginTop: 6 }}>
                      {shareModalItem.dataUpdatedAt} • {activeLangCopy.generatedLbl}:{' '}
                      {shareModalItem.analysisGeneratedAt}
                    </Text>
                    <Text style={{ color: C.amber, fontSize: 10, fontWeight: '800', marginTop: 6 }}>
                      {activeLangCopy.cta}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => shareReportPayload(shareModalItem, shareFormat, shareLang)}
                    style={[styles.primaryAction, { backgroundColor: C.teal, marginTop: 12 }]}
                  >
                    <Text style={{ color: '#071521', fontSize: 13, fontWeight: '900' }}>
                      Share via WhatsApp / LinkedIn / More →
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* ALERT MODAL */}
        <Modal visible={!!alertModalItem} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>Create Price Alert</Text>
                <TouchableOpacity onPress={() => setAlertModalItem(null)}>
                  <Text style={{ color: C.teal, fontSize: 13, fontWeight: '900' }}>Close</Text>
                </TouchableOpacity>
              </View>

              {alertModalItem && (
                <>
                  <Text style={{ color: C.teal, fontSize: 12, fontWeight: '800', marginTop: 8 }}>
                    {alertModalItem.commodity} • {alertModalItem.market}
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, marginBottom: 10 }}>
                    {['Falls Below', 'Rises Above', '% Move'].map((dir) => (
                      <TouchableOpacity
                        key={dir}
                        onPress={() => handleSelectAlertDirection(dir)}
                        style={[
                          styles.filterChip,
                          {
                            flex: 1,
                            alignItems: 'center',
                            backgroundColor: alertDirection === dir ? C.amber : C.cardAlt,
                            borderColor: alertDirection === dir ? C.amber : C.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: alertDirection === dir ? '#071521' : C.text,
                            fontSize: 11,
                            fontWeight: '900',
                          }}
                        >
                          {dir}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={{ color: C.sub, fontSize: 11, marginBottom: 4 }}>
                    {alertDirection === '% Move'
                      ? 'Percentage Move Threshold (%)'
                      : `Target Price (${alertModalItem.currency})`}
                  </Text>
                  <TextInput
                    value={alertTargetVal}
                    onChangeText={setAlertTargetVal}
                    keyboardType="numeric"
                    placeholder={alertDirection === '% Move' ? 'e.g. 5' : 'Enter target price'}
                    placeholderTextColor={C.sub}
                    style={[
                      styles.searchRow,
                      { backgroundColor: C.cardAlt, borderColor: C.border, color: C.text, marginBottom: 10 },
                    ]}
                  />

                  <TouchableOpacity
                    onPress={confirmCreateAlert}
                    style={[styles.primaryAction, { backgroundColor: C.teal }]}
                  >
                    <Text style={{ color: '#071521', fontSize: 13, fontWeight: '900' }}>Save Alert Rule</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { paddingRight: 6, paddingVertical: 2 },
  badgeChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  tickerWrap: { borderWidth: 1, borderRadius: 12, padding: 8, marginBottom: 10 },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
  },
  tickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  segRow: { flexDirection: 'row', borderWidth: 1, borderRadius: 11, padding: 3, marginBottom: 10 },
  segBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, borderWidth: 1 },
  rateCard: { borderWidth: 1, borderRadius: 13, padding: 12, marginBottom: 10 },
  cardActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 9,
    paddingTop: 8,
  },
  detailCard: { borderWidth: 1, borderRadius: 14, padding: 14 },
  metaBox: { borderWidth: 1, borderRadius: 10, padding: 9, marginTop: 10 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 9, alignItems: 'center' },
  chartArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryAction: { flex: 1, borderRadius: 11, paddingVertical: 12, alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, padding: 16 },
  previewCard: { borderWidth: 1.2, borderRadius: 12, padding: 12 },
});
