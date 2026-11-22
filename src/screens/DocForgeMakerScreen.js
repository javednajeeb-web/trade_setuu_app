import React, { useState, useMemo } from 'react';
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
  { key: 'QUOTE', label: 'QUOTE', fullName: 'Quotation', category: 'commercial' },
  { key: 'SCO', label: 'SCO', fullName: 'Soft Corporate Offer', category: 'commercial' },
  { key: 'FCO', label: 'FCO', fullName: 'Full Corporate Offer', category: 'commercial' },
  { key: 'LOI', label: 'LOI', fullName: 'Letter of Intent', category: 'intent' },
  { key: 'PI', label: 'PI', fullName: 'Proforma Invoice', category: 'commercial' },
  { key: 'SALES_CONTRACT', label: 'SPA / CONTRACT', fullName: 'Sales Contract / SPA', category: 'contract' },
  { key: 'PO', label: 'PO', fullName: 'Purchase Order', category: 'po' },
  { key: 'PPL', label: 'PPL', fullName: 'Proforma Packing List', category: 'logistics' },
  { key: 'INSP_REQ', label: 'INSP REQ', fullName: 'Inspection Request', category: 'logistics' },
  { key: 'SI', label: 'SI', fullName: 'Shipping Instructions', category: 'logistics' },
  { key: 'CI', label: 'CI', fullName: 'Commercial Invoice', category: 'commercial' },
  { key: 'PL', label: 'PL', fullName: 'Final Packing List', category: 'logistics' },
  { key: 'NCNDA', label: 'NCNDA', fullName: 'Non-Circumvention & Non-Disclosure', category: 'legal' },
  { key: 'IMFPA', label: 'IMFPA', fullName: 'Irrevocable Master Fee Protection', category: 'legal' },
];

const LIFECYCLE_STATUSES = ['Planned', 'Draft', 'Submitted', 'Final'];
const TRADE_MODES = ['International / Export', 'Domestic / Local'];
const CURRENCIES = ['USD', 'EUR', 'INR', 'AED'];
const UNITS = ['MT', 'KG', 'PCS', 'CBM'];
const INCOTERMS_2020 = ['FOB', 'CIF', 'CFR', 'EXW', 'FCA', 'DAP', 'DDP'];

const PO_DOMESTIC_PAYMENT_OPTIONS = [
  'Advance',
  'Part Advance + Balance on Delivery',
  'Against Delivery / COD',
  'Credit (7 / 15 / 30 Days)',
  'Custom',
];

const PO_DOMESTIC_DELIVERY_OPTIONS = [
  'LR / Bilty against Dispatch',
  'Door Delivery (Vendor Scope)',
  'Ex-Mill / Ex-Godown Pickup',
  'Freight To-Pay / Paid',
];

const PO_INTL_PAYMENT_OPTIONS = [
  'LC at Sight',
  'Usance LC (30 / 60 / 90 Days)',
  'Advance + Balance against BL Copy',
  '100% TT Advance',
  'CAD / DP',
  'Custom',
];

const DOC_SPECIFIC_FIELDS = {
  QUOTE: [
    { key: 'docRef', label: 'Quote Ref & Issue Date', placeholder: 'e.g. QT-2026-51 | 23 Nov 2026' },
    { key: 'validity', label: 'Quote Validity', placeholder: 'e.g. Valid 7 Days' },
    { key: 'paymentTerms', label: 'Payment Terms', placeholder: 'e.g. 30% Advance, 70% LC / TT' },
    { key: 'deliverySchedule', label: 'Delivery / Shipment Schedule', placeholder: 'e.g. Within 15-20 days of confirmation' },
  ],
  SCO: [
    { key: 'docRef', label: 'SCO Reference & Date', placeholder: 'e.g. SCO-2026-12 | 23 Nov 2026' },
    { key: 'indicativeNote', label: 'Indicative Offer / Availability Note', placeholder: 'e.g. Indicative offer subject to availability & market movement' },
    { key: 'paymentTerms', label: 'Indicative Payment Terms', placeholder: 'e.g. LC at Sight / TT' },
    { key: 'deliverySchedule', label: 'Indicative Shipment Window', placeholder: 'e.g. Dec 2026' },
  ],
  FCO: [
    { key: 'docRef', label: 'FCO Reference & Issue Date', placeholder: 'e.g. FCO-2026-28 | 23 Nov 2026' },
    { key: 'validity', label: 'Firm Offer Validity', placeholder: 'e.g. Valid for 5 business days' },
    { key: 'paymentTerms', label: 'Firm Payment & Banking Terms', placeholder: 'e.g. Irrevocable LC / Advance + Balance' },
    { key: 'inspectionTerms', label: 'Inspection & Delivery Schedule', placeholder: 'e.g. SGS inspection; dispatch within 21 days' },
  ],
  LOI: [
    { key: 'docRef', label: 'LOI Reference, Date & Validity', placeholder: 'e.g. LOI-882 | 23 Nov 2026 | Valid 7 Days' },
    { key: 'bindingStatus', label: 'Binding vs. Non-Binding Status', placeholder: 'e.g. Non-Binding Intent / Subject to Final Contract' },
    { key: 'inspectionTerms', label: 'Inspection Requirements', placeholder: 'e.g. SGS / Third-party quality & weight check' },
    { key: 'deliverySchedule', label: 'Target Delivery / Shipment Window', placeholder: 'e.g. Dec 2026 - Jan 2027' },
  ],
  PI: [
    { key: 'docRef', label: 'PI Number, Issue Date & Valid Until', placeholder: 'e.g. PI-2026-104 | 23 Nov 2026 | Valid 30 Nov 2026' },
    { key: 'packingWeight', label: 'Packing Type, Bag Wt, Packages & Net/Gross Wt', placeholder: 'e.g. 50kg PP bags | 20,000 bags | Net 1,000 MT / Gross 1,004 MT' },
    { key: 'paymentTerms', label: 'Payment Terms (Advance / Balance / LC / TT)', placeholder: 'e.g. 30% Advance, 70% against BL copy' },
    { key: 'bankDetails', label: 'Beneficiary Bank, Account / IBAN & SWIFT', placeholder: 'e.g. Bank Name, A/C No., SWIFT Code' },
  ],
  SALES_CONTRACT: [
    { key: 'docRef', label: 'Contract / SPA Ref & Date', placeholder: 'e.g. SC-2026-41 | 23 Nov 2026' },
    { key: 'paymentTerms', label: 'Contract Payment Terms', placeholder: 'e.g. LC at Sight / Advance + TT' },
    { key: 'inspectionTerms', label: 'Quality, Inspection & Delivery Clause', placeholder: 'e.g. SGS inspection; shipment/delivery schedule' },
    { key: 'governingLaw', label: 'Governing Law & Dispute / Arbitration Seat', placeholder: 'e.g. Arbitration / Agreed Jurisdiction (Legal review advised)' },
  ],
  PO: [
    { key: 'docRef', label: 'PO Number, Order Date & Delivery Date', placeholder: 'e.g. PO-5591 | 23 Nov 2026 | Del: 05 Dec 2026' },
    { key: 'billingAddress', label: 'Buyer Billing Address', placeholder: 'e.g. Billing address & GSTIN/Tax ID' },
    { key: 'deliveryAddress', label: 'Buyer Delivery / Plant / Port Address', placeholder: 'e.g. Delivery address / Plant / Port' },
    { key: 'customPaymentNote', label: 'Payment Terms Details / Custom Note', placeholder: 'e.g. Additional payment terms or custom note' },
    { key: 'customDeliveryNote', label: 'LR / Dispatch / Transport Details', placeholder: 'e.g. LR / Bilty no. or dispatch instructions' },
    { key: 'cancellationTerms', label: 'Inspection & Cancellation Terms', placeholder: 'e.g. Quality check & cancellation terms' },
    { key: 'vendorAcceptanceStatus', label: 'Vendor Acceptance Status', placeholder: 'e.g. Pending Confirmation / Confirmed & Accepted' },
    { key: 'vendorConfirmedBy', label: 'Confirmed By / Date & Acknowledgment', placeholder: 'e.g. Received & accepted by Vendor on Date' },
  ],
  PPL: [
    { key: 'docRef', label: 'Proforma PL Ref & Date', placeholder: 'e.g. PPL-2026-07 (Shipment Planning)' },
    { key: 'packageBreakdown', label: 'Planned Packages, Bag/Unit Wt & Containers', placeholder: 'e.g. 20,000 Bags x 50kg | Est. 50x20ft' },
    { key: 'weightCbm', label: 'Estimated Net Wt, Gross Wt & CBM', placeholder: 'e.g. Est. Net 1,000 MT | Gross 1,004 MT | CBM' },
  ],
  INSP_REQ: [
    { key: 'docRef', label: 'Inspection Request Ref & Date', placeholder: 'e.g. IR-2026-11 | 23 Nov 2026' },
    { key: 'inspectionAgency', label: 'Preferred Inspection Agency & Scope', placeholder: 'e.g. SGS / Quality, Moisture & Weight Check' },
    { key: 'deliverySchedule', label: 'Inspection Location / Port & Preferred Date', placeholder: 'e.g. Load Port / Mill Warehouse | Date window' },
  ],
  SI: [
    { key: 'docRef', label: 'Shipping Instructions Ref & Date', placeholder: 'e.g. SI-2026-23 | 23 Nov 2026' },
    { key: 'consigneeNotify', label: 'Consignee & Notify Party Details', placeholder: 'e.g. Consignee & Notify Party full details' },
    { key: 'blInstructions', label: 'Carrier, Container Count, Marks & BL Notes', placeholder: 'e.g. Marks, seal/container notes & BL release instructions' },
  ],
  CI: [
    { key: 'docRef', label: 'Commercial Invoice No. & Date', placeholder: 'e.g. CI-309 | 23 Nov 2026' },
    { key: 'blRef', label: 'BL / AWB Ref (Optional for Pre-shipment)', placeholder: 'e.g. Optional / BL-77412' },
    { key: 'consigneeNotify', label: 'Consignee & Notify Party', placeholder: 'e.g. Consignee & Notify Party details' },
    { key: 'bankDetails', label: 'Payment Terms, Bank Details & Declaration', placeholder: 'e.g. Payment terms, Bank/SWIFT & Exporter declaration' },
  ],
  PL: [
    { key: 'docRef', label: 'Final Packing List No., Date & Invoice Ref', placeholder: 'e.g. PL-309 | 23 Nov 2026 | Inv CI-309' },
    { key: 'containerSeal', label: 'Container No(s). & Seal No(s).', placeholder: 'e.g. Container Nos. & Seal Nos.' },
    { key: 'packageBreakdown', label: 'Package Count, Numbering (1-N) & Type', placeholder: 'e.g. Pkg 1-1000 | Bags/Cartons/Pallets' },
    { key: 'weightCbm', label: 'Per-Pkg & Total Net/Gross Wt, LxWxH & CBM', placeholder: 'e.g. Net Wt, Gross Wt, Dimensions, Total CBM & Marks' },
  ],
  NCNDA: [
    { key: 'docRef', label: 'NCNDA Ref & Effective Date', placeholder: 'e.g. NCNDA-2026-09 | 23 Nov 2026' },
    { key: 'protectionPeriod', label: 'Non-Circumvention & Confidentiality Term', placeholder: 'e.g. 24 Months; survival & termination terms' },
    { key: 'protectedScope', label: 'Protected Contacts, Mandate & Exceptions', placeholder: 'e.g. Disclosed buyers/sellers, confidential info & exceptions' },
    { key: 'governingLaw', label: 'Breach Remedies, Governing Law & Arbitration', placeholder: 'e.g. Remedies, law & arbitration (Legal review advised)' },
  ],
  IMFPA: [
    { key: 'docRef', label: 'IMFPA Ref, Date & Linked Contract/PO', placeholder: 'e.g. IMFPA-2026-14 | 23 Nov 2026 | Ref PO/Contract' },
    { key: 'beneficiarySchedule', label: 'Beneficiary / Intermediary & Fee / Share', placeholder: 'e.g. Intermediary name, % or rate/unit & payment share' },
    { key: 'paymentTrigger', label: 'Payment Trigger, Tranches, Due Date & Bank/SWIFT', placeholder: 'e.g. Trigger, tranches, due date & Bank/IBAN/SWIFT' },
    { key: 'governingLaw', label: 'Tax / Withholding, Breach & Governing Law', placeholder: 'e.g. Tax responsibility, default & governing law' },
  ],
};

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const parseNum = (val) => {
  const cleaned = String(val || '').replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (num, currency = 'USD') => {
  const fixed = Number(num || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${fixed}`;
};

export default function DocForgeMakerScreen({ onBack }) {
  const [docType, setDocType] = useState('QUOTE');
  const [docStatus, setDocStatus] = useState('Draft');
  const [tradeMode, setTradeMode] = useState('International / Export');
  const [linkedRef, setLinkedRef] = useState('');

  // PO interactive selections
  const [poPaymentChoice, setPoPaymentChoice] = useState('LC at Sight');
  const [poDeliveryChoice, setPoDeliveryChoice] = useState('LR / Bilty against Dispatch');

  // Common Data Engine
  const [commonData, setCommonData] = useState({
    sellerName: 'UA EXIM Overseas',
    sellerAddress: 'Raipur, Chhattisgarh, India | IEC / GSTIN',
    sellerContact: 'export@tradesetuu.example',
    buyerName: 'Dakar Global Foods',
    buyerAddress: 'Dakar, Senegal | Buyer / Importer Details',
    buyerContact: 'procurement@buyer.example',
    commodity: 'Non-Basmati Parboiled Rice 5%',
    specs: 'Sortex clean, export quality, 50kg PP bags',
    hsCode: '10063020',
    origin: 'India',
    qty: '1000',
    unit: 'MT',
    unitPrice: '455',
    currency: 'USD',
    incoterms: 'FOB',
    portLoading: 'JNPT / Vizag',
    portDischarge: 'Dakar',
    destinationCountry: 'Senegal',
    freight: '0',
    insurance: '0',
    discount: '0',
    otherCharges: '0',
    signatoryName: 'Authorized Signatory',
    signatoryDesignation: 'Export Manager',
  });

  const [docSpecificByType, setDocSpecificByType] = useState({});
  const [previewText, setPreviewText] = useState('');
  const [savedPdfUri, setSavedPdfUri] = useState(null);
  const [savedPdfName, setSavedPdfName] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  // Verification / Auth controls (verified badge only shown when verification ID is provided)
  const [verifiedAuthEnabled, setVerifiedAuthEnabled] = useState(false);
  const [verificationRef, setVerificationRef] = useState('');

  const currentDocMeta = useMemo(
    () => DOC_TYPES.find((d) => d.key === docType) || DOC_TYPES[0],
    [docType]
  );

  const isDomestic = tradeMode === 'Domestic / Local';
  const specificFieldDefs = DOC_SPECIFIC_FIELDS[docType] || [];
  const currentSpecific = docSpecificByType[docType] || {};

  const calcSummary = useMemo(() => {
    const qtyNum = parseNum(commonData.qty);
    const rateNum = parseNum(commonData.unitPrice);
    const subtotal = qtyNum * rateNum;
    const freightNum = parseNum(commonData.freight);
    const insuranceNum = parseNum(commonData.insurance);
    const otherNum = parseNum(commonData.otherCharges);
    const discountNum = parseNum(commonData.discount);
    const grandTotal = subtotal + freightNum + insuranceNum + otherNum - discountNum;
    return {
      qtyNum,
      rateNum,
      subtotal,
      freightNum,
      insuranceNum,
      otherNum,
      discountNum,
      grandTotal,
    };
  }, [commonData]);

  const updateCommon = (key, val) => {
    setSavedPdfUri(null);
    setCommonData((prev) => ({ ...prev, [key]: val }));
  };

  const updateSpecific = (key, val) => {
    setSavedPdfUri(null);
    setDocSpecificByType((prev) => ({
      ...prev,
      [docType]: {
        ...(prev[docType] || {}),
        [key]: val,
      },
    }));
  };

  const handleConvertToDoc = (targetKey) => {
    const currentRef = (currentSpecific.docRef || '').trim();
    if (currentRef) {
      setLinkedRef(currentRef);
    }
    setDocType(targetKey);
    setPreviewText('');
    setSavedPdfUri(null);
  };

  const getPoTermsSummary = () => {
    const customPay = (currentSpecific.customPaymentNote || '').trim();
    const customDel = (currentSpecific.customDeliveryNote || '').trim();
    const payPart = customPay ? `${poPaymentChoice} (${customPay})` : poPaymentChoice;
    const delPart = isDomestic
      ? customDel
        ? `${poDeliveryChoice} (${customDel})`
        : poDeliveryChoice
      : `Incoterm 2020: ${commonData.incoterms}${customDel ? ` | ${customDel}` : ''}`;
    return `Payment: ${payPart} | Dispatch/Terms: ${delPart}`;
  };

  const getAuthText = () => {
    const refTrim = (verificationRef || '').trim();
    if (verifiedAuthEnabled && refTrim.length > 0) {
      return `Verified Reference: ${refTrim}`;
    }
    if (verifiedAuthEnabled && refTrim.length === 0) {
      return `Verification ID pending — enter valid reference ID`;
    }
    return `Signatory: ${(commonData.signatoryName || 'Authorized Signatory').trim()} (${(commonData.signatoryDesignation || 'Authorized Signatory').trim()})`;
  };

  const buildDraftText = () => {
    const showCommercialBlock =
      currentDocMeta.category === 'commercial' ||
      currentDocMeta.category === 'po' ||
      currentDocMeta.category === 'contract' ||
      currentDocMeta.category === 'intent';

    const showLogisticsBlock = currentDocMeta.category === 'logistics';

    const lines = [
      `=== ${currentDocMeta.fullName.toUpperCase()} (${docType}) ===`,
      `Status: ${docStatus} | Mode: ${tradeMode}`,
      `Doc Ref: ${(currentSpecific.docRef || '').trim() || '—'}`,
      linkedRef ? `Linked Ref: ${linkedRef}` : null,
      `Party 1 / Seller: ${(commonData.sellerName || '').trim() || '—'} (${(commonData.sellerAddress || '').trim() || '—'})`,
      `Party 2 / Buyer: ${(commonData.buyerName || '').trim() || '—'} (${(commonData.buyerAddress || '').trim() || '—'})`,
      showCommercialBlock
        ? `Commodity: ${(commonData.commodity || '').trim() || '—'} | Specs: ${(commonData.specs || '').trim() || '—'}`
        : null,
      showCommercialBlock
        ? `HS Code: ${(commonData.hsCode || '').trim() || '—'} | Origin: ${(commonData.origin || '').trim() || '—'}`
        : null,
      showCommercialBlock
        ? `Qty & Rate: ${calcSummary.qtyNum} ${commonData.unit} @ ${formatMoney(calcSummary.rateNum, commonData.currency)} / ${commonData.unit} | Total: ${formatMoney(calcSummary.grandTotal, commonData.currency)}`
        : null,
      showCommercialBlock || showLogisticsBlock
        ? `Incoterms 2020: ${commonData.incoterms} | Route: ${(commonData.portLoading || '').trim() || '—'} -> ${(commonData.portDischarge || '').trim() || '—'} (${(commonData.destinationCountry || '').trim() || '—'})`
        : null,
      docType === 'PO' ? getPoTermsSummary() : null,
      docType === 'PO'
        ? `Vendor Acceptance: ${(currentSpecific.vendorAcceptanceStatus || 'Pending Confirmation').trim()} | ${(currentSpecific.vendorConfirmedBy || 'Awaiting signature / date').trim()}`
        : null,
      ...specificFieldDefs.map(
        (f) => `${f.label}: ${(currentSpecific[f.key] || '').trim() || '—'}`
      ),
      getAuthText(),
      'Generated via DocForge Maker — Trade SETUU',
    ].filter(Boolean);

    return lines.join('\n');
  };

  const buildA4Html = () => {
    const specificRows = specificFieldDefs
      .map(
        (f) => `
        <tr>
          <th>${escapeHtml(f.label)}</th>
          <td>${escapeHtml((currentSpecific[f.key] || '').trim() || '—')}</td>
        </tr>`
      )
      .join('');

    const showCommercialSection =
      currentDocMeta.category === 'commercial' ||
      currentDocMeta.category === 'po' ||
      currentDocMeta.category === 'contract' ||
      currentDocMeta.category === 'intent';

    const poBlockHtml =
      docType === 'PO'
        ? `<div class="notice">
            <strong>PO Terms & Vendor Acceptance:</strong><br/>
            ${escapeHtml(getPoTermsSummary())}<br/>
            <strong>Vendor Acknowledgment:</strong> ${escapeHtml((currentSpecific.vendorAcceptanceStatus || 'Pending Confirmation').trim())} — ${escapeHtml((currentSpecific.vendorConfirmedBy || 'Awaiting signature / stamp / date').trim())}
          </div>`
        : '';

    const complianceNotice =
      docType === 'SALES_CONTRACT' || docType === 'NCNDA' || docType === 'IMFPA'
        ? `<div class="notice"><strong>Legal Note:</strong> Terms, Incoterms 2020, and governing/dispute clauses should be reviewed by a qualified trade legal advisor before final execution.</div>`
        : docType === 'PPL' || docType === 'PL' || docType === 'INSP_REQ' || docType === 'SI'
        ? `<div class="notice"><strong>Operational Note:</strong> Proforma Packing List (PPL) and Final Packing List (PL) are separate records. Do not substitute mandatory official government, carrier, or inspection forms unless officially accepted.</div>`
        : '';

    const hasVerifiedId = verifiedAuthEnabled && (verificationRef || '').trim().length > 0;
    const authBadgeHtml = hasVerifiedId
      ? `<span class="badge verified">VERIFIED REF: ${escapeHtml(verificationRef.trim())}</span>`
      : `<span class="badge plain">SIGNATORY: ${escapeHtml(commonData.signatoryName || 'Authorized Signatory')}</span>`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 15mm; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              font-size: 11.5px;
              line-height: 1.45;
              margin: 0;
              padding: 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .brand { font-size: 17px; font-weight: bold; }
            .muted { font-size: 10.5px; color: #475569; }
            .title-right { text-align: right; }
            .doc-title { font-size: 15px; font-weight: bold; color: #0f766e; }
            .grid-2 {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              margin-bottom: 12px;
            }
            .party-card {
              flex: 1;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 8px 10px;
              background: #f8fafc;
            }
            .party-title { font-weight: bold; font-size: 11px; color: #1e293b; margin-bottom: 4px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
            th { background: #f1f5f9; width: 34%; font-weight: bold; }
            .num { text-align: right; }
            .totals-box {
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 8px 10px;
              margin-bottom: 12px;
              background: #ffffff;
            }
            .total-line { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .grand { font-weight: bold; font-size: 12.5px; border-top: 1px solid #cbd5e1; padding-top: 5px; margin-top: 4px; }
            .notice {
              background: #fffbeb;
              border: 1px solid #fde68a;
              color: #78350f;
              padding: 8px 10px;
              border-radius: 6px;
              font-size: 10.5px;
              margin-bottom: 12px;
            }
            .footer-auth {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 1px dashed #94a3b8;
              padding-top: 10px;
              margin-top: 12px;
              page-break-inside: avoid;
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
            }
            .verified { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
            .plain { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
            .bottom-note {
              margin-top: 14px;
              font-size: 10px;
              color: #64748b;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">Trade SETUU — DocForge</div>
              <div class="muted">${escapeHtml(tradeMode)} | Status: ${escapeHtml(docStatus)}</div>
              ${linkedRef ? `<div class="muted">Linked Ref: ${escapeHtml(linkedRef)}</div>` : ''}
            </div>
            <div class="title-right">
              <div class="doc-title">${escapeHtml(currentDocMeta.fullName)} (${escapeHtml(docType)})</div>
              <div class="muted">Ref: ${escapeHtml((currentSpecific.docRef || '').trim() || '—')}</div>
              <div class="muted">Incoterms 2020: ${escapeHtml(commonData.incoterms)} | Currency: ${escapeHtml(commonData.currency)}</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="party-card">
              <div class="party-title">First Party / Seller / Exporter</div>
              <div><strong>${escapeHtml(commonData.sellerName || '—')}</strong></div>
              <div class="muted">${escapeHtml(commonData.sellerAddress || '—')}</div>
              <div class="muted">${escapeHtml(commonData.sellerContact || '')}</div>
            </div>
            <div class="party-card">
              <div class="party-title">Counterparty / Buyer / Importer</div>
              <div><strong>${escapeHtml(commonData.buyerName || '—')}</strong></div>
              <div class="muted">${escapeHtml(commonData.buyerAddress || '—')}</div>
              <div class="muted">${escapeHtml(commonData.buyerContact || '')}</div>
            </div>
          </div>

          ${
            showCommercialSection
              ? `
          <table>
            <thead>
              <tr>
                <th>Commodity & Specs</th>
                <th>HS Code / Origin</th>
                <th class="num">Qty & Unit</th>
                <th class="num">Unit Price</th>
                <th class="num">Line Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${escapeHtml(commonData.commodity || '—')}</strong><br/>
                  <span class="muted">${escapeHtml(commonData.specs || '')}</span>
                </td>
                <td>
                  ${escapeHtml(commonData.hsCode || '—')}<br/>
                  <span class="muted">Origin: ${escapeHtml(commonData.origin || '—')}</span>
                </td>
                <td class="num">${escapeHtml(`${calcSummary.qtyNum} ${commonData.unit}`)}</td>
                <td class="num">${escapeHtml(formatMoney(calcSummary.rateNum, commonData.currency))}</td>
                <td class="num">${escapeHtml(formatMoney(calcSummary.subtotal, commonData.currency))}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-box">
            <div class="total-line"><span>Subtotal</span><span>${escapeHtml(formatMoney(calcSummary.subtotal, commonData.currency))}</span></div>
            <div class="total-line"><span>Freight / Insurance / Other</span><span>${escapeHtml(formatMoney(calcSummary.freightNum + calcSummary.insuranceNum + calcSummary.otherNum, commonData.currency))}</span></div>
            <div class="total-line"><span>Discount</span><span>- ${escapeHtml(formatMoney(calcSummary.discountNum, commonData.currency))}</span></div>
            <div class="total-line grand"><span>Grand Total</span><span>${escapeHtml(formatMoney(calcSummary.grandTotal, commonData.currency))}</span></div>
            <div class="muted" style="margin-top:6px;">
              Route: ${escapeHtml(commonData.portLoading || '—')} → ${escapeHtml(commonData.portDischarge || '—')} (${escapeHtml(commonData.destinationCountry || '—')})
            </div>
          </div>`
              : ''
          }

          <table>
            <tbody>
              ${specificRows}
            </tbody>
          </table>

          ${poBlockHtml}
          ${complianceNotice}

          <div class="footer-auth">
            <div>${authBadgeHtml}</div>
            <div style="text-align:right;">
              <div><strong>${escapeHtml(commonData.signatoryName || 'Authorized Signatory')}</strong></div>
              <div class="muted">${escapeHtml(commonData.signatoryDesignation || '')}</div>
            </div>
          </div>

          <div class="bottom-note">Generated via DocForge Maker — Trade SETUU</div>
        </body>
      </html>
    `;
  };

  const handleBuildDraft = () => {
    setPreviewText(buildDraftText());
  };

  const createPdfFile = async () => {
    const { uri: tempUri } = await Print.printToFileAsync({
      html: buildA4Html(),
      width: 595,
      height: 842,
    });
    const cleanRef = ((currentSpecific.docRef || '').trim() || Date.now().toString()).replace(
      /[^a-zA-Z0-9_-]/g,
      '_'
    );
    const fileName = `DocForge_${docType}_${docStatus}_${cleanRef}.pdf`;
    const targetUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.copyAsync({ from: tempUri, to: targetUri });
    setSavedPdfUri(targetUri);
    setSavedPdfName(fileName);
    return { uri: targetUri, fileName };
  };

  const handleShare = async () => {
    const draft = buildDraftText();
    setPreviewText(draft);
    try {
      setIsBusy(true);
      let uri = savedPdfUri;
      if (!uri) {
        const res = await createPdfFile();
        uri = res.uri;
      }
      const canShare = await Sharing.isAvailableAsync();
      if (canShare && uri) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${docType}`,
          UTI: 'com.adobe.pdf',
        });
        return;
      }
      await Share.share({ message: draft });
    } catch (e) {
      Alert.alert('Share Error', e?.message || 'Unable to share document.');
    } finally {
      setIsBusy(false);
    }
  };

  const handlePrint = async () => {
    const draft = buildDraftText();
    setPreviewText(draft);
    try {
      setIsBusy(true);
      await Print.printAsync({
        html: buildA4Html(),
      });
    } catch (e) {
      Alert.alert('Print Error', e?.message || 'Unable to open printer dialog.');
    } finally {
      setIsBusy(false);
    }
  };

  const showCommercialInputs =
    currentDocMeta.category === 'commercial' ||
    currentDocMeta.category === 'po' ||
    currentDocMeta.category === 'contract' ||
    currentDocMeta.category === 'intent';

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
        <Text style={styles.headerTitle}>DocForge Engine</Text>
        <Text style={styles.headerBadge}>{docType}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subCaption}>
          14 Trade Templates • Common Data • {docStatus}
        </Text>

        {/* 14 Document Type Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
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
                <Text style={[styles.docTabCode, active && styles.docTabCodeActive]}>{item.label}</Text>
                <Text style={[styles.docTabSub, active && styles.docTabSubActive]} numberOfLines={1}>
                  {item.fullName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Status, Trade Mode & Link */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>
            {currentDocMeta.fullName} ({docType})
          </Text>

          <Text style={styles.fieldLabel}>Lifecycle Status</Text>
          <View style={styles.chipRow}>
            {LIFECYCLE_STATUSES.map((st) => {
              const active = docStatus === st;
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => {
                    setDocStatus(st);
                    setSavedPdfUri(null);
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{st}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Trade Mode</Text>
          <View style={styles.chipRow}>
            {TRADE_MODES.map((tm) => {
              const active = tradeMode === tm;
              return (
                <TouchableOpacity
                  key={tm}
                  onPress={() => {
                    setTradeMode(tm);
                    setPoPaymentChoice(
                      tm === 'Domestic / Local' ? PO_DOMESTIC_PAYMENT_OPTIONS[0] : PO_INTL_PAYMENT_OPTIONS[0]
                    );
                    setSavedPdfUri(null);
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{tm}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Linked Reference (e.g. Parent PI / Quote / PO No.)</Text>
          <TextInput
            value={linkedRef}
            onChangeText={(txt) => {
              setLinkedRef(txt);
              setSavedPdfUri(null);
            }}
            placeholder="e.g. PI-2026-104"
            placeholderTextColor="#64748B"
            style={styles.input}
          />
        </View>

        {/* Parties */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Parties Details</Text>

          <Text style={styles.fieldLabel}>First Party / Seller / Exporter Name</Text>
          <TextInput
            value={commonData.sellerName}
            onChangeText={(t) => updateCommon('sellerName', t)}
            placeholder="Seller / Exporter Name"
            placeholderTextColor="#64748B"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Seller Address & IEC / GSTIN</Text>
          <TextInput
            value={commonData.sellerAddress}
            onChangeText={(t) => updateCommon('sellerAddress', t)}
            placeholder="Full address, country, IEC / GSTIN"
            placeholderTextColor="#64748B"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Counterparty / Buyer / Importer Name</Text>
          <TextInput
            value={commonData.buyerName}
            onChangeText={(t) => updateCommon('buyerName', t)}
            placeholder="Buyer / Counterparty Name"
            placeholderTextColor="#64748B"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Buyer Address & Tax / Registration ID</Text>
          <TextInput
            value={commonData.buyerAddress}
            onChangeText={(t) => updateCommon('buyerAddress', t)}
            placeholder="Full address, country, tax / reg ID"
            placeholderTextColor="#64748B"
            style={styles.input}
          />
        </View>

        {/* Commercial / Commodity Block (shown for commercial, PO, contract, intent docs) */}
        {showCommercialInputs ? (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Commodity, Pricing & Route (Auto-Calc)</Text>

            <Text style={styles.fieldLabel}>Commodity / Item</Text>
            <TextInput
              value={commonData.commodity}
              onChangeText={(t) => updateCommon('commodity', t)}
              placeholder="Commodity / Product name"
              placeholderTextColor="#64748B"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Grade / Specifications</Text>
            <TextInput
              value={commonData.specs}
              onChangeText={(t) => updateCommon('specs', t)}
              placeholder="Grade, specs, packing details"
              placeholderTextColor="#64748B"
              style={styles.input}
            />

            <View style={styles.row2}>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>HS / HSN Code</Text>
                <TextInput
                  value={commonData.hsCode}
                  onChangeText={(t) => updateCommon('hsCode', t)}
                  placeholder="e.g. 10063020"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>Origin</Text>
                <TextInput
                  value={commonData.origin}
                  onChangeText={(t) => updateCommon('origin', t)}
                  placeholder="e.g. India"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Currency</Text>
            <View style={styles.chipRow}>
              {CURRENCIES.map((cur) => {
                const active = commonData.currency === cur;
                return (
                  <TouchableOpacity
                    key={cur}
                    onPress={() => updateCommon('currency', cur)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{cur}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Unit</Text>
            <View style={styles.chipRow}>
              {UNITS.map((u) => {
                const active = commonData.unit === u;
                return (
                  <TouchableOpacity
                    key={u}
                    onPress={() => updateCommon('unit', u)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row2}>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>Quantity</Text>
                <TextInput
                  value={commonData.qty}
                  onChangeText={(t) => updateCommon('qty', t)}
                  keyboardType="numeric"
                  placeholder="1000"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>Unit Price ({commonData.currency})</Text>
                <TextInput
                  value={commonData.unitPrice}
                  onChangeText={(t) => updateCommon('unitPrice', t)}
                  keyboardType="numeric"
                  placeholder="455"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.row2}>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>Freight / Insurance / Other</Text>
                <TextInput
                  value={commonData.freight}
                  onChangeText={(t) => updateCommon('freight', t)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>Discount</Text>
                <TextInput
                  value={commonData.discount}
                  onChangeText={(t) => updateCommon('discount', t)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.calcBox}>
              <Text style={styles.calcText}>
                Subtotal: {formatMoney(calcSummary.subtotal, commonData.currency)}
              </Text>
              <Text style={styles.calcGrand}>
                Grand Total: {formatMoney(calcSummary.grandTotal, commonData.currency)}
              </Text>
            </View>

            <Text style={styles.fieldLabel}>Incoterms 2020</Text>
            <View style={styles.chipRow}>
              {INCOTERMS_2020.map((inc) => {
                const active = commonData.incoterms === inc;
                return (
                  <TouchableOpacity
                    key={inc}
                    onPress={() => updateCommon('incoterms', inc)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{inc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row2}>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>Port / Origin Point</Text>
                <TextInput
                  value={commonData.portLoading}
                  onChangeText={(t) => updateCommon('portLoading', t)}
                  placeholder="e.g. JNPT / Vizag"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>Port / Destination</Text>
                <TextInput
                  value={commonData.portDischarge}
                  onChangeText={(t) => updateCommon('portDischarge', t)}
                  placeholder="e.g. Dakar"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                />
              </View>
            </View>
          </View>
        ) : null}

        {/* PO Clickable Terms Selector (Domestic LR vs International LC / Incoterms) */}
        {docType === 'PO' ? (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>
              PO Terms ({isDomestic ? 'Domestic / LR' : 'International / LC & Incoterms 2020'})
            </Text>

            <Text style={styles.fieldLabel}>Select Payment Terms</Text>
            <View style={styles.chipRow}>
              {(isDomestic ? PO_DOMESTIC_PAYMENT_OPTIONS : PO_INTL_PAYMENT_OPTIONS).map((opt) => {
                const active = poPaymentChoice === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => {
                      setPoPaymentChoice(opt);
                      setSavedPdfUri(null);
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isDomestic ? (
              <>
                <Text style={styles.fieldLabel}>Select Domestic Dispatch / LR Terms</Text>
                <View style={styles.chipRow}>
                  {PO_DOMESTIC_DELIVERY_OPTIONS.map((opt) => {
                    const active = poDeliveryChoice === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => {
                          setPoDeliveryChoice(opt);
                          setSavedPdfUri(null);
                        }}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Select Incoterms 2020</Text>
                <View style={styles.chipRow}>
                  {INCOTERMS_2020.map((inc) => {
                    const active = commonData.incoterms === inc;
                    return (
                      <TouchableOpacity
                        key={inc}
                        onPress={() => updateCommon('incoterms', inc)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{inc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        ) : null}

        {/* Document-Specific Fields */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>{docType} Specific Fields</Text>
          {specificFieldDefs.map((f) => (
            <View key={f.key} style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput
                value={currentSpecific[f.key] || ''}
                onChangeText={(txt) => updateSpecific(f.key, txt)}
                placeholder={f.placeholder}
                placeholderTextColor="#64748B"
                style={styles.input}
              />
            </View>
          ))}
        </View>

        {/* Signatory & Reference */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Signatory & Reference</Text>
          <Text style={styles.fieldLabel}>Authorized Signatory Name</Text>
          <TextInput
            value={commonData.signatoryName}
            onChangeText={(t) => updateCommon('signatoryName', t)}
            placeholder="Signatory Name"
            placeholderTextColor="#64748B"
            style={styles.input}
          />
          <Text style={styles.fieldLabel}>Designation</Text>
          <TextInput
            value={commonData.signatoryDesignation}
            onChangeText={(t) => updateCommon('signatoryDesignation', t)}
            placeholder="e.g. Export Manager"
            placeholderTextColor="#64748B"
            style={styles.input}
          />

          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Attach Verification / Certificate Ref ID</Text>
            <Switch
              value={verifiedAuthEnabled}
              onValueChange={(v) => {
                setVerifiedAuthEnabled(v);
                setSavedPdfUri(null);
              }}
              trackColor={{ false: '#1E293B', true: '#0F766E' }}
              thumbColor={verifiedAuthEnabled ? '#2DD4BF' : '#94A3B8'}
            />
          </View>

          {verifiedAuthEnabled ? (
            <>
              <Text style={styles.fieldLabel}>Verification / Certificate ID</Text>
              <TextInput
                value={verificationRef}
                onChangeText={(t) => {
                  setVerificationRef(t);
                  setSavedPdfUri(null);
                }}
                placeholder="Enter certificate / verification ID"
                placeholderTextColor="#64748B"
                style={styles.input}
              />
            </>
          ) : null}
        </View>

        {/* Convert / Carry Data To */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Convert / Carry Data To</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['PI', 'SALES_CONTRACT', 'PO', 'PPL', 'INSP_REQ', 'SI', 'CI', 'PL', 'SCO', 'FCO'].map(
              (target) =>
                target !== docType ? (
                  <TouchableOpacity
                    key={target}
                    onPress={() => handleConvertToDoc(target)}
                    style={styles.convertPill}
                  >
                    <Text style={styles.convertPillText}>→ {target}</Text>
                  </TouchableOpacity>
                ) : null
            )}
          </ScrollView>
        </View>

        {/* Bottom Action Buttons: Build Draft, Share, Print */}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={handleBuildDraft} style={styles.buildBtn}>
            <Text style={styles.buildBtnText}>Build Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} disabled={isBusy} style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePrint} disabled={isBusy} style={styles.printBtn}>
            <Text style={styles.printBtnText}>Print</Text>
          </TouchableOpacity>
        </View>

        {savedPdfName ? <Text style={styles.savedNote}>PDF Ready: {savedPdfName}</Text> : null}

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
  root: { flex: 1, backgroundColor: '#050811' },
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
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backText: { color: '#2DD4BF', fontSize: 13.5, fontWeight: '700' },
  backPlaceholder: { width: 48 },
  headerTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '800' },
  headerBadge: {
    color: '#F3D27A',
    fontSize: 11.5,
    fontWeight: '900',
    backgroundColor: 'rgba(243, 210, 122, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scrollContent: { padding: 14, paddingBottom: 40 },
  subCaption: { color: '#94A3B8', fontSize: 12, marginBottom: 10 },
  tabsRow: { paddingBottom: 12 },
  docTab: {
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 145,
  },
  docTabActive: { backgroundColor: 'rgba(45, 212, 191, 0.15)', borderColor: '#2DD4BF' },
  docTabCode: { color: '#F8FAFC', fontSize: 12.5, fontWeight: '900' },
  docTabCodeActive: { color: '#2DD4BF' },
  docTabSub: { color: '#64748B', fontSize: 10, marginTop: 1 },
  docTabSubActive: { color: '#CBD5E1' },
  card: {
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardHeading: { color: '#F3D27A', fontSize: 14.5, fontWeight: '800', marginBottom: 10 },
  fieldBlock: { marginBottom: 10 },
  fieldLabel: { color: '#CBD5E1', fontSize: 12, fontWeight: '700', marginBottom: 5, marginTop: 4 },
  input: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    color: '#F8FAFC',
    fontSize: 13,
    marginBottom: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: 'rgba(45, 212, 191, 0.16)', borderColor: '#2DD4BF' },
  chipText: { color: '#94A3B8', fontSize: 11.5, fontWeight: '700' },
  chipTextActive: { color: '#2DD4BF' },
  row2: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  halfCol: { flex: 1 },
  calcBox: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  calcText: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  calcGrand: { color: '#2DD4BF', fontSize: 13.5, fontWeight: '900', marginTop: 3 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 6,
  },
  convertPill: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
  },
  convertPillText: { color: '#F3D27A', fontSize: 11.5, fontWeight: '800' },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  buildBtn: {
    flex: 1.2,
    backgroundColor: '#2DD4BF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buildBtnText: { color: '#050811', fontSize: 13, fontWeight: '900' },
  shareBtn: {
    flex: 1,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#F3D27A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareBtnText: { color: '#F3D27A', fontSize: 13, fontWeight: '800' },
  printBtn: {
    flex: 1,
    backgroundColor: '#134E4A',
    borderWidth: 1,
    borderColor: '#2DD4BF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  printBtnText: { color: '#2DD4BF', fontSize: 13, fontWeight: '800' },
  savedNote: { color: '#2DD4BF', fontSize: 11.5, fontWeight: '700', marginTop: 10 },
  previewCard: {
    marginTop: 14,
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.35)',
    borderRadius: 14,
    padding: 14,
  },
  previewTitle: { color: '#2DD4BF', fontSize: 13.5, fontWeight: '800', marginBottom: 8 },
  previewBody: { color: '#E2E8F0', fontSize: 12, lineHeight: 18.5 },
});
