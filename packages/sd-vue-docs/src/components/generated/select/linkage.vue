<template>
  <sd-space>
    <sd-select class="sd:w-50" v-model="province" :options="Object.keys(data)" />
    <sd-select class="sd:w-50" :options="data[province] || []" v-model="city" />
  </sd-space>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  const province = ref('四川');
  const city = ref('成都');
  const data: Record<string, string[]> = {
    Beijing: ['海淀区', '朝阳区', '昌平区'],
    Sichuan: ['成都', '绵阳', '阿坝'],
    Guangdong: ['广州', '深圳', '汕头'],
  };

  watch(province, () => {
    city.value = '';
  });
</script>
