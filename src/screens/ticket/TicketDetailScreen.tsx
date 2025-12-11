import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { ticketService } from "../../services/ticketService";
import { Ticket, TicketStatus } from "../../types/ticket";
import { RootStackParamList } from "../../types/navigation";
import { GradientButton } from "../../components";

type TicketDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TicketDetails">;
  route: RouteProp<RootStackParamList, "TicketDetails">;
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  VALID: "Có hiệu lực",
  USED: "Đã sử dụng",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  VALID: "#4CAF50",
  USED: "#9E9E9E",
  CANCELLED: "#F44336",
  EXPIRED: "#FF9800",
};

const TicketDetailScreen: React.FC<TicketDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketDetail();
  }, [ticketId]);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketById(ticketId);
      console.log("Ticket detail response:", JSON.stringify(response, null, 2));
      console.log("Seat data:", response.seat);
      console.log("SeatId:", response.seatId);
      setTicket(response);
    } catch (error) {
      console.error("Failed to fetch ticket detail", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải thông tin vé",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} • ${formatTime(dateString)}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.text }}>Không tìm thấy vé</Text>
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết vé</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Ticket Card */}
          <View style={styles.ticketCard}>
            {/* Event Banner */}
            {ticket.event?.bannerUrl && (
              <Image
                source={{ uri: ticket.event.bannerUrl }}
                style={styles.eventBanner}
                resizeMode="cover"
              />
            )}

            <View style={styles.ticketCardContent}>
              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: STATUS_COLORS[ticket.status] },
                ]}
              >
                <Text style={styles.statusText}>{STATUS_LABELS[ticket.status]}</Text>
              </View>

              {/* Event Title */}
              {ticket.event && (
                <Text style={styles.eventTitle}>{ticket.event.title}</Text>
              )}

              {/* Ticket ID */}
              <View style={styles.ticketIdContainer}>
                <Ionicons name="ticket" size={20} color={COLORS.primary} />
                <Text style={styles.ticketId}>Vé #{ticket.id.slice(0, 8)}</Text>
              </View>
            </View>
          </View>

          {/* Event Information */}
          {ticket.event && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Thông tin sự kiện</Text>

              {ticket.event.venue && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Địa điểm</Text>
                    <Text style={styles.infoValue}>{ticket.event.venue.name}</Text>
                    {ticket.event.venue.location && (
                      <Text style={styles.infoSubValue}>{ticket.event.venue.location}</Text>
                    )}
                  </View>
                </View>
              )}

              {ticket.event.venue && <View style={styles.divider} />}
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Thời gian diễn ra</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(ticket.event.startTime)}
                  </Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(ticket.event.endTime)}
                  </Text>
                </View>
              </View>

              {ticket.event.description && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Mô tả</Text>
                      <Text style={styles.infoValue}>{ticket.event.description}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Ticket Information */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Thông tin vé</Text>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày đặt vé</Text>
                <Text style={styles.infoValue}>{formatDateTime(ticket.bookingDate)}</Text>
              </View>
            </View>

            {ticket.checkinTime && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Thời gian check-in</Text>
                    <Text style={styles.infoValue}>{formatDateTime(ticket.checkinTime)}</Text>
                  </View>
                </View>
              </>
            )}

            {(ticket.seat || ticket.seatId) && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="business-outline" size={20} color={COLORS.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Chỗ ngồi</Text>
                    {ticket.seat ? (
                      <Text style={styles.infoValue}>
                        Hàng {ticket.seat.rowLabel}, Ghế {ticket.seat.colLabel}
                      </Text>
                    ) : (
                      <Text style={styles.infoValue}>
                        Seat ID: {ticket.seatId}
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}

            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="qr-code-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mã QR</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{ticket.qrCode}</Text>
              </View>
            </View>
          </View>

          {/* User Information */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Thông tin người dùng</Text>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue}>
                  {ticket.user.firstName} {ticket.user.lastName}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{ticket.user.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="at-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>@{ticket.user.userName}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Button */}
        {ticket.status === "VALID" && (
          <View style={styles.footer}>
            <GradientButton
              title="Xem mã QR"
              onPress={() => navigation.navigate("TicketQRCode", { ticketId: ticket.id })}
              icon="qr-code"
            />
          </View>
        )}
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
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.text,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl + 20,
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
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    overflow: "hidden",
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  eventBanner: {
    width: "100%",
    height: 180,
  },
  ticketCardContent: {
    padding: SPACING.lg,
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
    fontSize: FONTS.xl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  ticketIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  ticketId: {
    fontSize: FONTS.md,
    color: COLORS.text,
    opacity: 0.6,
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
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
    lineHeight: 22,
  },
  infoSubValue: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginVertical: SPACING.md,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  qrButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  qrButtonText: {
    color: "#FFFFFF",
    fontSize: FONTS.md,
    fontWeight: "700",
  },
});

export default TicketDetailScreen;
