import type { App } from 'vue';
import { getCurrentInstance, inject } from 'vue';

import type { SDOptions } from './types';

import { configProviderInjectionKey } from '../config-provider/context';

const COMPONENT_PREFIX = 'A';
const CLASS_PREFIX = 'sd';
const GLOBAL_CONFIG_NAME = '$sd';

export const getComponentPrefix = (options?: SDOptions) => {
  return options?.componentPrefix ?? COMPONENT_PREFIX;
};

export const setGlobalConfig = (app: App, options?: SDOptions): void => {
  if (options?.classPrefix) {
    app.config.globalProperties[GLOBAL_CONFIG_NAME] = {
      ...(app.config.globalProperties[GLOBAL_CONFIG_NAME] ?? {}),
      classPrefix: options.classPrefix,
    };
  }
};

export const getPrefixCls = (componentName?: string): string => {
  const instance = getCurrentInstance();
  const configProvider = inject(configProviderInjectionKey, undefined);

  const prefix =
    configProvider?.prefixCls ??
    instance?.appContext.config.globalProperties[GLOBAL_CONFIG_NAME]?.classPrefix ??
    CLASS_PREFIX;
  if (componentName) {
    return `${prefix}-${componentName}`;
  }
  return prefix;
};
