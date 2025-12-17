import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { eventService } from "../../services/eventService";
import { staffService } from "../../services/staffService";
import { Event, EventStatus } from "../../types/event";
import { StaffAssignedEvent } from "../../types/staff";
import { STORAGE_KEYS } from "../../api/api";

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<Event[]>([]);
  const [assignedEvents, setAssignedEvents] = useState<StaffAssignedEvent[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const isStaff = userRole === "staff";

  // Load user role on mount
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log("User role loaded:", user.roleName);
          setUserRole(user.roleName);
        } else {
          console.log("No user found in storage");
        }
      } catch (error) {
        console.error("Error loading user role:", error);
      }
    };
    loadUserRole();
  }, []);

  const categoryOptions = useMemo(() => {
    const sourceEvents = isStaff ? assignedEvents : events;

    const dynamicCategories = Array.from(
      new Set(
        sourceEvents
          .map((event) => event.category)
          .filter((category): category is string => Boolean(category))
      )
    ).filter((category) => category !== "Tất cả");

    if (dynamicCategories.length === 0) {
      return PRESET_CATEGORIES;
    }

    return ["Tất cả", ...dynamicCategories];
  }, [events, assignedEvents, isStaff]);

  const fetchEvents = useCallback(
    async (
      searchValue: string,
      isRefresh: boolean = false,
      role: string | null = userRole,
      pageNum: number = 1
    ) => {
      const isStaffRole = role === "staff";

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setErrorMessage(null);

        if (isStaffRole) {
          // Fetch assigned events for staff
          console.log("Fetching assigned events for staff");
          try {
            const assignedEvents = await staffService.getAssignedEvents();
            console.log("Assigned events response:", assignedEvents);

            if (Array.isArray(assignedEvents)) {
              setAssignedEvents(assignedEvents);
            } else if (
              assignedEvents &&
              typeof assignedEvents === "object" &&
              "data" in assignedEvents
            ) {
              const data = (assignedEvents as any).data;
              setAssignedEvents(Array.isArray(data) ? data : []);
            } else {
              console.warn(
                "Unexpected assigned events format:",
                assignedEvents
              );
              setAssignedEvents([]);
            }
            setHasMore(false); // Staff events don't have pagination
          } catch (staffError: any) {
            console.error("Error fetching assigned events:", staffError);
            setAssignedEvents([]);
            throw staffError;
          }
        } else {
          // Fetch events for students
          const params: {
            search?: string;
            page: number;
            limit: number;
          } = {
            page: pageNum,
            limit: DEFAULT_PAGE_SIZE,
          };

          const trimmedSearch = searchValue.trim();
          if (trimmedSearch) {
            params.search = trimmedSearch;
          }

          console.log("Fetching events for student with params:", params);
          const response = await eventService.getEvents(params);
          console.log("Events response:", response);

          // Handle different response formats
          let newEvents: Event[] = [];
          let meta = { page: 1, totalPages: 1 };

          if (Array.isArray(response)) {
            newEvents = response;
          } else if (
            response &&
            typeof response === "object" &&
            "data" in response
          ) {
            newEvents = Array.isArray(response.data) ? response.data : [];
            if ("meta" in response && response.meta) {
              meta = response.meta as { page: number; totalPages: number };
            }
          } else {
            console.warn("Unexpected response format:", response);
            newEvents = [];
          }

          // Update state based on page number
          if (pageNum === 1) {
            setEvents(newEvents);
          } else {
            setEvents((prev) => [...prev, ...newEvents]);
          }

          setPage(pageNum);
          setTotalPages(meta.totalPages);
          setHasMore(pageNum < meta.totalPages);
        }
      } catch (error: any) {
        console.error("Failed to fetch events", error);
        setErrorMessage(
          isStaffRole
            ? "Không thể tải danh sách sự kiện được phân công"
            : "Không thể tải danh sách sự kiện"
        );
        // Only show alert if it's not a silent error
        if (
          error?.response?.status !== 401 &&
          error?.response?.status !== 403
        ) {
          Alert.alert(
            "Lỗi",
            error.response?.data?.message ||
              (isStaffRole
                ? "Không thể tải danh sách sự kiện được phân công"
                : "Không thể tải danh sách sự kiện")
          );
        }
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
        setInitialLoad(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [userRole]
  );

  // Fetch events when userRole is first set
  useEffect(() => {
    if (userRole !== null) {
      console.log(
        "User role is set, fetching events. Role:",
        userRole,
        "isStaff:",
        isStaff
      );
      fetchEvents(appliedSearch, false, userRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]); // Only depend on userRole to avoid infinite loop

  // Debounce search query with 2 second delay
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't trigger on initial load
    if (!initialLoad && userRole !== null) {
      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        console.log("Debounced search triggered:", searchQuery);
        setAppliedSearch(searchQuery);
      }, 2000);
    }

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, userRole, initialLoad]);

  // Fetch events when search changes (but only after initial load)
  useEffect(() => {
    if (userRole !== null && appliedSearch !== "" && !initialLoad) {
      console.log(
        "Search changed, fetching events with search:",
        appliedSearch
      );
      fetchEvents(appliedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch]);

  const onRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchEvents(appliedSearch, true, userRole, 1);
  }, [fetchEvents, appliedSearch, userRole]);

  const loadMoreEvents = useCallback(() => {
    if (!loadingMore && hasMore && !isStaff) {
      const nextPage = page + 1;
      console.log("Loading more events, page:", nextPage);
      fetchEvents(appliedSearch, false, userRole, nextPage);
    }
  }, [
    loadingMore,
    hasMore,
    isStaff,
    page,
    fetchEvents,
    appliedSearch,
    userRole,
  ]);

  const handleSearchSubmit = () => {
    setPage(1);
    setHasMore(true);
    setAppliedSearch(searchQuery);
    fetchEvents(searchQuery, false, userRole, 1);
  };

  const filteredEvents = useMemo(() => {
    const sourceEvents = isStaff ? assignedEvents : events;
    const filtered = sourceEvents.filter((event) => {
      const matchCategory =
        selectedCategory === "Tất cả" || event.category === selectedCategory;
      const matchSearch = event.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });

    console.log("Filtered events count:", filtered.length);
    return filtered;
  }, [events, assignedEvents, selectedCategory, searchQuery, isStaff]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return COLORS.success;
      case "DRAFT":
        return COLORS.warning;
      case "CANCELLED":
        return COLORS.error;
      case "PENDING":
        return "#2196F3";
      default:
        return COLORS.text;
    }
  };

  const handleEventPress = (event: Event | StaffAssignedEvent) => {
    if (isStaff) {
      navigation.navigate("StaffEventDetail", { eventId: event.id });
    } else {
      navigation.navigate("EventDetails", { eventId: event.id });
    }
  };

  // Render footer for FlatList (loading more indicator)
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerLoadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  // Render student event card
  const renderStudentEventCard = ({ item: event }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      activeOpacity={0.7}
      onPress={() => handleEventPress(event)}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <Ionicons name="calendar" size={24} color={COLORS.primary} />
        </View>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: STATUS_COLORS[event.status] },
          ]}
        >
          <Text style={styles.categoryBadgeText}>{event.status}</Text>
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
          <Text style={styles.detailText}>{formatDate(event.startTime)}</Text>
        </View>
        <View style={styles.eventDetail}>
          <Ionicons
            name="time-outline"
            size={14}
            color={COLORS.text}
            style={{ opacity: 0.7 }}
          />
          <Text style={styles.detailText}>{formatTime(event.startTime)}</Text>
        </View>
      </View>

      <View style={styles.eventDetails}>
        <View style={styles.eventDetail}>
          <Ionicons
            name={event.isOnline ? "videocam-outline" : "location-outline"}
            size={14}
            color={COLORS.text}
            style={{ opacity: 0.7 }}
          />
          <Text style={styles.detailText}>
            {event.isOnline ? "Online" : event.venue?.name ?? "Đang cập nhật"}
          </Text>
        </View>
        {event.maxCapacity !== null && (
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
        )}
      </View>

      <View style={styles.organizerInfo}>
        <Text style={styles.organizerLabel}>Tổ chức bởi: </Text>
        <Text style={styles.organizerName}>
          {event.organizer?.name ?? "Đang cập nhật"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleEventPress(event)}
        style={styles.registerButton}
      >
        <Text style={styles.registerButtonText}>Xem chi tiết</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render staff event card
  const renderStaffEventCard = ({
    item: event,
  }: {
    item: StaffAssignedEvent;
  }) => (
    <TouchableOpacity
      style={styles.staffEventCard}
      onPress={() => handleEventPress(event)}
    >
      <View style={styles.staffEventHeader}>
        <View style={styles.staffEventTitleContainer}>
          <Text style={styles.staffEventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(event.status) },
            ]}
          >
            <Text style={styles.statusText}>{event.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.staffEventInfo}>
        <View style={styles.infoRow}>
          <Ionicons
            name={event.isOnline ? "videocam" : "location-sharp"}
            size={16}
            color={COLORS.text}
          />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.isOnline
              ? "Sự kiện trực tuyến"
              : event.venue?.name ?? "Đang cập nhật"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color={COLORS.text} />
          <Text style={styles.infoText}>
            {formatDate(event.startTime)} - {formatTime(event.startTime)}
          </Text>
        </View>

        {event.maxCapacity !== null && (
          <View style={styles.infoRow}>
            <Ionicons name="people" size={16} color={COLORS.text} />
            <Text style={styles.infoText}>
              {event.registeredCount}/{event.maxCapacity} người tham gia
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.assignmentInfo}>
          <View style={styles.roleBadge}>
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.roleText}>Check-in Staff</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("StaffScan", {
              eventId: event.id,
              eventTitle: event.title,
            })
          }
        >
          <Ionicons name="create" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("IncidentReport", {
              eventId: event.id,
              eventTitle: event.title,
            })
          }
        >
          <Ionicons name="warning" size={20} color={COLORS.warning} />
          <Text style={[styles.actionButtonText, { color: COLORS.warning }]}>
            Báo cáo
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render header component for FlatList
  const renderListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>
        {isStaff ? "Sự kiện được phân công" : "Sự kiện"}
      </Text>

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

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );

  // Render empty component
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {isStaff ? "Đang tải danh sách sự kiện..." : "Đang tải sự kiện..."}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="calendar-outline"
          size={48}
          color={COLORS.text}
          style={{ opacity: 0.25 }}
        />
        <Text style={styles.emptyText}>
          {isStaff
            ? "Bạn chưa được phân công vào sự kiện nào"
            : "Không có sự kiện nào"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient_1}
        start={{ x: 1, y: 0.2 }}
        end={{ x: 0.2, y: 1 }}
        style={styles.gradientBackground}
      >
        {isStaff ? (
          <FlatList
            data={filteredEvents as StaffAssignedEvent[]}
            keyExtractor={(item) => item.id}
            renderItem={renderStaffEventCard}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        ) : (
          <FlatList
            data={filteredEvents as Event[]}
            keyExtractor={(item) => item.id}
            renderItem={renderStudentEventCard}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreEvents}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        )}
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
  flatListContent: {
    paddingBottom: 100,
    paddingHorizontal: SPACING.screenPadding,
  },
  footerLoading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  footerLoadingText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.7,
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
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
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
  // Staff view styles
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.xl,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  placeholder: {
    width: 40,
  },
  staffEventCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  staffEventHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  staffEventTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  staffEventTitle: {
    flex: 1,
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.text,
    marginRight: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
  },
  statusText: {
    fontSize: FONTS.xs,
    fontWeight: "600",
    color: COLORS.white,
  },
  staffEventInfo: {
    padding: SPACING.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  infoText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sm,
    color: COLORS.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginVertical: SPACING.md,
  },
  assignmentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
  },
  roleText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.xs,
    fontWeight: "600",
    color: COLORS.primary,
  },
  cardFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    padding: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
  },
  actionButtonText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
});

export default EventScreen;
