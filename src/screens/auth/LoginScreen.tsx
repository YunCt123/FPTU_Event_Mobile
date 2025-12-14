import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  COLORS,
  SPACING,
  FONTS,
  RADII,
  SIZES,
  SHADOWS,
} from "../../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../../services/authService";
import { notificationService } from "../../services/notificationService";
import { LoginRequest } from "../../types/auth";
import { GradientButton } from "../../components";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const payload: LoginRequest = { email, password };
      const res = await authService.login(payload);

      console.log("Login success:", res);

      // Lấy và lưu thông tin user vào AsyncStorage trước khi navigate
      try {
        const user = await authService.getCurrentUser();
        console.log("User data loaded:", user);
      } catch (userError) {
        console.warn("Failed to load user data:", userError);
      }

      // Đăng ký subscription với backend sau khi login thành công
      try {
        await notificationService.registerSubscription();
      } catch (notifError) {
        console.warn(
          "Failed to register notification subscription:",
          notifError
        );
      }

      // Điều hướng sang app chính sau khi login thành công (RootStack -> Main)
      // LoginScreen nằm trong AuthNavigator, còn AuthNavigator là một screen của RootNavigator (Auth).
      // Vì vậy chỉ cần lấy parent 1 lần là tới RootStack.
      const rootNavigation = navigation.getParent();
      rootNavigation?.reset({
        index: 0,
        routes: [{ name: "Main" as never }],
      });
    } catch (e: any) {
      console.log("Login error:", e?.response ?? e);
      const message =
        e?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(message);
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
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate("AuthLanding")}
              >
                <Ionicons name="chevron-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Đăng nhập</Text>
                <Text style={styles.headerSubtitle}>
                  Chào mừng bạn trở lại!
                </Text>
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              <GradientButton
                title={loading ? "Đang đăng nhập..." : "Đăng nhập"}
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.registerLink}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
  content: {
    flex: 1,
    paddingTop: SPACING.huge + SPACING.xl,
    paddingHorizontal: SPACING.screenPadding,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: SPACING.md,
    marginBottom: SPACING.xl,
    paddingLeft: -SPACING.huge,
    marginLeft: -SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -SPACING.xl,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONTS.display,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.6,
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
  input: {
    height: SIZES.input.height,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: RADII.input,
    paddingHorizontal: SPACING.lg,
    fontSize: FONTS.body,
    backgroundColor: COLORS.white,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
  loginButton: {
    height: SIZES.button.height,
    borderRadius: RADII.button,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginTop: SPACING.sm,
    fontSize: FONTS.body,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  registerLink: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default LoginScreen;
