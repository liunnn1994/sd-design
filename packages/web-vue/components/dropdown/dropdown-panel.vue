<template>
  <div
    :class="[
      prefixCls,
      {
        [`${prefixCls}-has-header`]: Boolean($slots.header),
        [`${prefixCls}-has-footer`]: Boolean($slots.footer),
      },
    ]"
  >
    <div v-if="$slots.header" :class="`${prefixCls}-header`">
      <slot name="header" />
    </div>
    <div v-if="isEmpty" :class="`${prefixCls}-empty`">
      <slot name="empty">
        <empty />
      </slot>
    </div>
    <Scrollbar
      :class="`${prefixCls}-list-wrapper`"
      :style="style"
      disable-horizontal
      @scroll="handleScroll"
    >
      <ul
        ref="listRef"
        role="menu"
        tabindex="-1"
        :class="`${prefixCls}-list`"
        @keydown="handleKeydown"
      >
        <slot />
      </ul>
    </Scrollbar>
    <div v-if="$slots.footer && !isEmpty" :class="`${prefixCls}-footer`">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    CSSProperties,
    inject,
    nextTick,
    onBeforeUnmount,
    onMounted,
    PropType,
    ref,
  } from 'vue';

  import { createDropdownPanelFoundation } from '@sdata/web-core/dropdown/panel';

  import { getPrefixCls } from '../_utils/global-config';
  import { EmitType } from '../_utils/types';
  import Empty from '../empty';
  import Scrollbar from '../scrollbar';
  import { DropdownContext, dropdownInjectionKey } from './context';

  defineOptions({ name: 'DropdownPanel' });

  const props = defineProps({
    isEmpty: {
      type: Boolean,
      default: false,
    },
    bottomOffset: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 触发方式（仅用于判断打开时是否把焦点移入首个 menuitem：hover 触发不抢焦点）
     * @en Trigger method (only used to decide whether to move focus into the first menuitem on open: hover does not steal focus)
     */
    trigger: {
      type: [String, Array] as PropType<string | string[]>,
      default: 'click',
    },
    onScroll: {
      type: [Function, Array] as PropType<EmitType<(ev: Event) => void>>,
    },
    onReachBottom: {
      type: [Function, Array] as PropType<EmitType<(ev: Event) => void>>,
    },
  });

  const emit = defineEmits<{
    scroll: [_e: Event];
    reachBottom: [_e: Event];
  }>();

  const prefixCls = getPrefixCls('dropdown');
  const dropdownCtx = inject<Partial<DropdownContext>>(dropdownInjectionKey, {});
  const listRef = ref<HTMLElement>();

  const foundation = createDropdownPanelFoundation(
    {
      get list() {
        return listRef.value;
      },
      get bottomOffset() {
        return props.bottomOffset;
      },
      get trigger() {
        return props.trigger;
      },
      get isHoverTrigger(): boolean {
        return isHoverTrigger.value;
      },
      get popupMaxHeight() {
        return dropdownCtx.popupMaxHeight;
      },
    },
    {
      get activeElement() {
        return document.activeElement;
      },
      isElement: (value): value is HTMLElement => value instanceof HTMLElement,
      requestFrame: (callback) => requestAnimationFrame(callback),
      cancelFrame: (frame) => cancelAnimationFrame(frame),
    },
    (event) => emit('scroll', event),
    (event) => emit('reachBottom', event),
  );
  const { handleScroll, handleKeydown } = foundation;
  const isHoverTrigger = computed(foundation.getIsHoverTrigger);
  onBeforeUnmount(foundation.destroy);
  onMounted(() => foundation.focusOnMount(nextTick));
  const style = computed<CSSProperties | undefined>(foundation.getStyle);
</script>
