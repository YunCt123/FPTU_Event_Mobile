import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  COLORS,
  SPACING,
  FONTS,
  SHADOWS,
  RADII,
  SIZES,
} from "../../utils/theme";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const img = require("../../assets/fpt_logo.png");
import { AuthStackParamList } from "../../types/navigation";

type AuthLandingScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "AuthLanding">;
  route: RouteProp<AuthStackParamList, "AuthLanding">;
};

const AuthLandingScreen: React.FC<AuthLandingScreenProps> = ({
  navigation,
  route,
}) => {
  const logoSlideAnim = useRef(new Animated.Value(-300)).current;
  const titleSlideAnim = useRef(new Animated.Value(-300)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoSlideAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlideAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const registerMessage = (
    route.params as { registerMessage?: string } | undefined
  )?.registerMessage;
  const [modalVisible, setModalVisible] = useState(!!registerMessage);

  useEffect(() => {
    if (registerMessage) {
      setModalVisible(true);
    }
  }, [registerMessage]);

  const closeModal = () => {
    setModalVisible(false);
    navigation.setParams({ registerMessage: undefined } as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient_1}
        start={{ x: 1, y: 0.2 }}
        end={{ x: 0.2, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Animated.View
              style={{ transform: [{ translateY: logoSlideAnim }] }}
            >
              <Image source={img} style={{ width: 220, height: 220 }} />
            </Animated.View>
            <Animated.Text
              style={[
                styles.title,
                { transform: [{ translateY: titleSlideAnim }] },
              ]}
            >
              FPT University Events
            </Animated.Text>
          </View>
          <Animated.View
            style={[styles.buttonContainer, { opacity: buttonFadeAnim }]}
          >
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.registerButtonText}>Đăng ký</Text>
            </TouchableOpacity>
          </Animated.View>

          {registerMessage && (
            <Modal
              visible={modalVisible}
              transparent
              animationType="fade"
              onRequestClose={closeModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <View style={styles.modalIcon}>
                    <Text style={styles.modalIconText}>✅</Text>
                  </View>
                  <Text style={styles.modalTitle}>Đăng ký thành công</Text>
                  <Text style={styles.modalMessage}>{registerMessage}</Text>
                  <TouchableOpacity
                    style={styles.modalButtonPrimary}
                    onPress={() => {
                      closeModal();
                      navigation.navigate("Login");
                    }}
                  >
                    <Text style={styles.modalButtonPrimaryText}>Đăng nhập</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonGhost}
                    onPress={closeModal}
                  >
                    <Text style={styles.modalButtonGhostText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-evenly",
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.screenPadding,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: SPACING.huge * 2,
  },
  title: {
    fontSize: FONTS.display,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.text,
    textAlign: "center",
    borderWidth: 1,
  },
  buttonContainer: {
    gap: SPACING.lg,
    marginBottom: SPACING.huge,
  },
  loginButton: {
    height: SIZES.button.height,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.button,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: COLORS.white,
    height: SIZES.button.height,
    borderRadius: RADII.button,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  registerButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.screenPadding,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: RADII.modal,
    padding: SPACING.xl,
    alignItems: "center",
    ...SHADOWS.md,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalIconText: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: FONTS.bodyLarge ?? FONTS.body,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: FONTS.body,
    color: COLORS.text,
    opacity: 0.8,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  modalButtonPrimary: {
    width: "100%",
    height: SIZES.button.height,
    borderRadius: RADII.button,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  modalButtonPrimaryText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: "600",
  },
  modalButtonGhost: {
    width: "100%",
    height: SIZES.button.height,
    borderRadius: RADII.button,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
  },
  modalButtonGhostText: {
    color: COLORS.primary,
    fontSize: FONTS.body,
    fontWeight: "600",
  },
});

export default AuthLandingScreen;
