<template>
  <div :class="`${prefixCls}-container`">
    <Input
      v-bind="$attrs"
      :model-value="mergedValue"
      :class="prefixCls"
      :input-attrs="mergedInputAttrs"
      @input="handleInput"
      @keydown="handleKeydown"
    >
      <template #prefix>
        <IconSearch />
      </template>
    </Input>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import IconSearch from '../icon/icon-search';
  import Input from '../input';
  import { useModelSelectorContext } from './use-model-selector-context';

  defineOptions({ name: 'ModelSelectorInput', inheritAttrs: false });

  const props = defineProps<{
    /**
     * @zh 搜索内容
     * @en Search query
     */
    modelValue?: string;
    /**
     * @zh 透传给底层原生 input 的属性
     * @en Attributes forwarded to the underlying native input
     */
    inputAttrs?: Record<string, unknown>;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [_value: string];
  }>();

  const context = useModelSelectorContext('ModelSelectorInput');
  const prefixCls = getPrefixCls('model-selector-input');
  const mergedValue = computed(() => props.modelValue ?? context.query.value);
  const mergedInputAttrs = computed(() => ({
    ...props.inputAttrs,
    'type': 'search',
    'role': 'combobox',
    'autocomplete': 'off',
    'aria-controls': context.listId,
    'aria-expanded': context.visible.value,
    'aria-activedescendant': context.activeDescendant.value,
  }));

  function handleInput(value: string) {
    context.query.value = value;
    emit('update:modelValue', value);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      context.moveActive(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      context.moveActive(-1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      context.selectActive(event);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      context.setVisible(false);
    }
  }
</script>
