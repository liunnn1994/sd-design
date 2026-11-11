import type { SdLang } from '@sdata/web-core/locale/types';

import { DEFAULT_LOCALE } from '@sdata/web-core/locale/constant';
import { createLocaleRegistry, createLocaleTranslator } from '@sdata/web-core/locale/foundation';
import zhCN from '@sdata/web-core/locale/lang/zh-cn';
import { useSyncExternalStore } from 'react';

import { useConfig } from '../config-provider/index.js';

export { DEFAULT_LOCALE, DEFAULT_LOCALE_KEY } from '@sdata/web-core/locale/constant';
export type { SdLang } from '@sdata/web-core/locale/types';

const state = {
  messages: new Map<string, SdLang>([[DEFAULT_LOCALE, zhCN]]),
  locale: DEFAULT_LOCALE,
};
const registry = createLocaleRegistry(state, (message) => console.warn(message));
const listeners = new Set<() => void>();
let version = 0;
const notify = () => {
  version++;
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const snapshot = () => version;

export function addI18nMessages(
  messages: Record<string, SdLang>,
  options?: { overwrite?: boolean },
) {
  registry.addI18nMessages(messages, options);
  notify();
}

/** 与 Vue 一致的命令式全局语言切换接口。 */
export function useLocale(locale: string) {
  registry.useLocale(locale);
  notify();
}

export const getLocale = registry.getLocale;

export function useI18n() {
  const config = useConfig();
  useSyncExternalStore(subscribe, snapshot, snapshot);
  const message = registry.getMessage(config.locale);
  return {
    locale: message.locale,
    i18nMessage: message,
    t: createLocaleTranslator({ message, fallback: state.messages.get(DEFAULT_LOCALE) }),
  };
}
