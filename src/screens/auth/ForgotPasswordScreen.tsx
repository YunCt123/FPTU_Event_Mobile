import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Platform,
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
import { GradientButton } from "../../components";

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type Step = "email" | "otp" | "password";

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const otpInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOtp = async () => {
    if (!email) {
      setErrors({ email: "Vui lòng nhập email" });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Email không hợp lệ" });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await authService.forgotPassword({ email });

      Alert.alert(
        "Thành công",
        "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
        [
          {
            text: "OK",
            onPress: () => {
              setStep("otp");
              setTimeout(() => {
                otpInputRef.current?.focus();
              }, 100);
            },
          },
        ]
      );
    } catch (e: any) {
      console.log("Forgot password error:", e?.response ?? e);
      const message =
        e?.response?.data?.message ||
        "Gửi OTP thất bại. Vui lòng thử lại.";
      setErrors({ email: message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrors({ otp: "Vui lòng nhập mã OTP" });
      return;
    }

    if (otp.length !== 6) {
      setErrors({ otp: "Mã OTP phải có 6 chữ số" });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await authService.verifyOtp({ email, otp });

      if (response.verified) {
        setStep("password");
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 100);
      }
    } catch (e: any) {
      console.log("Verify OTP error:", e?.response ?? e);
      const message =
        e?.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.";
      setErrors({ otp: message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setErrors({ newPassword: "Vui lòng nhập mật khẩu mới" });
      return;
    }

    if (newPassword.length < 6) {
      setErrors({ newPassword: "Mật khẩu phải có ít nhất 6 ký tự" });
      return;
    }

    if (!confirmPassword) {
      setErrors({ confirmPassword: "Vui lòng xác nhận mật khẩu mới" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Mật khẩu xác nhận không khớp" });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await authService.resetPassword({
        email,
        otp,
        newPassword,
      });

      Alert.alert(
        "Thành công",
        "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.",
        [
          {
            text: "Đăng nhập",
            onPress: () => {
              navigation.navigate("Login");
            },
          },
        ]
      );
    } catch (e: any) {
      console.log("Reset password error:", e?.response ?? e);
      const message =
        e?.response?.data?.message ||
        "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "email", label: "Email", number: 1 },
      { key: "otp", label: "OTP", number: 2 },
      { key: "password", label: "Mật khẩu", number: 3 },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === step);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((stepItem, index) => (
          <React.Fragment key={stepItem.key}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  index <= currentStepIndex && styles.stepCircleActive,
                ]}
              >
                {index < currentStepIndex ? (
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      index <= currentStepIndex && styles.stepNumberActive,
                    ]}
                  >
                    {stepItem.number}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  index <= currentStepIndex && styles.stepLabelActive,
                ]}
              >
                {stepItem.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStepIndex && styles.stepLineActive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderEmailStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <Ionicons name="mail-outline" size={32} color={COLORS.primary} />
        </View>
      </View>

      <Text style={styles.stepTitle}>Nhập email của bạn</Text>
      <Text style={styles.stepDescription}>
        Chúng tôi sẽ gửi mã OTP đến email của bạn để xác thực
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Nhập email của bạn"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) {
              setErrors({ ...errors, email: undefined });
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={true}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <GradientButton
        title={loading ? "Đang gửi..." : "Gửi mã OTP"}
        onPress={handleSendOtp}
        loading={loading}
        disabled={loading}
        style={styles.submitButton}
      />
    </View>
  );

  const renderOtpStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <Ionicons name="keypad-outline" size={32} color={COLORS.primary} />
        </View>
      </View>

      <Text style={styles.stepTitle}>Nhập mã OTP</Text>
      <Text style={styles.stepDescription}>
        Vui lòng nhập mã OTP 6 chữ số đã được gửi đến {email}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mã OTP</Text>
        <TextInput
          ref={otpInputRef}
          style={[styles.input, styles.otpInput, errors.otp && styles.inputError]}
          placeholder="Nhập mã OTP"
          placeholderTextColor={COLORS.textSecondary}
          value={otp}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, "").slice(0, 6);
            setOtp(numericText);
            if (errors.otp) {
              setErrors({ ...errors, otp: undefined });
            }
          }}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={6}
        />
        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
      </View>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleSendOtp}
        disabled={loading}
      >
        <Text style={styles.resendText}>Gửi lại mã OTP</Text>
      </TouchableOpacity>

      <GradientButton
        title={loading ? "Đang xác thực..." : "Xác thực OTP"}
        onPress={handleVerifyOtp}
        loading={loading}
        disabled={loading || otp.length !== 6}
        style={styles.submitButton}
      />
    </View>
  );

  const renderPasswordStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <Ionicons name="lock-closed-outline" size={32} color={COLORS.primary} />
        </View>
      </View>

      <Text style={styles.stepTitle}>Đặt mật khẩu mới</Text>
      <Text style={styles.stepDescription}>
        Vui lòng nhập mật khẩu mới cho tài khoản của bạn
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            ref={passwordInputRef}
            style={[styles.passwordInput, errors.newPassword && styles.inputError]}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            placeholderTextColor={COLORS.textSecondary}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword) {
                setErrors({ ...errors, newPassword: undefined });
              }
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {errors.newPassword && (
          <Text style={styles.errorText}>{errors.newPassword}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={[
              styles.passwordInput,
              errors.confirmPassword && styles.inputError,
            ]}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor={COLORS.textSecondary}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
      </View>

      <View style={styles.infoBox}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={COLORS.primary}
        />
        <Text style={styles.infoText}>
          Mật khẩu phải có ít nhất 6 ký tự
        </Text>
      </View>

      <GradientButton
        title={loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        onPress={handleResetPassword}
        loading={loading}
        disabled={loading}
        style={styles.submitButton}
      />
    </View>
  );

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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (step === "email") {
                  navigation.goBack();
                } else if (step === "otp") {
                  setStep("email");
                } else {
                  setStep("otp");
                }
              }}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Quên mật khẩu</Text>
            </View>
          </View>

          {renderStepIndicator()}

          {step === "email" && renderEmailStep()}
          {step === "otp" && renderOtpStep()}
          {step === "password" && renderPasswordStep()}
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: SPACING.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONTS.display,
    fontWeight: "bold",
    color: COLORS.text,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
  },
  stepItem: {
    alignItems: "center",
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  stepNumberActive: {
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.xs + 18,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepContent: {
    gap: SPACING.lg,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  stepTitle: {
    fontSize: FONTS.title,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.6,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  inputContainer: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  input: {
    height: SIZES.input.height,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.input,
    paddingHorizontal: SPACING.lg,
    fontSize: FONTS.body,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  otpInput: {
    textAlign: "center",
    fontSize: FONTS.xxxl,
    letterSpacing: 8,
    fontWeight: "600",
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
  resendButton: {
    alignSelf: "center",
    paddingVertical: SPACING.sm,
  },
  resendText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: "600",
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

export default ForgotPasswordScreen;

