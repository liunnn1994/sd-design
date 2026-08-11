<template>
  <DefineItem v-slot="{ item, index }">
    <VNodeRenderer v-if="isVNode(item)" :content="item" />
    <slot v-else name="item" :item="item" :index="index" />
  </DefineItem>
  <DefineEmpty>
    <slot v-if="!slots['scroll-loading']" name="empty">
      <component
        :is="configContext.slots.empty"
        v-if="configContext?.slots.empty"
        component="list"
      />
      <Empty v-else />
    </slot>
  </DefineEmpty>
  <DefineScrollLoading>
    <div
      v-if="slots['scroll-loading']"
      :class="[`${prefixCls}-item`, `${prefixCls}-scroll-loading`]"
    >
      <slot name="scroll-loading" />
    </div>
  </DefineScrollLoading>

  <div v-bind="attrs" :class="`${prefixCls}-wrapper`" :style="wrapperStyle">
    <Spin v-bind="mergedSpinProps" :class="`${prefixCls}-spin`" :loading="props.loading">
      <Scrollbar
        ref="componentRef"
        v-bind="scrollbarProps"
        :class="cls"
        :style="contentStyle"
        @scroll="handleScroll"
      >
        <div :class="`${prefixCls}-content-wrapper`" :style="contentWrapperStyle">
          <div v-if="slots.header" :class="`${prefixCls}-header`">
            <slot name="header" />
          </div>

          <template v-if="isVirtualList && !props.gridProps">
            <VirtualList
              v-if="virtualItems.length"
              ref="virtualListRef"
              v-bind="resolvedVirtualListProps"
              :class="contentCls"
              :items="virtualItems"
              @scroll="handleScroll"
            >
              <template #item="{ item, index }">
                <slot name="item" :item="item" :index="index" />
              </template>
            </VirtualList>
            <ReuseEmpty v-else />
            <ReuseScrollLoading />
          </template>

          <div v-else role="list" :class="contentCls">
            <template v-if="sourceItems.length">
              <template v-if="props.gridProps">
                <template v-if="props.gridProps.span">
                  <Grid.Row
                    v-for="(row, rowIndex) in gridRows"
                    :key="rowIndex"
                    :class="`${prefixCls}-row`"
                    :gutter="props.gridProps.gutter"
                  >
                    <Grid.Col
                      v-for="(item, index) in row"
                      :key="`${rowIndex}-${index}`"
                      :class="`${prefixCls}-col`"
                      :span="props.gridProps.span"
                    >
                      <ReuseItem :item="item" :index="index" />
                    </Grid.Col>
                  </Grid.Row>
                </template>
                <Grid.Row v-else :class="`${prefixCls}-row`" :gutter="props.gridProps.gutter">
                  <Grid.Col
                    v-for="(item, index) in currentPageItems"
                    :key="index"
                    v-bind="gridColumnProps"
                    :class="`${prefixCls}-col`"
                  >
                    <ReuseItem :item="item" :index="index" />
                  </Grid.Col>
                </Grid.Row>
              </template>
              <ReuseItem
                v-for="(item, index) in currentPageItems"
                v-else
                :key="index"
                :item="item"
                :index="index"
              />
            </template>
            <ReuseEmpty v-else />
            <ReuseScrollLoading />
          </div>

          <div v-if="slots.footer" :class="`${prefixCls}-footer`">
            <slot name="footer" />
          </div>
        </div>
      </Scrollbar>
      <Pagination
        v-if="props.paginationProps"
        v-bind="paginationRestProps"
        :class="`${prefixCls}-pagination`"
        :total="props.paginationProps.total ?? props.data?.length ?? 0"
        :current="current"
        :page-size="pageSize"
        @change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </Spin>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, isVNode, onMounted, ref, toRef, useAttrs, useSlots } from 'vue';
  import type { CSSProperties, PropType, VNodeChild } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type {
    ScrollIntoViewOptions,
    VirtualListProps,
  } from '../_components/virtual-list/interface';
  import type { SpinProps } from '../spin';

  import VirtualList from '../_components/virtual-list';
  import { useComponentRef } from '../_hooks/use-component-ref';
  import { useScrollbar } from '../_hooks/use-scrollbar';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber } from '../_utils/is';
  import { omit } from '../_utils/omit';
  import { getAllElements } from '../_utils/vue-utils';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Empty from '../empty';
  import Grid from '../grid';
  import Pagination, { type PaginationProps } from '../pagination';
  import Scrollbar, { type ScrollbarProps } from '../scrollbar';
  import Spin from '../spin';
  import { usePagination } from './use-pagination';

  const VNodeRenderer = (_props: { content?: VNodeChild }) => _props.content;

  defineOptions({ name: 'List', inheritAttrs: false });

  const props = defineProps({
    data: Array as PropType<any[]>,
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    bordered: {
      type: Boolean,
      default: true,
    },
    split: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    spinProps: Object as PropType<SpinProps>,
    hoverable: {
      type: Boolean,
      default: false,
    },
    paginationProps: Object as PropType<PaginationProps>,
    gridProps: Object,
    maxHeight: {
      type: [String, Number] as PropType<string | number>,
      default: 0,
    },
    bottomOffset: {
      type: Number,
      default: 0,
    },
    virtualListProps: Object as PropType<VirtualListProps>,
    scrollbar: {
      type: [Object, Boolean] as PropType<boolean | ScrollbarProps>,
      default: true,
    },
  });

  const emit = defineEmits({
    scroll: () => true,
    reachBottom: () => true,
    pageChange: (_page: number) => true,
    pageSizeChange: (_pageSize: number) => true,
  });

  const attrs = useAttrs();
  const slots = useSlots();
  const [DefineItem, ReuseItem] = createReusableTemplate<{ item: unknown; index: number }>();
  const [DefineEmpty, ReuseEmpty] = createReusableTemplate();
  const [DefineScrollLoading, ReuseScrollLoading] = createReusableTemplate();
  const prefixCls = getPrefixCls('list');
  const configContext = inject(configProviderInjectionKey, undefined);
  const mergedSpinProps = computed(() => ({
    ...configContext?.listSpinProps,
    ...props.spinProps,
  }));
  const { componentRef, elementRef: listRef } = useComponentRef('containerRef');
  const isVirtualList = computed(() => props.virtualListProps);
  const { scrollbarProps } = useScrollbar(toRef(props, 'scrollbar'));
  let previousScrollTop = 0;

  const handleScroll = (event: Event) => {
    const { scrollTop, scrollHeight, offsetHeight } = event.target as HTMLElement;
    const bottom = Math.floor(scrollHeight - (scrollTop + offsetHeight));
    if (scrollTop > previousScrollTop && bottom <= props.bottomOffset) emit('reachBottom');
    emit('scroll');
    previousScrollTop = scrollTop;
  };

  onMounted(() => {
    if (listRef.value) {
      const { scrollTop, scrollHeight, offsetHeight } = listRef.value;
      if (scrollHeight <= scrollTop + offsetHeight) emit('reachBottom');
    }
  });

  const { current, pageSize, handlePageChange, handlePageSizeChange } = usePagination(props, {
    emit: emit as (event: string, ...args: unknown[]) => void,
  });

  const getCurrentPageItems = (data: unknown[]) => {
    if (!props.paginationProps) return data;
    if (data.length > pageSize.value) {
      const startIndex = (current.value - 1) * pageSize.value;
      return data.slice(startIndex, startIndex + pageSize.value);
    }
    return data;
  };

  const sourceItems = computed(() =>
    slots.default ? getAllElements(slots.default()) : (props.data ?? []),
  );
  const currentPageItems = computed(() => getCurrentPageItems(sourceItems.value));
  const virtualItems = computed(() => getCurrentPageItems(props.data ?? []));
  const gridRows = computed(() => {
    const span = props.gridProps?.span;
    if (!span) return [];
    const rowSize = 24 / span;
    const rows: unknown[][] = [];
    for (let index = 0; index < currentPageItems.value.length; index += rowSize)
      rows.push(currentPageItems.value.slice(index, index + rowSize));
    return rows;
  });
  const gridColumnProps = computed(() => omit(props.gridProps ?? {}, ['gutter']));
  const paginationRestProps = computed(() =>
    omit(props.paginationProps ?? {}, ['current', 'pageSize', 'defaultCurrent', 'defaultPageSize']),
  );
  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-${props.size}`,
    {
      [`${prefixCls}-bordered`]: props.bordered,
      [`${prefixCls}-split`]: props.split,
      [`${prefixCls}-hover`]: props.hoverable,
    },
  ]);
  const contentStyle = computed<CSSProperties | undefined>(() => {
    if (props.maxHeight) {
      const maxHeight = isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight;
      return { maxHeight, overflowY: 'auto' };
    }
    if (isVirtualList.value && !props.gridProps) return { height: '100%', overflow: 'hidden' };
    return undefined;
  });
  const contentCls = computed(() => [
    `${prefixCls}-content`,
    { [`${prefixCls}-virtual`]: isVirtualList.value },
  ]);
  const virtualListRef = ref<InstanceType<typeof VirtualList>>();
  const resolvedVirtualListProps = computed<VirtualListProps | undefined>(() => {
    if (!props.virtualListProps) return undefined;
    if (props.virtualListProps.height !== undefined) return props.virtualListProps;
    return { ...props.virtualListProps, height: '100%' };
  });
  const contentWrapperStyle = computed<CSSProperties | undefined>(() =>
    isVirtualList.value && !props.gridProps
      ? { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }
      : undefined,
  );
  const wrapperStyle = computed(() =>
    isVirtualList.value && !props.gridProps ? { height: '100%', minHeight: 0 } : undefined,
  );

  const scrollIntoView = (options: ScrollIntoViewOptions) => {
    virtualListRef.value?.scrollTo(options);
  };

  defineExpose({ virtualListRef, scrollIntoView });
</script>
