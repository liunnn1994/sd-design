import { ref, reactive, inject, computed } from 'vue';

import { createLocaleRegistry, createLocaleTranslator } from '@sdata/web-core/locale/foundation';

import type { SdI18nMessages, SdLang } from './interface';

import { configProviderInjectionKey } from '../config-provider/context';
import { DEFAULT_LOCALE } from './constant';
import zhCN from './lang/zh-cn';

export { DEFAULT_LOCALE, DEFAULT_LOCALE_KEY } from './constant';

const LOCALE = ref(DEFAULT_LOCALE);
const I18N_MESSAGES = reactive(new Map<string, SdLang>([[DEFAULT_LOCALE, zhCN]]));
const registry = createLocaleRegistry(
  {
    get messages() {
      return I18N_MESSAGES;
    },
    get locale() {
      return LOCALE.value;
    },
    set locale(value) {
      LOCALE.value = value;
    },
  },
  (message) => {
    // oxlint-disable-next-line no-console
    console.warn(message);
  },
);

/**
 * 添加地区语言包。添加过后的语言包可以通过 `useLocale` 使用
 * @param messages 需要添加的地区语言数据
 * @param options
 */
export const addI18nMessages = (
  messages: SdI18nMessages,
  options?: {
    overwrite?: boolean;
  },
) => {
  registry.addI18nMessages(messages, options);
};

/**
 * 切换地区语言。仅在未提供ConfigProvider时生效。
 * @param locale
 */
export const useLocale = (locale: string) => {
  registry.useLocale(locale);
};

/**
 * 获取当前的地区语言
 */
export const getLocale = () => {
  return registry.getLocale();
};

// 仅内部使用
export const useI18n = () => {
  const configProvider = inject(configProviderInjectionKey, undefined);
  const i18nMessage = computed<SdLang>(() => registry.getMessage(configProvider?.locale));
  const locale = computed(() => i18nMessage.value.locale);

  const transform = createLocaleTranslator({
    get message() {
      return i18nMessage.value;
    },
    get fallback() {
      return I18N_MESSAGES.get(DEFAULT_LOCALE);
    },
  });
  return {
    i18nMessage,
    locale,
    t: transform,
  };
};
