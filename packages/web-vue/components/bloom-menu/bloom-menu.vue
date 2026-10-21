<template>
  <div :class="rootClasses">
    <Trigger
      :popup-visible="popupVisible"
      trigger="click"
      :floating-options="floatingOptions"
      :content-class="`${prefixCls}-popup`"
      :content-style="popupContentStyle"
      :duration="0"
      animation-name=""
      render-to-body
      esc-to-close
      aria-has-popup="dialog"
      @popup-visible-change="handlePopupVisibleChange"
    >
      <Button
        v-bind="buttonProps"
        ref="triggerButton"
        data-bloom-menu-trigger
        :class="`${prefixCls}-trigger`"
        @pointerdown="captureTriggerStyle"
      >
        <span :class="`${prefixCls}-trigger-content`">
          <slot name="trigger" :open="open">
            {{ triggerText }}
            <IconPlus />
          </slot>
        </span>
      </Button>

      <template #content>
        <Motion
          data-bloom-menu-panel
          :initial="panelInitial"
          :animate="panelTarget"
          :transition="morphTransition"
          :style="panelStyle"
          :class="`${prefixCls}-panel`"
          role="dialog"
          :aria-label="title"
        >
          <!-- ref 必须落在真实 DOM 上:Motion 是组件实例,模板 ref 拿不到元素 -->
          <div ref="panelRoot">
            <Motion
              :initial="{ opacity: 0 }"
              :animate="{ opacity: isOpen ? 1 : 0 }"
              :transition="contentTransition"
              :class="`${prefixCls}-content`"
            >
              <div :class="`${prefixCls}-header`">
                <slot name="header" :close="closeHeaderSlot">
                  <span :class="`${prefixCls}-title`">{{ title }}</span>
                  <Button
                    type="text"
                    shape="circle"
                    size="mini"
                    :class="`${prefixCls}-close`"
                    :aria-label="closeAriaLabel ?? t('a11y.bloomMenuClose')"
                    @click="close(true)"
                  >
                    <template #icon><IconClose /></template>
                  </Button>
                </slot>
              </div>

              <Motion
                v-if="items.length"
                :initial="gridInitial"
                :animate="{ clipPath: 'inset(0% 0% 0% 0%)' }"
                :transition="gridTransition"
                :class="`${prefixCls}-grid`"
              >
                <Button
                  v-for="(item, index) in items"
                  :key="item.value"
                  type="text"
                  long
                  :class="getItemClasses(item, index)"
                  :disabled="item.disabled"
                  @click="selectItem(item, index)"
                >
                  <Motion
                    :initial="getItemInitial()"
                    :animate="{ opacity: 1, scale: 1, filter: 'blur(0px)' }"
                    :transition="getItemTransition(index)"
                    :class="`${prefixCls}-item-content`"
                  >
                    <slot name="item" :item="item" :index="index">
                      <span v-if="item.icon || $slots.icon" :class="`${prefixCls}-item-icon`">
                        <slot name="icon" :item="item" :index="index">
                          <component :is="item.icon" v-if="item.icon" />
                        </slot>
                      </span>
                      <span :class="`${prefixCls}-item-label`">{{ item.label }}</span>
                    </slot>
                  </Motion>
                </Button>
              </Motion>

              <div v-else :class="`${prefixCls}-empty`">
                <slot name="empty">{{ t('a11y.bloomMenuEmpty') }}</slot>
              </div>
            </Motion>
          </div>
        </Motion>
      </template>
    </Trigger>
  </div>
</template>

<script lang="ts" setup>
  import type { Middleware } from '@floating-ui/vue';
  import type { TriggerStyleSnapshot } from '@sdata/web-core/bloom-menu/types';
  import type { Transition } from 'motion-v';
  import type { Merge, UnknownRecord } from 'type-fest';

  import type { CSSProperties, HTMLAttributes, VNode } from 'vue';
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    useSlots,
    useTemplateRef,
    watch,
  } from 'vue';

  import { shift } from '@floating-ui/vue';
  import {
    createBloomMenuFoundation,
    getBloomMenuInitialState,
  } from '@sdata/web-core/bloom-menu/foundation';
  import { Motion, useReducedMotion } from 'motion-v';

  import type { FloatingOptions } from '../_utils/floating';
  import type { ButtonInstance } from '../button';
  import type { BloomMenuItem, BloomMenuOffset } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconClose from '../icon/icon-close';
  import IconPlus from '../icon/icon-plus';
  import { useI18n } from '../locale';
  import Trigger from '../trigger';

  type BloomMenuButtonProps = Merge<HTMLAttributes, ButtonInstance['$props']> & UnknownRecord;

  defineOptions({ name: 'BloomMenu' });

  const {
    items,
    modelValue = undefined,
    defaultOpen = false,
    columns = 3,
    title = 'Create',
    triggerText = 'Create',
    buttonProps,
    offset,
  } = defineProps<{
    /**
     * @zh 菜单项
     * @en Menu items
     */
    items: readonly BloomMenuItem[];
    /**
     * @zh 是否展开
     * @en Whether the menu is open
     */
    modelValue?: boolean;
    /**
     * @zh 非受控模式下的初始展开状态
     * @en Initial open state in uncontrolled mode
     */
    defaultOpen?: boolean;
    /**
     * @zh 每行列数
     * @en Number of columns per row
     */
    columns?: number;
    /**
     * @zh 面板标题
     * @en Panel title
     */
    title?: string;
    /**
     * @zh 默认触发器文本
     * @en Default trigger text
     */
    triggerText?: string;
    /**
     * @zh 触发按钮属性
     * @en Trigger button props
     */
    buttonProps?: BloomMenuButtonProps;
    /**
     * @zh 浮层中心相对触发按钮中心的偏移
     * @en Popup center offset relative to the trigger center
     */
    offset?: BloomMenuOffset;
    /**
     * @zh 关闭按钮的无障碍标签,默认取国际化文案
     * @en Accessible label for the close button, defaults to the locale text
     */
    closeAriaLabel?: string;
  }>();

  const emit = defineEmits<{
    /**
     * @zh 展开状态变化
     * @en Open state update
     */
    'update:modelValue': [value: boolean];
    /**
     * @zh 菜单展开时触发
     * @en Emitted when the menu opens
     */
    'open': [];
    /**
     * @zh 菜单收起时触发
     * @en Emitted when the menu closes
     */
    'close': [];
    /**
     * @zh 选择菜单项时触发
     * @en Emitted when an item is selected
     */
    'select': [item: BloomMenuItem, index: number];
  }>();

  defineSlots<{
    /**
     * @zh 自定义触发器
     * @en Custom trigger
     */
    trigger(props: { open: () => void }): VNode[];
    /**
     * @zh 自定义头部
     * @en Custom header
     */
    header(props: { close: () => void }): VNode[];
    /**
     * @zh 自定义菜单项图标
     * @en Custom item icon
     */
    icon(props: { item: BloomMenuItem; index: number }): VNode[];
    /**
     * @zh 自定义完整菜单项内容
     * @en Custom complete item content
     */
    item(props: { item: BloomMenuItem; index: number }): VNode[];
    /**
     * @zh 空状态内容
     * @en Empty state content
     */
    empty(): VNode[];
  }>();

  const prefixCls = getPrefixCls('bloom-menu');
  const { t } = useI18n();
  const slots = useSlots();
  const triggerButtonRef = useTemplateRef<ButtonInstance>('triggerButton');
  const panelRootRef = useTemplateRef<HTMLDivElement>('panelRoot');
  const initialState = getBloomMenuInitialState(modelValue, defaultOpen);
  const internalOpen = shallowRef(initialState.internalOpen);
  // Keep the Trigger popup mounted until Motion finishes the closing morph.
  const popupVisible = shallowRef(initialState.popupVisible);
  const reducedMotion = useReducedMotion();
  const triggerStyle = shallowRef<TriggerStyleSnapshot>(initialState.triggerStyle);
  const foundation: ReturnType<typeof createBloomMenuFoundation<BloomMenuItem>> =
    createBloomMenuFoundation(
      {
        props: {
          get items() {
            return items;
          },
          get columns() {
            return columns;
          },
          get modelValue() {
            return modelValue;
          },
          get offset() {
            return offset;
          },
        },
        prefixCls,
        get buttonElement() {
          return triggerButtonRef.value?.$el as HTMLElement | undefined;
        },
        get panelElement() {
          return panelRootRef.value ?? undefined;
        },
        get hasCustomTrigger() {
          return Boolean(slots.trigger);
        },
        get reducedMotion() {
          return reducedMotion.value;
        },
        get normalizedColumns() {
          return normalizedColumns.value;
        },
        get rowCount() {
          return rowCount.value;
        },
        get isOpen() {
          return isOpen.value;
        },
        get panelCollapsed() {
          return panelCollapsed.value;
        },
        get panelAnimate() {
          return panelAnimate.value;
        },
        get internalOpen() {
          return internalOpen.value;
        },
        set internalOpen(value) {
          internalOpen.value = value;
        },
        get popupVisible() {
          return popupVisible.value;
        },
        set popupVisible(value) {
          popupVisible.value = value;
        },
        get triggerStyle() {
          return triggerStyle.value;
        },
        set triggerStyle(value) {
          triggerStyle.value = value;
        },
      },
      {
        afterRender: (task) => {
          void nextTick(task);
        },
        requestFrame: (task) => {
          requestAnimationFrame(task);
        },
        update: (value) => emit('update:modelValue', value),
        opened: () => emit('open'),
        closed: () => emit('close'),
        select: (item, index) => emit('select', item, index),
      },
    );
  const {
    captureTriggerStyle,
    handlePopupVisibleChange,
    open,
    close,
    closeHeaderSlot,
    selectItem,
    getItemInitial,
    getItemTransition,
  } = foundation;

  const normalizedColumns = computed(foundation.getNormalizedColumns);
  const rowCount = computed(foundation.getRowCount);
  const isOpen = computed(foundation.getIsOpen);
  const rootClasses = computed(() => [prefixCls, { [`${prefixCls}-open`]: isOpen.value }]);
  const centerMiddleware = computed<Middleware>(foundation.getCenterMiddleware);
  const floatingOptions = computed<FloatingOptions>(() => ({
    placement: 'top',
    // shift 在中心定位之后执行,把面板收回视口内(修复原版会溢出屏幕的缺陷);
    // crossAxis 覆盖水平方向,主轴覆盖垂直方向
    middleware: [centerMiddleware.value, shift({ crossAxis: true })],
  }));
  const popupContentStyle = computed<CSSProperties>(() => ({
    pointerEvents: isOpen.value ? undefined : 'none',
  }));
  const panelStyle = computed(
    () =>
      ({
        '--bloom-menu-columns': normalizedColumns.value,
        '--bloom-menu-source-width': `${triggerStyle.value.width}px`,
        '--bloom-menu-source-height': `${triggerStyle.value.height}px`,
        '--bloom-menu-source-background': triggerStyle.value.backgroundColor,
        '--bloom-menu-source-border-color': triggerStyle.value.borderColor,
        '--bloom-menu-source-border-radius': triggerStyle.value.borderRadius,
        '--bloom-menu-source-box-shadow': triggerStyle.value.boxShadow,
        '--bloom-menu-source-color': triggerStyle.value.color,
      }) as CSSProperties,
  );
  const panelCollapsed = computed(foundation.getPanelCollapsed);
  const panelInitial = computed(foundation.getPanelInitial);
  const panelAnimate = computed(foundation.getPanelAnimate);
  const panelTarget = computed(foundation.getPanelTarget);
  const morphTransition = computed<Transition>(foundation.getMorphTransition);
  const contentTransition = computed<Transition>(foundation.getContentTransition);
  const gridInitial = computed(foundation.getGridInitial);
  const gridTransition = computed<Transition>(foundation.getGridTransition);

  function getItemClasses(item: BloomMenuItem, index: number) {
    const layout = foundation.getItemLayout(item, index);

    return [
      `${prefixCls}-item`,
      {
        [`${prefixCls}-item-border-right`]: layout.borderRight,
        [`${prefixCls}-item-border-bottom`]: layout.borderBottom,
        [`${prefixCls}-item-disabled`]: layout.disabled,
      },
    ];
  }

  onMounted(captureTriggerStyle);
  watch(isOpen, foundation.syncOpen, {
    immediate: true,
  });
  onBeforeUnmount(foundation.dispose);
</script>
