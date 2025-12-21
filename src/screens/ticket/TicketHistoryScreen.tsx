import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { ticketService } from "../../services/ticketService";
import { Ticket, TicketStatus } from "../../types/ticket";
import { feedbackService } from "../../services/feedbackService";
import { ActionResultModal, ActionResultType } from "../../components";

type TicketHistoryScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function TicketHistoryScreen({
  navigation,
}: TicketHistoryScreenProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackedEventIds, setFeedbackedEventIds] = useState<Set<string>>(
    new Set()
  );

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ActionResultType>("error");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const loadTickets = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [ticketResponse, feedbackResponse] = await Promise.all([
        ticketService.getMyTickets(),
        feedbackService.getMyFeedbacks().catch(() => []),
      ]);

      setTickets(ticketResponse.data);

      // Lưu danh sách eventIds đã feedback
      const feedbackedIds = new Set(
        feedbackResponse.map((f: any) => f.eventId).filter(Boolean)
      );
      setFeedbackedEventIds(feedbackedIds);
    } catch (error: any) {
      console.log("Error loading tickets:", error);
      setModalType("error");
      setModalTitle("Lỗi");
      setModalMessage(
        error.response?.data?.message || "Không thể tải lịch sử đăng ký"
      );
      setModalVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTickets(true);
    }, [])
  );

  const onRefresh = () => {
    loadTickets(true);
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "VALID":
        return COLORS.success;
      case "USED":
        return COLORS.primary;
      case "CANCELED":
        return COLORS.error;
      case "EXPIRED":
        return COLORS.textSecondary;
      default:
        return COLORS.text;
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case "VALID":
        return "Còn hiệu lực";
      case "USED":
        return "Đã tham dự";
      case "CANCELED":
        return "Đã hủy";
      case "EXPIRED":
        return "Hết hạn";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case "VALID":
        return "checkmark-circle";
      case "USED":
        return "checkmark-done-circle";
      case "CANCELED":
        return "close-circle";
      case "EXPIRED":
        return "time";
      default:
        return "help-circle";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const handleTicketPress = (ticket: Ticket) => {
    // Nếu sự kiện đã có feedback, navigate sang FeedbackHistory với eventId
    if (ticket.event?.id && feedbackedEventIds.has(ticket.event.id)) {
      navigation.navigate("FeedbackHistory", {
        eventId: ticket.event.id,
        eventTitle: ticket.event.title,
        eventBannerUrl: ticket.event.bannerUrl,
        eventStartTime: ticket.event.startTime,
        eventVenueName: ticket.event.venue?.name,
      });
    } else if (
      ticket.status === "USED" ||
      ticket.status === "EXPIRED" ||
      ticket.status === "CANCELED"
    ) {
      // Nếu vé đã sử dụng nhưng chưa feedback, navigate sang FeedbackEvent
      navigation.navigate("FeedbackEvent", {
        eventId: ticket.event?.id,
        eventTitle: ticket.event?.title,
      });
    } else {
      navigation.navigate("TicketDetails", { ticketId: ticket.id });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải lịch sử đăng ký...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient_1}
        style={styles.header}
        start={{ x: 1, y: 0.2 }}
        end={{ x: 0.2, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử đăng ký</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {tickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="ticket-outline"
                size={80}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>Bạn chưa đăng ký sự kiện nào</Text>
            </View>
          ) : (
            <View style={styles.ticketsContainer}>
              {tickets.map((ticket) => (
                <TouchableOpacity
                  key={ticket.id}
                  style={styles.ticketCard}
                  onPress={() => handleTicketPress(ticket)}
                >
                  {ticket.event?.bannerUrl && (
                    <Image
                      source={{ uri: ticket.event.bannerUrl }}
                      style={styles.eventBanner}
                      resizeMode="cover"
                    />
                  )}

                  <View style={styles.ticketContent}>
                    <View style={styles.ticketHeader}>
                      <Text style={styles.eventTitle} numberOfLines={2}>
                        {ticket.event?.title || "Sự kiện"}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(ticket.status) },
                        ]}
                      >
                        <Ionicons
                          name={getStatusIcon(ticket.status)}
                          size={12}
                          color={COLORS.white}
                        />
                        <Text style={styles.statusText}>
                          {getStatusLabel(ticket.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.ticketBody}>
                      <View style={styles.infoRow}>
                        <Ionicons
                          name="location"
                          size={16}
                          color={COLORS.textSecondary}
                        />
                        <Text style={styles.infoText} numberOfLines={1}>
                          {ticket.event?.venue?.name}
                        </Text>
                      </View>

                      {ticket.event?.startTime && (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="calendar"
                            size={16}
                            color={COLORS.textSecondary}
                          />
                          <Text style={styles.infoText}>
                            {formatDate(ticket.event.startTime)} -{" "}
                            {formatTime(ticket.event.startTime)}
                          </Text>
                        </View>
                      )}

                      {ticket.bookingDate && (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="time"
                            size={16}
                            color={COLORS.textSecondary}
                          />
                          <Text style={styles.infoText}>
                            Đăng ký: {formatDate(ticket.bookingDate)} -{" "}
                            {formatTime(ticket.bookingDate)}
                          </Text>
                        </View>
                      )}

                      {ticket.checkinTime && (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={COLORS.success}
                          />
                          <Text
                            style={[styles.infoText, { color: COLORS.success }]}
                          >
                            Check-in: {formatDate(ticket.checkinTime)} -{" "}
                            {formatTime(ticket.checkinTime)}
                          </Text>
                        </View>
                      )}

                      {ticket.seat && (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="easel"
                            size={16}
                            color={COLORS.textSecondary}
                          />
                          <Text style={styles.infoText}>
                            Ghế: Hàng {ticket.seat?.rowLabel || "N/A"}, Ghế{" "}
                            {ticket.seat?.colLabel || "N/A"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Action Result Modal */}
      <ActionResultModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flex: 1,
    paddingTop: SPACING.xl + 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
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
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyText: {
    marginTop: SPACING.lg,
    fontSize: FONTS.lg,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  ticketsContainer: {
    padding: SPACING.lg,
  },
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  eventBanner: {
    width: "100%",
    height: 150,
  },
  ticketContent: {
    padding: SPACING.lg,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  eventTitle: {
    flex: 1,
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.text,
    marginRight: SPACING.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: FONTS.xs,
    fontWeight: "600",
    color: COLORS.white,
  },
  ticketBody: {
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
});
