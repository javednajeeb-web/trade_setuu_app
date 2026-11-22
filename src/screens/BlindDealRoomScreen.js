import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  StatusBar,
} from 'react-native';

const BLIND_ROOM_CARDS = [
  { key: 'neutral_lock', title: 'The Neutral Lock' },
  { key: 'jugaad_shield', title: 'Jugaad Shield' },
  { key: 'doc_vault', title: 'Doc Vault' },
  { key: 'ghost_comms', title: 'Ghost Comms' },
];

export default function BlindDealRoomScreen({ onBack }) {
  const [selectedCard, setSelectedCard] = useState(null);

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
        <Text style={styles.headerTitle}>Blind Deal Room</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {BLIND_ROOM_CARDS.map((card) => (
            <TouchableOpacity
              key={card.key}
              activeOpacity={0.85}
              onPress={() => setSelectedCard(card)}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(selectedCard)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCard(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {selectedCard ? selectedCard.title : ''}
            </Text>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
            <TouchableOpacity
              onPress={() => setSelectedCard(null)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 14,
    paddingBottom: 32,
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 15.5,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 17, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#2DD4BF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonText: {
    color: '#F3D27A',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 18,
    textAlign: 'center',
  },
  closeBtn: {
    backgroundColor: '#2DD4BF',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeBtnText: {
    color: '#050811',
    fontSize: 13.5,
    fontWeight: '900',
  },
});
    
