<template>
  <DefineItem v-slot="{ item, index }">
    <VNodeRenderer v-if="isVNode(item)" :content="item" />
    <slot v-else name="item" :item="item as TItem" :index="index" />
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
                <ReuseItem :item="item" :index="index" />
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
                      <ReuseItem :item="item" :index="rowIndex * gridRowSize + index" />
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
        :total="props.paginationProps.total ?? sourceItems.length"
        :current="current"
        :page-size="pageSize"
        @change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </Spin>
  </div>
</template>

<script setup lang="ts" generic="TItem = VNode">
  import {
    computed,
    inject,
    isVNode,
    onBeforeUpdate,
    onMounted,
    ref,
    shallowRef,
    toRef,
    useAttrs,
    useSlots,
  } from 'vue';
  import type { ComponentPublicInstance, CSSProperties, PropType, VNodeChild, VNode } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type {
    ScrollIntoViewOptions,
    VirtualListProps,
  } from '../_components/virtual-list/interface';
  import type { SpinProps } from '../spin';

  import VirtualList from '../_components/virtual-list';
  import { useScrollbar } from '../_hooks/use-scrollbar';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber } from '../_utils/is';
  import { omit } from '../_utils/omit';
  import { getAllElements } from '../_utils/vue-utils';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Empty from '../empty';
  import Grid from '../grid';
  import Pagination, { type PaginationProps } from '../pagination';
  import Scrollbar, { type ScrollbarInstance, type ScrollbarProps } from '../scrollbar';
  import Spin from '../spin';
  import { usePagination } from './use-pagination';

  const VNodeRenderer = (_props: { content?: VNodeChild }) => _props.content;

  defineOptions({ name: 'List', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 列表数据
     * @en Data of the list
     */
    data: Array as PropType<TItem[]>,
    /**
     * @zh 列表尺寸
     * @en Size of the list
     */
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    /**
     * @zh 是否显示边框
     * @en Whether to show borders
     */
    bordered: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否显示分割线
     * @en Whether to show dividers between items
     */
    split: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否展示加载状态
     * @en Whether the list is loading
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 加载状态的组件属性
     * @en Props forwarded to the loading indicator
     */
    spinProps: Object as PropType<SpinProps>,
    /**
     * @zh 列表项是否可悬停高亮
     * @en Whether list items highlight on hover
     */
    hoverable: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 分页组件的属性
     * @en Props forwarded to the pagination
     */
    paginationProps: Object as PropType<PaginationProps>,
    /**
     * @zh 栅格组件的属性
     * @en Props forwarded to the grid
     */
    gridProps: Object,
    /**
     * @zh 最大高度，超出后列表内部滚动
     * @en Maximum height; the list scrolls internally beyond it
     */
    maxHeight: {
      type: [String, Number] as PropType<string | number>,
      default: 0,
    },
    /**
     * @zh 触底加载的偏移量
     * @en Offset used to trigger loading on scroll
     */
    bottomOffset: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 虚拟列表的属性，用于大数据量渲染
     * @en Props forwarded to the virtual list, used for large data sets
     */
    virtualListProps: Object as PropType<VirtualListProps>,
    /**
     * @zh 滚动条配置
     * @en Scrollbar configuration
     */
    scrollbar: {
      type: [Object, Boolean] as PropType<boolean | ScrollbarProps>,
      default: true,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 列表滚动时触发
     * @en Trigger when the list scrolls
     */
    scroll: [];
    /**
     * @zh 滚动到底部时触发
     * @en Trigger when the list reaches the bottom
     */
    reachBottom: [];
    /**
     * @zh 页码变化时触发
     * @en Trigger when the page changes
     */
    pageChange: [_page: number];
    /**
     * @zh 每页条数变化时触发
     * @en Trigger when the page size changes
     */
    pageSizeChange: [_pageSize: number];
  }>();

  const attrs = useAttrs();
  const slots = useSlots();
  const defaultSlot = shallowRef(slots.default);
  onBeforeUpdate(() => {
    defaultSlot.value = slots.default;
  });
  const [DefineItem, ReuseItem] = createReusableTemplate<{ item: unknown; index: number }>();
  const [DefineEmpty, ReuseEmpty] = createReusableTemplate();
  const [DefineScrollLoading, ReuseScrollLoading] = createReusableTemplate();
  const prefixCls = getPrefixCls('list');
  const configContext = inject(configProviderInjectionKey, undefined);
  const mergedSpinProps = computed(() => ({
    ...configContext?.listSpinProps,
    ...props.spinProps,
  }));
  const componentRef = ref<ScrollbarInstance>();
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
    const viewport = (virtualListRef.value?.$refs.viewportRef ??
      componentRef.value?.elements()?.scrollOffsetElement) as HTMLElement | undefined;
    if (viewport) {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      if (scrollHeight <= scrollTop + clientHeight) emit('reachBottom');
    }
  });

  const { current, pageSize, handlePageChange, handlePageSizeChange } = usePagination(props, {
    emit: emit as (event: string, ...args: unknown[]) => void,
  });

  const getCurrentPageItems = (data: TItem[]) => {
    if (!props.paginationProps) return data;
    if (data.length > pageSize.value) {
      const startIndex = (current.value - 1) * pageSize.value;
      return data.slice(startIndex, startIndex + pageSize.value);
    }
    return data;
  };

  const sourceItems = computed(() =>
    defaultSlot.value ? (getAllElements(defaultSlot.value()) as TItem[]) : (props.data ?? []),
  );
  const currentPageItems = computed(() => getCurrentPageItems(sourceItems.value));
  const virtualItems = computed(() => getCurrentPageItems(props.data ?? []));
  const gridRowSize = computed(() => Math.max(1, Math.floor(24 / (props.gridProps?.span || 24))));
  const gridRows = computed(() => {
    const span = props.gridProps?.span;
    if (!span) return [];
    const rowSize = gridRowSize.value;
    const rows: TItem[][] = [];
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
  const virtualListRef = ref<
    ComponentPublicInstance &
      import('vue-component-type-helpers').ComponentExposed<typeof VirtualList>
  >();
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
