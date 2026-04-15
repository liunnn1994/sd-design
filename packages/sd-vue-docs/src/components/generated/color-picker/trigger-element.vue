<template>
  <sd-space>
    <sd-color-picker v-model="value" size="mini">
      <sd-tag :color="value">
        <template #icon>
          <icon-bg-colors style="color: #fff" />
        </template>
        {{ value }}
      </sd-tag>
    </sd-color-picker>
  </sd-space>
</template>

<script setup>
  import { ref } from 'vue';

  const value = ref('#165DFF');
</script>
