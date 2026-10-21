import type { App } from 'vue';
import { getCurrentInstance, inject, ref } from 'vue';

import {
  getComponentPrefix as getFoundationComponentPrefix,
  resolvePrefixCls,
} from '@sdata/web-core/config/prefix';

import type { SDOptions } from './types';

import { configProviderInjectionKey } from '../config-provider/context';

const GLOBAL_CONFIG_NAME = '$sd';

// 模块级 classPrefix ref：让 computed() 内的 getPrefixCls 调用也能响应运行时前缀变更。
// 注意两点限制：
// 1. 依赖 ConfigProvider 注入的子树内前缀仍只能在 setup 期确定（inject 无法在 computed 中调用），
//    这类调用点保持静态；
// 2. ref 是模块级的，多次 install 不同前缀时“最后安装的生效”。
const globalClassPrefix = ref<string | undefined>(undefined);

export const getComponentPrefix = (options?: SDOptions) => {
  return getFoundationComponentPrefix(options);
};

export const setGlobalConfig = (app: App, options?: SDOptions): void => {
  if (options?.classPrefix) {
    globalClassPrefix.value = options.classPrefix;
    app.config.globalProperties[GLOBAL_CONFIG_NAME] = {
      ...app.config.globalProperties[GLOBAL_CONFIG_NAME],
      classPrefix: options.classPrefix,
    };
  }
};

export const getPrefixCls = (componentName?: string): string => {
  // inject 只能在 setup 期调用：computed() 的惰性求值可能发生在 setup 之外，
  // 此时 getCurrentInstance() 为空，跳过注入读取以避免 inject 告警。
  const instance = getCurrentInstance();
  const configProvider = instance ? inject(configProviderInjectionKey, undefined) : undefined;

  return resolvePrefixCls(componentName, {
    get providerPrefix() {
      return configProvider?.prefixCls;
    },
    get globalPrefix() {
      return globalClassPrefix.value;
    },
    get appPrefix() {
      return instance?.appContext.config.globalProperties[GLOBAL_CONFIG_NAME]?.classPrefix;
    },
  });
};

/**
 * 生成带组件库前缀的 CSS 变量名
 * @example getCssVarToken('--color-text-2') // type: '--sd-color-text-2'
 * @example getCssVarToken('color-text-2')   // type: '--sd-color-text-2'
 */
export { getCssVarToken } from '@sdata/web-core/config/prefix';
