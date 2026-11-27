// src/screens/CreatePostScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StyleSheet,
} from 'react-native';

const POST_TYPES = ['Sell Offer', 'Buy Requirement', 'Available Stock', 'Logistics'];

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_OTHER_BYTES = 10 * 1024 * 1024; // 10 MB (Image / PDF / Docs)

function polishTradePostDraft({ postType, title, body, commodity, portRoute, quantity }) {
  const rawBody = (body || '').trim();
  const cleanTitle =
    (title || '').trim() ||
    (commodity ? `${commodity.trim()} — ${postType}` : `${postType} Update`);

  const details = [];
  if (commodity?.trim()) details.push(`Commodity: ${commodity.trim()}`);
  if (quantity?.trim()) details.push(`Quantity: ${quantity.trim()}`);
  if (portRoute?.trim()) details.push(`Port / Route: ${portRoute.trim()}`);

  const structuredIntro =
    rawBody ||
    `Sharing a ${postType.toLowerCase()} for verified trade partners. Please connect with specs and terms.`;

  const normalizedSentences = structuredIntro
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?।])\s+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

  const metaBlock = details.length > 0 ? `\n\n${details.join(' · ')}` : '';
  const footerLine = '\n\nSerious inquiries / quotes welcome via DM.';

  return {
    polishedTitle: cleanTitle,
    polishedBody: `${normalizedSentences}${metaBlock}${footerLine}`.trim(),
  };
}

export default function CreatePostScreen({
  onClose,
  onPublishPost,
  onPickMedia, // Optional hook from parent/picker: returns { type: 'image'|'video'|'pdf', name, sizeBytes, uri }
  onStartVoiceInput, // Optional hook from parent: returns transcribed string
}) {
  const [postType, setPostType] = useState('Sell Offer');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [commodity, setCommodity] = useState('');
  const [quantity, setQuantity] = useState('');
  const [portRoute, setPortRoute] = useState('');

  const [mediaAttachment, setMediaAttachment] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [aiPolishedApplied, setAiPolishedApplied] = useState(false);

  const validateAndAttachMedia = (file) => {
    if (!file) return;
    const sizeBytes = Number(file.sizeBytes || 0);
    const isVideo = file.type === 'video';
    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_OTHER_BYTES;

    if (sizeBytes > limit) {
      const maxMb = isVideo ? 50 : 10;
      Alert.alert(
        'File Size Limit Exceeded',
        `${isVideo ? 'Video' : 'Image/PDF'} must be within ${maxMb} MB.`
      );
      return;
    }

    setMediaAttachment(file);
  };

  const handleAttachSampleOrPicker = async (type) => {
    if (typeof onPickMedia === 'function') {
      const picked = await onPickMedia(type);
      validateAndAttachMedia(picked);
      return;
    }

    // Safe local attachment preview when external picker hook isn't wired yet
    if (type === 'video') {
      validateAndAttachMedia({
        type: 'video',
        name: 'Shipment_Inspection_Clip.mp4',
        sizeBytes: 18 * 1024 * 1024, // 18 MB (under 50 MB limit)
        duration: '0:35',
        uri: '',
      });
    } else if (type === 'image') {
      validateAndAttachMedia({
        type: 'image',
        name: 'Cargo_Lot_Photo.jpg',
        sizeBytes: 2.4 * 1024 * 1024, // 2.4 MB (under 10 MB limit)
        uri: '',
      });
    } else if (type === 'pdf') {
      validateAndAttachMedia({
        type: 'pdf',
        name: 'Trade_Specification_Sheet.pdf',
        sizeBytes: 1.5 * 1024 * 1024, // 1.5 MB (under 10 MB limit)
        uri: '',
      });
    }
  };

  const handleVoicePress = async () => {
    setIsListening(true);
    try {
      if (typeof onStartVoiceInput === 'function') {
        const spoken = await onStartVoiceInput();
        if (spoken) {
          setBody((prev) => (prev ? `${prev} ${spoken}` : spoken));
          setAiPolishedApplied(false);
        }
      } else {
        Alert.alert(
          'Voice Input Ready',
          'Aap yahan bol kar jo draft likhna chahte hain woh type ya paste kar sakte hain—aur phir AI Improve daba kar use clean trade post mein badal sakte hain.'
        );
      }
    } finally {
      setIsListening(false);
    }
  };

  const handleAiImprove = () => {
    if (!body.trim() && !title.trim() && !commodity.trim()) {
      Alert.alert('Nothing to Improve', 'Pehle post ka kuch text, commodity ya voice draft daalein.');
      return;
    }

    const { polishedTitle, polishedBody } = polishTradePostDraft({
      postType,
      title,
      body,
      commodity,
      portRoute,
      quantity,
    });

    setTitle(polishedTitle);
    setBody(polishedBody);
    setAiPolishedApplied(true);
  };

  const handlePublish = () => {
    if (!title.trim() && !body.trim()) {
      Alert.alert('Post Required', 'Please enter a headline or trade details before posting.');
      return;
    }

    const metaParts = [];
    if (quantity.trim()) metaParts.push(`Qty: ${quantity.trim()}`);
    if (portRoute.trim()) metaParts.push(`Route/Port: ${portRoute.trim()}`);
    if (commodity.trim()) metaParts.push(`Item: ${commodity.trim()}`);

    const newPost = {
      id: `post-${Date.now()}`,
      company: 'My Trade Desk',
      badge: 'Verified Member · Just now',
      type: postType,
      title: title.trim() || `${commodity.trim() || postType} Update`,
      body: body.trim(),
      meta: metaParts.join(' · '),
      cta: 'Send Inquiry →',
      media: mediaAttachment
        ? mediaAttachment.type === 'pdf'
          ? {
              type: 'pdf',
              fileName: mediaAttachment.name,
              fileSize: `${((mediaAttachment.sizeBytes || 0) / (1024 * 1024)).toFixed(1)} MB · PDF`,
              url: mediaAttachment.uri || '',
            }
          : mediaAttachment.type === 'video'
          ? {
              type: 'video',
              thumbnail: '',
              duration: mediaAttachment.duration || 'Video',
              url: mediaAttachment.uri || '',
            }
          : {
              type: 'image',
              url: mediaAttachment.uri || '',
              uri: mediaAttachment.uri || '',
            }
        : null,
    };

    if (typeof onPublishPost === 'function') {
      onPublishPost(newPost);
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Full-Screen Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.topBtn}>
          <Text style={styles.cancelTxt}>✕ Close</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create Trade Post</Text>

        <TouchableOpacity onPress={handlePublish} style={styles.publishBtn}>
          <Text style={styles.publishTxt}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Post Type Selection */}
        <Text style={styles.label}>Post Type</Text>
        <View style={styles.chipRow}>
          {POST_TYPES.map((type) => {
            const active = postType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, active && styles.typeChipActive]}
                onPress={() => setPostType(type)}
              >
                <Text style={[styles.typeChipTxt, active && styles.typeChipTxtActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Headline */}
        <Text style={styles.label}>Headline</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 500 MT IR64 Rice available for export"
          placeholderTextColor="#64748B"
          value={title}
          onChangeText={(val) => {
            setTitle(val);
            setAiPolishedApplied(false);
          }}
        />

        {/* Quick Trade Specs */}
        <View style={styles.rowGap}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Commodity</Text>
            <TextInput
              style={styles.input}
              placeholder="Rice / Maize / Spices"
              placeholderTextColor="#64748B"
              value={commodity}
              onChangeText={setCommodity}
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500 MT"
              placeholderTextColor="#64748B"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
        </View>

        <Text style={styles.label}>Port / Route / Terms</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., JNPT to Jebel Ali · CIF / FOB"
          placeholderTextColor="#64748B"
          value={portRoute}
          onChangeText={setPortRoute}
        />

        {/* Main Post Body + Voice & AI Improve */}
        <View style={styles.bodyHeaderRow}>
          <Text style={styles.label}>Post Details</Text>
          <View style={styles.aiToolsRow}>
            <TouchableOpacity style={styles.voiceBtn} onPress={handleVoicePress}>
              <Text style={styles.voiceBtnTxt}>
                {isListening ? 'Listening...' : '🎙 Voice'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.aiImproveBtn} onPress={handleAiImprove}>
              <Text style={styles.aiImproveTxt}>✨ AI Improve</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write specs, packing, pricing terms, or paste voice notes..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={body}
          onChangeText={(val) => {
            setBody(val);
            setAiPolishedApplied(false);
          }}
        />

        {aiPolishedApplied ? (
          <Text style={styles.aiStatusNote}>
            AI Improve applied — review and edit freely before posting.
          </Text>
        ) : null}

        {/* Media Attachment Section (Max 50MB Video, Max 10MB Image/PDF) */}
        <Text style={styles.label}>Attach Media (Video ≤ 50 MB · Image/PDF ≤ 10 MB)</Text>
        <View style={styles.mediaBtnRow}>
          <TouchableOpacity
            style={styles.mediaBtn}
            onPress={() => handleAttachSampleOrPicker('image')}
          >
            <Text style={styles.mediaBtnTxt}>+ Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mediaBtn}
            onPress={() => handleAttachSampleOrPicker('video')}
          >
            <Text style={styles.mediaBtnTxt}>+ Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mediaBtn}
            onPress={() => handleAttachSampleOrPicker('pdf')}
          >
            <Text style={styles.mediaBtnTxt}>+ PDF</Text>
          </TouchableOpacity>
        </View>

        {mediaAttachment ? (
          <View style={styles.attachedBox}>
            <View style={styles.flexOne}>
              <Text style={styles.attachedName} numberOfLines={1}>
                {mediaAttachment.name}
              </Text>
              <Text style={styles.attachedMeta}>
                {mediaAttachment.type.toUpperCase()} ·{' '}
                {((mediaAttachment.sizeBytes || 0) / (1024 * 1024)).toFixed(1)} MB
              </Text>
            </View>
            <TouchableOpacity onPress={() => setMediaAttachment(null)}>
              <Text style={styles.removeTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07121E' },
  flexOne: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#0D1B2A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  cancelTxt: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  headerTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  publishBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  publishTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  content: { padding: 14, paddingBottom: 36 },
  label: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 16,
  },
  typeChipActive: { backgroundColor: '#0D9488', borderColor: '#0D9488' },
  typeChipTxt: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  typeChipTxtActive: { color: '#FFFFFF' },
  input: {
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
  },
  rowGap: { flexDirection: 'row', gap: 10 },
  halfCol: { flex: 1 },
  bodyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  aiToolsRow: { flexDirection: 'row', gap: 8 },
  voiceBtn: {
    backgroundColor: '#16263A',
    borderWidth: 1,
    borderColor: '#253952',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  voiceBtnTxt: { color: '#E2E8F0', fontSize: 11, fontWeight: '700' },
  aiImproveBtn: {
    backgroundColor: 'rgba(20, 184, 166, 0.16)',
    borderWidth: 1,
    borderColor: '#14B8A6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  aiImproveTxt: { color: '#2DD4BF', fontSize: 11, fontWeight: '800' },
  textArea: { minHeight: 125 },
  aiStatusNote: { color: '#2DD4BF', fontSize: 11, marginTop: 5 },
  mediaBtnRow: { flexDirection: 'row', gap: 8 },
  mediaBtn: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  mediaBtnTxt: { color: '#E2E8F0', fontSize: 12, fontWeight: '700' },
  attachedBox: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#091522',
    borderWidth: 1,
    borderColor: '#1E324A',
    borderRadius: 9,
    padding: 10,
  },
  attachedName: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  attachedMeta: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  removeTxt: { color: '#F87171', fontSize: 12, fontWeight: '700', marginLeft: 10 },
});
      
