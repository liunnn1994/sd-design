import { computed, useAttrs } from 'vue';

import type { MarkdownRenderEmits } from '../types';

type ClickHandler = (...args: MarkdownRenderEmits['click']) => void;
type MouseHandler = (...args: MarkdownRenderEmits['mouseover']) => void;

/**
 * 转发节点级的鼠标委托，不把内部回调落成 DOM 属性。
 *
 * 上游有两种委托路径，互斥，因此不会重复转发：
 * - 普通模式：委托绑定在渲染器根容器上，靠冒泡到达节点，节点 attrs 中没有这些回调；
 * - fragment 模式（`renderAsFragment`）：根容器不渲染，委托改由节点组件自己转发。
 *
 * 所以本 hook 在普通模式取到的是空值，在 fragment 模式才真正生效；
 * 两种模式的端到端行为都由测试覆盖。
 *
 * 事件签名取自 SD 自己的事件契约而非 Vue 的 `HTMLAttributes`：Vue 3.5 的
 * `onClick` 是 `PointerEvent`，而 SD 组件普遍声明 `MouseEvent`，
 * `strictFunctionTypes` 下窄参无法赋给宽参。
 */
export function useNodeEvents() {
  const attrs = useAttrs();
  return computed(() => ({
    onClick: attrs.onClick as ClickHandler | undefined,
    onMouseover: attrs.onMouseover as MouseHandler | undefined,
    onMouseout: attrs.onMouseout as MouseHandler | undefined,
  }));
}
