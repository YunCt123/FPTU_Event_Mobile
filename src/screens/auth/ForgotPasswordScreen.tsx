import React, { useState, useRef, useEffect } from "react";
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
  Animated,
  Keyboard,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { authService } from "../../services/authService";
import { GradientButton } from "../../components";

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type Step = "email" | "otp" | "password";

const OTP_LENGTH = 6;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Refs for OTP inputs
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const passwordInputRef = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Resend timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Animate step change
  const animateStepChange = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOtp = async () => {
    Keyboard.dismiss();

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

      setResendTimer(60);

      Alert.alert(
        "Gửi thành công! ✉️",
        "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (cả spam).",
        [
          {
            text: "Tiếp tục",
            onPress: () => {
              animateStepChange(() => {
                setStep("otp");
                setTimeout(() => otpInputRefs.current[0]?.focus(), 300);
              });
            },
          },
        ]
      );
    } catch (e: any) {
      console.log("Forgot password error:", e?.response ?? e);
      const message =
        e?.response?.data?.message || "Gửi OTP thất bại. Vui lòng thử lại.";
      setErrors({ email: message });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtpDigits = [...otpDigits];

    // Handle paste (multiple digits)
    if (value.length > 1) {
      const digits = value
        .replace(/[^0-9]/g, "")
        .split("")
        .slice(0, OTP_LENGTH);
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtpDigits[index + i] = digit;
        }
      });
      setOtpDigits(newOtpDigits);

      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    // Handle single digit
    const digit = value.replace(/[^0-9]/g, "");
    newOtpDigits[index] = digit;
    setOtpDigits(newOtpDigits);

    if (errors.otp) {
      setErrors({ ...errors, otp: undefined });
    }

    // Auto focus next input
    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    const otp = otpDigits.join("");

    if (otp.length !== OTP_LENGTH) {
      setErrors({ otp: "Vui lòng nhập đủ 6 chữ số" });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await authService.verifyOtp({ email, otp });

      if (response.verified) {
        animateStepChange(() => {
          setStep("password");
          setTimeout(() => passwordInputRef.current?.focus(), 300);
        });
      }
    } catch (e: any) {
      console.log("Verify OTP error:", e?.response ?? e);
      const message =
        e?.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.";
      setErrors({ otp: message });
      // Clear OTP on error
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      setLoading(true);
      await authService.forgotPassword({ email });
      setResendTimer(60);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      Alert.alert("Thành công", "Mã OTP mới đã được gửi đến email của bạn.");
    } catch (e: any) {
      Alert.alert("Lỗi", "Không thể gửi lại OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();

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
        otp: otpDigits.join(""),
        newPassword,
      });

      Alert.alert(
        "Đặt lại thành công! 🎉",
        "Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.",
        [
          {
            text: "Đăng nhập ngay",
            onPress: () => navigation.navigate("Login"),
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

  const handleBack = () => {
    if (step === "email") {
      navigation.goBack();
    } else if (step === "otp") {
      animateStepChange(() => setStep("email"));
    } else {
      animateStepChange(() => setStep("otp"));
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "email", icon: "mail" },
      { key: "otp", icon: "keypad" },
      { key: "password", icon: "lock-closed" },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === step);

    return (
      <View style={styles.stepIndicatorContainer}>
        {steps.map((stepItem, index) => (
          <React.Fragment key={stepItem.key}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  index < currentStepIndex && styles.stepCircleCompleted,
                  index === currentStepIndex && styles.stepCircleActive,
                ]}
              >
                {index < currentStepIndex ? (
                  <Ionicons name="checkmark" size={18} color={COLORS.white} />
                ) : (
                  <Ionicons
                    name={stepItem.icon as any}
                    size={18}
                    color={
                      index <= currentStepIndex
                        ? COLORS.white
                        : COLORS.textSecondary
                    }
                  />
                )}
              </View>
            </View>
            {index < steps.length - 1 && (
              <View style={styles.stepLineContainer}>
                <View
                  style={[
                    styles.stepLine,
                    index < currentStepIndex && styles.stepLineActive,
                  ]}
                />
              </View>
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderEmailStep = () => (
    <Animated.View
      style={[
        styles.stepContent,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <LinearGradient
          colors={[COLORS.primary + "20", COLORS.primary + "05"]}
          style={styles.illustrationGradient}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="mail-unread-outline"
              size={48}
              color={COLORS.primary}
            />
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.stepTitle}>Quên mật khẩu?</Text>
      <Text style={styles.stepDescription}>
        Đừng lo! Nhập email đăng ký của bạn, chúng tôi sẽ gửi mã xác thực để đặt
        lại mật khẩu.
      </Text>

      <View style={styles.inputWrapper}>
        <View
          style={[
            styles.inputContainer,
            errors.email && styles.inputContainerError,
          ]}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={errors.email ? COLORS.error : COLORS.textSecondary}
          />
          <TextInput
            style={styles.input}
            placeholder="example@fpt.edu.vn"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text.trim());
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {email.length > 0 && (
            <TouchableOpacity onPress={() => setEmail("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        {errors.email && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color={COLORS.error} />
            <Text style={styles.errorText}>{errors.email}</Text>
          </View>
        )}
      </View>

      <GradientButton
        title={loading ? "Đang gửi..." : "Gửi mã xác thực"}
        onPress={handleSendOtp}
        loading={loading}
        disabled={loading || !email}
        style={styles.submitButton}
      />

      <TouchableOpacity
        style={styles.backToLoginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
        <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderOtpStep = () => (
    <Animated.View
      style={[
        styles.stepContent,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <LinearGradient
          colors={[COLORS.primary + "20", COLORS.primary + "05"]}
          style={styles.illustrationGradient}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="shield-checkmark-outline"
              size={48}
              color={COLORS.primary}
            />
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.stepTitle}>Xác thực OTP</Text>
      <Text style={styles.stepDescription}>
        Nhập mã 6 chữ số đã gửi đến{"\n"}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      {/* OTP Input Grid */}
      <View style={styles.otpContainer}>
        {otpDigits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (otpInputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              digit && styles.otpInputFilled,
              errors.otp && styles.otpInputError,
            ]}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleOtpKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {errors.otp && (
        <View style={styles.errorContainerCenter}>
          <Ionicons name="alert-circle" size={14} color={COLORS.error} />
          <Text style={styles.errorText}>{errors.otp}</Text>
        </View>
      )}

      {/* Resend OTP */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendLabel}>Không nhận được mã? </Text>
        {resendTimer > 0 ? (
          <Text style={styles.resendTimer}>Gửi lại sau {resendTimer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
            <Text style={styles.resendButton}>Gửi lại</Text>
          </TouchableOpacity>
        )}
      </View>

      <GradientButton
        title={loading ? "Đang xác thực..." : "Xác nhận"}
        onPress={handleVerifyOtp}
        loading={loading}
        disabled={loading || otpDigits.some((d) => !d)}
        style={styles.submitButton}
      />
    </Animated.View>
  );

  const renderPasswordStep = () => (
    <Animated.View
      style={[
        styles.stepContent,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <LinearGradient
          colors={[COLORS.primary + "20", COLORS.primary + "05"]}
          style={styles.illustrationGradient}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={48} color={COLORS.primary} />
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.stepTitle}>Tạo mật khẩu mới</Text>
      <Text style={styles.stepDescription}>
        Mật khẩu mới phải khác với mật khẩu đã sử dụng trước đó.
      </Text>

      {/* New Password */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Mật khẩu mới</Text>
        <View
          style={[
            styles.inputContainer,
            errors.newPassword && styles.inputContainerError,
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={errors.newPassword ? COLORS.error : COLORS.textSecondary}
          />
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            placeholder="Tối thiểu 6 ký tự"
            placeholderTextColor={COLORS.textSecondary}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword)
                setErrors({ ...errors, newPassword: undefined });
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {errors.newPassword && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color={COLORS.error} />
            <Text style={styles.errorText}>{errors.newPassword}</Text>
          </View>
        )}
      </View>

      {/* Confirm Password */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
        <View
          style={[
            styles.inputContainer,
            errors.confirmPassword && styles.inputContainerError,
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={errors.confirmPassword ? COLORS.error : COLORS.textSecondary}
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor={COLORS.textSecondary}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword)
                setErrors({ ...errors, confirmPassword: undefined });
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color={COLORS.error} />
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          </View>
        )}
      </View>

      {/* Password Requirements */}
      <View style={styles.requirementsCard}>
        <View style={styles.requirementRow}>
          <Ionicons
            name={
              newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"
            }
            size={18}
            color={
              newPassword.length >= 6 ? COLORS.success : COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.requirementText,
              newPassword.length >= 6 && styles.requirementMet,
            ]}
          >
            Ít nhất 6 ký tự
          </Text>
        </View>
        <View style={styles.requirementRow}>
          <Ionicons
            name={
              newPassword === confirmPassword && confirmPassword.length > 0
                ? "checkmark-circle"
                : "ellipse-outline"
            }
            size={18}
            color={
              newPassword === confirmPassword && confirmPassword.length > 0
                ? COLORS.success
                : COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.requirementText,
              newPassword === confirmPassword &&
                confirmPassword.length > 0 &&
                styles.requirementMet,
            ]}
          >
            Mật khẩu xác nhận khớp
          </Text>
        </View>
      </View>

      <GradientButton
        title={loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        onPress={handleResetPassword}
        loading={loading}
        disabled={loading || !newPassword || !confirmPassword}
        style={styles.submitButton}
      />
    </Animated.View>
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
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <View style={styles.backButtonInner}>
                <Ionicons name="chevron-back" size={24} color={COLORS.text} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
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
    paddingTop: SPACING.huge,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },

  // Step Indicator
  stepIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  stepItem: {
    alignItems: "center",
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepLineContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
  },
  stepLine: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: COLORS.success,
  },

  // Step Content
  stepContent: {
    flex: 1,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  illustrationGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  emailHighlight: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Input Styles
  inputWrapper: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    height: 56,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  inputContainerError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "08",
  },
  input: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
    paddingVertical: 0,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  errorContainerCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.caption,
  },

  // OTP Styles
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.text,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  otpInputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "10",
  },

  // Resend OTP
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  resendLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  resendTimer: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  resendButton: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: "bold",
  },

  // Password Requirements
  requirementsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  requirementText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  requirementMet: {
    color: COLORS.success,
    fontWeight: "500",
  },

  // Buttons
  submitButton: {
    marginTop: SPACING.sm,
  },
  backToLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.xl,
    gap: SPACING.xs,
  },
  backToLoginText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;
