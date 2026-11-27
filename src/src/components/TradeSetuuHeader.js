import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function TradeSetuuHeader({
  searchQuery = '',
  onChangeSearch,
  onOpenMenu,
  onBack,
  title = '',
  onOpenChat,
  unreadChats = 2,
  onOpenNotifications,
  unreadNotifs = 3,
  onOpenSettings,
}) {
  const renderLogo = () => (
    <View style={styles.logoCircle}>
<Image
  source={require('../../../1795099375380.png')}
  style={styles.logoImage}
  resizeMode="contain"
/>

    </View>
  );

  if (onBack) {
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.subCenter}>
          {renderLogo()}
          <Text style={styles.subTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings}>
          <Text style={styles.iconTxt}>⚙️</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onOpenMenu} activeOpacity={0.8}>
        {renderLogo()}
      </TouchableOpacity>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, ports, RFQs..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={onChangeSearch}
        />
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.iconBtn} onPress={onOpenChat}>
          <Text style={styles.iconTxt}>💬</Text>
          {unreadChats > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{unreadChats}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onOpenNotifications}>
          <Text style={styles.iconTxt}>🔔</Text>
          {unreadNotifs > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{unreadNotifs}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings}>
          <Text style={styles.iconTxt}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    backgroundColor: '#09131E',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 38,
    height: 38,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16263A',
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 36,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#253952',
  },
  searchIcon: { fontSize: 12, marginRight: 6 },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    paddingVertical: 0,
  },
  rightActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    position: 'relative',
  },
  iconTxt: { fontSize: 14 },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#0D9488',
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeTxt: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    marginRight: 8,
  },
  backTxt: { color: '#C9B89A', fontSize: 12, fontWeight: '800' },
  subCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 9,
    flex: 1,
  },
});
