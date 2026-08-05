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

  import type { ThinkingOrbProps } from './types';

  import { useThemeMode } from '../_hooks/use-theme-mode';
  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';
  import { MODE_DRAWS } from './engine/registry';
  import { resolvePreset } from './presets';

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

  const isDark = computed(() =>
    theme === 'auto' ? inheritedTheme.value === 'dark' : theme === 'dark',
  );
  // Only 20 and 64 carry tuned presets; clamp any other value to 64 so a JS
  // caller can't crash resolvePreset by passing an unrecognised size.
  const resolvedSize = computed(() => (size === 20 || size === 64 ? size : 64));
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

  let stopRenderer: (() => void) | undefined;
  let stopReducedMotion: (() => void) | undefined;

  function setupRenderer() {
    stopRenderer?.();
    stopRenderer = undefined;

    const canvas = canvasRef.value;
    if (!canvas) return;

    // A deterministic phase used whenever the orb is static: reduced-motion
    // users, and the single frame drawn while paused. Without this a paused
    // orb would freeze on a non-deterministic wall-clock snapshot.
    const representativePhase = 0.6;
    const sz = resolvedSize.value;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(sz * dpr);
    canvas.height = Math.round(sz * dpr);

    const context = canvas.getContext('2d');
    if (!context) return;

    const { mode, speed: presetSpeed, opts } = resolvePreset(state, sz);
    const draw = MODE_DRAWS[mode];
    const effectiveSpeed = presetSpeed * speed;

    const drawFrame = (time: number) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, sz, sz);
      draw(context, sz, time, isDark.value, opts);
    };

    if (reducedMotion.value) {
      drawFrame(representativePhase);
      return;
    }

    let animationFrame = 0;
    let running = false;
    let visible = true;

    const loop = () => {
      drawFrame((performance.now() / 1000) * effectiveSpeed);
      if (running) animationFrame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || paused) return;
      running = true;
      animationFrame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(animationFrame);
    };

    drawFrame(paused ? representativePhase : (performance.now() / 1000) * effectiveSpeed);

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? false;
            if (visible && document.visibilityState !== 'hidden') start();
            else stop();
          });
    observer?.observe(canvas);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stop();
      else if (visible) start();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!observer) start();

    stopRenderer = () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  function setupReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      reducedMotion.value = mediaQuery.matches;
    };
    update();
    mediaQuery.addEventListener('change', update);
    stopReducedMotion = () => mediaQuery.removeEventListener('change', update);
  }

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

  onUnmounted(() => {
    stopRenderer?.();
    stopReducedMotion?.();
  });
</script>
