import React, { useEffect, useState } from "react";
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
import { Modal } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
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
import { RegisterRequest } from "../../types/auth";
import { authService } from "../../services/authService";
import { campusService } from "../../services/campusService";
import { Campus } from "../../types/user";

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "RegisterAdditional"
>;

type RouteProps = RouteProp<AuthStackParamList, "RegisterAdditional">;

type Props = {
  navigation: NavigationProp;
  route: RouteProps;
};

const RegisterAdditionalScreen: React.FC<Props> = ({ navigation, route }) => {
  const { params } = route;

  const [campusId, setCampusId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [address, setAddress] = useState("");
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campusLoading, setCampusLoading] = useState(false);
  const [campusModalVisible, setCampusModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!studentCode || !campusId || !address) {
      setError("Vui lòng nhập đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    const numericCampusId = Number(campusId) || 0;

    const basePayload: Omit<RegisterRequest, "studentCardImage"> = {
      userName: params.userName || params.email.split("@")[0],
      email: params.email,
      password: params.password,
      firstName: params.firstName,
      lastName: params.lastName,
      campusId: numericCampusId,
      studentCode,
      phoneNumber: params.phoneNumber,
      gender: params.gender,
      address,
      // Avatar mặc định cho tài khoản mới
      avatar:
        "https://res.cloudinary.com/dpqvdxj10/image/upload/v1764850956/e4b228573786e7c96ab67604cc281fe1_t6hjal.jpg",
    };

    if (params.requireStudentCard) {
      setError(null);
      navigation.navigate("RegisterStudentCard", { basePayload });
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const payload: RegisterRequest = {
        ...basePayload,
        studentCardImage: "",
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

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        setCampusLoading(true);
        const data = await campusService.getAllCampuses();
        setCampuses(data);
        // Nếu chưa chọn, auto chọn campus đầu tiên
        if (!campusId && data.length > 0) {
          setCampusId(String(data[0].id));
        }
      } catch (e) {
        console.log("Load campuses error:", e);
        // Không chặn flow, user vẫn có thể nhập tay nếu cần
      } finally {
        setCampusLoading(false);
      }
    };

    fetchCampuses();
  }, []);

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
                  <Text style={styles.title}>Thông tin sinh viên</Text>
                  <Text style={styles.subtitle}>
                    Bước 2: Mã sinh viên, cơ sở, địa chỉ
                  </Text>
                </View>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mã sinh viên *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mã sinh viên"
                    value={studentCode}
                    onChangeText={setStudentCode}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Cơ sở (Campus) *</Text>
                  <View style={styles.selectInput}>
                    <TouchableOpacity
                      disabled={campusLoading}
                      style={styles.selectButton}
                      onPress={() => setCampusModalVisible(true)}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          !campusId && { color: "rgba(0,0,0,0.4)" },
                        ]}
                      >
                        {campusLoading
                          ? "Đang tải danh sách cơ sở..."
                          : campuses.find((c) => String(c.id) === campusId)
                              ?.name || "Chọn cơ sở"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Địa chỉ *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập địa chỉ"
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.secondaryButtonText}>Quay lại</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.registerButton, loading && { opacity: 0.7 }]}
                    onPress={loading ? undefined : handleSubmit}
                    disabled={loading}
                  >
                    <Text style={styles.registerButtonText}>
                      {params.requireStudentCard ? "Tiếp theo" : "Đăng ký"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal
        visible={campusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCampusModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCampusModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn cơ sở</Text>
                {campuses.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.campusItem,
                      String(c.id) === campusId && styles.campusItemActive,
                    ]}
                    onPress={() => {
                      setCampusId(String(c.id));
                      setCampusModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.campusItemText,
                        String(c.id) === campusId && styles.campusItemTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                    <Text style={styles.campusItemSub}>{c.address}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  selectInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: RADII.input,
    backgroundColor: COLORS.white,
  },
  selectButton: {
    height: SIZES.input.height,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  selectText: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: SPACING.screenPadding,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card ?? RADII.input,
    padding: SPACING.lg,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: FONTS.bodyLarge ?? FONTS.body,
    fontWeight: "700",
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  campusItem: {
    paddingVertical: SPACING.sm,
    borderRadius: RADII.input,
    paddingHorizontal: SPACING.sm,
  },
  campusItemActive: {
    backgroundColor: "#E8F3FF",
  },
  campusItemText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  campusItemTextActive: {
    color: COLORS.primary,
  },
  campusItemSub: {
    fontSize: FONTS.caption ?? FONTS.body,
    color: "rgba(0,0,0,0.6)",
  },
});

export default RegisterAdditionalScreen;


