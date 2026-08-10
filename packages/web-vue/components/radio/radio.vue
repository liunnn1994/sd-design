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
  import type { VNode } from 'vue';
  import { computed, inject, nextTick, ref, toRef, watch } from 'vue';

  import type { RadioType } from './context';

  import IconHover from '../_components/icon-hover.vue';
  import { useFormItem } from '../_hooks/use-form-item';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNull, isUndefined } from '../_utils/is';
  import { radioGroupKey } from './context';

  type RadioValue = string | number | boolean;

  defineOptions({ name: 'Radio' });

  const props = withDefaults(
    defineProps<{
      /** @zh 绑定值 @en Value @vModel */
      modelValue?: RadioValue;
      /** @zh 默认是否选中（非受控状态） @en Whether checked by default (uncontrolled state) */
      defaultChecked?: boolean;
      /** @zh 选项的 `value` @en The `value` of the option */
      value?: RadioValue;
      /** @zh 单选的类型 @en Radio type */
      type?: RadioType;
      /** @zh 是否禁用 @en Whether to disable */
      disabled?: boolean;
      /** @private */
      uninjectGroupContext?: boolean;
    }>(),
    {
      defaultChecked: false,
      value: true,
      type: 'radio',
      disabled: false,
      uninjectGroupContext: false,
    },
  );

  const emit = defineEmits<{
    'update:modelValue': [value: RadioValue];
    /** @zh 值改变时触发 @en Trigger when the value changes */
    'change': [value: RadioValue, ev: Event];
  }>();
  const slots = defineSlots<{
    default?: () => VNode[];
    /** @zh 自定义单选框 @en Custom radio @version 2.18.0 */
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
  const computedChecked = computed(() => {
    if (isGroup.value) {
      return radioGroupCtx?.value === resolvedValue.value;
    }
    if (!isUndefined(props.modelValue)) {
      return props.modelValue === resolvedValue.value;
    }
    return internalChecked.value;
  });
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
  const handleChange = (event: Event) => {
    internalChecked.value = true;
    if (isGroup.value) {
      radioGroupCtx?.handleChange(resolvedValue.value, event);
    } else {
      emit('update:modelValue', resolvedValue.value);
      emit('change', resolvedValue.value, event);
      eventHandlers.value?.onChange?.(event);
    }

    nextTick(() => {
      if (inputRef.value && inputRef.value.checked !== computedChecked.value) {
        inputRef.value.checked = computedChecked.value;
      }
    });
  };

  watch(
    () => props.modelValue,
    (value) => {
      if (isUndefined(value) || isNull(value)) {
        internalChecked.value = false;
      }
    },
  );
  watch(computedChecked, (value, previousValue) => {
    if (value !== previousValue) {
      internalChecked.value = value;
      if (inputRef.value) {
        inputRef.value.checked = value;
      }
    }
  });
</script>
