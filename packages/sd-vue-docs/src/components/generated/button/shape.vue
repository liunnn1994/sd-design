<template>
  <sd-space>
    <sd-button type="primary">方形</sd-button>
    <sd-button type="primary" shape="round">圆角</sd-button>
    <sd-button type="primary">
      <template #icon>
        <icon-plus />
      </template>
    </sd-button>
    <sd-button type="primary" shape="circle">
      <icon-plus />
    </sd-button>
  </sd-space>
</template>
<script setup lang="ts">
  import { IconPlus } from '@sdata/web-vue/es/icon/index.js';
</script>
