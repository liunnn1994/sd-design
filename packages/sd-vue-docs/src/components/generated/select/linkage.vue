<template>
  <sd-space>
    <sd-select :style="{ width: '200px' }" v-model="province">
      <sd-option v-for="value of Object.keys(data)">{{ value }}</sd-option>
    </sd-select>
    <sd-select :style="{ width: '200px' }" :options="data[province] || []" v-model="city" />
  </sd-space>
</template>

<script>
  import { ref, watch } from 'vue';

  export default {
    setup() {
      const province = ref('Sichuan');
      const city = ref('Chengdu');
      const data = {
        Beijing: ['Haidian', 'Chaoyang', 'Changping'],
        Sichuan: ['Chengdu', 'Mianyang', 'Aba'],
        Guangdong: ['Guangzhou', 'Shenzhen', 'Shantou'],
      };

      watch(province, () => {
        city.value = '';
      });

      return {
        province,
        city,
        data,
      };
    },
  };
</script>
