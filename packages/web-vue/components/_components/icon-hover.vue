<template>
  <span
    :class="[
      prefixCls,
      {
        [`${prefix}-icon-hover`]: prefix,
        [`${prefixCls}-size-${size}`]: size !== 'medium',
        [`${prefixCls}-disabled`]: disabled,
      },
    ]"
    @click="!disabled && $emit('click', $event)"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';

  import type { Size } from '../_utils/constant';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'IconHover' });

  defineEmits<{ click: [_e: MouseEvent] }>();

  defineProps({
    prefix: {
      type: String,
    },
    size: {
      type: String as PropType<Size>,
      default: 'medium',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const prefixCls = getPrefixCls('icon-hover');
</script>
