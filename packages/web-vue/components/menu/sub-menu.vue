<template>
  <component
    :is="computedPopup ? SubMenuPop : SubMenuInline"
    :key="computedKey"
    v-bind="$attrs"
    :title="title"
    :selectable="computedPopup ? selectable : undefined"
    :is-children-selected="isChildrenSelected"
    :popup-max-height="computedPopup ? popupMaxHeight : undefined"
  >
    <template v-for="name in forwardedSlotNames" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
    <template #expand-icon-down>
      <slot name="expand-icon-down">
        <component :is="expandIconDown" v-if="expandIconDown" />
        <IconDown v-else />
      </slot>
    </template>
    <template #expand-icon-right>
      <slot name="expand-icon-right">
        <component :is="expandIconRight" v-if="expandIconRight" />
        <IconRight v-else />
      </slot>
    </template>
  </component>
</template>

<script setup lang="ts">
  import { computed, toRef, useAttrs, useSlots, type PropType } from 'vue';

  import IconDown from '../icon/icon-down';
  import IconRight from '../icon/icon-right';
  import useLevel from './hooks/use-level';
  import useMenu from './hooks/use-menu';
  import useMenuContext from './hooks/use-menu-context';
  import useMenuDataCollector from './hooks/use-menu-data-collector';
  import SubMenuInline from './sub-menu-inline.vue';
  import SubMenuPop from './sub-menu-pop.vue';

  defineOptions({
    name: 'SubMenu',
    inheritAttrs: false,
  });

  const props = defineProps({
    /**
     * @zh 子菜单的标题
     * @en The title of the submenu
     */
    title: String,
    /**
     * @zh 弹出模式下，是否将多级菜单头也作为一个菜单项，支持点击选中等状态
     * @en In the pop-up mode, whether the multi-level menu header is also used as a menu item to support the state such as click to select
     */
    selectable: Boolean,
    /**
     * @zh 是否强制使用弹出模式，`level` 表示当前子菜单的层级
     * @en Whether to force the use of pop-up mode, `level` indicates the level of the current submenu
     */
    popup: {
      type: [Boolean, Function] as PropType<boolean | ((level: number) => boolean)>,
      default: false,
    },
    /**
     * @zh 弹出框的最大高度
     * @en The maximum height of popover
     * @defaultValue true
     * @version 2.23.0
     */
    popupMaxHeight: {
      type: [Boolean, Number] as PropType<boolean | number>,
      default: undefined,
    },
  });

  const attrs = useAttrs();
  const slots = useSlots();
  const { key } = useMenu();
  const { level } = useLevel();
  const menuContext = useMenuContext();
  const computedKey = key;
  const expandIconDown = toRef(menuContext, 'expandIconDown');
  const expandIconRight = toRef(menuContext, 'expandIconRight');

  const computedPopup = computed(() => {
    const { mode, collapsed, inTrigger } = menuContext;
    const forcePopup = !!(typeof props.popup === 'function'
      ? props.popup(level.value)
      : props.popup);
    return forcePopup || collapsed || inTrigger || mode !== 'vertical';
  });

  const { subMenuKeys, menuItemKeys } = useMenuDataCollector({
    key: key.value,
    type: 'subMenu',
  });

  const isChildrenSelected = computed(() => {
    const selectedKeys = menuContext.selectedKeys || [];
    const checkSelected = (menuKeys: string[]) => {
      for (const selectedKey of selectedKeys) {
        if (menuKeys.includes(selectedKey)) {
          return true;
        }
      }
      return false;
    };

    return checkSelected(subMenuKeys.value) || checkSelected(menuItemKeys.value);
  });

  const forwardedSlotNames = computed(() =>
    Object.keys(slots).filter(
      (name) => name !== 'expand-icon-down' && name !== 'expand-icon-right',
    ),
  );

  defineExpose({
    subMenuKeys,
    menuItemKeys,
    isChildrenSelected,
    props,
    attrs,
    computedKey,
    computedPopup,
    expandIconDown,
    expandIconRight,
  });
</script>
