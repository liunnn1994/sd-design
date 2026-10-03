import { ref, reactive, inject, computed } from 'vue';

import type { SdI18nMessages, SdLang } from './interface';

import { isString, isObject } from '../_utils/is';
import { configProviderInjectionKey } from '../config-provider/context';
import { DEFAULT_LOCALE } from './constant';
import zhCN from './lang/zh-cn';

export { DEFAULT_LOCALE, DEFAULT_LOCALE_KEY } from './constant';

const LOCALE = ref(DEFAULT_LOCALE);
const I18N_MESSAGES = reactive<SdI18nMessages>({
  [DEFAULT_LOCALE]: zhCN,
});

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
  for (const key of Object.keys(messages)) {
    if (!I18N_MESSAGES[key] || options?.overwrite) {
      I18N_MESSAGES[key] = messages[key];
    }
  }
};

/**
 * 切换地区语言。仅在未提供ConfigProvider时生效。
 * @param locale
 */
export const useLocale = (locale: string) => {
  if (!I18N_MESSAGES[locale]) {
    // oxlint-disable-next-line no-console
    console.warn(`use ${locale} failed! Please add ${locale} first`);
    return;
  }
  LOCALE.value = locale;
};

/**
 * 获取当前的地区语言
 */
export const getLocale = () => {
  return LOCALE.value;
};

// 仅内部使用
export const useI18n = () => {
  const configProvider = inject(configProviderInjectionKey, undefined);
  const i18nMessage = computed<SdLang>(
    () => configProvider?.locale ?? I18N_MESSAGES[LOCALE.value] ?? I18N_MESSAGES[DEFAULT_LOCALE],
  );
  const locale = computed(() => i18nMessage.value.locale);

  const resolveKey = (message: unknown, keyArray: string[]): string | undefined => {
    let temp: unknown = message;

    for (const keyItem of keyArray) {
      if (!isObject(temp) || !temp[keyItem]) {
        return undefined;
      }
      temp = temp[keyItem];
    }

    return isString(temp) ? temp : undefined;
  };

  const transform = (key: string, ...args: unknown[]): string => {
    const keyArray = key.split('.');
    // 使用方自建语言包可能不含组件后续新增的键（例如先接入、后升级），
    // 此时不能把原始 key 渲染到界面上，先回退到默认语言包。
    const text =
      resolveKey(i18nMessage.value, keyArray) ??
      resolveKey(I18N_MESSAGES[DEFAULT_LOCALE], keyArray);

    if (text === undefined) {
      return key;
    }

    if (args.length > 0) {
      return text.replace(/{(\d+)}/g, (sub, index) => String(args[index] ?? sub));
    }

    return text;
  };

  return {
    i18nMessage,
    locale,
    t: transform,
  };
};
