<template>
  <div
    v-show="isVisible"
    :id="domId"
    ref="item"
    :class="[
      prefixCls,
      {
        [`${prefixCls}--active`]: isActive,
        [`${prefixCls}--disabled`]: disabled,
        [`${prefixCls}--selected`]: selected,
      },
    ]"
    role="option"
    :aria-disabled="disabled"
    :aria-keyshortcuts="shortcut || undefined"
    :aria-selected="selected"
    @click="handleSelect"
    @mouseenter="context.setActive(id)"
  >
    <slot :active="isActive" :disabled="disabled" :selected="selected" />
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    getCurrentInstance,
    inject,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    useTemplateRef,
    watch,
  } from 'vue';

  import { createModelSelectorItemFoundation } from '@sdata/web-core/model-selector/item';

  import { getPrefixCls } from '../_utils/global-config';
  import { modelSelectorGroupInjectionKey } from './context';
  import { useModelSelectorContext } from './use-model-selector-context';

  defineOptions({ name: 'ModelSelectorItem' });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 选项值
       * @en Item value
       */
      value: string;
      /**
       * @zh 用于搜索的文本；未设置时读取渲染后的文本
       * @en Search label; rendered text is used when omitted
       */
      label?: string;
      /**
       * @zh 额外搜索关键词
       * @en Additional search keywords
       */
      keywords?: string[];
      /**
       * @zh 是否禁用
       * @en Whether the item is disabled
       */
      disabled?: boolean;
      /**
       * @zh 是否为已选项
       * @en Whether the item is selected
       */
      selected?: boolean;
      /**
       * @zh 选择当前选项的快捷键，格式遵循 VueUse useMagicKeys，例如 Alt+Shift+1
       * @en Shortcut for selecting this item, using the VueUse useMagicKeys format, such as Alt+Shift+1
       */
      shortcut?: string;
    }>(),
    {
      label: '',
      keywords: () => [],
      disabled: false,
      selected: false,
      shortcut: '',
    },
  );

  const emit = defineEmits<{
    /**
     * @zh 用户选择时触发
     * @en Emitted when selected
     */
    select: [_value: string, _event: Event];
  }>();

  const context = useModelSelectorContext('ModelSelectorItem');
  const groupContext = inject(modelSelectorGroupInjectionKey, undefined);
  const prefixCls = getPrefixCls('model-selector-item');
  const uid = getCurrentInstance()!.uid;
  const id = Symbol(`model-selector-item-${uid}`);
  const domId = `${context.listId}-item-${uid}`;
  const itemRef = useTemplateRef<HTMLElement>('item');
  const domTextVersion = shallowRef(0);
  const foundation: ReturnType<typeof createModelSelectorItemFoundation> =
    createModelSelectorItemFoundation(
      {
        props,
        get element() {
          return itemRef.value;
        },
        get renderedLabel(): string {
          return renderedLabel.value;
        },
        get groupId() {
          return groupContext?.id;
        },
        id,
        domId,
        get domTextVersion() {
          return domTextVersion.value;
        },
        set domTextVersion(value) {
          domTextVersion.value = value;
        },
      },
      { select: (value, event) => emit('select', value, event), selectItem: context.selectItem },
    );
  const renderedLabel = computed(() => foundation.getRenderedLabel());
  const { getItemData, handleSelect } = foundation;
  onMounted(foundation.startLabelObserver);
  onBeforeUnmount(foundation.stopLabelObserver);
  const isActive = computed(() => context.activeId.value === id);
  const isVisible = computed(() => {
    void context.itemsVersion.value;
    return context.getVisibleItems(groupContext?.id).some((item) => item.id === id);
  });

  onMounted(() => context.registerItem(getItemData()));
  onBeforeUnmount(() => context.unregisterItem(id));

  watch(
    () => [props.value, props.label, props.keywords, props.disabled, props.shortcut] as const,
    () => context.updateItem(getItemData()),
    { deep: true },
  );

  // 渲染文本变化（MutationObserver 触发重算）后同步注册表，保证过滤数据最新
  watch(renderedLabel, () => {
    context.updateItem(getItemData());
  });
</script>
