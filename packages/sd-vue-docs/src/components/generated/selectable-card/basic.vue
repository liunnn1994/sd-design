<template>
  <sd-selectable-card
    label="标准版方案"
    :is-selected="selected"
    title="标准版"
    value="¥99 / 月"
    description="适合小型团队协作"
    width="320px"
    @change="selected = $event"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const selected = ref(false);
</script>
