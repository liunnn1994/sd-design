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

  const computedTreeProps = computed<Partial<TreeComponentProps>>(() => ({
    ...(props.treeProps as Partial<TreeComponentProps>),
    disableSelectActionOnly: true,
    checkedKeys: props.showCheckable ? props.selectedKeys : [],
    selectedKeys: props.showCheckable ? [] : props.selectedKeys,
  }));

  const treeWrapperClassName = computed(() => [
    `${prefixCls}-tree-wrapper`,
    computedTreeProps.value.virtualListProps && `${prefixCls}-tree-wrapper-virtual`,
  ]);

  const onSelect: NonNullable<TreeProps['onSelect']> = (newValue, event) => {
    if (props.showCheckable) {
      if (newValue[0] !== undefined && event.e) {
        refTree.value?.toggleCheck?.(newValue[0], event.e);
      }
    } else {
      emit('change', newValue);
    }
  };

  const onCheck: NonNullable<TreeProps['onCheck']> = (newValue) => {
    emit('change', newValue);
  };
</script>
