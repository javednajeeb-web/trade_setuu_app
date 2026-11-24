import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';

const ALL_COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', currency: 'AFN', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'AL', name: 'Albania', currency: 'ALL', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'DZ', name: 'Algeria', currency: 'DZD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'AD', name: 'Andorra', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'AO', name: 'Angola', currency: 'AOA', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.25 },
  { code: 'AR', name: 'Argentina', currency: 'ARS', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.28 },
  { code: 'AM', name: 'Armenia', currency: 'AMD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'AU', name: 'Australia', currency: 'AUD', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.3 },
  { code: 'AT', name: 'Austria', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'AZ', name: 'Azerbaijan', currency: 'AZN', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'BH', name: 'Bahrain', currency: 'BHD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.16 },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.08 },
  { code: 'BY', name: 'Belarus', currency: 'BYN', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'BE', name: 'Belgium', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'BJ', name: 'Benin', currency: 'XOF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'BT', name: 'Bhutan', currency: 'BTN', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.05 },
  { code: 'BO', name: 'Bolivia', currency: 'BOB', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.26 },
  { code: 'BA', name: 'Bosnia and Herzegovina', currency: 'BAM', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'BW', name: 'Botswana', currency: 'BWP', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'BR', name: 'Brazil', currency: 'BRL', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.26 },
  { code: 'BN', name: 'Brunei', currency: 'BND', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'BG', name: 'Bulgaria', currency: 'BGN', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'BF', name: 'Burkina Faso', currency: 'XOF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.25 },
  { code: 'KH', name: 'Cambodia', currency: 'KHR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.12 },
  { code: 'CM', name: 'Cameroon', currency: 'XAF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'CA', name: 'Canada', currency: 'CAD', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.3 },
  { code: 'CL', name: 'Chile', currency: 'CLP', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.25 },
  { code: 'CN', name: 'China', currency: 'CNY', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.12 },
  { code: 'CO', name: 'Colombia', currency: 'COP', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'CR', name: 'Costa Rica', currency: 'CRC', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'HR', name: 'Croatia', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'CY', name: 'Cyprus', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'CZ', name: 'Czechia', currency: 'CZK', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'DK', name: 'Denmark', currency: 'DKK', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'DJ', name: 'Djibouti', currency: 'DJF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'DO', name: 'Dominican Republic', currency: 'DOP', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'EC', name: 'Ecuador', currency: 'USD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'EG', name: 'Egypt', currency: 'EGP', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'EE', name: 'Estonia', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'FI', name: 'Finland', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'FR', name: 'France', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'GA', name: 'Gabon', currency: 'XAF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'GM', name: 'Gambia', currency: 'GMD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'GE', name: 'Georgia', currency: 'GEL', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'DE', name: 'Germany', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.25 },
  { code: 'GH', name: 'Ghana', currency: 'GHS', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'GR', name: 'Greece', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'GT', name: 'Guatemala', currency: 'GTQ', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'GN', name: 'Guinea', currency: 'GNF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'GY', name: 'Guyana', currency: 'GYD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'HN', name: 'Honduras', currency: 'HNL', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'HK', name: 'Hong Kong', currency: 'HKD', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'HU', name: 'Hungary', currency: 'HUF', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'IS', name: 'Iceland', currency: 'ISK', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.3 },
  { code: 'IN', name: 'India', currency: 'INR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.0 },
  { code: 'ID', name: 'Indonesia', currency: 'IDR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.12 },
  { code: 'IR', name: 'Iran', currency: 'IRR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'IQ', name: 'Iraq', currency: 'IQD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'IE', name: 'Ireland', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'IL', name: 'Israel', currency: 'ILS', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'IT', name: 'Italy', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'JM', name: 'Jamaica', currency: 'JMD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'JP', name: 'Japan', currency: 'JPY', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.26 },
  { code: 'JO', name: 'Jordan', currency: 'JOD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'KZ', name: 'Kazakhstan', currency: 'KZT', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'KE', name: 'Kenya', currency: 'KES', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'KW', name: 'Kuwait', currency: 'KWD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.16 },
  { code: 'KG', name: 'Kyrgyzstan', currency: 'KGS', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'LA', name: 'Laos', currency: 'LAK', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.15 },
  { code: 'LV', name: 'Latvia', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'LB', name: 'Lebanon', currency: 'LBP', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'LY', name: 'Libya', currency: 'LYD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'LT', name: 'Lithuania', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'LU', name: 'Luxembourg', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'MG', name: 'Madagascar', currency: 'MGA', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.12 },
  { code: 'MV', name: 'Maldives', currency: 'MVR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'ML', name: 'Mali', currency: 'XOF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.25 },
  { code: 'MT', name: 'Malta', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'MR', name: 'Mauritania', currency: 'MRU', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'MU', name: 'Mauritius', currency: 'MUR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'MX', name: 'Mexico', currency: 'MXN', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'MD', name: 'Moldova', currency: 'MDL', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'MC', name: 'Monaco', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.25 },
  { code: 'MN', name: 'Mongolia', currency: 'MNT', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'ME', name: 'Montenegro', currency: 'EUR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'MA', name: 'Morocco', currency: 'MAD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'MZ', name: 'Mozambique', currency: 'MZN', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'MM', name: 'Myanmar', currency: 'MMK', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.15 },
  { code: 'NA', name: 'Namibia', currency: 'NAD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'NP', name: 'Nepal', currency: 'NPR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.06 },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.28 },
  { code: 'NI', name: 'Nicaragua', currency: 'NIO', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'NE', name: 'Niger', currency: 'XOF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.25 },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'NO', name: 'Norway', currency: 'NOK', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.28 },
  { code: 'OM', name: 'Oman', currency: 'OMR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.16 },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.12 },
  { code: 'PA', name: 'Panama', currency: 'PAB', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'PY', name: 'Paraguay', currency: 'PYG', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'PE', name: 'Peru', currency: 'PEN', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'PH', name: 'Philippines', currency: 'PHP', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.15 },
  { code: 'PL', name: 'Poland', currency: 'PLN', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'PT', name: 'Portugal', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'QA', name: 'Qatar', currency: 'QAR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.16 },
  { code: 'RO', name: 'Romania', currency: 'RON', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'RU', name: 'Russia', currency: 'RUB', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'SN', name: 'Senegal', currency: 'XOF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'RS', name: 'Serbia', currency: 'RSD', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'SL', name: 'Sierra Leone', currency: 'SLE', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'SG', name: 'Singapore', currency: 'SGD', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'SK', name: 'Slovakia', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'SI', name: 'Slovenia', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'KR', name: 'South Korea', currency: 'KRW', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'ES', name: 'Spain', currency: 'EUR', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.1 },
  { code: 'SE', name: 'Sweden', currency: 'SEK', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.25 },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.3 },
  { code: 'TW', name: 'Taiwan', currency: 'TWD', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'TJ', name: 'Tajikistan', currency: 'TJS', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'TH', name: 'Thailand', currency: 'THB', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.12 },
  { code: 'TG', name: 'Togo', currency: 'XOF', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'TN', name: 'Tunisia', currency: 'TND', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'TR', name: 'Turkey', currency: 'TRY', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'TM', name: 'Turkmenistan', currency: 'TMT', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'UG', name: 'Uganda', currency: 'UGX', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'UA', name: 'Ukraine', currency: 'UAH', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.2 },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.15 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', weightUnit: 'KG', dimUnit: 'CM', regionFactor: 1.28 },
  { code: 'US', name: 'United States', currency: 'USD', weightUnit: 'LB', dimUnit: 'IN', regionFactor: 1.35 },
  { code: 'UY', name: 'Uruguay', currency: 'UYU', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.24 },
  { code: 'UZ', name: 'Uzbekistan', currency: 'UZS', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.18 },
  { code: 'VE', name: 'Venezuela', currency: 'VES', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.25 },
  { code: 'VN', name: 'Vietnam', currency: 'VND', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.08 },
  { code: 'ZM', name: 'Zambia', currency: 'ZMW', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.22 },
  { code: 'ZW', name: 'Zimbabwe', currency: 'ZWL', weightUnit: 'MT', dimUnit: 'CM', regionFactor: 1.25 },
];

const CURRENCY_LIST = [
  'INR', 'USD', 'AED', 'EUR', 'GBP', 'SGD', 'SAR', 'CNY', 'JPY', 'AUD',
  'CAD', 'CHF', 'QAR', 'KWD', 'OMR', 'BHD', 'MYR', 'THB', 'VND', 'IDR',
  'KRW', 'ZAR', 'NGN', 'KES', 'EGP', 'BDT', 'LKR', 'NPR', 'BRL', 'MXN',
];

const FX_TO_INR = {
  INR: 1,
  USD: 92.65,
  AED: 25.23,
  EUR: 100.4,
  GBP: 117.5,
  SGD: 69.1,
  SAR: 24.7,
  CNY: 12.8,
  JPY: 0.61,
  AUD: 60.2,
  CAD: 66.4,
  CHF: 104.5,
  QAR: 25.45,
  KWD: 301.0,
  OMR: 240.6,
  BHD: 245.8,
  MYR: 20.8,
  THB: 2.68,
  VND: 0.0036,
  IDR: 0.0058,
  KRW: 0.067,
  ZAR: 5.15,
  NGN: 0.056,
  KES: 0.72,
  EGP: 1.88,
  BDT: 0.78,
  LKR: 0.31,
  NPR: 0.625,
  BRL: 16.2,
  MXN: 4.55,
};

const PORTS_LIST = [
  'Nhava Sheva (INNSA) — India',
  'Mundra (INMUN) — India',
  'Visakhapatnam (INVTZ) — India',
  'Kakinada (INKAK) — India',
  'Chennai (INMAA) — India',
  'Jebel Ali (AEJEA) — UAE',
  'Khalifa Port (AUH) — UAE',
  'Rotterdam (NLRTM) — Netherlands',
  'PSA Singapore (SGSIN) — Singapore',
  'Hamburg (DEHAM) — Germany',
  'Los Angeles (USLAX) — USA',
  'Savannah (USSAV) — USA',
  'Felixstowe (GBFXT) — UK',
  'Jeddah Islamic Port (SAJED) — Saudi Arabia',
  'Shanghai (CNSHA) — China',
  'Ho Chi Minh (VNSGN) — Vietnam',
  'Port of Dakar (SNDKR) — Senegal',
  'Port of Banjul (GM BJL) — Gambia',
];

const AIRPORTS_LIST = [
  'DEL — New Delhi, India',
  'BOM — Mumbai, India',
  'BLR — Bengaluru, India',
  'HYD — Hyderabad, India',
  'DXB — Dubai, UAE',
  'AUH — Abu Dhabi, UAE',
  'FRA — Frankfurt, Germany',
  'SIN — Singapore',
  'LHR — London Heathrow, UK',
  'JFK — New York, USA',
];

const INCOTERMS_LIST = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];

const FLEET_OPTIONS = [
  { id: 'mini', label: 'Mini Truck (1–3 MT)', baseInr: 4500, perKmInr: 22 },
  { id: 'lcv', label: 'LCV (3–7 MT)', baseInr: 8500, perKmInr: 32 },
  { id: '6w', label: '6-Wheeler (7–10 MT)', baseInr: 13000, perKmInr: 42 },
  { id: '10w', label: '10-Wheeler (15–16 MT)', baseInr: 19500, perKmInr: 55 },
  { id: '16w', label: '16-Wheeler (18–21 MT)', baseInr: 25000, perKmInr: 68 },
  { id: '22w', label: '22-Wheeler Multi-Axle (25–35 MT)', baseInr: 34000, perKmInr: 88 },
  { id: 'rail', label: 'Rail / Bulk Rake', baseInr: 48000, perKmInr: 72 },
];

const LOAD_MODES = ['FTL', 'PTL', 'Container', 'Reefer', 'Rail'];
const WEIGHT_UNITS = ['MT', 'KG', 'LB'];

function formatMoney(inrAmount, targetCurrency) {
  const rate = FX_TO_INR[targetCurrency] || 1;
  const val = inrAmount / rate;
  if (targetCurrency === 'INR') {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  }
  return `${targetCurrency} ${val.toFixed(2)}`;
}

export default function GlobalLogisticsHub({ theme = 'dark' }) {
  const isDark = theme === 'dark';

  // Refined Navy-Teal-Amber palette (low glare, clean hierarchy)
  const C = {
    bg: isDark ? '#071521' : '#F3F5F8',
    card: isDark ? '#102738' : '#FFFFFF',
    cardAlt: isDark ? '#0C1E2C' : '#F8FAFC',
    border: isDark ? '#1E3E54' : '#E2E8F0',
    text: isDark ? '#DCE8EF' : '#0F172A',
    sub: isDark ? '#8FAAC0' : '#64748B',
    teal: '#20C8C1',
    amber: '#F59E0B',
    pill: isDark ? '#15344A' : '#E2E8F0',
  };

  // Active Screen: null (Hub), 'inland', 'ocean', 'air', 'sample', 'requests'
  const [activeScreen, setActiveScreen] = useState(null);

  // Country & History + Independent Currency / Unit Controls
  const [recentCodes, setRecentCodes] = useState(['IN', 'AE', 'US']);
  const [selectedCountry, setSelectedCountry] = useState(
    ALL_COUNTRIES.find((c) => c.code === 'IN') || ALL_COUNTRIES[0]
  );
  const [txCurrency, setTxCurrency] = useState('INR');
  const [dispCurrency, setDispCurrency] = useState('INR');
  const [weightUnit, setWeightUnit] = useState('MT');
  const [dimUnit, setDimUnit] = useState('CM');

  // Searchable Dropdown Modal State:
  // type: 'country' | 'txCur' | 'dispCur' | 'originPort' | 'destPort' | 'originAir' | 'destAir' | 'incoterm' | null
  const [pickerType, setPickerType] = useState(null);
  const [pickerSearch, setPickerSearch] = useState('');

  // Inland State
  const [inlandMode, setInlandMode] = useState('normal'); // 'normal' | 'backhaul'
  const [loadMode, setLoadMode] = useState('FTL');
  const [pickupLoc, setPickupLoc] = useState('');
  const [deliveryLoc, setDeliveryLoc] = useState('');
  const [distanceKm, setDistanceKm] = useState('450');
  const [inlandCargo, setInlandCargo] = useState('');
  const [inlandWeight, setInlandWeight] = useState('20');
  const [showVehicleOptions, setShowVehicleOptions] = useState(false);
  const [selectedFleetId, setSelectedFleetId] = useState('22w');
  const [showIndicativeRates, setShowIndicativeRates] = useState(false);

  // Ocean State
  const [originPort, setOriginPort] = useState(PORTS_LIST[0]);
  const [destPort, setDestPort] = useState(PORTS_LIST[5]);
  const [oceanType, setOceanType] = useState('FCL'); // 'FCL' | 'LCL' | 'Bulk'
  const [containerSize, setContainerSize] = useState('40 ft');
  const [incoterm, setIncoterm] = useState('CIF');
  const [oceanCargo, setOceanCargo] = useState('');
  const [showOceanQuotes, setShowOceanQuotes] = useState(false);

  // Air State
  const [airTab, setAirTab] = useState('calculator'); // 'details' | 'calculator' | 'documents'
  const [originAirport, setOriginAirport] = useState(AIRPORTS_LIST[0]);
  const [destAirport, setDestAirport] = useState(AIRPORTS_LIST[6]);
  const [airCargoType, setAirCargoType] = useState('General Cargo');
  const [actualWeightKg, setActualWeightKg] = useState('250');
  const [dimL, setDimL] = useState('120');
  const [dimW, setDimW] = useState('80');
  const [dimH, setDimH] = useState('75');
  const [airDocs, setAirDocs] = useState({
    invoicePacking: true,
    awbDraft: true,
    msdsDg: false,
    permits: false,
  });

  // Sample & Tracking State
  const [sampleTab, setSampleTab] = useState('express'); // 'express' | 'track'
  const [courierPref, setCourierPref] = useState('DHL Express');
  const [sampleCommodity, setSampleCommodity] = useState('');
  const [sampleOrigin, setSampleOrigin] = useState('');
  const [sampleDest, setSampleDest] = useState('');
  const [sampleRefId] = useState('TS-SMP-2041');
  const [awbRef, setAwbRef] = useState('');
  const [trackInput, setTrackInput] = useState('TS-SMP-2041');

  // Requests History
  const [requests, setRequests] = useState([
    {
      id: 'TS-REQ-1001',
      mode: 'Inland (22-Wheeler)',
      route: 'Raipur → Visakhapatnam',
      status: 'Quote Requested',
    },
  ]);

  const recentCountries = useMemo(
    () => recentCodes.map((code) => ALL_COUNTRIES.find((c) => c.code === code)).filter(Boolean),
    [recentCodes]
  );

  const openPicker = (type) => {
    setPickerSearch('');
    setPickerType(type);
  };

  const handleSelectCountry = (c) => {
    setSelectedCountry(c);
    setRecentCodes((prev) => [c.code, ...prev.filter((x) => x !== c.code)].slice(0, 6));
    setPickerType(null);
  };

  const selectedFleet = useMemo(
    () => FLEET_OPTIONS.find((f) => f.id === selectedFleetId) || FLEET_OPTIONS[5],
    [selectedFleetId]
  );

  const inlandEstimateInr = useMemo(() => {
    const km = Math.max(20, parseFloat(distanceKm) || 350);
    const rawWt = parseFloat(inlandWeight) || 15;
    const wtInMt = weightUnit === 'KG' ? rawWt / 1000 : weightUnit === 'LB' ? rawWt / 2204.62 : rawWt;
    const rawTrip = selectedFleet.baseInr + km * selectedFleet.perKmInr + Math.max(1, wtInMt) * 140;
    const withRegion = rawTrip * (selectedCountry.regionFactor || 1);
    const marginMultiplier = inlandMode === 'backhaul' ? 1.06 : 1.1;
    return Math.round(withRegion * marginMultiplier);
  }, [distanceKm, inlandWeight, inlandMode, selectedFleet, selectedCountry, weightUnit]);

  const airCalc = useMemo(() => {
    const actKg = Math.max(0, parseFloat(actualWeightKg) || 0);
    const l = Math.max(0, parseFloat(dimL) || 0);
    const w = Math.max(0, parseFloat(dimW) || 0);
    const h = Math.max(0, parseFloat(dimH) || 0);
    const volKg = Number(((l * w * h) / 5000).toFixed(2));
    const chargeableKg = Number(Math.max(actKg, volKg).toFixed(2));
    return { actKg, volKg, chargeableKg };
  }, [actualWeightKg, dimL, dimW, dimH]);

  const createRequestRecord = (modeLabel, routeLabel) => {
    const newId = `TS-REQ-${Math.floor(1002 + Math.random() * 8997)}`;
    setRequests((prev) => [
      { id: newId, mode: modeLabel, route: routeLabel, status: 'Quote Requested' },
      ...prev,
    ]);
    Alert.alert('Request Submitted', `Reference ID: ${newId}\nSaved in My Requests.`);
  };

  const pickerTitle = {
    country: 'Select Country (A–Z)',
    txCur: 'Select Transaction Currency',
    dispCur: 'Select Display Currency',
    originPort: 'Select Origin Port',
    destPort: 'Select Destination Port',
    originAir: 'Select Origin Airport',
    destAir: 'Select Destination Airport',
    incoterm: 'Select Incoterm',
  }[pickerType] || 'Select Option';

  const q = pickerSearch.trim().toLowerCase();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 96 }}>
      {/* TOP BAR + DROPDOWN SELECTORS */}
      <View style={[styles.headerCard, { backgroundColor: C.card, borderBottomColor: C.border }]}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: C.teal }]}>TRADE SETUU • LOGISTICS</Text>
            <Text style={[styles.hubTitle, { color: C.text }]}>
              {activeScreen === null && 'Global Logistics Hub'}
              {activeScreen === 'inland' && 'Inland Transport'}
              {activeScreen === 'ocean' && 'Ocean & Shipping'}
              {activeScreen === 'air' && 'Air Freight'}
              {activeScreen === 'sample' && 'Sample & Tracking'}
              {activeScreen === 'requests' && 'My Logistics Requests'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              onPress={() => setActiveScreen(activeScreen === 'requests' ? null : 'requests')}
              style={[styles.backPill, { backgroundColor: C.cardAlt, borderColor: C.border }]}
            >
              <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800' }}>
                Requests ({requests.length})
              </Text>
            </TouchableOpacity>

            {activeScreen !== null && (
              <TouchableOpacity
                onPress={() => setActiveScreen(null)}
                style={[styles.backPill, { backgroundColor: C.pill, borderColor: C.border }]}
              >
                <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>← Hub</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Clean Dropdown Trigger Row */}
        <View style={styles.selectorRow}>
          <TouchableOpacity
            onPress={() => openPicker('country')}
            style={[styles.dropdownField, { flex: 1.3, backgroundColor: C.cardAlt, borderColor: C.border }]}
          >
            <Text style={[styles.miniLbl, { color: C.sub }]}>COUNTRY</Text>
            <Text style={[styles.dropVal, { color: C.text }]} numberOfLines={1}>
              {selectedCountry.name} ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openPicker('txCur')}
            style={[styles.dropdownField, { flex: 0.9, backgroundColor: C.cardAlt, borderColor: C.border }]}
          >
            <Text style={[styles.miniLbl, { color: C.sub }]}>TX CUR</Text>
            <Text style={[styles.dropVal, { color: C.teal }]}>{txCurrency} ▾</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openPicker('dispCur')}
            style={[styles.dropdownField, { flex: 0.9, backgroundColor: C.cardAlt, borderColor: C.border }]}
          >
            <Text style={[styles.miniLbl, { color: C.sub }]}>DISPLAY</Text>
            <Text style={[styles.dropVal, { color: C.amber }]}>{dispCurrency} ▾</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================================================
          0. DASHBOARD (INFOGRAPHIC ROUTE BANNER + 4 MAIN CARDS)
      ========================================================= */}
      {activeScreen === null && (
        <View style={{ padding: 14 }}>
          {/* Clean Infographic Visual Card: Globe / Route / Truck / Ship / Air */}
          <View style={[styles.infoBanner, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.rowBetween}>
              <Text style={{ color: C.teal, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>
                GLOBAL SUPPLY CORRIDOR • {selectedCountry.name.toUpperCase()}
              </Text>
              <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800' }}>{dispCurrency}</Text>
            </View>

            <View style={styles.infographicStrip}>
              <View style={[styles.nodeBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                <Text style={{ fontSize: 18 }}>🌍</Text>
                <Text style={{ color: C.text, fontSize: 10, fontWeight: '800', marginTop: 2 }}>Global</Text>
              </View>
              <View style={[styles.routeLine, { backgroundColor: C.teal }]} />
              <View style={[styles.nodeBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                <Text style={{ fontSize: 18 }}>🚛</Text>
                <Text style={{ color: C.text, fontSize: 10, fontWeight: '800', marginTop: 2 }}>Inland</Text>
              </View>
              <View style={[styles.routeLine, { backgroundColor: C.amber }]} />
              <View style={[styles.nodeBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                <Text style={{ fontSize: 18 }}>🚢</Text>
                <Text style={{ color: C.text, fontSize: 10, fontWeight: '800', marginTop: 2 }}>Ocean</Text>
              </View>
              <View style={[styles.routeLine, { backgroundColor: C.teal }]} />
              <View style={[styles.nodeBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                <Text style={{ fontSize: 18 }}>✈️</Text>
                <Text style={{ color: C.text, fontSize: 10, fontWeight: '800', marginTop: 2 }}>Air</Text>
              </View>
            </View>

            <Text style={{ color: C.text, fontSize: 14, fontWeight: '800', marginTop: 10 }}>
              Plan • Compare • Quote • Track
            </Text>
            <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>
              Settlement: {txCurrency} • Display: {dispCurrency} • Weight: {weightUnit}
            </Text>
          </View>

          {/* 4 Main Cards */}
          <View style={styles.gridRow}>
            <TouchableOpacity
              onPress={() => setActiveScreen('inland')}
              style={[styles.hubTile, { backgroundColor: C.card, borderColor: C.teal }]}
            >
              <View style={[styles.tileIconBox, { backgroundColor: 'rgba(32,200,193,0.12)' }]}>
                <Text style={{ fontSize: 22 }}>🚛</Text>
              </View>
              <Text style={[styles.tileTitle, { color: C.text }]}>Inland Transport</Text>
              <Text style={[styles.tileSub, { color: C.sub }]}>FTL • PTL • Vehicles • Rates</Text>
              <Text style={[styles.tileLink, { color: C.teal }]}>Explore →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveScreen('ocean')}
              style={[styles.hubTile, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.tileIconBox, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                <Text style={{ fontSize: 22 }}>🚢</Text>
              </View>
              <Text style={[styles.tileTitle, { color: C.text }]}>Ocean & Shipping</Text>
              <Text style={[styles.tileSub, { color: C.sub }]}>Ports • Containers • Quotes</Text>
              <Text style={[styles.tileLink, { color: C.teal }]}>Compare →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            <TouchableOpacity
              onPress={() => setActiveScreen('air')}
              style={[styles.hubTile, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.tileIconBox, { backgroundColor: 'rgba(32,200,193,0.12)' }]}>
                <Text style={{ fontSize: 22 }}>✈️</Text>
              </View>
              <Text style={[styles.tileTitle, { color: C.text }]}>Air Freight</Text>
              <Text style={[styles.tileSub, { color: C.sub }]}>Airports • KG / CM • Docs</Text>
              <Text style={[styles.tileLink, { color: C.teal }]}>Calculate →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveScreen('sample')}
              style={[styles.hubTile, { backgroundColor: C.card, borderColor: C.border }]}
            >
              <View style={[styles.tileIconBox, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                <Text style={{ fontSize: 22 }}>📦</Text>
              </View>
              <Text style={[styles.tileTitle, { color: C.text }]}>Sample & Tracking</Text>
              <Text style={[styles.tileSub, { color: C.sub }]}>Express • Lab • Status</Text>
              <Text style={[styles.tileLink, { color: C.teal }]}>Track →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* =========================================================
          1. INLAND TRANSPORT
      ========================================================= */}
      {activeScreen === 'inland' && (
        <View style={{ padding: 14 }}>
          <View style={[styles.segmentBar, { backgroundColor: C.card, borderColor: C.border }]}>
            <TouchableOpacity
              onPress={() => { setInlandMode('normal'); setShowIndicativeRates(false); }}
              style={[styles.segmentBtn, inlandMode === 'normal' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: inlandMode === 'normal' ? '#071521' : C.text, fontSize: 12, fontWeight: '800' }}>
                Normal Booking
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setInlandMode('backhaul'); setShowIndicativeRates(false); }}
              style={[styles.segmentBtn, inlandMode === 'backhaul' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: inlandMode === 'backhaul' ? '#071521' : C.text, fontSize: 12, fontWeight: '800' }}>
                Backhaul / Bidding
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[styles.label, { color: C.sub }]}>Load Mode</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {LOAD_MODES.map((lm) => (
                <TouchableOpacity
                  key={lm}
                  onPress={() => setLoadMode(lm)}
                  style={[styles.choiceChip, { borderColor: C.border }, loadMode === lm && { backgroundColor: C.teal, borderColor: C.teal }]}
                >
                  <Text style={{ color: loadMode === lm ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{lm}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: C.sub }]}>Pickup Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
              placeholder="Type pickup city, plant or yard..."
              placeholderTextColor={C.sub}
              value={pickupLoc}
              onChangeText={setPickupLoc}
            />

            <Text style={[styles.label, { color: C.sub }]}>Drop / Delivery Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
              placeholder={inlandMode === 'backhaul' ? 'Type return route...' : 'Type drop city, port or warehouse...'}
              placeholderTextColor={C.sub}
              value={deliveryLoc}
              onChangeText={setDeliveryLoc}
            />

            <View style={styles.rowBetween}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.label, { color: C.sub }]}>Weight ({weightUnit})</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {WEIGHT_UNITS.map((wu) => (
                      <TouchableOpacity key={wu} onPress={() => setWeightUnit(wu)}>
                        <Text style={{ color: weightUnit === wu ? C.teal : C.sub, fontSize: 10, fontWeight: '800' }}>{wu}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <TextInput
                  style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                  placeholder="20"
                  placeholderTextColor={C.sub}
                  keyboardType="numeric"
                  value={inlandWeight}
                  onChangeText={setInlandWeight}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: C.sub }]}>Distance (KM, Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                  placeholder="450"
                  placeholderTextColor={C.sub}
                  keyboardType="numeric"
                  value={distanceKm}
                  onChangeText={setDistanceKm}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: C.sub }]}>Cargo / Commodity</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
              placeholder="e.g. Rice, Maize, Cement, Industrial Goods"
              placeholderTextColor={C.sub}
              value={inlandCargo}
              onChangeText={setInlandCargo}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: C.teal }]}
              onPress={() => { setShowVehicleOptions(true); setShowIndicativeRates(false); }}
            >
              <Text style={[styles.primaryBtnTxt, { color: '#071521' }]}>Find Transport Options →</Text>
            </TouchableOpacity>
          </View>

          {showVehicleOptions && (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.teal }]}>
              <Text style={[styles.sectionHead, { color: C.text }]}>Select Vehicle / Tonnage</Text>
              {FLEET_OPTIONS.map((fl) => {
                const active = selectedFleetId === fl.id;
                return (
                  <TouchableOpacity
                    key={fl.id}
                    onPress={() => setSelectedFleetId(fl.id)}
                    style={[styles.fleetRow, { backgroundColor: C.cardAlt, borderColor: active ? C.teal : C.border }]}
                  >
                    <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>{fl.label}</Text>
                    <Text style={{ color: active ? C.teal : C.sub, fontSize: 11, fontWeight: '800' }}>
                      {active ? 'Selected ✓' : 'Select'}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: C.teal, marginTop: 8 }]}
                onPress={() => setShowIndicativeRates(true)}
              >
                <Text style={[styles.primaryBtnTxt, { color: '#071521' }]}>View Indicative Rates →</Text>
              </TouchableOpacity>
            </View>
          )}

          {showIndicativeRates && (
            <View style={[styles.resultCard, { backgroundColor: C.card, borderColor: C.teal }]}>
              <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>
                INDICATIVE RATE ESTIMATE ({dispCurrency})
              </Text>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 6 }}>
                {formatMoney(inlandEstimateInr, dispCurrency)}
              </Text>
              <Text style={{ color: C.sub, fontSize: 11, marginTop: 3 }}>
                {selectedFleet.label} • {loadMode} • Subject to Partner Confirmation
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: C.teal, marginTop: 12 }]}
                onPress={() =>
                  createRequestRecord(
                    `Inland ${loadMode} (${selectedFleet.label})`,
                    `${pickupLoc || selectedCountry.name} → ${deliveryLoc || 'Destination'}`
                  )
                }
              >
                <Text style={[styles.primaryBtnTxt, { color: '#071521' }]}>Request Quote / Book</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          2. OCEAN & SHIPPING (SEARCHABLE DROPDOWNS)
      ========================================================= */}
      {activeScreen === 'ocean' && (
        <View style={{ padding: 14 }}>
          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[styles.sectionHead, { color: C.text }]}>Ocean Freight & Port Lane</Text>

            <Text style={[styles.label, { color: C.sub }]}>Origin Port</Text>
            <TouchableOpacity
              onPress={() => openPicker('originPort')}
              style={[styles.dropdownField, { backgroundColor: C.cardAlt, borderColor: C.border, marginBottom: 10 }]}
            >
              <Text style={[styles.dropVal, { color: C.text }]}>{originPort} ▾</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: C.sub }]}>Destination Port</Text>
            <TouchableOpacity
              onPress={() => openPicker('destPort')}
              style={[styles.dropdownField, { backgroundColor: C.cardAlt, borderColor: C.border, marginBottom: 10 }]}
            >
              <Text style={[styles.dropVal, { color: C.text }]}>{destPort} ▾</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: C.sub }]}>Shipment Type</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['FCL', 'LCL', 'Bulk'].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setOceanType(t)}
                  style={[styles.choiceChip, { borderColor: C.border }, oceanType === t && { backgroundColor: C.teal, borderColor: C.teal }]}
                >
                  <Text style={{ color: oceanType === t ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {oceanType === 'FCL' && (
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {['20 ft', '40 ft', '40 ft HC'].map((sz) => (
                  <TouchableOpacity
                    key={sz}
                    onPress={() => setContainerSize(sz)}
                    style={[styles.choiceChip, { borderColor: C.border }, containerSize === sz && { backgroundColor: C.teal, borderColor: C.teal }]}
                  >
                    <Text style={{ color: containerSize === sz ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>{sz}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.label, { color: C.sub }]}>Incoterms</Text>
            <TouchableOpacity
              onPress={() => openPicker('incoterm')}
              style={[styles.dropdownField, { backgroundColor: C.cardAlt, borderColor: C.border, marginBottom: 10 }]}
            >
              <Text style={[styles.dropVal, { color: C.teal }]}>{incoterm} ▾</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: C.sub }]}>Commodity Description</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
              placeholder="e.g. 1121 Sella Rice / Yellow Maize"
              placeholderTextColor={C.sub}
              value={oceanCargo}
              onChangeText={setOceanCargo}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: C.teal }]}
              onPress={() => setShowOceanQuotes(true)}
            >
              <Text style={[styles.primaryBtnTxt, { color: '#071521' }]}>Get Freight Quotes →</Text>
            </TouchableOpacity>
          </View>

          {showOceanQuotes && (
            <View>
              {[
                { name: 'Indicative Market Estimate', tag: 'Estimated', transit: '14–18 Days' },
                { name: 'Partner Forwarder Option', tag: 'Subject to Confirmation', transit: '15–20 Days' },
              ].map((opt) => (
                <View key={opt.name} style={[styles.quoteCard, { backgroundColor: C.card, borderColor: C.border }]}>
                  <View style={styles.rowBetween}>
                    <Text style={{ color: C.text, fontSize: 14, fontWeight: '900' }}>{opt.name}</Text>
                    <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800' }}>{opt.tag}</Text>
                  </View>
                  <Text style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>
                    {originPort} → {destPort} • {oceanType === 'FCL' ? containerSize : oceanType} • {incoterm} • {opt.transit}
                  </Text>
                  <TouchableOpacity
                    style={[styles.secondaryBtn, { borderColor: C.teal, marginTop: 8 }]}
                    onPress={() => createRequestRecord(`Ocean ${oceanType} (${incoterm})`, `${originPort} → ${destPort}`)}
                  >
                    <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900' }}>Request Final Quote</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          3. AIR FREIGHT (SEARCHABLE AIRPORTS + KG & CM)
      ========================================================= */}
      {activeScreen === 'air' && (
        <View style={{ padding: 14 }}>
          <View style={[styles.segmentBar, { backgroundColor: C.card, borderColor: C.border }]}>
            {[
              { id: 'details', label: 'Details' },
              { id: 'calculator', label: 'Calculator' },
              { id: 'documents', label: 'Documents' },
            ].map((tb) => (
              <TouchableOpacity
                key={tb.id}
                onPress={() => setAirTab(tb.id)}
                style={[styles.segmentBtn, airTab === tb.id && { backgroundColor: C.teal }]}
              >
                <Text style={{ color: airTab === tb.id ? '#071521' : C.text, fontSize: 12, fontWeight: '800' }}>{tb.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {airTab === 'details' && (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.label, { color: C.sub }]}>Origin Airport</Text>
              <TouchableOpacity
                onPress={() => openPicker('originAir')}
                style={[styles.dropdownField, { backgroundColor: C.cardAlt, borderColor: C.border, marginBottom: 10 }]}
              >
                <Text style={[styles.dropVal, { color: C.text }]}>{originAirport} ▾</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: C.sub }]}>Destination Airport</Text>
              <TouchableOpacity
                onPress={() => openPicker('destAir')}
                style={[styles.dropdownField, { backgroundColor: C.cardAlt, borderColor: C.border, marginBottom: 10 }]}
              >
                <Text style={[styles.dropVal, { color: C.text }]}>{destAirport} ▾</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: C.sub }]}>Cargo Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {['General Cargo', 'Perishable Cargo', 'High-Value Cargo'].map((ct) => (
                  <TouchableOpacity
                    key={ct}
                    onPress={() => setAirCargoType(ct)}
                    style={[styles.choiceChip, { borderColor: C.border }, airCargoType === ct && { backgroundColor: C.teal, borderColor: C.teal }]}
                  >
                    <Text style={{ color: airCargoType === ct ? '#071521' : C.text, fontSize: 11, fontWeight: '900' }}>{ct}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {airTab === 'calculator' && (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.sectionHead, { color: C.text }]}>Chargeable Weight Calculator</Text>

              <Text style={[styles.label, { color: C.sub }]}>Actual Weight (KG)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="250"
                placeholderTextColor={C.sub}
                keyboardType="numeric"
                value={actualWeightKg}
                onChangeText={setActualWeightKg}
              />

              <Text style={[styles.label, { color: C.sub }]}>Dimensions (L × W × H in {dimUnit})</Text>
              <View style={styles.rowBetween}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 6, backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                  placeholder="L"
                  placeholderTextColor={C.sub}
                  keyboardType="numeric"
                  value={dimL}
                  onChangeText={setDimL}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 6, backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                  placeholder="W"
                  placeholderTextColor={C.sub}
                  keyboardType="numeric"
                  value={dimW}
                  onChangeText={setDimW}
                />
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                  placeholder="H"
                  placeholderTextColor={C.sub}
                  keyboardType="numeric"
                  value={dimH}
                  onChangeText={setDimH}
                />
              </View>

              <View style={[styles.calcSummaryBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                <View style={styles.rowBetween}>
                  <Text style={{ color: C.sub, fontSize: 12 }}>Actual Weight:</Text>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>{airCalc.actKg} KG</Text>
                </View>
                <View style={[styles.rowBetween, { marginTop: 4 }]}>
                  <Text style={{ color: C.sub, fontSize: 12 }}>Volumetric Weight:</Text>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>{airCalc.volKg} KG</Text>
                </View>
                <View style={[styles.rowBetween, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border }]}>
                  <Text style={{ color: C.teal, fontSize: 13, fontWeight: '900' }}>Chargeable Weight:</Text>
                  <Text style={{ color: C.amber, fontSize: 16, fontWeight: '900' }}>{airCalc.chargeableKg} KG</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: C.teal, marginTop: 12 }]}
                onPress={() =>
                  createRequestRecord(`Air Freight (${airCalc.chargeableKg} KG)`, `${originAirport} → ${destAirport}`)
                }
              >
                <Text style={[styles.primaryBtnTxt, { color: '#071521' }]}>Request Air Quote →</Text>
              </TouchableOpacity>
            </View>
          )}

          {airTab === 'documents' && (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.sectionHead, { color: C.text }]}>Air Cargo Document Checklist</Text>
              {[
                { key: 'invoicePacking', label: 'Commercial Invoice & Packing List' },
                { key: 'awbDraft', label: 'Air Waybill (AWB) Details' },
                { key: 'msdsDg', label: 'MSDS / Dangerous Goods Declaration' },
                { key: 'permits', label: 'Export / Import Permits & Certificates' },
              ].map((doc) => {
                const checked = !!airDocs[doc.key];
                return (
                  <TouchableOpacity
                    key={doc.key}
                    onPress={() => setAirDocs((prev) => ({ ...prev, [doc.key]: !prev[doc.key] }))}
                    style={[styles.docRow, { borderBottomColor: C.border }]}
                  >
                    <Text style={{ color: C.text, fontSize: 13, fontWeight: '700', flex: 1 }}>{doc.label}</Text>
                    <Text style={{ color: checked ? C.teal : C.sub, fontSize: 12, fontWeight: '900' }}>
                      {checked ? '✓ Ready' : 'Pending'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          4. SAMPLE & TRACKING
      ========================================================= */}
      {activeScreen === 'sample' && (
        <View style={{ padding: 14 }}>
          <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>SAMPLE TIMELINE</Text>
            <View style={styles.timelineRow}>
              {['Pickup', 'In Transit', 'Testing', 'Report'].map((st, idx) => (
                <View key={st} style={styles.timelineStep}>
                  <View style={[styles.dot, { backgroundColor: idx < 3 ? C.teal : C.border }]} />
                  <Text style={{ color: idx < 3 ? C.text : C.sub, fontSize: 10, fontWeight: '800', marginTop: 4 }}>{st}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.refStrip, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
              <Text style={{ color: C.sub, fontSize: 11 }}>
                Sample Ref: <Text style={{ color: C.text, fontWeight: '900' }}>{sampleRefId}</Text>
              </Text>
              <Text style={{ color: C.sub, fontSize: 11 }}>
                AWB: <Text style={{ color: C.amber, fontWeight: '900' }}>{awbRef || 'Pending'}</Text>
              </Text>
            </View>
          </View>

          <View style={[styles.segmentBar, { backgroundColor: C.card, borderColor: C.border }]}>
            <TouchableOpacity
              onPress={() => setSampleTab('express')}
              style={[styles.segmentBtn, sampleTab === 'express' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: sampleTab === 'express' ? '#071521' : C.text, fontSize: 12, fontWeight: '800' }}>
                Sample Express
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSampleTab('track')}
              style={[styles.segmentBtn, sampleTab === 'track' && { backgroundColor: C.teal }]}
            >
              <Text style={{ color: sampleTab === 'track' ? '#071521' : C.text, fontSize: 12, fontWeight: '800' }}>
                Track Shipment
              </Text>
            </TouchableOpacity>
          </View>

          {sampleTab === 'express' ? (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.label, { color: C.sub }]}>Courier Preference</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                {['DHL Express', 'FedEx', 'Other Partner'].map((cp) => (
                  <TouchableOpacity
                    key={cp}
                    onPress={() => setCourierPref(cp)}
                    style={[styles.choiceChip, { borderColor: C.border }, courierPref === cp && { backgroundColor: C.teal, borderColor: C.teal }]}
                  >
                    <Text style={{ color: courierPref === cp ? '#071521' : C.text, fontSize: 11, fontWeight: '800' }}>{cp}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: C.sub }]}>Sample Commodity</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="e.g. Rice / Spice / Lab Sample"
                placeholderTextColor={C.sub}
                value={sampleCommodity}
                onChangeText={setSampleCommodity}
              />

              <Text style={[styles.label, { color: C.sub }]}>Pickup Location</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="Type pickup city / address..."
                placeholderTextColor={C.sub}
                value={sampleOrigin}
                onChangeText={setSampleOrigin}
              />

              <Text style={[styles.label, { color: C.sub }]}>Receiver / Lab Location</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="Type receiver / lab city & country..."
                placeholderTextColor={C.sub}
                value={sampleDest}
                onChangeText={setSampleDest}
              />

              <Text style={[styles.label, { color: C.sub }]}>AWB Reference (Separate from Sample Ref ID)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="Enter courier AWB (optional)"
                placeholderTextColor={C.sub}
                value={awbRef}
                onChangeText={setAwbRef}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: C.teal }]}
                onPress={() =>
                  createRequestRecord(`Sample (${courierPref})`, `${sampleOrigin || selectedCountry.name} → ${sampleDest || 'Lab'}`)
                }
              >
                <Text style={[styles.primaryBtnTxt, { color: '#071521' }]}>Create Sample Request →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.label, { color: C.sub }]}>Enter Sample Ref ID or AWB</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border }]}
                placeholder="e.g. TS-SMP-2041 or AWB"
                placeholderTextColor={C.sub}
                value={trackInput}
                onChangeText={setTrackInput}
              />
              <View style={[styles.comingSoonBox, { backgroundColor: C.cardAlt, borderColor: C.border }]}>
                <Text style={{ color: C.amber, fontSize: 11, fontWeight: '900' }}>
                  LIVE TRACKING & AUTO CARRIER SYNC — COMING SOON
                </Text>
                <Text style={{ color: C.sub, fontSize: 12, marginTop: 4, lineHeight: 17 }}>
                  Real-time carrier tracking and automated milestone sync will be available in a future update.
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          5. MY LOGISTICS REQUESTS
      ========================================================= */}
      {activeScreen === 'requests' && (
        <View style={{ padding: 14 }}>
          {requests.map((req) => (
            <View key={req.id} style={[styles.quoteCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: C.teal, fontSize: 12, fontWeight: '900' }}>{req.id}</Text>
                <Text style={{ color: C.amber, fontSize: 11, fontWeight: '800' }}>{req.status}</Text>
              </View>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: '800', marginTop: 4 }}>{req.mode}</Text>
              <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{req.route}</Text>
            </View>
          ))}
        </View>
      )}

      {/* =========================================================
          UNIVERSAL SEARCHABLE DROPDOWN MODAL
      ========================================================= */}
      <Modal visible={!!pickerType} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.rowBetween}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>{pickerTitle}</Text>
              <TouchableOpacity onPress={() => setPickerType(null)}>
                <Text style={{ color: C.teal, fontSize: 13, fontWeight: '800' }}>Close</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: C.cardAlt, color: C.text, borderColor: C.border, marginTop: 10 }]}
              placeholder="Search here..."
              placeholderTextColor={C.sub}
              value={pickerSearch}
              onChangeText={setPickerSearch}
            />

            {pickerType === 'country' && recentCountries.length > 0 && !q && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: C.amber, fontSize: 10, fontWeight: '900', marginBottom: 6 }}>
                  RECENT SELECTION
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {recentCountries.map((rc) => (
                    <TouchableOpacity
                      key={'rec-' + rc.code}
                      onPress={() => handleSelectCountry(rc)}
                      style={[styles.choiceChip, { borderColor: C.teal, backgroundColor: C.cardAlt }]}
                    >
                      <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>{rc.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <ScrollView style={{ maxHeight: 300 }}>
              {pickerType === 'country' &&
                ALL_COUNTRIES.filter(
                  (c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
                ).map((c) => {
                  const active = selectedCountry.code === c.code;
                  return (
                    <TouchableOpacity
                      key={c.code}
                      onPress={() => handleSelectCountry(c)}
                      style={[styles.listRow, { borderBottomColor: C.border }]}
                    >
                      <Text style={{ color: active ? C.teal : C.text, fontSize: 13, fontWeight: '800' }}>
                        {c.name} ({c.code})
                      </Text>
                      <Text style={{ color: C.sub, fontSize: 11, fontWeight: '700' }}>{c.currency}</Text>
                    </TouchableOpacity>
                  );
                })}

              {(pickerType === 'txCur' || pickerType === 'dispCur') &&
                CURRENCY_LIST.filter((cur) => !q || cur.toLowerCase().includes(q)).map((cur) => {
                  const current = pickerType === 'txCur' ? txCurrency : dispCurrency;
                  return (
                    <TouchableOpacity
                      key={cur}
                      onPress={() => {
                        if (pickerType === 'txCur') setTxCurrency(cur);
                        else setDispCurrency(cur);
                        setPickerType(null);
                      }}
                      style={[styles.listRow, { borderBottomColor: C.border }]}
                    >
                      <Text style={{ color: current === cur ? C.teal : C.text, fontSize: 13, fontWeight: '800' }}>
                        {cur}
                      </Text>
                      <Text style={{ color: C.sub, fontSize: 11 }}>1 {cur} ≈ ₹{FX_TO_INR[cur] || 1}</Text>
                    </TouchableOpacity>
                  );
                })}

              {(pickerType === 'originPort' || pickerType === 'destPort') &&
                PORTS_LIST.filter((p) => !q || p.toLowerCase().includes(q)).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => {
                      if (pickerType === 'originPort') setOriginPort(p);
                      else setDestPort(p);
                      setPickerType(null);
                    }}
                    style={[styles.listRow, { borderBottomColor: C.border }]}
                  >
                    <Text style={{ color: C.text, fontSize: 13, fontWeight: '700' }}>{p}</Text>
                  </TouchableOpacity>
                ))}

              {(pickerType === 'originAir' || pickerType === 'destAir') &&
                AIRPORTS_LIST.filter((ap) => !q || ap.toLowerCase().includes(q)).map((ap) => (
                  <TouchableOpacity
                    key={ap}
                    onPress={() => {
                      if (pickerType === 'originAir') setOriginAirport(ap);
                      else setDestAirport(ap);
                      setPickerType(null);
                    }}
                    style={[styles.listRow, { borderBottomColor: C.border }]}
                  >
                    <Text style={{ color: C.text, fontSize: 13, fontWeight: '700' }}>{ap}</Text>
                  </TouchableOpacity>
                ))}

              {pickerType === 'incoterm' &&
                INCOTERMS_LIST.filter((inc) => !q || inc.toLowerCase().includes(q)).map((inc) => (
                  <TouchableOpacity
                    key={inc}
                    onPress={() => {
                      setIncoterm(inc);
                      setPickerType(null);
                    }}
                    style={[styles.listRow, { borderBottomColor: C.border }]}
                  >
                    <Text style={{ color: incoterm === inc ? C.teal : C.text, fontSize: 13, fontWeight: '800' }}>
                      {inc}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerCard: { padding: 14, borderBottomWidth: 1 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  hubTitle: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  backPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectorRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  dropdownField: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  miniLbl: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  dropVal: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  infoBanner: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  infographicStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  nodeBox: { width: 56, height: 54, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  routeLine: { flex: 1, height: 2, marginHorizontal: 4, opacity: 0.75 },
  gridRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  hubTile: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 14 },
  tileIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  tileTitle: { fontSize: 14, fontWeight: '900' },
  tileSub: { fontSize: 11, marginTop: 3, lineHeight: 15 },
  tileLink: { fontSize: 12, fontWeight: '800', marginTop: 10 },
  segmentBar: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 4, marginBottom: 12 },
  segmentBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  sectionHead: { fontSize: 15, fontWeight: '900', marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '800', marginBottom: 5, marginTop: 2 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, marginBottom: 10 },
  choiceChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, borderWidth: 1, marginRight: 7, marginBottom: 7 },
  fleetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 11,
    marginBottom: 8,
  },
  primaryBtn: { borderRadius: 11, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  primaryBtnTxt: { fontSize: 13, fontWeight: '900' },
  secondaryBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  resultCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  quoteCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  calcSummaryBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 4 },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 0.5 },
  timelineRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 14 },
  timelineStep: { alignItems: 'center', flex: 1 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  refStrip: { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderRadius: 10, padding: 10 },
  comingSoonBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 4 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, padding: 16 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
});
