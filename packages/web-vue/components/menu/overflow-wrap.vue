<template>
  <div ref="refWrapper" :class="`${overflowPrefixCls}-wrap`">
    <SubMenu key="__sd-menu-overflow-sub-menu-mirror" :class="overflowSubMenuMirrorClass">
      <template #title>
        <span>...</span>
      </template>
    </SubMenu>
    <component :is="item" v-for="item in menuItems" :key="item.key ?? undefined" />
    <SubMenu
      v-if="overflowMenuItems.length > 0"
      key="__sd-menu-overflow-sub-menu"
      :class="overflowSubMenuClass"
    >
      <template #title>
        <span>...</span>
      </template>
      <component :is="child" v-for="child in overflowMenuItems" :key="child.key ?? undefined" />
    </SubMenu>
  </div>
</template>

<script setup lang="ts">
  import {
    cloneVNode,
    computed,
    onBeforeUpdate,
    onMounted,
    onUnmounted,
    ref,
    shallowRef,
    useSlots,
    type VNode,
  } from 'vue';

  import {
    getMenuOverflowIndex,
    roundMenuWidth,
    parseMenuMargin,
    type MenuOverflowItem,
  } from '@sdata/web-core/menu/overflow';
  import { createResizeObserverController } from '@sdata/web-core/resize-observer/browser';

  import { getStyle } from '../_utils/style';
  import { unFragment } from '../_utils/vue-utils';
  import useMenuContext from './hooks/use-menu-context';
  import SubMenu from './sub-menu.vue';

  defineOptions({
    name: 'MenuOverflowWrap',
  });

  function getNodeWidth(el: HTMLElement) {
    return roundMenuWidth(el.getBoundingClientRect().width);
  }

  const slots = useSlots();
  const defaultSlot = shallowRef(slots.default);
  onBeforeUpdate(() => {
    defaultSlot.value = slots.default;
  });
  const menuContext = useMenuContext();
  const overflowPrefixCls = `${menuContext.prefixCls}-overflow`;
  const overflowSubMenuClass = `${overflowPrefixCls}-sub-menu`;
  const overflowMenuItemClass = `${overflowPrefixCls}-hidden-menu-item`;
  const overflowSubMenuMirrorClass = `${overflowPrefixCls}-sub-menu-mirror`;

  const refWrapper = ref<HTMLDivElement>();
  const lastVisibleIndex = ref<number | null>(null);
  const resizeObserver = createResizeObserverController(computeLastVisibleIndex);
  const refMutationObserver = ref<MutationObserver>();
  const children = computed(() => unFragment(defaultSlot.value?.() ?? []) as VNode[]);
  const menuItems = computed(() =>
    children.value.map((child, index) =>
      cloneVNode(
        child,
        lastVisibleIndex.value !== null && index > lastVisibleIndex.value
          ? { class: overflowMenuItemClass }
          : { class: '' },
      ),
    ),
  );
  const overflowMenuItems = computed(() => {
    if (lastVisibleIndex.value === null) {
      return [];
    }

    return children.value.slice(lastVisibleIndex.value + 1).map((child) => cloneVNode(child));
  });

  function computeLastVisibleIndex() {
    const wrapperElement = refWrapper.value;
    if (!wrapperElement) {
      return;
    }

    function* measurements(): Generator<MenuOverflowItem> {
      for (const node of Array.from(wrapperElement!.children) as HTMLElement[]) {
        const classes = node.className.split(' ');
        if (classes.includes(overflowSubMenuClass)) {
          yield { type: 'overflow', width: 0 };
          continue;
        }
        const width =
          getNodeWidth(node) +
          parseMenuMargin(getStyle(node, 'marginLeft') as string) +
          parseMenuMargin(getStyle(node, 'marginRight') as string);
        yield { type: classes.includes(overflowSubMenuMirrorClass) ? 'mirror' : 'item', width };
      }
    }
    lastVisibleIndex.value = getMenuOverflowIndex(getNodeWidth(wrapperElement), measurements());
  }

  onMounted(() => {
    computeLastVisibleIndex();

    if (refWrapper.value) {
      resizeObserver.observe(refWrapper.value);

      refMutationObserver.value = new MutationObserver(computeLastVisibleIndex);
      refMutationObserver.value.observe(refWrapper.value, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  });

  onUnmounted(() => {
    resizeObserver.disconnect();
    refMutationObserver.value?.disconnect();
  });
</script>
