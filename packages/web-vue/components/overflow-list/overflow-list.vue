<template>
  <DefineOverflow>
    <div ref="overflowRef" :class="`${prefixCls}-overflow`" :style="overflowStyle">
      <slot name="overflow" :number="overflowNumber">
        <Tag>+{{ overflowNumber }}</Tag>
      </slot>
    </div>
  </DefineOverflow>

  <div ref="listRef" :class="prefixCls">
    <ReuseOverflow v-if="isStart && showOverflow" />
    <component
      :is="child"
      v-for="(child, index) in getVisibleChildren()"
      :key="child.key ?? index"
    />
    <ReuseOverflow v-if="!isStart && showOverflow" />
    <ResizeObserver @resize="onResize">
      <div ref="spacerRef" :class="`${prefixCls}-spacer`" />
    </ResizeObserver>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    mergeProps,
    onMounted,
    ref,
    useSlots,
    watch,
    type PropType,
    type VNode,
  } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import ResizeObserver from '../_components/resize-observer-v2';
  import { getReverse } from '../_utils/array';
  import { getPrefixCls } from '../_utils/global-config';
  import { getAllElements } from '../_utils/vue-utils';
  import Tag from '../tag';

  defineOptions({
    name: 'OverflowList',
  });

  const props = defineProps({
    /**
     * @zh 最少展示的元素个数
     * @en Minimum number of elements to display
     */
    min: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 项目间隔
     * @en Item Margin
     */
    margin: {
      type: Number,
      default: 8,
    },
    /**
     * @zh 折叠方向
     * @en Overflow From
     */
    from: {
      type: String as PropType<'start' | 'end'>,
      default: 'end',
    },
  });

  const emit = defineEmits({
    /**
     * @zh 溢出数量改变时触发
     * @en Triggered when the overflow quantity changes
     * @param {number} value
     */
    change: (_value: number) => true,
  });

  /**
   * @zh 折叠元素
   * @en Overflow
   * @slot overflow
   * @binding {number} number
   */
  const slots = useSlots();
  const prefixCls = getPrefixCls('overflow-list');
  const [DefineOverflow, ReuseOverflow] = createReusableTemplate();

  const listRef = ref<HTMLElement>();
  const overflowRef = ref<HTMLElement>();
  const spacerRef = ref<HTMLElement>();
  const children: { value?: VNode[] } = {};
  const itemWidths: number[] = [];

  const total = ref(0);
  const overflowNumber = ref(0);
  const showOverflow = computed(() => overflowNumber.value > 0);
  const nextWidth = ref(0);
  const isStart = computed(() => props.from === 'start');
  const overflowStyle = computed(() =>
    isStart.value ? { marginRight: `${props.margin}px` } : undefined,
  );

  watch(total, (cur, pre) => {
    if (overflowNumber.value > 0) {
      overflowNumber.value += cur - pre;
      if (overflowNumber.value < 0) {
        overflowNumber.value = 0;
      }
    }
  });

  watch(overflowNumber, (val) => {
    emit('change', val);
  });

  function onResize() {
    if (!listRef.value || !children.value || !spacerRef.value) {
      return;
    }

    const spacerWidth = spacerRef.value.offsetWidth;
    if (spacerWidth > 1 && (overflowNumber.value === 0 || spacerWidth < nextWidth.value)) {
      return;
    }

    // get new item width
    for (let i = 0; i < children.value.length; i++) {
      const element = children.value[i].el as HTMLElement;
      if (element && element.offsetWidth) {
        itemWidths[i] = element.offsetWidth + props.margin;
      }
    }

    let remainingWidth =
      listRef.value.clientWidth -
      (overflowRef.value?.offsetWidth ?? 0) -
      (isStart.value ? props.margin : 0);

    const currentItemWidths = isStart.value ? getReverse(itemWidths) : itemWidths;
    let count = 0;
    for (const itemWidth of currentItemWidths) {
      if ((itemWidth ?? 0) < remainingWidth - 1) {
        remainingWidth -= itemWidth ?? 0;
        count += 1;
      } else {
        nextWidth.value = itemWidth ?? 0;
        break;
      }
    }
    if (count < props.min && props.min < total.value) {
      count = props.min;
    }
    if (overflowNumber.value !== total.value - count) {
      overflowNumber.value = total.value - count;
    }
  }

  watch(showOverflow, onResize, { flush: 'post' });

  onMounted(() => {
    if (spacerRef.value && spacerRef.value.offsetWidth < 1) {
      onResize();
    }
  });

  function getVisibleChildren() {
    children.value = getAllElements(slots.default?.());

    if (total.value !== children.value.length) {
      total.value = children.value.length;
      itemWidths.length = total.value;
    }

    let visibleChildren = children.value;
    if (overflowNumber.value > 0) {
      visibleChildren = isStart.value
        ? children.value.slice(overflowNumber.value)
        : children.value.slice(0, -overflowNumber.value);
    }

    const withMarginNumber =
      overflowNumber.value === 0 || isStart.value
        ? visibleChildren.length - 1
        : visibleChildren.length;

    for (let i = 0; i < withMarginNumber; i++) {
      visibleChildren[i].props = mergeProps(visibleChildren[i].props ?? {}, {
        style: { marginRight: `${props.margin}px` },
      });
    }

    return visibleChildren;
  }
</script>
