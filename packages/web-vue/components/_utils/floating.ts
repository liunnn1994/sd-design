import type { UseFloatingOptions } from '@floating-ui/vue';
import type { Simplify } from 'type-fest';

import type { Raw } from 'vue';

/**
 * Floating UI Vue 的完整定位配置。
 *
 * 直接继承上游 `UseFloatingOptions`，组件库内不重复维护任何字段——Floating UI
 * 新增的 options 自动可用。外层套 `Raw<>` 是有意为之：`UseFloatingOptions` 的每个
 * 字段都是 `MaybeReadonlyRefOrGetter<…>`（值 / `Ref` / getter 的联合），若直接当作
 * Vue prop 类型使用，Vue 的类型系统会对联合里的 `Ref` 做深解包，破坏上游契约；
 * `Raw<>` 把它当作不透明类型原样透传，既保留运行时透传，又让 TypeScript 直接继承。
 */
export type FloatingOptions = Raw<UseFloatingOptions>;

/**
 * 为锚点浮层组件增加 Floating UI 配置。
 */
export type WithFloatingOptions<T> = Simplify<
  T & {
    floatingOptions?: FloatingOptions;
  }
>;

/**
 * 构造一个 Floating UI options 对象：原样转发 `getUserOptions()` 返回的上游配置，
 * 仅当调用方未提供某字段时，用 `defaults` 里的组件默认值兜底（用户字段优先）。
 *
 * 返回的是一个 Proxy 而非一次性合并后的普通对象，目的是：
 *  - `defaults` 与用户配置里传入的 `Ref` / getter / `ComputedRef` 保持响应式——
 *    Floating UI 内部用 `toValue()` 解包，每次访问都会读到最新值；
 *  - 用户在运行时整体替换 `floatingOptions` 对象时，下一次属性访问会懒加载到新值。
 *
 * 这里实现了 `get` 之外的全部相关 trap（`has` / `ownKeys` /
 * `getOwnPropertyDescriptor`），使 `{...options}`、`Object.keys(options)`、
 * `'x' in options` 等操作和直接读属性的表现一致——即便上游某天改为整体解构配置，
 * 用户字段也不会静默丢失。当前 Floating UI 只做具名属性读取，这些 trap 属于
 * 面向未来的鲁棒性兜底。
 */
export function createFloatingOptions(
  getUserOptions: () => FloatingOptions | undefined,
  defaults: Readonly<Record<string, unknown>>,
): FloatingOptions {
  const defaultKeys = Object.keys(defaults);

  const resolve = (key: string): { exists: boolean; value: unknown } => {
    // `getUserOptions()` 返回强类型的 `FloatingOptions`（无字符串索引签名），但这里需要
    // 做任意键的动态查找/枚举，因此按 `Record<string, unknown>` 处理。
    const user = getUserOptions() as Record<string, unknown> | undefined;
    if (user && key in user) {
      return { exists: true, value: user[key] };
    }
    if (key in defaults) {
      return { exists: true, value: defaults[key] };
    }
    return { exists: false, value: undefined };
  };

  return new Proxy({} as FloatingOptions, {
    get: (_target, key) => resolve(String(key)).value,
    has: (_target, key) => resolve(String(key)).exists,
    ownKeys: () => {
      const user = getUserOptions();
      return Array.from(new Set([...defaultKeys, ...Object.keys(user ?? {})]));
    },
    getOwnPropertyDescriptor: (_target, key) => {
      const result = resolve(String(key));
      if (!result.exists) {
        return undefined;
      }
      return {
        configurable: true,
        enumerable: true,
        writable: true,
        value: result.value,
      };
    },
  });
}
