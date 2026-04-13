<template>
  <a-time-picker
    type="time-range"
    @select="(valueString, value) => print('onSelect:', valueString, value)"
    @change="(valueString, value) => print('onChange:', valueString, value)"
    style="width: 252px;" />
</template>
<script>
  export default {
    methods: {
      print(...arg) {
        console.log(...arg);
      }
    }
  }
</script>
