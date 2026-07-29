<template>
  <ModelSelector
    :visible="mergedVisible"
    :default-visible="defaultVisible"
    :close-on-select="closeOnSelect"
    :reset-query-on-close="resetQueryOnClose"
    @update:visible="handleVisibleUpdate"
    @visible-change="emit('visibleChange', $event)"
    @select="(value, event) => emit('select', value, event)"
  >
    <ModelSelectorContent
      :title="title"
      :width="width"
      :render-to-body="renderToBody"
      :unmount-on-close="unmountOnClose"
      :mask-closable="maskClosable"
      :esc-to-close="escToClose"
    >
      <slot />
    </ModelSelectorContent>
  </ModelSelector>
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, shallowRef } from 'vue';

  import ModelSelectorContent from './model-selector-content.vue';
  import ModelSelector from './model-selector.vue';

  defineOptions({ name: 'ModelSelectorDialog' });

  const {
    defaultVisible = false,
    closeOnSelect = true,
    resetQueryOnClose = true,
    title = '模型选择',
    width = 640,
    renderToBody = true,
    unmountOnClose = true,
    maskClosable = true,
    escToClose = true,
  } = defineProps<{
    defaultVisible?: boolean;
    closeOnSelect?: boolean;
    resetQueryOnClose?: boolean;
    title?: string;
    width?: number | string;
    renderToBody?: boolean;
    unmountOnClose?: boolean;
    maskClosable?: boolean;
    escToClose?: boolean;
  }>();

  const emit = defineEmits<{
    visibleChange: [_visible: boolean];
    select: [_value: string, _event: Event];
  }>();

  const instance = getCurrentInstance()!;
  const visibleModel = defineModel<boolean>('visible');
  const innerVisible = shallowRef(defaultVisible);
  const hasVisibleProp = computed(() => Object.hasOwn(instance.vnode.props ?? {}, 'visible'));
  const mergedVisible = computed(() =>
    hasVisibleProp.value ? Boolean(visibleModel.value) : innerVisible.value,
  );

  function handleVisibleUpdate(value: boolean | undefined) {
    const nextVisible = Boolean(value);
    innerVisible.value = nextVisible;
    visibleModel.value = nextVisible;
  }
</script>
