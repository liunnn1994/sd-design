<template>
  <component
    :is="componentTag"
    v-if="!activated"
    :role="expandTrigger === 'click' ? 'button' : undefined"
    :tabindex="expandTrigger === 'click' ? 0 : undefined"
    :aria-expanded="expandTrigger === 'click' ? 'false' : undefined"
    v-bind="$attrs"
    :class="rootCls"
    :style="rootStyle"
    @mouseenter="handleMouseenter"
    @focus="handleFocus"
    @click="handleClick"
  >
    <slot />
  </component>

  <Ellipsis
    v-else
    ref="ellipsisRef"
    v-bind="$attrs"
    :line-clamp="lineClamp"
    :expand-trigger="expandTrigger"
    :tooltip="tooltip"
  >
    <slot />
    <template v-if="$slots.tooltip" #tooltip>
      <slot name="tooltip" />
    </template>
  </Ellipsis>
</template>

<script setup lang="ts">
  import type { CSSProperties, PropType } from 'vue';
  import { computed, nextTick, shallowRef } from 'vue';

  import { resolveEllipsisMaxLines, getEllipsisRootStyle } from '@sdata/web-core/ellipsis/data';
  import { createPerformantEllipsisFoundation } from '@sdata/web-core/ellipsis/performant';

  import type { EllipsisTooltipProps } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import Ellipsis from './ellipsis.vue';

  defineOptions({ name: 'PerformantEllipsis', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 最大显示行数。不传时为单行省略。
     * @en Maximum displayed lines.
     */
    lineClamp: { type: [Number, String] as PropType<number | string>, default: undefined },
    /**
     * @zh 展开的触发方式
     * @en Trigger mode for expansion
     */
    expandTrigger: { type: String as PropType<'click'>, default: undefined },
    /**
     * @zh 省略时是否展示提示。可传入 Tooltip 属性。
     * @en Whether to show a tooltip when ellipsis is active.
     */
    tooltip: {
      type: [Boolean, Object] as PropType<boolean | EllipsisTooltipProps>,
      default: true,
    },
  });

  /**
   * @zh 默认内容
   * @en Default content
   * @slot default
   */
  /**
   * @zh 自定义提示内容
   * @en Custom tooltip content
   * @slot tooltip
   */
  const prefixCls = getPrefixCls('ellipsis');
  interface EllipsisExposed {
    triggerElement?: HTMLElement;
    waitForMeasurement?: () => Promise<void>;
    toggleExpanded?: () => void;
  }

  const activated = shallowRef(false);
  const ellipsisRef = shallowRef<EllipsisExposed>();

  const isLineClamp = computed(() => props.lineClamp !== undefined);
  const componentTag = computed(() => (isLineClamp.value ? 'div' : 'span'));
  const maxLines = computed(() => resolveEllipsisMaxLines(props.lineClamp));

  const rootCls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}--single-line`]: !isLineClamp.value,
      [`${prefixCls}--line-clamp`]: isLineClamp.value,
      [`${prefixCls}--expandable`]: props.expandTrigger === 'click',
    },
  ]);

  const rootStyle = computed<CSSProperties>(() =>
    getEllipsisRootStyle(isLineClamp.value, false, () => maxLines.value),
  );

  const foundation = createPerformantEllipsisFoundation({
    get activated() {
      return activated.value;
    },
    set activated(value) {
      activated.value = value;
    },
    get expandTrigger() {
      return props.expandTrigger;
    },
    get triggerElement() {
      return ellipsisRef.value?.triggerElement;
    },
    afterRender: nextTick,
    waitForMeasurement: () => ellipsisRef.value?.waitForMeasurement?.(),
    toggleExpanded: () => ellipsisRef.value?.toggleExpanded?.(),
  });
  const { handleMouseenter, handleFocus, handleClick, setFocused } = foundation;

  defineExpose({ setFocused });
</script>
