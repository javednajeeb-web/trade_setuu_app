// src/screens/CreatePostScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';

const POST_TYPES = ['Sell Offer', 'Buy Requirement', 'Available Stock', 'Logistics'];

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_OTHER_BYTES = 10 * 1024 * 1024; // 10 MB (Image / PDF)

function safeRequire(moduleName) {
  try {
    // Dynamic require wrapped in try/catch for optional Expo/RN packages
    // eslint-disable-next-line global-require
    return require(moduleName);
  } catch (e) {
    return null;
  }
}

function formatBytesToMb(bytes) {
  const num = Number(bytes || 0);
  if (!num) return '0.0 MB';
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CreatePostScreen({
  onClose,
  onPublishPost,
  onPickMedia, // Optional hook: async (mediaType) => { type, name, sizeBytes, uri, duration }
  onStartVoiceInput, // Optional hook: async () => spokenString
  onOpenAiCopilot, // Optional hook: (contextPayload) => void
  appliedDraft, // Optional draft payload from SETU AI Co-Pilot
  onConsumedAppliedDraft, // Optional callback after consuming appliedDraft
}) {
  const [postType, setPostType] = useState('Sell Offer');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [commodity, setCommodity] = useState('');
  const [quantity, setQuantity] = useState('');
  const [portRoute, setPortRoute] = useState('');

  const [mediaAttachment, setMediaAttachment] = useState(null);
  const [pickingMediaType, setPickingMediaType] = useState(null);

  // Voice input state & modal
  const [isListening, setIsListening] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const voiceSubRef = useRef(null);

  useEffect(() => {
    if (!appliedDraft) return;

    const draftStr =
      typeof appliedDraft === 'string'
        ? appliedDraft
        : appliedDraft.draftText || appliedDraft.body || '';

    if (draftStr.trim()) {
      setBody((prev) =>
        prev.trim() ? `${prev.trim()}\n\n${draftStr.trim()}` : draftStr.trim()
      );
      if (!title.trim() && appliedDraft.title) {
        setTitle(appliedDraft.title.trim());
      }
    }

    if (typeof onConsumedAppliedDraft === 'function') {
      onConsumedAppliedDraft();
    }
  }, [appliedDraft, onConsumedAppliedDraft, title]);

  useEffect(() => {
    return () => {
      if (voiceSubRef.current && typeof voiceSubRef.current.remove === 'function') {
        voiceSubRef.current.remove();
      }
    };
  }, []);

  const validateAndAttachMedia = (file) => {
    if (!file) return false;

    const mediaType = file.type || 'image';
    const sizeBytes = Number(file.sizeBytes ?? file.size ?? 0);
    const isVideo = mediaType === 'video';
    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_OTHER_BYTES;

    if (sizeBytes > limit) {
      const maxMb = isVideo ? 50 : 10;
      Alert.alert(
        'File Size Limit Exceeded',
        `${isVideo ? 'Video' : mediaType.toUpperCase()} size (${formatBytesToMb(
          sizeBytes
        )}) exceeds the ${maxMb} MB limit.`
      );
      return false;
    }

    setMediaAttachment({
      type: mediaType,
      name:
        file.name ||
        (mediaType === 'video'
          ? 'trade_video.mp4'
          : mediaType === 'pdf'
          ? 'trade_document.pdf'
          : 'trade_photo.jpg'),
      sizeBytes,
      uri: file.uri || '',
      duration: file.duration || (mediaType === 'video' ? 'Video' : undefined),
    });
    return true;
  };

  const pickFromDevice = async (type) => {
    // 1. Custom parent hook if provided
    if (typeof onPickMedia === 'function') {
      const customResult = await onPickMedia(type);
      if (customResult) {
        validateAndAttachMedia(customResult);
      }
      return;
    }

    // 2. PDF via expo-document-picker if available
    if (type === 'pdf') {
      const DocPicker = safeRequire('expo-document-picker');
      if (DocPicker && typeof DocPicker.getDocumentAsync === 'function') {
        const res = await DocPicker.getDocumentAsync({
          type: 'application/pdf',
          copyToCacheDirectory: true,
          multiple: false,
        });

        if (res?.canceled) return;
        const asset = Array.isArray(res?.assets) ? res.assets[0] : res;
        if (asset) {
          validateAndAttachMedia({
            type: 'pdf',
            name: asset.name || 'Trade_Document.pdf',
            sizeBytes: asset.size || 0,
            uri: asset.uri || '',
          });
        }
        return;
      }
    }

    // 3. Image / Video via expo-image-picker if available
    if (type === 'image' || type === 'video') {
      const ImagePicker = safeRequire('expo-image-picker');
      if (ImagePicker && typeof ImagePicker.launchImageLibraryAsync === 'function') {
        if (typeof ImagePicker.requestMediaLibraryPermissionsAsync === 'function') {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (perm && perm.granted === false) {
            Alert.alert(
              'Permission Needed',
              'Please allow gallery/media access in device settings to upload files.'
            );
            return;
          }
        }

        const mediaTypesOption =
          ImagePicker.MediaTypeOptions && type === 'video'
            ? ImagePicker.MediaTypeOptions.Videos
            : ImagePicker.MediaTypeOptions
            ? ImagePicker.MediaTypeOptions.Images
            : type === 'video'
            ? ['videos']
            : ['images'];

        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: mediaTypesOption,
          allowsEditing: false,
          quality: 0.85,
        });

        if (res?.canceled) return;
        const asset = Array.isArray(res?.assets) ? res.assets[0] : res;
        if (asset) {
          const durationSec = asset.duration ? Math.round(asset.duration / 1000) : null;
          const durationLabel =
            type === 'video' && durationSec
              ? `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`
              : type === 'video'
              ? 'Video'
              : undefined;

          validateAndAttachMedia({
            type,
            name:
              asset.fileName ||
              (type === 'video' ? 'Shipment_Clip.mp4' : 'Cargo_Photo.jpg'),
            sizeBytes: asset.fileSize || 0,
            uri: asset.uri || '',
            duration: durationLabel,
          });
        }
        return;
      }
    }

    // 4. Fallback if native/Expo picker module is not installed in current build
    Alert.alert(
      'Device Picker Unavailable',
      `Install expo-image-picker / expo-document-picker or pass onPickMedia. Attach a sample ${type.toUpperCase()} preview to test post layout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Attach Sample',
          onPress: () => {
            if (type === 'video') {
              validateAndAttachMedia({
                type: 'video',
                name: 'Shipment_Inspection_Clip.mp4',
                sizeBytes: 18 * 1024 * 1024,
                duration: '0:35',
                uri: '',
              });
            } else if (type === 'pdf') {
              validateAndAttachMedia({
                type: 'pdf',
                name: 'Trade_Specification_Sheet.pdf',
                sizeBytes: 1.5 * 1024 * 1024,
                uri: '',
              });
            } else {
              validateAndAttachMedia({
                type: 'image',
                name: 'Cargo_Lot_Photo.jpg',
                sizeBytes: 2.4 * 1024 * 1024,
                uri: '',
              });
            }
          },
        },
      ]
    );
  };

  const handleMediaPress = async (type) => {
    if (pickingMediaType) return;
    setPickingMediaType(type);
    try {
      await pickFromDevice(type);
    } catch (err) {
      Alert.alert('Upload Error', err?.message || 'Could not select media from device.');
    } finally {
      setPickingMediaType(null);
    }
  };

  const handleVoicePress = async () => {
    if (typeof onStartVoiceInput === 'function') {
      setIsListening(true);
      try {
        const spoken = await onStartVoiceInput();
        if (spoken && String(spoken).trim()) {
          const clean = String(spoken).trim();
          setBody((prev) => (prev.trim() ? `${prev.trim()} ${clean}` : clean));
        }
      } catch (err) {
        Alert.alert('Voice Error', err?.message || 'Voice input failed.');
      } finally {
        setIsListening(false);
      }
      return;
    }

    const SpeechModule = safeRequire('expo-speech-recognition');
    const ExpoSpeechRecognitionModule = SpeechModule?.ExpoSpeechRecognitionModule;
    const useSpeechEvent = SpeechModule?.useSpeechEvent;

    if (
      ExpoSpeechRecognitionModule &&
      typeof ExpoSpeechRecognitionModule.requestPermissionsAsync === 'function' &&
      typeof ExpoSpeechRecognitionModule.start === 'function' &&
      typeof useSpeechEvent !== 'function'
    ) {
      try {
        const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (perm && perm.granted === false) {
          Alert.alert('Microphone Permission', 'Allow microphone access to use voice input.');
          return;
        }
        setVoiceTranscript('');
        setVoiceModalVisible(true);
        setIsListening(true);
        ExpoSpeechRecognitionModule.start({
          lang: 'hi-IN',
          interimResults: true,
        });
        return;
      } catch (e) {
        // Fall through to manual dictation modal
      }
    }

    setVoiceTranscript('');
    setVoiceModalVisible(true);
  };

  const handleApplyVoiceText = (mode = 'append') => {
    const clean = (voiceTranscript || '').trim();
    if (!clean) {
      setVoiceModalVisible(false);
      setIsListening(false);
      return;
    }

    if (mode === 'replace') {
      setBody(clean);
    } else {
      setBody((prev) => (prev.trim() ? `${prev.trim()} ${clean}` : clean));
    }

    setVoiceTranscript('');
    setVoiceModalVisible(false);
    setIsListening(false);
  };

  const handleAskSetuAi = () => {
    const contextPayload = {
      screenName: 'CreatePostScreen',
      type: 'post_draft',
      title: title.trim() || `${commodity.trim() || postType} Draft`,
      summary: [
        `Type: ${postType}`,
        commodity.trim() ? `Commodity: ${commodity.trim()}` : '',
        quantity.trim() ? `Qty: ${quantity.trim()}` : '',
        portRoute.trim() ? `Route/Port: ${portRoute.trim()}` : '',
        body.trim() ? `Current Notes: ${body.trim().slice(0, 140)}` : '',
      ]
        .filter(Boolean)
        .join(' · '),
    };

    if (typeof onOpenAiCopilot === 'function') {
      onOpenAiCopilot(contextPayload);
    } else {
      Alert.alert(
        'SETU AI Co-Pilot',
        'Open SETU AI Co-Pilot from the floating trigger to draft or refine your trade post.'
      );
    }
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
              fileSize: `${formatBytesToMb(mediaAttachment.sizeBytes)} · PDF`,
              url: mediaAttachment.uri || '',
              uri: mediaAttachment.uri || '',
            }
          : mediaAttachment.type === 'video'
          ? {
              type: 'video',
              thumbnail: '',
              duration: mediaAttachment.duration || 'Video',
              url: mediaAttachment.uri || '',
              uri: mediaAttachment.uri || '',
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
          onChangeText={setTitle}
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

        {/* Main Post Body + Voice & SETU AI Co-Pilot */}
        <View style={styles.bodyHeaderRow}>
          <Text style={styles.label}>Post Details</Text>
          <View style={styles.aiToolsRow}>
            <TouchableOpacity style={styles.voiceBtn} onPress={handleVoicePress}>
              <Text style={styles.voiceBtnTxt}>
                {isListening ? 'Listening...' : '🎙 Voice'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.copilotBtn} onPress={handleAskSetuAi}>
              <Text style={styles.copilotBtnTxt}>SETU AI</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write specs, packing, pricing terms, or use Voice / SETU AI..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={body}
          onChangeText={setBody}
        />

        {/* Media Attachment Section (Max 50MB Video, Max 10MB Image/PDF) */}
        <Text style={styles.label}>Upload from Device (Video ≤ 50 MB · Image/PDF ≤ 10 MB)</Text>
        <View style={styles.mediaBtnRow}>
          <TouchableOpacity
            style={styles.mediaBtn}
            disabled={Boolean(pickingMediaType)}
            onPress={() => handleMediaPress('image')}
          >
            <Text style={styles.mediaBtnTxt}>
              {pickingMediaType === 'image' ? 'Selecting...' : '+ Image'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mediaBtn}
            disabled={Boolean(pickingMediaType)}
            onPress={() => handleMediaPress('video')}
          >
            <Text style={styles.mediaBtnTxt}>
              {pickingMediaType === 'video' ? 'Selecting...' : '+ Video'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mediaBtn}
            disabled={Boolean(pickingMediaType)}
            onPress={() => handleMediaPress('pdf')}
          >
            <Text style={styles.mediaBtnTxt}>
              {pickingMediaType === 'pdf' ? 'Selecting...' : '+ PDF'}
            </Text>
          </TouchableOpacity>
        </View>

        {mediaAttachment ? (
          <View style={styles.attachedBox}>
            <View style={styles.flexOne}>
              <Text style={styles.attachedName} numberOfLines={1}>
                {mediaAttachment.name}
              </Text>
              <Text style={styles.attachedMeta}>
                {mediaAttachment.type.toUpperCase()} · {formatBytesToMb(mediaAttachment.sizeBytes)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setMediaAttachment(null)}>
              <Text style={styles.removeTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* Voice Dictation / Input Modal */}
      <Modal
        visible={voiceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setVoiceModalVisible(false);
          setIsListening(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Voice Input · Post Details</Text>
            <Text style={styles.modalSub}>
              Tap the keyboard mic to dictate in Hindi/English or paste spoken notes below.
            </Text>

            <TextInput
              style={[styles.input, styles.voiceInput]}
              placeholder="Speak or type your trade post notes here..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={voiceTranscript}
              onChangeText={setVoiceTranscript}
              autoFocus
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setVoiceModalVisible(false);
                  setIsListening(false);
                }}
              >
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => handleApplyVoiceText('replace')}
              >
                <Text style={styles.modalSecondaryTxt}>Replace</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => handleApplyVoiceText('append')}
              >
                <Text style={styles.modalPrimaryTxt}>Add to Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  copilotBtn: {
    backgroundColor: 'rgba(20, 184, 166, 0.16)',
    borderWidth: 1,
    borderColor: '#14B8A6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  copilotBtnTxt: { color: '#2DD4BF', fontSize: 11, fontWeight: '800' },
  textArea: { minHeight: 125 },
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#253952',
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  modalSub: { color: '#94A3B8', fontSize: 12, marginTop: 4, marginBottom: 10, lineHeight: 17 },
  voiceInput: { minHeight: 100 },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalCancelTxt: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  modalSecondaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#16263A',
    borderWidth: 1,
    borderColor: '#253952',
  },
  modalSecondaryTxt: { color: '#E2E8F0', fontSize: 12, fontWeight: '700' },
  modalPrimaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0D9488',
  },
  modalPrimaryTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
