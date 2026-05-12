import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { getQuestionnaire, saveQuestionnaire } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

const { width } = Dimensions.get('window');

// Icons
const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const CheckIcon = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

// Question data - Based on API questionnaire (matches web version)
const sections = [
  // Section A - Basic Profile
  {
    id: 'basic_info',
    title: 'Basic Info',
    subtitle: "Let's get to know you",
    emoji: '👤',
    questions: [
      {
        id: 'birthday',
        type: 'date',
        question: 'When is your birthday?',
        helperText: "We'll keep the year private — just used for milestone celebrations.",
      },
      {
        id: 'anniversary_1',
        type: 'date',
        question: 'Any special anniversary? (Optional)',
        helperText: 'Wedding, engagement, first date, or any meaningful milestone',
      },
      {
        id: 'anniversary_1_title',
        type: 'text',
        question: 'What is this date?',
        placeholder: 'E.g., Wedding Anniversary, First Date, Engagement...',
      },
      {
        id: 'anniversary_2',
        type: 'date',
        question: 'Another special date? (Optional)',
      },
      {
        id: 'anniversary_2_title',
        type: 'text',
        question: 'What is this date?',
        placeholder: 'E.g., Graduation, Job Start, Moving Day...',
      },
      {
        id: 'anniversary_3',
        type: 'date',
        question: 'One more special date? (Optional)',
      },
      {
        id: 'anniversary_3_title',
        type: 'text',
        question: 'What is this date?',
        placeholder: 'E.g., Special Memory, Achievement...',
      },
    ],
  },
  // Section B - Activities
  {
    id: 'activities',
    title: 'Activities',
    subtitle: 'What do you enjoy doing?',
    emoji: '🎯',
    questions: [
      {
        id: 'favorite_activities',
        type: 'multiselect',
        question: 'Select your favorite activities',
        options: [
          { id: 'hiking', label: 'Hiking', emoji: '🥾' },
          { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
          { id: 'travelling', label: 'Travelling', emoji: '✈️' },
          { id: 'food', label: 'Food', emoji: '🍴' },
          { id: 'sports', label: 'Sports', emoji: '⚽' },
          { id: 'exercise', label: 'Exercise', emoji: '💪' },
          { id: 'concerts', label: 'Concerts', emoji: '🎤' },
          { id: 'picnics', label: 'Picnics', emoji: '🧺' },
          { id: 'collector', label: 'Collector', emoji: '🏆' },
          { id: 'antiquing', label: 'Antiquing', emoji: '🏺' },
          { id: 'dining_out', label: 'Dining Out', emoji: '🍽️' },
          { id: 'movies', label: 'Movies', emoji: '🎬' },
          { id: 'other', label: 'Other', emoji: '✨' },
        ],
      },
      {
        id: 'activity_details',
        type: 'textarea',
        question: 'Tell us more about what you enjoy',
        placeholder: 'E.g., I love hiking in mountains on weekends, collecting vintage items...',
        helperText: 'If you selected "Other", please describe here',
      },
    ],
  },
  {
    id: 'style',
    title: 'Style',
    subtitle: 'Your personal preferences',
    emoji: '✨',
    questions: [
      {
        id: 'personal_style',
        type: 'single',
        question: 'How would you describe your style?',
        options: [
          { id: 'minimalist', label: 'Minimalist', emoji: '⬜' },
          { id: 'vintage', label: 'Vintage', emoji: '📻' },
          { id: 'modern', label: 'Modern', emoji: '🔲' },
          { id: 'bohemian', label: 'Bohemian', emoji: '🌸' },
          { id: 'classic', label: 'Classic', emoji: '👔' },
          { id: 'colorful', label: 'Colorful', emoji: '🌈' },
          { id: 'other', label: 'Other', emoji: '✨' },
        ],
      },
      {
        id: 'personal_style_other',
        type: 'text',
        question: 'Describe your style (if Other)',
        placeholder: 'E.g., Eclectic mix of modern and vintage...',
      },
      {
        id: 'favorite_colors',
        type: 'multiselect',
        question: 'Your favorite colors',
        options: [
          { id: 'blue', label: 'Blue', color: '#4A90D9' },
          { id: 'green', label: 'Green', color: '#4CAF50' },
          { id: 'red', label: 'Red', color: '#E53935' },
          { id: 'purple', label: 'Purple', color: '#9C27B0' },
          { id: 'black', label: 'Black', color: '#333333' },
          { id: 'pink', label: 'Pink', color: '#E91E8C' },
          { id: 'orange', label: 'Orange', color: '#FF9800' },
          { id: 'yellow', label: 'Yellow', color: '#FDD835' },
          { id: 'teal', label: 'Teal', color: '#009688' },
          { id: 'white', label: 'White', color: '#FFFFFF' },
          { id: 'other', label: 'Other', color: '#9E9E9E' },
        ],
      },
      {
        id: 'favorite_colors_other',
        type: 'text',
        question: 'Any other favorite colors?',
        placeholder: 'E.g., Coral, Navy, Burgundy...',
      },
      {
        id: 'likes_surprises',
        type: 'single',
        question: 'Do you like surprises?',
        options: [
          { id: 'yes', label: 'Yes, love them!', emoji: '🎉' },
          { id: 'no', label: 'I prefer to know ahead', emoji: '📋' },
        ],
      },
    ],
  },
  {
    id: 'values',
    title: 'Values & Causes',
    subtitle: 'What matters to you',
    emoji: '💝',
    questions: [
      {
        id: 'causes_values',
        type: 'multiselect',
        question: 'Is there a cause or value that matters to you?',
        options: [
          { id: 'eco_friendly', label: 'Eco-friendly', emoji: '🌍' },
          { id: 'handmade', label: 'Handmade', emoji: '🧶' },
          { id: 'locally_sourced', label: 'Locally sourced', emoji: '📍' },
          { id: 'charitable', label: 'Charitable giving', emoji: '💕' },
          { id: 'other', label: 'Other', emoji: '✨' },
        ],
      },
      {
        id: 'causes_other',
        type: 'text',
        question: 'Other causes or values?',
        placeholder: 'E.g., Supporting small businesses, Fair trade...',
      },
    ],
  },
  {
    id: 'flowers',
    title: 'Flowers',
    subtitle: 'Your floral preferences',
    emoji: '🌸',
    questions: [
      {
        id: 'favorite_flower',
        type: 'multiselect',
        question: 'What are your favorite flowers?',
        options: [
          { id: 'rose', label: 'Rose', emoji: '🌹' },
          { id: 'tulip', label: 'Tulip', emoji: '🌷' },
          { id: 'lavender', label: 'Lavender', emoji: '💜' },
          { id: 'sunflower', label: 'Sunflower', emoji: '🌻' },
          { id: 'orchid', label: 'Orchid', emoji: '🪻' },
          { id: 'lily', label: 'Lily', emoji: '🪷' },
          { id: 'daisy', label: 'Daisy', emoji: '🌼' },
          { id: 'peony', label: 'Peony', emoji: '🌺' },
          { id: 'cherry_blossom', label: 'Cherry Blossom', emoji: '🌸' },
          { id: 'hydrangea', label: 'Hydrangea', emoji: '💐' },
          { id: 'other', label: 'Other', emoji: '🌿' },
        ],
      },
      {
        id: 'flower_details',
        type: 'textarea',
        question: 'Any specific flower arrangements you love?',
        placeholder: 'E.g., I love sunflower arrangements with daisies, prefer pastel colors...',
      },
    ],
  },
  {
    id: 'food',
    title: 'Food & Dining',
    subtitle: 'Your culinary tastes',
    emoji: '🍽️',
    questions: [
      {
        id: 'favorite_cuisines',
        type: 'multiselect',
        question: 'Favorite cuisines',
        options: [
          { id: 'american', label: 'American', emoji: '🍔' },
          { id: 'barbecue', label: 'Barbecue', emoji: '🍖' },
          { id: 'chinese', label: 'Chinese', emoji: '🥡' },
          { id: 'french', label: 'French', emoji: '🥐' },
          { id: 'hamburger', label: 'Hamburger', emoji: '🍔' },
          { id: 'indian', label: 'Indian', emoji: '🍛' },
          { id: 'italian', label: 'Italian', emoji: '🍝' },
          { id: 'japanese', label: 'Japanese', emoji: '🍱' },
          { id: 'mexican', label: 'Mexican', emoji: '🌮' },
          { id: 'pizza', label: 'Pizza', emoji: '🍕' },
          { id: 'seafood', label: 'Seafood', emoji: '🦐' },
          { id: 'steak', label: 'Steak', emoji: '🥩' },
          { id: 'sushi', label: 'Sushi', emoji: '🍣' },
          { id: 'thai', label: 'Thai', emoji: '🍜' },
          { id: 'other', label: 'Other', emoji: '🍴' },
        ],
      },
      {
        id: 'cuisine_other',
        type: 'text',
        question: 'Any other cuisine preferences?',
        placeholder: 'E.g., Korean, Vietnamese, Mediterranean...',
      },
      {
        id: 'favorite_restaurant',
        type: 'text',
        question: 'Your favorite restaurant',
        placeholder: 'E.g., Olive Garden, local cafe, etc.',
      },
      {
        id: 'favorite_meal',
        type: 'textarea',
        question: 'Your favorite meal at that restaurant',
        placeholder: 'E.g., Chicken Alfredo with garlic bread...',
      },
      {
        id: 'favorite_desserts',
        type: 'multiselect',
        question: 'Favorite desserts',
        options: [
          { id: 'chocolate', label: 'Chocolate', emoji: '🍫' },
          { id: 'candy', label: 'Candy', emoji: '🍬' },
          { id: 'ice_cream', label: 'Ice Cream', emoji: '🍦' },
          { id: 'cookies', label: 'Cookies', emoji: '🍪' },
          { id: 'cake', label: 'Cake', emoji: '🎂' },
          { id: 'fruity', label: 'Fruity', emoji: '🍓' },
          { id: 'other', label: 'Other', emoji: '🍰' },
        ],
      },
      {
        id: 'dessert_details',
        type: 'text',
        question: 'Dessert preferences',
        placeholder: 'E.g., Dark chocolate and mint ice cream...',
      },
    ],
  },
  {
    id: 'gifts',
    title: 'Gift Types',
    subtitle: 'What gifts do you prefer?',
    emoji: '🎁',
    questions: [
      {
        id: 'gift_types',
        type: 'multiselect',
        question: 'Types of gifts you enjoy',
        options: [
          { id: 'experiences', label: 'Experiences & Events', emoji: '🎟️' },
          { id: 'jewelry', label: 'Jewelry & Accessories', emoji: '💎' },
          { id: 'food_drink', label: 'Food & Drink', emoji: '🍷' },
          { id: 'beauty', label: 'Beauty & Self Care', emoji: '💄' },
          { id: 'tech', label: 'Tech & Gadgets', emoji: '📱' },
          { id: 'books', label: 'Books & Learning', emoji: '📚' },
          { id: 'home', label: 'Home & Living', emoji: '🏠' },
          { id: 'fashion', label: 'Fashion & Clothing', emoji: '👗' },
          { id: 'charitable', label: 'Charitable Donations', emoji: '💕' },
        ],
      },
      {
        id: 'gift_details',
        type: 'textarea',
        question: 'Any specific gift ideas or things you collect?',
        placeholder: 'E.g., I collect vintage watches, would love cooking classes or spa days...',
      },
    ],
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    subtitle: 'Movies, music & more',
    emoji: '🎬',
    questions: [
      {
        id: 'movie_genre',
        type: 'single',
        question: 'Favorite movie genre',
        options: [
          { id: 'action', label: 'Action', emoji: '💥' },
          { id: 'comedy', label: 'Comedy', emoji: '😂' },
          { id: 'crime', label: 'Crime', emoji: '🔍' },
          { id: 'drama', label: 'Drama', emoji: '🎭' },
          { id: 'thriller', label: 'Thriller', emoji: '😱' },
          { id: 'documentary', label: 'Documentary', emoji: '📹' },
          { id: 'other', label: 'Other', emoji: '🎬' },
        ],
      },
      {
        id: 'favorite_movies',
        type: 'textarea',
        question: 'Specific movies or shows you like',
        placeholder: 'E.g., The Office, Inception, Friends...',
      },
      {
        id: 'music_genre',
        type: 'single',
        question: 'Favorite music genre',
        options: [
          { id: 'hiphop', label: 'Hip-Hop', emoji: '🎧' },
          { id: 'pop', label: 'Pop', emoji: '🎤' },
          { id: 'rock', label: 'Rock', emoji: '🎸' },
          { id: 'country', label: 'Country', emoji: '🤠' },
          { id: 'classical', label: 'Classical', emoji: '🎻' },
          { id: 'other', label: 'Other', emoji: '🎵' },
        ],
      },
      {
        id: 'favorite_artists',
        type: 'textarea',
        question: 'Favorite albums, artists, or singers',
        placeholder: 'E.g., Taylor Swift, Ed Sheeran, BTS...',
      },
    ],
  },
  {
    id: 'wishlist',
    title: 'Wishlist & Registry',
    subtitle: 'Your dream items',
    emoji: '⭐',
    questions: [
      {
        id: 'wishlist_text',
        type: 'textarea',
        question: 'Anything on your wishlist right now?',
        placeholder: "List items you'd love to receive...\n\n• New yoga mat\n• Wireless earbuds\n• Cooking class gift card",
      },
      {
        id: 'wishlist_link_1',
        type: 'url',
        question: 'Wishlist Link #1 (Optional)',
        placeholder: 'https://amazon.com/wishlist/...',
      },
      {
        id: 'wishlist_link_2',
        type: 'url',
        question: 'Wishlist Link #2 (Optional)',
        placeholder: 'https://...',
      },
      {
        id: 'wishlist_link_3',
        type: 'url',
        question: 'Wishlist Link #3 (Optional)',
        placeholder: 'https://...',
      },
      {
        id: 'clothing_sizes',
        type: 'textarea',
        question: 'Clothing / Shoe / Ring Sizes',
        placeholder: 'E.g., Top: M, Pants: 8, Shoes: 7.5, Ring: 6',
      },
      {
        id: 'registry_link',
        type: 'url',
        question: 'Registry Link (Optional)',
        placeholder: 'https://...',
        helperText: 'Wedding, baby shower, or other registry',
      },
      {
        id: 'registry_details',
        type: 'textarea',
        question: 'Registry Details (Optional)',
        placeholder: 'E.g., Wedding registry at Target, Baby shower for June 2025...',
      },
      {
        id: 'registry_expiry',
        type: 'date',
        question: 'Registry Expiry Date (Optional)',
        helperText: 'When should this registry be removed?',
      },
    ],
  },
];

const QuestionnaireScreen = ({ navigation, route }) => {
  // Check if this is first-time setup (mandatory) - passed from navigation or determined by checking if we can go back
  const isFirstTime = route?.params?.isFirstTime ?? true;

  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Custom alert hook
  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  // Fetch existing questionnaire answers
  const fetchQuestionnaire = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getQuestionnaire();

      if (response.questionnaire) {
        const q = response.questionnaire;
        // Map camelCase API response to snake_case question IDs
        const mappedAnswers = {
          // Activities
          favorite_activities: q.favoriteActivities || q.favorite_activities || [],
          activity_details: q.activityDetails || q.activity_details || '',
          // Style
          personal_style: q.personalStyle || q.personal_style || '',
          personal_style_other: q.personalStyleOther || q.personal_style_other || '',
          favorite_colors: q.favoriteColors || q.favorite_colors || [],
          favorite_colors_other: q.favoriteColorsOther || q.favorite_colors_other || '',
          likes_surprises: q.likesSurprises || q.likes_surprises || '',
          // Values
          causes_values: q.causesValues || q.causes_values || [],
          causes_other: q.causesOther || q.causes_other || '',
          // Flowers
          favorite_flower: q.favoriteFlower || q.favorite_flower || [],
          flower_details: q.flowerDetails || q.flower_details || '',
          // Food
          favorite_cuisines: q.favoriteCuisines || q.favorite_cuisines || [],
          cuisine_other: q.cuisineOther || q.cuisine_other || '',
          favorite_restaurant: q.favoriteRestaurant || q.favorite_restaurant || '',
          favorite_meal: q.favoriteMeal || q.favorite_meal || '',
          favorite_desserts: q.favoriteDesserts || q.favorite_desserts || [],
          dessert_details: q.dessertDetails || q.dessert_details || '',
          // Gifts
          gift_types: q.giftTypes || q.gift_types || [],
          gift_details: q.giftDetails || q.gift_details || '',
          // Entertainment
          movie_genre: q.movieGenre || q.movie_genre || '',
          favorite_movies: q.favoriteMovies || q.favorite_movies || '',
          music_genre: q.musicGenre || q.music_genre || '',
          favorite_artists: q.favoriteArtists || q.favorite_artists || '',
          // Wishlist
          wishlist_text: q.wishlistText || q.wishlist_text || '',
          clothing_sizes: q.clothingSizes || q.clothing_sizes || '',
        };

        // Remove empty values
        Object.keys(mappedAnswers).forEach(key => {
          if (mappedAnswers[key] === '' || (Array.isArray(mappedAnswers[key]) && mappedAnswers[key].length === 0)) {
            delete mappedAnswers[key];
          }
        });

        setAnswers(mappedAnswers);
      }

      // Also load birthday from basicInfo
      if (response.basicInfo?.birthday) {
        setAnswers(prev => ({ ...prev, birthday: response.basicInfo.birthday }));
      }
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestionnaire();
  }, [fetchQuestionnaire]);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentSection + 1) / sections.length,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Animate content change
    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentSection]);

  const handleSelect = (questionId, optionId, type) => {
    setAnswers(prev => {
      if (type === 'multiselect') {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter(id => id !== optionId) };
        }
        return { ...prev, [questionId]: [...current, optionId] };
      }
      return { ...prev, [questionId]: optionId };
    });
  };

  const handleTextChange = (questionId, text) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleNext = async () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // Save and finish
      try {
        setSaving(true);
        await saveQuestionnaire({ answers });

        if (isFirstTime) {
          // First time: navigate to MainApp and reset navigation stack
          showSuccess('Your preferences have been saved!', () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp' }],
            });
          });
        } else {
          // Editing: just go back
          showSuccess('Your preferences have been saved!', () => navigation.goBack());
        }
      } catch (error) {
        showError(error.message || 'Failed to save preferences');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else if (!isFirstTime) {
      // Only allow going back if not first time
      navigation.goBack();
    }
    // If first time and on first section, do nothing (can't skip)
  };

  const section = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;

  const renderOption = (option, questionId, type) => {
    const isSelected = type === 'multiselect'
      ? (answers[questionId] || []).includes(option.id)
      : answers[questionId] === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        onPress={() => handleSelect(questionId, option.id, type)}
        activeOpacity={0.9}
        style={styles.optionWrapper}
      >
        {isSelected ? (
          <LinearGradient
            colors={['#f4cae8', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.optionActive}
          >
            {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
            {option.color && (
              <View style={[styles.colorDot, { backgroundColor: option.color }]} />
            )}
            <Text style={styles.optionLabelActive}>{option.label}</Text>
            <View style={styles.checkMark}>
              <CheckIcon size={14} color="#FFFFFF" />
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.option}>
            {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
            {option.color && (
              <View style={[styles.colorDot, { backgroundColor: option.color }]} />
            )}
            <Text style={styles.optionLabel}>{option.label}</Text>
            <View style={styles.checkMarkPlaceholder} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderQuestion = (question) => {
    if (question.type === 'text') {
      return (
        <View key={question.id} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={question.placeholder}
              placeholderTextColor="#999"
              value={answers[question.id] || ''}
              onChangeText={(text) => handleTextChange(question.id, text)}
              multiline={false}
            />
          </View>
        </View>
      );
    }

    if (question.type === 'url') {
      return (
        <View key={question.id} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={question.placeholder}
              placeholderTextColor="#999"
              value={answers[question.id] || ''}
              onChangeText={(text) => handleTextChange(question.id, text)}
              multiline={false}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {question.helperText && (
            <Text style={styles.helperText}>{question.helperText}</Text>
          )}
        </View>
      );
    }

    if (question.type === 'date') {
      const dateValue = answers[question.id] || '';
      const formatDisplayDate = (dateStr) => {
        if (!dateStr) return 'Select a date';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      };

      return (
        <View key={question.id} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          <TouchableOpacity
            style={styles.textInputWrapper}
            onPress={() => {
              // For now, use a simple text input for date
              // In production, you'd use a date picker modal
            }}
          >
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              value={answers[question.id] || ''}
              onChangeText={(text) => handleTextChange(question.id, text)}
              multiline={false}
              keyboardType="numbers-and-punctuation"
            />
          </TouchableOpacity>
          {question.helperText && (
            <Text style={styles.helperText}>{question.helperText}</Text>
          )}
        </View>
      );
    }

    if (question.type === 'textarea') {
      return (
        <View key={question.id} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          <View style={[styles.textInputWrapper, styles.textareaWrapper]}>
            <TextInput
              style={[styles.textInput, styles.textarea]}
              placeholder={question.placeholder}
              placeholderTextColor="#999"
              value={answers[question.id] || ''}
              onChangeText={(text) => handleTextChange(question.id, text)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          {question.helperText && (
            <Text style={styles.helperText}>{question.helperText}</Text>
          )}
        </View>
      );
    }

    const allSelected = question.type === 'multiselect' &&
      question.options.every(opt => (answers[question.id] || []).includes(opt.id));

    const handleSelectAll = () => {
      if (allSelected) {
        setAnswers(prev => ({ ...prev, [question.id]: [] }));
      } else {
        setAnswers(prev => ({ ...prev, [question.id]: question.options.map(opt => opt.id) }));
      }
    };

    return (
      <View key={question.id} style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionText}>{question.question}</Text>
          {question.type === 'multiselect' && (
            <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
              <Text style={styles.selectAllText}>
                {allSelected ? '✓ Deselect All' : '☐ Select All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.optionsGrid}>
          {question.options.map(option => renderOption(option, question.id, question.type))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          }],
        }
      ]}>
        {/* Back button - only show if not first section, or if not first time setup */}
        {(currentSection > 0 || !isFirstTime) ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <BackIcon size={24} color="#6b3a8a" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerStep}>
            {currentSection + 1} of {sections.length}
          </Text>
        </View>
        {/* Skip button - only show if not first time setup */}
        {!isFirstTime ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }
          ]}>
            <LinearGradient
              colors={['#f4cae8', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ca9ad6" />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets={false}
        removeClippedSubviews={false}
      >
        {!loading && <Animated.View style={[
          styles.sectionContainer,
          {
            opacity: contentAnim,
            transform: [{
              translateX: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            }],
          }
        ]}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#fbe5f5', '#ccf9ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionEmojiBg}
            >
              <Text style={styles.sectionEmoji}>{section.emoji}</Text>
            </LinearGradient>
            <MaskedView
              maskElement={
                <Text style={styles.sectionTitleMask}>{section.title}</Text>
              }
            >
              <LinearGradient
                colors={['#ca9ad6', '#70d0dd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.sectionTitleMask, { opacity: 0 }]}>{section.title}</Text>
              </LinearGradient>
            </MaskedView>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
          </View>

          {/* Questions */}
          {section.questions.map(renderQuestion)}
        </Animated.View>}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        {currentSection > 0 && (
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.9}
            style={styles.backButtonBottom}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          style={[styles.nextButtonWrapper, currentSection === 0 && styles.nextButtonFull]}
          disabled={saving}
        >
          <LinearGradient
            colors={saving ? ['#ccc', '#ccc'] : ['#70d0dd', '#ca9ad6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButton}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.nextButtonText}>
                {isLastSection ? 'Save Preferences' : 'Continue'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Custom Alert */}
      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  skipPlaceholder: {
    width: 40,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerStep: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  progressBg: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionContainer: {
    gap: 24,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionEmojiBg: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionEmoji: {
    fontSize: 32,
  },
  sectionTitleMask: {
    fontSize: 28,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 4,
  },
  questionContainer: {
    gap: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  selectAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectAllText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    flex: 1,
    color: '#330c54',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionWrapper: {
    marginBottom: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  optionActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    minHeight: 48,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  optionEmoji: {
    fontSize: 18,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  optionLabelActive: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  checkMark: {
    width: 18,
    height: 14,
    marginLeft: 4,
  },
  checkMarkPlaceholder: {
    width: 18,
    height: 14,
    marginLeft: 4,
  },
  textInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  textareaWrapper: {
    minHeight: 150,
  },
  textInput: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    padding: 16,
  },
  textarea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  navButtons: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  backButtonBottom: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  nextButtonWrapper: {
    flex: 2,
    shadowColor: '#70d0dd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 17,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});

export default QuestionnaireScreen;
