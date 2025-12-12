import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, RouteProp } from "@react-navigation/native";
import { ticketService } from "../../services/ticketService";
import { ScanTicketResponse } from "../../types/ticket";
import { COLORS, FONTS, RADII, SHADOWS, SPACING } from "../../utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../api/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCANNER_SIZE = SCREEN_WIDTH * 0.7;

type TicketScanScreenProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: RouteProp<
    { params?: { eventId?: string; eventTitle?: string } },
    "params"
  >;
};

const TicketScanScreen = ({ navigation, route }: TicketScanScreenProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualQr, setManualQr] = useState("");
  const [result, setResult] = useState<ScanTicketResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [realtimeCheckins, setRealtimeCheckins] = useState<CheckinPayload[]>(
    []
  );

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Realtime check-in hook - only active when eventId is provided
  const { isConnected, checkinCount, recentCheckins } = useRealtimeCheckin({
    eventId: eventId || "",
    onCheckin: (payload) => {
      // Update local state with realtime checkins from other staff
      setRealtimeCheckins((prev) => [payload, ...prev].slice(0, 10));
      console.log("[Realtime] New check-in from another staff:", payload);
    },
  });

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (raw) {
          const parsed = JSON.parse(raw) as { id?: number } | null;
          if (parsed?.id) {
            setStaffId(parsed.id);
          }
        }
      } catch {
        setStaffId(null);
      }
    };

    requestPermission();
    loadUser();
  }, []);

  // Scan line animation
  useEffect(() => {
    if (!scanned && hasPermission) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [scanned, hasPermission]);

  // Pulse animation for result icon
  useEffect(() => {
    if (showResultModal) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showResultModal]);

  const resetScan = () => {
    setScanned(false);
    setResult(null);
    setErrorMessage(null);
    setShowResultModal(false);
    setManualQr("");
  };

  const handleScan = async (qrCode: string) => {
    if (!staffId) {
      Alert.alert(
        "Thiếu thông tin",
        "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại."
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await ticketService.scanTicket({ qrCode, staffId });
      setResult(response);
      setShowResultModal(true);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Quét vé thất bại. Vui lòng thử lại.";
      setErrorMessage(message);
      setShowResultModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = (event: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    handleScan(event.data);
  };

  const handleManualSubmit = () => {
    if (!manualQr.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã QR code");
      return;
    }
    setScanned(true);
    setShowManualInput(false);
    handleScan(manualQr.trim());
  };

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCANNER_SIZE - 4],
  });

  // Loading state
  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#1a1a2e", "#16213e"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang khởi tạo camera...</Text>
        </View>
      </View>
    );
  }

  // No permission state
  if (hasPermission === false) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#1a1a2e", "#16213e"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.noPermissionContent}>
          <View style={styles.noPermissionIcon}>
            <Ionicons name="videocam-off-outline" size={64} color="#ff6b6b" />
          </View>
          <Text style={styles.noPermissionTitle}>Không có quyền camera</Text>
          <Text style={styles.noPermissionSubtitle}>
            Ứng dụng cần quyền truy cập camera để quét mã QR. Vui lòng cấp quyền
            trong cài đặt.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full screen camera */}
      <CameraView
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFill}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <SafeAreaView edges={["top"]} style={styles.header}>
          <Text style={styles.headerTitle}>Quét vé</Text>
          {eventTitle ? (
            <Text style={styles.headerEventName} numberOfLines={1}>
              {eventTitle}
            </Text>
          ) : (
            <Text style={styles.headerSubtitle}>
              Đưa mã QR vào khung để check-in
            </Text>
          )}

          {/* Realtime status indicator */}
          {eventId && (
            <View style={styles.realtimeStatus}>
              <View
                style={[
                  styles.connectionDot,
                  { backgroundColor: isConnected ? "#10b981" : "#ef4444" },
                ]}
              />
              <Text style={styles.realtimeText}>
                {isConnected ? "Realtime" : "Đang kết nối..."}
              </Text>
              {checkinCount > 0 && (
                <View style={styles.checkinCountBadge}>
                  <Text style={styles.checkinCountText}>+{checkinCount}</Text>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>

        {/* Scanner frame */}
        <View style={styles.scannerContainer}>
          <View style={styles.scannerFrame}>
            {/* Corner decorations */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scan line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineTranslate }] },
                ]}
              />
            )}

            {/* Loading indicator */}
            {loading && (
              <View style={styles.scanningOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.scanningText}>Đang xử lý...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom actions */}
        <SafeAreaView edges={["bottom"]} style={styles.bottomContainer}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowManualInput(true)}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="keypad" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Nhập mã</Text>
            </TouchableOpacity>

            {scanned && !loading && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryAction]}
                onPress={resetScan}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FF9A3C", "#FF6A00"]}
                  style={styles.actionIconContainer}
                >
                  <Ionicons name="refresh" size={24} color={COLORS.white} />
                </LinearGradient>
                <Text style={styles.actionText}>Quét lại</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.instructionCard}>
            <Ionicons name="information-circle" size={20} color="#64748b" />
            <Text style={styles.instructionText}>
              Giữ điện thoại cách mã QR khoảng 15-20cm để quét tốt nhất
            </Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Manual Input Modal */}
      <Modal
        visible={showManualInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualInput(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowManualInput(false)}
          />
          <View style={styles.manualInputContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nhập mã QR thủ công</Text>
            <Text style={styles.modalSubtitle}>
              Nhập mã code in trên vé nếu không thể quét được
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="qr-code"
                size={20}
                color="#94a3b8"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Nhập mã QR code..."
                placeholderTextColor="#94a3b8"
                style={styles.textInput}
                value={manualQr}
                onChangeText={setManualQr}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowManualInput(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleManualSubmit}
              >
                <LinearGradient
                  colors={["#FF9A3C", "#FF6A00"]}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>Check-in</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="fade"
        onRequestClose={resetScan}
      >
        <View style={styles.resultModalOverlay}>
          <Animated.View
            style={[
              styles.resultModalContent,
              result?.success ? styles.successModal : styles.errorModal,
            ]}
          >
            {/* Icon */}
            <Animated.View
              style={[
                styles.resultIconContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {result?.success ? (
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.resultIconGradient}
                >
                  <Ionicons name="checkmark" size={48} color={COLORS.white} />
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={["#ef4444", "#dc2626"]}
                  style={styles.resultIconGradient}
                >
                  <Ionicons name="close" size={48} color={COLORS.white} />
                </LinearGradient>
              )}
            </Animated.View>

            {/* Title */}
            <Text style={styles.resultTitle}>
              {result?.success ? "Check-in thành công!" : "Check-in thất bại"}
            </Text>

            {/* Message */}
            <Text style={styles.resultMessage}>
              {result?.message || errorMessage}
            </Text>

            {/* Ticket Details */}
            {result?.ticket && (
              <View style={styles.ticketDetails}>
                <View style={styles.ticketDetailRow}>
                  <Ionicons name="calendar" size={18} color="#64748b" />
                  <Text style={styles.ticketDetailLabel}>Sự kiện</Text>
                  <Text style={styles.ticketDetailValue} numberOfLines={1}>
                    {result.ticket.event.title}
                  </Text>
                </View>

                <View style={styles.ticketDetailRow}>
                  <Ionicons name="person" size={18} color="#64748b" />
                  <Text style={styles.ticketDetailLabel}>Người dùng</Text>
                  <Text style={styles.ticketDetailValue}>
                    {result.user?.firstName} {result.user?.lastName}
                  </Text>
                </View>

                <View style={styles.ticketDetailRow}>
                  <Ionicons name="ticket" size={18} color="#64748b" />
                  <Text style={styles.ticketDetailLabel}>Trạng thái</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      result.ticket.status === "USED"
                        ? styles.statusCheckedIn
                        : styles.statusPending,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {result.ticket.status === "USED"
                        ? "Đã check-in"
                        : result.ticket.status}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={styles.resultActionButton}
              onPress={resetScan}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF9A3C", "#FF6A00"]}
                style={styles.resultActionGradient}
              >
                <Ionicons name="scan" size={20} color={COLORS.white} />
                <Text style={styles.resultActionText}>Quét vé tiếp theo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: FONTS.bodyLarge,
    marginTop: SPACING.md,
  },
  noPermissionContent: {
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.lg,
  },
  noPermissionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  noPermissionTitle: {
    color: COLORS.white,
    fontSize: FONTS.header,
    fontWeight: "700",
    textAlign: "center",
  },
  noPermissionSubtitle: {
    color: "#94a3b8",
    fontSize: FONTS.bodyLarge,
    textAlign: "center",
    lineHeight: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    position: "absolute",
    left: SPACING.xl,
    top: 64,
    zIndex: 10,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONTS.display,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: FONTS.bodyLarge,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  headerEventName: {
    color: COLORS.primary,
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  realtimeStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
    gap: 6,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  realtimeText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: FONTS.caption,
  },
  checkinCountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  checkinCountText: {
    color: COLORS.white,
    fontSize: FONTS.caption,
    fontWeight: "700",
  },
  scannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  scanningText: {
    color: COLORS.white,
    fontSize: FONTS.bodyLarge,
    marginTop: SPACING.md,
  },
  bottomContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    alignItems: "center",
    gap: SPACING.sm,
  },
  primaryAction: {},
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: "500",
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: RADII.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  instructionText: {
    flex: 1,
    color: "#475569",
    fontSize: FONTS.body,
    lineHeight: 20,
  },
  // Manual Input Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  manualInputContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.xxl,
    borderTopRightRadius: RADII.xxl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: FONTS.body,
    color: "#64748b",
    textAlign: "center",
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    height: 52,
    fontSize: FONTS.bodyLarge,
    color: COLORS.text,
  },
  modalButtons: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: RADII.lg,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: "#64748b",
  },
  submitButton: {
    flex: 1,
    height: 52,
    borderRadius: RADII.lg,
    overflow: "hidden",
  },
  submitButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.white,
  },
  // Result Modal
  resultModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  resultModalContent: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: RADII.xxl,
    padding: SPACING.xl,
    alignItems: "center",
  },
  successModal: {
    borderTopWidth: 4,
    borderTopColor: "#10b981",
  },
  errorModal: {
    borderTopWidth: 4,
    borderTopColor: "#ef4444",
  },
  resultIconContainer: {
    marginBottom: SPACING.lg,
  },
  resultIconGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: FONTS.header,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: FONTS.bodyLarge,
    color: "#64748b",
    textAlign: "center",
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  ticketDetails: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  ticketDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  ticketDetailLabel: {
    fontSize: FONTS.body,
    color: "#64748b",
    width: 80,
  },
  ticketDetailValue: {
    flex: 1,
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.pill,
  },
  statusCheckedIn: {
    backgroundColor: "#dcfce7",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: "#15803d",
  },
  resultActionButton: {
    width: "100%",
    height: 52,
    borderRadius: RADII.lg,
    overflow: "hidden",
    marginTop: SPACING.xl,
  },
  resultActionGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
  },
  resultActionText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default TicketScanScreen;
