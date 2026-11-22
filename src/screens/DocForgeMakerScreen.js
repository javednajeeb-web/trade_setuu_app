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

const DOC_TYPES = [
  { key: 'QUOTE', label: 'QUOTE', fullName: 'Quotation' },
  { key: 'PI', label: 'PI', fullName: 'Proforma Invoice' },
  { key: 'LOI', label: 'LOI', fullName: 'Letter of Intent' },
  { key: 'PO', label: 'PO', fullName: 'Purchase Order' },
  { key: 'CI', label: 'CI', fullName: 'Commercial Invoice' },
  { key: 'PL', label: 'PL', fullName: 'Packing List' },
];

const DOC_FIELDS = {
  QUOTE: [
    { key: 'partyFrom', label: 'Exporter / Seller Name', placeholder: 'e.g. UA EXIM Overseas' },
    { key: 'partyTo', label: 'Buyer / Enquirer Name', placeholder: 'e.g. Dakar Global Foods' },
    { key: 'docRef', label: 'Quote Ref & Validity', placeholder: 'e.g. QT-2026-51 | Valid 5 Days' },
    { key: 'commodity', label: 'Commodity & Grade / Specs', placeholder: 'e.g. Non-Basmati Parboiled Rice 5%' },
    { key: 'hsCode', label: 'HS Code', placeholder: 'e.g. 10063020' },
    { key: 'qtyRate', label: 'Offered Qty & Rate', placeholder: 'e.g. 1,000 MT @ USD 465 / MT' },
    { key: 'terms', label: 'Incoterms, Port & Remarks', placeholder: 'e.g. FOB JNPT | 50kg PP Bags, SGS Ready' },
  ],
  PI: [
    { key: 'partyFrom', label: 'Exporter / Seller Name', placeholder: 'e.g. UA EXIM Overseas' },
    { key: 'partyTo', label: 'Buyer / Importer Name', placeholder: 'e.g. Dakar Global Foods' },
    { key: 'docRef', label: 'PI Number & Date', placeholder: 'e.g. PI-2026-104 | 22 Nov 2026' },
    { key: 'commodity', label: 'Commodity & Grade', placeholder: 'e.g. Non-Basmati Parboiled Rice 5%' },
    { key: 'hsCode', label: 'HS Code', placeholder: 'e.g. 10063020' },
    { key: 'qtyRate', label: 'Quantity & Rate', placeholder: 'e.g. 1,000 MT @ USD 465 / MT' },
    { key: 'terms', label: 'Incoterms & Payment', placeholder: 'e.g. FOB JNPT | 30% Adv, 70% against BL' },
  ],
  LOI: [
    { key: 'partyFrom', label: 'Issuing Buyer / Entity', placeholder: 'e.g. West Africa Agro Trading' },
    { key: 'partyTo', label: 'Target Supplier / Exporter', placeholder: 'e.g. UA EXIM Overseas' },
    { key: 'docRef', label: 'LOI Reference & Validity', placeholder: 'e.g. LOI-882 | Valid 7 Days' },
    { key: 'commodity', label: 'Commodity & Specs', placeholder: 'e.g. Yellow Maize Moisture <14%' },
    { key: 'hsCode', label: 'HS Code (if known)', placeholder: 'e.g. 10059000' },
    { key: 'qtyRate', label: 'Target Volume & Price', placeholder: 'e.g. 2,000 MT @ USD 270 / MT CIF' },
    { key: 'terms', label: 'Shipment Window & Conditions', placeholder: 'e.g. Dec 2026 | SGS Inspection' },
  ],
  PO: [
    { key: 'partyFrom', label: 'Buyer Company (PO Issuer)', placeholder: 'e.g. Apex Global Commodities' },
    { key: 'partyTo', label: 'Vendor / Supplier Name', placeholder: 'e.g. Raipur Agro Millers' },
    { key: 'docRef', label: 'PO Number & Delivery Date', placeholder: 'e.g. PO-5591 | Dispatch by 30 Nov' },
    { key: 'commodity', label: 'Item & Packing', placeholder: 'e.g. 1121 Sella Basmati | 50kg PP Bags' },
    { key: 'hsCode', label: 'HS / HSN Code', placeholder: 'e.g. 10063090' },
    { key: 'qtyRate', label: 'Order Qty & Unit Price', placeholder: 'e.g. 500 MT @ ₹82,000 / MT' },
    { key: 'terms', label: 'Delivery Port/Plant & Payment', placeholder: 'e.g. Mundra Port | LC at Sight' },
  ],
  CI: [
    { key: 'partyFrom', label: 'Exporter / Shipper', placeholder: 'e.g. UA EXIM Overseas' },
    { key: 'partyTo', label: 'Consignee / Buyer', placeholder: 'e.g. Banjul Import Co.' },
    { key: 'docRef', label: 'Invoice No. & BL/AWB Ref', placeholder: 'e.g. CI-309 | BL-77412' },
    { key: 'commodity', label: 'Goods Description & HS Code', placeholder: 'e.g. Parboiled Rice | HS 10063020' },
    { key: 'hsCode', label: 'Port of Loading -> Discharge', placeholder: 'e.g. Vizag -> Banjul' },
    { key: 'qtyRate', label: 'Net/Gross Wt & Invoice Value', placeholder: 'e.g. Net 500 MT | USD 232,500' },
    { key: 'terms', label: 'Incoterms & Bank/Payment Ref', placeholder: 'e.g. CIF Banjul | TT Remittance' },
  ],
  PL: [
    { key: 'partyFrom', label: 'Shipper / Exporter', placeholder: 'e.g. UA EXIM Overseas' },
    { key: 'partyTo', label: 'Consignee / Notify Party', placeholder: 'e.g. Dakar Port Receivers' },
    { key: 'docRef', label: 'Packing List & Container No.', placeholder: 'e.g. PL-309 | 20x20ft HC' },
    { key: 'commodity', label: 'Package Type & Count', placeholder: 'e.g. 10,000 Bags (50kg each)' },
    { key: 'hsCode', label: 'HS Code', placeholder: 'e.g. 10063020' },
    { key: 'qtyRate', label: 'Net Wt / Gross Wt / CBM', placeholder: 'e.g. Net 500 MT | Gross 502 MT' },
    { key: 'terms', label: 'Marks, Numbers & Seal Info', placeholder: 'e.g. Lot #12 | Custom Seal intact' },
  ],
};

export default function DocForgeMakerScreen({ onBack }) {
  const [docType, setDocType] = useState('QUOTE');
  const [valuesByDoc, setValuesByDoc] = useState({
    QUOTE: {},
    PI: {},
    LOI: {},
    PO: {},
    CI: {},
    PL: {},
  });
  const [previewText, setPreviewText] = useState('');

  const currentDocMeta = DOC_TYPES.find((d) => d.key === docType) || DOC_TYPES[0];
  const fields = DOC_FIELDS[docType] || [];
  const currentValues = valuesByDoc[docType] || {};

  const handleFieldChange = (fieldKey, text) => {
    setValuesByDoc((prev) => ({
      ...prev,
      [docType]: {
        ...(prev[docType] || {}),
        [fieldKey]: text,
      },
    }));
  };

  const buildDraftText = () => {
    const lines = [
      `=== ${currentDocMeta.fullName.toUpperCase()} (${docType}) ===`,
      ...fields.map((f) => `${f.label}: ${(currentValues[f.key] || '').trim() || '—'}`),
      'Generated via DocForge Maker — Trade SETUU',
    ];
    return lines.join('\n');
  };

  const handleGenerateDraft = () => {
    setPreviewText(buildDraftText());
  };

  const handleShareDraft = () => {
    const text = previewText || buildDraftText();
    setPreviewText(text);
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
        <Text style={styles.headerTitle}>DocForge Maker</Text>
        <Text style={styles.headerBadge}>{docType}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subCaption}>
          Select document type — each draft has its own specific fields
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {DOC_TYPES.map((item) => {
            const active = item.key === docType;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => {
                  setDocType(item.key);
                  setPreviewText('');
                }}
                style={[styles.docTab, active && styles.docTabActive]}
              >
                <Text style={[styles.docTabCode, active && styles.docTabCodeActive]}>
                  {item.label}
                </Text>
                <Text style={[styles.docTabSub, active && styles.docTabSubActive]}>
                  {item.fullName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>
            {currentDocMeta.fullName} ({docType}) Details
          </Text>

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

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleGenerateDraft}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Build {docType} Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShareDraft}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {previewText ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{docType} Draft Preview</Text>
            <Text style={styles.previewBody}>{previewText}</Text>
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
    paddingBottom: 12,
  },
  docTab: {
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  docTabActive: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    borderColor: '#2DD4BF',
  },
  docTabCode: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
  },
  docTabCodeActive: {
    color: '#2DD4BF',
  },
  docTabSub: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 1,
  },
  docTabSubActive: {
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
    fontSize: 13.5,
    fontWeight: '900',
  },
  secondaryBtn: {
    paddingHorizontal: 18,
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
    fontSize: 13,
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
