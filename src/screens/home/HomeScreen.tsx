import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { User } from "../../types/user";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import FeaturedEventBanner, {
  FeaturedEvent,
} from "../../components/FeaturedEventBanner";
import { eventService } from "../../services/eventService";
import { Event } from "../../types/event";
import img from "../../assets/fpt_logo.png";
import { STORAGE_KEYS } from "../../api/api";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const GRADIENT_COLORS = [
  COLORS.gradient_2,
  [COLORS.primary, "#FF8E53"],
  ["#4CAF50", "#66BB6A"],
] as const;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
          const user: User = JSON.parse(userStr);
          setUserRole(user.roleName);
          setUserAvatar(user.avatar || null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getEvents({
          page: 1,
          limit: 50, // Load nhiều để có đủ dữ liệu
        });

        // Handle different response formats
        let eventsData: Event[] = [];
        if (Array.isArray(response)) {
          eventsData = response;
        } else if (
          response &&
          typeof response === "object" &&
          "data" in response
        ) {
          eventsData = Array.isArray(response.data) ? response.data : [];
        }

        // Filter only published events
        const publishedEvents = eventsData.filter(
          (event) => event.status === "PUBLISHED"
        );
        setEvents(publishedEvents);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Featured events: Top 3 events by registeredCount
  const featuredEvents = useMemo(() => {
    const sorted = [...events]
      .sort((a, b) => b.registeredCount - a.registeredCount)
      .slice(0, 3)
      .map((event, index) => ({
        id: event.id,
        title: event.title,
        subtitle: event.description?.substring(0, 50) + "..." || "",
        gradientColors: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
        date: formatDate(event.startTime),
        location: event.venue?.name || "Đang cập nhật",
        attendees: event.registeredCount,
      }));
    return sorted;
  }, [events]);

  // Upcoming events: Next 2 events by startTime
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const sorted = [...events]
      .filter((event) => new Date(event.startTime) > now)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
      .slice(0, 2);
    return sorted;
  }, [events]);

  const isStaff = userRole === "staff";

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
          {/* 1. Header/Chào mừng - Định danh người dùng và thông tin tổng quan vé */}
          <View style={styles.header}>
            <View>
              <View style={styles.headerIcon}>
                <Image style={styles.logo} source={img} />
                <TouchableOpacity
                  onPress={() => navigation.navigate("Profile")}
                  style={styles.avatar}
                >
                  {userAvatar ? (
                    <Image
                      source={{ uri: userAvatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons
                      name="person-circle"
                      size={40}
                      color={COLORS.text}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            {/* 2. Sự kiện Nổi bật - Thu hút đăng ký sự kiện mới */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sự kiện Nổi bật</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : featuredEvents.length > 0 ? (
                <FeaturedEventBanner
                  events={featuredEvents}
                  onEventPress={(event) => {
                    navigation.navigate("EventDetails", { eventId: event.id });
                  }}
                  autoPlayInterval={2000}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Chưa có sự kiện nổi bật</Text>
                </View>
              )}
            </View>

            {/* 3. Sự kiện Sắp diễn ra - Nhắc nhở/giúp người dùng quản lý thời gian */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sự kiện Sắp diễn ra</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Event")}>
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => {
                  const startDate = new Date(event.startTime);
                  const endDate = new Date(event.endTime);
                  const day = startDate.getDate();
                  const monthNames = [
                    "Th1",
                    "Th2",
                    "Th3",
                    "Th4",
                    "Th5",
                    "Th6",
                    "Th7",
                    "Th8",
                    "Th9",
                    "Th10",
                    "Th11",
                    "Th12",
                  ];
                  const month = monthNames[startDate.getMonth()];
                  const startTime = startDate.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const endTime = endDate.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.upcomingCard}
                      onPress={() =>
                        navigation.navigate("EventDetails", {
                          eventId: event.id,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.upcomingLeft}>
                        <View style={styles.upcomingDate}>
                          <Text style={styles.upcomingDay}>{day}</Text>
                          <Text style={styles.upcomingMonth}>{month}</Text>
                        </View>
                      </View>
                      <View style={styles.upcomingContent}>
                        <Text style={styles.upcomingTitle}>{event.title}</Text>
                        <View style={styles.upcomingDetail}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={COLORS.text}
                          />
                          <Text style={styles.upcomingDetailText}>
                            {startTime} - {endTime}
                          </Text>
                        </View>
                        <View style={styles.upcomingDetail}>
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color={COLORS.text}
                          />
                          <Text style={styles.upcomingDetailText}>
                            {event.venue?.name || "Đang cập nhật"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.upcomingAction}>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={COLORS.primary}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Không có sự kiện sắp diễn ra
                  </Text>
                </View>
              )}
            </View>

            {/* 4. Quick Actions - Lối tắt cho các tác vụ thường xuyên */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

              {/* Staff Quick Access */}
              {isStaff && (
                <TouchableOpacity
                  style={styles.staffBanner}
                  onPress={() => navigation.navigate("StaffAssignedEvents")}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#FF6B6B", "#FF8E53"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.staffBannerGradient}
                  >
                    <View style={styles.staffBannerContent}>
                      <View style={styles.staffBannerLeft}>
                        <View style={styles.staffIconContainer}>
                          <Ionicons
                            name="shield-checkmark"
                            size={32}
                            color={COLORS.white}
                          />
                        </View>
                        <View>
                          <Text style={styles.staffBannerTitle}>
                            Chế độ Staff
                          </Text>
                          <Text style={styles.staffBannerSubtitle}>
                            Xem sự kiện được phân công
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={COLORS.white}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate("Event")}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons
                      name="add-circle"
                      size={28}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.actionText}>Đăng ký{"\n"}sự kiện</Text>
                </TouchableOpacity>

                {isStaff ? (
                  <>
                    <TouchableOpacity
                      style={styles.actionCard}
                      onPress={() => navigation.navigate("IncidentHistory")}
                    >
                      <View style={styles.actionIcon}>
                        <Ionicons
                          name="list"
                          size={28}
                          color={COLORS.primary}
                        />
                      </View>
                      <Text style={styles.actionText}>Xem sự cố</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate("Ticket")}
                  >
                    <View style={styles.actionIcon}>
                      <Ionicons
                        name="qr-code"
                        size={28}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text style={styles.actionText}>Vé của tôi</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate("Profile")}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="person" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.actionText}>Hồ sơ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.blue,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
    marginTop: SPACING.huge,
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.md,
  },
  headerIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  logo: {
    width: 60,
    height: 60,
    position: "absolute",
  },
  avatar: {
    position: "absolute",
    right: 0,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  content: {
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.xl,
    paddingTop: SPACING.huge,
    marginBottom: 100,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.text,
    paddingLeft: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
  // Upcoming Events Styles
  upcomingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  upcomingLeft: {
    alignItems: "center",
  },
  upcomingDate: {
    width: 60,
    height: 60,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  upcomingDay: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
  },
  upcomingMonth: {
    fontSize: FONTS.caption,
    color: COLORS.white,
  },
  upcomingContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  upcomingTitle: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  upcomingDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  upcomingDetailText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.7,
  },
  upcomingAction: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  // Quick Actions Styles
  quickActionsContainer: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    alignItems: "center",
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  actionText: {
    fontSize: FONTS.caption,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  // Staff Banner Styles
  staffBanner: {
    marginBottom: SPACING.md,
    borderRadius: RADII.card,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  staffBannerGradient: {
    padding: SPACING.lg,
  },
  staffBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  staffBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  staffIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  staffBannerTitle: {
    fontSize: FONTS.body,
    fontWeight: "bold",
    color: COLORS.white,
  },
  staffBannerSubtitle: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.5,
  },
});

export default HomeScreen;
