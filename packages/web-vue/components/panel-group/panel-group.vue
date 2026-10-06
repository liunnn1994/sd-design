<template>
  <component :is="component ?? 'div'" ref="rootRef" :class="classNames" :style="rootStyle">
    <slot />
  </component>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUpdate, onUpdated, ref, nextTick, watch } from 'vue';

  import type { PanelTransition } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { injectParentPanelGroup, providePanelGroup } from './context';
  import { AXES } from './core/axes';
  import { grips } from './core/grips';
  import { createEngineGroup } from './core/group';
  import { reorder as reorderAnimation } from './core/reorder';

  defineOptions({ name: 'PanelGroup' });

  /**
   * @zh 面板与伸缩杆
   * @en Panels and separators
   */
  defineSlots<{ default?: () => unknown }>();

  const props = defineProps<{
    /**
     * @zh 面板排列方向，可动态切换
     * @en Panel orientation, supports runtime changes
     */
    orientation?: 'horizontal' | 'vertical';
    /**
     * @zh 面板组的 HTML 标签
     * @en HTML tag of the panel group
     */
    component?: string;
    /**
     * @zh 禁用组内尺寸调整并隐藏伸缩杆
     * @en Disable resizing and hide separators in this group
     */
    disabled?: boolean;
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

  const emit = defineEmits<{
    /**
     * @zh 开始拖拽之前触发
     * @en Emitted before dragging starts
     */
    moveStart: [event: PointerEvent];
    /**
     * @zh 拖拽时触发
     * @en Emitted while dragging
     */
    moving: [event: PointerEvent];
    /**
     * @zh 拖拽结束后触发
     * @en Emitted after dragging ends
     */
    moveEnd: [event: PointerEvent];
  }>();

  // inject 必须在 provide 之前：否则会注入到自己提供的值，嵌套判定永远为真
  const parentGroup = injectParentPanelGroup();
  const group = createEngineGroup(props.orientation ?? 'horizontal');
  group.onMoveStart = (event) => emit('moveStart', event);
  group.onMoving = (event) => emit('moving', event);
  group.onMoveEnd = (event) => emit('moveEnd', event);
  watch(
    () => props.disabled,
    (disabled) => {
      group.disabled = !!disabled;
      if (group.disabled) {
        for (const panel of group.panels.values()) panel.drag.cancel();
      }
      group.notify();
    },
    { immediate: true, flush: 'sync' },
  );
  watch(
    () => props.orientation ?? 'horizontal',
    async (orientation) => {
      for (const panel of group.panels.values()) panel.drag.cancel();
      Object.assign(group.axes, AXES[orientation]);
      grips.invalidate();
      await nextTick();
      group.notify();
    },
  );
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
