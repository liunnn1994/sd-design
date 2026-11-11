import type { ThemeConfig, ThemePreset } from './theme-playground';

export interface ThemePreviewProps {
  preset: ThemePreset;
  theme: ThemeConfig;
  themeMode?: 'light' | 'dark';
  compact?: boolean;
}
