<template>
  <a-space>
    <a-date-picker
      style="width: 268px;"
      v-model="value"
    >
      <a-button>{{ value || '请选择日期' }}</a-button>
    </a-date-picker>
    <a-range-picker
      style="width: 268px;"
      v-model="rangeValue"
    >
      <a-button>{{ rangeValue && rangeValue.join(' - ') || '请选择日期范围' }}</a-button>
    </a-range-picker>
  </a-space>
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
    }
  }
}
</script>
