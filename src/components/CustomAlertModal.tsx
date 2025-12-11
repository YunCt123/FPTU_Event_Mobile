import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../utils/theme";

interface CustomAlertModalProps {
  visible: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  confirmText = "OK",
}) => {
  const getIconConfig = () => {
    switch (type) {
      case "success":
        return {
          name: "checkmark-circle" as const,
          color: "#10B981",
          bgColor: "#D1FAE5",
        };
      case "error":
        return {
          name: "close-circle" as const,
          color: "#EF4444",
          bgColor: "#FEE2E2",
        };
      case "warning":
        return {
          name: "warning" as const,
          color: "#F59E0B",
          bgColor: "#FEF3C7",
        };
      case "info":
        return {
          name: "information-circle" as const,
          color: "#3B82F6",
          bgColor: "#DBEAFE",
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconConfig.bgColor },
            ]}
          >
            <Ionicons
              name={iconConfig.name}
              size={48}
              color={iconConfig.color}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
            <Text style={styles.confirmButtonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.xl,
    padding: SPACING.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    ...SHADOWS.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.xl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  message: {
    fontSize: FONTS.md,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    width: "100%",
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: FONTS.md,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default CustomAlertModal;
