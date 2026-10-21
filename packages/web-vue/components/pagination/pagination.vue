<template>
  <DefinePageItem v-slot="{ type, pageNumber, step, simple = false }">
    <EllipsisPager
      v-if="type === 'more'"
      :current="computedCurrent"
      :pages="pages"
      :disabled="props.disabled"
      :style="props.pageItemStyle"
      :active-style="props.activePageItemStyle"
      :step="step"
      @click="handleClick"
    >
      <slot name="page-item-ellipsis" />
    </EllipsisPager>
    <StepPager
      v-else-if="type === 'previous' || type === 'next'"
      :type="type"
      :current="computedCurrent"
      :pages="pages"
      :disabled="props.disabled"
      :style="props.pageItemStyle"
      :active-style="props.activePageItemStyle"
      :simple="simple"
      @click="handleClick"
    >
      <template #default="slotProps">
        <slot name="page-item-step" v-bind="slotProps" />
      </template>
    </StepPager>
    <Pager
      v-else
      :page-number="pageNumber"
      :current="computedCurrent"
      :pages="pages"
      :disabled="props.disabled"
      :style="props.pageItemStyle"
      :active-style="props.activePageItemStyle"
      @click="handleClick"
    >
      <template #default="slotProps">
        <slot name="page-item" v-bind="slotProps" />
      </template>
    </Pager>
  </DefinePageItem>

  <div
    v-if="!(props.hideOnSinglePage && pages <= 1)"
    v-bind="attrs"
    role="navigation"
    :aria-label="t('a11y.pagination')"
    :class="cls"
  >
    <span v-if="mergedShowTotal" :class="`${prefixCls}-total`">
      <slot name="total" :total="props.total">{{ t('pagination.total', props.total) }}</slot>
    </span>

    <span v-if="props.simple" :class="`${prefixCls}-simple`">
      <ReusePageItem type="previous" simple />
      <PageJumper
        :disabled="props.disabled"
        :current="computedCurrent"
        :size="mergedSize"
        :pages="pages"
        simple
        @change="handleClick"
      />
      <ReusePageItem type="next" simple />
    </span>
    <ul v-else :class="`${prefixCls}-list`">
      <ReusePageItem type="previous" simple />
      <ReusePageItem
        v-for="item in pageList"
        :key="item.key"
        :type="item.type"
        :page-number="item.pageNumber"
        :step="item.step"
      />
      <ReusePageItem
        v-if="mergedShowMore"
        key="more"
        type="more"
        :step="resolvedBufferSize * 2 + 1"
      />
      <ReusePageItem type="next" simple />
    </ul>

    <PageOptions
      v-if="mergedShowPageSize"
      :disabled="props.disabled"
      :size-options="mergedPageSizeOptions ?? props.pageSizeOptions"
      :page-size="computedPageSize"
      :size="mergedSize"
      :select-props="mergedPageSizeProps"
      @change="handlePageSizeChange"
    />
    <PageJumper
      v-if="!props.simple && mergedShowJumper"
      :disabled="props.disabled"
      :current="computedCurrent"
      :pages="pages"
      :size="mergedSize"
      @change="handleClick"
    >
      <template #jumper-prepend><slot name="jumper-prepend" /></template>
      <template #jumper-append><slot name="jumper-append" /></template>
    </PageJumper>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, toRef, useAttrs, watch, type CSSProperties, type PropType } from 'vue';

  import { createPaginationFoundation } from '@sdata/web-core/pagination/foundation';
  import { createReusableTemplate } from '@vueuse/core';

  import type { PageItemType, PaginationSelectProps } from './interface';

  import { useConfigProviderProp } from '../_hooks/use-config-provider-prop';
  import { useSize } from '../_hooks/use-size';
  import { Size } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';
  import EllipsisPager from './page-item-ellipsis.vue';
  import StepPager from './page-item-step.vue';
  import Pager from './page-item.vue';
  import PageJumper from './page-jumper.vue';
  import PageOptions from './page-options.vue';

  defineOptions({ name: 'Pagination', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 数据总数
     * @en Total number of records
     */
    total: {
      type: Number,
      required: true,
    },
    /**
     * @zh 当前页码（受控）
     * @en Current page (controlled)
     */
    current: Number,
    /**
     * @zh 默认页码（非受控）
     * @en Default page (uncontrolled state)
     */
    defaultCurrent: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 每页条数（受控）
     * @en Number of items per page (controlled)
     */
    pageSize: Number,
    /**
     * @zh 默认每页条数（非受控）
     * @en Default page size (uncontrolled state)
     */
    defaultPageSize: {
      type: Number,
      default: 10,
    },
    /**
     * @zh 是否禁用
     * @en Whether the pagination is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 仅一页时是否隐藏分页器
     * @en Whether to hide the pagination when there is only one page
     */
    hideOnSinglePage: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否使用简洁模式
     * @en Whether to use the simple mode
     */
    simple: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示总条数
     * @en Whether to show the total count
     */
    showTotal: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示更多按钮
     * @en Whether to show the more button
     */
    showMore: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示跳页器
     * @en Whether to show the page jumper
     */
    showJumper: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示每页条数选择器
     * @en Whether to show the page size selector
     */
    showPageSize: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 每页条数的可选值
     * @en Options for the page size selector
     */
    pageSizeOptions: {
      type: Array as PropType<number[]>,
      default: () => [10, 20, 30, 40, 50],
    },
    /**
     * @zh 每页条数选择器的组件属性
     * @en Props forwarded to the page size selector
     */
    pageSizeProps: Object as PropType<PaginationSelectProps>,
    /**
     * @zh 尺寸
     * @en Size of the pagination
     */
    size: String as PropType<Size>,
    /**
     * @zh 页码项的样式
     * @en Style of the page items
     */
    pageItemStyle: Object as PropType<CSSProperties>,
    /**
     * @zh 当前页码项的样式
     * @en Style of the active page item
     */
    activePageItemStyle: Object as PropType<CSSProperties>,
    /**
     * @zh 基础页码数量，超出后折叠为省略号
     * @en Number of page items shown before collapsing into ellipsis
     */
    baseSize: {
      type: Number,
      default: 6,
    },
    /**
     * @zh 省略号两侧保留的页码数量
     * @en Number of page items kept on each side of the ellipsis
     */
    bufferSize: {
      type: Number,
      default: 2,
    },
    /**
     * @zh 总条数变化时是否自动修正当前页码
     * @en Whether to correct the current page when the total changes
     */
    autoAdjust: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    'update:current': [_current: number];
    'update:pageSize': [_pageSize: number];
    /**
     * @zh 页码变化时触发
     * @en Trigger when the page changes
     */
    'change': [_current: number];
    /**
     * @zh 每页条数变化时触发
     * @en Trigger when the page size changes
     */
    'pageSizeChange': [_pageSize: number];
  }>();

  const attrs = useAttrs();
  const [DefinePageItem, ReusePageItem] = createReusableTemplate<{
    type: PageItemType;
    pageNumber?: number;
    step?: number;
    simple?: boolean;
  }>();
  const prefixCls = getPrefixCls('pagination');
  const { t } = useI18n();
  const { mergedSize } = useSize(toRef(props, 'size'));
  const { mergedValue: mergedPageSizeOptions } = useConfigProviderProp(
    toRef(props, 'pageSizeOptions'),
    {
      propNames: ['pageSizeOptions', 'page-size-options'],
      getGlobalValue: (context) => context?.pagination?.pageSizeOptions,
    },
  );
  const { mergedValue: mergedDefaultPageSize } = useConfigProviderProp(
    toRef(props, 'defaultPageSize'),
    {
      propNames: ['defaultPageSize', 'default-page-size'],
      getGlobalValue: (context) => context?.pagination?.defaultPageSize,
    },
  );
  const { mergedValue: mergedShowTotal } = useConfigProviderProp(toRef(props, 'showTotal'), {
    propNames: ['showTotal', 'show-total'],
    getGlobalValue: (context) => context?.pagination?.showTotal,
  });
  const { mergedValue: mergedShowMore } = useConfigProviderProp(toRef(props, 'showMore'), {
    propNames: ['showMore', 'show-more'],
    getGlobalValue: (context) => context?.pagination?.showMore,
  });
  const { mergedValue: mergedShowJumper } = useConfigProviderProp(toRef(props, 'showJumper'), {
    propNames: ['showJumper', 'show-jumper'],
    getGlobalValue: (context) => context?.pagination?.showJumper,
  });
  const { mergedValue: mergedShowPageSize } = useConfigProviderProp(toRef(props, 'showPageSize'), {
    propNames: ['showPageSize', 'show-page-size'],
    getGlobalValue: (context) => context?.pagination?.showPageSize,
  });
  const { mergedValue: mergedAutoAdjust } = useConfigProviderProp(toRef(props, 'autoAdjust'), {
    propNames: ['autoAdjust', 'auto-adjust'],
    getGlobalValue: (context) => context?.pagination?.autoAdjust,
  });
  const { mergedValue: mergedBaseSize } = useConfigProviderProp(toRef(props, 'baseSize'), {
    propNames: ['baseSize', 'base-size'],
    getGlobalValue: (context) => context?.pagination?.baseSize,
  });
  const { mergedValue: mergedBufferSize } = useConfigProviderProp(toRef(props, 'bufferSize'), {
    propNames: ['bufferSize', 'buffer-size'],
    getGlobalValue: (context) => context?.pagination?.bufferSize,
  });
  const { mergedValue: mergedPageSizeProps } = useConfigProviderProp(
    toRef(props, 'pageSizeProps'),
    {
      propNames: ['pageSizeProps', 'page-size-props'],
      getGlobalValue: (context) => context?.pagination?.pageSizeProps,
    },
  );

  const innerCurrent = ref(props.defaultCurrent);
  const innerPageSize = ref(mergedDefaultPageSize.value ?? 10);
  const computedCurrent = computed(() => props.current ?? innerCurrent.value);
  const computedPageSize = computed(() => props.pageSize ?? innerPageSize.value);
  const resolvedBaseSize = computed(() => mergedBaseSize.value ?? props.baseSize);
  const resolvedBufferSize = computed(() => mergedBufferSize.value ?? props.bufferSize);
  const pages = computed(() => Math.ceil(props.total / computedPageSize.value));

  const foundation = createPaginationFoundation({
    get current() {
      return computedCurrent.value;
    },
    get pageSize() {
      return computedPageSize.value;
    },
    get controlledPageSize() {
      return props.pageSize;
    },
    get pages() {
      return pages.value;
    },
    get baseSize() {
      return resolvedBaseSize.value;
    },
    get bufferSize() {
      return resolvedBufferSize.value;
    },
    get autoAdjust() {
      return mergedAutoAdjust.value;
    },
    get disabled() {
      return props.disabled;
    },
    setCurrent: (value) => {
      innerCurrent.value = value;
    },
    setPageSize: (value) => {
      innerPageSize.value = value;
    },
    onCurrent: (value) => {
      emit('update:current', value);
      emit('change', value);
    },
    onPageSize: (value) => {
      emit('update:pageSize', value);
      emit('pageSizeChange', value);
    },
  });
  const handleClick = foundation.change;
  const handlePageSizeChange = foundation.changePageSize;
  const pageList = computed(() => foundation.getPageList());
  watch([computedPageSize, pages], ([size, count], [previousSize, previousCount]) => {
    foundation.sync(size, count, previousSize, previousCount);
  });
  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-size-${mergedSize.value}`,
    {
      [`${prefixCls}-simple`]: props.simple,
      [`${prefixCls}-disabled`]: props.disabled,
    },
  ]);
</script>
