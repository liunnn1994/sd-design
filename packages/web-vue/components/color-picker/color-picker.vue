<template>
  <DefinePanel>
    <Panel
      :value="mergedValue"
      :color-modes="props.colorModes"
      :enable-multiple-gradient="props.enableMultipleGradient"
      :recent-colors="mergedRecentColors"
      :swatch-colors="mergedSwatchColors"
      :disabled="props.disabled || !!props.readonly"
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

  import { createColorPicker, getColorPreviewStyle } from '@sdata/web-core/color-picker/foundation';
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
  import { getColorObject, normalizeFormat, parseColorState } from './utils';

  defineOptions({ name: 'ColorPicker' });

  const props = defineProps({
    /**
     * @zh 是否无边框
     * @en Whether the trigger has no border
     */
    borderless: Boolean,
    /**
     * @zh 是否可清空
     * @en Whether the value can be cleared
     */
    clearable: Boolean,
    /**
     * @zh 可选的颜色模式
     * @en Selectable colour modes
     */
    colorModes: {
      type: Array as PropType<ColorModes>,
      default: () => ['monochrome'],
    },
    /**
     * @zh 是否支持多段渐变
     * @en Whether multi-stop gradients are supported
     */
    enableMultipleGradient: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 绑定值
     * @en Value of the picker
     */
    modelValue: String,
    /**
     * @zh 默认值（非受控状态）
     * @en Default value (uncontrolled state)
     */
    defaultValue: {
      type: String,
      default: '',
    },
    /**
     * @zh 值的格式
     * @en Format of the value
     */
    format: {
      type: String as PropType<ColorFormat | LegacyFormat>,
      default: 'RGB',
    },
    /**
     * @zh 尺寸
     * @en Size of the picker
     */
    size: {
      type: String as PropType<Size | 'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    /**
     * @zh 是否支持透明度
     * @en Whether the alpha channel is supported
     */
    enableAlpha: Boolean,
    /**
     * @zh 是否展示当前颜色预览
     * @en Whether to show the current colour preview
     */
    showPrimaryColorPreview: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 输入框的组件属性
     * @en Props forwarded to the inner input
     */
    inputProps: {
      type: Object as PropType<Record<string, unknown>>,
    },
    /**
     * @zh 最近使用的颜色
     * @en Recently used colours
     */
    recentColors: {
      type: [Array, Boolean] as PropType<RecentColorsValue>,
      default: undefined,
    },
    /**
     * @zh 默认的最近使用颜色
     * @en Default recently used colours
     */
    defaultRecentColors: {
      type: [Array, Boolean] as PropType<RecentColorsValue>,
      default: () => [],
    },
    /**
     * @zh 色板预设颜色
     * @en Preset swatch colours
     */
    swatchColors: {
      type: Array as PropType<string[] | null>,
      default: undefined,
    },
    /**
     * @zh 是否禁用
     * @en Whether the picker is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否只读
     * @en Whether the picker is readonly
     */
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    /**
     * @zh 是否隐藏触发器
     * @en Whether to hide the trigger
     */
    hideTrigger: Boolean,
    /**
     * @zh 触发器的组件属性
     * @en Props forwarded to the trigger
     */
    triggerProps: {
      type: Object as PropType<Partial<TriggerProps>>,
    },
    /**
     * @zh 浮层的定位配置
     * @en Floating options of the popup
     */
    floatingOptions: {
      type: Object as PropType<FloatingOptions>,
    },
  });

  const emit = defineEmits<{
    'update:modelValue': [_value: string];
    /**
     * @zh 选中颜色变化时触发
     * @en Trigger when the selected colour changes
     */
    'change': [_value: string, _context: { color: ColorObject; trigger: ColorPickerChangeTrigger }];
    /**
     * @zh 取色面板显示状态变化时触发
     * @en Trigger when the panel visibility changes
     */
    'popup-visible-change': [_visible: boolean, _value: string];
    /**
     * @zh 点击清除按钮时触发
     * @en Trigger when the clear button is clicked
     */
    'clear': [_context: { e: MouseEvent }];
    /**
     * @zh 调色板上的颜色变化时触发
     * @en Trigger when the colour on the palette bar changes
     */
    'palette-bar-change': [_context: { color: ColorObject }];
    /**
     * @zh 最近使用的颜色变化时触发
     * @en Trigger when the recently used colours change
     */
    'recent-colors-change': [_value: string[]];
  }>();

  defineSlots<{
    default(): unknown;
    trigger(props: ColorPickerTriggerSlotProps): unknown;
  }>();

  const [DefinePanel, ReusePanel] = createReusableTemplate();
  const prefixCls = getPrefixCls('color-picker');
  const configProvider = inject(configProviderInjectionKey, undefined);
  const innerValue = ref(props.defaultValue);
  const innerPopupVisible = ref(props.triggerProps?.defaultPopupVisible ?? false);
  const popupVisible = computed(() => props.triggerProps?.popupVisible ?? innerPopupVisible.value);
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
  const foundation = createColorPicker({
    props,
    get value() {
      return mergedValue.value;
    },
    get format() {
      return normalizedFormat.value;
    },
    get state() {
      return colorState.value;
    },
    get draft() {
      return inputDraft.value;
    },
    set draft(value) {
      inputDraft.value = value;
    },
    setInner(value) {
      innerValue.value = value;
    },
    setRecent(value) {
      innerRecentColors.value = value;
    },
    setPopup(value) {
      innerPopupVisible.value = value;
    },
    onUpdate(value) {
      emit('update:modelValue', value);
    },
    onChange(value, context) {
      emit('change', value, context);
    },
    onClear(context) {
      emit('clear', context);
    },
    onRecentChange(value) {
      emit('recent-colors-change', value);
    },
    onPopupChange(value, display) {
      emit('popup-visible-change', value, display);
    },
  });
  const triggerInputValue = computed(foundation.display);
  const previewStyle = computed(() => getColorPreviewStyle(colorState.value));
  const syncRecentColors = foundation.recent;
  const handleColorChange = foundation.change;
  const handleClear = foundation.clear;
  const handleTriggerInputChange = foundation.commit;
  const handleTriggerInput = foundation.input;
  const onPopupVisibleChange = foundation.popup;
  watch(mergedValue, foundation.syncValue);

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
