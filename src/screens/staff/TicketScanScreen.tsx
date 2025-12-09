import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "../../components/GradientButton";
import { ticketService } from "../../services/ticketService";
import { ScanTicketResponse } from "../../types/ticket";
import { COLORS, FONTS, RADII, SHADOWS, SPACING } from "../../utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../api/api";

const TicketScanScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualQr, setManualQr] = useState("");
  const [result, setResult] = useState<ScanTicketResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<number | null>(null);

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

  const resetScan = () => {
    setScanned(false);
    setResult(null);
    setErrorMessage(null);
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
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Quét vé thất bại. Vui lòng thử lại.";
      setErrorMessage(message);
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
      setErrorMessage("Vui lòng nhập QR code.");
      return;
    }
    setScanned(true);
    handleScan(manualQr.trim());
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.subtleText}>Đang xin quyền camera...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="camera-off-outline" size={48} color={COLORS.error} />
        <Text style={styles.title}>Không có quyền camera</Text>
        <Text style={styles.subtitle}>
          Vui lòng cấp quyền camera để quét QR code.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quét vé tham dự</Text>
        <Text style={styles.headerSubtitle}>
          Đưa mã QR vào khung để check-in nhanh cho người tham dự.
        </Text>
      </View>

      <View style={styles.scannerCard}>
        <View style={styles.scannerFrame}>
          <CameraView
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.focusCorner} />
        </View>
        <Text style={styles.helperText}>
          Máy sẽ tự động quét khi phát hiện mã QR hợp lệ.
        </Text>
      </View>

      <View style={styles.manualCard}>
        <Text style={styles.sectionTitle}>Nhập mã QR thủ công</Text>
        <TextInput
          placeholder="Dán/nhập QR code"
          style={styles.input}
          value={manualQr}
          onChangeText={setManualQr}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <GradientButton
          title="Check-in bằng mã"
          icon="qr-code-outline"
          onPress={handleManualSubmit}
          loading={loading}
        />
      </View>

      {(result || errorMessage) && (
        <View
          style={[
            styles.resultCard,
            result?.success ? styles.success : styles.error,
          ]}
        >
          <View style={styles.resultHeader}>
            <Ionicons
              name={result?.success ? "checkmark-circle" : "alert-circle"}
              size={28}
              color={result?.success ? COLORS.white : COLORS.white}
            />
            <Text style={styles.resultTitle}>
              {result?.success ? "Check-in thành công" : "Check-in thất bại"}
            </Text>
          </View>

          <Text style={styles.resultMessage}>
            {result?.message || errorMessage}
          </Text>

          {result?.ticket && (
            <View style={styles.resultDetail}>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sự kiện: </Text>
                {result.ticket.event.name}
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Trạng thái: </Text>
                {result.ticket.status}
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Người dùng: </Text>
                {result.user?.firstName} {result.user?.lastName}
              </Text>
            </View>
          )}

          <GradientButton
            title="Quét tiếp"
            icon="scan-outline"
            onPress={resetScan}
            style={styles.retryButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.screenPadding,
    gap: SPACING.lg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    gap: SPACING.sm,
  },
  subtleText: {
    color: COLORS.text,
    fontSize: FONTS.body,
  },
  header: {
    gap: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.header,
    fontWeight: "700",
    color: COLORS.blue,
  },
  headerSubtitle: {
    fontSize: FONTS.bodyLarge,
    color: "#4A4A4A",
  },
  scannerCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    ...SHADOWS.md,
    gap: SPACING.sm,
  },
  scannerFrame: {
    height: 280,
    borderRadius: RADII.card,
    overflow: "hidden",
    backgroundColor: COLORS.black,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  focusCorner: {
    position: "absolute",
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: RADII.lg,
  },
  helperText: {
    color: "#6B7280",
    fontSize: FONTS.body,
  },
  manualCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: RADII.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.bodyLarge,
    color: COLORS.text,
    backgroundColor: "#F9FAFB",
  },
  resultCard: {
    borderRadius: RADII.card,
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  success: {
    backgroundColor: "#13C89B",
  },
  error: {
    backgroundColor: "#F65F53",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  resultTitle: {
    color: COLORS.white,
    fontSize: FONTS.title,
    fontWeight: "700",
  },
  resultMessage: {
    color: COLORS.white,
    fontSize: FONTS.bodyLarge,
  },
  resultDetail: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: RADII.md,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  detailRow: {
    color: COLORS.white,
    fontSize: FONTS.body,
  },
  detailLabel: {
    fontWeight: "700",
  },
  retryButton: {
    backgroundColor: "transparent",
  },
  subtitle: {
    fontSize: FONTS.bodyLarge,
    color: "#4A4A4A",
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
  },
});

export default TicketScanScreen;

