<template>
  <label :class="cls">
    <input
      ref="inputRef"
      type="radio"
      :checked="computedChecked"
      :value="value"
      :name="radioGroupCtx?.inputName"
      :class="`${prefixCls}-target`"
      :disabled="mergedDisabled"
      @click="handleClick"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <template v-if="mergedType === 'radio'">
      <slot
        v-if="$slots.radio"
        name="radio"
        :checked="computedChecked"
        :disabled="mergedDisabled"
      />
      <RenderGroupRadio v-else-if="radioGroupCtx?.slots.radio" />
      <template v-else>
        <IconHover :class="`${prefixCls}-icon-hover`" :disabled="mergedDisabled || computedChecked">
          <span :class="`${prefixCls}-icon`" />
        </IconHover>
        <span v-if="$slots.default" :class="`${prefixCls}-label`">
          <slot />
        </span>
      </template>
    </template>
    <span v-else :class="`${prefixCls}-button-content`">
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
  import type { RadioValue } from '@sdata/web-core/radio/types';

  import type { VNode } from 'vue';
  import { computed, inject, nextTick, ref, toRef, watch } from 'vue';

  import { createRadioFoundation } from '@sdata/web-core/radio/foundation';

  import type { RadioType } from './context';

  import IconHover from '../_components/icon-hover.vue';
  import { useFormItem } from '../_hooks/use-form-item';
  import { getPrefixCls } from '../_utils/global-config';
  import { radioGroupKey } from './context';

  defineOptions({ name: 'Radio' });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 绑定值
       * @en Value
       * @vModel
       */
      modelValue?: RadioValue;
      /**
       * @zh 默认是否选中（非受控状态）
       * @en Whether checked by default (uncontrolled state)
       */
      defaultChecked?: boolean;
      /**
       * @zh 选项的 `value`
       * @en The `value` of the option
       */
      value?: RadioValue;
      /**
       * @zh 单选的类型
       * @en Radio type
       */
      type?: RadioType;
      /**
       * @zh 是否禁用
       * @en Whether to disable
       */
      disabled?: boolean;
      /**
       * @private
       * @zh 是否忽略外层 Group 的上下文
       * @en Whether to ignore the outer Group context
       */
      uninjectGroupContext?: boolean;
    }>(),
    {
      modelValue: undefined,
      defaultChecked: false,
      value: true,
      type: 'radio',
      disabled: false,
      uninjectGroupContext: false,
    },
  );

  const emit = defineEmits<{
    'update:modelValue': [value: RadioValue];
    /**
     * @zh 值改变时触发
     * @en Trigger when the value changes
     */
    'change': [value: RadioValue, ev: Event];
  }>();
  defineSlots<{
    default?: () => VNode[];
    /**
     * @zh 自定义单选框
     * @en Custom radio
     * @version 2.18.0
     */
    radio?: (props: { checked: boolean; disabled: boolean }) => VNode[];
  }>();
  const prefixCls = getPrefixCls('radio');
  const radioGroupCtx = !props.uninjectGroupContext ? inject(radioGroupKey, undefined) : undefined;
  const { mergedDisabled: formItemDisabled, eventHandlers } = useFormItem({
    disabled: toRef(props, 'disabled'),
  });
  const inputRef = ref<HTMLInputElement | null>(null);
  const internalChecked = ref(props.defaultChecked);
  const resolvedValue = computed(() => props.value ?? true);
  const isGroup = computed(() => radioGroupCtx?.name === 'SDRadioGroup');
  const mergedType = computed(() => radioGroupCtx?.type ?? props.type);
  const mergedDisabled = computed(() => radioGroupCtx?.disabled || formItemDisabled.value);
  const foundation = createRadioFoundation<Event>({
    isGroup: () => isGroup.value,
    getGroupValue: () => radioGroupCtx?.value,
    getModel: () => props.modelValue,
    getInternalChecked: () => internalChecked.value,
    getResolvedValue: () => resolvedValue.value,
    setInternalChecked: (value) => {
      internalChecked.value = value;
    },
    onGroupChange: (value, event) => radioGroupCtx?.handleChange(value, event),
    onUpdate: (value) => emit('update:modelValue', value),
    onChange: (value, event) => emit('change', value, event),
    onFormChange: (event) => eventHandlers.value?.onChange?.(event),
    afterChange: () =>
      nextTick(() => {
        if (inputRef.value && inputRef.value.checked !== computedChecked.value) {
          inputRef.value.checked = computedChecked.value;
        }
      }),
  });
  const computedChecked = computed(foundation.isChecked);
  const cls = computed(() => [
    mergedType.value === 'button' ? `${prefixCls}-button` : prefixCls,
    {
      [`${prefixCls}-checked`]: computedChecked.value,
      [`${prefixCls}-disabled`]: mergedDisabled.value,
    },
  ]);
  const RenderGroupRadio = () =>
    radioGroupCtx?.slots.radio?.({
      checked: computedChecked.value,
      disabled: mergedDisabled.value,
    });
  const handleFocus = (event: FocusEvent) => {
    eventHandlers.value?.onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent) => {
    eventHandlers.value?.onBlur?.(event);
  };
  const handleClick = (event: Event) => {
    event.stopPropagation();
  };
  const handleChange = foundation.change;

  watch(() => props.modelValue, foundation.syncModel);
  watch(
    [computedChecked, () => radioGroupCtx?.changeCount],
    ([value]) => {
      internalChecked.value = value;
      if (inputRef.value) {
        inputRef.value.checked = value;
      }
    },
    { flush: 'post' },
  );
</script>
