<template>
  <ModelSelector
    :visible="mergedVisible"
    :default-visible="defaultVisible"
    :default-expanded="defaultExpanded"
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
  import { computed, getCurrentInstance, onBeforeUpdate, shallowRef } from 'vue';

  import ModelSelectorContent from './model-selector-content.vue';
  import ModelSelector from './model-selector.vue';

  defineOptions({ name: 'ModelSelectorDialog' });

  const {
    defaultVisible = false,
    defaultExpanded = true,
    closeOnSelect = true,
    resetQueryOnClose = true,
    title,
    width = 640,
    renderToBody = true,
    unmountOnClose = true,
    maskClosable = true,
    escToClose = true,
  } = defineProps<{
    /**
     * @zh 弹窗是否默认显示（非受控状态）
     * @en Whether the dialog is visible by default (uncontrolled state)
     */
    defaultVisible?: boolean;
    /**
     * @zh 选择器是否默认展开（非受控状态）
     * @en Whether the selector is expanded by default (uncontrolled state)
     */
    defaultExpanded?: boolean;
    /**
     * @zh 选中后是否关闭弹窗
     * @en Whether the dialog closes after selecting
     */
    closeOnSelect?: boolean;
    /**
     * @zh 关闭时是否重置搜索关键字
     * @en Whether the search keyword is reset when closing
     */
    resetQueryOnClose?: boolean;
    /**
     * @zh 弹窗标题
     * @en Title of the dialog
     */
    title?: string;
    /**
     * @zh 弹窗宽度
     * @en Width of the dialog
     */
    width?: number | string;
    /**
     * @zh 弹窗是否挂载到 body
     * @en Whether the dialog is mounted to body
     */
    renderToBody?: boolean;
    /**
     * @zh 关闭时是否卸载弹窗内容
     * @en Whether the dialog content is unmounted when closed
     */
    unmountOnClose?: boolean;
    /**
     * @zh 点击遮罩是否关闭弹窗
     * @en Whether clicking the mask closes the dialog
     */
    maskClosable?: boolean;
    /**
     * @zh 按 Esc 是否关闭弹窗
     * @en Whether pressing Escape closes the dialog
     */
    escToClose?: boolean;
  }>();

  const emit = defineEmits<{
    visibleChange: [_visible: boolean];
    select: [_value: string, _event: Event];
  }>();

  const instance = getCurrentInstance()!;
  const visibleModel = defineModel<boolean>('visible');
  const innerVisible = shallowRef(defaultVisible);
  const hasVisibleProp = shallowRef(Object.hasOwn(instance.vnode.props ?? {}, 'visible'));
  onBeforeUpdate(() => {
    hasVisibleProp.value = Object.hasOwn(instance.vnode.props ?? {}, 'visible');
  });
  const mergedVisible = computed(() =>
    hasVisibleProp.value ? Boolean(visibleModel.value) : innerVisible.value,
  );

  function handleVisibleUpdate(value: boolean | undefined) {
    const nextVisible = Boolean(value);
    innerVisible.value = nextVisible;
    visibleModel.value = nextVisible;
  }
</script>
