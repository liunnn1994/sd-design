import type { SdThemeConfig, ThemeTokenMap } from './theme';

import { normalizeTokenKey } from './theme';

const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function validateThemeConfig(input: unknown): {
  valid: boolean;
  data?: SdThemeConfig;
  errors: string[];
} {
  const errors: string[] = [];
  if (!object(input)) return { valid: false, errors: ['主题配置必须是 JSON 对象。'] };
  const allowed = new Set([
    'meta',
    'tokens',
    'token',
    'components',
    'component',
    'seed',
    'algorithm',
  ]);
  for (const key of Object.keys(input)) if (!allowed.has(key)) errors.push(`不支持的字段：${key}`);
  const tokenMap = (value: unknown, location: string): ThemeTokenMap => {
    const result: ThemeTokenMap = {};
    if (value === undefined) return result;
    if (!object(value)) {
      errors.push(`${location} 必须是对象。`);
      return result;
    }
    for (const [key, item] of Object.entries(value)) {
      const normalized = normalizeTokenKey(key);
      if (
        !normalized ||
        /^(?:__proto__|constructor|prototype)$/.test(key) ||
        !/^[\w-]+$/.test(normalized)
      ) {
        errors.push(`${location}.${key} 名称无效。`);
      } else if (
        (typeof item !== 'string' && typeof item !== 'number') ||
        (typeof item === 'number' && !Number.isFinite(item))
      ) {
        errors.push(`${location}.${key} 必须是字符串或有限数字。`);
      } else if (normalized in result) errors.push(`${location}.${key} 与已有 token 重复。`);
      else result[normalized] = item;
    }
    return result;
  };
  const data: SdThemeConfig = {
    tokens: tokenMap(input.tokens ?? input.token, 'tokens'),
    components: {},
  };
  const components = input.components ?? input.component;
  if (components !== undefined && !object(components)) errors.push('components 必须是对象。');
  else if (object(components)) {
    for (const [name, value] of Object.entries(components)) {
      const key = normalizeTokenKey(name);
      if (!key || ['__proto__', 'constructor', 'prototype'].includes(name) || !/^[\w-]+$/.test(key))
        errors.push(`组件名称 ${name} 无效。`);
      else if (key in data.components!) errors.push(`组件名称 ${name} 与已有组件重复。`);
      else data.components![key] = tokenMap(value, `components.${name}`);
    }
  }
  data.meta = { schemaVersion: 1, cssVarPrefix: '--' };
  if (input.meta !== undefined) {
    if (!object(input.meta)) errors.push('meta 必须是对象。');
    else {
      if (input.meta.schemaVersion !== undefined && input.meta.schemaVersion !== 1)
        errors.push('仅支持 schemaVersion 1。');
      if (input.meta.cssVarPrefix !== undefined) {
        // 运行时 normalizeTheme/getThemeCSSVariables 支持自定义前缀，导入时
        // 保留原值即可；normalizeTheme 会补齐 "--" 前缀和结尾的 "-"。
        if (typeof input.meta.cssVarPrefix !== 'string' || !input.meta.cssVarPrefix.trim())
          errors.push('meta.cssVarPrefix 必须是非空字符串。');
        else data.meta.cssVarPrefix = input.meta.cssVarPrefix;
      }
      if (input.meta.name !== undefined && typeof input.meta.name !== 'string')
        errors.push('meta.name 必须是字符串。');
      else if (typeof input.meta.name === 'string') data.meta.name = input.meta.name;
    }
  }
  if (input.algorithm !== undefined) {
    if (
      !Array.isArray(input.algorithm) ||
      input.algorithm.some((value) => value !== 'dark' && value !== 'compact')
    )
      errors.push('algorithm 仅支持 dark、compact 数组。');
    else data.algorithm = [...new Set(input.algorithm)] as Array<'dark' | 'compact'>;
  }
  if (input.seed !== undefined) {
    if (!object(input.seed)) errors.push('seed 必须是对象。');
    else {
      const seed: Record<string, string | number> = {};
      for (const [key, value] of Object.entries(input.seed)) {
        if (['primary', 'success', 'warning', 'danger'].includes(key)) {
          if (typeof value !== 'string' || !/^#[\da-f]{6}$/i.test(value))
            errors.push(`seed.${key} 必须是六位十六进制颜色。`);
          else seed[key] = value;
        } else if (['radius', 'fontSize', 'controlHeight'].includes(key)) {
          const minimum = key === 'radius' ? 0 : key === 'fontSize' ? 8 : 16;
          if (
            typeof value !== 'number' ||
            !Number.isFinite(value) ||
            value < minimum ||
            value > 256
          )
            errors.push(`seed.${key} 必须是 ${minimum} 到 256 之间的数字。`);
          else seed[key] = value;
        } else errors.push(`不支持的基础 token：${key}`);
      }
      data.seed = seed;
    }
  }
  return { valid: !errors.length, data: errors.length ? undefined : data, errors };
}

export function parseThemeConfig(text: string) {
  try {
    return validateThemeConfig(JSON.parse(text));
  } catch {
    return { valid: false, errors: ['JSON 解析失败，请检查逗号、引号和对象结构。'] };
  }
}
