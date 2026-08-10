<template>
  <div
    :class="prefixCls"
    :style="{
      width: size ? `${size * 7}px` : undefined,
      height: size ? `${size}px` : undefined,
    }"
  >
    <div v-for="index in DOT_NUMBER" :key="index" :class="`${prefixCls}-item`" :style="itemStyle" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'DotLoading' });

  const { size } = defineProps<{
    size?: number;
  }>();

  const DOT_NUMBER = 5;
  const prefixCls = getPrefixCls('dot-loading');
  const itemStyle = computed(() =>
    size
      ? {
          width: `${size}px`,
          height: `${size}px`,
        }
      : {},
  );
</script>
