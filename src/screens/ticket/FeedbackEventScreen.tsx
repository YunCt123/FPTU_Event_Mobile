import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { feedbackService } from "../../services/feedbackService";
import ActionResultModal from "../../components/ActionResultModal";

type FeedbackEventScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<
    {
      params: {
        eventId: string;
        eventTitle?: string;
        ticketId: string;
        skipTimeValidation?: boolean;
      };
    },
    "params"
  >;
};

const RATING_LABELS = ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];

const FeedbackEventScreen: React.FC<FeedbackEventScreenProps> = ({
  navigation,
  route,
}) => {
  const { eventId, eventTitle, ticketId } = route.params;
  const skipTimeValidation = route.params.skipTimeValidation ?? true;
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({ visible: false, type: "info", title: "", message: "" });

  const handleSubmit = async () => {
    if (rating === 0) {
      setAlertConfig({
        visible: true,
        type: "warning",
        title: "Thông báo",
        message: "Vui lòng chọn đánh giá sao",
      });
      return;
    }

    try {
      setLoading(true);
      await feedbackService.sendFeedback({
        rating,
        comment: comment.trim(),
        eventId,
        ticketId,
        skipTimeValidation,
      });

      setAlertConfig({
        visible: true,
        type: "success",
        title: "Thành công",
        message: "Cảm ơn bạn đã gửi đánh giá!",
      });
    } catch (error: any) {
      console.error("Feedback error:", error);

      let message = "Không thể gửi đánh giá. Vui lòng thử lại.";
      let statusCode = error?.response?.status || error?.status;

      // Lấy thông báo từ response data
      const errorMessage = error?.response?.data?.message || error?.message;

      // Bắt lỗi 400 - sự kiện đã hết thời hạn đánh giá
      if (statusCode === 400) {
        message =
          errorMessage ||
          "Sự kiện đã hết thời hạn đánh giá. Bạn chỉ có thể đánh giá sự kiện trong 7 ngày sau khi kết thúc.";
      } else if (statusCode) {
        // Lỗi HTTP khác
        message = errorMessage || `Lỗi: ${statusCode}`;
      } else {
        // Lỗi network hoặc khác
        message = errorMessage || message;
      }

      setAlertConfig({
        visible: true,
        type: "error",
        title: "Lỗi",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertConfig({ ...alertConfig, visible: false });
    if (alertConfig.type === "success") {
      navigation.goBack();
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={40}
              color={star <= rating ? "#FFD700" : COLORS.text}
              style={{ opacity: star <= rating ? 1 : 0.3 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          <Text style={styles.headerTitle}>Đánh giá sự kiện</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Event Info */}
          {eventTitle && (
            <View style={styles.eventCard}>
              <Ionicons
                name="calendar"
                size={24}
                color={COLORS.primary}
                style={styles.eventIcon}
              />
              <Text style={styles.eventTitle} numberOfLines={2}>
                {eventTitle}
              </Text>
            </View>
          )}

          {/* Rating Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
            <Text style={styles.sectionSubtitle}>
              Chạm vào số sao để đánh giá
            </Text>

            {renderStars()}

            {rating > 0 && (
              <Text style={styles.ratingLabel}>
                {RATING_LABELS[rating - 1]}
              </Text>
            )}
          </View>

          {/* Comment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nhận xét (tùy chọn)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Chia sẻ trải nghiệm của bạn về sự kiện này..."
              placeholderTextColor={COLORS.text + "80"}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{comment.length}/500</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={COLORS.white} />
                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Alert Modal */}
        <ActionResultModal
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={handleAlertClose}
          buttonText={alertConfig.type === "success" ? "Hoàn tất" : "Đóng"}
          showConfetti={alertConfig.type === "success"}
        />
      </LinearGradient>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xxxl,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  eventIcon: {
    marginRight: SPACING.md,
  },
  eventTitle: {
    flex: 1,
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.text,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: SPACING.lg,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  starButton: {
    padding: SPACING.xs,
  },
  ratingLabel: {
    textAlign: "center",
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  commentInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    padding: SPACING.md,
    fontSize: FONTS.body,
    color: COLORS.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  characterCount: {
    textAlign: "right",
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.5,
    marginTop: SPACING.xs,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.button,
    paddingVertical: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.white,
  },
});

export default FeedbackEventScreen;
