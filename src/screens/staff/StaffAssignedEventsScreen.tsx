import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { staffService } from "../../services/staffService";
import { StaffAssignedEvent } from "../../types/staff";

type StaffAssignedEventsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function StaffAssignedEventsScreen({
  navigation,
}: StaffAssignedEventsScreenProps) {
  const [events, setEvents] = useState<StaffAssignedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAssignedEvents = async () => {
    try {
      const assignedEvents = await staffService.getAssignedEvents();
      console.log("Assigned events response:", assignedEvents);

      // Handle different response structures
      if (Array.isArray(assignedEvents)) {
        setEvents(assignedEvents);
      } else if (
        assignedEvents &&
        typeof assignedEvents === "object" &&
        "data" in assignedEvents
      ) {
        const data = (assignedEvents as any).data;
        setEvents(Array.isArray(data) ? data : []);
      } else {
        console.warn("Unexpected response format:", assignedEvents);
        setEvents([]);
      }
    } catch (error: any) {
      console.error("Error loading assigned events:", error);
      console.error("Error details:", error.response?.data);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message ||
          "Không thể tải danh sách sự kiện được phân công"
      );
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAssignedEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignedEvents();
  };

  const handleEventPress = (event: StaffAssignedEvent) => {
    navigation.navigate("StaffEventDetail", { eventId: event.id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return COLORS.success;
      case "DRAFT":
        return COLORS.warning;
      case "CANCELLED":
        return COLORS.error;
      default:
        return COLORS.text;
    }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách sự kiện...</Text>
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
          <Text style={styles.headerTitle}>Sự kiện được phân công</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.emptyText}>
                Bạn chưa được phân công vào sự kiện nào
              </Text>
            </View>
          ) : (
            <View style={styles.eventsContainer}>
              {Array.isArray(events) &&
                events.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventCard}
                    onPress={() => handleEventPress(event)}
                  >
                    <View style={styles.eventHeader}>
                      <View style={styles.eventTitleContainer}>
                        <Text style={styles.eventTitle} numberOfLines={2}>
                          {event.title}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(event.status) },
                          ]}
                        >
                          <Text style={styles.statusText}>{event.status}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.eventInfo}>
                      <View style={styles.infoRow}>
                        <Ionicons
                          name="location-sharp"
                          size={16}
                          color={COLORS.text}
                        />
                        <Text style={styles.infoText} numberOfLines={1}>
                          {event.venue.name}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons
                          name="calendar"
                          size={16}
                          color={COLORS.text}
                        />
                        <Text style={styles.infoText}>
                          {formatDate(event.startTime)} -{" "}
                          {formatTime(event.startTime)}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="people" size={16} color={COLORS.text} />
                        <Text style={styles.infoText}>
                          {event.registeredCount}/{event.maxCapacity} người tham
                          gia
                        </Text>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.assignmentInfo}>
                        <View style={styles.roleBadge}>
                          <Ionicons
                            name="shield-checkmark"
                            size={14}
                            color={COLORS.primary}
                          />
                          <Text style={styles.roleText}>Check-in Staff</Text>
                        </View>
                        <Text style={styles.assignedDate}>
                          Phân công: {formatDate(event.assignedAt)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          navigation.navigate("ManualCheckIn", {
                            eventId: event.id,
                            eventTitle: event.title,
                            eventBanner: event.bannerUrl,
                          })
                        }
                      >
                        <Ionicons
                          name="create"
                          size={20}
                          color={COLORS.primary}
                        />
                        <Text style={styles.actionButtonText}>Check-in</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          navigation.navigate("IncidentReport", {
                            eventId: event.id,
                            eventTitle: event.title,
                          })
                        }
                      >
                        <Ionicons
                          name="warning"
                          size={20}
                          color={COLORS.warning}
                        />
                        <Text
                          style={[
                            styles.actionButtonText,
                            { color: COLORS.warning },
                          ]}
                        >
                          Báo cáo
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
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
    color: COLORS.text,
    textAlign: "center",
  },
  eventsContainer: {
    padding: SPACING.lg,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  eventHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  eventTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventTitle: {
    flex: 1,
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.text,
    marginRight: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
  },
  statusText: {
    fontSize: FONTS.xs,
    fontWeight: "600",
    color: COLORS.white,
  },
  eventInfo: {
    padding: SPACING.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  infoText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sm,
    color: COLORS.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginVertical: SPACING.md,
  },
  assignmentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
  },
  roleText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.xs,
    fontWeight: "600",
    color: COLORS.primary,
  },
  assignedDate: {
    fontSize: FONTS.xs,
    color: COLORS.text,
  },
  cardFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    padding: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
  },
  actionButtonText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
