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
        :title="$attrs.title ?? nativeTitle"
        :role="buttonRole"
        :tabindex="buttonTabIndex"
        :aria-expanded="ariaExpanded"
        @click="handleClick"
        @keydown="handleKeydown"
      >
        <slot v-if="isLineClamp" />
        <span v-else :class="`${prefixCls}-content`"><slot /></span>
        <RichLineClamp
          :key="measurementHtml"
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
      :title="$attrs.title ?? nativeTitle"
      :role="buttonRole"
      :tabindex="buttonTabIndex"
      :aria-expanded="ariaExpanded"
      @click="handleClick"
      @keydown="handleKeydown"
    >
      <slot v-if="isLineClamp" />
      <span v-else :class="`${prefixCls}-content`"><slot /></span>
      <RichLineClamp
        :key="measurementHtml"
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
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    onUpdated,
    shallowRef,
    watch,
  } from 'vue';

  import {
    resolveEllipsisMaxLines,
    getEllipsisRootStyle,
    getEllipsisMeasurementStyle,
  } from '@sdata/web-core/ellipsis/data';
  import { createEllipsisFoundation } from '@sdata/web-core/ellipsis/foundation';

  import type { EllipsisTooltipProps } from './interface';

  import ResizeObserver from '../_components/resize-observer-v2';
  import { getPrefixCls } from '../_utils/global-config';
  import { isObject } from '../_utils/is';
  import { RichLineClamp } from '../clamp';
  import Tooltip from '../tooltip';

  defineOptions({ name: 'Ellipsis', inheritAttrs: false });

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
     * @zh 省略时是否展示提示。
     * @en Whether to show a tooltip when clamped.
     */
    tooltip: {
      type: [Boolean, Object] as PropType<boolean | EllipsisTooltipProps>,
      default: true,
    },
  });
  defineSlots<{
    /**
     * @zh 默认内容
     * @en Default content
     */
    default?: () => VNode[];
    /**
     * @zh 自定义提示内容
     * @en Custom tooltip content
     */
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
  const maxLines = computed(() => resolveEllipsisMaxLines(props.lineClamp));
  const tooltipConfig = computed<EllipsisTooltipProps>(() =>
    isObject(props.tooltip) ? props.tooltip : {},
  );
  const tooltipBindings = computed(() => {
    const { always: _always, disabled: _disabled, ...rest } = tooltipConfig.value;
    return rest;
  });
  const enableTooltip = computed(() => props.tooltip !== false);
  const tooltipDisabled = computed(() => foundation.getTooltipDisabled());
  const isExpandable = computed(() => foundation.isExpandable());
  const rootCls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}--single-line`]: !isLineClamp.value && !expanded.value,
      [`${prefixCls}--line-clamp`]: isLineClamp.value,
      [`${prefixCls}--expandable`]: isExpandable.value,
      [`${prefixCls}--expanded`]: expanded.value,
    },
  ]);
  const rootStyle = computed<CSSProperties>(() =>
    getEllipsisRootStyle(isLineClamp.value, expanded.value, () => maxLines.value),
  );
  const measurementStyle = computed<CSSProperties>(() =>
    getEllipsisMeasurementStyle(measurementWidth.value, measurementPadding.value),
  );
  const nativeTitle = computed(() => foundation.getNativeTitle());
  const buttonRole = computed(() => (isExpandable.value ? 'button' : undefined));
  const buttonTabIndex = computed(() => (isExpandable.value ? 0 : undefined));
  const ariaExpanded = computed(() =>
    props.expandTrigger === 'click' ? String(expanded.value) : undefined,
  );

  const foundation = createEllipsisFoundation({
    get triggerElement() {
      return triggerRef.value;
    },
    get expandTrigger() {
      return props.expandTrigger;
    },
    get tooltipConfig() {
      return tooltipConfig.value;
    },
    get enableTooltip() {
      return enableTooltip.value;
    },
    get measurementHtml() {
      return measurementHtml.value;
    },
    set measurementHtml(value) {
      measurementHtml.value = value;
    },
    get measurementWidth() {
      return measurementWidth.value;
    },
    set measurementWidth(value) {
      measurementWidth.value = value;
    },
    get measurementPadding() {
      return measurementPadding.value;
    },
    set measurementPadding(value) {
      measurementPadding.value = value;
    },
    get text() {
      return text.value;
    },
    set text(value) {
      text.value = value;
    },
    get isEllipsis() {
      return isEllipsis.value;
    },
    set isEllipsis(value) {
      isEllipsis.value = value;
    },
    get expanded() {
      return expanded.value;
    },
    set expanded(value) {
      expanded.value = value;
    },
  });
  const {
    syncMeasurement,
    flushMeasurementWaiters,
    handleClampChange,
    waitForMeasurement,
    handleClick,
    handleKeydown,
  } = foundation;

  watch(triggerRef, (element, _previous, onCleanup) => {
    const stop = foundation.observeTrigger(element);
    if (stop) onCleanup(stop);
  });
  watch(
    () => props.lineClamp,
    () => {
      foundation.resetExpanded();
      void nextTick(syncMeasurement);
    },
  );
  onMounted(() => {
    void nextTick(syncMeasurement);
    // 内容未被截断时 RichLineClamp 的 isClamped 不再变化、clampchange 不会再次触发，
    // 用短超时兜底，保证 waitForMeasurement 的等待方不会永久挂起。
    foundation.startMeasurementFallback();
  });
  onBeforeUnmount(flushMeasurementWaiters);
  onUpdated(() => void nextTick(syncMeasurement));

  defineExpose({
    triggerRef,
    waitForMeasurement,
    toggleExpanded: handleClick,
    get triggerElement() {
      return triggerRef.value;
    },
  });
</script>
