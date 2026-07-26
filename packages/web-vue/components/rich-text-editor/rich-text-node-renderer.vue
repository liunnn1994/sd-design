<template>
  <Tag
    v-if="node.name === 'tag'"
    v-bind="tagComponentProps"
    :closable="Boolean(node.props?.closable) && !disabled && !readonly"
    :class="[`${prefixCls}-component-control`, `${prefixCls}-component-tag`, node.props?.class]"
    @close="emit('remove')"
  >
    {{ node.props?.label ?? node.textValue ?? node.value }}
  </Tag>
  <span
    v-else-if="node.name === JSON_FORM_COMPONENT_TYPES.noFormItem"
    :class="[
      `${prefixCls}-component-control`,
      `${prefixCls}-component-noFormItem`,
      `${prefixCls}-component-fallback`,
    ]"
  >
    <slot>{{ componentLabel }}</slot>
  </span>
  <span v-else-if="resolvedComponent" :class="componentClass">
    <component
      v-if="componentUsesDefaultContent"
      :is="resolvedComponent"
      v-bind="componentProps"
      :model-value="node.value"
      :disabled="componentDisabled"
      :readonly="readonly"
      :class="node.props?.class"
      @update:model-value="emit('update', $event as JsonValue)"
    >
      {{ componentLabel }}
    </component>
    <component
      v-else
      :is="resolvedComponent"
      v-bind="componentProps"
      :model-value="node.value"
      :disabled="componentDisabled"
      :readonly="readonly"
      :class="node.props?.class"
      @update:model-value="emit('update', $event as JsonValue)"
    />
  </span>
  <slot v-else />
</template>

<script setup lang="ts">
  import type { JsonValue } from 'type-fest';

  import { computed, inject } from 'vue';

  import type { RichTextEditorComponentNodeSnapshot } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import { JSON_FORM_COMPONENT_TYPES } from '../json-form/types';
  import { resolveJsonFormComponents, shouldStretchJsonFormControl } from '../json-form/utils';
  import Tag from '../tag';

  defineOptions({ name: 'RichTextNodeRenderer' });

  const {
    node,
    disabled = false,
    readonly = false,
  } = defineProps<{
    node: RichTextEditorComponentNodeSnapshot;
    disabled?: boolean;
    readonly?: boolean;
  }>();

  const emit = defineEmits<{
    update: [value: JsonValue];
    remove: [];
  }>();

  const prefixCls = getPrefixCls('rich-text-editor');
  const configProvider = inject(configProviderInjectionKey, undefined);
  const resolvedComponents = computed(() =>
    resolveJsonFormComponents(configProvider?.jsonForm?.components),
  );
  const resolvedComponent = computed(() => resolvedComponents.value[node.name]);
  const componentSupportsFitWidth = computed(() => {
    const componentProps = (
      resolvedComponent.value as { props?: readonly string[] | Record<string, unknown> } | undefined
    )?.props;
    return Array.isArray(componentProps)
      ? componentProps.includes('fitWidth')
      : Boolean(componentProps && 'fitWidth' in componentProps);
  });
  const componentFitWidth = computed(
    () => componentSupportsFitWidth.value && node.props?.fitWidth !== false,
  );
  const componentDisabled = computed(() => disabled || readonly || node.props?.disabled === true);
  const componentClass = computed(() => [
    `${prefixCls}-component-control`,
    `${prefixCls}-component-${node.name}`,
    {
      [`${prefixCls}-component-stretch`]:
        (shouldStretchJsonFormControl(node.name) ||
          node.name === JSON_FORM_COMPONENT_TYPES.slider) &&
        !componentFitWidth.value,
    },
  ]);
  const componentUsesDefaultContent = computed(() =>
    (
      [
        JSON_FORM_COMPONENT_TYPES.checkbox,
        JSON_FORM_COMPONENT_TYPES.radio,
        JSON_FORM_COMPONENT_TYPES.row,
      ] as string[]
    ).includes(node.name),
  );
  const componentProps = computed(() => {
    const { class: _class, disabled: _disabled, readonly: _readonly, ...rest } = node.props ?? {};
    return {
      ...rest,
      ...(componentSupportsFitWidth.value ? { fitWidth: componentFitWidth.value } : {}),
    };
  });
  const componentLabel = computed(() => {
    const label = node.props?.label ?? node.textValue ?? node.value;
    return ['string', 'number'].includes(typeof label) ? String(label) : '';
  });
  const tagComponentProps = computed(() => {
    const { class: _class, label: _label, ...componentProps } = node.props ?? {};
    return componentProps;
  });
</script>
