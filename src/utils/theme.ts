export const COLORS = {
  primary: "#F36F21",
  blue: "#004070",
  success: "#00C853",
  warning: "#FFB300",
  error: "#D32F2F",
  white: "#FFFFFF",
  black: "#000000",
  background: "#F5F5F5",
  text: "#212121",
  overlay: "rgba(0, 0, 0, 0.5)",

  gradient_1: [
    "#86E7FF",
    "#FFF5EC",
    "#FFE8CF",
    "#F1FDF6",
    "#D2F8E2",
  ] as const,
    gradient_2: [ 
    "#667eea",
    "#764ba2",
    ] as const,
};
 
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  // Specific spacing for components
  buttonPadding: 12,
  cardPadding: 16,
  screenPadding: 20,
  listItemPadding: 16,
  headerHeight: 56,
  tabBarHeight: 60,
  bottomSheetPadding: 20,
} as const;

export const RADII = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  button: 8,
  card: 12,
  input: 8,
  modal: 16,
  avatar: 50,
  pill: 50, // For pill-shaped buttons
} as const;

export const FONTS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 32,

  caption: 12,
  body: 14,
  bodyLarge: 16,
  subtitle: 18,
  title: 20,
  header: 24,
  display: 32,
} as const;

// Shadow configurations for different elevations
export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;

// Common component sizes
export const SIZES = {
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  },
  button: {
    height: 48,
    minWidth: 80,
  },
  input: {
    height: 48,
  },
} as const;

// Theme object combining all design tokens
export const THEME = {
  colors: COLORS,
  spacing: SPACING,
  radii: RADII,
  fonts: FONTS,
  shadows: SHADOWS,
  sizes: SIZES,
} as const;

// Type definitions for TypeScript
export type Colors = typeof COLORS;
export type Spacing = typeof SPACING;
export type Radii = typeof RADII;
export type Fonts = typeof FONTS;
export type Theme = typeof THEME;
