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
  import { computed, watch } from 'vue';

  import { createModelSelectorInputFoundation } from '@sdata/web-core/model-selector/input';

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
  const foundation = createModelSelectorInputFoundation(
    {
      get modelValue() {
        return props.modelValue;
      },
      get query() {
        return context.query.value;
      },
      set query(value) {
        context.query.value = value;
      },
      get inputAttrs() {
        return props.inputAttrs;
      },
      get listId() {
        return context.listId;
      },
      get visible() {
        return context.visible.value;
      },
      get activeDescendant() {
        return context.activeDescendant.value;
      },
    },
    {
      update: (value) => emit('update:modelValue', value),
      moveActive: context.moveActive,
      selectActive: context.selectActive,
      setVisible: context.setVisible,
    },
  );
  const mergedValue = computed(() => foundation.getMergedValue());
  const mergedInputAttrs = computed(() => foundation.getInputAttrs());
  const { handleInput, handleKeydown } = foundation;
  watch(() => props.modelValue, foundation.syncModelValue, { immediate: true });
</script>
