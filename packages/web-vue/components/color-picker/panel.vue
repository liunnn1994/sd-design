<template>
  <DefineColorSection v-slot="{ text, values, trigger }">
    <div :class="`${prefixCls}-colors-section`">
      <div :class="`${prefixCls}-colors-header`">
        <div :class="`${prefixCls}-colors-text`">{{ text }}</div>
        <button
          v-if="trigger === 'recent' && values"
          type="button"
          :class="`${prefixCls}-colors-action`"
          @click="addRecentColor"
        >
          添加当前颜色
        </button>
      </div>
      <div :class="`${prefixCls}-colors-wrapper`">
        <div v-if="values?.length" :class="`${prefixCls}-colors-list`">
          <button
            v-for="value in values"
            :key="value"
            type="button"
            :class="`${prefixCls}-color-block`"
            :aria-label="t('a11y.selectColor', value)"
            @click="selectColorBlock(value, trigger)"
          >
            <div :class="`${prefixCls}-block`" :style="getColorBlockStyle(value)" />
          </button>
        </div>
        <span v-else :class="`${prefixCls}-colors-empty`">暂无颜色</span>
      </div>
    </div>
  </DefineColorSection>

  <div :class="[`${prefixCls}-panel`, { [`${prefixCls}-panel-disabled`]: props.disabled }]">
    <div v-if="props.colorModes.length > 1" :class="`${prefixCls}-panel-head`">
      <RadioGroup
        type="button"
        size="small"
        :model-value="colorState.mode"
        :options="modeOptions"
        :disabled="props.disabled"
        @change="handleModeChange"
      />
    </div>

    <div v-if="colorState.mode === 'linear-gradient'" :class="`${prefixCls}-gradient-panel`">
      <div ref="gradientShellRef" :class="`${prefixCls}-gradient-bar-shell`">
        <button
          ref="sliderRef"
          type="button"
          :class="`${prefixCls}-gradient-bar`"
          :disabled="props.disabled"
          :style="{ backgroundImage: getGradientThumbBackground(colorState.gradientColors) }"
          @click="handleGradientBarClick"
          @keydown="handleGradientBarKeyDown"
        />
        <GradientThumb
          v-for="point in colorState.gradientColors"
          :key="point.id"
          :point="point"
          :prefix-cls="prefixCls"
          :active="point.id === colorState.gradientSelectedId"
          :disabled="props.disabled"
          :on-select="() => handleThumbSelect(point.id)"
          :on-move="(clientX) => updateThumbLeft(point.id, clientX)"
          :on-remove="() => handleThumbRemove(point.id)"
        />
      </div>
      <div :class="`${prefixCls}-gradient-meta`">
        <span :class="`${prefixCls}-gradient-label`">角度</span>
        <InputNumber
          :class="`${prefixCls}-gradient-degree`"
          size="mini"
          :min="0"
          :max="360"
          hide-button
          :disabled="props.disabled"
          :model-value="colorState.gradientDegree"
          @change="handleDegreeChange"
        />
      </div>
      <div
        :class="`${prefixCls}-gradient-preview`"
        :style="{ backgroundImage: getLinearGradientString(colorState) }"
      />
    </div>

    <Palette :color="colorModel" @change="handlePaletteChange" />
    <div :class="`${prefixCls}-panel-control`">
      <div :class="`${prefixCls}-control-wrapper`">
        <div>
          <ControlBar
            type="hue"
            :x="activeHsva.h"
            :color="colorModel"
            :color-string="formatColor(activeHsva, 'CSS', true)"
            @change="handleHueChange"
          />
          <ControlBar
            v-if="props.enableAlpha"
            type="alpha"
            :x="activeHsva.a"
            :color="colorModel"
            :color-string="formatColor(activeHsva, 'CSS', true)"
            @change="handleAlphaChange"
          />
        </div>
        <div
          v-if="props.showPrimaryColorPreview"
          :class="`${prefixCls}-preview`"
          :style="previewStyle"
        />
      </div>
      <div :class="`${prefixCls}-input-wrapper`">
        <Select
          :class="`${prefixCls}-select`"
          size="mini"
          :trigger-props="selectTriggerProps"
          :options="formatOptions"
          :model-value="selectedFormat"
          :disabled="props.disabled"
          @change="handleFormatChange"
        />
        <div :class="`${prefixCls}-group-wrapper`">
          <InputGroup :class="`${prefixCls}-input-group`">
            <Input
              v-for="(draft, index) in formatDrafts"
              :key="`${selectedFormat}-${index}`"
              :class="`${prefixCls}-format-input`"
              size="mini"
              :disabled="props.disabled"
              :model-value="draft"
              @input="updateDraft(index, $event)"
              @change="commitDrafts"
              @press-enter="commitDrafts"
            />
          </InputGroup>
        </div>
      </div>
    </div>

    <div v-if="recentColorList || swatchColorList?.length" :class="`${prefixCls}-panel-colors`">
      <ReuseColorSection
        v-if="recentColorList"
        text="最近使用"
        :values="recentColorList"
        trigger="recent"
      />
      <ReuseColorSection
        v-if="swatchColorList?.length"
        text="系统色板"
        :values="swatchColorList"
        trigger="preset"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, type CSSProperties, type PropType } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { TriggerProps } from '../trigger';
  import type {
    Color,
    ColorFormat,
    ColorModes,
    ColorObject,
    ColorPickerChangeTrigger,
    ColorValueState,
    GradientColorPoint,
    HSVA,
    RecentColorsValue,
  } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import Input, { InputGroup } from '../input';
  import InputNumber, { type InputNumberValue } from '../input-number';
  import { useI18n } from '../locale';
  import Radio from '../radio';
  import Select from '../select';
  import ControlBar from './control-bar.vue';
  import GradientThumb from './gradient-thumb.vue';
  import Palette from './palette.vue';
  import {
    TD_COLOR_USED_COLORS_MAX_SIZE,
    addGradientColor,
    formatColor,
    formatColorState,
    getActiveGradientPoint,
    getColorBackground,
    getColorObject,
    getDefaultColorState,
    getDefaultGradientState,
    getFormatInputs,
    getGradientThumbBackground,
    getLinearGradientString,
    normalizeFormat,
    parseColorState,
    parseFormatInputValues,
    removeGradientColor,
    round,
    setActiveColorHsva,
    setGradientColors,
    setGradientDegree,
    setGradientSelectedPoint,
  } from './utils';

  type ColorSectionTrigger = 'recent' | 'preset';

  const modeOptions = [
    { value: 'monochrome', label: '单色' },
    { value: 'linear-gradient', label: '渐变' },
  ];
  const RadioGroup = Radio.Group;
  const clampPercent = (value: number) => Math.min(100, Math.max(0, value));
  const getGradientPointComparableColor = (point: GradientColorPoint) =>
    formatColor(point.hsva, 'CSS', true);

  const matchGradientPoint = (
    previousPoints: GradientColorPoint[],
    nextPoint: GradientColorPoint,
    usedIds: Set<string>,
  ) => {
    const availablePoints = previousPoints.filter((point) => !usedIds.has(point.id));
    if (!availablePoints.length) return undefined;
    const nextColor = getGradientPointComparableColor(nextPoint);
    const sameColorPoints = availablePoints.filter(
      (point) => getGradientPointComparableColor(point) === nextColor,
    );
    const candidates = sameColorPoints.length ? sameColorPoints : availablePoints;
    return candidates.reduce<GradientColorPoint | undefined>((closestPoint, point) => {
      if (!closestPoint) return point;
      return Math.abs(point.left - nextPoint.left) < Math.abs(closestPoint.left - nextPoint.left)
        ? point
        : closestPoint;
    }, undefined);
  };

  const reconcileGradientState = (previousState: ColorValueState, nextState: ColorValueState) => {
    if (previousState.mode !== 'linear-gradient' || nextState.mode !== 'linear-gradient') {
      return nextState;
    }
    const usedIds = new Set<string>();
    const nextColors = nextState.gradientColors.map((point) => {
      const matchedPoint = matchGradientPoint(previousState.gradientColors, point, usedIds);
      if (!matchedPoint) return point;
      usedIds.add(matchedPoint.id);
      return { ...point, id: matchedPoint.id } satisfies GradientColorPoint;
    });
    const selectedPoint =
      nextColors.find((point) => point.id === previousState.gradientSelectedId) || nextColors[0];
    return {
      ...nextState,
      gradientColors: nextColors,
      gradientSelectedId: selectedPoint?.id || '',
      hsva: selectedPoint?.hsva || nextState.hsva,
    } satisfies ColorValueState;
  };

  defineOptions({ name: 'Panel' });

  const props = defineProps({
    value: { type: String, default: '' },
    colorModes: {
      type: Array as PropType<ColorModes>,
      default: () => ['monochrome'],
    },
    enableMultipleGradient: { type: Boolean, default: true },
    disabled: Boolean,
    enableAlpha: Boolean,
    showPrimaryColorPreview: { type: Boolean, default: true },
    format: { type: String as PropType<ColorFormat>, default: 'RGB' },
    recentColors: {
      type: [Array, Boolean] as PropType<RecentColorsValue>,
      default: () => [],
    },
    swatchColors: {
      type: Array as PropType<string[] | null>,
      default: () => [],
    },
    onChange: Function as PropType<(value: string, trigger: ColorPickerChangeTrigger) => void>,
    onRecentColorsChange: Function as PropType<(value: string[]) => void>,
    onPaletteBarChange: Function as PropType<(context: { color: ColorObject }) => void>,
  });

  const [DefineColorSection, ReuseColorSection] = createReusableTemplate<{
    text: string;
    values?: string[];
    trigger: ColorSectionTrigger;
  }>();
  const { t } = useI18n();
  const prefixCls = getPrefixCls('color-picker');
  const selectTriggerProps: TriggerProps & { class: string } = {
    class: `${prefixCls}-select-popup`,
  };
  const sliderRef = ref<HTMLElement>();
  const gradientShellRef = ref<HTMLElement>();
  const colorState = ref<ColorValueState>(parseColorState(props.value, props.colorModes));
  const selectedFormat = ref<ColorFormat>(normalizeFormat(props.format, props.enableAlpha));
  const formatDrafts = ref<string[]>([]);
  const activeHsva = computed(
    () => getActiveGradientPoint(colorState.value)?.hsva || colorState.value.hsva,
  );
  const syncDrafts = () => {
    formatDrafts.value = getFormatInputs(activeHsva.value, selectedFormat.value, props.enableAlpha);
  };

  watch(
    () => [props.value, props.colorModes] as const,
    () => {
      colorState.value = reconcileGradientState(
        colorState.value,
        parseColorState(props.value, props.colorModes),
      );
      syncDrafts();
    },
    { deep: true },
  );
  watch(
    () => [props.format, props.enableAlpha] as const,
    () => {
      selectedFormat.value = normalizeFormat(props.format, props.enableAlpha);
      syncDrafts();
    },
  );
  syncDrafts();

  const formatOptions = computed(() => {
    const base: Array<{ value: ColorFormat; label: string }> = [
      { value: 'HEX', label: 'HEX' },
      { value: 'RGB', label: 'RGB' },
      { value: 'HSL', label: 'HSL' },
      { value: 'HSV', label: 'HSV' },
      { value: 'CMYK', label: 'CMYK' },
      { value: 'CSS', label: 'CSS' },
    ];
    return props.enableAlpha
      ? [
          { value: 'HEX8' as const, label: 'HEX8' },
          { value: 'RGBA' as const, label: 'RGBA' },
          { value: 'HSLA' as const, label: 'HSLA' },
          { value: 'HSVA' as const, label: 'HSVA' },
          ...base,
        ]
      : base;
  });
  const previewColor = computed(() => getColorBackground(colorState.value));
  const previewStyle = computed<CSSProperties>(() =>
    colorState.value.mode === 'linear-gradient'
      ? { backgroundImage: previewColor.value }
      : { backgroundColor: previewColor.value },
  );
  const colorModel = computed<Color>(() => {
    const colorObject = getColorObject(colorState.value);
    return {
      hsv: { h: activeHsva.value.h, s: activeHsva.value.s, v: activeHsva.value.v },
      rgb: { r: colorObject.red, g: colorObject.green, b: colorObject.blue },
      hex: colorObject.hex.replace('#', ''),
    };
  });
  const recentColorList = computed(() => {
    if (!Array.isArray(props.recentColors)) return undefined;
    const onlyGradient = props.colorModes.length === 1 && props.colorModes[0] === 'linear-gradient';
    return onlyGradient
      ? props.recentColors.filter((item) => item.startsWith('linear-gradient('))
      : props.recentColors;
  });
  const swatchColorList = computed(() => {
    if (!Array.isArray(props.swatchColors)) return undefined;
    const onlyGradient = props.colorModes.length === 1 && props.colorModes[0] === 'linear-gradient';
    return onlyGradient
      ? props.swatchColors.filter((item) => item.startsWith('linear-gradient('))
      : props.swatchColors;
  });

  const emitStateChange = (
    nextState: ColorValueState,
    trigger: ColorPickerChangeTrigger,
    notifyPaletteBar?: boolean,
  ) => {
    colorState.value = nextState;
    syncDrafts();
    props.onChange?.(formatColorState(nextState, selectedFormat.value, props.enableAlpha), trigger);
    if (notifyPaletteBar) props.onPaletteBarChange?.({ color: getColorObject(nextState) });
  };
  const handleHsvaChange = (
    nextHsva: HSVA,
    trigger: ColorPickerChangeTrigger,
    notifyPaletteBar?: boolean,
  ) => emitStateChange(setActiveColorHsva(colorState.value, nextHsva), trigger, notifyPaletteBar);
  const handleModeChange = (mode: string | number | boolean) => {
    if (props.disabled || typeof mode !== 'string' || mode === colorState.value.mode) return;
    if (mode === 'linear-gradient') {
      emitStateChange(getDefaultGradientState(formatColor(activeHsva.value, 'CSS', true)), 'input');
      return;
    }
    emitStateChange(
      { ...getDefaultColorState(), mode: 'monochrome', hsva: activeHsva.value },
      'input',
    );
  };
  const updateDraft = (index: number, value: string) => {
    const nextDrafts = [...formatDrafts.value];
    nextDrafts[index] = value;
    formatDrafts.value = nextDrafts;
  };
  const commitDrafts = () => {
    handleHsvaChange(
      parseFormatInputValues(formatDrafts.value, selectedFormat.value, props.enableAlpha),
      'input',
    );
  };
  const getThumbTrackRect = () =>
    (sliderRef.value || gradientShellRef.value)?.getBoundingClientRect();
  const updateThumbLeft = (pointId: string, clientX: number) => {
    const rect = getThumbTrackRect();
    if (!rect) return;
    const nextLeft = clampPercent(((clientX - rect.left) / rect.width) * 100);
    const gradientColors = colorState.value.gradientColors.map((point) =>
      point.id === pointId ? { ...point, left: round(nextLeft, 2) } : point,
    );
    emitStateChange(setGradientColors(colorState.value, gradientColors), 'input');
  };
  const handleGradientBarClick = (event: MouseEvent) => {
    if (
      props.disabled ||
      !props.enableMultipleGradient ||
      colorState.value.mode !== 'linear-gradient'
    )
      return;
    if (event.target !== sliderRef.value && event.target !== gradientShellRef.value) return;
    const slider = sliderRef.value || gradientShellRef.value;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const left = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
    emitStateChange(addGradientColor(colorState.value, left), 'input');
  };
  const handleGradientBarKeyDown = (event: KeyboardEvent) => {
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      !props.disabled &&
      props.enableMultipleGradient
    ) {
      event.preventDefault();
      emitStateChange(addGradientColor(colorState.value, 50), 'input');
    }
  };
  const handleThumbSelect = (pointId: string) => {
    if (colorState.value.gradientSelectedId !== pointId) {
      emitStateChange(setGradientSelectedPoint(colorState.value, pointId), 'input');
    }
  };
  const handleThumbRemove = (pointId: string) => {
    if (colorState.value.gradientColors.length > 2) {
      emitStateChange(removeGradientColor(colorState.value, pointId), 'input');
    }
  };
  const handleDegreeChange = (value: InputNumberValue) => {
    if (typeof value === 'number') {
      emitStateChange(setGradientDegree(colorState.value, value), 'input');
    }
  };
  const handlePaletteChange = (s: number, v: number) =>
    handleHsvaChange({ ...activeHsva.value, s, v }, 'palette-saturation-brightness');
  const handleHueChange = (h: number) =>
    handleHsvaChange({ ...activeHsva.value, h }, 'palette-hue-bar', true);
  const handleAlphaChange = (a: number) =>
    handleHsvaChange({ ...activeHsva.value, a }, 'palette-alpha-bar', true);
  const handleFormatChange = (value: unknown) => {
    if (typeof value !== 'string') return;
    selectedFormat.value = value as ColorFormat;
    syncDrafts();
  };
  const addRecentColor = () => {
    if (props.recentColors === null || props.recentColors === false) return;
    const currentValue = formatColorState(
      colorState.value,
      selectedFormat.value,
      props.enableAlpha,
    );
    const next = [...(recentColorList.value || [])];
    const index = next.indexOf(currentValue);
    if (index !== -1) next.splice(index, 1);
    next.unshift(currentValue);
    if (next.length > TD_COLOR_USED_COLORS_MAX_SIZE) next.length = TD_COLOR_USED_COLORS_MAX_SIZE;
    props.onRecentColorsChange?.(next);
  };
  const getColorBlockStyle = (value: string): CSSProperties =>
    value.startsWith('linear-gradient(') ? { backgroundImage: value } : { backgroundColor: value };
  const selectColorBlock = (value: string, trigger: ColorSectionTrigger) =>
    emitStateChange(parseColorState(value, props.colorModes), trigger);
</script>
