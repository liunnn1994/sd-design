import { normalizeTheme, normalizeTokenKey, type SdThemeConfig } from '@sdata/web-vue';

import catalog from '../../../../web-vue/components/config-provider/theme-catalog.json';

export interface EditorToken {
  key: string;
  value: string;
  dependencies?: string[];
}

export const themeCatalog = catalog;
export const tokenGroups = ['全部', '颜色', '尺寸', '文字', '风格', '其他'];

// 以 rgb(var(--token)) 消费、因此覆写时必须写通道格式（"r, g, b"）的调色板
// token，从目录值推导：值本身是通道三元组，或是指向此类 token 的 var() 间接引用。
const catalogValues = new Map<string, string>();
for (const token of themeCatalog.globals)
  if (!catalogValues.has(token.key)) catalogValues.set(token.key, token.value);
for (const component of themeCatalog.components)
  for (const token of component.tokens)
    if (!catalogValues.has(token.key)) catalogValues.set(token.key, token.value);
const channelTriplet = /^\s*\d+,\s*\d+,\s*\d+\s*$/;

export function isChannelToken(key: string, fallback = catalogValues.get(key) ?? ''): boolean {
  let value = fallback;
  for (let depth = 0; depth < 3; depth++) {
    if (channelTriplet.test(value)) return true;
    const target = value.match(/^var\(\s*--(?:sd-)?([\w-]+)\s*\)$/)?.[1];
    if (!target) return false;
    value = catalogValues.get(target) ?? '';
  }
  return false;
}

export function tokenGroup(key: string, value = '') {
  if (
    /color|primary|success|warning|danger|gray/.test(key) ||
    isChannelToken(key, value) ||
    /^(#|rgba?\(|hsla?\(|\d+,\s*\d+,\s*\d+)/.test(value)
  )
    return '颜色';
  if (/font|line-height/.test(key)) return '文字';
  if (/radius|shadow|opacity|border-style/.test(key)) return '风格';
  if (/size|height|width|spacing|padding|margin|gap/.test(key)) return '尺寸';
  return '其他';
}

export function canonicalConfig(theme: SdThemeConfig): SdThemeConfig {
  const normalized = normalizeTheme({
    tokens: theme.tokens ?? theme.token,
    components: theme.components ?? theme.component,
    meta: theme.meta,
  });
  return {
    meta: normalized.meta,
    seed: { ...theme.seed },
    algorithm: [...(theme.algorithm ?? [])],
    tokens: normalized.tokens,
    components: normalized.components,
  };
}

export function editToken(
  theme: SdThemeConfig,
  key: string,
  value: string | undefined,
  component = '',
) {
  const next = canonicalConfig(theme);
  const target = component ? (next.components![component] ??= {}) : next.tokens!;
  if (value === undefined || value === '') delete target[normalizeTokenKey(key)];
  else target[normalizeTokenKey(key)] = value;
  if (component && !Object.keys(target).length) delete next.components![component];
  return next;
}

export function tokensFor(component: string): EditorToken[] {
  return component
    ? (themeCatalog.components.find((item) => item.name === component)?.tokens ?? [])
    : themeCatalog.globals;
}

export function relatedComponents(key: string) {
  return themeCatalog.components
    .filter((component) =>
      component.tokens.some(
        (token) =>
          token.dependencies.includes(key) ||
          token.value.includes(`--${key}`) ||
          token.value.includes(`--sd-${key}`),
      ),
    )
    .map((item) => item.name);
}
