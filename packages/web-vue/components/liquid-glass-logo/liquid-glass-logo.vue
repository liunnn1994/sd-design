<template>
  <div
    ref="root"
    :class="prefixCls"
    :style="{
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      background: tuning.background,
      [autoWidthCssVar]: measuredWidth === undefined ? undefined : `${measuredWidth}px`,
    }"
    role="img"
    :aria-label="tuning.ending === 'logo' ? 'Logo' : tuning.text"
    :data-liquid-glass-ready="ready || undefined"
    :data-liquid-glass-fallback="fallback || undefined"
    :data-liquid-glass-theme="tuning.theme"
  >
    <template v-if="props.backgroundImage">
      <div :class="`${prefixCls}-background`" aria-hidden="true" :style="backgroundStyle" />
      <div
        :class="`${prefixCls}-background`"
        aria-hidden="true"
        :style="{
          backgroundColor: props.backgroundTint,
          opacity: clamp(props.backgroundTintOpacity, 0, 1),
        }"
      />
    </template>
    <canvas ref="canvas" aria-hidden="true" />
    <span
      v-if="fallback"
      :class="`${prefixCls}-fallback`"
      aria-hidden="true"
      :style="fallbackStyle"
    >
      <slot name="fallback">
        <img
          v-if="tuning.ending === 'logo'"
          :src="tuning.logo"
          alt=""
          :class="`${prefixCls}-fallback-logo`"
          :style="{ width: `${logoEdge}px`, height: `${logoEdge}px` }"
        />
        <template v-else
          ><img v-if="markSource" :src="markSource" alt="" />{{ tuning.text }}</template
        >
      </slot>
    </span>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    inject,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    useTemplateRef,
    watch,
  } from 'vue';

  import { createLiquidGlassLogoController } from '@sdata/web-core/liquid-glass-logo/controller';
  import { resolveLiquidGlassLogo } from '@sdata/web-core/liquid-glass-logo/foundation';
  import { getLiquidGlassLogoFallbackTheme } from '@sdata/web-core/liquid-glass-logo/theme';
  import { usePreferredDark } from '@vueuse/core';
  import { clamp } from 'es-toolkit';

  import type { LiquidGlassLogoProps, LiquidGlassLogoExposed } from './types';

  import { useThemeMode } from '../_hooks/use-theme-mode';
  import { getPrefixCls } from '../_utils/global-config';
  import { inheritedThemeInjectionKey } from '../config-provider/context';

  defineOptions({ name: 'LiquidGlassLogo' });
  const props = withDefaults(defineProps<LiquidGlassLogoProps>(), {
    autoWidth: true,
    theme: 'auto',
    tile: true,
    backgroundX: 0,
    backgroundY: 0,
    backgroundScale: 1,
    backgroundTint: '#000000',
    backgroundTintOpacity: 0,
  });
  /** @zh 首帧就绪或渲染不可用时通知。 @en Notify when the first frame is ready or rendering is unavailable. */
  const emit = defineEmits<{ ready: []; error: [error: Error] }>();
  /** @zh WebGL 不可用时的静态替代内容。 @en Static content when WebGL is unavailable. */
  defineSlots<{ fallback?: () => unknown }>();
  const prefixCls = getPrefixCls('liquid-glass-logo');
  const autoWidthCssVar = `--${prefixCls}-auto-width`;
  const root = useTemplateRef('root');
  const preferredDark = usePreferredDark();
  const libraryTheme = inject(inheritedThemeInjectionKey, undefined);
  const inheritedTheme = useThemeMode(root, () =>
    getLiquidGlassLogoFallbackTheme(root.value, libraryTheme?.mode.value, preferredDark.value),
  );
  const measuredWidth = shallowRef<number>();
  const measuredScale = shallowRef(1);
  const canvas = useTemplateRef('canvas');
  const ready = shallowRef(false);
  const fallback = shallowRef(false);
  const tuning = computed(() =>
    resolveLiquidGlassLogo(
      { ...props, theme: props.theme === 'auto' ? inheritedTheme.value : props.theme },
      Boolean(props.backgroundImage),
    ),
  );
  const controller = createLiquidGlassLogoController({
    getElement: () => root.value,
    getCanvas: () => canvas.value,
    getTuning: () => tuning.value,
    isAutoWidth: () => props.autoWidth,
    onWidth: (value, scale) => {
      measuredWidth.value = value;
      measuredScale.value = scale;
    },
    onReady: () => {
      ready.value = true;
      emit('ready');
    },
    onError: (error) => {
      ready.value = false;
      fallback.value = true;
      emit('error', error);
    },
  });
  const markSource = computed(() =>
    tuning.value.mark === 'logo' ? tuning.value.logo : tuning.value.mark,
  );
  const logoEdge = computed(
    () =>
      tuning.value.logoSize *
      tuning.value.logoScale *
      tuning.value.finalLogoScale *
      measuredScale.value,
  );
  const backgroundStyle = computed(() => ({
    background: `url(${JSON.stringify(props.backgroundImage)}) center / cover no-repeat`,
    transform: `translate(${clamp(props.backgroundX, -100, 100)}%, ${clamp(props.backgroundY, -100, 100)}%) scale(${clamp(props.backgroundScale, 1, 3)})`,
  }));
  const fallbackStyle = computed(() => ({
    color: tuning.value.textColor,
    fontFamily: tuning.value.fontFamily,
    fontWeight: tuning.value.fontWeight,
    fontStretch: tuning.value.fontStretch,
    fontSize: `${tuning.value.fontSize * measuredScale.value}px`,
    letterSpacing: `${tuning.value.letterSpacing}em`,
    gap: `${tuning.value.markGap}em`,
  }));
  onMounted(controller.connect);
  watch(tuning, controller.updateTuning);
  watch([tuning, () => props.height, () => props.autoWidth], controller.updateWidth, {
    flush: 'post',
  });
  onBeforeUnmount(controller.dispose);
  defineExpose<LiquidGlassLogoExposed>({
    replay: controller.replay,
    seek: controller.seek,
    pause: controller.pause,
    play: controller.play,
  });
</script>
