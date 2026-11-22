import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  validateAttachment,
  ATTACHMENT_LIMITS_MB,
} from '../utils/attachmentHelper';

const DEFAULT_QUICK_DOCS = [
  'Commercial_Invoice.pdf',
  'Packing_List.pdf',
  'Bill_of_Lading.pdf',
  'Shipping_Bill.pdf',
];

export default function DocAttachmentBox({
  label = 'Attach Documents / Refs',
  items = [],
  onChangeItems,
  quickTags = DEFAULT_QUICK_DOCS,
  placeholder = 'e.g. CI_104.pdf or PO_Order.docx',
  context = 'service',
  onPickerRequest,
}) {
  const [inputVal, setInputVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = (rawName) => {
    const clean = (rawName || '').trim();
    if (!clean) return;

    const check = validateAttachment({ name: clean }, context);
    if (!check.ok) {
      setErrorMsg(check.error);
      return;
    }

    const exists = items.some(
      (it) => (typeof it === 'string' ? it : it.name) === clean
    );
    if (exists) {
      setErrorMsg('Already attached.');
      return;
    }

    setErrorMsg('');
    if (typeof onChangeItems === 'function') {
      onChangeItems([...items, clean]);
    }
    setInputVal('');
  };

  const handleRemove = (targetName) => {
    setErrorMsg('');
    if (typeof onChangeItems === 'function') {
      onChangeItems(
        items.filter((it) => (typeof it === 'string' ? it : it.name) !== targetName)
      );
    }
  };

  return (
    <View style={styles.box}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          {label} ({items.length})
        </Text>

        {typeof onPickerRequest === 'function' ? (
          <TouchableOpacity onPress={onPickerRequest} style={styles.pickerBtn}>
            <Text style={styles.pickerBtnText}>Pick File / Image</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.limitTag}>
            Max {ATTACHMENT_LIMITS_MB.DOCUMENT_MAX_MB}MB Docs/Imgs
          </Text>
        )}
      </View>

      <View style={styles.row}>
        <TextInput
          value={inputVal}
          onChangeText={(txt) => {
            setInputVal(txt);
            if (errorMsg) setErrorMsg('');
          }}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          style={[styles.input, styles.flexInput]}
        />
        <TouchableOpacity
          onPress={() => handleAdd(inputVal)}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ Attach</Text>
        </TouchableOpacity>
      </View>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {quickTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => handleAdd(tag)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>+ {tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item) => {
            const name = typeof item === 'string' ? item : item.name;
            return (
              <View key={name} style={styles.itemRow}>
                <Text style={styles.itemText} numberOfLines={1}>
                  📄 {name}
                </Text>
                <TouchableOpacity onPress={() => handleRemove(name)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ) : null}

      <Text style={styles.helperNote}>
        Limits: Docs & Images up to {ATTACHMENT_LIMITS_MB.DOCUMENT_MAX_MB} MB | Video up to{' '}
        {ATTACHMENT_LIMITS_MB.VIDEO_CHAT_SHARE_MAX_MB} MB (Chat/Share) &{' '}
        {ATTACHMENT_LIMITS_MB.VIDEO_POST_MAX_MB} MB (Post only).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 4,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  limitTag: {
    color: '#94A3B8',
    fontSize: 10.5,
  },
  pickerBtn: {
    backgroundColor: 'rgba(45, 212, 191, 0.14)',
    borderWidth: 1,
    borderColor: '#2DD4BF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pickerBtnText: {
    color: '#2DD4BF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  flexInput: {
    flex: 1,
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: 'rgba(243, 210, 122, 0.16)',
    borderWidth: 1,
    borderColor: '#F3D27A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addBtnText: {
    color: '#F3D27A',
    fontSize: 12,
    fontWeight: '800',
  },
  errorText: {
    color: '#F87171',
    fontSize: 11.5,
    marginTop: 5,
  },
  chipsRow: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  chip: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  list: {
    marginTop: 8,
  },
  itemRow: {
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
  itemText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  removeText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '900',
  },
  helperNote: {
    color: '#64748B',
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4,
  },
});
