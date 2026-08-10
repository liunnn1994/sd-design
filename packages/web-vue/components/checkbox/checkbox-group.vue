<template>
  <span role="group" :class="cls">
    <template v-if="options.length > 0">
      <Checkbox
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled || (!isChecked(option) && isMaxed)"
        :indeterminate="option.indeterminate"
        :model-value="isChecked(option)"
      >
        <slot v-if="$slots.label" name="label" :data="option" />
        <RenderOptionLabel v-else :option="option" />
      </Checkbox>
    </template>
    <slot v-else />
  </span>
</template>

<script setup lang="ts">
  import type { PropType, VNode } from 'vue';
  import { computed, defineComponent, provide, reactive, ref, toRef, watch } from 'vue';

  import type { Direction } from '../_utils/constant';
  import type { CheckboxOption } from './interface';

  import { useFormItem } from '../_hooks/use-form-item';
  import { getPrefixCls } from '../_utils/global-config';
  import { isArray, isFunction, isNumber, isString } from '../_utils/is';
  import Checkbox from './checkbox.vue';
  import { checkboxGroupKey } from './context';

  type CheckboxValue = string | number | boolean;

  defineOptions({ name: 'CheckboxGroup' });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 绑定值
       * @en Value
       * @vModel
       */
      modelValue?: CheckboxValue[];
      /**
       * @zh 默认值（非受控状态）
       * @en Default value (uncontrolled state)
       */
      defaultValue?: CheckboxValue[];
      /**
       * @zh 支持最多选中的数量
       * @en Support the maximum number of selections
       * @version 2.36.0
       */
      max?: number;
      /**
       * @zh 选项
       * @en Options
       * @version 2.27.0
       */
      options?: Array<string | number | CheckboxOption>;
      /**
       * @zh 复选框的排列方向
       * @en Arrangement direction of checkboxes
       */
      direction?: Direction;
      /**
       * @zh 是否禁用
       * @en Whether to disable
       */
      disabled?: boolean;
    }>(),
    {
      defaultValue: () => [],
      direction: 'horizontal',
      disabled: false,
    },
  );

  const emit = defineEmits<{
    'update:modelValue': [value: CheckboxValue[]];
    /**
     * @zh 值改变时触发
     * @en Trigger when the value changes
     */
    'change': [value: CheckboxValue[], ev: Event];
  }>();
  const slots = defineSlots<{
    default?: () => VNode[];
    /**
     * @zh checkbox 文案内容
     * @en checkbox label content
     * @version 2.27.0
     */
    label?: (props: { data: CheckboxOption }) => VNode[];
    /**
     * @zh 自定义复选框
     * @en Custom checkbox
     * @version 2.27.0
     */
    checkbox?: (props: { checked: boolean; disabled: boolean }) => VNode[];
  }>();
  const RenderOptionLabel = defineComponent({
    name: 'CheckboxGroupRenderOptionLabel',
    props: {
      option: {
        type: Object as PropType<CheckboxOption>,
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
  const prefixCls = getPrefixCls('checkbox-group');
  const { mergedDisabled, eventHandlers } = useFormItem({
    disabled: toRef(props, 'disabled'),
  });
  const internalValue = ref(props.defaultValue);
  const computedValue = computed(() =>
    isArray(props.modelValue) ? props.modelValue : internalValue.value,
  );
  const isMaxed = computed(() =>
    props.max === undefined ? false : computedValue.value.length >= props.max,
  );
  const options = computed(() =>
    (props.options ?? []).map((option) => {
      if (isString(option) || isNumber(option)) {
        return {
          label: option,
          value: option,
        } as CheckboxOption;
      }
      return option;
    }),
  );
  const cls = computed(() => [prefixCls, `${prefixCls}-direction-${props.direction}`]);
  const isChecked = (option: CheckboxOption) => computedValue.value.includes(option.value);
  const handleChange = (value: CheckboxValue[], event: Event) => {
    internalValue.value = value;
    emit('update:modelValue', value);
    emit('change', value, event);
    eventHandlers.value?.onChange?.(event);
  };

  provide(
    checkboxGroupKey,
    reactive({
      name: 'SDCheckboxGroup' as const,
      computedValue,
      disabled: mergedDisabled,
      isMaxed,
      slots,
      handleChange,
    }),
  );

  watch(
    () => props.modelValue,
    (value) => {
      internalValue.value = isArray(value) ? [...value] : [];
    },
  );
</script>
