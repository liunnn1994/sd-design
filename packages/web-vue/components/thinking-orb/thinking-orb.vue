<template>
  <canvas ref="canvasRef" v-bind="canvasAttrs" />
</template>

<script lang="ts" setup>
  import {
    computed,
    mergeProps,
    onMounted,
    onUnmounted,
    ref,
    shallowRef,
    useAttrs,
    watch,
  } from 'vue';

  import {
    createThinkingOrbFoundation,
    resolveThinkingOrbSize,
    resolveThinkingOrbDark,
  } from '@sdata/web-core/thinking-orb/foundation';

  import type { ThinkingOrbProps } from './types';

  import { useThemeMode } from '../_hooks/use-theme-mode';
  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';

  defineOptions({ name: 'ThinkingOrb', inheritAttrs: false });

  const {
    state = 'working',
    size = 64,
    theme = 'auto',
    speed = 1,
    paused = false,
  } = defineProps<ThinkingOrbProps>();

  const attrs = useAttrs();
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const inheritedTheme = useThemeMode(canvasRef);
  const reducedMotion = shallowRef(false);
  const prefixCls = getPrefixCls('thinking-orb');
  const { t } = useI18n();

  const isDark = computed(() => resolveThinkingOrbDark(theme, () => inheritedTheme.value));
  // Only 20 and 64 carry tuned presets; clamp any other value to 64 so a JS
  // caller can't crash resolvePreset by passing an unrecognised size.
  const resolvedSize = computed(() => resolveThinkingOrbSize(size));
  const canvasAttrs = computed(() =>
    mergeProps(
      {
        'class': prefixCls,
        'role': 'img',
        'aria-label': t(`a11y.thinkingOrb.${state}`),
        'data-theme': isDark.value ? 'dark' : 'light',
        'data-state': state,
        'style': {
          width: `${resolvedSize.value}px`,
          height: `${resolvedSize.value}px`,
        },
      },
      attrs,
    ),
  );

  const foundation = createThinkingOrbFoundation({
    props: {
      get state() {
        return state;
      },
      get speed() {
        return speed;
      },
      get paused() {
        return paused;
      },
    },
    get canvas() {
      return canvasRef.value;
    },
    get resolvedSize() {
      return resolvedSize.value;
    },
    get isDark() {
      return isDark.value;
    },
    get reducedMotion() {
      return reducedMotion.value;
    },
    set reducedMotion(value) {
      reducedMotion.value = value;
    },
  });
  const { setupRenderer, setupReducedMotion } = foundation;
  watch(
    [() => state, resolvedSize, () => speed, () => paused, isDark, reducedMotion],
    setupRenderer,
    {
      flush: 'post',
    },
  );

  onMounted(() => {
    setupReducedMotion();
    setupRenderer();
  });

  onUnmounted(foundation.dispose);
</script>
