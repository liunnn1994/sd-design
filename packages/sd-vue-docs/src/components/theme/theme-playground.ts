import { validateThemeConfig, normalizeTokenKey, type SdThemeConfig } from '@sdata/web-vue';
export { validateThemeConfig } from '@sdata/web-vue';

export interface ThemeTokenMap {
  [key: string]: string | number;
}

export interface ThemeComponentTokenMap {
  [componentName: string]: ThemeTokenMap;
}

export interface ThemeMeta {
  name?: string;
  schemaVersion?: number;
  cssVarPrefix?: string;
}

export type ThemeConfig = SdThemeConfig;

export interface ThemePreset {
  key: string;
  name: string;
  description: string;
  summary: string;
  mode?: 'light' | 'dark';
  theme: ThemeConfig;
}

export interface ThemeRuntimePayload {
  mode: 'light' | 'dark';
  theme: ThemeConfig;
}

export interface ThemeValidationResult {
  valid: boolean;
  data?: ThemeConfig;
  errors: string[];
}

export const THEME_SCHEMA_VERSION = 1;

// Presets describe intent, not resolved light-mode palettes. Semantic surfaces
// and status backgrounds stay owned by the component library's current mode.
const PRESET_OPTIONS = {
  default: { primary: '#1476ff', radius: 6, medium: 10, large: 16, fontSize: 14, spacing: 16 },
  dark: { primary: '#1476ff', radius: 8, medium: 12, large: 18, fontSize: 14, spacing: 14 },
  compact: { primary: '#2b6ed9', radius: 4, medium: 6, large: 10, fontSize: 13, spacing: 12 },
  brand: { primary: '#e6397a', radius: 10, medium: 14, large: 22, fontSize: 14, spacing: 18 },
  cyberpunk: { primary: '#8c31ff', radius: 12, medium: 18, large: 28, fontSize: 14, spacing: 18 },
} as const;

function buildPresetTheme(
  presetKey: keyof typeof PRESET_OPTIONS,
  meta: Pick<ThemeMeta, 'name'>,
): ThemeConfig {
  const options = PRESET_OPTIONS[presetKey];
  return {
    meta: { schemaVersion: THEME_SCHEMA_VERSION, cssVarPrefix: '--', name: meta.name },
    algorithm: [
      ...(presetKey === 'dark' || presetKey === 'cyberpunk' ? ['dark' as const] : []),
      ...(presetKey === 'compact' ? ['compact' as const] : []),
    ],
    seed: {
      primary: options.primary,
      success: '#16a34a',
      warning: '#d97706',
      danger: '#e11d48',
      radius: options.radius,
      fontSize: options.fontSize,
    },
    tokens: {
      borderRadiusMedium: `${options.medium}px`,
      borderRadiusLarge: `${options.large}px`,
      spacing7: `${options.spacing}px`,
    },
  };
}

export const themePresets: ThemePreset[] = [
  {
    key: 'default',
    name: '默认',
    description: '延续组件库默认的理性蓝色语义，适合大多数后台与内容场景。',
    summary: '稳定、清晰、可直接落地。',
    mode: 'light',
    theme: buildPresetTheme('default', { name: 'Default' }),
  },
  {
    key: 'dark',
    name: '暗色',
    description: '压低背景亮度并提升文字对比度，适合夜间长时间浏览。',
    summary: '更适合低光环境与大屏展示。',
    mode: 'dark',
    theme: buildPresetTheme('dark', { name: 'Dark' }),
  },
  {
    key: 'compact',
    name: '紧凑',
    description: '收紧圆角与中性色层级，让信息密度更高，适合运营与配置台。',
    summary: '强调效率与扫描速度。',
    mode: 'light',
    theme: buildPresetTheme('compact', { name: 'Compact' }),
  },
  {
    key: 'brand',
    name: '品牌色',
    description: '以桃红色谱替换主品牌色，更适合营销活动与品牌专题页。',
    summary: '强调记忆点和品牌识别。',
    mode: 'light',
    theme: buildPresetTheme('brand', { name: 'Brand' }),
  },
  {
    key: 'cyberpunk',
    name: '赛博朋克',
    description: '高饱和紫电色搭配深色中性背景，适合实验性视觉与活动首页。',
    summary: '氛围强、对比激进。',
    mode: 'dark',
    theme: buildPresetTheme('cyberpunk', { name: 'Cyberpunk' }),
  },
];

function cloneTokenMap(tokenMap?: ThemeTokenMap): ThemeTokenMap {
  return tokenMap ? { ...tokenMap } : {};
}

function cloneComponentMap(componentMap?: ThemeComponentTokenMap): ThemeComponentTokenMap {
  if (!componentMap) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(componentMap).map(([componentName, tokens]) => [
      componentName,
      cloneTokenMap(tokens),
    ]),
  );
}

export function cloneThemeConfig(theme?: ThemeConfig): ThemeConfig {
  return {
    seed: theme?.seed ? { ...theme.seed } : undefined,
    algorithm: theme?.algorithm ? [...theme.algorithm] : undefined,
    meta: {
      schemaVersion: theme?.meta?.schemaVersion ?? THEME_SCHEMA_VERSION,
      cssVarPrefix: theme?.meta?.cssVarPrefix ?? '--',
      name: theme?.meta?.name,
    },
    tokens: cloneTokenMap(theme?.tokens),
    components: cloneComponentMap(theme?.components),
  };
}

export function getThemePreset(presetKey: string) {
  return themePresets.find((preset) => preset.key === presetKey) ?? themePresets[0];
}

export function buildThemeRuntimePayload(theme: ThemeConfig, mode?: ThemePreset['mode']) {
  return {
    mode: mode ?? 'light',
    theme: cloneThemeConfig(theme),
  } satisfies ThemeRuntimePayload;
}

export function getThemeToken(theme: ThemeConfig, tokenKey: string) {
  return theme.tokens?.[tokenKey] ?? theme.tokens?.[normalizeTokenKey(tokenKey)] ?? '';
}

export function setThemeToken(theme: ThemeConfig, tokenKey: string, value: string | number) {
  return {
    ...cloneThemeConfig(theme),
    tokens: {
      ...cloneTokenMap(theme.tokens),
      [tokenKey]: value,
    },
  } satisfies ThemeConfig;
}

export function serializeThemeConfig(theme: ThemeConfig) {
  return JSON.stringify(cloneThemeConfig(theme), null, 2);
}

export function parseThemeText(text: string) {
  try {
    return validateThemeConfig(JSON.parse(text));
  } catch {
    return {
      valid: false,
      errors: ['JSON 解析失败，请检查逗号、引号和对象结构。'],
    } satisfies ThemeValidationResult;
  }
}
