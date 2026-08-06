<template>
  <sd-space direction="vertical" align="start">
    <sd-input-mask mask="HH-aa-999" :mask-char="null" placeholder="中文-ab-123" />
    <sd-input-mask :mask="mixedMask" :mask-char="null" placeholder="中A-12" />
  </sd-space>
</template>

<script setup lang="ts">
  const mixedMask = [/\p{Script=Han}/u, /[A-Z]/, '-', /\d/, /\d/] as const;
</script>
