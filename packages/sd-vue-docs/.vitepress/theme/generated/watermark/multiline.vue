<template>
  <a-watermark :content="['sd.design', dayjs().format('YYYY-MM-DD')]">
    <div style="width: 100%; height: 300px" />
  </a-watermark>
</template>
<script>
  import dayjs from 'dayjs';

  export default {
    setup() {
      return {
        dayjs,
      };
    },
  };
</script>
