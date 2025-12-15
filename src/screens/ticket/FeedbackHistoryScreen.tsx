import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { feedbackService } from "../../services/feedbackService";
import { myFeedback } from "../../types/feedback";
import CustomAlertModal from "../../components/CustomAlertModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type FeedbackHistoryScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<
    {
      params: {
        eventId: string;
        eventTitle?: string;
        eventBannerUrl?: string;
        eventStartTime?: string;
        eventVenueName?: string;
      };
    },
    "params"
  >;
};

const RATING_LABELS = ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];
const RATING_EMOJIS = ["😞", "😕", "😐", "😊", "🤩"];
const RATING_COLORS = ["#F44336", "#FF9800", "#FFC107", "#8BC34A", "#4CAF50"];

export default function FeedbackHistoryScreen({
  navigation,
  route,
}: FeedbackHistoryScreenProps) {
  const {
    eventId,
    eventTitle,
    eventBannerUrl,
    eventStartTime,
    eventVenueName,
  } = route.params;

  const [feedback, setFeedback] = useState<myFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({ visible: false, type: "info", title: "", message: "" });

  const loadFeedback = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const feedbacks = await feedbackService.getMyFeedbacks();

      // Tìm feedback của event cụ thể
      const eventFeedback = feedbacks.find((f) => f.eventId === eventId);
      setFeedback(eventFeedback || null);
    } catch (error: any) {
      console.error("Error loading feedback:", error);
      setAlertConfig({
        visible: true,
        type: "error",
        title: "Lỗi",
        message: error.response?.data?.message || "Không thể tải đánh giá",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      loadFeedback(true);
    }, [eventId])
  );

  const onRefresh = () => {
    loadFeedback(true);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const renderStars = (rating: number, size: number = 32) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? "#FFD700" : COLORS.text}
            style={{ opacity: star <= rating ? 1 : 0.3 }}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient_1}
        style={styles.gradientBackground}
        start={{ x: 1, y: 0.2 }}
        end={{ x: 0.2, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đánh giá</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
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
          {/* Event Banner */}
          <View style={styles.bannerContainer}>
            {eventBannerUrl || feedback?.event?.bannerUrl ? (
              <Image
                source={{
                  uri:
                    eventBannerUrl || feedback?.event?.bannerUrl || undefined,
                }}
                style={styles.eventBanner}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderBanner}>
                <Ionicons
                  name="image-outline"
                  size={60}
                  color={COLORS.text}
                  style={{ opacity: 0.3 }}
                />
              </View>
            )}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.bannerGradient}
            />
            <View style={styles.bannerContent}>
              <View style={styles.completedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.white}
                />
                <Text style={styles.completedBadgeText}>Đã đánh giá</Text>
              </View>
            </View>
          </View>

          {/* Event Info Card */}
          <View style={styles.eventInfoCard}>
            <Text style={styles.eventTitle}>
              {eventTitle || feedback?.event?.title || "Sự kiện"}
            </Text>

            <View style={styles.eventDetails}>
              {(eventVenueName || feedback?.event?.venue?.name) && (
                <View style={styles.eventDetailRow}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="location"
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.eventDetailContent}>
                    <Text style={styles.eventDetailLabel}>Địa điểm</Text>
                    <Text style={styles.eventDetailValue}>
                      {eventVenueName || feedback?.event?.venue?.name}
                    </Text>
                  </View>
                </View>
              )}

              {(eventStartTime || feedback?.event?.startTime) && (
                <View style={styles.eventDetailRow}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="calendar"
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.eventDetailContent}>
                    <Text style={styles.eventDetailLabel}>Thời gian</Text>
                    <Text style={styles.eventDetailValue}>
                      {formatDate(eventStartTime || feedback?.event?.startTime)}
                    </Text>
                    <Text style={styles.eventDetailSubvalue}>
                      {formatTime(eventStartTime || feedback?.event?.startTime)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Feedback Card */}
          {feedback ? (
            <View style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackTitle}>Đánh giá của bạn</Text>
                <View style={styles.feedbackDateContainer}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={COLORS.text}
                    style={{ opacity: 0.6 }}
                  />
                  <Text style={styles.feedbackDate}>
                    {formatDate(feedback?.createdAt)} -{" "}
                    {formatTime(feedback?.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Rating Display */}
              <View style={styles.ratingDisplay}>
                <Text style={styles.ratingEmoji}>
                  {RATING_EMOJIS[feedback.rating - 1]}
                </Text>
                {renderStars(feedback.rating)}
                <Text
                  style={[
                    styles.ratingLabel,
                    { color: RATING_COLORS[feedback.rating - 1] },
                  ]}
                >
                  {RATING_LABELS[feedback.rating - 1]}
                </Text>
                <Text style={styles.ratingScore}>{feedback.rating}/5 sao</Text>
              </View>

              {/* Comment */}
              {feedback.comment ? (
                <View style={styles.commentSection}>
                  <View style={styles.commentHeader}>
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={18}
                      color={COLORS.primary}
                    />
                    <Text style={styles.commentTitle}>Nhận xét</Text>
                  </View>
                  <View style={styles.commentBox}>
                    <Text style={styles.commentQuote}>"</Text>
                    <Text style={styles.commentText}>{feedback.comment}</Text>
                    <Text style={styles.commentQuoteEnd}>"</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noCommentSection}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={24}
                    color={COLORS.text}
                    style={{ opacity: 0.4 }}
                  />
                  <Text style={styles.noCommentText}>Không có nhận xét</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noFeedbackContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={60}
                color={COLORS.text}
                style={{ opacity: 0.3 }}
              />
              <Text style={styles.noFeedbackText}>
                Không tìm thấy đánh giá cho sự kiện này
              </Text>
            </View>
          )}

          {/* Thank You Message */}
          {feedback && (
            <View style={styles.thankYouCard}>
              <Ionicons name="heart" size={32} color={COLORS.error} />
              <Text style={styles.thankYouTitle}>Cảm ơn bạn!</Text>
              <Text style={styles.thankYouText}>
                Đánh giá của bạn giúp chúng tôi cải thiện chất lượng sự kiện
                trong tương lai.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Alert Modal */}
        <CustomAlertModal
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
        />
      </LinearGradient>
    </View>
  );
}

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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxxl,
  },
  bannerContainer: {
    position: "relative",
    height: 200,
    marginBottom: -SPACING.xl,
  },
  eventBanner: {
    width: "100%",
    height: "100%",
  },
  placeholderBanner: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  bannerContent: {
    position: "absolute",
    bottom: SPACING.lg,
    left: SPACING.screenPadding,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.pill,
    gap: SPACING.xs,
  },
  completedBadgeText: {
    fontSize: FONTS.caption,
    fontWeight: "600",
    color: COLORS.white,
  },
  eventInfoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screenPadding,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  eventTitle: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  eventDetails: {
    gap: SPACING.md,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  eventDetailContent: {
    flex: 1,
  },
  eventDetailLabel: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
  },
  eventDetailValue: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 2,
  },
  eventDetailSubvalue: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: 2,
  },
  feedbackCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.lg,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  feedbackTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
  },
  feedbackDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  feedbackDate: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
  },
  ratingDisplay: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: RADII.lg,
    marginBottom: SPACING.lg,
  },
  ratingEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  starsContainer: {
    flexDirection: "row",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  ratingLabel: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    marginBottom: SPACING.xs,
  },
  ratingScore: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.6,
  },
  commentSection: {
    marginTop: SPACING.sm,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  commentTitle: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  commentBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    position: "relative",
  },
  commentQuote: {
    fontSize: 40,
    color: COLORS.primary,
    opacity: 0.3,
    position: "absolute",
    top: 0,
    left: SPACING.sm,
    lineHeight: 50,
  },
  commentText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  commentQuoteEnd: {
    fontSize: 40,
    color: COLORS.primary,
    opacity: 0.3,
    position: "absolute",
    bottom: -10,
    right: SPACING.sm,
    lineHeight: 50,
  },
  noCommentSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  noCommentText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.5,
  },
  noFeedbackContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  noFeedbackText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.6,
    textAlign: "center",
  },
  thankYouCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.lg,
    borderRadius: RADII.card,
    padding: SPACING.xl,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  thankYouTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  thankYouText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: "center",
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
});
