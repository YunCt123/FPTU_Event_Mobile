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
  Linking,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SPACING, FONTS, RADII, SHADOWS, COLORS } from "../../utils/theme";
import { eventService } from "../../services/eventService";
import EventRegisterModal from "../../components/Event/EventRegisterModal";
import { Event, EventStatus } from "../../types/event";
import { RootStackParamList } from "../../types/navigation";
import { STORAGE_KEYS } from "../../api/api";
import { User } from "../../types/user";

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
  const [isRegisterModalVisible, setRegisterModalVisible] = useState(false);
  const [selectedSeatLabel, setSelectedSeatLabel] = useState<string | null>(
    null
  );
  const [userRole, setUserRole] = useState<string | null>(null);

  const isStaff = userRole === "staff";

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
          const user: User = JSON.parse(userStr);
          setUserRole(user.roleName);
        }
      } catch (error) {
        console.error("Error loading user role:", error);
      }
    };
    loadUserRole();
  }, []);

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
            onPress: () => navigation.goBack(),
          },
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
    if (!event || event.maxCapacity === null) return 0;
    return (event.registeredCount / event.maxCapacity) * 100;
  };

  const canRegister = () => {
    if (!event) return false;
    // Online events don't require registration
    if (event.isOnline) return false;
    // Check if registration times are set
    if (!event.startTimeRegister || !event.endTimeRegister) return false;
    const now = new Date();
    const startRegister = new Date(event.startTimeRegister);
    const endRegister = new Date(event.endTimeRegister);
    return (
      event.status === "PUBLISHED" &&
      now >= startRegister &&
      now <= endRegister &&
      (event.maxCapacity === null || event.registeredCount < event.maxCapacity)
    );
  };

  const handleOpenMeetingUrl = async () => {
    if (event?.onlineMeetingUrl) {
      try {
        await Linking.openURL(event.onlineMeetingUrl);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể mở đường dẫn");
      }
    }
  };

  const handleCopyMeetingUrl = async () => {
    if (event?.onlineMeetingUrl) {
      // Since expo-clipboard is not installed, we'll just show the URL in alert
      Alert.alert("Đường dẫn cuộc họp", event.onlineMeetingUrl, [
        { text: "OK" },
      ]);
    }
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
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: COLORS.primary,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#FFF" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isRegisterAvailable = canRegister();
  const remainingSlots =
    event.maxCapacity !== null
      ? Math.max(event.maxCapacity - event.registeredCount, 0)
      : 0;
  const buttonLabel = isRegisterAvailable
    ? "Đăng ký tham gia"
    : event.maxCapacity !== null && event.registeredCount >= event.maxCapacity
    ? "Đã hết chỗ"
    : "Chưa mở đăng ký";
  const buttonSubLabel = selectedSeatLabel
    ? `Ghế đã chọn: ${selectedSeatLabel}`
    : isRegisterAvailable
    ? `Còn ${remainingSlots} chỗ trống`
    : event.maxCapacity !== null && event.registeredCount >= event.maxCapacity
    ? "Hãy theo dõi sự kiện khác"
    : event.startTimeRegister
    ? `Mở đăng ký từ ${formatDate(event.startTimeRegister)}`
    : "Chưa có thông tin đăng ký";
  const buttonGradient = isRegisterAvailable
    ? ["#FF9A3C", "#FF6A00"]
    : ["#C8C8C8", "#E0E0E0"];

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
              <Text style={styles.statusText}>{event.status}</Text>
            </View>

            {/* Event Title */}
            <Text style={styles.eventTitle}>{event.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{event.description}</Text>

            {/* Event Stats */}
            <View style={styles.statsContainer}>
              {/* Online Badge */}
              {event.isOnline && (
                <View style={[styles.statItem, styles.onlineBadge]}>
                  <Ionicons name="videocam" size={20} color="#FFFFFF" />
                  <Text style={[styles.statText, { color: "#FFFFFF" }]}>
                    Online
                  </Text>
                </View>
              )}
              {/* Capacity - only show for offline events with maxCapacity */}
              {!event.isOnline && event.maxCapacity !== null && (
                <>
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
                </>
              )}
              {event.isGlobal && (
                <View style={styles.statItem}>
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color={COLORS.primary}
                  />
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
                    {formatDate(event.startTime)} •{" "}
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </Text>
                </View>
              </View>

              {/* Registration time - only show if available and not online event */}
              {!event.isOnline &&
                event.startTimeRegister &&
                event.endTimeRegister && (
                  <>
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
                          {formatDate(event.startTimeRegister)} -{" "}
                          {formatDate(event.endTimeRegister)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

              <View style={styles.divider} />

              {/* Location / Online Meeting */}
              {event.isOnline ? (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="videocam-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Sự kiện trực tuyến</Text>
                    {event.onlineMeetingUrl ? (
                      <View style={styles.meetingUrlContainer}>
                        <Text
                          style={styles.meetingUrlText}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {event.onlineMeetingUrl}
                        </Text>
                        <View style={styles.meetingUrlActions}>
                          <TouchableOpacity
                            style={styles.meetingUrlButton}
                            onPress={handleCopyMeetingUrl}
                          >
                            <Ionicons
                              name="copy-outline"
                              size={18}
                              color={COLORS.primary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.meetingUrlButton,
                              styles.openLinkButton,
                            ]}
                            onPress={handleOpenMeetingUrl}
                          >
                            <Ionicons
                              name="open-outline"
                              size={18}
                              color="#FFFFFF"
                            />
                            <Text style={styles.openLinkText}>Tham gia</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.infoValue}>
                        Link tham gia sẽ được cung cấp sau
                      </Text>
                    )}
                  </View>
                </View>
              ) : event.venue ? (
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
              ) : (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Địa điểm</Text>
                    <Text style={styles.infoValue}>Chưa xác định</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Organizer Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Ban tổ chức</Text>

              <View style={styles.organizerRow}>
                {event.organizer.logoUrl ? (
                  <Image
                    source={{ uri: event.organizer.logoUrl }}
                    style={styles.organizerLogo}
                  />
                ) : (
                  <View style={styles.organizerLogoPlaceholder}>
                    <Ionicons
                      name="business"
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                )}
                <View style={styles.organizerContent}>
                  <Text style={styles.infoValue}>{event.organizer.name}</Text>
                  <Text style={styles.infoSubtext}>
                    {event.organizer.description}
                  </Text>
                </View>
              </View>
            </View>

            {/* Host/MC Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Người dẫn chương trình</Text>
              <View style={styles.hostCard}>
                <View style={styles.hostAvatarContainer}>
                  <Ionicons name="mic" size={24} color={COLORS.white} />
                </View>
                <View style={styles.hostInfo}>
                  <Text style={styles.hostName}>
                    {event.host.firstName} {event.host.lastName}
                  </Text>
                  <Text style={styles.hostRole}>MC / Host</Text>
                  <Text style={styles.hostContact}>@{event.host.userName}</Text>
                </View>
              </View>
            </View>

            {/* Speakers Card */}
            {event.eventSpeakers && event.eventSpeakers.length > 0 && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>
                  Diễn giả ({event.eventSpeakers.length})
                </Text>
                {event.eventSpeakers.map((eventSpeaker, index) => (
                  <View key={eventSpeaker.id}>
                    {index > 0 && <View style={styles.divider} />}
                    <View style={styles.speakerCard}>
                      {eventSpeaker.speaker.avatar ? (
                        <Image
                          source={{ uri: eventSpeaker.speaker.avatar }}
                          style={styles.speakerAvatar}
                        />
                      ) : (
                        <View style={styles.speakerAvatarPlaceholder}>
                          <Ionicons
                            name="person"
                            size={24}
                            color={COLORS.primary}
                          />
                        </View>
                      )}
                      <View style={styles.speakerInfo}>
                        <Text style={styles.speakerName}>
                          {eventSpeaker.speaker.name}
                        </Text>
                        <View style={styles.speakerBadge}>
                          <Ionicons
                            name="briefcase-outline"
                            size={12}
                            color={COLORS.primary}
                          />
                          <Text style={styles.speakerCompany}>
                            {eventSpeaker.speaker.company}
                          </Text>
                        </View>
                        <Text style={styles.speakerBio} numberOfLines={2}>
                          {eventSpeaker.speaker.bio}
                        </Text>
                        <View style={styles.topicContainer}>
                          <Ionicons
                            name="chatbubble-outline"
                            size={12}
                            color={COLORS.text}
                          />
                          <Text style={styles.speakerTopic} numberOfLines={1}>
                            {eventSpeaker.topic}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Global Badge */}
            {event.isGlobal && (
              <View style={styles.globalBadge}>
                <Ionicons
                  name="globe-outline"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.globalText}>Sự kiện toàn trường</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Register Button - Only show for non-staff users and offline events */}
        {!isStaff && !event.isOnline && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.registerButton,
                !isRegisterAvailable && styles.registerButtonDisabled,
              ]}
              disabled={!isRegisterAvailable}
              onPress={() => {
                if (isRegisterAvailable) {
                  setRegisterModalVisible(true);
                }
              }}
            >
              <LinearGradient
                colors={COLORS.gradient_button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.registerButtonGradient}
              >
                <Ionicons
                  name="flash-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.registerButtonIcon}
                />
                <View style={styles.registerButtonTextContainer}>
                  <Text style={styles.registerButtonText}>{buttonLabel}</Text>
                  <Text
                    style={[
                      styles.registerButtonSubText,
                      !isRegisterAvailable && {
                        color: "rgba(255,255,255,0.7)",
                      },
                    ]}
                  >
                    {buttonSubLabel}
                  </Text>
                </View>
                <View style={styles.registerButtonArrow}>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <EventRegisterModal
          visible={isRegisterModalVisible}
          onClose={() => setRegisterModalVisible(false)}
          venueId={event.venueId ?? 0}
          eventId={eventId}
          eventTitle={event.title}
          onSeatSelected={(seat) =>
            setSelectedSeatLabel(`${seat.rowLabel}${seat.colLabel}`)
          }
          onRegisterSuccess={() => {
            fetchEventDetail();
          }}
        />
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
  onlineBadge: {
    backgroundColor: "#4CAF50",
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
  meetingUrlContainer: {
    marginTop: 4,
  },
  meetingUrlText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  meetingUrlActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  meetingUrlButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
  },
  openLinkButton: {
    backgroundColor: COLORS.primary,
  },
  openLinkText: {
    fontSize: FONTS.sm,
    color: "#FFFFFF",
    fontWeight: "600",
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
  // Organizer styles
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  organizerLogo: {
    width: 56,
    height: 56,
    borderRadius: RADII.lg,
  },
  organizerLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  organizerContent: {
    flex: 1,
  },
  // Host/MC styles
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADII.lg,
  },
  hostAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: FONTS.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  hostRole: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  hostContact: {
    fontSize: FONTS.xs,
    color: COLORS.text,
    opacity: 0.6,
  },
  // Speaker styles
  speakerCard: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  speakerAvatar: {
    width: 64,
    height: 64,
    borderRadius: RADII.lg,
  },
  speakerAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  speakerInfo: {
    flex: 1,
  },
  speakerName: {
    fontSize: FONTS.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  speakerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  speakerCompany: {
    fontSize: FONTS.xs,
    color: COLORS.primary,
    fontWeight: "600",
  },
  speakerBio: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    opacity: 0.7,
    lineHeight: 18,
    marginBottom: 6,
  },
  topicContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADII.sm,
    alignSelf: "flex-start",
  },
  speakerTopic: {
    fontSize: FONTS.xs,
    color: COLORS.text,
    opacity: 0.8,
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: "transparent",
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    ...SHADOWS.lg,
  },
  registerButton: {
    borderRadius: RADII.xl,
    overflow: "hidden",
  },
  registerButtonDisabled: {
    opacity: 0.8,
  },
  registerButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  registerButtonIcon: {
    marginRight: SPACING.md,
  },
  registerButtonTextContainer: {
    flex: 1,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: FONTS.lg,
    fontWeight: "700",
  },
  registerButtonSubText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FONTS.sm,
    marginTop: 2,
  },
  registerButtonArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.md,
  },
});

export default EventDetailScreen;
