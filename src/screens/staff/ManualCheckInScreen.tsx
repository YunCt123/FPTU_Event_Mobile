import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { staffService } from "../../services/staffService";
import { CheckInResponse } from "../../types/staff";

type ManualCheckInScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { eventId: string; eventTitle?: string; eventBanner?: string } }, "params">;
};

export default function ManualCheckInScreen({
  navigation,
  route,
}: ManualCheckInScreenProps) {
  const { eventId, eventTitle, eventBanner } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResponse | null>(null);
  const [searchType, setSearchType] = useState<"studentId" | "email">(
    "studentId"
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập MSSV hoặc Email");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await staffService.manualCheckIn(
        eventId,
        searchQuery.trim()
      );
      setResult(response);

      if (response.success && response.status === "VALID") {
        Alert.alert("Thành công", response.message);
      } else {
        Alert.alert("Thông báo", response.message);
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể thực hiện check-in"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setResult(null);
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const formatCheckInTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          <Text style={styles.headerTitle}>Check-in thủ công</Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.replace("ScanQRCode", { eventId })}
          >
            <Ionicons name="qr-code-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Event Banner */}
          <View style={styles.eventBannerContainer}>
            {eventBanner ? (
              <Image
                source={{ uri: eventBanner }}
                style={styles.eventBanner}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.eventBannerPlaceholder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="calendar" size={48} color={COLORS.white} />
              </LinearGradient>
            )}
            {eventTitle && (
              <View style={styles.eventTitleOverlay}>
                <Text style={styles.eventTitleText} numberOfLines={2}>
                  {eventTitle}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.sectionTitle}>Tìm kiếm sinh viên</Text>

            <View style={styles.searchTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.searchTypeButton,
                  searchType === "studentId" && styles.searchTypeButtonActive,
                ]}
                onPress={() => {
                  setSearchType("studentId");
                  setSearchQuery("");
                  setResult(null);
                }}
              >
                <Ionicons
                  name="person"
                  size={20}
                  color={
                    searchType === "studentId" ? COLORS.white : COLORS.primary
                  }
                />
                <Text
                  style={[
                    styles.searchTypeText,
                    searchType === "studentId" && styles.searchTypeTextActive,
                  ]}
                >
                  MSSV
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.searchTypeButton,
                  searchType === "email" && styles.searchTypeButtonActive,
                ]}
                onPress={() => {
                  setSearchType("email");
                  setSearchQuery("");
                  setResult(null);
                }}
              >
                <Ionicons
                  name="mail"
                  size={20}
                  color={searchType === "email" ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.searchTypeText,
                    searchType === "email" && styles.searchTypeTextActive,
                  ]}
                >
                  Email
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name={
                  searchType === "studentId" ? "person-outline" : "mail-outline"
                }
                size={20}
                color={COLORS.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={
                  searchType === "studentId"
                    ? "Nhập mã số sinh viên"
                    : "Nhập email sinh viên"
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                keyboardType={
                  searchType === "email" ? "email-address" : "default"
                }
                editable={!loading}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleReset}>
                  <Ionicons name="close-circle" size={20} color={COLORS.text} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.searchButton,
                loading && styles.searchButtonDisabled,
              ]}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="search" size={20} color={COLORS.white} />
                  <Text style={styles.searchButtonText}>
                    Tìm kiếm và Check-in
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {result && (
            <View style={styles.resultContainer}>
              <View
                style={[
                  styles.resultHeader,
                  { backgroundColor: getStatusColor(result.status) },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(result.status)}
                  size={48}
                  color={COLORS.white}
                />
                <Text style={styles.resultTitle}>{result.message}</Text>
              </View>

              {result.ticketInfo && (
                <View style={styles.ticketInfoCard}>
                  <Text style={styles.ticketInfoTitle}>
                    Thông tin sinh viên
                  </Text>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Ionicons name="person" size={16} color={COLORS.text} />
                      <Text style={styles.infoLabel}>Họ tên:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {result.ticketInfo.studentName}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Ionicons name="card" size={16} color={COLORS.text} />
                      <Text style={styles.infoLabel}>MSSV:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {result.ticketInfo.studentId}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Ionicons name="mail" size={16} color={COLORS.text} />
                      <Text style={styles.infoLabel}>Email:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {result.ticketInfo.email}
                    </Text>
                  </View>

                  {result.ticketInfo.checkInTime && (
                    <View style={styles.infoRow}>
                      <View style={styles.infoLabelContainer}>
                        <Ionicons name="time" size={16} color={COLORS.text} />
                        <Text style={styles.infoLabel}>Check-in lúc:</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {formatCheckInTime(result.ticketInfo.checkInTime)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.divider} />

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleReset}
                    >
                      <Ionicons
                        name="refresh"
                        size={20}
                        color={COLORS.primary}
                      />
                      <Text style={styles.actionButtonText}>Tiếp tục</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>Hướng dẫn</Text>
            <View style={styles.instructionItem}>
              <Ionicons
                name="information-circle"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.instructionText}>
                Nhập MSSV hoặc Email của sinh viên để tìm kiếm
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons
                name="information-circle"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.instructionText}>
                Hệ thống sẽ tự động check-in nếu tìm thấy vé hợp lệ
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons
                name="information-circle"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.instructionText}>
                Sử dụng tính năng quét QR nếu sinh viên có mã QR
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    marginBottom: SPACING.lg,
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
    color: COLORS.text,
    flex: 1,
    textAlign: "center",
  },
  scanButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  eventBannerContainer: {
    position: "relative",
    height: 200,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    paddingHorizontal: SPACING.lg,
  },
  eventBanner: {
    width: "100%",
    height: "100%",
    borderRadius: RADII.lg,
  },
  eventBannerPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADII.lg,
  },
  eventTitleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    marginLeft: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  eventTitleText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "bold",
    color: COLORS.white,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  searchTypeContainer: {
    flexDirection: "row",
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  searchTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  searchTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  searchTypeText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.md,
    fontWeight: "600",
    color: COLORS.primary,
  },
  searchTypeTextActive: {
    color: COLORS.white,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.background,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.text,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    gap: SPACING.sm,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.white,
  },
  resultContainer: {
    margin: SPACING.lg,
    marginTop: 0,
  },
  resultHeader: {
    padding: SPACING.xl,
    borderRadius: RADII.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  resultTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  ticketInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  ticketInfoTitle: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginVertical: SPACING.md,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButtonText: {
    fontSize: FONTS.md,
    fontWeight: "600",
    color: COLORS.primary,
  },
  instructionContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    ...SHADOWS.sm,
  },
  instructionTitle: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  instructionText: {
    flex: 1,
    fontSize: FONTS.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
});
