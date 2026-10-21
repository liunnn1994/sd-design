<template>
  <DefineColorSection v-slot="{ text, values, trigger }">
    <div :class="`${prefixCls}-colors-section`">
      <div :class="`${prefixCls}-colors-header`">
        <div :class="`${prefixCls}-colors-text`">{{ text }}</div>
        <button
          v-if="trigger === 'recent' && values"
          type="button"
          :class="`${prefixCls}-colors-action`"
          :disabled="props.disabled"
          @click="addRecentColor"
        >
          {{ t('colorPicker.addCurrent') }}
        </button>
      </div>
      <div :class="`${prefixCls}-colors-wrapper`">
        <div v-if="values?.length" :class="`${prefixCls}-colors-list`">
          <button
            v-for="value in values"
            :key="value"
            type="button"
            :class="`${prefixCls}-color-block`"
            :disabled="props.disabled"
            :aria-label="t('a11y.selectColor', value)"
            @click="selectColorBlock(value, trigger)"
          >
            <div :class="`${prefixCls}-block`" :style="getColorBlockStyle(value)" />
          </button>
        </div>
        <span v-else :class="`${prefixCls}-colors-empty`">{{ t('colorPicker.empty') }}</span>
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
        <span :class="`${prefixCls}-gradient-label`">{{ t('colorPicker.angle') }}</span>
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
              @change="commitDrafts(index)"
            />
          </InputGroup>
        </div>
      </div>
    </div>

    <div v-if="recentColorList || swatchColorList?.length" :class="`${prefixCls}-panel-colors`">
      <ReuseColorSection
        v-if="recentColorList"
        :text="t('colorPicker.recent')"
        :values="recentColorList"
        trigger="recent"
      />
      <ReuseColorSection
        v-if="swatchColorList?.length"
        :text="t('colorPicker.swatches')"
        :values="swatchColorList"
        trigger="preset"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch, type CSSProperties, type PropType } from 'vue';

  import {
    createColorPanel,
    getColorSectionList,
    getColorFormatOptions,
    type ColorSectionTrigger,
  } from '@sdata/web-core/color-picker/panel';
  import { createReusableTemplate } from '@vueuse/core';

  import type { TriggerProps } from '../trigger';
  import type {
    Color,
    ColorFormat,
    ColorModes,
    ColorObject,
    ColorPickerChangeTrigger,
    ColorValueState,
    RecentColorsValue,
  } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import Input, { InputGroup } from '../input';
  import InputNumber from '../input-number';
  import { useI18n } from '../locale';
  import Radio from '../radio';
  import Select from '../select';
  import ControlBar from './control-bar.vue';
  import GradientThumb from './gradient-thumb.vue';
  import Palette from './palette.vue';
  import {
    formatColor,
    getColorBackground,
    getGradientThumbBackground,
    getLinearGradientString,
    normalizeFormat,
    parseColorState,
  } from './utils';

  const modeOptions = computed(() => [
    { value: 'monochrome', label: t('colorPicker.monochrome') },
    { value: 'linear-gradient', label: t('colorPicker.gradient') },
  ]);
  const RadioGroup = Radio.Group;
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
  const foundation = createColorPanel({
    props,
    get state() {
      return colorState.value;
    },
    set state(value) {
      colorState.value = value;
    },
    get format() {
      return selectedFormat.value;
    },
    set format(value) {
      selectedFormat.value = value;
    },
    get drafts() {
      return formatDrafts.value;
    },
    set drafts(value) {
      formatDrafts.value = value;
    },
    afterRender: (callback) => {
      void nextTick(callback);
    },
    trackRect: () => (sliderRef.value || gradientShellRef.value)?.getBoundingClientRect(),
    isTrackTarget: (event) =>
      event.target === sliderRef.value || event.target === gradientShellRef.value,
  });
  const activeHsva = computed(foundation.active);
  const syncDrafts = foundation.syncDrafts;
  watch(() => [props.value, props.colorModes] as const, foundation.syncValue, { deep: true });
  watch(() => [props.format, props.enableAlpha] as const, foundation.syncFormat);
  syncDrafts();
  const formatOptions = computed(() => getColorFormatOptions(props.enableAlpha));
  const previewColor = computed(() => getColorBackground(colorState.value));
  const previewStyle = computed<CSSProperties>(() =>
    colorState.value.mode === 'linear-gradient'
      ? { backgroundImage: previewColor.value }
      : { backgroundColor: previewColor.value },
  );
  const colorModel = computed<Color>(foundation.colorModel);
  const recentColorList = computed(() => getColorSectionList(props.recentColors, props.colorModes));
  const swatchColorList = computed(() => getColorSectionList(props.swatchColors, props.colorModes));
  const {
    handleModeChange,
    updateDraft,
    commitDrafts,
    updateThumbLeft,
    handleGradientBarClick,
    handleGradientBarKeyDown,
    handleThumbSelect,
    handleThumbRemove,
    handleDegreeChange,
    handlePaletteChange,
    handleHueChange,
    handleAlphaChange,
    handleFormatChange,
    addRecentColor,
    getColorBlockStyle,
    selectColorBlock,
  } = foundation;
</script>
