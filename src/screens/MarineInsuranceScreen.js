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

const INSURANCE_MODES = [
  {
    key: 'NEW_COVER',
    label: 'NEW COVER / QUOTE',
    fullName: 'Marine Cargo Cover & Quote Brief',
  },
  {
    key: 'CLAIM_SURVEY',
    label: 'CLAIM & SURVEY',
    fullName: 'Transit Loss / Survey & Claim Brief',
  },
];

const QUICK_INSURANCE_DOCS = [
  'Commercial_Invoice.pdf',
  'Packing_List.pdf',
  'Bill_of_Lading.pdf',
  'Shipping_Bill.pdf',
  'Marine_Policy_Copy.pdf',
  'Survey_Report.pdf',
];

const INSURANCE_FIELDS = {
  NEW_COVER: [
    {
      key: 'partyRef',
      label: 'Exporter / Importer Name & IEC Ref',
      placeholder: 'e.g. UA EXIM Overseas (Exporter) | IEC XXXXXXXXXX',
    },
    {
      key: 'cargoHs',
      label: 'Cargo Description, Packaging & HS Code',
      placeholder: 'e.g. Parboiled Rice in 50kg PP Bags | HS 10063020',
    },
    {
      key: 'routeMode',
      label: 'Origin Port -> Destination Port & Mode',
      placeholder: 'e.g. Vizag Port -> Dakar Port | Sea FCL / LCL / Air',
    },
    {
      key: 'sumInsured',
      label: 'Invoice Value & Sum Insured (with Currency)',
      placeholder: 'e.g. Invoice USD 120,000 | Sum Insured CIF + 10%',
    },
    {
      key: 'coverTerms',
      label: 'Cover Type, Clause & Incoterms',
      placeholder: 'e.g. Single Transit / Open Policy | ICC (A)/(B)/(C) | CIF',
    },
    {
      key: 'dispatchRemarks',
      label: 'Expected Dispatch Date & Remarks',
      placeholder: 'e.g. Dispatch 28 Nov 2026 | Dry 20ft container',
    },
  ],
  CLAIM_SURVEY: [
    {
      key: 'partyRef',
      label: 'Insured Firm Name & Policy / Certificate No.',
      placeholder: 'e.g. UA EXIM Overseas | Policy No. XXXXXXXX',
    },
    {
      key: 'shipmentDocs',
      label: 'BL / AWB, Shipping Bill & Invoice Ref',
      placeholder: 'e.g. BL #8841 | SB #9012 | Inv #208',
    },
    {
      key: 'incidentLocation',
      label: 'Loss / Damage Type & Port / Location',
      placeholder: 'e.g. Water damage / Shortage at Destination Port',
    },
    {
      key: 'lossEstimate',
      label: 'Estimated Loss Amount & Currency',
      placeholder: 'e.g. Approx. USD 8,500',
    },
    {
      key: 'surveyStatus',
      label: 'Surveyor Intimation & Action Taken',
      placeholder: 'e.g. Carrier notice issued / Surveyor appointment requested',
    },
    {
      key: 'dispatchRemarks',
      label: 'Supporting Evidence & Remarks',
      placeholder: 'e.g. Photos, EIR, Landing remark & packing list ready',
    },
  ],
};

const BETA_CHECKLIST = [
  'Beta Scope: Free structured brief builder & instant share are active now.',
  'Coming Soon: Live insurer/broker premium comparison, instant policy issuance, and automated claim tracking.',
  'Always verify exact clause coverage (ICC A / B / C), exclusions, transit limits, and survey timelines in your final policy document.',
  'In case of transit damage/shortage, issue written notice to carrier/port promptly and preserve packaging & photos for survey.',
];

export default function MarineInsuranceScreen({ onBack }) {
  const [mode, setMode] = useState('NEW_COVER');
  const [valuesByMode, setValuesByMode] = useState({
    NEW_COVER: {},
    CLAIM_SURVEY: {},
  });
  const [docsByMode, setDocsByMode] = useState({
    NEW_COVER: [],
    CLAIM_SURVEY: [],
  });
  const [briefText, setBriefText] = useState('');
  const [showComingSoonHint, setShowComingSoonHint] = useState(false);

  const currentMeta =
    INSURANCE_MODES.find((m) => m.key === mode) || INSURANCE_MODES[0];
  const fields = INSURANCE_FIELDS[mode] || [];
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

  const buildInsuranceBrief = () => {
    const lines = [
      `=== MARINE INSURANCE (${currentMeta.fullName.toUpperCase()}) ===`,
      ...fields.map(
        (f) => `${f.label}: ${(currentValues[f.key] || '').trim() || '—'}`
      ),
      'Attached Documents / Refs:',
      formatAttachmentsForBrief(attachedDocs),
      'Status: Free Beta Brief & Share (Live Insurer Quote & Policy Issue — Coming Soon)',
      'Prepared via Marine Insurance — Trade SETUU',
    ];
    return lines.join('\n');
  };

  const handleBuildBrief = () => {
    setBriefText(buildInsuranceBrief());
  };

  const handleShareBrief = () => {
    const text = briefText || buildInsuranceBrief();
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
        <Text style={styles.headerTitle}>Marine Insurance</Text>
        <Text style={styles.headerBadge}>
          {mode === 'NEW_COVER' ? 'COVER' : 'CLAIM'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBanner}>
          <View style={styles.statusHeaderRow}>
            <Text style={styles.statusTitle}>
              Free Insurance Brief & Share — Live Quote & Policy: Coming Soon
            </Text>
          </View>
          <Text style={styles.statusSub}>
            Beta Mode: Prepare your cargo cover or transit claim brief for free and share directly with your broker, insurer, or team.
          </Text>

          <TouchableOpacity
            onPress={() => setShowComingSoonHint((prev) => !prev)}
            style={styles.comingSoonPill}
          >
            <Text style={styles.comingSoonPillText}>
              ⚡ Instant Policy & Live Premium API — Coming Soon (Tap for info)
            </Text>
          </TouchableOpacity>

          {showComingSoonHint ? (
            <Text style={styles.comingSoonDetail}>
              Live insurer rate comparison and instant policy generation will arrive in an upcoming release. Right now, fill your shipment details below and share the brief with your insurance desk/broker at zero cost.
            </Text>
          ) : null}
        </View>

        <View style={styles.tabsRow}>
          {INSURANCE_MODES.map((item) => {
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
            label="Attach Shipment / Policy / Survey Docs"
            items={attachedDocs}
            onChangeItems={handleDocsChange}
            quickTags={QUICK_INSURANCE_DOCS}
            placeholder="e.g. Commercial_Invoice.pdf or BL_8841.pdf"
            context="service"
          />

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleBuildBrief}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Build Insurance Brief</Text>
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
            <Text style={styles.previewTitle}>Marine Insurance Brief Preview</Text>
            <Text style={styles.previewBody}>{briefText}</Text>
          </View>
        ) : null}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Beta Limits & Transit Insurance Checklist</Text>
          {BETA_CHECKLIST.map((point, idx) => (
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
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTitle: {
    color: '#F3D27A',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  statusSub: {
    color: '#CBD5E1',
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 16,
  },
  comingSoonPill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.35)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  comingSoonPillText: {
    color: '#2DD4BF',
    fontSize: 11,
    fontWeight: '800',
  },
  comingSoonDetail: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
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
                         
