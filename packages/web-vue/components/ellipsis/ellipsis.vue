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

  // 等待 RichLineClamp 首次完成测量（收到带真实测量内容的 clampchange），
  // 供 PerformantEllipsis 激活后回放交互前等待测量稳定。
  // 测量副本以 measurementHtml 为 key：内容变化时强制重建一次测量组件，
  // 保证每次内容变化都触发全新的 clampchange（不依赖 vue-clamp 对同尺寸
  // 文本变更的内部重算判定）。
  let measurementSettled = false;
  let measurementTimer = 0;
  let measurementWaiters: Array<() => void> = [];

  function flushMeasurementWaiters() {
    measurementSettled = true;
    window.clearTimeout(measurementTimer);
    const waiters = measurementWaiters;
    measurementWaiters = [];
    waiters.forEach((resolve) => resolve());
  }

  function handleClampChange(clamped: boolean) {
    isEllipsis.value = clamped;
    // setup 期的 immediate clampchange 到达时测量副本还是空内容，不能视为测量完成；
    // 只有携带真实测量内容（measurementHtml 已同步）的 clampchange 才算测量稳定。
    if (!measurementSettled && measurementHtml.value !== '') {
      flushMeasurementWaiters();
    }
  }

  function waitForMeasurement(): Promise<void> {
    if (measurementSettled) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      measurementWaiters.push(resolve);
    });
  }

  // 点击来源为内部交互元素（链接/按钮/输入框等）时不触发展开，交还给元素自身的默认行为。
  // 注意根元素自身可展开时会带 role="button"，因此命中后还需确认是根元素的内部后代而非根元素本身。
  const INTERACTIVE_SELECTOR = 'a,button,input,textarea,select,[role="button"]';

  function handleClick(event?: MouseEvent) {
    if (props.expandTrigger !== 'click') {
      return;
    }
    const triggerElement = triggerRef.value;
    const target = event?.target;
    const interactiveElement =
      target instanceof Element ? target.closest(INTERACTIVE_SELECTOR) : null;
    if (
      interactiveElement &&
      triggerElement &&
      interactiveElement !== triggerElement &&
      triggerElement.contains(interactiveElement)
    ) {
      return;
    }
    if (isEllipsis.value || expanded.value) {
      expanded.value = !expanded.value;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    const target = event.target;
    const interactiveElement =
      target instanceof Element ? target.closest(INTERACTIVE_SELECTOR) : null;
    if (interactiveElement && interactiveElement !== triggerRef.value) return;
    if (isExpandable.value && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  }

  watch(triggerRef, (element, _previous, onCleanup) => {
    if (!element) return;
    const observer = new MutationObserver(syncMeasurement);
    observer.observe(element, { childList: true, subtree: true, characterData: true });
    onCleanup(() => observer.disconnect());
  });
  watch(
    () => props.lineClamp,
    () => {
      expanded.value = false;
      void nextTick(syncMeasurement);
    },
  );
  onMounted(() => {
    void nextTick(syncMeasurement);
    // 内容未被截断时 RichLineClamp 的 isClamped 不再变化、clampchange 不会再次触发，
    // 用短超时兜底，保证 waitForMeasurement 的等待方不会永久挂起。
    measurementTimer = window.setTimeout(flushMeasurementWaiters, 200);
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
