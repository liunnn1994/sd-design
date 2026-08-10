<template>
  <slot v-if="mounted" />
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { onMounted, ref } from 'vue';

  defineOptions({ name: 'ClientOnly' });
  defineSlots<{
    default?: () => VNode[];
  }>();

  const mounted = ref(false);

  onMounted(() => {
    mounted.value = true;
  });
</script>
