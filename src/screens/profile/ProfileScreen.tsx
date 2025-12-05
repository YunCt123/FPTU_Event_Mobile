import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONTS,
  RADII,
  SHADOWS,
  SIZES,
} from "../../utils/theme";
import { LinearGradient } from "expo-linear-gradient";

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
  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Logout");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient_1}
        start={{ x: 1, y: 0.2 }}
        end={{ x: 0.2, y: 1 }}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <Text style={styles.userName}>Nguyễn Văn A</Text>
            <Text style={styles.userEmail}>nguyenvana@fpt.edu.vn</Text>
          </View>

          {/* Stats */}
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

          {/* Menu Items */}
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

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
        </ScrollView>
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
  profileHeader: {
    paddingVertical: SPACING.xxxl,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 40,
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
});

export default ProfileScreen;
