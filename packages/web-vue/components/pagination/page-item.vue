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

  import { createPagerFoundation } from '@sdata/web-core/pagination/items';

  import { getPrefixCls } from '../_utils/global-config';

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
  const foundation = createPagerFoundation(props, (page, event) => emit('click', page, event));
  const isActive = computed(foundation.getIsActive);
  const { handleClick, handleKeydown } = foundation;

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
