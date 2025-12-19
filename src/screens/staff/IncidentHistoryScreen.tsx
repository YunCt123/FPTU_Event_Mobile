import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { incidentService } from "../../services/incidentService";
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "../../types/incident";
import { ActionResultModal, ActionResultType } from "../../components";

type IncidentHistoryScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function IncidentHistoryScreen({
  navigation,
}: IncidentHistoryScreenProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ActionResultType>("error");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const loadIncidents = async () => {
    try {
      const data = await incidentService.getMyIncidents();
      setIncidents(data);
    } catch (error: any) {
      console.log("Error loading incidents:", error);
      setModalType("error");
      setModalTitle("Lỗi");
      setModalMessage(
        error.response?.data?.message || "Không thể tải lịch sử báo cáo sự cố"
      );
      setModalVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadIncidents();
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case "HIGH":
        return COLORS.error;
      case "MEDIUM":
        return COLORS.warning;
      case "LOW":
        return COLORS.success;
      default:
        return COLORS.text;
    }
  };

  const getSeverityLabel = (severity: IncidentSeverity) => {
    switch (severity) {
      case "HIGH":
        return "Cao";
      case "MEDIUM":
        return "Trung bình";
      case "LOW":
        return "Thấp";
      default:
        return severity;
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case "RESOLVED":
        return COLORS.success;
      case "IN_PROGRESS":
        return COLORS.warning;
      case "OPEN":
        return COLORS.warning;
      default:
        return COLORS.text;
    }
  };

  const getStatusLabel = (status: IncidentStatus) => {
    switch (status) {
      case "RESOLVED":
        return "Đã giải quyết";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "OPEN":
        return "Mới báo cáo";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case "RESOLVED":
        return "checkmark-circle";
      case "IN_PROGRESS":
        return "time";
      case "OPEN":
        return "alert-circle";
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
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải lịch sử báo cáo...</Text>
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
          <Text style={styles.headerTitle}>Lịch sử báo cáo sự cố</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {incidents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={80}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>
                Bạn chưa có báo cáo sự cố nào
              </Text>
            </View>
          ) : (
            <View style={styles.incidentsContainer}>
              {incidents.map((incident) => (
                <View key={incident.id} style={styles.incidentCard}>
                  <View style={styles.incidentHeader}>
                    <View style={styles.titleContainer}>
                      <Text style={styles.incidentTitle} numberOfLines={2}>
                        {incident.title || "Sự cố"}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(incident.status) },
                        ]}
                      >
                        <Ionicons
                          name={getStatusIcon(incident.status)}
                          size={12}
                          color={COLORS.white}
                        />
                        <Text style={styles.statusText}>
                          {getStatusLabel(incident.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.incidentBody}>
                    <Text style={styles.description} numberOfLines={3}>
                      {incident.description || "Không có mô tả"}
                    </Text>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.infoText}>
                        {formatDate(incident.createdAt)}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="warning-outline"
                        size={16}
                        color={getSeverityColor(incident.severity)}
                      />
                      <Text
                        style={[
                          styles.infoText,
                          { color: getSeverityColor(incident.severity) },
                        ]}
                      >
                        Mức độ: {getSeverityLabel(incident.severity)}
                      </Text>
                    </View>
                  </View>
                </View>
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
  incidentsContainer: {
    padding: SPACING.lg,
  },
  incidentCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  incidentHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  incidentTitle: {
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
  incidentBody: {
    padding: SPACING.lg,
  },
  description: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
});
