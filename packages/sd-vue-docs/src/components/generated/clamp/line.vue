<template>
  <sd-line-clamp :text="text" :max-lines="2" class="clamp-demo" />
</template>

<script setup lang="ts">
  const text =
    'LineClamp 会按真实浏览器布局裁剪纯文本，支持最大行数、最大高度、省略位置、单词边界与受控展开状态。';
</script>

<style scoped>
  .clamp-demo {
    width: min(100%, 16rem);
  }
</style>
