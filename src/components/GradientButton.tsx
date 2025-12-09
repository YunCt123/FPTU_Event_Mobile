import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../utils/theme";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: readonly string[];
}

const GRADIENT_VARIANTS = {
  primary: COLORS.gradient_button,
};

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  icon,
  iconSize = 20,
  disabled = false,
  loading = false,
  style,
  textStyle,
  gradientColors,
}) => {
  const colors = gradientColors || GRADIENT_VARIANTS.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={COLORS.gradient_button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, disabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={iconSize}
                color="#FFFFFF"
                style={styles.icon}
              />
            )}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADII.md,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  text: {
    color: "#FFFFFF",
    fontSize: FONTS.md,
    fontWeight: "700",
  },
});

export default GradientButton;
