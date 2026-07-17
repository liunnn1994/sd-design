<template>
  <div :class="cls">
    <div v-if="isEmpty" :class="`${prefixCls}-empty`">
      <slot name="empty">
        <empty />
      </slot>
    </div>
    <Scrollbar
      ref="wrapperRef"
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
    onMounted,
    PropType,
    ref,
    useSlots,
  } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber } from '../_utils/is';
  import { KEYBOARD_KEY } from '../_utils/keyboard';
  import { EmitType } from '../_utils/types';
  import Empty from '../empty';
  import Scrollbar from '../scrollbar';
  import { DropdownContext, dropdownInjectionKey } from './context';

  defineOptions({ name: 'DropdownPanel' });

  const props = defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
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

  const slots = useSlots();

  const prefixCls = getPrefixCls('dropdown');
  const dropdownCtx = inject<Partial<DropdownContext>>(dropdownInjectionKey, {});
  const wrapperRef = ref<HTMLElement>();
  const listRef = ref<HTMLElement>();

  const handleScroll = (e: Event) => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target as HTMLElement;
    const bottom = scrollHeight - (scrollTop + offsetHeight);
    if (bottom <= props.bottomOffset) {
      emit('reachBottom', e);
    }
    emit('scroll', e);
  };

  // 菜单键盘导航：方向键 / Home / End 在 menuitem 间移动，Enter/Space 激活
  const getMenuitems = (): HTMLElement[] => {
    if (!listRef.value) return [];
    return Array.from(listRef.value.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
      (el) => el.getAttribute('aria-disabled') !== 'true',
    );
  };

  const focusMenuitem = (dir: 'next' | 'prev' | 'first' | 'last') => {
    const items = getMenuitems();
    if (items.length === 0) return;
    const current = items.findIndex((el) => el === document.activeElement);
    let target = 0;
    if (dir === 'first') target = 0;
    else if (dir === 'last') target = items.length - 1;
    else if (dir === 'next') target = current < 0 ? 0 : (current + 1) % items.length;
    else target = current <= 0 ? items.length - 1 : current - 1;
    items[target]?.focus();
  };

  const handleKeydown = (ev: KeyboardEvent) => {
    switch (ev.key) {
      case KEYBOARD_KEY.ARROW_DOWN:
        ev.preventDefault();
        focusMenuitem('next');
        break;
      case KEYBOARD_KEY.ARROW_UP:
        ev.preventDefault();
        focusMenuitem('prev');
        break;
      case KEYBOARD_KEY.HOME:
        ev.preventDefault();
        focusMenuitem('first');
        break;
      case KEYBOARD_KEY.END:
        ev.preventDefault();
        focusMenuitem('last');
        break;
      case KEYBOARD_KEY.ENTER:
      case KEYBOARD_KEY.SPACE:
        ev.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.click();
        }
        break;
    }
  };

  // hover 触发时不自动聚焦首项（避免抢焦点）；其余触发（click/contextMenu/键盘）按 menu 模式聚焦首项
  const isHoverTrigger = computed(() => {
    const trigger = props.trigger;
    return Array.isArray(trigger) ? trigger.includes('hover') : trigger === 'hover';
  });

  onMounted(() => {
    // 面板随弹出层挂载即打开：把焦点放进首个可操作项，键盘用户立即可用。
    // 但 hover 触发属于被动展开（鼠标移入），不应抢走键盘焦点/触发滚动，故跳过。
    if (isHoverTrigger.value) return;
    nextTick(() => {
      const items = getMenuitems();
      if (items.length > 0) {
        items[0].focus();
      } else {
        listRef.value?.focus();
      }
    });
  });

  const style = computed<CSSProperties | undefined>(() => {
    if (isNumber(dropdownCtx.popupMaxHeight)) {
      return {
        maxHeight: `${dropdownCtx.popupMaxHeight}px`,
      };
    }
    if (!dropdownCtx.popupMaxHeight) {
      return {
        maxHeight: 'none',
        overflowY: 'hidden',
      };
    }
    return undefined;
  });

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-has-footer`]: Boolean(slots.footer),
    },
  ]);
</script>
