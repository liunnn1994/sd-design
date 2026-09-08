<template>
  <DefinePanel>
    <Panel
      :value="mergedValue"
      :color-modes="props.colorModes"
      :enable-multiple-gradient="props.enableMultipleGradient"
      :recent-colors="mergedRecentColors"
      :swatch-colors="mergedSwatchColors"
      :disabled="props.disabled"
      :enable-alpha="mergedEnableAlpha"
      :format="normalizedFormat"
      :show-primary-color-preview="props.showPrimaryColorPreview"
      @change="handleColorChange"
      @recent-colors-change="syncRecentColors"
      @palette-bar-change="handlePaletteBarChange"
    />
  </DefinePanel>

  <ReusePanel v-if="props.hideTrigger" />
  <Tooltip v-else :popup-visible="tipVisible" :content="readonlyTipText" position="top">
    <Trigger v-bind="mergedTriggerProps" @popup-visible-change="onPopupVisibleChange">
      <template #content>
        <ReusePanel />
      </template>
      <slot name="trigger" v-bind="triggerSlotProps">
        <slot>
          <div
            :class="{
              [prefixCls]: true,
              [`${prefixCls}-size-${props.size}`]: props.size,
              [`${prefixCls}-disabled`]: props.disabled,
              [`${prefixCls}-readonly`]: !!props.readonly,
              [`${prefixCls}-borderless`]: props.borderless,
            }"
            @click="showReadonlyTip"
          >
            <Input
              v-bind="props.inputProps"
              :class="`${prefixCls}-trigger-input`"
              :size="props.size === 'mini' ? 'mini' : (props.size as Size)"
              :allow-clear="props.clearable"
              :disabled="props.disabled"
              :readonly="props.readonly"
              :model-value="triggerInputValue"
              :input-attrs="{
                'aria-haspopup': 'dialog',
                'aria-expanded': popupVisible,
              }"
              @input="handleTriggerInput"
              @change="handleTriggerInputChange"
              @clear="handleClear"
            >
              <template #prefix>
                <div :class="`${prefixCls}-preview`" :style="previewStyle" />
              </template>
            </Input>
          </div>
        </slot>
      </slot>
    </Trigger>
  </Tooltip>
</template>

<script setup lang="ts">
  import { computed, inject, ref, toRef, watch } from 'vue';
  import type { PropType } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { FloatingOptions } from '../_utils/floating';
  import type {
    ColorFormat,
    ColorModes,
    ColorObject,
    ColorPickerChangeTrigger,
    ColorPickerTriggerSlotProps,
    LegacyFormat,
    RecentColorsValue,
  } from './interface';

  import { useReadonlyTip, useReadonlyTipText } from '../_hooks/use-readonly-tip';
  import { Size } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Input from '../input';
  import Tooltip from '../tooltip';
  import Trigger, { type TriggerProps } from '../trigger';
  import Panel from './panel.vue';
  import {
    formatColorState,
    getColorBackground,
    getColorObject,
    normalizeFormat,
    parseColorState,
  } from './utils';

  defineOptions({ name: 'ColorPicker' });

  const props = defineProps({
    borderless: Boolean,
    clearable: Boolean,
    colorModes: {
      type: Array as PropType<ColorModes>,
      default: () => ['monochrome'],
    },
    enableMultipleGradient: {
      type: Boolean,
      default: true,
    },
    modelValue: String,
    defaultValue: {
      type: String,
      default: '',
    },
    format: {
      type: String as PropType<ColorFormat | LegacyFormat>,
      default: 'RGB',
    },
    size: {
      type: String as PropType<Size | 'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    enableAlpha: Boolean,
    showPrimaryColorPreview: {
      type: Boolean,
      default: true,
    },
    inputProps: {
      type: Object as PropType<Record<string, unknown>>,
    },
    recentColors: {
      type: [Array, Boolean] as PropType<RecentColorsValue>,
      default: undefined,
    },
    defaultRecentColors: {
      type: [Array, Boolean] as PropType<RecentColorsValue>,
      default: () => [],
    },
    swatchColors: {
      type: Array as PropType<string[] | null>,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    hideTrigger: Boolean,
    triggerProps: {
      type: Object as PropType<Partial<TriggerProps>>,
    },
    floatingOptions: {
      type: Object as PropType<FloatingOptions>,
    },
  });

  const emit = defineEmits({
    'update:modelValue': (_value: string) => true,
    'change': (
      _value: string,
      _context: { color: ColorObject; trigger: ColorPickerChangeTrigger },
    ) => true,
    'popup-visible-change': (_visible: boolean, _value: string) => true,
    'clear': (_context: { e: MouseEvent }) => true,
    'palette-bar-change': (_context: { color: ColorObject }) => true,
    'recent-colors-change': (_value: string[]) => true,
  });

  defineSlots<{
    default(): unknown;
    trigger(props: ColorPickerTriggerSlotProps): unknown;
  }>();

  const [DefinePanel, ReusePanel] = createReusableTemplate();
  const prefixCls = getPrefixCls('color-picker');
  const configProvider = inject(configProviderInjectionKey, undefined);
  const innerValue = ref(props.defaultValue);
  const popupVisible = ref(false);
  const innerRecentColors = ref<string[]>(
    Array.isArray(props.defaultRecentColors) ? props.defaultRecentColors : [],
  );

  const mergedValue = computed(() => props.modelValue ?? innerValue.value);
  const mergedEnableAlpha = computed(() => props.enableAlpha);
  const normalizedFormat = computed(() => normalizeFormat(props.format, mergedEnableAlpha.value));
  const mergedRecentColors = computed(() => {
    if (props.recentColors === null || props.recentColors === false) return props.recentColors;
    if (Array.isArray(props.recentColors)) return props.recentColors;
    return innerRecentColors.value;
  });
  const mergedSwatchColors = computed(() => {
    if (props.swatchColors !== undefined) return props.swatchColors;
    return configProvider?.colorPicker?.swatchColors ?? [];
  });
  const colorState = computed(() => parseColorState(mergedValue.value, props.colorModes));
  // 触发器输入框的“草稿值”：Input 的 keepControl 会把 DOM 回写为受控值 triggerInputValue，
  // 如果不在每次击键时同步更新受控值，打字会被下一次 keepControl 覆盖（表现为打字不可用）。
  // 输入事件里把草稿值并入受控值，下一次 keepControl 回写的就是用户敲入的文本。
  const inputDraft = ref<string | null>(null);
  const triggerInputValue = computed(() => {
    if (inputDraft.value !== null) {
      return inputDraft.value;
    }
    if (!mergedValue.value) return '';
    return formatColorState(colorState.value, normalizedFormat.value, mergedEnableAlpha.value);
  });
  const previewStyle = computed<Record<string, string>>(() => {
    const background = getColorBackground(colorState.value);
    const style: Record<string, string> = {};
    style[colorState.value.mode === 'linear-gradient' ? 'backgroundImage' : 'backgroundColor'] =
      background;
    return style;
  });

  const syncValue = (value: string) => {
    if (props.modelValue === undefined) innerValue.value = value;
    emit('update:modelValue', value);
  };

  const syncRecentColors = (value: string[]) => {
    if (props.recentColors === undefined) innerRecentColors.value = value;
    emit('recent-colors-change', value);
  };

  const emitChange = (value: string, trigger: ColorPickerChangeTrigger) => {
    syncValue(value);
    emit('change', value, {
      color: getColorObject(parseColorState(value, props.colorModes)),
      trigger,
    });
  };

  const handleColorChange = (value: string, trigger: ColorPickerChangeTrigger) => {
    if (!props.disabled) emitChange(value, trigger);
  };

  const handleClear = (event: MouseEvent) => {
    inputDraft.value = null;
    syncValue('');
    emit('clear', { e: event });
    emit('change', '', {
      color: getColorObject(parseColorState('', props.colorModes)),
      trigger: 'clear',
    });
  };

  // 只处理提交（blur/Enter）时的 change；空字符串的清除只走 @clear 一个通道，
  // 否则 Input 的 change('') + clear 会各触发一次 handleClear，clear/change 双份 emit。
  const handleTriggerInputChange = (value: string) => {
    inputDraft.value = null;
    if (!value) {
      return;
    }
    const nextState = parseColorState(value, props.colorModes);
    handleColorChange(
      formatColorState(nextState, normalizedFormat.value, mergedEnableAlpha.value),
      'input',
    );
  };

  // keepControl 每次击键都会把受控值回写进 DOM——把敲入文本并入受控值（草稿），
  // 这样下一次 keepControl 回写的就是用户敲入的文本，打字才不会被覆盖。
  const handleTriggerInput = (value: string) => {
    inputDraft.value = value;
  };

  // 外部值变化（含自身提交后的回写）时丢弃草稿，展示格式化后的颜色文本
  watch(mergedValue, () => {
    inputDraft.value = null;
  });

  const onPopupVisibleChange = (visible: boolean) => {
    popupVisible.value = visible;
    emit('popup-visible-change', visible, triggerInputValue.value);
  };

  const handlePaletteBarChange = (context: { color: ColorObject }) => {
    emit('palette-bar-change', context);
  };

  const { tipVisible, show: showReadonlyTip } = useReadonlyTip(
    toRef(props, 'readonly'),
    toRef(props, 'disabled'),
  );
  const readonlyTipText = useReadonlyTipText(toRef(props, 'readonly'));
  const mergedTriggerProps = computed(
    () =>
      ({
        trigger: 'click',
        position: 'bl',
        disabled: props.disabled || !!props.readonly,
        popupOffset: 4,
        animationName: 'slide-dynamic-origin',
        ...props.triggerProps,
        floatingOptions: props.floatingOptions ?? props.triggerProps?.floatingOptions,
      }) satisfies Partial<TriggerProps>,
  );
  const triggerSlotProps = computed<ColorPickerTriggerSlotProps>(() => ({
    value: mergedValue.value,
    displayValue: triggerInputValue.value,
    color: getColorObject(colorState.value),
    popupVisible: popupVisible.value,
    disabled: props.disabled,
    readonly: Boolean(props.readonly),
    format: normalizedFormat.value,
    previewStyle: previewStyle.value,
  }));
</script>
