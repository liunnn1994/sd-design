<template>
  <div :class="cls">
    <div
      role="button"
      :aria-disabled="disabled"
      :aria-expanded="isActive"
      :aria-controls="contentId"
      :tabindex="disabled ? -1 : 0"
      :class="headerCls"
      @click="handleClick"
      @keydown="handleKeydown"
    >
      <IconHover
        v-if="mergedShowExpandIcon"
        :prefix="prefixCls"
        :class="iconCls"
        :disabled="disabled"
      >
        <slot
          v-if="$slots['expand-icon']"
          name="expand-icon"
          :active="isActive"
          :disabled="disabled"
          :position="expandIconPosition"
        />
        <RenderContextExpandIcon v-else-if="collapseCtx.slots?.['expand-icon']" />
        <IconCaretLeft
          v-else-if="expandIconPosition === 'right'"
          :class="`${prefixCls}-expand-icon`"
        />
        <IconCaretRight v-else :class="`${prefixCls}-expand-icon`" />
      </IconHover>
      <div :id="headerId" :class="`${prefixCls}-header-title`">
        <slot name="header">{{ header }}</slot>
      </div>
      <div v-if="$slots.extra" :class="`${prefixCls}-header-extra`">
        <slot name="extra" />
      </div>
    </div>
    <Transition name="collapse-slider" v-bind="transitionEvents">
      <div
        v-show="isActive"
        :id="contentId"
        role="region"
        :aria-labelledby="headerId"
        :class="contentCls"
      >
        <div v-if="mounted" :class="`${prefixCls}-content-box`">
          <div :class="`${prefixCls}-content-body`"><slot /></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import type { TransitionProps, VNode } from 'vue';
  import { computed, getCurrentInstance, inject, ref, watch } from 'vue';

  import {
    createCollapseItemFoundation,
    normalizeCollapseKey,
  } from '@sdata/web-core/collapse/foundation';

  import type { CollapseContext } from './context';

  import IconHover from '../_components/icon-hover.vue';
  import { getPrefixCls } from '../_utils/global-config';
  import IconCaretLeft from '../icon/icon-caret-left';
  import IconCaretRight from '../icon/icon-caret-right';
  import { collapseKey } from './context';

  defineOptions({ name: 'CollapseItem' });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 面板的标题
       * @en The title of the panel
       */
      header?: string;
      /**
       * @zh 是否禁用
       * @en Whether to disable
       */
      disabled?: boolean;
      /**
       * @zh 是否显示展开图标
       * @en Whether to show the expand icon
       */
      showExpandIcon?: boolean;
      /**
       * @zh 是否在隐藏时销毁内容
       * @en Whether to destroy content when hidden
       * @version 2.27.0
       */
      destroyOnHide?: boolean;
    }>(),
    {
      disabled: false,
      showExpandIcon: true,
      destroyOnHide: false,
    },
  );
  defineSlots<{
    'default'?: () => VNode[];
    /**
     * @zh 面板的标题
     * @en The title of the panel
     */
    'header'?: () => VNode[];
    /**
     * @zh 展开图标
     * @en Expand icon
     * @version 2.33.0
     */
    'expand-icon'?: (props: {
      active: boolean | undefined;
      disabled: boolean;
      position: 'left' | 'right';
    }) => VNode[];
    /**
     * @zh 额外内容
     * @en Extra Content
     */
    'extra'?: () => VNode[];
  }>();
  const instance = getCurrentInstance();
  const prefixCls = getPrefixCls('collapse-item');
  const collapseCtx = inject<Partial<CollapseContext>>(collapseKey, {});
  const key = normalizeCollapseKey(instance?.vnode.key);
  const isActive = computed(() => collapseCtx.activeKeys?.includes(key));
  const mergedDestroyOnHide = computed(() => collapseCtx.destroyOnHide || props.destroyOnHide);
  const mergedShowExpandIcon = computed(() => collapseCtx.showExpandIcon ?? props.showExpandIcon);
  const mounted = ref(mergedDestroyOnHide.value ? isActive.value : true);
  const expandIconPosition = computed<'left' | 'right'>(
    () => (collapseCtx.expandIconPosition as 'left' | 'right' | undefined) ?? 'left',
  );
  const headerId = `${prefixCls}-${instance?.uid}-header`;
  const contentId = `${prefixCls}-${instance?.uid}-content`;
  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-active`]: isActive.value,
      [`${prefixCls}-no-icon`]: !mergedShowExpandIcon.value,
    },
  ]);
  const headerCls = computed(() => [
    `${prefixCls}-header`,
    `${prefixCls}-header-${collapseCtx.expandIconPosition}`,
    {
      [`${prefixCls}-header-disabled`]: props.disabled,
    },
  ]);
  const iconCls = computed(() => [
    {
      [`${prefixCls}-icon-right`]: collapseCtx.expandIconPosition === 'right',
    },
  ]);
  const contentCls = computed(() => [
    `${prefixCls}-content`,
    {
      [`${prefixCls}-content-expend`]: isActive.value,
    },
  ]);
  const RenderContextExpandIcon = () =>
    collapseCtx.slots?.['expand-icon']?.({
      active: isActive.value,
      disabled: props.disabled,
      position: expandIconPosition.value,
    });
  const foundation = createCollapseItemFoundation({
    get disabled() {
      return props.disabled;
    },
    get active() {
      return isActive.value;
    },
    get destroy() {
      return mergedDestroyOnHide.value;
    },
    get mounted() {
      return mounted.value;
    },
    setMounted(value) {
      mounted.value = value;
    },
    onClick(event) {
      collapseCtx.handleClick?.(key, event);
    },
    isInteractiveTarget(event) {
      return Boolean(
        (event.target as HTMLElement | null)?.closest(
          'input, textarea, select, button, a[href], [contenteditable="true"]',
        ),
      );
    },
  });
  const handleClick = foundation.click;
  const handleKeydown = foundation.keydown;
  const transitionEvents: TransitionProps = {
    onBeforeLeave: foundation.beforeLeave,
    onAfterLeave: foundation.afterLeave,
    onLeaveCancelled: foundation.leaveCancelled,
  };
  watch(mergedDestroyOnHide, foundation.syncDestroy, { flush: 'post' });
  watch(isActive, foundation.syncActive);
</script>
