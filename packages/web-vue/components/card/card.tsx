import {
  defineComponent,
  PropType,
  computed,
  reactive,
  provide,
  toRef,
  VNode,
  toRefs,
  CSSProperties,
} from 'vue';

import { useScrollbar } from '../_hooks/use-scrollbar';
import { useSize } from '../_hooks/use-size';
import { getPrefixCls } from '../_utils/global-config';
import { getAllElements } from '../_utils/vue-utils';
import Scrollbar, { type ScrollbarProps } from '../scrollbar';
import Spin from '../spin';
import { cardInjectionKey } from './context';

export default defineComponent({
  name: 'Card',
  components: {
    Spin,
    Scrollbar,
  },
  props: {
    /**
     * @zh 是否有边框
     * @en Whether to render the border
     */
    bordered: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否为加载中
     * @en Loading status
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否可悬浮
     * @en Can be hovered
     */
    hoverable: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 卡片尺寸
     * @en Size of card
     * @values 'medium', 'small'
     * @defaultValue 'medium'
     */
    size: {
      type: String as PropType<'medium' | 'small'>,
    },
    /**
     * @zh 自定义标题区域样式
     * @en The additional css style to apply to card head
     */
    headerStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    /**
     * @zh 内容区域自定义样式
     * @en The additional css style to apply to card content
     */
    bodyStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    /**
     * @zh 卡片标题
     * @en Title of card
     */
    title: {
      type: String,
    },
    /**
     * @zh 卡片右上角的操作区域
     * @en Content to render in the top-right corner of the card
     */
    extra: {
      type: String,
    },
    /**
     * @zh 是否高度撑满父容器（内容区域自动滚动，仅在父容器有确定高度时生效）
     * @en Whether to fill the height of the parent container (the content area scrolls automatically, only effective when the parent container has a determinate height)
     */
    fullHeight: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 内容区域是否使用 Scrollbar 组件滚动，可传入对象自定义滚动条配置。为 false 时使用原生 overflow 滚动。仅 `full-height` 为 true 时生效
     * @en Whether the content area uses the Scrollbar component for scrolling, an object can be passed to customize the scrollbar. When false, native overflow scrolling is used. Only effective when `full-height` is true
     * @defaultValue true
     */
    scrollbar: {
      type: [Boolean, Object] as PropType<boolean | ScrollbarProps>,
      default: true,
    },
  },
  /**
   * @zh 卡片标题
   * @en Title of card
   * @slot title
   */
  /**
   * @zh 卡片右上角的操作区域
   * @en Content to render in the top-right corner of the card
   * @slot extra
   */
  /**
   * @zh 卡片封面
   * @en Cover of card
   * @slot cover
   */
  /**
   * @zh 卡片底部的操作组
   * @en The action list which shows at the bottom of the Card
   * @slot actions
   */
  setup(props, { slots }) {
    const prefixCls = getPrefixCls('card');
    const { size } = toRefs(props);
    const { mergedSize: _mergedSize } = useSize(size);
    const mergedSize = computed(() => {
      if (_mergedSize.value === 'small' || _mergedSize.value === 'mini') {
        return 'small';
      }
      return 'medium';
    });

    const { scrollbarProps } = useScrollbar(toRef(props, 'scrollbar'));
    const scrollEnabled = computed(() => props.fullHeight && props.scrollbar !== false);

    const renderActions = (vns: VNode[]) => {
      const actions = getAllElements(vns);

      return (
        <div class={`${prefixCls}-actions`}>
          <div class={`${prefixCls}-actions-right`}>
            {actions.map((action, index) => (
              <span key={`action-${index}`} class={`${prefixCls}-actions-item`}>
                {action}
              </span>
            ))}
          </div>
        </div>
      );
    };

    const cardContext = reactive({
      hasMeta: false,
      hasGrid: false,
      slots,
      renderActions,
    });
    provide(cardInjectionKey, cardContext);

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

    return () => {
      const hasTitle = Boolean(slots.title ?? props.title);
      const hasExtra = Boolean(slots.extra ?? props.extra);

      return (
        <div class={cls.value}>
          {(hasTitle || hasExtra) && (
            <div
              class={[`${prefixCls}-header`, { [`${prefixCls}-header-no-title`]: !hasTitle }]}
              style={props.headerStyle}
            >
              {hasTitle && (
                <div class={`${prefixCls}-header-title`}>{slots.title?.() ?? props.title}</div>
              )}
              {hasExtra && (
                <div class={`${prefixCls}-header-extra`}>{slots.extra?.() ?? props.extra}</div>
              )}
            </div>
          )}
          {slots.cover && <div class={`${prefixCls}-cover`}>{slots.cover()}</div>}
          <div class={bodyCls.value} style={props.bodyStyle}>
            {props.loading ? (
              <Spin />
            ) : scrollEnabled.value ? (
              <Scrollbar {...scrollbarProps.value} outerClass={`${prefixCls}-body-scrollbar`}>
                {slots.default?.()}
              </Scrollbar>
            ) : (
              slots.default?.()
            )}
            {slots.actions && !cardContext.hasMeta && renderActions(slots.actions())}
          </div>
        </div>
      );
    };
  },
});
