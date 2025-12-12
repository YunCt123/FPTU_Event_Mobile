import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import FeaturedEventBanner, {
  FeaturedEvent,
} from "../../components/FeaturedEventBanner";
import img from "../../assets/fpt_logo.png";
import { STORAGE_KEYS } from "../../api/api";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const FEATURED_EVENTS: FeaturedEvent[] = [
  {
    id: "1",
    title: "FPT Tech Day 2025",
    subtitle: "Hội thảo công nghệ lớn nhất năm",
    gradientColors: COLORS.gradient_2,
    date: "25/12/2025",
    location: "Hall A - Beta Building",
    attendees: 500,
  },
  {
    id: "2",
    title: "Club Day: Welcome K19",
    subtitle: "Ngày hội sinh viên sôi động",
    color: COLORS.primary,
    date: "10/01/2026",
    location: "Main Campus",
    attendees: 300,
  },
  {
    id: "3",
    title: "F-Talent Show",
    subtitle: "Sân chơi tài năng sinh viên FPT",
    color: "#4CAF50",
    date: "15/02/2026",
    location: "FPT Arena",
    attendees: 250,
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserRole(user.roleName);
        }
      } catch (error) {
        console.error("Error loading user role:", error);
      }
    };

    loadUserRole();
  }, []);

  const isStaff = userRole === "staff";

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
          {/* 1. Header/Chào mừng - Định danh người dùng và thông tin tổng quan vé */}
          <View style={styles.header}>
            <View>
              <View style={styles.headerIcon}>
                <Image style={styles.logo} source={img} />
                <TouchableOpacity
                  onPress={() => navigation.navigate("Profile")}
                  style={styles.avatar}
                >
                  <Ionicons
                    name="person-circle"
                    size={40}
                    color={COLORS.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            {/* 2. Sự kiện Nổi bật - Thu hút đăng ký sự kiện mới */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sự kiện Nổi bật</Text>
              <FeaturedEventBanner
                events={FEATURED_EVENTS}
                onEventPress={(event) => {
                  console.log("Event pressed:", event.title);
                  navigation.navigate("EventDetails", { eventId: event.id });
                }}
                autoPlayInterval={2000}
              />
            </View>

            {/* 3. Sự kiện Sắp diễn ra - Nhắc nhở/giúp người dùng quản lý thời gian */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sự kiện Sắp diễn ra</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Event")}>
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.upcomingCard}
                onPress={() => navigation.navigate("EventDetails", { eventId: "1" })}
                activeOpacity={0.7}
              >
                <View style={styles.upcomingLeft}>
                  <View style={styles.upcomingDate}>
                    <Text style={styles.upcomingDay}>15</Text>
                    <Text style={styles.upcomingMonth}>Th12</Text>
                  </View>
                </View>
                <View style={styles.upcomingContent}>
                  <Text style={styles.upcomingTitle}>
                    Tech Talk: AI in Education
                  </Text>
                  <View style={styles.upcomingDetail}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={COLORS.text}
                    />
                    <Text style={styles.upcomingDetailText}>14:00 - 16:00</Text>
                  </View>
                  <View style={styles.upcomingDetail}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={COLORS.text}
                    />
                    <Text style={styles.upcomingDetailText}>Hall A</Text>
                  </View>
                </View>
                <View style={styles.upcomingAction}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.upcomingCard}
                onPress={() => navigation.navigate("EventDetails", { eventId: "2" })}
                activeOpacity={0.7}
              >
                <View style={styles.upcomingLeft}>
                  <View style={styles.upcomingDate}>
                    <Text style={styles.upcomingDay}>18</Text>
                    <Text style={styles.upcomingMonth}>Th12</Text>
                  </View>
                </View>
                <View style={styles.upcomingContent}>
                  <Text style={styles.upcomingTitle}>
                    Workshop: UI/UX Design
                  </Text>
                  <View style={styles.upcomingDetail}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={COLORS.text}
                    />
                    <Text style={styles.upcomingDetailText}>09:00 - 12:00</Text>
                  </View>
                  <View style={styles.upcomingDetail}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={COLORS.text}
                    />
                    <Text style={styles.upcomingDetailText}>Room 301</Text>
                  </View>
                </View>
                <View style={styles.upcomingAction}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* 4. Quick Actions - Lối tắt cho các tác vụ thường xuyên */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
              
              {/* Staff Quick Access */}
              {isStaff && (
                <TouchableOpacity
                  style={styles.staffBanner}
                  onPress={() => navigation.navigate("StaffAssignedEvents")}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#FF6B6B", "#FF8E53"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.staffBannerGradient}
                  >
                    <View style={styles.staffBannerContent}>
                      <View style={styles.staffBannerLeft}>
                        <View style={styles.staffIconContainer}>
                          <Ionicons
                            name="shield-checkmark"
                            size={32}
                            color={COLORS.white}
                          />
                        </View>
                        <View>
                          <Text style={styles.staffBannerTitle}>
                            Chế độ Staff
                          </Text>
                          <Text style={styles.staffBannerSubtitle}>
                            Xem sự kiện được phân công
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={COLORS.white}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate("Event")}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons
                      name="add-circle"
                      size={28}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.actionText}>Đăng ký{"\n"}sự kiện</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate("Ticket")}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="qr-code" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.actionText}>Vé của tôi</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate("Profile")}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="person" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.actionText}>Hồ sơ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.blue,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
    marginTop: SPACING.huge,
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.md,
  },
  headerIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  logo: {
    width: 60,
    height: 60,
    position: "absolute",
  },
  avatar: {
    position: "absolute",
    right: 0,
  },
  content: {
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.xl,
    paddingTop: SPACING.huge,
    marginBottom: 100,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.text,
    paddingLeft: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
  // Upcoming Events Styles
  upcomingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  upcomingLeft: {
    alignItems: "center",
  },
  upcomingDate: {
    width: 60,
    height: 60,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  upcomingDay: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
  },
  upcomingMonth: {
    fontSize: FONTS.caption,
    color: COLORS.white,
  },
  upcomingContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  upcomingTitle: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  upcomingDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  upcomingDetailText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.7,
  },
  upcomingAction: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  // Quick Actions Styles
  quickActionsContainer: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    alignItems: "center",
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  actionText: {
    fontSize: FONTS.caption,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  // Staff Banner Styles
  staffBanner: {
    marginBottom: SPACING.md,
    borderRadius: RADII.card,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  staffBannerGradient: {
    padding: SPACING.lg,
  },
  staffBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  staffBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  staffIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  staffBannerTitle: {
    fontSize: FONTS.body,
    fontWeight: "bold",
    color: COLORS.white,
  },
  staffBannerSubtitle: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
});

export default HomeScreen;
