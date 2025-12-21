import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  COLORS,
  SPACING,
  FONTS,
  RADII,
  SHADOWS,
  SIZES,
} from "../../utils/theme";
import { AuthStackParamList } from "../../types/navigation";
import { RegisterRequest } from "../../types/auth";
import { authService } from "../../services/authService";
import { CLOUDINARY_CONFIG } from "../../config/cloudinary";
import { GradientButton } from "../../components";

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "RegisterStudentCard"
>;

type RouteProps = RouteProp<AuthStackParamList, "RegisterStudentCard">;

type Props = {
  navigation: NavigationProp;
  route: RouteProps;
};

const RegisterStudentCardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { basePayload } = route.params;

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    setError(null);
    // Yêu cầu quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError(
        "Ứng dụng cần quyền truy cập thư viện ảnh để tải ảnh thẻ sinh viên."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.CANCELED && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setLocalImageUri(uri);
      setUploadedUrl(null); // reset URL nếu chọn lại ảnh
    }
  };

  const uploadToCloudinary = async (): Promise<string> => {
    if (!localImageUri) {
      throw new Error("Vui lòng chọn ảnh thẻ sinh viên trước khi tải lên.");
    }

    if (
      !CLOUDINARY_CONFIG.CLOUD_NAME ||
      CLOUDINARY_CONFIG.CLOUD_NAME === "YOUR_CLOUD_NAME_HERE" ||
      !CLOUDINARY_CONFIG.UPLOAD_PRESET ||
      CLOUDINARY_CONFIG.UPLOAD_PRESET === "YOUR_UNSIGNED_UPLOAD_PRESET_HERE"
    ) {
      throw new Error(
        "Chưa cấu hình Cloudinary. Hãy cập nhật CLOUD_NAME và UPLOAD_PRESET trong file config/cloudinary.ts."
      );
    }

    const formData = new FormData();
    // Cloudinary yêu cầu field "file" và "upload_preset"
    formData.append("file", {
      uri: localImageUri,
      // @ts-ignore - React Native FormData
      type: "image/jpeg",
      name: "student_card.jpg",
    } as any);
    formData.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);
    if (CLOUDINARY_CONFIG.FOLDER) {
      formData.append("folder", CLOUDINARY_CONFIG.FOLDER);
    }

    const cloudName = CLOUDINARY_CONFIG.CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.log("Cloudinary upload error:", text);
      throw new Error("Tải ảnh lên Cloudinary thất bại. Vui lòng thử lại.");
    }

    const data = (await res.json()) as { secure_url?: string };
    if (!data.secure_url) {
      throw new Error("Không nhận được đường dẫn ảnh từ Cloudinary.");
    }

    setUploadedUrl(data.secure_url);
    return data.secure_url;
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setLoading(true);

      // 1. Nếu chưa upload thì upload lên Cloudinary trước
      const studentCardUrl = uploadedUrl || (await uploadToCloudinary());

      // 2. Gửi payload đăng ký với đường dẫn Cloudinary
      const payload: RegisterRequest = {
        ...basePayload,
        studentCardImage: studentCardUrl,
      };

      const res = await authService.register(payload);
      console.log("Register response:", res);

      const message =
        "Đăng ký thành công, tài khoản đang chờ duyệt. Vui lòng chờ admin xác nhận.";
      navigation.navigate("AuthLanding", { registerMessage: message });
    } catch (e: any) {
      console.log("Register error:", e?.response ?? e);
      const message =
        e?.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.title}>Thẻ sinh viên</Text>
                  <Text style={styles.subtitle}>
                    Bước 3: Cung cấp ảnh thẻ sinh viên
                  </Text>
                </View>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Ảnh thẻ sinh viên *</Text>
                  {localImageUri ? (
                    <Image
                      source={{ uri: localImageUri }}
                      style={styles.preview}
                    />
                  ) : (
                    <Text style={styles.helperText}>
                      Vui lòng chọn ảnh thẻ sinh viên từ thư viện.
                    </Text>
                  )}

                  <TouchableOpacity
                    style={styles.pickButton}
                    onPress={loading ? undefined : pickImage}
                    disabled={loading}
                  >
                    <Text style={styles.pickButtonText}>
                      {localImageUri ? "Chọn lại ảnh" : "Chọn ảnh từ thư viện"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.secondaryButtonText}>Quay lại</Text>
                  </TouchableOpacity>

                  <GradientButton
                    title="Đăng ký"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                  />
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
    flex: 1,
    height: SIZES.button.height,
    borderRadius: RADII.button,
    justifyContent: "center",
    alignItems: "center",
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
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  secondaryButton: {
    flex: 1,
    height: SIZES.button.height,
    borderRadius: RADII.button,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.body,
    fontWeight: "500",
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: RADII.card ?? RADII.input,
    marginBottom: SPACING.sm,
  },
  helperText: {
    fontSize: FONTS.caption ?? FONTS.body,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: SPACING.sm,
  },
  helperUploaded: {
    fontSize: FONTS.caption ?? FONTS.body,
    color: "green",
    marginBottom: SPACING.sm,
  },
  pickButton: {
    height: SIZES.button.height,
    borderRadius: RADII.button,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
  },
  pickButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.body,
    fontWeight: "500",
  },
});

export default RegisterStudentCardScreen;
