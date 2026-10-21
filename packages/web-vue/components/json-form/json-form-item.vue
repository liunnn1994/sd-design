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
  import { computed, onBeforeUpdate, shallowRef, useSlots } from 'vue';

  import {
    getJsonFormRules,
    getJsonFormColProps,
    filterJsonFormSlots,
  } from '@sdata/web-core/json-form/field';
  import { createJsonFormFieldFoundation } from '@sdata/web-core/json-form/foundation';

  import { FormItem } from '../form';
  import { Col, Row } from '../grid';
  import { useI18n } from '../locale';
  import JsonFormComponent from './json-form-component.vue';
  import {
    JSON_FORM_COMPONENT_TYPES,
    type JsonFormAdapter,
    type JsonFormModel,
    type JsonFormSchema,
  } from './types';

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
  const slots = useSlots();
  const slotNames = shallowRef(Object.keys(slots));
  onBeforeUpdate(() => {
    slotNames.value = Object.keys(slots);
  });

  const fieldFoundation = createJsonFormFieldFoundation({
    get model() {
      return props.modelValue;
    },
    get field() {
      return props.schema.field;
    },
    get adapter() {
      return props.adapter;
    },
    onUpdate: (value) => emit('update:modelValue', value),
  });
  const normalizedField = computed(fieldFoundation.getNormalizedField);
  const fieldModel = computed({ get: fieldFoundation.getValue, set: fieldFoundation.setValue });

  const { t } = useI18n();

  const resolvedRules = computed(() => getJsonFormRules(props.schema, t));
  const forwardedSlotNames = computed(() =>
    filterJsonFormSlots(slotNames.value, [props.schema.slotName]),
  );
  const componentForwardedSlotNames = computed(() =>
    filterJsonFormSlots(slotNames.value, [props.schema.slotName], props.schema.componentSlots),
  );
  const resolveColProps = (schema: JsonFormSchema<string>) => getJsonFormColProps(schema);
</script>
