import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONTS,
  RADII,
  SHADOWS,
  SIZES,
} from "../../utils/theme";
import { AuthStackParamList } from "../../types/navigation";

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Register">;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPasswordMatch =
    !confirmPassword || !password || password === confirmPassword;

  const handleGoNext = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phoneNumber ||
      !userName
    ) {
      setError("Vui lòng nhập đầy đủ các thông tin bắt buộc (*) ở bước 1");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    const genderBoolean = gender === "male";
    setError(null);
    navigation.navigate("RegisterAdditional", {
      userName,
      firstName,
      lastName,
      email,
      password,
      gender: genderBoolean,
      phoneNumber,
      // Luôn yêu cầu thẻ sinh viên để chờ admin duyệt
      requireStudentCard: true,
    });
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.navigate("AuthLanding")}
                >
                  <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.title}>Đăng ký</Text>
                  <Text style={styles.subtitle}>
                    Tạo tài khoản mới để bắt đầu
                  </Text>
                </View>
              </View>

              <View style={styles.form}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Tên đăng nhập *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập tên đăng nhập"
                      value={userName}
                      onChangeText={setUserName}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inlineRow}>
                    <View style={[styles.inputContainer, styles.inlineItem]}>
                      <Text style={styles.label}>Họ *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Họ"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                      />
                    </View>
                    <View style={[styles.inputContainer, styles.inlineItem]}>
                      <Text style={styles.label}>Tên *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Tên"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email *</Text>
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
                </View>

                <View style={styles.section}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mật khẩu *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Xác nhận mật khẩu *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                    {!isPasswordMatch && (
                      <Text style={styles.inlineError}>
                        Mật khẩu xác nhận không khớp
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Số điện thoại *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập số điện thoại"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Giới tính</Text>
                    <View style={styles.genderContainer}>
                      <TouchableOpacity
                        style={[
                          styles.genderOption,
                          gender === "male" && styles.genderOptionActive,
                        ]}
                        onPress={() => setGender("male")}
                      >
                        <Text
                          style={[
                            styles.genderOptionText,
                            gender === "male" && styles.genderOptionTextActive,
                          ]}
                        >
                          Nam
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.genderOption,
                          gender === "female" && styles.genderOptionActive,
                        ]}
                        onPress={() => setGender("female")}
                      >
                        <Text
                          style={[
                            styles.genderOptionText,
                            gender === "female" &&
                              styles.genderOptionTextActive,
                          ]}
                        >
                          Nữ
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}
                {successMessage && (
                  <Text style={styles.successText}>{successMessage}</Text>
                )}

                <TouchableOpacity
                  style={[styles.registerButton, loading && { opacity: 0.7 }]}
                  onPress={loading ? undefined : handleGoNext}
                  disabled={loading}
                >
                  <Text style={styles.registerButtonText}>Đăng ký</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Đã có tài khoản? </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Login")}
                  >
                    <Text style={styles.loginLink}>Đăng nhập ngay</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.huge + SPACING.xl,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
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
  title: {
    fontSize: FONTS.display,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.6,
  },
  form: {
    gap: SPACING.xl,
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
  registerButton: {
    height: SIZES.button.height,
    borderRadius: RADII.button,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginTop: SPACING.sm,
    fontSize: FONTS.body,
  },
  successText: {
    color: "green",
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
  loginLink: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
  section: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge ?? FONTS.body,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inlineRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  inlineItem: {
    flex: 1,
  },
  inlineError: {
    fontSize: FONTS.caption ?? FONTS.body,
    color: "red",
    marginTop: SPACING.xs,
  },
  genderContainer: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  genderOption: {
    flex: 1,
    height: SIZES.button.height * 0.8,
    borderRadius: RADII.button,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: COLORS.white,
  },
  genderOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#E8F3FF",
  },
  genderOptionText: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  genderOptionTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default RegisterScreen;
