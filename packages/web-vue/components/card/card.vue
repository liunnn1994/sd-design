<template>
  <DefineActions v-slot="{ actions }">
    <div :class="`${prefixCls}-actions`">
      <div :class="`${prefixCls}-actions-right`">
        <span
          v-for="(action, index) in getAllElements(actions)"
          :key="`action-${index}`"
          :class="`${prefixCls}-actions-item`"
        >
          <RenderVNode :content="action" />
        </span>
      </div>
    </div>
  </DefineActions>

  <div v-bind="$attrs" :class="cls">
    <div
      v-if="hasTitle || hasExtra"
      :class="[
        `${prefixCls}-header`,
        {
          [`${prefixCls}-header-no-title`]: !hasTitle,
        },
      ]"
      :style="headerStyle"
    >
      <div v-if="hasTitle" :class="`${prefixCls}-header-title`">
        <slot v-if="$slots.title" name="title" />
        <template v-else>{{ title }}</template>
      </div>
      <div v-if="hasExtra" :class="`${prefixCls}-header-extra`">
        <slot v-if="$slots.extra" name="extra" />
        <template v-else>{{ extra }}</template>
      </div>
    </div>
    <div v-if="$slots.cover" :class="`${prefixCls}-cover`">
      <slot name="cover" />
    </div>
    <div :class="bodyCls" :style="bodyStyle">
      <Spin v-if="loading" v-bind="mergedSpinProps" />
      <Scrollbar
        v-else-if="scrollEnabled"
        v-bind="scrollbarProps"
        :outer-class="`${prefixCls}-body-scrollbar`"
      >
        <slot />
      </Scrollbar>
      <slot v-else />
      <ReuseActions v-if="$slots.actions && !cardContext.hasMeta" :actions="$slots.actions()" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CSSProperties, PropType, VNode } from 'vue';
  import { computed, defineComponent, h, inject, provide, reactive, toRef } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { ScrollbarProps } from '../scrollbar';
  import type { SpinProps } from '../spin';
  import type { CardContext } from './context';

  import { useScrollbar } from '../_hooks/use-scrollbar';
  import { useSize } from '../_hooks/use-size';
  import { getPrefixCls } from '../_utils/global-config';
  import { getAllElements } from '../_utils/vue-utils';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Scrollbar from '../scrollbar';
  import Spin from '../spin';
  import { cardInjectionKey } from './context';

  defineOptions({ name: 'Card', inheritAttrs: false });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 是否有边框
       * @en Whether to render the border
       */
      bordered?: boolean;
      /**
       * @zh 是否为加载中
       * @en Loading status
       */
      loading?: boolean;
      /**
       * @zh 传递给加载中 Spin 的属性
       * @en Props passed to the loading Spin
       */
      spinProps?: SpinProps;
      /**
       * @zh 是否可悬浮
       * @en Can be hovered
       */
      hoverable?: boolean;
      /**
       * @zh 卡片尺寸
       * @en Size of card
       * @values 'medium', 'small'
       * @defaultValue 'medium'
       */
      size?: 'medium' | 'small';
      /**
       * @zh 自定义标题区域样式
       * @en The additional css style to apply to card head
       */
      headerStyle?: CSSProperties;
      /**
       * @zh 内容区域自定义样式
       * @en The additional css style to apply to card content
       */
      bodyStyle?: CSSProperties;
      /**
       * @zh 卡片标题
       * @en Title of card
       */
      title?: string;
      /**
       * @zh 卡片右上角的操作区域
       * @en Content to render in the top-right corner of the card
       */
      extra?: string;
      /**
       * @zh 是否高度撑满父容器（内容区域自动滚动，仅在父容器有确定高度时生效）
       * @en Whether to fill the height of the parent container (the content area scrolls automatically, only effective when the parent container has a determinate height)
       */
      fullHeight?: boolean;
      /**
       * @zh 内容区域是否使用 Scrollbar 组件滚动，可传入对象自定义滚动条配置。为 false 时使用原生 overflow 滚动。仅 `full-height` 为 true 时生效
       * @en Whether the content area uses the Scrollbar component for scrolling, an object can be passed to customize the scrollbar. When false, native overflow scrolling is used. Only effective when `full-height` is true
       * @defaultValue true
       */
      scrollbar?: boolean | ScrollbarProps;
    }>(),
    {
      bordered: true,
      loading: false,
      hoverable: false,
      headerStyle: () => ({}),
      bodyStyle: () => ({}),
      fullHeight: false,
      scrollbar: true,
    },
  );

  const slots = defineSlots<{
    default?: () => VNode[];
    /** @zh 卡片标题 @en Title of card */
    title?: () => VNode[];
    /** @zh 卡片右上角的操作区域 @en Content to render in the top-right corner of the card */
    extra?: () => VNode[];
    /** @zh 卡片封面 @en Cover of card */
    cover?: () => VNode[];
    /** @zh 卡片底部的操作组 @en The action list which shows at the bottom of the Card */
    actions?: () => VNode[];
  }>();

  const [DefineActions, ReuseActions] = createReusableTemplate<{ actions: VNode[] }>();
  const RenderVNode = defineComponent({
    name: 'CardRenderVNode',
    props: {
      content: {
        type: null as unknown as PropType<VNode>,
        required: true,
      },
    },
    setup(renderProps) {
      return () => renderProps.content;
    },
  });
  const configCtx = inject(configProviderInjectionKey, undefined);
  const mergedSpinProps = computed(() => ({
    ...configCtx?.cardSpinProps,
    ...props.spinProps,
  }));
  const prefixCls = getPrefixCls('card');
  const { mergedSize: resolvedSize } = useSize(toRef(props, 'size'));
  const mergedSize = computed(() =>
    resolvedSize.value === 'small' || resolvedSize.value === 'mini' ? 'small' : 'medium',
  );
  const { scrollbarProps } = useScrollbar(toRef(props, 'scrollbar'));
  const scrollEnabled = computed(() => props.fullHeight && props.scrollbar !== false);
  const renderActions = (actions: VNode[]) => h(ReuseActions, { actions });
  const cardContext: CardContext = reactive({
    hasMeta: false,
    hasGrid: false,
    slots,
    renderActions,
  });

  provide(cardInjectionKey, cardContext);

  const hasTitle = computed(() => Boolean(slots.title ?? props.title));
  const hasExtra = computed(() => Boolean(slots.extra ?? props.extra));
  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-size-${mergedSize.value}`,
    {
      [`${prefixCls}-loading`]: props.loading,
      [`${prefixCls}-bordered`]: props.bordered,
      [`${prefixCls}-hoverable`]: props.hoverable,
      [`${prefixCls}-contain-grid`]: cardContext.hasGrid,
      [`${prefixCls}-full-height`]: props.fullHeight,
    },
  ]);
  const bodyCls = computed(() => [
    `${prefixCls}-body`,
    {
      [`${prefixCls}-body-scroll`]: scrollEnabled.value,
      [`${prefixCls}-body-native`]: props.fullHeight && props.scrollbar === false,
    },
  ]);
</script>
