<template>
  <DefineLabel v-slot="{ index, item }">
    <VNodeRenderer :content="getLabel(item, index)" />
  </DefineLabel>
  <DefineValue v-slot="{ index, item }">
    <VNodeRenderer :content="getValue(item, index)" />
  </DefineValue>

  <div :class="cls" v-bind="$attrs">
    <div v-if="$slots.title || title" :class="`${prefixCls}-title`">
      <slot name="title">{{ title }}</slot>
    </div>
    <div :class="`${prefixCls}-body`">
      <table :class="`${prefixCls}-table`">
        <tbody>
          <template v-for="(row, rowIndex) in displayGroupedData()" :key="rowIndex">
            <tr
              v-if="['inline-horizontal', 'inline-vertical'].includes(layout)"
              :class="`${prefixCls}-row`"
            >
              <td
                v-for="(item, itemIndex) in row"
                :key="itemIndex"
                :class="`${prefixCls}-item`"
                :colspan="item.span"
              >
                <div
                  :class="[`${prefixCls}-item-label`, `${prefixCls}-item-label-inline`]"
                  :style="mergedLabelStyle"
                >
                  <ReuseLabel :item="item.data" :index="itemIndex" />
                </div>
                <div
                  :class="[`${prefixCls}-item-value`, `${prefixCls}-item-value-inline`]"
                  :style="mergedValueStyle"
                >
                  <ReuseValue :item="item.data" :index="itemIndex" />
                </div>
              </td>
            </tr>
            <template v-else-if="layout === 'vertical'">
              <tr :class="`${prefixCls}-row`">
                <td
                  v-for="(item, itemIndex) in row"
                  :key="itemIndex"
                  :class="[`${prefixCls}-item-label`, `${prefixCls}-item-label-block`]"
                  :style="mergedLabelStyle"
                  :colspan="item.span"
                >
                  <ReuseLabel :item="item.data" :index="itemIndex" />
                </td>
              </tr>
              <tr :class="`${prefixCls}-row`">
                <td
                  v-for="(item, itemIndex) in row"
                  :key="itemIndex"
                  :class="[`${prefixCls}-item-value`, `${prefixCls}-item-value-block`]"
                  :style="mergedValueStyle"
                  :colspan="item.span"
                >
                  <ReuseValue :item="item.data" :index="itemIndex" />
                </td>
              </tr>
            </template>
            <tr v-else :class="`${prefixCls}-row`">
              <template v-for="(item, itemIndex) in row" :key="itemIndex">
                <td
                  :class="[`${prefixCls}-item-label`, `${prefixCls}-item-label-block`]"
                  :style="mergedLabelStyle"
                >
                  <ReuseLabel :item="item.data" :index="rowIndex" />
                </td>
                <td
                  :class="[`${prefixCls}-item-value`, `${prefixCls}-item-value-block`]"
                  :style="mergedValueStyle"
                  :colspan="item.span * 2 - 1"
                >
                  <ReuseValue :item="item.data" :index="rowIndex" />
                </td>
              </template>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    isVNode,
    toRefs,
    useSlots,
    type CSSProperties,
    type PropType,
    type VNode,
    type VNodeChild,
  } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { Size, TextAlign } from '../_utils/constant';
  import type { ResponsiveValue } from '../grid';
  import type { DescData, RenderData } from './interface';

  import { useSize } from '../_hooks/use-size';
  import { getPrefixCls } from '../_utils/global-config';
  import { isFunction, isObject } from '../_utils/is';
  import { getAllElements, isSlotsChildren } from '../_utils/vue-utils';
  import { useResponsiveState } from '../grid/hook/use-responsive-state';

  defineOptions({
    name: 'Descriptions',
    inheritAttrs: false,
  });

  const props = defineProps({
    data: {
      type: Array as PropType<DescData[]>,
      default: () => [],
    },
    column: {
      type: [Number, Object] as PropType<number | ResponsiveValue>,
      default: 3,
    },
    title: String,
    layout: {
      type: String as PropType<'horizontal' | 'vertical' | 'inline-horizontal' | 'inline-vertical'>,
      default: 'horizontal',
    },
    align: {
      type: [String, Object] as PropType<TextAlign | { label?: TextAlign; value?: TextAlign }>,
      default: 'left',
    },
    size: String as PropType<Size>,
    bordered: {
      type: Boolean,
      default: false,
    },
    labelStyle: Object as PropType<CSSProperties>,
    valueStyle: Object as PropType<CSSProperties>,
    tableLayout: {
      type: String as PropType<'auto' | 'fixed'>,
      default: 'auto',
    },
  });

  const slots = useSlots();
  const { column, size } = toRefs(props);
  const prefixCls = getPrefixCls('descriptions');
  const { mergedSize } = useSize(size);
  const computedColumn = useResponsiveState(column, 3, true);
  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;
  const [DefineLabel, ReuseLabel] = createReusableTemplate<{
    item: DescData | VNode;
    index: number;
  }>();
  const [DefineValue, ReuseValue] = createReusableTemplate<{
    item: DescData | VNode;
    index: number;
  }>();
  const labelAlign = computed(
    () => (isObject(props.align) ? props.align.label : props.align) ?? 'left',
  );
  const valueAlign = computed(
    () => (isObject(props.align) ? props.align.value : props.align) ?? 'left',
  );
  const mergedLabelStyle = computed<CSSProperties>(() => ({
    textAlign: labelAlign.value,
    ...props.labelStyle,
  }));
  const mergedValueStyle = computed<CSSProperties>(() => ({
    textAlign: valueAlign.value,
    ...props.valueStyle,
  }));
  const groupedData = computed(() => getGroupedData(props.data));
  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-layout-${props.layout}`,
    `${prefixCls}-size-${mergedSize.value}`,
    {
      [`${prefixCls}-border`]: props.bordered,
      [`${prefixCls}-table-layout-fixed`]: props.tableLayout === 'fixed',
    },
  ]);

  function getGroupedData(data: (DescData | VNode)[]) {
    const result: RenderData[][] = [];
    let currentRow: RenderData[] = [];
    let currentSpan = 0;

    function addRow() {
      if (!currentRow.length) return;
      currentRow[currentRow.length - 1].span += computedColumn.value - currentSpan;
      result.push(currentRow);
    }

    data.forEach((item) => {
      const itemSpan = Math.min(
        (isVNode(item) ? item.props?.span : item.span) ?? 1,
        computedColumn.value,
      );
      if (currentSpan + itemSpan > computedColumn.value) {
        addRow();
        currentRow = [];
        currentSpan = 0;
      }
      currentRow.push({ data: item, span: itemSpan });
      currentSpan += itemSpan;
    });
    addRow();
    return result;
  }

  function displayGroupedData() {
    return slots.default ? getGroupedData(getAllElements(slots.default())) : groupedData.value;
  }

  function getLabel(item: DescData | VNode, index: number): VNodeChild {
    if (isVNode(item)) {
      return (isSlotsChildren(item, item.children) && item.children.label?.()) || item.props?.label;
    }
    return (
      slots.label?.({ label: item.label, index, data: item }) ??
      (isFunction(item.label) ? item.label() : item.label)
    );
  }

  function getValue(item: DescData | VNode, index: number): VNodeChild {
    if (isVNode(item)) return item;
    return (
      slots.value?.({ value: item.value, index, data: item }) ??
      (isFunction(item.value) ? item.value() : item.value)
    );
  }
</script>
