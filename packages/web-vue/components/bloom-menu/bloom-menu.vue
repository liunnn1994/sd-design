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
                <slot name="header" :close="close">
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
  import type { Transition } from 'motion-v';

  import type { CSSProperties, VNode } from 'vue';
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    useTemplateRef,
    watch,
  } from 'vue';

  import { shift } from '@floating-ui/vue';
  import { Motion, useReducedMotion } from 'motion-v';

  import type { FloatingOptions } from '../_utils/floating';
  import type { ButtonInstance, ButtonProps } from '../button';
  import type { BloomMenuItem, BloomMenuOffset } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconClose from '../icon/icon-close';
  import IconPlus from '../icon/icon-plus';
  import { useI18n } from '../locale';
  import Trigger from '../trigger';

  interface TriggerStyleSnapshot {
    width: number;
    height: number;
    backgroundColor: string;
    borderColor: string;
    borderRadius: string;
    boxShadow: string;
    color: string;
  }

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
    /** @zh 菜单项 @en Menu items */
    items: readonly BloomMenuItem[];
    /** @zh 是否展开 @en Whether the menu is open */
    modelValue?: boolean;
    /** @zh 非受控模式下的初始展开状态 @en Initial open state in uncontrolled mode */
    defaultOpen?: boolean;
    /** @zh 每行列数 @en Number of columns per row */
    columns?: number;
    /** @zh 面板标题 @en Panel title */
    title?: string;
    /** @zh 默认触发器文本 @en Default trigger text */
    triggerText?: string;
    /** @zh 触发按钮属性 @en Trigger button props */
    buttonProps?: ButtonProps;
    /** @zh 浮层中心相对触发按钮中心的偏移 @en Popup center offset relative to the trigger center */
    offset?: BloomMenuOffset;
    /** @zh 关闭按钮的无障碍标签,默认取国际化文案 @en Accessible label for the close button, defaults to the locale text */
    closeAriaLabel?: string;
  }>();

  const emit = defineEmits<{
    /** @zh 展开状态变化 @en Open state update */
    'update:modelValue': [value: boolean];
    /** @zh 菜单展开时触发 @en Emitted when the menu opens */
    'open': [];
    /** @zh 菜单收起时触发 @en Emitted when the menu closes */
    'close': [];
    /** @zh 选择菜单项时触发 @en Emitted when an item is selected */
    'select': [item: BloomMenuItem, index: number];
  }>();

  defineSlots<{
    /** @zh 自定义触发器 @en Custom trigger */
    trigger(props: { open: () => void }): VNode[];
    /** @zh 自定义头部 @en Custom header */
    header(props: { close: (restoreFocus?: boolean) => void }): VNode[];
    /** @zh 自定义菜单项图标 @en Custom item icon */
    icon(props: { item: BloomMenuItem; index: number }): VNode[];
    /** @zh 自定义完整菜单项内容 @en Custom complete item content */
    item(props: { item: BloomMenuItem; index: number }): VNode[];
    /** @zh 空状态内容 @en Empty state content */
    empty(): VNode[];
  }>();

  const prefixCls = getPrefixCls('bloom-menu');
  const { t } = useI18n();
  const triggerButtonRef = useTemplateRef<ButtonInstance>('triggerButton');
  const panelRootRef = useTemplateRef<HTMLDivElement>('panelRoot');
  const internalOpen = shallowRef(defaultOpen);
  // Keep the Trigger popup mounted until Motion finishes the closing morph.
  const popupVisible = shallowRef(modelValue ?? defaultOpen);
  const reducedMotion = useReducedMotion();
  const triggerStyle = shallowRef<TriggerStyleSnapshot>({
    width: 144,
    height: 44,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: '16px',
    boxShadow: 'none',
    color: 'currentColor',
  });

  const normalizedColumns = computed(() => Math.max(1, Math.floor(columns)));
  const rowCount = computed(() => Math.max(1, Math.ceil(items.length / normalizedColumns.value)));
  const isOpen = computed(() => modelValue ?? internalOpen.value);
  const rootClasses = computed(() => [prefixCls, { [`${prefixCls}-open`]: isOpen.value }]);
  const centerMiddleware = computed<Middleware>(() => ({
    name: 'bloomMenuCenter',
    fn: ({ rects }) => ({
      x:
        rects.reference.x +
        (rects.reference.width - rects.floating.width) / 2 +
        (offset?.left ?? 0),
      y:
        rects.reference.y +
        (rects.reference.height - rects.floating.height) / 2 +
        (offset?.top ?? 0),
    }),
  }));
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
  const panelCollapsed = computed(() =>
    reducedMotion.value
      ? {}
      : {
          width: 'var(--bloom-menu-source-width)',
          height: 'var(--bloom-menu-source-height)',
          color: 'var(--bloom-menu-source-color)',
          backgroundColor: 'var(--bloom-menu-source-background)',
          borderColor: 'var(--bloom-menu-source-border-color)',
          borderRadius: 'var(--bloom-menu-source-border-radius)',
          boxShadow: 'var(--bloom-menu-source-box-shadow)',
        },
  );
  const panelInitial = computed(() => ({
    ...panelCollapsed.value,
    opacity: reducedMotion.value ? 0 : 0.98,
  }));
  const panelAnimate = computed(() => ({
    width: 'var(--bloom-menu-panel-width)',
    height: 'auto',
    color: 'var(--bloom-menu-panel-color)',
    backgroundColor: 'var(--bloom-menu-panel-background)',
    borderColor: 'var(--bloom-menu-panel-border-color)',
    borderRadius: 'var(--bloom-menu-panel-border-radius)',
    boxShadow: 'var(--bloom-menu-panel-shadow)',
    opacity: 1,
  }));
  const panelTarget = computed(() => (isOpen.value ? panelAnimate.value : panelCollapsed.value));
  const morphTransition = computed<Transition>(() =>
    reducedMotion.value
      ? { duration: 0.15 }
      : { type: 'spring', stiffness: 300, damping: 32, mass: 0.9 },
  );
  const contentTransition = computed<Transition>(() => ({
    delay: isOpen.value && !reducedMotion.value ? 0.12 : 0,
    duration: reducedMotion.value ? 0.15 : isOpen.value ? 0.2 : 0.12,
  }));
  const gridInitial = computed(() =>
    reducedMotion.value ? false : { clipPath: 'inset(45% 34% 45% 34%)' },
  );
  const gridTransition = computed<Transition>(() => ({
    delay: reducedMotion.value ? 0 : 0.08,
    duration: reducedMotion.value ? 0.15 : 0.45,
    ease: [0.16, 1, 0.3, 1],
  }));

  function getTriggerElement(event?: Event) {
    if (event?.currentTarget instanceof HTMLElement) return event.currentTarget;
    return triggerButtonRef.value?.$el as HTMLElement | undefined;
  }

  function captureTriggerStyle(event?: Event) {
    const element = getTriggerElement(event);
    if (!element || typeof window === 'undefined') return;

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    triggerStyle.value = {
      width: rect.width,
      height: rect.height,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      color: style.color,
    };
  }

  function setOpen(nextOpen: boolean) {
    if (nextOpen === isOpen.value) return;
    if (modelValue === undefined) internalOpen.value = nextOpen;
    emit('update:modelValue', nextOpen);
    if (nextOpen) emit('open');
    else emit('close');
  }

  function handlePopupVisibleChange(visible: boolean) {
    if (visible) {
      captureTriggerStyle();
      setOpen(true);
    } else {
      // popup 即将卸载,若焦点在面板内(Esc 关闭)则还给触发器,避免焦点丢失
      if (
        document.activeElement instanceof HTMLElement &&
        panelRootRef.value?.contains(document.activeElement)
      ) {
        focusTrigger();
      }
      setOpen(false);
    }
  }

  let closeTimer = 0;

  function schedulePopupHide() {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(
      () => {
        if (!isOpen.value) popupVisible.value = false;
      },
      reducedMotion.value ? 150 : 450,
    );
  }

  function open() {
    captureTriggerStyle();
    setOpen(true);
  }

  function focusTrigger() {
    (triggerButtonRef.value?.$el as HTMLElement | undefined)?.focus();
  }

  function close(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) nextTick(focusTrigger);
  }

  function focusPanel(attempt = 0) {
    nextTick(() => {
      const firstItem = panelRootRef.value?.querySelector<HTMLButtonElement>(
        `.${prefixCls}-item:not(:disabled)`,
      );
      const closeButton = panelRootRef.value?.querySelector<HTMLButtonElement>(
        `.${prefixCls}-close`,
      );
      const target = firstItem ?? closeButton;

      // defaultOpen 时 popup 挂在 ClientOnly 内尚未渲染;内容 Motion 从 opacity:0 淡入,
      // opacity 为 0 时 motion 会置 visibility:hidden,此时 focus() 会静默失败。
      // 两种情况都等就绪后再聚焦
      if (!target || getComputedStyle(target).visibility === 'hidden') {
        if (attempt < 30) requestAnimationFrame(() => focusPanel(attempt + 1));
        return;
      }
      target.focus();
    });
  }

  function selectItem(item: BloomMenuItem, index: number) {
    if (item.disabled) return;
    emit('select', item, index);
    close(true);
  }

  function getItemClasses(item: BloomMenuItem, index: number) {
    const column = index % normalizedColumns.value;
    const row = Math.floor(index / normalizedColumns.value);

    return [
      `${prefixCls}-item`,
      {
        [`${prefixCls}-item-border-right`]: column < normalizedColumns.value - 1,
        [`${prefixCls}-item-border-bottom`]: row < rowCount.value - 1,
        [`${prefixCls}-item-disabled`]: item.disabled,
      },
    ];
  }

  function getItemInitial() {
    return reducedMotion.value ? { opacity: 0 } : { opacity: 0, scale: 0.85, filter: 'blur(6px)' };
  }

  function getItemTransition(index: number): Transition {
    const column = index % normalizedColumns.value;
    const row = Math.floor(index / normalizedColumns.value);
    const distance = Math.hypot(
      column - (normalizedColumns.value - 1) / 2,
      row - (rowCount.value - 1) / 2,
    );

    return {
      delay: reducedMotion.value ? 0 : 0.1 + distance * 0.07,
      type: 'spring',
      stiffness: 440,
      damping: 34,
    };
  }

  onMounted(captureTriggerStyle);
  watch(
    isOpen,
    (openState) => {
      if (!openState) {
        schedulePopupHide();
        return;
      }
      window.clearTimeout(closeTimer);
      popupVisible.value = true;
      captureTriggerStyle();
      // 不依赖 Trigger 的 @show:animation-name 置空后其 Transition 的
      // after-enter 不会触发,@show 永远不发出
      focusPanel();
    },
    {
      immediate: true,
    },
  );
  onBeforeUnmount(() => window.clearTimeout(closeTimer));
</script>
