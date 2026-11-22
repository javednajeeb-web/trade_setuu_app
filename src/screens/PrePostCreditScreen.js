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
import { formatAttachmentsForBrief } from '../../src/src/utils/attachmentHelper';


const CREDIT_MODES = [
  {
    key: 'PRE_SHIPMENT',
    label: 'PRE-SHIPMENT',
    fullName: 'Pre-Shipment Credit (Packing Credit)',
  },
  {
    key: 'POST_SHIPMENT',
    label: 'POST-SHIPMENT',
    fullName: 'Post-Shipment Credit (Bill / Export Finance)',
  },
];

const QUICK_CREDIT_DOCS = [
  'Export_PO_or_Order.pdf',
  'LC_Copy.pdf',
  'Commercial_Invoice.pdf',
  'Packing_List.pdf',
  'Bill_of_Lading.pdf',
  'Shipping_Bill.pdf',
];

const CREDIT_FIELDS = {
  PRE_SHIPMENT: [
    {
      key: 'exporterIe',
      label: 'Exporter / Firm Name & IEC Ref',
      placeholder: 'e.g. UA EXIM Overseas | IEC XXXXXXXXXX',
    },
    {
      key: 'orderRef',
      label: 'Confirmed Export Order / PO / LC Ref',
      placeholder: 'e.g. PO-2026-44 / LC Sight | Buyer: Dakar Foods',
    },
    {
      key: 'cargoDest',
      label: 'Commodity, HS Code & Destination',
      placeholder: 'e.g. Parboiled Rice 5% | HS 10063020 -> Dakar',
    },
    {
      key: 'amountTenor',
      label: 'Required Credit Amount & Tenor (Days)',
      placeholder: 'e.g. ₹35,00,000 or USD 40,000 | 90 Days',
    },
    {
      key: 'bankEcgc',
      label: 'Bank / Lender Preference & ECGC Status',
      placeholder: 'e.g. Existing Bank / Partner | ECGC Cover: Yes/Pending',
    },
    {
      key: 'docsNote',
      label: 'Readiness & Remarks',
      placeholder: 'e.g. PI & PO ready | Raw material procurement & milling',
    },
  ],
  POST_SHIPMENT: [
    {
      key: 'exporterIe',
      label: 'Exporter / Firm Name & IEC Ref',
      placeholder: 'e.g. UA EXIM Overseas | IEC XXXXXXXXXX',
    },
    {
      key: 'orderRef',
      label: 'Shipping Bill / BL / Commercial Invoice Ref',
      placeholder: 'e.g. SB-9012 | BL-77412 | CI-309',
    },
    {
      key: 'cargoDest',
      label: 'Commodity, HS Code & Port Route',
      placeholder: 'e.g. Yellow Maize | HS 10059000 | Vizag -> Banjul',
    },
    {
      key: 'amountTenor',
      label: 'Invoice Value & Finance Needed / Tenor',
      placeholder: 'e.g. Invoice USD 136,000 | Finance till realization',
    },
    {
      key: 'bankEcgc',
      label: 'Bank / Bill Discounting & ECGC Status',
      placeholder: 'e.g. LC / DP / DA terms | ECGC Policy Active',
    },
    {
      key: 'docsNote',
      label: 'Shipped Docs Status & Remarks',
      placeholder: 'e.g. CI, PL, BL, SB copy ready for submission',
    },
  ],
};

const CRITERIA_BY_MODE = {
  PRE_SHIPMENT: [
    'Active IEC, PAN & GST registration with regular compliance.',
    'Healthy credit/bureau profile & banking track record (exact score/limit depends on lender).',
    'Confirmed export order, PO, or Letter of Credit (LC) backing the shipment.',
    'Clear procurement/processing plan, margin/collateral or ECGC cover details as required by bank.',
  ],
  POST_SHIPMENT: [
    'Valid IEC & export shipment records with realized/trackable export history.',
    'Satisfactory credit/banking standing (exact eligibility depends on bank/NBFC norms).',
    'Complete shipment set: Commercial Invoice, Packing List, Shipping Bill & BL/AWB.',
    'Agreed payment terms (LC / DP / DA / TT) & buyer credit/ECGC cover status.',
  ],
};

export default function PrePostCreditScreen({ onBack }) {
  const [mode, setMode] = useState('PRE_SHIPMENT');
  const [valuesByMode, setValuesByMode] = useState({
    PRE_SHIPMENT: {},
    POST_SHIPMENT: {},
  });
  const [docsByMode, setDocsByMode] = useState({
    PRE_SHIPMENT: [],
    POST_SHIPMENT: [],
  });
  const [briefText, setBriefText] = useState('');

  const currentMeta =
    CREDIT_MODES.find((m) => m.key === mode) || CREDIT_MODES[0];
  const fields = CREDIT_FIELDS[mode] || [];
  const currentValues = valuesByMode[mode] || {};
  const attachedDocs = docsByMode[mode] || [];
  const criteriaList = CRITERIA_BY_MODE[mode] || [];

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

  const buildCreditBrief = () => {
    const lines = [
      `=== ${currentMeta.fullName.toUpperCase()} ===`,
      ...fields.map(
        (f) => `${f.label}: ${(currentValues[f.key] || '').trim() || '—'}`
      ),
      'Attached Documents / Refs:',
      formatAttachmentsForBrief(attachedDocs),
      'Note: Free Pre-Application Brief (Direct Bank/Lender Sanction — Coming Soon)',
      'Prepared via Pre & Post Shipment Credit — Trade SETUU',
    ];
    return lines.join('\n');
  };

  const handleBuildBrief = () => {
    setBriefText(buildCreditBrief());
  };

  const handleApplyOrShare = () => {
    const text = briefText || buildCreditBrief();
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
        <Text style={styles.headerTitle}>Pre & Post Credit</Text>
        <Text style={styles.headerBadge}>
          {mode === 'PRE_SHIPMENT' ? 'PRE' : 'POST'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBanner}>
          <Text style={styles.statusTitle}>
            Free Brief & Application Share — Live Auto-Sanction: Coming Soon
          </Text>
          <Text style={styles.statusSub}>
            Check readiness below, attach supporting docs/refs, and share your brief with your bank or finance desk.
          </Text>
        </View>

        <View style={styles.tabsRow}>
          {CREDIT_MODES.map((item) => {
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
            label="Attach Supporting Docs / Refs"
            items={attachedDocs}
            onChangeItems={handleDocsChange}
            quickTags={QUICK_CREDIT_DOCS}
            placeholder="e.g. Export_PO.pdf or LC_Copy.pdf"
            context="service"
          />

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleBuildBrief}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Build Credit Brief</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApplyOrShare}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Apply / Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {briefText ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Credit Brief Preview</Text>
            <Text style={styles.previewBody}>{briefText}</Text>
          </View>
        ) : null}

        <View style={styles.criteriaCard}>
          <Text style={styles.criteriaTitle}>
            General Readiness & Self-Check ({mode === 'PRE_SHIPMENT' ? 'Pre-Shipment' : 'Post-Shipment'})
          </Text>
          {criteriaList.map((point, idx) => (
            <Text key={idx} style={styles.criteriaItem}>
              • {point}
            </Text>
          ))}
          <Text style={styles.criteriaDisclaimer}>
            Note: General readiness guide only. Final eligibility, credit score/limit, interest rates, and terms depend on RBI/bank/lender norms and your credit profile.
          </Text>
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
  criteriaCard: {
    marginTop: 14,
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
  },
  criteriaTitle: {
    color: '#F3D27A',
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  criteriaItem: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 5,
  },
  criteriaDisclaimer: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
});
  
