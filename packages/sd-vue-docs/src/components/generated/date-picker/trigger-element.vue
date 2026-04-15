<template>
  <sd-space>
    <sd-date-picker style="width: 268px" v-model="value">
      <sd-button>{{ value || '请选择日期' }}</sd-button>
    </sd-date-picker>
    <sd-range-picker style="width: 268px" v-model="rangeValue">
      <sd-button>{{ (rangeValue && rangeValue.join(' - ')) || '请选择日期范围' }}</sd-button>
    </sd-range-picker>
  </sd-space>
</template>
<script>
  import { ref } from 'vue';
  export default {
    setup() {
      const value = ref();
      const rangeValue = ref();
      return {
        value,
        rangeValue,
      };
    },
  };
</script>
