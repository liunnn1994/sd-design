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

  import { createReusableTemplate } from '@vueuse/core';

  import type { PageItemType, PaginationSelectProps } from './interface';

  import { useConfigProviderProp } from '../_hooks/use-config-provider-prop';
  import { useSize } from '../_hooks/use-size';
  import { Size } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber } from '../_utils/is';
  import { useI18n } from '../locale';
  import EllipsisPager from './page-item-ellipsis.vue';
  import StepPager from './page-item-step.vue';
  import Pager from './page-item.vue';
  import PageJumper from './page-jumper.vue';
  import PageOptions from './page-options.vue';

  interface PageDescriptor {
    key: string | number;
    type: PageItemType;
    pageNumber?: number;
    step?: number;
  }

  defineOptions({ name: 'Pagination', inheritAttrs: false });

  const props = defineProps({
    total: {
      type: Number,
      required: true,
    },
    current: Number,
    defaultCurrent: {
      type: Number,
      default: 1,
    },
    pageSize: Number,
    defaultPageSize: {
      type: Number,
      default: 10,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hideOnSinglePage: {
      type: Boolean,
      default: false,
    },
    simple: {
      type: Boolean,
      default: false,
    },
    showTotal: {
      type: Boolean,
      default: false,
    },
    showMore: {
      type: Boolean,
      default: false,
    },
    showJumper: {
      type: Boolean,
      default: false,
    },
    showPageSize: {
      type: Boolean,
      default: false,
    },
    pageSizeOptions: {
      type: Array as PropType<number[]>,
      default: () => [10, 20, 30, 40, 50],
    },
    pageSizeProps: Object as PropType<PaginationSelectProps>,
    size: String as PropType<Size>,
    pageItemStyle: Object as PropType<CSSProperties>,
    activePageItemStyle: Object as PropType<CSSProperties>,
    baseSize: {
      type: Number,
      default: 6,
    },
    bufferSize: {
      type: Number,
      default: 2,
    },
    autoAdjust: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits({
    'update:current': (_current: number) => true,
    'update:pageSize': (_pageSize: number) => true,
    'change': (_current: number) => true,
    'pageSizeChange': (_pageSize: number) => true,
  });

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

  const handleClick = (page: number) => {
    if (page !== computedCurrent.value && isNumber(page) && !props.disabled) {
      innerCurrent.value = page;
      emit('update:current', page);
      emit('change', page);
    }
  };
  const handlePageSizeChange = (pageSize: number) => {
    innerPageSize.value = pageSize;
    emit('update:pageSize', pageSize);
    emit('pageSizeChange', pageSize);
  };

  const pageList = computed<PageDescriptor[]>(() => {
    const items: PageDescriptor[] = [];
    const baseSize = resolvedBaseSize.value;
    const bufferSize = resolvedBufferSize.value;
    if (pages.value < baseSize + bufferSize * 2) {
      for (let page = 1; page <= pages.value; page++)
        items.push({ key: page, type: 'page', pageNumber: page });
      return items;
    }
    let left = 1;
    let right = pages.value;
    let hasLeftEllipsis = false;
    let hasRightEllipsis = false;
    if (computedCurrent.value > 2 + bufferSize) {
      hasLeftEllipsis = true;
      left = Math.min(computedCurrent.value - bufferSize, pages.value - 2 * bufferSize);
    }
    if (computedCurrent.value < pages.value - (bufferSize + 1)) {
      hasRightEllipsis = true;
      right = Math.max(computedCurrent.value + bufferSize, 2 * bufferSize + 1);
    }
    if (hasLeftEllipsis) {
      items.push({ key: 1, type: 'page', pageNumber: 1 });
      items.push({ key: 'left-ellipsis-pager', type: 'more', step: -(bufferSize * 2 + 1) });
    }
    for (let page = left; page <= right; page++)
      items.push({ key: page, type: 'page', pageNumber: page });
    if (hasRightEllipsis) {
      items.push({ key: 'right-ellipsis-pager', type: 'more', step: bufferSize * 2 + 1 });
      items.push({ key: pages.value, type: 'page', pageNumber: pages.value });
    }
    return items;
  });

  watch(computedPageSize, (currentPageSize, previousPageSize) => {
    if (
      mergedAutoAdjust.value &&
      currentPageSize !== previousPageSize &&
      computedCurrent.value > 1
    ) {
      const index = previousPageSize * (computedCurrent.value - 1) + 1;
      const newPage = Math.ceil(index / currentPageSize);
      if (newPage !== computedCurrent.value) {
        innerCurrent.value = newPage;
        emit('update:current', newPage);
        emit('change', newPage);
      }
    }
  });
  watch(pages, (currentPages, previousPages) => {
    if (
      mergedAutoAdjust.value &&
      currentPages !== previousPages &&
      computedCurrent.value > 1 &&
      computedCurrent.value > currentPages
    ) {
      const newCurrent = Math.max(currentPages, 1);
      innerCurrent.value = newCurrent;
      emit('update:current', newCurrent);
      emit('change', newCurrent);
    }
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
