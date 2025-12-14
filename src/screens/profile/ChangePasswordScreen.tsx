import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONTS,
  RADII,
  SIZES,
  SHADOWS,
} from "../../utils/theme";
import { authService } from "../../services/authService";
import { GradientButton, ActionResultModal, ActionResultType } from "../../components";

type ChangePasswordScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

// Tách PasswordInput ra ngoài để tránh re-render
const PasswordInput = React.memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    showPassword,
    onToggleVisibility,
    error,
    autoFocus = false,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    showPassword: boolean;
    onToggleVisibility: () => void;
    error?: string;
    autoFocus?: boolean;
  }) => {
    const inputRef = useRef<TextInput>(null);

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            ref={inputRef}
            style={[styles.passwordInput, error && styles.inputError]}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={autoFocus}
            blurOnSubmit={false}
            returnKeyType="next"
            keyboardType="default"
            textContentType="password"
            editable={true}
            onFocus={() => {
              // Đảm bảo input không bị blur
            }}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={onToggleVisibility}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Chỉ re-render nếu các props quan trọng thay đổi
    return (
      prevProps.value === nextProps.value &&
      prevProps.showPassword === nextProps.showPassword &&
      prevProps.error === nextProps.error
    );
  }
);

PasswordInput.displayName = "PasswordInput";

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  navigation,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ActionResultType>("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleCurrentPasswordChange = useCallback((text: string) => {
    setCurrentPassword(text);
    setErrors((prev) => {
      if (prev.currentPassword) {
        return { ...prev, currentPassword: undefined };
      }
      return prev;
    });
  }, []);

  const handleNewPasswordChange = useCallback((text: string) => {
    setNewPassword(text);
    setErrors((prev) => {
      if (prev.newPassword) {
        return { ...prev, newPassword: undefined };
      }
      return prev;
    });
  }, []);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
    setErrors((prev) => {
      if (prev.confirmPassword) {
        return { ...prev, confirmPassword: undefined };
      }
      return prev;
    });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      setModalType("success");
      setModalTitle("Thành công!");
      setModalMessage("Đổi mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.");
      setModalVisible(true);
    } catch (e: any) {
      console.log("Change password error:", e?.response ?? e);
      const message =
        e?.response?.data?.message ||
        "Đổi mật khẩu thất bại. Vui lòng thử lại.";

      if (e?.response?.status === 400) {
        setErrors({ currentPassword: message });
      } else {
        setModalType("error");
        setModalTitle("Lỗi!");
        setModalMessage(message);
        setModalVisible(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={COLORS.gradient_1}
      start={{ x: 1, y: 0.2 }}
      end={{ x: 0.2, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        enabled={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
            bounces={false}
          >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
            </View>
          </View>

          <View style={styles.form}>

            <PasswordInput
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={handleCurrentPasswordChange}
              placeholder="Nhập mật khẩu hiện tại"
              showPassword={showCurrentPassword}
              onToggleVisibility={() =>
                setShowCurrentPassword(!showCurrentPassword)
              }
              error={errors.currentPassword}
              autoFocus={false}
            />

            <PasswordInput
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={handleNewPasswordChange}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              showPassword={showNewPassword}
              onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
              error={errors.newPassword}
            />

            <PasswordInput
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              placeholder="Nhập lại mật khẩu mới"
              showPassword={showConfirmPassword}
              onToggleVisibility={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              error={errors.confirmPassword}
            />

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.infoText}>
                Mật khẩu phải có ít nhất 6 ký tự và khác với mật khẩu hiện tại
              </Text>
            </View>

            <GradientButton
              title={loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              onPress={handleChangePassword}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Action Result Modal */}
      <ActionResultModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setModalVisible(false);
          if (modalType === "success") {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            navigation.goBack();
          }
        }}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: SPACING.huge + SPACING.xl,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xxxl,
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
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: -40,
  },
  form: {
    gap: SPACING.lg,
  },
  inputContainer: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  passwordInputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    height: SIZES.input.height,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.input,
    paddingHorizontal: SPACING.lg,
    paddingRight: SPACING.xxxl + SPACING.md,
    fontSize: FONTS.body,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  eyeIcon: {
    position: "absolute",
    right: SPACING.md,
    padding: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.caption,
    marginTop: SPACING.xs,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADII.md,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.caption,
    color: COLORS.text,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});

export default ChangePasswordScreen;
