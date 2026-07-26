<template>
  <div
    v-bind="$attrs"
    :class="[
      prefixCls,
      switchCls,
      context?.classNames.value?.switch,
      classNames?.root,
      {
        [`${switchCls}-checked`]: mergedChecked,
      },
    ]"
    :style="[context?.styles.value?.switch, styles?.root]"
  >
    <Button
      type="outline"
      :disabled="disabled"
      :loading="loading"
      :class="[`${switchCls}-content`, classNames?.content]"
      :style="styles?.content"
      @click="handleChange"
    >
      <template v-if="$slots.icon" #icon>
        <span :class="classNames?.icon" :style="styles?.icon"><slot name="icon" /></span>
      </template>
      <span :class="classNames?.title" :style="styles?.title">
        <slot :checked="mergedChecked">
          <slot v-if="mergedChecked" name="checked" />
          <slot v-else name="unchecked" />
        </slot>
      </span>
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, inject, shallowRef, watch } from 'vue';

  import type { SenderSwitchProps } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import { senderInjectionKey } from './context';

  defineOptions({ name: 'SenderSwitch', inheritAttrs: false });

  const props = withDefaults(defineProps<SenderSwitchProps>(), {
    defaultValue: false,
    classNames: () => ({}),
    styles: () => ({}),
  });
  const emit = defineEmits<{
    'update:modelValue': [checked: boolean];
    'change': [checked: boolean];
  }>();

  const instance = getCurrentInstance();
  const context = inject(senderInjectionKey, undefined);
  const prefixCls = context?.prefixCls ?? getPrefixCls('sender');
  const switchCls = `${prefixCls}-switch`;
  const innerChecked = shallowRef(props.defaultValue);
  const controlled = computed(() => Object.hasOwn(instance?.vnode.props ?? {}, 'modelValue'));
  const mergedChecked = computed(() =>
    controlled.value ? Boolean(props.modelValue) : innerChecked.value,
  );

  watch(
    () => props.defaultValue,
    (value) => {
      if (!controlled.value) innerChecked.value = value;
    },
  );

  const handleChange = () => {
    if (props.disabled || props.loading) return;
    const nextChecked = !mergedChecked.value;
    if (!controlled.value) innerChecked.value = nextChecked;
    emit('update:modelValue', nextChecked);
    emit('change', nextChecked);
  };
</script>
