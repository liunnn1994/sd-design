<template>
  <li
    :class="cls"
    :style="mergedStyle"
    :tabindex="disabled ? -1 : 0"
    :aria-current="isActive ? 'page' : undefined"
    :aria-disabled="disabled || undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot :page="pageNumber">
      {{ pageNumber }}
    </slot>
  </li>
</template>

<script setup lang="ts">
  import type { PropType, CSSProperties } from 'vue';
  import { computed } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { isActivationKey } from '../_utils/keyboard';

  defineOptions({ name: 'Pager' });

  const props = defineProps({
    pageNumber: {
      type: Number,
    },
    current: {
      type: Number,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    style: {
      type: Object as PropType<CSSProperties>,
    },
    activeStyle: {
      type: Object as PropType<CSSProperties>,
    },
  });

  const emit = defineEmits<{ click: [_pageNumber: number, _e: Event] }>();

  const prefixCls = getPrefixCls('pagination-item');
  const isActive = computed(() => props.current === props.pageNumber);

  const activate = (e: Event) => {
    if (!props.disabled) {
      emit('click', props.pageNumber!, e);
    }
  };
  const handleClick = (e: MouseEvent) => activate(e);
  const handleKeydown = (e: KeyboardEvent) => {
    if (props.disabled) return;
    // li 默认不可键盘操作：补 Enter / Space 激活
    if (isActivationKey(e)) {
      e.preventDefault();
      activate(e);
    }
  };

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-active`]: isActive.value,
    },
  ]);

  const mergedStyle = computed(() => {
    return isActive.value ? props.activeStyle : props.style;
  });
</script>
