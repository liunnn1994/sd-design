import { isString, isObject, isArray } from '../_utils/is.js';
import { DEFAULT_LOCALE } from './constant.js';

export function createLocaleRegistry<Lang>(
  state: { readonly messages: Map<string, Lang>; locale: string },
  warn: (message: string) => void,
) {
  const addI18nMessages = (messages: Record<string, Lang>, options?: { overwrite?: boolean }) => {
    for (const key of Object.keys(messages)) {
      if (!state.messages.has(key) || options?.overwrite) {
        state.messages.set(key, messages[key]);
      }
    }
  };
  const useLocale = (locale: string) => {
    if (!state.messages.has(locale)) {
      warn(`use ${locale} failed! Please add ${locale} first`);
      return;
    }
    state.locale = locale;
  };
  const getLocale = () => state.locale;
  const getMessage = (provider: Lang | undefined) =>
    provider ?? state.messages.get(state.locale) ?? state.messages.get(DEFAULT_LOCALE)!;
  return { addI18nMessages, useLocale, getLocale, getMessage };
}

export function createLocaleTranslator(state: {
  readonly message: unknown;
  readonly fallback: unknown;
}) {
  const resolveKey = (message: unknown, keyArray: string[]): string | undefined => {
    let temp: unknown = message;

    for (const keyItem of keyArray) {
      temp = isObject(temp) ? temp[keyItem] : isArray(temp) ? temp[Number(keyItem)] : undefined;
    }

    return isString(temp) ? temp : undefined;
  };

  const transform = (key: string, ...args: unknown[]): string => {
    const keyArray = key.split('.');
    const text = resolveKey(state.message, keyArray) ?? resolveKey(state.fallback, keyArray);

    if (text === undefined) {
      return key;
    }

    if (args.length > 0) {
      return text.replace(/{(\d+)}/g, (sub, index) => String(args[index] ?? sub));
    }

    return text;
  };

  return transform;
}
