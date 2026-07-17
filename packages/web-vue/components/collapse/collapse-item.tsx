import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  ref,
  Transition,
  TransitionProps,
  watch,
} from 'vue';

import IconHover from '../_components/icon-hover.vue';
import { getPrefixCls } from '../_utils/global-config';
import { isNumber } from '../_utils/is';
import { isActivationKey } from '../_utils/keyboard';
import IconCaretLeft from '../icon/icon-caret-left';
import IconCaretRight from '../icon/icon-caret-right';
import { CollapseContext, collapseKey } from './context';

export default defineComponent({
  name: 'CollapseItem',
  components: { IconHover, IconCaretRight, IconCaretLeft },
  props: {
    /**
     * @zh 面板的标题
     * @en The title of the panel
     */
    header: String,
    /**
     * @zh 是否禁用
     * @en Whether to disable
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示展开图标
     * @en Whether to show the expand icon
     */
    showExpandIcon: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否在隐藏时销毁内容
     * @en Whether to destroy content when hidden
     * @version 2.27.0
     */
    destroyOnHide: {
      type: Boolean,
      default: false,
    },
  },
  /**
   * @zh 面板的标题
   * @en The title of the panel
   * @slot header
   */
  /**
   * @zh 展开图标
   * @en Expand icon
   * @slot expand-icon
   * @binding {boolean} active
   * @binding {boolean} disabled
   * @binding {'left' | 'right'} position
   * @version 2.33.0
   */
  /**
   * @zh 额外内容
   * @en Extra Content
   * @slot extra
   */
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const prefixCls = getPrefixCls('collapse-item');
    const collapseCtx = inject<Partial<CollapseContext>>(collapseKey, {});

    const key =
      instance && isNumber(instance?.vnode.key)
        ? instance.vnode.key
        : String(instance?.vnode.key ?? '');
    const isActive = computed(() => collapseCtx.activeKeys?.includes(key));
    const mergedDestroyOnHide = computed(() => collapseCtx.destroyOnHide || props.destroyOnHide);
    const mergedShowExpandIcon = computed(
      () => collapseCtx?.showExpandIcon ?? props.showExpandIcon,
    );
    const mounted = ref(mergedDestroyOnHide.value ? isActive.value : true);
    const expandIconPosition = computed(() => collapseCtx?.expandIconPosition ?? 'left');

    const handleClick = (e: MouseEvent) => {
      if (!props.disabled) {
        collapseCtx.handleClick?.(key, e);
      }
    };

    // a11y：触发器（role=button）的 id 与面板 region 的 id，做 aria-controls / aria-labelledby 双向连接
    const headerId = `${prefixCls}-${instance?.uid}-header`;
    const contentId = `${prefixCls}-${instance?.uid}-content`;
    const handleKeydown = (e: KeyboardEvent) => {
      if (props.disabled) return;
      // role=button 需支持 Enter / Space 激活（disclosure 模式）
      if (isActivationKey(e)) {
        e.preventDefault();
        collapseCtx.handleClick?.(key, e);
      }
    };

    watch(isActive, (isActive) => {
      if (isActive && !mounted.value) {
        mounted.value = true;
      }
    });

    const transitionEvents: TransitionProps = {
      onEnter: (el: Element) => {
        (el as HTMLDivElement).style.height = `${el.scrollHeight}px`;
      },
      onAfterEnter: (el: Element) => {
        (el as HTMLDivElement).style.height = 'auto';
      },
      onBeforeLeave: (el: Element) => {
        (el as HTMLDivElement).style.height = `${el.scrollHeight}px`;
      },
      onLeave: (el: Element) => {
        (el as HTMLDivElement).style.height = '0';
      },
      onAfterLeave: () => {
        if (mergedDestroyOnHide.value) {
          mounted.value = false;
        }
      },
    };

    const cls = computed(() => [
      prefixCls,
      {
        [`${prefixCls}-active`]: isActive.value,
      },
    ]);

    const headerCls = computed(() => [
      `${prefixCls}-header`,
      `${prefixCls}-header-${collapseCtx?.expandIconPosition}`,
      {
        [`${prefixCls}-header-disabled`]: props.disabled,
      },
    ]);

    const iconCls = computed(() => [
      {
        [`${prefixCls}-icon-right`]: collapseCtx?.expandIconPosition === 'right',
      },
    ]);

    const contentCls = computed(() => [
      `${prefixCls}-content`,
      {
        [`${prefixCls}-content-expend`]: isActive.value,
      },
    ]);

    const defaultExpandIcon = () =>
      expandIconPosition.value === 'right' ? (
        <icon-caret-left class={`${prefixCls}-expand-icon`} />
      ) : (
        <icon-caret-right class={`${prefixCls}-expand-icon`} />
      );

    const expandIconRender = () =>
      mergedShowExpandIcon.value && (
        <icon-hover prefix={prefixCls} class={iconCls.value} disabled={props.disabled}>
          {(slots['expand-icon'] ?? collapseCtx?.slots?.['expand-icon'])?.({
            active: isActive.value,
            disabled: props.disabled,
            position: expandIconPosition.value,
          }) ?? defaultExpandIcon()}
        </icon-hover>
      );

    return () => {
      return (
        <div class={cls.value}>
          <div
            role="button"
            aria-disabled={props.disabled}
            aria-expanded={isActive.value}
            aria-controls={contentId}
            tabindex={props.disabled ? -1 : 0}
            class={headerCls.value}
            onClick={handleClick}
            onKeydown={handleKeydown}
          >
            {expandIconRender()}
            <div id={headerId} class={`${prefixCls}-header-title`}>
              {slots.header?.() ?? props.header}
            </div>
            {slots.extra && <div class={`${prefixCls}-header-extra`}>{slots.extra?.()}</div>}
          </div>
          <Transition name="collapse-slider" {...transitionEvents}>
            <div
              v-show={isActive.value}
              role="region"
              id={contentId}
              aria-labelledby={headerId}
              class={contentCls.value}
            >
              {mounted.value && (
                <div ref="contentBoxRef" class={`${prefixCls}-content-box`}>
                  {slots.default?.()}
                </div>
              )}
            </div>
          </Transition>
        </div>
      );
    };
  },
});
