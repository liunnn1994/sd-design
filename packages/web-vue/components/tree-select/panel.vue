<template>
  <Scrollbar :class="treeWrapperClassName" v-bind="scrollbarProps">
    <Tree
      ref="refTree"
      v-bind="computedTreeProps"
      :ellipsis="ellipsis"
      @select="onSelect"
      @check="onCheck"
    >
      <template v-for="(_, name) in treeSlots" #[name]="slotData">
        <component :is="treeSlots[name]" v-bind="slotData ?? {}" />
      </template>
    </Tree>
  </Scrollbar>
</template>

<script setup lang="ts">
  import { computed, ref, toRef, type PropType, type Slots } from 'vue';

  import { createTreeSelectPanelFoundation } from '@sdata/web-core/tree-select/panel';

  import type { ScrollbarProps } from '../scrollbar';
  import type { TreeNodeKey, TreeProps } from '../tree/interface';

  import { useScrollbar } from '../_hooks/use-scrollbar';
  import { getPrefixCls } from '../_utils/global-config';
  import Scrollbar from '../scrollbar';
  import Tree from '../tree';

  type TreeInstance = {
    toggleCheck?: (key: TreeNodeKey, event: Event) => void;
  };

  type TreeComponentProps = InstanceType<typeof Tree>['$props'];

  defineOptions({ name: 'TreeSelectPanel' });

  const props = defineProps({
    treeProps: {
      type: Object as PropType<Partial<TreeProps>>,
      default: () => ({}),
    },
    ellipsis: {
      type: [Boolean, String] as PropType<TreeProps['ellipsis']>,
      default: false,
    },
    selectedKeys: Array as PropType<TreeNodeKey[]>,
    showCheckable: Boolean,
    treeSlots: {
      type: Object as PropType<Slots>,
      default: () => ({}),
    },
    scrollbar: {
      type: [Boolean, Object] as PropType<boolean | ScrollbarProps>,
      default: true,
    },
  });

  const emit = defineEmits<{
    change: [value: TreeNodeKey[]];
  }>();

  const { scrollbarProps } = useScrollbar(toRef(props, 'scrollbar'));
  const prefixCls = getPrefixCls('tree-select');
  const refTree = ref<TreeInstance>();

  const foundation = createTreeSelectPanelFoundation(
    {
      get showCheckable() {
        return props.showCheckable;
      },
      get selectedKeys() {
        return props.selectedKeys;
      },
      get tree() {
        return refTree.value;
      },
    },
    (value) => emit('change', value),
  );
  const computedTreeProps = computed<Partial<TreeComponentProps>>(() => ({
    ...(props.treeProps as Partial<TreeComponentProps>),
    ...foundation.getSelectionProps(),
  }));

  const treeWrapperClassName = computed(() => [
    `${prefixCls}-tree-wrapper`,
    computedTreeProps.value.virtualListProps && `${prefixCls}-tree-wrapper-virtual`,
  ]);

  const onSelect: NonNullable<TreeProps['onSelect']> = foundation.onSelect;
  const onCheck: NonNullable<TreeProps['onCheck']> = foundation.onCheck;
</script>
