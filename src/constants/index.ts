export const APP_NAME = "Smart Menu";
export const COMPANY_NAME = "Smart Tech Namchi";

export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES];
