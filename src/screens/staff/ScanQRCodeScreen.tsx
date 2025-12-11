import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Dimensions,
  Modal,
} from "react-native";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { staffService } from "../../services/staffService";
import { TicketStatus } from "../../types/staff";

type ScanQRCodeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<
    { params: { eventId: string; eventTitle?: string; eventBanner?: string } },
    "params"
  >;
};

const { width } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanQRCodeScreen({
  navigation,
  route,
}: ScanQRCodeScreenProps) {
  const { eventId, eventTitle, eventBanner } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [resultModal, setResultModal] = useState({
    visible: false,
    status: "" as TicketStatus,
    message: "",
    ticketInfo: null as any,
  });

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "VALID":
        return COLORS.success;
      case "USED":
        return COLORS.warning;
      case "FAKE":
      case "WRONG_EVENT":
        return COLORS.error;
      default:
        return COLORS.text;
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case "VALID":
        return "checkmark-circle";
      case "USED":
        return "time";
      case "FAKE":
        return "close-circle";
      case "WRONG_EVENT":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  const getStatusTitle = (status: TicketStatus) => {
    switch (status) {
      case "VALID":
        return "Vé hợp lệ";
      case "USED":
        return "Vé đã sử dụng";
      case "FAKE":
        return "Vé giả mạo";
      case "WRONG_EVENT":
        return "Sai sự kiện";
      default:
        return "Không xác định";
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    setScanning(false);
    Vibration.vibrate(100);

    try {
      const result = await staffService.checkIn(eventId, data);

      setResultModal({
        visible: true,
        status: result.status,
        message: result.message,
        ticketInfo: result.ticketInfo,
      });

      if (result.status === "VALID") {
        Vibration.vibrate([0, 200, 100, 200]);
      } else {
        Vibration.vibrate([0, 500]);
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể xác thực vé"
      );
      setScanned(false);
      setScanning(true);
    }
  };

  const handleCloseModal = () => {
    setResultModal({
      visible: false,
      status: "" as TicketStatus,
      message: "",
      ticketInfo: null,
    });
    setScanned(false);
    setScanning(true);
  };

  const handleManualCheckIn = () => {
    navigation.replace("ManualCheckIn", {
      eventId,
      eventTitle,
      eventBanner,
    });
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Đang yêu cầu quyền truy cập camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={COLORS.text} />
          <Text style={styles.permissionText}>
            Ứng dụng cần quyền truy cập camera để quét QR code
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Cấp quyền</Text>
          </TouchableOpacity>
        </View>
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
          <Text style={styles.headerTitle}>Quét QR Code</Text>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={handleManualCheckIn}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.scanAreaContainer}>
                <View style={styles.scanArea}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>
            </View>
          </CameraView>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Đặt mã QR vào trong khung để quét
            </Text>
          </View>
        </View>
      </LinearGradient>

      <Modal
        visible={resultModal.visible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View
              style={[
                styles.modalHeader,
                { backgroundColor: getStatusColor(resultModal.status) },
              ]}
            >
              <Ionicons
                name={getStatusIcon(resultModal.status)}
                size={64}
                color={COLORS.white}
              />
              <Text style={styles.modalTitle}>
                {getStatusTitle(resultModal.status)}
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>{resultModal.message}</Text>

              {resultModal.ticketInfo && (
                <View style={styles.ticketInfoContainer}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sinh viên:</Text>
                    <Text style={styles.infoValue}>
                      {resultModal.ticketInfo.studentName}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>MSSV:</Text>
                    <Text style={styles.infoValue}>
                      {resultModal.ticketInfo.studentId}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>
                      {resultModal.ticketInfo.email}
                    </Text>
                  </View>
                  {resultModal.ticketInfo.checkInTime && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Thời gian:</Text>
                      <Text style={styles.infoValue}>
                        {new Date(
                          resultModal.ticketInfo.checkInTime
                        ).toLocaleString("vi-VN")}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: getStatusColor(resultModal.status) },
              ]}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalButtonText}>Tiếp tục quét</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 1,
    paddingTop: SPACING.xl + 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
  manualButton: {
    padding: SPACING.md,
    position: "absolute",
    right: 0,
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: RADII.lg,
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: RADII.lg,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: RADII.lg,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: RADII.lg,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: RADII.lg,
  },
  instructionContainer: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  instructionText: {
    fontSize: FONTS.md,
    color: COLORS.text,
    textAlign: "center",
    fontWeight: "600",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  permissionText: {
    fontSize: FONTS.lg,
    color: COLORS.text,
    textAlign: "center",
    marginVertical: SPACING.xl,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
  },
  permissionButtonText: {
    fontSize: FONTS.md,
    fontWeight: "600",
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    width: "85%",
    maxWidth: 400,
    overflow: "hidden",
    ...SHADOWS.lg,
  },
  modalHeader: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: FONTS.xxl,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  modalBody: {
    padding: SPACING.xl,
  },
  modalMessage: {
    fontSize: FONTS.md,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  ticketInfoContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  infoLabel: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    flex: 1,
    textAlign: "right",
  },
  modalButton: {
    padding: SPACING.lg,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.white,
  },
});
