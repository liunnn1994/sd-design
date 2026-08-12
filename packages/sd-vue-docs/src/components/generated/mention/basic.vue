<template>
  <div class="sd:flex sd:w-full sd:flex-col sd:gap-6">
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
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('');
  const text = ref('');
</script>
