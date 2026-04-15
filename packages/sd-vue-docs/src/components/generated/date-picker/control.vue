<template>
  <sd-space>
    <sd-date-picker v-model="value" style="width: 200px" />
    <sd-range-picker v-model="rangeValue" style="width: 300px" />
  </sd-space>
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
