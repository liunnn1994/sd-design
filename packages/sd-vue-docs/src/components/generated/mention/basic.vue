<template>
  <sd-space direction="vertical" size="large" style="width: 100%">
    <sd-mention
      v-model="value"
      :data="['Bytedance', 'Bytedesign', 'Bytenumner']"
      placeholder="enter something"
    />
    <sd-mention
      v-model="text"
      :data="['Bytedance', 'Bytedesign', 'Bytenumner']"
      type="textarea"
      placeholder="enter something"
    />
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value = ref('');
      const text = ref('');

      return {
        value,
        text,
      };
    },
  };
</script>
