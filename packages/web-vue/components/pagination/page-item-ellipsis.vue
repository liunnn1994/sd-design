<template>
  <li
    :class="cls"
    tabindex="0"
    aria-label="More pages"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot>
      <icon-more />
    </slot>
  </li>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { isActivationKey } from '../_utils/keyboard';
  import IconMore from '../icon/icon-more';
  import { getLegalPage } from './utils';

  defineOptions({ name: 'EllipsisPager' });

  const props = defineProps({
    current: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      default: 5,
    },
    pages: {
      type: Number,
      required: true,
    },
  });

  const emit = defineEmits<{ click: [_nextPage: number] }>();

  const prefixCls = getPrefixCls('pagination-item');

  const nextPage = computed(() =>
    getLegalPage(props.current + props.step, {
      min: 1,
      max: props.pages,
    }),
  );

  const handleClick = (e: MouseEvent) => {
    emit('click', nextPage.value);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (isActivationKey(e)) {
      e.preventDefault();
      emit('click', nextPage.value);
    }
  };

  const cls = computed(() => [prefixCls, `${prefixCls}-ellipsis`]);
</script>
