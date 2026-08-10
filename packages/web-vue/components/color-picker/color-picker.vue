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
  import { computed, inject, ref, toRef } from 'vue';
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
  const triggerInputValue = computed(() => {
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
    syncValue('');
    emit('clear', { e: event });
    emit('change', '', {
      color: getColorObject(parseColorState('', props.colorModes)),
      trigger: 'clear',
    });
  };

  const handleTriggerInputChange = (value: string) => {
    if (!value) {
      handleClear(new MouseEvent('click'));
      return;
    }
    const nextState = parseColorState(value, props.colorModes);
    handleColorChange(
      formatColorState(nextState, normalizedFormat.value, mergedEnableAlpha.value),
      'input',
    );
  };

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
