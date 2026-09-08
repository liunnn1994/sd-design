<template>
  <slot
    v-if="schema.hidden"
    :name="schema.slotName || 'hidden'"
    :record="schema"
    :value="fieldModel"
  />
  <slot
    v-else-if="schema.type === JSON_FORM_COMPONENT_TYPES.noFormItem"
    :name="schema.slotName || 'default'"
    :record="schema"
    :value="fieldModel"
  />
  <FormItem
    v-else-if="schema.slotName && $slots[schema.slotName]"
    :label="schema.label"
    :field="normalizedField"
    :hide-label="schema.formItemProps?.hideLabel ?? hideLabel"
    :hide-asterisk="schema.formItemProps?.hideAsterisk ?? hideAsterisk"
    :show-colon="schema.formItemProps?.showColon ?? showColon"
    :rules="resolvedRules"
    v-bind="schema.formItemProps"
    v-on="schema.formItemEvents ?? {}"
  >
    <template v-for="name in forwardedSlotNames" #[name]="slotProps">
      <slot :name="name" v-bind="{ ...slotProps, record: schema, value: fieldModel }" />
    </template>
    <slot :name="schema.slotName" :record="schema" :value="fieldModel" />
  </FormItem>
  <FormItem
    v-else-if="schema.render"
    :label="schema.label"
    :field="normalizedField"
    :hide-label="schema.formItemProps?.hideLabel ?? hideLabel"
    :hide-asterisk="schema.formItemProps?.hideAsterisk ?? hideAsterisk"
    :show-colon="schema.formItemProps?.showColon ?? showColon"
    :rules="resolvedRules"
    v-bind="schema.formItemProps"
    v-on="schema.formItemEvents ?? {}"
  >
    <component :is="schema.render" />
  </FormItem>
  <Row
    v-else-if="schema.type === JSON_FORM_COMPONENT_TYPES.row"
    :class="`${prefixCls}-row`"
    v-bind="schema.componentProps"
    v-on="schema.componentEvents ?? {}"
  >
    <Col v-for="child in schema.children ?? []" :key="child.field" v-bind="resolveColProps(child)">
      <JsonFormItem
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :schema="child"
        :adapter="adapter"
        :components="components"
        :prefix-cls="prefixCls"
        :hide-label="hideLabel"
        :hide-asterisk="hideAsterisk"
        :show-colon="showColon"
      >
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps" />
        </template>
      </JsonFormItem>
    </Col>
  </Row>
  <FormItem
    v-else
    :label="schema.label"
    :field="normalizedField"
    :hide-label="schema.formItemProps?.hideLabel ?? hideLabel"
    :hide-asterisk="schema.formItemProps?.hideAsterisk ?? hideAsterisk"
    :show-colon="schema.formItemProps?.showColon ?? showColon"
    :rules="resolvedRules"
    v-bind="schema.formItemProps"
    v-on="schema.formItemEvents ?? {}"
  >
    <template v-for="name in forwardedSlotNames" #[name]="slotProps">
      <slot :name="name" v-bind="{ ...slotProps, record: schema, value: fieldModel }" />
    </template>
    <JsonFormComponent
      v-model="fieldModel"
      :schema="schema"
      :components="components"
      :prefix-cls="prefixCls"
    >
      <template v-for="name in componentForwardedSlotNames" #[name]="slotProps">
        <slot :name="name" v-bind="{ ...slotProps, record: schema, value: fieldModel }" />
      </template>
    </JsonFormComponent>
  </FormItem>
</template>

<script lang="ts" setup>
  import { computed, useSlots } from 'vue';

  import { FormItem } from '../form';
  import { Col, Row } from '../grid';
  import JsonFormComponent from './json-form-component.vue';
  import {
    JSON_FORM_COMPONENT_TYPES,
    type JsonFormAdapter,
    type JsonFormModel,
    type JsonFormSchema,
  } from './types';
  import { getJsonFormValue, setJsonFormValue } from './utils';

  defineOptions({
    name: 'JsonFormItem',
  });

  const props = withDefaults(
    defineProps<{
      modelValue: JsonFormModel;
      schema: JsonFormSchema<string>;
      adapter: JsonFormAdapter;
      components: Record<string, unknown>;
      prefixCls: string;
      hideLabel?: boolean;
      hideAsterisk?: boolean;
      showColon?: boolean;
    }>(),
    {
      hideLabel: false,
      hideAsterisk: false,
      showColon: false,
    },
  );

  const emit = defineEmits<{
    'update:modelValue': [value: JsonFormModel];
  }>();

  defineSlots<Record<string, (props?: Record<string, unknown>) => unknown>>();

  const normalizedField = computed(() => {
    return props.adapter === 'a2ui-0.9.1'
      ? props.schema.field.replace(/^\//, '').replaceAll('/', '.')
      : props.schema.field;
  });

  const fieldModel = computed({
    get() {
      return getJsonFormValue(props.modelValue, props.schema.field, props.adapter);
    },
    set(value) {
      // 就地变更共享的 model 对象（非受控/单向 prop 的状态载体），再以新引用
      // emit update:modelValue 供受控 v-model（不可变更新）的父组件消费。
      // 不用 defineModel：其 localValue 缓存会让"只传 prop 不传监听"的用法
      // 在首次赋值后与调用方对象脱钩（后续变更写进内部克隆）。
      setJsonFormValue(props.modelValue, props.schema.field, value, props.adapter);
      emit('update:modelValue', { ...props.modelValue });
    },
  });

  const resolvedRules = computed(() => {
    if (props.schema.formItemRules) {
      return props.schema.formItemRules;
    }

    if (props.schema.required) {
      return [
        {
          required: true,
          message: props.schema.label ? `${props.schema.label}不能为空` : '必填项不能为空',
        },
      ];
    }

    return undefined;
  });

  const forwardedSlotNames = computed(() => {
    return Object.keys(useSlots()).filter((name) => name !== props.schema.slotName);
  });

  const componentForwardedSlotNames = computed(() => {
    const schemaSlotNames = new Set(Object.keys(props.schema.componentSlots ?? {}));
    return Object.keys(useSlots()).filter(
      (name) => name !== props.schema.slotName && !schemaSlotNames.has(name),
    );
  });

  const resolveColProps = (schema: JsonFormSchema<string>) => {
    if (schema.colProps) {
      return schema.colProps;
    }

    if (schema.span) {
      return { span: schema.span };
    }

    return undefined;
  };
</script>
