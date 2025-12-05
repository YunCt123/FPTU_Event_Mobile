import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types/navigation";
import AuthLandingScreen from "../screens/auth/AuthLandingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import RegisterAdditionalScreen from "../screens/auth/RegisterAdditionalScreen";
import RegisterStudentCardScreen from "../screens/auth/RegisterStudentCardScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      id="AuthStack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="RegisterAdditional"
        component={RegisterAdditionalScreen}
      />
      <Stack.Screen
        name="RegisterStudentCard"
        component={RegisterStudentCardScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
