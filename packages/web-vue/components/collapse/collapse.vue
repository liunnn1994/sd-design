<template>
  <div :class="cls">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed, provide, reactive, ref, toRefs, useSlots } from 'vue';

  import { createCollapseFoundation } from '@sdata/web-core/collapse/foundation';

  import { getPrefixCls } from '../_utils/global-config';
  import { collapseKey } from './context';

  const EXPAND_ICON_POSITIONS = ['left', 'right'] as const;
  type ExpandIconPositions = (typeof EXPAND_ICON_POSITIONS)[number];

  defineOptions({ name: 'Collapse' });

  const props = defineProps({
    /**
     * @zh 当前展开的面板的 `key`
     * @en The `key` of the currently expanded panel
     * @vModel
     */
    activeKey: {
      type: Array as PropType<(string | number)[]>,
      default: undefined,
    },
    /**
     * @zh 默认展开的面板的 `key` （非受控模式）
     * @en The `key` of the panel expanded by default (uncontrolled mode)
     */
    defaultActiveKey: {
      type: Array as PropType<(string | number)[]>,
      default: () => [],
    },
    /**
     * @zh 是否开启手风琴模式
     * @en Whether to enable accordion mode
     */
    accordion: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示展开图标
     * @en Whether to show the expand icon
     * @version 2.33.0
     */
    showExpandIcon: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 展开图标显示的位置
     * @en The location where the expand icon is displayed
     * @values 'left', 'right'
     */
    expandIconPosition: {
      type: String as PropType<ExpandIconPositions>,
      default: 'left',
    },
    /**
     * @zh 是否显示边框
     * @en Whether to show the border
     */
    bordered: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否在隐藏时销毁内容
     * @en Whether to destroy content when hidden
     * @version 2.27.0
     */
    destroyOnHide: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    'update:activeKey': [_activeKey: (string | number)[]];
    /**
     * @zh 展开的面板发生改变时触发
     * @en Emitted when the expanded panel changes
     * @param {(string | number)[]} activeKey
     * @param {Event} ev
     */
    'change': [_activeKey: (string | number)[], _ev: Event];
  }>();

  /**
   * @zh 展开图标
   * @en Expand icon
   * @slot expand-icon
   * @binding {boolean} active
   * @binding {boolean} disabled
   * @binding {'left' | 'right'} position
   * @version 2.33.0
   */
  const slots = useSlots();
  const { expandIconPosition, destroyOnHide, showExpandIcon } = toRefs(props);
  const prefixCls = getPrefixCls('collapse');

  const _activeKey = ref(props.defaultActiveKey);
  const computedActiveKeys = computed(() => foundation.getKeys());
  const foundation = createCollapseFoundation({
    get value() {
      return props.activeKey;
    },
    get inner() {
      return _activeKey.value;
    },
    get keys() {
      return computedActiveKeys.value;
    },
    get accordion() {
      return props.accordion;
    },
    setInner(value) {
      _activeKey.value = value;
    },
    onChange(value, event) {
      emit('update:activeKey', value);
      emit('change', value, event);
    },
  });
  const handleClick = foundation.click;

  provide(
    collapseKey,
    reactive({
      activeKeys: computedActiveKeys,
      slots,
      showExpandIcon,
      expandIconPosition,
      destroyOnHide,
      handleClick,
    }),
  );

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-borderless`]: !props.bordered,
    },
  ]);
</script>
