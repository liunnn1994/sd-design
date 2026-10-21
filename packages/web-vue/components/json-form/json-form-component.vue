<template>
  <component
    :is="resolvedComponent"
    v-model="modelValue"
    v-bind="mergedComponentProps"
    v-on="schema.componentEvents ?? {}"
  >
    <template v-if="showCheckboxLabel">
      {{ checkboxLabel }}
    </template>
    <template v-for="name in forwardedSlotNames" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
    <template v-for="(slotRenderer, name) in schema.componentSlots ?? {}" #[name]="slotProps">
      <component :is="slotRenderer" v-bind="slotProps" />
    </template>
  </component>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUpdate, shallowRef } from 'vue';

  import {
    resolveJsonFormComponent,
    getJsonFormPlaceholder,
    getJsonFormComponentProps,
    filterJsonFormSlots,
  } from '@sdata/web-core/json-form/field';

  import { useI18n } from '../locale';
  import { JSON_FORM_COMPONENT_TYPES, type JsonFormSchema } from './types';

  defineOptions({
    name: 'JsonFormComponent',
  });

  const props = defineProps<{
    schema: JsonFormSchema<string>;
    components: Record<string, unknown>;
    prefixCls: string;
  }>();

  const slots = defineSlots<Record<string, (props?: Record<string, unknown>) => unknown>>();
  const slotNames = shallowRef(Object.keys(slots));
  onBeforeUpdate(() => {
    slotNames.value = Object.keys(slots);
  });
  const modelValue = defineModel<unknown>();

  const resolvedComponent = computed(() =>
    resolveJsonFormComponent(props.components, props.schema.type),
  );

  const { t } = useI18n();

  const defaultPlaceholder = computed(() =>
    getJsonFormPlaceholder(props.schema.type, props.schema.label, t),
  );
  const mergedComponentProps = computed(() =>
    getJsonFormComponentProps(props.schema, props.prefixCls, () => defaultPlaceholder.value),
  );

  const showCheckboxLabel = computed(() => {
    return (
      props.schema.type === JSON_FORM_COMPONENT_TYPES.checkbox &&
      Boolean(props.schema.label) &&
      !slotNames.value.includes('default')
    );
  });

  const checkboxLabel = computed(() => {
    const label = (props.schema.componentProps as { label?: string } | undefined)?.label;
    return label ?? props.schema.label ?? '';
  });

  const forwardedSlotNames = computed(() =>
    filterJsonFormSlots(slotNames.value, ['default'], props.schema.componentSlots),
  );
</script>
