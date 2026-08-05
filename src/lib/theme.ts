import { Platform } from "react-native";

export const GOLD = {
  50: "#FBF7E8",
  100: "#F5E6B8",
  200: "#E8D088",
  300: "#D4AF37",
  400: "#C49B2A",
  500: "#A8841F",
  600: "#8B6F1A",
};

export const DARK = {
  900: "#020204",
  800: "#050507",
  700: "#08080B",
  600: "#0C0C10",
  500: "#121218",
  400: "#1A1A22",
  300: "#22222C",
};

export const NEUTRAL = {
  50: "#FAFAFA",
  100: "#F4F4F5",
  200: "#E4E4E7",
  300: "#D4D4D8",
  400: "#A1A1AA",
  500: "#71717A",
  600: "#52525B",
  700: "#3F3F46",
  800: "#27272A",
  900: "#18181B",
};

export const SUCCESS = "#34D399";
export const WARNING = "#FBBF24";
export const ERROR = "#F87171";
export const INFO = "#60A5FA";

export const glassCard = {
  backgroundColor: "rgba(18, 18, 24, 0.72)",
  borderWidth: 1,
  borderColor: "rgba(212, 175, 55, 0.18)",
  borderRadius: 24,
  ...(Platform.OS === "web"
    ? { boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 32,
      }),
};

export const glassCardSubtle = {
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.08)",
  borderRadius: 16,
};

export const goldGradient = ["#D4AF37", "#A8841F"];
export const darkGradient = ["#0C0C10", "#050507"];
export const cardGradient = ["rgba(18,18,24,0.85)", "rgba(10,10,14,0.65)"];

export const premiumShadow = Platform.OS === "web"
  ? { boxShadow: "0 4px 24px rgba(212,175,55,0.15)" }
  : {
      shadowColor: "#D4AF37",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    };
