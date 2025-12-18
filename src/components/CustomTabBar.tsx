import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { COLORS, SHADOWS, SPACING } from "../utils/theme";

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  // Định nghĩa các route được hiển thị
  const visibleRoutes = ["Home", "Event", "Profile"];

  const getIconName = (routeName: string, focused: boolean): string => {
    switch (routeName) {
      case "Home":
        return focused ? "home" : "home-outline";
      case "Event":
        return focused ? "calendar" : "calendar-outline";
      case "Profile":
        return focused ? "person" : "person-outline";
      default:
        return "home-outline";
    }
  };

  const getLabel = (routeName: string): string => {
    switch (routeName) {
      case "Home":
        return "Trang chủ";
      case "Event":
        return "Sự kiện";
      case "Profile":
        return "Hồ sơ";
      default:
        return routeName;
    }
  };

  // Sắp xếp lại thứ tự: Home, Event (giữa), Ticket
  const orderedRoutes = state.routes.filter((route) =>
    visibleRoutes.includes(route.name)
  );

  // Tìm index của Event trong orderedRoutes
  const eventIndex = orderedRoutes.findIndex((route) => route.name === "Event");

  if (!state.routes || state.routes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {orderedRoutes
          .filter(
            (route) => route && route.key && descriptors[route.key]?.options
          )
          .map((route, index) => {
            if (!route || !route.key || !descriptors[route.key]) {
              return null;
            }

            const { options } = descriptors[route.key];
            if (!options) return null;

            try {
              const routeName = String(route.name || "");
              const isFocused =
                state.index ===
                state.routes.findIndex((r) => r.name === routeName);
              const isEventTab = routeName === "Event";

              const iconName = getIconName(routeName, isFocused);
              const label = String(getLabel(routeName) || routeName || "Tab");

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(routeName);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              // Tab Sự kiện ở giữa - nổi bật
              if (isEventTab) {
                return (
                  <TouchableOpacity
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={String(
                      options.tabBarAccessibilityLabel || label
                    )}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    style={styles.centerTabWrapper}
                  >
                    <View
                      style={[
                        styles.centerTab,
                        isFocused && styles.centerTabFocused,
                      ]}
                    >
                      <Ionicons
                        name={iconName as any}
                        size={28}
                        color={COLORS.white}
                      />
                    </View>
                    <Text
                      style={[
                        styles.centerLabel,
                        isFocused && styles.centerLabelFocused,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              }

              // Các tab thường
              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={String(
                    options.tabBarAccessibilityLabel || label
                  )}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabItem}
                >
                  <Ionicons
                    name={iconName as any}
                    size={24}
                    color={isFocused ? COLORS.primary : COLORS.text}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: isFocused ? COLORS.primary : COLORS.text },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            } catch (error) {
              return null;
            }
          })
          .filter(Boolean)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === "ios" ? 25 : 15,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 30,
    height: 65,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.md,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
  },
  centerTabWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
  },
  centerTab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  centerTabFocused: {
    backgroundColor: COLORS.blue,
    transform: [{ scale: 1.1 }],
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
    color: COLORS.primary,
  },
  centerLabelFocused: {
    color: COLORS.blue,
  },
});

export default CustomTabBar;
