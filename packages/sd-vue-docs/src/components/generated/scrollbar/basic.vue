<template>
  <sd-scrollbar type="track" class="sd:h-50 sd:overflow-auto">
    <div
      class="sd:w-500 sd:h-500"
      :style="{ backgroundColor: `var(${getCssVarToken('--color-primary-light-4')})` }"
    >
      内容
    </div>
  </sd-scrollbar>
</template>

<script setup lang="ts">
  import { getCssVarToken } from '@sdata/web-vue';
</script>
