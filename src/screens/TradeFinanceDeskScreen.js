import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  StatusBar,
} from 'react-native';
import DocAttachmentBox from '../src/components/DocAttachmentBox';
import { formatAttachmentsForBrief } from '../src/utils/attachmentHelper';

const FINANCE_MODES = [
  {
    key: 'LC_BILL',
    label: 'LC / BILL',
    fullName: 'LC Advising, Negotiation & Bill Finance',
  },
  {
    key: 'BG_SBLC',
    label: 'BG / SBLC',
    fullName: 'Bank Guarantee & Standby LC Brief',
  },
  {
    key: 'SUPPLY_CREDIT',
    label: 'BUYER / SUPPLY',
    fullName: 'Buyer Credit, Supplier Credit & Trade Facility',
  },
  {
    key: 'ADVISORY',
    label: 'PARTNER DESK',
    fullName: 'Trade Finance Advisory & Partner Inquiry',
  },
];

const QUICK_FINANCE_DOCS = [
  'Proforma_Invoice.pdf',
  'Sales_Contract.pdf',
  'Draft_LC.pdf',
  'KYC_Company_Profile.pdf',
];

const FINANCE_FIELDS = {
  LC_BILL: [
    {
      key: 'entityIe',
      label: 'Applicant / Exporter & IEC Ref',
      placeholder: 'e.g. UA EXIM Overseas | IEC XXXXXXXXXX',
    },
    {
      key: 'counterpartyCorridor',
      label: 'Buyer / Issuing Bank & Trade Corridor',
      placeholder: 'e.g. Buyer Co. (UAE) | India -> Jebel Ali',
    },
    {
      key: 'amountTenor',
      label: 'Deal Value, Currency & Tenor / Usance',
      placeholder: 'e.g. USD 150,000 | 60 Days Sight / Usance LC',
    },
    {
      key: 'goodsIncoterm',
      label: 'Commodity, HS Code & Incoterm',
      placeholder: 'e.g. 1121 Sella Basmati | HS 10063020 | CIF',
    },
    {
      key: 'notes',
      label: 'Bank / LC Requirement & Timeline',
      placeholder: 'e.g. LC confirmation / bill discount needed by 10 Dec',
    },
  ],
  BG_SBLC: [
    {
      key: 'entityIe',
      label: 'Applicant Name & Entity Ref',
      placeholder: 'e.g. Company Name | IEC / GST / Reg Ref',
    },
    {
      key: 'counterpartyCorridor',
      label: 'Beneficiary & Contract / Tender Ref',
      placeholder: 'e.g. Buyer / Authority | Contract #XXXX',
    },
    {
      key: 'amountTenor',
      label: 'Guarantee / SBLC Value & Validity',
      placeholder: 'e.g. INR 25,00,000 or USD 50,000 | Valid till Mar',
    },
    {
      key: 'goodsIncoterm',
      label: 'Purpose (Bid / Performance / Advance / SBLC)',
      placeholder: 'e.g. Performance BG for supply contract',
    },
    {
      key: 'notes',
      label: 'Collateral / Bank Preference & Urgency',
      placeholder: 'e.g. Need draft wording review & issuance timeline',
    },
  ],
  SUPPLY_CREDIT: [
    {
      key: 'entityIe',
      label: 'Importer / Exporter & IEC Ref',
      placeholder: 'e.g. Entity Name | IEC XXXXXXXXXX',
    },
    {
      key: 'counterpartyCorridor',
      label: 'Supplier / Buyer & Origin / Destination',
      placeholder: 'e.g. Supplier (Vietnam) -> Importer (India)',
    },
    {
      key: 'amountTenor',
      label: 'Facility Amount, Currency & Credit Period',
      placeholder: 'e.g. USD 200,000 | 90 / 180 Days Credit',
    },
    {
      key: 'goodsIncoterm',
      label: 'Commodity, HS Code & Shipment Plan',
      placeholder: 'e.g. Yellow Maize / Rice | Shipment next week',
    },
    {
      key: 'notes',
      label: 'Lender Type Preference & Key Notes',
      placeholder: 'e.g. Bank / NBFC / partner structure inquiry',
    },
  ],
  ADVISORY: [
    {
      key: 'entityIe',
      label: 'Company Name & Contact / IEC Ref',
      placeholder: 'e.g. Company Name | Name / IEC Ref',
    },
    {
      key: 'counterpartyCorridor',
      label: 'Trade Route / Market Context',
      placeholder: 'e.g. India <-> Africa / GCC / SE Asia',
    },
    {
      key: 'amountTenor',
      label: 'Estimated Ticket Size & Frequency',
      placeholder: 'e.g. USD 75,000–300,000 | Monthly / Per shipment',
    },
    {
      key: 'goodsIncoterm',
      label: 'Product / Sector & Structure Needed',
      placeholder: 'e.g. Agri commodities / non-interest or standard desk',
    },
    {
      key: 'notes',
      label: 'Specific Question or Partner Brief',
      placeholder: 'e.g. Structuring options, docs checklist, next steps',
    },
  ],
};

export default function TradeFinanceDeskScreen({ onBack }) {
  const [mode, setMode] = useState('LC_BILL');
  const [valuesByMode, setValuesByMode] = useState({
    LC_BILL: {},
    BG_SBLC: {},
    SUPPLY_CREDIT: {},
    ADVISORY: {},
  });
  const [attachmentsByMode, setAttachmentsByMode] = useState({
    LC_BILL: [],
    BG_SBLC: [],
    SUPPLY_CREDIT: [],
    ADVISORY: [],
  });
  const [briefText, setBriefText] = useState('');

  const currentMeta =
    FINANCE_MODES.find((m) => m.key === mode) || FINANCE_MODES[0];
  const fields = FINANCE_FIELDS[mode] || [];
  const currentValues = valuesByMode[mode] || {};
  const attachments = attachmentsByMode[mode] || [];

  const handleFieldChange = (key, text) => {
    setValuesByMode((prev) => ({
      ...prev,
      [mode]: {
        ...(prev[mode] || {}),
        [key]: text,
      },
    }));
  };

  const handleAttachmentsChange = (nextItems) => {
    setAttachmentsByMode((prev) => ({
      ...prev,
      [mode]: Array.isArray(nextItems) ? nextItems : [],
    }));
  };

  const buildBrief = () => {
    const formattedDocs =
      typeof formatAttachmentsForBrief === 'function'
        ? formatAttachmentsForBrief(attachments)
        : attachments.length > 0
          ? attachments
              .map((item, i) =>
                typeof item === 'string'
                  ? `  ${i + 1}. ${item}`
                  : `  ${i + 1}. ${item?.name || item?.uri || 'Attachment'}`
              )
              .join('\n')
          : '  None attached yet';

    const lines = [
      `=== TRADE FINANCE DESK (${currentMeta.fullName.toUpperCase()}) ===`,
      ...fields.map(
        (f) => `${f.label}: ${(currentValues[f.key] || '').trim() || '—'}`
      ),
      'Attached Documents:',
      formattedDocs,
      'Note: Beta inquiry brief (no live payment/loan lock in beta).',
      'Prepared via Trade Finance Desk — Trade SETUU',
    ];
    return lines.join('\n');
  };

  const handleBuildBrief = () => {
    setBriefText(buildBrief());
  };

  const handleShareBrief = () => {
    const text = briefText || buildBrief();
    setBriefText(text);
    Share.share({ message: text }).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050811" />

      <View style={styles.topBar}>
        {typeof onBack === 'function' ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={styles.headerTitle}>Trade Finance Desk</Text>
        <Text style={styles.headerBadge}>{currentMeta.label}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subCaption}>
          Prepare LC, BG, buyer/supply credit or partner brief & attach docs
        </Text>

        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>
            Pre & Post Credit vs Trade Finance Desk
          </Text>
          <Text style={styles.infoBannerText}>
            Use Pre & Post Credit for standard packing/export bill credit. Use
            this desk for LC, BG/SBLC, buyer/supply facilities & partner
            briefs. Beta mode does not process payments or live sanctions.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {FINANCE_MODES.map((item) => {
            const active = item.key === mode;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => {
                  setMode(item.key);
                  setBriefText('');
                }}
                style={[styles.modeTab, active && styles.modeTabActive]}
              >
                <Text
                  style={[
                    styles.modeTabCode,
                    active && styles.modeTabCodeActive,
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.modeTabSub,
                    active && styles.modeTabSubActive,
                  ]}
                  numberOfLines={2}
                >
                  {item.fullName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>{currentMeta.fullName}</Text>

          {fields.map((field) => (
            <View key={field.key} style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                value={currentValues[field.key] || ''}
                onChangeText={(txt) => handleFieldChange(field.key, txt)}
                placeholder={field.placeholder}
                placeholderTextColor="#64748B"
                style={styles.input}
              />
            </View>
          ))}

          <View style={styles.attachSection}>
            <DocAttachmentBox
              attachments={attachments}
              onChange={handleAttachmentsChange}
              quickTags={QUICK_FINANCE_DOCS}
              title="Attach Trade Finance Docs (PI / Contract / Draft LC)"
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleBuildBrief}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Build Finance Brief</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShareBrief}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Share Brief</Text>
            </TouchableOpacity>
          </View>
        </View>

        {briefText ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>
              {currentMeta.label} Brief Preview
            </Text>
            <Text style={styles.previewBody}>{briefText}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050811',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#050811',
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    color: '#2DD4BF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  backPlaceholder: {
    width: 48,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  headerBadge: {
    color: '#F3D27A',
    fontSize: 11,
    fontWeight: '900',
    backgroundColor: 'rgba(243, 210, 122, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 36,
  },
  subCaption: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginBottom: 10,
  },
  infoBanner: {
    backgroundColor: 'rgba(243, 210, 122, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(243, 210, 122, 0.28)',
    borderRadius: 12,
    padding: 11,
    marginBottom: 12,
  },
  infoBannerTitle: {
    color: '#F3D27A',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  infoBannerText: {
    color: '#CBD5E1',
    fontSize: 11.5,
    lineHeight: 16.5,
  },
  tabsRow: {
    paddingBottom: 8,
    marginBottom: 4,
  },
  modeTab: {
    width: 155,
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
  },
  modeTabActive: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    borderColor: '#2DD4BF',
  },
  modeTabCode: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '900',
  },
  modeTabCodeActive: {
    color: '#2DD4BF',
  },
  modeTabSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
    lineHeight: 13.5,
  },
  modeTabSubActive: {
    color: '#CBD5E1',
  },
  card: {
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
  },
  cardHeading: {
    color: '#F3D27A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  fieldBlock: {
    marginBottom: 11,
  },
  fieldLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    color: '#F8FAFC',
    fontSize: 13,
  },
  attachSection: {
    marginTop: 4,
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#2DD4BF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  primaryBtnText: {
    color: '#050811',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#F3D27A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#F3D27A',
    fontSize: 12.5,
    fontWeight: '800',
  },
  previewCard: {
    marginTop: 14,
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.35)',
    borderRadius: 14,
    padding: 14,
  },
  previewTitle: {
    color: '#2DD4BF',
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  previewBody: {
    color: '#E2E8F0',
    fontSize: 12.5,
    lineHeight: 19,
  },
});
        
