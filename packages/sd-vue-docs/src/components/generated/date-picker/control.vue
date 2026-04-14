<template>
  <a-space>
    <a-date-picker v-model="value" style="width: 200px" />
    <a-range-picker v-model="rangeValue" style="width: 300px" />
  </a-space>
</template>
<script>
  export default {
    data() {
      return {
        value: Date.now(),
        rangeValue: [Date.now(), Date.now()],
      };
    },
  };
</script>
