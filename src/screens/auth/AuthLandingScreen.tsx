import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  COLORS,
  SPACING,
  FONTS,
  SHADOWS,
  RADII,
  SIZES,
} from "../../utils/theme";
import img from "../../assets/fpt_logo.png";

type AuthLandingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const AuthLandingScreen: React.FC<AuthLandingScreenProps> = ({
  navigation,
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
            <Animated.View style={{ transform: [{ translateY: logoSlideAnim }]}}>
              <Image source={img} style={{ width: 220, height: 220 }} />
            </Animated.View>
            <Animated.Text
              style={[
                styles.title,
                { transform: [{ translateY: titleSlideAnim }]},
              ]}
            >
              FPT University Events
            </Animated.Text>
          </View>
          <Animated.View style={[styles.buttonContainer, { opacity: buttonFadeAnim }]}>
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
});

export default AuthLandingScreen;
