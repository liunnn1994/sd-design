<template>
  <slot :close="() => setVisible(false)" :open="() => setVisible(true)" :visible="mergedVisible" />
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, onBeforeUpdate, provide, shallowRef, watch } from 'vue';

  import {
    createModelSelectorFoundation,
    getModelSelectorVisible,
  } from '@sdata/web-core/model-selector/foundation';
  import { DefaultMagicKeysAliasMap, useMagicKeys } from '@vueuse/core';

  import type { ModelSelectorItemData } from './types';

  import { modelSelectorInjectionKey } from './context';

  defineOptions({ name: 'ModelSelector' });

  const {
    defaultVisible = false,
    defaultExpanded = true,
    closeOnSelect = true,
    resetQueryOnClose = true,
  } = defineProps<{
    /**
     * @zh 默认是否显示模型选择器
     * @en Whether the model selector is visible by default
     */
    defaultVisible?: boolean;
    /**
     * @zh 分组默认是否全部展开
     * @en Whether all groups are expanded by default
     */
    defaultExpanded?: boolean;
    /**
     * @zh 选择模型后是否自动关闭
     * @en Whether to close after selecting a model
     */
    closeOnSelect?: boolean;
    /**
     * @zh 关闭时是否清空搜索条件
     * @en Whether to reset the query when closed
     */
    resetQueryOnClose?: boolean;
  }>();

  const emit = defineEmits<{
    /**
     * @zh 显隐状态改变时触发
     * @en Emitted when visibility changes
     */
    visibleChange: [_visible: boolean];
    /**
     * @zh 用户选择模型时触发
     * @en Emitted when the user selects a model
     */
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
    getModelSelectorVisible(hasVisibleProp.value, visibleModel.value, innerVisible.value),
  );
  const query = shallowRef('');
  const activeId = shallowRef<symbol>();
  const itemsVersion = shallowRef(0);
  const listId = `sd-model-selector-list-${instance.uid}`;

  const foundation: ReturnType<typeof createModelSelectorFoundation> =
    createModelSelectorFoundation(
      {
        props: {
          get closeOnSelect() {
            return closeOnSelect;
          },
          get resetQueryOnClose() {
            return resetQueryOnClose;
          },
        },
        get innerVisible() {
          return innerVisible.value;
        },
        set innerVisible(value) {
          innerVisible.value = value;
        },
        get visibleModel() {
          return visibleModel.value;
        },
        set visibleModel(value) {
          visibleModel.value = value;
        },
        get query() {
          return query.value;
        },
        set query(value) {
          query.value = value;
        },
        get activeId() {
          return activeId.value;
        },
        set activeId(value) {
          activeId.value = value;
        },
        get itemsVersion() {
          return itemsVersion.value;
        },
        set itemsVersion(value) {
          itemsVersion.value = value;
        },
        get mergedVisible(): boolean {
          return mergedVisible.value;
        },
        get normalizedQuery(): string {
          return normalizedQuery.value;
        },
        get visibleItems(): ModelSelectorItemData[] {
          return visibleItems.value;
        },
        get navigableItems(): ModelSelectorItemData[] {
          return navigableItems.value;
        },
      },
      {
        keyAliases: DefaultMagicKeysAliasMap,
        get currentKeys(): ReadonlySet<string> {
          return magicKeys.current;
        },
        visibleChange: (value) => emit('visibleChange', value),
        select: (value, event) => emit('select', value, event),
      },
    );
  const {
    getVisibleItems,
    setVisible,
    registerItem,
    registerGroup,
    unregisterGroup,
    updateItem,
    unregisterItem,
    setActive,
    moveActive,
    selectItem,
    selectActive,
    syncQuery,
    syncNavigableItems,
    syncVisible,
  } = foundation;
  const normalizedQuery = computed(() => foundation.getNormalizedQuery());
  const visibleItems = computed(() => getVisibleItems());
  const navigableItems = computed(() => foundation.getNavigableItems());
  const visibleItemCount = computed(() => visibleItems.value.length);
  const activeDescendant = computed(() => foundation.getActiveDescendant());
  const magicKeys = useMagicKeys({
    passive: false,
    onEventFired(event) {
      foundation.handleShortcut(event);
    },
  });
  watch(query, syncQuery);
  watch(navigableItems, syncNavigableItems);
  watch(mergedVisible, syncVisible);
  provide(modelSelectorInjectionKey, {
    activeDescendant,
    activeId,
    defaultExpanded,
    getVisibleItems,
    itemsVersion,
    listId,
    moveActive,
    query,
    registerGroup,
    registerItem,
    selectActive,
    selectItem,
    setActive,
    setVisible,
    unregisterItem,
    unregisterGroup,
    updateItem,
    visible: mergedVisible,
    visibleItemCount,
  });
</script>
