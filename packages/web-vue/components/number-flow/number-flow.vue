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
    onBeforeUpdate,
    onMounted,
    shallowRef,
    useSlots,
    useTemplateRef,
    watch,
  } from 'vue';

  import {
    createNumberFlow,
    createNumberFlowDigits,
    getHighestChangedPosition,
    getNumberFlowStyles,
    type NumberFlowPhase,
  } from '@sdata/web-core/number-flow/foundation';
  import {
    getNumberFlowTrend,
    parseDuration,
    sanitizeValue,
  } from '@sdata/web-core/number-flow/utils';

  import type { NumberFlowData } from './formatter';
  import type { NumberFlowExposed, NumberFlowProps, NumberFlowValue } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { formatNumberFlow } from './formatter';
  import { GROUP_KEY } from './group-key';
  import { useCanAnimate } from './use-can-animate';

  defineOptions({ name: 'NumberFlow' });

  const {
    value,
    locales,
    format,
    prefix,
    suffix,
    trend,
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
    /**
     * @zh 自定义前缀，优先于 prefix 属性
     * @en Custom prefix, takes precedence over prefix
     */
    prefix(): unknown;
    /**
     * @zh 自定义后缀，优先于 suffix 属性
     * @en Custom suffix, takes precedence over suffix
     */
    suffix(): unknown;
  }>();

  const emit = defineEmits<{
    /**
     * @zh 数字动画开始时触发
     * @en Emitted when number animations start
     */
    animationsstart: [];
    /**
     * @zh 数字动画结束时触发
     * @en Emitted when number animations finish
     */
    animationsfinish: [];
  }>();

  const prefixCls = getPrefixCls('number-flow');
  const slots = useSlots();
  const hasPrefixSlot = shallowRef(Boolean(slots.prefix));
  const hasSuffixSlot = shallowRef(Boolean(slots.suffix));
  onBeforeUpdate(() => {
    hasPrefixSlot.value = Boolean(slots.prefix);
    hasSuffixSlot.value = Boolean(slots.suffix);
  });
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
      hasPrefixSlot.value ? undefined : prefix,
      hasSuffixSlot.value ? undefined : suffix,
    );
  }

  const previousData = shallowRef(formatData(sanitizeValue(value)));
  const currentValue = computed(() => sanitizeValue(value));
  const currentData = computed(() => formatData(currentValue.value));
  const animationPhase = shallowRef<NumberFlowPhase>('idle');
  const isAnimating = computed(() => animationPhase.value === 'animating');

  const resolvedTransformTiming = computed<KeyframeAnimationOptions>(() =>
    typeof transformTiming === 'function' ? transformTiming() : transformTiming,
  );
  const resolvedOpacityTiming = computed<KeyframeAnimationOptions>(() =>
    typeof opacityTiming === 'function' ? opacityTiming() : opacityTiming,
  );

  const transformDuration = computed(() =>
    parseDuration(resolvedTransformTiming.value.duration, 900),
  );
  const transformEasing = computed(
    () => resolvedTransformTiming.value.easing?.toString() ?? 'cubic-bezier(0.16, 1, 0.3, 1)',
  );

  const spinDuration = computed(() => {
    if (spinTiming) return parseDuration(spinTiming.duration, transformDuration.value);
    return transformDuration.value;
  });
  const spinEasing = computed(() => {
    if (spinTiming?.easing) return spinTiming.easing.toString();
    return transformEasing.value;
  });

  const opacityDuration = computed(() => parseDuration(resolvedOpacityTiming.value.duration, 450));

  const motionCanAnimate = useCanAnimate({
    respectMotionPreference: () => respectMotionPreference,
  });
  const canAnimate = computed(() => animated && motionCanAnimate.value);

  // Resolve the default here: Vue treats Number | Function defaults as factories.
  const computedTrend = computed(() =>
    getNumberFlowTrend(trend, previousData.value.value, currentData.value.value),
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

  const highestChangedPosition = computed(() =>
    getHighestChangedPosition(previousData.value, currentData.value),
  );
  const digitFoundation = createNumberFlowDigits({
    get previous() {
      return previousData.value;
    },
    get current() {
      return currentData.value;
    },
    get phase() {
      return animationPhase.value;
    },
    get trend() {
      return computedTrend.value;
    },
    get highestChangedPosition() {
      return highestChangedPosition.value;
    },
    get digits() {
      return digits;
    },
    get plugins() {
      return plugins;
    },
  });
  const getDigitSequence = digitFoundation.sequence;
  const dynamicStyles = computed(() =>
    getNumberFlowStyles({
      scope: styleScope.value,
      get transformDuration() {
        return transformDuration.value;
      },
      get transformEasing() {
        return transformEasing.value;
      },
      get spinDuration() {
        return spinDuration.value;
      },
      get spinEasing() {
        return spinEasing.value;
      },
      get opacityDuration() {
        return opacityDuration.value;
      },
      get parts() {
        return currentData.value.parts;
      },
      delta: digitFoundation.delta,
    }),
  );
  const foundation = createNumberFlow({
    get previous() {
      return previousData.value;
    },
    set previous(value) {
      previousData.value = value;
    },
    get current() {
      return currentData.value;
    },
    get phase() {
      return animationPhase.value;
    },
    set phase(value) {
      animationPhase.value = value;
    },
    get plugins() {
      return plugins;
    },
    get trend() {
      return computedTrend.value;
    },
    get canAnimate() {
      return canAnimate.value;
    },
    get spinDuration() {
      return spinDuration.value;
    },
    get transformDuration() {
      return transformDuration.value;
    },
    get opacityDuration() {
      return opacityDuration.value;
    },
    readLayout: () => {
      rootRef.value?.getBoundingClientRect();
    },
    setTimer: (callback, delay) => setTimeout(callback, delay),
    clearTimer: (timer) => clearTimeout(timer),
    start: () => emit('animationsstart'),
    finish: () => emit('animationsfinish'),
  });

  // --- Group synchronization ---
  const group = inject(GROUP_KEY, undefined);

  if (group) {
    const unregister = group.register({
      value: currentValue,
      // 不强制动画：仅当子项自身 value 变化时才参与本次动画
      prepare: () => foundation.prepare(previousData.value, currentData.value),
      commit: foundation.commit,
      start: foundation.start,
    });
    onBeforeUnmount(unregister);
  } else {
    watch(
      currentValue,
      async (data, oldData) => {
        const version = foundation.prepare(formatData(oldData), formatData(data));
        if (version === undefined) return;
        await nextTick();
        if (!foundation.commit(version)) return;
        foundation.start(version);
      },
      { flush: 'pre' },
    );
  }

  onBeforeUnmount(foundation.dispose);

  defineExpose<NumberFlowExposed>({
    get el() {
      return rootRef.value;
    },
  });
</script>
