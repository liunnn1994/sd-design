<template>
  <div class="sd:grid sd:gap-4">
    <sd-statistic
      title="用户增长率"
      :value="50.52"
      :precision="2"
      :value-from="0"
      :start="start"
      animation
    >
      <template #prefix>
        <icon-arrow-rise />
      </template>
      <template #suffix>%</template>
    </sd-statistic>
    <sd-button @click="start = true">开始</sd-button>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const start = ref(false);
</script>
