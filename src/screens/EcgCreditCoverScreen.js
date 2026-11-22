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
import DocAttachmentBox from '../../src/components/DocAttachmentBox';
import { formatAttachmentsForBrief } from '../../src/utils/attachmentHelper';

const ECG_MODES = [
  {
    key: 'BUYER_LIMIT',
    label: 'BUYER & LIMIT',
    fullName: 'Buyer Check & Credit Limit Brief',
  },
  {
    key: 'POLICY_CLAIM',
    label: 'POLICY & CLAIM',
    fullName: 'ECGC Policy & Payment Risk Brief',
  },
];

const QUICK_ECGC_DOCS = [
  'Buyer_Profile_or_Ref.pdf',
  'Proforma_Invoice.pdf',
  'Export_Contract_or_PO.pdf',
  'Commercial_Invoice.pdf',
  'Bill_of_Lading.pdf',
];

const ECG_FIELDS = {
  BUYER_LIMIT: [
    {
      key: 'exporterIe',
      label: 'Exporter / Firm Name & IEC Ref',
      placeholder: 'e.g. UA EXIM Overseas | IEC XXXXXXXXXX',
    },
    {
      key: 'buyerInfo',
      label: 'Foreign Buyer Name, Country & Contact/Ref',
      placeholder: 'e.g. Buyer Name | Country | Email/Ref',
    },
    {
      key: 'goodsTerms',
      label: 'Commodity, HS Code & Payment Terms',
      placeholder: 'e.g. Parboiled Rice 5% | HS 10063020 | DP / DA / LC',
    },
    {
      key: 'limitAmount',
      label: 'Proposed Shipment / Credit Limit Amount',
      placeholder: 'e.g. USD 120,000 | Revolving / Single Shipment',
    },
    {
      key: 'policyStatus',
      label: 'Existing ECGC Policy No. & Bank Link',
      placeholder: 'e.g. Policy No. / New Cover Needed | Bank: ...',
    },
    {
      key: 'remarks',
      label: 'Deal Context & Remarks',
      placeholder: 'e.g. Credit cover brief before shipment dispatch',
    },
  ],
  POLICY_CLAIM: [
    {
      key: 'exporterIe',
      label: 'Exporter / Firm Name & IEC Ref',
      placeholder: 'e.g. UA EXIM Overseas | IEC XXXXXXXXXX',
    },
    {
      key: 'buyerInfo',
      label: 'Buyer Name, Country & Policy / Decl. Ref',
      placeholder: 'e.g. Buyer Name | Country | Policy / Shipment Ref',
    },
    {
      key: 'goodsTerms',
      label: 'Invoice / Shipment Ref & Due Date',
      placeholder: 'e.g. Inv #208 | BL #8841 | Due Date: ...',
    },
    {
      key: 'limitAmount',
      label: 'Unpaid / Overdue Amount & Currency',
      placeholder: 'e.g. USD 45,000 overdue past due date',
    },
    {
      key: 'policyStatus',
      label: 'Delay / Default Details & Action Taken',
      placeholder: 'e.g. Payment delayed / follow-up & notices sent',
    },
    {
      key: 'remarks',
      label: 'Supporting Docs Status & Remarks',
      placeholder: 'e.g. CI, PL, BL, Shipping Bill & correspondence ready',
    },
  ],
};

const ECG_NOTES = [
  'Direct ECGC portal/API integration is Coming Soon — currently this prepares and shares a structured brief for free.',
  'Follow policy timelines (declarations, premium/reporting, and overdue intimations) as per ECGC policy rules.',
  'Cover percentage, credit limits, and claim terms depend on ECGC policy conditions and compliance.',
];

export default function EcgCreditCoverScreen({ onBack }) {
  const [mode, setMode] = useState('BUYER_LIMIT');
  const [valuesByMode, setValuesByMode] = useState({
    BUYER_LIMIT: {},
    POLICY_CLAIM: {},
  });
  const [docsByMode, setDocsByMode] = useState({
    BUYER_LIMIT: [],
    POLICY_CLAIM: [],
  });
  const [briefText, setBriefText] = useState('');

  const currentMeta = ECG_MODES.find((m) => m.key === mode) || ECG_MODES[0];
  const fields = ECG_FIELDS[mode] || [];
  const currentValues = valuesByMode[mode] || {};
  const attachedDocs = docsByMode[mode] || [];

  const handleFieldChange = (key, text) => {
    setValuesByMode((prev) => ({
      ...prev,
      [mode]: {
        ...(prev[mode] || {}),
        [key]: text,
      },
    }));
  };

  const handleDocsChange = (nextDocs) => {
    setDocsByMode((prev) => ({
      ...prev,
      [mode]: nextDocs,
    }));
  };

  const buildEcgBrief = () => {
    const lines = [
      `=== ECGC CREDIT COVER (${currentMeta.fullName.toUpperCase()}) ===`,
      ...fields.map(
        (f) => `${f.label}: ${(currentValues[f.key] || '').trim() || '—'}`
      ),
      'Attached Documents / Refs:',
      formatAttachmentsForBrief(attachedDocs),
      'Status: Free Brief & Share (Direct ECGC Portal/API Sync — Coming Soon)',
      'Prepared via ECGC Credit Cover — Trade SETUU',
    ];
    return lines.join('\n');
  };

  const handleBuildBrief = () => {
    setBriefText(buildEcgBrief());
  };

  const handleShareBrief = () => {
    const text = briefText || buildEcgBrief();
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
        <Text style={styles.headerTitle}>ECGC Credit Cover</Text>
        <Text style={styles.headerBadge}>
          {mode === 'BUYER_LIMIT' ? 'BUYER' : 'CLAIM'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBanner}>
          <Text style={styles.statusTitle}>
            Free Credit Cover Brief & Share — Direct ECGC Portal/API Sync: Coming Soon
          </Text>
          <Text style={styles.statusSub}>
            Prepare buyer limit or policy/claim brief for free and share via WhatsApp/Email/Team.
          </Text>
        </View>

        <View style={styles.tabsRow}>
          {ECG_MODES.map((item) => {
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
                  style={[styles.modeTabCode, active && styles.modeTabCodeActive]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[styles.modeTabSub, active && styles.modeTabSubActive]}
                >
                  {item.fullName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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

          <DocAttachmentBox
            label="Attach Buyer / Policy / Shipment Docs"
            items={attachedDocs}
            onChangeItems={handleDocsChange}
            quickTags={QUICK_ECGC_DOCS}
            placeholder="e.g. Buyer_Ref.pdf or PI_102.pdf"
            context="service"
          />

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleBuildBrief}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Build ECGC Brief</Text>
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
            <Text style={styles.previewTitle}>ECGC Brief Preview</Text>
            <Text style={styles.previewBody}>{briefText}</Text>
          </View>
        ) : null}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>ECGC Credit Cover Notes</Text>
          {ECG_NOTES.map((point, idx) => (
            <Text key={idx} style={styles.noteItem}>
              • {point}
            </Text>
          ))}
        </View>
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
    fontSize: 12,
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
  statusBanner: {
    backgroundColor: 'rgba(243, 210, 122, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(243, 210, 122, 0.32)',
    borderRadius: 12,
    padding: 11,
    marginBottom: 12,
  },
  statusTitle: {
    color: '#F3D27A',
    fontSize: 12,
    fontWeight: '800',
  },
  statusSub: {
    color: '#CBD5E1',
    fontSize: 11.5,
    marginTop: 3,
    lineHeight: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
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
  noteCard: {
    marginTop: 14,
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
  },
  noteTitle: {
    color: '#F3D27A',
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  noteItem: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 5,
  },
});
      
