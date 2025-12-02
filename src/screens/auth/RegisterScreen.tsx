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

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    // TODO: Implement register logic
    console.log("Register:", { fullName, email, password, confirmPassword });
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
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Họ và tên</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập họ và tên"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>

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

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Xác nhận mật khẩu</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
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
});

export default RegisterScreen;
