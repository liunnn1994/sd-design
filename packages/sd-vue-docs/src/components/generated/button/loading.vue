<template>
  <sd-space>
    <sd-button type="primary" loading>主要</sd-button>
    <sd-button loading>默认</sd-button>
    <sd-button type="dashed" loading>虚线</sd-button>
    <sd-button type="primary" :loading="loading1" @click="handleClick1">点击我</sd-button>
    <sd-button type="primary" :loading="loading2" @click="handleClick2">
      <template #icon>
        <icon-plus />
      </template>
      点击我
    </sd-button>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { IconPlus } from '@sdata/web-vue/es/icon/index.js';

  const loading1 = ref(false);
  const loading2 = ref(false);

  function handleClick1() {
    loading1.value = !loading1.value;
  }

  function handleClick2() {
    loading2.value = !loading2.value;
  }
</script>
