<template>
  <sd-space size="large">
    <sd-checkbox v-model="checked1">v-model</sd-checkbox>
    <sd-checkbox :model-value="true">绑定值</sd-checkbox>
    <sd-checkbox :model-value="checked2">绑定值 2</sd-checkbox>
    <sd-checkbox :default-checked="true">非受控状态</sd-checkbox>
  </sd-space>
  <div class="sd:mt-5">
    <sd-button type="primary" @click="handleSetCheck">
      {{ checked2 ? 'uncheck' : 'check' }} value2
    </sd-button>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const checked1 = ref(false);
  const checked2 = ref(false);

  const handleSetCheck = () => {
    checked2.value = !checked2.value;
  };
</script>
