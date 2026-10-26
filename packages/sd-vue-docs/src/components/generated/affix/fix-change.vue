<template>
  <sd-affix :offsetBottom="80" @change="onChange">
    <sd-button type="primary">距底部 80px 时固定</sd-button>
  </sd-affix>
</template>
<script setup lang="ts">
  const onChange = (fixed: boolean) => {
    console.log(`${fixed}`);
  };
</script>
