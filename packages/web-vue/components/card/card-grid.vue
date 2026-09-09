<template>
  <div :class="cls">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, onMounted, onBeforeUnmount } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { CardContext, cardInjectionKey } from './context';

  defineOptions({ name: 'CardGrid' });

  const props = defineProps({
    /**
     * @zh 是否可以悬浮
     * @en Whether to hover
     */
    hoverable: {
      type: Boolean,
      default: false,
    },
  });

  const prefixCls = getPrefixCls('card-grid');

  const context = inject<CardContext>(cardInjectionKey);

  onMounted(() => {
    if (context) {
      context.gridCount++;
    }
  });
  onBeforeUnmount(() => {
    if (context) context.gridCount--;
  });

  const cls = computed(() => {
    return [
      prefixCls,
      {
        [`${prefixCls}-hoverable`]: props.hoverable,
      },
    ];
  });
</script>
