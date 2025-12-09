import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { eventService } from "../../services/eventService";
import { Event, EventStatus } from "../../types/event";
import { RootStackParamList } from "../../types/navigation";

type EventDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EventDetails">;
  route: RouteProp<RootStackParamList, "EventDetails">;
};


const STATUS_COLORS: Record<EventStatus, string> = {
  PUBLISHED: "#4CAF50",
  DRAFT: "#FF9800",
  PENDING: "#2196F3",
  CANCELLED: "#F44336",
};

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetail();
  }, [eventId]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      console.log("Fetching event detail for ID:", eventId);
      const response = await eventService.getEventById(eventId);
      console.log("Event detail response:", response);
      setEvent(response);
    } catch (error) {
      console.error("Failed to fetch event detail", error);
      Alert.alert(
        "Lỗi", 
        "Không thể tải thông tin sự kiện. Vui lòng thử lại sau.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

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

  const formatDateTime = (value: string) => {
    return `${formatDate(value)} - ${formatTime(value)}`;
  };

  const getCapacityPercentage = () => {
    if (!event) return 0;
    return (event.registeredCount / event.maxCapacity) * 100;
  };

  const canRegister = () => {
    if (!event) return false;
    const now = new Date();
    const startRegister = new Date(event.startTimeRegister);
    const endRegister = new Date(event.endTimeRegister);
    return (
      event.status === "PUBLISHED" &&
      now >= startRegister &&
      now <= endRegister &&
      event.registeredCount < event.maxCapacity
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text }}>Đang tải...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.text }}>Không tìm thấy sự kiện</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20, padding: 10, backgroundColor: COLORS.primary, borderRadius: 8 }}
        >
          <Text style={{ color: "#FFF" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết sự kiện</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Banner Image */}
          {event.bannerUrl ? (
            <Image source={{ uri: event.bannerUrl }} style={styles.banner} />
          ) : (
            <View style={[styles.banner, styles.bannerPlaceholder]}>
              <Ionicons name="image-outline" size={60} color="#CCCCCC" />
            </View>
          )}

          {/* Event Content */}
          <View style={styles.content}>
            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: STATUS_COLORS[event.status] },
              ]}
            >
              <Text style={styles.statusText}>
                {event.status}
              </Text>
            </View>

            {/* Event Title */}
            <Text style={styles.eventTitle}>{event.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{event.description}</Text>

            {/* Event Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={20} color={COLORS.primary} />
                <Text style={styles.statText}>
                  {event.registeredCount}/{event.maxCapacity}
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.progressBarSmall}>
                  <View
                    style={[
                      styles.progressFillSmall,
                      { width: `${getCapacityPercentage()}%` },
                    ]}
                  />
                </View>
                <Text style={styles.statText}>
                  {getCapacityPercentage().toFixed(0)}%
                </Text>
              </View>
              {event.isGlobal && (
                <View style={styles.statItem}>
                  <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.statText}>Toàn trường</Text>
                </View>
              )}
            </View>

            {/* Event Time & Location Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Thông tin sự kiện</Text>
              
              <View style={styles.infoRow}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Thời gian diễn ra</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(event.startTime)} • {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Đăng ký</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(event.startTimeRegister)} - {formatDate(event.endTimeRegister)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Địa điểm</Text>
                  <Text style={styles.infoValue}>{event.venue.name}</Text>
                  <Text style={styles.infoSubtext}>
                    {event.venue.location}
                    {event.venue.hasSeats && " • Có chỗ ngồi"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Organizer & Host Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Ban tổ chức</Text>
              
              <View style={styles.infoRow}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoValue}>{event.organizer.name}</Text>
                  <Text style={styles.infoSubtext}>
                    {event.organizer.description}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Người phụ trách</Text>
                  <Text style={styles.infoValue}>
                    {event.host.firstName} {event.host.lastName}
                  </Text>
                  <Text style={styles.infoSubtext}>
                    @{event.host.userName} • {event.host.email}
                  </Text>
                </View>
              </View>
            </View>

            {/* Global Badge */}
            {event.isGlobal && (
              <View style={styles.globalBadge}>
                <Ionicons name="globe-outline" size={16} color={COLORS.primary} />
                <Text style={styles.globalText}>Sự kiện toàn trường</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Register Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.registerButton,
              !canRegister() && styles.registerButtonDisabled,
            ]}
            disabled={!canRegister()}
            onPress={() => {
              Alert.alert("Đăng ký", "Chức năng đăng ký đang được phát triển");
            }}
          >
            <Text style={styles.registerButtonText}>
              {canRegister()
                ? "Đăng ký tham gia"
                : event.registeredCount >= event.maxCapacity
                ? "Đã hết chỗ"
                : "Chưa mở đăng ký"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.md,
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
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  banner: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.md,
  },
  bannerPlaceholder: {
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: SPACING.md,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.xl,
    marginBottom: SPACING.md,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: FONTS.sm,
    fontWeight: "600",
  },
  eventTitle: {
    fontSize: FONTS.xxl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONTS.md,
    color: COLORS.text,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.xl,
    ...SHADOWS.sm,
  },
  statText: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    fontWeight: "600",
  },
  progressBarSmall: {
    width: 60,
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: RADII.xl,
    overflow: "hidden",
  },
  progressFillSmall: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: FONTS.lg,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONTS.xs,
    color: COLORS.text,
    opacity: 0.5,
    marginBottom: 4,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: FONTS.md,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    opacity: 0.7,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginVertical: SPACING.md,
  },
  globalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.xl,
    alignSelf: "center",
    ...SHADOWS.sm,
  },
  globalText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  registerButton: {
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    alignItems: "center",
    ...SHADOWS.md,
  },
  registerButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: FONTS.md,
    fontWeight: "700",
  },
});

export default EventDetailScreen;
