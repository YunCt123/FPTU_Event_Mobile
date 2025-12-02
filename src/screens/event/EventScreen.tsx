import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS, SIZES } from '../../utils/theme';

type EventScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const CATEGORIES = ['Tất cả', 'Công nghệ', 'Nghệ thuật', 'Thể thao', 'Khoa học'];

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Tech Talk: AI in Education',
    category: 'Công nghệ',
    date: '15/12/2025',
    time: '14:00',
    location: 'Hall A',
    attendees: 120,
    icon: 'mic',
  },
  {
    id: '2',
    title: 'Workshop: UI/UX Design',
    category: 'Nghệ thuật',
    date: '18/12/2025',
    time: '09:00',
    location: 'Room 301',
    attendees: 45,
    icon: 'color-palette',
  },
  {
    id: '3',
    title: 'Football Tournament 2025',
    category: 'Thể thao',
    date: '20/12/2025',
    time: '15:00',
    location: 'Stadium',
    attendees: 200,
    icon: 'football',
  },
  {
    id: '4',
    title: 'Science Fair',
    category: 'Khoa học',
    date: '22/12/2025',
    time: '10:00',
    location: 'Exhibition Hall',
    attendees: 85,
    icon: 'flask',
  },
];

const EventScreen: React.FC<EventScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = MOCK_EVENTS.filter((event) => {
    const matchCategory = selectedCategory === 'Tất cả' || event.category === selectedCategory;
    const matchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <View style={styles.container}>  
    <LinearGradient
      colors={COLORS.gradient_1}
      start={{x: 1, y: 0.2}} 
      end={{x: 0.2, y: 1}}
      style={styles.gradientBackground}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Sự kiện</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.text} style={{opacity: 0.5}} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eventsContainer}>
          {filteredEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              activeOpacity={0.7}
            >
              <View style={styles.eventHeader}>
                <View style={styles.eventIconContainer}>
                  <Ionicons name={event.icon as any} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{event.category}</Text>
                </View>
              </View>

              <Text style={styles.eventTitle}>{event.title}</Text>

              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.text} style={{opacity: 0.7}} />
                  <Text style={styles.detailText}>{event.date}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="time-outline" size={14} color={COLORS.text} style={{opacity: 0.7}} />
                  <Text style={styles.detailText}>{event.time}</Text>
                </View>
              </View>

              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <Ionicons name="location-outline" size={14} color={COLORS.text} style={{opacity: 0.7}} />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="people-outline" size={14} color={COLORS.text} style={{opacity: 0.7}} />
                  <Text style={styles.detailText}>{event.attendees} người tham gia</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.registerButtonText}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      </LinearGradient>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },  
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: FONTS.header,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADII.input,
    paddingHorizontal: SPACING.md,
    height: 44,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  categoriesContainer: {
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    paddingBottom: SPACING.xl, 
  },
  eventsContainer: {
    padding: SPACING.screenPadding,
    gap: SPACING.lg,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  eventIconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.pill,
  },
  categoryBadgeText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.7,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: '600',
  },
});

export default EventScreen;