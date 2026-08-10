<template>
  <DefineOverflowSubMenu v-slot="{ children, mirror }">
    <SubMenu
      :key="`__sd-menu-overflow-sub-menu${mirror ? '-mirror' : ''}`"
      :class="mirror ? overflowSubMenuMirrorClass : overflowSubMenuClass"
    >
      <template #title>
        <span>...</span>
      </template>
      <component :is="child" v-for="child in children" :key="child.key ?? undefined" />
    </SubMenu>
  </DefineOverflowSubMenu>

  <div ref="refWrapper" :class="`${overflowPrefixCls}-wrap`">
    <ReuseOverflowSubMenu mirror :children="[]" />
    <component :is="item" v-for="item in menuItems" :key="item.key ?? undefined" />
    <ReuseOverflowSubMenu v-if="overflowMenuItems" :children="overflowMenuItems" :mirror="false" />
  </div>
</template>

<script setup lang="ts">
  import { cloneVNode, computed, onMounted, onUnmounted, ref, useSlots, type VNode } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';
  import ResizeObserver from 'resize-observer-polyfill';

  import { getStyle } from '../_utils/style';
  import { unFragment } from '../_utils/vue-utils';
  import useMenuContext from './hooks/use-menu-context';
  import SubMenu from './sub-menu.vue';

  defineOptions({
    name: 'MenuOverflowWrap',
  });

  const OVERFLOW_THRESHOLD = 10;

  function getNodeWidth(el: HTMLElement) {
    return +el.getBoundingClientRect().width.toFixed(2);
  }

  function translatePxToNumber(str: string): number {
    const result = Number(str.replace('px', ''));
    return Number.isNaN(result) ? 0 : result;
  }

  const slots = useSlots();
  const menuContext = useMenuContext();
  const overflowPrefixCls = `${menuContext.prefixCls}-overflow`;
  const overflowSubMenuClass = `${overflowPrefixCls}-sub-menu`;
  const overflowMenuItemClass = `${overflowPrefixCls}-hidden-menu-item`;
  const overflowSubMenuMirrorClass = `${overflowPrefixCls}-sub-menu-mirror`;

  const refWrapper = ref<HTMLDivElement>();
  const lastVisibleIndex = ref<number | null>(null);
  const refResizeObserver = ref<ResizeObserver>();
  const children = computed(() => unFragment(slots.default?.() ?? []) as VNode[]);
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
      return null;
    }

    return children.value.slice(lastVisibleIndex.value + 1).map((child) => cloneVNode(child));
  });
  const [DefineOverflowSubMenu, ReuseOverflowSubMenu] = createReusableTemplate<{
    children: VNode[];
    mirror: boolean;
  }>();

  function computeLastVisibleIndex() {
    const wrapperElement = refWrapper.value;
    if (!wrapperElement) {
      return;
    }

    const wrapperWidth = getNodeWidth(wrapperElement);
    const childNodeList = Array.from(wrapperElement.children) as HTMLElement[];

    let menuItemIndex = 0;
    let currentRightWidth = 0;
    let overflowSubMenuWidth = 0;

    // 注意 childrenNodeList.length !== children.length 所以需要用 menuItemIndex 来标记真实的 MenuItem 下标
    for (const node of childNodeList) {
      const classNames = node.className.split(' ');
      const isOverflowSubMenu = classNames.includes(overflowSubMenuClass);
      const isOverflowSubMenuMirror = classNames.includes(overflowSubMenuMirrorClass);

      // 忽略 overflowSubMenu 的宽度，其宽度测量交由 overflowSubMenuMirror
      if (isOverflowSubMenu) {
        continue;
      }

      const nodeWidth =
        getNodeWidth(node) +
        translatePxToNumber(getStyle(node, 'marginLeft') as string) +
        translatePxToNumber(getStyle(node, 'marginRight') as string);

      if (isOverflowSubMenuMirror) {
        overflowSubMenuWidth = nodeWidth;
        continue;
      }

      currentRightWidth += nodeWidth;

      if (currentRightWidth + overflowSubMenuWidth + OVERFLOW_THRESHOLD > wrapperWidth) {
        lastVisibleIndex.value = menuItemIndex - 1;
        return;
      }

      menuItemIndex++;
    }

    // 全部可见
    lastVisibleIndex.value = null;
  }

  onMounted(() => {
    computeLastVisibleIndex();

    refResizeObserver.value = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      entries.forEach(computeLastVisibleIndex);
    });

    if (refWrapper.value) {
      refResizeObserver.value.observe(refWrapper.value);
    }
  });

  onUnmounted(() => {
    refResizeObserver.value?.disconnect();
  });
</script>
