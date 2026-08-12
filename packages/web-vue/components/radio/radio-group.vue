<template>
  <span role="radiogroup" :class="cls">
    <template v-if="options.length > 0">
      <Radio
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
        :model-value="computedValue === option.value"
      >
        <slot v-if="$slots.label" name="label" :data="option" />
        <RenderOptionLabel v-else :option="option" />
      </Radio>
    </template>
    <slot v-else />
  </span>
</template>

<script setup lang="ts">
  import type { PropType, VNode } from 'vue';
  import {
    computed,
    defineComponent,
    getCurrentInstance,
    provide,
    reactive,
    ref,
    toRef,
    watch,
  } from 'vue';

  import type { Direction, Size } from '../_utils/constant';
  import type { RadioType } from './context';
  import type { RadioOption } from './interface';

  import { useFormItem } from '../_hooks/use-form-item';
  import { useSize } from '../_hooks/use-size';
  import { getPrefixCls } from '../_utils/global-config';
  import { isFunction, isNull, isNumber, isString, isUndefined } from '../_utils/is';
  import { radioGroupKey } from './context';
  import Radio from './radio.vue';

  type RadioValue = string | number | boolean;

  defineOptions({ name: 'RadioGroup' });

  const props = withDefaults(
    defineProps<{
      /** @zh 绑定值 @en Value @vModel */
      modelValue?: RadioValue;
      /** @zh 默认值（非受控状态） @en Default value (uncontrolled state) */
      defaultValue?: RadioValue;
      /** @zh 单选框组的类型 @en Types of radio group */
      type?: RadioType;
      /** @zh 单选框组的尺寸 @en The size of the radio group */
      size?: Size;
      /** @zh 选项 @en Options @version 2.27.0 */
      options?: Array<string | number | RadioOption>;
      /** @zh 单选框组的方向 @en The direction of the radio group */
      direction?: Direction;
      /** @zh 是否禁用 @en Whether to disable */
      disabled?: boolean;
    }>(),
    {
      modelValue: undefined,
      defaultValue: '',
      type: 'radio',
      direction: 'horizontal',
      disabled: false,
    },
  );

  const emit = defineEmits<{
    'update:modelValue': [value: RadioValue];
    /** @zh 值改变时触发 @en Trigger when the value changes */
    'change': [value: RadioValue, ev: Event];
  }>();
  const slots = defineSlots<{
    default?: () => VNode[];
    /** @zh radio 文案内容 @en radio label content @version 2.27.0 */
    label?: (props: { data: RadioOption }) => VNode[];
    /** @zh 自定义单选框 @en Custom radio @version 2.27.0 */
    radio?: (props: { checked: boolean; disabled: boolean }) => VNode[];
  }>();
  const RenderOptionLabel = defineComponent({
    name: 'RadioGroupRenderOptionLabel',
    props: {
      option: {
        type: Object as PropType<RadioOption>,
        required: true,
      },
    },
    setup(renderProps) {
      return () =>
        isFunction(renderProps.option.label)
          ? renderProps.option.label()
          : renderProps.option.label;
    },
  });
  const prefixCls = getPrefixCls('radio-group');
  const {
    mergedDisabled,
    mergedSize: formItemSize,
    eventHandlers,
  } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
  });
  const { mergedSize } = useSize(formItemSize);
  const internalValue = ref(props.defaultValue);
  const computedValue = computed(() => props.modelValue ?? internalValue.value);
  const options = computed(() =>
    (props.options ?? []).map((option) => {
      if (isString(option) || isNumber(option)) {
        return {
          label: option,
          value: option,
        } as RadioOption;
      }
      return option;
    }),
  );
  const cls = computed(() => [
    `${prefixCls}${props.type === 'button' ? '-button' : ''}`,
    `${prefixCls}-size-${mergedSize.value}`,
    `${prefixCls}-direction-${props.direction}`,
    {
      [`${prefixCls}-disabled`]: mergedDisabled.value,
    },
  ]);
  const handleChange = (value: RadioValue, event: Event) => {
    internalValue.value = value;
    emit('update:modelValue', value);
    emit('change', value, event);
    eventHandlers.value?.onChange?.(event);
  };

  provide(
    radioGroupKey,
    reactive({
      name: 'SDRadioGroup' as const,
      inputName: `${prefixCls}-${getCurrentInstance()!.uid}`,
      value: computedValue,
      size: mergedSize,
      type: toRef(props, 'type'),
      disabled: mergedDisabled,
      slots,
      handleChange,
    }),
  );

  watch(computedValue, (value) => {
    if (internalValue.value !== value) {
      internalValue.value = value;
    }
  });
  watch(
    () => props.modelValue,
    (value) => {
      if (isUndefined(value) || isNull(value)) {
        internalValue.value = '';
      }
    },
  );
</script>
