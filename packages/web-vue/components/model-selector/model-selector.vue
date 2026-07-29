<template>
  <slot :close="() => setVisible(false)" :open="() => setVisible(true)" :visible="mergedVisible" />
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, provide, shallowRef, watch } from 'vue';

  import { DefaultMagicKeysAliasMap, useMagicKeys } from '@vueuse/core';

  import type { ModelSelectorItemData } from './types';

  import { modelSelectorInjectionKey } from './context';

  const SHORTCUT_MODIFIER_KEYS = new Set(['alt', 'control', 'meta', 'shift']);

  function getShortcutKeys(shortcut: string) {
    return shortcut
      .toLocaleLowerCase()
      .split(/[+_-]/g)
      .filter(Boolean)
      .map((key) => {
        const normalizedKey = /^\d$/.test(key) ? `digit${key}` : key;
        return DefaultMagicKeysAliasMap[normalizedKey] ?? normalizedKey;
      });
  }

  function isShortcutPressed(
    shortcut: string,
    event: KeyboardEvent,
    currentKeys: ReadonlySet<string>,
  ) {
    const eventCode = event.code.toLocaleLowerCase();
    const eventKey = event.key.toLocaleLowerCase();
    const shortcutKeys = getShortcutKeys(shortcut);
    const isTriggerEvent = shortcutKeys.some(
      (key) => !SHORTCUT_MODIFIER_KEYS.has(key) && (key === eventCode || key === eventKey),
    );

    return (
      isTriggerEvent &&
      shortcutKeys.every((key) => {
        if (key === 'alt') {
          return event.altKey;
        }
        if (key === 'control') {
          return event.ctrlKey;
        }
        if (key === 'meta') {
          return event.metaKey;
        }
        if (key === 'shift') {
          return event.shiftKey;
        }

        return key === eventCode || key === eventKey || currentKeys.has(key);
      })
    );
  }

  defineOptions({ name: 'ModelSelector' });

  const {
    defaultVisible = false,
    closeOnSelect = true,
    resetQueryOnClose = true,
  } = defineProps<{
    /**
     * @zh 默认是否显示模型选择器
     * @en Whether the model selector is visible by default
     */
    defaultVisible?: boolean;
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
  const hasVisibleProp = computed(() => Object.hasOwn(instance.vnode.props ?? {}, 'visible'));
  const mergedVisible = computed(() =>
    hasVisibleProp.value ? Boolean(visibleModel.value) : innerVisible.value,
  );
  const query = shallowRef('');
  const activeId = shallowRef<symbol>();
  const itemsVersion = shallowRef(0);
  const items = new Map<symbol, ModelSelectorItemData>();
  const listId = `sd-model-selector-list-${instance.uid}`;

  const normalizedQuery = computed(() => query.value.trim().toLocaleLowerCase());

  function isItemVisible(item: ModelSelectorItemData) {
    const search = normalizedQuery.value;
    if (!search) {
      return true;
    }

    return [item.value, item.label, ...item.keywords].some((text) =>
      text.toLocaleLowerCase().includes(search),
    );
  }

  function getVisibleItems(groupId?: symbol) {
    void itemsVersion.value;
    return [...items.values()].filter(
      (item) => (groupId === undefined || item.groupId === groupId) && isItemVisible(item),
    );
  }

  const visibleItems = computed(() => getVisibleItems());
  const visibleItemCount = computed(() => visibleItems.value.length);
  const activeDescendant = computed(() =>
    activeId.value ? items.get(activeId.value)?.domId : undefined,
  );
  const magicKeys = useMagicKeys({
    passive: false,
    onEventFired(event) {
      if (event.type !== 'keydown' || event.repeat || !mergedVisible.value) {
        return;
      }

      const item = visibleItems.value.find(
        ({ disabled, shortcut }) =>
          !disabled && shortcut && isShortcutPressed(shortcut, event, magicKeys.current),
      );
      if (!item) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      item.select(event);
    },
  });

  function setVisible(value: boolean) {
    if (mergedVisible.value === value) {
      return;
    }

    innerVisible.value = value;
    visibleModel.value = value;
    emit('visibleChange', value);
  }

  function registerItem(item: ModelSelectorItemData) {
    items.set(item.id, item);
    itemsVersion.value += 1;
  }

  function updateItem(item: ModelSelectorItemData) {
    items.set(item.id, item);
    itemsVersion.value += 1;
  }

  function unregisterItem(id: symbol) {
    items.delete(id);
    if (activeId.value === id) {
      activeId.value = undefined;
    }
    itemsVersion.value += 1;
  }

  function setActive(id?: symbol) {
    activeId.value = id;
  }

  function moveActive(offset: number) {
    const enabledItems = visibleItems.value.filter((item) => !item.disabled);
    if (!enabledItems.length) {
      activeId.value = undefined;
      return;
    }

    const currentIndex = enabledItems.findIndex((item) => item.id === activeId.value);
    const nextIndex =
      currentIndex === -1
        ? offset > 0
          ? 0
          : enabledItems.length - 1
        : (currentIndex + offset + enabledItems.length) % enabledItems.length;
    const nextItem = enabledItems[nextIndex];
    activeId.value = nextItem.id;
    nextItem.element?.scrollIntoView({ block: 'nearest' });
  }

  function selectItem(item: ModelSelectorItemData, event: Event) {
    if (item.disabled) {
      return;
    }

    emit('select', item.value, event);
    if (closeOnSelect) {
      setVisible(false);
    }
  }

  function selectActive(event: Event) {
    if (!activeId.value) {
      return;
    }

    const item = items.get(activeId.value);
    if (item) {
      selectItem(item, event);
    }
  }

  watch(query, () => {
    activeId.value = visibleItems.value.find((item) => !item.disabled)?.id;
  });

  watch(mergedVisible, (visible) => {
    if (!visible && resetQueryOnClose) {
      query.value = '';
      activeId.value = undefined;
    }
  });

  provide(modelSelectorInjectionKey, {
    activeDescendant,
    activeId,
    getVisibleItems,
    itemsVersion,
    listId,
    moveActive,
    query,
    registerItem,
    selectActive,
    selectItem,
    setActive,
    setVisible,
    unregisterItem,
    updateItem,
    visible: mergedVisible,
    visibleItemCount,
  });
</script>
