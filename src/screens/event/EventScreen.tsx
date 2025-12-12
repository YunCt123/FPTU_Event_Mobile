import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { eventService } from "../../services/eventService";
import { Event, EventStatus } from "../../types/event";

type EventScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const PRESET_CATEGORIES = [
  "Tất cả",
  "Công nghệ",
  "Nghệ thuật",
  "Thể thao",
  "Khoa học",
];

const STATUS_COLORS: Record<EventStatus, string> = {
  PUBLISHED: "#4CAF50",
  DRAFT: "#FF9800",
  PENDING: "#2196F3",
  CANCELLED: "#F44336",
};

const DEFAULT_PAGE_SIZE = 10;

const EventScreen: React.FC<EventScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryOptions = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(
        events
          .map((event) => event.category)
          .filter((category): category is string => Boolean(category))
      )
    ).filter((category) => category !== "Tất cả");

    if (dynamicCategories.length === 0) {
      return PRESET_CATEGORIES;
    }

    return ["Tất cả", ...dynamicCategories];
  }, [events]);

  const fetchEvents = React.useCallback(
    async (searchValue: string) => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const params: {
          search?: string;
          page: number;
          limit: number;
        } = {
          page,
          limit: DEFAULT_PAGE_SIZE,
        };

        const trimmedSearch = searchValue.trim();
        if (trimmedSearch) {
          params.search = trimmedSearch;
        }

        const response = await eventService.getEvents(params);
        setEvents(response.data ?? []);
      } catch (error) {
        console.error("Failed to fetch events", error);
        setErrorMessage("Không thể tải danh sách sự kiện");
        Alert.alert("Lỗi", "Không thể tải danh sách sự kiện");
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    fetchEvents(appliedSearch);
  }, [fetchEvents, appliedSearch]);

  const handleSearchSubmit = () => {
    setPage(1);
    setAppliedSearch(searchQuery);
  };

  const filteredEvents = events.filter((event) => {
    const matchCategory =
      selectedCategory === "Tất cả" || event.category === selectedCategory;
    const matchSearch = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (value: string) => {
    const date = new Date(value);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient_1}
        start={{ x: 1, y: 0.2 }}
        end={{ x: 0.2, y: 1 }}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Sự kiện</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={COLORS.text}
                style={{ opacity: 0.5 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm sự kiện..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categoryOptions.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      isActive && styles.categoryChipActive,
                    ]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setPage(1);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isActive && styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.eventsContainer}>
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
              </View>
            ) : filteredEvents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color={COLORS.text}
                  style={{ opacity: 0.25 }}
                />
                <Text style={styles.emptyText}>Không có sự kiện nào</Text>
              </View>
            ) : (
              filteredEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate("EventDetails", { eventId: event.id })
                  }
                >
                  <View style={styles.eventHeader}>
                    <View style={styles.eventIconContainer}>
                      <Ionicons
                        name="calendar"
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={[styles.categoryBadge, {backgroundColor: STATUS_COLORS[event.status]}]}>
                      <Text style={styles.categoryBadgeText}>
                        {event.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>

                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetail}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={COLORS.text}
                        style={{ opacity: 0.7 }}
                      />
                      <Text style={styles.detailText}>
                        {formatDate(event.startTime)}
                      </Text>
                    </View>
                    <View style={styles.eventDetail}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={COLORS.text}
                        style={{ opacity: 0.7 }}
                      />
                      <Text style={styles.detailText}>
                        {formatTime(event.startTime)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetail}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={COLORS.text}
                        style={{ opacity: 0.7 }}
                      />
                      <Text style={styles.detailText}>
                        {event.venue?.name ?? "Đang cập nhật"}
                      </Text>
                    </View>
                    <View style={styles.eventDetail}>
                      <Ionicons
                        name="people-outline"
                        size={14}
                        color={COLORS.text}
                        style={{ opacity: 0.7 }}
                      />
                      <Text style={styles.detailText}>
                        {event.registeredCount}/{event.maxCapacity} người
                      </Text>
                    </View>
                  </View>

                  <View style={styles.organizerInfo}>
                    <Text style={styles.organizerLabel}>Tổ chức bởi: </Text>
                    <Text style={styles.organizerName}>
                      {event.organizer?.name ?? "Đang cập nhật"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("EventDetails", { eventId: event.id })
                    }
                    style={styles.registerButton}
                  >
                    <Text style={styles.registerButtonText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
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
    paddingTop: 60,
    paddingBottom: SPACING.md,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: FONTS.header,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADII.input,
    height: 44,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    marginHorizontal: 20,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  categoriesContainer: {
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    paddingHorizontal: 10,
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
    fontWeight: "500",
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 100,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  eventIconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "600",
  },
  eventTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  eventDescription: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  eventDetails: {
    flexDirection: "row",
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    marginTop: SPACING.md,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: "600",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.7,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.5,
  },
  errorText: {
    color: COLORS.primary,
    marginBottom: SPACING.md,
    fontSize: FONTS.caption,
  },
  organizerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  organizerLabel: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.7,
  },
  organizerName: {
    fontSize: FONTS.caption,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default EventScreen;
