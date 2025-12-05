import React from "react";
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
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import FeaturedEventBanner, {
  FeaturedEvent,
} from "../../components/FeaturedEventBanner";
import img from "../../assets/fpt_logo.png";

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
                  navigation.navigate("Event");
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

              <View style={styles.upcomingCard}>
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
                <TouchableOpacity style={styles.upcomingAction}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.upcomingCard}>
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
                <TouchableOpacity style={styles.upcomingAction}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. Quick Actions - Lối tắt cho các tác vụ thường xuyên */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
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

                <TouchableOpacity style={styles.actionCard}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="qr-code" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.actionText}>Check-in</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="create" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.actionText}>Tạo{"\n"}sự kiện</Text>
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
});

export default HomeScreen;
