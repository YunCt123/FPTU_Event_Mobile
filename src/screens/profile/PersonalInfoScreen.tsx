import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { authService } from "../../services/authService";
import { User, UpdateUserProfileRequest } from "../../types/user";
import { GradientButton, ActionResultModal, ActionResultType } from "../../components";
import { CLOUDINARY_CONFIG } from "../../config/cloudinary";

type PersonalInfoScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({
  navigation,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ActionResultType>("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Form fields
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState("");
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getCurrentUser();
      setUser(data);
      
      // Populate form fields
      setUserName(data.userName);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setPhoneNumber(data.phoneNumber);
      setAddress(data.address);
      setAvatar(data.avatar);
    } catch (error) {
      console.log("Failed to load user profile", error);
      setModalType("error");
      setModalTitle("Lỗi");
      setModalMessage("Không thể tải thông tin người dùng");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setModalType("warning");
      setModalTitle("Quyền truy cập");
      setModalMessage("Ứng dụng cần quyền truy cập thư viện ảnh để thay đổi avatar.");
      setModalVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setLocalImageUri(uri);
      await uploadToCloudinary(uri);
    }
  };

  const uploadToCloudinary = async (imageUri: string) => {
    if (
      !CLOUDINARY_CONFIG.CLOUD_NAME ||
      CLOUDINARY_CONFIG.CLOUD_NAME === "YOUR_CLOUD_NAME_HERE" ||
      !CLOUDINARY_CONFIG.UPLOAD_PRESET ||
      CLOUDINARY_CONFIG.UPLOAD_PRESET === "YOUR_UNSIGNED_UPLOAD_PRESET_HERE"
    ) {
      setModalType("error");
      setModalTitle("Lỗi cấu hình");
      setModalMessage("Chưa cấu hình Cloudinary. Hãy cập nhật trong file config/cloudinary.ts.");
      setModalVisible(true);
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "avatar.jpg",
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
        throw new Error("Upload failed");
      }

      const data = await res.json();
      if (data.secure_url) {
        setAvatar(data.secure_url);
        setModalType("success");
        setModalTitle("Thành công");
        setModalMessage("Tải ảnh lên thành công!");
      }
    } catch (error) {
      console.log("Cloudinary upload error:", error);
      setModalType("error");
      setModalTitle("Lỗi");
      setModalMessage("Không thể tải ảnh lên. Vui lòng thử lại.");
      setModalVisible(true);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!userName || !firstName || !lastName || !phoneNumber || !address) {
      setModalType("warning");
      setModalTitle("Thông tin chưa đầy đủ");
      setModalMessage("Vui lòng điền đầy đủ thông tin");
      setModalVisible(true);
      return;
    }

    try {
      setSaving(true);
      const payload: UpdateUserProfileRequest = {
        userName,
        firstName,
        lastName,
        phoneNumber,
        address,
        avatar,
      };

      await authService.updateProfile(payload);
      setModalType("success");
      setModalTitle("Thành công");
      setModalMessage("Cập nhật thông tin thành công!");
      setModalVisible(true);
    } catch (error: any) {
      console.log("Update profile error:", error);
      const message =
        error?.response?.data?.message ||
        "Không thể cập nhật thông tin. Vui lòng thử lại.";
      setModalType("error");
      setModalTitle("Lỗi");
      setModalMessage(message);
      setModalVisible(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={pickImage}
                disabled={uploadingImage}
              >
                {localImageUri || avatar ? (
                  <Image
                    source={{ uri: localImageUri || avatar }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={48} color={COLORS.text} />
                )}
                <View style={styles.avatarBadge}>
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Ionicons name="camera" size={20} color="#FFF" />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Nhấn để thay đổi ảnh đại diện</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Tên đăng nhập</Text>
                  <TextInput
                    style={styles.input}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Nhập tên đăng nhập"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <Text style={styles.label}>Họ</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Nhập họ"
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={styles.label}>Tên</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Nhập tên"
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Địa chỉ</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Nhập địa chỉ"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Thông tin khác</Text>

                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons name="business-outline" size={20} color={COLORS.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Cơ sở</Text>
                    <Text style={styles.infoValue}>{user?.campus?.name}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons
                    name={user?.gender ? "male" : "female"}
                    size={20}
                    color={COLORS.primary}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Giới tính</Text>
                    <Text style={styles.infoValue}>
                      {user?.gender ? "Nam" : "Nữ"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <GradientButton
              title="Lưu thay đổi"
              onPress={handleSave}
              loading={saving}
              disabled={saving || uploadingImage}
              icon="checkmark-outline"
            />
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
      
      {/* Action Result Modal */}
      <ActionResultModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setModalVisible(false);
          if (modalType === "success" && modalTitle === "Thành công") {
            navigation.goBack();
          }
        }}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.body,
  },
  scrollContent: {
    paddingBottom: 100,
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
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarHint: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
  },
  form: {
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputHalf: {
    flex: 1,
  },
  label: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: RADII.input,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.body,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    paddingTop: SPACING.sm,
    textAlignVertical: "top",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: SPACING.xs / 2,
  },
  infoValue: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: SPACING.sm,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.screenPadding,
    ...SHADOWS.md,
  },
});

export default PersonalInfoScreen;
