import type { CustomComponents, NodeRendererProps } from 'markstream-vue';

import type { App, ComputedRef, InjectionKey, Ref } from 'vue';
import { computed, getCurrentInstance, inject, provide, unref } from 'vue';

import { getCustomNodeComponents, VueRendererMarkdown } from 'markstream-vue';

/** 仅承载 SD 适配层需要转交的上游渲染配置。 */
export const markdownContextKey: InjectionKey<ComputedRef<NodeRendererProps>> =
  Symbol('sdMarkdownContext');

/**
 * 把上游公开插件的 `app.provide` 桥接为当前组件的 `provide`，
 * 不注册全局组件、不写入全局映射，也不创建临时 custom-id。
 *
 * 依赖 markstream-vue@2.0.13 的三条实现细节，任一条变化都会让默认节点映射静默失效：
 * 1. `VueRendererMarkdown.install` 无条件调用 `app.component` 注册全部内置节点组件——
 *    这里必须吞掉该调用，否则会把约 40 个上游组件写进调用方的 app；
 * 2. 它只在 `options.components` 存在时通过 `app.provide` 下发节点映射；
 * 3. 注入值是 `ComputedRef`，并会被上游的键别名展开函数消费。
 * 下方在 dev 下对第 2 条做显式告警，升级上游时必须复核。
 */
export function provideMarkdownComponents(
  defaults: Partial<CustomComponents>,
  customId: () => string | undefined,
) {
  const app = getCurrentInstance()!.appContext.app;
  let providedLocally = false;
  const localApp = new Proxy(app, {
    get(target, key, receiver) {
      if (key === 'component') return () => localApp;
      if (key === 'provide')
        return (injectionKey: InjectionKey<unknown>) => {
          providedLocally = true;
          const parent = inject(
            injectionKey as InjectionKey<Ref<Partial<CustomComponents>>>,
            undefined,
          );
          provide(
            injectionKey,
            computed(() => ({
              ...defaults,
              ...unref(parent),
              ...getCustomNodeComponents(customId()),
            })),
          );
          return localApp;
        };
      return Reflect.get(target, key, receiver);
    },
  }) as App;
  if (typeof VueRendererMarkdown.install === 'function') {
    VueRendererMarkdown.install(localApp, { components: defaults });
  }
  if (import.meta.env.DEV && !providedLocally) {
    // oxlint-disable-next-line no-console -- dev-only 升级告警
    console.warn(
      '[sd-markdown-render] markstream-vue 的插件注册接口已变化，SD 默认节点映射可能未生效；请复核 components/markdown-render/context.ts 的耦合说明。',
    );
  }
}
