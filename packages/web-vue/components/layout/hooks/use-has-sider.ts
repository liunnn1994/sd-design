import { computed, type ComputedRef, type Ref, type VNode } from 'vue';

const SIDER_COMPONENT_NAME = 'LayoutSider';

/**
 * @zh 递归判断 VNode 列表中是否存在 Sider 组件
 * @en Recursively detect whether a Sider component exists in the VNode list
 */
function hasSiderInVNodes(vnodes: VNode[] | undefined): boolean {
  if (!vnodes) {
    return false;
  }

  for (const vnode of vnodes) {
    if (!vnode) {
      continue;
    }

    const { type } = vnode;
    if (
      type &&
      typeof type === 'object' &&
      'name' in type &&
      (type as { name?: string }).name === SIDER_COMPONENT_NAME
    ) {
      return true;
    }

    const { children } = vnode;
    if (Array.isArray(children) && hasSiderInVNodes(children as VNode[])) {
      return true;
    }
  }

  return false;
}

/**
 * @zh 计算当前 Layout 是否包含 Sider，对齐 antd useHasSider 的优先级：
 *     1. hasSider 为布尔值时直接采用；
 *     2. 已有 Sider 通过上下文注册时为 true；
 *     3. 否则回退到对默认插槽的静态扫描。
 * @en Compute whether the current Layout contains a Sider, aligned with antd
 *     useHasSider precedence:
 *     1. use hasSider when it is a boolean;
 *     2. true when any Sider has registered via context;
 *     3. otherwise fallback to static scan of the default slot.
 */
export function useHasSider(
  siders: Ref<string[]>,
  slotVNodes: ComputedRef<VNode[] | undefined>,
  hasSider: Ref<boolean | undefined>,
): ComputedRef<boolean> {
  return computed(() => {
    if (typeof hasSider.value === 'boolean') {
      return hasSider.value;
    }

    if (siders.value.length > 0) {
      return true;
    }

    return hasSiderInVNodes(slotVNodes.value);
  });
}
