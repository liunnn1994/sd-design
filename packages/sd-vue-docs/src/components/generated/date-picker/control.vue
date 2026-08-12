<template>
  <sd-space>
    <div class="sd:w-50">
      <sd-date-picker v-model="value" />
    </div>
    <div class="sd:w-75">
      <sd-range-picker v-model="rangeValue" />
    </div>
  </sd-space>
</template>
<script setup lang="ts">
  import { ref, shallowRef } from 'vue';

  const value = shallowRef('2026-04-16');

  const rangeValue = ref(['2026-04-16', '2026-04-16']);
</script>
