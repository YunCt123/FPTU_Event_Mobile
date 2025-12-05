import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../utils/theme';

export interface FeaturedEvent {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  location?: string;
  attendees?: number;
  gradientColors?: readonly string[];
  color?: string;
}

interface Props {
  events: FeaturedEvent[];
  onEventPress?: (event: FeaturedEvent) => void;
  autoPlayInterval?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - SPACING.screenPadding * 2;
const CARD_MARGIN = SPACING.md;

export const FeaturedEventBanner: React.FC<Props> = ({
  events,
  onEventPress,
  autoPlayInterval = 4000,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (events.length > 1) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  }, [activeIndex, events.length]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimerRef.current = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % events.length;
      scrollToIndex(nextIndex);
    }, autoPlayInterval);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * (CARD_WIDTH + CARD_MARGIN),
      animated: true,
    });
    setActiveIndex(index);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + CARD_MARGIN));
    if (index !== activeIndex && index >= 0 && index < events.length) {
      setActiveIndex(index);
    }
  };

  const handleMomentumScrollEnd = () => {
    startAutoPlay();
  };

  const handleScrollBeginDrag = () => {
    stopAutoPlay();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        scrollEventThrottle={16}
      >
        {events.map((event, index) => (
          <TouchableOpacity
            key={event.id}
            activeOpacity={0.9}
            onPress={() => onEventPress?.(event)}
            style={[
              styles.cardWrapper,
              index === 0 && styles.firstCard,
              index === events.length - 1 && styles.lastCard,
            ]}
          >
            {event.gradientColors ? (
              <LinearGradient
                colors={event.gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                {renderCardContent(event)}
              </LinearGradient>
            ) : (
              <View style={[styles.card, { backgroundColor: event.color || COLORS.primary }]}>
                {renderCardContent(event)}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Indicators */}
      {events.length > 1 && (
        <View style={styles.pagination}>
          {events.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => scrollToIndex(index)}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const renderCardContent = (event: FeaturedEvent) => (
  <View style={styles.cardContent}>
    {/* Badge */}
    <View style={styles.badgeContainer}>
      <View style={styles.badge}>
        <Ionicons name="flash" size={12} color={COLORS.white} />
        <Text style={styles.badgeText}>HOT</Text>
      </View>
    </View>

    {/* Content */}
    <View style={styles.contentContainer}>
      <Text style={styles.title} numberOfLines={2}>
        {event.title}
      </Text>
      
      {event.subtitle && (
        <Text style={styles.subtitle} numberOfLines={2}>
          {event.subtitle}
        </Text>
      )}

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
          <Text style={styles.infoText}>{event.date}</Text>
        </View>
        
        {event.location && (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color={COLORS.white} />
            <Text style={styles.infoText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        )}
      </View>

      {event.attendees && (
        <View style={styles.attendeesContainer}>
          <Ionicons name="people" size={16} color={COLORS.white} />
          <Text style={styles.attendeesText}>
            {event.attendees}+ người tham gia
          </Text>
        </View>
      )}
    </View>

    {/* CTA Button */}
    <View style={styles.ctaContainer}>
      <View style={styles.ctaButton}>
        <Text style={styles.ctaText}>Xem chi tiết</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding - CARD_MARGIN / 2,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN / 2,
    paddingHorizontal: SPACING.xs,
  },
  firstCard: {
    marginLeft: -14,
  },
  lastCard: {
  },
  card: {
    height: 200,
    borderRadius: RADII.card,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.pill,
    gap: 4,
  },
  badgeText: {
    fontSize: FONTS.caption,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: FONTS.body,
    color: COLORS.white,
    opacity: 0.95,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '48%',
  },
  infoText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
  },
  attendeesText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  ctaContainer: {
    alignItems: 'flex-end',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.button,
    gap: 6,
  },
  ctaText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text,
    opacity: 0.3,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
    opacity: 1,
  },
});

export default FeaturedEventBanner;
