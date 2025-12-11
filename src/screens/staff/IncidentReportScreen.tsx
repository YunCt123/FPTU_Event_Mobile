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
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { staffService } from "../../services/staffService";
import { IncidentType } from "../../types/staff";

type IncidentReportScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { eventId: string; eventTitle?: string } }, "params">;
};

const INCIDENT_TYPES: {
  type: IncidentType;
  label: string;
  icon: string;
  color: string;
}[] = [
  {
    type: "FACILITY_DAMAGE",
    label: "Hư hại cơ sở vật chất",
    icon: "home",
    color: COLORS.error,
  },
  {
    type: "AUDIO_FAILURE",
    label: "Sự cố âm thanh",
    icon: "volume-mute",
    color: COLORS.warning,
  },
  {
    type: "TECHNICAL_ISSUE",
    label: "Vấn đề kỹ thuật",
    icon: "construct",
    color: "#FF9800",
  },
  {
    type: "SAFETY_CONCERN",
    label: "Vấn đề an toàn",
    icon: "shield-checkmark",
    color: "#F44336",
  },
  {
    type: "CROWD_CONTROL",
    label: "Kiểm soát đám đông",
    icon: "people",
    color: "#9C27B0",
  },
  {
    type: "OTHER",
    label: "Khác",
    icon: "help-circle",
    color: COLORS.text,
  },
];

const SEVERITY_LEVELS: {
  value: "LOW" | "MEDIUM" | "HIGH";
  label: string;
  color: string;
}[] = [
  { value: "LOW", label: "Thấp", color: COLORS.success },
  { value: "MEDIUM", label: "Trung bình", color: COLORS.warning },
  { value: "HIGH", label: "Cao", color: COLORS.error },
];

export default function IncidentReportScreen({
  navigation,
  route,
}: IncidentReportScreenProps) {
  const { eventId, eventTitle } = route.params;
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!incidentType) {
      Alert.alert("Thông báo", "Vui lòng chọn loại sự cố");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Thông báo", "Vui lòng mô tả chi tiết sự cố");
      return;
    }

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn gửi báo cáo sự cố này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Gửi",
          onPress: async () => {
            setLoading(true);
            try {
              await staffService.submitIncidentReport(eventId, {
                incidentType,
                description: description.trim(),
                severity,
              });

              Alert.alert(
                "Thành công",
                "Báo cáo sự cố đã được gửi đến Ban tổ chức",
                [
                  {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể gửi báo cáo sự cố"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReset = () => {
    setIncidentType(null);
    setSeverity("MEDIUM");
    setDescription("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={COLORS.gradient_1}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo sự cố</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Loại sự cố <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.incidentTypeGrid}>
            {INCIDENT_TYPES.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.incidentTypeCard,
                  incidentType === item.type && styles.incidentTypeCardActive,
                  incidentType === item.type && {
                    borderColor: item.color,
                  },
                ]}
                onPress={() => setIncidentType(item.type)}
              >
                <View
                  style={[
                    styles.incidentTypeIconContainer,
                    incidentType === item.type && {
                      backgroundColor: item.color,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={incidentType === item.type ? COLORS.white : item.color}
                  />
                </View>
                <Text
                  style={[
                    styles.incidentTypeLabel,
                    incidentType === item.type && styles.incidentTypeLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Mức độ nghiêm trọng <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.severityContainer}>
            {SEVERITY_LEVELS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.severityButton,
                  severity === item.value && [
                    styles.severityButtonActive,
                    { backgroundColor: item.color },
                  ],
                ]}
                onPress={() => setSeverity(item.value)}
              >
                <Text
                  style={[
                    styles.severityText,
                    severity === item.value && styles.severityTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Mô tả chi tiết <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.descriptionContainer}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Mô tả chi tiết sự cố đã xảy ra, bao gồm vị trí, thời gian và mức độ nghiêm trọng..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!loading}
            />
            <View style={styles.characterCount}>
              <Text style={styles.characterCountText}>
                {description.length} / 500 ký tự
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.warningContainer}>
          <Ionicons name="information-circle" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Báo cáo sẽ được gửi trực tiếp đến Ban tổ chức sự kiện để xử lý kịp
            thời
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={loading}
          >
            <Ionicons name="refresh" size={20} color={COLORS.text} />
            <Text style={styles.resetButtonText}>Đặt lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={COLORS.white} />
                <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.white,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  required: {
    color: COLORS.error,
  },
  incidentTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  incidentTypeCard: {
    width: "48%",
    aspectRatio: 1.5,
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.background,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  incidentTypeCardActive: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    ...SHADOWS.sm,
  },
  incidentTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  incidentTypeLabel: {
    fontSize: FONTS.xs,
    color: COLORS.text,
    textAlign: "center",
    fontWeight: "500",
  },
  incidentTypeLabelActive: {
    color: COLORS.text,
    fontWeight: "600",
  },
  severityContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  severityButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.background,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  severityButtonActive: {
    borderColor: "transparent",
  },
  severityText: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  severityTextActive: {
    color: COLORS.white,
  },
  descriptionContainer: {
    borderWidth: 1,
    borderColor: COLORS.background,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
  },
  descriptionInput: {
    padding: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.text,
    minHeight: 120,
  },
  characterCount: {
    padding: SPACING.sm,
    paddingTop: 0,
    alignItems: "flex-end",
  },
  characterCountText: {
    fontSize: FONTS.xs,
    color: COLORS.text,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.md,
    borderRadius: RADII.md,
    gap: SPACING.sm,
  },
  warningText: {
    flex: 1,
    fontSize: FONTS.sm,
    color: "#E65100",
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: "row",
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  resetButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.background,
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
  },
  resetButtonText: {
    fontSize: FONTS.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primary,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.white,
  },
});
