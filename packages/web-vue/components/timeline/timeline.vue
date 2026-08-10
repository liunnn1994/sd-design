<template>
  <div role="list" :class="classes">
    <RenderTimelineItems />
  </div>
</template>

<script setup lang="ts">
  import { computed, h, inject, provide, reactive, toRef } from 'vue';
  import type { VNode } from 'vue';

  import type { SpinProps } from '../spin';
  import type { LabelPositionType, ModeType } from './interface';

  import { useChildrenComponents } from '../_hooks/use-children-components';
  import { Direction } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Spin from '../spin';
  import { timelineInjectionKey } from './context';
  import Item from './item.vue';

  defineOptions({
    name: 'Timeline',
  });

  const {
    reverse = false,
    direction = 'vertical',
    mode = 'left',
    pending,
    spinProps,
    labelPosition = 'same',
  } = defineProps<{
    /**
     * @zh 是否倒序
     * @en Whether reverse order
     */
    reverse?: boolean;
    /**
     * @zh 时间轴方向
     * @en Timeline direction
     * @values 'horizontal', 'vertical'
     */
    direction?: Direction;
    /**
     * @zh 时间轴的展示类型：时间轴在左侧，时间轴在右侧, 交替出现。
     * @en The display mode of Timeline
     * @values 'left','right','top','bottom','alternate'
     */
    mode?: ModeType;
    /**
     * @zh 是否展示幽灵节点，设置为 true 时候只展示幽灵节点。传入字符串时，会作为节点内容展示。
     * @en Whether to display ghost nodes. When set to true, only ghost nodes are displayed. When passed a string, it will be displayed as node content
     */
    pending?: boolean | string;
    /**
     * @zh 传递给幽灵节点 Spin 的属性
     * @en Props passed to the pending node Spin
     */
    spinProps?: SpinProps;
    /**
     * @zh 设置标签文本的位置
     * @en Position of label text
     * @values 'relative', 'same'
     */
    labelPosition?: LabelPositionType;
  }>();

  const slots = defineSlots<{
    /**
     * @zh 时间轴节点
     * @en Timeline items
     */
    default?: () => VNode[];
    /**
     * @zh 幽灵节点
     * @en Pending node
     */
    pending?: () => VNode[];
    /**
     * @zh 幽灵节点图标
     * @en Pending node dot
     */
    dot?: () => VNode[];
  }>();

  const configCtx = inject(configProviderInjectionKey, undefined);
  const mergedSpinProps = computed(() => ({
    ...configCtx?.timelineSpinProps,
    ...spinProps,
  }));
  const prefixCls = getPrefixCls('timeline');
  const hasPending = computed(() => pending || slots.pending);
  const { children, components } = useChildrenComponents('TimelineItem');

  const timelineContext = reactive({
    items: components,
    direction: toRef(() => direction),
    reverse: toRef(() => reverse),
    labelPosition: toRef(() => labelPosition),
    mode: toRef(() => mode),
  });
  provide(timelineInjectionKey, timelineContext);

  const classes = computed(() => [
    prefixCls,
    `${prefixCls}-${mode}`,
    `${prefixCls}-direction-${direction}`,
    {
      [`${prefixCls}-is-reverse`]: reverse,
    },
  ]);

  function RenderTimelineItems() {
    if (hasPending.value) {
      const pendingItem = h(
        Item,
        {
          lineType: 'dashed',
        },
        {
          dot: () => slots.dot?.() ?? h(Spin, { size: 12, ...mergedSpinProps.value }),
          default: () => (pending !== true ? h('div', null, pending) : undefined),
        },
      );

      children.value = slots.default?.()!.concat(pendingItem);
    } else {
      children.value = slots.default?.();
    }

    return children.value;
  }
</script>
