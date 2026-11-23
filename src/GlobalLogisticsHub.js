import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const COUNTRY_CONFIGS = [
  {
    country: 'India',
    defaultCurrency: 'INR',
    defaultWeightUnit: 'MT',
    defaultDimUnit: 'CM',
    normalFeePerTon: 25,
    backhaulMinMarkup: 3000,
    backhaulMaxMarkup: 5000,
  },
  {
    country: 'United Arab Emirates',
    defaultCurrency: 'AED',
    defaultWeightUnit: 'MT',
    defaultDimUnit: 'CM',
    normalFeePerTon: 12,
    backhaulMinMarkup: 180,
    backhaulMaxMarkup: 350,
  },
  {
    country: 'United States',
    defaultCurrency: 'USD',
    defaultWeightUnit: 'LB',
    defaultDimUnit: 'IN',
    normalFeePerTon: 4,
    backhaulMinMarkup: 60,
    backhaulMaxMarkup: 120,
  },
  {
    country: 'Netherlands',
    defaultCurrency: 'EUR',
    defaultWeightUnit: 'MT',
    defaultDimUnit: 'CM',
    normalFeePerTon: 3.5,
    backhaulMinMarkup: 55,
    backhaulMaxMarkup: 110,
  },
  {
    country: 'Singapore',
    defaultCurrency: 'SGD',
    defaultWeightUnit: 'KG',
    defaultDimUnit: 'CM',
    normalFeePerTon: 5,
    backhaulMinMarkup: 75,
    backhaulMaxMarkup: 150,
  },
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'AED', 'SGD', 'GBP'];
const WEIGHT_UNITS = ['MT', 'KG', 'LB'];
const DIM_UNITS = ['CM', 'MM', 'IN', 'FT'];
const VOL_UNITS = ['CBM', 'CFT'];

const INCOTERMS_2020 = [
  'EXW',
  'FCA',
  'FOB',
  'CFR',
  'CIF',
  'CPT',
  'CIP',
  'DAP',
  'DPU',
  'DDP',
];

const INCOTERM_NOTES = {
  EXW: 'Seller makes goods available at premises; buyer handles export, main carriage & import.',
  FCA: 'Seller delivers to carrier/named place; export clearance & main carriage follow agreed terms.',
  FOB: 'Ocean/inland waterway: seller delivers on board vessel at named port of shipment.',
  CFR: 'Ocean/inland waterway: seller pays freight to destination port; risk transfers on board.',
  CIF: 'Ocean/inland waterway: CFR plus minimum marine cargo insurance arranged by seller.',
  CPT: 'Any mode: seller pays carriage to named destination; risk transfers on handover to first carrier.',
  CIP: 'Any mode: CPT plus higher insurance coverage as per Incoterms 2020.',
  DAP: 'Delivered at place ready for unloading; buyer handles import customs & duties.',
  DPU: 'Delivered at place unloaded; seller unloads at destination, buyer handles import customs.',
  DDP: 'Maximum seller responsibility including import customs clearance & duties (subject to country rules).',
};

const PORTS_MASTER = [
  'Nhava Sheva (JNPT), India',
  'Mundra, India',
  'Jebel Ali, UAE',
  'Rotterdam, Netherlands',
  'Singapore, Singapore',
  'Shanghai, China',
  'Los Angeles, USA',
];

const AIRPORTS_MASTER = [
  'DEL - Delhi, India',
  'BOM - Mumbai, India',
  'DXB - Dubai, UAE',
  'AMS - Amsterdam, Netherlands',
  'SIN - Singapore, Singapore',
  'FRA - Frankfurt, Germany',
];

const toKg = (val, unit) => {
  const n = parseFloat(val);
  if (isNaN(n) || n <= 0) return 0;
  if (unit === 'MT') return n * 1000;
  if (unit === 'LB') return n * 0.453592;
  return n;
};

const toCm = (val, unit) => {
  const n = parseFloat(val);
  if (isNaN(n) || n <= 0) return 0;
  if (unit === 'MM') return n / 10;
  if (unit === 'IN') return n * 2.54;
  if (unit === 'FT') return n * 30.48;
  return n;
};

const fromKg = (kg, targetUnit) => {
  if (targetUnit === 'MT') return kg / 1000;
  if (targetUnit === 'LB') return kg / 0.453592;
  return kg;
};

export default function GlobalLogisticsHubScreen({ onBack }) {
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [displayCurrency, setDisplayCurrency] = useState('INR');
  const [txCurrency, setTxCurrency] = useState('INR');
  const [weightUnit, setWeightUnit] = useState('MT');
  const [dimUnit, setDimUnit] = useState('CM');
  const [volUnit, setVolUnit] = useState('CBM');

  const [activeTab, setActiveTab] = useState('INLAND');

  const [inlandSubMode, setInlandSubMode] = useState('NORMAL');
  const [inlandMode, setInlandMode] = useState('Road Freight');
  const [originCountry, setOriginCountry] = useState('India');
  const [pickupLoc, setPickupLoc] = useState('');
  const [destCountry, setDestCountry] = useState('India');
  const [deliveryLoc, setDeliveryLoc] = useState('');
  const [cargoName, setCargoName] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [vehicleType, setVehicleType] = useState('18T / 22T Fleet');
  const [pickupDate, setPickupDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [inlandNotes, setInlandNotes] = useState('');

  const [bidderRole, setBidderRole] = useState('CARGO_OWNER');
  const [partnerBidInput, setPartnerBidInput] = useState('70000');
  const [returnRoute, setReturnRoute] = useState('');
  const [availableCapacity, setAvailableCapacity] = useState('');

  const [oceanOriginCountry, setOceanOriginCountry] = useState('India');
  const [originPort, setOriginPort] = useState('Nhava Sheva (JNPT), India');
  const [oceanDestCountry, setOceanDestCountry] = useState('United Arab Emirates');
  const [destPort, setDestPort] = useState('Jebel Ali, UAE');
  const [shippingType, setShippingType] = useState('FCL');
  const [containerSize, setContainerSize] = useState('40ft HC');
  const [containerQty, setContainerQty] = useState('1');
  const [oceanCommodity, setOceanCommodity] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [oceanWeight, setOceanWeight] = useState('');
  const [oceanVolume, setOceanVolume] = useState('');
  const [incoterm, setIncoterm] = useState('CIF');
  const [sailingWindow, setSailingWindow] = useState('');

  const [originAirport, setOriginAirport] = useState('BOM - Mumbai, India');
  const [destAirport, setDestAirport] = useState('DXB - Dubai, UAE');
  const [airCargoCategory, setAirCargoCategory] = useState('General Cargo');
  const [airActualWeight, setAirActualWeight] = useState('');
  const [airLen, setAirLen] = useState('');
  const [airWid, setAirWid] = useState('');
  const [airHei, setAirHei] = useState('');
  const [airPackages, setAirPackages] = useState('1');
  const [volDivisor, setVolDivisor] = useState('5000');

  const [sampleCourier, setSampleCourier] = useState('DHL Express');
  const [senderDetails, setSenderDetails] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [receiverLab, setReceiverLab] = useState('');
  const [sampleRefId, setSampleRefId] = useState('TS-SMP-2041');
  const [trackingRef, setTrackingRef] = useState('');
  const [sampleStatus, setSampleStatus] = useState('Draft / Pickup Requested (Manual Beta)');

  const currentCountryCfg = useMemo(() => {
    return (
      COUNTRY_CONFIGS.find((c) => c.country === selectedCountry) ||
      COUNTRY_CONFIGS[0]
    );
  }, [selectedCountry]);

  const handleSelectCountry = (cfg) => {
    setSelectedCountry(cfg.country);
    setDisplayCurrency(cfg.defaultCurrency);
    setTxCurrency(cfg.defaultCurrency);
    setWeightUnit(cfg.defaultWeightUnit);
    setDimUnit(cfg.defaultDimUnit);
  };

  const inlandNormalEstimate = useMemo(() => {
    const w = parseFloat(cargoWeight);
    const validWeight = isNaN(w) || w <= 0 ? 0 : w;
    const mtEquivalent = toKg(validWeight, weightUnit) / 1000;
    const feeRate = currentCountryCfg.normalFeePerTon;
    const indicativeFee = mtEquivalent * feeRate;
    return {
      validWeight,
      mtEquivalent,
      feeRate,
      indicativeFee,
    };
  }, [cargoWeight, weightUnit, currentCountryCfg]);

  const backhaulQuote = useMemo(() => {
    const bid = parseFloat(partnerBidInput);
    const validBid = isNaN(bid) || bid <= 0 ? 0 : bid;
    const minMarkup = currentCountryCfg.backhaulMinMarkup;
    const maxMarkup = currentCountryCfg.backhaulMaxMarkup;
    const midMarkup = Math.round((minMarkup + maxMarkup) / 2);
    return {
      validBid,
      minMarkup,
      maxMarkup,
      midMarkup,
      displayMin: validBid + minMarkup,
      displayMax: validBid + maxMarkup,
      displayIndicative: validBid + midMarkup,
    };
  }, [partnerBidInput, currentCountryCfg]);

  const airWeightCalc = useMemo(() => {
    const actualKg = toKg(airActualWeight, weightUnit);
    const lCm = toCm(airLen, dimUnit);
    const wCm = toCm(airWid, dimUnit);
    const hCm = toCm(airHei, dimUnit);
    const pkgs = Math.max(1, parseInt(airPackages, 10) || 1);
    const div = Math.max(1, parseFloat(volDivisor) || 5000);

    const volumetricKg =
      lCm > 0 && wCm > 0 && hCm > 0 ? ((lCm * wCm * hCm) / div) * pkgs : 0;
    const chargeableKg = Math.max(actualKg, volumetricKg);

    return {
      actualDisplay: fromKg(actualKg, weightUnit),
      volumetricDisplay: fromKg(volumetricKg, weightUnit),
      chargeableDisplay: fromKg(chargeableKg, weightUnit),
    };
  }, [airActualWeight, airLen, airWid, airHei, airPackages, volDivisor, weightUnit, dimUnit]);

  const handleSubmitInland = () => {
    if (!pickupLoc.trim() || !deliveryLoc.trim()) {
      Alert.alert(
        'Required Locations',
        'Please enter Pickup Location and Delivery Location (Beta Request Mode).'
      );
      return;
    }
    Alert.alert(
      'Beta Request Prepared',
      `${inlandMode} (${inlandSubMode === 'NORMAL' ? 'Normal Booking' : 'Backhaul / Bidding'}) saved as an indicative request in ${txCurrency}.`
    );
  };

  const handleSubmitOceanInquiry = () => {
    if (!oceanCommodity.trim()) {
      Alert.alert(
        'Commodity Required',
        'Please enter Commodity details to prepare an indicative shipping inquiry.'
      );
      return;
    }
    Alert.alert(
      'Shipping Inquiry Saved',
      `${shippingType} (${incoterm}) inquiry from ${originPort} to ${destPort} prepared as Request Only.`
    );
  };

  const handleSubmitAirInquiry = () => {
    Alert.alert(
      'Air Freight Inquiry Drafted',
      `${airCargoCategory} from ${originAirport} to ${destAirport} (Chargeable: ${airWeightCalc.chargeableDisplay.toFixed(2)} ${weightUnit}) saved as Request Only.`
    );
  };

  const handleGenerateSampleRef = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newId = `TS-SMP-${rand}`;
    setSampleRefId(newId);
    if (!trackingRef.trim()) {
      setTrackingRef(`${sampleCourier.slice(0, 3).toUpperCase()}-${rand}8820`);
    }
    setSampleStatus('Pickup / Dispatch Request Logged (Manual Beta)');
    Alert.alert(
      'Sample Reference Created',
      `Sample Ref ${newId} prepared with ${sampleCourier}. Live carrier tracking is Coming Soon.`
    );
  };

  const renderGlobalConfigBar = () => (
    <View style={styles.configCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionMiniTitle}>Global Region & Units (Manual)</Text>
        <Text style={styles.tagZeroApi}>ZERO PAID API • BETA</Text>
      </View>

      <Text style={styles.fieldLabel}>Country / Regional Rule Set</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {COUNTRY_CONFIGS.map((cfg) => {
          const active = cfg.country === selectedCountry;
          return (
            <TouchableOpacity
              key={cfg.country}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => handleSelectCountry(cfg)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cfg.country}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.fieldLabel}>
        Transaction Currency ({txCurrency}) • Display Currency ({displayCurrency})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {CURRENCIES.map((cur) => {
          const active = cur === txCurrency;
          return (
            <TouchableOpacity
              key={cur}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => {
                setTxCurrency(cur);
                setDisplayCurrency(cur);
              }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{cur}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.rowBetween}>
        <View style={styles.halfCol}>
          <Text style={styles.fieldLabel}>Weight Unit</Text>
          <View style={styles.inlineWrap}>
            {WEIGHT_UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.smallChip, weightUnit === u && styles.chipActive]}
                onPress={() => setWeightUnit(u)}
              >
                <Text style={[styles.smallChipText, weightUnit === u && styles.chipTextActive]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.halfCol}>
          <Text style={styles.fieldLabel}>Dimension / Volume</Text>
          <View style={styles.inlineWrap}>
            {DIM_UNITS.slice(0, 3).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.smallChip, dimUnit === d && styles.chipActive]}
                onPress={() => setDimUnit(d)}
              >
                <Text style={[styles.smallChipText, dimUnit === d && styles.chipTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
            {VOL_UNITS.map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.smallChip, volUnit === v && styles.chipActive]}
                onPress={() => setVolUnit(v)}
              >
                <Text style={[styles.smallChipText, volUnit === v && styles.chipTextActive]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderInlandSection = () => (
    <View style={styles.panel}>
      <View style={styles.rowBetween}>
        <Text style={styles.panelTitle}>1. Inland Transport</Text>
        <Text style={styles.badgePreview}>BETA • REQUEST MODE</Text>
      </View>
      <Text style={styles.subHint}>
        Global road, rail, bulk & corridor haulage. Configurable country fee/markup rules (no hardcoded global rate).
      </Text>

      <View style={styles.subToggleRow}>
        <TouchableOpacity
          style={[styles.subToggleBtn, inlandSubMode === 'NORMAL' && styles.subToggleActive]}
          onPress={() => setInlandSubMode('NORMAL')}
        >
          <Text style={[styles.subToggleText, inlandSubMode === 'NORMAL' && styles.activeText]}>
            Normal Booking
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subToggleBtn, inlandSubMode === 'BACKHAUL' && styles.subToggleActive]}
          onPress={() => setInlandSubMode('BACKHAUL')}
        >
          <Text style={[styles.subToggleText, inlandSubMode === 'BACKHAUL' && styles.activeText]}>
            Backhaul / Bidding
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {[
          'Road Freight',
          'Trucking',
          'Rail Freight',
          'Inland Haulage',
          'Bulk Transport',
          'Port-to-Warehouse',
          'Warehouse-to-Factory',
        ].map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.chip, inlandMode === m && styles.chipActive]}
            onPress={() => setInlandMode(m)}
          >
            <Text style={[styles.chipText, inlandMode === m && styles.chipTextActive]}>
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        placeholder="Origin Country"
        placeholderTextColor="#7C8BA1"
        value={originCountry}
        onChangeText={setOriginCountry}
      />
      <TextInput
        style={styles.input}
        placeholder="Pickup Location (City / Plant / Yard)"
        placeholderTextColor="#7C8BA1"
        value={pickupLoc}
        onChangeText={setPickupLoc}
      />
      <TextInput
        style={styles.input}
        placeholder="Destination Country"
        placeholderTextColor="#7C8BA1"
        value={destCountry}
        onChangeText={setDestCountry}
      />
      <TextInput
        style={styles.input}
        placeholder="Delivery Location (City / Port / Warehouse)"
        placeholderTextColor="#7C8BA1"
        value={deliveryLoc}
        onChangeText={setDeliveryLoc}
      />
      <TextInput
        style={styles.input}
        placeholder="Cargo / Commodity"
        placeholderTextColor="#7C8BA1"
        value={cargoName}
        onChangeText={setCargoName}
      />

      <View style={styles.rowBetween}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder={`Cargo Weight (${weightUnit})`}
          placeholderTextColor="#7C8BA1"
          keyboardType="numeric"
          value={cargoWeight}
          onChangeText={setCargoWeight}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Vehicle / Fleet Type"
          placeholderTextColor="#7C8BA1"
          value={vehicleType}
          onChangeText={setVehicleType}
        />
      </View>

      <View style={styles.rowBetween}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Pickup Date (e.g. 26 Nov 2026)"
          placeholderTextColor="#7C8BA1"
          value={pickupDate}
          onChangeText={setPickupDate}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Delivery Date (e.g. 29 Nov 2026)"
          placeholderTextColor="#7C8BA1"
          value={deliveryDate}
          onChangeText={setDeliveryDate}
        />
      </View>

      {inlandSubMode === 'NORMAL' ? (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>
            Normal Booking Fee Preview ({selectedCountry} Config)
          </Text>
          <Text style={styles.summaryLine}>
            Configured Rule Rate: {currentCountryCfg.normalFeePerTon} {txCurrency} / MT (India example: ₹25/MT)
          </Text>
          <Text style={styles.summaryLine}>
            Weight Equivalent: {inlandNormalEstimate.mtEquivalent.toFixed(2)} MT ({inlandNormalEstimate.validWeight || 0} {weightUnit})
          </Text>
          <Text style={styles.summaryHighlight}>
            Indicative Platform Fee: {inlandNormalEstimate.indicativeFee.toFixed(2)} {txCurrency} (Request Only)
          </Text>
        </View>
      ) : (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Backhaul / Bidding Workflow</Text>
          <View style={styles.inlineWrap}>
            <TouchableOpacity
              style={[styles.smallChip, bidderRole === 'CARGO_OWNER' && styles.chipActive]}
              onPress={() => setBidderRole('CARGO_OWNER')}
            >
              <Text style={[styles.smallChipText, bidderRole === 'CARGO_OWNER' && styles.chipTextActive]}>
                Cargo Owner / Shipper
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallChip, bidderRole === 'TRANSPORT_PARTNER' && styles.chipActive]}
              onPress={() => setBidderRole('TRANSPORT_PARTNER')}
            >
              <Text style={[styles.smallChipText, bidderRole === 'TRANSPORT_PARTNER' && styles.chipTextActive]}>
                Transport Partner / Fleet
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Return Route / Corridor"
            placeholderTextColor="#7C8BA1"
            value={returnRoute}
            onChangeText={setReturnRoute}
          />
          <TextInput
            style={styles.input}
            placeholder="Available Capacity / Load Window"
            placeholderTextColor="#7C8BA1"
            value={availableCapacity}
            onChangeText={setAvailableCapacity}
          />
          <TextInput
            style={styles.input}
            placeholder={`Partner Bid / Offer Amount (${txCurrency})`}
            placeholderTextColor="#7C8BA1"
            keyboardType="numeric"
            value={partnerBidInput}
            onChangeText={setPartnerBidInput}
          />

          <Text style={styles.summaryLine}>
            Partner Bid: {backhaulQuote.validBid.toLocaleString()} {txCurrency}
          </Text>
          <Text style={styles.summaryLine}>
            Configurable Trip Markup ({selectedCountry}): {backhaulQuote.minMarkup.toLocaleString()} – {backhaulQuote.maxMarkup.toLocaleString()} {txCurrency} (India example: ₹3,000–₹5,000/trip)
          </Text>
          <Text style={styles.summaryHighlight}>
            Indicative Displayed Range: {backhaulQuote.displayMin.toLocaleString()} – {backhaulQuote.displayMax.toLocaleString()} {txCurrency}
          </Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Loading / Unloading & Special Instructions"
        placeholderTextColor="#7C8BA1"
        value={inlandNotes}
        onChangeText={setInlandNotes}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmitInland}>
        <Text style={styles.primaryBtnText}>Request Inland Booking (Beta)</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOceanSection = () => (
    <View style={styles.panel}>
      <View style={styles.rowBetween}>
        <Text style={styles.panelTitle}>2. Ocean & Shipping</Text>
        <Text style={styles.badgeRequest}>INDICATIVE • REQUEST ONLY</Text>
      </View>

      <View style={styles.blockCard}>
        <Text style={styles.blockTitle}>Block 1 • Route & Port Lane</Text>
        <View style={styles.rowBetween}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Origin Country"
            placeholderTextColor="#7C8BA1"
            value={oceanOriginCountry}
            onChangeText={setOceanOriginCountry}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Destination Country"
            placeholderTextColor="#7C8BA1"
            value={oceanDestCountry}
            onChangeText={setOceanDestCountry}
          />
        </View>
        <Text style={styles.fieldLabel}>Origin Port (Master List)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {PORTS_MASTER.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, originPort === p && styles.chipActive]}
              onPress={() => setOriginPort(p)}
            >
              <Text style={[styles.chipText, originPort === p && styles.chipTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.fieldLabel}>Destination Port (Master List)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {PORTS_MASTER.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, destPort === p && styles.chipActive]}
              onPress={() => setDestPort(p)}
            >
              <Text style={[styles.chipText, destPort === p && styles.chipTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.blockCard}>
        <Text style={styles.blockTitle}>Block 2 • Container & Cargo Specs</Text>
        <View style={styles.inlineWrap}>
          {['FCL', 'LCL', 'Bulk'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.smallChip, shippingType === t && styles.chipActive]}
              onPress={() => setShippingType(t)}
            >
              <Text style={[styles.smallChipText, shippingType === t && styles.chipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {shippingType === 'FCL' && (
          <View style={styles.rowBetween}>
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Container Size</Text>
              <View style={styles.inlineWrap}>
                {['20ft', '40ft', '40ft HC'].map((sz) => (
                  <TouchableOpacity
                    key={sz}
                    style={[styles.smallChip, containerSize === sz && styles.chipActive]}
                    onPress={() => setContainerSize(sz)}
                  >
                    <Text style={[styles.smallChipText, containerSize === sz && styles.chipTextActive]}>
                      {sz}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Container Qty</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={containerQty}
                onChangeText={setContainerQty}
                placeholder="1"
                placeholderTextColor="#7C8BA1"
              />
            </View>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Commodity Description"
          placeholderTextColor="#7C8BA1"
          value={oceanCommodity}
          onChangeText={setOceanCommodity}
        />
        <View style={styles.rowBetween}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="HS Code (Optional)"
            placeholderTextColor="#7C8BA1"
            value={hsCode}
            onChangeText={setHsCode}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder={`Weight (${weightUnit})`}
            placeholderTextColor="#7C8BA1"
            keyboardType="numeric"
            value={oceanWeight}
            onChangeText={setOceanWeight}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder={`Cargo Volume (${volUnit})`}
          placeholderTextColor="#7C8BA1"
          keyboardType="numeric"
          value={oceanVolume}
          onChangeText={setOceanVolume}
        />
      </View>

      <View style={styles.blockCard}>
        <Text style={styles.blockTitle}>Block 3 • Incoterms 2020 & Schedule</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {INCOTERMS_2020.map((term) => (
            <TouchableOpacity
              key={term}
              style={[styles.chip, incoterm === term && styles.chipActive]}
              onPress={() => setIncoterm(term)}
            >
              <Text style={[styles.chipText, incoterm === term && styles.chipTextActive]}>
                {term}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.summaryLine}>
          {incoterm}: {INCOTERM_NOTES[incoterm]}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Cargo Ready / Target Sailing Window"
          placeholderTextColor="#7C8BA1"
          value={sailingWindow}
          onChangeText={setSailingWindow}
        />
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Block 4 • Indicative Quote Summary</Text>
        <Text style={styles.summaryLine}>
          Lane: {originPort} → {destPort}
        </Text>
        <Text style={styles.summaryLine}>
          Mode: {shippingType}
          {shippingType === 'FCL' ? ` (${containerQty || '1'} x ${containerSize})` : ''} • Incoterm: {incoterm}
        </Text>
        <Text style={styles.summaryLine}>
          Cargo: {oceanCommodity || 'Not specified'} • {oceanWeight || '0'} {weightUnit} • {oceanVolume || '0'} {volUnit}
        </Text>
        <Text style={styles.noticeText}>
          Indicative information only. Final rates, transit time and space are subject to carrier / logistics partner confirmation.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmitOceanInquiry}>
          <Text style={styles.primaryBtnText}>Request Freight Quote / Submit Inquiry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAirSection = () => (
    <View style={styles.panel}>
      <View style={styles.rowBetween}>
        <Text style={styles.panelTitle}>3. Air Freight</Text>
        <Text style={styles.badgeRequest}>FREE BETA • REQUEST ONLY</Text>
      </View>

      <Text style={styles.fieldLabel}>Origin Airport</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {AIRPORTS_MASTER.map((ap) => (
          <TouchableOpacity
            key={ap}
            style={[styles.chip, originAirport === ap && styles.chipActive]}
            onPress={() => setOriginAirport(ap)}
          >
            <Text style={[styles.chipText, originAirport === ap && styles.chipTextActive]}>
              {ap}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.fieldLabel}>Destination Airport</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {AIRPORTS_MASTER.map((ap) => (
          <TouchableOpacity
            key={ap}
            style={[styles.chip, destAirport === ap && styles.chipActive]}
            onPress={() => setDestAirport(ap)}
          >
            <Text style={[styles.chipText, destAirport === ap && styles.chipTextActive]}>
              {ap}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.fieldLabel}>Cargo Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {[
          'General Cargo',
          'Perishable Cargo',
          'High-Value Cargo',
          'Commercial Samples',
          'Urgent Express Samples',
        ].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, airCargoCategory === cat && styles.chipActive]}
            onPress={() => setAirCargoCategory(cat)}
          >
            <Text style={[styles.chipText, airCargoCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.rowBetween}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder={`Actual Weight (${weightUnit})`}
          placeholderTextColor="#7C8BA1"
          keyboardType="numeric"
          value={airActualWeight}
          onChangeText={setAirActualWeight}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Packages"
          placeholderTextColor="#7C8BA1"
          keyboardType="numeric"
          value={airPackages}
          onChangeText={setAirPackages}
        />
      </View>

      <View style={styles.rowBetween}>
        <TextInput
          style={[styles.input, styles.thirdInput]}
          placeholder={`L (${dimUnit})`}
          placeholderTextColor="#7C8BA1"
          keyboardType="numeric"
          value={airLen}
          onChangeText={setAirLen}
        />
        <TextInput
          style={[styles.input, styles.thirdInput]}
          placeholder={`W (${dimUnit})`}
          placeholderTextColor="#7C8BA1"
          keyboardType="numeric"
          value={airWid}
          onChangeText={setAirWid}
        />
        <TextInput
          style={[styles.input, styles.thirdInput]}
          placeholder={`H (${dimUnit})`}
          placeholderTextColor="#7C8BA1"
          keyboardType="numeric"
          value={airHei}
          onChangeText={setAirHei}
        />
      </View>

      <Text style={styles.fieldLabel}>Volumetric Divisor (Configurable per service)</Text>
      <View style={styles.inlineWrap}>
        {['5000', '6000', '4000'].map((div) => (
          <TouchableOpacity
            key={div}
            style={[styles.smallChip, volDivisor === div && styles.chipActive]}
            onPress={() => setVolDivisor(div)}
          >
            <Text style={[styles.smallChipText, volDivisor === div && styles.chipTextActive]}>
              Divisor {div}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Chargeable Weight Calculator (Local)</Text>
        <Text style={styles.summaryLine}>
          Actual Weight: {airWeightCalc.actualDisplay.toFixed(2)} {weightUnit}
        </Text>
        <Text style={styles.summaryLine}>
          Volumetric Weight: {airWeightCalc.volumetricDisplay.toFixed(2)} {weightUnit}
        </Text>
        <Text style={styles.summaryHighlight}>
          Chargeable Weight: {airWeightCalc.chargeableDisplay.toFixed(2)} {weightUnit} (Indicative)
        </Text>
      </View>

      <View style={styles.blockCard}>
        <Text style={styles.blockTitle}>Air Document Checklist</Text>
        <Text style={styles.summaryLine}>
          • Commercial Invoice & Packing List • Air Waybill (AWB) • Shipper & Consignee Details • MSDS / DG or Permits (if applicable)
        </Text>
      </View>

      <View style={styles.blockCard}>
        <Text style={styles.blockTitle}>Free (Beta) vs Paid (Future) Boundaries</Text>
        <Text style={styles.summaryLine}>
          Free / Beta: Route/airport selection, chargeable-weight calculator, document checklist & inquiry draft.
        </Text>
        <Text style={styles.summaryLine}>
          Paid / Future: Confirmed carrier quotes, live capacity, priority booking & customs/consolidation services.
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmitAirInquiry}>
        <Text style={styles.primaryBtnText}>Save Air Inquiry (Request Only)</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSampleTrackingSection = () => (
    <View style={styles.panel}>
      <View style={styles.rowBetween}>
        <Text style={styles.panelTitle}>4. Sample & Tracking</Text>
        <Text style={styles.badgePreview}>MANUAL BETA</Text>
      </View>
      <Text style={styles.subHint}>
        Unified sample express & tracking workflow (linked with SetuVerify / Lab Testing).
      </Text>

      <Text style={styles.fieldLabel}>Courier / Express Provider</Text>
      <View style={styles.inlineWrap}>
        {['DHL Express', 'FedEx', 'Express Partner', 'Drop-off'].map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.smallChip, sampleCourier === c && styles.chipActive]}
            onPress={() => setSampleCourier(c)}
          >
            <Text style={[styles.smallChipText, sampleCourier === c && styles.chipTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Sender Details & Sample Purpose / Description"
        placeholderTextColor="#7C8BA1"
        value={senderDetails}
        onChangeText={setSenderDetails}
      />
      <TextInput
        style={styles.input}
        placeholder="Pickup Address (Factory / Office / Warehouse)"
        placeholderTextColor="#7C8BA1"
        value={pickupAddress}
        onChangeText={setPickupAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Receiver / Laboratory Details & Destination Country"
        placeholderTextColor="#7C8BA1"
        value={receiverLab}
        onChangeText={setReceiverLab}
      />
      <TextInput
        style={styles.input}
        placeholder="Manual Tracking / AWB Reference"
        placeholderTextColor="#7C8BA1"
        value={trackingRef}
        onChangeText={setTrackingRef}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerateSampleRef}>
        <Text style={styles.primaryBtnText}>Create Sample Shipment Request</Text>
      </TouchableOpacity>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Manual Sample Status</Text>
        <Text style={styles.summaryLine}>Sample Ref ID: {sampleRefId}</Text>
        <Text style={styles.summaryLine}>
          Courier: {sampleCourier} • AWB: {trackingRef || 'Pending entry'}
        </Text>
        <Text style={styles.summaryHighlight}>Status: {sampleStatus}</Text>
      </View>

      <View style={styles.comingSoonBox}>
        <View style={styles.rowBetween}>
          <Text style={styles.summaryTitle}>Live Tracker & Auto-Sync</Text>
          <Text style={styles.badgeSoon}>COMING SOON</Text>
        </View>
        <Text style={styles.summaryLine}>
          • Live Shipment Tracking & Real-Time GPS Tracking • Automatic Carrier Status Sync • Automatic Document Sync • Advanced Alerts
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          {onBack ? (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.headerTitleWrap}>
            <Text style={styles.screenTitle}>Global Logistics Hub</Text>
            <Text style={styles.screenSub}>
              Trade SETUU • Global Trade OS (Beta)
            </Text>
          </View>
          <View style={styles.betaPill}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>

        {renderGlobalConfigBar()}

        <View style={styles.topTabsRow}>
          {[
            { id: 'INLAND', label: 'Inland' },
            { id: 'OCEAN', label: 'Ocean' },
            { id: 'AIR', label: 'Air Freight' },
            { id: 'SAMPLE', label: 'Sample & Track' },
          ].map((t) => {
            const active = activeTab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.topTabBtn, active && styles.topTabBtnActive]}
                onPress={() => setActiveTab(t.id)}
              >
                <Text style={[styles.topTabText, active && styles.topTabTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'INLAND' && renderInlandSection()}
        {activeTab === 'OCEAN' && renderOceanSection()}
        {activeTab === 'AIR' && renderAirSection()}
        {activeTab === 'SAMPLE' && renderSampleTrackingSection()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#151E30',
  },
  backText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  screenSub: {
    color: '#94A3B8',
    fontSize: 12,
  },
  betaPill: {
    backgroundColor: '#0F172A',
    borderColor: '#38BDF8',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  betaText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  configCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
  },
  sectionMiniTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  tagZeroApi: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 6,
    marginBottom: 5,
    fontWeight: '600',
  },
  chipRow: {
    marginBottom: 6,
  },
  inlineWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#243046',
    marginRight: 7,
  },
  chipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#60A5FA',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  smallChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#243046',
  },
  smallChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  halfCol: {
    width: '48.5%',
  },
  topTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  topTabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  topTabBtnActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#60A5FA',
  },
  topTabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  topTabTextActive: {
    color: '#FFFFFF',
  },
  panel: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subHint: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
    lineHeight: 17,
  },
  badgePreview: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  badgeRequest: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '700',
  },
  badgeSoon: {
    color: '#F472B6',
    fontSize: 10,
    fontWeight: '700',
  },
  subToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  subToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#090D16',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#243046',
  },
  subToggleActive: {
    backgroundColor: '#172554',
    borderColor: '#38BDF8',
  },
  subToggleText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#090D16',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#243046',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 13,
    marginBottom: 9,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  halfInput: {
    width: '48.5%',
  },
  thirdInput: {
    width: '31.5%',
  },
  blockCard: {
    backgroundColor: '#090D16',
    borderRadius: 10,
    padding: 11,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  blockTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  summaryBox: {
    backgroundColor: '#090D16',
    borderRadius: 10,
    padding: 11,
    borderWidth: 1,
    borderColor: '#243046',
    marginBottom: 10,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  summaryLine: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 17,
  },
  summaryHighlight: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  noticeText: {
    color: '#FBBF24',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  comingSoonBox: {
    backgroundColor: '#090D16',
    borderRadius: 10,
    padding: 11,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
