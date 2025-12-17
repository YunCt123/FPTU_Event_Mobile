import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import { ActionResultModal, ActionResultType } from "../../components";
import { ticketService } from "../../services/ticketService";
import { Ticket, TicketStatus } from "../../types/ticket";
import { socketService, CheckinPayload } from "../../services/socketService";
import { feedbackService } from "../../services/feedbackService";

type TicketScreenProps = {
  navigation: NativeStackNavigationProp<any>;
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

const TicketScreen: React.FC<TicketScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<"valid" | "used">("valid");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [feedbackedEventIds, setFeedbackedEventIds] = useState<Set<string>>(
    new Set()
  );

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ActionResultType>("error");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [cancellingTicketId, setCancellingTicketId] = useState<string | null>(
    null
  );
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [ticketToCancelId, setTicketToCancelId] = useState<string | null>(null);

  const fetchTickets = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [ticketResponse, feedbackResponse] = await Promise.all([
          ticketService.getMyTickets({
            page: pageNum,
            limit: 10,
          }),
          feedbackService.getMyFeedbacks().catch(() => []),
        ]);

        setTickets(ticketResponse.data || []);
        setTotalPages(ticketResponse.meta?.totalPages || 1);
        setPage(pageNum);

        // Lưu danh sách eventIds đã feedback
        const feedbackedIds = new Set(
          feedbackResponse.map((f: any) => f.eventId).filter(Boolean)
        );
        setFeedbackedEventIds(feedbackedIds);
      } catch (error) {
        console.error("Failed to fetch tickets", error);
        setModalType("error");
        setModalTitle("Lỗi!");
        setModalMessage("Không thể tải danh sách vé. Vui lòng thử lại.");
        setModalVisible(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTickets(1);
  }, []);

  // Realtime check-in listener - subscribe to all events that user has tickets for
  useEffect(() => {
    if (tickets.length === 0) return;

    // Get unique event IDs from tickets
    const eventIds = [
      ...new Set(tickets.map((t) => t.event?.id).filter(Boolean)),
    ] as string[];

    // Connect socket
    socketService.connect();

    // Join all event rooms
    eventIds.forEach((eventId) => {
      socketService.joinEventRoom(eventId);
    });

    // Listen for check-in events
    const unsubscribe = socketService.onCheckin((payload: CheckinPayload) => {
      // Check if this check-in is for one of our tickets
      const ticketIndex = tickets.findIndex((t) => t.id === payload.ticketId);

      if (ticketIndex !== -1) {
        console.log("[Realtime] Your ticket was checked in!", payload);

        // Update ticket status locally
        setTickets((prev) =>
          prev.map((t) =>
            t.id === payload.ticketId
              ? {
                  ...t,
                  status: "USED" as TicketStatus,
                  checkinTime: payload.checkinTime,
                }
              : t
          )
        );

        // Modal will be shown in TicketQRCodeScreen, just update status here
      }
    });

    return () => {
      unsubscribe();
      eventIds.forEach((eventId) => {
        socketService.leaveEventRoom(eventId);
      });
    };
  }, [tickets.length]); // Re-subscribe when tickets change

  // Refresh tickets when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTickets(1, true);
    }, [fetchTickets])
  );

  const onRefresh = () => {
    fetchTickets(1, true);
  };

  const handleCancelTicket = async () => {
    if (!ticketToCancelId) return;

    try {
      setCancellingTicketId(ticketToCancelId);
      setShowCancelConfirm(false);

      await ticketService.cancelTicket(ticketToCancelId);

      setModalType("success");
      setModalTitle("Thành công!");
      setModalMessage("Vé của bạn đã được hủy. Ghế sẽ được giải phóng.");
      setModalVisible(true);

      // Refresh tickets list
      fetchTickets(1, false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.status === 400
          ? "Không thể hủy vé. Sự kiện bắt đầu trong vòng 24 giờ tới hoặc vé đã bị hủy."
          : "Không thể hủy vé. Vui lòng thử lại.");

      setModalType("error");
      setModalTitle("Lỗi hủy vé");
      setModalMessage(errorMessage);
      setModalVisible(true);
    } finally {
      setCancellingTicketId(null);
      setTicketToCancelId(null);
    }
  };

  const openCancelConfirm = (ticketId: string) => {
    setTicketToCancelId(ticketId);
    setShowCancelConfirm(true);
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

  const getTicketIcon = (status: TicketStatus) => {
    switch (status) {
      case "VALID":
        return "ticket";
      case "USED":
        return "checkmark-circle";
      case "CANCELLED":
        return "close-circle";
      case "EXPIRED":
        return "time";
      default:
        return "ticket-outline";
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === "valid") {
      return ticket.status === "VALID";
    } else {
      // Hiển thị tất cả vé đã sử dụng/hủy/hết hạn
      return (
        ticket.status === "USED" ||
        ticket.status === "CANCELLED" ||
        ticket.status === "EXPIRED"
      );
    }
  });

  // Kiểm tra vé đã feedback chưa
  const hasTicketFeedback = (ticket: Ticket) => {
    return ticket.event?.id && feedbackedEventIds.has(ticket.event.id);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient_1}
        start={{ x: 1, y: 0.2 }}
        end={{ x: 0.2, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vé của tôi</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải vé...</Text>
          </View>
        ) : (
          <>
            {/* Tabs */}
            <View style={styles.tabWrapper}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "valid" && styles.tabActive,
                  ]}
                  onPress={() => setActiveTab("valid")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "valid" && styles.tabTextActive,
                    ]}
                  >
                    Có hiệu lực
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === "used" && styles.tabActive]}
                  onPress={() => setActiveTab("used")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "used" && styles.tabTextActive,
                    ]}
                  >
                    Đã sử dụng
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
            >
              {filteredTickets.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="ticket-outline"
                    size={64}
                    color={COLORS.text}
                    style={{ opacity: 0.3, marginBottom: SPACING.lg }}
                  />
                  <Text style={styles.emptyText}>
                    {activeTab === "valid"
                      ? "Bạn chưa có vé nào"
                      : "Chưa có vé đã qua"}
                  </Text>
                  {activeTab === "valid" && (
                    <TouchableOpacity
                      style={styles.browseButton}
                      onPress={() => {
                        navigation.navigate("Main", { screen: "Event" });
                      }}
                    >
                      <Text style={styles.browseButtonText}>
                        Khám phá sự kiện
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.ticketsContainer}>
                  {filteredTickets.map((ticket) => (
                    <TouchableOpacity
                      key={ticket.id}
                      style={[
                        styles.ticketCard,
                        ticket.status === "CANCELLED" &&
                          styles.ticketCardDisabled,
                      ]}
                      activeOpacity={ticket.status === "CANCELLED" ? 1 : 0.7}
                      disabled={ticket.status === "CANCELLED"}
                      onPress={() => {
                        if (activeTab === "used") {
                          // Chỉ cho phép feedback nếu chưa feedback và vé đã USED
                          if (
                            !hasTicketFeedback(ticket) &&
                            ticket.status === "USED"
                          ) {
                            navigation.navigate("FeedbackEvent", {
                              eventId: ticket.event?.id,
                              eventTitle: ticket.event?.title,
                              ticketId: ticket.id,
                            });
                          }
                        } else {
                          navigation.navigate("TicketDetails", {
                            ticketId: ticket.id,
                          });
                        }
                      }}
                    >
                      <View style={styles.ticketHeader}>
                        <View style={styles.ticketIconContainer}>
                          <Ionicons
                            name={getTicketIcon(ticket.status)}
                            size={24}
                            color={COLORS.primary}
                          />
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: STATUS_COLORS[ticket.status] },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {STATUS_LABELS[ticket.status]}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.ticketTitle} numberOfLines={2}>
                        Tên sự kiện: {ticket.event.title}
                      </Text>

                      <View style={styles.ticketDetails}>
                        <View style={styles.ticketDetail}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color={COLORS.text}
                            style={{ opacity: 0.7 }}
                          />
                          <Text style={styles.detailText}>
                            {formatDate(ticket.bookingDate)}
                          </Text>
                        </View>
                        {ticket.checkinTime && (
                          <View style={styles.ticketDetail}>
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={14}
                              color={COLORS.text}
                              style={{ opacity: 0.7 }}
                            />
                            <Text style={styles.detailText}>
                              {formatTime(ticket.checkinTime)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {ticket.user && (
                        <View style={styles.ticketDetail}>
                          <Ionicons
                            name="person-outline"
                            size={14}
                            color={COLORS.text}
                            style={{ opacity: 0.7 }}
                          />
                          <Text style={styles.detailText}>
                            {ticket.user.firstName} {ticket.user.lastName}
                          </Text>
                        </View>
                      )}

                      <View style={styles.divider} />

                      <View style={styles.ticketCodeContainer}>
                        <Text style={styles.ticketCodeLabel}>Mã QR</Text>
                        <Text style={styles.ticketCode} numberOfLines={1}>
                          {ticket.qrCode}
                        </Text>
                      </View>

                      {ticket.status === "VALID" && (
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() =>
                              navigation.navigate("TicketQRCode", {
                                ticketId: ticket.id,
                              })
                            }
                          >
                            <Text style={styles.viewButtonText}>
                              Xem QR Code
                            </Text>
                            <Ionicons
                              name="qr-code"
                              size={16}
                              color={COLORS.white}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => openCancelConfirm(ticket.id)}
                            disabled={cancellingTicketId === ticket.id}
                          >
                            {cancellingTicketId === ticket.id ? (
                              <ActivityIndicator
                                size="small"
                                color={COLORS.white}
                              />
                            ) : (
                              <>
                                <Text style={styles.cancelButtonText}>
                                  Hủy vé
                                </Text>
                                <Ionicons
                                  name="close-circle"
                                  size={16}
                                  color={COLORS.white}
                                />
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Feedback button or status for used tickets */}
                      {ticket.status === "USED" &&
                        (hasTicketFeedback(ticket) ? (
                          <View style={styles.feedbackedBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color={COLORS.success}
                            />
                            <Text style={styles.feedbackedText}>
                              Đã đánh giá
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.feedbackButton}
                            onPress={() =>
                              navigation.navigate("FeedbackEvent", {
                                eventId: ticket.event?.id,
                                eventTitle: ticket.event?.title,
                                ticketId: ticket.id,
                              })
                            }
                          >
                            <Text style={styles.feedbackButtonText}>
                              Gửi đánh giá
                            </Text>
                            <Ionicons
                              name="star"
                              size={16}
                              color={COLORS.white}
                            />
                          </TouchableOpacity>
                        ))}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </>
        )}

        {/* Action Result Modal */}
        <ActionResultModal
          visible={modalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Xác nhận hủy vé</Text>
              <Text style={styles.confirmMessage}>
                Bạn chắc chắn muốn hủy vé này? Ghế sẽ được giải phóng và bạn
                không thể hoàn tác hành động này.
              </Text>
              <View style={styles.confirmButtonContainer}>
                <TouchableOpacity
                  style={styles.confirmCancelBtn}
                  onPress={() => {
                    setShowCancelConfirm(false);
                    setTicketToCancelId(null);
                  }}
                >
                  <Text style={styles.confirmCancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteBtn}
                  onPress={handleCancelTicket}
                  disabled={cancellingTicketId !== null}
                >
                  <Text style={styles.confirmDeleteBtnText}>Xác nhận hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.text,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.screenPadding,
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
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.text,
  },
  tabWrapper: {
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.md,
  },
  tabContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderRadius: RADII.button,
    backgroundColor: COLORS.background,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.huge * 2,
  },
  emptyText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: SPACING.xl,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: "600",
  },
  ticketsContainer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  ticketCardDisabled: {
    opacity: 0.5,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  ticketIconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.pill,
  },
  statusText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: "600",
  },
  ticketTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  ticketDetails: {
    flexDirection: "row",
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  ticketDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: SPACING.md,
  },
  ticketCodeContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
  },
  ticketCodeLabel: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: SPACING.xs,
  },
  ticketCode: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "bold",
    color: COLORS.text,
    letterSpacing: 1,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  viewButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F44336",
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  confirmModal: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    width: "85%",
    maxWidth: 350,
  },
  confirmTitle: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  confirmMessage: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  confirmButtonContainer: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
  },
  confirmCancelBtnText: {
    color: COLORS.text,
    fontSize: FONTS.body,
    fontWeight: "600",
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    backgroundColor: "#F44336",
    alignItems: "center",
  },
  confirmDeleteBtnText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: "600",
  },
});

export default TicketScreen;
