<template>
  <div ref="rootRef" :class="classNames" :style="rootStyle">
    <slot />
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUpdate, onUpdated, ref } from 'vue';

  import type { PanelTransition } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { injectParentPanelGroup, providePanelGroup } from './context';
  import { createEngineGroup } from './core/group';
  import { reorder as reorderAnimation } from './core/reorder';

  defineOptions({ name: 'PanelGroup' });

  /** @zh 面板与伸缩杆 @en Panels and separators */
  defineSlots<{ default?: () => unknown }>();

  const props = defineProps<{
    /**
     * @zh 面板排列方向，仅初始化时生效
     * @en Orientation, fixed at mount
     */
    orientation?: 'horizontal' | 'vertical';
    /**
     * @zh 面板重排时是否播放位移动画
     * @en Play FLIP animation when panels reorder
     */
    reorder?: boolean;
    /**
     * @zh 重排动画的过渡配置（毫秒）
     * @en Transition for reorder animations (milliseconds)
     */
    transition?: PanelTransition;
  }>();

  // orientation 为挂载时确定的初始值（与 vendor 一致，不响应运行时变更）
  // inject 必须在 provide 之前：否则会注入到自己提供的值，嵌套判定永远为真
  const parentGroup = injectParentPanelGroup();
  const group = createEngineGroup(props.orientation ?? 'horizontal');
  providePanelGroup(group);
  const rootRef = ref<HTMLElement>();
  const prefixCls = getPrefixCls('panel-group');
  const classNames = computed(() => [prefixCls]);

  const rootStyle = computed(() => ({
    display: 'flex',
    flexDirection: group.axes.direction,
    height: '100%',
    width: '100%',
    overflow: parentGroup ? undefined : 'clip',
  }));

  // 重排动画（FLIP）：更新前测量子面板位置，更新后播放位移动画
  let beforeBoxes: Map<Element, number> | null = null;

  onBeforeUpdate(() => {
    if (props.reorder !== false && rootRef.value) {
      beforeBoxes = reorderAnimation.measure(rootRef.value, group.axes);
    }
  });

  onUpdated(() => {
    const boxes = beforeBoxes;
    beforeBoxes = null;
    if (boxes) {
      reorderAnimation.play(boxes, group.axes, props.transition);
    }
    // 面板重排时，有尺寸面板的邻居关系需要重新判定
    group.notify();
  });
</script>
