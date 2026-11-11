<template>
  <svg :class="cls" :style="innerStyle" fill="currentColor">
    <slot />
  </svg>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { getIconStyle } from '@sdata/web-core/icon/foundation';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'Icon' });

  const props = defineProps({
    type: String,
    size: [Number, String],
    rotate: Number,
    spin: Boolean,
  });

  const prefixCls = getPrefixCls('icon');

  const innerStyle = computed(() => getIconStyle(props));

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-loading`]: props.spin,
    },
    props.type,
  ]);
</script>
