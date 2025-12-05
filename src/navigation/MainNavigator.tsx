import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, SHADOWS } from '../utils/theme';
import { MainTabParamList } from '../types/navigation';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import EventScreen from '../screens/event/EventScreen';
import TicketScreen from '../screens/ticket/TicketScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      id="MainTab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Event') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Ticket') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text,
        
        tabBarStyle: {
          backgroundColor: COLORS.white,
          paddingBottom: 25,
          paddingTop: SPACING.sm,
          height: 85,
          ...SHADOWS.sm
        },
        tabBarLabelStyle: {
          fontSize: FONTS.caption,
          fontWeight: '500',
          marginTop: SPACING.xs,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tab.Screen
        name="Event"
        component={EventScreen}
        options={{
          tabBarLabel: 'Sự kiện',
        }}
      />
      <Tab.Screen
        name="Ticket"
        component={TicketScreen}
        options={{
          tabBarLabel: 'Vé',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;