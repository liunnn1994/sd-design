<template>
  <ResizeObserver @resize="syncMeasurement">
    <Tooltip v-if="enableTooltip" v-bind="tooltipBindings" :disabled="tooltipDisabled">
      <component
        :is="componentTag"
        ref="triggerRef"
        data-part="root"
        v-bind="$attrs"
        :class="rootCls"
        :style="rootStyle"
        :title="nativeTitle"
        :role="buttonRole"
        :tabindex="buttonTabIndex"
        :aria-expanded="ariaExpanded"
        @click="handleClick"
        @keydown="handleKeydown"
      >
        <slot v-if="isLineClamp" />
        <span v-else :class="`${prefixCls}-content`"><slot /></span>
        <RichLineClamp
          data-ellipsis-measure
          aria-hidden="true"
          :html="measurementHtml"
          :max-lines="maxLines"
          :style="measurementStyle"
          @clampchange="handleClampChange"
        />
      </component>
      <template #content>
        <slot name="tooltip"><slot /></slot>
      </template>
    </Tooltip>

    <component
      :is="componentTag"
      v-else
      ref="triggerRef"
      data-part="root"
      v-bind="$attrs"
      :class="rootCls"
      :style="rootStyle"
      :title="nativeTitle"
      :role="buttonRole"
      :tabindex="buttonTabIndex"
      :aria-expanded="ariaExpanded"
      @click="handleClick"
      @keydown="handleKeydown"
    >
      <slot v-if="isLineClamp" />
      <span v-else :class="`${prefixCls}-content`"><slot /></span>
      <RichLineClamp
        data-ellipsis-measure
        aria-hidden="true"
        :html="measurementHtml"
        :max-lines="maxLines"
        :style="measurementStyle"
        @clampchange="handleClampChange"
      />
    </component>
  </ResizeObserver>
</template>

<script setup lang="ts">
  import type { CSSProperties, PropType, VNode } from 'vue';
  import { computed, nextTick, onMounted, onUpdated, shallowRef, watch } from 'vue';

  import type { EllipsisTooltipProps } from './interface';

  import ResizeObserver from '../_components/resize-observer-v2';
  import { getPrefixCls } from '../_utils/global-config';
  import { isObject } from '../_utils/is';
  import { RichLineClamp } from '../clamp';
  import Tooltip from '../tooltip';

  defineOptions({ name: 'Ellipsis', inheritAttrs: false });

  const props = defineProps({
    /** @zh 最大显示行数。不传时为单行省略。 @en Maximum displayed lines. */
    lineClamp: { type: [Number, String] as PropType<number | string>, default: undefined },
    /** @zh 展开的触发方式 @en Trigger mode for expansion */
    expandTrigger: { type: String as PropType<'click'>, default: undefined },
    /** @zh 省略时是否展示提示。 @en Whether to show a tooltip when clamped. */
    tooltip: {
      type: [Boolean, Object] as PropType<boolean | EllipsisTooltipProps>,
      default: true,
    },
  });
  defineSlots<{
    /** @zh 默认内容 @en Default content */
    default?: () => VNode[];
    /** @zh 自定义提示内容 @en Custom tooltip content */
    tooltip?: () => VNode[];
  }>();

  const prefixCls = getPrefixCls('ellipsis');
  const triggerRef = shallowRef<HTMLElement>();
  const text = shallowRef('');
  const measurementHtml = shallowRef('');
  const measurementWidth = shallowRef(0);
  const measurementPadding = shallowRef('0');
  const isEllipsis = shallowRef(false);
  const expanded = shallowRef(false);

  const isLineClamp = computed(() => props.lineClamp !== undefined);
  const componentTag = computed(() => (isLineClamp.value ? 'div' : 'span'));
  const maxLines = computed(() => {
    if (props.lineClamp === undefined) return 1;
    const value = Number(props.lineClamp);
    return Number.isFinite(value) && value > 0 ? value : 1;
  });
  const tooltipConfig = computed<EllipsisTooltipProps>(() =>
    isObject(props.tooltip) ? props.tooltip : {},
  );
  const tooltipBindings = computed(() => {
    const { disabled: _disabled, ...rest } = tooltipConfig.value;
    return rest;
  });
  const enableTooltip = computed(() => props.tooltip !== false);
  const tooltipDisabled = computed(
    () => !isEllipsis.value || expanded.value || Boolean(tooltipConfig.value.disabled),
  );
  const isExpandable = computed(
    () => props.expandTrigger === 'click' && (isEllipsis.value || expanded.value),
  );
  const rootCls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}--single-line`]: !isLineClamp.value && !expanded.value,
      [`${prefixCls}--line-clamp`]: isLineClamp.value,
      [`${prefixCls}--expandable`]: isExpandable.value,
      [`${prefixCls}--expanded`]: expanded.value,
    },
  ]);
  const rootStyle = computed<CSSProperties>(() => {
    if (isLineClamp.value) {
      return expanded.value
        ? {
            overflow: 'visible',
            textOverflow: 'clip',
            display: 'block',
            whiteSpace: 'normal',
            WebkitLineClamp: 'unset',
            WebkitBoxOrient: 'vertical',
          }
        : {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            whiteSpace: 'normal',
            WebkitLineClamp: String(maxLines.value),
            WebkitBoxOrient: 'vertical',
          };
    }
    return expanded.value
      ? { overflow: 'visible', textOverflow: 'clip', whiteSpace: 'normal' }
      : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
  });
  const measurementStyle = computed<CSSProperties>(() => ({
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: -1,
    boxSizing: 'border-box',
    width: `${measurementWidth.value}px`,
    padding: measurementPadding.value,
    margin: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'normal',
  }));
  const nativeTitle = computed(() =>
    !expanded.value && (!enableTooltip.value || tooltipConfig.value.disabled) && isEllipsis.value
      ? text.value
      : undefined,
  );
  const buttonRole = computed(() => (isExpandable.value ? 'button' : undefined));
  const buttonTabIndex = computed(() => (isExpandable.value ? 0 : undefined));
  const ariaExpanded = computed(() =>
    props.expandTrigger === 'click' ? String(expanded.value) : undefined,
  );

  function syncMeasurement() {
    const triggerElement = triggerRef.value;
    if (!triggerElement) return;

    const clone = triggerElement.cloneNode(true) as HTMLElement;
    clone.querySelector('[data-ellipsis-measure]')?.remove();
    const nextHtml = clone.innerHTML;
    const nextText = clone.textContent?.trim() ?? '';
    const computedStyle = window.getComputedStyle(triggerElement);
    const nextPadding = `${computedStyle.paddingTop} ${computedStyle.paddingRight} ${computedStyle.paddingBottom} ${computedStyle.paddingLeft}`;

    if (nextHtml !== measurementHtml.value) measurementHtml.value = nextHtml;
    if (nextText !== text.value) text.value = nextText;
    if (triggerElement.clientWidth !== measurementWidth.value) {
      measurementWidth.value = triggerElement.clientWidth;
    }
    if (nextPadding !== measurementPadding.value) measurementPadding.value = nextPadding;
  }

  function handleClampChange(clamped: boolean) {
    isEllipsis.value = clamped;
  }

  function handleClick() {
    if (props.expandTrigger === 'click' && (isEllipsis.value || expanded.value)) {
      expanded.value = !expanded.value;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (isExpandable.value && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  }

  watch(
    () => props.lineClamp,
    () => {
      expanded.value = false;
      void nextTick(syncMeasurement);
    },
  );
  onMounted(() => void nextTick(syncMeasurement));
  onUpdated(() => void nextTick(syncMeasurement));

  defineExpose({
    triggerRef,
    get triggerElement() {
      return triggerRef.value;
    },
  });
</script>
