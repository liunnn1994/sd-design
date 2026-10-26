<template>
  <sd-typography>
    <sd-typography-paragraph copyable> 点击图标复制这段文字。 </sd-typography-paragraph>
    <sd-typography-paragraph editable v-model:editText="str">
      {{ str }}
    </sd-typography-paragraph>
  </sd-typography>
</template>
<script setup lang="ts">
  import { ref } from 'vue';

  const str = ref('点击图标编辑这段文字。');
</script>
