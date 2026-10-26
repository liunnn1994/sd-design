<template>
  <sd-image width="200px" :src="src" :title="title" :description="description" />
  <sd-image
    width="200px"
    :src="src"
    :title="title"
    :description="description"
    footerPosition="outer"
    class="sd:ml-4 sd:align-top"
  />
</template>

<script setup lang="ts">
  const src = 'https://picsum.photos/id/10/1000/1000?t=image-demo-3';

  const title = '用户头像';

  const description = '由 SD Design 提供';
</script>
