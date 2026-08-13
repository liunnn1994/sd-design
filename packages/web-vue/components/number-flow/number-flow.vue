<template>
  <span
    ref="rootRef"
    :class="classes"
    :data-number-flow-id="styleScope"
    role="img"
    :aria-label="currentData.valueAsString"
  >
    <component :is="'style'" :nonce="nonce">
      {{ dynamicStyles }}
    </component>
    <span v-if="$slots.prefix" :class="`${prefixCls}-custom-prefix`" aria-hidden="true">
      <slot name="prefix" />
    </span>
    <span :class="`${prefixCls}-content`" aria-hidden="true">
      <span
        v-for="(part, partIndex) in currentData.parts"
        :key="part.key"
        :data-number-flow-part="partIndex"
        :class="[
          `${prefixCls}-part`,
          `${prefixCls}-${part.type}`,
          { [`${prefixCls}-digit`]: part.digit !== undefined },
        ]"
      >
        <span v-if="part.digit !== undefined" :class="`${prefixCls}-digit-track`">
          <span
            v-for="digit in getDigitSequence(part)"
            :key="digit.key"
            :class="`${prefixCls}-digit-value`"
            >{{ digit.value }}</span
          >
        </span>
        <span v-else :class="`${prefixCls}-symbol`">{{ part.value }}</span>
      </span>
    </span>
    <span v-if="$slots.suffix" :class="`${prefixCls}-custom-suffix`" aria-hidden="true">
      <slot name="suffix" />
    </span>
  </span>
</template>

<script setup lang="ts">
  import {
    computed,
    inject,
    nextTick,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    useSlots,
    useTemplateRef,
    watch,
  } from 'vue';

  import type { NumberFlowData } from './formatter';
  import type { NumberFlowDigitContext, NumberFlowExposed, NumberFlowProps } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { formatNumberFlow, type NumberFlowPart } from './formatter';
  import { GROUP_KEY } from './group-key';
  import { useCanAnimate } from './use-can-animate';

  defineOptions({ name: 'NumberFlow' });

  const {
    value,
    locales,
    format,
    prefix,
    suffix,
    trend = (oldValue: number, newValue: number) => Math.sign(newValue - oldValue),
    plugins,
    animated = true,
    transformTiming = () => ({ duration: 900, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }),
    spinTiming,
    opacityTiming = () => ({ duration: 450, easing: 'ease-out' }),
    respectMotionPreference = true,
    digits,
    willChange = false,
    nonce,
  } = defineProps<NumberFlowProps>();

  defineSlots<{
    /** @zh 自定义前缀，优先于 prefix 属性 @en Custom prefix, takes precedence over prefix */
    prefix(): unknown;
    /** @zh 自定义后缀，优先于 suffix 属性 @en Custom suffix, takes precedence over suffix */
    suffix(): unknown;
  }>();

  const emit = defineEmits<{
    /** @zh 数字动画开始时触发 @en Emitted when number animations start */
    animationsstart: [];
    /** @zh 数字动画结束时触发 @en Emitted when number animations finish */
    animationsfinish: [];
  }>();

  const prefixCls = getPrefixCls('number-flow');
  const slots = useSlots();
  const rootRef = useTemplateRef<HTMLElement>('rootRef');
  const styleScope = shallowRef<string>();

  onMounted(() => {
    styleScope.value = `sd-number-flow-${crypto.randomUUID()}`;
  });

  // Cache Intl.NumberFormat — only recreates when locales or format change
  const numberFormatter = computed(() => new Intl.NumberFormat(locales, format));

  function formatData(val: number | string): NumberFlowData {
    return formatNumberFlow(
      val,
      numberFormatter.value,
      slots.prefix ? undefined : prefix,
      slots.suffix ? undefined : suffix,
    );
  }

  const previousData = shallowRef(formatData(value));
  const currentValue = computed(() => value);
  const currentData = computed(() => formatData(value));
  const animationPhase = shallowRef<'idle' | 'prepared' | 'animating'>('idle');
  const isAnimating = computed(() => animationPhase.value === 'animating');
  let animationVersion = 0;
  let finishTimer: ReturnType<typeof setTimeout> | undefined;

  const resolvedTransformTiming = computed<KeyframeAnimationOptions>(() =>
    typeof transformTiming === 'function' ? transformTiming() : transformTiming,
  );
  const resolvedOpacityTiming = computed<KeyframeAnimationOptions>(() =>
    typeof opacityTiming === 'function' ? opacityTiming() : opacityTiming,
  );

  const transformDuration = computed(() =>
    typeof resolvedTransformTiming.value.duration === 'number'
      ? resolvedTransformTiming.value.duration
      : 900,
  );
  const transformEasing = computed(
    () => resolvedTransformTiming.value.easing?.toString() ?? 'cubic-bezier(0.16, 1, 0.3, 1)',
  );

  const spinDuration = computed(() => {
    if (spinTiming && typeof spinTiming.duration === 'number') return spinTiming.duration;
    return transformDuration.value;
  });
  const spinEasing = computed(() => {
    if (spinTiming?.easing) return spinTiming.easing.toString();
    return transformEasing.value;
  });

  const opacityDuration = computed(() =>
    typeof resolvedOpacityTiming.value.duration === 'number'
      ? resolvedOpacityTiming.value.duration
      : 450,
  );

  const motionCanAnimate = useCanAnimate({
    respectMotionPreference: () => respectMotionPreference,
  });
  const canAnimate = computed(() => animated && motionCanAnimate.value);

  const computedTrend = computed(() =>
    typeof trend === 'function' ? trend(previousData.value.value, currentData.value.value) : trend,
  );

  const classes = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-animated`]: canAnimate.value,
      [`${prefixCls}-prepared`]: animationPhase.value === 'prepared',
      [`${prefixCls}-animating`]: isAnimating.value,
      [`${prefixCls}-will-change`]: willChange,
    },
  ]);

  function sanitizeDuration(duration: number) {
    return Number.isFinite(duration) && duration >= 0 ? duration : 0;
  }

  function sanitizeEasing(easing: string) {
    return /^[a-zA-Z0-9(),.\s+-]+$/.test(easing) ? easing : 'linear';
  }

  const dynamicStyles = computed(() => {
    if (!styleScope.value) return '';
    const rootSelector = `[data-number-flow-id="${styleScope.value}"]`;
    const rules = [
      `${rootSelector}{--sd-number-flow-duration:${sanitizeDuration(transformDuration.value)}ms;--sd-number-flow-easing:${sanitizeEasing(transformEasing.value)};--sd-number-flow-spin-duration:${sanitizeDuration(spinDuration.value)}ms;--sd-number-flow-spin-easing:${sanitizeEasing(spinEasing.value)};--sd-number-flow-opacity-duration:${sanitizeDuration(opacityDuration.value)}ms}`,
    ];

    currentData.value.parts.forEach((part, index) => {
      if (part.digit === undefined) return;
      const delta = getDigitDelta(part);
      const distance = Math.abs(delta);
      rules.push(
        `${rootSelector} [data-number-flow-part="${index}"]{--sd-number-flow-start:${delta < 0 ? -distance : 0};--sd-number-flow-end:${delta > 0 ? -distance : 0}}`,
      );
    });

    return rules.join('');
  });

  function getPreviousDigit(part: NumberFlowPart) {
    return (
      previousData.value.parts.find((candidate) => candidate.key === part.key)?.digit ?? part.digit!
    );
  }

  const highestChangedPosition = computed(() => {
    const previousDigits = new Map(
      previousData.value.parts
        .filter((part) => part.digit !== undefined)
        .map((part) => [part.key, part] as const),
    );
    const changedPositions = currentData.value.parts.flatMap((part) => {
      if (part.digit === undefined) return [];
      const previous = previousDigits.get(part.key);
      return previous?.digit === part.digit ? [] : [part.position ?? 0];
    });

    return changedPositions.length === 0 ? undefined : Math.max(...changedPositions);
  });

  function getDigitDelta(part: NumberFlowPart) {
    const current = part.digit!;
    const previous = getPreviousDigit(part);
    const length = (digits?.[part.position ?? 0]?.max ?? 9) + 1;
    const context: NumberFlowDigitContext = {
      position: part.position ?? 0,
      length,
      trend: computedTrend.value,
      highestChangedPosition: highestChangedPosition.value,
    };

    for (const plugin of plugins ?? []) {
      const delta = plugin.getDelta?.(current, previous, context);
      if (delta !== undefined) return delta;
    }

    const difference = current - previous;
    if (computedTrend.value < 0 && current > previous) return current - length - previous;
    if (computedTrend.value > 0 && current < previous) return length - previous + current;
    return difference;
  }

  function getDigitSequence(part: NumberFlowPart) {
    const current = part.digit!;
    const previous = getPreviousDigit(part);
    const delta = getDigitDelta(part);
    if (animationPhase.value === 'idle' || delta === 0)
      return [{ key: `current-${current}`, value: current }];

    const length = (digits?.[part.position ?? 0]?.max ?? 9) + 1;
    const start = delta > 0 ? previous : current;
    return Array.from({ length: Math.abs(delta) + 1 }, (_, index) => ({
      key: `step-${index}`,
      value: (start + index) % length,
    }));
  }

  function finishAnimation(version = animationVersion) {
    if (version !== animationVersion || animationPhase.value === 'idle') return;
    clearTimeout(finishTimer);
    finishTimer = undefined;
    previousData.value = currentData.value;
    animationPhase.value = 'idle';
    emit('animationsfinish');
  }

  // --- Group synchronization ---
  const group = inject(GROUP_KEY, undefined);

  function prepareAnimation(oldData: NumberFlowData, data: NumberFlowData, force = false) {
    const version = ++animationVersion;
    clearTimeout(finishTimer);
    finishTimer = undefined;
    previousData.value = oldData;
    plugins?.forEach((plugin) =>
      plugin.onUpdate?.({
        value: data.value,
        previousValue: oldData.value,
        trend: computedTrend.value,
      }),
    );

    if (!canAnimate.value || (!force && data.value === oldData.value)) {
      previousData.value = data;
      animationPhase.value = 'idle';
      return;
    }

    animationPhase.value = 'prepared';
    return version;
  }

  function commitAnimationStart(version: number) {
    if (version !== animationVersion || animationPhase.value !== 'prepared') return false;
    rootRef.value?.getBoundingClientRect();
    return true;
  }

  function startAnimation(version: number) {
    if (version !== animationVersion || animationPhase.value !== 'prepared') return;
    animationPhase.value = 'animating';
    emit('animationsstart');
    finishTimer = setTimeout(() => finishAnimation(version), spinDuration.value + 50);
  }

  if (group) {
    const unregister = group.register({
      value: currentValue,
      prepare: () => prepareAnimation(previousData.value, currentData.value, true),
      commit: commitAnimationStart,
      start: startAnimation,
    });
    onBeforeUnmount(unregister);
  } else {
    watch(
      currentValue,
      async (data, oldData) => {
        const version = prepareAnimation(formatData(oldData), formatData(data));
        if (version === undefined) return;
        await nextTick();
        if (!commitAnimationStart(version)) return;
        startAnimation(version);
      },
      { flush: 'pre' },
    );
  }

  onBeforeUnmount(() => clearTimeout(finishTimer));

  defineExpose<NumberFlowExposed>({
    get el() {
      return rootRef.value;
    },
  });
</script>
