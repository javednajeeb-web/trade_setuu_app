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

const CLEARANCE_MODES = [
  { key: 'EXPORT', label: 'EXPORT', fullName: 'Export Customs (Shipping Bill)' },
  { key: 'IMPORT', label: 'IMPORT', fullName: 'Import Customs (Bill of Entry)' },
];

const QUICK_DOC_TAGS = [
  'Commercial_Invoice.pdf',
  'Packing_List.pdf',
  'Draft_BL.pdf',
  'Certificate_of_Origin.pdf',
];

const CLEARANCE_FIELDS = {
  EXPORT: [
    { key: 'partyIe', label: 'Exporter Name & IEC Ref', placeholder: 'e.g. UA EXIM Overseas | IEC XXXXXXXXXX' },
    { key: 'portStation', label: 'Load Port & Customs Station', placeholder: 'e.g. JNPT Nhava Sheva / Vizag Port' },
    { key: 'goodsHs', label: 'Commodity, HS Code & Qty/Value', placeholder: 'e.g. Parboiled Rice 5% | HS 10063020 | 500 MT' },
    { key: 'docsReady', label: 'Available Docs & Incentives', placeholder: 'e.g. CI, PL, Draft BL, LUT, RoDTEP / APEDA' },
    { key: 'scheduleNote', label: 'Cargo Cut-Off & CHA Instructions', placeholder: 'e.g. Stuffing 28 Nov | Prior LEO / Lab check' },
  ],
  IMPORT: [
    { key: 'partyIe', label: 'Importer Name & IEC Ref', placeholder: 'e.g. Importer Entity | IEC XXXXXXXXXX' },
    { key: 'portStation', label: 'Discharge Port & Origin Country', placeholder: 'e.g. Vizag / Mundra | Origin: Malaysia/UAE' },
    { key: 'goodsHs', label: 'Commodity, HS Code & CIF Value', placeholder: 'e.g. Raw Commodity | HS XXXX | CIF USD / INR' },
    { key: 'docsReady', label: 'Shipping & Compliance Docs', placeholder: 'e.g. HBL/MBL, CI, PL, COO, Phytosanitary / Lab' },
    { key: 'scheduleNote', label: 'Vessel ETA & Duty/Delivery Note', placeholder: 'e.g. ETA 02 Dec | Duty check & port pickup' },
  ],
};

export default function ChaCustomsScreen({ onBack }) {
  const [mode, setMode] = useState('EXPORT');
  const [valuesByMode, setValuesByMode] = useState({
    EXPORT: {},
    IMPORT: {},
  });
  const [attachedDocsByMode, setAttachedDocsByMode] = useState({
    EXPORT: [],
    IMPORT: [],
  });
  const [docInput, setDocInput] = useState('');
  const [briefText, setBriefText] = useState('');

  const currentMeta =
    CLEARANCE_MODES.find((m) => m.key === mode) || CLEARANCE_MODES[0];
  const fields = CLEARANCE_FIELDS[mode] || [];
  const currentValues = valuesByMode[mode] || {};
  const attachedDocs = attachedDocsByMode[mode] || [];

  const handleFieldChange = (key, text) => {
    setValuesByMode((prev) => ({
      ...prev,
      [mode]: {
        ...(prev[mode] || {}),
        [key]: text,
      },
    }));
  };

  const addDocAttachment = (docName) => {
    const clean = (docName || '').trim();
    if (!clean) return;
    setAttachedDocsByMode((prev) => {
      const existing = prev[mode] || [];
      if (existing.includes(clean)) return prev;
      return {
        ...prev,
        [mode]: [...existing, clean],
      };
    });
    setDocInput('');
  };

  const removeDocAttachment = (docName) => {
    setAttachedDocsByMode((prev) => ({
      ...prev,
      [mode]: (prev[mode] || []).filter((item) => item !== docName),
    }));
  };

  const buildBrief = () => {
    const docsSection =
      attachedDocs.length > 0
        ? attachedDocs.map((d, idx) => `  ${idx + 1}. ${d}`).join('\n')
        : '  None attached yet';

    const lines = [
      `=== CHA & CUSTOMS (${currentMeta.fullName.toUpperCase()}) ===`,
      ...fields.map(
        (f) => `${f.label}: ${(currentValues[f.key] || '').trim() || '—'}`
      ),
      'Attached Documents / PDFs:',
      docsSection,
      'Prepared via CHA & Customs Desk — Trade SETUU',
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
        <Text style={styles.headerTitle}>CHA & Customs</Text>
        <Text style={styles.headerBadge}>{mode}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subCaption}>
          Prepare clearance brief, attach CI / PL / PDF docs & share with CHA
        </Text>

        <View style={styles.tabsRow}>
          {CLEARANCE_MODES.map((item) => {
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
          <Text style={styles.cardHeading}>{currentMeta.fullName} Details</Text>

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

          <View style={styles.attachBox}>
            <Text style={styles.fieldLabel}>
              Attach CI / PL / Downloaded PDFs ({attachedDocs.length})
            </Text>

            <View style={styles.attachRow}>
              <TextInput
                value={docInput}
                onChangeText={setDocInput}
                placeholder="e.g. CI_104.pdf or PL_104.pdf"
                placeholderTextColor="#64748B"
                style={[styles.input, styles.attachInput]}
              />
              <TouchableOpacity
                onPress={() => addDocAttachment(docInput)}
                style={styles.addDocBtn}
              >
                <Text style={styles.addDocBtnText}>+ Attach</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickChipsRow}
            >
              {QUICK_DOC_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => addDocAttachment(tag)}
                  style={styles.quickChip}
                >
                  <Text style={styles.quickChipText}>+ {tag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {attachedDocs.length > 0 ? (
              <View style={styles.docList}>
                {attachedDocs.map((doc) => (
                  <View key={doc} style={styles.docItem}>
                    <Text style={styles.docItemText} numberOfLines={1}>
                      📄 {doc}
                    </Text>
                    <TouchableOpacity onPress={() => removeDocAttachment(doc)}>
                      <Text style={styles.removeDocText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleBuildBrief}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Build CHA Brief</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShareBrief}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Share to CHA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {briefText ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{mode} Customs Brief Preview</Text>
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
  subCaption: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginBottom: 10,
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
    fontSize: 12.5,
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
  attachBox: {
    marginTop: 4,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachInput: {
    flex: 1,
    marginRight: 8,
  },
  addDocBtn: {
    backgroundColor: 'rgba(243, 210, 122, 0.16)',
    borderWidth: 1,
    borderColor: '#F3D27A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addDocBtnText: {
    color: '#F3D27A',
    fontSize: 12,
    fontWeight: '800',
  },
  quickChipsRow: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  quickChip: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  quickChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  docList: {
    marginTop: 8,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 6,
  },
  docItemText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  removeDocText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '900',
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
