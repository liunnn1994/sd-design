<template>
  <label :aria-disabled="mergedDisabled" :class="cls">
    <input
      ref="checkboxRef"
      type="checkbox"
      :tabindex="tabindex"
      :checked="computedChecked"
      :value="value"
      :class="`${prefixCls}-target`"
      :disabled="mergedDisabled"
      @click="handleClick"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <slot
      v-if="$slots.checkbox"
      name="checkbox"
      :checked="computedChecked"
      :disabled="mergedDisabled"
    />
    <RenderGroupCheckbox v-else-if="checkboxGroupCtx?.slots.checkbox" />
    <IconHover
      v-else
      :class="`${prefixCls}-icon-hover`"
      :disabled="mergedDisabled || computedChecked"
    >
      <div :class="`${prefixCls}-icon`">
        <IconCheck v-if="computedChecked" :class="`${prefixCls}-icon-check`" />
      </div>
    </IconHover>
    <span v-if="$slots.default" :class="`${prefixCls}-label`">
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { computed, inject, nextTick, ref, toRef, watch } from 'vue';

  import {
    createCheckboxFoundation,
    getCheckboxChecked,
    getCheckboxDisabled,
    type CheckboxValue,
    type CheckboxModelValue,
  } from '@sdata/web-core/checkbox/foundation';

  import IconHover from '../_components/icon-hover.vue';
  import { useFormItem } from '../_hooks/use-form-item';
  import { getPrefixCls } from '../_utils/global-config';
  import { isArray } from '../_utils/is';
  import { checkboxGroupKey } from './context';
  import IconCheck from './icon-check.vue';

  defineOptions({ name: 'Checkbox' });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 绑定值
       * @en Value
       * @vModel
       */
      modelValue?: CheckboxModelValue;
      /**
       * @zh 默认是否选中（非受控状态）
       * @en Whether checked by default (uncontrolled state)
       */
      defaultChecked?: boolean;
      /**
       * @zh 选项的 `value`
       * @en The `value` of the option
       */
      value?: CheckboxValue;
      /**
       * @zh 是否禁用
       * @en Whether to disable
       */
      disabled?: boolean;
      /**
       * @zh 是否为半选状态
       * @en Whether it is half-selected
       */
      indeterminate?: boolean;
      /**
       * @zh 原生 input 的 tabindex（默认不渲染，input 保持原生可聚焦；树节点内传 -1 把 checkbox 移出 Tab 序列，改由 treeitem 统一聚焦/操作）
       * @en tabindex for the native input (omitted by default so the input stays natively focusable; pass -1 in tree nodes to remove the checkbox from the Tab order and operate it via the treeitem)
       */
      tabindex?: number | string;
      /**
       * @private
       * @zh 是否忽略外层 Group 的上下文
       * @en Whether to ignore the outer Group context
       */
      uninjectGroupContext?: boolean;
    }>(),
    {
      // `modelValue`/`value` 的类型并集含 Boolean：Vue 3.5 对缺失且无 default 的
      // Boolean-cast prop 会取 `false` 而非 `undefined`，击穿 `?? internalChecked` / `?? true`
      // 的非受控链路（radio 通过显式 `modelValue: undefined` default 规避了这一点）。
      modelValue: undefined,
      value: undefined,
      defaultChecked: false,
      disabled: false,
      indeterminate: false,
      uninjectGroupContext: false,
    },
  );

  const emit = defineEmits<{
    'update:modelValue': [value: CheckboxModelValue];
    /**
     * @zh 值改变时触发
     * @en Trigger when the value changes
     */
    'change': [value: CheckboxModelValue, ev: Event];
  }>();
  defineSlots<{
    default?: () => VNode[];
    /**
     * @zh 自定义复选框
     * @en Custom checkbox
     * @version 2.18.0
     */
    checkbox?: (props: { checked: boolean; disabled: boolean }) => VNode[];
  }>();
  const prefixCls = getPrefixCls('checkbox');
  const checkboxRef = ref<HTMLInputElement | null>(null);
  const checkboxGroupCtx = !props.uninjectGroupContext
    ? inject(checkboxGroupKey, undefined)
    : undefined;
  const isGroup = checkboxGroupCtx?.name === 'SDCheckboxGroup';
  if (import.meta.env.DEV && isGroup && props.value === undefined) {
    // oxlint-disable-next-line no-console -- dev-only 用户提示
    console.warn(
      '[SdCheckbox] 组内子项未传 `value` prop，将向组数组贡献布尔 `true`。' +
        '请为组内每个 Checkbox 显式声明 `value`。',
    );
  }
  const { mergedDisabled: formItemDisabled, eventHandlers } = useFormItem({
    disabled: toRef(props, 'disabled'),
  });
  const internalChecked = ref(props.defaultChecked);
  const resolvedValue = computed(() => props.value ?? true);
  const computedValue = computed(() =>
    isGroup ? checkboxGroupCtx?.computedValue : (props.modelValue ?? internalChecked.value),
  );
  const foundation = createCheckboxFoundation<Event>({
    getValue: () => computedValue.value,
    getResolvedValue: () => resolvedValue.value,
    isGroup: () => isGroup,
    setInternalChecked: (value) => {
      internalChecked.value = value;
    },
    onGroupChange: (value, event) => checkboxGroupCtx?.handleChange(value, event),
    onUpdate: (value) => emit('update:modelValue', value),
    onChange: (value, event) => emit('change', value, event),
    onFormChange: (event) => eventHandlers.value?.onChange?.(event),
    afterChange: () =>
      nextTick(() => {
        if (checkboxRef.value) checkboxRef.value.indeterminate = props.indeterminate;
        if (checkboxRef.value && checkboxRef.value.checked !== computedChecked.value) {
          checkboxRef.value.checked = computedChecked.value;
        }
      }),
  });
  const computedChecked = computed<boolean>(() =>
    getCheckboxChecked(computedValue.value, resolvedValue.value)!,
  );
  const mergedDisabled = computed(() =>
    getCheckboxDisabled(
      checkboxGroupCtx?.disabled,
      formItemDisabled.value,
      computedChecked.value,
      checkboxGroupCtx?.isMaxed,
    ),
  );
  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-checked`]: computedChecked.value,
      [`${prefixCls}-indeterminate`]: props.indeterminate,
      [`${prefixCls}-disabled`]: mergedDisabled.value,
    },
  ]);
  const RenderGroupCheckbox = () =>
    checkboxGroupCtx?.slots.checkbox?.({
      checked: computedChecked.value,
      disabled: mergedDisabled.value,
    });
  const handleClick = (event: Event) => {
    event.stopPropagation();
  };
  const handleChange = (event: Event) =>
    foundation.change((event.target as HTMLInputElement).checked, event);
  const handleFocus = (event: FocusEvent) => {
    eventHandlers.value?.onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent) => {
    eventHandlers.value?.onBlur?.(event);
  };

  watch(() => props.modelValue, foundation.syncModel);
  watch(computedValue, (value) => {
    const checked = isArray(value) ? value.includes(resolvedValue.value) : value;
    if (internalChecked.value !== checked) {
      internalChecked.value = checked;
    }
    if (checkboxRef.value && checkboxRef.value.checked !== checked) {
      checkboxRef.value.checked = checked;
    }
  });
  // 原生 checkbox 的 indeterminate 是 IDL 属性，必须通过 JS 设置。
  watch(
    () => props.indeterminate,
    () => {
      nextTick(() => {
        if (checkboxRef.value) {
          checkboxRef.value.indeterminate = props.indeterminate;
        }
      });
    },
    { immediate: true },
  );
</script>
