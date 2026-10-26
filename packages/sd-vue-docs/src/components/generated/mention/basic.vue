<template>
  <sd-space direction="vertical" size="large" class="sd:w-full">
    <sd-mention
      v-model="value"
      :data="['研发团队', '设计团队', '产品团队']"
      placeholder="请输入内容"
    />
    <sd-mention
      v-model="text"
      :data="['研发团队', '设计团队', '产品团队']"
      type="textarea"
      placeholder="请输入内容"
    />
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('');
  const text = ref('');
</script>
