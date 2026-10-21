<template>
  <component
    :is="customComponent"
    ref="formRef"
    :class="rootClass"
    auto-label-width
    :model="workingModel"
    v-bind="$attrs"
  >
    <slot v-if="hasDefaultSlot" />
    <template v-else>
      <JsonFormItem
        v-for="schema in normalizedSchemas"
        :key="schema.field"
        :model-value="workingModel"
        @update:model-value="handleWorkingModelUpdate"
        :schema="schema"
        :adapter="resolvedAdapter"
        :components="resolvedComponents"
        :prefix-cls="prefixCls"
        :hide-label="hideLabel"
        :hide-asterisk="hideAsterisk"
        :show-colon="showColon"
      >
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps" />
        </template>
      </JsonFormItem>
    </template>
  </component>
</template>

<script lang="ts" setup>
  import type { Component } from 'vue';
  import {
    reactive,
    Comment,
    computed,
    inject,
    onBeforeUpdate,
    shallowRef,
    useSlots,
    watch,
  } from 'vue';

  import { createJsonFormFoundation } from '@sdata/web-core/json-form/foundation';

  import type { FormInstance } from '../form';

  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import DefaultForm from '../form/form.vue';
  import JsonFormItem from './json-form-item.vue';
  import { type JsonFormModel, type JsonFormProps, type JsonFormSchema } from './types';
  import { resolveJsonFormComponents, translateA2UI_0_9_1ToJsonFormSchemas } from './utils';

  defineOptions({
    name: 'JsonForm',
    inheritAttrs: false,
  });

  const props = withDefaults(defineProps<JsonFormProps>(), {
    adapter: undefined,
    modelValue: undefined,
    model: undefined,
    hideLabel: false,
    hideAsterisk: false,
    showColon: false,
    component: undefined,
  });

  const emit = defineEmits<{
    'update:modelValue': [value: JsonFormModel];
  }>();

  const formRef = shallowRef<FormInstance | null>(null);
  // 非受控模式下用 reactive 代理共享 model 对象：JsonFormItem 就地变更即可触发
  // 响应式，同时保持与传入对象引用一致（不可变更新的父组件走受控 v-model 分支）。
  const internalModel = shallowRef<JsonFormModel>(reactive(props.model ?? {}));
  const configProvider = inject(configProviderInjectionKey, undefined);
  const slots = useSlots();
  const defaultSlot = shallowRef(slots.default);
  onBeforeUpdate(() => {
    defaultSlot.value = slots.default;
  });
  const prefixCls = getPrefixCls('json-form');

  const foundation = createJsonFormFoundation<JsonFormSchema<string>>({
    getControlledModel: () => props.modelValue,
    getInternalModel: () => internalModel.value,
    setInternalModel: (model) => {
      internalModel.value = model;
    },
    wrapModel: reactive,
    getAdapter: () => props.adapter,
    getGlobalAdapter: () => configProvider?.jsonForm?.adapter,
    getSchemas: () => props.schemas,
    translate: translateA2UI_0_9_1ToJsonFormSchemas,
    onUpdate: (value) => emit('update:modelValue', value),
  });
  watch(() => props.model, foundation.syncModel, { immediate: true });
  const workingModel = computed(foundation.getWorkingModel);
  const handleWorkingModelUpdate = foundation.publish;
  const resolvedAdapter = computed(foundation.getAdapter);

  const resolvedComponents = computed(() => {
    return resolveJsonFormComponents(configProvider?.jsonForm?.components);
  });

  const normalizedSchemas = computed(foundation.getSchemas);

  const customComponent = computed<Component | string>(() => {
    return props.component ?? DefaultForm;
  });

  const hasDefaultSlot = computed(() => {
    return (defaultSlot.value?.() ?? []).some((node) => node.type !== Comment);
  });

  const rootClass = computed(() => [prefixCls, `${prefixCls}--${resolvedAdapter.value}`]);

  type ValidateArgs = Parameters<FormInstance['validate']>;
  type ValidateFieldArgs = Parameters<FormInstance['validateField']>;
  type ResetFieldsArgs = Parameters<FormInstance['resetFields']>;
  type ClearValidateArgs = Parameters<FormInstance['clearValidate']>;
  type SetFieldsArgs = Parameters<FormInstance['setFields']>;
  type ScrollToFieldArgs = Parameters<FormInstance['scrollToField']>;

  defineExpose({
    validate: (...args: ValidateArgs) => formRef.value?.validate(...args),
    validateField: (...args: ValidateFieldArgs) => formRef.value?.validateField(...args),
    resetFields: (...args: ResetFieldsArgs) => formRef.value?.resetFields(...args),
    clearValidate: (...args: ClearValidateArgs) => formRef.value?.clearValidate(...args),
    setFields: (...args: SetFieldsArgs) => formRef.value?.setFields(...args),
    scrollToField: (...args: ScrollToFieldArgs) => formRef.value?.scrollToField(...args),
  });
</script>
