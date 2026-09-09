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

  import type { EllipsisTooltipProps } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import Ellipsis from './ellipsis.vue';

  defineOptions({ name: 'PerformantEllipsis', inheritAttrs: false });

  const props = defineProps({
    /** @zh 最大显示行数。不传时为单行省略。 @en Maximum displayed lines. */
    lineClamp: { type: [Number, String] as PropType<number | string>, default: undefined },
    /** @zh 展开的触发方式 @en Trigger mode for expansion */
    expandTrigger: { type: String as PropType<'click'>, default: undefined },
    /** @zh 省略时是否展示提示。可传入 Tooltip 属性。 @en Whether to show a tooltip when ellipsis is active. */
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

  const rootCls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}--single-line`]: !isLineClamp.value,
      [`${prefixCls}--line-clamp`]: isLineClamp.value,
      [`${prefixCls}--expandable`]: props.expandTrigger === 'click',
    },
  ]);

  const rootStyle = computed<CSSProperties>(() => {
    if (isLineClamp.value) {
      return {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        whiteSpace: 'normal',
        WebkitLineClamp: String(props.lineClamp),
        WebkitBoxOrient: 'vertical',
      };
    }

    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
  });

  const getActivatedTriggerElement = () => ellipsisRef.value?.triggerElement;

  const replayInteraction = (type?: 'hover' | 'focus' | 'click') => {
    const triggerElement = getActivatedTriggerElement();
    if (!triggerElement || !type) {
      return;
    }

    if (type === 'hover') {
      triggerElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      triggerElement.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
      return;
    }

    if (type === 'focus') {
      triggerElement.focus();
      return;
    }

    ellipsisRef.value?.toggleExpanded?.();
  };

  const activate = async (interactionType?: 'hover' | 'focus' | 'click') => {
    if (activated.value) {
      return;
    }

    activated.value = true;
    await nextTick();
    await nextTick();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    // 等 RichLineClamp 首次测量稳定（带真实内容的 clampchange 到达）后再回放交互，
    // 否则 hover 的 tooltip / click 的展开判定会读到未就绪的 clamp 状态。
    const measurement = ellipsisRef.value?.waitForMeasurement?.();
    if (measurement) {
      await measurement;
    }

    replayInteraction(interactionType);
  };

  const handleMouseenter = () => {
    void activate('hover');
  };

  const handleFocus = () => {
    void activate('focus');
  };

  const handleClick = (event: MouseEvent) => {
    const target = event.target;
    const interactive =
      target instanceof Element
        ? target.closest('a,button,input,textarea,select,[role="button"]')
        : null;
    const isInnerControl = interactive && interactive !== event.currentTarget;
    void activate(props.expandTrigger === 'click' && !isInnerControl ? 'click' : undefined);
  };
</script>
