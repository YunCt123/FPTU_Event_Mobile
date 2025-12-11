import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { ticketService } from "../../services/ticketService";
import { Ticket } from "../../types/ticket";
import { RootStackParamList } from "../../types/navigation";
import QRCode from "react-native-qrcode-svg";
import { socketService, CheckinPayload } from "../../services/socketService";

type TicketQRCodeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TicketQRCode">;
  route: RouteProp<RootStackParamList, "TicketQRCode">;
};

const { width } = Dimensions.get("window");
const QR_SIZE = width * 0.7;

const TicketQRCodeScreen: React.FC<TicketQRCodeScreenProps> = ({
  navigation,
  route,
}) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [brightness, setBrightness] = useState(1);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinTime, setCheckinTime] = useState<string | null>(null);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  const startSuccessAnimation = () => {
    // Reset animations
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    checkmarkAnim.setValue(0);
    confettiAnims.forEach((anim) => {
      anim.translateY.setValue(0);
      anim.translateX.setValue(0);
      anim.rotate.setValue(0);
      anim.opacity.setValue(1);
    });

    // Modal entrance
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Checkmark animation
    Animated.sequence([
      Animated.delay(200),
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Text slide up
    Animated.sequence([
      Animated.delay(300),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti animation
    confettiAnims.forEach((anim, index) => {
      const angle = (index / confettiAnims.length) * Math.PI * 2;
      const distance = 120 + Math.random() * 80;

      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(anim.translateX, {
            toValue: Math.cos(angle) * distance,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: Math.sin(angle) * distance + 100,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() * 4 - 2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(500),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCloseModal = () => {
    setShowCheckinModal(false);
    // Navigate back to Main and then to Ticket tab
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  useEffect(() => {
    fetchTicketDetail();
    // Tăng độ sáng màn hình khi vào screen này
    increaseBrightness();

    return () => {
      // Khôi phục độ sáng khi rời screen
      restoreBrightness();
    };
  }, [ticketId]);

  // Realtime check-in listener
  useEffect(() => {
    if (!ticket?.event?.id) return;

    console.log("[QRScreen] Setting up socket for event:", ticket.event.id);

    // Connect and join event room
    socketService.connect();
    socketService.joinEventRoom(ticket.event.id);

    // Listen for check-in events for THIS ticket
    const unsubscribe = socketService.onCheckin((payload: CheckinPayload) => {
      console.log(
        "[QRScreen] Received checkin:",
        payload.ticketId,
        "our:",
        ticketId
      );

      if (payload.ticketId === ticketId) {
        console.log("[QRScreen] ✅ MATCH! Showing modal...");
        setCheckinTime(payload.checkinTime);
        setShowCheckinModal(true);
        setTimeout(() => startSuccessAnimation(), 100);
      }
    });

    return () => {
      unsubscribe();
      socketService.leaveEventRoom(ticket.event.id);
    };
  }, [ticket?.event?.id, ticketId]);

  const increaseBrightness = async () => {
    try {
      // TODO: Implement brightness control if needed
      // Có thể dùng expo-brightness hoặc react-native-brightness
    } catch (error) {
      console.error("Failed to increase brightness", error);
    }
  };

  const restoreBrightness = async () => {
    try {
      // TODO: Restore original brightness
    } catch (error) {
      console.error("Failed to restore brightness", error);
    }
  };

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketById(ticketId);

      if (response.status !== "VALID") {
        Alert.alert("Thông báo", "Vé này không còn hiệu lực", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
        return;
      }

      setTicket(response);
    } catch (error) {
      console.error("Failed to fetch ticket detail", error);
      Alert.alert("Lỗi", "Không thể tải thông tin vé", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải mã QR...</Text>
      </View>
    );
  }

  if (!ticket) {
    return null;
  }

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
          <Text style={styles.headerTitle}>Mã QR</Text>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() =>
              navigation.navigate("TicketDetails", { ticketId: ticket.id })
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        {/* QR Code Container */}
        <View style={styles.content}>
          <View style={styles.qrContainer}>
            {/* Event Title */}
            {ticket.event && (
              <Text style={styles.eventTitle} numberOfLines={2}>
                {ticket.event.title}
              </Text>
            )}

            {/* QR Code */}
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={ticket.qrCode}
                size={QR_SIZE}
                color={COLORS.text}
                backgroundColor="#FFFFFF"
                logo={require("../../assets/fpt_logo.png")}
                logoSize={QR_SIZE * 0.2}
                logoBackgroundColor="#FFFFFF"
                logoBorderRadius={10}
              />
            </View>

            {/* Ticket Info */}
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketLabel}>Mã vé</Text>
              <Text style={styles.ticketCode}>{ticket.qrCode}</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionCard}>
            <Ionicons
              name="information-circle"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.instructionText}>
              Vui lòng đưa mã QR này cho nhân viên để check-in tại sự kiện
            </Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Lưu ý:</Text>
            <View style={styles.tipRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={COLORS.text}
              />
              <Text style={styles.tipText}>
                Mỗi mã QR chỉ được sử dụng một lần
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={COLORS.text}
              />
              <Text style={styles.tipText}>
                Không chia sẻ mã QR cho người khác
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={COLORS.text}
              />
              <Text style={styles.tipText}>Đến sớm để tránh xếp hàng</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Realtime Check-in Success Modal */}
      <Modal
        visible={showCheckinModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <Animated.View
          style={[styles.checkinModalOverlay, { opacity: fadeAnim }]}
        >
          {/* Confetti particles */}
          {confettiAnims.map((anim, index) => {
            const colors = [
              "#FF6B6B",
              "#4ECDC4",
              "#FFE66D",
              "#95E1D3",
              "#F38181",
              "#AA96DA",
              "#FCBAD3",
              "#A8D8EA",
            ];
            const shapes = ["●", "■", "▲", "★", "♦", "♥"];
            return (
              <Animated.Text
                key={index}
                style={[
                  styles.confetti,
                  {
                    color: colors[index % colors.length],
                    transform: [
                      { translateX: anim.translateX },
                      { translateY: anim.translateY },
                      {
                        rotate: anim.rotate.interpolate({
                          inputRange: [-2, 2],
                          outputRange: ["-360deg", "360deg"],
                        }),
                      },
                    ],
                    opacity: anim.opacity,
                  },
                ]}
              >
                {shapes[index % shapes.length]}
              </Animated.Text>
            );
          })}

          <Animated.View
            style={[
              styles.checkinModalContent,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            {/* Success Icon */}
            <View style={styles.successIconWrapper}>
              <LinearGradient
                colors={["#10b981", "#059669", "#047857"]}
                style={styles.checkinIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View
                  style={{ transform: [{ scale: checkmarkAnim }] }}
                >
                  <Ionicons name="checkmark" size={56} color="#fff" />
                </Animated.View>
              </LinearGradient>
              <Animated.View
                style={[
                  styles.successRing,
                  styles.successRing1,
                  { opacity: checkmarkAnim },
                ]}
              />
              <Animated.View
                style={[
                  styles.successRing,
                  styles.successRing2,
                  { opacity: checkmarkAnim },
                ]}
              />
            </View>

            {/* Title & Message */}
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
                alignItems: "center",
              }}
            >
              <Text style={styles.checkinModalTitle}>
                🎉 Check-in thành công!
              </Text>
              <Text style={styles.checkinModalSubtitle}>
                Chào mừng bạn đến sự kiện
              </Text>

              {ticket?.event?.title && (
                <Text style={styles.checkinEventName} numberOfLines={2}>
                  {ticket.event.title}
                </Text>
              )}
            </Animated.View>

            {/* Time badge */}
            {checkinTime && (
              <Animated.View
                style={[
                  styles.checkinTimeContainer,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View style={styles.timeIconBg}>
                  <Ionicons name="time" size={16} color="#10b981" />
                </View>
                <Text style={styles.checkinTimeText}>
                  {formatDateTime(checkinTime)}
                </Text>
              </Animated.View>
            )}

            {/* Divider */}
            <View style={styles.modalDivider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerIcon}>
                <Ionicons name="ticket" size={16} color="#94a3b8" />
              </View>
              <View style={styles.dividerLine} />
            </View>

            {/* Info message */}
            <Text style={styles.checkinInfoText}>
              Hãy tận hưởng sự kiện và có những trải nghiệm tuyệt vời nhé!
            </Text>

            {/* Button */}
            <TouchableOpacity
              style={styles.checkinModalButton}
              onPress={handleCloseModal}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#FF9A3C", "#FF6A00"]}
                style={styles.checkinModalButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons
                  name="sparkles"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.checkinModalButtonText}>
                  Xem vé của tôi
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
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
  infoButton: {
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    justifyContent: "center",
  },
  qrContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.xl,
    padding: SPACING.xl,
    marginTop: -SPACING.huge,
    alignItems: "center",
    ...SHADOWS.lg,
  },
  eventTitle: {
    fontSize: FONTS.lg,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  qrCodeWrapper: {
    padding: SPACING.md,
    backgroundColor: "#FFF",
    borderRadius: RADII.md,
    marginBottom: SPACING.lg,
  },
  ticketInfo: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  ticketLabel: {
    fontSize: FONTS.xs,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
  },
  ticketCode: {
    fontSize: FONTS.md,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: FONTS.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  statusContainer: {
    width: "100%",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.xl,
  },
  statusText: {
    color: "#FFF",
    fontSize: FONTS.sm,
    fontWeight: "600",
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  instructionText: {
    flex: 1,
    fontSize: FONTS.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  tipsTitle: {
    fontSize: FONTS.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tipText: {
    flex: 1,
    fontSize: FONTS.sm,
    color: COLORS.text,
    opacity: 0.7,
    lineHeight: 20,
  },
  // Check-in Modal Styles
  checkinModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  confetti: {
    position: "absolute",
    fontSize: 20,
    top: "45%",
    left: "50%",
  },
  checkinModalContent: {
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  successIconWrapper: {
    position: "relative",
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  checkinIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  successRing: {
    position: "absolute",
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#10b981",
  },
  successRing1: {
    width: 120,
    height: 120,
    opacity: 0.3,
  },
  successRing2: {
    width: 140,
    height: 140,
    opacity: 0.15,
  },
  checkinModalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  checkinModalSubtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 4,
  },
  checkinEventName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  checkinTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  timeIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
  },
  checkinTimeText: {
    fontSize: 14,
    color: "#065f46",
    fontWeight: "600",
  },
  modalDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  checkinInfoText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  checkinModalButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkinModalButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  checkinModalButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default TicketQRCodeScreen;
