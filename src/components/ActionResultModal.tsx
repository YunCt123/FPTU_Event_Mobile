import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS } from "../utils/theme";

export type ActionResultType = "success" | "error" | "warning" | "info";

export interface ActionResultModalProps {
  visible: boolean;
  type: ActionResultType;
  title: string;
  message?: string;
  subtitle?: string;
  onClose: () => void;
  onDismiss?: () => void; // Called when user clicks outside modal or presses back
  buttonText?: string;
  showConfetti?: boolean;
}

const ActionResultModal: React.FC<ActionResultModalProps> = ({
  visible,
  type,
  title,
  message,
  subtitle,
  onClose,
  onDismiss,
  buttonText = "Đóng",
  showConfetti = true,
}) => {
  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      startAnimation();
    } else {
      resetAnimation();
    }
  }, [visible]);

  const resetAnimation = () => {
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    checkmarkAnim.setValue(0);
    confettiAnims.forEach((anim) => {
      anim.translateY.setValue(0);
      anim.translateX.setValue(0);
      anim.rotate.setValue(0);
      anim.opacity.setValue(1);
    });
  };

  const startAnimation = () => {
    resetAnimation();

    // Modal entrance
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon animation
    Animated.sequence([
      Animated.delay(200),
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Text slide up
    Animated.sequence([
      Animated.delay(300),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti animation (only for success)
    if (type === "success" && showConfetti) {
      confettiAnims.forEach((anim, index) => {
        const angle = (index / confettiAnims.length) * Math.PI * 2;
        const distance = 120 + Math.random() * 80;

        Animated.sequence([
          Animated.delay(400),
          Animated.parallel([
            Animated.timing(anim.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: 800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: Math.sin(angle) * distance + 100,
              duration: 800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: Math.random() * 4 - 2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.delay(500),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]).start();
      });
    }
  };

  const getConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "checkmark" as const,
          iconColor: "#fff",
          gradientColors: ["#10b981", "#059669", "#047857"],
          bgColor: "#ecfdf5",
          textColor: "#065f46",
        };
      case "error":
        return {
          icon: "close" as const,
          iconColor: "#fff",
          gradientColors: ["#ef4444", "#dc2626", "#b91c1c"],
          bgColor: "#fef2f2",
          textColor: "#991b1b",
        };
      case "warning":
        return {
          icon: "warning" as const,
          iconColor: "#fff",
          gradientColors: ["#f59e0b", "#d97706", "#b45309"],
          bgColor: "#fffbeb",
          textColor: "#92400e",
        };
      case "info":
        return {
          icon: "information" as const,
          iconColor: "#fff",
          gradientColors: ["#3b82f6", "#2563eb", "#1d4ed8"],
          bgColor: "#eff6ff",
          textColor: "#1e40af",
        };
    }
  };

  const config = getConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss || onClose}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Confetti particles (only for success) */}
        {type === "success" &&
          showConfetti &&
          confettiAnims.map((anim, index) => {
            const colors = [
              "#FF6B6B",
              "#4ECDC4",
              "#FFE66D",
              "#95E1D3",
              "#F38181",
              "#AA96DA",
              "#FCBAD3",
              "#A8D8EA",
            ];
            const shapes = ["●", "■", "▲", "★", "♦", "♥"];
            return (
              <Animated.Text
                key={index}
                style={[
                  styles.confetti,
                  {
                    color: colors[index % colors.length],
                    transform: [
                      { translateX: anim.translateX },
                      { translateY: anim.translateY },
                      {
                        rotate: anim.rotate.interpolate({
                          inputRange: [-2, 2],
                          outputRange: ["-360deg", "360deg"],
                        }),
                      },
                    ],
                    opacity: anim.opacity,
                  },
                ]}
              >
                {shapes[index % shapes.length]}
              </Animated.Text>
            );
          })}

        {/* Stop propagation to modal content */}
        <TouchableWithoutFeedback>
          <Animated.View
            style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}
          >
            {/* Icon */}
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={config.gradientColors}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View style={{ transform: [{ scale: checkmarkAnim }] }}>
                  <Ionicons
                    name={config.icon}
                    size={56}
                    color={config.iconColor}
                  />
                </Animated.View>
              </LinearGradient>
            </View>

            {/* Title & Messages */}
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
                alignItems: "center",
              }}
            >
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              {message && <Text style={styles.message}>{message}</Text>}
            </Animated.View>

            {/* Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={COLORS.gradient_button}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>{buttonText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  confetti: {
    position: "absolute",
    fontSize: 20,
    top: "45%",
    left: "50%",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  iconWrapper: {
    position: "relative",
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  ring: {
    position: "absolute",
    borderRadius: 100,
    borderWidth: 2,
  },
  ring1: {
    width: 120,
    height: 120,
    opacity: 0.3,
  },
  ring2: {
    width: 140,
    height: 140,
    opacity: 0.15,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 4,
  },
  message: {
    fontSize: 17,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    lineHeight: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  button: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default ActionResultModal;
