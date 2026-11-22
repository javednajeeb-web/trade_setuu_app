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
  Alert,
  Switch,
} from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const DOC_TYPES = [
  { key: 'QUOTE', label: 'QUOTE', fullName: 'Quotation' },
  { key: 'PI', label: 'PI', fullName: 'Proforma Invoice' },
  { key: 'LOI', label: 'LOI', fullName: 'Letter of Intent' },
  { key: 'PO', label: 'PO', fullName: 'Purchase Order' },
  { key: 'CI', label: 'CI', fullName: 'Commercial Invoice' },
  { key: 'PL', label: 'PL', fullName: 'Packing List' },
  { key: 'NCNDA', label: 'NCNDA', fullName: 'Non-Circumvention & Non-Disclosure' },
  { key: 'IMFPA', label: 'IMFPA', fullName: 'Irrevocable Master Fee Protection' },
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
  NCNDA: [
    { key: 'partyFrom', label: 'Disclosing / First Party', placeholder: 'e.g. UA EXIM Overseas' },
    { key: 'partyTo', label: 'Receiving / Counterparty', placeholder: 'e.g. Dakar Global Foods' },
    { key: 'docRef', label: 'Agreement Ref & Date', placeholder: 'e.g. NCNDA-2026-09 | 23 Nov 2026' },
    { key: 'commodity', label: 'Protected Commodity / Mandate', placeholder: 'e.g. Non-Basmati Parboiled Rice Supply' },
    { key: 'hsCode', label: 'Non-Circumvention Term', placeholder: 'e.g. 24 Months from Execution' },
    { key: 'qtyRate', label: 'Confidentiality & Non-Bypass Scope', placeholder: 'e.g. Direct/Indirect Buyer-Seller Protection' },
    { key: 'terms', label: 'Governing Law, Jurisdiction & Remarks', placeholder: 'e.g. Mutual Arbitration / International Trade' },
  ],
  IMFPA: [
    { key: 'partyFrom', label: 'Payor / Buyer or Seller Entity', placeholder: 'e.g. UA EXIM Overseas' },
    { key: 'partyTo', label: 'Beneficiary / Intermediary / Paymaster', placeholder: 'e.g. Trade Intermediary & Paymaster' },
    { key: 'docRef', label: 'IMFPA Ref & Linked Contract/PO', placeholder: 'e.g. IMFPA-2026-14 | Ref PO-5591' },
    { key: 'commodity', label: 'Transaction Commodity & Volume', placeholder: 'e.g. 1,000 MT Parboiled Rice' },
    { key: 'hsCode', label: 'Commission / Fee Rate', placeholder: 'e.g. USD 5 / MT or 2% of Invoice Value' },
    { key: 'qtyRate', label: 'Payment Trigger & Settlement Mode', placeholder: 'e.g. Upon Each Tranche / LC / TT Release' },
    { key: 'terms', label: 'Bank / Paymaster Coordinates & Remarks', placeholder: 'e.g. Irrevocable fee protection schedule' },
  ],
};

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export default function DocForgeMakerScreen({ onBack }) {
  const [docType, setDocType] = useState('QUOTE');
  const [valuesByDoc, setValuesByDoc] = useState({
    QUOTE: {},
    PI: {},
    LOI: {},
    PO: {},
    CI: {},
    PL: {},
    NCNDA: {},
    IMFPA: {},
  });
  const [previewText, setPreviewText] = useState('');
  const [savedPdfUri, setSavedPdfUri] = useState(null);
  const [savedPdfName, setSavedPdfName] = useState('');
  const [isSavingPdf, setIsSavingPdf] = useState(false);

  // DSC & Digital Seal controls
  const [dscEnabled, setDscEnabled] = useState(false);
  const [dscLabel, setDscLabel] = useState('Class-3 DSC Verified');
  const [digitalSealEnabled, setDigitalSealEnabled] = useState(false);
  const [sealLabel, setSealLabel] = useState('Official Company Seal');

  const currentDocMeta = DOC_TYPES.find((d) => d.key === docType) || DOC_TYPES[0];
  const fields = DOC_FIELDS[docType] || [];
  const currentValues = valuesByDoc[docType] || {};

  const handleFieldChange = (fieldKey, text) => {
    setSavedPdfUri(null);
    setValuesByDoc((prev) => ({
      ...prev,
      [docType]: {
        ...(prev[docType] || {}),
        [fieldKey]: text,
      },
    }));
  };

  const getAuthSummaryLines = () => {
    const dscText = dscEnabled
      ? `DSC: ENABLED (${(dscLabel || '').trim() || 'Verified DSC'})`
      : 'DSC: Not Attached';
    const sealText = digitalSealEnabled
      ? `Digital Seal: APPLIED (${(sealLabel || '').trim() || 'Official Seal'})`
      : 'Digital Seal: Not Applied';
    return [dscText, sealText];
  };

  const buildDraftText = () => {
    const [dscLine, sealLine] = getAuthSummaryLines();
    const lines = [
      `=== ${currentDocMeta.fullName.toUpperCase()} (${docType}) ===`,
      ...fields.map((f) => `${f.label}: ${(currentValues[f.key] || '').trim() || '—'}`),
      dscLine,
      sealLine,
      'Generated via DocForge Maker — Trade SETUU',
    ];
    return lines.join('\n');
  };

  const buildA4Html = () => {
    const rowsHtml = fields
      .map((f) => {
        const val = (currentValues[f.key] || '').trim() || '—';
        return `
          <tr>
            <th>${escapeHtml(f.label)}</th>
            <td>${escapeHtml(val)}</td>
          </tr>
        `;
      })
      .join('');

    const dscBadge = dscEnabled
      ? `<span class="badge ok">DSC ACTIVE: ${escapeHtml((dscLabel || '').trim() || 'Verified DSC')}</span>`
      : `<span class="badge off">DSC: NOT ATTACHED</span>`;

    const sealBadge = digitalSealEnabled
      ? `<span class="badge ok">DIGITAL SEAL: ${escapeHtml((sealLabel || '').trim() || 'Official Seal')}</span>`
      : `<span class="badge off">DIGITAL SEAL: NOT APPLIED</span>`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 16mm; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              font-size: 12px;
              line-height: 1.45;
              margin: 0;
              padding: 0;
            }
            .top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 10px;
              margin-bottom: 14px;
            }
            .brand { font-size: 18px; font-weight: bold; }
            .sub { font-size: 11px; color: #475569; margin-top: 2px; }
            .doc-box { text-align: right; }
            .doc-title { font-size: 15px; font-weight: bold; color: #0f766e; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; vertical-align: top; }
            th { width: 34%; background: #f8fafc; font-weight: bold; }
            .auth-box {
              border: 1px solid #cbd5e1;
              background: #f8fafc;
              padding: 10px 12px;
              border-radius: 6px;
              margin-top: 8px;
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10.5px;
              font-weight: bold;
              margin-right: 8px;
              margin-bottom: 4px;
            }
            .ok { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
            .off { background: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; }
            .footer {
              margin-top: 18px;
              font-size: 10.5px;
              color: #64748b;
              text-align: center;
              border-top: 1px dashed #cbd5e1;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="top">
            <div>
              <div class="brand">DocForge Maker — Trade SETUU</div>
              <div class="sub">Standard A4 Trade Document Format</div>
            </div>
            <div class="doc-box">
              <div class="doc-title">${escapeHtml(currentDocMeta.fullName)} (${escapeHtml(docType)})</div>
              <div class="sub">Ref: ${escapeHtml((currentValues.docRef || '').trim() || '—')}</div>
            </div>
          </div>

          <table>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="auth-box">
            ${dscBadge}
            ${sealBadge}
          </div>

          <div class="footer">Generated via DocForge Maker — Trade SETUU</div>
        </body>
      </html>
    `;
  };

  const handleGenerateDraft = () => {
    setPreviewText(buildDraftText());
  };

  const handleSavePdf = async () => {
    try {
      setIsSavingPdf(true);
      const draft = buildDraftText();
      setPreviewText(draft);

      const { uri: tempUri } = await Print.printToFileAsync({
        html: buildA4Html(),
        width: 595,
        height: 842,
      });

      const cleanRef = ((currentValues.docRef || '').trim() || Date.now().toString()).replace(
        /[^a-zA-Z0-9_-]/g,
        '_'
      );
      const fileName = `DocForge_${docType}_${cleanRef}.pdf`;
      const targetUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({ from: tempUri, to: targetUri });

      setSavedPdfUri(targetUri);
      setSavedPdfName(fileName);
      Alert.alert('PDF Saved', `A4 PDF saved as:\n${fileName}`);
      return targetUri;
    } catch (err) {
      Alert.alert('PDF Error', err?.message || 'Could not generate/save A4 PDF.');
      return null;
    } finally {
      setIsSavingPdf(false);
    }
  };

  const handleShareDraft = async () => {
    const text = buildDraftText();
    setPreviewText(text);

    try {
      let pdfUri = savedPdfUri;
      if (!pdfUri) {
        pdfUri = await handleSavePdf();
      }

      const sharingAvailable = await Sharing.isAvailableAsync();
      if (sharingAvailable && pdfUri) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${docType} A4 PDF`,
          UTI: 'com.adobe.pdf',
        });
        return;
      }

      await Share.share({ message: text });
    } catch (err) {
      Alert.alert('Share Error', err?.message || 'Could not share document.');
    }
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
                  setSavedPdfUri(null);
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

          {/* DSC & Digital Seal Section */}
          <View style={styles.authSection}>
            <Text style={styles.authHeading}>DSC & Digital Seal</Text>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Attach DSC (Digital Signature Certificate)</Text>
              <Switch
                value={dscEnabled}
                onValueChange={(v) => {
                  setDscEnabled(v);
                  setSavedPdfUri(null);
                }}
                trackColor={{ false: '#1E293B', true: '#0F766E' }}
                thumbColor={dscEnabled ? '#2DD4BF' : '#94A3B8'}
              />
            </View>
            {dscEnabled ? (
              <TextInput
                value={dscLabel}
                onChangeText={(txt) => {
                  setDscLabel(txt);
                  setSavedPdfUri(null);
                }}
                placeholder="e.g. Class-3 DSC / Signatory Name"
                placeholderTextColor="#64748B"
                style={[styles.input, styles.authInput]}
              />
            ) : null}

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Apply Digital Seal</Text>
              <Switch
                value={digitalSealEnabled}
                onValueChange={(v) => {
                  setDigitalSealEnabled(v);
                  setSavedPdfUri(null);
                }}
                trackColor={{ false: '#1E293B', true: '#0F766E' }}
                thumbColor={digitalSealEnabled ? '#2DD4BF' : '#94A3B8'}
              />
            </View>
            {digitalSealEnabled ? (
              <TextInput
                value={sealLabel}
                onChangeText={(txt) => {
                  setSealLabel(txt);
                  setSavedPdfUri(null);
                }}
                placeholder="e.g. Official Company Seal"
                placeholderTextColor="#64748B"
                style={[styles.input, styles.authInput]}
              />
            ) : null}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleGenerateDraft}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Build {docType} Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSavePdf}
              disabled={isSavingPdf}
              style={styles.pdfBtn}
            >
              <Text style={styles.pdfBtnText}>
                {isSavingPdf ? 'Saving...' : 'Save PDF'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShareDraft}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

          {savedPdfName ? (
            <Text style={styles.savedNote}>Saved A4 PDF: {savedPdfName}</Text>
          ) : null}
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
  authSection: {
    marginTop: 4,
    marginBottom: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  authHeading: {
    color: '#F3D27A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggleLabel: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  authInput: {
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  primaryBtn: {
    flex: 1.2,
    backgroundColor: '#2DD4BF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 6,
  },
  primaryBtnText: {
    color: '#050811',
    fontSize: 12.5,
    fontWeight: '900',
  },
  pdfBtn: {
    paddingHorizontal: 12,
    backgroundColor: '#134E4A',
    borderWidth: 1,
    borderColor: '#2DD4BF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  pdfBtnText: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '800',
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
  savedNote: {
    color: '#2DD4BF',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 10,
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
