<template>
  <sd-radio-group v-model="checkedValue">
    <sd-grid :cols="3" :colGap="24" :rowGap="16">
      <sd-grid-item>
        <sd-radio value="1">选项 1</sd-radio>
      </sd-grid-item>
      <sd-grid-item>
        <sd-radio value="2" disabled>选项 2</sd-radio>
      </sd-grid-item>
      <sd-grid-item>
        <sd-radio value="3">选项 3</sd-radio>
      </sd-grid-item>
      <sd-grid-item>
        <sd-radio value="4">选项 4</sd-radio>
      </sd-grid-item>
      <sd-grid-item>
        <sd-radio value="5">选项 5</sd-radio>
      </sd-grid-item>
    </sd-grid>
  </sd-radio-group>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const checkedValue = ref('1');
</script>
