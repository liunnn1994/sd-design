<template>
  <sd-space>
    <template #split>
      <sd-divider direction="vertical" :margin="0" />
    </template>
    <sd-button type="primary">Item1</sd-button>
    <sd-tag v-if="show" color="sdblue">Tag</sd-tag>
    <sd-button type="primary">Item2</sd-button>
    <sd-button type="primary">Item3</sd-button>
    <sd-switch v-model="show" />
  </sd-space>
  <sd-divider />
  <sd-space>
    <template #split>
      <sd-divider direction="vertical" :margin="0" />
    </template>
    <sd-link type="primary">Link1</sd-link>
    <sd-link type="primary">Link2</sd-link>
    <sd-link type="primary">Link3</sd-link>
  </sd-space>
</template>

<script setup>
  import { ref } from 'vue';

  const show = ref(false);
</script>
