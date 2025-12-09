import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../../services/authService";
import { STORAGE_KEYS } from "../../api/api";
import { User } from "../../types/user";

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const MENU_ITEMS = [
  {
    id: "1",
    icon: "person",
    title: "Thông tin cá nhân",
    subtitle: "Quản lý thông tin của bạn",
  },
  {
    id: "2",
    icon: "ticket",
    title: "Lịch sử đăng ký",
    subtitle: "Xem các sự kiện đã tham gia",
  },
  {
    id: "3",
    icon: "heart",
    title: "Sự kiện yêu thích",
    subtitle: "Danh sách sự kiện đã lưu",
  },
  {
    id: "4",
    icon: "notifications",
    title: "Thông báo",
    subtitle: "Cài đặt thông báo",
  },
  {
    id: "5",
    icon: "settings",
    title: "Cài đặt",
    subtitle: "Tùy chỉnh ứng dụng",
  },
  {
    id: "6",
    icon: "help-circle",
    title: "Trợ giúp & Hỗ trợ",
    subtitle: "FAQ và liên hệ",
  },
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DEFAULT_AVATAR_URL =
    "https://res.cloudinary.com/dpqvdxj10/image/upload/v1764850956/e4b228573786e7c96ab67604cc281fe1_t6hjal.jpg";

  const loadProfile = async () => {
    try {
      setError(null);
      setLoading(true);

      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        navigation.getParent()?.reset({
          index: 0,
          routes: [{ name: "Auth" as never }],
        });
        return;
      }

      const data = await authService.getCurrentUser();
      setUser(data);
    } catch (e: any) {
      console.log("Load profile error:", e?.response ?? e);
      const status = e?.response?.status;

      if (status === 401) {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER,
        ]);
        navigation.getParent()?.reset({
          index: 0,
          routes: [{ name: "Auth" as never }],
        });
        return;
      }

      setError("Không thể tải thông tin tài khoản. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: "Auth" as never }],
    });
  };

  const renderMenuItems = () => (
    <View style={styles.menuContainer}>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons
              name={item.icon as any}
              size={20}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>12</Text>
        <Text style={styles.statLabel}>Sự kiện</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>5</Text>
        <Text style={styles.statLabel}>Sắp tới</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>8</Text>
        <Text style={styles.statLabel}>Yêu thích</Text>
      </View>
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: user?.avatar || DEFAULT_AVATAR_URL }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.userName}>
                {user ? `${user.firstName} ${user.lastName}` : "Người dùng"}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.campus && (
                <Text style={styles.userCampus}>{user.campus.name}</Text>
              )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {renderStats()}
            {renderMenuItems()}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
          </ScrollView>
        )}
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
  scrollContent: {
    paddingBottom: 100,
    marginTop: SPACING.huge,
    paddingHorizontal: SPACING.screenPadding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    paddingVertical: SPACING.xxxl,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  backButton: {
    position: "absolute",
    top: SPACING.xxxl,
    left: SPACING.screenPadding,
    zIndex: 10,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
  },
  userName: {
    fontSize: FONTS.title,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.6,
  },
  userCampus: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    paddingVertical: SPACING.xl,
    borderRadius: RADII.modal,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  statNumber: {
    fontSize: FONTS.header,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
    borderRadius: RADII.modal,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.screenPadding,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  menuSubtitle: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.text,
    opacity: 0.3,
  },
  logoutButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error,
    marginBottom: SPACING.lg,
  },
  logoutButtonText: {
    color: COLORS.error,
    fontSize: FONTS.body,
    fontWeight: "600",
  },
  versionText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.4,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginBottom: SPACING.md,
    textAlign: "center",
    fontSize: FONTS.body,
  },
});

export default ProfileScreen;
