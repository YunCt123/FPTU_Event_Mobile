import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { RootStackParamList } from "../../types/navigation";
import { GradientButton } from "../../components";
import { organizerRequestService } from "../../services/organizerRequestService";
import { CLOUDINARY_CONFIG } from "../../config/cloudinary";
import { authService } from "../../services/authService";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OrganizerRequest"
>;

type Props = {
  navigation: NavigationProp;
};

const OrganizerRequestScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [campusId, setCampusId] = useState<number | null>(null);
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Logo image
  const [logoLocalUri, setLogoLocalUri] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Proof image
  const [proofLocalUri, setProofLocalUri] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user.email) {
        setContactEmail(user.email);
      }
      if (user.campus?.id) {
        setCampusId(user.campus.id);
      }
    } catch (e) {
      console.log("Error loading user info:", e);
    }
  };

  const pickImage = async (type: "logo" | "proof") => {
    setError(null);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Ứng dụng cần quyền truy cập thư viện ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (type === "logo") {
        setLogoLocalUri(uri);
        setLogoUrl(null);
      } else {
        setProofLocalUri(uri);
        setProofUrl(null);
      }
    }
  };

  const uploadToCloudinary = async (localUri: string): Promise<string> => {
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
    formData.append("file", {
      uri: localUri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);
    formData.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);

    if (CLOUDINARY_CONFIG.FOLDER) {
      formData.append("folder", CLOUDINARY_CONFIG.FOLDER);
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`;
    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const data = await response.json();
    return data.secure_url;
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên câu lạc bộ/tổ chức.");
      return false;
    }
    if (!description.trim()) {
      setError("Vui lòng nhập mô tả về câu lạc bộ/tổ chức.");
      return false;
    }
    if (!contactEmail.trim()) {
      setError("Vui lòng nhập email liên hệ.");
      return false;
    }
    if (!logoLocalUri) {
      setError("Vui lòng chọn logo của câu lạc bộ/tổ chức.");
      return false;
    }
    if (!proofLocalUri) {
      setError("Vui lòng chọn ảnh minh chứng (giấy tờ xác nhận).");
      return false;
    }
    if (!campusId) {
      setError("Không xác định được campus. Vui lòng thử lại.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Upload logo
      let uploadedLogoUrl = logoUrl;
      if (logoLocalUri && !logoUrl) {
        uploadedLogoUrl = await uploadToCloudinary(logoLocalUri);
        setLogoUrl(uploadedLogoUrl);
      }

      // Upload proof
      let uploadedProofUrl = proofUrl;
      if (proofLocalUri && !proofUrl) {
        uploadedProofUrl = await uploadToCloudinary(proofLocalUri);
        setProofUrl(uploadedProofUrl);
      }

      if (!uploadedLogoUrl || !uploadedProofUrl) {
        throw new Error("Upload ảnh thất bại.");
      }

      // Submit request
      await organizerRequestService.createOrganizerRequest({
        name: name.trim(),
        description: description.trim(),
        logoUrl: uploadedLogoUrl,
        contactEmail: contactEmail.trim(),
        campusId: campusId!,
        proofImageUrl: uploadedProofUrl,
        memberEmails: memberEmails,
      });

      Alert.alert(
        "Gửi yêu cầu thành công",
        "Yêu cầu của bạn đã được gửi và đang chờ xét duyệt. Chúng tôi sẽ thông báo kết quả qua email.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (e: any) {
      console.log("Submit error:", e);
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderImagePicker = (
    type: "logo" | "proof",
    localUri: string | null,
    label: string,
    hint: string
  ) => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>{hint}</Text>
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={() => pickImage(type)}
        activeOpacity={0.7}
      >
        {localUri ? (
          <Image source={{ uri: localUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons
              name="cloud-upload-outline"
              size={40}
              color={COLORS.primary}
            />
            <Text style={styles.placeholderText}>Nhấn để chọn ảnh</Text>
          </View>
        )}
      </TouchableOpacity>
      {localUri && (
        <TouchableOpacity
          style={styles.changeImageBtn}
          onPress={() => pickImage(type)}
        >
          <Text style={styles.changeImageText}>Đổi ảnh khác</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient_1}
        start={{ x: 1, y: 0.2 }}
        end={{ x: 0.2, y: 1 }}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đăng ký Organizer</Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                Thông tin Câu lạc bộ / Tổ chức
              </Text>
              <Text style={styles.formSubtitle}>
                Điền thông tin để đăng ký trở thành organizer và thêm câu lạc bộ
                của bạn vào hệ thống.
              </Text>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color={COLORS.error}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Club Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên câu lạc bộ / Tổ chức *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="VD: CLB Âm nhạc FPT"
                  placeholderTextColor={COLORS.text + "80"}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mô tả *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Mô tả ngắn gọn về câu lạc bộ, hoạt động chính..."
                  placeholderTextColor={COLORS.text + "80"}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Contact Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email liên hệ *</Text>
                <TextInput
                  style={styles.input}
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  placeholder="email@fpt.edu.vn"
                  placeholderTextColor={COLORS.text + "80"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Logo Image */}
              {renderImagePicker(
                "logo",
                logoLocalUri,
                "Logo câu lạc bộ *",
                "Ảnh đại diện của câu lạc bộ/tổ chức"
              )}

              {/* Proof Image */}
              {renderImagePicker(
                "proof",
                proofLocalUri,
                "Ảnh minh chứng *",
                "Giấy tờ xác nhận (quyết định thành lập, giấy phép hoạt động...)"
              )}

              {/* Member Emails */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email thành viên</Text>
                <Text style={styles.hint}>
                  Thêm email của các thành viên trong câu lạc bộ (không bắt
                  buộc)
                </Text>

                <View style={styles.memberEmailInputRow}>
                  <TextInput
                    style={[styles.input, styles.memberEmailInput]}
                    value={newMemberEmail}
                    onChangeText={setNewMemberEmail}
                    placeholder="email@fpt.edu.vn"
                    placeholderTextColor={COLORS.text + "80"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.addMemberButton}
                    onPress={() => {
                      const email = newMemberEmail.trim();
                      if (email && !memberEmails.includes(email)) {
                        setMemberEmails([...memberEmails, email]);
                        setNewMemberEmail("");
                      }
                    }}
                  >
                    <Ionicons name="add" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>

                {memberEmails.length > 0 && (
                  <View style={styles.memberEmailsList}>
                    {memberEmails.map((email, index) => (
                      <View key={index} style={styles.memberEmailTag}>
                        <Text style={styles.memberEmailText}>{email}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setMemberEmails(
                              memberEmails.filter((_, i) => i !== index)
                            );
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color={COLORS.error}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <GradientButton
                title={loading ? "Đang gửi..." : "Gửi yêu cầu"}
                onPress={handleSubmit}
                gradientColors={COLORS.gradient_button}
                disabled={loading}
              />

              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Đang xử lý...</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.huge,
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
    fontSize: FONTS.header,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: 100,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.modal,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
  formTitle: {
    fontSize: FONTS.title,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "15",
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  hint: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  imagePickerContainer: {
    marginBottom: SPACING.lg,
  },
  imagePicker: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.primary + "40",
    borderStyle: "dashed",
    overflow: "hidden",
    minHeight: 150,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  placeholderText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  changeImageBtn: {
    alignSelf: "center",
    marginTop: SPACING.sm,
  },
  changeImageText: {
    color: COLORS.primary,
    fontSize: FONTS.body,
    fontWeight: "600",
  },
  memberEmailInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  memberEmailInput: {
    flex: 1,
  },
  addMemberButton: {
    width: 48,
    height: 48,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  memberEmailsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  memberEmailTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.pill,
    gap: SPACING.xs,
  },
  memberEmailText: {
    fontSize: FONTS.caption,
    color: COLORS.primary,
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADII.modal,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.body,
    color: COLORS.text,
  },
});

export default OrganizerRequestScreen;
