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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

const tabs = ['All', 'Planned', 'Bought', 'Given'];

const giftItems = [
  {
    id: '1',
    name: 'Cookbook Collection',
    forPerson: 'For Mom',
    occasion: 'Birthday',
    price: '$45',
    emoji: '📚',
    status: 'planned',
  },
  {
    id: '2',
    name: 'Wireless Earbuds',
    forPerson: 'For Jake',
    occasion: 'Christmas',
    price: '$79',
    emoji: '🎧',
    status: 'bought',
  },
  {
    id: '3',
    name: 'Spa Gift Set',
    forPerson: 'For Sister',
    occasion: 'Birthday',
    price: '$35',
    emoji: '🌸',
    status: 'planned',
  },
];

const GiftsScreen = () => {
  const [activeTab, setActiveTab] = useState('All');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(giftItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(100, cardAnims.map(anim =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'planned':
        return { bg: '#FFF4E4', color: '#B8960D' };
      case 'bought':
        return { bg: colors.secondaryLight, color: colors.secondaryDark };
      default:
        return { bg: colors.primaryLight, color: colors.primary };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.title}>Gift Ideas</Text>
        </Animated.View>

        {/* Tabs */}
        <Animated.View style={[styles.tabsRow, { opacity: fadeAnim }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.tabActive
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive
                ]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Gift Cards */}
        {giftItems.map((gift, index) => {
          const statusStyle = getStatusStyle(gift.status);
          return (
            <Animated.View
              key={gift.id}
              style={[
                styles.giftCard,
                {
                  opacity: cardAnims[index],
                  transform: [{
                    translateY: cardAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity style={styles.giftCardInner} activeOpacity={0.8}>
                {/* Emoji */}
                <View style={styles.giftImage}>
                  <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                </View>

                {/* Info */}
                <View style={styles.giftInfo}>
                  <Text style={styles.giftName}>{gift.name}</Text>
                  <Text style={styles.giftFor}>{gift.forPerson} · {gift.occasion}</Text>
                  <View style={[styles.priceTag, { backgroundColor: colors.secondaryLight }]}>
                    <Text style={[styles.priceText, { color: colors.secondaryDark }]}>{gift.price}</Text>
                  </View>
                </View>

                {/* Status */}
                <View style={styles.giftRight}>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>
                      {gift.status.charAt(0).toUpperCase() + gift.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Caveat-SemiBold',
    fontSize: 32,
    color: colors.primary,
  },
  tabsRow: {
    marginBottom: 24,
    marginHorizontal: -20,
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.backgroundCard,
    borderRadius: 25,
  },
  tabActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  tabText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  giftCard: {
    marginBottom: 14,
  },
  giftCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  giftImage: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftEmoji: {
    fontSize: 34,
  },
  giftInfo: {
    flex: 1,
    marginLeft: 16,
  },
  giftName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  giftFor: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 10,
  },
  priceTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  priceText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  giftRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default GiftsScreen;
