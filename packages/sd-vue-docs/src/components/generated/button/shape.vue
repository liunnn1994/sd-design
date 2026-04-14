<template>
  <a-space>
    <a-button type="primary">Square</a-button>
    <a-button type="primary" shape="round">Round</a-button>
    <a-button type="primary">
      <template #icon>
        <icon-plus />
      </template>
    </a-button>
    <a-button type="primary" shape="circle">
      <icon-plus />
    </a-button>
  </a-space>
</template>
<script>
  import { IconPlus } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconPlus },
  };
</script>
