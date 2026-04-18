import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

const tabs = ['All', 'Saved', 'Purchased'];

const giftItems = [
  {
    id: '1',
    name: 'Wireless Earbuds',
    forPerson: "For Mom's Birthday",
    price: '$79.99',
    emoji: '📱',
    saved: true,
  },
  {
    id: '2',
    name: 'Book Collection',
    forPerson: "For Dad's Birthday",
    price: '$45.00',
    emoji: '📚',
    saved: false,
  },
  {
    id: '3',
    name: 'Art Supplies Kit',
    forPerson: 'For Sister',
    price: '$59.99',
    emoji: '🎨',
    saved: true,
  },
];

const GiftsScreen = () => {
  const [activeTab, setActiveTab] = useState('All');

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const tabsAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(giftItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(tabsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(100, cardAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      )),
    ]).start();
  }, []);

  const createFadeStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 0],
      }),
    }],
  });

  const renderGiftCard = (gift, index) => (
    <Animated.View
      key={gift.id}
      style={[styles.giftCard, createFadeStyle(cardAnims[index])]}
    >
      <TouchableOpacity style={styles.giftCardInner} activeOpacity={0.8}>
        <View style={styles.giftImage}>
          <Text style={styles.giftEmoji}>{gift.emoji}</Text>
        </View>
        <View style={styles.giftInfo}>
          <Text style={styles.giftName}>{gift.name}</Text>
          <Text style={styles.giftFor}>{gift.forPerson}</Text>
          <LinearGradient
            colors={['#E07B5C', '#D06A4C']}
            style={styles.priceTag}
          >
            <Text style={styles.priceText}>{gift.price}</Text>
          </LinearGradient>
        </View>
        <TouchableOpacity style={styles.heartBtn}>
          <Ionicons
            name={gift.saved ? 'heart' : 'heart-outline'}
            size={24}
            color={gift.saved ? '#E07B5C' : '#CCCCCC'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, createFadeStyle(headerAnim)]}>
        <Text style={styles.headerTitle}>Gift Ideas</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search-outline" size={20} color="#888888" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tabs */}
        <Animated.View style={[styles.tabsRow, createFadeStyle(tabsAnim)]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              {activeTab === tab ? (
                <LinearGradient
                  colors={['#E07B5C', '#D06A4C']}
                  style={styles.activeTabGradient}
                >
                  <Text style={styles.activeTabText}>{tab}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>{tab}</Text>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Gift Cards */}
        <View style={styles.giftsList}>
          {giftItems.map((gift, index) => renderGiftCard(gift, index))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeTab: {
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  activeTabGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888888',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  giftsList: {
    gap: 12,
  },
  giftCard: {
    marginBottom: 0,
  },
  giftCardInner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  giftImage: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: '#FDF8F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftEmoji: {
    fontSize: 32,
  },
  giftInfo: {
    flex: 1,
  },
  giftName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  giftFor: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 10,
  },
  priceTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heartBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GiftsScreen;
