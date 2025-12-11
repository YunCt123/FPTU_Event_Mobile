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
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { ticketService } from "../../services/ticketService";
import { Ticket } from "../../types/ticket";
import { RootStackParamList } from "../../types/navigation";
import QRCode from "react-native-qrcode-svg";

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

  useEffect(() => {
    fetchTicketDetail();
    // Tăng độ sáng màn hình khi vào screen này
    increaseBrightness();

    return () => {
      // Khôi phục độ sáng khi rời screen
      restoreBrightness();
    };
  }, [ticketId]);

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
        Alert.alert(
          "Thông báo",
          "Vé này không còn hiệu lực",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return;
      }

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
            onPress={() => navigation.navigate("TicketDetails", { ticketId: ticket.id })}
          >
            <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
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
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.instructionText}>
              Vui lòng đưa mã QR này cho nhân viên để check-in tại sự kiện
            </Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Lưu ý:</Text>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.text} />
              <Text style={styles.tipText}>Mỗi mã QR chỉ được sử dụng một lần</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.text} />
              <Text style={styles.tipText}>Không chia sẻ mã QR cho người khác</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.text} />
              <Text style={styles.tipText}>Đến sớm để tránh xếp hàng</Text>
            </View>
          </View>
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
});

export default TicketQRCodeScreen;
